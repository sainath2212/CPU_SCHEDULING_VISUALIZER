"""
Process Control Block (PCB) — mirrors a real OS PCB.

Every process in the simulation is represented by a PCB instance that
tracks scheduling state, timing information, and per-process metrics.
"""

from enum import IntEnum
from dataclasses import dataclass, field


class ProcessState(IntEnum):
    """Process lifecycle states (matches Linux task_struct states conceptually)."""
    NEW = 0
    READY = 1
    RUNNING = 2
    WAITING = 3        # Reserved for future I/O burst simulation
    TERMINATED = 4


@dataclass
class PCB:
    """
    Process Control Block.

    Static fields are set at creation time. Dynamic fields are updated
    by the SimulationEngine on every tick.
    """

    # ── Static (set once) ──
    pid: int
    arrival_time: int
    burst_time: int
    priority: int = 0

    # ── Dynamic (updated per tick) ──
    remaining_time: int = -1
    state: ProcessState = field(default=ProcessState.NEW)
    start_time: int = -1          # First time CPU was allocated
    finish_time: int = -1
    wait_time: int = 0            # Cumulative time spent in READY state
    response_time: int = -1       # start_time - arrival_time
    turnaround_time: int = 0      # finish_time - arrival_time

    # ── Round Robin / MLFQ extras ──
    quantum_used: int = 0         # Ticks consumed in current quantum slice
    mlfq_queue_level: int = 0     # Which MLFQ sub-queue this process is in

    def __post_init__(self):
        if self.remaining_time == -1:
            self.remaining_time = self.burst_time

    # ── Helpers ──

    @property
    def is_complete(self) -> bool:
        return self.remaining_time <= 0

    def execute_tick(self):
        """Execute exactly one CPU tick."""
        self.remaining_time -= 1
        self.quantum_used += 1

    def to_dict(self) -> dict:
        """Serialize for JSON API responses."""
        return {
            "pid": self.pid,
            "arrivalTime": self.arrival_time,
            "burstTime": self.burst_time,
            "priority": self.priority,
            "remainingTime": self.remaining_time,
            "state": int(self.state),
            "stateName": self.state.name,
            "startTime": self.start_time,
            "finishTime": self.finish_time,
            "waitTime": self.wait_time,
            "responseTime": self.response_time,
            "turnaroundTime": self.turnaround_time,
            "quantumUsed": self.quantum_used,
            "mlfqQueue": self.mlfq_queue_level,
        }
