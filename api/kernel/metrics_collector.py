"""
Per-tick metrics collector.

Records a snapshot of system metrics at every clock tick for
real-time time-series visualization on the frontend.
All metrics are computed incrementally — no post-hoc recomputation.
"""

from .process import ProcessState


class MetricsCollector:
    """Captures and stores per-tick metric snapshots."""

    def __init__(self):
        self.tick_snapshots: list[dict] = []
        self.busy_ticks: int = 0
        self.total_completed: int = 0

    def reset(self):
        """Clear all recorded data."""
        self.tick_snapshots.clear()
        self.busy_ticks = 0
        self.total_completed = 0

    def record_tick(self, engine):
        """
        Record one tick snapshot from the simulation engine.

        Called at the end of each tick() in the engine. Computes all
        metrics incrementally:

        • CPU Utilization  = busy_ticks / total_ticks × 100
        • Throughput       = completed_count / total_ticks
        • Avg Wait Time    = Σ(wait_time_i) / n
        • Avg Turnaround   = Σ(tat_i) / completed  (only finished procs)
        • Avg Response      = Σ(response_i) / started (only started procs)
        • Context Switches  = running count from engine
        • Ready Queue Len   = len(ready_queue)
        """
        is_busy = engine.running_pid != -1
        if is_busy:
            self.busy_ticks += 1

        total_ticks = engine.current_time + 1  # current_time is 0-indexed
        processes = engine.processes

        # Count completed processes
        completed = [p for p in processes if p.state == ProcessState.TERMINATED]
        self.total_completed = len(completed)

        # Count started processes (have been dispatched at least once)
        started = [p for p in processes if p.start_time != -1]

        n = len(processes) if processes else 1

        # Incremental averages
        avg_wait = round(sum(p.wait_time for p in processes) / n, 2) if processes else 0
        avg_tat = (
            round(sum(p.turnaround_time for p in completed) / len(completed), 2)
            if completed
            else 0
        )
        avg_resp = (
            round(sum(p.response_time for p in started) / len(started), 2)
            if started
            else 0
        )

        snapshot = {
            "tick": engine.current_time,
            "runningPid": engine.running_pid,
            "readyQueueLength": len(engine.ready_queue),
            "cpuUtilization": round(self.busy_ticks / max(total_ticks, 1) * 100, 2),
            "throughput": round(self.total_completed / max(total_ticks, 1), 4),
            "contextSwitches": engine.context_switches,
            "avgWaitTime": avg_wait,
            "avgTurnaroundTime": avg_tat,
            "avgResponseTime": avg_resp,
        }
        self.tick_snapshots.append(snapshot)

    def get_final_metrics(self, engine) -> dict:
        """Compute final summary metrics after simulation completes."""
        processes = engine.processes
        if not processes:
            return self._empty_metrics()

        n = len(processes)
        completed = [p for p in processes if p.state == ProcessState.TERMINATED]
        started = [p for p in processes if p.start_time != -1]

        total_burst = sum(p.burst_time for p in processes)
        max_finish = max((p.finish_time for p in completed), default=0)
        min_arrival = min(p.arrival_time for p in processes)
        total_time = max_finish - min_arrival if max_finish > min_arrival else 1

        return {
            "avgWaitTime": round(sum(p.wait_time for p in processes) / n, 2),
            "avgTurnaroundTime": (
                round(sum(p.turnaround_time for p in completed) / len(completed), 2)
                if completed else 0
            ),
            "avgResponseTime": (
                round(sum(p.response_time for p in started) / len(started), 2)
                if started else 0
            ),
            "cpuUtilization": round(total_burst / total_time * 100, 2),
            "throughput": round(len(completed) / total_time, 4),
            "contextSwitches": engine.context_switches,
            "totalIdleTime": total_time - total_burst,
            "totalExecutionTime": total_time,
        }

    @staticmethod
    def _empty_metrics() -> dict:
        return {
            "avgWaitTime": 0,
            "avgTurnaroundTime": 0,
            "avgResponseTime": 0,
            "cpuUtilization": 0,
            "throughput": 0,
            "contextSwitches": 0,
            "totalIdleTime": 0,
            "totalExecutionTime": 0,
        }
