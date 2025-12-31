#!/usr/bin/env python3
"""
Architecture Documentation Build System

Keeps Mermaid (.mmd), Markdown (.md), HTML, and SVG in sync.

Source of Truth:
  - Mermaid diagrams (.mmd) → generates SVG
  - Markdown docs (.md) → generates HTML

When any source changes, running this script regenerates all outputs.

Usage:
    python build.py          # Build all
    python build.py --watch  # Watch for changes and auto-build
    python build.py --clean  # Remove generated files
"""

import os
import sys
import json
import hashlib
import subprocess
import argparse
from pathlib import Path
from datetime import datetime
from typing import Dict, List, Optional
import shutil

# Paths
DOCS_DIR = Path(__file__).parent
DIAGRAMS_DIR = DOCS_DIR / "diagrams"
HTML_DIR = DOCS_DIR / "html"
SVG_DIR = DOCS_DIR / "svg"
CACHE_FILE = DOCS_DIR / ".build_cache.json"

# Template for HTML pages
HTML_TEMPLATE = """<!DOCTYPE html>
<html lang="en" data-theme="dark">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{title} - LearnN'Ko Architecture</title>
    <link rel="stylesheet" href="styles.css">
    <script src="https://cdn.jsdelivr.net/npm/mermaid@10/dist/mermaid.min.js"></script>
</head>
<body>
    <nav class="sidebar">
        <div class="logo">
            <span class="logo-icon">ߒ</span>
            <span>LearnN'Ko</span>
        </div>
        <ul class="nav-links">
            {nav_links}
        </ul>
        <div class="build-info">
            <small>Built: {build_time}</small>
        </div>
    </nav>
    <main class="content">
        <article>
            {content}
        </article>
    </main>
    <script>
        mermaid.initialize({{ 
            startOnLoad: true, 
            theme: 'dark',
            themeVariables: {{
                primaryColor: '#00d4ff',
                primaryTextColor: '#fff',
                primaryBorderColor: '#00d4ff',
                lineColor: '#a855f7',
                secondaryColor: '#1e1e2e',
                tertiaryColor: '#2d2d44'
            }}
        }});
    </script>
</body>
</html>
"""

