/*
 * CPU Scheduling Visualizer - Terminal UI Header
 * Terminal-based visualization for the CPU scheduler
 */

#ifndef TERMINAL_UI_H
#define TERMINAL_UI_H

#include "scheduler.h"

/* ANSI Color Codes */
#define COLOR_RESET   "\033[0m"
#define COLOR_RED     "\033[0;31m"
#define COLOR_GREEN   "\033[0;32m"
#define COLOR_YELLOW  "\033[0;33m"
#define COLOR_BLUE    "\033[0;34m"
#define COLOR_MAGENTA "\033[0;35m"
#define COLOR_CYAN    "\033[0;36m"
#define COLOR_WHITE   "\033[0;37m"
#define COLOR_BOLD    "\033[1m"

/* Terminal control */
void terminal_clear(void);
void terminal_set_cursor(int row, int col);
void terminal_hide_cursor(void);
void terminal_show_cursor(void);

/* Display functions */
void terminal_print_header(Scheduler *s);
void terminal_print_algorithm_name(Algorithm algo);
void terminal_print_processes_table(Scheduler *s);
void terminal_print_ready_queue(Scheduler *s);
void terminal_print_running_process(Scheduler *s);
void terminal_print_gantt_chart(Scheduler *s);
void terminal_print_tick(Scheduler *s);
void terminal_print_metrics(Scheduler *s);
void terminal_print_separator(void);
void terminal_print_simulation_state(Scheduler *s);

/* Utility functions */
const char* terminal_get_state_color(ProcessState state);
void terminal_sleep_ms(int milliseconds);

/* Box drawing helpers */
void print_box_top(void);
void print_box_bottom(void);

#endif /* TERMINAL_UI_H */
