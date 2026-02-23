/**
 * ReadyQueue — Shows waiting processes.
 * For MLFQ: uses the deep MLFQDeepView.
 * For other algorithms: animated horizontal queue with SpotlightCard.
 */

import { motion, AnimatePresence } from 'framer-motion';
import { SpotlightCard } from './AceternityUI';
import MLFQDeepView from './MLFQDeepView';

const PROC_COLORS = ['#E64833', '#B0B0B0', '#874F41', '#E0E0E0', '#5ba3b5', '#d4956a', '#7ec8a0', '#c87e7e'];

export default function ReadyQueue({ queue, runningPid, algorithm, mlfqState }) {
    const isMLFQ = algorithm === 7;

    if (isMLFQ) {
        return (
            <SpotlightCard spotlightColor="#E64833">
                <div style={{ padding: '1rem' }}>
                    <MLFQDeepView mlfqState={mlfqState} runningPid={runningPid} />
                </div>
            </SpotlightCard>
        );
    }

    return (
        <SpotlightCard>
            <div style={{ padding: '1rem' }}>
                <div className="card-header">
                    <h3 className="card-title">
                        <svg className="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <line x1="8" y1="6" x2="21" y2="6" /><line x1="8" y1="12" x2="21" y2="12" />
                            <line x1="8" y1="18" x2="21" y2="18" /><line x1="3" y1="6" x2="3.01" y2="6" />
                            <line x1="3" y1="12" x2="3.01" y2="12" /><line x1="3" y1="18" x2="3.01" y2="18" />
                        </svg>
                        Ready Queue
                    </h3>
                    <span style={{ fontSize: '0.8rem', color: 'var(--color-kernel-text-dim)' }}>
                        {queue?.length ?? 0} waiting
                    </span>
                </div>

                <div className="ready-queue-visual">
                    {runningPid >= 0 && (
                        <>
                            <motion.div
                                className="queue-item"
                                style={{
                                    backgroundColor: PROC_COLORS[runningPid % 8],
                                    border: '2px solid var(--color-kernel-active)',
                                    boxShadow: `0 0 20px ${PROC_COLORS[runningPid % 8]}44`,
                                }}
                                layout
                                whileHover={{ scale: 1.15 }}
                            >
                                P{runningPid}
                            </motion.div>
                            <motion.span
                                className="queue-arrow"
                                animate={{ x: [0, 4, 0] }}
                                transition={{ duration: 1, repeat: Infinity }}
                            >→</motion.span>
                        </>
                    )}

                    <AnimatePresence>
                        {(!queue || queue.length === 0) && runningPid < 0 ? (
                            <span className="queue-empty">Queue is empty</span>
                        ) : (
                            queue?.map(pid => (
                                <motion.div
                                    key={pid}
                                    className="queue-item"
                                    style={{
                                        backgroundColor: PROC_COLORS[pid % 8],
                                        boxShadow: `0 4px 12px rgba(0,0,0,0.3)`,
                                    }}
                                    initial={{ scale: 0, rotateY: 90, opacity: 0 }}
                                    animate={{ scale: 1, rotateY: 0, opacity: 1 }}
                                    exit={{ scale: 0, rotateY: -90, opacity: 0 }}
                                    transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                                    whileHover={{ scale: 1.15, y: -4 }}
                                    layout
                                >
                                    P{pid}
                                </motion.div>
                            ))
                        )}
                    </AnimatePresence>
                </div>
            </div>
        </SpotlightCard>
    );
}
