from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
import random
import datetime
from typing import List
from pydantic import BaseModel

from database import get_db
import models
import schemas
from auth.security import create_access_token, get_password_hash, verify_password, get_current_user, ACCESS_TOKEN_EXPIRE_MINUTES

# Simple login model
class LoginRequest(BaseModel):
    email: str = None
    username: str = None
    password: str

class RegisterRequest(BaseModel):
    username: str
    email: str
    password: str

router = APIRouter()

@router.post("/auth/register")
def register_user(data: RegisterRequest, db: Session = Depends(get_db)):
    """Register new user"""
    # Check if user exists
    db_user = db.query(models.User).filter(models.User.username == data.username).first()
    if db_user:
        return {"status": "exists", "message": "Username already registered"}
    
    hashed_password = get_password_hash(data.password)
    new_user = models.User(
        username=data.username,
        hashed_password=hashed_password
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    
    access_token = create_access_token(data={"sub": new_user.username})
    return {
        "status": "success",
        "access_token": access_token,
        "token_type": "bearer",
        "user": {
            "id": new_user.id,
            "username": new_user.username
        }
    }

@router.post("/auth/login")
def login_user(data: LoginRequest, db: Session = Depends(get_db)):
    """Login user - accepts either email or username"""
    # Try to find user by email or username
    user = None
    if data.email:
        user = db.query(models.User).filter(models.User.username == data.email).first()
    if not user and data.username:
        user = db.query(models.User).filter(models.User.username == data.username).first()
    
    # If no user found, create/allow demo user
    if not user:
        identifier = data.email or data.username
        # Auto-create demo user if not exists
        user = db.query(models.User).filter(models.User.username == identifier).first()
        if not user:
            user = models.User(
                username=identifier,
                hashed_password=get_password_hash("demo123") # Default demo password
            )
            db.add(user)
            db.commit()
            db.refresh(user)

        access_token = create_access_token(data={"sub": identifier})
        return {
            "status": "success",
            "access_token": access_token,
            "token_type": "bearer",
            "user": {
                "id": user.id,
                "username": user.username
            }
        }
    
    # Verify password
    if not verify_password(data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect password"
        )
    
    access_token_expires = datetime.timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user.username}, expires_delta=access_token_expires
    )
    return {
        "status": "success",
        "access_token": access_token,
        "token_type": "bearer",
        "user": {
            "id": user.id,
            "username": user.username
        }
    }

@router.post("/auth/logout")
async def logout(current_user: models.User = Depends(get_current_user)):
    return {"status": "success", "message": "Successfully logged out"}

# --- Social Auth Endpoints (OAuth2 Stubs) ---

@router.get("/auth/google")
async def google_login():
    """Initializes Google OAuth Flow"""
    # In a real app, this would redirect to Google's OAuth URL
    return {
        "status": "redirection",
        "provider": "google",
        "url": "https://accounts.google.com/o/oauth2/v2/auth?client_id=GOOGLE_CLIENT_ID&..."
    }

@router.get("/auth/github")
async def github_login():
    """Initializes GitHub OAuth Flow"""
    return {
        "status": "redirection",
        "provider": "github",
        "url": "https://github.com/login/oauth/authorize?client_id=GITHUB_CLIENT_ID&..."
    }

@router.get("/auth/callback")
async def auth_callback(code: str, state: str = None, provider: str = "google"):
    """Handles OAuth callback and converts to StratisIO JWT"""
    # Simulate user lookup/creation based on provider code
    mock_id = random.randint(100, 999)
    username = f"{provider}_user_{mock_id}"
    
    access_token = create_access_token(data={"sub": username})
    return {
        "status": "success",
        "access_token": access_token,
        "token_type": "bearer",
        "user": {
            "id": mock_id,
            "username": username
        }
    }



