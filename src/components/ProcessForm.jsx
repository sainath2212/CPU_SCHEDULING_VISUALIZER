/**
 * ProcessForm — Add processes manually or load samples.
 * Uses ProcessContext callbacks. No emojis, kernel-themed.
 */

import { useState } from 'react';

export default function ProcessForm({ onAddProcess, onAddSample, disabled }) {
    const [arrival, setArrival] = useState('');
    const [burst, setBurst] = useState('');
    const [priority, setPriority] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();
        const a = parseInt(arrival) || 0;
        const b = parseInt(burst) || 1;
        const p = parseInt(priority) || 1;
        if (b <= 0) return;
        onAddProcess(a, b, p);
        setArrival('');
        setBurst('');
        setPriority('');
    };

    return (
        <div className="card">
            <div className="card-header">
                <h3 className="card-title">
                    <svg className="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <circle cx="12" cy="12" r="10" />
                        <line x1="12" y1="8" x2="12" y2="16" />
                        <line x1="8" y1="12" x2="16" y2="12" />
                    </svg>
                    Add Process
                </h3>
            </div>

            <form onSubmit={handleSubmit}>
                <div className="form-row">
                    <div className="form-group">
                        <label className="form-label">Arrival</label>
                        <input type="number" className="form-input" value={arrival} onChange={e => setArrival(e.target.value)} placeholder="0" min="0" disabled={disabled} />
                    </div>
                    <div className="form-group">
                        <label className="form-label">Burst</label>
                        <input type="number" className="form-input" value={burst} onChange={e => setBurst(e.target.value)} placeholder="1" min="1" disabled={disabled} />
                    </div>
                    <div className="form-group">
                        <label className="form-label">Priority</label>
                        <input type="number" className="form-input" value={priority} onChange={e => setPriority(e.target.value)} placeholder="1" min="1" disabled={disabled} />
                    </div>
                </div>

                <div className="btn-group" style={{ marginTop: '0.5rem' }}>
                    <button type="submit" className="btn btn-primary" disabled={disabled} style={{ flex: 1 }}>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
                        </svg>
                        Add
                    </button>
                    <button type="button" className="btn btn-secondary" onClick={onAddSample} disabled={disabled}>
                        Sample
                    </button>
                </div>
            </form>
        </div>
    );
}
