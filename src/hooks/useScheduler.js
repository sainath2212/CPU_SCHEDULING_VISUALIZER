/**
 * CPU Scheduling Visualizer - Scheduler Hook
 * Provides interface to the C/WASM scheduling engine
 * Falls back to pure JavaScript if WASM not available
 */

import { useState, useCallback, useRef, useEffect } from 'react';

// Algorithm constants matching C enum
export const ALGORITHMS = {
  FCFS: 0,
  SJF: 1,
  SRTF: 2,
  PRIORITY: 3,
  ROUND_ROBIN: 4,
  LJF: 5,
  LRTF: 6
};

export const ALGORITHM_NAMES = {
  [ALGORITHMS.FCFS]: 'FCFS',
  [ALGORITHMS.SJF]: 'SJF',
  [ALGORITHMS.SRTF]: 'SRTF',
  [ALGORITHMS.PRIORITY]: 'Priority',
  [ALGORITHMS.ROUND_ROBIN]: 'Round Robin',
  [ALGORITHMS.LJF]: 'LJF',
  [ALGORITHMS.LRTF]: 'LRTF'
};

export const ALGORITHM_DESCRIPTIONS = {
  [ALGORITHMS.FCFS]: 'First Come First Serve',
  [ALGORITHMS.SJF]: 'Shortest Job First',
  [ALGORITHMS.SRTF]: 'Shortest Remaining Time',
  [ALGORITHMS.PRIORITY]: 'Priority Based',
  [ALGORITHMS.ROUND_ROBIN]: 'Time Quantum',
  [ALGORITHMS.LJF]: 'Longest Job First',
  [ALGORITHMS.LRTF]: 'Longest Remaining Time'
};

// Process state constants
export const STATES = {
  NEW: 0,
  READY: 1,
  RUNNING: 2,
  TERMINATED: 3
};

export const STATE_NAMES = ['NEW', 'READY', 'RUNNING', 'TERMINATED'];

// Initial state
const initialState = {
  currentTime: 0,
  runningPid: -1,
  isCompleted: false,
  algorithm: ALGORITHMS.FCFS,
  timeQuantum: 2,
  processes: [],
  gantt: [],
  readyQueue: [],
  metrics: {
    avgWaitTime: 0,
    avgTurnaroundTime: 0,
    avgResponseTime: 0,
    cpuUtilization: 0,
    throughput: 0,
    totalIdleTime: 0,
    totalExecutionTime: 0
  }
};

/**
 * Pure JavaScript implementation of the scheduling algorithms
 * Used as fallback when WASM is not available
 */
class JSScheduler {
  constructor() {
    this.reset();
  }

  reset() {
    this.processes = [];
    this.gantt = [];
    this.readyQueue = [];
    this.currentTime = 0;
    this.runningPid = -1;
    this.isCompleted = false;
    this.algorithm = ALGORITHMS.FCFS;
    this.timeQuantum = 2;
    this.quantumRemaining = 0;
    this.metrics = { ...initialState.metrics };
  }

  setAlgorithm(algo) {
    this.algorithm = algo;
  }

  setTimeQuantum(quantum) {
    this.timeQuantum = quantum > 0 ? quantum : 1;
  }

  addProcess(arrivalTime, burstTime, priority) {
    const pid = this.processes.length;
    this.processes.push({
      pid,
      arrivalTime,
      burstTime,
      priority,
      remainingTime: burstTime,
      startTime: -1,
      finishTime: -1,
      waitTime: 0,
      responseTime: -1,
      turnaroundTime: 0,
      state: STATES.NEW,
      stateName: 'NEW'
    });
    return pid;
  }

  clearProcesses() {
    this.reset();
  }

  selectProcess() {
    if (this.readyQueue.length === 0) return -1;

    let selected = 0;
    const queue = this.readyQueue;

    switch (this.algorithm) {
      case ALGORITHMS.FCFS:
      case ALGORITHMS.ROUND_ROBIN:
        // Take from front
        return queue[0];

      case ALGORITHMS.SJF:
        // Smallest burst time
        for (let i = 1; i < queue.length; i++) {
          const pid = queue[i];
          const curr = this.processes[queue[selected]];
          const proc = this.processes[pid];
          if (proc.burstTime < curr.burstTime) selected = i;
        }
        return queue[selected];

      case ALGORITHMS.SRTF:
        // Smallest remaining time
        for (let i = 1; i < queue.length; i++) {
          const pid = queue[i];
          const curr = this.processes[queue[selected]];
          const proc = this.processes[pid];
          if (proc.remainingTime < curr.remainingTime) selected = i;
        }
        return queue[selected];

      case ALGORITHMS.PRIORITY:
        // Lowest priority number = highest priority
        for (let i = 1; i < queue.length; i++) {
          const pid = queue[i];
          const curr = this.processes[queue[selected]];
          const proc = this.processes[pid];
          if (proc.priority < curr.priority) selected = i;
        }
        return queue[selected];

      case ALGORITHMS.LJF:
        // Largest burst time
        for (let i = 1; i < queue.length; i++) {
          const pid = queue[i];
          const curr = this.processes[queue[selected]];
          const proc = this.processes[pid];
          if (proc.burstTime > curr.burstTime) selected = i;
        }
        return queue[selected];

      case ALGORITHMS.LRTF:
        // Largest remaining time
        for (let i = 1; i < queue.length; i++) {
          const pid = queue[i];
          const curr = this.processes[queue[selected]];
          const proc = this.processes[pid];
          if (proc.remainingTime > curr.remainingTime) selected = i;
        }
        return queue[selected];

      default:
        return queue[0];
    }
  }

