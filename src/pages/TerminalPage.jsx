/**
 * TerminalPage — Embedded terminal using xterm.js.
 * Connects to a pseudo-terminal for running api commands directly.
 */

import { useEffect, useRef, useState } from 'react';

export default function TerminalPage() {
    const termRef = useRef(null);
    const xtermRef = useRef(null);
    const [isLoaded, setIsLoaded] = useState(false);

    useEffect(() => {
        let term;
        let fitAddon;

        async function initTerminal() {
            try {
                const { Terminal } = await import('xterm');
                const { FitAddon } = await import('xterm-addon-fit');

                // Import xterm CSS
                await import('xterm/css/xterm.css');

                term = new Terminal({
                    cursorBlink: true,
                    fontSize: 13,
                    fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
                    theme: {
                        background: '#0d1117',
                        foreground: '#E0E0E0',
                        cursor: '#E64833',
                        selectionBackground: 'rgba(68, 68, 68, 0.5)',
                        black: '#000000',
                        red: '#E64833',
                        green: '#34d399',
                        yellow: '#fbbf24',
                        blue: '#5ba3b5',
                        magenta: '#874F41',
                        cyan: '#B0B0B0',
                        white: '#E0E0E0',
                    },
                    rows: 30,
                    cols: 100,
                });

                fitAddon = new FitAddon();
                term.loadAddon(fitAddon);
                term.open(termRef.current);
                fitAddon.fit();

                // Welcome message
                term.writeln('\x1b[1;31m╔═══════════════════════════════════════════════════╗\x1b[0m');
                term.writeln('\x1b[1;31m║\x1b[0m  \x1b[1;37mCPU Scheduling Visualizer — Terminal\x1b[0m              \x1b[1;31m║\x1b[0m');
                term.writeln('\x1b[1;31m╚═══════════════════════════════════════════════════╝\x1b[0m');
                term.writeln('');
                term.writeln('\x1b[36mAvailable commands:\x1b[0m');
                term.writeln('  \x1b[33mhelp\x1b[0m          — Show this help');
                term.writeln('  \x1b[33mtrain\x1b[0m         — Train the AI model');
                term.writeln('  \x1b[33mpredict\x1b[0m       — Predict best algorithm for current workload');
                term.writeln('  \x1b[33mcompare\x1b[0m       — Compare all algorithms');
                term.writeln('  \x1b[33mstatus\x1b[0m        — Show api status');
                term.writeln('  \x1b[33mclear\x1b[0m         — Clear terminal');
                term.writeln('');

                let inputBuffer = '';
                const prompt = () => term.write('\x1b[32mkernel\x1b[0m:\x1b[34m~\x1b[0m$ ');

                prompt();

                term.onData(async (data) => {
                    const code = data.charCodeAt(0);

                    if (code === 13) { // Enter
                        term.writeln('');
                        const cmd = inputBuffer.trim();
                        inputBuffer = '';

                        if (cmd) await handleCommand(term, cmd);
                        prompt();
                    } else if (code === 127) { // Backspace
                        if (inputBuffer.length > 0) {
                            inputBuffer = inputBuffer.slice(0, -1);
                            term.write('\b \b');
                        }
                    } else if (code === 3) { // Ctrl+C
                        term.writeln('^C');
                        inputBuffer = '';
                        prompt();
                    } else {
                        inputBuffer += data;
                        term.write(data);
                    }
                });

                xtermRef.current = term;
                setIsLoaded(true);

                // Handle resize
                const resizeHandler = () => fitAddon.fit();
                window.addEventListener('resize', resizeHandler);

                return () => {
                    window.removeEventListener('resize', resizeHandler);
                    term.dispose();
                };
            } catch (err) {
                console.error('Terminal failed to load:', err);
            }
        }

        initTerminal();

        return () => {
            if (xtermRef.current) xtermRef.current.dispose();
        };
    }, []);

    return (
        <div className="terminal-container">
            <div className="terminal-wrapper">
                <div className="terminal-header">
                    <div className="terminal-header-dot" style={{ background: '#ff5f57' }} />
                    <div className="terminal-header-dot" style={{ background: '#febc2e' }} />
                    <div className="terminal-header-dot" style={{ background: '#28c840' }} />
                    <span className="terminal-header-title">kernel-terminal — bash</span>
                </div>
                <div className="terminal-body" ref={termRef} />
            </div>
        </div>
    );
}

