import { useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { useProcesses } from '../context/ProcessContext';
import useScheduler, { ALGORITHM_NAMES } from '../hooks/useScheduler';
import ProcessForm from '../components/ProcessForm';
import AlgorithmSelector from '../components/AlgorithmSelector';
import ControlPanel from '../components/ControlPanel';
import GanttChart from '../components/GanttChart';
import ReadyQueue from '../components/ReadyQueue';
import MetricsDashboard from '../components/MetricsDashboard';
import ProcessTable from '../components/ProcessTable';
import { DotGrid, SpotlightCard, GlowText } from '../components/AceternityUI';

export default function SimulatorPage() {
  const {
    masterWorkload, processes, algorithm, setAlgorithm,
    quantum, setQuantum, addProcess, removeProcess,
    clearProcesses, loadSampleProcesses, resetFromMaster,
  } = useProcesses();

  const {
    state, isRunning, speed, setSpeed, isInitialized, error,
    initEngine, start, pause, step, runToEnd, resetSim,
  } = useScheduler();

  useEffect(() => {
    if (masterWorkload.length > 0) {
      initEngine(masterWorkload, algorithm, quantum);
    }
  }, [masterWorkload, algorithm, quantum, initEngine]);

  const handleAlgoChange = useCallback((algoId) => {
    setAlgorithm(algoId);
    resetFromMaster();
  }, [setAlgorithm, resetFromMaster]);

  const handleClear = useCallback(() => { clearProcesses(); }, [clearProcesses]);
  const handleReset = useCallback(() => { resetFromMaster(); resetSim(); }, [resetFromMaster, resetSim]);

  return (
    <div className="simulator-page" style={{ position: 'relative' }}>
      <DotGrid />

      <div style={{ position: 'relative', zIndex: 1 }}>
        {/* Sub-nav */}
        <div className="sim-nav">
          <div className="sim-title-group">
            <h1 className="sim-title">CPU Simulator</h1>
            <span className="sim-algo-badge">{ALGORITHM_NAMES[algorithm]}</span>
          </div>
          {error && <span className="error-text">{error}</span>}
        </div>

        {/* Algorithm selector */}
        <motion.div
          className="algorithm-section"
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <AlgorithmSelector
            selected={algorithm}
            onSelect={handleAlgoChange}
            timeQuantum={quantum}
            onTimeQuantumChange={setQuantum}
            disabled={isRunning}
          />
        </motion.div>

        {/* Control panel */}
        <ControlPanel
          currentTime={state.currentTime}
          isRunning={isRunning}
          isCompleted={state.isCompleted}
          processCount={masterWorkload.length}
          speed={speed}
          onStart={start}
          onPause={pause}
          onStep={step}
          onReset={handleReset}
          onClear={handleClear}
          onSpeedChange={setSpeed}
          onRunToEnd={runToEnd}
        />

        {/* Main layout */}
        <div className="main-content">
          {/* Sidebar */}
          <div className="sidebar">
            <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ type: 'spring', stiffness: 100 }}>
              <SpotlightCard spotlightColor="#E64833">
                <div style={{ padding: '0' }}>
                  <ProcessForm
                    onAddProcess={(a, b, p) => addProcess(a, b, p)}
                    onAddSample={loadSampleProcesses}
                    disabled={isRunning}
                  />
                </div>
              </SpotlightCard>
            </motion.div>

            <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ type: 'spring', stiffness: 100, delay: 0.1 }}>
              <SpotlightCard spotlightColor="#B0B0B0">
                <div style={{ padding: '0' }}>
                  <MetricsDashboard
                    metrics={{
                      avgWaitTime: state.metrics?.avgWaitTime ?? 0,
                      avgTurnaroundTime: state.metrics?.avgTurnaroundTime ?? 0,
                      avgResponseTime: state.metrics?.avgResponseTime ?? 0,
                      cpuUtilization: state.metrics?.cpuUtilization ?? 0,
                      throughput: state.metrics?.throughput ?? 0,
                      totalExecutionTime: state.metrics?.totalExecutionTime ?? 0,
                    }}
                    isCompleted={state.isCompleted}
                  />
                </div>
              </SpotlightCard>
            </motion.div>
          </div>

          {/* Visualization area */}
          <div className="visualization-area">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} style={{ minWidth: 0 }}>
              <SpotlightCard>
                <div style={{ padding: '0', minWidth: 0 }}>
                  <GanttChart gantt={state.gantt} currentTime={state.currentTime} />
                </div>
              </SpotlightCard>
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
              <ReadyQueue
                queue={state.readyQueue}
                runningPid={state.runningPid}
                algorithm={algorithm}
                mlfqState={state.mlfqState}
              />
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
              <SpotlightCard spotlightColor="#874F41">
                <div style={{ padding: '0' }}>
                  <ProcessTable
                    processes={masterWorkload}
                    backendProcesses={state.processes}
                    runningPid={state.runningPid}
                    onRemove={removeProcess}
                    disabled={isRunning}
                  />
                </div>
              </SpotlightCard>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}
