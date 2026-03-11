from pydantic import BaseModel
from datetime import datetime
from typing import Optional, List

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
    ip_address: Optional[str]
    cpu_usage: str
    memory_usage: str
    container_id: Optional[str]
    created_at: datetime

    class Config:
        from_attributes = True
        orm_mode = True

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
class UserBase(BaseModel):
    username: str

class UserCreate(UserBase):
    password: str

class User(UserBase):
    id: int
    is_active: bool

    class Config:
        from_attributes = True
        orm_mode = True

class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    username: Optional[str] = None
