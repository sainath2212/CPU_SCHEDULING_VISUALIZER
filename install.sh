#!/bin/bash

# ============================================================
#  CPU Scheduling Visualizer - Installation Script
# ============================================================

set -e

# Logging utilities
print_step() {
    echo "[INFO] $1"
}

print_success() {
    echo "[SUCCESS] $1"
}

print_warning() {
    echo "[WARNING] $1"
}

print_error() {
    echo "[ERROR] $1"
}

print_usage() {
    echo "Usage: ./install.sh [OPTIONS]"
    echo ""
    echo "Options:"
    echo "  --terminal, -t    Build and run terminal version"
    echo "  --web, -w         Build and run web version (default)"
    echo "  --help, -h        Show this help message"
    echo ""
}

TERMINAL_MODE=0

# Argument parsing
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

check_python() {
    print_step "Verifying Python 3 installation..."
    if command -v python3 &> /dev/null; then
        print_success "Python 3 detected ($(python3 --version))."
    else
        print_error "Python 3 is required but not installed."
        exit 1
    fi
}

install_python_deps() {
    print_step "Configuring Python virtual environment and dependencies..."
    if [ ! -d "backend/venv" ]; then
        python3 -m venv backend/venv
        print_success "Virtual environment established."
    fi

    source backend/venv/bin/activate
    pip install -r backend/requirements.txt --quiet
    print_success "Python dependencies installed successfully."
}

if [[ $TERMINAL_MODE -eq 1 ]]; then
    print_step "Initializing Terminal Mode..."
    check_python
    install_python_deps

    print_step "Starting terminal scheduler interface..."
    source backend/venv/bin/activate
    python3 backend/terminal_ui.py
    exit 0
fi

print_step "Initializing Web Mode setup sequence..."

if [[ "$OSTYPE" == "darwin"* ]]; then
    print_step "Verifying macOS Homebrew installation..."
    if ! command -v brew &> /dev/null; then
        print_warning "Homebrew is missing. Please install Homebrew manually or verify system paths."
    else
        print_success "Homebrew is available."
    fi
fi

print_step "Verifying Node.js installation..."
if ! command -v node &> /dev/null; then
    print_error "Node.js is required but not installed."
    exit 1
else
    print_success "Node.js detected ($(node --version))."
fi

check_python

print_step "Installing Node.js dependencies..."
if [ -d "node_modules" ]; then
    print_step "Removing existing node_modules to ensure a clean installation..."
    rm -rf node_modules package-lock.json
fi

npm install --quiet
print_success "Node.js dependencies installed successfully."

install_python_deps

print_step "Starting application servers..."
print_step "Frontend available at: http://localhost:5173/"
print_step "Backend API available at: http://localhost:5001/"

source backend/venv/bin/activate
python3 backend/app.py &
FLASK_PID=$!

trap "kill $FLASK_PID 2>/dev/null" EXIT

npm run dev