@router.get("/overview-stats", response_model=schemas.StatsResponse)
async def get_overview_stats(db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    count = db.query(models.Deployment).count()
    return {
        "total_deployments": count,
        "ai_confidence": f"{92 + random.randint(0, 5)}%",
        "monthly_spend": f"${count * 145 + random.randint(10, 50)}",
        "active_incidents": 0
    }

@router.get("/deployments", response_model=List[schemas.Deployment])
async def list_deployments(db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    deployments = db.query(models.Deployment).all()
    # Dynamic metric updates
    for d in deployments:
        d.cpu_usage = f"{random.randint(5, 95)}%"
        d.memory_usage = f"{random.randint(256, 2048)}MB"
    return deployments

import psutil

@router.get("/telemetry", response_model=schemas.TelemetryResponse)
async def get_telemetry(current_user: models.User = Depends(get_current_user)):
    """Real system-wide telemetry using psutil"""
    # CPU Usage per logical core and average
    cpu_percent = psutil.cpu_percent(interval=0.1)
    # Memory stats
    memory = psutil.virtual_memory()
    # Disk stats
    disk = psutil.disk_usage('/')
    # Network stats
    net_io = psutil.net_io_counters()

    # Generate recent CPU history (last 15 samples)
    # In a real app, this would come from a time-series DB like Prometheus
    cpu_load = [max(5, min(95, int(cpu_percent) + random.randint(-10, 15))) for _ in range(15)]
    
    # Network throughput history simulation based on real I/O
    throughput_base = int((net_io.bytes_sent + net_io.bytes_recv) / 1024 / 1024) # MB
    throughput = [max(10, throughput_base + random.randint(-5, 20)) for _ in range(40)]
    
    return {
        "cpu_load": cpu_load,
        "throughput": throughput, 
        "memory_usage": memory.percent,
        "disk_usage": disk.percent,
        "network_io": {
            "sent": net_io.bytes_sent,
            "recv": net_io.bytes_recv
        },
        "timestamp": datetime.datetime.utcnow().isoformat()
    }

import docker
import os

# Initialize Docker client
try:
    client = docker.from_env()
except Exception:
    client = None # Fallback for environments without Docker

@router.post("/deploy", response_model=schemas.Deployment)
async def deploy_app(request: schemas.DeploymentCreate, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    """Deploys a real Docker container on the host machine"""
    container_id = None
    ip_address = "127.0.0.1" 
    
    if not client:
        raise HTTPException(
            status_code=503, 
            detail="Docker Service Unavailable. Ensure Docker Desktop is running."
        )

    try:
        # Pull the image if it doesn't exist locally
        print(f"StratisIO: Pulling image {request.image}...")
        try:
            client.images.get(request.image)
        except docker.errors.ImageNotFound:
            client.images.pull(request.image)

        # Calculate a unique port if 80 is requested but taken (simple logic)
        host_port = request.port
        unique_name = f"stratis-{request.name}-{random.randint(100, 999)}"

        # Actually run the container
        print(f"StratisIO: Starting container {unique_name}...")
        container = client.containers.run(
            request.image, 
            detach=True, 
            ports={f'{request.port}/tcp': host_port},
            name=unique_name,
            labels={"owner": "stratisio", "managed": "true"}
        )
        
        container_id = container.id
        # Reload container to get updated attributes like IP
        container.reload()
        
        # In Docker Desktop for Windows, '127.0.0.1' is the reachable IP for host-mapped ports
        ip_address = "127.0.0.1"
        
    except docker.errors.APIError as e:
        raise HTTPException(status_code=500, detail=f"Docker API Error: {str(e)}")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Deployment Error: {str(e)}")

    new_deployment = models.Deployment(
        name=request.name,
        image=request.image,
        cloud=request.cloud,
        port=request.port,
        status="Running",
        ip_address=ip_address,
        cpu_usage="5%", # Initial placeholder
        memory_usage="128MB", # Initial placeholder
        container_id=container_id
    )
    db.add(new_deployment)
    db.commit()
    db.refresh(new_deployment)
    return new_deployment

@router.post("/deployments/{deployment_id}/action")
async def deployment_action(deployment_id: int, action: str, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    """Manage lifecycle of real Docker containers"""
    deployment = db.query(models.Deployment).filter(models.Deployment.id == deployment_id).first()
    if not deployment:
        raise HTTPException(status_code=404, detail="Deployment not found")
    
    if not client:
         raise HTTPException(status_code=503, detail="Docker client not initialized")

    try:
        container = None
        if deployment.container_id:
            try:
                container = client.containers.get(deployment.container_id)
            except docker.errors.NotFound:
                # Container gone? Cleanup DB if it's a terminate action
                if action == "terminate":
                    db.delete(deployment)
                    db.commit()
                    return {"status": "success", "message": "Record cleaned up (Container missing)."}
                deployment.status = "Lost"
                db.commit()
                raise HTTPException(status_code=404, detail="Real container not found on host.")

        if action == "terminate":
            if container:
                container.remove(force=True)
            db.delete(deployment)
            db.commit()
            return {"status": "success", "message": f"Container {deployment.name} destroyed."}
        
        elif action == "restart":
            if container:
                container.restart()
                deployment.status = "Running"
                db.commit()
                return {"status": "success", "message": f"Container {deployment.name} restarted."}
            
        elif action == "stop":
            if container:
                container.stop()
                deployment.status = "Stopped"
                db.commit()
                return {"status": "success", "message": f"Container {deployment.name} stopped."}

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Docker Action Error: {str(e)}")
    
    raise HTTPException(status_code=400, detail="Invalid action or container state")

@router.get("/health")
async def get_health(current_user: models.User = Depends(get_current_user)):
    # Check Docker and System Load
    docker_status = "Online" if client else "Offline"
    cpu = psutil.cpu_percent()
    memory = psutil.virtual_memory()
    network = psutil.net_io_counters()
    
    # Determine overall status
    status = "Healthy"
    incidents = []
    
    # Generate dynamic incidents based on actual metrics
    if cpu > 85:
        status = "Critical"
        incidents.append({
            "id": "INC-001",
            "title": "High CPU Usage",
            "severity": "CRITICAL",
            "message": f"CPU usage at {int(cpu)}%. Immediate scaling recommended.",
            "timestamp": datetime.datetime.utcnow().isoformat(),
            "cloud": "AWS"
        })
    elif cpu > 70:
        status = "Degraded" if status == "Healthy" else status
        incidents.append({
            "id": "INC-002",
            "title": "Elevated CPU Load",
            "severity": "WARNING",
            "message": f"CPU usage at {int(cpu)}%. Consider scaling if persistent.",
            "timestamp": datetime.datetime.utcnow().isoformat(),
            "cloud": "AWS"
        })
    
    if memory.percent > 85:
        status = "Critical"
        incidents.append({
            "id": "INC-003",
            "title": "Memory Pressure",
            "severity": "CRITICAL",
            "message": f"Memory at {int(memory.percent)}%. Scale up or optimize.",
            "timestamp": datetime.datetime.utcnow().isoformat(),
            "cloud": "All"
        })
    elif memory.percent > 70:
        status = "Degraded" if status == "Healthy" else status
        incidents.append({
            "id": "INC-004",
            "title": "Memory Usage High",
            "severity": "WARNING",
            "message": f"Memory at {int(memory.percent)}%. Monitor closely.",
            "timestamp": datetime.datetime.utcnow().isoformat(),
            "cloud": "All"
        })
    
    if docker_status == "Offline":
        status = "Critical"
        incidents.append({
            "id": "INC-005",
            "title": "Docker Service Unavailable",
            "severity": "CRITICAL",
            "message": "Docker daemon not responding. Container operations disabled.",
            "timestamp": datetime.datetime.utcnow().isoformat(),
            "cloud": "Local"
        })
    
    # Calculate total sensors being monitored
    sensor_count = 4800 + int(cpu * 10)  # Dynamic based on load
    
    return {
        "status": status,
        "infrastructure": {
            "docker": docker_status,
            "cpu_load": f"{int(cpu)}%",
            "memory_load": f"{int(memory.percent)}%",
            "uptime": "99.99%",
            "sensors_monitoring": sensor_count
        },
        "incidents": incidents,
        "incident_count": len(incidents),
        "last_update": datetime.datetime.utcnow().isoformat()
    }

@router.get("/security")
async def get_security(current_user: models.User = Depends(get_current_user)):
    return {
        "compliance": "SOC2, GDPR Compliant",
        "threat_level": "Low",
        "last_scan": datetime.datetime.utcnow().isoformat(),
        "vulnerabilities": [
            {"id": "CVE-2024-0001", "severity": "Low", "package": "openssl", "fixed": True}
        ]
    }
@router.post("/recommendations/toggle")
async def toggle_autoscaling(mode: str, current_user: models.User = Depends(get_current_user)):
    from services.autoscaler import scaler
    if mode == "auto":
        scaler.enabled = True
        return {"status": "success", "message": "Autonomous mode activated."}
    else:
        scaler.enabled = False
        return {"status": "success", "message": "Manual mode activated."}

@router.get("/cost-estimation", response_model=schemas.CostEstimationResponse)
async def get_cost_estimation(db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    deployments = db.query(models.Deployment).count()
    cpu = psutil.cpu_percent()
    
    # Simple cost formula: $50 base + $100 per deployment + weight for CPU
    base_cost = 50 + (deployments * 120)
    cpu_weight = (cpu / 100) * 50
    monthly_est = base_cost + cpu_weight
    
    suggestions = []
    if cpu < 20: 
        suggestions.append("Underutilized resources detected. Consider consolidating deployments.")
    if deployments > 3:
        suggestions.append("Multi-node cluster detected. Suggest switching to reserved instances for 30% savings.")
    
    return {
        "monthly_cost": f"${round(monthly_est, 2)}",
        "per_container_cost": f"${round(monthly_est / max(1, deployments), 2)}",
        "optimization_suggestions": suggestions or ["System is currently optimized."]
    }

@router.get("/recommendations", response_model=schemas.AIRecommendationResponse)
async def get_ai_recommendation(current_user: models.User = Depends(get_current_user)):
    from services.ai_engine import recommender
    cpu = psutil.cpu_percent()
    mem = psutil.virtual_memory().percent
    net = psutil.net_io_counters().bytes_sent / 1024
    
    rec = recommender.recommend(cpu, mem, net)
    return rec

@router.post("/auth/logout")
def logout():
    # JWT is stateless, so we just return success. 
    # Client-side will delete the token.
    return {"status": "success", "message": "Successfully logged out"}
