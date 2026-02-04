/*
 * CPU Scheduling Visualizer - Core Scheduler Implementation
 * Implements the scheduling engine with support for all algorithms
 */

#include "scheduler.h"
#include <stdio.h>
#include <string.h>

/* ===================== Queue Operations ===================== */

void queue_init(ReadyQueue *q) {
  q->front = 0;
  q->rear = -1;
  q->size = 0;
  memset(q->pids, -1, sizeof(q->pids));
}

void queue_push(ReadyQueue *q, int pid) {
  if (q->size >= MAX_PROCESSES)
    return;
  q->rear = (q->rear + 1) % MAX_PROCESSES;
  q->pids[q->rear] = pid;
  q->size++;
}

int queue_pop(ReadyQueue *q) {
  if (q->size == 0)
    return -1;
  int pid = q->pids[q->front];
  q->front = (q->front + 1) % MAX_PROCESSES;
  q->size--;
  return pid;
}

int queue_peek(ReadyQueue *q) {
  if (q->size == 0)
    return -1;
  return q->pids[q->front];
}

int queue_is_empty(ReadyQueue *q) { return q->size == 0; }

int queue_size(ReadyQueue *q) { return q->size; }

void queue_remove(ReadyQueue *q, int pid) {
  /* Remove a specific PID from queue (for preemption) */
  int new_pids[MAX_PROCESSES];
  int new_size = 0;

  for (int i = 0; i < q->size; i++) {
    int idx = (q->front + i) % MAX_PROCESSES;
    if (q->pids[idx] != pid) {
      new_pids[new_size++] = q->pids[idx];
    }
  }

  /* Rebuild queue */
  queue_init(q);
  for (int i = 0; i < new_size; i++) {
    queue_push(q, new_pids[i]);
  }
}

/* ===================== Scheduler Core ===================== */

void scheduler_init(Scheduler *s) {
  s->process_count = 0;
  s->current_time = 0;
  s->running_pid = -1;
  s->time_quantum = 2;
  s->quantum_remaining = 0;
  s->algorithm = ALGO_FCFS;
  s->num_cores = 1;
  s->is_completed = 0;
  s->gantt_count = 0;
  s->starvation_threshold = 10;
  s->aging_enabled = 0;
  s->aging_interval = 5;

  queue_init(&s->ready_queue);

  for (int i = 0; i < MAX_CORES; i++) {
    s->running_pids[i] = -1;
  }

  memset(&s->metrics, 0, sizeof(Metrics));
}

void scheduler_reset(Scheduler *s) {
  /* Reset simulation state but keep processes */
  s->current_time = 0;
  s->running_pid = -1;
  s->quantum_remaining = 0;
  s->is_completed = 0;
  s->gantt_count = 0;

  queue_init(&s->ready_queue);

  for (int i = 0; i < MAX_CORES; i++) {
    s->running_pids[i] = -1;
  }

  /* Reset process states */
  for (int i = 0; i < s->process_count; i++) {
    s->processes[i].remaining_time = s->processes[i].burst_time;
    s->processes[i].start_time = -1;
    s->processes[i].finish_time = -1;
    s->processes[i].wait_time = 0;
    s->processes[i].response_time = -1;
    s->processes[i].turnaround_time = 0;
    s->processes[i].state = STATE_NEW;
  }

  memset(&s->metrics, 0, sizeof(Metrics));
}

void scheduler_set_algorithm(Scheduler *s, Algorithm algo) {
  s->algorithm = algo;
}

void scheduler_set_time_quantum(Scheduler *s, int quantum) {
  s->time_quantum = quantum > 0 ? quantum : 1;
}

void scheduler_set_cores(Scheduler *s, int num_cores) {
  s->num_cores = (num_cores > 0 && num_cores <= MAX_CORES) ? num_cores : 1;
}

/* ===================== Process Management ===================== */

int scheduler_add_process(Scheduler *s, int arrival_time, int burst_time,
                          int priority) {
  if (s->process_count >= MAX_PROCESSES)
    return -1;

  int pid = s->process_count;
  init_process(&s->processes[pid], pid, arrival_time, burst_time, priority);
  s->process_count++;

  return pid;
}

