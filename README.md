# N'Ko Learning Hub

A comprehensive language learning platform for N'Ko script and Bambara language, powered by AI-assisted translation and speech recognition.

## Features

### Learning Tools
- **Interactive Lessons** - Structured curriculum for learning N'Ko script
- **Conversation Practice** - AI-powered conversational practice with memory
- **N'Ko Keyboard** - Virtual keyboard for typing in N'Ko script
- **Translation** - English ↔ Bambara translation with N'Ko script support
- **Transcription** - Audio-to-text transcription for Bambara

### Architecture

```
learnnko/
├── src/                    # Next.js frontend application
│   ├── app/
│   │   ├── nko/           # N'Ko learning routes
│   │   │   ├── lessons/   # Structured lessons
│   │   │   ├── conversation/  # Conversational practice
│   │   │   ├── keyboard/  # N'Ko virtual keyboard
│   │   │   ├── practice/  # Practice mode
│   │   │   ├── transcribe/# Audio transcription
│   │   │   └── translator/# Translation interface
│   │   └── api/           # Backend API routes
│   ├── components/        # Reusable React components
│   └── lib/               # Utility libraries
│
└── nko/                   # ML/Training system (separate Python project)
    ├── src/               # Core ML modules
    │   ├── models/        # Translation, ASR, TTS models
    │   ├── data/          # Data processing
    │   └── evaluation/    # Model evaluation
    ├── scripts/           # Training scripts
    └── docs/              # ML documentation
```

## Getting Started

### Frontend (Next.js)

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build
```

### ML Training (Python)

See [nko/README.md](nko/README.md) for ML training setup.

## Tech Stack

- **Frontend**: Next.js 15, React 18, TypeScript, Tailwind CSS
- **UI Components**: Radix UI, Lucide Icons
- **Database**: Prisma
- **AI/ML**:
  - Anthropic Claude API (conversations)
  - Custom mBART translation models
  - NVIDIA NeMo ASR integration
- **State Management**: Zustand

## Environment Variables

See [.env.example](.env.example) for required environment variables.

## License

[Your License Here]
