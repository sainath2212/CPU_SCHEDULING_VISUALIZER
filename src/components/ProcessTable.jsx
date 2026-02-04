/**
 * Process Table Component
 * Displays all processes with their current state and timing info
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

export default function ProcessTable({ processes, runningPid }) {
    if (processes.length === 0) {
        return (
            <div className="card">
                <div className="card-header">
                    <h3 className="card-title">
                        <svg className="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <rect x="2" y="3" width="20" height="14" rx="2" />
                            <line x1="8" y1="21" x2="16" y2="21" />
                            <line x1="12" y1="17" x2="12" y2="21" />
                        </svg>
                        Processes
                    </h3>
                </div>
                <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '20px' }}>
                    No processes added yet. Add some processes to begin.
                </p>
            </div>
        );
    }

    return (
        <div className="card">
            <div className="card-header">
                <h3 className="card-title">
                    <svg className="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <rect x="2" y="3" width="20" height="14" rx="2" />
                        <line x1="8" y1="21" x2="16" y2="21" />
                        <line x1="12" y1="17" x2="12" y2="21" />
                    </svg>
                    Processes
                </h3>
                <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                    {processes.length} total
                </span>
            </div>

            <div style={{ overflowX: 'auto' }}>
                <table className="process-table">
                    <thead>
                        <tr>
                            <th>PID</th>
                            <th>Arrival</th>
                            <th>Burst</th>
                            <th>Priority</th>
                            <th>Remaining</th>
                            <th>State</th>
                            <th>Wait</th>
                            <th>TAT</th>
                        </tr>
                    </thead>
                    <tbody>
                        {processes.map((process) => (
                            <tr key={process.pid}>
                                <td>
                                    <span
                                        className="process-id"
                                        style={{ backgroundColor: PROCESS_COLORS[process.pid % 8] }}
                                    >
                                        P{process.pid}
                                    </span>
                                </td>
                                <td>{process.arrivalTime}</td>
                                <td>{process.burstTime}</td>
                                <td>{process.priority}</td>
                                <td>
                                    <span style={{
                                        fontFamily: 'JetBrains Mono, monospace',
                                        color: process.remainingTime > 0 ? 'var(--text-primary)' : 'var(--text-muted)'
                                    }}>
                                        {process.remainingTime}
                                    </span>
                                </td>
                                <td>
                                    <span className={`state-badge ${process.stateName.toLowerCase()}`}>
                                        {process.stateName}
                                    </span>
                                </td>
                                <td>{process.waitTime}</td>
                                <td>
                                    {process.stateName === 'TERMINATED' ? process.turnaroundTime : '-'}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
