import { NextRequest, NextResponse } from 'next/server';
import { executePythonResearch } from '@/lib/python-researcher';

export async function POST(req: NextRequest) {
  try {
    const { query = '', details = '' } = await req.json();

    if (!query.trim()) {
      return NextResponse.json({ error: 'Query is required' }, { status: 400 });
    }

    const data = await executePythonResearch(query, details);

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
            engine: 'Python 3 (Fallback Mode)',
          },
        },
        { status: 200 }
      );
    }

    return NextResponse.json(data);
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || 'Python research lookup failed' },
      { status: 500 }
    );
  }
}
