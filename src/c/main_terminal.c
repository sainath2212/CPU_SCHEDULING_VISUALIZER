/*
 * CPU Scheduling Visualizer - Terminal Main Entry Point
 * Interactive terminal-based simulation interface
 */

#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <ctype.h>
#include "scheduler.h"
#include "terminal_ui.h"

/* Global scheduler instance */
static Scheduler scheduler;

/* ===================== Menu Functions ===================== */

static void print_main_menu(void) {
    print_box_top();
    printf("║%s%s       CPU SCHEDULING SIMULATOR - TERMINAL MODE        %s║\n",
           COLOR_BOLD, COLOR_CYAN, COLOR_RESET);
    terminal_print_separator();
    printf("║                                                                    ║\n");
    printf("║   %s1.%s Add Process                                                  ║\n",
           COLOR_GREEN, COLOR_RESET);
    printf("║   %s2.%s Select Algorithm                                             ║\n",
           COLOR_GREEN, COLOR_RESET);
    printf("║   %s3.%s Set Time Quantum (for Round Robin)                           ║\n",
           COLOR_GREEN, COLOR_RESET);
    printf("║   %s4.%s Run Simulation (Step by Step)                                ║\n",
           COLOR_GREEN, COLOR_RESET);
    printf("║   %s5.%s Run Simulation (Complete)                                    ║\n",
           COLOR_GREEN, COLOR_RESET);
    printf("║   %s6.%s View Current Processes                                       ║\n",
           COLOR_GREEN, COLOR_RESET);
    printf("║   %s7.%s Reset Simulation                                             ║\n",
           COLOR_GREEN, COLOR_RESET);
    printf("║   %s8.%s Load Sample Processes                                        ║\n",
           COLOR_GREEN, COLOR_RESET);
    printf("║   %s0.%s Exit                                                         ║\n",
           COLOR_RED, COLOR_RESET);
    printf("║                                                                    ║\n");
    print_box_bottom();
    printf("\n%sEnter your choice:%s ", COLOR_YELLOW, COLOR_RESET);
}

static void print_algorithm_menu(void) {
    printf("\n%s═══ SELECT SCHEDULING ALGORITHM ═══%s\n\n", COLOR_CYAN, COLOR_RESET);
    printf("  %s0.%s FCFS (First Come First Serve)\n", COLOR_GREEN, COLOR_RESET);
    printf("  %s1.%s SJF (Shortest Job First)\n", COLOR_GREEN, COLOR_RESET);
    printf("  %s2.%s SRTF (Shortest Remaining Time First) - Preemptive\n", COLOR_GREEN, COLOR_RESET);
    printf("  %s3.%s Priority Scheduling\n", COLOR_GREEN, COLOR_RESET);
    printf("  %s4.%s Round Robin - Preemptive\n", COLOR_GREEN, COLOR_RESET);
    printf("  %s5.%s LJF (Longest Job First)\n", COLOR_GREEN, COLOR_RESET);
    printf("  %s6.%s LRTF (Longest Remaining Time First) - Preemptive\n", COLOR_GREEN, COLOR_RESET);
    printf("\n%sEnter algorithm number:%s ", COLOR_YELLOW, COLOR_RESET);
}

/* ===================== Action Functions ===================== */

static void add_process(void) {
    int arrival, burst, priority;
    
    printf("\n%s═══ ADD NEW PROCESS ═══%s\n\n", COLOR_CYAN, COLOR_RESET);
    
    printf("Enter arrival time: ");
    if (scanf("%d", &arrival) != 1 || arrival < 0) {
        printf("%sInvalid arrival time!%s\n", COLOR_RED, COLOR_RESET);
        while (getchar() != '\n');
        return;
    }
    
    printf("Enter burst time: ");
    if (scanf("%d", &burst) != 1 || burst <= 0) {
        printf("%sInvalid burst time!%s\n", COLOR_RED, COLOR_RESET);
        while (getchar() != '\n');
        return;
    }
    
    printf("Enter priority (lower = higher priority): ");
    if (scanf("%d", &priority) != 1 || priority < 0) {
        printf("%sInvalid priority!%s\n", COLOR_RED, COLOR_RESET);
        while (getchar() != '\n');
        return;
    }
    
    int pid = scheduler_add_process(&scheduler, arrival, burst, priority);
    if (pid >= 0) {
        printf("%s✓ Process P%d added successfully!%s\n", COLOR_GREEN, pid, COLOR_RESET);
    } else {
        printf("%s✗ Failed to add process (max limit reached)%s\n", COLOR_RED, COLOR_RESET);
    }
}

