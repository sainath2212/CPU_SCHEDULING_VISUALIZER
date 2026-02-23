# CPU Scheduling Visualizer

A real-time CPU scheduling simulator built with React, Vite, and a Python Flask REST API. This tool visualizes the execution of 8 different scheduling algorithms and incorporates machine learning models to recommend optimal scheduling strategies based on workload characteristics.

![Backend](https://img.shields.io/badge/Backend-Python%20Flask%20%2B%20Scikit--Learn-blue)
![Frontend](https://img.shields.io/badge/Frontend-React%2019%20%2B%20Vite%205-61dafb)
![License](https://img.shields.io/badge/License-MIT-green)

---

## Architecture Overview

The application utilizes a decoupled architecture communicating via a RESTful API:

- **Frontend (React)**: Handles state management via Context API and renders visualizations. Includes dedicated views for simulation execution, analytical comparison, kernel-level process viewing, and AI-driven recommendations.
- **Backend (Python Flask)**: Implements the tick-based scheduling engine, execution metrics calculation, and machine learning components for predictive scheduling analysis.

---

## Features

### Web Interface Modules
- **Simulator Interface**: Real-time representation of CPU execution timelines (Gantt chart), process state transitions, and ready queue dynamics.
- **Performance Analytics**: Comprehensive metrics dashboard displaying Average Wait Time, Turnaround Time, Response Time, CPU Utilization, and Throughput.
- **Algorithm Comparison**: Side-by-side performance evaluation of multiple scheduling algorithms under identical initial conditions.
- **AI Recommender**: Machine learning-based system (Scikit-Learn) that analyzes process characteristics to predict the most efficient scheduling algorithm.
- **Kernel View & Terminal View**: Advanced diagnostic views for deeper system-level inspection and log monitoring.

### Supported Scheduling Algorithms
1. **FCFS** (First Come, First Served) - Non-preemptive
2. **SJF** (Shortest Job First) - Non-preemptive
3. **SRTF** (Shortest Remaining Time First) - Preemptive
4. **Priority** - Non-preemptive
5. **Round Robin** - Preemptive (configurable quantum)
6. **LJF** (Longest Job First) - Non-preemptive
7. **LRTF** (Longest Remaining Time First) - Preemptive
8. **MLFQ** (Multi-Level Feedback Queue) - Preemptive

### Machine Learning Engine (`api/ai/`)
The system includes an AI module capable of generating datasets, performing feature engineering, and training predictive models (`model.joblib`). This enables the platform to act as an intelligent scheduling advisor based on historical process parameters. A Jupyter notebook (`notebooks/ai_scheduler_analysis.ipynb`) is provided for detailed model analysis and training visualization.

---

## Installation and Setup

### Automated Setup

Execute the provided shell script to configure dependencies and initiate the application:

```bash
chmod +x install.sh
./install.sh
```

The script performs the following operations:
1. Validates and installs required system dependencies (Node.js, Python 3).
2. Provisions a Python virtual environment and installs api packages from `requirements.txt`.
3. Installs frontend Node dependencies via npm.
4. Initializes the Flask API (port 5001) and Vite development server (port 3000/5173).

To deploy the terminal-only api version without the React frontend:

```bash
./install.sh --terminal
```

### Manual Setup Configuration

**Frontend Initialization:**
```bash
npm install
npm run dev
```

**Backend Initialization:**
```bash
python3 -m venv api/venv
source api/venv/bin/activate
pip install -r api/requirements.txt
python3 api/index.py
```

---

## API Specification

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/init` | Initialize a new scheduler instance. |
| `POST` | `/api/reset` | Reset the current simulation parameters. |
| `POST` | `/api/set-algorithm` | Configure the scheduling algorithm (`{ "algorithm": 0-7 }`). |
| `POST` | `/api/add-process` | Register a new process (`{ "arrivalTime", "burstTime", "priority" }`). |
| `POST` | `/api/step` | Advance the simulation execution by a single discrete tick. |
| `GET`  | `/api/state` | Retrieve the current system execution state and metrics. |

---

## Prerequisites

- Node.js (v18.0 or higher)
- Python (3.8 or higher)
- pip

## License

This software is released under the MIT License.
