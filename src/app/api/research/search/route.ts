import { NextRequest, NextResponse } from 'next/server';
import { executeZaiResearch } from '@/lib/zai-researcher';

export async function POST(req: NextRequest) {
  try {
    const { query = '', details = '' } = await req.json();

    if (!query.trim()) {
      return NextResponse.json({ error: 'Query is required' }, { status: 400 });
    }

    const data = await executeZaiResearch(query, details);

    if (!data) {
      return NextResponse.json(
        {
          topic: query,
          details,
          wikipedia_articles: [],
          reddit_threads: [],
          web_research: [],
          facts: [],
          human_stories: [],
          sources: [],
          metrics: {
            wikipedia_count: 0,
            reddit_count: 0,
            web_count: 0,
            engine: 'ZAI Web Search (no results)',
          },
        },
        { status: 200 }
      );
    }

    return NextResponse.json(data);
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || 'ZAI research lookup failed' },
      { status: 500 }
    );
  }
}
