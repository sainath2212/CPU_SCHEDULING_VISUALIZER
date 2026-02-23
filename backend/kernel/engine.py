"""
Discrete-event Simulation Engine — the heart of the kernel simulator.

Implements a timer-interrupt-driven tick loop that mirrors how a real
OS scheduler works:

    1. Admit newly arrived processes (NEW → READY)
    2. Handle preemption (quantum expiry, higher-priority arrival)
    3. Dispatch next process if CPU is idle
    4. Execute one tick on the running process
    5. Handle process completion
    6. Update waiting times for READY processes
    7. Record per-tick metrics snapshot
    8. Advance the clock

Context switches are tracked whenever the CPU switches between
different processes (not on idle → running transitions).
"""

import sys
import os

sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))

from .process import PCB, ProcessState
from .ready_queue import ReadyQueue
from .metrics_collector import MetricsCollector

from algorithms.base import SchedulerPolicy
from algorithms.policies import POLICY_MAP, POLICY_BY_NAME, FCFSPolicy


class SimulationEngine:
    """
    Tick-based CPU scheduler simulation engine.

    Usage:
        engine = SimulationEngine()
        engine.set_policy("SRTF")
        engine.add_process(arrival=0, burst=5, priority=1)
        engine.add_process(arrival=2, burst=3, priority=2)
        while engine.tick():
            print(engine.get_state())
    """

    def __init__(self):
        self.processes: list[PCB] = []
        self.ready_queue = ReadyQueue()
        self.policy: SchedulerPolicy = FCFSPolicy()
        self.current_time: int = 0
        self.running_pid: int = -1
        self.time_quantum: int = 2
        self.context_switches: int = 0
        self.gantt: list[dict] = []
        self.metrics_collector = MetricsCollector()
        self.is_completed: bool = False
        self.kernel_log: list[dict] = []  # Kernel event log

        # Internal tracking
        self._last_running_pid: int = -1   # For context switch detection

    # ── Configuration ──

    def set_policy_by_id(self, algo_id: int):
        """Set scheduling policy by numeric ID (0=FCFS, 1=SJF, ...)."""
        cls = POLICY_MAP.get(algo_id, FCFSPolicy)
        self.policy = cls()

    def set_policy(self, name: str):
        """Set scheduling policy by name ('FCFS', 'SRTF', 'RR', ...)."""
        cls = POLICY_BY_NAME.get(name, FCFSPolicy)
        self.policy = cls()

    def set_time_quantum(self, quantum: int):
        """Set time quantum for Round Robin."""
        self.time_quantum = max(quantum, 1)

    # ── Process Management ──

    def add_process(self, arrival: int, burst: int, priority: int = 0) -> int:
        """Add a process and return its PID."""
        pid = len(self.processes)
        self.processes.append(PCB(
            pid=pid,
            arrival_time=arrival,
            burst_time=burst,
            priority=priority,
        ))
        if self.is_completed:
            self.is_completed = False
        return pid

    def clear(self):
        """Reset everything to initial state."""
        self.processes.clear()
        self.ready_queue.clear()
        self.gantt.clear()
        self.kernel_log.clear()
        self.current_time = 0
        self.running_pid = -1
        self._last_running_pid = -1
        self.context_switches = 0
        self.is_completed = False
        self.metrics_collector.reset()
        if hasattr(self.policy, 'reset'):
            self.policy.reset()

    def reset(self):
        """Keep processes but reset all simulation state."""
        self.ready_queue.clear()
        self.gantt.clear()
        self.kernel_log.clear()
        self.current_time = 0
        self.running_pid = -1
        self._last_running_pid = -1
        self.context_switches = 0
        self.is_completed = False
        self.metrics_collector.reset()
        if hasattr(self.policy, 'reset'):
            self.policy.reset()
        for p in self.processes:
            p.remaining_time = p.burst_time
            p.state = ProcessState.NEW
            p.start_time = -1
            p.finish_time = -1
            p.wait_time = 0
            p.response_time = -1
            p.turnaround_time = 0
            p.quantum_used = 0
            p.mlfq_queue_level = 0

    # ── Kernel Log ──

    def _log_event(self, event: str, **kwargs):
        """Record a kernel event for the live log view."""
        entry = {"tick": self.current_time, "event": event}
        entry.update(kwargs)
        self.kernel_log.append(entry)

    # ── Core Tick Loop ──

    def tick(self) -> bool:
        """
        Execute one clock tick — the heart of the kernel simulation.

        Returns:
            True if simulation should continue, False if completed.
        """
        if self.is_completed:
            return False
        if not self.processes:
            return False

        # STEP 1: Admit newly arrived processes (NEW → READY)
        self._admit_arrivals()

        # STEP 2: Handle preemption
        self._handle_preemption()

        # STEP 3: Dispatch next process if CPU is idle
        if self.running_pid == -1:
            self._dispatch_next()

        # STEP 4: Execute one tick on the running process
        self._execute_tick()

        # STEP 5: Update waiting times for all READY processes
        self._update_waiting_times()

        # STEP 6: Record per-tick metrics snapshot
        self.metrics_collector.record_tick(self)

        # STEP 7: Advance the clock
        self.current_time += 1

        # STEP 8: Check completion
        self._check_completion()

        return not self.is_completed

    def run_to_completion(self):
        """Run the simulation until all processes terminate."""
        while self.tick() and self.current_time < 10000:
            pass

    # ── Internal Steps ──

    def _admit_arrivals(self):
        """Move newly arrived processes from NEW to READY."""
        for p in self.processes:
            if p.state == ProcessState.NEW and p.arrival_time <= self.current_time:
                p.state = ProcessState.READY
                self.ready_queue.enqueue(p.pid)
                self._log_event("arrive", pid=p.pid)

    def _handle_preemption(self):
        """Check whether the running process should be preempted."""
        if self.running_pid == -1:
            return

        proc = self.processes[self.running_pid]

        # Quantum-based preemption (Round Robin / MLFQ)
        if self.policy.uses_quantum:
            # For MLFQ, get per-process quantum
            if hasattr(self.policy, 'get_quantum_for_pid'):
                quantum = self.policy.get_quantum_for_pid(self.running_pid)
            else:
                quantum = self.time_quantum

            if proc.quantum_used >= quantum:
                # If MLFQ, demote the process
                if hasattr(self.policy, 'on_quantum_expire'):
                    self.policy.on_quantum_expire(self.running_pid)
                    self._log_event("demote", pid=self.running_pid)

                proc.state = ProcessState.READY
                proc.quantum_used = 0
                self.ready_queue.enqueue(self.running_pid)
                self._log_event("preempt", pid=self.running_pid, reason="quantum")
                self._last_running_pid = self.running_pid
                self.running_pid = -1
                return

        # Policy-level preemption (SRTF, LRTF, MLFQ higher-queue)
        if self.policy.is_preemptive:
            if self.policy.should_preempt(self.running_pid, self.ready_queue, self.processes):
                old_pid = self.running_pid
                proc.state = ProcessState.READY
                self.ready_queue.enqueue(self.running_pid)
                self._log_event("preempt", pid=old_pid, reason="policy")
                self._last_running_pid = self.running_pid
                self.running_pid = -1

    def _dispatch_next(self):
        """Select and dispatch the next process from the ready queue."""
        next_pid = self.policy.select_next(self.ready_queue, self.processes)
        if next_pid == -1:
            return

        # Track context switch: prev process ≠ new process
        if self._last_running_pid != -1 and self._last_running_pid != next_pid:
            self.context_switches += 1
            self._log_event("context_switch", from_pid=self._last_running_pid, to_pid=next_pid)

        self.ready_queue.remove(next_pid)
        self.running_pid = next_pid

        proc = self.processes[next_pid]
        proc.state = ProcessState.RUNNING
        self._log_event("dispatch", pid=next_pid)

        # Record first dispatch (response time)
        if proc.start_time == -1:
            proc.start_time = self.current_time
            proc.response_time = self.current_time - proc.arrival_time

        # Reset quantum counter when dispatched
        if self.policy.uses_quantum:
            proc.quantum_used = 0

    def _execute_tick(self):
        """Execute the running process for one tick, or record idle."""
        if self.running_pid != -1:
            proc = self.processes[self.running_pid]
            proc.execute_tick()
            self._add_gantt(self.running_pid, self.current_time, self.current_time + 1)

            # Check if process completed
            if proc.is_complete:
                proc.state = ProcessState.TERMINATED
                proc.finish_time = self.current_time + 1
                proc.turnaround_time = proc.finish_time - proc.arrival_time
                self._log_event("complete", pid=self.running_pid)
                self._last_running_pid = self.running_pid
                self.running_pid = -1
        else:
            # CPU idle
            self._add_gantt(-1, self.current_time, self.current_time + 1)
            self._log_event("idle")

    def _update_waiting_times(self):
        """Increment wait_time for every process currently in READY state."""
        for pid in self.ready_queue:
            self.processes[pid].wait_time += 1

    def _check_completion(self):
        """Check if all processes have terminated."""
        if self.processes and all(p.state == ProcessState.TERMINATED for p in self.processes):
            self.is_completed = True
            self._log_event("simulation_complete")

    # ── Gantt Chart ──

    def _add_gantt(self, pid: int, start: int, end: int):
        """Add or extend a Gantt chart entry."""
        if self.gantt:
            last = self.gantt[-1]
            if last["pid"] == pid and last["endTime"] == start:
                last["endTime"] = end
                return
        self.gantt.append({"pid": pid, "startTime": start, "endTime": end, "coreId": 0})

    # ── State Serialization ──

    def get_state(self) -> dict:
        """Return full simulation state for API responses."""
        state = {
            "currentTime": self.current_time,
            "runningPid": self.running_pid,
            "isCompleted": self.is_completed,
            "algorithm": self.policy.name,
            "timeQuantum": self.time_quantum,
            "contextSwitches": self.context_switches,
            "processes": [p.to_dict() for p in self.processes],
            "gantt": list(self.gantt),
            "readyQueue": self.ready_queue.as_list(),
            "metricsHistory": self.metrics_collector.tick_snapshots,
            "kernelLog": self.kernel_log[-50:],  # Last 50 events
            "metrics": (
                self.metrics_collector.get_final_metrics(self)
                if self.is_completed
                else self.metrics_collector._empty_metrics()
            ),
        }

        # MLFQ queue state
        if hasattr(self.policy, 'get_queue_state'):
            state["mlfqState"] = self.policy.get_queue_state(self.ready_queue)

        return state

    def get_final_metrics(self) -> dict:
        """Convenience: get final summary metrics."""
        return self.metrics_collector.get_final_metrics(self)
