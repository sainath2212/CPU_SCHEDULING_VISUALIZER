/**
 * Aceternity-inspired UI components.
 * 3D tilt cards, spotlight hover, animated borders, dot grid backgrounds,
 * glowing orbs, and particle effects — all using Framer Motion.
 */

import { useRef, useState, useEffect, useCallback } from 'react';
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';

/* ═══════════════════════════════════════════════════════════════
   3D TILT CARD — Follows mouse position with perspective tilt
   ═══════════════════════════════════════════════════════════════ */

export function Card3D({ children, className = '', glowColor = 'rgba(230,72,51,0.15)', style = {} }) {
    const ref = useRef(null);
    const x = useMotionValue(0);
    const y = useMotionValue(0);
    const rotateX = useSpring(useTransform(y, [-0.5, 0.5], [8, -8]), { stiffness: 200, damping: 20 });
    const rotateY = useSpring(useTransform(x, [-0.5, 0.5], [-8, 8]), { stiffness: 200, damping: 20 });

    const handleMouse = useCallback((e) => {
        const rect = ref.current?.getBoundingClientRect();
        if (!rect) return;
        x.set((e.clientX - rect.left) / rect.width - 0.5);
        y.set((e.clientY - rect.top) / rect.height - 0.5);
    }, [x, y]);

    const handleLeave = useCallback(() => { x.set(0); y.set(0); }, [x, y]);

    return (
        <motion.div
            ref={ref}
            onMouseMove={handleMouse}
            onMouseLeave={handleLeave}
            style={{
                perspective: 1000,
                transformStyle: 'preserve-3d',
                rotateX,
                rotateY,
                ...style,
            }}
            className={className}
        >
            <div style={{
                position: 'relative',
                background: 'rgba(36,72,85,0.55)',
                backdropFilter: 'blur(20px)',
                WebkitBackdropFilter: 'blur(20px)',
                border: '1px solid rgba(144,174,173,0.18)',
                borderRadius: '1rem',
                overflow: 'hidden',
                transformStyle: 'preserve-3d',
            }}>
                {/* Spotlight glow that follows mouse */}
                <motion.div
                    style={{
                        position: 'absolute',
                        inset: 0,
                        background: `radial-gradient(400px circle at ${50}% ${50}%, ${glowColor}, transparent 70%)`,
                        pointerEvents: 'none',
                        opacity: 0.6,
                        zIndex: 0,
                    }}
                />
                <div style={{ position: 'relative', zIndex: 1 }}>
                    {children}
                </div>
            </div>
        </motion.div>
    );
}


/* ═══════════════════════════════════════════════════════════════
   SPOTLIGHT CARD — Glowing border that follows cursor
   ═══════════════════════════════════════════════════════════════ */

export function SpotlightCard({ children, className = '', spotlightColor = '#E64833' }) {
    const divRef = useRef(null);
    const [pos, setPos] = useState({ x: 0, y: 0 });
    const [opacity, setOpacity] = useState(0);

    const handleMouse = (e) => {
        const rect = divRef.current?.getBoundingClientRect();
        if (!rect) return;
        setPos({ x: e.clientX - rect.left, y: e.clientY - rect.top });
    };

    return (
        <div
            ref={divRef}
            onMouseMove={handleMouse}
            onMouseEnter={() => setOpacity(1)}
            onMouseLeave={() => setOpacity(0)}
            className={className}
            style={{
                position: 'relative',
                overflow: 'hidden',
                background: 'rgba(36,72,85,0.55)',
                backdropFilter: 'blur(20px)',
                WebkitBackdropFilter: 'blur(20px)',
                border: '1px solid rgba(144,174,173,0.18)',
                borderRadius: '1rem',
            }}
        >
            {/* Moving spotlight border */}
            <div
                style={{
                    position: 'absolute',
                    inset: 0,
                    pointerEvents: 'none',
                    opacity,
                    transition: 'opacity 0.3s',
                    background: `radial-gradient(300px circle at ${pos.x}px ${pos.y}px, ${spotlightColor}33, transparent 70%)`,
                    zIndex: 0,
                }}
            />
            {/* Moving border glow */}
            <div
                style={{
                    position: 'absolute',
                    inset: -1,
                    pointerEvents: 'none',
                    opacity,
                    transition: 'opacity 0.3s',
                    background: `radial-gradient(200px circle at ${pos.x}px ${pos.y}px, ${spotlightColor}66, transparent 60%)`,
                    mask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
                    maskComposite: 'exclude',
                    WebkitMaskComposite: 'xor',
                    padding: '1px',
                    borderRadius: '1rem',
                    zIndex: 1,
                }}
            />
            <div style={{ position: 'relative', zIndex: 2 }}>
                {children}
            </div>
        </div>
    );
}


