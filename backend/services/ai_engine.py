import numpy as np
from sklearn.ensemble import RandomForestClassifier
import random
from typing import Dict, Any, List
from datetime import datetime

class AIRecommender:
    def __init__(self):
        self.model = RandomForestClassifier(n_estimators=10)
        self._trained = False
        self.clouds = ['AWS', 'AZURE', 'GCP', 'LOCAL']

    def _train_dummy_model(self):
        """Generate synthetic training data for the recommender model."""
        X = []
        y = []
        for _ in range(100):
            cpu = random.randint(0, 100)
            mem = random.randint(0, 100)
            thr = random.randint(0, 1000)
            bud = random.randint(0, 500)
            X.append([cpu, mem, thr, bud])
            if cpu > 80: y.append(0)      # AWS
            elif mem > 80: y.append(1)    # Azure
            elif bud < 100: y.append(3)   # Local
            else: y.append(2)             # GCP

        self.model.fit(X, y)
        self._trained = True

    def recommend(self, cpu: float, mem: float, throughput: float, budget: float = 200) -> Dict[str, Any]:
        if not self._trained:
            self._train_dummy_model()

        features = np.array([[cpu, mem, throughput, budget]])
        prob = self.model.predict_proba(features)[0]
        prediction = int(np.argmax(prob))

        provider_name = self.clouds[prediction]

        # Build actionable recommendations list
        recommendations: List[str] = []
        anomalies = 0

        if cpu > 85:
            anomalies += 1
            recommendations.append(f"CRITICAL: CPU at {int(cpu)}%. Immediate scale-up on {provider_name} recommended.")
        elif cpu > 70:
            recommendations.append(f"WARNING: CPU at {int(cpu)}%. Consider scaling if load persists.")

        if mem > 85:
            anomalies += 1
            recommendations.append(f"CRITICAL: Memory at {int(mem)}%. Investigate memory leaks or scale vertically.")
        elif mem > 70:
            recommendations.append(f"WARNING: Memory at {int(mem)}%. Monitor closely.")

        if throughput > 500:
            recommendations.append("Network throughput peak detected. Scalable bandwidth tier recommended.")

        if budget < 100:
            recommendations.append("Cost optimization mode: Local or spot instances preferred to reduce burn rate.")

        if cpu < 15 and mem < 30:
            recommendations.append(f"Underutilized resources detected. Consider consolidating deployments on {provider_name}.")

        if not recommendations:
            recommendations.append("All system metrics are balanced. Infrastructure is operating optimally.")

        reasons = {
            'AWS': "Optimal performance for high-compute workloads and scalable networking.",
            'AZURE': "Superior memory-optimized instances and enterprise compliance focus.",
            'GCP': "Cost-effective scaling for variable traffic and edge processing.",
            'LOCAL': "Zero egress costs and low-latency edge operations for development."
        }

        action = "Keep Current"
        if cpu > 80 or (provider_name == 'AWS' and cpu > 60):
            action = f"Scale Up on {provider_name}"
        elif cpu < 15:
            action = f"Consolidate on {provider_name}"

        return {
            "best_cloud": provider_name,
            "confidence_score": round(float(np.max(prob)) * 100, 2),
            "reasoning": reasons.get(provider_name, "General optimization recommended."),
            "recommendations": recommendations,
            "anomalies_detected": anomalies,
            "insights": recommendations,
            "action": action,
            "timestamp": datetime.now().isoformat()
        }

recommender = AIRecommender()
