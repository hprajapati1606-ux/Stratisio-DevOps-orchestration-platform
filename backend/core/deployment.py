from kubernetes import client, config
from core.orchestrator import orchestrator
from models.deployment import Deployment
from database import SessionLocal
import uuid
import random

class DeploymentEngine:
    def __init__(self):
        self.apps_api = client.AppsV1Api() if orchestrator.api else None
        self.core_api = client.CoreV1Api() if orchestrator.api else None

    def deploy_app(self, name: str, image: str, cloud: str, port: int = 80):
        """Deploys an application as a K8s Deployment and Service."""
        namespace = f"cloud-{cloud}"
        deployment_name = f"{name}-{uuid.uuid4().hex[:6]}"
        ip_addr = f"10.{random.randint(0,255)}.{random.randint(0,255)}.{random.randint(0,255)}"
        
        # Save to Database
        db = SessionLocal()
        new_deployment = Deployment(
            name=deployment_name, # Use the unique name with UUID
            image=image,
            cloud=cloud.upper(),
            port=port,
            status="Running",
            ip_address=ip_addr,
            cpu_usage=f"{random.randint(5, 45)}%",
            memory_usage=f"{random.randint(128, 1024)}MB"
        )
        db.add(new_deployment)
        db.commit()
        db.refresh(new_deployment)
        db.close()

        if not self.apps_api:
            return {
                "status": "Deployed (Demo Mode)", 
                "deployment_id": deployment_name, 
                "namespace": namespace,
                "endpoint": f"{deployment_name}-svc.{namespace}.svc.cluster.local"
            }

        # 1. Define Pod Template
        container = client.V1Container(
            name=name,
            image=image,
            ports=[client.V1ContainerPort(container_port=port)]
        )
        
        template = client.V1PodTemplateSpec(
            metadata=client.V1ObjectMeta(labels={"app": name}),
            spec=client.V1PodSpec(containers=[container])
        )

        # 2. Define Deployment Spec
        spec = client.V1DeploymentSpec(
            replicas=1,
            selector=client.V1LabelSelector(match_labels={"app": name}),
            template=template
        )

        deployment = client.V1Deployment(
            metadata=client.V1ObjectMeta(name=deployment_name),
            spec=spec
        )

        # 3. Create Deployment
        self.apps_api.create_namespaced_deployment(namespace=namespace, body=deployment)

        # 4. Create Service to expose it
        service = client.V1Service(
            metadata=client.V1ObjectMeta(name=f"{deployment_name}-svc"),
            spec=client.V1ServiceSpec(
                selector={"app": name},
                ports=[client.V1ServicePort(port=port, target_port=port)],
                type="ClusterIP"
            )
        )
        self.core_api.create_namespaced_service(namespace=namespace, body=service)

        return {
            "status": "Deployed",
            "deployment_id": deployment_name,
            "namespace": namespace,
            "endpoint": f"{deployment_name}-svc.{namespace}.svc.cluster.local"
        }

deployer = DeploymentEngine()
