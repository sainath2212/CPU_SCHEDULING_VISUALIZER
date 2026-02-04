/**
 * Control Panel Component
 * Simulation controls: Play, Pause, Step, Reset, Speed
 */

export default function ControlPanel({
    currentTime,
    isRunning,
    isCompleted,
    processCount,
    speed,
    onStart,
    onPause,
    onStep,
    onReset,
    onClear,
    onSpeedChange,
    onRunToEnd
}) {
    const canStart = processCount > 0 && !isCompleted && !isRunning;
    const canStep = processCount > 0 && !isCompleted && !isRunning;
    const canPause = isRunning;

    return (
        <div className="control-panel">
            <div className="control-section">
                <div className="time-display">
                    T = {currentTime}
                </div>
            </div>

            <div className="control-divider" />

            <div className="control-section">
                {/* Play/Pause */}
                {isRunning ? (
                    <button
                        className="btn btn-secondary btn-icon"
                        onClick={onPause}
                        title="Pause"
                    >
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                            <rect x="6" y="4" width="4" height="16" />
                            <rect x="14" y="4" width="4" height="16" />
                        </svg>
                    </button>
                ) : (
                    <button
                        className="btn btn-success btn-icon"
                        onClick={onStart}
                        disabled={!canStart}
                        title="Start"
                    >
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                            <polygon points="5,3 19,12 5,21" />
                        </svg>
                    </button>
                )}

                {/* Step */}
                <button
                    className="btn btn-secondary btn-icon"
                    onClick={onStep}
                    disabled={!canStep}
                    title="Step (1 time unit)"
                >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <polygon points="5,4 15,12 5,20" fill="currentColor" />
                        <line x1="19" y1="5" x2="19" y2="19" />
                    </svg>
                </button>

                {/* Run to End */}
                <button
                    className="btn btn-secondary btn-icon"
                    onClick={onRunToEnd}
                    disabled={!canStep}
                    title="Run to completion"
                >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <polygon points="4,4 12,12 4,20" fill="currentColor" />
                        <polygon points="12,4 20,12 12,20" fill="currentColor" />
                    </svg>
                </button>

                {/* Reset */}
                <button
                    className="btn btn-secondary btn-icon"
                    onClick={onReset}
                    disabled={currentTime === 0}
                    title="Reset simulation"
                >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <polyline points="1,4 1,10 7,10" />
                        <path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10" />
                    </svg>
                </button>

                {/* Clear All */}
                <button
                    className="btn btn-danger btn-icon"
                    onClick={onClear}
                    disabled={processCount === 0}
                    title="Clear all processes"
                >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <polyline points="3,6 5,6 21,6" />
                        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                    </svg>
                </button>
            </div>

            <div className="control-divider" />

            <div className="control-section">
                <label style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginRight: '8px' }}>
                    Speed:
                </label>
                <input
                    type="range"
                    className="speed-slider"
                    min="50"
                    max="2000"
                    value={2050 - speed}
                    onChange={(e) => onSpeedChange(2050 - parseInt(e.target.value))}
                />
                <span style={{
                    fontSize: '0.8rem',
                    color: 'var(--text-muted)',
                    minWidth: '50px',
                    fontFamily: 'JetBrains Mono, monospace'
                }}>
                    {speed}ms
                </span>
            </div>

            {isCompleted && (
                <div className="control-section" style={{ marginLeft: 'auto' }}>
                    <span style={{
                        padding: '8px 16px',
                        background: 'rgba(99, 102, 241, 0.2)',
                        color: 'var(--accent-primary)',
                        borderRadius: 'var(--radius-md)',
                        fontSize: '0.85rem',
                        fontWeight: '600'
                    }}>
                        ✓ Simulation Complete
                    </span>
                </div>
            )}
        </div>
    );
}
