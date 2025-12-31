"""
Universal Prompt Loader for Python

Load prompts from:
1. Supabase database (highest priority)
2. Local YAML files (fallback)

Usage:
    from prompts.loader import PromptLoader
    
    loader = PromptLoader()
    loader.with_supabase(os.environ['SUPABASE_URL'], os.environ['SUPABASE_KEY'])
    
    prompt = loader.get('nko_frame')
    filled = loader.fill(prompt.template, {'nko_text': 'ߒߞߏ', 'translation': 'I declare'})
"""

import os
import re
import yaml
import httpx
from pathlib import Path
from dataclasses import dataclass, field
from typing import Optional, Dict, List, Any


@dataclass
class PromptDefinition:
    """A prompt definition loaded from database or file."""
    id: str
    name: str
    template: str
    category: str
    cost_tier: str = "text_only"  # text_only, multimodal, live
    description: Optional[str] = None
    output_schema: Optional[Dict[str, Any]] = None
    version: str = "1.0.0"
    active: bool = True
    tags: List[str] = field(default_factory=list)


class PromptLoader:
    """
    Universal prompt loader with Supabase and YAML support.
    
    Priority:
    1. Supabase database (if configured)
    2. Local YAML files
    """
    
    def __init__(self, yaml_dir: Optional[str] = None):
        """
        Initialize the prompt loader.
        
        Args:
            yaml_dir: Directory containing YAML prompt files.
                     Defaults to 'nko' subdirectory.
        """
        if yaml_dir:
            self.yaml_dir = Path(yaml_dir)
        else:
            self.yaml_dir = Path(__file__).parent / "nko"
        
        self.supabase_url: Optional[str] = None
        self.supabase_key: Optional[str] = None
        self._cache: Dict[str, PromptDefinition] = {}
    
    def with_supabase(self, url: str, key: str) -> "PromptLoader":
        """Configure Supabase connection."""
        self.supabase_url = url
        self.supabase_key = key
        return self
    
    def from_env(self) -> "PromptLoader":
        """Configure from environment variables."""
        if url := os.environ.get("SUPABASE_URL"):
            if key := os.environ.get("SUPABASE_SERVICE_KEY") or os.environ.get("SUPABASE_ANON_KEY"):
                self.with_supabase(url, key)
        return self
    
    def get(self, id: str) -> Optional[PromptDefinition]:
        """
        Get a prompt by ID.
        
        Priority: Cache → Supabase → YAML
        """
        # Check cache
        if id in self._cache:
            return self._cache[id]
        
        # Try Supabase
        if self.supabase_url and self.supabase_key:
            prompt = self._load_from_supabase(id)
            if prompt:
                self._cache[id] = prompt
                return prompt
        
        # Fall back to YAML
        prompt = self._load_from_yaml(id)
        if prompt:
            self._cache[id] = prompt
        return prompt
    
    def get_template(self, id: str) -> Optional[str]:
        """Get just the template string."""
        prompt = self.get(id)
        return prompt.template if prompt else None
    
    def fill(self, template: str, variables: Dict[str, str]) -> str:
        """
        Fill template placeholders with values.
        
        Placeholders use {variable_name} syntax.
        """
        result = template
        for key, value in variables.items():
            result = result.replace(f"{{{key}}}", value)
        return result
    
    def get_and_fill(self, id: str, variables: Dict[str, str]) -> Optional[str]:
        """Get a prompt and fill it with variables in one call."""
        template = self.get_template(id)
        if not template:
            return None
        return self.fill(template, variables)
    
    def list_ids(self) -> List[str]:
        """List all available prompt IDs."""
        ids = set()
        
        # From Supabase
        if self.supabase_url and self.supabase_key:
            try:
                with httpx.Client() as client:
                    response = client.get(
                        f"{self.supabase_url}/rest/v1/nko_prompts",
                        params={"select": "id", "active": "eq.true"},
                        headers={
                            "apikey": self.supabase_key,
                            "Authorization": f"Bearer {self.supabase_key}",
                        },
                    )
                    if response.is_success:
                        for row in response.json():
                            ids.add(row["id"])
            except Exception as e:
                print(f"Warning: Failed to list prompts from Supabase: {e}")
        
        # From YAML
        ids.update(self._load_all_yaml_ids())
        
        return sorted(ids)
    
    def list_by_category(self, category: str) -> List[PromptDefinition]:
        """List prompts by category."""
        prompts = []
        for id in self.list_ids():
            prompt = self.get(id)
            if prompt and prompt.category == category:
                prompts.append(prompt)
        return prompts
    
    def get_world_prompts(self) -> List[PromptDefinition]:
        """Get all world exploration prompts."""
        return self.list_by_category("world_exploration")
    
    def get_frame_prompts(self) -> List[PromptDefinition]:
        """Get all frame analysis prompts."""
        return self.list_by_category("frame_analysis")
    
    def clear_cache(self) -> None:
        """Clear the prompt cache."""
        self._cache.clear()
    
    # Private methods
    
    def _load_from_supabase(self, id: str) -> Optional[PromptDefinition]:
        """Load a prompt from Supabase."""
        if not self.supabase_url or not self.supabase_key:
            return None
        
        try:
            with httpx.Client() as client:
                response = client.get(
                    f"{self.supabase_url}/rest/v1/nko_prompts",
                    params={"id": f"eq.{id}", "active": "eq.true"},
                    headers={
                        "apikey": self.supabase_key,
                        "Authorization": f"Bearer {self.supabase_key}",
                    },
                )
                
                if not response.is_success:
                    return None
                
                rows = response.json()
                if not rows:
                    return None
                
                row = rows[0]
                return PromptDefinition(
                    id=row["id"],
                    name=row["name"],
                    description=row.get("description"),
                    category=row["category"],
                    cost_tier=row.get("cost_tier", "text_only"),
                    template=row["template"],
                    output_schema=row.get("output_schema"),
                    version=row.get("version", "1.0.0"),
                    active=row.get("active", True),
                    tags=row.get("tags", []),
                )
        except Exception as e:
            print(f"Warning: Failed to load prompt {id} from Supabase: {e}")
            return None
    
    def _load_from_yaml(self, id: str) -> Optional[PromptDefinition]:
        """Load a prompt from YAML files."""
        for file_path in self._get_yaml_files():
            try:
                with open(file_path) as f:
                    data = yaml.safe_load(f)
                
                if "prompts" in data and id in data["prompts"]:
                    prompt_data = data["prompts"][id]
                    return PromptDefinition(
                        id=prompt_data.get("id", id),
                        name=prompt_data.get("name", id),
                        description=prompt_data.get("description"),
                        category=prompt_data.get("category", data.get("category", "custom")),
                        cost_tier=prompt_data.get("cost_tier", data.get("cost_tier", "text_only")),
                        template=prompt_data["template"],
                        output_schema=prompt_data.get("output_schema"),
                        version=prompt_data.get("version", "1.0.0"),
                        active=prompt_data.get("active", True),
                        tags=prompt_data.get("tags", []),
                    )
            except Exception as e:
                print(f"Warning: Failed to load YAML file {file_path}: {e}")
        
        return None
    
    def _load_all_yaml_ids(self) -> List[str]:
        """Load all prompt IDs from YAML files."""
        ids = []
        for file_path in self._get_yaml_files():
            try:
                with open(file_path) as f:
                    data = yaml.safe_load(f)
                if "prompts" in data:
                    ids.extend(data["prompts"].keys())
            except Exception as e:
                print(f"Warning: Failed to parse YAML file {file_path}: {e}")
        return ids
    
    def _get_yaml_files(self) -> List[Path]:
        """Get all YAML files in the yaml_dir."""
        files = []
        if self.yaml_dir.exists():
            for entry in self.yaml_dir.iterdir():
                if entry.is_file() and entry.suffix in (".yaml", ".yml"):
                    files.append(entry)
        return files


