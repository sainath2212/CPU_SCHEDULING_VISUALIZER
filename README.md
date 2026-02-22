# CPU Scheduling Visualizer

A real-time, interactive CPU scheduling simulator built with **React + Vite** (frontend) and a **Python Flask** REST API (backend). Visualize how 8 different scheduling algorithms work step-by-step with a live Gantt chart, ready queue animation, process state table, and performance metrics dashboard.

**Also supports Terminal Mode** — run the simulation directly in your terminal with colored ASCII output, no browser required.

![Backend](https://img.shields.io/badge/Backend-Python%20Flask-blue)
![Frontend](https://img.shields.io/badge/Frontend-React%2019%20%2B%20Vite%205-61dafb)
![License](https://img.shields.io/badge/License-MIT-green)
![Algorithms](https://img.shields.io/badge/Algorithms-8-orange)

---

## Live Demo

**https://cpu-scheduling-visualizer-zeta.vercel.app/**

> Terminal Mode is only available in the local build.

---

## Quick Start

### Option 1: One-Command Setup (Web Mode)

```bash
chmod +x install.sh
./install.sh
```

The script will:
1. Check / install **Homebrew** (macOS only)
2. Check / install **Node.js** and **Python 3**
3. Install frontend dependencies (`npm install`)
4. Create a Python virtual environment and install Flask
5. Start the Flask API server (port 5001) and the Vite dev server (port 3000)

Once running, open **http://localhost:3000/**

### Option 2: Terminal Mode (No browser needed)

```bash
./install.sh --terminal
```

Or manually:

```bash
python3 -m venv backend/venv
source backend/venv/bin/activate
pip install -r backend/requirements.txt
python3 backend/terminal_ui.py
```

**CLI options:**
```bash
python3 backend/terminal_ui.py --help
python3 backend/terminal_ui.py -a 4 -q 2 -s -r   # Round Robin, quantum=2, sample data, auto-run
```

### Option 3: Manual Setup

```bash
# 1. Install frontend dependencies
npm install

# 2. Set up Python virtual environment
python3 -m venv backend/venv
source backend/venv/bin/activate          # Windows: backend\venv\Scripts\activate
pip install -r backend/requirements.txt

# 3. Start Flask API server (in background)
python3 backend/app.py &

# 4. Start Vite dev server
npm run dev
```

---

## Supported Scheduling Algorithms

| # | Algorithm | Type | Description |
|---|-----------|------|-------------|
| 0 | **FCFS** | Non-preemptive | First Come, First Served — processes run in arrival order |
| 1 | **SJF** | Non-preemptive | Shortest Job First — shortest burst time runs next |
| 2 | **SRTF** | Preemptive | Shortest Remaining Time First — preempts if a shorter job arrives |
| 3 | **Priority** | Non-preemptive | Priority Scheduling — lowest priority number runs first |
| 4 | **Round Robin** | Preemptive | Time-sliced execution with configurable quantum |
| 5 | **LJF** | Non-preemptive | Longest Job First — longest burst time runs next |
| 6 | **LRTF** | Preemptive | Longest Remaining Time First — preempts if a longer job arrives |
| 7 | **MLFQ** | Preemptive | Multi-Level Feedback Queue (3 queues: RR q=4 → RR q=8 → FCFS) |

### MLFQ Details

The Multi-Level Feedback Queue uses three priority levels:
- **Queue 0** (highest priority): Round Robin with quantum = 4
- **Queue 1**: Round Robin with quantum = 8
- **Queue 2** (lowest priority): FCFS — runs to completion

Processes enter at Queue 0 and are demoted when their time quantum expires. Higher-priority queues preempt lower-priority ones.

---

## Features

### Web Mode
- **Real-time Visualization** — processes animate through NEW → READY → RUNNING → TERMINATED states
- **Gantt Chart** — live CPU execution timeline with color-coded process blocks and idle detection
- **Ready Queue Display** — visual representation of the current CPU and waiting queue
- **Dynamic Process Addition** — add processes while the simulation is running
- **Performance Metrics** — Average Wait Time, Turnaround Time, Response Time, CPU Utilization, Throughput, and Total Execution Time
- **Simulation Controls** — Play/Pause, Step (one tick at a time), Run to End, Reset, and Clear All
- **Speed Control** — adjustable simulation speed from 50ms to 2000ms per tick
- **Sample Data** — one-click generation of 5 random processes for quick testing
- **Algorithm Selector** — visual grid with preemptive/non-preemptive badges

### Terminal Mode
- Colored ASCII Gantt chart with ANSI codes
- Real-time process table with state colors
- Step-by-step or auto-run simulation
- Performance metrics summary
- CLI flags for algorithm, quantum, sample data, and auto-run

---

## Architecture

```
┌──────────────────────────┐          HTTP/JSON           ┌─────────────────────────┐
│      React Frontend      │  ◄────────────────────────►  │   Flask REST API        │
│  (Vite dev server :3000) │         /api/*               │   (Python :5001)        │
│                          │                              │                         │
│  Components:             │                              │  scheduler.py           │
│  ├─ AlgorithmSelector    │                              │  ├─ Tick-based engine   │
│  ├─ ProcessForm          │       POST /api/step         │  ├─ State management    │
│  ├─ ControlPanel         │  ──────────────────────────► │  └─ Metrics calculation │
│  ├─ GanttChart           │                              │                         │
│  ├─ ProcessTable         │       JSON state response    │  algorithms/            │
│  ├─ ReadyQueue           │  ◄────────────────────────── │  ├─ fcfs.py             │
│  └─ MetricsDashboard     │                              │  ├─ sjf.py, srtf.py     │
│                          │                              │  ├─ priority.py         │
│  useScheduler.js hook    │                              │  ├─ round_robin.py      │
│  (API communication)     │                              │  ├─ ljf.py, lrtf.py     │
└──────────────────────────┘                              │  └─ mlfq.py            │
                                                          └─────────────────────────┘
```

---

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/init` | Initialize a new scheduler instance |
| `POST` | `/api/reset` | Reset the current simulation |
| `POST` | `/api/set-algorithm` | Set the scheduling algorithm (`{ "algorithm": 0-7 }`) |
| `POST` | `/api/set-time-quantum` | Set Round Robin time quantum (`{ "quantum": n }`) |
| `POST` | `/api/add-process` | Add a process (`{ "arrivalTime", "burstTime", "priority" }`) |
| `POST` | `/api/clear-processes` | Remove all processes |
| `POST` | `/api/step` | Advance simulation by one tick |
| `POST` | `/api/run-to-completion` | Run until all processes terminate |
| `GET`  | `/api/state` | Get current simulation state |

---

## Project Structure

```
cpu-scheduling-visualizer/
├── backend/
│   ├── algorithms/               # One file per scheduling algorithm
│   │   ├── __init__.py
│   │   ├── fcfs.py               # First Come First Serve
│   │   ├── sjf.py                # Shortest Job First
│   │   ├── srtf.py               # Shortest Remaining Time First
│   │   ├── priority.py           # Priority Scheduling
│   │   ├── round_robin.py        # Round Robin
│   │   ├── ljf.py                # Longest Job First
│   │   ├── lrtf.py               # Longest Remaining Time First
│   │   ├── mlfq.py               # Multi-Level Feedback Queue
│   │   └── utils.py              # Shared utilities
│   ├── app.py                    # Flask REST API server
│   ├── scheduler.py              # Tick-based scheduling engine
│   ├── terminal_ui.py            # Terminal mode visualizer
│   └── requirements.txt          # Python dependencies (Flask, Flask-CORS)
├── src/
│   ├── components/
│   │   ├── AlgorithmSelector.jsx # Algorithm selection grid
│   │   ├── ControlPanel.jsx      # Play/Pause/Step/Reset controls
│   │   ├── GanttChart.jsx        # CPU execution timeline
│   │   ├── MetricsDashboard.jsx  # Performance metrics cards
│   │   ├── ProcessForm.jsx       # Add process form + sample generator
│   │   ├── ProcessTable.jsx      # Live process state table
│   │   └── ReadyQueue.jsx        # Ready queue visualization
│   ├── hooks/
│   │   └── useScheduler.js       # React hook for backend API calls
│   ├── pages/
│   │   ├── LandingPage.jsx       # Home page with algorithm overview
│   │   └── SimulatorPage.jsx     # Main simulator interface
│   ├── App.jsx                   # Root component with routing
│   ├── main.jsx                  # React entry point
│   └── index.css                 # Global styles
├── install.sh                    # One-command setup script
├── vite.config.js                # Vite config (port, API proxy)
├── package.json                  # Node.js dependencies
└── README.md
```

---

## Tech Stack

| Layer | Technology | Version |
|-------|-----------|---------|
| Frontend | React | 19.x |
| Routing | React Router DOM | 7.x |
| Build Tool | Vite | 5.x |
| Backend | Flask | 3.x |
| CORS | Flask-CORS | 4.x |
| Language | Python | 3.8+ |
| Language | JavaScript (ES Modules) | — |

---

## Available Scripts

| Command | Description |
|---------|-------------|
| `./install.sh` | Full setup + run (web mode) |
| `./install.sh --terminal` | Setup + run terminal mode |
| `./install.sh --help` | Show install script usage |
| `npm run dev` | Start Vite dev server |
| `npm run build` | Production build to `dist/` |
| `npm run preview` | Preview production build |
| `npm run lint` | Run ESLint |
| `python3 backend/app.py` | Start Flask API server |
| `python3 backend/terminal_ui.py` | Run terminal visualizer |

---

## Prerequisites

| Dependency | Version | Check |
|------------|---------|-------|
| Node.js | v18+ | `node --version` |
| npm | v9+ | `npm --version` |
| Python | 3.8+ | `python3 --version` |
| pip | Any | `pip3 --version` |

### Install Dependencies

**macOS:**
```bash
brew install node python3
```

**Linux (Ubuntu/Debian):**
```bash
curl -fsSL https://deb.nodesource.com/setup_lts.x | sudo -E bash -
sudo apt-get install -y nodejs python3 python3-pip python3-venv
```

---

## Troubleshooting

### Python 3 not found
```bash
brew install python3          # macOS
sudo apt install python3      # Linux
```

### Flask / dependencies not found
```bash
source backend/venv/bin/activate
pip install -r backend/requirements.txt
```

### Port 3000 in use (frontend)
```bash
npm run dev -- --port 3001
```

### Port 5001 in use (API)
```bash
lsof -ti:5001 | xargs kill
python3 backend/app.py
```

### CORS errors in browser
Make sure the Flask backend is running on port 5001. The Vite dev server proxies `/api` requests automatically.

---

## License

MIT License — free to use for educational purposes.

---

## Acknowledgments

- Built for Operating Systems coursework
- Backend: [Python](https://python.org/) + [Flask](https://flask.palletsprojects.com/)
- Frontend: [React](https://react.dev/) + [Vite](https://vite.dev/)
