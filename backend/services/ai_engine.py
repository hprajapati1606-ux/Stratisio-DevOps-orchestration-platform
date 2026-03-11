import numpy as np
from sklearn.ensemble import RandomForestClassifier
import random

class AIRecommender:
    def __init__(self):
        self.model = RandomForestClassifier(n_estimators=10)
        self._trained = False
        self.clouds = ['AWS', 'AZURE', 'GCP', 'LOCAL']

    def _train_dummy_model(self):
        # Generate some synthetic training data
        # Features: [cpu_load, memory_load, throughput, budget_constraint]
        # Label: Cloud index
        X = []
        y = []
        for _ in range(100):
            cpu = random.randint(0, 100)
            mem = random.randint(0, 100)
            thr = random.randint(0, 1000)
            bud = random.randint(0, 500)
            
            X.append([cpu, mem, thr, bud])
            # Logic: If high CPU/Throughput -> AWS, If high Budget/Mem -> Azure, If low budget -> Local/GCP
            if cpu > 80: y.append(0) # AWS
            elif mem > 80: y.append(1) # Azure
            elif bud < 100: y.append(3) # Local
            else: y.append(2) # GCP
            
        self.model.fit(X, y)
        self._trained = True

    def recommend(self, cpu: float, mem: float, throughput: float, budget: float = 200):
        if not self._trained:
            self._train_dummy_model()
            
        features = np.array([[cpu, mem, throughput, budget]])
        prob = self.model.predict_proba(features)[0]
        prediction = np.argmax(prob)
        
        reasons = [
            "Optimal performance for high-compute workloads.",
            "Superior memory-optimized instances availability.",
            "Cost-effective scaling for variable traffic.",
            "Zero egress costs for local edge operations."
        ]
        
        return {
            "best_cloud": self.clouds[prediction],
            "confidence_score": round(float(np.max(prob)) * 100, 2),
            "reasoning": reasons[prediction]
        }

recommender = AIRecommender()
