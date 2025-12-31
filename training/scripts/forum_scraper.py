#!/usr/bin/env python3
"""
Ankataa Forum Knowledge Scraper

Extracts knowledge from the An ka taa Discourse forum:
https://ankataa.discourse.group

Categories:
- Word Questions (linguistic clarifications)
- Word Not in Dictionary (new vocabulary)
- Media and References (learning resources)
- User Guide (usage tips)

Extracts:
- Topic title and content
- Discussion threads with expert answers
- Example sentences and corrections
- Tags and related words

Usage:
    python forum_scraper.py                  # Scrape all categories
    python forum_scraper.py --category word-questions
    python forum_scraper.py --dry-run        # Preview without saving
"""

import asyncio
import aiohttp
import argparse
import json
import os
import re
import sys
from dataclasses import dataclass, field, asdict
from datetime import datetime
from pathlib import Path
from typing import List, Dict, Any, Optional
from bs4 import BeautifulSoup

# Add parent to path for imports
sys.path.insert(0, str(Path(__file__).parent))

try:
    from supabase_client import SupabaseClient
except ImportError:
    SupabaseClient = None

# Forum URLs
FORUM_BASE_URL = "https://ankataa.discourse.group"
FORUM_API_URL = f"{FORUM_BASE_URL}"

# Categories to scrape
CATEGORIES = {
    "word-questions": {
        "id": 5,
        "name": "Word Questions",
        "description": "Questions about word meanings and usage",
    },
    "word-not-in-dictionary": {
        "id": 6,
        "name": "Word Not in Dictionary",
        "description": "New vocabulary not yet in the dictionary",
    },
    "media-references": {
        "id": 7,
        "name": "Media and References",
        "description": "Learning resources and media",
    },
    "user-guide": {
        "id": 8,
        "name": "User Guide",
        "description": "How to use the dictionary and forum",
    },
    "introductions": {
        "id": 4,
        "name": "Introductions",
        "description": "User introductions (may contain learning context)",
    },
}

# Rate limiting
REQUEST_DELAY = 1.5  # seconds between requests


@dataclass
class ForumAnswer:
    """An answer/reply in a forum topic."""
    author: str
    content: str
    created_at: Optional[str] = None
    is_accepted: bool = False
    likes: int = 0


@dataclass
class ForumTopic:
    """A forum topic with all its content."""
    topic_id: str
    category: str
    title: str
    content: str
    author: str
    answers: List[ForumAnswer] = field(default_factory=list)
    related_words: List[str] = field(default_factory=list)
    tags: List[str] = field(default_factory=list)
    url: str = ""
    views: int = 0
    replies: int = 0
    forum_created_at: Optional[str] = None
    
    def to_dict(self) -> Dict[str, Any]:
        """Convert to dictionary for Supabase."""
        return {
            "topic_id": self.topic_id,
            "category": self.category,
            "title": self.title,
            "content": self.content,
            "author": self.author,
            "answers": [asdict(a) for a in self.answers],
            "related_words": self.related_words,
            "tags": self.tags,
            "url": self.url,
            "views": self.views,
            "replies": self.replies,
            "forum_created_at": self.forum_created_at,
        }


def extract_manding_words(text: str) -> List[str]:
    """
    Extract potential Manding/Bambara words from text.
    
    Looks for words with special Manding characters or
    patterns that suggest they're Bambara/Dioula.
    """
    # Special Manding characters
    manding_chars = set('ɛɔɲŋ')
    
    words = []
    
    # Find words with Manding characters
    for match in re.finditer(r'\b[a-zɛɔɲŋàáâãèéêìíîòóôùúû]+\b', text.lower()):
        word = match.group()
        if any(c in manding_chars for c in word) and len(word) > 1:
            words.append(word)
    
    # Find quoted words (often vocabulary)
    for match in re.finditer(r'["\']([a-zɛɔɲŋàáâãèéêìíîòóôùúû]+)["\']', text.lower()):
        word = match.group(1)
        if len(word) > 1:
            words.append(word)
    
    # Find italicized words (often examples)
    for match in re.finditer(r'_([a-zɛɔɲŋàáâãèéêìíîòóôùúû\s]+)_', text.lower()):
        words.extend(match.group(1).split())
    
    return list(set(words))


async def fetch_json(session: aiohttp.ClientSession, url: str) -> Optional[Dict]:
    """Fetch JSON from URL with rate limiting."""
    await asyncio.sleep(REQUEST_DELAY)
    
    headers = {
        "Accept": "application/json",
        "User-Agent": "LearnNko/1.0 (Educational Research)",
    }
    
    try:
        async with session.get(url, headers=headers) as resp:
            if resp.status == 200:
                return await resp.json()
            else:
                print(f"    HTTP {resp.status} for {url}")
                return None
    except Exception as e:
        print(f"    Error fetching {url}: {e}")
        return None


