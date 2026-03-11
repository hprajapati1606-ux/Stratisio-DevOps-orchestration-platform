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
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
