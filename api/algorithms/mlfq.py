# -------------------- MLFQ (Multi-Level Feedback Queue) --------------------
#
# Classic 3-level MLFQ:
#   Queue 0 (highest priority) — Round Robin, quantum = 4
#   Queue 1 (medium priority)  — Round Robin, quantum = 8
#   Queue 2 (lowest priority)  — FCFS
#
# A new process enters Queue 0.
# If it uses its full quantum without completing, it is demoted to the next queue.
# A process in a lower queue is preempted if a new process arrives at a higher queue.

from collections import deque
from .utils import print_result


QUEUE_QUANTUMS = [4, 8, None]  # None means FCFS (run to completion)


def mlfq(processes):
    processes = sorted(processes, key=lambda x: x['at'])
    n = len(processes)

    # Per-process tracking
    remaining  = {p['pid']: p['bt'] for p in processes}
    queue_level = {p['pid']: 0 for p in processes}  # which queue each process is in
    entered    = {p['pid']: False for p in processes}  # arrived into system?
    result     = {}  # pid -> {wt, tat}

    queues = [deque(), deque(), deque()]  # 3 queues

    time = 0
    completed = 0
    next_arrive_idx = 0  # index into sorted processes for new arrivals

    def admit_new_arrivals():
        nonlocal next_arrive_idx
        while next_arrive_idx < n and processes[next_arrive_idx]['at'] <= time:
            p = processes[next_arrive_idx]
            if not entered[p['pid']]:
                entered[p['pid']] = True
                queues[0].append(p['pid'])
            next_arrive_idx += 1

    while completed < n:
        admit_new_arrivals()

        # Pick from highest-priority non-empty queue
        current_q = None
        for q_idx in range(3):
            if queues[q_idx]:
                current_q = q_idx
                break

        if current_q is None:
            # CPU idle — jump to next arrival
            if next_arrive_idx < n:
                time = processes[next_arrive_idx]['at']
                admit_new_arrivals()
                current_q = 0 if queues[0] else (1 if queues[1] else 2)
                if not any(queues):
                    break
            else:
                break

        pid = queues[current_q].popleft()
        p = next(pr for pr in processes if pr['pid'] == pid)

        quantum = QUEUE_QUANTUMS[current_q]
        if quantum is None:
            # FCFS — run to completion, preempted by higher-queue arrivals only
            quantum = remaining[pid]

        run_time = 0
        preempted_by_arrival = False

        while run_time < quantum and remaining[pid] > 0:
            time += 1
            run_time += 1
            remaining[pid] -= 1
            admit_new_arrivals()

            # Check if a higher-priority queue became non-empty (preemption)
            if current_q > 0 and any(queues[q] for q in range(current_q)):
                preempted_by_arrival = True
                break

        if remaining[pid] == 0:
            # Process finished
            completed += 1
            tat = time - p['at']
            wt  = tat - p['bt']
            p['tat'] = tat
            p['wt']  = wt
        else:
            # Process not finished — demote or re-queue
            if preempted_by_arrival:
                # Put back in same queue (preempted externally, not by quantum)
                queues[current_q].appendleft(pid)
            else:
                # Used full quantum — demote to lower queue
                next_q = min(current_q + 1, 2)
                queue_level[pid] = next_q
                queues[next_q].append(pid)

    print("\nMLFQ (Multi-Level Feedback Queue)")
    print("Queue quantums:", QUEUE_QUANTUMS)
    print_result(processes)
