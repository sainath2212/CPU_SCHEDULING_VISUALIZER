# -------------------- Priority Scheduling (Non-Preemptive) --------------------

from .utils import print_result


def priority_scheduling(processes):
    completed = []
    time = 0
    procs = processes.copy()
    while procs:
        ready = [p for p in procs if p['at'] <= time]
        if not ready:
            time += 1
            continue
        ready.sort(key=lambda x: x['priority'])  # Lower number = Higher priority
        p = ready[0]
        p['wt'] = time - p['at']
        time += p['bt']
        p['tat'] = p['wt'] + p['bt']
        completed.append(p)
        procs.remove(p)
    print("\nPriority (Non-Preemptive)")
    print_result(completed)
