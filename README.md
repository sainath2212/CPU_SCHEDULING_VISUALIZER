# CPU Scheduling Visualizer

A real-time, interactive CPU scheduling simulator built with **React**, **Vite**, and **WebAssembly (C)**. Visualize how different scheduling algorithms work, including FCFS, SJF, SRTF, Priority, Round Robin, LJF, and LRTF.

**Now with Terminal Mode!** Run the simulation directly in your terminal with colored ASCII visualization.

![CPU Scheduler](https://img.shields.io/badge/Built_with-WebAssembly-blueviolet) ![React](https://img.shields.io/badge/Frontend-React-blue) ![Vite](https://img.shields.io/badge/Bundler-Vite-yellow) ![Terminal](https://img.shields.io/badge/Terminal-C-green)

---

## 🚀 Quick Start

### Option 1: Web Mode (Browser)

```bash
./install.sh
```

This script will:
1. ✅ Check for and install **Homebrew** (macOS only)
2. ✅ Check for and install **Node.js**
3. ✅ Check for and install **Emscripten** (for WebAssembly compilation)
4. ✅ Install all Node.js dependencies (`npm install`)
5. ✅ Build the WebAssembly module (`make`)
6. ✅ Start the development server (`npm run dev`)

Once complete, open your browser to **http://localhost:3000/**

### Option 2: Terminal Mode (No Web Dependencies!)

```bash
./install.sh --terminal
```

Or build and run manually:

```bash
make terminal
./bin/scheduler_terminal
```

**Terminal mode features:**
- 🎨 Colored ASCII visualization with ANSI codes
- 📊 Real-time process table and Gantt chart
- ⚡ Step-by-step or auto-run simulation
- 📈 Performance metrics display
- 🎮 Interactive menu-driven interface

**Command-line options:**
```bash
./bin/scheduler_terminal --help          # Show help
./bin/scheduler_terminal -a 4 -q 2 -s -r # Round Robin, quantum=2, sample data, auto-run
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

> ⚠️ **Note:** Terminal Mode and low-level debugging features are only available in the local build.  
> For full functionality (WebAssembly build control + terminal UI), use **Option 1 (Web Mode)** or **Option 2 (Terminal Mode)**.

---

## 📋 Prerequisites

If you prefer manual installation, ensure you have:

| Dependency | Version | Check Command |
|------------|---------|---------------|
| Node.js | v18+ | `node --version` |
| npm | v9+ | `npm --version` |
| Emscripten | v3+ | `emcc --version` |
| Make | Any | `make --version` |

### Installing Dependencies Manually

#### macOS (Homebrew)
```bash
brew install node emscripten
```

#### Linux (Ubuntu/Debian)
```bash
# Node.js
curl -fsSL https://deb.nodesource.com/setup_lts.x | sudo -E bash -
sudo apt-get install -y nodejs

# Emscripten
git clone https://github.com/emscripten-core/emsdk.git
cd emsdk
./emsdk install latest
./emsdk activate latest
source ./emsdk_env.sh
```

---

## 🛠️ Manual Build & Run

If you already have dependencies installed:

```bash
# 1. Install Node dependencies
npm install

# 2. Build WebAssembly module
make

# 3. Start development server
npm run dev
```

---

## 📁 Project Structure

```
os_project/
├── src/
│   ├── c/                    # C source files (compiled to WebAssembly)
│   │   ├── process.c         # Process data structures
│   │   ├── process.h
│   │   ├── scheduler.c       # Core scheduling algorithms
│   │   ├── scheduler.h
│   │   ├── wasm_bindings.c   # JavaScript/Wasm bridge
│   │   ├── terminal_ui.c     # Terminal display functions
│   │   ├── terminal_ui.h
│   │   └── main_terminal.c   # Terminal entry point
│   ├── components/           # React components
│   ├── App.jsx               # Main React application
│   └── App.css               # Styles
├── public/
│   ├── scheduler.js          # Generated Wasm glue code
│   └── scheduler.wasm        # Compiled WebAssembly binary
├── bin/
│   └── scheduler_terminal    # Terminal executable (after build)
├── Makefile                  # Build configuration for Wasm + Terminal
├── install.sh                # One-command setup script
├── package.json              # Node.js dependencies
└── README.md                 # This file
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

---

## 🔧 Available Scripts

| Command | Description |
|---------|-------------|
| `./install.sh` | Full installation and run (web mode) |
| `./install.sh --terminal` | Build and run terminal mode |
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm run preview` | Preview production build |
| `make` | Compile C to WebAssembly |
| `make terminal` | Build terminal executable |
| `make clean` | Remove compiled Wasm files |
| `make clean-all` | Remove all build artifacts |
| `make debug` | Build Wasm with debug symbols |

---

## 🐛 Troubleshooting

### `emcc: command not found`
Emscripten is not installed or not in your PATH. Run:
```bash
brew install emscripten  # macOS
# OR
source /path/to/emsdk/emsdk_env.sh  # Linux
```

### WebAssembly module fails to load
Ensure you've run `make` to compile the C code:
```bash
make clean && make
```

### Port 3000 already in use
Kill the existing process or use a different port:
```bash
npm run dev -- --port 3001
```

---

## 📄 License

MIT License - feel free to use this for educational purposes!

---

## 🙏 Acknowledgments

- Built for Operating Systems coursework
- WebAssembly powered by [Emscripten](https://emscripten.org/)
- Frontend powered by [React](https://react.dev/) + [Vite](https://vite.dev/)
