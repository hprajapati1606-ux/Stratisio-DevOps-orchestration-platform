from typing import Dict, Any, Optional
from .local_provider import LocalProvider
from .aws_provider import AWSProvider
from .azure_provider import AzureProvider
from .cloud_provider import CloudProvider

class CloudOrchestrator:
    def __init__(self):
        self.providers: Dict[str, CloudProvider] = {
            "local": LocalProvider(),
            "aws": AWSProvider(),
            "azure": AzureProvider()
        }

    def get_provider(self, cloud: str) -> CloudProvider:
        # Default to local if not recognized, or specific mapping
        cloud_lower = (cloud or "local").lower()
        if "aws" in cloud_lower:
            return self.providers["aws"]
        elif "azure" in cloud_lower:
            return self.providers["azure"]
        return self.providers["local"]

# Global instance
orchestrator = CloudOrchestrator()
