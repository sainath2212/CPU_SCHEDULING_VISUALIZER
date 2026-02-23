/**
 * KernelViewPage — Real-time OS kernel monitor with Aceternity-style 3D effects.
 * 3-panel layout: left (clock/stats), center (3D CPU core/log), right (process states)
 */

import { useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useProcesses } from '../context/ProcessContext';
import useScheduler, { ALGORITHM_NAMES } from '../hooks/useScheduler';
import ControlPanel from '../components/ControlPanel';
import MLFQDeepView from '../components/MLFQDeepView';
import {
    CpuChip3D, SpotlightCard, AnimatedBorderCard,
    DotGrid, FloatingParticles, GlowText, BeamLine, AnimatedNumber,
} from '../components/AceternityUI';

const PROC_COLORS = ['#E64833', '#B0B0B0', '#874F41', '#E0E0E0', '#5ba3b5', '#d4956a', '#7ec8a0', '#c87e7e'];

function KernelClock({ time }) {
    return (
        <AnimatedBorderCard>
            <div style={{ padding: '1.25rem', textAlign: 'center' }}>
                <div style={{
                    fontSize: '0.55rem', fontWeight: 700, color: 'rgba(251,233,208,0.35)',
                    textTransform: 'uppercase', letterSpacing: '0.15em', marginBottom: '0.5rem',
                }}>
                    System Clock
                </div>
                <motion.div
                    key={time}
                    initial={{ scale: 1.3, opacity: 0, rotateX: 30 }}
                    animate={{ scale: 1, opacity: 1, rotateX: 0 }}
                    transition={{ type: 'spring', stiffness: 200, damping: 15 }}
                    style={{
                        fontFamily: "'JetBrains Mono', monospace",
                        fontSize: '3rem', fontWeight: 900,
                        background: 'linear-gradient(135deg, #E64833, #B0B0B0)',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                        backgroundClip: 'text',
                        lineHeight: 1,
                    }}
                >
                    {time}
                </motion.div>
                <div style={{
                    fontSize: '0.6rem', fontWeight: 600, color: 'rgba(251,233,208,0.25)',
                    marginTop: '0.35rem', textTransform: 'uppercase', letterSpacing: '0.1em',
                }}>
                    Tick
                </div>
                <BeamLine color="#E64833" duration={2} />
            </div>
        </AnimatedBorderCard>
    );
}

