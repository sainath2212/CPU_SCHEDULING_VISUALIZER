"""
kernel/ — Discrete-event CPU scheduling simulation engine.

Provides a tick-based simulation that mirrors how a real OS kernel
scheduler works: timer interrupts, context switching, ready queue
management, and per-tick metrics collection.
"""

from .process import PCB, ProcessState
from .ready_queue import ReadyQueue
from .metrics_collector import MetricsCollector
from .engine import SimulationEngine

__all__ = [
    "PCB",
    "ProcessState",
    "ReadyQueue",
    "MetricsCollector",
    "SimulationEngine",
]
