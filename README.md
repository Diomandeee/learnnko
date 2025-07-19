# SVG Editor with Claude AI

A powerful SVG editor application that combines traditional vector editing capabilities with AI assistance powered by Anthropic's Claude. Create, modify, and optimize SVGs using both natural language commands and advanced vector editing tools.

## Features

### AI-Powered SVG Creation
- Generate SVGs from natural language descriptions
- Request modifications in plain English
- Get AI suggestions for improvements
- Smart element selection and context-aware editing

### Advanced Vector Editing
- Complete vector editing toolset (shapes, paths, text)
- Layer management with visibility and locking controls
- Pen tool with bezier curve support
- Direct selection for point-level manipulation
- Precise transformation controls

### Hybrid Workflow
- Seamlessly switch between AI and manual editing modes
- Use natural language commands in vector editor mode
- Apply AI-generated styles to manually created shapes
- Get suggestions for complex operations

### Practical Tools
- Export to SVG and PNG formats
- Copay SVG code directly 
- History with undo/redo support
- Selection tools with grouping support

## Architecture

The application is built with:
- **Next.js** for the frontend framework
- **React** for UI components
- **TypeScript** for type safety
- **Anthropic Claude API** for AI capabilities
- **Custom Vector Engine** for advanced editing

### Component Structure
- `EditorCanvas`: Main editor container with modes
- `ChatPanel`: Interface for AI interaction
- `VectorEditor`: Advanced editing workspace
- `VectorCommandPanel`: Natural language commands in vector mode

### Vector Engine Classes
- `VectorDocument`: Manages the entire document structure
- `VectorShape`: Represents shapes with properties and methods
- `VectorPath`: Path manipulation and rendering
- `VectorPoint`: Point handling with bezier controls
- `VectorTool`: Tool abstractions for different editing operations

## Getting Started

1. Clone the repository
2. Install dependencies:
