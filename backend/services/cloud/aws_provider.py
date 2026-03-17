import random
import boto3
import os
from typing import List, Dict, Any
from .cloud_provider import CloudProvider
from dotenv import load_dotenv

load_dotenv()

class AWSProvider(CloudProvider):
    def __init__(self):
        self.access_key = os.getenv("AWS_ACCESS_KEY_ID")
        self.secret_key = os.getenv("AWS_SECRET_ACCESS_KEY")
        self.region = os.getenv("AWS_REGION", "us-east-1")
        
        self.use_simulation = not (self.access_key and self.secret_key)
        
        if not self.use_simulation:
            try:
                import boto3
                self.ec2 = boto3.client(
                    'ec2',
                    aws_access_key_id=self.access_key,
                    aws_secret_access_key=self.secret_key,
                    region_name=self.region
                )
                # Test connection
                self.ec2.describe_regions()
                print("AWSProvider: Real Cloud SDK initialized.")
            except Exception as e:
                print(f"AWSProvider: SDK Init failed ({e}). Falling back to Simulation.")
                self.use_simulation = True

    def deploy(self, name: str, image: str, port: int, cloud: str) -> Dict[str, Any]:
        if self.use_simulation:
            # Mock deployment logic
            resource_id = f"i-{random.getrandbits(32):x}"
            return {
                "status": "success",
                "resource_id": resource_id,
                "ip_address": f"3.80.{random.randint(1,254)}.{random.randint(1,254)}",
                "message": f"Simulated deployment of {image} on AWS successful."
            }
        
        # Real Boto3 Deployment (Simplified example using t2.micro)
        try:
            instances = self.ec2.run_instances(
                ImageId='ami-0c55b159cbfafe1f0', # Amazon Linux 2 (Region specific!)
                InstanceType='t2.micro',
                MinCount=1,
                MaxCount=1,
                TagSpecifications=[{
                    'ResourceType': 'instance',
                    'Tags': [{'Key': 'Name', 'Value': name}]
                }]
            )
            instance_id = instances['Instances'][0]['InstanceId']
            return {
                "status": "success",
                "resource_id": instance_id,
                "ip_address": "Pending (Check AWS Console)",
                "message": f"Real AWS instance {instance_id} provisioning initiated."
            }
        except Exception as e:
            return {"status": "error", "message": f"AWS SDK Error: {str(e)}"}

    def restart(self, resource_id: str) -> bool:
        if self.use_simulation: return True
        try:
            self.ec2.reboot_instances(InstanceIds=[resource_id])
            return True
        except: return False

    def stop(self, resource_id: str) -> bool:
        if self.use_simulation: return True
        try:
            self.ec2.stop_instances(InstanceIds=[resource_id])
            return True
        except: return False

    def terminate(self, resource_id: str) -> bool:
        if self.use_simulation: return True
        try:
            self.ec2.terminate_instances(InstanceIds=[resource_id])
            return True
        except: return False

    def list_instances(self) -> List[Dict[str, Any]]:
        if self.use_simulation:
            return [
                {"id": "i-0a123bc", "name": "prod-api-gw", "status": "running", "type": "t3.medium"},
                {"id": "i-0b456de", "name": "staging-db", "status": "stopped", "type": "r5.large"},
                {"id": "i-0c789fg", "name": "zombie-test-01", "status": "running", "type": "t2.micro"}
            ]
        try:
            res = self.ec2.describe_instances()
            instances = []
            for reservation in res['Reservations']:
                for ins in reservation['Instances']:
                    name = next((t['Value'] for t in ins.get('Tags', []) if t['Key'] == 'Name'), ins['InstanceId'])
                    instances.append({
                        "id": ins['InstanceId'],
                        "name": name,
                        "status": ins['State']['Name'],
                        "type": ins['InstanceType']
                    })
            return instances
        except: return []

    def start_instance(self, instance_id: str) -> bool:
        if self.use_simulation: return True
        try:
            self.ec2.start_instances(InstanceIds=[instance_id])
            return True
        except: return False

    def stop_instance(self, instance_id: str) -> bool:
        return self.stop(instance_id) # Alias

    def get_cost_data(self) -> Dict[str, Any]:
        if self.use_simulation:
            return {
                "monthly_total": 452.10,
                "projected": 480.00,
                "top_spender": "EC2-Compute",
                "savings_potential": 85.00
            }
        try:
            # Note: Cost Explorer requires specific permissions and 'us-east-1' client
            # This is a placeholder for where the Cost Explorer SDK call would go
            return {
                "monthly_total": 0.0,
                "projected": 0.0,
                "message": "Cost Explorer API access required for real data"
            }
        except: return {}

    def get_metrics(self, resource_id: str) -> Dict[str, Any]:
        if self.use_simulation:
            return {
                "cpu_usage_avg": random.randint(5, 95),
                "memory_usage_avg": random.randint(10, 90),
                "network_in": f"{random.randint(1, 1000)}MB",
                "uptime": "14d 5h"
            }
        # CloudWatch metrics implementation would go here
        return {"cpu_usage_avg": 0, "memory_usage_avg": 0}
