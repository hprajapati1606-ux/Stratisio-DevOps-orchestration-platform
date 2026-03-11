from kubernetes import client, config
from kubernetes.client.rest import ApiException
import logging

class CloudOrchestrator:
    def __init__(self):
        try:
            config.load_kube_config()
            self.api = client.CoreV1Api()
            logging.info("Kubernetes configuration loaded")
        except Exception as e:
            logging.warning(f"K8s Config failed: {e}. Falling back to demo mode.")
            self.api = None

    def initialize_cloud_environments(self):
        """Creates namespaces representing AWS, Azure, and GCP."""
        providers = ["cloud-aws", "cloud-azure", "cloud-gcp"]
        status = {}
        
        if not self.api:
            return {"demo_mode": True, "created": providers}

        for ns in providers:
            try:
                body = client.V1Namespace(metadata=client.V1ObjectMeta(name=ns, labels={"provider": ns.split('-')[1]}))
                self.api.create_namespace(body=body)
                status[ns] = "Created"
            except ApiException as e:
                if e.status == 409:
                    status[ns] = "Exists"
                else:
                    status[ns] = f"Error: {e}"
        
        return status

orchestrator = CloudOrchestrator()
