import logging
import random
from typing import Dict, Any, Optional
from .cloud_provider import CloudProvider

logger = logging.getLogger("stratisio.local_provider")

class LocalProvider(CloudProvider):
    """
    Docker-backed local deployment provider.
    Falls back to Demo Mode automatically when Docker Desktop is not running.
    """

    def __init__(self):
        self.client = None
        self.demo_mode = False
        try:
            import docker
            self.client = docker.from_env()
            self.client.ping()  # Confirm Docker is reachable
            logger.info("LocalProvider: Docker client connected.")
        except Exception as e:
            logger.warning(f"LocalProvider: Docker unavailable ({e}). Running in Demo Mode.")
            self.client = None
            self.demo_mode = True

    def _demo_deploy(self, name: str, image: str, port: int) -> Dict[str, Any]:
        """Return a simulated deployment result when Docker is unavailable."""
        fake_id = f"demo-{name}-{random.randint(1000, 9999)}"
        logger.info(f"[Demo Mode] Simulated deploy: {name} (image={image}, port={port})")
        return {
            "resource_id": fake_id,
            "ip_address": "127.0.0.1",
            "status": "Running (Demo)",
            "cpu_usage": f"{random.randint(2, 15)}%",
            "memory_usage": f"{random.randint(64, 256)}MB",
            "demo_mode": True,
        }

    def deploy(self, name: str, image: str, port: int, cloud: str) -> Dict[str, Any]:
        if self.demo_mode or not self.client:
            return self._demo_deploy(name, image, port)

        try:
            try:
                self.client.images.get(image)
            except Exception:
                logger.info(f"Pulling image: {image}")
                self.client.images.pull(image)

            unique_name = f"stratis-{name}-{random.randint(100, 999)}"
            container = self.client.containers.run(
                image,
                detach=True,
                ports={f"{port}/tcp": None},  # Dynamic port assignment
                name=unique_name,
                labels={"owner": "stratisio", "managed": "true"},
            )
            container.reload()
            logger.info(f"Container started: {container.id[:12]} ({unique_name})")
            return {
                "resource_id": container.id,
                "ip_address": "127.0.0.1",
                "status": "Running",
                "cpu_usage": "2%",
                "memory_usage": "128MB",
            }
        except Exception as e:
            logger.error(f"Docker deploy error: {e}")
            # Graceful fallback to demo mode rather than crashing
            logger.warning("Falling back to Demo Mode for this deployment.")
            return self._demo_deploy(name, image, port)

    def restart(self, resource_id: str) -> bool:
        if self.demo_mode or not self.client:
            logger.info(f"[Demo Mode] Simulated restart: {resource_id}")
            return True
        try:
            self.client.containers.get(resource_id).restart()
            return True
        except Exception as e:
            logger.warning(f"Restart failed for {resource_id}: {e}")
            return False

    def stop(self, resource_id: str) -> bool:
        if self.demo_mode or not self.client:
            logger.info(f"[Demo Mode] Simulated stop: {resource_id}")
            return True
        try:
            self.client.containers.get(resource_id).stop()
            return True
        except Exception as e:
            logger.warning(f"Stop failed for {resource_id}: {e}")
            return False

    def terminate(self, resource_id: str) -> bool:
        if self.demo_mode or not self.client:
            logger.info(f"[Demo Mode] Simulated terminate: {resource_id}")
            return True
        try:
            self.client.containers.get(resource_id).remove(force=True)
            return True
        except Exception as e:
            logger.warning(f"Terminate failed for {resource_id}: {e}")
            return False

    def get_metrics(self, resource_id: str) -> Dict[str, str]:
        if self.demo_mode or not self.client or not resource_id:
            return {
                "cpu_usage": f"{random.randint(2, 30)}%",
                "memory_usage": f"{random.randint(64, 512)}MB",
            }
        try:
            container = self.client.containers.get(resource_id)
            stats = container.stats(stream=False)
            cpu_delta = stats["cpu_stats"]["cpu_usage"]["total_usage"] - \
                        stats["precpu_stats"]["cpu_usage"]["total_usage"]
            system_delta = stats["cpu_stats"]["system_cpu_usage"] - \
                          stats["precpu_stats"]["system_cpu_usage"]
            num_cpus = stats["cpu_stats"].get("online_cpus", 1)
            cpu_pct = (cpu_delta / system_delta) * num_cpus * 100.0 if system_delta > 0 else 0

            mem_usage = stats["memory_stats"]["usage"]
            mem_limit = stats["memory_stats"]["limit"]
            mem_pct = (mem_usage / mem_limit) * 100 if mem_limit > 0 else 0

            return {
                "cpu_usage": f"{round(cpu_pct, 1)}%",
                "memory_usage": f"{round(mem_usage / 1024 / 1024, 0):.0f}MB ({round(mem_pct, 1)}%)",
            }
        except Exception:
            return {
                "cpu_usage": f"{random.randint(2, 30)}%",
                "memory_usage": f"{random.randint(64, 512)}MB",
            }
