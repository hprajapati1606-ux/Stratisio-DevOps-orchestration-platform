import logging
import os
import asyncio
import json
from datetime import datetime, timedelta, date
import traceback
from contextlib import asynccontextmanager

from fastapi import FastAPI, WebSocket, WebSocketDisconnect, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from fastapi.exceptions import RequestValidationError

# ─── Logging ─────────────────────────────────────────────────────────────────
log_dir = os.path.join(os.path.dirname(__file__), "logs")
os.makedirs(log_dir, exist_ok=True)

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
    handlers=[
        logging.StreamHandler(),
        logging.FileHandler(os.path.join(log_dir, "stratisio.log"), encoding="utf-8"),
    ],
)
logger = logging.getLogger("stratisio")

# ─── Deferred imports ────────────────────────────────────────────────────────
from database import init_db
import api_v1
from services.autoscaler import scaler

class TelemetryManager:
    def __init__(self):
        self.active: list[WebSocket] = []

    async def connect(self, ws: WebSocket):
        await ws.accept()
        self.active.append(ws)

    def disconnect(self, ws: WebSocket):
        if ws in self.active:
            self.active.remove(ws)

    async def broadcast(self, data: dict):
        dead = []
        for ws in list(self.active):
            try:
                await ws.send_text(json.dumps(data))
            except Exception:
                dead.append(ws)
        for ws in dead:
            self.disconnect(ws)

telemetry_manager = TelemetryManager()


# ─── War Room Manager ────────────────────────────────────────────────────────
class WarRoomManager:
    def __init__(self):
        # room_id -> list of websockets
        self.rooms: dict[int, list[WebSocket]] = {}

    async def connect(self, ws: WebSocket, room_id: int):
        await ws.accept()
        if room_id not in self.rooms:
            self.rooms[room_id] = []
        self.rooms[room_id].append(ws)
        logger.info(f"User connected to War Room {room_id}")

    def disconnect(self, ws: WebSocket, room_id: int):
        if room_id in self.rooms and ws in self.rooms[room_id]:
            self.rooms[room_id].remove(ws)
            if not self.rooms[room_id]:
                del self.rooms[room_id]
        logger.info(f"User disconnected from War Room {room_id}")

    async def broadcast(self, room_id: int, message: dict):
        if room_id in self.rooms:
            dead = []
            for ws in self.rooms[room_id]:
                try:
                    await ws.send_text(json.dumps(message))
                except Exception:
                    dead.append(ws)
            for ws in dead:
                self.disconnect(ws, room_id)

war_room_manager = WarRoomManager()


# ─── Telemetry loop ───────────────────────────────────────────────────────────
async def telemetry_loop():
    import psutil
    from api_v1 import _get_docker_client, _get_container_metrics
    while True:
        try:
            client = _get_docker_client()
            containers = client.containers.list() if client else []
            
            container_stats = []
            agg_cpu = 0.0
            agg_mem = 0.0
            
            for c in containers:
                c_cpu, c_mem = _get_container_metrics(c)
                cpu_val = float(c_cpu.replace('%', ''))
                mem_val = float(c_mem.replace('MB', ''))
                agg_cpu += cpu_val
                agg_mem += mem_val
                container_stats.append({
                    "id": c.id[:12],
                    "name": c.name.replace("stratis-", ""),
                    "cpu": c_cpu,
                    "memory": c_mem
                })

            await telemetry_manager.broadcast({
                "cpu":              round(agg_cpu, 1) if containers else 0.0,
                "memory":           round(agg_mem / (psutil.virtual_memory().total / (1024*1024)) * 100, 1) if containers else 0.0,
                "disk":             round(psutil.disk_usage("/").percent, 1),
                "active_containers": len(containers),
                "container_details": container_stats,
                "timestamp":        datetime.utcnow().isoformat(),
            })
        except Exception as e:
            logger.warning(f"Telemetry error: {e}")
        await asyncio.sleep(2)

# ─── Lifespan ─────────────────────────────────────────────────────────────────
@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info("StratisIO starting up…")
    init_db()
    scaler.start()
    task = asyncio.create_task(telemetry_loop())
    logger.info("Startup complete.")
    yield
    logger.info("StratisIO shutting down…")
    task.cancel()

# ─── App ──────────────────────────────────────────────────────────────────────
app = FastAPI(
    title="StratisIO Enterprise API v2",
    version="2.1.0",
    lifespan=lifespan,
)

# CORS — add FIRST before any routes/exception handlers
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "http://localhost:3001",
        "http://127.0.0.1:3001",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ─── Exception handlers ───────────────────────────────────────────────────────
@app.exception_handler(RequestValidationError)
async def validation_handler(request: Request, exc: RequestValidationError):
    return JSONResponse(
        status_code=422,
        content={"status": "error", "message": str(exc.errors()), "code": 422},
    )

@app.exception_handler(Exception)
async def generic_handler(request: Request, exc: Exception):
    tb = traceback.format_exc()
    logger.error(f"500 on {request.method} {request.url}:\n{tb}")
    return JSONResponse(
        status_code=500,
        content={"status": "error", "message": str(exc), "code": 500},
    )

# ─── Routers ──────────────────────────────────────────────────────────────────
app.include_router(api_v1.router, prefix="/api/v1")

# ─── WebSocket ────────────────────────────────────────────────────────────────
@app.websocket("/ws/telemetry")
async def ws_telemetry(websocket: WebSocket):
    await telemetry_manager.connect(websocket)
    try:
        while True:
            await websocket.receive_text()
    except WebSocketDisconnect:
        telemetry_manager.disconnect(websocket)
    except Exception:
        telemetry_manager.disconnect(websocket)


@app.websocket("/ws/warroom/{room_id}")
async def ws_warroom(websocket: WebSocket, room_id: int):
    await war_room_manager.connect(websocket, room_id)
    try:
        while True:
            # We listen for messages from the client
            data = await websocket.receive_text()
            msg_data = json.loads(data)
            
            # Broadcast the message to everyone in the same room
            # In a real app, we would save this to DB here as well
            # But we'll handle saving via a REST API to keep it simple for now
            # or just broadcast it back with a timestamp
            msg_data["timestamp"] = datetime.utcnow().isoformat()
            await war_room_manager.broadcast(room_id, msg_data)
            
    except WebSocketDisconnect:
        war_room_manager.disconnect(websocket, room_id)
    except Exception as e:
        logger.error(f"WarRoom WS error: {e}")
        war_room_manager.disconnect(websocket, room_id)


# ─── Root ─────────────────────────────────────────────────────────────────────
@app.get("/")
async def root():
    return {"status": "online", "service": "StratisIO Enterprise API", "version": "2.1.0"}
