# -------------------- FCFS (First Come First Serve) --------------------

from .utils import print_result


def fcfs(processes):
    processes.sort(key=lambda x: x['at'])
    time = 0
    for p in processes:
        if time < p['at']:
            time = p['at']
        p['wt'] = time - p['at']
        time += p['bt']
        p['tat'] = p['wt'] + p['bt']
    print("\nFCFS")
    print_result(processes)
