/**
 * Gantt Chart Component
 * Visual timeline of process execution
 */

const PROCESS_COLORS = [
    'var(--process-0)',
    'var(--process-1)',
    'var(--process-2)',
    'var(--process-3)',
    'var(--process-4)',
    'var(--process-5)',
    'var(--process-6)',
    'var(--process-7)',
];

export default function GanttChart({ gantt, currentTime }) {
    if (gantt.length === 0) {
        return (
            <div className="card">
                <div className="card-header">
                    <h3 className="card-title">
                        <svg className="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                            <line x1="16" y1="2" x2="16" y2="6" />
                            <line x1="8" y1="2" x2="8" y2="6" />
                            <line x1="3" y1="10" x2="21" y2="10" />
                        </svg>
                        Gantt Chart
                    </h3>
                </div>
                <div className="gantt-container">
                    <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '30px' }}>
                        Start the simulation to see the Gantt chart
                    </p>
                </div>
            </div>
        );
    }

    // Merge consecutive entries with same PID for cleaner display
    const mergedGantt = [];
    for (const entry of gantt) {
        const last = mergedGantt[mergedGantt.length - 1];
        if (last && last.pid === entry.pid && last.endTime === entry.startTime) {
            last.endTime = entry.endTime;
        } else {
            mergedGantt.push({ ...entry });
        }
    }

    // Calculate block width based on time
    const blockWidth = Math.max(30, Math.min(50, 600 / currentTime));

    return (
        <div className="card">
            <div className="card-header">
                <h3 className="card-title">
                    <svg className="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                        <line x1="16" y1="2" x2="16" y2="6" />
                        <line x1="8" y1="2" x2="8" y2="6" />
                        <line x1="3" y1="10" x2="21" y2="10" />
                    </svg>
                    Gantt Chart
                </h3>
                <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                    {mergedGantt.length} blocks
                </span>
            </div>

            <div className="gantt-container">
                <div className="gantt-chart">
                    {/* Main row */}
                    <div className="gantt-row">
                        <div className="gantt-label">CPU</div>
                        <div className="gantt-blocks">
                            {mergedGantt.map((entry, index) => {
                                const duration = entry.endTime - entry.startTime;
                                const isIdle = entry.pid === -1;

                                return (
                                    <div
                                        key={index}
                                        className={`gantt-block ${isIdle ? 'idle' : ''}`}
                                        style={{
                                            width: `${duration * blockWidth}px`,
                                            backgroundColor: isIdle ? undefined : PROCESS_COLORS[entry.pid % 8],
                                        }}
                                        title={isIdle
                                            ? `IDLE: ${entry.startTime} - ${entry.endTime}`
                                            : `P${entry.pid}: ${entry.startTime} - ${entry.endTime} (${duration} units)`
                                        }
                                    >
                                        {isIdle ? '-' : `P${entry.pid}`}
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* Timeline */}
                    <div className="gantt-timeline">
                        {Array.from({ length: currentTime + 1 }, (_, i) => (
                            <div
                                key={i}
                                className="gantt-time"
                                style={{ width: `${blockWidth}px` }}
                            >
                                {i}
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
