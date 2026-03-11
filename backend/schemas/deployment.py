from pydantic import BaseModel
from typing import Optional

class DeploymentRequest(BaseModel):
    name: str
    image: str
    cloud: str  # aws, azure, gcp
    port: Optional[int] = 80

class DeploymentResponse(BaseModel):
    status: str
    deployment_id: str
    namespace: str
    endpoint: str