async def fetch_html(session: aiohttp.ClientSession, url: str) -> Optional[str]:
    """Fetch HTML from URL with rate limiting."""
    await asyncio.sleep(REQUEST_DELAY)
    
    headers = {
        "User-Agent": "LearnNko/1.0 (Educational Research)",
    }
    
    try:
        async with session.get(url, headers=headers) as resp:
            if resp.status == 200:
                return await resp.text()
            else:
                print(f"    HTTP {resp.status} for {url}")
                return None
    except Exception as e:
        print(f"    Error fetching {url}: {e}")
        return None


async def get_category_topics(
    session: aiohttp.ClientSession,
    category_slug: str,
    category_id: int,
) -> List[Dict]:
    """Get all topics in a category using Discourse API."""
    topics = []
    page = 0
    
    while True:
        url = f"{FORUM_API_URL}/c/{category_slug}/{category_id}.json?page={page}"
        data = await fetch_json(session, url)
        
        if not data or "topic_list" not in data:
            break
        
        topic_list = data["topic_list"].get("topics", [])
        if not topic_list:
            break
        
        topics.extend(topic_list)
        
        # Check if there are more pages
        if len(topic_list) < 30:  # Discourse default page size
            break
        
        page += 1
    
    return topics


async def get_topic_details(
    session: aiohttp.ClientSession,
    topic_id: int,
) -> Optional[Dict]:
    """Get full topic details including all posts."""
    url = f"{FORUM_API_URL}/t/{topic_id}.json"
    return await fetch_json(session, url)


def parse_topic(topic_data: Dict, category_name: str) -> Optional[ForumTopic]:
    """Parse topic data into a ForumTopic object."""
    if not topic_data:
        return None
    
    topic_id = str(topic_data.get("id", ""))
    title = topic_data.get("title", "")
    
    if not topic_id or not title:
        return None
    
    # Get posts
    posts = topic_data.get("post_stream", {}).get("posts", [])
    if not posts:
        return None
    
    # First post is the topic content
    first_post = posts[0]
    content = first_post.get("cooked", "")  # HTML content
    
    # Strip HTML tags for plain text
    soup = BeautifulSoup(content, 'html.parser')
    plain_content = soup.get_text('\n', strip=True)
    
    # Parse answers (subsequent posts)
    answers = []
    for post in posts[1:]:
        answer_html = post.get("cooked", "")
        answer_soup = BeautifulSoup(answer_html, 'html.parser')
        answer_text = answer_soup.get_text('\n', strip=True)
        
        if answer_text:
            answers.append(ForumAnswer(
                author=post.get("username", "anonymous"),
                content=answer_text,
                created_at=post.get("created_at"),
                is_accepted=post.get("accepted_answer", False),
                likes=post.get("like_count", 0),
            ))
    
    # Extract Manding words from all content
    all_text = plain_content + " " + " ".join(a.content for a in answers)
    related_words = extract_manding_words(all_text)
    
    # Get tags
    tags = topic_data.get("tags", [])
    
    return ForumTopic(
        topic_id=topic_id,
        category=category_name,
        title=title,
        content=plain_content,
        author=first_post.get("username", "anonymous"),
        answers=answers,
        related_words=related_words,
        tags=tags,
        url=f"{FORUM_BASE_URL}/t/{topic_data.get('slug', '')}/{topic_id}",
        views=topic_data.get("views", 0),
        replies=topic_data.get("posts_count", 1) - 1,
        forum_created_at=topic_data.get("created_at"),
    )


async def scrape_category(
    session: aiohttp.ClientSession,
    category_slug: str,
    category_info: Dict,
) -> List[ForumTopic]:
    """Scrape all topics from a category."""
    category_name = category_info["name"]
    category_id = category_info["id"]
    
    print(f"  Scraping category: {category_name}")
    
    # Get topic list
    topics_data = await get_category_topics(session, category_slug, category_id)
    print(f"    Found {len(topics_data)} topics")
    
    topics = []
    for i, topic_summary in enumerate(topics_data):
        topic_id = topic_summary.get("id")
        if not topic_id:
            continue
        
        # Get full topic details
        topic_data = await get_topic_details(session, topic_id)
        if topic_data:
            topic = parse_topic(topic_data, category_name)
            if topic:
                topics.append(topic)
                print(f"    [{i+1}/{len(topics_data)}] {topic.title[:50]}...")
    
    return topics