/* ═══════════════════════════════════════════════════════════════
   ANIMATED BORDER GRADIENT — Rotating conic gradient border
   ═══════════════════════════════════════════════════════════════ */

export function AnimatedBorderCard({ children, className = '', borderColors = ['#E64833', '#90AEAD', '#874F41', '#FBE9D0'] }) {
    return (
        <div className={className} style={{ position: 'relative', borderRadius: '1rem', padding: '1px' }}>
            <div style={{
                position: 'absolute',
                inset: 0,
                borderRadius: '1rem',
                background: `conic-gradient(from var(--border-angle, 0deg), ${borderColors.join(', ')}, ${borderColors[0]})`,
                animation: 'borderRotate 4s linear infinite',
                opacity: 0.6,
            }} />
            <div style={{
                position: 'relative',
                background: 'rgba(26,54,64,0.95)',
                backdropFilter: 'blur(20px)',
                borderRadius: 'calc(1rem - 1px)',
                overflow: 'hidden',
            }}>
                {children}
            </div>
            <style>{`
        @property --border-angle {
          syntax: "<angle>";
          initial-value: 0deg;
          inherits: false;
        }
        @keyframes borderRotate {
          from { --border-angle: 0deg; }
          to { --border-angle: 360deg; }
        }
      `}</style>
        </div>
    );
}


/* ═══════════════════════════════════════════════════════════════
   DOT GRID BACKGROUND — Subtle animated dot pattern
   ═══════════════════════════════════════════════════════════════ */

export function DotGrid({ className = '' }) {
    return (
        <div
            className={className}
            style={{
                position: 'absolute',
                inset: 0,
                pointerEvents: 'none',
                overflow: 'hidden',
                zIndex: 0,
                opacity: 0.25,
                backgroundImage: `radial-gradient(circle, rgba(144,174,173,0.5) 1px, transparent 1px)`,
                backgroundSize: '24px 24px',
                maskImage: 'linear-gradient(180deg, transparent, black 20%, black 80%, transparent)',
                WebkitMaskImage: 'linear-gradient(180deg, transparent, black 20%, black 80%, transparent)',
            }}
        />
    );
}


/* ═══════════════════════════════════════════════════════════════
   FLOATING PARTICLES — Animated glowing spheres
   ═══════════════════════════════════════════════════════════════ */

function Particle({ size, x, y, duration, delay, color }) {
    return (
        <motion.div
            style={{
                position: 'absolute',
                width: size,
                height: size,
                borderRadius: '50%',
                background: color,
                filter: `blur(${size / 3}px)`,
                left: `${x}%`,
                top: `${y}%`,
            }}
            animate={{
                x: [0, 30, -20, 15, 0],
                y: [0, -25, 10, -15, 0],
                opacity: [0.3, 0.7, 0.4, 0.6, 0.3],
                scale: [1, 1.2, 0.9, 1.1, 1],
            }}
            transition={{
                duration,
                delay,
                repeat: Infinity,
                ease: 'easeInOut',
            }}
        />
    );
}

export function FloatingParticles({ count = 12 }) {
    const colors = ['#E64833', '#90AEAD', '#874F41', '#FBE9D0', '#5ba3b5'];
    const particles = Array.from({ length: count }, (_, i) => ({
        id: i,
        size: 4 + Math.random() * 12,
        x: Math.random() * 100,
        y: Math.random() * 100,
        duration: 8 + Math.random() * 12,
        delay: Math.random() * 5,
        color: colors[i % colors.length],
    }));

    return (
        <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', overflow: 'hidden', zIndex: 0 }}>
            {particles.map(p => <Particle key={p.id} {...p} />)}
        </div>
    );
}


/* ═══════════════════════════════════════════════════════════════
   METEORS — Aceternity-style shooting star streaks
   ═══════════════════════════════════════════════════════════════ */

