/**
 * CPU Scheduling Visualizer - Main App Component
 */

import { useScheduler, ALGORITHM_NAMES } from './hooks/useScheduler';
import ProcessForm from './components/ProcessForm';
import AlgorithmSelector from './components/AlgorithmSelector';
import ProcessTable from './components/ProcessTable';
import ControlPanel from './components/ControlPanel';
import ReadyQueue from './components/ReadyQueue';
import GanttChart from './components/GanttChart';
import MetricsDashboard from './components/MetricsDashboard';
import './index.css';

function App() {
  const {
    state,
    isRunning,
    speed,
    setSpeed,
    reset,
    setAlgorithm,
    setTimeQuantum,
    addProcess,
    clearProcesses,
    step,
    start,
    pause,
    runToEnd
  } = useScheduler();

  const isSimulating = isRunning || state.currentTime > 0;

  return (
    <div className="app">
      {/* Header */}
      <header className="header">
        <h1>CPU Scheduling Visualizer</h1>
        <p>
          Simulate and visualize CPU scheduling algorithms •
          <span style={{ color: 'var(--accent-primary)', marginLeft: '8px' }}>
            {ALGORITHM_NAMES[state.algorithm]}
          </span>
        </p>
      </header>

      {/* Control Panel */}
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

      {/* Algorithm Selector */}
      <section className="algorithm-section">
        <AlgorithmSelector
          selected={state.algorithm}
          onSelect={setAlgorithm}
          timeQuantum={state.timeQuantum}
          onTimeQuantumChange={setTimeQuantum}
          disabled={isSimulating}
        />
      </section>

      {/* Main Content */}
      <div className="main-content">
        {/* Sidebar */}
        <aside className="sidebar">
          <ProcessForm
            onAddProcess={addProcess}
            disabled={isRunning}
          />

          <MetricsDashboard
            metrics={state.metrics}
            isCompleted={state.isCompleted}
          />
        </aside>

        {/* Visualization Area */}
        <main className="visualization-area">
          <div className="viz-section viz-section--horizontal">
            <ReadyQueue
              queue={state.readyQueue}
              runningPid={state.runningPid}
            />
          </div>

          <div className="viz-section viz-section--horizontal">
            <GanttChart
              gantt={state.gantt}
              currentTime={state.currentTime}
            />
          </div>

          <div className="viz-section viz-section--vertical">
            <ProcessTable
              processes={state.processes}
              runningPid={state.runningPid}
            />
          </div>
        </main>
      </div>

      {/* Footer */}
      <footer style={{
        textAlign: 'center',
        padding: '20px',
        color: 'var(--text-muted)',
        fontSize: '0.85rem'
      }}>
        <p>
          Built with C + WebAssembly + React •
          Algorithms: FCFS, SJF, SRTF, Priority, Round Robin, LJF, LRTF
        </p>
      </footer>
    </div>
  );
}

export default App;
