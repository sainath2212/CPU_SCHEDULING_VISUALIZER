/**
 * AlgorithmSelector — Grid of algorithm buttons including MLFQ.
 */

import { ALGORITHMS, ALGORITHM_NAMES, ALGORITHM_DESCRIPTIONS } from '../hooks/useScheduler';

const algoList = [
    { id: ALGORITHMS.FCFS, preemptive: false },
    { id: ALGORITHMS.SJF, preemptive: false },
    { id: ALGORITHMS.SRTF, preemptive: true },
    { id: ALGORITHMS.PRIORITY, preemptive: false },
    { id: ALGORITHMS.ROUND_ROBIN, preemptive: true },
    { id: ALGORITHMS.LJF, preemptive: false },
    { id: ALGORITHMS.LRTF, preemptive: true },
    { id: ALGORITHMS.MLFQ, preemptive: true },
];

export default function AlgorithmSelector({ selected, onSelect, timeQuantum, onTimeQuantumChange, disabled }) {
    return (
        <div>
            <div className="algorithm-grid">
                {algoList.map(({ id, preemptive }) => (
                    <button
                        key={id}
                        className={`algorithm-btn ${selected === id ? 'active' : ''}`}
                        onClick={() => onSelect(id)}
                        disabled={disabled}
                    >
                        {ALGORITHM_NAMES[id]}
                        <span style={{ display: 'flex', alignItems: 'center', gap: '3px', justifyContent: 'center' }}>
                            {preemptive ? (
                                <>
                                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" /></svg>
                                    Preemptive
                                </>
                            ) : (
                                <>
                                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="2" /></svg>
                                    Non-preemptive
                                </>
                            )}
                        </span>
                    </button>
                ))}
            </div>

            {(selected === ALGORITHMS.ROUND_ROBIN || selected === ALGORITHMS.MLFQ) && (
                <div className="form-group" style={{ marginTop: '0.75rem', maxWidth: '200px' }}>
                    <label className="form-label">
                        {selected === ALGORITHMS.MLFQ ? 'Base Quantum (Q0)' : 'Time Quantum'}
                    </label>
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
