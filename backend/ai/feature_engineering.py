"""
Feature engineering for workload characterization.

Extracts statistical features from a set of processes that describe
the workload — these features become input to the ML classifier.
"""

import math

FEATURE_NAMES = [
    "n_processes", "mean_burst", "std_burst", "cv_burst",
    "min_burst", "max_burst", "mean_arrival", "std_arrival",
    "arrival_spread", "mean_priority", "std_priority",
    "burst_skewness", "cpu_bound_ratio", "time_quantum",
]


def extract_features(process_configs: list[dict], time_quantum: int = 2) -> dict:
    """
    Extract workload features from a list of process configurations.

    Args:
        process_configs: List of dicts with keys: arrival, burst, priority
        time_quantum:    Time quantum setting

    Returns:
        Dict of feature_name → float value.
    """
    n = len(process_configs)
    if n == 0:
        return _empty_features()

    bursts = [p.get("burst", p.get("burstTime", 1)) for p in process_configs]
    arrivals = [p.get("arrival", p.get("arrivalTime", 0)) for p in process_configs]
    priorities = [p.get("priority", 0) for p in process_configs]

    mean_burst = sum(bursts) / n
    mean_arrival = sum(arrivals) / n
    mean_priority = sum(priorities) / n

    std_burst = _std(bursts, mean_burst)
    std_arrival = _std(arrivals, mean_arrival)
    std_priority = _std(priorities, mean_priority)

    median_burst = sorted(bursts)[n // 2]

    return {
        "n_processes": n,
        "mean_burst": round(mean_burst, 4),
        "std_burst": round(std_burst, 4),
        "cv_burst": round(std_burst / mean_burst, 4) if mean_burst > 0 else 0,
        "min_burst": min(bursts),
        "max_burst": max(bursts),
        "mean_arrival": round(mean_arrival, 4),
        "std_arrival": round(std_arrival, 4),
        "arrival_spread": max(arrivals) - min(arrivals),
        "mean_priority": round(mean_priority, 4),
        "std_priority": round(std_priority, 4),
        "burst_skewness": round(_skewness(bursts, mean_burst, std_burst), 4),
        "cpu_bound_ratio": round(sum(1 for b in bursts if b > median_burst) / n, 4),
        "time_quantum": time_quantum,
    }


def features_to_vector(features: dict) -> list[float]:
    """Convert feature dict to ordered list for model input."""
    keys = [
        "n_processes", "mean_burst", "std_burst", "cv_burst",
        "min_burst", "max_burst", "mean_arrival", "std_arrival",
        "arrival_spread", "mean_priority", "std_priority",
        "burst_skewness", "cpu_bound_ratio", "time_quantum",
    ]
    return [features.get(k, 0) for k in keys]


def _std(values: list, mean: float) -> float:
    n = len(values)
    if n <= 1:
        return 0.0
    variance = sum((x - mean) ** 2 for x in values) / (n - 1)
    return math.sqrt(variance)


def _skewness(values: list, mean: float, std: float) -> float:
    n = len(values)
    if n <= 2 or std == 0:
        return 0.0
    return (sum((x - mean) ** 3 for x in values) / n) / (std ** 3)


def _empty_features() -> dict:
    return {
        "n_processes": 0, "mean_burst": 0, "std_burst": 0, "cv_burst": 0,
        "min_burst": 0, "max_burst": 0, "mean_arrival": 0, "std_arrival": 0,
        "arrival_spread": 0, "mean_priority": 0, "std_priority": 0,
        "burst_skewness": 0, "cpu_bound_ratio": 0, "time_quantum": 2,
    }
