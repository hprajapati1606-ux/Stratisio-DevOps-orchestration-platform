class CostEngine:
    PRICING_MODELS = {
        "aws": {"cpu_hour": 0.05, "mem_gb_hour": 0.01},
        "azure": {"cpu_hour": 0.045, "mem_gb_hour": 0.012},
        "gcp": {"cpu_hour": 0.04, "mem_gb_hour": 0.015}
    }

    def calculate_estimate(self, cloud: str, cpu: int, mem_gb: int, hours: int = 730):
        """Calculates monthly estimate (default 730 hours)."""
        if cloud not in self.PRICING_MODELS:
            return None
        
        rates = self.PRICING_MODELS[cloud]
        cpu_cost = cpu * rates["cpu_hour"] * hours
        mem_cost = mem_gb * rates["mem_gb_hour"] * hours
        total = cpu_cost + mem_cost
        
        return {
            "cloud": cloud,
            "monthly_estimate": round(total, 2),
            "annual_estimate": round(total * 12, 2),
            "breakdown": {
                "compute": round(cpu_cost, 2),
                "memory": round(mem_cost, 2)
            }
        }

    def get_optimization_suggestions(self, cloud: str, cpu_usage: float):
        """Provides cost optimization advice based on usage."""
        if cpu_usage < 20:
            return "Resource Underutilized: Consider downsizing instance or using Spot instances."
        elif cpu_usage > 80:
            return "High Usage: Consider Reserved Instances for long-term savings."
        return "Optimal: Usage is within cost-efficient range."

cost_engine = CostEngine()
