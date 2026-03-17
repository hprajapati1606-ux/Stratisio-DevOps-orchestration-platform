import logging
import time
import threading
import psutil
import random
from sqlalchemy.orm import Session
from database import SessionLocal
import models
from services.cloud.orchestrator import orchestrator
from services.ai_engine import recommender

logger = logging.getLogger("stratisio.autoscaler")

BUDGET_GUARDRAIL_USD = 500  # Monthly spend threshold for auto-scale lockout


class AutoScaler:
    def __init__(self):
        self.stop_event = threading.Event()
        self.thread = None
        self.enabled = False

    def start(self):
        if self.thread is None or not self.thread.is_alive():
            self.stop_event.clear()
            self.thread = threading.Thread(target=self._worker_loop, daemon=True)
            self.thread.start()
            logger.info("Autoscaler: Service thread started.")

    def stop(self):
        self.enabled = False
        self.stop_event.set()
        logger.info("Autoscaler: Service stopped.")

    def _worker_loop(self):
        while not self.stop_event.is_set():
            try:
                if self.enabled:
                    self._check_and_scale()
                self._self_heal()
            except Exception as e:
                logger.error(f"Autoscaler worker error: {e}")
            time.sleep(15)

    # ------------------------------------------------------------------
    # Self-Healing: restart stopped deployments automatically
    # ------------------------------------------------------------------
    def _self_heal(self):
        db = SessionLocal()
        try:
            stopped = db.query(models.Deployment).filter(models.Deployment.status == "Stopped").all()
            for deployment in stopped:
                if not deployment.container_id:
                    continue
                try:
                    provider = orchestrator.get_provider(deployment.cloud)
                    success = provider.restart(deployment.container_id)
                    if success:
                        deployment.status = "Running"
                        event = models.ScalingEvent(
                            deployment_name=deployment.name,
                            action="Self-Heal",
                            reason="Automatically restarted stopped container.",
                        )
                        db.add(event)
                        db.commit()
                        logger.info(f"Self-healed: {deployment.name} [{deployment.container_id}]")
                except Exception as e:
                    logger.warning(f"Self-heal failed for {deployment.name}: {e}")
        finally:
            db.close()

    # ------------------------------------------------------------------
    # AI-driven scaling
    # ------------------------------------------------------------------
    def _check_and_scale(self):
        cpu = psutil.cpu_percent(interval=1)
        mem = psutil.virtual_memory().percent
        net = psutil.net_io_counters().bytes_sent / 1024

        db = SessionLocal()
        try:
            # Budget guardrail check
            deployment_count = db.query(models.Deployment).count()
            monthly_est = 50 + (deployment_count * 120) + ((cpu / 100) * 50)
            if monthly_est > BUDGET_GUARDRAIL_USD:
                logger.warning(
                    f"Budget guardrail triggered (${round(monthly_est, 2)}/mo > ${BUDGET_GUARDRAIL_USD}). "
                    "Auto-scaling is paused to prevent overspend."
                )
                return

            rec = recommender.recommend(cpu, mem, net)
            action = rec.get("action", "Keep Current")

            if "Scale Up" in action:
                self._apply_scaling(db, "Scale Up", rec)
            elif "Consolidate" in action:
                self._apply_scaling(db, "Scale Down", rec)

        except Exception as e:
            logger.error(f"Autoscaler decision error: {e}")
        finally:
            db.close()

    def _apply_scaling(self, db: Session, action_type: str, recommendation: dict):
        deployment = (
            db.query(models.Deployment)
            .order_by(models.Deployment.created_at.desc())
            .first()
        )
        if not deployment:
            return

        logger.info(f"Autoscaler: {action_type} — {recommendation.get('reasoning', '')}")

        try:
            provider = orchestrator.get_provider(deployment.cloud)

            if action_type == "Scale Up":
                res = provider.deploy(
                    name=f"replica-{deployment.name}",
                    image=deployment.image,
                    port=deployment.port + random.randint(1, 100),
                    cloud=deployment.cloud,
                )
                new_deployment = models.Deployment(
                    name=f"{deployment.name}-replica",
                    image=deployment.image,
                    cloud=deployment.cloud,
                    port=deployment.port,
                    status="Running",
                    ip_address=res.get("ip_address"),
                    container_id=res.get("resource_id"),
                    cpu_usage="5%",
                    memory_usage="128MB",
                )
                db.add(new_deployment)

            elif action_type == "Scale Down":
                replica = (
                    db.query(models.Deployment)
                    .filter(models.Deployment.name.like("%-replica%"))
                    .first()
                )
                if replica:
                    provider.terminate(replica.container_id)
                    db.delete(replica)

            event = models.ScalingEvent(
                deployment_name=deployment.name,
                action=action_type,
                reason=f"AI: {recommendation.get('reasoning', 'Automated decision')}",
            )
            db.add(event)
            db.commit()
            logger.info(f"Autoscaler: {action_type} executed via {deployment.cloud.upper()}.")

        except Exception as e:
            logger.error(f"Autoscaler execution failed: {e}")
            db.rollback()


scaler = AutoScaler()
