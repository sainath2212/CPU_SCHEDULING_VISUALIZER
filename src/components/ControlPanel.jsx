/**
 * ControlPanel — Play, Pause, Step, Reset, Speed controls with SVG icons.
 */

export default function ControlPanel({
    currentTime, isRunning, isCompleted, processCount,
    speed, onStart, onPause, onStep, onReset, onClear, onSpeedChange, onRunToEnd,
}) {
    const disabled = processCount === 0;

    return (
        <div className="control-panel">
            <div className="control-section">
                <span className="time-display">t = {currentTime}</span>
            </div>

            <div className="control-divider" />

            <div className="control-section">
                {!isRunning ? (
                    <button className="btn btn-primary btn-icon" title="Play" onClick={onStart} disabled={disabled || isCompleted}>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3" /></svg>
                    </button>
                ) : (
                    <button className="btn btn-secondary btn-icon" title="Pause" onClick={onPause}>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="4" width="4" height="16" /><rect x="14" y="4" width="4" height="16" /></svg>
                    </button>
                )}

                <button className="btn btn-secondary btn-icon" title="Step" onClick={onStep} disabled={disabled || isCompleted || isRunning}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <rect x="14" y="4" width="4" height="16" fill="currentColor" /><polygon points="4 3 14 12 4 21 4 3" fill="currentColor" />
                    </svg>
                </button>

                <button className="btn btn-secondary btn-icon" title="Run to End" onClick={onRunToEnd} disabled={disabled || isCompleted || isRunning}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <polygon points="5 4 15 12 5 20 5 4" fill="currentColor" /><rect x="15" y="4" width="4" height="16" fill="currentColor" />
                    </svg>
                </button>
            </div>

            <div className="control-divider" />

            <div className="control-section">
                <button className="btn btn-secondary" onClick={onReset} disabled={disabled}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <polyline points="23 4 23 10 17 10" /><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10" />
                    </svg>
                    Reset
                </button>

                <button className="btn btn-secondary" onClick={onClear}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <polyline points="3 6 5 6 21 6" /><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" /><path d="M10 11v6" /><path d="M14 11v6" />
                    </svg>
                    Clear
                </button>
            </div>

            <div className="control-divider" />

            <div className="control-section">
                <span style={{ fontSize: '0.65rem', color: 'var(--color-kernel-text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', display: 'flex', justifyContent: 'space-between', width: '100%' }}>
                    <span>Speed</span>
                </span>
                <input
                    type="range"
                    className="speed-slider"
                    min="50"
                    max="1500"
                    step="50"
                    value={1550 - speed}
                    onChange={(e) => onSpeedChange(1550 - parseInt(e.target.value))}
                />
                <span style={{ color: 'var(--color-kernel-text)' }}>{Math.round((1550 - speed) / 15)}%</span>
            </div>

            {isCompleted && (
                <span style={{
                    fontSize: '0.75rem', fontWeight: 700, padding: '4px 12px',
                    borderRadius: '999px', background: 'rgba(52,211,153,0.1)', color: '#34d399',
                    border: '1px solid rgba(52,211,153,0.2)', marginLeft: 'auto',
                }}>
                    Complete
                </span>
            )}
        </div>
    );
}
