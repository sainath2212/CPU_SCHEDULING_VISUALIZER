/*
 * CPU Scheduling Visualizer - WebAssembly Bindings
 * Exposes C functions to JavaScript via Emscripten
 */

#include "scheduler.h"
#include <emscripten/emscripten.h>
#include <stdio.h>
#include <stdlib.h>
#include <string.h>

/* Global scheduler instance */
static Scheduler g_scheduler;
static char g_json_buffer[65536];

/* ===================== Initialization ===================== */

EMSCRIPTEN_KEEPALIVE
void wasm_init() { scheduler_init(&g_scheduler); }

EMSCRIPTEN_KEEPALIVE
void wasm_reset() { scheduler_reset(&g_scheduler); }

/* ===================== Configuration ===================== */

EMSCRIPTEN_KEEPALIVE
void wasm_set_algorithm(int algo) {
  scheduler_set_algorithm(&g_scheduler, (Algorithm)algo);
}

EMSCRIPTEN_KEEPALIVE
void wasm_set_time_quantum(int quantum) {
  scheduler_set_time_quantum(&g_scheduler, quantum);
}

EMSCRIPTEN_KEEPALIVE
void wasm_set_cores(int num_cores) {
  scheduler_set_cores(&g_scheduler, num_cores);
}

EMSCRIPTEN_KEEPALIVE
void wasm_enable_aging(int interval) {
  scheduler_enable_aging(&g_scheduler, interval);
}

EMSCRIPTEN_KEEPALIVE
void wasm_disable_aging() { scheduler_disable_aging(&g_scheduler); }

/* ===================== Process Management ===================== */

EMSCRIPTEN_KEEPALIVE
int wasm_add_process(int arrival_time, int burst_time, int priority) {
  return scheduler_add_process(&g_scheduler, arrival_time, burst_time,
                               priority);
}

EMSCRIPTEN_KEEPALIVE
void wasm_clear_processes() { scheduler_init(&g_scheduler); }

/* ===================== Simulation Control ===================== */

EMSCRIPTEN_KEEPALIVE
int wasm_step() { return scheduler_step(&g_scheduler); }

EMSCRIPTEN_KEEPALIVE
void wasm_run_to_completion() { scheduler_run_to_completion(&g_scheduler); }

EMSCRIPTEN_KEEPALIVE
int wasm_is_completed() { return scheduler_is_completed(&g_scheduler); }

EMSCRIPTEN_KEEPALIVE
int wasm_get_current_time() { return g_scheduler.current_time; }

/* ===================== State Queries ===================== */

EMSCRIPTEN_KEEPALIVE
const char *wasm_get_processes_json() {
  char *ptr = g_json_buffer;
  ptr += sprintf(ptr, "[");

  for (int i = 0; i < g_scheduler.process_count; i++) {
    Process *p = &g_scheduler.processes[i];

    if (i > 0)
      ptr += sprintf(ptr, ",");

    ptr += sprintf(ptr,
                   "{\"pid\":%d,"
                   "\"arrivalTime\":%d,"
                   "\"burstTime\":%d,"
                   "\"priority\":%d,"
                   "\"remainingTime\":%d,"
                   "\"startTime\":%d,"
                   "\"finishTime\":%d,"
                   "\"waitTime\":%d,"
                   "\"responseTime\":%d,"
                   "\"turnaroundTime\":%d,"
                   "\"state\":%d,"
                   "\"stateName\":\"%s\"}",
                   p->pid, p->arrival_time, p->burst_time, p->priority,
                   p->remaining_time, p->start_time, p->finish_time,
                   p->wait_time, p->response_time, p->turnaround_time,
                   (int)p->state, get_state_name(p->state));
  }

  ptr += sprintf(ptr, "]");
  return g_json_buffer;
}

EMSCRIPTEN_KEEPALIVE
const char *wasm_get_gantt_json() {
  char *ptr = g_json_buffer;
  ptr += sprintf(ptr, "[");

  for (int i = 0; i < g_scheduler.gantt_count; i++) {
    GanttEntry *e = &g_scheduler.gantt[i];

    if (i > 0)
      ptr += sprintf(ptr, ",");

    ptr += sprintf(ptr,
                   "{\"pid\":%d,\"startTime\":%d,\"endTime\":%d,\"coreId\":%d}",
                   e->pid, e->start_time, e->end_time, e->core_id);
  }

  ptr += sprintf(ptr, "]");
  return g_json_buffer;
}

