/*
 * CPU Scheduling Visualizer - Terminal UI Implementation
 * Provides ASCII-based visualization of CPU scheduling simulation
 */

#include "terminal_ui.h"
#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <unistd.h>

/* ===================== Terminal Control ===================== */

void terminal_clear(void) {
    printf("\033[2J\033[H");
    fflush(stdout);
}

void terminal_set_cursor(int row, int col) {
    printf("\033[%d;%dH", row, col);
    fflush(stdout);
}

void terminal_hide_cursor(void) {
    printf("\033[?25l");
    fflush(stdout);
}

void terminal_show_cursor(void) {
    printf("\033[?25h");
    fflush(stdout);
}

void terminal_sleep_ms(int milliseconds) {
    usleep(milliseconds * 1000);
}

/* ===================== Display Utilities ===================== */

const char* terminal_get_state_color(ProcessState state) {
    switch (state) {
        case STATE_NEW:        return COLOR_BLUE;
        case STATE_READY:      return COLOR_YELLOW;
        case STATE_RUNNING:    return COLOR_GREEN;
        case STATE_TERMINATED: return COLOR_RED;
        default:               return COLOR_RESET;
    }
}

void terminal_print_separator(void) {
    printf("╠════════════════════════════════════════════════════════════════════╣\n");
}

void print_box_top(void) {
    printf("╔════════════════════════════════════════════════════════════════════╗\n");
}

void print_box_bottom(void) {
    printf("╚════════════════════════════════════════════════════════════════════╝\n");
}

void terminal_print_algorithm_name(Algorithm algo) {
    const char *names[] = {
        "First Come First Serve (FCFS)",
        "Shortest Job First (SJF)",
        "Shortest Remaining Time First (SRTF)",
        "Priority Scheduling",
        "Round Robin (RR)",
        "Longest Job First (LJF)",
        "Longest Remaining Time First (LRTF)"
    };
    
    if (algo >= 0 && algo <= 6) {
        printf("%s", names[algo]);
    } else {
        printf("Unknown");
    }
}

/* ===================== Main Display Functions ===================== */

void terminal_print_header(Scheduler *s) {
    print_box_top();
    printf("║%s%s            CPU SCHEDULING VISUALIZER               %s║\n",
           COLOR_BOLD, COLOR_CYAN, COLOR_RESET);
    terminal_print_separator();
    printf("║  Algorithm: %s%-40s%s       ║\n", 
           COLOR_MAGENTA, "", COLOR_RESET);
    terminal_set_cursor(4, 14);
    terminal_print_algorithm_name(s->algorithm);
    printf("\n");
    
    if (s->algorithm == ALGO_ROUND_ROBIN) {
        printf("║  Time Quantum: %s%-3d%s                                            ║\n",
               COLOR_YELLOW, s->time_quantum, COLOR_RESET);
    }
    printf("║  Processes: %s%-3d%s    │    Current Time: %s%-5d%s                  ║\n",
           COLOR_CYAN, s->process_count, COLOR_RESET,
           COLOR_GREEN, s->current_time, COLOR_RESET);
    terminal_print_separator();
}

void terminal_print_processes_table(Scheduler *s) {
    printf("║%s PROCESS TABLE %s                                                   ║\n",
           COLOR_BOLD, COLOR_RESET);
    printf("║ ┌────┬─────────┬───────┬──────┬───────────┬──────────────────────┐ ║\n");
    printf("║ │%sPID%s│%sArrival%s │%sBurst%s │%sPrio%s │%sRemaining%s │%s       State        %s│ ║\n",
           COLOR_BOLD, COLOR_RESET,
           COLOR_BOLD, COLOR_RESET,
           COLOR_BOLD, COLOR_RESET,
           COLOR_BOLD, COLOR_RESET,
           COLOR_BOLD, COLOR_RESET,
           COLOR_BOLD, COLOR_RESET);
    printf("║ ├────┼─────────┼───────┼──────┼───────────┼──────────────────────┤ ║\n");
    
    for (int i = 0; i < s->process_count; i++) {
        Process *p = &s->processes[i];
        const char *color = terminal_get_state_color(p->state);
        const char *state_name = get_state_name(p->state);
        
        printf("║ │ %2d │   %3d   │  %3d  │  %2d  │    %3d    │%s %-20s %s│ ║\n",
               p->pid,
               p->arrival_time,
               p->burst_time,
               p->priority,
               p->remaining_time,
               color, state_name, COLOR_RESET);
    }
    
    printf("║ └────┴─────────┴───────┴──────┴───────────┴──────────────────────┘ ║\n");
}

