# ================= CPU SCHEDULING ORCHESTRATOR =================
# All algorithm implementations live in backend/algorithms/
# This file wires them together for the tick-based API.

import sys
import os
sys.path.insert(0, os.path.dirname(__file__))

from algorithms import fcfs, sjf, srtf, priority_scheduling, round_robin, ljf, lrtf, mlfq

# =================== ALGORITHM MAP ===================

ALGORITHM_NAMES = {
    0: "FCFS",
    1: "SJF",
    2: "SRTF",
    3: "Priority",
    4: "Round Robin",
    5: "LJF",
    6: "LRTF",
    7: "MLFQ",
}

PREEMPTIVE = {2, 4, 6, 7}   # SRTF, Round Robin, LRTF, MLFQ

STATE_NAMES = {0: "NEW", 1: "READY", 2: "RUNNING", 3: "TERMINATED"}

# MLFQ queue quantums (Queue 0, Queue 1, Queue 2)
MLFQ_QUANTUMS = [4, 8, None]  # None = FCFS on lowest queue


# =================== TICK-BASED SCHEDULER (for frontend) ===================
# Selector functions decide which ready process runs next on each tick.

def _select_fcfs(ready_queue, processes, **kwargs):
    if not ready_queue: return -1
    return ready_queue[0]

def _select_sjf(ready_queue, processes, **kwargs):
    if not ready_queue: return -1
    return min(ready_queue, key=lambda pid: processes[pid]["burst_time"])

def _select_srtf(ready_queue, processes, **kwargs):
    if not ready_queue: return -1
    return min(ready_queue, key=lambda pid: processes[pid]["remaining_time"])

def _select_priority(ready_queue, processes, **kwargs):
    if not ready_queue: return -1
    return min(ready_queue, key=lambda pid: processes[pid]["priority"])

def _select_round_robin(ready_queue, processes, **kwargs):
    if not ready_queue: return -1
    return ready_queue[0]

def _select_ljf(ready_queue, processes, **kwargs):
    if not ready_queue: return -1
    return max(ready_queue, key=lambda pid: processes[pid]["burst_time"])

def _select_lrtf(ready_queue, processes, **kwargs):
    if not ready_queue: return -1
    return max(ready_queue, key=lambda pid: processes[pid]["remaining_time"])

def _select_mlfq(ready_queue, processes, mlfq_queues=None, **kwargs):
    """Pick the highest-priority non-empty MLFQ sub-queue's front process."""
    if mlfq_queues is None: return -1
    for q in mlfq_queues:
        if q:
            pid = q[0]
            if pid in ready_queue:
                return pid
    return -1

_ALGORITHM_FN = {
    0: _select_fcfs,
    1: _select_sjf,
    2: _select_srtf,
    3: _select_priority,
    4: _select_round_robin,
    5: _select_ljf,
    6: _select_lrtf,
    7: _select_mlfq,
}


def _make_process(pid, arrival, burst, priority):
    return {
        "pid": pid,
        "arrival_time": arrival,
        "burst_time": burst,
        "priority": priority,
        "remaining_time": burst,
        "start_time": -1,
        "finish_time": -1,
        "wait_time": 0,
        "response_time": -1,
        "turnaround_time": 0,
        "state": 0,  # 0=NEW, 1=READY, 2=RUNNING, 3=TERMINATED
        # MLFQ extras
        "mlfq_queue": 0,          # which MLFQ sub-queue the process is in
        "mlfq_quantum_used": 0,   # how many ticks used in current quantum slice
    }


