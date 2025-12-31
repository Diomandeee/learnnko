# Architecture Documentation Build System
#
# This Makefile keeps all documentation formats in sync:
# - Markdown (.md) → HTML
# - Mermaid (.mmd) → SVG
#
# Source of Truth:
#   diagrams/*.mmd  → svg/*.svg
#   *.md            → html/*.html

.PHONY: all build clean watch install-deps html svg help

# Default target
all: build

# Build all documentation
build:
	@python3 build.py --force

# Build only HTML
html:
	@mkdir -p html
	@python3 -c "from build import build_html; build_html(force=True)"

# Build only SVG (requires mermaid-cli)
svg:
	@mkdir -p svg
	@if command -v mmdc &> /dev/null; then \
		for f in diagrams/*.mmd; do \
			mmdc -i "$$f" -o "svg/$$(basename $$f .mmd).svg" -t dark -b transparent; \
		done; \
	else \
		echo "⚠️  Install mermaid-cli: npm install -g @mermaid-js/mermaid-cli"; \
		python3 -c "from build import build_svg; build_svg(force=True)"; \
	fi

# Watch for changes and auto-rebuild
watch:
	@python3 build.py --watch

# Clean generated files
clean:
	@python3 build.py --clean

# Install dependencies for full SVG generation
install-deps:
	@echo "Installing mermaid-cli..."
	@npm install -g @mermaid-js/mermaid-cli
	@echo "✅ Done! Run 'make svg' to generate SVGs."

# Show help
help:
	@echo "Architecture Documentation Build System"
	@echo ""
	@echo "Targets:"
	@echo "  make build        - Build all (HTML + SVG)"
	@echo "  make html         - Build only HTML from Markdown"
	@echo "  make svg          - Build only SVG from Mermaid"
	@echo "  make watch        - Watch for changes and auto-rebuild"
	@echo "  make clean        - Remove generated files"
	@echo "  make install-deps - Install mermaid-cli for SVG generation"
	@echo ""
	@echo "File Structure:"
	@echo "  *.md              → html/*.html"
	@echo "  diagrams/*.mmd    → svg/*.svg"

