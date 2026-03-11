from prometheus_client import start_http_server, Summary, Counter, Gauge
import time
import random

# Define Metrics
REQUEST_TIME = Summary('request_processing_seconds', 'Time spent processing request')
DEPLOYMENTS_TOTAL = Counter('stratisio_deployments_total', 'Total number of app deployments', ['cloud'])
CPU_USAGE = Gauge('stratisio_cpu_usage_percentage', 'Real-time CPU usage percentage', ['cloud', 'app'])
MEM_USAGE = Gauge('stratisio_mem_usage_percentage', 'Real-time Memory usage percentage', ['cloud', 'app'])

class MetricsService:
    @staticmethod
    def start_exporter(port=8001):
        start_http_server(port)
        print(f"Prometheus Exporter started on port {port}")

    @staticmethod
    def track_deployment(cloud: str):
        DEPLOYMENTS_TOTAL.labels(cloud=cloud).inc()

    @staticmethod
    def update_resource_usage(cloud: str, app: str, cpu: float, mem: float):
        CPU_USAGE.labels(cloud=cloud, app=app).set(cpu)
        MEM_USAGE.labels(cloud=cloud, app=app).set(mem)

metrics_service = MetricsService()
