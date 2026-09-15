import os
import numpy as np
from typing import List, Dict, Any
from backend.core.db import get_db_connection, fts_search
from backend.core.model_manager import get_search_mode

def tfidf_search(query: str, top_k: int = 5) -> List[Dict[str, Any]]:
    """Search research docs using Scikit-Learn TF-IDF cosine similarity."""
    conn = get_db_connection()
    cur = conn.cursor()
    cur.execute("SELECT id, title, content, url FROM research_docs ORDER BY id DESC LIMIT 200")
    rows = cur.fetchall()
    conn.close()

    if not rows:
        return []

    docs = [f"{r['title']}\n{r['content']}" for r in rows]
    all_texts = [query] + docs

    try:
        from sklearn.feature_extraction.text import TfidfVectorizer
        from sklearn.metrics.pairwise import cosine_similarity

        vectorizer = TfidfVectorizer(stop_words="english")
        tfidf_matrix = vectorizer.fit_transform(all_texts)

        query_vec = tfidf_matrix[0:1]
        doc_vecs = tfidf_matrix[1:]

        sims = cosine_similarity(query_vec, doc_vecs).flatten()
        top_indices = np.argsort(sims)[::-1][:top_k]

        results = []
        for idx in top_indices:
            score = float(sims[idx])
            if score > 0.05:
                r = rows[idx]
                results.append({
                    "id": r["id"],
                    "title": r["title"],
                    "snippet": r["content"][:200] + "...",
                    "url": r["url"],
                    "score": round(score, 3),
                    "engine": "TF-IDF"
                })
        return results
    except Exception as e:
        print(f"[!] TF-IDF error: {e}")
        return []

def fastembed_search(query: str, top_k: int = 5) -> List[Dict[str, Any]]:
    """Optional FastEmbed semantic search when RAM is sufficient."""
    try:
        from fastembed import TextEmbedding
        from sklearn.metrics.pairwise import cosine_similarity
        
        models_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", "models"))
        embedding_model = TextEmbedding(model_name="BAAI/bge-small-en-v1.5", cache_dir=models_dir)

        conn = get_db_connection()
        cur = conn.cursor()
        cur.execute("SELECT id, title, content, url FROM research_docs ORDER BY id DESC LIMIT 100")
        rows = cur.fetchall()
        conn.close()

        if not rows:
            return []

        doc_texts = [f"{r['title']}: {r['content'][:400]}" for r in rows]
        query_emb = list(embedding_model.embed([query]))[0].reshape(1, -1)
        doc_embs = np.array(list(embedding_model.embed(doc_texts)))

        sims = cosine_similarity(query_emb, doc_embs).flatten()
        top_indices = np.argsort(sims)[::-1][:top_k]

        results = []
        for idx in top_indices:
            score = float(sims[idx])
            r = rows[idx]
            results.append({
                "id": r["id"],
                "title": r["title"],
                "snippet": r["content"][:200] + "...",
                "url": r["url"],
                "score": round(score, 3),
                "engine": "FastEmbed (BGE-Small)"
            })
        return results
    except Exception as e:
        print(f"[!] FastEmbed search fallback: {e}")
        return []

def hybrid_search(query: str, top_k: int = 5) -> List[Dict[str, Any]]:
    """Tries FastEmbed if available & mode is FASTEMBED, else SQLite FTS5 + TF-IDF."""
    mode = get_search_mode()
    if mode == "FASTEMBED":
        fe_results = fastembed_search(query, top_k=top_k)
        if fe_results:
            return fe_results

    # First try TF-IDF
    tfidf_results = tfidf_search(query, top_k=top_k)
    if tfidf_results:
        return tfidf_results

    # Fallback to SQLite FTS5
    fts_results = fts_search(query, limit=top_k)
    return [{
        "id": r.get("doc_id"),
        "title": r.get("title", "Research Item"),
        "snippet": r.get("snippet", ""),
        "url": r.get("url", ""),
        "score": 1.0,
        "engine": "SQLite FTS5"
    } for r in fts_results]