static void select_algorithm(void) {
    int choice;
    print_algorithm_menu();
    
    if (scanf("%d", &choice) != 1 || choice < 0 || choice > 6) {
        printf("%sInvalid choice!%s\n", COLOR_RED, COLOR_RESET);
        while (getchar() != '\n');
        return;
    }
    
    scheduler_set_algorithm(&scheduler, (Algorithm)choice);
    printf("%s✓ Algorithm set to: ", COLOR_GREEN);
    terminal_print_algorithm_name((Algorithm)choice);
    printf("%s\n", COLOR_RESET);
}

static void set_time_quantum(void) {
    int quantum;
    
    printf("\n%s═══ SET TIME QUANTUM ═══%s\n\n", COLOR_CYAN, COLOR_RESET);
    printf("Current quantum: %d\n", scheduler.time_quantum);
    printf("Enter new time quantum: ");
    
    if (scanf("%d", &quantum) != 1 || quantum <= 0) {
        printf("%sInvalid quantum!%s\n", COLOR_RED, COLOR_RESET);
        while (getchar() != '\n');
        return;
    }
    
    scheduler_set_time_quantum(&scheduler, quantum);
    printf("%s✓ Time quantum set to %d%s\n", COLOR_GREEN, quantum, COLOR_RESET);
}

static void run_step_by_step(void) {
    if (scheduler.process_count == 0) {
        printf("%sNo processes to simulate! Add some processes first.%s\n", 
               COLOR_RED, COLOR_RESET);
        return;
    }
    
    printf("\n%s═══ STEP-BY-STEP SIMULATION ═══%s\n", COLOR_CYAN, COLOR_RESET);
    printf("Press ENTER to advance each tick, or 'q' to finish...\n");
    printf("Starting in 2 seconds...\n");
    terminal_sleep_ms(2000);
    
    terminal_hide_cursor();
    
    while (!scheduler_is_completed(&scheduler)) {
        terminal_print_tick(&scheduler);
        
        printf("\n%s[Press ENTER for next tick, 'q' to complete]%s ", COLOR_YELLOW, COLOR_RESET);
        fflush(stdout);
        
        char c = getchar();
        if (c == 'q' || c == 'Q') {
            scheduler_run_to_completion(&scheduler);
            break;
        }
        
        scheduler_step(&scheduler);
    }
    
    terminal_show_cursor();
    terminal_clear();
    terminal_print_metrics(&scheduler);
    
    printf("\n%sPress ENTER to continue...%s ", COLOR_YELLOW, COLOR_RESET);
    getchar();
}

static void run_complete(void) {
    if (scheduler.process_count == 0) {
        printf("%sNo processes to simulate! Add some processes first.%s\n", 
               COLOR_RED, COLOR_RESET);
        return;
    }
    
    printf("\n%s═══ RUNNING COMPLETE SIMULATION ═══%s\n", COLOR_CYAN, COLOR_RESET);
    printf("Simulation speed: 200ms per tick\n");
    printf("Starting in 2 seconds...\n");
    terminal_sleep_ms(2000);
    
    terminal_hide_cursor();
    
    while (!scheduler_is_completed(&scheduler)) {
        terminal_print_tick(&scheduler);
        terminal_sleep_ms(200);  /* 200ms delay between ticks */
        scheduler_step(&scheduler);
    }
    
    /* Final state */
    terminal_print_tick(&scheduler);
    terminal_sleep_ms(500);
    
    terminal_show_cursor();
    terminal_clear();
    terminal_print_metrics(&scheduler);
    
    printf("\n%sPress ENTER to continue...%s ", COLOR_YELLOW, COLOR_RESET);
    while (getchar() != '\n');
    getchar();
}

static void view_processes(void) {
    if (scheduler.process_count == 0) {
        printf("%sNo processes added yet.%s\n", COLOR_YELLOW, COLOR_RESET);
        return;
    }
    
    printf("\n");
    terminal_print_processes_table(&scheduler);
    printf("\n%sPress ENTER to continue...%s ", COLOR_YELLOW, COLOR_RESET);
    while (getchar() != '\n');
    getchar();
}

static void reset_simulation(void) {
    scheduler_init(&scheduler);
    printf("%s✓ Simulation reset. All processes cleared.%s\n", COLOR_GREEN, COLOR_RESET);
}

static void load_sample_processes(void) {
    scheduler_init(&scheduler);
    
    /* Add sample processes for demonstration */
    scheduler_add_process(&scheduler, 0, 5, 2);  /* P0: arr=0, burst=5, prio=2 */
    scheduler_add_process(&scheduler, 1, 3, 1);  /* P1: arr=1, burst=3, prio=1 */
    scheduler_add_process(&scheduler, 2, 8, 3);  /* P2: arr=2, burst=8, prio=3 */
    scheduler_add_process(&scheduler, 3, 6, 2);  /* P3: arr=3, burst=6, prio=2 */
    scheduler_add_process(&scheduler, 4, 4, 1);  /* P4: arr=4, burst=4, prio=1 */
    
    printf("%s✓ Loaded 5 sample processes:%s\n", COLOR_GREEN, COLOR_RESET);
    printf("  P0: Arrival=0, Burst=5, Priority=2\n");
    printf("  P1: Arrival=1, Burst=3, Priority=1\n");
    printf("  P2: Arrival=2, Burst=8, Priority=3\n");
    printf("  P3: Arrival=3, Burst=6, Priority=2\n");
    printf("  P4: Arrival=4, Burst=4, Priority=1\n");
}

