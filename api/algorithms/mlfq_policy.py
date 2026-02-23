"""
MLFQPolicy — Multi-Level Feedback Queue scheduling policy.

Implements a 3-level feedback queue compatible with the SimulationEngine:
  Queue 0 (highest priority) — Round Robin, quantum = 4
  Queue 1 (medium priority)  — Round Robin, quantum = 8
  Queue 2 (lowest priority)  — FCFS (run to completion)

A new process enters Queue 0. If it uses its full quantum without
completing, it is demoted to the next queue. A process in a lower
queue is preempted when a higher-priority queue becomes non-empty.
"""

from .base import SchedulerPolicy


class MLFQPolicy(SchedulerPolicy):
    """Multi-Level Feedback Queue — 3-level with quantum demotion."""

    QUANTUMS = [4, 8, None]  # None = FCFS (no quantum limit)

    def __init__(self):
        # Track which queue level each PID is in
        self.process_levels: dict[int, int] = {}  # pid -> queue_level (0,1,2)

    @property
    def name(self) -> str:
        return "MLFQ"

    @property
    def is_preemptive(self) -> bool:
        return True

    @property
    def uses_quantum(self) -> bool:
        return True

    def get_quantum_for_pid(self, pid: int) -> int:
        """Return the quantum for the queue level this PID is in."""
        level = self.process_levels.get(pid, 0)
        q = self.QUANTUMS[level]
        return q if q is not None else 999999  # FCFS = effectively infinite

    def select_next(self, ready_queue, processes: list) -> int:
        """Pick from highest-priority (lowest index) non-empty queue."""
        if len(ready_queue) == 0:
            return -1

        # Initialize any new processes to queue 0
        for pid in ready_queue:
            if pid not in self.process_levels:
                self.process_levels[pid] = 0

        # Pick process from highest priority queue
        best_pid = -1
        best_level = 999
        for pid in ready_queue:
            level = self.process_levels.get(pid, 0)
            if level < best_level:
                best_level = level
                best_pid = pid
            elif level == best_level and best_pid == -1:
                best_pid = pid
        return best_pid

    def should_preempt(self, running_pid: int, ready_queue, processes: list) -> bool:
        """Preempt if a process in a higher-priority queue exists."""
        if len(ready_queue) == 0:
            return False

        running_level = self.process_levels.get(running_pid, 0)
        for pid in ready_queue:
            if self.process_levels.get(pid, 0) < running_level:
                return True
        return False

    def on_quantum_expire(self, pid: int):
        """Demote a process to the next lower queue after using its quantum."""
        current = self.process_levels.get(pid, 0)
        self.process_levels[pid] = min(current + 1, 2)

    def get_queue_state(self, ready_queue) -> dict:
        """Return the current state of all 3 queues for visualization."""
        queues = {0: [], 1: [], 2: []}
        for pid in ready_queue:
            level = self.process_levels.get(pid, 0)
            queues[level].append(pid)
        return {
            "queues": [
                {"level": 0, "quantum": 4, "pids": queues[0]},
                {"level": 1, "quantum": 8, "pids": queues[1]},
                {"level": 2, "quantum": None, "pids": queues[2]},
            ]
        }

    def reset(self):
        """Clear queue level tracking."""
        self.process_levels.clear()
