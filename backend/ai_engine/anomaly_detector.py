import logging
import math

class AIOpsEngine:
    def __init__(self):
        # We'll use a statistical approach (Mean + Standard Deviation)
        # This is more robust and has zero binary dependencies (no sklearn/pandas)
        self.stats = {
            'cpu': {'count': 0, 'mean': 0.0, 'sq_sum': 0.0},
            'memory': {'count': 0, 'mean': 0.0, 'sq_sum': 0.0}
        }
        self.is_trained = False
        self.min_samples_to_train = 5

    def train_model(self, historical_data: list):
        """
        Ingests historical metrics to establish a baseline.
        historical_data: List of [cpu_usage, mem_usage]
        """
        for cpu, mem in historical_data:
            self._update_stats('cpu', cpu)
            self._update_stats('memory', mem)
        
        if self.stats['cpu']['count'] >= self.min_samples_to_train:
            self.is_trained = True
            logging.info("AIOps Statistical Model baseline established.")
        return self.is_trained

    def _update_stats(self, metric: str, value: float):
        s = self.stats[metric]
        s['count'] += 1
        delta = value - s['mean']
        s['mean'] += delta / s['count']
        s['sq_sum'] += delta * (value - s['mean'])

    def _get_std_dev(self, metric: str):
        s = self.stats[metric]
        if s['count'] < 2:
            return 0.0
        return math.sqrt(s['sq_sum'] / (s['count'] - 1))

    def detect_anomaly(self, current_metrics: list):
        """
        Predicts if the current metrics are anomalous using Z-score.
        Returns: (is_anomaly, confidence_score)
        """
        cpu, mem = current_metrics
        
        if not self.is_trained:
            # Simple threshold fallback
            is_anom = cpu > 85 or mem > 90
            return is_anom, 0.5

        # Calculate Z-scores
        cpu_mean = self.stats['cpu']['mean']
        cpu_std = self._get_std_dev('cpu')
        
        mem_mean = self.stats['memory']['mean']
        mem_std = self._get_std_dev('memory')

        # Z-score > 2.5 is usually considered a significant anomaly (99% outlier)
        cpu_z = abs(cpu - cpu_mean) / (cpu_std + 0.1)
        mem_z = abs(mem - mem_mean) / (mem_std + 0.1)

        is_anomaly = cpu_z > 2.5 or mem_z > 2.5 or cpu > 90 or mem > 90
        
        # Max Z-score normalized to a 0-1 confidence
        confidence = min(max(cpu_z, mem_z) / 5.0, 1.0)

        return is_anomaly, round(confidence, 2)

ai_ops = AIOpsEngine()