async def scrape_all_categories(
    categories: Optional[List[str]] = None,
) -> List[ForumTopic]:
    """Scrape all specified categories."""
    all_topics = []
    
    print("=" * 60)
    print("Ankataa Forum Scraper")
    print("=" * 60)
    print()
    
    # Filter categories if specified
    if categories:
        cats_to_scrape = {k: v for k, v in CATEGORIES.items() if k in categories}
    else:
        cats_to_scrape = CATEGORIES
    
    print(f"Scraping {len(cats_to_scrape)} categories...")
    print()
    
    async with aiohttp.ClientSession() as session:
        for slug, info in cats_to_scrape.items():
            try:
                topics = await scrape_category(session, slug, info)
                all_topics.extend(topics)
                print(f"    Total: {len(topics)} topics from {info['name']}")
                print()
            except Exception as e:
                print(f"    Error scraping {slug}: {e}")
    
    print(f"Total topics scraped: {len(all_topics)}")
    
    return all_topics


async def save_to_supabase(topics: List[ForumTopic]) -> int:
    """Save topics to Supabase."""
    if not SupabaseClient:
        print("Supabase client not available. Saving to JSON instead.")
        return save_to_json(topics)
    
    try:
        client = SupabaseClient()
    except Exception as e:
        print(f"Could not connect to Supabase: {e}")
        return save_to_json(topics)
    
    print(f"Saving {len(topics)} topics to Supabase...")
    
    saved = 0
    
    for topic in topics:
        data = topic.to_dict()
        
        try:
            await client._request(
                "POST",
                "forum_knowledge",
                data,
                headers={"Prefer": "resolution=merge-duplicates"}
            )
            saved += 1
        except Exception as e:
            print(f"  Error saving topic {topic.topic_id}: {e}")
    
    print(f"Saved {saved}/{len(topics)} topics")
    return saved


def save_to_json(topics: List[ForumTopic]) -> int:
    """Save topics to JSON file as fallback."""
    output_dir = Path(__file__).parent.parent / "data" / "forum"
    output_dir.mkdir(parents=True, exist_ok=True)
    
    output_file = output_dir / f"ankataa_forum_{datetime.now().strftime('%Y%m%d')}.json"
    
    data = [t.to_dict() for t in topics]
    
    with open(output_file, 'w', encoding='utf-8') as f:
        json.dump(data, f, ensure_ascii=False, indent=2)
    
    print(f"Saved {len(topics)} topics to {output_file}")
    return len(topics)


def print_summary(topics: List[ForumTopic]):
    """Print summary of scraped topics."""
    print()
    print("=" * 60)
    print("Summary")
    print("=" * 60)
    
    # By category
    by_category = {}
    for topic in topics:
        by_category.setdefault(topic.category, []).append(topic)
    
    for cat, cat_topics in by_category.items():
        print(f"\n{cat}: {len(cat_topics)} topics")
        
        # Count total answers
        total_answers = sum(len(t.answers) for t in cat_topics)
        print(f"  Total answers: {total_answers}")
        
        # Count unique words
        all_words = set()
        for t in cat_topics:
            all_words.update(t.related_words)
        print(f"  Unique Manding words: {len(all_words)}")
    
    # Overall stats
    print(f"\n{'=' * 40}")
    print(f"Total topics: {len(topics)}")
    print(f"Total answers: {sum(len(t.answers) for t in topics)}")
    
    all_words = set()
    for t in topics:
        all_words.update(t.related_words)
    print(f"Unique Manding words found: {len(all_words)}")


async def main():
    parser = argparse.ArgumentParser(description="Scrape Ankataa Forum")
    parser.add_argument("--category", type=str, help="Scrape a single category (slug)")
    parser.add_argument("--dry-run", action="store_true", help="Preview without saving")
    parser.add_argument("--json", action="store_true", help="Save to JSON instead of Supabase")
    parser.add_argument("--list-categories", action="store_true", help="List available categories")
    args = parser.parse_args()
    
    if args.list_categories:
        print("Available categories:")
        for slug, info in CATEGORIES.items():
            print(f"  {slug}: {info['name']} - {info['description']}")
        return
    
    categories = [args.category] if args.category else None
    topics = await scrape_all_categories(categories)
    
    print_summary(topics)
    
    if args.dry_run:
        print("\nDry run - not saving.")
        return
    
    if args.json:
        save_to_json(topics)
    else:
        await save_to_supabase(topics)


if __name__ == "__main__":
    asyncio.run(main())

