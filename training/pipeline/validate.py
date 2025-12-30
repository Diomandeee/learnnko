#!/usr/bin/env python3
"""
N'Ko Training Data Validation Pipeline

Validates transformed training data against schemas and N'Ko Unicode rules.

Usage:
    python validate.py --input training_data/
"""

import json
import argparse
from pathlib import Path
from typing import Dict, List, Any, Tuple
from dataclasses import dataclass


# N'Ko Unicode ranges
NKO_BLOCK = {"start": 0x07C0, "end": 0x07FF}
NKO_DIGITS = {"start": 0x07C0, "end": 0x07C9}
NKO_VOWELS = {"start": 0x07CA, "end": 0x07D0}
NKO_CONSONANTS = {"start": 0x07D1, "end": 0x07E7}
NKO_COMBINING = {"start": 0x07EB, "end": 0x07F5}
NKO_PUNCTUATION = {"start": 0x07F6, "end": 0x07FF}


@dataclass
class ValidationResult:
    """Result of validating a single sample."""
    sample_id: str
    is_valid: bool
    errors: List[str]
    warnings: List[str]
    nko_coverage: float
    character_breakdown: Dict[str, int]


class NkoStructuralValidator:
    """Validates N'Ko text structure according to Unicode standards."""
    
    @staticmethod
    def in_range(code: int, range_def: Dict[str, int]) -> bool:
        """Check if code point is in range."""
        return range_def["start"] <= code <= range_def["end"]
    
    @classmethod
    def classify_char(cls, char: str) -> str:
        """Classify a character by its N'Ko category."""
        code = ord(char)
        
        if cls.in_range(code, NKO_DIGITS):
            return "digit"
        elif cls.in_range(code, NKO_VOWELS):
            return "vowel"
        elif cls.in_range(code, NKO_CONSONANTS):
            return "consonant"
        elif cls.in_range(code, NKO_COMBINING):
            return "combining"
        elif cls.in_range(code, NKO_PUNCTUATION):
            return "punctuation"
        elif cls.in_range(code, NKO_BLOCK):
            return "other_nko"
        elif char.isspace():
            return "whitespace"
        else:
            return "non_nko"
    
    @classmethod
    def validate_text(cls, text: str) -> ValidationResult:
        """Validate N'Ko text structure."""
        errors = []
        warnings = []
        breakdown = {
            "digit": 0, "vowel": 0, "consonant": 0,
            "combining": 0, "punctuation": 0, "other_nko": 0,
            "whitespace": 0, "non_nko": 0
        }
        
        prev_category = None
        for i, char in enumerate(text):
            category = cls.classify_char(char)
            breakdown[category] += 1
            
            # Rule: Combining marks must follow a base character
            if category == "combining" and prev_category in ["whitespace", None, "combining"]:
                errors.append(f"Invalid combining mark at position {i}: must follow base character")
            
            prev_category = category
        
        # Calculate N'Ko coverage
        total_chars = sum(v for k, v in breakdown.items() if k != "whitespace")
        nko_chars = sum(v for k, v in breakdown.items() if k not in ["whitespace", "non_nko"])
        coverage = nko_chars / total_chars if total_chars > 0 else 0
        
        # Warnings for low coverage
        if 0 < coverage < 0.5:
            warnings.append(f"Low N'Ko coverage: {coverage:.0%}")
        
        # Warning for text that's all non-N'Ko
        if nko_chars == 0 and total_chars > 0:
            errors.append("No N'Ko characters found in text")
        
        return ValidationResult(
            sample_id="",
            is_valid=len(errors) == 0,
            errors=errors,
            warnings=warnings,
            nko_coverage=coverage,
            character_breakdown=breakdown
        )


