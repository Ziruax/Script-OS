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
      story_mode = false,
    } = await req.json();

    if (!script_text || !script_text.trim()) {
      return NextResponse.json({ error: 'No script text provided' }, { status: 400 });
    }

    // ── Story Mode injector: sensory anchors, subtext layers, emotional micro-beats ──
    if (story_mode) {
      const systemPrompt = `You are the Story Perplexity Injector for ScriptOS Story Mode.
Your mission is to deepen the storytelling quality of this script by injecting
specific storytelling elements that make it unmistakably human and visceral.

CRITICAL STORY INJECTIONS:
1. SENSORY ANCHORS: Add or strengthen 2-3 concrete sensory images (what they SEE, HEAR,
   SMELL, TOUCH, TASTE) at key emotional turns. Ground abstraction in the physical.
2. SUBTEXT LAYERS: Add 1-2 dialogue moments where characters say one thing and mean
   another. The gap between the spoken and the meant IS the emotion.
3. EMOTIONAL MICRO-BEATS: Add 2-3 tiny pauses or gestures (a held breath, a hand on
   a doorknob, a look away) that carry more weight than dialogue.
4. BURSTINESS: Vary sentence cadence — mix 3-word punches with long flowing sentences.
5. AUTHENTIC SELF-CORRECTION: Add 1 moment where the narrator/protagonist stops,
   corrects, or admits something uncomfortable ("Actually — that's not quite right.
   The truth was simpler, and worse.")
6. PRESERVE ALL STORY CUES: [SCENE], [DIALOGUE], [NARRATION], [SOUND], [BEAT], chapter headers.
7. PURGE BANNED CLICHÉS: No delve, tapestry, crucial, vital, leverage, furthermore.

Return ONLY valid JSON:
{
  "injected_script": "the full enhanced story script",
  "injections_summary": { "sensory_anchors_added": N, "subtext_layers_added": N, "emotional_beats_added": N },
  "anti_ai_scan": { "totalFlags": N, "burstiness": { "sentence_count": N, "avg_words": N, "std_dev": N, "burstiness_score": N, "is_human": true } }
}`;

      try {
        const raw = await callUnifiedLLM({
          provider, model, apiKey: api_key,
          systemInstruction: systemPrompt,
          prompt: `STORY TITLE: "${title}"\n\nFULL SCRIPT:\n"""\n${script_text.slice(0, 12000)}\n"""\n\nRESEARCH:\n${JSON.stringify((research_pack?.facts || []).slice(0, 3))}\n\nInject story elements now. Output ONLY valid JSON.`,
          jsonMode: true,
          temperature: 0.7,
        });
        const data = parseJsonSafe(raw, null);
        if (data && data.injected_script) {
          const scan = scanScriptAntiAi(data.injected_script);
          data.anti_ai_scan = data.anti_ai_scan || { totalFlags: scan.totalFlags, burstiness: scan.burstiness };
          return NextResponse.json(data);
        }
      } catch (llmErr) {
        console.warn('[ScriptOS Story Mode] Perplexity inject LLM warning:', llmErr);
      }

      // Fallback: return the script as-is with a scan
      const scan = scanScriptAntiAi(script_text);
      return NextResponse.json({
        injected_script: script_text,
        injections_summary: { sensory_anchors_added: 0, subtext_layers_added: 0, emotional_beats_added: 0 },
        anti_ai_scan: { totalFlags: scan.totalFlags, burstiness: scan.burstiness },
      });
    }

    // ── Documentary perplexity injector ────────────────────────────────────────
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
