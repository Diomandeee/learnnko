#!/usr/bin/env python3
"""
N'Ko Training Data Transformation Pipeline

This module processes raw Gemini API responses and transforms them
into structured training data suitable for:
- Translation model fine-tuning
- OCR training
- Vocabulary extraction
- Conversational AI training

Usage:
    python transform.py --input raw_responses.jsonl --output training_data/
"""

import json
import re
import uuid
import argparse
from pathlib import Path
from datetime import datetime
from typing import Optional, List, Dict, Any
from dataclasses import dataclass, asdict
import unicodedata


# N'Ko Unicode range
NKO_START = 0x07C0
NKO_END = 0x07FF


@dataclass
class TranslationSample:
    """A single translation training sample."""
    id: str
    nko_text: str
    latin_text: Optional[str]
    english_translation: str
    source_url: str
    timestamp_ms: int
    confidence: float
    validation_status: Dict[str, Any]


@dataclass
class VocabularySample:
    """A single vocabulary training sample."""
    id: str
    nko_word: str
    latin_word: Optional[str]
    meaning: str
    source_url: str
    timestamp_ms: int
    sentence_context_nko: Optional[str]
    sentence_context_english: Optional[str]
    part_of_speech: Optional[str]


@dataclass
class OCRSample:
    """A single OCR training sample."""
    id: str
    image_reference: str  # Frame reference or URL
    nko_detected_text: str
    latin_transliteration: Optional[str]
    source_url: str
    timestamp_ms: int
    confidence: float
    bounding_boxes: Optional[List[Dict[str, float]]]


class NkoValidator:
    """Validates N'Ko text according to Unicode standards."""
    
    @staticmethod
    def is_nko_char(char: str) -> bool:
        """Check if a character is in the N'Ko Unicode block."""
        code = ord(char)
        return NKO_START <= code <= NKO_END
    
    @staticmethod
    def extract_nko_text(text: str) -> str:
        """Extract only N'Ko characters from text."""
        return ''.join(c for c in text if NkoValidator.is_nko_char(c) or c.isspace())
    
    @staticmethod
    def validate(text: str) -> Dict[str, Any]:
        """Validate N'Ko text and return status."""
        if not text:
            return {"is_valid": False, "errors": ["Empty text"], "warnings": []}
        
        nko_chars = [c for c in text if NkoValidator.is_nko_char(c)]
        total_chars = len([c for c in text if not c.isspace()])
        
        if not nko_chars:
            return {"is_valid": False, "errors": ["No N'Ko characters found"], "warnings": []}
        
        nko_ratio = len(nko_chars) / total_chars if total_chars > 0 else 0
        
        warnings = []
        if nko_ratio < 0.8:
            warnings.append(f"Only {nko_ratio:.0%} N'Ko characters")
        
        return {
            "is_valid": True,
            "errors": [],
            "warnings": warnings,
            "nko_char_count": len(nko_chars),
            "nko_ratio": nko_ratio
        }


class ResponseParser:
    """Parses Gemini API responses to extract structured data."""
    
    def __init__(self):
        self.validator = NkoValidator()
    
    def parse_response(self, response_text: str) -> Dict[str, Any]:
        """Parse a Gemini response and extract N'Ko content."""
        result = {
            "nko_text": None,
            "latin_text": None,
            "english_translation": None,
            "words": [],
            "confidence": 0.0,
            "raw_response": response_text
        }
        
        # Try to parse structured JSON response
        try:
            # Check if response contains JSON
            json_match = re.search(r'\{[^{}]*\}', response_text, re.DOTALL)
            if json_match:
                data = json.loads(json_match.group())
                if "nko_text" in data:
                    result["nko_text"] = data.get("nko_text")
                if "latin" in data or "transliteration" in data:
                    result["latin_text"] = data.get("latin") or data.get("transliteration")
                if "english" in data or "translation" in data:
                    result["english_translation"] = data.get("english") or data.get("translation")
                if "confidence" in data:
                    result["confidence"] = float(data.get("confidence", 0))
        except (json.JSONDecodeError, ValueError):
            pass
        
        # Fallback: Extract N'Ko characters directly
        if not result["nko_text"]:
            nko_text = self.validator.extract_nko_text(response_text)
            if nko_text.strip():
                result["nko_text"] = nko_text.strip()
                result["confidence"] = 0.6  # Lower confidence for heuristic extraction
        
        # Extract individual words
        if result["nko_text"]:
            result["words"] = [w for w in result["nko_text"].split() if w]
        
        return result


