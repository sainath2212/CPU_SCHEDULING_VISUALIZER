/**
 * AnalyticsPage — Real-time metrics with Aceternity 3D chart cards.
 */

import { useEffect } from 'react';
import { motion } from 'framer-motion';
import {
    AreaChart, Area, LineChart, Line, BarChart, Bar,
    XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts';
import { useProcesses } from '../context/ProcessContext';
import useScheduler, { ALGORITHM_NAMES } from '../hooks/useScheduler';
import ControlPanel from '../components/ControlPanel';
import { Card3D, SpotlightCard, DotGrid, FloatingParticles, GlowText, AnimatedNumber } from '../components/AceternityUI';

const CHART_THEME = {
    grid: 'rgba(144,174,173,0.1)',
    text: '#E0E0E0',
    textDim: 'rgba(251,233,208,0.5)',
};

const charts = [
    { key: 'cpuUtilization', title: 'CPU Utilization (%)', type: 'area', color: '#E64833', glow: 'rgba(230,72,51,0.12)' },
    { key: 'readyQueueLength', title: 'Ready Queue Size', type: 'bar', color: '#874F41', glow: 'rgba(135,79,65,0.12)' },
    { key: 'avgWaitTime', title: 'Avg Wait Time', type: 'line', color: '#B0B0B0', glow: 'rgba(144,174,173,0.12)' },
    { key: 'throughput', title: 'Throughput', type: 'line', color: '#34d399', glow: 'rgba(52,211,153,0.12)' },
    { key: 'contextSwitches', title: 'Context Switches', type: 'line', color: '#fbbf24', glow: 'rgba(251,191,36,0.12)' },
];

const tooltipStyle = {
    backgroundColor: 'rgba(26,54,64,0.95)',
    border: '1px solid rgba(144,174,173,0.2)',
    borderRadius: '8px',
    fontSize: '0.75rem',
    color: '#E0E0E0',
};

function ChartCard({ title, data, dataKey, type, color, glow }) {
    return (
        <Card3D glowColor={glow}>
            <div style={{ padding: '1rem' }}>
                <div style={{
                    fontSize: '0.75rem', fontWeight: 700, marginBottom: '0.5rem',
                    color: 'var(--color-kernel-text)',
                }}>{title}</div>
                <ResponsiveContainer width="100%" height={200}>
                    {type === 'area' ? (
                        <AreaChart data={data}>
                            <CartesianGrid strokeDasharray="3 3" stroke={CHART_THEME.grid} />
                            <XAxis dataKey="tick" tick={{ fill: CHART_THEME.textDim, fontSize: 10 }} />
                            <YAxis tick={{ fill: CHART_THEME.textDim, fontSize: 10 }} />
                            <Tooltip contentStyle={tooltipStyle} />
                            <Area type="monotone" dataKey={dataKey} stroke={color} fill={color} fillOpacity={0.15} strokeWidth={2} />
                        </AreaChart>
                    ) : type === 'bar' ? (
                        <BarChart data={data}>
                            <CartesianGrid strokeDasharray="3 3" stroke={CHART_THEME.grid} />
                            <XAxis dataKey="tick" tick={{ fill: CHART_THEME.textDim, fontSize: 10 }} />
                            <YAxis tick={{ fill: CHART_THEME.textDim, fontSize: 10 }} />
                            <Tooltip contentStyle={tooltipStyle} />
                            <Bar dataKey={dataKey} fill={color} radius={[2, 2, 0, 0]} opacity={0.8} />
                        </BarChart>
                    ) : (
                        <LineChart data={data}>
                            <CartesianGrid strokeDasharray="3 3" stroke={CHART_THEME.grid} />
                            <XAxis dataKey="tick" tick={{ fill: CHART_THEME.textDim, fontSize: 10 }} />
                            <YAxis tick={{ fill: CHART_THEME.textDim, fontSize: 10 }} />
                            <Tooltip contentStyle={tooltipStyle} />
                            <Line type="monotone" dataKey={dataKey} stroke={color} strokeWidth={2} dot={false} />
                        </LineChart>
                    )}
                </ResponsiveContainer>
            </div>
        </Card3D>
    );
}

export default function AnalyticsPage() {
    const { masterWorkload, algorithm, quantum, loadSampleProcesses, clearProcesses, resetFromMaster } = useProcesses();
    const { state, isRunning, speed, setSpeed, initEngine, start, pause, step, runToEnd, resetSim } = useScheduler();

    useEffect(() => {
        if (masterWorkload.length > 0) {
            initEngine(masterWorkload, algorithm, quantum);
        }
    }, [masterWorkload, algorithm, quantum, initEngine]);

    const history = state.metricsHistory || [];

    return (
        <div style={{ minHeight: '100vh', background: 'var(--color-kernel-bg-deep)', position: 'relative' }}>
            <DotGrid />
            <FloatingParticles count={6} />

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

                <div className="page-container">
                    <div className="page-hero">
                        <div className="page-hero-icon-wrapper" style={{ background: 'rgba(230,72,51,0.1)', border: '1px solid rgba(230,72,51,0.2)' }}>
                            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#E64833" strokeWidth="1.5">
                                <path d="M3 3v18h18" /><path d="M7 16l4-8 4 4 5-10" />
                            </svg>
                        </div>
                        <div>
                            <h1 className="page-hero-title"><GlowText color="#E64833">Analytics</GlowText></h1>
                            <p className="page-hero-subtitle">
                                Real-time performance metrics — {ALGORITHM_NAMES[algorithm]} — <AnimatedNumber value={history.length} /> ticks recorded
                            </p>
                        </div>
                    </div>

                    {/* Live stats banner */}
                    {state.metrics && (
                        <SpotlightCard spotlightColor="#E64833">
                            <div style={{
                                padding: '0.75rem 1rem', display: 'flex', alignItems: 'center',
                                justifyContent: 'space-around', flexWrap: 'wrap', gap: '0.5rem',
                            }}>
                                {[
                                    { label: 'CPU %', value: state.metrics.cpuUtilization ?? 0, color: '#E64833' },
                                    { label: 'Avg Wait', value: state.metrics.avgWaitTime ?? 0, color: '#B0B0B0' },
                                    { label: 'Throughput', value: state.metrics.throughput ?? 0, color: '#34d399' },
                                    { label: 'Switches', value: state.contextSwitches ?? 0, color: '#fbbf24' },
                                ].map(({ label, value, color }) => (
                                    <div key={label} style={{ textAlign: 'center' }}>
                                        <div style={{
                                            fontFamily: "'JetBrains Mono', monospace",
                                            fontWeight: 800, fontSize: '1.1rem', color,
                                        }}>
                                            <AnimatedNumber value={value} />
                                        </div>
                                        <div style={{
                                            fontSize: '0.5rem', fontWeight: 600, color: 'var(--color-kernel-text-muted)',
                                            textTransform: 'uppercase', letterSpacing: '0.08em',
                                        }}>
                                            {label}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </SpotlightCard>
                    )}

                    {masterWorkload.length === 0 ? (
                        <div style={{ textAlign: 'center', padding: '3rem' }}>
                            <p style={{ color: 'var(--color-kernel-text-dim)', marginBottom: '1rem' }}>
                                Add processes in the Simulator to see live analytics.
                            </p>
                            <button className="btn btn-primary" onClick={loadSampleProcesses}>Load Samples</button>
                        </div>
                    ) : (
                        <div className="charts-grid" style={{ marginTop: '1rem' }}>
                            {charts.map(({ key, title, type, color, glow }, i) => (
                                <motion.div
                                    key={key}
                                    initial={{ opacity: 0, y: 30, rotateX: 10 }}
                                    animate={{ opacity: 1, y: 0, rotateX: 0 }}
                                    transition={{ delay: i * 0.08, type: 'spring', stiffness: 80 }}
                                >
                                    <ChartCard title={title} data={history} dataKey={key} type={type} color={color} glow={glow} />
                                </motion.div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
