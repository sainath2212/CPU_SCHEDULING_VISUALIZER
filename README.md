# CPU Scheduling Visualizer

A real-time, interactive CPU scheduling simulator built with **React + Vite** (frontend) and a **Python Flask** backend. Visualize how different scheduling algorithms work step-by-step with a live Gantt chart, process table, and performance metrics.

**Also supports Terminal Mode** — run the simulation directly in your terminal with no browser required.

![Backend](https://img.shields.io/badge/Backend-Python%20Flask-blue) ![Frontend](https://img.shields.io/badge/Frontend-React%20%2B%20Vite-61dafb) ![License](https://img.shields.io/badge/License-MIT-green)

---

## 🚀 Quick Start

### Option 1: Web Mode (Browser)

```bash
./install.sh
```

The script will:
1. Check / install **Homebrew** (macOS only)
2. Check / install **Node.js**
3. Check / install **Python 3**
4. Install Node.js dependencies (`npm install`)
5. Create a Python virtual environment and install Flask
6. Start the Flask API server and the Vite dev server

Once running, open: **http://localhost:5173/**

---

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

**Terminal mode features:**
- 🎨 Colored ASCII Gantt chart with ANSI codes
- 📊 Real-time process table
- ⚡ Step-by-step or auto-run simulation
- 📈 Performance metrics

**CLI options:**
```bash
python3 backend/terminal_ui.py --help
python3 backend/terminal_ui.py -a 4 -q 2 -s -r   # Round Robin, quantum=2, sample data, auto-run
```

---

### 🌐 Option 3: Hosted Demo

👉 **Live Demo:** https://cpu-scheduling-visualizer-zeta.vercel.app/

> ⚠️ Terminal Mode is only available in the local build.

---

## 📋 Prerequisites

| Dependency | Version | Check |
|------------|---------|-------|
| Node.js | v18+ | `node --version` |
| npm | v9+ | `npm --version` |
| Python | 3.8+ | `python3 --version` |
| pip | Any | `pip3 --version` |

### Install manually

#### macOS
```bash
brew install node python3
```

#### Linux (Ubuntu/Debian)
```bash
curl -fsSL https://deb.nodesource.com/setup_lts.x | sudo -E bash -
sudo apt-get install -y nodejs python3 python3-pip python3-venv
```

---

## 🛠️ Manual Build & Run

```bash
# 1. Install Node dependencies
npm install

# 2. Set up Python venv and install Flask
python3 -m venv backend/venv
source backend/venv/bin/activate        # Windows: backend\venv\Scripts\activate
pip install -r backend/requirements.txt

# 3. Start Flask API server (background)
python3 backend/app.py &

# 4. Start Vite dev server
npm run dev
```

Open **http://localhost:5173/**

---

## 📁 Project Structure

```
cpu-scheduling-visualizer/
├── backend/
│   ├── algorithms/             # One file per scheduling algorithm
│   │   ├── __init__.py
│   │   ├── fcfs.py
│   │   ├── sjf.py
│   │   ├── srtf.py
│   │   ├── priority.py
│   │   ├── round_robin.py
│   │   ├── ljf.py
│   │   ├── lrtf.py
│   │   ├── mlfq.py
│   │   └── utils.py
│   ├── app.py                  # Flask REST API server
│   ├── scheduler.py            # Tick-based scheduling engine
│   ├── terminal_ui.py          # Terminal mode visualizer
│   └── requirements.txt        # Python dependencies
├── src/
│   ├── components/
│   │   ├── AlgorithmSelector.jsx
│   │   ├── ControlPanel.jsx
│   │   ├── GanttChart.jsx
│   │   ├── MetricsDashboard.jsx
│   │   ├── ProcessForm.jsx
│   │   ├── ProcessTable.jsx
│   │   └── ReadyQueue.jsx
│   ├── hooks/
│   │   └── useScheduler.js     # API calls to Python backend
│   ├── pages/
│   │   ├── LandingPage.jsx
│   │   └── SimulatorPage.jsx
│   ├── App.jsx
│   ├── main.jsx
│   └── index.css
├── install.sh                  # One-command setup
├── package.json
└── README.md
```

---

## 🧠 Supported Scheduling Algorithms

| Algorithm | Type | Description |
|-----------|------|-------------|
| **FCFS** | Non-preemptive | First Come, First Served |
| **SJF** | Non-preemptive | Shortest Job First |
| **SRTF** | Preemptive | Shortest Remaining Time First |
| **Priority** | Non-preemptive | Highest priority (lowest number) runs first |
| **Round Robin** | Preemptive | Time-sliced with configurable quantum |
| **LJF** | Non-preemptive | Longest Job First |
| **LRTF** | Preemptive | Longest Remaining Time First |
| **MLFQ** | Preemptive | Multi-Level Feedback Queue (3 queues: RR q=4, RR q=8, FCFS) |

---

## 📊 Features

- **Real-time Visualization** — processes animate through NEW → READY → RUNNING → TERMINATED
- **Gantt Chart** — live CPU execution timeline
- **Dynamic Process Addition** — add processes while the simulation is running or after it completes
- **Performance Metrics** — Avg Wait Time, Turnaround, Response Time, CPU Utilization, Throughput
- **MLFQ** — 3-level feedback queue with automatic demotion and higher-priority preemption
- **Terminal Mode** — run simulations without a browser

---

## 🔧 Available Scripts

| Command | Description |
|---------|-------------|
| `./install.sh` | Full setup + run (web mode) |
| `./install.sh --terminal` | Setup + run terminal mode |
| `npm run dev` | Start Vite dev server |
| `npm run build` | Production build |
| `python3 backend/app.py` | Start Flask API server |
| `python3 backend/terminal_ui.py` | Run terminal visualizer |

---

## 🐛 Troubleshooting

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

### Port 5173 in use (frontend)
```bash
npm run dev -- --port 5174
```

### Port 5001 in use (API)
```bash
lsof -ti:5001 | xargs kill
python3 backend/app.py
```

---

## 📄 License

MIT License — free to use for educational purposes.

---

## Acknowledgments

- Built for Operating Systems coursework
- Backend: [Python](https://python.org/) + [Flask](https://flask.palletsprojects.com/)
- Frontend: [React](https://react.dev/) + [Vite](https://vite.dev/)
