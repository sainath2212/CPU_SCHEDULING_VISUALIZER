/**
 * Ready Queue Component
 * Visual representation of the ready queue
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

export default function ReadyQueue({ queue, runningPid }) {
    return (
        <div className="card">
            <div className="card-header">
                <h3 className="card-title">
                    <svg className="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <line x1="8" y1="6" x2="21" y2="6" />
                        <line x1="8" y1="12" x2="21" y2="12" />
                        <line x1="8" y1="18" x2="21" y2="18" />
                        <line x1="3" y1="6" x2="3.01" y2="6" />
                        <line x1="3" y1="12" x2="3.01" y2="12" />
                        <line x1="3" y1="18" x2="3.01" y2="18" />
                    </svg>
                    Ready Queue
                </h3>
                <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                    {queue.length} waiting
                </span>
            </div>

            <div className="ready-queue-row" style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                {/* Running process */}
                <div style={{ textAlign: 'center' }}>
                    <div style={{
                        fontSize: '0.7rem',
                        color: 'var(--text-muted)',
                        marginBottom: '4px',
                        textTransform: 'uppercase',
                        letterSpacing: '0.05em'
                    }}>
                        CPU
                    </div>
                    <div style={{
                        width: '48px',
                        height: '48px',
                        borderRadius: 'var(--radius-md)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontWeight: '600',
                        fontSize: '0.9rem',
                        color: 'white',
                        background: runningPid !== -1
                            ? PROCESS_COLORS[runningPid % 8]
                            : 'var(--bg-tertiary)',
                        boxShadow: runningPid !== -1
                            ? '0 0 20px ' + PROCESS_COLORS[runningPid % 8]
                            : 'none',
                        transition: 'all 0.3s ease'
                    }}>
                        {runningPid !== -1 ? `P${runningPid}` : 'IDLE'}
                    </div>
                </div>

                <div style={{
                    fontSize: '1.5rem',
                    color: 'var(--text-muted)'
                }}>
                    ←
                </div>

                {/* Queue */}
                <div className="ready-queue-visual" style={{ flex: 1 }}>
                    {queue.length === 0 ? (
                        <span className="queue-empty">Queue is empty</span>
                    ) : (
                        queue.map((pid, index) => (
                            <div key={`${pid}-${index}`} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                {index > 0 && <span className="queue-arrow">→</span>}
                                <div
                                    className="queue-item"
                                    style={{ backgroundColor: PROCESS_COLORS[pid % 8] }}
                                >
                                    P{pid}
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
}
