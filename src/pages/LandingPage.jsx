import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Card3D, SpotlightCard, FloatingParticles, Meteors, DotGrid, GlowText, BeamLine } from '../components/AceternityUI';

const algorithms = [
  { name: 'FCFS', full: 'First Come First Serve', type: 'Non-preemptive', desc: 'Processes execute in arrival order — simple and fair.', color: '#E64833' },
  { name: 'SJF', full: 'Shortest Job First', type: 'Non-preemptive', desc: 'Picks shortest burst — optimal avg waiting time.', color: '#90AEAD' },
  { name: 'SRTF', full: 'Shortest Remaining Time', type: 'Preemptive', desc: 'Preempts CPU when shorter job arrives.', color: '#874F41' },
  { name: 'Priority', full: 'Priority Scheduling', type: 'Non-preemptive', desc: 'Highest-priority process runs first.', color: '#FBE9D0' },
  { name: 'Round Robin', full: 'Time Quantum Slicing', type: 'Preemptive', desc: 'Equal CPU time slices for each process.', color: '#5ba3b5' },
  { name: 'LJF', full: 'Longest Job First', type: 'Non-preemptive', desc: 'Longest burst runs first.', color: '#d4956a' },
  { name: 'LRTF', full: 'Longest Remaining Time', type: 'Preemptive', desc: 'Preempts for longer remaining jobs.', color: '#7ec8a0' },
  { name: 'MLFQ', full: 'Multi-Level Feedback Queue', type: 'Preemptive', desc: '3-level queue with quantum demotion and priority aging.', color: '#c87e7e' },
];

const features = [
  { title: 'Kernel View', desc: 'Real-time 3D CPU core visualization with kernel event log and process state transitions.', color: '#E64833' },
  { title: '8 Algorithms', desc: 'FCFS, SJF, SRTF, Priority, Round Robin, LJF, LRTF, and MLFQ — all with live visualization.', color: '#90AEAD' },
  { title: 'Tick Simulation', desc: 'Discrete clock scheduler with per-tick Gantt chart, metrics, and ready queue updates.', color: '#874F41' },
  { title: 'ML Recommender', desc: 'AI-powered algorithm recommendation using trained RandomForest classifier.', color: '#FBE9D0' },
  { title: 'Live Analytics', desc: 'Real-time CPU utilization, throughput, wait times, and context switch graphs.', color: '#5ba3b5' },
  { title: 'Terminal', desc: 'Built-in terminal with commands for training, prediction, and comparison.', color: '#d4956a' },
];

const demoBlocks = [
  { label: 'P0', width: 64, color: '#E64833', delay: 0.8 },
  { label: 'P1', width: 64, color: '#90AEAD', delay: 1.3 },
  { label: 'P2', width: 48, color: '#874F41', delay: 1.8 },
  { label: 'P0', width: 64, color: '#E64833', delay: 2.3 },
  { label: 'P1', width: 40, color: '#90AEAD', delay: 2.8 },
  { label: 'P2', width: 64, color: '#874F41', delay: 3.3 },
];

const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 30, rotateX: 15 },
  visible: { opacity: 1, y: 0, rotateX: 0, transition: { type: 'spring', stiffness: 100 } },
};