# Singleton instance
_loader: Optional[PromptLoader] = None


def get_loader() -> PromptLoader:
    """Get the singleton prompt loader instance."""
    global _loader
    if _loader is None:
        _loader = PromptLoader().from_env()
    return _loader


def get_prompt(id: str) -> Optional[str]:
    """Get a prompt template by ID."""
    return get_loader().get_template(id)


def get_and_fill_prompt(id: str, variables: Dict[str, str]) -> Optional[str]:
    """Get and fill a prompt in one call."""
    return get_loader().get_and_fill(id, variables)


# CLI for testing
if __name__ == "__main__":
    import sys
    
    loader = PromptLoader().from_env()
    
    if len(sys.argv) < 2:
        print("Usage: python loader.py <prompt_id> [var1=val1 var2=val2 ...]")
        print("\nAvailable prompts:")
        for id in loader.list_ids():
            print(f"  - {id}")
        sys.exit(0)
    
    prompt_id = sys.argv[1]
    variables = {}
    
    for arg in sys.argv[2:]:
        if "=" in arg:
            key, value = arg.split("=", 1)
            variables[key] = value
    
    if variables:
        result = loader.get_and_fill(prompt_id, variables)
    else:
        result = loader.get_template(prompt_id)
    
    if result:
        print(result)
    else:
        print(f"Prompt '{prompt_id}' not found")
        sys.exit(1)

