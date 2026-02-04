# Makefile for CPU Scheduling Visualizer
# Compiles C code to WebAssembly using Emscripten

CC = emcc
CFLAGS = -O3 -s WASM=1 -s MODULARIZE=1 -s EXPORT_NAME='SchedulerModule'
CFLAGS += -s EXPORTED_RUNTIME_METHODS='["ccall","cwrap","UTF8ToString"]'
CFLAGS += -s ALLOW_MEMORY_GROWTH=1
CFLAGS += -s EXPORTED_FUNCTIONS='["_malloc","_free"]'

SRC_DIR = src/c
OUT_DIR = public

SOURCES = $(SRC_DIR)/process.c \
          $(SRC_DIR)/scheduler.c \
          $(SRC_DIR)/wasm_bindings.c

OUTPUT = $(OUT_DIR)/scheduler.js

.PHONY: all clean

all: $(OUTPUT)

$(OUTPUT): $(SOURCES)
	@mkdir -p $(OUT_DIR)
	$(CC) $(SOURCES) $(CFLAGS) -o $(OUTPUT)
	@echo "✅ WebAssembly build complete: $(OUTPUT)"

clean:
	rm -f $(OUT_DIR)/scheduler.js $(OUT_DIR)/scheduler.wasm
	@echo "🧹 Cleaned build artifacts"

# Development build with debug info
debug:
	$(CC) $(SOURCES) -O0 -g -s WASM=1 -s MODULARIZE=1 -s EXPORT_NAME='SchedulerModule' \
		-s EXPORTED_RUNTIME_METHODS='["ccall","cwrap","UTF8ToString"]' \
		-s ALLOW_MEMORY_GROWTH=1 \
		-s EXPORTED_FUNCTIONS='["_malloc","_free"]' \
		-s ASSERTIONS=2 \
		-o $(OUTPUT)
	@echo "🔧 Debug build complete"