# CSS for HTML pages
CSS_CONTENT = """
:root {
    --bg-primary: #0a0a0f;
    --bg-secondary: #12121a;
    --bg-card: #1a1a2e;
    --text-primary: #ffffff;
    --text-secondary: #a0a0b0;
    --accent-cyan: #00d4ff;
    --accent-violet: #a855f7;
    --accent-amber: #f59e0b;
    --border-color: rgba(255, 255, 255, 0.1);
}

* {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
}

body {
    font-family: 'Space Grotesk', -apple-system, BlinkMacSystemFont, sans-serif;
    background: var(--bg-primary);
    color: var(--text-primary);
    display: flex;
    min-height: 100vh;
}

.sidebar {
    width: 280px;
    background: var(--bg-secondary);
    border-right: 1px solid var(--border-color);
    padding: 2rem 1.5rem;
    display: flex;
    flex-direction: column;
    position: fixed;
    height: 100vh;
    overflow-y: auto;
}

.logo {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    font-size: 1.5rem;
    font-weight: 700;
    margin-bottom: 2rem;
    color: var(--accent-cyan);
}

.logo-icon {
    font-size: 2rem;
    text-shadow: 0 0 20px var(--accent-cyan);
}

.nav-links {
    list-style: none;
    flex: 1;
}

.nav-links li {
    margin-bottom: 0.5rem;
}

.nav-links a {
    display: block;
    padding: 0.75rem 1rem;
    color: var(--text-secondary);
    text-decoration: none;
    border-radius: 8px;
    transition: all 0.2s;
}

.nav-links a:hover,
.nav-links a.active {
    background: var(--bg-card);
    color: var(--accent-cyan);
    border-left: 3px solid var(--accent-cyan);
}

.build-info {
    padding-top: 1rem;
    border-top: 1px solid var(--border-color);
    color: var(--text-secondary);
}

.content {
    flex: 1;
    margin-left: 280px;
    padding: 3rem;
    max-width: 900px;
}

article h1 {
    font-size: 2.5rem;
    margin-bottom: 1.5rem;
    background: linear-gradient(135deg, var(--accent-cyan), var(--accent-violet));
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
}

article h2 {
    font-size: 1.75rem;
    margin: 2rem 0 1rem;
    color: var(--accent-cyan);
}

article h3 {
    font-size: 1.25rem;
    margin: 1.5rem 0 0.75rem;
    color: var(--text-primary);
}

article p {
    line-height: 1.8;
    margin-bottom: 1rem;
    color: var(--text-secondary);
}

article code {
    background: var(--bg-card);
    padding: 0.2rem 0.5rem;
    border-radius: 4px;
    font-family: 'JetBrains Mono', monospace;
    font-size: 0.9em;
    color: var(--accent-amber);
}

article pre {
    background: var(--bg-card);
    border: 1px solid var(--border-color);
    border-radius: 8px;
    padding: 1.5rem;
    overflow-x: auto;
    margin: 1rem 0;
}

article pre code {
    background: none;
    padding: 0;
    color: var(--text-primary);
}

article table {
    width: 100%;
    border-collapse: collapse;
    margin: 1rem 0;
}

article th, article td {
    padding: 0.75rem 1rem;
    text-align: left;
    border: 1px solid var(--border-color);
}

article th {
    background: var(--bg-card);
    color: var(--accent-cyan);
}

article tr:hover {
    background: rgba(0, 212, 255, 0.05);
}

article ul, article ol {
    margin: 1rem 0;
    padding-left: 2rem;
    color: var(--text-secondary);
}

article li {
    margin-bottom: 0.5rem;
    line-height: 1.6;
}

article blockquote {
    border-left: 4px solid var(--accent-violet);
    padding-left: 1rem;
    margin: 1rem 0;
    color: var(--text-secondary);
    font-style: italic;
}

.mermaid {
    background: var(--bg-card);
    border-radius: 12px;
    padding: 2rem;
    margin: 1.5rem 0;
}

.diagram-container {
    text-align: center;
    margin: 2rem 0;
}

.diagram-container img {
    max-width: 100%;
    height: auto;
    border-radius: 8px;
}

@media (max-width: 900px) {
    .sidebar {
        width: 100%;
        height: auto;
        position: relative;
    }
    .content {
        margin-left: 0;
    }
}
"""


def get_file_hash(path: Path) -> str:
    """Get MD5 hash of file contents."""
    if not path.exists():
        return ""
    return hashlib.md5(path.read_bytes()).hexdigest()


def load_cache() -> Dict:
    """Load build cache."""
    if CACHE_FILE.exists():
        return json.loads(CACHE_FILE.read_text())
    return {"files": {}, "last_build": None}


def save_cache(cache: Dict):
    """Save build cache."""
    cache["last_build"] = datetime.now().isoformat()
    CACHE_FILE.write_text(json.dumps(cache, indent=2))


def file_changed(path: Path, cache: Dict) -> bool:
    """Check if file has changed since last build."""
    current_hash = get_file_hash(path)
    cached_hash = cache.get("files", {}).get(str(path), "")
    return current_hash != cached_hash


def update_cache_hash(path: Path, cache: Dict):
    """Update cache with current file hash."""
    if "files" not in cache:
        cache["files"] = {}
    cache["files"][str(path)] = get_file_hash(path)


