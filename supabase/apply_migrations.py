#!/usr/bin/env python3
"""
Apply Supabase migrations using direct PostgreSQL connection.

Uses the connection string from environment variables.

Usage:
    python apply_migrations.py                    # Apply all pending migrations
    python apply_migrations.py --file 013_*.sql  # Apply specific migration
    python apply_migrations.py --dry-run         # Preview without applying
"""

import os
import sys
import re
import glob
import argparse
from pathlib import Path
from urllib.parse import urlparse

try:
    import psycopg2
except ImportError:
    print("Installing psycopg2-binary...")
    os.system("pip install psycopg2-binary")
    import psycopg2


def get_connection_params():
    """Extract PostgreSQL connection parameters from Supabase URL."""
    supabase_url = os.getenv("SUPABASE_URL")
    supabase_key = os.getenv("SUPABASE_SERVICE_KEY")
    
    if not supabase_url:
        raise ValueError("SUPABASE_URL environment variable not set")
    
    # Parse Supabase URL to get the project reference
    # Format: https://<project-ref>.supabase.co
    parsed = urlparse(supabase_url)
    project_ref = parsed.hostname.split('.')[0]
    
    # Supabase PostgreSQL connection format
    # Host: db.<project-ref>.supabase.co
    # Port: 5432 (or 6543 for pooler)
    # Database: postgres
    # User: postgres
    # Password: from SUPABASE_DB_PASSWORD or derived
    
    db_password = os.getenv("SUPABASE_DB_PASSWORD")
    if not db_password:
        print("Warning: SUPABASE_DB_PASSWORD not set")
        print("Please set it in your .env file or environment")
        print(f"You can find it in Supabase Dashboard > Project Settings > Database")
        return None
    
    return {
        "host": f"db.{project_ref}.supabase.co",
        "port": 5432,
        "database": "postgres",
        "user": "postgres",
        "password": db_password,
        "sslmode": "require",
    }


def apply_migration(conn, sql_content: str, filename: str, dry_run: bool = False):
    """Apply a single migration file."""
    print(f"\n{'[DRY RUN] ' if dry_run else ''}Applying: {filename}")
    
    if dry_run:
        # Just parse and show first few statements
        statements = sql_content.split(';')[:5]
        for stmt in statements:
            if stmt.strip():
                preview = stmt.strip()[:100] + "..." if len(stmt.strip()) > 100 else stmt.strip()
                print(f"  - {preview}")
        print(f"  ... ({len(sql_content.split(';'))} total statements)")
        return True
    
    try:
        with conn.cursor() as cur:
            # Execute the entire migration as a single transaction
            cur.execute(sql_content)
        conn.commit()
        print(f"  ✓ Applied successfully")
        return True
    except psycopg2.Error as e:
        conn.rollback()
        # Check if it's a "already exists" error (harmless)
        if "already exists" in str(e):
            print(f"  ⊘ Skipped (already applied)")
            return True
        print(f"  ✗ Error: {e}")
        return False


def main():
    parser = argparse.ArgumentParser(description="Apply Supabase migrations")
    parser.add_argument("--file", type=str, help="Specific migration file pattern (e.g., '013_*.sql')")
    parser.add_argument("--dry-run", action="store_true", help="Preview without applying")
    parser.add_argument("--force", action="store_true", help="Force apply even if already applied")
    args = parser.parse_args()
    
    # Load environment
    env_file = Path(__file__).parent.parent / ".env"
    if env_file.exists():
        with open(env_file) as f:
            for line in f:
                if line.strip() and not line.startswith('#') and '=' in line:
                    key, value = line.strip().split('=', 1)
                    os.environ.setdefault(key, value)
    
    # Get connection parameters
    conn_params = get_connection_params()
    if not conn_params:
        print("\nTo set your database password:")
        print("  1. Go to Supabase Dashboard > Project Settings > Database")
        print("  2. Copy the password")
        print("  3. Add to .env: SUPABASE_DB_PASSWORD=your_password")
        sys.exit(1)
    
    print(f"Connecting to: {conn_params['host']}...")
    
    try:
        conn = psycopg2.connect(**conn_params)
        print("  ✓ Connected")
    except psycopg2.Error as e:
        print(f"  ✗ Connection failed: {e}")
        sys.exit(1)
    
    # Find migration files
    migrations_dir = Path(__file__).parent / "migrations"
    
    if args.file:
        pattern = migrations_dir / args.file
        files = sorted(glob.glob(str(pattern)))
    else:
        # Apply all migrations in order
        files = sorted(migrations_dir.glob("*.sql"))
    
    if not files:
        print("No migration files found")
        sys.exit(0)
    
    print(f"\nFound {len(files)} migration(s)")
    
    success_count = 0
    for filepath in files:
        filepath = Path(filepath)
        
        # Skip combined/backup files
        if "ALL_MIGRATIONS" in filepath.name or filepath.name.startswith("_"):
            continue
        
        with open(filepath) as f:
            sql_content = f.read()
        
        if apply_migration(conn, sql_content, filepath.name, args.dry_run):
            success_count += 1
    
    conn.close()
    
    print(f"\n{'[DRY RUN] ' if args.dry_run else ''}Summary: {success_count}/{len(files)} migrations applied")


if __name__ == "__main__":
    main()