class Scheduler:
    def __init__(self):
        self.processes = []
        self.ready_queue = []   # flat list of pids (for non-MLFQ algos)
        self.gantt = []
        self.current_time = 0
        self.running_pid = -1
        self.is_completed = False
        self.algorithm = 0
        self.time_quantum = 2
        self.quantum_remaining = 0
        self.metrics = {}

        # MLFQ-specific state: 3 sub-queues
        self.mlfq_queues = [[], [], []]

    def reset(self):
        self.current_time = 0
        self.running_pid = -1
        self.quantum_remaining = 0
        self.is_completed = False
        self.ready_queue = []
        self.gantt = []
        self.metrics = {}
        self.mlfq_queues = [[], [], []]
        for p in self.processes:
            p["remaining_time"] = p["burst_time"]
            p["start_time"] = -1
            p["finish_time"] = -1
            p["wait_time"] = 0
            p["response_time"] = -1
            p["turnaround_time"] = 0
            p["state"] = 0
            p["mlfq_queue"] = 0
            p["mlfq_quantum_used"] = 0

    def set_algorithm(self, algo):
        self.algorithm = algo

    def set_time_quantum(self, quantum):
        self.time_quantum = max(quantum, 1)

    def add_process(self, arrival, burst, priority=0):
        # Snap past arrival times to current time for dynamic additions
        if arrival < self.current_time:
            arrival = self.current_time

        pid = len(self.processes)
        self.processes.append(_make_process(pid, arrival, burst, priority))

        # If simulation was previously completed, allow resumption
        if self.is_completed:
            self.is_completed = False

        return pid

    def clear_processes(self):
        self.__init__()

    # ── One simulation tick ──

    def step(self):
        if self.is_completed:
            return False

        select_fn = _ALGORITHM_FN.get(self.algorithm, _select_fcfs)

        # ── 1. Admit newly arrived processes (NEW -> READY) ──
        for p in self.processes:
            if p["state"] == 0 and p["arrival_time"] <= self.current_time:
                p["state"] = 1
                if self.algorithm == 7:  # MLFQ: enter sub-queue 0, NOT flat ready_queue
                    p["mlfq_queue"] = 0
                    p["mlfq_quantum_used"] = 0
                    self.mlfq_queues[0].append(p["pid"])
                else:
                    self.ready_queue.append(p["pid"])

        # ── 2. Handle preemption ──
        if self.running_pid != -1:
            running = self.processes[self.running_pid]

            if self.algorithm == 7:  # MLFQ preemption
                q = running["mlfq_queue"]
                quantum = MLFQ_QUANTUMS[q]
                # Check if a higher-priority queue got a new arrival
                higher = any(self.mlfq_queues[qidx] for qidx in range(q))
                if higher:
                    # Preempt — put back at front of same MLFQ sub-queue
                    running["state"] = 1
                    self.mlfq_queues[q].insert(0, self.running_pid)
                    running["mlfq_quantum_used"] = 0  # reset slice
                    self.running_pid = -1
                elif quantum is not None and running["mlfq_quantum_used"] >= quantum:
                    # Quantum expired — demote
                    running["state"] = 1
                    next_q = min(q + 1, 2)
                    running["mlfq_queue"] = next_q
                    running["mlfq_quantum_used"] = 0
                    self.mlfq_queues[next_q].append(self.running_pid)
                    self.running_pid = -1

            elif self.algorithm == 4:  # Round Robin
                if self.quantum_remaining <= 0:
                    running["state"] = 1
                    self.ready_queue.append(self.running_pid)
                    self.running_pid = -1

            elif self.algorithm in PREEMPTIVE:  # SRTF / LRTF
                next_pid = select_fn(self.ready_queue, self.processes)
                if next_pid != -1 and next_pid != self.running_pid:
                    nxt = self.processes[next_pid]
                    should_preempt = False
                    if self.algorithm == 2:   # SRTF
                        should_preempt = nxt["remaining_time"] < running["remaining_time"]
                    elif self.algorithm == 6: # LRTF
                        should_preempt = nxt["remaining_time"] > running["remaining_time"]
                    if should_preempt:
                        running["state"] = 1
                        self.ready_queue.append(self.running_pid)
                        self.running_pid = -1

        # ── 3. Pick next process if CPU is idle ──
        if self.running_pid == -1:
            if self.algorithm == 7:
                # Pick front of highest-priority non-empty sub-queue
                next_pid = -1
                chosen_q = -1
                for qi, q in enumerate(self.mlfq_queues):
                    if q:
                        next_pid = q[0]
                        chosen_q = qi
                        break
                if next_pid != -1:
                    self.mlfq_queues[chosen_q].pop(0)
            else:
                next_pid = select_fn(self.ready_queue, self.processes)

            if next_pid != -1:
                if self.algorithm != 7:
                    self.ready_queue.remove(next_pid)
                self.running_pid = next_pid
                p = self.processes[next_pid]
                p["state"] = 2
                if p["start_time"] == -1:
                    p["start_time"] = self.current_time
                    p["response_time"] = self.current_time - p["arrival_time"]
                if self.algorithm == 4:   # RR
                    self.quantum_remaining = self.time_quantum
                if self.algorithm == 7:   # MLFQ: reset quantum counter
                    p["mlfq_quantum_used"] = 0

        # ── 4. Execute one time unit ──
        if self.running_pid != -1:
            p = self.processes[self.running_pid]
            p["remaining_time"] -= 1
            if self.algorithm == 4:
                self.quantum_remaining -= 1
            if self.algorithm == 7:
                p["mlfq_quantum_used"] += 1
            self._add_gantt(self.running_pid, self.current_time, self.current_time + 1)
            if p["remaining_time"] <= 0:
                p["state"] = 3
                p["finish_time"] = self.current_time + 1
                p["turnaround_time"] = p["finish_time"] - p["arrival_time"]
                p["wait_time"] = p["turnaround_time"] - p["burst_time"]
                self.running_pid = -1
        else:
            self._add_gantt(-1, self.current_time, self.current_time + 1)

        # ── 5. Increment waiting time for ready processes ──
        if self.algorithm == 7:
            # For MLFQ: processes in any sub-queue are waiting
            for q in self.mlfq_queues:
                for pid in q:
                    self.processes[pid]["wait_time"] += 1
        else:
            for pid in self.ready_queue:
                self.processes[pid]["wait_time"] += 1

        # ── 6. Advance clock ──
        self.current_time += 1

        # ── 7. Check completion ──
        if self.processes and all(p["state"] == 3 for p in self.processes):
            self.is_completed = True
            self._calculate_metrics()

        return not self.is_completed

    def run_to_completion(self):
        while not self.is_completed and self.current_time < 10000:
            self.step()

    # ── Gantt chart helper ──

    def _add_gantt(self, pid, start, end):
        if self.gantt:
            last = self.gantt[-1]
            if last["pid"] == pid and last["endTime"] == start:
                last["endTime"] = end
                return
        self.gantt.append({"pid": pid, "startTime": start, "endTime": end, "coreId": 0})

    # ── Metrics ──

    def _calculate_metrics(self):
        if not self.processes:
            return
        n = len(self.processes)
        total_wait = sum(p["wait_time"] for p in self.processes)
        total_tat = sum(p["turnaround_time"] for p in self.processes)
        total_resp = sum(p["response_time"] for p in self.processes)
        total_burst = sum(p["burst_time"] for p in self.processes)
        max_finish = max(p["finish_time"] for p in self.processes)
        min_arrival = min(p["arrival_time"] for p in self.processes)
        total_time = max_finish - min_arrival
        self.metrics = {
            "avgWaitTime": round(total_wait / n, 2),
            "avgTurnaroundTime": round(total_tat / n, 2),
            "avgResponseTime": round(total_resp / n, 2),
            "cpuUtilization": round((total_burst / total_time) * 100, 2) if total_time > 0 else 0,
            "throughput": round(n / total_time, 4) if total_time > 0 else 0,
            "totalIdleTime": total_time - total_burst,
            "totalExecutionTime": total_time,
        }

    # ── Get full state as a dict (for the API) ──

    def get_state(self):
        return {
            "currentTime": self.current_time,
            "runningPid": self.running_pid,
            "isCompleted": self.is_completed,
            "algorithm": self.algorithm,
            "timeQuantum": self.time_quantum,
            "processes": [
                {
                    "pid": p["pid"],
                    "arrivalTime": p["arrival_time"],
                    "burstTime": p["burst_time"],
                    "priority": p["priority"],
                    "remainingTime": p["remaining_time"],
                    "startTime": p["start_time"],
                    "finishTime": p["finish_time"],
                    "waitTime": p["wait_time"],
                    "responseTime": p["response_time"],
                    "turnaroundTime": p["turnaround_time"],
                    "state": p["state"],
                    "stateName": STATE_NAMES.get(p["state"], "UNKNOWN"),
                    "mlfqQueue": p.get("mlfq_queue", 0),
                }
                for p in self.processes
            ],
            "gantt": list(self.gantt),
            "readyQueue": list(self.ready_queue),
            "metrics": self.metrics or {
                "avgWaitTime": 0,
                "avgTurnaroundTime": 0,
                "avgResponseTime": 0,
                "cpuUtilization": 0,
                "throughput": 0,
                "totalIdleTime": 0,
                "totalExecutionTime": 0,
            },
        }


# ================= Example =================
if __name__ == "__main__":
    import copy

    process_list = [
        {'pid': 'P1', 'at': 0, 'bt': 7, 'priority': 2},
        {'pid': 'P2', 'at': 2, 'bt': 4, 'priority': 1},
        {'pid': 'P3', 'at': 4, 'bt': 1, 'priority': 3},
        {'pid': 'P4', 'at': 5, 'bt': 4, 'priority': 2},
    ]

    fcfs(copy.deepcopy(process_list))
    sjf(copy.deepcopy(process_list))
    srtf(copy.deepcopy(process_list))
    priority_scheduling(copy.deepcopy(process_list))
    round_robin(copy.deepcopy(process_list), quantum=2)
    ljf(copy.deepcopy(process_list))
    lrtf(copy.deepcopy(process_list))
    mlfq(copy.deepcopy(process_list))
