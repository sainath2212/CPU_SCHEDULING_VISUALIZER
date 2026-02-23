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
                        className={`relative inline-flex h-auto min-h-[50px] overflow-hidden rounded-xl p-[1px] focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-2 focus:ring-offset-slate-50 transition-all ${selected === id ? 'scale-105 shadow-lg' : 'opacity-80 hover:opacity-100'}`}
                        onClick={() => onSelect(id)}
                        disabled={disabled}
                    >
                        {selected === id && (
                            <span className="absolute inset-[-1000%] animate-[spin_2s_linear_infinite] bg-[conic-gradient(from_90deg_at_50%_50%,#E64833_0%,#B0B0B0_50%,#E64833_100%)]" />
                        )}
                        <span className={`flex flex-col gap-1 items-center justify-center w-full h-full rounded-xl px-2 py-2 text-xs font-semibold backdrop-blur-3xl transition-colors ${selected === id ? 'bg-[#1a1a1a] text-[#E0E0E0]' : 'bg-[#121212] text-[#B0B0B0] hover:bg-[#1a1a1a]'}`}>
                            {ALGORITHM_NAMES[id]}
                            <span style={{ display: 'flex', alignItems: 'center', gap: '3px', justifyContent: 'center' }}>
                                {preemptive ? (
                                    <>
                                        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" /></svg>
                                        Preemptive
                                    </>
                                ) : (
                                    <>
                                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
                                        Non-preemptive
                                    </>
                                )}
                            </span>
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
