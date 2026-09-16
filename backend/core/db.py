import os
import sqlite3
import json
import time
from typing import List, Dict, Any, Optional

DATA_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", "data"))
DB_PATH = os.path.join(DATA_DIR, "scriptos.db")

def get_db_connection() -> sqlite3.Connection:
    os.makedirs(DATA_DIR, exist_ok=True)
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    """Initialize SQLite tables including FTS5 search index."""
    conn = get_db_connection()
    cur = conn.cursor()

    # Scripts table
    cur.execute("""
    CREATE TABLE IF NOT EXISTS scripts (
        id TEXT PRIMARY KEY,
        title TEXT NOT NULL,
        details TEXT,
        length_min INTEGER,
        audience TEXT,
        goal TEXT,
        tone TEXT,
        angle_json TEXT,
        outline_json TEXT,
        chapters_json TEXT,
        final_script TEXT,
        scorecard_json TEXT,
        hooks_json TEXT,
        created_at REAL,
        updated_at REAL
    );
    """)

    # LLM Cache table for fast local replay & saving API tokens
    cur.execute("""
    CREATE TABLE IF NOT EXISTS llm_cache (
        cache_key TEXT PRIMARY KEY,
        provider TEXT,
        model TEXT,
        prompt TEXT,
        response_text TEXT,
        created_at REAL
    );
    """)

    # Models Cache table
    cur.execute("""
    CREATE TABLE IF NOT EXISTS models_cache (
        provider TEXT PRIMARY KEY,
        models_json TEXT,
        updated_at REAL
    );
    """)

    # Standard research docs metadata
    cur.execute("""
    CREATE TABLE IF NOT EXISTS research_docs (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        query TEXT,
        doc_type TEXT,
        title TEXT,
        content TEXT,
        url TEXT,
        created_at REAL
    );
    """)

    # FTS5 Virtual Table for fast search
    try:
        cur.execute("""
        CREATE VIRTUAL TABLE IF NOT EXISTS fts_research USING fts5(
            doc_id UNINDEXED,
            title,
            content,
            url
        );
        """)
    except sqlite3.OperationalError:
        # Fallback if FTS5 not compiled in standard python runtime
        pass

    conn.commit()
    conn.close()

def save_research_doc(query: str, doc_type: str, title: str, content: str, url: str) -> int:
    conn = get_db_connection()
    cur = conn.cursor()
    now = time.time()
    cur.execute("""
        INSERT INTO research_docs (query, doc_type, title, content, url, created_at)
        VALUES (?, ?, ?, ?, ?, ?)
    """, (query, doc_type, title, content, url, now))
    doc_id = cur.lastrowid

    try:
        cur.execute("""
            INSERT INTO fts_research (doc_id, title, content, url)
            VALUES (?, ?, ?, ?)
        """, (doc_id, title, content, url))
    except Exception:
        pass

    conn.commit()
    conn.close()
    return doc_id

def fts_search(query: str, limit: int = 10) -> List[Dict[str, Any]]:
    conn = get_db_connection()
    cur = conn.cursor()
    results = []
    # Clean query for FTS5
    safe_q = "".join(c for c in query if c.isalnum() or c.isspace()).strip()
    if not safe_q:
        return results

    try:
        cur.execute("""
            SELECT doc_id, title, snippet(fts_research, 1, '<b>', '</b>', '...', 25) as snippet, url
            FROM fts_research
            WHERE fts_research MATCH ?
            ORDER BY rank
            LIMIT ?
        """, (safe_q, limit))
        for row in cur.fetchall():
            results.append(dict(row))
    except Exception:
        # Fallback LIKE
        cur.execute("""
            SELECT id as doc_id, title, substr(content, 1, 200) as snippet, url
            FROM research_docs
            WHERE content LIKE ? OR title LIKE ?
            LIMIT ?
        """, (f"%{safe_q}%", f"%{safe_q}%", limit))
        for row in cur.fetchall():
            results.append(dict(row))

    conn.close()
    return results

def get_cached_llm(cache_key: str) -> Optional[str]:
    conn = get_db_connection()
    cur = conn.cursor()
    cur.execute("SELECT response_text FROM llm_cache WHERE cache_key = ?", (cache_key,))
    row = cur.fetchone()
    conn.close()
    return row["response_text"] if row else None

def set_cached_llm(cache_key: str, provider: str, model: str, prompt: str, response: str):
    conn = get_db_connection()
    cur = conn.cursor()
    cur.execute("""
        INSERT OR REPLACE INTO llm_cache (cache_key, provider, model, prompt, response_text, created_at)
        VALUES (?, ?, ?, ?, ?, ?)
    """, (cache_key, provider, model, prompt, response, time.time()))
    conn.commit()
    conn.close()

def save_script_record(data: Dict[str, Any]) -> str:
    conn = get_db_connection()
    cur = conn.cursor()
    sid = data.get("id") or f"scr_{int(time.time()*1000)}"
    now = time.time()
    cur.execute("""
        INSERT OR REPLACE INTO scripts (
            id, title, details, length_min, audience, goal, tone,
            angle_json, outline_json, chapters_json, final_script,
            scorecard_json, hooks_json, created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    """, (
        sid,
        data.get("title", ""),
        data.get("details", ""),
        data.get("length_min", 8),
        data.get("audience", "Intermediate"),
        data.get("goal", "Viral"),
        data.get("tone", "Cinematic"),
        json.dumps(data.get("angle", {})),
        json.dumps(data.get("outline", {})),
        json.dumps(data.get("chapters", [])),
        data.get("final_script", ""),
        json.dumps(data.get("scorecard", {})),
        json.dumps(data.get("hooks", [])),
        data.get("created_at", now),
        now
    ))
    conn.commit()
    conn.close()
    return sid

def get_script_record(sid: str) -> Optional[Dict[str, Any]]:
    conn = get_db_connection()
    cur = conn.cursor()
    cur.execute("SELECT * FROM scripts WHERE id = ?", (sid,))
    row = cur.fetchone()
    conn.close()
    if not row:
        return None
    d = dict(row)
    for k in ["angle_json", "outline_json", "chapters_json", "scorecard_json", "hooks_json"]:
        if d.get(k):
            try:
                d[k.replace("_json", "")] = json.loads(d[k])
            except Exception:
                d[k.replace("_json", "")] = None
    return d

def list_all_scripts(limit: int = 20) -> List[Dict[str, Any]]:
    conn = get_db_connection()
    cur = conn.cursor()
    cur.execute("SELECT id, title, length_min, audience, goal, tone, created_at, updated_at FROM scripts ORDER BY updated_at DESC LIMIT ?", (limit,))
    rows = cur.fetchall()
    conn.close()
    return [dict(r) for r in rows]
