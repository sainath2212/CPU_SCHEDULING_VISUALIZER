/**
 * Metrics Dashboard Component
 * Displays scheduling metrics in a grid of cards
 */

export default function MetricsDashboard({ metrics, isCompleted }) {
    const metricCards = [
        {
            label: 'Avg Wait Time',
            value: metrics.avgWaitTime.toFixed(2),
            unit: 'units',
            color: 'var(--process-0)'
        },
        {
            label: 'Avg Turnaround',
            value: metrics.avgTurnaroundTime.toFixed(2),
            unit: 'units',
            color: 'var(--process-1)'
        },
        {
            label: 'Avg Response',
            value: metrics.avgResponseTime.toFixed(2),
            unit: 'units',
            color: 'var(--process-2)'
        },
        {
            label: 'CPU Utilization',
            value: metrics.cpuUtilization.toFixed(1),
            unit: '%',
            color: 'var(--process-3)'
        },
        {
            label: 'Throughput',
            value: metrics.throughput.toFixed(3),
            unit: 'proc/unit',
            color: 'var(--process-4)'
        },
        {
            label: 'Total Time',
            value: metrics.totalExecutionTime,
            unit: 'units',
            color: 'var(--process-5)'
        }
    ];

    return (
        <div className="card">
            <div className="card-header">
                <h3 className="card-title">
                    <svg className="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <line x1="18" y1="20" x2="18" y2="10" />
                        <line x1="12" y1="20" x2="12" y2="4" />
                        <line x1="6" y1="20" x2="6" y2="14" />
                    </svg>
                    Metrics
                </h3>
                {!isCompleted && (
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                        Final metrics shown after completion
                    </span>
                )}
            </div>

            <div className="metrics-grid">
                {metricCards.map((metric, index) => (
                    <div key={index} className="metric-card">
                        <div
                            className="metric-value"
                            style={{
                                opacity: isCompleted ? 1 : 0.4,
                            }}
                        >
                            {metric.value}
                            <span style={{
                                fontSize: '0.6rem',
                                marginLeft: '4px',
                                opacity: 0.7
                            }}>
                                {metric.unit}
                            </span>
                        </div>
                        <div className="metric-label">{metric.label}</div>
                    </div>
                ))}
            </div>
        </div>
    );
}
