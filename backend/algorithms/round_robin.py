# -------------------- Round Robin --------------------

from collections import deque
from .utils import print_result


def round_robin(processes, quantum):
    time = 0
    queue = deque()
    remaining = {p['pid']: p['bt'] for p in processes}
    processes.sort(key=lambda x: x['at'])
    i = 0
    n = len(processes)
    completed = 0

    while completed < n:
        while i < n and processes[i]['at'] <= time:
            queue.append(processes[i])
            i += 1

        if queue:
            p = queue.popleft()
            exec_time = min(quantum, remaining[p['pid']])
            remaining[p['pid']] -= exec_time
            time += exec_time

            while i < n and processes[i]['at'] <= time:
                queue.append(processes[i])
                i += 1

            if remaining[p['pid']] > 0:
                queue.append(p)
            else:
                completed += 1
                p['tat'] = time - p['at']
                p['wt'] = p['tat'] - p['bt']
        else:
            time += 1

    print("\nRound Robin (Quantum =", quantum, ")")
    print_result(processes)
