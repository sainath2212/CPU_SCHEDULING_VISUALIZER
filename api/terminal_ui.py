#!/usr/bin/env python3
"""
terminal_ui.py - Terminal-Based CPU Scheduling Visualizer

Colored ASCII simulation in the terminal.

Usage:
    python3 api/terminal_ui.py
    python3 api/terminal_ui.py -a 4 -q 2 -s -r
"""

import argparse
import os
import sys
import time

# So we can import scheduler.py from the same folder
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from scheduler import Scheduler, ALGORITHM_NAMES, STATE_NAMES

# ── Colors ────────────────────────────────────────────────────────────

RESET = "\033[0m"
RED = "\033[0;31m"
GREEN = "\033[0;32m"
YELLOW = "\033[1;33m"
BLUE = "\033[0;34m"
CYAN = "\033[0;36m"
BOLD = "\033[1m"

STATE_COLORS = {0: CYAN, 1: YELLOW, 2: GREEN, 3: RED}


def clear():
    os.system("cls" if os.name == "nt" else "clear")


# ── Display ───────────────────────────────────────────────────────────

def show(s):
    """Display current simulation state."""
    clear()

    # Header
    algo_name = ALGORITHM_NAMES.get(s.algorithm, "FCFS")
    running = f"P{s.running_pid}" if s.running_pid >= 0 else "IDLE"

    print(f"\n{CYAN}╔{'═' * 58}╗{RESET}")
    print(f"{CYAN}║  CPU Scheduling Visualizer  —  {algo_name:<27}║{RESET}")
    print(f"{CYAN}╚{'═' * 58}╝{RESET}")
    print(f"  {BOLD}Time:{RESET} {s.current_time}    {BOLD}Running:{RESET} {running}    {BOLD}Quantum:{RESET} {s.time_quantum}\n")

    # Process table
    print(f"  {BOLD}{'PID':<6}{'Arrival':<9}{'Burst':<8}{'Prio':<7}{'Left':<7}{'Wait':<7}{'State':<12}{RESET}")
    print(f"  {BLUE}{'─' * 56}{RESET}")
    for p in s.processes:
        c = STATE_COLORS.get(p["state"], RESET)
        name = STATE_NAMES.get(p["state"], "?")
        print(f"  {c}P{p['pid']:<5}{p['arrival_time']:<9}{p['burst_time']:<8}"
              f"{p['priority']:<7}{p['remaining_time']:<7}{p['wait_time']:<7}{name:<12}{RESET}")

    # Ready queue
    if s.ready_queue:
        q = " → ".join(f"P{pid}" for pid in s.ready_queue)
    else:
        q = "(empty)"
    print(f"\n  {BOLD}Ready Queue:{RESET} {YELLOW}{q}{RESET}")

    # Gantt chart
    if s.gantt:
        print(f"\n  {BOLD}Gantt Chart:{RESET}")
        top = "  ┌"
        mid = "  │"
        bot = "  └"
        timeline = "  "

        for g in s.gantt:
            w = (g["endTime"] - g["startTime"]) * 3
            label = f"P{g['pid']}" if g["pid"] >= 0 else "--"
            top += "─" * w + "┬"
            mid += f"{label:^{w}}" + "│"
            bot += "─" * w + "┴"
            timeline += f"{g['startTime']:<{w + 1}}"

        top = top[:-1] + "┐"
        bot = bot[:-1] + "┘"
        timeline += str(s.gantt[-1]["endTime"])

        print(top)
        print(mid)
        print(bot)
        print(timeline)

    # Metrics (only when done)
    if s.is_completed and s.metrics:
        m = s.metrics
        print(f"\n  {BLUE}{'─' * 56}{RESET}")
        print(f"  {BOLD}{GREEN}📊 Performance Metrics{RESET}")
        print(f"    Avg Waiting Time    : {m['avgWaitTime']}")
        print(f"    Avg Turnaround Time : {m['avgTurnaroundTime']}")
        print(f"    Avg Response Time   : {m['avgResponseTime']}")
        print(f"    CPU Utilization     : {m['cpuUtilization']}%")
        print(f"    Throughput          : {m['throughput']} proc/unit")

    print()


