import sys
import os

# Add the backend directory to sys.path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from database import SessionLocal, init_db
from models.deployment import Deployment
import datetime
import random

def seed():
    init_db()
    db = SessionLocal()
    
    # Clear existing
    db.query(Deployment).delete()
    
    samples = [
        {"name": "Core Gateway", "image": "envoy:v1.28", "cloud": "AWS", "ip": "10.0.4.15"},
        {"name": "Auth Service", "image": "node:20-alpine", "cloud": "AZURE", "ip": "10.45.1.88"},
        {"name": "Billing API", "image": "postgres:15", "cloud": "GCP", "ip": "10.200.4.12"},
        {"name": "Search Engine", "image": "elasticsearch:8.11", "cloud": "AWS", "ip": "10.0.12.33"},
        {"name": "Edge Router", "image": "traefik:v2.10", "cloud": "GCP", "ip": "10.150.8.4"}
    ]
    
    for s in samples:
        d = Deployment(
            name=s["name"],
            image=s["image"],
            cloud=s["cloud"],
            port=random.choice([80, 443, 8080, 3000]),
            status="Running",
            ip_address=s["ip"],
            cpu_usage=f"{random.randint(5, 45)}%",
            memory_usage=f"{random.randint(256, 1024)}MB",
            created_at=datetime.datetime.utcnow()
        )
        db.add(d)
    
    db.commit()
    print("Database seeded with 5 items.")
    db.close()

if __name__ == "__main__":
    seed()
