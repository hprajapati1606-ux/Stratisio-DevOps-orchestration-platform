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
    action = Column(String) # "Scale Up" or "Scale Down"
    reason = Column(String)
    timestamp = Column(DateTime, default=datetime.datetime.utcnow)
class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True)
    hashed_password = Column(String)
    is_active = Column(Integer, default=1)
