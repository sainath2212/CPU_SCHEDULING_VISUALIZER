/**
 * MLFQDeepView — Rich, deep visualization of the Multi-Level Feedback Queue.
 * Shows 3 queue levels as 3D stacked layers with animated process movement,
 * demotion arrows, quantum indicators, and priority heatmap.
 */

import { motion, AnimatePresence } from 'framer-motion';
import { SpotlightCard, BeamLine, GlowText, AnimatedNumber } from './AceternityUI';

const PROC_COLORS = ['#E64833', '#90AEAD', '#874F41', '#FBE9D0', '#5ba3b5', '#d4956a', '#7ec8a0', '#c87e7e'];

const QUEUE_CONFIG = [
    { level: 0, name: 'High Priority', scheduler: 'Round Robin', quantum: 4, color: '#E64833', bgGlow: 'rgba(230,72,51,0.08)' },
    { level: 1, name: 'Medium Priority', scheduler: 'Round Robin', quantum: 8, color: '#90AEAD', bgGlow: 'rgba(144,174,173,0.06)' },
    { level: 2, name: 'Low Priority', scheduler: 'FCFS', quantum: null, color: '#874F41', bgGlow: 'rgba(135,79,65,0.06)' },
];

function ProcessBubble({ pid, isRunning = false, queueLevel = 0 }) {
    const color = PROC_COLORS[pid % 8];
    return (
        <motion.div
            layout
            initial={{ scale: 0, rotateY: 180, opacity: 0 }}
            animate={{ scale: 1, rotateY: 0, opacity: 1 }}
            exit={{ scale: 0, rotateY: -180, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 300, damping: 20, mass: 0.8 }}
            style={{
                width: 52,
                height: 52,
                borderRadius: '14px',
                background: `linear-gradient(135deg, ${color}, ${color}cc)`,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                fontFamily: "'JetBrains Mono', monospace",
                fontWeight: 800,
                fontSize: '0.8rem',
                color: '#1a3640',
                position: 'relative',
                cursor: 'default',
                boxShadow: isRunning
                    ? `0 0 20px ${color}66, 0 0 40px ${color}33`
                    : `0 4px 12px rgba(0,0,0,0.3)`,
                border: isRunning ? '2px solid #fff' : '1px solid rgba(255,255,255,0.1)',
                transform: 'perspective(400px)',
            }}
            whileHover={{ scale: 1.15, y: -4 }}
        >
            P{pid}
            {isRunning && (
                <motion.div
                    style={{
                        position: 'absolute', inset: -4,
                        border: `2px solid ${color}`,
                        borderRadius: '18px',
                    }}
                    animate={{ opacity: [0.8, 0, 0.8], scale: [1, 1.15, 1] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                />
            )}
        </motion.div>
    );
}

function DemotionArrow({ fromLevel, toLevel }) {
    return (
        <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '0.25rem 0',
        }}>
            <motion.div
                style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '2px',
                }}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
            >
                <motion.svg
                    width="20" height="24" viewBox="0 0 20 24"
                    animate={{ y: [0, 4, 0] }}
                    transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
                >
                    <path d="M10 2 L10 18" stroke="#E64833" strokeWidth="1.5" strokeDasharray="3 2" opacity="0.5" />
                    <path d="M5 14 L10 20 L15 14" stroke="#E64833" strokeWidth="1.5" fill="none" opacity="0.7" />
                </motion.svg>
                <span style={{
                    fontSize: '0.5rem', fontWeight: 700, color: 'rgba(230,72,51,0.5)',
                    textTransform: 'uppercase', letterSpacing: '0.1em',
                }}>
                    Demote
                </span>
            </motion.div>
        </div>
    );
}

