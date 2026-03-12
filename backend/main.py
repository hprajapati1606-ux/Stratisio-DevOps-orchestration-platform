from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from database import init_db
import api_v1

from services.autoscaler import scaler

app = FastAPI(
    title="StratisIO Enterprise API v2",
    description="Clean, robust backend for the StratisIO platform.",
    version="2.1.0"
)

# Initialize Database and Services on startup
@app.on_event("startup")
def startup_event():
    init_db()
    # By default, start with it disabled or based on UI state session
    # We will start the thread so it's ready but it only checks if enabled
    scaler.start()

# CORS Management
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

from prometheus_fastapi_instrumentator import Instrumentator

# Include API Router
app.include_router(api_v1.router, prefix="/api/v1")

# Prometheus Metrics
Instrumentator().instrument(app).expose(app)

@app.get("/")
async def health_check():
    return {
        "status": "online",
        "service": "StratisIO Enterprise API",
        "version": "2.1.0"
    }
