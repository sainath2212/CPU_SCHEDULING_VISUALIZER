# -------------------- SJF (Shortest Job First - Non-Preemptive) --------------------

from .utils import print_result


def sjf(processes):
    completed = []
    time = 0
    procs = processes.copy()
    while procs:
        ready = [p for p in procs if p['at'] <= time]
        if not ready:
            time += 1
            continue
        ready.sort(key=lambda x: x['bt'])
        p = ready[0]
        p['wt'] = time - p['at']
        time += p['bt']
        p['tat'] = p['wt'] + p['bt']
        completed.append(p)
        procs.remove(p)
    print("\nSJF (Non-Preemptive)")
    print_result(completed)
