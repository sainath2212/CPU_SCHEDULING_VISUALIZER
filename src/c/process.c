/*
 * CPU Scheduling Visualizer - Process Implementation
 */

#include "process.h"

void init_process(Process *p, int pid, int arrival_time, int burst_time,
                  int priority) {
  p->pid = pid;
  p->arrival_time = arrival_time;
  p->burst_time = burst_time;
  p->priority = priority;
  p->remaining_time = burst_time;
  p->start_time = -1;
  p->finish_time = -1;
  p->wait_time = 0;
  p->response_time = -1;
  p->turnaround_time = 0;
  p->state = STATE_NEW;
}

const char *get_state_name(ProcessState state) {
  switch (state) {
  case STATE_NEW:
    return "NEW";
  case STATE_READY:
    return "READY";
  case STATE_RUNNING:
    return "RUNNING";
  case STATE_TERMINATED:
    return "TERMINATED";
  default:
    return "UNKNOWN";
  }
}