void terminal_print_ready_queue(Scheduler *s) {
    printf("║%s READY QUEUE:%s ", COLOR_BOLD, COLOR_RESET);
    
    if (queue_is_empty(&s->ready_queue)) {
        printf("%s[empty]%s", COLOR_YELLOW, COLOR_RESET);
    } else {
        printf("[");
        for (int i = 0; i < s->ready_queue.size; i++) {
            int idx = (s->ready_queue.front + i) % MAX_PROCESSES;
            printf("%sP%d%s", COLOR_YELLOW, s->ready_queue.pids[idx], COLOR_RESET);
            if (i < s->ready_queue.size - 1) printf(" → ");
        }
        printf("]");
    }
    
    /* Pad to fixed width */
    int padding = 50 - (s->ready_queue.size * 5);
    for (int i = 0; i < padding && i < 50; i++) printf(" ");
    printf("║\n");
}

void terminal_print_running_process(Scheduler *s) {
    printf("║%s RUNNING:%s ", COLOR_BOLD, COLOR_RESET);
    
    if (s->running_pid == -1) {
        printf("%s[CPU IDLE]%s", COLOR_RED, COLOR_RESET);
        printf("                                                  ║\n");
    } else {
        Process *p = scheduler_get_process(s, s->running_pid);
        printf("%sP%d%s (Burst: %d, Remaining: %d)",
               COLOR_GREEN, s->running_pid, COLOR_RESET,
               p->burst_time, p->remaining_time);
        
        if (s->algorithm == ALGO_ROUND_ROBIN) {
            printf(" [Quantum: %d]", s->quantum_remaining);
        }
        printf("                    ║\n");
    }
}

void terminal_print_gantt_chart(Scheduler *s) {
    printf("║%s GANTT CHART:%s                                                      ║\n",
           COLOR_BOLD, COLOR_RESET);
    printf("║ ");
    
    /* Print time markers */
    int display_count = s->gantt_count;
    if (display_count > 50) display_count = 50;  /* Limit display width */
    
    int start_idx = (s->gantt_count > 50) ? s->gantt_count - 50 : 0;
    
    for (int i = start_idx; i < s->gantt_count; i++) {
        GanttEntry *e = &s->gantt[i];
        if (e->pid == -1) {
            printf("%s░%s", COLOR_RED, COLOR_RESET);
        } else {
            /* Use different colors for different PIDs */
            const char *colors[] = {COLOR_GREEN, COLOR_CYAN, COLOR_MAGENTA, 
                                    COLOR_YELLOW, COLOR_BLUE, COLOR_WHITE};
            printf("%s█%s", colors[e->pid % 6], COLOR_RESET);
        }
    }
    
    /* Pad remaining space */
    for (int i = display_count; i < 60; i++) printf(" ");
    printf("      ║\n");
    
    /* Print legend */
    printf("║ ");
    for (int i = 0; i < s->process_count && i < 8; i++) {
        const char *colors[] = {COLOR_GREEN, COLOR_CYAN, COLOR_MAGENTA, 
                                COLOR_YELLOW, COLOR_BLUE, COLOR_WHITE};
        printf("%s█%s=P%d ", colors[i % 6], COLOR_RESET, i);
    }
    printf("%s░%s=Idle", COLOR_RED, COLOR_RESET);
    printf("                                            ║\n");
}

