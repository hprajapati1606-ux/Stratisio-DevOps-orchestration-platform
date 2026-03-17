from sqlalchemy import Column, Integer, String, Float, DateTime
from database import Base
import datetime

class Deployment(Base):
    __tablename__ = "deployments"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String)
    image = Column(String)
    cloud = Column(String)
    port = Column(Integer)
    status = Column(String, default="Running")
    ip_address = Column(String)
    cpu_usage = Column(String)
    memory_usage = Column(String)
    container_id = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

class ScalingEvent(Base):
    __tablename__ = "scaling_events"

    id = Column(Integer, primary_key=True, index=True)
    deployment_name = Column(String)
    action = Column(String)  # "Scale Up", "Scale Down", "Self-Heal"
    reason = Column(String)
    timestamp = Column(DateTime, default=datetime.datetime.utcnow)

class AnomalyLog(Base):
    __tablename__ = "anomaly_logs"

    id = Column(Integer, primary_key=True, index=True)
    metric = Column(String)          # "cpu", "memory", "disk"
    value = Column(Float)            # actual reading
    z_score = Column(Float)          # statistical deviation
    severity = Column(String)        # "WARNING", "CRITICAL"
    message = Column(String)
    timestamp = Column(DateTime, default=datetime.datetime.utcnow)

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True)
    hashed_password = Column(String)
    is_active = Column(Integer, default=1)

# Phase 8: Enterprise Transformation Models
class AIRecommendationQueue(Base):
    __tablename__ = "ai_recommendation_queue"

    id = Column(Integer, primary_key=True, index=True)
    resource_id = Column(String)
    resource_type = Column(String)  # "container", "vm", "db"
    recommendation = Column(String)
    action_type = Column(String)     # "shutdown", "scale_down", "restart"
    status = Column(String, default="pending")  # "pending", "approved", "rejected", "executed"
    confidence_score = Column(Integer)
    risk_level = Column(String)      # "low", "medium", "high"
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    approved_at = Column(DateTime, nullable=True)
    executed_at = Column(DateTime, nullable=True)
    previous_state = Column(String, nullable=True) # JSON blob for rollback

class AuditLog(Base):
    __tablename__ = "audit_logs"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer)
    action = Column(String)
    resource_id = Column(String)
    status = Column(String)
    timestamp = Column(DateTime, default=datetime.datetime.utcnow)

class CloudCredential(Base):
    __tablename__ = "cloud_credentials"

    id = Column(Integer, primary_key=True, index=True)
    provider = Column(String)        # "AWS", "Azure"
    encrypted_key = Column(String)
    encrypted_secret = Column(String)
    region = Column(String)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

class WarRoom(Base):
    __tablename__ = "war_rooms"
    id = Column(Integer, primary_key=True, index=True)
    title = Column(String)
    description = Column(String, nullable=True)
    status = Column(String, default="active") # "active", "closed"
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

class WarRoomMessage(Base):
    __tablename__ = "war_room_messages"
    id = Column(Integer, primary_key=True, index=True)
    room_id = Column(Integer)
    user = Column(String)
    text = Column(String)
    type = Column(String, default="chat") # "chat", "system", "command", "ai"
    timestamp = Column(DateTime, default=datetime.datetime.utcnow)

