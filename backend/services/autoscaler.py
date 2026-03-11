import time
import threading
import psutil
import docker
from sqlalchemy.orm import Session
from database import SessionLocal
import models
import random

class AutoScaler:
    def __init__(self):
        self.stop_event = threading.Event()
        self.thread = None
        try:
            self.client = docker.from_env()
        except:
            self.client = None
        self.enabled = False

    def start(self):
        self.enabled = True
        if self.thread is None or not self.thread.is_alive():
            self.stop_event.clear()
            self.thread = threading.Thread(target=self._worker_loop, daemon=True)
            self.thread.start()
            print("Autoscaler: Service started.")

    def stop(self):
        self.enabled = False
        self.stop_event.set()
        print("Autoscaler: Service stopped.")

    def _worker_loop(self):
        while not self.stop_event.is_set():
            if self.enabled:
                self._check_and_scale()
            time.sleep(10) # Run every 10 seconds

    def _check_and_scale(self):
        cpu = psutil.cpu_percent(interval=1)
        db = SessionLocal()
        try:
            if cpu > 70:
                self._scale_up(db, cpu)
            elif cpu < 30:
                self._scale_down(db, cpu)
        except Exception as e:
            print(f"Autoscaler Error: {e}")
        finally:
            db.close()

    def _scale_up(self, db: Session, cpu: float):
        # Find a running deployment to clone
        deployment = db.query(models.Deployment).first()
        if not deployment or not self.client:
            return

        print(f"Autoscaler: CPU at {cpu}%. Scaling up {deployment.name}...")
        
        try:
            new_port = deployment.port + random.randint(1, 1000)
            container = self.client.containers.run(
                deployment.image,
                detach=True,
                ports={f'{deployment.port}/tcp': new_port},
                name=f"scale-up-{deployment.name}-{int(time.time())}"
            )
            
            # Log event
            event = models.ScalingEvent(
                deployment_name=deployment.name,
                action="Scale Up",
                reason=f"Host CPU Load: {cpu}%"
            )
            db.add(event)
            db.commit()
            print(f"Autoscaler: Successfully scaled up {deployment.name}. New container: {container.id[:12]}")
        except Exception as e:
            print(f"Autoscaler Scale Up Failed: {e}")

    def _scale_down(self, db: Session, cpu: float):
        # Prune containers starting with 'scale-up-'
        if not self.client:
            return

        containers = self.client.containers.list(filters={"name": "scale-up-"})
        if not containers:
            return

        print(f"Autoscaler: CPU at {cpu}%. Scaling down...")
        
        try:
            target = containers[0]
            name = target.name
            target.remove(force=True)
            
            # Log event
            event = models.ScalingEvent(
                deployment_name=name,
                action="Scale Down",
                reason=f"Host CPU Load: {cpu}%"
            )
            db.add(event)
            db.commit()
            print(f"Autoscaler: Successfully removed replica {name}")
        except Exception as e:
            print(f"Autoscaler Scale Down Failed: {e}")

# Singleton instance
scaler = AutoScaler()