class DatasetValidator:
    """Validates entire datasets."""
    
    def __init__(self):
        self.structural_validator = NkoStructuralValidator()
        self.stats = {
            "total": 0,
            "valid": 0,
            "invalid": 0,
            "warnings": 0
        }
    
    def validate_translation_file(self, path: Path) -> List[ValidationResult]:
        """Validate a translation samples file."""
        results = []
        
        with open(path, 'r', encoding='utf-8') as f:
            for line in f:
                record = json.loads(line.strip())
                self.stats["total"] += 1
                
                # Validate N'Ko text
                nko_text = record.get("nko_text", "")
                result = self.structural_validator.validate_text(nko_text)
                result.sample_id = record.get("id", "unknown")
                
                # Additional validation rules
                if not record.get("english_translation"):
                    result.warnings.append("Missing English translation")
                
                if record.get("confidence", 0) < 0.5:
                    result.warnings.append(f"Low confidence: {record.get('confidence', 0):.2f}")
                
                if result.is_valid:
                    self.stats["valid"] += 1
                else:
                    self.stats["invalid"] += 1
                
                if result.warnings:
                    self.stats["warnings"] += 1
                
                results.append(result)
        
        return results
    
    def validate_vocabulary_file(self, path: Path) -> List[ValidationResult]:
        """Validate a vocabulary samples file."""
        results = []
        seen_words = set()
        
        with open(path, 'r', encoding='utf-8') as f:
            for line in f:
                record = json.loads(line.strip())
                self.stats["total"] += 1
                
                nko_word = record.get("nko_word", "")
                result = self.structural_validator.validate_text(nko_word)
                result.sample_id = record.get("id", "unknown")
                
                # Check for duplicates
                if nko_word in seen_words:
                    result.warnings.append("Duplicate word")
                seen_words.add(nko_word)
                
                # Check word length
                if len(nko_word) < 2:
                    result.warnings.append("Very short word")
                
                if result.is_valid:
                    self.stats["valid"] += 1
                else:
                    self.stats["invalid"] += 1
                
                if result.warnings:
                    self.stats["warnings"] += 1
                
                results.append(result)
        
        return results
    
    def print_summary(self) -> None:
        """Print validation summary."""
        print("\n" + "=" * 50)
        print("  Validation Summary")
        print("=" * 50)
        print(f"  Total samples:   {self.stats['total']}")
        print(f"  Valid:           {self.stats['valid']} ({self.stats['valid']/max(1,self.stats['total']):.0%})")
        print(f"  Invalid:         {self.stats['invalid']}")
        print(f"  With warnings:   {self.stats['warnings']}")


def main():
    parser = argparse.ArgumentParser(description="Validate N'Ko training data")
    parser.add_argument("--input", "-i", required=True, help="Input directory with training data")
    parser.add_argument("--verbose", "-v", action="store_true", help="Show detailed results")
    args = parser.parse_args()
    
    input_path = Path(args.input)
    
    if not input_path.exists():
        print(f"❌ Input directory not found: {input_path}")
        return 1
    
    print("=" * 50)
    print("  N'Ko Training Data Validator")
    print("=" * 50)
    print()
    
    validator = DatasetValidator()
    
    # Validate translation samples
    translation_file = input_path / "translation" / "samples.jsonl"
    if translation_file.exists():
        print(f"📝 Validating translation samples...")
        results = validator.validate_translation_file(translation_file)
        
        if args.verbose:
            for r in results:
                if not r.is_valid or r.warnings:
                    print(f"  {r.sample_id}: {'❌' if not r.is_valid else '⚠️'}")
                    for e in r.errors:
                        print(f"    Error: {e}")
                    for w in r.warnings:
                        print(f"    Warning: {w}")
    
    # Validate vocabulary samples
    vocabulary_file = input_path / "vocabulary" / "words.jsonl"
    if vocabulary_file.exists():
        print(f"📝 Validating vocabulary samples...")
        results = validator.validate_vocabulary_file(vocabulary_file)
        
        if args.verbose:
            for r in results:
                if not r.is_valid or r.warnings:
                    print(f"  {r.sample_id}: {'❌' if not r.is_valid else '⚠️'}")
    
    validator.print_summary()
    
    return 0 if validator.stats["invalid"] == 0 else 1


if __name__ == "__main__":
    exit(main())