void terminal_print_tick(Scheduler *s) {
    terminal_clear();
    terminal_print_header(s);
    terminal_print_processes_table(s);
    terminal_print_separator();
    terminal_print_ready_queue(s);
    terminal_print_running_process(s);
    terminal_print_separator();
    terminal_print_gantt_chart(s);
    print_box_bottom();
    fflush(stdout);
}

void terminal_print_metrics(Scheduler *s) {
    print_box_top();
    printf("║%s%s              SIMULATION COMPLETE - METRICS                 %s║\n",
           COLOR_BOLD, COLOR_GREEN, COLOR_RESET);
    terminal_print_separator();
    
    printf("║  ┌────────────────────────────┬──────────────────────────────┐   ║\n");
    printf("║  │ %sAvg Waiting Time%s           │  %8.2f time units         │   ║\n",
           COLOR_BOLD, COLOR_RESET, s->metrics.avg_wait_time);
    printf("║  ├────────────────────────────┼──────────────────────────────┤   ║\n");
    printf("║  │ %sAvg Turnaround Time%s        │  %8.2f time units         │   ║\n",
           COLOR_BOLD, COLOR_RESET, s->metrics.avg_turnaround_time);
    printf("║  ├────────────────────────────┼──────────────────────────────┤   ║\n");
    printf("║  │ %sAvg Response Time%s          │  %8.2f time units         │   ║\n",
           COLOR_BOLD, COLOR_RESET, s->metrics.avg_response_time);
    printf("║  ├────────────────────────────┼──────────────────────────────┤   ║\n");
    printf("║  │ %sCPU Utilization%s            │  %8.2f %%                  │   ║\n",
           COLOR_BOLD, COLOR_RESET, s->metrics.cpu_utilization);
    printf("║  ├────────────────────────────┼──────────────────────────────┤   ║\n");
    printf("║  │ %sThroughput%s                 │  %8.4f proc/unit          │   ║\n",
           COLOR_BOLD, COLOR_RESET, s->metrics.throughput);
    printf("║  ├────────────────────────────┼──────────────────────────────┤   ║\n");
    printf("║  │ %sTotal Execution Time%s       │  %8d time units         │   ║\n",
           COLOR_BOLD, COLOR_RESET, s->metrics.total_execution_time);
    printf("║  ├────────────────────────────┼──────────────────────────────┤   ║\n");
    printf("║  │ %sTotal Idle Time%s            │  %8d time units         │   ║\n",
           COLOR_BOLD, COLOR_RESET, s->metrics.total_idle_time);
    printf("║  └────────────────────────────┴──────────────────────────────┘   ║\n");
    
    terminal_print_separator();
    
    /* Per-process metrics */
    printf("║%s PER-PROCESS METRICS:%s                                            ║\n",
           COLOR_BOLD, COLOR_RESET);
    printf("║  ┌─────┬──────────┬────────────┬────────────┬───────────────────┐ ║\n");
    printf("║  │%sPID%s │%s Wait %s   │%s Turnaround%s│%s Response %s │%s Finish Time %s    │ ║\n",
           COLOR_BOLD, COLOR_RESET,
           COLOR_BOLD, COLOR_RESET,
           COLOR_BOLD, COLOR_RESET,
           COLOR_BOLD, COLOR_RESET,
           COLOR_BOLD, COLOR_RESET);
    printf("║  ├─────┼──────────┼────────────┼────────────┼───────────────────┤ ║\n");
    
    for (int i = 0; i < s->process_count; i++) {
        Process *p = &s->processes[i];
        printf("║  │ %3d │  %5d   │    %5d   │    %5d   │       %5d       │ ║\n",
               p->pid, p->wait_time, p->turnaround_time, p->response_time, p->finish_time);
    }
    
    printf("║  └─────┴──────────┴────────────┴────────────┴───────────────────┘ ║\n");
    print_box_bottom();
}

void terminal_print_simulation_state(Scheduler *s) {
    terminal_print_tick(s);
}
