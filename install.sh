#!/bin/bash

# ============================================================
#  CPU Scheduling Visualizer - Installation & Run Script
#  Supports both Web (WASM) and Terminal modes
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
    echo "  --terminal, -t    Build and run terminal version (no web dependencies)"
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
#  Terminal Mode Build
# ============================================================
if [[ $TERMINAL_MODE -eq 1 ]]; then
    echo -e "\n${CYAN}╔════════════════════════════════════════════════════════╗${NC}"
    echo -e "${CYAN}║     CPU Scheduling Visualizer - Terminal Mode          ║${NC}"
    echo -e "${CYAN}╚════════════════════════════════════════════════════════╝${NC}\n"

    print_step "Checking for C compiler..."
    if ! command -v cc &> /dev/null; then
        print_error "C compiler (cc) not found!"
        if [[ "$OSTYPE" == "darwin"* ]]; then
            print_warning "Install Xcode Command Line Tools: xcode-select --install"
        elif [[ "$OSTYPE" == "linux-gnu"* ]]; then
            print_warning "Install build-essential: sudo apt-get install build-essential"
        fi
        exit 1
    fi
    print_success "C compiler found."

    print_step "Building terminal version..."
    make terminal
    print_success "Terminal build complete!"

    print_step "Starting terminal scheduler..."
    echo -e "\n${GREEN}============================================================${NC}"
    echo -e "${GREEN}  Launching CPU Scheduling Visualizer (Terminal Mode)${NC}"
    echo -e "${GREEN}============================================================${NC}\n"
    
    ./bin/scheduler_terminal
    exit 0
fi

# ============================================================
#  Web Mode Build (default)
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
#  Step 3: Check for Emscripten (emcc)
# ============================================================
print_step "Checking for Emscripten (emcc)..."

if ! command -v emcc &> /dev/null; then
    print_warning "Emscripten not found. Installing Emscripten..."
    if [[ "$OSTYPE" == "darwin"* ]]; then
        brew install emscripten
    elif [[ "$OSTYPE" == "linux-gnu"* ]]; then
        print_warning "For Linux, please install Emscripten manually:"
        print_warning "  git clone https://github.com/emscripten-core/emsdk.git"
        print_warning "  cd emsdk && ./emsdk install latest && ./emsdk activate latest"
        print_warning "  source ./emsdk_env.sh"
        exit 1
    fi
    print_success "Emscripten installed."
else
    print_success "Emscripten is already installed."
fi

# ============================================================
#  Step 4: Install Node dependencies
# ============================================================
print_step "Installing Node.js dependencies..."

npm install
print_success "Node.js dependencies installed."

# ============================================================
#  Step 5: Build WebAssembly module
# ============================================================
print_step "Building WebAssembly module..."

make clean 2>/dev/null || true
make
print_success "WebAssembly module built successfully."

# ============================================================
#  Step 6: Start the development server
# ============================================================
print_step "Starting development server..."

echo -e "\n${GREEN}============================================================${NC}"
echo -e "${GREEN}  CPU Scheduling Visualizer is starting!${NC}"
echo -e "${GREEN}  Open your browser to: http://localhost:3000/${NC}"
echo -e "${GREEN}============================================================${NC}\n"

npm run dev
