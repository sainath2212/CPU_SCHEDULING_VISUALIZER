import { useState } from 'react';
import { motion } from 'framer-motion';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { useProcesses } from '../context/ProcessContext';
import { Card3D, SpotlightCard, DotGrid, FloatingParticles, GlowText } from '../components/AceternityUI';
import { MagicButton } from '../components/MagicButton';

const API = 'https://cpu-scheduling-visualizer-euxn.onrender.com/api/v2';
const ALGO_COLORS = ['#E64833', '#B0B0B0', '#874F41', '#E0E0E0', '#5ba3b5', '#d4956a', '#7ec8a0', '#c87e7e'];

export default function RecommenderPage() {
    const { masterWorkload, quantum, loadSampleProcesses } = useProcesses();
    const [prediction, setPrediction] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const predict = async () => {
        if (masterWorkload.length === 0) return;
        setLoading(true);
        setError(null);
        try {
            const procs = masterWorkload.map(p => ({
                arrival: p.arrival, burst: p.burst, priority: p.priority,
            }));
            const res = await fetch(`${API}/recommend`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ processes: procs, quantum }),
            });
            const data = await res.json();
            if (data.ok) setPrediction(data);
            else setError(data.error);
        } catch (e) {
            setError(e.message);
        }
        setLoading(false);
    };

    const probData = prediction?.all_probabilities
        ? Object.entries(prediction.all_probabilities)
            .map(([algo, prob], i) => ({ name: algo, probability: +(prob * 100).toFixed(1), fill: ALGO_COLORS[i % 8] }))
            .sort((a, b) => b.probability - a.probability)
        : [];

    const confidence = prediction?.confidence ?? 0;

    return (
        <div style={{ minHeight: '100vh', background: 'var(--color-kernel-bg-deep)', position: 'relative' }}>
            <DotGrid />
            <FloatingParticles count={8} />

            <div className="page-container" style={{ position: 'relative', zIndex: 1 }}>
                <div className="page-hero">
                    <div className="page-hero-icon-wrapper" style={{ background: 'rgba(135,79,65,0.1)', border: '1px solid rgba(135,79,65,0.2)' }}>
                        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#874F41" strokeWidth="1.5">
                            <path d="M12 2a6 6 0 0 1 6 6c0 1.6-.63 3.06-1.65 4.13L12 16.5l-4.35-4.37A5.98 5.98 0 0 1 6 8a6 6 0 0 1 6-6z" />
                            <circle cx="10" cy="8" r="1" /><circle cx="14" cy="8" r="1" />
                            <path d="M12 16.5V22" /><path d="M8 19h8" />
                        </svg>
                    </div>
                    <div>
                        <h1 className="page-hero-title">AI <GlowText color="#874F41"> Recommender</GlowText></h1>
                        <p className="page-hero-subtitle">ML-powered algorithm selection using RandomForest</p>
                    </div>
                </div>

                {masterWorkload.length === 0 ? (
                    <div style={{ textAlign: 'center' }}>
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6 }}
                            style={{
                                display: 'flex', flexDirection: 'column', alignItems: 'center',
                                marginTop: '1rem', borderRadius: '1rem',
                                background: 'rgba(144,174,173,0.03)',
                                border: '1px solid rgba(144,174,173,0.08)',
                                overflow: 'hidden',
                            }}
                        >
                            <div style={{ width: '100%', height: '400px', position: 'relative', overflow: 'hidden', paddingTop: '1.5rem' }}>
                                <iframe
                                    src="https://my.spline.design/genkubgreetingrobot-HdYPwIGwESk7PHpUxGMFuFm0/"
                                    frameBorder="0"
                                    width="100%"
                                    height="100%"
                                    style={{ border: 'none', borderRadius: '1rem 1rem 0 0', transform: 'scale(1.4)', transformOrigin: 'center center' }}
                                    title="AI Robot Greeting"
                                    allow="autoplay"
                                    scrolling="no"
                                />
                                {/* Transparent overlay to block iframe scroll/interaction */}
                                <div style={{ position: 'absolute', inset: 0, zIndex: 10, cursor: 'default' }} />
                            </div>
                            <div style={{ padding: '1.5rem', textAlign: 'center' }}>
                                <p style={{
                                    color: 'var(--color-kernel-text-dim)', fontSize: '0.95rem',
                                    margin: 0, marginBottom: '1rem', lineHeight: 1.6,
                                }}>
                                    Load some processes to get started with AI-powered algorithm recommendation.
                                </p>
                                <MagicButton onClick={loadSampleProcesses}>Load Samples</MagicButton>
                            </div>
                        </motion.div>
                    </div>
                ) : (
                    <>
                        <div className="controls-bar">
                            <div className="process-chip-row">
                                {masterWorkload.map(p => (
                                    <span key={p.pid} className="process-chip">P{p.pid} (b={p.burst})</span>
                                ))}
                            </div>
                            <div style={{ flex: 1 }} />
                            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                                <MagicButton onClick={predict} disabled={loading}>
                                    {loading ? 'Analyzing...' : 'Get Recommendation'}
                                </MagicButton>
                            </motion.div>
                        </div>

                        {error && <div className="error-text" style={{ marginTop: '1rem' }}>{error}</div>}

                        {!prediction && !loading && (
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.6 }}
                                style={{
                                    display: 'flex', flexDirection: 'column', alignItems: 'center',
                                    marginTop: '1rem', borderRadius: '1rem',
                                    background: 'rgba(144,174,173,0.03)',
                                    border: '1px solid rgba(144,174,173,0.08)',
                                    overflow: 'hidden',
                                }}
                            >
                                <div style={{ width: '100%', height: '420px', position: 'relative', overflow: 'hidden', paddingTop: '1.5rem' }}>
                                    <iframe
                                        src="https://my.spline.design/genkubgreetingrobot-HdYPwIGwESk7PHpUxGMFuFm0/"
                                        frameBorder="0"
                                        width="100%"
                                        height="100%"
                                        style={{ border: 'none', borderRadius: '1rem 1rem 0 0', transform: 'scale(1.4)', transformOrigin: 'center center' }}
                                        title="AI Robot Greeting"
                                        allow="autoplay"
                                        scrolling="no"
                                    />
                                    {/* Transparent overlay to block iframe scroll/interaction */}
                                    <div style={{ position: 'absolute', inset: 0, zIndex: 10, cursor: 'default' }} />
                                </div>
                                <div style={{ padding: '1.5rem', textAlign: 'center' }}>
                                    <p style={{
                                        color: 'var(--color-kernel-text-dim)', fontSize: '0.95rem',
                                        margin: 0, lineHeight: 1.6,
                                    }}>
                                        Click <strong style={{ color: '#874F41' }}>"Get Recommendation"</strong> above to let our AI analyze your workload and suggest the best scheduling algorithm.
                                    </p>
                                </div>
                            </motion.div>
                        )}

                        {prediction && (
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginTop: '1rem' }}>
                                {/* Recommendation card with animated border */}
                                <motion.div initial={{ opacity: 0, scale: 0.9, rotateX: 15 }} animate={{ opacity: 1, scale: 1, rotateX: 0 }} transition={{ type: 'spring', stiffness: 80 }}>
                                    <AnimatedBorderCard>
                                        <div style={{ padding: '2rem', display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                                            <div style={{
                                                width: 72, height: 72, borderRadius: '1rem',
                                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                background: 'rgba(230,72,51,0.1)',
                                                border: '1px solid rgba(230,72,51,0.2)',
                                                color: '#E64833',
                                            }}>
                                                <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2">
                                                    <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6" />
                                                    <path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18" />
                                                    <path d="M4 22h16" /><path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20 7 22" />
                                                    <path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20 17 22" />
                                                    <path d="M18 2H6v7a6 6 0 0 0 12 0V2Z" />
                                                </svg>
                                            </div>
                                            <div>
                                                <div style={{ fontSize: '0.6rem', fontWeight: 600, color: 'var(--color-kernel-text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                                                    Recommended Algorithm
                                                </div>
                                                <div style={{ fontSize: '1.75rem', fontWeight: 900, marginTop: '0.25rem' }}>
                                                    <GlowText color="#E64833">{prediction.recommended_algorithm}</GlowText>
                                                </div>
                                                <div style={{ fontSize: '0.8rem', color: 'var(--color-kernel-text-dim)', marginTop: '0.25rem' }}>
                                                    Confidence: <span style={{ color: '#34d399', fontWeight: 700, fontFamily: "'JetBrains Mono', monospace" }}>
                                                        <AnimatedNumber value={confidence * 100} />%
                                                    </span>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Confidence bar */}
                                        <div style={{ padding: '0 2rem 1.5rem' }}>
                                            <div style={{ height: '8px', borderRadius: '4px', background: 'rgba(144,174,173,0.1)', overflow: 'hidden' }}>
                                                <motion.div
                                                    style={{
                                                        height: '100%', borderRadius: '4px',
                                                        background: 'linear-gradient(90deg, #E64833, #34d399)',
                                                    }}
                                                    initial={{ width: 0 }}
                                                    animate={{ width: `${confidence * 100}%` }}
                                                    transition={{ duration: 1, ease: 'easeOut' }}
                                                />
                                            </div>
                                        </div>
                                    </AnimatedBorderCard>
                                </motion.div>

                                {/* Probability chart */}
                                <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1, type: 'spring' }}>
                                    <Card3D glowColor="rgba(144,174,173,0.1)">
                                        <div style={{ padding: '1rem' }}>
                                            <div style={{ fontSize: '0.75rem', fontWeight: 700, marginBottom: '0.75rem', color: 'var(--color-kernel-text)' }}>
                                                Algorithm Probabilities
                                            </div>
                                            <ResponsiveContainer width="100%" height={240}>
                                                <BarChart data={probData} layout="vertical">
                                                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(144,174,173,0.1)" />
                                                    <XAxis type="number" domain={[0, 100]} tick={{ fill: 'rgba(251,233,208,0.5)', fontSize: 10 }} />
                                                    <YAxis type="category" dataKey="name" tick={{ fill: '#E0E0E0', fontSize: 10 }} width={80} />
                                                    <Tooltip
                                                        contentStyle={{ backgroundColor: 'rgba(26,54,64,0.95)', border: '1px solid rgba(144,174,173,0.2)', borderRadius: '8px', fontSize: '0.75rem', color: '#E0E0E0' }}
                                                        formatter={(v) => `${v}%`}
                                                    />
                                                    <Bar dataKey="probability" radius={[0, 4, 4, 0]}>
                                                        {probData.map((entry, i) => (
                                                            <Cell key={i} fill={entry.fill} opacity={entry.name === prediction.recommended_algorithm ? 1 : 0.35} />
                                                        ))}
                                                    </Bar>
                                                </BarChart>
                                            </ResponsiveContainer>
                                        </div>
                                    </Card3D>
                                </motion.div>

                                {/* Features */}
                                {prediction.features && (
                                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} style={{ gridColumn: 'span 2' }}>
                                        <SpotlightCard spotlightColor="#874F41">
                                            <div style={{ padding: '1rem' }}>
                                                <div style={{ fontSize: '0.75rem', fontWeight: 700, marginBottom: '0.75rem', color: 'var(--color-kernel-text)' }}>
                                                    Workload Features
                                                </div>
                                                <div style={{
                                                    display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))',
                                                    gap: '0.5rem',
                                                }}>
                                                    {Object.entries(prediction.features).map(([key, val]) => (
                                                        <div key={key} style={{
                                                            padding: '0.5rem', background: 'rgba(144,174,173,0.05)',
                                                            borderRadius: '0.5rem', border: '1px solid rgba(144,174,173,0.1)',
                                                        }}>
                                                            <div style={{
                                                                fontSize: '0.55rem', fontWeight: 600, color: 'var(--color-kernel-text-muted)',
                                                                textTransform: 'uppercase', letterSpacing: '0.04em',
                                                            }}>
                                                                {key.replace(/_/g, ' ')}
                                                            </div>
                                                            <div style={{
                                                                fontSize: '0.85rem', fontWeight: 700,
                                                                fontFamily: "'JetBrains Mono', monospace",
                                                                color: '#B0B0B0', marginTop: '2px',
                                                            }}>
                                                                {typeof val === 'number' ? val.toFixed(2) : val}
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        </SpotlightCard>
                                    </motion.div>
                                )}
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
}
