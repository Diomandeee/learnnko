# Project Structure

This document describes the organization of the N'Ko Learning Hub project.

## Overview

The project consists of two main components:

| Component | Language | Purpose |
|-----------|----------|---------|
| **Frontend** (`/`) | TypeScript/Next.js | Web application for N'Ko learning |
| **ML Training** (`/nko/`) | Python | Translation and ASR model training |

## Frontend Structure (`/`)

```
learnnko/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── api/               # API routes
│   │   ├── nko/               # N'Ko learning pages
│   │   │   ├── lessons/       # Structured lessons
│   │   │   ├── conversation/  # AI conversation practice
│   │   │   ├── keyboard/      # N'Ko virtual keyboard
│   │   │   ├── practice/      # Practice exercises
│   │   │   ├── transcribe/    # Audio transcription
│   │   │   └── translator/    # Translation interface
│   │   ├── dashboard/         # User dashboard
│   │   └── auth/              # Authentication
│   │
│   ├── components/            # Reusable React components
│   ├── lib/                   # Utility libraries
│   ├── hooks/                 # Custom React hooks
│   ├── store/                 # Zustand state management
│   └── types/                 # TypeScript type definitions
│
├── prisma/                    # Database schema
├── public/                    # Static assets
├── scripts/                   # Build/utility scripts
├── docs/                      # Frontend documentation
│   └── archive/              # Archived planning docs
│
├── package.json               # Node.js dependencies
├── next.config.ts             # Next.js configuration
└── README.md                  # Project overview
```

## ML Training Structure (`/nko/`)

The `nko/` folder is a **separate git repository** containing the ML training system.

```
nko/
├── src/                       # Core Python modules
│   ├── models/               # Model implementations
│   │   ├── en_bam_translator.py   # English-Bambara translator
│   │   ├── asr.py            # Speech recognition
│   │   ├── tts.py            # Text-to-speech
│   │   └── tokenizers.py     # Tokenization
│   │
│   ├── data/                 # Data processing
│   │   ├── dataset_loader.py
│   │   ├── preprocessing.py
│   │   └── augmentation.py
│   │
│   ├── evaluation/           # Model evaluation
│   ├── asr_integration/      # ASR integration
│   ├── djoko_processor/      # Djoko episode processor
│   └── utils/                # Utilities
│
├── scripts/                   # Python scripts
│   ├── training/             # Training scripts
│   ├── data/                 # Data processing scripts
│   └── setup/                # Environment setup
│
├── scripts_shell/             # Shell scripts
│   ├── training/             # Training automation
│   └── setup/                # GCP/cloud setup
│
├── docs/                      # ML documentation
│   ├── training/             # Training guides
│   ├── cloud/                # Cloud deployment
│   ├── setup/                # Setup guides
│   ├── technical/            # Technical docs
│   └── archive/              # Archived docs
│
├── demos/                     # Demo applications
├── notebooks/                 # Jupyter notebooks
├── tests/                     # Test files
├── data/                      # Training data
├── outputs/                   # Model outputs
│
├── requirements.txt           # Python dependencies
├── setup.py                   # Package setup
└── README.md                  # ML system overview
```

## Repository Structure

The project uses **two separate git repositories**:

1. **Root repository** (`learnnko/`) - Frontend application
2. **Nested repository** (`nko/`) - ML training system

The `nko/` folder is listed in `.gitignore` to prevent the root repo from tracking it.

### Working with Both Repos

```bash
# Frontend changes
cd /path/to/learnnko
git add .
git commit -m "Frontend changes"
git push

# ML changes
cd /path/to/learnnko/nko
git add .
git commit -m "ML changes"
git push
```

## Key Files

| File | Purpose |
|------|---------|
| `package.json` | Frontend dependencies |
| `nko/requirements.txt` | ML training dependencies |
| `.env.example` | Environment variable template |
| `prisma/schema.prisma` | Database schema |
| `nko/handler.py` | RunPod serverless handler |