function QueueLevel({ config, pids, runningPid, index }) {
    const { name, scheduler, quantum, color, bgGlow } = config;
    const isEmpty = !pids || pids.length === 0;

    return (
        <motion.div
            initial={{ opacity: 0, x: -30, rotateY: -5 }}
            animate={{ opacity: 1, x: 0, rotateY: 0 }}
            transition={{ delay: index * 0.15, type: 'spring', stiffness: 100 }}
            style={{ perspective: '800px' }}
        >
            <SpotlightCard spotlightColor={color}>
                <div style={{ padding: '1rem 1.25rem' }}>
                    {/* Header */}
                    <div style={{
                        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                        marginBottom: '0.75rem',
                    }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <div style={{
                                width: 8, height: 8, borderRadius: '50%',
                                background: color,
                                boxShadow: `0 0 10px ${color}66`,
                            }} />
                            <span style={{
                                fontFamily: "'JetBrains Mono', monospace",
                                fontWeight: 700, fontSize: '0.85rem', color,
                            }}>
                                Q{index}
                            </span>
                            <span style={{
                                fontSize: '0.72rem', fontWeight: 600,
                                color: 'var(--color-kernel-text)',
                            }}>
                                {name}
                            </span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <span style={{
                                fontSize: '0.55rem', fontWeight: 600,
                                padding: '2px 8px', borderRadius: '999px',
                                background: `${color}15`, color,
                                border: `1px solid ${color}30`,
                                textTransform: 'uppercase', letterSpacing: '0.06em',
                            }}>
                                {scheduler}
                            </span>
                            {quantum && (
                                <span style={{
                                    fontSize: '0.55rem', fontWeight: 700,
                                    fontFamily: "'JetBrains Mono', monospace",
                                    padding: '2px 8px', borderRadius: '999px',
                                    background: 'rgba(144,174,173,0.1)',
                                    color: 'var(--color-kernel-text-dim)',
                                }}>
                                    q = {quantum}
                                </span>
                            )}
                            <span style={{
                                fontSize: '0.65rem', fontFamily: "'JetBrains Mono', monospace",
                                color: 'var(--color-kernel-text-muted)',
                            }}>
                                {pids?.length ?? 0} procs
                            </span>
                        </div>
                    </div>

                    {/* Beam separator */}
                    <BeamLine color={color} duration={2 + index} />

                    {/* Process bubbles */}
                    <div style={{
                        display: 'flex', alignItems: 'center', gap: '8px',
                        minHeight: '68px', padding: '0.75rem 0', flexWrap: 'wrap',
                        background: bgGlow,
                        borderRadius: '0.5rem',
                        marginTop: '0.5rem',
                        paddingLeft: '0.75rem',
                    }}>
                        {isEmpty ? (
                            <span style={{
                                fontSize: '0.72rem', color: 'var(--color-kernel-text-muted)',
                                fontStyle: 'italic',
                            }}>
                                No processes in this queue
                            </span>
                        ) : (
                            <AnimatePresence>
                                {pids.map((pid, i) => (
                                    <motion.div key={pid} layout>
                                        {i > 0 && (
                                            <motion.span
                                                style={{
                                                    fontSize: '0.9rem', color: `${color}44`,
                                                    margin: '0 2px', display: 'inline-block',
                                                }}
                                                animate={{ opacity: [0.3, 0.7, 0.3] }}
                                                transition={{ duration: 1.5, repeat: Infinity }}
                                            >
                                                →
                                            </motion.span>
                                        )}
                                        <ProcessBubble pid={pid} isRunning={pid === runningPid} queueLevel={index} />
                                    </motion.div>
                                ))}
                            </AnimatePresence>
                        )}
                    </div>
                </div>
            </SpotlightCard>
        </motion.div>
    );
}

export default function MLFQDeepView({ mlfqState, runningPid }) {
    const queues = mlfqState?.queues || [];

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
            {/* Title */}
            <div style={{
                display: 'flex', alignItems: 'center', gap: '0.75rem',
                marginBottom: '0.5rem',
            }}>
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#E64833" strokeWidth="1.5">
                    <rect x="3" y="3" width="18" height="6" rx="2" />
                    <rect x="3" y="11" width="14" height="6" rx="2" opacity="0.6" />
                    <rect x="3" y="19" width="10" height="4" rx="1" opacity="0.3" />
                </svg>
                <div>
                    <div style={{ fontWeight: 700, fontSize: '0.95rem' }}>
                        Multi-Level Feedback Queue
                    </div>
                    <div style={{
                        fontSize: '0.7rem', color: 'var(--color-kernel-text-dim)',
                    }}>
                        3 Levels — Processes demote on quantum expiry
                    </div>
                </div>
            </div>

            {/* Queue levels */}
            {QUEUE_CONFIG.map((config, i) => (
                <div key={i}>
                    <QueueLevel
                        config={config}
                        pids={queues[i]?.pids || []}
                        runningPid={runningPid}
                        index={i}
                    />
                    {i < 2 && <DemotionArrow fromLevel={i} toLevel={i + 1} />}
                </div>
            ))}

            {/* Stats footer */}
            <div style={{
                display: 'grid', gridTemplateColumns: '1fr 1fr 1fr',
                gap: '0.5rem', marginTop: '0.5rem',
            }}>
                {QUEUE_CONFIG.map((config, i) => {
                    const count = queues[i]?.pids?.length ?? 0;
                    return (
                        <div key={i} style={{
                            textAlign: 'center', padding: '0.5rem',
                            background: `${config.color}08`,
                            border: `1px solid ${config.color}20`,
                            borderRadius: '0.5rem',
                        }}>
                            <div style={{
                                fontFamily: "'JetBrains Mono', monospace",
                                fontWeight: 800, fontSize: '1.2rem', color: config.color,
                            }}>
                                <AnimatedNumber value={count} />
                            </div>
                            <div style={{
                                fontSize: '0.5rem', fontWeight: 600, color: 'var(--color-kernel-text-muted)',
                                textTransform: 'uppercase', letterSpacing: '0.08em', marginTop: '2px',
                            }}>
                                Q{i} Processes
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
