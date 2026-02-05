# Makefile for CPU Scheduling Visualizer
# Compiles C code to WebAssembly using Emscripten
# Also supports native terminal build

# Compilers
CC = emcc
CC_NATIVE = cc

# WASM flags
CFLAGS = -O3 -s WASM=1 -s MODULARIZE=1 -s EXPORT_NAME='SchedulerModule'
CFLAGS += -s EXPORTED_RUNTIME_METHODS='["ccall","cwrap","UTF8ToString"]'
CFLAGS += -s ALLOW_MEMORY_GROWTH=1
CFLAGS += -s EXPORTED_FUNCTIONS='["_malloc","_free"]'

# Native flags
CFLAGS_NATIVE = -O2 -Wall -std=c99

SRC_DIR = src/c
OUT_DIR = public
BIN_DIR = bin

# WASM sources
SOURCES = $(SRC_DIR)/process.c \
          $(SRC_DIR)/scheduler.c \
          $(SRC_DIR)/wasm_bindings.c

# Terminal sources
TERMINAL_SOURCES = $(SRC_DIR)/process.c \
                   $(SRC_DIR)/scheduler.c \
                   $(SRC_DIR)/terminal_ui.c \
                   $(SRC_DIR)/main_terminal.c

OUTPUT = $(OUT_DIR)/scheduler.js
TERMINAL_OUTPUT = $(BIN_DIR)/scheduler_terminal

.PHONY: all clean terminal clean-terminal

all: $(OUTPUT)

$(OUTPUT): $(SOURCES)
	@mkdir -p $(OUT_DIR)
	$(CC) $(SOURCES) $(CFLAGS) -o $(OUTPUT)
	@echo "✅ WebAssembly build complete: $(OUTPUT)"

# Native terminal build
terminal: $(TERMINAL_SOURCES)
	@mkdir -p $(BIN_DIR)
	$(CC_NATIVE) $(TERMINAL_SOURCES) $(CFLAGS_NATIVE) -o $(TERMINAL_OUTPUT)
	@echo "✅ Terminal build complete: $(TERMINAL_OUTPUT)"

clean:
	rm -f $(OUT_DIR)/scheduler.js $(OUT_DIR)/scheduler.wasm
	@echo "🧹 Cleaned WASM build artifacts"

clean-terminal:
	rm -f $(TERMINAL_OUTPUT)
	@echo "🧹 Cleaned terminal build artifacts"

clean-all: clean clean-terminal
	@echo "🧹 Cleaned all build artifacts"

# Development build with debug info
debug:
	$(CC) $(SOURCES) -O0 -g -s WASM=1 -s MODULARIZE=1 -s EXPORT_NAME='SchedulerModule' \
		-s EXPORTED_RUNTIME_METHODS='["ccall","cwrap","UTF8ToString"]' \
		-s ALLOW_MEMORY_GROWTH=1 \
		-s EXPORTED_FUNCTIONS='["_malloc","_free"]' \
		-s ASSERTIONS=2 \
		-o $(OUTPUT)
	@echo "🔧 Debug build complete"

# Debug terminal build
debug-terminal:
	@mkdir -p $(BIN_DIR)
	$(CC_NATIVE) $(TERMINAL_SOURCES) -O0 -g -Wall -std=c99 -o $(TERMINAL_OUTPUT)
	@echo "🔧 Terminal debug build complete"