export function Meteors({ count = 8 }) {
    const meteors = Array.from({ length: count }, (_, i) => ({
        id: i,
        left: `${5 + Math.random() * 90}%`,
        delay: Math.random() * 6,
        duration: 1.5 + Math.random() * 2.5,
        size: 1 + Math.random() * 1.5,
    }));

    return (
        <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', overflow: 'hidden', zIndex: 0 }}>
            {meteors.map(m => (
                <motion.div
                    key={m.id}
                    style={{
                        position: 'absolute',
                        top: -20,
                        left: m.left,
                        width: `${m.size}px`,
                        height: '80px',
                        background: `linear-gradient(180deg, #E6483388, transparent)`,
                        borderRadius: '50%',
                        transform: 'rotate(-45deg)',
                    }}
                    animate={{ y: [0, 600], opacity: [1, 0] }}
                    transition={{
                        duration: m.duration,
                        delay: m.delay,
                        repeat: Infinity,
                        ease: 'linear',
                    }}
                />
            ))}
        </div>
    );
}


/* ═══════════════════════════════════════════════════════════════
   GLOWING TEXT — Pulsing text with glow effect
   ═══════════════════════════════════════════════════════════════ */

export function GlowText({ children, color = '#E64833', className = '', style = {} }) {
    return (
        <motion.span
            className={className}
            style={{
                color,
                textShadow: `0 0 20px ${color}55, 0 0 40px ${color}33, 0 0 60px ${color}22`,
                ...style,
            }}
            animate={{
                textShadow: [
                    `0 0 20px ${color}55, 0 0 40px ${color}33`,
                    `0 0 30px ${color}77, 0 0 60px ${color}44`,
                    `0 0 20px ${color}55, 0 0 40px ${color}33`,
                ],
            }}
            transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
        >
            {children}
        </motion.span>
    );
}


/* ═══════════════════════════════════════════════════════════════
   BEAM LINE — Animated moving beam on a line
   ═══════════════════════════════════════════════════════════════ */

export function BeamLine({ width = '100%', color = '#E64833', duration = 3 }) {
    return (
        <div style={{ position: 'relative', width, height: '2px', background: 'rgba(144,174,173,0.1)', borderRadius: '1px', overflow: 'hidden' }}>
            <motion.div
                style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '60px',
                    height: '100%',
                    background: `linear-gradient(90deg, transparent, ${color}, transparent)`,
                    borderRadius: '1px',
                }}
                animate={{ x: ['-60px', '100%'] }}
                transition={{ duration, repeat: Infinity, ease: 'linear' }}
            />
        </div>
    );
}


/* ═══════════════════════════════════════════════════════════════
   3D CPU CHIP — Perspective chip with inner circuit lines
   ═══════════════════════════════════════════════════════════════ */

