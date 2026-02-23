/**
 * ComparisonPage — Run all algorithms (including MLFQ) on the same workload.
 * Enhanced with Aceternity 3D cards and spotlight effects.
 */

import { useState } from 'react';
import { motion } from 'framer-motion';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
    ResponsiveContainer, Cell,
} from 'recharts';
import { useProcesses } from '../context/ProcessContext';
import { Card3D, SpotlightCard, DotGrid, FloatingParticles, GlowText } from '../components/AceternityUI';
import { MagicButton } from '../components/MagicButton';

const API = 'https://cpu-scheduling-visualizer-euxn.onrender.com/api/v2';
const ALGO_COLORS = ['#E64833', '#B0B0B0', '#874F41', '#E0E0E0', '#5ba3b5', '#d4956a', '#7ec8a0', '#c87e7e'];

const METRICS = [
    { key: 'avgWaitTime', label: 'Avg Wait Time', unit: 'units', lowerBetter: true },
    { key: 'avgTurnaroundTime', label: 'Avg Turnaround', unit: 'units', lowerBetter: true },
    { key: 'avgResponseTime', label: 'Avg Response', unit: 'units', lowerBetter: true },
    { key: 'cpuUtilization', label: 'CPU Utilization', unit: '%', lowerBetter: false },
    { key: 'contextSwitches', label: 'Context Switches', unit: '', lowerBetter: true },
];

const tooltipStyle = {
    backgroundColor: 'rgba(26,54,64,0.95)',
    border: '1px solid rgba(144,174,173,0.2)',
    borderRadius: '8px',
    fontSize: '0.75rem',
    color: '#E0E0E0',
};

