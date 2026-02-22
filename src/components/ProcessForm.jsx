/**
 * Process Form Component
 * Form to add new processes with arrival time, burst time, and priority
 */

import { useState } from 'react';

export default function ProcessForm({ onAddProcess, onAddSample, disabled }) {
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
        // Generate 5 processes with randomized values
        const count = 5;
        const processes = [];
        for (let i = 0; i < count; i++) {
            processes.push({
                arrivalTime: Math.floor(Math.random() * 21),   // 0 to 20
                burstTime: Math.floor(Math.random() * 10) + 1, // 1 to 10
                priority: Math.floor(Math.random() * 5) + 1,   // 1 to 5
            });
        }
        // Sort by arrival time for cleaner display
        processes.sort((a, b) => a.arrivalTime - b.arrivalTime);
        // Use batch add — no metrics calculated, just fills data
        onAddSample(processes);
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
