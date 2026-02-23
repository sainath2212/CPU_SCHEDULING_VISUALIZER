"""
Algorithm Comparator — run the same process set on all algorithms.

Produces a side-by-side comparison of final metrics for every
scheduling algorithm, useful for the comparison dashboard and
for generating AI training data.
"""

import sys
import os

sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))

from kernel.engine import SimulationEngine
from algorithms.policies import POLICY_BY_NAME


class AlgorithmComparator:
    """Run a workload across all algorithms and collect results."""

    ALGORITHMS = ["FCFS", "SJF", "SRTF", "Priority", "RR", "LJF", "LRTF", "MLFQ"]

    def compare(
        self,
        process_configs: list[dict],
        time_quantum: int = 2,
    ) -> dict:
        """
        Run the same processes on every algorithm and return metrics.

        Args:
            process_configs: List of dicts with keys: arrival, burst, priority
            time_quantum:    Time quantum for Round Robin

        Returns:
            Dict mapping algorithm name → final metrics dict.
        """
        results = {}
        for algo_name in self.ALGORITHMS:
            engine = SimulationEngine()
            engine.set_policy(algo_name)
            engine.set_time_quantum(time_quantum)

            for p in process_configs:
                engine.add_process(
                    arrival=p.get("arrival", p.get("arrivalTime", 0)),
                    burst=p.get("burst", p.get("burstTime", 1)),
                    priority=p.get("priority", 0),
                )

            engine.run_to_completion()
            results[algo_name] = engine.get_final_metrics()

        return results

    def compare_detailed(
        self,
        process_configs: list[dict],
        time_quantum: int = 2,
    ) -> dict:
        """
        Same as compare() but also returns per-process details.

        Returns:
            Dict mapping algorithm name → {metrics, processes, gantt}.
        """
        results = {}
        for algo_name in self.ALGORITHMS:
            engine = SimulationEngine()
            engine.set_policy(algo_name)
            engine.set_time_quantum(time_quantum)

            for p in process_configs:
                engine.add_process(
                    arrival=p.get("arrival", p.get("arrivalTime", 0)),
                    burst=p.get("burst", p.get("burstTime", 1)),
                    priority=p.get("priority", 0),
                )

            engine.run_to_completion()
            state = engine.get_state()
            results[algo_name] = {
                "metrics": engine.get_final_metrics(),
                "processes": state["processes"],
                "gantt": state["gantt"],
            }

        return results