export default function ComparisonPage() {
    const { masterWorkload, quantum, loadSampleProcesses } = useProcesses();
    const [results, setResults] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const runComparison = async () => {
        if (masterWorkload.length === 0) return;
        setLoading(true);
        setError(null);
        try {
            const procs = masterWorkload.map(p => ({
                arrival: p.arrival, burst: p.burst, priority: p.priority,
            }));
            const res = await fetch(`${API}/compare`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ processes: procs, quantum }),
            });
            const data = await res.json();
            if (data.ok) setResults(data.results);
            else setError(data.error);
        } catch (e) {
            setError(e.message);
        }
        setLoading(false);
    };

    const exportCSV = () => {
        if (!results) return;
        const algos = Object.keys(results);
        const headers = ['Algorithm', ...METRICS.map(m => m.label)];
        const rows = algos.map(algo => [
            algo, ...METRICS.map(m => results[algo][m.key] ?? 0)
        ]);
        const csv = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
        const blob = new Blob([csv], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'scheduler_comparison.csv';
        a.click();
        URL.revokeObjectURL(url);
    };

    const chartDataFor = (metricKey) => {
        if (!results) return [];
        return Object.entries(results).map(([algo, m], i) => ({
            name: algo, value: m[metricKey] ?? 0, fill: ALGO_COLORS[i % 8],
        }));
    };

    const bestAlgo = (metricKey, lowerBetter) => {
        if (!results) return '';
        const entries = Object.entries(results);
        if (lowerBetter) {
            return entries.reduce((a, b) => (b[1][metricKey] ?? Infinity) < (a[1][metricKey] ?? Infinity) ? b : a)[0];
        }
        return entries.reduce((a, b) => (b[1][metricKey] ?? 0) > (a[1][metricKey] ?? 0) ? b : a)[0];
    };

    return (
        <div style={{ minHeight: '100vh', background: 'var(--color-kernel-bg-deep)', position: 'relative' }}>
            <DotGrid />
            <FloatingParticles count={6} />

            <div className="page-container" style={{ position: 'relative', zIndex: 1 }}>
                <div className="page-hero">
                    <div className="page-hero-icon-wrapper" style={{ background: 'rgba(144,174,173,0.1)', border: '1px solid rgba(144,174,173,0.2)' }}>
                        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#B0B0B0" strokeWidth="1.5">
                            <rect x="3" y="12" width="4" height="8" rx="1" /><rect x="10" y="6" width="4" height="14" rx="1" /><rect x="17" y="3" width="4" height="17" rx="1" />
                        </svg>
                    </div>
                    <div>
                        <h1 className="page-hero-title">Algorithm <GlowText color="#B0B0B0">Comparison</GlowText></h1>
                        <p className="page-hero-subtitle">Run all 8 algorithms on the same workload</p>
                    </div>
                </div>

                {masterWorkload.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '3rem' }}>
                        <p style={{ color: 'var(--color-kernel-text-dim)', marginBottom: '1rem' }}>Add processes first.</p>
                        <MagicButton onClick={loadSampleProcesses}>Load Samples</MagicButton>
                    </div>
                ) : (
                    <>
                        <div className="controls-bar">
                            <div className="process-chip-row">
                                {masterWorkload.map(p => (
                                    <span key={p.pid} className="process-chip">P{p.pid} (a={p.arrival},b={p.burst})</span>
                                ))}
                            </div>
                            <div style={{ flex: 1 }} />
                            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                                <MagicButton onClick={runComparison} disabled={loading}>
                                    {loading ? 'Running all 8...' : 'Compare All'}
                                </MagicButton>
                            </motion.div>
                            {results && (
                                <motion.div whileHover={{ scale: 1.05 }}>
                                    <MagicButton onClick={exportCSV}>
                                        Export CSV
                                    </MagicButton>
                                </motion.div>
                            )}
                        </div>

                        {error && <div className="error-text">{error}</div>}

                        {results && (
                            <>
                                <div className="comp-charts-grid">
                                    {METRICS.map(({ key, label, lowerBetter }, i) => (
                                        <motion.div key={key} initial={{ opacity: 0, y: 30, rotateX: 10 }} animate={{ opacity: 1, y: 0, rotateX: 0 }} transition={{ delay: i * 0.08, type: 'spring', stiffness: 80 }}>
                                            <Card3D glowColor={`${ALGO_COLORS[i]}20`}>
                                                <div style={{ padding: '1rem' }}>
                                                    <div className="comp-chart-header">
                                                        <h4>{label}</h4>
                                                        <span className="best-badge" style={{
                                                            background: 'rgba(52,211,153,0.1)',
                                                            color: '#34d399',
                                                            border: '1px solid rgba(52,211,153,0.2)',
                                                        }}>
                                                            Best: {bestAlgo(key, lowerBetter)}
                                                        </span>
                                                    </div>
                                                    <ResponsiveContainer width="100%" height={200}>
                                                        <BarChart data={chartDataFor(key)}>
                                                            <CartesianGrid strokeDasharray="3 3" stroke="rgba(144,174,173,0.1)" />
                                                            <XAxis dataKey="name" tick={{ fill: 'rgba(251,233,208,0.5)', fontSize: 9 }} angle={-25} textAnchor="end" height={50} />
                                                            <YAxis tick={{ fill: 'rgba(251,233,208,0.5)', fontSize: 10 }} />
                                                            <Tooltip contentStyle={tooltipStyle} />
                                                            <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                                                                {chartDataFor(key).map((entry, idx) => (
                                                                    <Cell key={idx} fill={entry.fill} opacity={entry.name === bestAlgo(key, lowerBetter) ? 1 : 0.4} />
                                                                ))}
                                                            </Bar>
                                                        </BarChart>
                                                    </ResponsiveContainer>
                                                </div>
                                            </Card3D>
                                        </motion.div>
                                    ))}
                                </div>

                                {/* Results table */}
                                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
                                    <SpotlightCard>
                                        <div style={{ padding: '1rem' }}>
                                            <table className="comp-table">
                                                <thead>
                                                    <tr>
                                                        <th>Algorithm</th>
                                                        {METRICS.map(m => <th key={m.key}>{m.label}</th>)}
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {Object.entries(results).map(([algo, m], i) => (
                                                        <tr key={algo}>
                                                            <td style={{
                                                                fontWeight: 700, color: ALGO_COLORS[i % 8],
                                                                fontFamily: "'JetBrains Mono', monospace",
                                                            }}>
                                                                {algo}
                                                            </td>
                                                            {METRICS.map(({ key, lowerBetter }) => (
                                                                <td key={key} style={{
                                                                    color: algo === bestAlgo(key, lowerBetter) ? '#34d399' : undefined,
                                                                    fontWeight: algo === bestAlgo(key, lowerBetter) ? 800 : 400,
                                                                    fontFamily: "'JetBrains Mono', monospace",
                                                                }}>
                                                                    {typeof m[key] === 'number' ? m[key].toFixed ? m[key].toFixed(2) : m[key] : m[key] ?? 0}
                                                                </td>
                                                            ))}
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    </SpotlightCard>
                                </motion.div>
                            </>
                        )}
                    </>
                )}
            </div>
        </div>
    );
}
