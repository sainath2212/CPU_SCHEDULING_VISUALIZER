/**
 * Algorithm Selector Component
 * Grid of algorithm buttons with descriptions
 */

import { ALGORITHMS, ALGORITHM_NAMES, ALGORITHM_DESCRIPTIONS } from '../hooks/useScheduler';

export default function AlgorithmSelector({ selected, onSelect, timeQuantum, onTimeQuantumChange, disabled }) {
    const algorithms = [
        { id: ALGORITHMS.FCFS, preemptive: false },
        { id: ALGORITHMS.SJF, preemptive: false },
        { id: ALGORITHMS.SRTF, preemptive: true },
        { id: ALGORITHMS.PRIORITY, preemptive: false },
        { id: ALGORITHMS.ROUND_ROBIN, preemptive: true },
        { id: ALGORITHMS.LJF, preemptive: false },
        { id: ALGORITHMS.LRTF, preemptive: true },
        { id: ALGORITHMS.MLFQ, preemptive: true },
    ];

    return (
        <div className="card">
            <div className="card-header">
                <h3 className="card-title">
                    <svg className="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <circle cx="12" cy="12" r="3" />
                        <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 1 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 1 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 1 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 1 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
                    </svg>
                    Algorithm
                </h3>
            </div>

            <div className="algorithm-grid">
                {algorithms.map(({ id, preemptive }) => (
                    <button
                        key={id}
                        className={`algorithm-btn ${selected === id ? 'active' : ''}`}
                        onClick={() => onSelect(id)}
                        disabled={disabled}
                    >
                        {ALGORITHM_NAMES[id]}
                        <span>{preemptive ? '⚡ Preemptive' : '📦 Non-preemptive'}</span>
                    </button>
                ))}
            </div>

            {selected === ALGORITHMS.ROUND_ROBIN && (
                <div className="form-group" style={{ marginTop: '16px' }}>
                    <label className="form-label">Time Quantum</label>
                    <input
                        type="number"
                        className="form-input"
                        value={timeQuantum}
                        onChange={(e) => onTimeQuantumChange(parseInt(e.target.value) || 1)}
                        min="1"
                        disabled={disabled}
                    />
                </div>
            )}
        </div>
    );
}
