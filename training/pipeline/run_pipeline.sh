#!/bin/bash
# N'Ko Training Data Pipeline Runner
#
# This script runs the complete transformation pipeline:
# 1. Transform raw Gemini responses → structured training data
# 2. Validate the transformed data
# 3. Export to multiple formats
#
# Usage: ./run_pipeline.sh <input_file.jsonl>

set -e

INPUT_FILE=${1:-"../data/raw_responses.jsonl"}
OUTPUT_DIR=${2:-"../data/training_data"}
EXPORT_DIR=${3:-"../data/exports"}

echo "============================================"
echo "  N'Ko Training Data Pipeline"
echo "============================================"
echo ""
echo "Input:  $INPUT_FILE"
echo "Output: $OUTPUT_DIR"
echo "Export: $EXPORT_DIR"
echo ""

# Check input file exists
if [ ! -f "$INPUT_FILE" ]; then
    echo "❌ Input file not found: $INPUT_FILE"
    echo ""
    echo "To create sample input, run a batch job first and export results."
    exit 1
fi

# Step 1: Transform
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Step 1: Transforming raw data..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
python3 transform.py --input "$INPUT_FILE" --output "$OUTPUT_DIR"
echo ""

# Step 2: Validate
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Step 2: Validating transformed data..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
python3 validate.py --input "$OUTPUT_DIR"
echo ""

# Step 3: Export
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Step 3: Exporting to multiple formats..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
python3 export.py --input "$OUTPUT_DIR" --output "$EXPORT_DIR" --format all
echo ""

echo "============================================"
echo "  ✅ Pipeline complete!"
echo "============================================"
echo ""
echo "Output files:"
echo "  Training data: $OUTPUT_DIR/"
echo "    - translation/samples.jsonl"
echo "    - vocabulary/words.jsonl"
echo "    - ocr/samples.jsonl"
echo ""
echo "  Exports: $EXPORT_DIR/"
echo "    - huggingface/nko_en_translations.jsonl"
echo "    - openai/nko_finetune.jsonl"
echo "    - ccrag/trajectories.jsonl"
echo "    - ccrag/vocabulary.jsonl"
echo ""

