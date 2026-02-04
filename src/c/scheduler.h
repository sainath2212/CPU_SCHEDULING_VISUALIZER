/*
 * CPU Scheduling Visualizer - Scheduler Header
 * Core scheduling engine with support for multiple algorithms
 */

#ifndef SCHEDULER_H
#define SCHEDULER_H

#include "process.h"

/* Maximum limits */
#define MAX_PROCESSES 100
#define MAX_GANTT_ENTRIES 1000
#define MAX_CORES 8

/* Scheduling algorithms */
typedef enum {
  ALGO_FCFS = 0,        /* First Come First Serve */
  ALGO_SJF = 1,         /* Shortest Job First */
  ALGO_SRTF = 2,        /* Shortest Remaining Time First */
  ALGO_PRIORITY = 3,    /* Priority Scheduling */
  ALGO_ROUND_ROBIN = 4, /* Round Robin */
  ALGO_LJF = 5,         /* Longest Job First */
  ALGO_LRTF = 6         /* Longest Remaining Time First */
} Algorithm;

/* Gantt chart entry */
typedef struct {
  int pid;        /* Process ID (-1 for idle) */
  int start_time; /* Start time of this block */
  int end_time;   /* End time of this block */
  int core_id;    /* Core ID (for multi-core) */
} GanttEntry;

/* Ready queue structure */
typedef struct {
  int pids[MAX_PROCESSES]; /* Process IDs in queue */
  int front;               /* Front index */
  int rear;                /* Rear index */
  int size;                /* Current size */
} ReadyQueue;

/* Metrics structure */
typedef struct {
  double avg_wait_time;
  double avg_turnaround_time;
  double avg_response_time;
  double cpu_utilization;
  double throughput;
  int total_idle_time;
  int total_execution_time;
} Metrics;

/* Main scheduler structure */
typedef struct {
  Process processes[MAX_PROCESSES];
  int process_count;

  ReadyQueue ready_queue;

  GanttEntry gantt[MAX_GANTT_ENTRIES];
  int gantt_count;

  int current_time;
  int running_pid;       /* Currently running process (-1 if idle) */
  int time_quantum;      /* For Round Robin */
  int quantum_remaining; /* Remaining quantum for current process */

  Algorithm algorithm;
  int num_cores;
  int running_pids[MAX_CORES]; /* For multi-core */

  int is_completed; /* Simulation complete flag */

  /* Starvation and aging */
  int starvation_threshold;
  int aging_enabled;
  int aging_interval;

  Metrics metrics;
} Scheduler;

/* Scheduler initialization and control */
void scheduler_init(Scheduler *s);
void scheduler_reset(Scheduler *s);
void scheduler_set_algorithm(Scheduler *s, Algorithm algo);
void scheduler_set_time_quantum(Scheduler *s, int quantum);
void scheduler_set_cores(Scheduler *s, int num_cores);

/* Process management */
int scheduler_add_process(Scheduler *s, int arrival_time, int burst_time,
                          int priority);
void scheduler_remove_process(Scheduler *s, int pid);

/* Ready queue operations */
void queue_init(ReadyQueue *q);
void queue_push(ReadyQueue *q, int pid);
int queue_pop(ReadyQueue *q);
int queue_peek(ReadyQueue *q);
int queue_is_empty(ReadyQueue *q);
int queue_size(ReadyQueue *q);
void queue_remove(ReadyQueue *q, int pid);

/* Simulation control */
int scheduler_step(Scheduler *s);
void scheduler_run_to_completion(Scheduler *s);
int scheduler_is_completed(Scheduler *s);

/* Algorithm selection functions */
int select_process_fcfs(Scheduler *s);
int select_process_sjf(Scheduler *s);
int select_process_srtf(Scheduler *s);
int select_process_priority(Scheduler *s);
int select_process_round_robin(Scheduler *s);
int select_process_ljf(Scheduler *s);
int select_process_lrtf(Scheduler *s);

/* Metrics calculation */
void scheduler_calculate_metrics(Scheduler *s);

/* Advanced features */
void scheduler_enable_aging(Scheduler *s, int interval);
void scheduler_disable_aging(Scheduler *s);
void scheduler_check_starvation(Scheduler *s);
void scheduler_apply_aging(Scheduler *s);

/* Utility functions */
Process *scheduler_get_process(Scheduler *s, int pid);
int scheduler_get_process_index(Scheduler *s, int pid);

#endif /* SCHEDULER_H */
