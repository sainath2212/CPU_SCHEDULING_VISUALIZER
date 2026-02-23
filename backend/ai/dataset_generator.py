"""
Dataset generator for AI training.

Generates synthetic workloads with varying characteristics, runs them
through all scheduling algorithms, and labels each workload with the
best-performing algorithm. This produces training data for the ML
classifier.
"""

import random
import math
import sys
import os

sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))

from comparison.comparator import AlgorithmComparator
from ai.feature_engineering import extract_features, features_to_vector


class DatasetGenerator:
    """Generate labeled training data for the AI recommender."""

    QUANTUMS = [1, 2, 4, 8]

    def __init__(self, seed: int = 42):
        self.rng = random.Random(seed)
        self.comparator = AlgorithmComparator()

    def generate(self, n_samples: int = 10000) -> tuple[list, list, list]:
        """
        Generate n_samples labeled workloads.

        Returns:
            (features_list, labels, raw_records)
            - features_list: list of feature vectors (list of floats)
            - labels: list of algorithm names (best for each workload)
            - raw_records: list of dicts with full info for analysis
        """
        features_list = []
        labels = []
        raw_records = []

        for i in range(n_samples):
            # Generate random workload
            workload = self._random_workload()
            quantum = self.rng.choice(self.QUANTUMS)

            # Extract features
            feats = extract_features(workload, quantum)
            feat_vec = features_to_vector(feats)

            # Run all algorithms and find the best
            try:
                results = self.comparator.compare(workload, quantum)
                best_algo = self._pick_best(results)
            except Exception:
                continue

            features_list.append(feat_vec)
            labels.append(best_algo)
            raw_records.append({
                "workload": workload,
                "quantum": quantum,
                "features": feats,
                "results": results,
                "best": best_algo,
            })

            if (i + 1) % 500 == 0:
                print(f"  Generated {i + 1}/{n_samples} samples...")

        return features_list, labels, raw_records

    def _random_workload(self) -> list[dict]:
        """Generate a random set of processes."""
        n = self.rng.randint(3, 20)
        pattern = self.rng.choice(["uniform", "exponential", "bimodal", "bursty"])

        processes = []
        for _ in range(n):
            burst = self._random_burst(pattern)
            arrival = self._random_arrival(n)
            priority = self.rng.randint(0, 10)
            processes.append({
                "arrival": arrival,
                "burst": burst,
                "priority": priority,
            })
        return processes

    def _random_burst(self, pattern: str) -> int:
        if pattern == "uniform":
            return self.rng.randint(1, 50)
        elif pattern == "exponential":
            return max(1, int(self.rng.expovariate(0.1)))
        elif pattern == "bimodal":
            if self.rng.random() < 0.5:
                return self.rng.randint(1, 5)    # Short bursts
            else:
                return self.rng.randint(30, 50)  # Long bursts
        elif pattern == "bursty":
            return max(1, int(self.rng.gauss(15, 10)))
        return self.rng.randint(1, 30)

    def _random_arrival(self, n: int) -> int:
        pattern = self.rng.choice(["zero", "spread", "poisson"])
        if pattern == "zero":
            return 0
        elif pattern == "spread":
            return self.rng.randint(0, n * 3)
        elif pattern == "poisson":
            return max(0, int(self.rng.expovariate(0.3)))
        return 0

    def _pick_best(self, results: dict) -> str:
        """
        Pick the best algorithm using a weighted score.

        Score = 0.4×avg_wait + 0.3×avg_tat + 0.2×avg_response + 0.1×context_switches
        Lower is better.
        """
        best_algo = None
        best_score = float("inf")

        for algo_name, metrics in results.items():
            score = (
                0.4 * metrics.get("avgWaitTime", 0)
                + 0.3 * metrics.get("avgTurnaroundTime", 0)
                + 0.2 * metrics.get("avgResponseTime", 0)
                + 0.1 * metrics.get("contextSwitches", 0)
            )
            if score < best_score:
                best_score = score
                best_algo = algo_name

        return best_algo


# ── CLI entry point ──

if __name__ == "__main__":
    import json

    print("🔄 Generating training dataset...")
    gen = DatasetGenerator(seed=42)
    features, labels, records = gen.generate(n_samples=100)  # Small for testing
    print(f"✅ Generated {len(features)} samples")
    print(f"   Label distribution: {dict((l, labels.count(l)) for l in set(labels))}")
