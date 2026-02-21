import { Link } from 'react-router-dom';

const algorithms = [
  { name: 'FCFS', full: 'First Come First Serve', type: 'Non-preemptive', desc: 'Processes execute in the exact order they arrive — simple and fair.', color: '#6366f1' },
  { name: 'SJF', full: 'Shortest Job First', type: 'Non-preemptive', desc: 'Picks the shortest burst next — optimal average waiting time.', color: '#f59e0b' },
  { name: 'SRTF', full: 'Shortest Remaining Time', type: 'Preemptive', desc: 'Preempts the CPU whenever a shorter job arrives.', color: '#ef4444' },
  { name: 'Priority', full: 'Priority Scheduling', type: 'Non-preemptive', desc: 'Highest-priority process (lowest number) runs first.', color: '#10b981' },
  { name: 'Round Robin', full: 'Time Quantum Slicing', type: 'Preemptive', desc: 'Each process gets equal CPU time slices — very fair.', color: '#3b82f6' },
  { name: 'LJF', full: 'Longest Job First', type: 'Non-preemptive', desc: 'Longest burst runs first — studied for worst-case analysis.', color: '#ec4899' },
  { name: 'LRTF', full: 'Longest Remaining Time', type: 'Preemptive', desc: 'Preempts for longer remaining jobs — the opposite of SRTF.', color: '#8b5cf6' },
];

const features = [
  { icon: '⚡', title: 'Real-Time Simulation', desc: 'Watch CPU scheduling happen step by step with smooth, animated transitions between process states.' },
  { icon: '🧠', title: '7 Algorithms', desc: 'All major scheduling algorithms — from simple FCFS to preemptive SRTF and Round Robin.' },
  { icon: '📊', title: 'Gantt Charts', desc: 'Visual timeline showing exactly when each process ran on the CPU.' },
  { icon: '📈', title: 'Performance Metrics', desc: 'Average wait time, turnaround, response time, CPU utilization, and throughput.' },
  { icon: '🎮', title: 'Interactive Controls', desc: 'Step through one tick at a time, auto-run, adjust speed, pause, and reset.' },
  { icon: '🔧', title: 'WebAssembly Engine', desc: 'Core scheduler written in C and compiled to WebAssembly for native speed.' },
];

const demoBlocks = [
  { label: 'P0', width: 64, color: 'var(--process-0)', delay: '0.8s' },
  { label: 'P1', width: 64, color: 'var(--process-1)', delay: '1.3s' },
  { label: 'P2', width: 64, color: 'var(--process-2)', delay: '1.8s' },
  { label: 'P0', width: 64, color: 'var(--process-0)', delay: '2.3s' },
  { label: 'P1', width: 44, color: 'var(--process-1)', delay: '2.8s' },
  { label: 'P2', width: 64, color: 'var(--process-2)', delay: '3.3s' },
];

export default function LandingPage() {
  return (
    <div className="landing">
      {/* ── Navigation ── */}
      <nav className="landing-nav">
        <div className="nav-brand">
          <span className="nav-logo">⚙️</span>
          <span className="nav-name">CPU Scheduler</span>
        </div>
        <Link to="/simulator" className="nav-cta">
          Launch Simulator
          <span className="nav-cta-arrow">→</span>
        </Link>
      </nav>

      {/* ── Hero ── */}
      <section className="hero">
        <div className="hero-bg">
          <div className="orb orb-1" />
          <div className="orb orb-2" />
          <div className="orb orb-3" />
        </div>

        <div className="hero-content">
          <div className="hero-badge">Open-Source CPU Scheduling Simulator</div>
          <h1 className="hero-title">
            Visualize How Your{' '}
            <span className="gradient-text">CPU Schedules Processes</span>
          </h1>
          <p className="hero-subtitle">
            Interactive simulation of 7 scheduling algorithms with real-time
            Gantt charts, process state tracking, and performance metrics —
            built with C, WebAssembly, and React.
          </p>
          <div className="hero-actions">
            <Link to="/simulator" className="btn-hero-primary">
              Start Simulating
              <span className="btn-arrow">→</span>
            </Link>
            <a href="#algorithms" className="btn-hero-secondary">
              Explore Algorithms
            </a>
          </div>
        </div>

        {/* Animated scheduler demo */}
        <div className="hero-demo">
          <div className="demo-window">
            <div className="demo-titlebar">
              <div className="demo-dots">
                <span className="dot dot-red" />
                <span className="dot dot-yellow" />
                <span className="dot dot-green" />
              </div>
              <span className="demo-title-text">Gantt Chart — Round Robin (Q=2)</span>
            </div>
            <div className="demo-body">
              <div className="demo-row">
                <span className="demo-label">CPU</span>
                <div className="demo-blocks">
                  {demoBlocks.map((b, i) => (
                    <div
                      key={i}
                      className="demo-block"
                      style={{
                        width: b.width,
                        background: b.color,
                        animationDelay: b.delay,
                      }}
                    >
                      {b.label}
                    </div>
                  ))}
                </div>
              </div>
              <div className="demo-timeline">
                <span className="demo-label" />
                {[0, 2, 4, 6, 8, 9, 11].map((t) => (
                  <span key={t} className="demo-time">{t}</span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Features ── */}
      <section className="features-section">
        <h2 className="section-title">
          Powerful <span className="gradient-text">Features</span>
        </h2>
        <p className="section-subtitle">
          Everything you need to understand CPU scheduling algorithms
        </p>
        <div className="features-grid">
          {features.map((f, i) => (
            <div
              key={i}
              className="feature-card"
              style={{ animationDelay: `${0.1 * i}s` }}
            >
              <div className="feature-icon">{f.icon}</div>
              <h3>{f.title}</h3>
              <p>{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Algorithms ── */}
      <section className="algorithms-section" id="algorithms">
        <h2 className="section-title">
          Supported <span className="gradient-text">Algorithms</span>
        </h2>
        <p className="section-subtitle">
          7 CPU scheduling algorithms — each one explained and visualized
        </p>
        <div className="algo-grid">
          {algorithms.map((a, i) => (
            <div
              key={i}
              className="algo-card"
              style={{ '--algo-color': a.color }}
            >
              <div className="algo-header">
                <span className="algo-name" style={{ color: a.color }}>{a.name}</span>
                <span
                  className={`algo-type ${a.type === 'Preemptive' ? 'preemptive' : 'non-preemptive'}`}
                >
                  {a.type}
                </span>
              </div>
              <div className="algo-full">{a.full}</div>
              <p className="algo-desc">{a.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="cta-section">
        <div className="cta-bg">
          <div className="orb orb-cta-1" />
          <div className="orb orb-cta-2" />
        </div>
        <div className="cta-content">
          <h2>Ready to Simulate?</h2>
          <p>
            Add processes, pick an algorithm, and watch the CPU scheduler in
            action with real-time visualization.
          </p>
          <Link to="/simulator" className="btn-hero-primary btn-large">
            Launch Simulator
            <span className="btn-arrow">→</span>
          </Link>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="landing-footer">
        <div className="footer-content">
          <span className="footer-brand">⚙️ CPU Scheduling Visualizer</span>
          <span className="footer-tech">Built with C · WebAssembly · React</span>
        </div>
      </footer>
    </div>
  );
}