export default function LandingPage() {
  return (
    <div className="landing" style={{ position: 'relative' }}>
      <DotGrid />

      <nav className="landing-nav">
        <div className="nav-brand">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#E64833" strokeWidth="1.5">
            <circle cx="12" cy="12" r="3" />
            <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9c.26.46.4.98.42 1.51h.09a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
          </svg>
          <span>Kernel Monitor</span>
        </div>
        <Link to="/simulator" className="nav-cta">
          Launch Simulator <span>→</span>
        </Link>
      </nav>

      {/* Hero */}
      <section className="hero" style={{ position: 'relative' }}>
        <FloatingParticles count={15} />
        <Meteors count={6} />

        <div className="hero-content" style={{ position: 'relative', zIndex: 2 }}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="hero-badge"
          >
            OS Kernel Simulation
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, type: 'spring', stiffness: 80 }}
          >
            CPU Scheduling<br />
            <GlowText color="#E64833" style={{ fontSize: 'inherit', fontWeight: 'inherit' }}>
              Kernel Visualizer
            </GlowText>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.45 }}
          >
            A realistic operating system scheduler monitor with 3D kernel visualization,
            8 scheduling algorithms, multi-level feedback queues, ML-powered recommendations,
            and discrete clock simulation.
          </motion.p>

          <motion.div
            className="hero-actions"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.55 }}
          >
            <Link to="/simulator" className="btn-hero-primary">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
              </svg>
              Open Simulator
            </Link>
            <Link to="/kernel" className="btn-hero-secondary">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <rect x="4" y="4" width="16" height="16" rx="2" /><rect x="9" y="9" width="6" height="6" rx="1" />
              </svg>
              Kernel View
            </Link>
          </motion.div>

          {/* 3D Demo Gantt */}
          <motion.div
            initial={{ opacity: 0, y: 40, rotateX: 15 }}
            animate={{ opacity: 1, y: 0, rotateX: 0 }}
            transition={{ delay: 0.7, type: 'spring', stiffness: 60 }}
            style={{ perspective: '800px', marginTop: '2.5rem' }}
          >
            <Card3D glowColor="rgba(230,72,51,0.12)">
              <div style={{ padding: '1rem' }}>
                <div className="demo-titlebar">
                  <div className="demo-dot" style={{ background: '#ff5f57' }} />
                  <div className="demo-dot" style={{ background: '#febc2e' }} />
                  <div className="demo-dot" style={{ background: '#28c840' }} />
                  <span style={{ marginLeft: '0.5rem', fontSize: '0.65rem', color: 'var(--color-kernel-text-muted)' }}>
                    scheduler-visualizer — Gantt Chart
                  </span>
                </div>
                <div className="demo-gantt">
                  {demoBlocks.map((b, i) => (
                    <motion.div
                      key={i}
                      className="demo-block"
                      style={{
                        width: `${b.width}px`,
                        backgroundColor: b.color,
                        boxShadow: `0 3px 12px ${b.color}44`,
                      }}
                      initial={{ opacity: 0, scaleX: 0, rotateY: 30 }}
                      animate={{ opacity: 1, scaleX: 1, rotateY: 0 }}
                      transition={{ delay: b.delay, type: 'spring', stiffness: 150 }}
                    >
                      {b.label}
                    </motion.div>
                  ))}
                </div>
                <BeamLine color="#E64833" duration={4} />
              </div>
            </Card3D>
          </motion.div>
        </div>
      </section>

      {/* Features */}
      <section className="features-section" style={{ position: 'relative', zIndex: 1 }}>
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          Built for <GlowText color="#E64833">Kernel Visualization</GlowText>
        </motion.h2>
        <motion.div
          className="features-grid"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-50px' }}
        >
          {features.map(({ title, desc, color }, i) => (
            <motion.div key={i} variants={itemVariants}>
              <Card3D glowColor={`${color}20`}>
                <div className="feature-card" style={{ padding: '1.5rem' }}>
                  <div className="feature-icon" style={{
                    background: `${color}15`,
                    borderColor: `${color}25`,
                    color,
                  }}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                      <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
                    </svg>
                  </div>
                  <h3>{title}</h3>
                  <p>{desc}</p>
                </div>
              </Card3D>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* Algorithms */}
      <section className="algorithms-section" style={{ position: 'relative', zIndex: 1 }}>
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          Scheduling <GlowText color="#90AEAD">Algorithms</GlowText>
        </motion.h2>
        <motion.div
          className="algorithms-grid"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-50px' }}
        >
          {algorithms.map((algo, i) => (
            <motion.div key={i} variants={itemVariants}>
              <SpotlightCard spotlightColor={algo.color}>
                <div className="algo-card" style={{
                  borderColor: algo.color,
                  borderLeft: `3px solid ${algo.color}`,
                  padding: '1.25rem',
                }}>
                  <div className="algo-card-header">
                    <span className="algo-name" style={{ color: algo.color }}>{algo.name}</span>
                    <span className="algo-type" style={{
                      background: algo.type === 'Preemptive' ? 'rgba(230,72,51,0.1)' : 'rgba(144,174,173,0.1)',
                      color: algo.type === 'Preemptive' ? '#E64833' : '#90AEAD',
                    }}>
                      {algo.type}
                    </span>
                  </div>
                  <div className="algo-fullname">{algo.full}</div>
                  <div className="algo-desc">{algo.desc}</div>
                </div>
              </SpotlightCard>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* CTA */}
      <section className="cta-section" style={{ position: 'relative', zIndex: 1 }}>
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          Ready to <GlowText color="#E64833">Explore?</GlowText>
        </motion.h2>
        <p>Start the simulator and observe how the OS kernel manages processes in real time.</p>
        <motion.div
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <Link to="/simulator" className="btn-hero-primary">
            Launch Now →
          </Link>
        </motion.div>
      </section>

      <footer className="footer" style={{ padding: '2rem', textAlign: 'center', borderTop: '1px solid rgba(144,174,173,0.1)', marginTop: '4rem' }}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
          <a href="https://github.com/sainath2212/CPU_SCHEDULING_VISUALIZER" target="_blank" rel="noreferrer"
            style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#90AEAD', textDecoration: 'none', fontWeight: 600, transition: 'color 0.2s' }}
            onMouseEnter={(e) => e.currentTarget.style.color = '#FBE9D0'}
            onMouseLeave={(e) => e.currentTarget.style.color = '#90AEAD'}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"></path>
            </svg>
            View on GitHub
          </a>
          <span style={{ color: 'var(--color-kernel-text-muted)', fontSize: '0.8rem' }}>
            CPU Scheduling Kernel Visualizer — Built with React, Python, and Machine Learning
          </span>
        </div>
      </footer>
    </div>
  );
}