  isPreemptive() {
    return this.algorithm === ALGORITHMS.SRTF || 
           this.algorithm === ALGORITHMS.LRTF || 
           this.algorithm === ALGORITHMS.ROUND_ROBIN;
  }

  removeFromQueue(pid) {
    const idx = this.readyQueue.indexOf(pid);
    if (idx !== -1) {
      this.readyQueue.splice(idx, 1);
    }
  }

  addGanttEntry(pid, start, end) {
    // Try to merge with last entry
    if (this.gantt.length > 0) {
      const last = this.gantt[this.gantt.length - 1];
      if (last.pid === pid && last.endTime === start) {
        last.endTime = end;
        return;
      }
    }
    this.gantt.push({ pid, startTime: start, endTime: end, coreId: 0 });
  }

  step() {
    if (this.isCompleted) return false;

    // Step 1: Check for newly arrived processes
    for (const p of this.processes) {
      if (p.state === STATES.NEW && p.arrivalTime <= this.currentTime) {
        p.state = STATES.READY;
        p.stateName = 'READY';
        this.readyQueue.push(p.pid);
      }
    }

    // Step 2: Handle preemption
    if (this.isPreemptive() && this.runningPid !== -1) {
      const running = this.processes[this.runningPid];

      if (this.algorithm === ALGORITHMS.ROUND_ROBIN) {
        if (this.quantumRemaining <= 0) {
          running.state = STATES.READY;
          running.stateName = 'READY';
          this.readyQueue.push(this.runningPid);
          this.runningPid = -1;
        }
      } else {
        const nextPid = this.selectProcess();
        if (nextPid !== -1 && nextPid !== this.runningPid) {
          const next = this.processes[nextPid];
          let shouldPreempt = false;

          if (this.algorithm === ALGORITHMS.SRTF) {
            shouldPreempt = next.remainingTime < running.remainingTime;
          } else if (this.algorithm === ALGORITHMS.LRTF) {
            shouldPreempt = next.remainingTime > running.remainingTime;
          }

          if (shouldPreempt) {
            running.state = STATES.READY;
            running.stateName = 'READY';
            this.readyQueue.push(this.runningPid);
            this.runningPid = -1;
          }
        }
      }
    }

    // Step 3: Select next process if CPU is idle
    if (this.runningPid === -1) {
      const nextPid = this.selectProcess();

      if (nextPid !== -1) {
        this.removeFromQueue(nextPid);
        this.runningPid = nextPid;

        const p = this.processes[nextPid];
        p.state = STATES.RUNNING;
        p.stateName = 'RUNNING';

        if (p.startTime === -1) {
          p.startTime = this.currentTime;
          p.responseTime = this.currentTime - p.arrivalTime;
        }

        if (this.algorithm === ALGORITHMS.ROUND_ROBIN) {
          this.quantumRemaining = this.timeQuantum;
        }
      }
    }

    // Step 4: Execute one time unit
    if (this.runningPid !== -1) {
      const p = this.processes[this.runningPid];
      p.remainingTime--;

      if (this.algorithm === ALGORITHMS.ROUND_ROBIN) {
        this.quantumRemaining--;
      }

      this.addGanttEntry(this.runningPid, this.currentTime, this.currentTime + 1);

      if (p.remainingTime <= 0) {
        p.state = STATES.TERMINATED;
        p.stateName = 'TERMINATED';
        p.finishTime = this.currentTime + 1;
        p.turnaroundTime = p.finishTime - p.arrivalTime;
        p.waitTime = p.turnaroundTime - p.burstTime;
        this.runningPid = -1;
      }
    } else {
      this.addGanttEntry(-1, this.currentTime, this.currentTime + 1);
    }

    // Step 5: Update waiting time for ready processes
    for (const pid of this.readyQueue) {
      this.processes[pid].waitTime++;
    }

    // Step 6: Advance time
    this.currentTime++;

    // Step 7: Check completion
    const allTerminated = this.processes.length > 0 && 
      this.processes.every(p => p.state === STATES.TERMINATED);

    if (allTerminated) {
      this.isCompleted = true;
      this.calculateMetrics();
    }

    return !this.isCompleted;
  }