export function CpuChip3D({ isActive, processName, progress = 0, remaining = 0, total = 0 }) {
    const ref = useRef(null);
    const [rot, setRot] = useState({ x: 0, y: 0 });

    const handleMouse = (e) => {
        const rect = ref.current?.getBoundingClientRect();
        if (!rect) return;
        const cx = e.clientX - rect.left - rect.width / 2;
        const cy = e.clientY - rect.top - rect.height / 2;
        setRot({ x: -(cy / rect.height) * 15, y: (cx / rect.width) * 15 });
    };

    return (
        <div
            ref={ref}
            onMouseMove={handleMouse}
            onMouseLeave={() => setRot({ x: 0, y: 0 })}
            style={{ perspective: '800px', cursor: 'default' }}
        >
            <motion.div
                animate={{ rotateX: rot.x, rotateY: rot.y }}
                transition={{ type: 'spring', stiffness: 200, damping: 25 }}
                style={{
                    transformStyle: 'preserve-3d',
                    position: 'relative',
                    width: '100%',
                    minHeight: '200px',
                    background: isActive
                        ? 'linear-gradient(145deg, rgba(230,72,51,0.08), rgba(36,72,85,0.6))'
                        : 'rgba(36,72,85,0.4)',
                    border: `2px solid ${isActive ? '#E64833' : 'rgba(144,174,173,0.15)'}`,
                    borderRadius: '1.25rem',
                    padding: '1.5rem',
                    boxShadow: isActive
                        ? '0 0 60px rgba(230,72,51,0.2), inset 0 0 40px rgba(230,72,51,0.05)'
                        : '0 4px 20px rgba(0,0,0,0.2)',
                    transition: 'border-color 0.3s, box-shadow 0.3s',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '1rem',
                }}
            >
                {/* Circuit lines */}
                <svg style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', opacity: 0.06 }} viewBox="0 0 200 200">
                    <line x1="0" y1="50" x2="200" y2="50" stroke="#90AEAD" strokeWidth="0.5" />
                    <line x1="0" y1="100" x2="200" y2="100" stroke="#90AEAD" strokeWidth="0.5" />
                    <line x1="0" y1="150" x2="200" y2="150" stroke="#90AEAD" strokeWidth="0.5" />
                    <line x1="50" y1="0" x2="50" y2="200" stroke="#90AEAD" strokeWidth="0.5" />
                    <line x1="100" y1="0" x2="100" y2="200" stroke="#90AEAD" strokeWidth="0.5" />
                    <line x1="150" y1="0" x2="150" y2="200" stroke="#90AEAD" strokeWidth="0.5" />
                    <rect x="70" y="70" width="60" height="60" stroke="#E64833" strokeWidth="1" fill="none" rx="4" opacity="0.5" />
                </svg>

                {/* Label */}
                <div style={{
                    fontSize: '0.6rem', fontWeight: 700, color: 'rgba(251,233,208,0.4)',
                    textTransform: 'uppercase', letterSpacing: '0.15em',
                    position: 'relative', zIndex: 1,
                }}>
                    CPU Core 0
                </div>

                {/* Process name */}
                <motion.div
                    key={processName}
                    initial={{ scale: 0.5, opacity: 0, rotateX: 90 }}
                    animate={{ scale: 1, opacity: 1, rotateX: 0 }}
                    exit={{ scale: 0.5, opacity: 0, rotateX: -90 }}
                    transition={{ type: 'spring', stiffness: 200, damping: 20 }}
                    style={{
                        fontSize: '2.5rem', fontWeight: 900,
                        fontFamily: "'JetBrains Mono', monospace",
                        color: isActive ? '#E64833' : 'rgba(144,174,173,0.4)',
                        position: 'relative', zIndex: 1,
                        textShadow: isActive ? '0 0 30px rgba(230,72,51,0.4)' : 'none',
                    }}
                >
                    {isActive ? processName : 'IDLE'}
                </motion.div>

                {/* Progress ring */}
                {isActive && (
                    <div style={{ position: 'relative', zIndex: 1, width: '100%', maxWidth: '180px' }}>
                        <div style={{
                            height: '6px', background: 'rgba(144,174,173,0.1)',
                            borderRadius: '3px', overflow: 'hidden',
                        }}>
                            <motion.div
                                style={{ height: '100%', borderRadius: '3px', background: 'linear-gradient(90deg, #E64833, #90AEAD)' }}
                                initial={{ width: 0 }}
                                animate={{ width: `${progress}%` }}
                                transition={{ duration: 0.3 }}
                            />
                        </div>
                        <div style={{
                            marginTop: '6px', textAlign: 'center',
                            fontSize: '0.7rem', fontFamily: "'JetBrains Mono', monospace",
                            color: 'rgba(251,233,208,0.5)',
                        }}>
                            {remaining} / {total} remaining
                        </div>
                    </div>
                )}

                {/* Pulsing ring for active */}
                {isActive && (
                    <motion.div
                        style={{
                            position: 'absolute', inset: -2,
                            border: '1px solid #E64833',
                            borderRadius: '1.25rem',
                            pointerEvents: 'none',
                        }}
                        animate={{ opacity: [0.5, 0, 0.5], scale: [1, 1.02, 1] }}
                        transition={{ duration: 2, repeat: Infinity }}
                    />
                )}
            </motion.div>
        </div>
    );
}


/* ═══════════════════════════════════════════════════════════════
   NUMBER COUNTER — Animated number that counts up
   ═══════════════════════════════════════════════════════════════ */

export function AnimatedNumber({ value, duration = 0.8, className = '' }) {
    const [display, setDisplay] = useState(0);

    useEffect(() => {
        const target = typeof value === 'number' ? value : parseFloat(value) || 0;
        const start = display;
        const startTime = Date.now();
        const dur = duration * 1000;

        const animate = () => {
            const elapsed = Date.now() - startTime;
            const progress = Math.min(elapsed / dur, 1);
            const eased = 1 - Math.pow(1 - progress, 3);
            setDisplay(start + (target - start) * eased);
            if (progress < 1) requestAnimationFrame(animate);
        };

        requestAnimationFrame(animate);
    }, [value]);

    const isInt = Number.isInteger(value);
    return <span className={className}>{isInt ? Math.round(display) : display.toFixed(2)}</span>;
}
