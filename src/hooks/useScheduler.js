/**
 * useScheduler — Connects React frontend to the backend v2 engine.
 *
 * Accepts master workload from ProcessContext. On init/reset, sends all
 * processes to the backend and begins tick-based simulation. Does NOT
 * auto-reset when processes change — uses explicit resetSimulation().
 */

import { useState, useCallback, useRef, useEffect } from 'react';

export const ALGORITHMS = {
  FCFS: 0, SJF: 1, SRTF: 2, PRIORITY: 3,
  ROUND_ROBIN: 4, LJF: 5, LRTF: 6, MLFQ: 7,
};

export const ALGORITHM_NAMES = {
  0: 'FCFS', 1: 'SJF', 2: 'SRTF', 3: 'Priority',
  4: 'Round Robin', 5: 'LJF', 6: 'LRTF', 7: 'MLFQ',
};

export const ALGORITHM_DESCRIPTIONS = {
  0: 'First Come First Served',
  1: 'Shortest Job First',
  2: 'Shortest Remaining Time',
  3: 'Priority Scheduling',
  4: 'Round Robin (Time Quantum)',
  5: 'Longest Job First',
  6: 'Longest Remaining Time',
  7: 'Multi-Level Feedback Queue',
};

const API = '/api/v2';

const emptyMetrics = {
  avgWaitTime: 0, avgTurnaroundTime: 0, avgResponseTime: 0,
  cpuUtilization: 0, throughput: 0, contextSwitches: 0,
  totalIdleTime: 0, totalExecutionTime: 0,
};

export default function useScheduler() {
  const [state, setState] = useState({
    currentTime: 0,
    runningPid: -1,
    isCompleted: false,
    processes: [],
    gantt: [],
    readyQueue: [],
    metrics: { ...emptyMetrics },
    metricsHistory: [],
    kernelLog: [],
    mlfqState: null,
    contextSwitches: 0,
    algorithm: 'FCFS',
  });

  const [isRunning, setIsRunning] = useState(false);
  const [speed, setSpeed] = useState(500);
  const [isInitialized, setIsInitialized] = useState(false);
  const [error, setError] = useState(null);
  const intervalRef = useRef(null);

  const applyState = useCallback((data) => {
    setState(prev => ({
      ...prev,
      currentTime: data.currentTime ?? prev.currentTime,
      runningPid: data.runningPid ?? prev.runningPid,
      isCompleted: data.isCompleted ?? prev.isCompleted,
      processes: data.processes ?? prev.processes,
      gantt: data.gantt ?? prev.gantt,
      readyQueue: data.readyQueue ?? prev.readyQueue,
      metrics: data.metrics ?? prev.metrics,
      metricsHistory: data.metricsHistory ?? prev.metricsHistory,
      kernelLog: data.kernelLog ?? prev.kernelLog,
      mlfqState: data.mlfqState ?? prev.mlfqState,
      contextSwitches: data.contextSwitches ?? prev.contextSwitches,
      algorithm: data.algorithm ?? prev.algorithm,
    }));
    if (data.isCompleted) {
      setIsRunning(false);
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }
  }, []);

  /** Initialize backend engine with processes from master workload */
  const initEngine = useCallback(async (masterWorkload, algo, q) => {
    try {
      setError(null);
      // 1. Init engine with algorithm
      await fetch(`${API}/init`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ algorithm: algo, quantum: q }),
      });

      // 2. Add all processes
      for (const p of masterWorkload) {
        await fetch(`${API}/add-process`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            arrivalTime: p.arrival,
            burstTime: p.burst,
            priority: p.priority,
          }),
        });
      }

      // 3. Get initial state
      const res = await fetch(`${API}/state`);
      const data = await res.json();
      applyState(data);
      setIsInitialized(true);
    } catch (e) {
      setError(`Failed to initialize: ${e.message}`);
    }
  }, [applyState]);

  /** Execute one tick */
  const tick = useCallback(async () => {
    try {
      const res = await fetch(`${API}/tick`, { method: 'POST' });
      const data = await res.json();
      if (data.ok) applyState(data);
      return data;
    } catch (e) {
      setError(`Tick failed: ${e.message}`);
      setIsRunning(false);
      return null;
    }
  }, [applyState]);

  /** Start auto-ticking */
  const start = useCallback(() => {
    if (state.isCompleted) return;
    setIsRunning(true);
  }, [state.isCompleted]);

  /** Pause auto-ticking */
  const pause = useCallback(() => {
    setIsRunning(false);
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  /** Single step */
  const step = useCallback(async () => {
    if (state.isCompleted) return;
    pause();
    await tick();
  }, [state.isCompleted, pause, tick]);

  /** Run to completion */
  const runToEnd = useCallback(async () => {
    try {
      const res = await fetch(`${API}/run-all`, { method: 'POST' });
      const data = await res.json();
      if (data.ok) applyState(data);
      setIsRunning(false);
    } catch (e) {
      setError(`Run-to-end failed: ${e.message}`);
    }
  }, [applyState]);

  /** Reset simulation (keep processes, reset state) */
  const resetSim = useCallback(async () => {
    pause();
    try {
      const res = await fetch(`${API}/reset`, { method: 'POST' });
      if (res.ok) {
        const stateRes = await fetch(`${API}/state`);
        const data = await stateRes.json();
        applyState(data);
      }
    } catch (e) {
      setError(`Reset failed: ${e.message}`);
    }
  }, [pause, applyState]);

  // Auto-tick interval
  useEffect(() => {
    if (isRunning && !state.isCompleted) {
      intervalRef.current = setInterval(tick, speed);
      return () => clearInterval(intervalRef.current);
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isRunning, speed, tick, state.isCompleted]);

  return {
    state,
    isRunning,
    speed,
    setSpeed,
    isInitialized,
    error,
    initEngine,
    tick,
    start,
    pause,
    step,
    runToEnd,
    resetSim,
  };
}
