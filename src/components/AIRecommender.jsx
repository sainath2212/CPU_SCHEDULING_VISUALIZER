import { useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { useProcesses } from '../context/ProcessContext';
import { BrainIcon, TrophyIcon } from '../components/Icons';

const API_BASE = 'http://localhost:5001';

const ALGO_COLORS = [
    '#6366f1', '#f59e0b', '#ef4444', '#10b981', '#3b82f6', '#ec4899', '#8b5cf6'
];

/**
 * AI Algorithm Recommender — uses shared process context.
 */
export default function AIRecommender() {
    const { processes, quantum } = useProcesses();
    const [prediction, setPrediction] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const getRecommendation = async () => {
        if (processes.length < 2) {
            setError('Add at least 2 processes in the Simulator.');
            return;
        }
        setLoading(true);
        setError('');
        try {
            const res = await fetch(`${API_BASE}/api/v2/recommend`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ processes, quantum }),
            });
            const data = await res.json();
            if (data.ok) {
                setPrediction(data);
            } else {
                setError(data.error || 'Prediction failed');
            }
        } catch (err) {
            setError('Failed to connect to backend. Make sure the server is running and the AI model is trained.');
        }
        setLoading(false);
    };

    // Prepare probability chart data
    const probData = prediction?.all_probabilities
        ? Object.entries(prediction.all_probabilities)
            .map(([algo, prob]) => ({ algorithm: algo, probability: +(prob * 100).toFixed(1) }))
            .sort((a, b) => b.probability - a.probability)
        : [];

    return (
        <div className="ai-recommender">
            {/* Process Info Banner */}
            {processes.length === 0 ? (
                <div className="info-banner info-banner--warning">
                    <div className="info-banner-content">
                        <strong>No processes loaded.</strong> Go to the Simulator tab to add processes first.
                    </div>
                </div>
            ) : (
                <div className="info-banner info-banner--info">
                    <div className="info-banner-content">
                        <strong>{processes.length} processes</strong> from Simulator — Time Quantum: {quantum}
                        <div className="process-chip-row">
                            {processes.map((p, i) => (
                                <span key={i} className="process-chip">
                                    P{i} <span className="chip-detail">A:{p.arrival} B:{p.burst} P:{p.priority}</span>
                                </span>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {/* Action Bar */}
            <div className="controls-bar">
                <button
                    className="btn-primary ai-gradient"
                    onClick={getRecommendation}
                    disabled={loading || processes.length < 2}
                >
                    <BrainIcon size={14} />
                    {loading ? 'Analyzing workload...' : 'Get AI Recommendation'}
                </button>
                {error && <span className="error-text">{error}</span>}
            </div>

            {/* Prediction Result */}
            {prediction && (
                <div className="ai-result">
                    {/* Recommendation Card */}
                    <div className="ai-recommendation-card">
                        <div className="ai-rec-trophy">
                            <TrophyIcon size={40} className="ai-rec-trophy-icon" />
                        </div>
                        <div className="ai-rec-content">
                            <div className="ai-rec-label">Recommended Algorithm</div>
                            <div className="ai-rec-algo">{prediction.recommended_algorithm}</div>
                            <div className="ai-rec-confidence">
                                Confidence: <strong>{(prediction.confidence * 100).toFixed(1)}%</strong>
                            </div>
                        </div>
                        <div className="ai-rec-meter">
                            <div className="confidence-ring" style={{
                                background: `conic-gradient(#10b981 ${prediction.confidence * 360}deg, rgba(255,255,255,0.05) 0deg)`
                            }}>
                                <span className="confidence-value">{(prediction.confidence * 100).toFixed(0)}%</span>
                            </div>
                        </div>
                    </div>

                    {/* Probability Distribution */}
                    <div className="ai-prob-chart">
                        <h4>Algorithm Probability Distribution</h4>
                        <ResponsiveContainer width="100%" height={250}>
                            <BarChart data={probData} layout="vertical" margin={{ top: 5, right: 20, left: 70, bottom: 5 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                                <XAxis
                                    type="number"
                                    stroke="rgba(255,255,255,0.3)"
                                    tick={{ fill: 'rgba(255,255,255,0.5)', fontSize: 11 }}
                                    unit="%"
                                    domain={[0, 100]}
                                />
                                <YAxis
                                    dataKey="algorithm"
                                    type="category"
                                    stroke="rgba(255,255,255,0.3)"
                                    tick={{ fill: 'rgba(255,255,255,0.7)', fontSize: 12 }}
                                    width={65}
                                />
                                <Tooltip
                                    contentStyle={{
                                        background: 'rgba(15, 15, 30, 0.95)',
                                        border: '1px solid rgba(255,255,255,0.1)',
                                        borderRadius: 8,
                                        color: '#fff',
                                        fontSize: 12,
                                    }}
                                    formatter={(value) => [`${value}%`, 'Probability']}
                                />
                                <Bar dataKey="probability" radius={[0, 4, 4, 0]}>
                                    {probData.map((entry, i) => (
                                        <Cell
                                            key={i}
                                            fill={entry.algorithm === prediction.recommended_algorithm ? '#10b981' : ALGO_COLORS[i % ALGO_COLORS.length]}
                                            opacity={entry.algorithm === prediction.recommended_algorithm ? 1 : 0.5}
                                        />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>

                    {/* Features Table */}
                    {prediction.features && (
                        <div className="ai-features">
                            <h4>Extracted Workload Features</h4>
                            <div className="ai-features-grid">
                                {Object.entries(prediction.features).map(([k, v]) => (
                                    <div key={k} className="ai-feature-item">
                                        <span className="ai-feature-name">{k.replace(/_/g, ' ')}</span>
                                        <span className="ai-feature-value">{typeof v === 'number' ? v.toFixed(2) : v}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