class TransformationPipeline:
    """Main transformation pipeline for processing raw data."""
    
    def __init__(self, output_dir: Path):
        self.output_dir = output_dir
        self.parser = ResponseParser()
        self.validator = NkoValidator()
        
        # Create output directories
        self.output_dir.mkdir(parents=True, exist_ok=True)
        (self.output_dir / "translation").mkdir(exist_ok=True)
        (self.output_dir / "vocabulary").mkdir(exist_ok=True)
        (self.output_dir / "ocr").mkdir(exist_ok=True)
        (self.output_dir / "conversation").mkdir(exist_ok=True)
        
        # Statistics
        self.stats = {
            "total_processed": 0,
            "nko_detected": 0,
            "translation_samples": 0,
            "vocabulary_samples": 0,
            "ocr_samples": 0,
            "errors": 0
        }
    
    def process_file(self, input_file: Path) -> None:
        """Process a JSONL file of raw responses."""
        print(f"Processing: {input_file}")
        
        translation_samples = []
        vocabulary_samples = []
        ocr_samples = []
        vocabulary_set = set()  # For deduplication
        
        with open(input_file, 'r', encoding='utf-8') as f:
            for line_num, line in enumerate(f, 1):
                try:
                    record = json.loads(line.strip())
                    self.stats["total_processed"] += 1
                    
                    # Parse the response
                    parsed = self.parser.parse_response(record.get("raw_response", ""))
                    
                    if parsed["nko_text"]:
                        self.stats["nko_detected"] += 1
                        
                        # Create translation sample
                        if parsed["english_translation"]:
                            sample = TranslationSample(
                                id=str(uuid.uuid4()),
                                nko_text=parsed["nko_text"],
                                latin_text=parsed["latin_text"],
                                english_translation=parsed["english_translation"],
                                source_url=record.get("source_url", ""),
                                timestamp_ms=record.get("timestamp_ms", 0),
                                confidence=parsed["confidence"],
                                validation_status=self.validator.validate(parsed["nko_text"])
                            )
                            translation_samples.append(asdict(sample))
                            self.stats["translation_samples"] += 1
                        
                        # Extract vocabulary
                        for word in parsed["words"]:
                            if word not in vocabulary_set and len(word) > 1:
                                vocabulary_set.add(word)
                                vocab_sample = VocabularySample(
                                    id=str(uuid.uuid4()),
                                    nko_word=word,
                                    latin_word=None,
                                    meaning="",  # To be filled by human review
                                    source_url=record.get("source_url", ""),
                                    timestamp_ms=record.get("timestamp_ms", 0),
                                    sentence_context_nko=parsed["nko_text"],
                                    sentence_context_english=parsed["english_translation"],
                                    part_of_speech=None
                                )
                                vocabulary_samples.append(asdict(vocab_sample))
                                self.stats["vocabulary_samples"] += 1
                        
                        # Create OCR sample (for image-based training)
                        ocr_sample = OCRSample(
                            id=str(uuid.uuid4()),
                            image_reference=f"frame_{record.get('frame_index', 0)}",
                            nko_detected_text=parsed["nko_text"],
                            latin_transliteration=parsed["latin_text"],
                            source_url=record.get("source_url", ""),
                            timestamp_ms=record.get("timestamp_ms", 0),
                            confidence=parsed["confidence"],
                            bounding_boxes=None
                        )
                        ocr_samples.append(asdict(ocr_sample))
                        self.stats["ocr_samples"] += 1
                        
                except (json.JSONDecodeError, KeyError) as e:
                    self.stats["errors"] += 1
                    print(f"  Error on line {line_num}: {e}")
        
        # Write output files
        self._write_jsonl(self.output_dir / "translation" / "samples.jsonl", translation_samples)
        self._write_jsonl(self.output_dir / "vocabulary" / "words.jsonl", vocabulary_samples)
        self._write_jsonl(self.output_dir / "ocr" / "samples.jsonl", ocr_samples)
        
        print(f"  ✅ Processed {self.stats['total_processed']} records")
        print(f"     N'Ko detected: {self.stats['nko_detected']}")
        print(f"     Translation samples: {self.stats['translation_samples']}")
        print(f"     Vocabulary samples: {self.stats['vocabulary_samples']}")
    
    def _write_jsonl(self, path: Path, records: List[Dict]) -> None:
        """Write records to a JSONL file."""
        if not records:
            return
        
        with open(path, 'w', encoding='utf-8') as f:
            for record in records:
                f.write(json.dumps(record, ensure_ascii=False) + '\n')
        
        print(f"  📝 Wrote {len(records)} records to {path.name}")
    
    def generate_manifest(self) -> None:
        """Generate a manifest file with transformation statistics."""
        manifest = {
            "generated_at": datetime.utcnow().isoformat(),
            "statistics": self.stats,
            "output_files": {
                "translation": str(self.output_dir / "translation" / "samples.jsonl"),
                "vocabulary": str(self.output_dir / "vocabulary" / "words.jsonl"),
                "ocr": str(self.output_dir / "ocr" / "samples.jsonl")
            }
        }
        
        manifest_path = self.output_dir / "manifest.json"
        with open(manifest_path, 'w', encoding='utf-8') as f:
            json.dump(manifest, f, indent=2, ensure_ascii=False)
        
        print(f"\n📋 Manifest written to {manifest_path}")


def main():
    parser = argparse.ArgumentParser(description="Transform N'Ko training data")
    parser.add_argument("--input", "-i", required=True, help="Input JSONL file with raw responses")
    parser.add_argument("--output", "-o", default="training_data", help="Output directory")
    args = parser.parse_args()
    
    input_path = Path(args.input)
    output_path = Path(args.output)
    
    if not input_path.exists():
        print(f"❌ Input file not found: {input_path}")
        return 1
    
    print("=" * 50)
    print("  N'Ko Training Data Transformation Pipeline")
    print("=" * 50)
    print()
    
    pipeline = TransformationPipeline(output_path)
    pipeline.process_file(input_path)
    pipeline.generate_manifest()
    
    print()
    print("=" * 50)
    print("  ✅ Transformation complete!")
    print("=" * 50)
    
    return 0


if __name__ == "__main__":
    exit(main())

