import { NextRequest, NextResponse } from 'next/server';
import { callUnifiedLLM, parseJsonSafe } from '@/lib/gemini-server';

export async function POST(req: NextRequest) {
  try {
    const {
      title,
      details = '',
      provider = 'google',
      model,
      api_key,
    } = await req.json();

    if (!title && !details) {
      return NextResponse.json({
        audience: 'Intermediate',
        goal: 'Viral',
        tone: 'Cinematic',
        rationale: 'Default settings applied.',
      });
    }

    const systemPrompt = `You are the Audience & Narrative Tone Detector for ScriptOS.
Analyze the user's video topic/title and long detailed nuances/notes.
Infer the optimal configuration across 3 dimensions:

1. Audience Level: Choose ONE from:
   - "Beginner" (concept-explaining, foundational, zero prerequisite knowledge)
   - "Intermediate" (actionable frameworks, practitioners looking to optimize or avoid traps)
   - "Expert" (deep forensic analysis, highly technical or insider industry mechanics)

2. Primary Goal: Choose ONE from:
   - "Viral" (broad fascination, counter-intuitive premise, high tension and curiosity)
   - "Educate" (step-by-step masterclass, deep actionable blueprint)
   - "Persuade" (belief shift, dismantling common misconceptions, thesis defense)
   - "Entertain" (dramatic storytelling, high emotion, narrative arc)
   - "Sell" (solution pitch, high urgency product/service transformation)

3. Narrative Tone: Choose ONE from:
   - "Cinematic" (suspenseful, visual, evocative, dramatic pacing)
   - "Calm" (thoughtful, deep focus, contemplative, measured rhythm)
   - "Energetic" (fast-paced, punchy, high tempo, bucket brigade rich)
   - "Dark" (forensic investigative warning, uncovering hidden costs and threats)
   - "Funny" (witty, self-deprecating, sharp cultural observations)

Return ONLY a valid JSON object matching this schema:
{
  "audience": "Beginner" | "Intermediate" | "Expert",
  "goal": "Viral" | "Educate" | "Persuade" | "Entertain" | "Sell",
  "tone": "Cinematic" | "Calm" | "Energetic" | "Dark" | "Funny",
  "rationale": "One crisp sentence explaining why this combination best serves the user's specific nuances."
}`;

    const userPrompt = `Video Title: "${title || 'Untitled'}"
User's Detailed Nuances & Notes:
"""
${details || 'No additional details provided.'}
"""

Analyze the topic and details, and output strictly valid JSON with the detected audience, goal, tone, and rationale.`;

    const raw = await callUnifiedLLM({
      provider,
      model,
      apiKey: api_key,
      systemInstruction: systemPrompt,
      prompt: userPrompt,
      jsonMode: true,
      temperature: 0.3,
    });

    const parsed = parseJsonSafe(raw, null);

    if (parsed && parsed.audience && parsed.goal && parsed.tone) {
      return NextResponse.json({
        audience: parsed.audience,
        goal: parsed.goal,
        tone: parsed.tone,
        rationale: parsed.rationale || 'Auto-detected from your topic and detailed nuances.',
      });
    }

    // Heuristic fallback if LLM parse fails
    const lower = (title + ' ' + details).toLowerCase();
    let audience = 'Intermediate';
    if (lower.includes('for beginners') || lower.includes('101') || lower.includes('basics') || lower.includes('start from scratch')) {
      audience = 'Beginner';
    } else if (lower.includes('advanced') || lower.includes('algorithm') || lower.includes('code') || lower.includes('insider') || lower.includes('deep dive')) {
      audience = 'Expert';
    }

    let goal = 'Viral';
    if (lower.includes('how to') || lower.includes('tutorial') || lower.includes('guide') || lower.includes('protocol') || lower.includes('framework')) {
      goal = 'Educate';
    } else if (lower.includes('why') || lower.includes('truth') || lower.includes('lie') || lower.includes('myth') || lower.includes('exposed')) {
      goal = 'Viral';
    } else if (lower.includes('convince') || lower.includes('argument') || lower.includes('vs')) {
      goal = 'Persuade';
    }

    let tone = 'Cinematic';
    if (lower.includes('danger') || lower.includes('trap') || lower.includes('fail') || lower.includes('dark') || lower.includes('scam') || lower.includes('ruin')) {
      tone = 'Dark';
    } else if (lower.includes('quick') || lower.includes('fast') || lower.includes('stop') || lower.includes('hacks')) {
      tone = 'Energetic';
    } else if (lower.includes('philosophy') || lower.includes('peace') || lower.includes('mind') || lower.includes('meditation')) {
      tone = 'Calm';
    }

    return NextResponse.json({
      audience,
      goal,
      tone,
      rationale: `Detected from topic cues: ${audience} audience with ${goal} intent and ${tone} pacing.`,
    });
  } catch (err: any) {
    return NextResponse.json({
      audience: 'Intermediate',
      goal: 'Viral',
      tone: 'Cinematic',
      rationale: 'Applied standard high-retention baseline configuration.',
    });
  }
}
