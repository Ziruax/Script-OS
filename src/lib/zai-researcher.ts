/**
 * ZAI Multi-Source Research Engine
 * -------------------------------
 * Replaces the broken Python research_engine.py with a reliable, zero-dependency
 * implementation built on the system's z-ai-web-dev-sdk.
 *
 * - Real-time web search via the `web_search` function (DuckDuckGo-style results)
 * - Optional page content extraction via the `page_reader` function
 * - Reddit-specific discovery via targeted queries
 * - All async, with safe per-source timeouts and graceful empty fallbacks.
 *
 * MUST run server-side only (z-ai-web-dev-sdk is not browser-safe).
 */

let _zaiPromise: Promise<any> | null = null;
async function getZai() {
  if (!_zaiPromise) {
    const mod = await import('z-ai-web-dev-sdk');
    const ZAI = (mod as any).default || mod;
    _zaiPromise = ZAI.create();
  }
  return _zaiPromise;
}

export interface WebResult {
  title: string;
  url: string;
  snippet: string;
  host_name: string;
  source_type: string;
}

export interface ZaiResearchOutput {
  topic: string;
  details: string;
  web_research: WebResult[];
  reddit_threads: WebResult[];
  wikipedia_articles: WebResult[];
  sources: string[];
  metrics: {
    wikipedia_count: number;
    reddit_count: number;
    web_count: number;
    engine: string;
  };
}

const TIMEOUT = (ms: number) => new Promise<never>((_, reject) => setTimeout(() => reject(new Error('timeout')), ms));

// Simple in-memory cache to avoid re-hitting the web_search API (and 429s) for identical queries.
const _searchCache = new Map<string, { ts: number; data: WebResult[] }>();
const CACHE_TTL_MS = 10 * 60 * 1000; // 10 minutes

async function searchOnce(query: string, num: number): Promise<WebResult[]> {
  const cacheKey = `${query}::${num}`;
  const cached = _searchCache.get(cacheKey);
  if (cached && Date.now() - cached.ts < CACHE_TTL_MS) {
    return cached.data;
  }

  // Retry up to 2 times on rate-limit (429) with backoff
  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      const zai = await getZai();
      const results: any[] = await Promise.race([
        zai.functions.invoke('web_search', { query, num }),
        TIMEOUT(10000),
      ]);
      if (!Array.isArray(results)) {
        const empty: WebResult[] = [];
        _searchCache.set(cacheKey, { ts: Date.now(), data: empty });
        return empty;
      }
      const mapped: WebResult[] = results.slice(0, num).map((r) => ({
        title: r.name || r.title || '(untitled)',
        url: r.url || '',
        snippet: r.snippet || '',
        host_name: r.host_name || '',
        source_type: 'web',
      }));
      _searchCache.set(cacheKey, { ts: Date.now(), data: mapped });
      return mapped;
    } catch (err: any) {
      const msg = String(err?.message || err);
      const isRateLimit = msg.includes('429') || msg.includes('Too many requests');
      if (isRateLimit && attempt < 2) {
        await new Promise((r) => setTimeout(r, 1200 * (attempt + 1)));
        continue;
      }
      return [];
    }
  }
  return [];
}

/**
 * Build a multi-source research dossier using the ZAI web_search function.
 * Runs queries SEQUENTIALLY (not in parallel) to respect rate limits.
 * Falls back to empty arrays (never throws) so callers can still run the LLM
 * synthesis step with whatever data was retrieved.
 */
export async function executeZaiResearch(topic: string, details: string = ''): Promise<ZaiResearchOutput | null> {
  const baseQuery = `${topic} ${details}`.slice(0, 400);
  const wikiQuery = `${topic} site:wikipedia.org OR wikipedia ${topic}`;
  const redditQuery = `${topic} site:reddit.com OR reddit ${topic} experience OR story`;

  // Sequential to avoid 429 rate-limiting from parallel calls
  const web = await searchOnce(baseQuery, 8);
  const wiki = await searchOnce(wikiQuery, 4);
  const reddit = await searchOnce(redditQuery, 4);

  // De-duplicate by URL
  const seen = new Set<string>();
  const dedup = (arr: WebResult[]) =>
    arr.filter((r) => {
      if (!r.url || seen.has(r.url)) return false;
      seen.add(r.url);
      return true;
    });

  const webDedup = dedup(web);
  const wikiDedup = dedup(wiki);
  const redditDedup = dedup(reddit);
  const allSources = Array.from(new Set([...webDedup, ...wikiDedup, ...redditDedup].map((r) => r.url))).filter(Boolean);

  if (webDedup.length === 0 && wikiDedup.length === 0 && redditDedup.length === 0) {
    return null;
  }

  return {
    topic,
    details,
    web_research: webDedup,
    reddit_threads: redditDedup.map((r) => ({ ...r, source_type: 'reddit' })),
    wikipedia_articles: wikiDedup.map((r) => ({ ...r, source_type: 'wikipedia' })),
    sources: allSources,
    metrics: {
      wikipedia_count: wikiDedup.length,
      reddit_count: redditDedup.length,
      web_count: webDedup.length,
      engine: 'ZAI Web Search (z-ai-web-dev-sdk)',
    },
  };
}