  runToCompletion() {
    while (!this.isCompleted && this.currentTime < 10000) {
      this.step();
    }
  }

  calculateMetrics() {
    if (this.processes.length === 0) return;

    let totalWait = 0, totalTurnaround = 0, totalResponse = 0, totalBurst = 0;
    let maxFinish = 0, minArrival = Infinity;

    for (const p of this.processes) {
      totalWait += p.waitTime;
      totalTurnaround += p.turnaroundTime;
      totalResponse += p.responseTime;
      totalBurst += p.burstTime;
      if (p.finishTime > maxFinish) maxFinish = p.finishTime;
      if (p.arrivalTime < minArrival) minArrival = p.arrivalTime;
    }

    const n = this.processes.length;
    const totalTime = maxFinish - minArrival;

    this.metrics = {
      avgWaitTime: totalWait / n,
      avgTurnaroundTime: totalTurnaround / n,
      avgResponseTime: totalResponse / n,
      cpuUtilization: totalTime > 0 ? (totalBurst / totalTime) * 100 : 0,
      throughput: totalTime > 0 ? n / totalTime : 0,
      totalIdleTime: totalTime - totalBurst,
      totalExecutionTime: totalTime
    };
  }

  getState() {
    return {
      currentTime: this.currentTime,
      runningPid: this.runningPid,
      isCompleted: this.isCompleted,
      algorithm: this.algorithm,
      timeQuantum: this.timeQuantum,
      processes: [...this.processes],
      gantt: [...this.gantt],
      readyQueue: [...this.readyQueue],
      metrics: { ...this.metrics }
    };
  }
}

/**
 * React hook for the scheduler
 */
export function useScheduler() {
  const [state, setState] = useState(initialState);
  const [isRunning, setIsRunning] = useState(false);
  const [speed, setSpeed] = useState(500); // ms per step
  const schedulerRef = useRef(new JSScheduler());
  const intervalRef = useRef(null);

  const updateState = useCallback(() => {
    setState(schedulerRef.current.getState());
  }, []);

  const init = useCallback(() => {
    schedulerRef.current.reset();
    updateState();
    setIsRunning(false);
  }, [updateState]);

  const reset = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    
    // Reset but keep processes
    const processes = schedulerRef.current.processes.map(p => ({
      arrivalTime: p.arrivalTime,
      burstTime: p.burstTime,
      priority: p.priority
    }));
    const algo = schedulerRef.current.algorithm;
    const quantum = schedulerRef.current.timeQuantum;
    
    schedulerRef.current.reset();
    schedulerRef.current.setAlgorithm(algo);
    schedulerRef.current.setTimeQuantum(quantum);
    
    for (const p of processes) {
      schedulerRef.current.addProcess(p.arrivalTime, p.burstTime, p.priority);
    }
    
    updateState();
    setIsRunning(false);
  }, [updateState]);

  const setAlgorithm = useCallback((algo) => {
    schedulerRef.current.setAlgorithm(algo);
    reset();
  }, [reset]);

  const setTimeQuantum = useCallback((quantum) => {
    schedulerRef.current.setTimeQuantum(quantum);
    updateState();
  }, [updateState]);

  const addProcess = useCallback((arrivalTime, burstTime, priority) => {
    schedulerRef.current.addProcess(arrivalTime, burstTime, priority);
    updateState();
  }, [updateState]);

  const clearProcesses = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    schedulerRef.current.clearProcesses();
    updateState();
    setIsRunning(false);
  }, [updateState]);

  const step = useCallback(() => {
    schedulerRef.current.step();
    updateState();
    
    if (schedulerRef.current.isCompleted) {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      setIsRunning(false);
    }
  }, [updateState]);

  const start = useCallback(() => {
    if (state.isCompleted || state.processes.length === 0) return;
    
    setIsRunning(true);
    intervalRef.current = setInterval(() => {
      step();
    }, speed);
  }, [state.isCompleted, state.processes.length, speed, step]);

  const pause = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    setIsRunning(false);
  }, []);

  const runToEnd = useCallback(() => {
    schedulerRef.current.runToCompletion();
    updateState();
    setIsRunning(false);
  }, [updateState]);

  // Update interval when speed changes
  useEffect(() => {
    if (isRunning && intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = setInterval(() => {
        step();
      }, speed);
    }
  }, [speed, isRunning, step]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  return {
    state,
    isRunning,
    speed,
    setSpeed,
    init,
    reset,
    setAlgorithm,
    setTimeQuantum,
    addProcess,
    clearProcesses,
    step,
    start,
    pause,
    runToEnd
  };
}
