# Architecture Documentation Build System

This directory contains an interconnected documentation system where **Mermaid diagrams**, **Markdown docs**, **HTML**, and **SVG** all stay in sync.

## Source of Truth

```
┌─────────────────────────────────────────────────────────────────┐
│                    Documentation Flow                            │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│   diagrams/*.mmd ─────────────────────────────▶ svg/*.svg       │
│        │                                            │           │
│        │                                            │           │
│        ▼                                            ▼           │
│   *.md ─────────────────────────────────────▶ html/*.html       │
│        │                                            │           │
│        │     (embeds mermaid in <div>)              │           │
│        └────────────────────────────────────────────┘           │
│                                                                  │
│   Edit .mmd or .md → Run build.py → HTML & SVG update           │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

| Source | Generated | Relationship |
|--------|-----------|--------------|
| `*.md` | `html/*.html` | Markdown converted to styled HTML |
| `diagrams/*.mmd` | `svg/*.svg` | Mermaid converted to SVG |
| `diagrams/*.mmd` | Embedded in HTML | Mermaid rendered in browser via JS |

## Quick Start

```bash
# Build everything
make build

# Or use Python directly
python3 build.py --force

# Watch for changes (auto-rebuild)
make watch
```

## Full SVG Generation

For high-quality standalone SVGs, install mermaid-cli:

```bash
# Install
npm install -g @mermaid-js/mermaid-cli

# Or via make
make install-deps

# Then build SVGs
make svg
```

## File Structure

```
docs/architecture/
├── *.md                    # Source Markdown docs
├── diagrams/
│   ├── data-flow.mmd       # Source Mermaid diagrams
│   ├── database-erd.mmd
│   └── pipeline.mmd
├── html/                   # Generated HTML
│   ├── styles.css
│   ├── README.html
│   ├── 01-data-flow.html
│   └── ...
├── svg/                    # Generated SVG
│   ├── data-flow.svg
│   ├── database-erd.svg
│   └── pipeline.svg
├── build.py                # Build script
├── Makefile                # Make targets
└── .build_cache.json       # Cache for incremental builds
```

## How Syncing Works

1. **Cache-based incremental builds**: `build.py` tracks file hashes in `.build_cache.json`
2. **Change detection**: Only modified files are rebuilt
3. **Watch mode**: `--watch` flag polls for changes every 2 seconds
4. **Force rebuild**: `--force` flag rebuilds everything regardless of cache

## Editing Workflow

### To add a new diagram:

1. Create `diagrams/my-diagram.mmd`
2. Run `make build`
3. SVG appears in `svg/my-diagram.svg`
4. Reference in Markdown with Mermaid block (auto-renders in HTML)

### To add a new document:

1. Create `08-new-topic.md`
2. Run `make build`
3. HTML appears in `html/08-new-topic.html`
4. Navigation auto-updates in all HTML files

### To update existing:

1. Edit the source file (`.md` or `.mmd`)
2. Run `make build` (or use `make watch`)
3. All outputs regenerate

## HTML Features

The generated HTML includes:

- 🌙 Dark theme (matches Comp-Core aesthetic)
- 📱 Responsive sidebar navigation
- 🎨 Mermaid diagrams render in-browser
- 🔗 Auto-generated navigation links
- ⏰ Build timestamp in footer

## Commands Reference

| Command | Description |
|---------|-------------|
| `python3 build.py` | Build all (incremental) |
| `python3 build.py --force` | Force rebuild all |
| `python3 build.py --watch` | Watch and auto-rebuild |
| `python3 build.py --clean` | Remove generated files |
| `make build` | Same as `python3 build.py --force` |
| `make html` | Build only HTML |
| `make svg` | Build only SVG |
| `make watch` | Watch mode |
| `make clean` | Clean generated files |