Process *scheduler_get_process(Scheduler *s, int pid) {
  if (pid < 0 || pid >= s->process_count)
    return NULL;
  return &s->processes[pid];
}

int scheduler_get_process_index(Scheduler *s, int pid) {
  for (int i = 0; i < s->process_count; i++) {
    if (s->processes[i].pid == pid)
      return i;
  }
  return -1;
}

/* ===================== Algorithm Selection ===================== */

int select_process_fcfs(Scheduler *s) {
  /* FCFS: Select process that arrived first (front of queue) */
  if (queue_is_empty(&s->ready_queue))
    return -1;
  return queue_peek(&s->ready_queue);
}

int select_process_sjf(Scheduler *s) {
  /* SJF: Select process with smallest burst time */
  if (queue_is_empty(&s->ready_queue))
    return -1;

  int selected_pid = -1;
  int min_burst = 999999;

  for (int i = 0; i < s->ready_queue.size; i++) {
    int idx = (s->ready_queue.front + i) % MAX_PROCESSES;
    int pid = s->ready_queue.pids[idx];
    Process *p = scheduler_get_process(s, pid);

    if (p && p->burst_time < min_burst) {
      min_burst = p->burst_time;
      selected_pid = pid;
    }
  }

  return selected_pid;
}

int select_process_srtf(Scheduler *s) {
  /* SRTF: Select process with smallest remaining time (preemptive) */
  if (queue_is_empty(&s->ready_queue))
    return -1;

  int selected_pid = -1;
  int min_remaining = 999999;

  for (int i = 0; i < s->ready_queue.size; i++) {
    int idx = (s->ready_queue.front + i) % MAX_PROCESSES;
    int pid = s->ready_queue.pids[idx];
    Process *p = scheduler_get_process(s, pid);

    if (p && p->remaining_time < min_remaining) {
      min_remaining = p->remaining_time;
      selected_pid = pid;
    }
  }

  return selected_pid;
}

int select_process_priority(Scheduler *s) {
  /* Priority: Select process with highest priority (lowest number) */
  if (queue_is_empty(&s->ready_queue))
    return -1;

  int selected_pid = -1;
  int highest_priority = 999999;

  for (int i = 0; i < s->ready_queue.size; i++) {
    int idx = (s->ready_queue.front + i) % MAX_PROCESSES;
    int pid = s->ready_queue.pids[idx];
    Process *p = scheduler_get_process(s, pid);

    if (p && p->priority < highest_priority) {
      highest_priority = p->priority;
      selected_pid = pid;
    }
  }

  return selected_pid;
}

int select_process_round_robin(Scheduler *s) {
  /* Round Robin: Take from front of queue */
  if (queue_is_empty(&s->ready_queue))
    return -1;
  return queue_peek(&s->ready_queue);
}

int select_process_ljf(Scheduler *s) {
  /* LJF: Select process with largest burst time */
  if (queue_is_empty(&s->ready_queue))
    return -1;

  int selected_pid = -1;
  int max_burst = -1;

  for (int i = 0; i < s->ready_queue.size; i++) {
    int idx = (s->ready_queue.front + i) % MAX_PROCESSES;
    int pid = s->ready_queue.pids[idx];
    Process *p = scheduler_get_process(s, pid);

    if (p && p->burst_time > max_burst) {
      max_burst = p->burst_time;
      selected_pid = pid;
    }
  }

  return selected_pid;
}

int select_process_lrtf(Scheduler *s) {
  /* LRTF: Select process with largest remaining time (preemptive) */
  if (queue_is_empty(&s->ready_queue))
    return -1;

  int selected_pid = -1;
  int max_remaining = -1;

  for (int i = 0; i < s->ready_queue.size; i++) {
    int idx = (s->ready_queue.front + i) % MAX_PROCESSES;
    int pid = s->ready_queue.pids[idx];
    Process *p = scheduler_get_process(s, pid);

    if (p && p->remaining_time > max_remaining) {
      max_remaining = p->remaining_time;
      selected_pid = pid;
    }
  }

  return selected_pid;
}

/* Select process based on current algorithm */
static int select_next_process(Scheduler *s) {
  switch (s->algorithm) {
  case ALGO_FCFS:
    return select_process_fcfs(s);
  case ALGO_SJF:
    return select_process_sjf(s);
  case ALGO_SRTF:
    return select_process_srtf(s);
  case ALGO_PRIORITY:
    return select_process_priority(s);
  case ALGO_ROUND_ROBIN:
    return select_process_round_robin(s);
  case ALGO_LJF:
    return select_process_ljf(s);
  case ALGO_LRTF:
    return select_process_lrtf(s);
  default:
    return select_process_fcfs(s);
  }
}

/* Check if algorithm is preemptive */
static int is_preemptive(Algorithm algo) {
  return (algo == ALGO_SRTF || algo == ALGO_LRTF || algo == ALGO_ROUND_ROBIN);
}

/* ===================== Gantt Chart ===================== */

static void add_gantt_entry(Scheduler *s, int pid, int start, int end,
                            int core_id) {
  if (s->gantt_count >= MAX_GANTT_ENTRIES)
    return;

  /* Try to merge with previous entry if same process */
  if (s->gantt_count > 0) {
    GanttEntry *last = &s->gantt[s->gantt_count - 1];
    if (last->pid == pid && last->end_time == start &&
        last->core_id == core_id) {
      last->end_time = end;
      return;
    }
  }

  GanttEntry *entry = &s->gantt[s->gantt_count++];
  entry->pid = pid;
  entry->start_time = start;
  entry->end_time = end;
  entry->core_id = core_id;
}

/* ===================== Simulation Step ===================== */

int scheduler_step(Scheduler *s) {
  if (s->is_completed)
    return 0;

  /* Step 1: Check for newly arrived processes (NEW -> READY) */
  for (int i = 0; i < s->process_count; i++) {
    Process *p = &s->processes[i];
    if (p->state == STATE_NEW && p->arrival_time <= s->current_time) {
      p->state = STATE_READY;
      queue_push(&s->ready_queue, p->pid);
    }
  }

  /* Step 2: Apply aging if enabled */
  if (s->aging_enabled && s->current_time > 0 &&
      s->current_time % s->aging_interval == 0) {
    scheduler_apply_aging(s);
  }

  /* Step 3: Handle preemption for preemptive algorithms */
  if (is_preemptive(s->algorithm) && s->running_pid != -1) {
    Process *running = scheduler_get_process(s, s->running_pid);

    if (s->algorithm == ALGO_ROUND_ROBIN) {
      /* Check quantum expiry */
      if (s->quantum_remaining <= 0) {
        /* Preempt: move running process back to ready queue */
        running->state = STATE_READY;
        queue_push(&s->ready_queue, s->running_pid);
        s->running_pid = -1;
      }
    } else {
      /* SRTF or LRTF: check if better process available */
      int next_pid = select_next_process(s);
      if (next_pid != -1 && next_pid != s->running_pid) {
        Process *next = scheduler_get_process(s, next_pid);
        int should_preempt = 0;

        if (s->algorithm == ALGO_SRTF) {
          should_preempt = next->remaining_time < running->remaining_time;
        } else if (s->algorithm == ALGO_LRTF) {
          should_preempt = next->remaining_time > running->remaining_time;
        }

        if (should_preempt) {
          running->state = STATE_READY;
          queue_push(&s->ready_queue, s->running_pid);
          s->running_pid = -1;
        }
      }
    }
  }

  /* Step 4: Select next process if CPU is idle */
  if (s->running_pid == -1) {
    int next_pid = select_next_process(s);

    if (next_pid != -1) {
      queue_remove(&s->ready_queue, next_pid);
      s->running_pid = next_pid;

      Process *p = scheduler_get_process(s, next_pid);
      p->state = STATE_RUNNING;

      /* Record first time process gets CPU */
      if (p->start_time == -1) {
        p->start_time = s->current_time;
        p->response_time = s->current_time - p->arrival_time;
      }

      /* Reset quantum for Round Robin */
      if (s->algorithm == ALGO_ROUND_ROBIN) {
        s->quantum_remaining = s->time_quantum;
      }
    }
  }

  /* Step 5: Execute one time unit */
  if (s->running_pid != -1) {
    Process *p = scheduler_get_process(s, s->running_pid);
    p->remaining_time--;

    if (s->algorithm == ALGO_ROUND_ROBIN) {
      s->quantum_remaining--;
    }

    /* Add to Gantt chart */
    add_gantt_entry(s, s->running_pid, s->current_time, s->current_time + 1, 0);

    /* Check if process completed */
    if (p->remaining_time <= 0) {
      p->state = STATE_TERMINATED;
      p->finish_time = s->current_time + 1;
      p->turnaround_time = p->finish_time - p->arrival_time;
      p->wait_time = p->turnaround_time - p->burst_time;
      s->running_pid = -1;
    }
  } else {
    /* CPU idle */
    add_gantt_entry(s, -1, s->current_time, s->current_time + 1, 0);
  }

  /* Step 6: Update waiting time for ready processes */
  for (int i = 0; i < s->ready_queue.size; i++) {
    int idx = (s->ready_queue.front + i) % MAX_PROCESSES;
    int pid = s->ready_queue.pids[idx];
    Process *p = scheduler_get_process(s, pid);
    if (p) {
      p->wait_time++;
    }
  }

  /* Step 7: Advance time */
  s->current_time++;

  /* Step 8: Check if simulation is complete */
  int all_terminated = 1;
  for (int i = 0; i < s->process_count; i++) {
    if (s->processes[i].state != STATE_TERMINATED) {
      all_terminated = 0;
      break;
    }
  }

  if (all_terminated && s->process_count > 0) {
    s->is_completed = 1;
    scheduler_calculate_metrics(s);
  }

  return !s->is_completed;
}