async function handleCommand(term, cmd) {
    const API = 'https://cpu-scheduling-visualizer-euxn.onrender.com/api/v2';

    switch (cmd.toLowerCase()) {
        case 'help':
            term.writeln('\x1b[36mAvailable commands:\x1b[0m');
            term.writeln('  help, train, predict, compare, status, clear');
            break;

        case 'clear':
            term.clear();
            break;

        case 'status': {
            term.writeln('\x1b[33mChecking api status...\x1b[0m');
            try {
                const res = await fetch(`${API}/state`);
                const data = await res.json();
                term.writeln(`\x1b[32m✓\x1b[0m Backend is \x1b[1mONLINE\x1b[0m`);
                term.writeln(`  Algorithm: \x1b[36m${data.algorithm}\x1b[0m`);
                term.writeln(`  Current Time: \x1b[37m${data.currentTime}\x1b[0m`);
                term.writeln(`  Processes: \x1b[37m${data.processes?.length ?? 0}\x1b[0m`);
                term.writeln(`  Completed: \x1b[37m${data.isCompleted}\x1b[0m`);
            } catch {
                term.writeln('\x1b[31m✗ Backend is OFFLINE\x1b[0m');
                term.writeln('  Start with: python3 api/index.py');
            }
            break;
        }

        case 'train': {
            term.writeln('\x1b[33mTraining AI model...\x1b[0m');
            term.writeln('This uses the trained model at api/ai/model.joblib');
            term.writeln('\x1b[36mTo retrain, run:\x1b[0m python3 api/ai/trainer.py');
            try {
                const res = await fetch(`${API}/recommend`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ processes: [{ arrival: 0, burst: 5, priority: 1 }], quantum: 2 }),
                });
                const data = await res.json();
                if (data.ok) {
                    term.writeln(`\x1b[32m✓\x1b[0m Model is loaded and functional`);
                } else {
                    term.writeln(`\x1b[31m✗\x1b[0m ${data.error}`);
                }
            } catch {
                term.writeln('\x1b[31m✗ Backend offline\x1b[0m');
            }
            break;
        }

        case 'predict': {
            term.writeln('\x1b[33mPredicting best algorithm for current workload...\x1b[0m');
            try {
                const stateRes = await fetch(`${API}/state`);
                const stateData = await stateRes.json();
                const procs = stateData.processes?.map(p => ({
                    arrival: p.arrivalTime, burst: p.burstTime, priority: p.priority,
                })) ?? [];

                if (procs.length === 0) {
                    term.writeln('\x1b[31m✗ No processes loaded. Add some in the Simulator.\x1b[0m');
                    break;
                }

                const res = await fetch(`${API}/recommend`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ processes: procs, quantum: 2 }),
                });
                const data = await res.json();
                if (data.ok) {
                    term.writeln(`\x1b[32m✓ Recommended:\x1b[0m \x1b[1;33m${data.recommended_algorithm}\x1b[0m`);
                    term.writeln(`  Confidence: \x1b[36m${(data.confidence * 100).toFixed(1)}%\x1b[0m`);
                    if (data.all_probabilities) {
                        term.writeln('  Probabilities:');
                        Object.entries(data.all_probabilities).forEach(([algo, prob]) => {
                            const bar = '█'.repeat(Math.round(prob * 30));
                            term.writeln(`    \x1b[37m${algo.padEnd(12)}\x1b[36m${bar}\x1b[0m ${(prob * 100).toFixed(1)}%`);
                        });
                    }
                } else {
                    term.writeln(`\x1b[31m✗\x1b[0m ${data.error}`);
                }
            } catch {
                term.writeln('\x1b[31m✗ Request failed\x1b[0m');
            }
            break;
        }

        case 'compare': {
            term.writeln('\x1b[33mComparing all algorithms...\x1b[0m');
            try {
                const stateRes = await fetch(`${API}/state`);
                const stateData = await stateRes.json();
                const procs = stateData.processes?.map(p => ({
                    arrival: p.arrivalTime, burst: p.burstTime, priority: p.priority,
                })) ?? [];

                if (procs.length === 0) {
                    term.writeln('\x1b[31m✗ No processes loaded.\x1b[0m');
                    break;
                }

                const res = await fetch(`${API}/compare`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ processes: procs, quantum: 2 }),
                });
                const data = await res.json();
                if (data.ok) {
                    term.writeln('\x1b[32m✓ Results:\x1b[0m');
                    term.writeln(`  ${'Algorithm'.padEnd(14)} ${'AvgWait'.padEnd(10)} ${'AvgTAT'.padEnd(10)} ${'CPU%'.padEnd(8)}`);
                    term.writeln('  ' + '─'.repeat(44));
                    Object.entries(data.results).forEach(([algo, m]) => {
                        term.writeln(`  \x1b[37m${algo.padEnd(14)}\x1b[0m ${String(m.avgWaitTime).padEnd(10)} ${String(m.avgTurnaroundTime).padEnd(10)} ${String(m.cpuUtilization).padEnd(8)}`);
                    });
                }
            } catch {
                term.writeln('\x1b[31m✗ Request failed\x1b[0m');
            }
            break;
        }

        default:
            term.writeln(`\x1b[31mUnknown command:\x1b[0m ${cmd}`);
            term.writeln('Type \x1b[33mhelp\x1b[0m for available commands.');
    }
    term.writeln('');
}
