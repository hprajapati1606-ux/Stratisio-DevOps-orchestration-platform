from pydantic import BaseModel
from datetime import datetime, timedelta, date
from typing import Optional, List, Any

class DeploymentBase(BaseModel):
    name: str
    image: str
    cloud: str
    port: int

class DeploymentCreate(DeploymentBase):
    pass

class Deployment(DeploymentBase):
    id: int
    status: str
    ip_address: Optional[str] = None
    cpu_usage: str
    memory_usage: str
    container_id: Optional[str] = None
    created_at: datetime

    model_config = {"from_attributes": True}

class StatsResponse(BaseModel):
    total_deployments: int
    ai_confidence: str
    monthly_spend: str
    active_incidents: int

class TelemetryResponse(BaseModel):
    cpu_load: List[int]
    throughput: List[int]
    memory_usage: float
    disk_usage: float
    network_io: dict
    timestamp: str

class CostEstimationResponse(BaseModel):
    monthly_cost: str
    per_container_cost: str
    optimization_suggestions: List[str]

class AIRecommendationResponse(BaseModel):
    best_cloud: str
    confidence_score: float
    reasoning: str
    recommendations: Optional[List[str]] = []
    anomalies_detected: Optional[int] = 0

class UserBase(BaseModel):
    username: str

class UserCreate(UserBase):
    password: str

class User(UserBase):
    id: int
    is_active: bool

    model_config = {"from_attributes": True}

class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    username: Optional[str] = None

class ForgotPasswordRequest(BaseModel):
    username: str

class ResetPasswordRequest(BaseModel):
    token: str
    new_password: str

# Phase 3: FinOps Advisor Schemas
class ZombieInstance(BaseModel):
    deployment_id: int
    name: str
    cpu_usage_avg: float
    memory_usage: str
    uptime: str
    potential_savings: str

class CostForecastData(BaseModel):
    date: str
    predicted_cost: float

class CostForecastResponse(BaseModel):
    current_month_total: str
    next_month_projected: str
    confidence_score: float
    forecast: List[CostForecastData]

# Phase 4: Predictive Insights Schemas
class PredictionPoint(BaseModel):
    date: str
    traffic: float
    memory: float
    crash_prob: float

class AIOpsPredictionResponse(BaseModel):
    forecast: List[PredictionPoint]
    summary: str
    risk_level: str

# Phase 5: Security & Compliance Hub Schemas
class SecurityVulnerability(BaseModel):
    id: str
    severity: str
    component: str
    description: str
    fix_available: bool

class SecretsScanResult(BaseModel):
    file: str
    secret_type: str
    risk: str

class SecurityHubResponse(BaseModel):
    vulnerabilities: List[SecurityVulnerability]
    secrets_found: List[SecretsScanResult]
    compliance_score: int
    scan_timestamp: str

# Phase 6: Team Collaboration & Gamification Schemas
class LeaderboardEntry(BaseModel):
    username: str
    points: int
    badges: List[str]
    impact: str

class TeamHubResponse(BaseModel):
    leaderboard: List[LeaderboardEntry]
    active_war_rooms: int
    total_savings_team: str

# Phase 7: Enterprise & Interactive AI Schemas
class Project(BaseModel):
    id: str
    name: str
    region: str
    env: str # Production, Staging, etc.

class ChatRequest(BaseModel):
    message: str

class ChatResponse(BaseModel):
    reply: str
    action_hint: Optional[str] = None # e.g. "navigate_to_cost"

class SimulationRequest(BaseModel):
    kill_count: int
    scale_down_pct: float

class SimulationResponse(BaseModel):
    estimated_monthly_savings: float
    new_projected_total: float
    impact_description: str

# Phase 8: Enterprise Transformation Schemas
class RecommendationResponse(BaseModel):
    id: int
    resource_id: str
    resource_type: str
    recommendation: str
    action_type: str
    status: str
    confidence_score: int
    risk_level: str
    created_at: datetime
    approved_at: Optional[datetime] = None
    executed_at: Optional[datetime] = None

    class Config:
        from_attributes = True

class RecommendationCreate(BaseModel):
    resource_id: str
    resource_type: str
    recommendation: str
    action_type: str
    confidence_score: int
    risk_level: str

class AuditLogResponse(BaseModel):
    id: int
    user_id: int
    action: str
    resource_id: str
    status: str
    timestamp: datetime

    class Config:
        from_attributes = True

class CloudCredentialCreate(BaseModel):
    provider: str
    access_key: str
    secret_key: str
    region: str

class RollbackRequest(BaseModel):
    recommendation_id: int

class WarRoomBase(BaseModel):
    title: str
    description: Optional[str] = None

class WarRoomCreate(WarRoomBase):
    pass

class WarRoom(WarRoomBase):
    id: int
    status: str
    created_at: datetime
    
    class Config:
        from_attributes = True

class WarRoomMessageBase(BaseModel):
    room_id: int
    user: str
    text: str
    type: str = "chat"

class WarRoomMessageCreate(WarRoomMessageBase):
    pass

class WarRoomMessage(WarRoomMessageBase):
    id: int
    timestamp: datetime
    
    class Config:
        from_attributes = True

