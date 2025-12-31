"""
LearnN'Ko Training Library

Core modules for the N'Ko video analysis and training pipeline.

Modules:
- analyzer: NkoAnalyzer for video analysis, OCR, and world generation
- dictionary_client: DictionaryClient for Ankataa dictionary lookups
- retry_utils: Retry utilities with exponential backoff
- supabase_client: Supabase database client
- world_generator: World variant generator
- frame_filter: Smart frame extraction and filtering
"""

from .dictionary_client import DictionaryClient, DictionaryLookupResult, normalize_word

__all__ = [
    "DictionaryClient",
    "DictionaryLookupResult",
    "normalize_word",
]
