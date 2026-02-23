"""
app.py - Flask REST API for the CPU Scheduling Visualizer

Serves both the legacy v1 API (from scheduler.py) and the new v2 API
powered by the kernel simulation engine.

Run:
    python3 backend/app.py
"""

import os
import sys

# So we can import from the same folder
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from flask import Flask, jsonify, request
from flask_cors import CORS

# Legacy scheduler (v1)
from scheduler import Scheduler

# New kernel engine (v2)
from kernel.engine import SimulationEngine
from comparison.comparator import AlgorithmComparator
from ai.predictor import SchedulerPredictor

app = Flask(__name__)
CORS(app)

# ── Instances ──

scheduler = Scheduler()                  # Legacy v1
engine = SimulationEngine()              # New v2
comparator = AlgorithmComparator()

# Try to load AI model (may not exist yet)
predictor = SchedulerPredictor()


# ══════════════════════════════════════════════════════════════════════
#  LEGACY v1 API (preserved for backward compatibility)
# ══════════════════════════════════════════════════════════════════════

@app.route("/api/init", methods=["POST"])
def init():
    global scheduler
    scheduler = Scheduler()
    return jsonify({"ok": True})


@app.route("/api/reset", methods=["POST"])
def reset():
    scheduler.reset()
    return jsonify({"ok": True})


@app.route("/api/set-algorithm", methods=["POST"])
def set_algorithm():
    data = request.get_json(force=True)
    scheduler.set_algorithm(int(data.get("algorithm", 0)))
    return jsonify({"ok": True})


@app.route("/api/set-time-quantum", methods=["POST"])
def set_time_quantum():
    data = request.get_json(force=True)
    scheduler.set_time_quantum(int(data.get("quantum", 2)))
    return jsonify({"ok": True})


@app.route("/api/add-process", methods=["POST"])
def add_process():
    data = request.get_json(force=True)
    pid = scheduler.add_process(
        arrival=int(data.get("arrivalTime", 0)),
        burst=int(data.get("burstTime", 1)),
        priority=int(data.get("priority", 0)),
    )
    return jsonify({"ok": True, "pid": pid})


@app.route("/api/clear-processes", methods=["POST"])
def clear_processes():
    scheduler.clear_processes()
    return jsonify({"ok": True})


@app.route("/api/step", methods=["POST"])
def step():
    running = scheduler.step()
    return jsonify({"ok": True, "running": running, **scheduler.get_state()})


@app.route("/api/run-to-completion", methods=["POST"])
def run_to_completion():
    scheduler.run_to_completion()
    return jsonify({"ok": True, **scheduler.get_state()})


@app.route("/api/state", methods=["GET"])
def state():
    return jsonify(scheduler.get_state())


# ══════════════════════════════════════════════════════════════════════
#  NEW v2 API (kernel simulation engine)
# ══════════════════════════════════════════════════════════════════════

# ── Init / Reset ──

@app.route("/api/v2/init", methods=["POST"])
def v2_init():
    global engine
    engine = SimulationEngine()
    data = request.get_json(force=True) if request.data else {}
    if "algorithm" in data:
        engine.set_policy_by_id(int(data["algorithm"]))
    if "quantum" in data:
        engine.set_time_quantum(int(data["quantum"]))
    return jsonify({"ok": True})


@app.route("/api/v2/reset", methods=["POST"])
def v2_reset():
    engine.reset()
    return jsonify({"ok": True})


# ── Configuration ──

@app.route("/api/v2/set-algorithm", methods=["POST"])
def v2_set_algorithm():
    data = request.get_json(force=True)
    algo = data.get("algorithm", 0)
    if isinstance(algo, int):
        engine.set_policy_by_id(algo)
    else:
        engine.set_policy(str(algo))
    return jsonify({"ok": True})


@app.route("/api/v2/set-time-quantum", methods=["POST"])
def v2_set_time_quantum():
    data = request.get_json(force=True)
    engine.set_time_quantum(int(data.get("quantum", 2)))
    return jsonify({"ok": True})


# ── Process Management ──

@app.route("/api/v2/add-process", methods=["POST"])
def v2_add_process():
    data = request.get_json(force=True)
    pid = engine.add_process(
        arrival=int(data.get("arrivalTime", data.get("arrival", 0))),
        burst=int(data.get("burstTime", data.get("burst", 1))),
        priority=int(data.get("priority", 0)),
    )
    return jsonify({"ok": True, "pid": pid})


@app.route("/api/v2/clear", methods=["POST"])
def v2_clear():
    engine.clear()
    return jsonify({"ok": True})


# ── Simulation ──

@app.route("/api/v2/tick", methods=["POST"])
def v2_tick():
    """Execute one tick and return current state + latest metrics snapshot."""
    running = engine.tick()
    state = engine.get_state()
    # Include just the latest snapshot for efficiency
    latest_snapshot = (
        engine.metrics_collector.tick_snapshots[-1]
        if engine.metrics_collector.tick_snapshots
        else {}
    )
    return jsonify({
        "ok": True,
        "running": running,
        "latestSnapshot": latest_snapshot,
        **state,
    })


@app.route("/api/v2/run-all", methods=["POST"])
def v2_run_all():
    """Run simulation to completion and return full state with all snapshots."""
    engine.run_to_completion()
    return jsonify({"ok": True, **engine.get_state()})


@app.route("/api/v2/state", methods=["GET"])
def v2_state():
    return jsonify(engine.get_state())


@app.route("/api/v2/metrics-history", methods=["GET"])
def v2_metrics_history():
    """Return the full array of per-tick metric snapshots."""
    return jsonify({
        "ok": True,
        "history": engine.metrics_collector.tick_snapshots,
    })


# ── Algorithm Comparison ──

@app.route("/api/v2/compare", methods=["POST"])
def v2_compare():
    """Run the same processes on all algorithms and return comparison."""
    data = request.get_json(force=True)
    processes = data.get("processes", [])
    quantum = int(data.get("quantum", 2))
    detailed = data.get("detailed", False)

    if not processes:
        return jsonify({"ok": False, "error": "No processes provided"}), 400

    if detailed:
        results = comparator.compare_detailed(processes, quantum)
    else:
        results = comparator.compare(processes, quantum)

    return jsonify({"ok": True, "results": results})


# ── AI Recommendation ──

@app.route("/api/v2/recommend", methods=["POST"])
def v2_recommend():
    """Predict the best algorithm for a workload."""
    data = request.get_json(force=True)
    processes = data.get("processes", [])
    quantum = int(data.get("quantum", 2))

    if not processes:
        return jsonify({"ok": False, "error": "No processes provided"}), 400

    if not predictor.is_available():
        return jsonify({
            "ok": False,
            "error": "AI model not trained yet. Run: python3 backend/ai/trainer.py",
        }), 503

    result = predictor.predict(processes, quantum)
    return jsonify({"ok": True, **result})


# ── Main ──

if __name__ == "__main__":
    print("🚀 CPU Scheduler API running on http://localhost:5001")
    print("   v1 endpoints: /api/*")
    print("   v2 endpoints: /api/v2/*")
    app.run(host="0.0.0.0", port=5001, debug=True)
