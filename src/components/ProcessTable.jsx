/**
 * ProcessTable — Merges master workload with backend state.
 * Displays PID, arrival, burst, priority, remaining, state, wait, TAT.
 */

const PROC_COLORS = ['#E64833', '#90AEAD', '#874F41', '#FBE9D0', '#5ba3b5', '#d4956a', '#7ec8a0', '#c87e7e'];

export default function ProcessTable({ processes, backendProcesses, runningPid, onRemove, disabled }) {
    if (!processes || processes.length === 0) {
        return (
            <div className="card">
                <div className="card-header">
                    <h3 className="card-title">
                        <svg className="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <rect x="3" y="3" width="18" height="18" rx="2" /><path d="M3 9h18" /><path d="M9 21V9" />
                        </svg>
                        Process Table
                    </h3>
                </div>
                <p style={{ color: 'var(--color-kernel-text-muted)', fontSize: '0.82rem', fontStyle: 'italic' }}>
                    No processes added yet.
                </p>
            </div>
        );
    }

    // Merge master + backend data
    const merged = processes.map(mp => {
        const bp = backendProcesses?.find(b => b.pid === mp.pid);
        return {
            pid: mp.pid,
            arrival: mp.arrival,
            burst: mp.burst,
            priority: mp.priority,
            remaining: bp?.remainingTime ?? mp.burst,
            state: bp?.stateName ?? 'NEW',
            waitTime: bp?.waitTime ?? 0,
            turnaroundTime: bp?.turnaroundTime ?? 0,
        };
    });

    return (
        <div className="card">
            <div className="card-header">
                <h3 className="card-title">
                    <svg className="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <rect x="3" y="3" width="18" height="18" rx="2" /><path d="M3 9h18" /><path d="M9 21V9" />
                    </svg>
                    Process Table
                </h3>
                <span style={{ fontSize: '0.7rem', color: 'var(--color-kernel-text-muted)' }}>
                    {merged.length} processes
                </span>
            </div>

            <div className="process-table-scroll">
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
                            <th></th>
                        </tr>
                    </thead>
                    <tbody>
                        {merged.map(p => (
                            <tr key={p.pid} className={p.pid === runningPid ? 'row-running' : ''}>
                                <td>
                                    <span className="process-id" style={{ backgroundColor: PROC_COLORS[p.pid % 8] }}>
                                        P{p.pid}
                                    </span>
                                </td>
                                <td>{p.arrival}</td>
                                <td>{p.burst}</td>
                                <td>{p.priority}</td>
                                <td>{p.remaining}</td>
                                <td><span className={`state-badge ${p.state.toLowerCase()}`}>{p.state}</span></td>
                                <td>{p.waitTime}</td>
                                <td>{p.state === 'TERMINATED' ? p.turnaroundTime : '-'}</td>
                                <td>
                                    {!disabled && (
                                        <button
                                            onClick={() => onRemove(p.pid)}
                                            title="Remove"
                                            style={{
                                                background: 'none', border: 'none', cursor: 'pointer',
                                                color: 'var(--color-kernel-text-muted)', padding: '2px',
                                            }}
                                        >
                                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                                            </svg>
                                        </button>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
