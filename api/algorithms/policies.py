"""
Concrete scheduling policy implementations.

Each class implements the SchedulerPolicy interface to plug into the
SimulationEngine via the Strategy pattern.
"""

from .base import SchedulerPolicy
from .mlfq_policy import MLFQPolicy


# ── FCFS (First Come First Served) ──────────────────────────────────────

class FCFSPolicy(SchedulerPolicy):
    @property
    def name(self) -> str:
        return "FCFS"

    @property
    def is_preemptive(self) -> bool:
        return False

    def select_next(self, ready_queue, processes: list) -> int:
        if len(ready_queue) == 0:
            return -1
        return ready_queue.peek()


# ── SJF (Shortest Job First) ────────────────────────────────────────────

class SJFPolicy(SchedulerPolicy):
    @property
    def name(self) -> str:
        return "SJF"

    @property
    def is_preemptive(self) -> bool:
        return False

    def select_next(self, ready_queue, processes: list) -> int:
        if len(ready_queue) == 0:
            return -1
        return min(ready_queue, key=lambda pid: processes[pid].burst_time)


# ── SRTF (Shortest Remaining Time First) ────────────────────────────────

class SRTFPolicy(SchedulerPolicy):
    @property
    def name(self) -> str:
        return "SRTF"

    @property
    def is_preemptive(self) -> bool:
        return True

    def select_next(self, ready_queue, processes: list) -> int:
        if len(ready_queue) == 0:
            return -1
        return min(ready_queue, key=lambda pid: processes[pid].remaining_time)

    def should_preempt(self, running_pid: int, ready_queue, processes: list) -> bool:
        if len(ready_queue) == 0:
            return False
        shortest_ready = min(ready_queue, key=lambda pid: processes[pid].remaining_time)
        return processes[shortest_ready].remaining_time < processes[running_pid].remaining_time


# ── Priority Scheduling ─────────────────────────────────────────────────

class PriorityPolicy(SchedulerPolicy):
    @property
    def name(self) -> str:
        return "Priority"

    @property
    def is_preemptive(self) -> bool:
        return False

    def select_next(self, ready_queue, processes: list) -> int:
        if len(ready_queue) == 0:
            return -1
        return min(ready_queue, key=lambda pid: processes[pid].priority)


# ── Round Robin ──────────────────────────────────────────────────────────

class RoundRobinPolicy(SchedulerPolicy):
    @property
    def name(self) -> str:
        return "Round Robin"

    @property
    def is_preemptive(self) -> bool:
        return True

    @property
    def uses_quantum(self) -> bool:
        return True

    def select_next(self, ready_queue, processes: list) -> int:
        if len(ready_queue) == 0:
            return -1
        return ready_queue.peek()


# ── LJF (Longest Job First) ─────────────────────────────────────────────

class LJFPolicy(SchedulerPolicy):
    @property
    def name(self) -> str:
        return "LJF"

    @property
    def is_preemptive(self) -> bool:
        return False

    def select_next(self, ready_queue, processes: list) -> int:
        if len(ready_queue) == 0:
            return -1
        return max(ready_queue, key=lambda pid: processes[pid].burst_time)


# ── LRTF (Longest Remaining Time First) ─────────────────────────────────

class LRTFPolicy(SchedulerPolicy):
    @property
    def name(self) -> str:
        return "LRTF"

    @property
    def is_preemptive(self) -> bool:
        return True

    def select_next(self, ready_queue, processes: list) -> int:
        if len(ready_queue) == 0:
            return -1
        return max(ready_queue, key=lambda pid: processes[pid].remaining_time)

    def should_preempt(self, running_pid: int, ready_queue, processes: list) -> bool:
        if len(ready_queue) == 0:
            return False
        longest_ready = max(ready_queue, key=lambda pid: processes[pid].remaining_time)
        return processes[longest_ready].remaining_time > processes[running_pid].remaining_time


# ── Policy Registry ─────────────────────────────────────────────────────

POLICY_MAP = {
    0: FCFSPolicy,
    1: SJFPolicy,
    2: SRTFPolicy,
    3: PriorityPolicy,
    4: RoundRobinPolicy,
    5: LJFPolicy,
    6: LRTFPolicy,
    7: MLFQPolicy,
}

POLICY_BY_NAME = {
    "FCFS": FCFSPolicy,
    "SJF": SJFPolicy,
    "SRTF": SRTFPolicy,
    "Priority": PriorityPolicy,
    "RR": RoundRobinPolicy,
    "Round Robin": RoundRobinPolicy,
    "LJF": LJFPolicy,
    "LRTF": LRTFPolicy,
    "MLFQ": MLFQPolicy,
}
