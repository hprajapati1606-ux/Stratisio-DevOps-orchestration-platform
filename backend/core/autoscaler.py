from kubernetes import client
from core.orchestrator import orchestrator
import logging

class AutoScaler:
    def __init__(self):
        self.apps_api = client.AppsV1Api() if orchestrator.api else None

    def scale_deployment(self, name: str, namespace: str, target_replicas: int):
        """Simulates HPA by manually patching deployment replicas."""
        if not self.apps_api:
            return {"status": "Demo Mode", "target_replicas": target_replicas}

        try:
            body = {"spec": {"replicas": target_replicas}}
            self.apps_api.patch_namespaced_deployment_scale(
                name=name,
                namespace=namespace,
                body=body
            )
            logging.info(f"Scaled {name} in {namespace} to {target_replicas} replicas")
            return {"status": "Success", "replicas": target_replicas}
        except Exception as e:
            logging.error(f"Scaling failed: {e}")
            return {"status": "Error", "message": str(e)}

    def evaluate_scaling(self, deployment_name: str, namespace: str, cpu_usage: float):
        """Logic to determine if scaling is needed."""
        if cpu_usage > 75:
            return self.scale_deployment(deployment_name, namespace, 3)
        elif cpu_usage < 20:
            return self.scale_deployment(deployment_name, namespace, 1)
        return {"status": "No action needed", "current_cpu": cpu_usage}

autoscaler = AutoScaler()
