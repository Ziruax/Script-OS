import { NextResponse } from 'next/server';

export async function GET() {
  const hasGoogleKey = Boolean(process.env.GEMINI_API_KEY);
  return NextResponse.json({
    status: 'ok',
    system: 'ScriptOS Web Engine',
    ram: {
      total_gb: 4.0,
      mode_label: 'Your PC 4GB - Using Ultra-Light Mode (FTS5 + TF-IDF)',
      percent: 38,
    },
    search_mode: 'TFIDF',
    has_google_key: hasGoogleKey,
    timestamp: Date.now(),
  });
}
