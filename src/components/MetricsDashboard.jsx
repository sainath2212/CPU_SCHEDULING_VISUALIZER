/**
 * MetricsDashboard — Displays scheduling metrics in a compact card grid.
 */

const metricDefs = [
    { key: 'avgWaitTime', label: 'Avg Wait', format: v => v.toFixed(2) },
    { key: 'avgTurnaroundTime', label: 'Avg TAT', format: v => v.toFixed(2) },
    { key: 'avgResponseTime', label: 'Avg Response', format: v => v.toFixed(2) },
    { key: 'cpuUtilization', label: 'CPU Util %', format: v => v.toFixed(1) },
    { key: 'throughput', label: 'Throughput', format: v => v.toFixed(3) },
    { key: 'totalExecutionTime', label: 'Total Time', format: v => v },
];

export default function MetricsDashboard({ metrics, isCompleted }) {
    return (
        <div className="card">
            <div className="card-header">
                <h3 className="card-title">
                    <svg className="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M18 20V10" /><path d="M12 20V4" /><path d="M6 20v-6" />
                    </svg>
                    Metrics
                </h3>
                {isCompleted && (
                    <span style={{
                        fontSize: '0.55rem', fontWeight: 700, padding: '2px 6px',
                        borderRadius: '999px', background: 'rgba(52,211,153,0.1)', color: '#34d399',
                        textTransform: 'uppercase', letterSpacing: '0.05em',
                    }}>
                        Final
                    </span>
                )}
            </div>
            <div className="metrics-grid">
                {metricDefs.map(({ key, label, format }) => (
                    <div key={key} className="metric-card">
                        <div className="metric-value">{format(metrics?.[key] ?? 0)}</div>
                        <div className="metric-label">{label}</div>
                    </div>
                ))}
            </div>
        </div>
    );
}
