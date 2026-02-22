# CPU Scheduling Visualizer

A real-time, interactive CPU scheduling simulator built with **React**, **Vite**, and a **Python** backend. Visualize how different scheduling algorithms work, including FCFS, SJF, SRTF, Priority, Round Robin, LJF, and LRTF.

**Now with Terminal Mode!** Run the simulation directly in your terminal with colored ASCII visualization.

![CPU Scheduler](https://img.shields.io/badge/Backend-Python-blue) ![React](https://img.shields.io/badge/Frontend-React-blue) ![Vite](https://img.shields.io/badge/Bundler-Vite-yellow) ![Terminal](https://img.shields.io/badge/Terminal-Python-green)

---

## 🚀 Quick Start

### Option 1: Web Mode (Browser)

```bash
./install.sh
```

This script will:
1. ✅ Check for and install **Homebrew** (macOS only)
2. ✅ Check for and install **Node.js**
3. ✅ Check for and install **Python 3**
4. ✅ Install all Node.js dependencies (`npm install`)
5. ✅ Install Python dependencies (`pip install`)
6. ✅ Start the Python API server and Vite dev server

Once complete, open your browser to **http://localhost:3000/**

### Option 2: Terminal Mode (No Web Dependencies!)

```bash
./install.sh --terminal
```

Or run manually:

```bash
python3 -m venv backend/venv
source backend/venv/bin/activate
pip install -r backend/requirements.txt
python3 backend/terminal_ui.py
```

**Terminal mode features:**
- 🎨 Colored ASCII visualization with ANSI codes
- 📊 Real-time process table and Gantt chart
- ⚡ Step-by-step or auto-run simulation
- 📈 Performance metrics display
- 🎮 Interactive menu-driven interface

**Command-line options:**
```bash
python3 backend/terminal_ui.py --help              # Show help
python3 backend/terminal_ui.py -a 4 -q 2 -s -r    # Round Robin, quantum=2, sample data, auto-run
```

### 🌐 Option 3: Hosted Demo (No Installation Required)

Try the CPU Scheduling Visualizer instantly using the hosted web version:

👉 **Live Demo:** https://cpu-scheduling-visualizer-zeta.vercel.app/

**What you can do in the hosted version:**
- ▶️ Run all supported scheduling algorithms (FCFS, SJF, SRTF, Priority, Round Robin, LJF, LRTF)
- 🧩 Add and modify processes (Arrival Time, Burst Time, Priority)
- 📊 View real-time Gantt charts and process state transitions
- 📈 Analyze performance metrics:
  - Average Waiting Time  
  - Average Turnaround Time  
  - Average Response Time  
  - CPU Utilization  
  - Throughput
- 🎨 Interactive, responsive UI optimized for desktop and mobile

> ⚠️ **Note:** Terminal Mode is only available in the local build.

---

## 📋 Prerequisites

If you prefer manual installation, ensure you have:

| Dependency | Version | Check Command |
|------------|---------|---------------|
| Node.js | v18+ | `node --version` |
| npm | v9+ | `npm --version` |
| Python | 3.8+ | `python3 --version` |
| pip | Any | `pip3 --version` |

### Installing Dependencies Manually

#### macOS (Homebrew)
```bash
brew install node python3
```

#### Linux (Ubuntu/Debian)
```bash
# Node.js
curl -fsSL https://deb.nodesource.com/setup_lts.x | sudo -E bash -
sudo apt-get install -y nodejs

# Python 3
sudo apt-get install python3 python3-pip python3-venv
```

---

## 🛠️ Manual Build & Run

If you already have dependencies installed:

```bash
# 1. Install Node dependencies
npm install

# 2. Install Python dependencies
python3 -m venv backend/venv
source backend/venv/bin/activate
pip install -r backend/requirements.txt

# 3. Start Python API server (in background)
python3 backend/app.py &

# 4. Start development server
npm run dev
```

---

## 📁 Project Structure

```
cpu-scheduling-visualizer/
├── src/
│   ├── components/                 # React components
│   │   ├── AlgorithmSelector.jsx   # Algorithm picker
│   │   ├── ControlPanel.jsx        # Play/pause/step controls
│   │   ├── GanttChart.jsx          # Gantt chart visualization
│   │   ├── MetricsDashboard.jsx    # Performance metrics
│   │   ├── ProcessForm.jsx         # Add process form
│   │   ├── ProcessTable.jsx        # Process state table
│   │   └── ReadyQueue.jsx          # Ready queue display
│   ├── hooks/
│   │   └── useScheduler.js         # Scheduling engine (JavaScript)
│   ├── pages/
│   │   ├── LandingPage.jsx         # Home page
│   │   └── SimulatorPage.jsx       # Main simulator
│   ├── App.jsx                     # Main React application
│   ├── main.jsx                    # Entry point
│   └── index.css                   # Styles
├── backend/
│   ├── app.py                      # Flask REST API server
│   ├── scheduler.py                # Core scheduling engine (Python)
│   ├── process.py                  # Process Control Block
│   ├── algorithms.py               # All scheduling algorithms
│   ├── terminal_ui.py              # Terminal mode visualizer
│   └── requirements.txt            # Python dependencies
├── public/
│   └── vite.svg                    # Vite logo
├── install.sh                      # One-command setup script
├── package.json                    # Node.js dependencies
└── README.md                       # This file
```

---

## 🧠 Supported Scheduling Algorithms

| Algorithm | Type | Description |
|-----------|------|-------------|
| **FCFS** | Non-preemptive | First Come, First Served - processes run in arrival order |
| **SJF** | Non-preemptive | Shortest Job First - shortest burst time runs first |
| **SRTF** | Preemptive | Shortest Remaining Time First - preempts for shorter jobs |
| **Priority** | Non-preemptive | Highest priority (lowest number) runs first |
| **Round Robin** | Preemptive | Time-sliced execution with configurable quantum |
| **LJF** | Non-preemptive | Longest Job First - longest burst time runs first |
| **LRTF** | Preemptive | Longest Remaining Time First - preempts for longer jobs |

---

## 📊 Features

- **Real-time Visualization**: Watch processes move through states (NEW → READY → RUNNING → TERMINATED)
- **Gantt Chart**: Visual timeline of CPU execution
- **Performance Metrics**: 
  - Average Wait Time
  - Average Turnaround Time
  - Average Response Time
  - CPU Utilization
  - Throughput
- **Customizable Processes**: Add processes with custom arrival time, burst time, and priority
- **Aging Support**: Prevent starvation with priority boosting
- **Python API**: REST API for programmatic access to the scheduler

---

## 🔧 Available Scripts

| Command | Description |
|---------|-------------|
| `./install.sh` | Full installation and run (web mode) |
| `./install.sh --terminal` | Build and run terminal mode |
| `npm run dev` | Start Vite development server |
| `npm run build` | Build for production |
| `npm run preview` | Preview production build |
| `python3 backend/app.py` | Start Python API server |
| `python3 backend/terminal_ui.py` | Run terminal visualizer |

---

## 🐛 Troubleshooting

### Python 3 not found
Install Python 3:
```bash
brew install python3          # macOS
sudo apt install python3      # Linux
```

### Flask module not found
Make sure you've installed Python dependencies:
```bash
source backend/venv/bin/activate
pip install -r backend/requirements.txt
```

### Port 3000 already in use
Kill the existing process or use a different port:
```bash
npm run dev -- --port 3001
```

### Port 5000 already in use (API)
Kill the existing process:
```bash
lsof -ti:5001 | xargs kill
python3 backend/app.py
```

---

## 📄 License

MIT License - feel free to use this for educational purposes!

---

## 🙏 Acknowledgments

- Built for Operating Systems coursework
- Backend powered by [Python](https://python.org/) + [Flask](https://flask.palletsprojects.com/)
- Frontend powered by [React](https://react.dev/) + [Vite](https://vite.dev/)
