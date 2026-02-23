/**
 * GanttChart — Live visual timeline that grows per tick.
 */

import { useRef, useEffect } from 'react';
import { motion } from 'framer-motion';

const PROC_COLORS = ['#E64833', '#B0B0B0', '#874F41', '#E0E0E0', '#5ba3b5', '#d4956a', '#7ec8a0', '#c87e7e'];

export default function GanttChart({ gantt, currentTime }) {
    const scrollRef = useRef(null);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollLeft = scrollRef.current.scrollWidth;
        }
    }, [gantt, currentTime]);

    if (!gantt || gantt.length === 0) {
        return (
            <div className="card">
                <div className="card-header">
                    <h3 className="card-title">
                        <svg className="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <rect x="2" y="3" width="20" height="4" rx="1" />
                            <rect x="2" y="10" width="14" height="4" rx="1" />
                            <rect x="2" y="17" width="18" height="4" rx="1" />
                        </svg>
                        Gantt Chart
                    </h3>
                </div>
                <p style={{ color: 'var(--color-kernel-text-muted)', fontSize: '0.82rem', fontStyle: 'italic' }}>
                    Start simulation to see the Gantt chart grow...
                </p>
            </div>
        );
    }

    const maxTime = currentTime || Math.max(...gantt.map(b => b.endTime));
    const UNIT = 32;

    return (
        <div className="card">
            <div className="card-header">
                <h3 className="card-title">
                    <svg className="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <rect x="2" y="3" width="20" height="4" rx="1" />
                        <rect x="2" y="10" width="14" height="4" rx="1" />
                        <rect x="2" y="17" width="18" height="4" rx="1" />
                    </svg>
                    Gantt Chart
                </h3>
                <span style={{ fontSize: '0.7rem', color: 'var(--color-kernel-text-muted)', fontFamily: 'var(--font-mono)' }}>
                    t = 0..{maxTime}
                </span>
            </div>

            <div className="gantt-container" ref={scrollRef}>
                <div className="gantt-chart">
                    <div className="gantt-row">
                        <div className="gantt-label">CPU</div>
                        <div className="gantt-blocks">
                            {gantt.map((block, i) => {
                                const width = (block.endTime - block.startTime) * UNIT;
                                const isIdle = block.pid === -1;
                                return (
                                    <motion.div
                                        key={i}
                                        className={`gantt-block ${isIdle ? 'idle' : ''}`}
                                        style={{
                                            width: `${width}px`,
                                            backgroundColor: isIdle ? undefined : PROC_COLORS[block.pid % 8],
                                        }}
                                        initial={{ scaleX: 0, opacity: 0 }}
                                        animate={{ scaleX: 1, opacity: 1 }}
                                        transition={{ duration: 0.15, ease: 'easeOut' }}
                                        title={isIdle ? `Idle t=${block.startTime}-${block.endTime}` : `P${block.pid} t=${block.startTime}-${block.endTime}`}
                                    >
                                        {isIdle ? '—' : `P${block.pid}`}
                                    </motion.div>
                                );
                            })}
                        </div>
                    </div>
                </div>

                <div className="gantt-timeline" style={{ display: 'flex', marginLeft: 'calc(32px + 0.5rem)' }}>
                    {Array.from({ length: maxTime + 1 }, (_, t) => (
                        <div key={t} className="gantt-time" style={{ width: `${UNIT}px` }}>{t}</div>
                    ))}
                </div>
            </div>
        </div>
    );
}
