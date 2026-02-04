/**
 * Process Form Component
 * Form to add new processes with arrival time, burst time, and priority
 */

import { useState } from 'react';

export default function ProcessForm({ onAddProcess, disabled }) {
    const [arrivalTime, setArrivalTime] = useState('');
    const [burstTime, setBurstTime] = useState('');
    const [priority, setPriority] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();

        const arrival = parseInt(arrivalTime) || 0;
        const burst = parseInt(burstTime) || 1;
        const prio = parseInt(priority) || 1;

        if (burst <= 0) {
            alert('Burst time must be greater than 0');
            return;
        }

        onAddProcess(arrival, burst, prio);

        // Clear form
        setArrivalTime('');
        setBurstTime('');
        setPriority('');
    };

    const handleAddSample = () => {
        // Add sample processes for testing
        onAddProcess(0, 5, 2);
        onAddProcess(1, 3, 1);
        onAddProcess(2, 8, 3);
        onAddProcess(3, 2, 4);
        onAddProcess(4, 4, 2);
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
                        <input
                            type="number"
                            className="form-input"
                            value={arrivalTime}
                            onChange={(e) => setArrivalTime(e.target.value)}
                            placeholder="0"
                            min="0"
                            disabled={disabled}
                        />
                    </div>

                    <div className="form-group">
                        <label className="form-label">Burst</label>
                        <input
                            type="number"
                            className="form-input"
                            value={burstTime}
                            onChange={(e) => setBurstTime(e.target.value)}
                            placeholder="1"
                            min="1"
                            disabled={disabled}
                        />
                    </div>

                    <div className="form-group">
                        <label className="form-label">Priority</label>
                        <input
                            type="number"
                            className="form-input"
                            value={priority}
                            onChange={(e) => setPriority(e.target.value)}
                            placeholder="1"
                            min="1"
                            disabled={disabled}
                        />
                    </div>
                </div>

                <div className="btn-group" style={{ marginTop: '8px' }}>
                    <button
                        type="submit"
                        className="btn btn-primary"
                        disabled={disabled}
                        style={{ flex: 1 }}
                    >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <line x1="12" y1="5" x2="12" y2="19" />
                            <line x1="5" y1="12" x2="19" y2="12" />
                        </svg>
                        Add
                    </button>

                    <button
                        type="button"
                        className="btn btn-secondary"
                        onClick={handleAddSample}
                        disabled={disabled}
                    >
                        Sample
                    </button>
                </div>
            </form>
        </div>
    );
}
