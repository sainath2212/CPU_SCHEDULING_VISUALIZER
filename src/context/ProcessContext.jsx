import { createContext, useContext, useState, useCallback, useRef } from 'react';

const ProcessContext = createContext(null);

/**
 * Shared process state provider — Master Workload Pattern.
 *
 * The master workload is the source of truth. When switching algorithms,
 * processes are deep-copied from master (NOT regenerated). All pages
 * share the same process list.
 */
export function ProcessProvider({ children }) {
    const [masterWorkload, setMasterWorkload] = useState([]);
    const [processes, setProcesses] = useState([]);
    const [algorithm, setAlgorithm] = useState(0);
    const [quantum, setQuantum] = useState(2);
    const pidCounter = useRef(0);

    const addProcess = useCallback((arrival, burst, priority) => {
        const pid = pidCounter.current++;
        const proc = { pid, arrival: +arrival, burst: +burst, priority: +priority };
        setMasterWorkload(prev => [...prev, proc]);
        setProcesses(prev => [...prev, {
            ...proc,
            remaining: +burst,
            state: 'NEW',
            waitTime: 0,
            turnaroundTime: 0,
            responseTime: -1,
        }]);
    }, []);

    const removeProcess = useCallback((pid) => {
        setMasterWorkload(prev => prev.filter(p => p.pid !== pid));
        setProcesses(prev => prev.filter(p => p.pid !== pid));
    }, []);

    const clearProcesses = useCallback(() => {
        setMasterWorkload([]);
        setProcesses([]);
        pidCounter.current = 0;
    }, []);

    const loadSampleProcesses = useCallback(() => {
        const samples = [
            { pid: 0, arrival: 0, burst: 7, priority: 2 },
            { pid: 1, arrival: 2, burst: 4, priority: 1 },
            { pid: 2, arrival: 4, burst: 1, priority: 3 },
            { pid: 3, arrival: 5, burst: 4, priority: 2 },
            { pid: 4, arrival: 7, burst: 6, priority: 1 },
        ];
        pidCounter.current = 5;
        setMasterWorkload(samples);
        setProcesses(samples.map(p => ({
            ...p,
            remaining: p.burst,
            state: 'NEW',
            waitTime: 0,
            turnaroundTime: 0,
            responseTime: -1,
        })));
    }, []);

    /** Deep-copy master → processes. Called on algorithm switch or manual reset. */
    const resetFromMaster = useCallback(() => {
        setProcesses(masterWorkload.map(p => ({
            ...p,
            remaining: p.burst,
            state: 'NEW',
            waitTime: 0,
            turnaroundTime: 0,
            responseTime: -1,
        })));
    }, [masterWorkload]);

    return (
        <ProcessContext.Provider value={{
            masterWorkload,
            processes,
            setProcesses,
            algorithm,
            setAlgorithm,
            quantum,
            setQuantum,
            addProcess,
            removeProcess,
            clearProcesses,
            loadSampleProcesses,
            resetFromMaster,
        }}>
            {children}
        </ProcessContext.Provider>
    );
}

export function useProcesses() {
    const ctx = useContext(ProcessContext);
    if (!ctx) throw new Error('useProcesses must be used within ProcessProvider');
    return ctx;
}
