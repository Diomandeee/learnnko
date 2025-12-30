#!/usr/bin/env python3
"""
N'Ko Training Data Export Pipeline

Exports validated training data in formats suitable for different ML pipelines:
- Hugging Face datasets format
- OpenAI fine-tuning format
- Custom JSONL for cc-rag++

Usage:
    python export.py --input training_data/ --format huggingface --output exports/
"""

import json
import argparse
from pathlib import Path
from typing import List, Dict, Any
from datetime import datetime


class HuggingFaceExporter:
    """Export to Hugging Face datasets format."""
    
    @staticmethod
    def export_translation(samples: List[Dict], output_path: Path) -> None:
        """Export translation samples for translation model training."""
        hf_samples = []
        
        for sample in samples:
            hf_samples.append({
                "id": sample["id"],
                "translation": {
                    "nko": sample["nko_text"],
                    "en": sample.get("english_translation", "")
                },
                "source": sample.get("source_url", "")
            })
        
        # Write as JSONL
        output_file = output_path / "nko_en_translations.jsonl"
        with open(output_file, 'w', encoding='utf-8') as f:
            for sample in hf_samples:
                f.write(json.dumps(sample, ensure_ascii=False) + '\n')
        
        # Write dataset info
        info = {
            "dataset_name": "nko-english-translation",
            "language_pair": ["nko", "en"],
            "num_samples": len(hf_samples),
            "created_at": datetime.utcnow().isoformat(),
            "features": {
                "id": "string",
                "translation": {"nko": "string", "en": "string"},
                "source": "string"
            }
        }
        
        info_file = output_path / "dataset_info.json"
        with open(info_file, 'w', encoding='utf-8') as f:
            json.dump(info, f, indent=2, ensure_ascii=False)
        
        print(f"  ✅ Exported {len(hf_samples)} samples to {output_file}")


class OpenAIExporter:
    """Export to OpenAI fine-tuning format."""
    
    @staticmethod
    def export_chat_format(samples: List[Dict], output_path: Path) -> None:
        """Export in OpenAI chat fine-tuning format."""
        openai_samples = []
        
        for sample in samples:
            # Create a translation task
            openai_samples.append({
                "messages": [
                    {
                        "role": "system",
                        "content": "You are a helpful assistant that translates N'Ko text to English."
                    },
                    {
                        "role": "user",
                        "content": f"Translate this N'Ko text to English: {sample['nko_text']}"
                    },
                    {
                        "role": "assistant",
                        "content": sample.get("english_translation", "")
                    }
                ]
            })
        
        output_file = output_path / "nko_finetune.jsonl"
        with open(output_file, 'w', encoding='utf-8') as f:
            for sample in openai_samples:
                f.write(json.dumps(sample, ensure_ascii=False) + '\n')
        
        print(f"  ✅ Exported {len(openai_samples)} samples to {output_file}")


class CCRagExporter:
    """Export to cc-rag++ Supabase format."""
    
    @staticmethod
    def export_embeddings_format(
        translation_samples: List[Dict],
        vocabulary_samples: List[Dict],
        output_path: Path
    ) -> None:
        """Export in cc-rag++ compatible format for Supabase storage."""
        
        # Translation trajectories
        trajectories = []
        for sample in translation_samples:
            trajectories.append({
                "id": sample["id"],
                "content": sample["nko_text"],
                "metadata": {
                    "type": "translation",
                    "english": sample.get("english_translation", ""),
                    "latin": sample.get("latin_text", ""),
                    "source_url": sample.get("source_url", ""),
                    "timestamp_ms": sample.get("timestamp_ms", 0),
                    "confidence": sample.get("confidence", 0.0)
                },
                "created_at": datetime.utcnow().isoformat()
            })
        
        # Vocabulary entries
        vocabulary = []
        for sample in vocabulary_samples:
            vocabulary.append({
                "id": sample["id"],
                "nko_word": sample["nko_word"],
                "latin_word": sample.get("latin_word"),
                "meaning": sample.get("meaning", ""),
                "context": {
                    "nko": sample.get("sentence_context_nko", ""),
                    "english": sample.get("sentence_context_english", "")
                },
                "source_url": sample.get("source_url", ""),
                "created_at": datetime.utcnow().isoformat()
            })
        
        # Write files
        traj_file = output_path / "trajectories.jsonl"
        with open(traj_file, 'w', encoding='utf-8') as f:
            for t in trajectories:
                f.write(json.dumps(t, ensure_ascii=False) + '\n')
        
        vocab_file = output_path / "vocabulary.jsonl"
        with open(vocab_file, 'w', encoding='utf-8') as f:
            for v in vocabulary:
                f.write(json.dumps(v, ensure_ascii=False) + '\n')
        
        print(f"  ✅ Exported {len(trajectories)} trajectories to {traj_file}")
        print(f"  ✅ Exported {len(vocabulary)} vocabulary entries to {vocab_file}")


def load_jsonl(path: Path) -> List[Dict]:
    """Load samples from a JSONL file."""
    samples = []
    if path.exists():
        with open(path, 'r', encoding='utf-8') as f:
            for line in f:
                samples.append(json.loads(line.strip()))
    return samples


def main():
    parser = argparse.ArgumentParser(description="Export N'Ko training data")
    parser.add_argument("--input", "-i", required=True, help="Input directory with validated data")
    parser.add_argument("--format", "-f", choices=["huggingface", "openai", "ccrag", "all"], 
                       default="all", help="Export format")
    parser.add_argument("--output", "-o", default="exports", help="Output directory")
    args = parser.parse_args()
    
    input_path = Path(args.input)
    output_path = Path(args.output)
    output_path.mkdir(parents=True, exist_ok=True)
    
    if not input_path.exists():
        print(f"❌ Input directory not found: {input_path}")
        return 1
    
    print("=" * 50)
    print("  N'Ko Training Data Exporter")
    print("=" * 50)
    print()
    
    # Load data
    translation_samples = load_jsonl(input_path / "translation" / "samples.jsonl")
    vocabulary_samples = load_jsonl(input_path / "vocabulary" / "words.jsonl")
    
    print(f"📦 Loaded {len(translation_samples)} translation samples")
    print(f"📦 Loaded {len(vocabulary_samples)} vocabulary samples")
    print()
    
    # Export based on format
    formats = [args.format] if args.format != "all" else ["huggingface", "openai", "ccrag"]
    
    for fmt in formats:
        fmt_output = output_path / fmt
        fmt_output.mkdir(exist_ok=True)
        
        print(f"📤 Exporting to {fmt} format...")
        
        if fmt == "huggingface":
            HuggingFaceExporter.export_translation(translation_samples, fmt_output)
        elif fmt == "openai":
            OpenAIExporter.export_chat_format(translation_samples, fmt_output)
        elif fmt == "ccrag":
            CCRagExporter.export_embeddings_format(
                translation_samples, vocabulary_samples, fmt_output
            )
    
    print()
    print("=" * 50)
    print("  ✅ Export complete!")
    print("=" * 50)
    
    return 0


if __name__ == "__main__":
    exit(main())