# ── Interactive input ─────────────────────────────────────────────────

def choose_algorithm():
    print(f"\n  {BOLD}Select Algorithm:{RESET}")
    for num, name in ALGORITHM_NAMES.items():
        print(f"    {num}. {name}")
    while True:
        try:
            choice = int(input(f"\n  {CYAN}Enter choice [0-6]: {RESET}"))
            if 0 <= choice <= 6:
                return choice
        except (ValueError, EOFError):
            pass
        print(f"  {RED}Invalid choice.{RESET}")


def input_processes(s):
    print(f"\n  {BOLD}Enter processes (type 'done' when finished):{RESET}")
    while True:
        try:
            line = input(f"  {CYAN}Arrival Burst Priority (or 'done'): {RESET}").strip()
            if line.lower() == "done":
                break
            parts = line.split()
            if len(parts) < 2:
                print(f"  {RED}Need at least arrival and burst time.{RESET}")
                continue
            arr, burst = int(parts[0]), int(parts[1])
            prio = int(parts[2]) if len(parts) > 2 else 0
            pid = s.add_process(arr, burst, prio)
            print(f"  {GREEN}Added P{pid} (arrival={arr}, burst={burst}, priority={prio}){RESET}")
        except (ValueError, EOFError):
            print(f"  {RED}Invalid input.{RESET}")


# ── Main ──────────────────────────────────────────────────────────────

def main():
    parser = argparse.ArgumentParser(description="CPU Scheduling Visualizer — Terminal Mode")
    parser.add_argument("-a", "--algorithm", type=int, default=None, help="Algorithm (0-6)")
    parser.add_argument("-q", "--quantum", type=int, default=2, help="Time quantum (default: 2)")
    parser.add_argument("-s", "--sample", action="store_true", help="Use sample data")
    parser.add_argument("-r", "--run", action="store_true", help="Auto-run")
    parser.add_argument("-d", "--delay", type=float, default=0.5, help="Delay between ticks (default: 0.5s)")
    args = parser.parse_args()

    s = Scheduler()

    # Pick algorithm
    if args.algorithm is not None:
        s.set_algorithm(max(0, min(6, args.algorithm)))
    else:
        clear()
        s.set_algorithm(choose_algorithm())

    s.set_time_quantum(args.quantum)
    print(f"\n  {GREEN}Algorithm: {ALGORITHM_NAMES[s.algorithm]}{RESET}")

    # Add processes
    if args.sample:
        for arr, burst, prio in [(0, 5, 2), (1, 3, 1), (2, 8, 3), (3, 2, 4), (5, 4, 0)]:
            pid = s.add_process(arr, burst, prio)
            print(f"  {GREEN}Added P{pid} (arrival={arr}, burst={burst}, priority={prio}){RESET}")
    else:
        input_processes(s)

    if not s.processes:
        print(f"\n  {RED}No processes. Exiting.{RESET}")
        sys.exit(1)

    print(f"\n  {BOLD}Simulation starting...{RESET}")
    time.sleep(0.5)

    # Run simulation
    if args.run:
        while not s.is_completed:
            s.step()
            show(s)
            if not s.is_completed:
                time.sleep(args.delay)
    else:
        show(s)
        while not s.is_completed:
            try:
                input(f"  {CYAN}Press Enter for next tick (Ctrl+C to quit)...{RESET}")
            except (KeyboardInterrupt, EOFError):
                print(f"\n  {YELLOW}Aborted.{RESET}")
                sys.exit(0)
            s.step()
            show(s)

    print(f"  {GREEN}{BOLD}✅ Simulation complete!{RESET}\n")


if __name__ == "__main__":
    main()