EMSCRIPTEN_KEEPALIVE
const char *wasm_get_ready_queue_json() {
  char *ptr = g_json_buffer;
  ptr += sprintf(ptr, "[");

  ReadyQueue *q = &g_scheduler.ready_queue;
  for (int i = 0; i < q->size; i++) {
    int idx = (q->front + i) % MAX_PROCESSES;

    if (i > 0)
      ptr += sprintf(ptr, ",");
    ptr += sprintf(ptr, "%d", q->pids[idx]);
  }

  ptr += sprintf(ptr, "]");
  return g_json_buffer;
}

EMSCRIPTEN_KEEPALIVE
const char *wasm_get_metrics_json() {
  Metrics *m = &g_scheduler.metrics;

  sprintf(g_json_buffer,
          "{\"avgWaitTime\":%.2f,"
          "\"avgTurnaroundTime\":%.2f,"
          "\"avgResponseTime\":%.2f,"
          "\"cpuUtilization\":%.2f,"
          "\"throughput\":%.4f,"
          "\"totalIdleTime\":%d,"
          "\"totalExecutionTime\":%d}",
          m->avg_wait_time, m->avg_turnaround_time, m->avg_response_time,
          m->cpu_utilization, m->throughput, m->total_idle_time,
          m->total_execution_time);

  return g_json_buffer;
}

EMSCRIPTEN_KEEPALIVE
int wasm_get_running_pid() { return g_scheduler.running_pid; }

EMSCRIPTEN_KEEPALIVE
int wasm_get_process_count() { return g_scheduler.process_count; }

/* ===================== Full State Snapshot ===================== */

EMSCRIPTEN_KEEPALIVE
const char *wasm_get_state_json() {
  char processes[32768];
  char gantt[16384];
  char ready_queue[1024];

  /* Build processes array */
  char *ptr = processes;
  ptr += sprintf(ptr, "[");
  for (int i = 0; i < g_scheduler.process_count; i++) {
    Process *p = &g_scheduler.processes[i];
    if (i > 0)
      ptr += sprintf(ptr, ",");
    ptr += sprintf(
        ptr,
        "{\"pid\":%d,\"arrivalTime\":%d,\"burstTime\":%d,\"priority\":%d,"
        "\"remainingTime\":%d,\"startTime\":%d,\"finishTime\":%d,"
        "\"waitTime\":%d,\"responseTime\":%d,\"turnaroundTime\":%d,"
        "\"state\":%d,\"stateName\":\"%s\"}",
        p->pid, p->arrival_time, p->burst_time, p->priority, p->remaining_time,
        p->start_time, p->finish_time, p->wait_time, p->response_time,
        p->turnaround_time, (int)p->state, get_state_name(p->state));
  }
  ptr += sprintf(ptr, "]");

  /* Build gantt array */
  ptr = gantt;
  ptr += sprintf(ptr, "[");
  for (int i = 0; i < g_scheduler.gantt_count; i++) {
    GanttEntry *e = &g_scheduler.gantt[i];
    if (i > 0)
      ptr += sprintf(ptr, ",");
    ptr += sprintf(ptr,
                   "{\"pid\":%d,\"startTime\":%d,\"endTime\":%d,\"coreId\":%d}",
                   e->pid, e->start_time, e->end_time, e->core_id);
  }
  ptr += sprintf(ptr, "]");

  /* Build ready queue array */
  ptr = ready_queue;
  ptr += sprintf(ptr, "[");
  ReadyQueue *q = &g_scheduler.ready_queue;
  for (int i = 0; i < q->size; i++) {
    int idx = (q->front + i) % MAX_PROCESSES;
    if (i > 0)
      ptr += sprintf(ptr, ",");
    ptr += sprintf(ptr, "%d", q->pids[idx]);
  }
  ptr += sprintf(ptr, "]");

  Metrics *m = &g_scheduler.metrics;

  sprintf(
      g_json_buffer,
      "{\"currentTime\":%d,"
      "\"runningPid\":%d,"
      "\"isCompleted\":%d,"
      "\"algorithm\":%d,"
      "\"timeQuantum\":%d,"
      "\"processes\":%s,"
      "\"gantt\":%s,"
      "\"readyQueue\":%s,"
      "\"metrics\":{\"avgWaitTime\":%.2f,\"avgTurnaroundTime\":%.2f,"
      "\"avgResponseTime\":%.2f,\"cpuUtilization\":%.2f,\"throughput\":%.4f,"
      "\"totalIdleTime\":%d,\"totalExecutionTime\":%d}}",
      g_scheduler.current_time, g_scheduler.running_pid,
      g_scheduler.is_completed, (int)g_scheduler.algorithm,
      g_scheduler.time_quantum, processes, gantt, ready_queue, m->avg_wait_time,
      m->avg_turnaround_time, m->avg_response_time, m->cpu_utilization,
      m->throughput, m->total_idle_time, m->total_execution_time);

  return g_json_buffer;
}
