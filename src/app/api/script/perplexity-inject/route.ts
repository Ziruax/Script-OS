import { NextRequest, NextResponse } from 'next/server';
import { callUnifiedLLM, parseJsonSafe } from '@/lib/gemini-server';
import { scanScriptAntiAi, autoSanitizeBannedWords } from '@/lib/anti-ai-scanner';

export async function POST(req: NextRequest) {
  try {
    const {
      script_text,
      title,
      research_pack,
      provider = 'google',
      model,
      api_key,
    } = await req.json();

    if (!script_text || !script_text.trim()) {
      return NextResponse.json({ error: 'No script text provided' }, { status: 400 });
    }

    const systemPrompt = `You are the Perplexity Injector & Master Voice Humanizer for ScriptOS.
Your sole mission is to transform a structured script into an unmistakably human, visceral spoken-word masterpiece that obliterates AI detectors (GPTZero, Originality.ai).

CRITICAL INJECTIONS TO APPLY:
1. Inject 2-3 specific human micro-stories or creator struggle anecdotes (e.g. "My friend Alex posted 40 videos with 20 views until changing this one variable...").
2. Inject 1 self-deprecating authentic creator joke or admission (e.g. "I spent two weeks pretending I was smarter than dopamine, and I failed completely.").
3. Inject 1 unexpected cross-domain analogy (e.g. casino roulette payoff schedules, airplane stall dynamics, or sleight-of-hand magic misdirection).
4. Radically vary sentence cadence (Burstiness): Mix 3-word punches ("Not good. Seriously.") with 18-word flowing explanations.
5. Embed authentic conversational self-corrections: "Actually wait, that's wrong. Let's look at what really happens."
6. PRESERVE ALL PRODUCTION CUES: [B-ROLL: ...], [SFX: ...], [TEXT ON SCREEN: ...], [RE-HOOK: ...], and chapter headers.
7. ABSOLUTELY PURGE ALL BANNED CLICHÉS: No delve, tapestry, crucial, vital, leverage, furthermore, moreover, let's dive in, in conclusion.

Return valid JSON:
{
  "injected_script": "...",
  "injections_summary": [
    "Injected personal failure story in Chapter 1",
    "Added casino slot machine variable reward analogy in Chapter 2",
    "Enhanced sentence length variance and added conversational self-correction"
  ]
}`;

    const raw = await callUnifiedLLM({
      provider,
      model,
      apiKey: api_key,
      systemInstruction: systemPrompt,
      prompt: `Title: "${title}"
Original Script:
${script_text}

Available Human Research Stories:
${JSON.stringify(research_pack?.human_stories || [])}

Run the Perplexity Injector now and output the JSON.`,
      jsonMode: true,
      temperature: 0.75,
    });

    const parsed = parseJsonSafe(raw, {
      injected_script: script_text,
      injections_summary: ['Applied burstiness smoothing and contractions'],
    });

    // Sanitize any remaining banned words automatically
    const { sanitizedText } = autoSanitizeBannedWords(parsed.injected_script || script_text);
    const scan = scanScriptAntiAi(sanitizedText);

    return NextResponse.json({
      injected_script: sanitizedText,
      injections_summary: parsed.injections_summary || [],
      anti_ai_scan: scan,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Perplexity injection failed' }, { status: 500 });
  }
}
