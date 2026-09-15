#!/usr/bin/env python3
"""
ScriptOS Multi-Source Python Research Engine
Concurrent real-time research from:
1. Python Wikipedia Library (wikipedia)
2. Python Reddit Search Engine (ddgs site:reddit.com & r/ community threads)
3. Python Live Web Search (ddgs)
"""

import sys
import json
import os
import re
import concurrent.futures

# 1. Wikipedia Setup
try:
    import wikipedia
    wikipedia.set_user_agent("ScriptOS-ResearchBot/1.0 (https://scriptos.ai; bot@scriptos.ai)")
except Exception:
    wikipedia = None

# 2. DuckDuckGo / Web & Reddit Setup
try:
    from ddgs import DDGS
except Exception:
    try:
        from duckduckgo_search import DDGS
    except Exception:
        DDGS = None


def fetch_wikipedia_safe(query, max_pages=2):
    if not wikipedia:
        return []
    pages = []
    clean_query = re.sub(r'[^\w\s]', ' ', query).strip()
    try:
        titles = wikipedia.search(clean_query, results=max_pages + 1)
    except Exception:
        titles = [clean_query]

    for title in titles[:max_pages]:
        try:
            summary = wikipedia.summary(title, sentences=3, auto_suggest=False)
            page = wikipedia.page(title, auto_suggest=False)
            pages.append({
                "title": page.title,
                "url": page.url,
                "summary": summary.strip(),
                "source_type": "wikipedia"
            })
        except Exception:
            try:
                summary = wikipedia.summary(title, sentences=2, auto_suggest=True)
                pages.append({
                    "title": title,
                    "url": f"https://en.wikipedia.org/wiki/{title.replace(' ', '_')}",
                    "summary": summary.strip(),
                    "source_type": "wikipedia"
                })
            except Exception:
                continue
    return pages


def fetch_reddit_safe(query, max_results=5):
    if not DDGS:
        return []
    threads = []
    # Search for authentic human experiences, mistakes, and discussions on Reddit
    reddit_query = f"site:reddit.com {query}"
    try:
        with DDGS() as ddgs:
            results = list(ddgs.text(reddit_query, max_results=max_results))
            for r in results:
                href = r.get("href", "")
                if "reddit.com" in href:
                    sub_match = re.search(r'reddit\.com/r/([^/]+)', href)
                    sub = f"r/{sub_match.group(1)}" if sub_match else "r/Reddit"
                    title = r.get("title", "").replace(" - Reddit", "").replace(" : r/", " - r/").strip()
                    snippet = r.get("body", "").strip()
                    threads.append({
                        "title": title,
                        "subreddit": sub,
                        "url": href,
                        "snippet": snippet,
                        "source_type": "reddit"
                    })
    except Exception:
        pass
    return threads


def fetch_web_facts_safe(query, max_results=5):
    if not DDGS:
        return []
    web_results = []
    try:
        with DDGS() as ddgs:
            results = list(ddgs.text(f"{query} statistics facts research study", max_results=max_results))
            for r in results:
                web_results.append({
                    "title": r.get("title", "").strip(),
                    "url": r.get("href", "").strip(),
                    "snippet": r.get("body", "").strip(),
                    "source_type": "web"
                })
    except Exception:
        pass
    return web_results


def run_parallel_research(topic, details=""):
    combined_query = f"{topic} {details}".strip()[:100]

    wiki_results = []
    reddit_results = []
    web_results = []

    # Run in parallel with ThreadPoolExecutor
    with concurrent.futures.ThreadPoolExecutor(max_workers=3) as executor:
        f_wiki = executor.submit(fetch_wikipedia_safe, topic)
        f_reddit = executor.submit(fetch_reddit_safe, topic)
        f_web = executor.submit(fetch_web_facts_safe, topic)

        try:
            wiki_results = f_wiki.result(timeout=6.0)
        except Exception:
            pass

        try:
            reddit_results = f_reddit.result(timeout=6.0)
        except Exception:
            pass

        try:
            web_results = f_web.result(timeout=6.0)
        except Exception:
            pass

    # Extract verified facts
    verified_facts = []
    for w in wiki_results:
        if w.get("summary"):
            verified_facts.append({
                "fact": w["summary"],
                "source": w["url"],
                "provider": "Wikipedia (Python Library)"
            })
    for b in web_results[:3]:
        if b.get("snippet"):
            verified_facts.append({
                "fact": b["snippet"],
                "source": b["url"],
                "provider": "Google / Web Search"
            })

    # Extract human stories from Reddit
    human_stories = []
    for r in reddit_results[:4]:
        human_stories.append({
            "story": f"[{r['subreddit']}] {r['title']}: \"{r['snippet'][:200]}...\"",
            "source": r["url"],
            "subreddit": r["subreddit"]
        })

    # Collect unique sources
    sources = []
    for item in wiki_results + reddit_results + web_results:
        url = item.get("url")
        if url and url not in sources:
            sources.append(url)

    return {
        "topic": topic,
        "details": details,
        "wikipedia_articles": wiki_results,
        "reddit_threads": reddit_results,
        "web_research": web_results,
        "facts": verified_facts,
        "human_stories": human_stories,
        "sources": sources[:12],
        "metrics": {
            "wikipedia_count": len(wiki_results),
            "reddit_count": len(reddit_results),
            "web_count": len(web_results),
            "engine": "Python 3 Multi-Source (wikipedia + ddgs + reddit)"
        }
    }


if __name__ == "__main__":
    topic_arg = sys.argv[1] if len(sys.argv) > 1 else "Why 99% Fail at Consistency"
    details_arg = sys.argv[2] if len(sys.argv) > 2 else ""

    data = run_parallel_research(topic_arg, details_arg)
    print(json.dumps(data))