function KernelStats({ state }) {
    const items = [
        { label: 'Context Sw.', value: state.contextSwitches, color: '#E64833' },
        { label: 'Ready Queue', value: state.readyQueue?.length ?? 0, color: '#B0B0B0' },
        { label: 'Completed', value: state.processes?.filter(p => p.stateName === 'TERMINATED').length ?? 0, color: '#34d399' },
        { label: 'Total', value: state.processes?.length ?? 0, color: '#E0E0E0' },
    ];
    return (
        <SpotlightCard>
            <div style={{ padding: '1rem' }}>
                <h3 style={{
                    fontSize: '0.75rem', fontWeight: 700, marginBottom: '0.75rem',
                    display: 'flex', alignItems: 'center', gap: '0.4rem',
                    color: 'var(--color-kernel-text)',
                }}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M18 20V10" /><path d="M12 20V4" /><path d="M6 20v-6" />
                    </svg>
                    Scheduler Stats
                </h3>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
                    {items.map(({ label, value, color }) => (
                        <div key={label} style={{
                            textAlign: 'center', padding: '0.6rem 0.4rem',
                            background: `${color}08`, borderRadius: '0.5rem',
                            border: `1px solid ${color}15`,
                        }}>
                            <div style={{
                                fontFamily: "'JetBrains Mono', monospace",
                                fontSize: '1.2rem', fontWeight: 800, color,
                            }}>
                                <AnimatedNumber value={value} />
                            </div>
                            <div style={{
                                fontSize: '0.5rem', fontWeight: 600, color: 'rgba(251,233,208,0.35)',
                                textTransform: 'uppercase', letterSpacing: '0.06em', marginTop: '2px',
                            }}>
                                {label}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </SpotlightCard>
    );
}

function ProcessStateTable({ processes }) {
    if (!processes?.length) return null;
    return (
        <SpotlightCard>
            <div style={{ padding: '1rem' }}>
                <h3 style={{
                    fontSize: '0.75rem', fontWeight: 700, marginBottom: '0.75rem',
                    color: 'var(--color-kernel-text)',
                }}>Process States</h3>
                <div className="process-table-scroll">
                    <table className="process-table">
                        <thead>
                            <tr><th>PID</th><th>State</th><th>Remain</th><th>Wait</th><th>TAT</th></tr>
                        </thead>
                        <tbody>
                            <AnimatePresence>
                                {processes.map(p => (
                                    <motion.tr
                                        key={p.pid}
                                        className={p.stateName === 'RUNNING' ? 'row-running' : ''}
                                        layout
                                        initial={{ opacity: 0, x: 10 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ layout: { type: 'spring', stiffness: 200, damping: 25 } }}
                                    >
                                        <td><span className="process-id" style={{ backgroundColor: PROC_COLORS[p.pid % 8] }}>P{p.pid}</span></td>
                                        <td><span className={`state-badge ${p.stateName?.toLowerCase()}`}>{p.stateName}</span></td>
                                        <td style={{ fontFamily: 'var(--font-mono)' }}>{p.remainingTime}</td>
                                        <td style={{ fontFamily: 'var(--font-mono)' }}>{p.waitTime}</td>
                                        <td style={{ fontFamily: 'var(--font-mono)' }}>{p.stateName === 'TERMINATED' ? p.turnaroundTime : '-'}</td>
                                    </motion.tr>
                                ))}
                            </AnimatePresence>
                        </tbody>
                    </table>
                </div>
            </div>
        </SpotlightCard>
    );
}

function KernelLog({ log }) {
    const scrollRef = useRef(null);
    useEffect(() => {
        if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }, [log]);

    const eventClass = (e) => {
        switch (e) {
            case 'arrive': return 'kernel-log-event-arrive';
            case 'dispatch': return 'kernel-log-event-dispatch';
            case 'preempt': case 'demote': return 'kernel-log-event-preempt';
            case 'complete': case 'simulation_complete': return 'kernel-log-event-complete';
            case 'context_switch': return 'kernel-log-event-switch';
            default: return '';
        }
    };

    const formatEntry = (entry) => {
        switch (entry.event) {
            case 'arrive': return `P${entry.pid} arrived → ready queue`;
            case 'dispatch': return `P${entry.pid} dispatched to CPU`;
            case 'preempt': return `P${entry.pid} preempted (${entry.reason})`;
            case 'demote': return `P${entry.pid} demoted to lower queue`;
            case 'complete': return `P${entry.pid} finished execution`;
            case 'context_switch': return `context switch P${entry.from_pid} → P${entry.to_pid}`;
            case 'idle': return 'CPU idle — no runnable process';
            case 'simulation_complete': return '✓ All processes completed';
            default: return entry.event;
        }
    };

    return (
        <SpotlightCard spotlightColor="#B0B0B0" style={{ flex: 1 }}>
            <div style={{ padding: '1rem', display: 'flex', flexDirection: 'column', height: '100%' }}>
                <h3 style={{
                    fontSize: '0.75rem', fontWeight: 700, marginBottom: '0.5rem',
                    color: 'var(--color-kernel-text)',
                }}>Kernel Log</h3>
                <div className="kernel-log-container" ref={scrollRef} style={{ flex: 1 }}>
                    {(!log || log.length === 0) ? (
                        <div style={{ color: 'var(--color-kernel-text-muted)', fontStyle: 'italic' }}>
                            Start simulation to see kernel events...
                        </div>
                    ) : (
                        log.map((entry, i) => (
                            <motion.div
                                key={i}
                                className="kernel-log-entry"
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ duration: 0.15 }}
                            >
                                <span className="kernel-log-tick">[t={entry.tick}]</span>{' '}
                                <span className={eventClass(entry.event)}>{formatEntry(entry)}</span>
                            </motion.div>
                        ))
                    )}
                </div>
            </div>
        </SpotlightCard>
    );
}

export default function KernelViewPage() {
    const { masterWorkload, algorithm, quantum, loadSampleProcesses, clearProcesses, resetFromMaster } = useProcesses();
    const { state, isRunning, speed, setSpeed, initEngine, start, pause, step, runToEnd, resetSim } = useScheduler();

    useEffect(() => {
        if (masterWorkload.length > 0) {
            initEngine(masterWorkload, algorithm, quantum);
        }
    }, [masterWorkload, algorithm, quantum, initEngine]);

    const isMLFQ = algorithm === 7;
    const runningProc = state.runningPid >= 0 ? state.processes?.find(p => p.pid === state.runningPid) : null;
    const progress = runningProc ? ((runningProc.burstTime - runningProc.remainingTime) / runningProc.burstTime) * 100 : 0;

    return (
        <div style={{ minHeight: '100vh', background: 'var(--color-kernel-bg-deep)', position: 'relative' }}>
            <DotGrid />
            <FloatingParticles count={8} />

            <div style={{ position: 'relative', zIndex: 1 }}>
                <ControlPanel
                    currentTime={state.currentTime}
                    isRunning={isRunning}
                    isCompleted={state.isCompleted}
                    processCount={masterWorkload.length}
                    speed={speed}
                    onStart={start}
                    onPause={pause}
                    onStep={step}
                    onReset={() => { resetFromMaster(); resetSim(); }}
                    onClear={clearProcesses}
                    onSpeedChange={setSpeed}
                    onRunToEnd={runToEnd}
                />

                {masterWorkload.length === 0 ? (
                    <div className="page-container" style={{ textAlign: 'center', paddingTop: '4rem' }}>
                        <h2 style={{ marginBottom: '1rem', fontSize: '1.5rem', fontWeight: 800 }}>
                            <GlowText>No Processes Loaded</GlowText>
                        </h2>
                        <p style={{ color: 'var(--color-kernel-text-dim)', marginBottom: '1.5rem' }}>
                            Add processes in the Simulator tab or load sample data.
                        </p>
                        <button className="btn btn-primary" onClick={loadSampleProcesses}>Load Sample Processes</button>
                    </div>
                ) : (
                    <div className="page-container">
                        <div className="kernel-layout">
                            {/* LEFT: Clock + Stats */}
                            <div className="kernel-left">
                                <motion.div initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }} transition={{ type: 'spring', stiffness: 100 }}>
                                    <KernelClock time={state.currentTime} />
                                </motion.div>
                                <motion.div initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }} transition={{ type: 'spring', stiffness: 100, delay: 0.1 }}>
                                    <KernelStats state={state} />
                                </motion.div>
                                <motion.div initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }} transition={{ type: 'spring', stiffness: 100, delay: 0.15 }}>
                                    <SpotlightCard spotlightColor="#874F41">
                                        <div style={{ padding: '1rem' }}>
                                            <div style={{ fontSize: '0.55rem', fontWeight: 600, color: 'var(--color-kernel-text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Algorithm</div>
                                            <div style={{ fontSize: '1.1rem', fontWeight: 800, marginTop: '0.25rem' }}>
                                                <GlowText color="#E64833">{ALGORITHM_NAMES[algorithm]}</GlowText>
                                            </div>
                                            <div style={{ fontSize: '0.7rem', color: 'var(--color-kernel-text-muted)', marginTop: '4px' }}>
                                                {state.isCompleted ? '✓ Completed' : isRunning ? 'Running...' : 'Paused'}
                                            </div>
                                        </div>
                                    </SpotlightCard>
                                </motion.div>
                            </div>

                            {/* CENTER: 3D CPU Core + Log */}
                            <div className="kernel-center">
                                <motion.div initial={{ opacity: 0, y: 30, rotateX: 15 }} animate={{ opacity: 1, y: 0, rotateX: 0 }} transition={{ type: 'spring', stiffness: 80 }}>
                                    <CpuChip3D
                                        isActive={state.runningPid >= 0}
                                        processName={state.runningPid >= 0 ? `P${state.runningPid}` : 'IDLE'}
                                        progress={progress}
                                        remaining={runningProc?.remainingTime ?? 0}
                                        total={runningProc?.burstTime ?? 0}
                                    />
                                </motion.div>

                                {/* MLFQ Deep View or Kernel Log */}
                                {isMLFQ && state.mlfqState ? (
                                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
                                        <MLFQDeepView mlfqState={state.mlfqState} runningPid={state.runningPid} />
                                    </motion.div>
                                ) : null}

                                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
                                    <KernelLog log={state.kernelLog} />
                                </motion.div>
                            </div>

                            {/* RIGHT: Process States */}
                            <div className="kernel-right">
                                <motion.div initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} transition={{ type: 'spring', stiffness: 100 }}>
                                    <ProcessStateTable processes={state.processes} />
                                </motion.div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