def markdown_to_html(md_content: str) -> str:
    """Convert Markdown to HTML (simple conversion)."""
    import re
    
    html = md_content
    
    # Headers
    html = re.sub(r'^### (.+)$', r'<h3>\1</h3>', html, flags=re.MULTILINE)
    html = re.sub(r'^## (.+)$', r'<h2>\1</h2>', html, flags=re.MULTILINE)
    html = re.sub(r'^# (.+)$', r'<h1>\1</h1>', html, flags=re.MULTILINE)
    
    # Code blocks with mermaid
    def replace_mermaid(match):
        code = match.group(1)
        return f'<div class="mermaid">\n{code}\n</div>'
    
    html = re.sub(r'```mermaid\n(.*?)\n```', replace_mermaid, html, flags=re.DOTALL)
    
    # Regular code blocks
    def replace_code(match):
        lang = match.group(1) or ''
        code = match.group(2)
        return f'<pre><code class="language-{lang}">{code}</code></pre>'
    
    html = re.sub(r'```(\w*)\n(.*?)\n```', replace_code, html, flags=re.DOTALL)
    
    # Inline code
    html = re.sub(r'`([^`]+)`', r'<code>\1</code>', html)
    
    # Bold and italic
    html = re.sub(r'\*\*([^*]+)\*\*', r'<strong>\1</strong>', html)
    html = re.sub(r'\*([^*]+)\*', r'<em>\1</em>', html)
    
    # Links
    html = re.sub(r'\[([^\]]+)\]\(([^)]+)\)', r'<a href="\2">\1</a>', html)
    
    # Tables
    def convert_table(match):
        table_text = match.group(0)
        lines = table_text.strip().split('\n')
        
        if len(lines) < 2:
            return table_text
            
        # Parse header
        headers = [cell.strip() for cell in lines[0].split('|') if cell.strip()]
        
        html_table = '<table>\n<thead>\n<tr>\n'
        for h in headers:
            html_table += f'<th>{h}</th>\n'
        html_table += '</tr>\n</thead>\n<tbody>\n'
        
        # Parse rows (skip separator line)
        for line in lines[2:]:
            cells = [cell.strip() for cell in line.split('|') if cell.strip()]
            if cells:
                html_table += '<tr>\n'
                for cell in cells:
                    html_table += f'<td>{cell}</td>\n'
                html_table += '</tr>\n'
        
        html_table += '</tbody>\n</table>'
        return html_table
    
    html = re.sub(r'(\|[^\n]+\|\n)+', convert_table, html)
    
    # Lists
    def convert_list(match):
        items = match.group(0).strip().split('\n')
        result = '<ul>\n'
        for item in items:
            content = re.sub(r'^[-*]\s+', '', item)
            result += f'<li>{content}</li>\n'
        result += '</ul>'
        return result
    
    html = re.sub(r'(^[-*]\s+.+\n?)+', convert_list, html, flags=re.MULTILINE)
    
    # Paragraphs
    paragraphs = html.split('\n\n')
    result = []
    for p in paragraphs:
        p = p.strip()
        if p and not p.startswith('<'):
            p = f'<p>{p}</p>'
        result.append(p)
    
    return '\n'.join(result)


def get_nav_links(current_file: str, md_files: List[Path]) -> str:
    """Generate navigation links."""
    links = []
    for md_file in sorted(md_files):
        name = md_file.stem
        title = name.replace('-', ' ').replace('_', ' ')
        if name.startswith('0'):
            title = title[3:]  # Remove "01-" prefix
        title = title.title()
        
        html_name = f"{name}.html"
        active = "active" if md_file.stem == current_file else ""
        links.append(f'<li><a href="{html_name}" class="{active}">{title}</a></li>')
    
    return '\n'.join(links)


def build_html(force: bool = False):
    """Build HTML from Markdown files."""
    cache = load_cache()
    HTML_DIR.mkdir(exist_ok=True)
    
    # Write CSS
    css_path = HTML_DIR / "styles.css"
    css_path.write_text(CSS_CONTENT)
    print(f"  ✓ {css_path.name}")
    
    # Get all markdown files
    md_files = list(DOCS_DIR.glob("*.md"))
    
    for md_file in md_files:
        if not force and not file_changed(md_file, cache):
            continue
            
        html_file = HTML_DIR / f"{md_file.stem}.html"
        
        # Read and convert
        md_content = md_file.read_text()
        html_content = markdown_to_html(md_content)
        
        # Get title from first H1
        import re
        title_match = re.search(r'^# (.+)$', md_content, re.MULTILINE)
        title = title_match.group(1) if title_match else md_file.stem
        
        # Build full HTML
        full_html = HTML_TEMPLATE.format(
            title=title,
            content=html_content,
            nav_links=get_nav_links(md_file.stem, md_files),
            build_time=datetime.now().strftime("%Y-%m-%d %H:%M")
        )
        
        html_file.write_text(full_html)
        update_cache_hash(md_file, cache)
        print(f"  ✓ {html_file.name}")
    
    save_cache(cache)


