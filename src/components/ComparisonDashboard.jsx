import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
    ResponsiveContainer, Cell
} from 'recharts';
import { useState } from 'react';
import { useProcesses } from '../context/ProcessContext';
import { CompareIcon, PlayIcon, DownloadIcon } from '../components/Icons';
import { MagicButton } from '../components/MagicButton';

const API_BASE = 'https://cpu-scheduling-visualizer-euxn.onrender.com';

const ALGO_COLORS = [
    '#6366f1', '#f59e0b', '#ef4444', '#10b981', '#3b82f6', '#ec4899', '#8b5cf6'
];

/**
 * Comparison Dashboard — uses processes from the shared context.
 */
export default function ComparisonDashboard() {
    const { processes, quantum } = useProcesses();
    const [results, setResults] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const runComparison = async () => {
        if (processes.length === 0) {
            setError('Add processes in the Simulator first.');
            return;
        }
        setLoading(true);
        setError('');
        try {
            const res = await fetch(`${API_BASE}/api/v2/compare`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ processes, quantum }),
            });
            const data = await res.json();
            if (data.ok) {
                setResults(data.results);
            } else {
                setError(data.error || 'Comparison failed');
            }
        } catch (err) {
            setError('Failed to connect to backend. Make sure the server is running.');
        }
        setLoading(false);
    };

    const exportCSV = () => {
        if (!results) return;
        const algos = Object.keys(results);
        const metrics = Object.keys(results[algos[0]]);
        let csv = 'Algorithm,' + metrics.join(',') + '\n';
        for (const algo of algos) {
            csv += algo + ',' + metrics.map(m => results[algo][m]).join(',') + '\n';
        }
        const blob = new Blob([csv], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'scheduling_comparison.csv';
        a.click();
        URL.revokeObjectURL(url);
    };

    // Prepare chart data
    const chartData = results
        ? Object.entries(results).map(([algo, metrics], i) => ({
            algorithm: algo,
            ...metrics,
            fill: ALGO_COLORS[i % ALGO_COLORS.length],
        }))
        : [];

    // Find best algorithm per metric
    const findBest = (key, lower = true) => {
        if (!results) return null;
        const entries = Object.entries(results);
        const sorted = entries.sort((a, b) => lower ? a[1][key] - b[1][key] : b[1][key] - a[1][key]);
        return sorted[0]?.[0];
    };

    return (
        <div className="comparison-dashboard">
            {/* Process Info Banner */}
            {processes.length === 0 ? (
                <div className="info-banner info-banner--warning">
                    <div className="info-banner-content">
                        <strong>No processes loaded.</strong> Go to the Simulator tab to add processes first.
                    </div>
                </div>
            ) : (
                <div className="info-banner info-banner--info">
                    <div className="info-banner-content">
                        <strong>{processes.length} processes</strong> from Simulator — Time Quantum: {quantum}
                        <div className="process-chip-row">
                            {processes.map((p, i) => (
                                <span key={i} className="process-chip">
                                    P{i} <span className="chip-detail">A:{p.arrival} B:{p.burst} P:{p.priority}</span>
                                </span>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {/* Action Bar */}
            <div className="controls-bar">
                <MagicButton
                    onClick={runComparison}
                    disabled={loading || processes.length === 0}
                >
                    <CompareIcon size={14} style={{ marginRight: '6px' }} />
                    {loading ? 'Running all algorithms...' : 'Compare All Algorithms'}
                </MagicButton>
                {results && (
                    <MagicButton onClick={exportCSV}>
                        <DownloadIcon size={14} style={{ marginRight: '6px' }} />
                        Export CSV
                    </MagicButton>
                )}
                {error && <span className="error-text">{error}</span>}
            </div>

            {/* Results */}
            {results && (
                <div className="comp-results">
                    {/* Bar Charts */}
                    <div className="comp-charts-grid">
                        {[
                            { key: 'avgWaitTime', title: 'Avg Wait Time', unit: '', lowerBetter: true },
                            { key: 'avgTurnaroundTime', title: 'Avg Turnaround Time', unit: '', lowerBetter: true },
                            { key: 'avgResponseTime', title: 'Avg Response Time', unit: '', lowerBetter: true },
                            { key: 'cpuUtilization', title: 'CPU Utilization', unit: '%', lowerBetter: false },
                            { key: 'throughput', title: 'Throughput', unit: '', lowerBetter: false },
                            { key: 'contextSwitches', title: 'Context Switches', unit: '', lowerBetter: true },
                        ].map(({ key, title, unit, lowerBetter }) => (
                            <div key={key} className="comp-chart-card">
                                <div className="comp-chart-header">
                                    <h4>{title}</h4>
                                    {findBest(key, lowerBetter) && (
                                        <span className="best-badge">Best: {findBest(key, lowerBetter)}</span>
                                    )}
                                </div>
                                <ResponsiveContainer width="100%" height={200}>
                                    <BarChart data={chartData} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
                                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                                        <XAxis
                                            dataKey="algorithm"
                                            stroke="rgba(255,255,255,0.3)"
                                            tick={{ fill: 'rgba(255,255,255,0.6)', fontSize: 10 }}
                                        />
                                        <YAxis
                                            stroke="rgba(255,255,255,0.3)"
                                            tick={{ fill: 'rgba(255,255,255,0.5)', fontSize: 10 }}
                                            unit={unit}
                                        />
                                        <Tooltip
                                            contentStyle={{
                                                background: 'rgba(15, 15, 30, 0.95)',
                                                border: '1px solid rgba(255,255,255,0.1)',
                                                borderRadius: 8,
                                                color: '#fff',
                                                fontSize: 12,
                                            }}
                                        />
                                        <Bar dataKey={key} radius={[4, 4, 0, 0]}>
                                            {chartData.map((entry, i) => (
                                                <Cell
                                                    key={i}
                                                    fill={ALGO_COLORS[i % ALGO_COLORS.length]}
                                                    opacity={entry.algorithm === findBest(key, lowerBetter) ? 1 : 0.6}
                                                />
                                            ))}
                                        </Bar>
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        ))}
                    </div>

                    {/* Summary Table */}
                    <div className="comp-table-wrapper">
                        <h3>Summary Table</h3>
                        <table className="comp-table">
                            <thead>
                                <tr>
                                    <th>Algorithm</th>
                                    <th>Avg Wait</th>
                                    <th>Avg TAT</th>
                                    <th>Avg Response</th>
                                    <th>CPU Util %</th>
                                    <th>Throughput</th>
                                    <th>Ctx Switches</th>
                                </tr>
                            </thead>
                            <tbody>
                                {Object.entries(results).map(([algo, m], i) => (
                                    <tr key={algo} style={{ borderLeft: `3px solid ${ALGO_COLORS[i]}` }}>
                                        <td className="comp-algo-name">{algo}</td>
                                        <td>{m.avgWaitTime}</td>
                                        <td>{m.avgTurnaroundTime}</td>
                                        <td>{m.avgResponseTime}</td>
                                        <td>{m.cpuUtilization}%</td>
                                        <td>{m.throughput}</td>
                                        <td>{m.contextSwitches}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
}
