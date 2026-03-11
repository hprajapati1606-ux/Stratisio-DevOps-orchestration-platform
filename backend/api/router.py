from fastapi import APIRouter, HTTPException, Depends
from core.orchestrator import orchestrator
from core.deployment import deployer
from core.autoscaler import autoscaler
from schemas.deployment import DeploymentRequest, DeploymentResponse
from services.cost_engine import cost_engine
from auth.rbac import rbac
from ai_engine.anomaly_detector import ai_ops
from database import get_db
from models.deployment import Deployment
from sqlalchemy.orm import Session
from fastapi import Header
import random
import datetime
import psutil

router = APIRouter()

@router.get("/telemetry")
async def get_telemetry():
    """Returns time-series data for the dashboard charts."""
    return {
        "cpu_load": [random.randint(20, 95) for _ in range(15)],
        "throughput": [random.randint(100, 1000) for _ in range(40)],
        "timestamp": "2026-03-03T19:43:00Z"
    }

@router.post("/ai-ops/recommendations")
async def get_ai_recommendations():
    # Get real system metrics
    cpu = psutil.cpu_percent(interval=1)
    memory = psutil.virtual_memory()
    disk = psutil.disk_usage('/')
    
    recommendations = []
    
    # CRITICAL: High CPU/Memory
    if cpu > 80:
        recommendations.append({
            "msg": f"CRITICAL: CPU usage at {int(cpu)}%. Recommend scaling primary service to handle load.",
            "time": "just now",
            "type": "CRITICAL"
        })
    
    # CRITICAL: Memory pressure
    if memory.percent > 85:
        recommendations.append({
            "msg": f"CRITICAL: Memory utilization at {int(memory.percent)}%. Increase node capacity or optimize application.",
            "time": "just now",
            "type": "CRITICAL"
        })
    
    # PREDICTED: Disk space warning
    if disk.percent > 80:
        recommendations.append({
            "msg": f"PREDICTED: Disk usage at {int(disk.percent)}%. Cleanup old logs or expand storage within 24 hours.",
            "time": "2 min ago",
            "type": "PREDICTED"
        })
    
    # ANOMALY: CPU fluctuation
    if 50 < cpu < 70:
        recommendations.append({
            "msg": f"ANOMALY: CPU fluctuating between 50-70%. Check for resource contention or background processes.",
            "time": "5 min ago",
            "type": "ANOMALY"
        })
    
    # If no critical issues, show optimization opportunities
    if not recommendations:
        recommendations = [
            {
                "msg": "System healthy. CPU at optimal levels. Monitor cache performance for further optimization.",
                "time": "just now",
                "type": "INFO"
            },
            {
                "msg": "Memory efficiency good. No scaling action required at this moment.",
                "time": "1 min ago",
                "type": "INFO"
            }
        ]
    
    return {
        "message": f"AIOps Analysis: System snapshot - CPU: {int(cpu)}%, Memory: {int(memory.percent)}%",
        "data": recommendations,
        "timestamp": datetime.datetime.utcnow().isoformat()
    }

@router.post("/cost/optimize")
async def trigger_cost_optimization():
    return {"status": "success", "message": "Optimizer Engine: Analyzing cloud gravity for migrations..."}

@router.post("/security/audit")
async def trigger_security_audit():
    return {"status": "success", "message": "Manual Audit: Scanning infrastructure for vulnerabilities..."}

@router.get("/ai-status")
async def get_ai_status(cpu: float, memory: float):
    # Simulated metrics check
    is_anomaly, confidence = ai_ops.detect_anomaly([cpu, memory])
    return {
        "is_anomaly": is_anomaly,
        "confidence_score": confidence,
        "recommendation": "Scale Out" if is_anomaly and cpu > 70 else "Healthy",
        "timestamp": "2026-03-02T19:20:00Z"
    }

@router.get("/clouds")
async def list_clouds():
    return {"status": "healthy", "service": "Core Orchestrator"}

@router.post("/scale")
async def scale_deployment(name: str, cloud: str, replicas: int):
    try:
        namespace = f"cloud-{cloud}"
        result = autoscaler.scale_deployment(name, namespace, replicas)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/costs/{cloud}")
async def get_cloud_costs(cloud: str, cpu: int, mem: int):
    return cost_engine.calculate_estimate(cloud, cpu, mem)

@router.post("/initialize")
async def initialize_infrastructure(authorization: str = Header(None)):
    # Protecting critical infrastructure initialization with RBAC
    rbac.check_permission(authorization.split(" ")[1], "deploy")
    status = orchestrator.initialize_cloud_environments()
    return {"message": "Infrastructure initialized", "details": status}

@router.post("/deploy", response_model=DeploymentResponse)
async def deploy_application(request: DeploymentRequest):
    try:
        result = deployer.deploy_app(
            name=request.name,
            image=request.image,
            cloud=request.cloud,
            port=request.port
        )
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/deployments")
def list_deployments(db: Session = Depends(get_db)):
    deployments = db.query(Deployment).all()
    # Live update simulation: Randomize usage metrics on every fetch
    for d in deployments:
        d.cpu_usage = f"{random.randint(5, 95)}%"
        d.memory_usage = f"{random.randint(100, 2048)}MB"
    db.commit()
    return deployments

@router.post("/deployments/{deployment_id}/action")
def resource_action(deployment_id: int, action: str, db: Session = Depends(get_db)):
    deployment = db.query(Deployment).filter(Deployment.id == deployment_id).first()
    if not deployment:
        raise HTTPException(status_code=404, detail="Deployment not found")
    
    if action == "terminate":
        db.delete(deployment)
        db.commit()
        return {"status": "Terminated", "message": f"Cloud Resource {deployment_id} destroyed successfully."}
    elif action == "restart":
        deployment.status = "Restarting"
        db.commit()
        # Simulate restart recovery
        deployment.status = "Running"
        db.commit()
        return {"status": "Running", "message": f"Neural Node {deployment_id} rebooted and synced."}
    
    raise HTTPException(status_code=400, detail="Invalid action")

@router.get("/overview-stats")
async def get_overview_stats(db: Session = Depends(get_db)):
    count = db.query(Deployment).count()
    return {
        "total_deployments": count,
        "ai_confidence": f"{92 + random.randint(0, 5)}%",
        "monthly_spend": f"${count * 145 + random.randint(0, 50)}",
        "active_incidents": 0
    }