def build_svg(force: bool = False):
    """Build SVG from Mermaid files."""
    cache = load_cache()
    SVG_DIR.mkdir(exist_ok=True)
    
    # Check if mmdc (mermaid-cli) is available
    mmdc_available = shutil.which("mmdc") is not None
    
    for mmd_file in DIAGRAMS_DIR.glob("*.mmd"):
        if not force and not file_changed(mmd_file, cache):
            continue
            
        svg_file = SVG_DIR / f"{mmd_file.stem}.svg"
        
        if mmdc_available:
            # Use mermaid-cli
            try:
                subprocess.run(
                    ["mmdc", "-i", str(mmd_file), "-o", str(svg_file), "-t", "dark"],
                    check=True,
                    capture_output=True
                )
                print(f"  ✓ {svg_file.name}")
            except subprocess.CalledProcessError as e:
                print(f"  ✗ {svg_file.name}: {e.stderr.decode()}")
        else:
            # Create placeholder SVG with embedded Mermaid
            mmd_content = mmd_file.read_text()
            placeholder_svg = f'''<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="800" height="600">
  <style>
    text {{ font-family: monospace; fill: #00d4ff; }}
    rect {{ fill: #1a1a2e; stroke: #00d4ff; }}
  </style>
  <rect width="100%" height="100%" fill="#0a0a0f"/>
  <text x="50%" y="30" text-anchor="middle" font-size="20" fill="#a855f7">
    {mmd_file.stem}
  </text>
  <text x="20" y="60" font-size="12" fill="#a0a0b0">
    <!-- Mermaid source: {mmd_file.name} -->
    <!-- Install @mermaid-js/mermaid-cli for full SVG generation -->
  </text>
  <foreignObject x="20" y="80" width="760" height="500">
    <pre xmlns="http://www.w3.org/1999/xhtml" style="color:#fff;font-size:10px;white-space:pre-wrap;">{mmd_content[:500]}...</pre>
  </foreignObject>
</svg>'''
            svg_file.write_text(placeholder_svg)
            print(f"  ⚠ {svg_file.name} (placeholder - install mmdc for full SVG)")
        
        update_cache_hash(mmd_file, cache)
    
    save_cache(cache)


def build_all(force: bool = False):
    """Build all documentation."""
    print("Building Architecture Documentation")
    print("=" * 40)
    
    print("\n📄 Building HTML from Markdown...")
    build_html(force)
    
    print("\n🎨 Building SVG from Mermaid...")
    build_svg(force)
    
    print("\n✅ Build complete!")
    print(f"   HTML: {HTML_DIR}")
    print(f"   SVG:  {SVG_DIR}")


def clean():
    """Remove generated files."""
    print("Cleaning generated files...")
    
    if HTML_DIR.exists():
        shutil.rmtree(HTML_DIR)
        print(f"  ✓ Removed {HTML_DIR}")
    
    if SVG_DIR.exists():
        shutil.rmtree(SVG_DIR)
        print(f"  ✓ Removed {SVG_DIR}")
    
    if CACHE_FILE.exists():
        CACHE_FILE.unlink()
        print(f"  ✓ Removed {CACHE_FILE}")


def watch():
    """Watch for changes and auto-rebuild."""
    try:
        import time
        print("Watching for changes... (Ctrl+C to stop)")
        print(f"  Watching: {DOCS_DIR}")
        
        cache = load_cache()
        
        while True:
            changed = False
            
            # Check markdown files
            for md_file in DOCS_DIR.glob("*.md"):
                if file_changed(md_file, cache):
                    print(f"\n📝 Changed: {md_file.name}")
                    changed = True
            
            # Check mermaid files
            for mmd_file in DIAGRAMS_DIR.glob("*.mmd"):
                if file_changed(mmd_file, cache):
                    print(f"\n📊 Changed: {mmd_file.name}")
                    changed = True
            
            if changed:
                build_all(force=True)
            
            time.sleep(2)
            
    except KeyboardInterrupt:
        print("\n\nStopped watching.")


def main():
    parser = argparse.ArgumentParser(description="Build architecture documentation")
    parser.add_argument("--watch", action="store_true", help="Watch for changes")
    parser.add_argument("--clean", action="store_true", help="Remove generated files")
    parser.add_argument("--force", action="store_true", help="Force rebuild all")
    args = parser.parse_args()
    
    if args.clean:
        clean()
    elif args.watch:
        build_all(force=True)
        watch()
    else:
        build_all(force=args.force)


if __name__ == "__main__":
    main()

