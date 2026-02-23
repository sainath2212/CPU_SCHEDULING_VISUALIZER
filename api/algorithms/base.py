"""
Abstract base class for scheduling policies.

Every scheduling algorithm implements this interface so the
SimulationEngine can treat them uniformly — the Strategy pattern.
"""

from abc import ABC, abstractmethod


class SchedulerPolicy(ABC):
    """
    Interface every scheduling algorithm must implement.

    The engine calls select_next() when the CPU is idle, and
    should_preempt() on every tick when a process is running.
    """

    @property
    @abstractmethod
    def name(self) -> str:
        """Human-readable algorithm name, e.g. 'FCFS'."""
        ...

    @property
    @abstractmethod
    def is_preemptive(self) -> bool:
        """Whether this algorithm can preempt a running process."""
        ...

    @property
    def uses_quantum(self) -> bool:
        """Whether this algorithm uses time quantum (Round Robin)."""
        return False

    @abstractmethod
    def select_next(self, ready_queue, processes: list) -> int:
        """
        Select the next process to run from the ready queue.

        Args:
            ready_queue: ReadyQueue instance containing PIDs
            processes:   List of PCB instances (indexed by PID)

        Returns:
            PID of the selected process, or -1 if none available.
        """
        ...

    def should_preempt(self, running_pid: int, ready_queue, processes: list) -> bool:
        """
        Check whether the currently running process should be preempted.

        Only called for preemptive algorithms. Default returns False.

        Args:
            running_pid: PID of the currently running process
            ready_queue: ReadyQueue instance
            processes:   List of PCB instances

        Returns:
            True if the running process should be preempted.
        """
        return False