/* ===================== Command Line Arguments ===================== */

static void print_usage(const char *prog_name) {
    printf("\n%sUsage:%s %s [options]\n\n", COLOR_BOLD, COLOR_RESET, prog_name);
    printf("%sOptions:%s\n", COLOR_BOLD, COLOR_RESET);
    printf("  -h, --help          Show this help message\n");
    printf("  -a, --algorithm N   Set algorithm (0-6)\n");
    printf("  -q, --quantum N     Set time quantum for Round Robin\n");
    printf("  -s, --sample        Load sample processes\n");
    printf("  -r, --run           Run simulation immediately\n");
    printf("\n%sAlgorithms:%s\n", COLOR_BOLD, COLOR_RESET);
    printf("  0 = FCFS    1 = SJF     2 = SRTF\n");
    printf("  3 = Priority 4 = Round Robin\n");
    printf("  5 = LJF     6 = LRTF\n\n");
}

static int parse_args(int argc, char *argv[]) {
    int should_run = 0;
    
    for (int i = 1; i < argc; i++) {
        if (strcmp(argv[i], "-h") == 0 || strcmp(argv[i], "--help") == 0) {
            print_usage(argv[0]);
            return -1;
        }
        else if ((strcmp(argv[i], "-a") == 0 || strcmp(argv[i], "--algorithm") == 0) 
                 && i + 1 < argc) {
            int algo = atoi(argv[++i]);
            if (algo >= 0 && algo <= 6) {
                scheduler_set_algorithm(&scheduler, (Algorithm)algo);
            }
        }
        else if ((strcmp(argv[i], "-q") == 0 || strcmp(argv[i], "--quantum") == 0) 
                 && i + 1 < argc) {
            int quantum = atoi(argv[++i]);
            if (quantum > 0) {
                scheduler_set_time_quantum(&scheduler, quantum);
            }
        }
        else if (strcmp(argv[i], "-s") == 0 || strcmp(argv[i], "--sample") == 0) {
            load_sample_processes();
        }
        else if (strcmp(argv[i], "-r") == 0 || strcmp(argv[i], "--run") == 0) {
            should_run = 1;
        }
    }
    
    return should_run;
}

/* ===================== Main Function ===================== */

int main(int argc, char *argv[]) {
    /* Initialize scheduler */
    scheduler_init(&scheduler);
    
    /* Parse command line arguments */
    int auto_run = parse_args(argc, argv);
    if (auto_run == -1) {
        return 0;  /* Help was printed */
    }
    
    if (auto_run && scheduler.process_count > 0) {
        run_complete();
        return 0;
    }
    
    /* Interactive mode */
    int running = 1;
    while (running) {
        terminal_clear();
        print_main_menu();
        
        int choice;
        if (scanf("%d", &choice) != 1) {
            while (getchar() != '\n');
            continue;
        }
        while (getchar() != '\n');  /* Clear input buffer */
        
        switch (choice) {
            case 1:
                add_process();
                printf("\n%sPress ENTER to continue...%s ", COLOR_YELLOW, COLOR_RESET);
                getchar();
                break;
            case 2:
                select_algorithm();
                printf("\n%sPress ENTER to continue...%s ", COLOR_YELLOW, COLOR_RESET);
                getchar();
                break;
            case 3:
                set_time_quantum();
                printf("\n%sPress ENTER to continue...%s ", COLOR_YELLOW, COLOR_RESET);
                getchar();
                break;
            case 4:
                run_step_by_step();
                scheduler_reset(&scheduler);
                break;
            case 5:
                run_complete();
                scheduler_reset(&scheduler);
                break;
            case 6:
                view_processes();
                break;
            case 7:
                reset_simulation();
                printf("\n%sPress ENTER to continue...%s ", COLOR_YELLOW, COLOR_RESET);
                getchar();
                break;
            case 8:
                load_sample_processes();
                printf("\n%sPress ENTER to continue...%s ", COLOR_YELLOW, COLOR_RESET);
                getchar();
                break;
            case 0:
                running = 0;
                printf("\n%sGoodbye!%s\n\n", COLOR_CYAN, COLOR_RESET);
                break;
            default:
                printf("%sInvalid choice!%s\n", COLOR_RED, COLOR_RESET);
                terminal_sleep_ms(1000);
                break;
        }
    }
    
    terminal_show_cursor();
    return 0;
}
