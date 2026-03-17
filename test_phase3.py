import sys
import os

# Add backend to path
sys.path.append(os.path.join(os.getcwd(), 'backend'))

from services.cloud.orchestrator import orchestrator

def test_clouds():
    clouds = ["local", "aws", "azure"]
    results = []
    
    print("--- StratisIO Multi-Cloud Verification ---")
    
    for cloud in clouds:
        print(f"\nTesting Provider: {cloud.upper()}")
        provider = orchestrator.get_provider(cloud)
        
        # Test Deploy
        try:
            res = provider.deploy(f"test-{cloud}", "nginx:latest", 80, cloud)
            print(f"  [PASS] Deploy: {res['resource_id']} @ {res['ip_address']}")
            
            # Test Metrics
            metrics = provider.get_metrics(res['resource_id'])
            print(f"  [PASS] Metrics: CPU {metrics['cpu_usage']}, MEM {metrics['memory_usage']}")
            
            # Test Lifecycle
            if provider.restart(res['resource_id']):
                print("  [PASS] Restart successful")
            if provider.stop(res['resource_id']):
                print("  [PASS] Stop successful")
            if provider.terminate(res['resource_id']):
                print("  [PASS] Terminate successful")
                
            results.append(True)
        except Exception as e:
            print(f"  [FAIL] {cloud}: {str(e)}")
            results.append(False)
            
    return all(results)

if __name__ == "__main__":
    success = test_clouds()
    if success:
        print("\n[SUCCESS] All cloud providers verified!")
        sys.exit(0)
    else:
        print("\n[FAILURE] One or more providers failed verification.")
        sys.exit(1)
