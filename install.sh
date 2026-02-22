#!/bin/bash

# ============================================================
#  CPU Scheduling Visualizer - Installation & Run Script
#  Supports both Web and Terminal modes
#  Backend: Python | Frontend: React + Vite
# ============================================================

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Mode flags
TERMINAL_MODE=0

print_step() {
    echo -e "\n${BLUE}[STEP]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

print_usage() {
    echo -e "\n${CYAN}CPU Scheduling Visualizer - Installation Script${NC}\n"
    echo "Usage: ./install.sh [OPTIONS]"
    echo ""
    echo "Options:"
    echo "  --terminal, -t    Build and run terminal version (Python)"
    echo "  --web, -w         Build and run web version (default)"
    echo "  --help, -h        Show this help message"
    echo ""
    echo "Examples:"
    echo "  ./install.sh              # Run web version"
    echo "  ./install.sh --terminal   # Run terminal version"
    echo ""
}

# Parse arguments
while [[ $# -gt 0 ]]; do
    case $1 in
        --terminal|-t)
            TERMINAL_MODE=1
            shift
            ;;
        --web|-w)
            TERMINAL_MODE=0
            shift
            ;;
        --help|-h)
            print_usage
            exit 0
            ;;
        *)
            print_error "Unknown option: $1"
            print_usage
            exit 1
            ;;
    esac
done

# ============================================================
#  Common: Check for Python 3
# ============================================================
check_python() {
    print_step "Checking for Python 3..."

    if command -v python3 &> /dev/null; then
        print_success "Python 3 found: $(python3 --version)"
    else
        print_error "Python 3 not found!"
        if [[ "$OSTYPE" == "darwin"* ]]; then
            print_warning "Install Python 3: brew install python3"
        elif [[ "$OSTYPE" == "linux-gnu"* ]]; then
            print_warning "Install Python 3: sudo apt-get install python3 python3-pip python3-venv"
        fi
        exit 1
    fi
}

# ============================================================
#  Common: Install Python dependencies
# ============================================================
install_python_deps() {
    print_step "Installing Python dependencies..."

    if [ ! -d "backend/venv" ]; then
        python3 -m venv backend/venv
        print_success "Virtual environment created."
    fi

    source backend/venv/bin/activate
    pip install -r backend/requirements.txt --quiet
    print_success "Python dependencies installed."
}

# ============================================================
#  Terminal Mode
# ============================================================
if [[ $TERMINAL_MODE -eq 1 ]]; then
    echo -e "\n${CYAN}╔════════════════════════════════════════════════════════╗${NC}"
    echo -e "${CYAN}║     CPU Scheduling Visualizer - Terminal Mode          ║${NC}"
    echo -e "${CYAN}╚════════════════════════════════════════════════════════╝${NC}\n"

    check_python
    install_python_deps

    print_step "Starting terminal scheduler..."
    echo -e "\n${GREEN}============================================================${NC}"
    echo -e "${GREEN}  Launching CPU Scheduling Visualizer (Terminal Mode)${NC}"
    echo -e "${GREEN}============================================================${NC}\n"

    source backend/venv/bin/activate
    python3 backend/terminal_ui.py
    exit 0
fi

# ============================================================
#  Web Mode (default)
# ============================================================
echo -e "\n${CYAN}╔════════════════════════════════════════════════════════╗${NC}"
echo -e "${CYAN}║     CPU Scheduling Visualizer - Web Mode               ║${NC}"
echo -e "${CYAN}╚════════════════════════════════════════════════════════╝${NC}\n"

# ============================================================
#  Step 1: Check for Homebrew (macOS only)
# ============================================================
print_step "Checking for Homebrew..."

if [[ "$OSTYPE" == "darwin"* ]]; then
    if ! command -v brew &> /dev/null; then
        print_warning "Homebrew not found. Installing Homebrew..."
        /bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
        print_success "Homebrew installed."
    else
        print_success "Homebrew is already installed."
    fi
fi

# ============================================================
#  Step 2: Check for Node.js
# ============================================================
print_step "Checking for Node.js..."

if ! command -v node &> /dev/null; then
    print_warning "Node.js not found. Installing Node.js..."
    if [[ "$OSTYPE" == "darwin"* ]]; then
        brew install node
    elif [[ "$OSTYPE" == "linux-gnu"* ]]; then
        curl -fsSL https://deb.nodesource.com/setup_lts.x | sudo -E bash -
        sudo apt-get install -y nodejs
    fi
    print_success "Node.js installed."
else
    print_success "Node.js is already installed: $(node --version)"
fi

# ============================================================
#  Step 3: Check for Python 3
# ============================================================
check_python

# ============================================================
#  Step 4: Install Node dependencies
# ============================================================
print_step "Installing Node.js dependencies..."

# Clean install to avoid rollup optional dependency issues
if [ -d "node_modules" ]; then
    print_warning "Cleaning existing node_modules for fresh install..."
    rm -rf node_modules package-lock.json
fi

npm install
print_success "Node.js dependencies installed."

# ============================================================
#  Step 5: Install Python dependencies
# ============================================================
install_python_deps

# ============================================================
#  Step 6: Start the development servers
# ============================================================
print_step "Starting development servers..."

echo -e "\n${GREEN}============================================================${NC}"
echo -e "${GREEN}  CPU Scheduling Visualizer is starting!${NC}"
echo -e "${GREEN}  Frontend: http://localhost:3000/${NC}"
echo -e "${GREEN}  Backend API: http://localhost:5001/${NC}"
echo -e "${GREEN}============================================================${NC}\n"

# Start Flask backend in background, then Vite frontend
source backend/venv/bin/activate
python3 backend/app.py &
FLASK_PID=$!

# Trap to kill Flask on exit
trap "kill $FLASK_PID 2>/dev/null" EXIT

npm run dev
