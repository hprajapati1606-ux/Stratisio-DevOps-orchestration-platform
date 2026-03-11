import sys
import os
import datetime
import random

# Ensure local imports work
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from database import SessionLocal, init_db
import models

def seed():
    print("Initializing Database...")
    init_db()
    db = SessionLocal()
    
    # Wipe existing data
    print("Clearing old records...")
    db.query(models.Deployment).delete()
    db.query(models.User).delete()
    
    # User creation removed (Auth disabled)
    
    samples = [
        {"name": "Global Edge Gateway", "image": "envoy:latest", "cloud": "AWS", "ip": "10.0.4.15"},
        {"name": "Neural Auth Mesh", "image": "node:20-alpine", "cloud": "AZURE", "ip": "10.45.1.88"},
        {"name": "Quantum Ledger DB", "image": "postgres:16-alpine", "cloud": "GCP", "ip": "10.200.4.12"},
        {"name": "Vector Search Cluster", "image": "elasticsearch:8.12", "cloud": "AWS", "ip": "10.0.12.33"},
        {"name": "Hybrid Ingress Node", "image": "traefik:v3.0", "cloud": "LOCAL", "ip": "192.168.1.50"}
    ]
    
    print(f"Seeding {len(samples)} high-availability clusters...")
    for s in samples:
        d = models.Deployment(
            name=s["name"],
            image=s["image"],
            cloud=s["cloud"],
            port=random.choice([80, 443, 8080, 5000]),
            status="Running",
            ip_address=s["ip"],
            cpu_usage=f"{random.randint(10, 60)}%",
            memory_usage=f"{random.randint(512, 4096)}MB",
            created_at=datetime.datetime.utcnow()
        )
        db.add(d)
    
    db.commit()
    db.close()
    print("Backend successfully seeded and ready.")

if __name__ == "__main__":
    seed()
