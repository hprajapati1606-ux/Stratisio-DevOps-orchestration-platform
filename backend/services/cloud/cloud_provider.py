from abc import ABC, abstractmethod
from typing import Dict, Any, List

class CloudProvider(ABC):
    """
    Interface for Cloud Service Providers in StratisIO.
    Supports operations for both physical containers and cloud instances.
    """
    
    @abstractmethod
    def deploy(self, name: str, image: str, port: int, cloud: str) -> Dict[str, Any]:
        """Deploy a new resource (container/VM)"""
        pass

    @abstractmethod
    def restart(self, resource_id: str) -> bool:
        """Restart the resource"""
        pass

    @abstractmethod
    def stop(self, resource_id: str) -> bool:
        """Stop the resource"""
        pass

    @abstractmethod
    def terminate(self, resource_id: str) -> bool:
        """Permanently destroy the resource"""
        pass

    @abstractmethod
    def get_metrics(self, resource_id: str) -> Dict[str, str]:
        """Fetch real-time metrics for specific resource"""
        pass
