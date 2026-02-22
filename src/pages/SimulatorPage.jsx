import { Link } from 'react-router-dom';
import { useScheduler, ALGORITHM_NAMES } from '../hooks/useScheduler';
import ProcessForm from '../components/ProcessForm';
import AlgorithmSelector from '../components/AlgorithmSelector';
import ProcessTable from '../components/ProcessTable';
import ControlPanel from '../components/ControlPanel';
import ReadyQueue from '../components/ReadyQueue';
import GanttChart from '../components/GanttChart';
import MetricsDashboard from '../components/MetricsDashboard';

export default function SimulatorPage() {
  const {
    state,
    isRunning,
    speed,
    setSpeed,
    reset,
    setAlgorithm,
    setTimeQuantum,
    addProcess,
    addSampleProcesses,
    clearProcesses,
    step,
    start,
    pause,
    runToEnd,
  } = useScheduler();

  const isSimulating = isRunning || state.currentTime > 0;

  return (
    <div className="simulator-page">
      {/* ── Simulator nav bar ── */}
      <nav className="sim-nav">
        <Link to="/" className="sim-back">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none"
            stroke="currentColor" strokeWidth="2" strokeLinecap="round"
            strokeLinejoin="round">
            <line x1="19" y1="12" x2="5" y2="12" />
            <polyline points="12 19 5 12 12 5" />
          </svg>
          Home
        </Link>
        <div className="sim-title-group">
          <h1 className="sim-title">CPU Scheduling Simulator</h1>
          <span className="sim-algo-badge">
            {ALGORITHM_NAMES[state.algorithm]}
          </span>
        </div>
        <div className="sim-spacer" />
      </nav>

      {/* ── Control panel ── */}
      <ControlPanel
        currentTime={state.currentTime}
        isRunning={isRunning}
        isCompleted={state.isCompleted}
        processCount={state.processes.length}
        speed={speed}
        onStart={start}
        onPause={pause}
        onStep={step}
        onReset={reset}
        onClear={clearProcesses}
        onSpeedChange={setSpeed}
        onRunToEnd={runToEnd}
      />

      {/* ── Algorithm selector ── */}
      <section className="algorithm-section">
        <AlgorithmSelector
          selected={state.algorithm}
          onSelect={setAlgorithm}
          timeQuantum={state.timeQuantum}
          onTimeQuantumChange={setTimeQuantum}
          disabled={isSimulating}
        />
      </section>

      {/* ── Main layout ── */}
      <div className="main-content">
        <aside className="sidebar">
          <ProcessForm onAddProcess={addProcess} onAddSample={addSampleProcesses} disabled={false} />
          <MetricsDashboard
            metrics={state.metrics}
            isCompleted={state.isCompleted}
          />
        </aside>

        <main className="visualization-area">
          <div className="viz-section viz-section--horizontal">
            <ReadyQueue queue={state.readyQueue} runningPid={state.runningPid} />
          </div>
          <div className="viz-section viz-section--horizontal">
            <GanttChart gantt={state.gantt} currentTime={state.currentTime} />
          </div>
          <div className="viz-section viz-section--vertical">
            <ProcessTable processes={state.processes} runningPid={state.runningPid} />
          </div>
        </main>
      </div>
    </div>
  );
}
