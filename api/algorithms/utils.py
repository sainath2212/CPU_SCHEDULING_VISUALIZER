# -------------------- Shared Utility --------------------

def print_result(processes):
    total_wt = total_tat = 0
    print("PID\tAT\tBT\tWT\tTAT")
    for p in processes:
        print(f"{p['pid']}\t{p['at']}\t{p['bt']}\t{p['wt']}\t{p['tat']}")
        total_wt += p['wt']
        total_tat += p['tat']
    n = len(processes)
    print("Average WT:", round(total_wt / n, 2))
    print("Average TAT:", round(total_tat / n, 2))
    print("-" * 50)
