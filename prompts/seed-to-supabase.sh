#!/bin/bash
# Seed prompts from YAML files to Supabase nko_prompts table
set -e

# Load environment
if [ -f .env ]; then
    export $(grep -v '^#' .env | xargs)
fi
if [ -f .env.local ]; then
    export $(grep -v '^#' .env.local | xargs)
fi

SUPABASE_URL="${SUPABASE_URL:-$NEXT_PUBLIC_SUPABASE_URL}"
# Try various key names
SUPABASE_KEY="${SUPABASE_SERVICE_KEY:-${SUPABASE_SERVICE_ROLE_KEY:-${SUPABASE_SECRET:-$SUPABASE_ANON_KEY}}}"

if [ -z "$SUPABASE_URL" ] || [ -z "$SUPABASE_KEY" ]; then
    echo "Error: SUPABASE_URL and SUPABASE_SERVICE_KEY must be set"
    exit 1
fi

echo "=== Seeding Prompts to Supabase ==="
echo "URL: $SUPABASE_URL"

# Python script to parse YAML and insert into Supabase
python3 << 'PYTHON_SCRIPT'
import os
import yaml
import json
import httpx
from pathlib import Path

SUPABASE_URL = os.environ.get('SUPABASE_URL') or os.environ.get('NEXT_PUBLIC_SUPABASE_URL')
SUPABASE_KEY = (
    os.environ.get('SUPABASE_SERVICE_KEY') or 
    os.environ.get('SUPABASE_SERVICE_ROLE_KEY') or 
    os.environ.get('SUPABASE_SECRET') or 
    os.environ.get('SUPABASE_ANON_KEY')
)

if not SUPABASE_URL or not SUPABASE_KEY:
    print("Error: Missing Supabase credentials")
    exit(1)

def load_yaml_prompts(yaml_dir: Path):
    """Load all prompts from YAML files."""
    prompts = []
    
    for yaml_file in yaml_dir.glob("*.yaml"):
        print(f"  Loading: {yaml_file.name}")
        with open(yaml_file) as f:
            data = yaml.safe_load(f)
        
        schema_version = data.get('schema_version', '1.0.0')
        default_category = data.get('category', 'custom')
        default_cost_tier = data.get('cost_tier', 'text_only')
        
        for prompt_id, prompt_data in data.get('prompts', {}).items():
            prompt = {
                'id': prompt_data.get('id', prompt_id),
                'name': prompt_data.get('name', prompt_id.replace('_', ' ').title()),
                'description': prompt_data.get('description'),
                'category': prompt_data.get('category', default_category),
                'cost_tier': prompt_data.get('cost_tier', default_cost_tier),
                'template': prompt_data.get('template', ''),
                'output_schema': json.dumps(prompt_data.get('output_schema')) if prompt_data.get('output_schema') else None,
                'version': schema_version,
                'active': True,
                'weight': 1.0,
                'metadata': json.dumps({
                    'source': 'yaml',
                    'file': yaml_file.name
                })
            }
            prompts.append(prompt)
    
    return prompts

def upsert_prompts(prompts: list):
    """Upsert prompts to Supabase."""
    headers = {
        'apikey': SUPABASE_KEY,
        'Authorization': f'Bearer {SUPABASE_KEY}',
        'Content-Type': 'application/json',
        'Prefer': 'resolution=merge-duplicates'
    }
    
    # Upsert each prompt
    with httpx.Client(timeout=30) as client:
        for prompt in prompts:
            print(f"  Upserting: {prompt['id']}")
            
            response = client.post(
                f"{SUPABASE_URL}/rest/v1/nko_prompts",
                headers=headers,
                json=prompt
            )
            
            if response.status_code >= 400:
                # Try update if insert fails
                response = client.patch(
                    f"{SUPABASE_URL}/rest/v1/nko_prompts?id=eq.{prompt['id']}",
                    headers=headers,
                    json=prompt
                )
            
            if response.status_code >= 400:
                print(f"    Error: {response.status_code} - {response.text}")
            else:
                print(f"    Success")

def main():
    script_dir = Path(__file__).parent if '__file__' in dir() else Path.cwd()
    yaml_dir = script_dir / 'prompts' / 'nko'
    
    # Try different paths
    if not yaml_dir.exists():
        yaml_dir = Path.cwd() / 'prompts' / 'nko'
    if not yaml_dir.exists():
        yaml_dir = Path('/Users/mohameddiomande/Desktop/learnnko/prompts/nko')
    
    if not yaml_dir.exists():
        print(f"Error: YAML directory not found: {yaml_dir}")
        exit(1)
    
    print(f"\nLoading prompts from: {yaml_dir}")
    prompts = load_yaml_prompts(yaml_dir)
    print(f"\nFound {len(prompts)} prompts")
    
    print("\nUpserting to Supabase...")
    upsert_prompts(prompts)
    
    print(f"\n✅ Done! Seeded {len(prompts)} prompts to nko_prompts table")

if __name__ == '__main__':
    main()
PYTHON_SCRIPT

echo ""
echo "=== Verifying seeded prompts ==="

# Verify the prompts were inserted
curl -s "${SUPABASE_URL}/rest/v1/nko_prompts?select=id,name,category,cost_tier&active=eq.true" \
    -H "apikey: ${SUPABASE_KEY}" \
    -H "Authorization: Bearer ${SUPABASE_KEY}" | python3 -m json.tool

echo ""
echo "✅ Prompt seeding complete!"

