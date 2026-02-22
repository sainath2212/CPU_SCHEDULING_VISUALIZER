"""
app.py - Flask REST API for the CPU Scheduling Visualizer

All scheduling logic lives in scheduler.py (Python backend).
The frontend calls these endpoints — it has no scheduling logic.

Run:
    python3 backend/app.py
"""

import os
import sys

# So we can import scheduler.py from the same folder
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from flask import Flask, jsonify, request
from flask_cors import CORS
from scheduler import Scheduler

app = Flask(__name__)
CORS(app)

scheduler = Scheduler()


# ── Init / Reset ──────────────────────────────────────────────────────

@app.route("/api/init", methods=["POST"])
def init():
    global scheduler
    scheduler = Scheduler()
    return jsonify({"ok": True})


@app.route("/api/reset", methods=["POST"])
def reset():
    scheduler.reset()
    return jsonify({"ok": True})


# ── Configuration ─────────────────────────────────────────────────────

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


# ── Process Management ────────────────────────────────────────────────

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


# ── Simulation ────────────────────────────────────────────────────────

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


# ── Main ──────────────────────────────────────────────────────────────

if __name__ == "__main__":
    print("🚀 CPU Scheduler API running on http://localhost:5001")
    app.run(host="0.0.0.0", port=5001, debug=True)
