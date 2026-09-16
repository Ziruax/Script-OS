import { NextResponse } from 'next/server';
import { isZaiAvailable } from '@/lib/gemini-server';

export async function GET() {
  const hasGoogleKey = Boolean(process.env.GEMINI_API_KEY);
  const zaiAvailable = await isZaiAvailable().catch(() => false);
  return NextResponse.json({
    status: 'ok',
    system: 'ScriptOS Web Engine',
    zai_available: zaiAvailable,
    zai_note: zaiAvailable
      ? 'Z.AI is configured and ready (zero-config).'
      : 'Z.AI is NOT configured. Create ~/.z-ai-config with your Z.AI key, OR use Google Gemini (free tier) in Settings.',
    has_google_key: hasGoogleKey,
    recommended_provider: zaiAvailable ? 'zai' : (hasGoogleKey ? 'google' : 'google'),
    timestamp: Date.now(),
  });
}
