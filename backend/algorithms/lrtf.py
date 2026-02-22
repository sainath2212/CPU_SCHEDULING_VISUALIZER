# -------------------- LRTF (Longest Remaining Time First - Preemptive LJF) --------------------

from .utils import print_result


def lrtf(processes):
    time = 0
    completed = 0
    n = len(processes)
    remaining = {p['pid']: p['bt'] for p in processes}
    while completed < n:
        ready = [p for p in processes if p['at'] <= time and remaining[p['pid']] > 0]
        if ready:
            ready.sort(key=lambda x: remaining[x['pid']], reverse=True)
            p = ready[0]
            remaining[p['pid']] -= 1
            if remaining[p['pid']] == 0:
                completed += 1
                finish = time + 1
                p['tat'] = finish - p['at']
                p['wt'] = p['tat'] - p['bt']
        time += 1
    print("\nLRTF (Preemptive LJF)")
    print_result(processes)
