/**
 * CPU Scheduling Visualizer - Scheduler Hook
 * All scheduling logic runs on the Python backend.
 * This hook only manages React state and calls the backend API.
 */

import { useState, useCallback, useRef, useEffect } from 'react';

const API_BASE = 'http://10.7.19.101:5001';

// Algorithm constants (for display only)
export const ALGORITHMS = {
  FCFS: 0,
  SJF: 1,
  SRTF: 2,
  PRIORITY: 3,
  ROUND_ROBIN: 4,
  LJF: 5,
  LRTF: 6,
  MLFQ: 7
};

export const ALGORITHM_NAMES = {
  [ALGORITHMS.FCFS]: 'FCFS',
  [ALGORITHMS.SJF]: 'SJF',
  [ALGORITHMS.SRTF]: 'SRTF',
  [ALGORITHMS.PRIORITY]: 'Priority',
  [ALGORITHMS.ROUND_ROBIN]: 'Round Robin',
  [ALGORITHMS.LJF]: 'LJF',
  [ALGORITHMS.LRTF]: 'LRTF',
  [ALGORITHMS.MLFQ]: 'MLFQ'
};

export const ALGORITHM_DESCRIPTIONS = {
  [ALGORITHMS.FCFS]: 'First Come First Serve',
  [ALGORITHMS.SJF]: 'Shortest Job First',
  [ALGORITHMS.SRTF]: 'Shortest Remaining Time',
  [ALGORITHMS.PRIORITY]: 'Priority Based',
  [ALGORITHMS.ROUND_ROBIN]: 'Time Quantum',
  [ALGORITHMS.LJF]: 'Longest Job First',
  [ALGORITHMS.LRTF]: 'Longest Remaining Time',
  [ALGORITHMS.MLFQ]: '3-Level Feedback Queue'
};

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

// ── API helper ───────────────────────────────────────────────────────

async function api(endpoint, body = null, method = 'POST') {
  try {
    const opts = {
      method,
      headers: { 'Content-Type': 'application/json' },
    };
    if (body) opts.body = JSON.stringify(body);
    const res = await fetch(`${API_BASE}${endpoint}`, opts);
    const data = await res.json();
    return data;
  } catch (err) {
    console.error(`[API] Error calling ${endpoint}:`, err);
    return {};
  }
}

// ── React hook ───────────────────────────────────────────────────────

export function useScheduler() {
  const [state, setState] = useState(initialState);
  const [isRunning, setIsRunning] = useState(false);
  const [speed, setSpeed] = useState(500);
  const intervalRef = useRef(null);
  const algoRef = useRef(ALGORITHMS.FCFS);
  const quantumRef = useRef(2);

  // Fetch current state from backend
  const fetchState = useCallback(async () => {
    const data = await api('/api/state', null, 'GET');
    setState(data);
  }, []);

  // Init — create fresh scheduler on backend
  const init = useCallback(async () => {
    await api('/api/init');
    await fetchState();
    setIsRunning(false);
  }, [fetchState]);

  // Reset — keep processes, reset simulation
  const reset = useCallback(async () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    // We need to re-init and re-add processes to reset
    const currentProcesses = state.processes.map(p => ({
      arrivalTime: p.arrivalTime,
      burstTime: p.burstTime,
      priority: p.priority
    }));
    const currentAlgo = algoRef.current;
    const currentQuantum = quantumRef.current;

    await api('/api/init');
    await api('/api/set-algorithm', { algorithm: currentAlgo });
    await api('/api/set-time-quantum', { quantum: currentQuantum });

    for (const p of currentProcesses) {
      await api('/api/add-process', p);
    }

    await fetchState();
    setIsRunning(false);
  }, [state.processes, fetchState]);

  // Set algorithm
  const setAlgorithm = useCallback(async (algo) => {
    algoRef.current = algo;
    await api('/api/set-algorithm', { algorithm: algo });
    // Reset simulation with new algorithm
    const currentProcesses = state.processes.map(p => ({
      arrivalTime: p.arrivalTime,
      burstTime: p.burstTime,
      priority: p.priority
    }));

    await api('/api/init');
    await api('/api/set-algorithm', { algorithm: algo });
    await api('/api/set-time-quantum', { quantum: quantumRef.current });

    for (const p of currentProcesses) {
      await api('/api/add-process', p);
    }

    await fetchState();
    setIsRunning(false);
  }, [state.processes, fetchState]);

  // Set time quantum
  const setTimeQuantum = useCallback(async (quantum) => {
    quantumRef.current = quantum;
    await api('/api/set-time-quantum', { quantum });
    await fetchState();
  }, [fetchState]);

  // Add process
  const addProcess = useCallback(async (arrivalTime, burstTime, priority) => {
    await api('/api/add-process', { arrivalTime, burstTime, priority });
    await fetchState();
  }, [fetchState]);

  // Add multiple sample processes in one batch (clean init first)
  const addSampleProcesses = useCallback(async (processList) => {
    // Clean init to avoid stale state
    await api('/api/init');
    await api('/api/set-algorithm', { algorithm: algoRef.current });
    await api('/api/set-time-quantum', { quantum: quantumRef.current });

    // Add all processes without fetching state in between
    for (const p of processList) {
      await api('/api/add-process', p);
    }

    // Fetch state only once at the end
    await fetchState();
  }, [fetchState]);

  // Clear all processes
  const clearProcesses = useCallback(async () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    await api('/api/clear-processes');
    await fetchState();
    setIsRunning(false);
  }, [fetchState]);

  // Step — advance one tick on backend
  const step = useCallback(async () => {
    const data = await api('/api/step');
    setState(prev => ({
      ...prev,
      ...data,
    }));

    if (data.isCompleted) {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      setIsRunning(false);
    }
  }, []);

  // Start — auto-step at speed interval
  const start = useCallback(() => {
    if (state.isCompleted || state.processes.length === 0) return;

    setIsRunning(true);
    intervalRef.current = setInterval(() => {
      step();
    }, speed);
  }, [state.isCompleted, state.processes.length, speed, step]);

  // Pause
  const pause = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    setIsRunning(false);
  }, []);

  // Run to end — complete on backend in one call
  const runToEnd = useCallback(async () => {
    const data = await api('/api/run-to-completion');
    setState(prev => ({
      ...prev,
      ...data,
    }));
    setIsRunning(false);
  }, []);

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
    addSampleProcesses,
    clearProcesses,
    step,
    start,
    pause,
    runToEnd
  };
}