void scheduler_run_to_completion(Scheduler *s) {
  while (!s->is_completed && s->current_time < 10000) {
    scheduler_step(s);
  }
}

int scheduler_is_completed(Scheduler *s) { return s->is_completed; }

/* ===================== Metrics ===================== */

void scheduler_calculate_metrics(Scheduler *s) {
  if (s->process_count == 0)
    return;

  double total_wait = 0;
  double total_turnaround = 0;
  double total_response = 0;
  int total_burst = 0;
  int max_finish = 0;
  int min_arrival = 999999;

  for (int i = 0; i < s->process_count; i++) {
    Process *p = &s->processes[i];
    total_wait += p->wait_time;
    total_turnaround += p->turnaround_time;
    total_response += p->response_time;
    total_burst += p->burst_time;

    if (p->finish_time > max_finish)
      max_finish = p->finish_time;
    if (p->arrival_time < min_arrival)
      min_arrival = p->arrival_time;
  }

  s->metrics.avg_wait_time = total_wait / s->process_count;
  s->metrics.avg_turnaround_time = total_turnaround / s->process_count;
  s->metrics.avg_response_time = total_response / s->process_count;

  int total_time = max_finish - min_arrival;
  s->metrics.total_execution_time = total_time;
  s->metrics.total_idle_time = total_time - total_burst;

  if (total_time > 0) {
    s->metrics.cpu_utilization = (double)total_burst / total_time * 100.0;
    s->metrics.throughput = (double)s->process_count / total_time;
  }
}

/* ===================== Aging ===================== */

void scheduler_enable_aging(Scheduler *s, int interval) {
  s->aging_enabled = 1;
  s->aging_interval = interval > 0 ? interval : 5;
}

void scheduler_disable_aging(Scheduler *s) { s->aging_enabled = 0; }

void scheduler_apply_aging(Scheduler *s) {
  /* Boost priority of waiting processes */
  for (int i = 0; i < s->ready_queue.size; i++) {
    int idx = (s->ready_queue.front + i) % MAX_PROCESSES;
    int pid = s->ready_queue.pids[idx];
    Process *p = scheduler_get_process(s, pid);

    if (p && p->priority > 0) {
      p->priority--; /* Lower number = higher priority */
    }
  }
}

void scheduler_check_starvation(Scheduler *s) {
  for (int i = 0; i < s->ready_queue.size; i++) {
    int idx = (s->ready_queue.front + i) % MAX_PROCESSES;
    int pid = s->ready_queue.pids[idx];
    Process *p = scheduler_get_process(s, pid);

    if (p && p->wait_time >= s->starvation_threshold) {
      /* Process is starved - could trigger visual indicator */
    }
  }
}
