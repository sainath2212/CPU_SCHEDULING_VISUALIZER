/*
 * CPU Scheduling Visualizer - Process Header
 * Defines the Process structure and state enumeration
 */

#ifndef PROCESS_H
#define PROCESS_H

/* Process states following OS conventions */
typedef enum {
    STATE_NEW = 0,
    STATE_READY = 1,
    STATE_RUNNING = 2,
    STATE_TERMINATED = 3
} ProcessState;

/* Process Control Block (PCB) structure */
typedef struct {
    int pid;                    /* Process ID */
    int arrival_time;           /* Time when process arrives */
    int burst_time;             /* Total CPU time required */
    int priority;               /* Priority value (lower = higher priority) */
    int remaining_time;         /* Remaining burst time */
    int start_time;             /* First time process gets CPU (-1 if not started) */
    int finish_time;            /* Time when process completes */
    int wait_time;              /* Total waiting time */
    int response_time;          /* Time from arrival to first execution */
    int turnaround_time;        /* Time from arrival to completion */
    ProcessState state;         /* Current state of the process */
} Process;

/* Initialize a new process */
void init_process(Process *p, int pid, int arrival_time, int burst_time, int priority);

/* Get string name of process state */
const char* get_state_name(ProcessState state);

#endif /* PROCESS_H */
