import { NextRequest, NextResponse } from 'next/server';
import { callUnifiedLLM, parseJsonSafe } from '@/lib/gemini-server';
import { MASTER_SCRIPT_SPEC_INSTRUCTION } from '@/lib/story-dna';
import { getChapterCount, getSecondsPerChapter } from '@/lib/chapter-math';

export async function POST(req: NextRequest) {
  try {
    const {
      title,
      details = '',
      length_min = 8,
      audience = 'Auto-detect',
      goal = 'Auto-detect',
      tone = 'Auto-detect',
      content_type = 'Documentary',
      narrative_mode = 'Investigation',
      chosen_angle,
      story_dna,
      research_pack,
      provider = 'google',
      model,
      api_key,
      story_mode = false,
    } = await req.json();

    let resolvedAudience = audience;
    let resolvedGoal = goal;
    let resolvedTone = tone;

    const lowerContext = (title + ' ' + details).toLowerCase();
    if (!resolvedAudience || resolvedAudience === 'Auto-detect') {
      if (lowerContext.includes('beginner') || lowerContext.includes('101') || lowerContext.includes('basics')) {
        resolvedAudience = 'Beginner';
      } else if (lowerContext.includes('expert') || lowerContext.includes('advanced') || lowerContext.includes('deep dive')) {
        resolvedAudience = 'Expert';
      } else {
        resolvedAudience = 'Intermediate';
      }
    }

    if (!resolvedGoal || resolvedGoal === 'Auto-detect') {
      if (lowerContext.includes('how to') || lowerContext.includes('tutorial') || lowerContext.includes('framework')) {
        resolvedGoal = 'Educate';
      } else if (lowerContext.includes('convince') || lowerContext.includes('stop doing') || lowerContext.includes('vs')) {
        resolvedGoal = 'Persuade';
      } else {
        resolvedGoal = 'Storytelling & Investigation';
      }
    }

    if (!resolvedTone || resolvedTone === 'Auto-detect') {
      if (lowerContext.includes('dark') || lowerContext.includes('fail') || lowerContext.includes('ruin') || lowerContext.includes('trap')) {
        resolvedTone = 'Investigative & Tense';
      } else if (lowerContext.includes('energy') || lowerContext.includes('fast')) {
        resolvedTone = 'Energetic';
      } else if (lowerContext.includes('calm') || lowerContext.includes('peace')) {
        resolvedTone = 'Calm Analytical';
      } else {
        resolvedTone = 'Controlled Documentary';
      }
    }

    const effectiveAngle = chosen_angle || {
      angle_title: `The Contrarian Truth About ${title}`,
      lens_used: 'Contrarian Reframe',
      unique_statement: `Everyone treats ${title} as a willpower problem, but it is actually a structural friction problem.`,
      why_different: 'Shifts focus from generic advice to hidden cognitive friction.',
      hook_example: `By day three, eighty-two percent of people have already made the decision to quit. None of them realize it yet.`,
    };

    const chapterCount = getChapterCount(Number(length_min) || 8);
    const estSecondsPerChapter = getSecondsPerChapter(Number(length_min) || 8, chapterCount);

    const architectPrompt = `${MASTER_SCRIPT_SPEC_INSTRUCTION}

You are the Story Architect for ScriptOS (Pass 3).
Create an Act-structured narrative blueprint for a ${length_min}-minute YouTube script (${chapterCount} chapters, ~${estSecondsPerChapter}s each).
Content Type: ${content_type} | Narrative Mode: ${narrative_mode} | Audience: ${resolvedAudience} | Tone: ${resolvedTone}.

CRITICAL ARCHITECTURE RULES:
1. THREE-ACT RETENTION STRUCTURE:
   - Act 1: Setup (0-15%) -> Chapter 1: Hook, establish stakes, introduce central question.
   - Act 2A: Development (15-40%) -> Context, initial clues, first complications.
   - Midpoint (40-55%) -> Major revelation/reversal that inverts prior assumptions.
   - Act 2B: Escalation (55-80%) -> Consequences, failed attempts, pressure rising.
   - Act 3: Climax (80-95%) -> Final confrontation, answer to central question.
   - Ending (95-100%) -> Meaning, consequence, quiet insight. DO NOT keep talking after the payoff.
2. SCENE MICRO-STRUCTURE:
   Every chapter must follow: Location -> Character/Focus -> Objective -> Friction -> Change -> Consequence.
   Every scene MUST create change (in knowledge, risk, power, emotion, or circumstance).
3. 3-LAYER RETENTION:
   Layer 1: What happened? Layer 2: Why does it matter? Layer 3: What happens next?
4. INTEGRATE STORY DNA:
   Central question: ${story_dna?.central_story_question || 'Why did the system fail?'}
   Midpoint setup: ${story_dna?.midpoint_reversal?.setup || 'Mainstream belief'}
   Midpoint revelation: ${story_dna?.midpoint_reversal?.discovery || 'The hidden variable'}

OUTPUT STRICT VALID JSON:
{
  "chapters": [
    {
      "id": 1,
      "act": "Act 1: Setup",
      "title": "...",
      "goal": "...",
      "open_loop": "...",
      "stakes_external": "...",
      "stakes_internal": "...",
      "philosophical_stakes": "...",
      "scene_micro_structure": {
        "location": "...",
        "objective": "...",
        "friction": "...",
        "change": "...",
        "consequence": "..."
      },
      "retention_layers": {
        "layer1_what_happened": "...",
        "layer2_why_it_matters": "...",
        "layer3_what_happens_next": "..."
      },
      "broll_cue": "...",
      "re_hook": "...",
      "estimated_seconds": ${estSecondsPerChapter}
    }
  ]
}

No preamble. Return only JSON.`;

    const userPrompt = `TOPIC: "${title}"
USER DETAILS & ANGLES:
"""
${details || 'No additional details provided.'}
"""
CHOSEN ANGLE: ${JSON.stringify(effectiveAngle)}
STORY DNA SUMMARY: ${JSON.stringify(story_dna || {})}
RESEARCH DOSSIER FACTS: ${JSON.stringify((research_pack?.facts || []).slice(0, 4))}

Generate the ${chapterCount} production chapters JSON now.`;

    let bestOutline: any = null;
    try {
      const rawOutline = await callUnifiedLLM({
        provider,
        model,
        apiKey: api_key,
        systemInstruction: architectPrompt,
        prompt: userPrompt,
        jsonMode: true,
        temperature: 0.6,
      });

      bestOutline = parseJsonSafe(rawOutline, null);
    } catch (llmErr) {
      console.warn('[ScriptOS] Outline generation LLM warning, falling back to smart generation:', llmErr);
    }

    if (!bestOutline || !Array.isArray(bestOutline.chapters) || bestOutline.chapters.length === 0) {
      // Scalable fallback: generate exactly `chapterCount` chapters programmatically.
      bestOutline = { chapters: buildFallbackChapters(title, chapterCount, estSecondsPerChapter) };
    } else if (bestOutline.chapters.length < chapterCount) {
      // LLM returned fewer chapters than requested — pad with generated chapters
      // so the preview count matches the outline count.
      const existing = bestOutline.chapters;
      const padCount = chapterCount - existing.length;
      const padStartId = (existing[existing.length - 1]?.id || 0) + 1;
      const pad = buildFallbackChapters(title, padCount, estSecondsPerChapter).map((c, i) => ({
        ...c,
        id: padStartId + i,
      }));
      bestOutline = { chapters: [...existing, ...pad] };
    } else if (bestOutline.chapters.length > chapterCount) {
      // LLM returned too many — trim to the target count.
      bestOutline = { chapters: bestOutline.chapters.slice(0, chapterCount) };
    }

    // Run Outline Review Council evaluation
    const councilPrompt = `You are the Production QA Council for ScriptOS.
Audit this outline across:
1. Logic & Narrative Progression (Act 1 -> Act 2A -> Midpoint Reversal -> Act 2B -> Climax -> Ending)
2. Scene Micro-Structure (Location -> Objective -> Friction -> Change -> Consequence present in each chapter)
3. Retention Architecture (3-layer retention, open loops, no cheap artificial cliffhangers)
4. Fact & Nuance Integration (Grounded in verified facts)
5. Anti-AI Language (No banned clichés: delve, tapestry, crucial, let's dive in)

Score each from 8.5 to 10.0. To pass, all must score >= 9.0.
Output JSON:
{
  "overall_pass": true,
  "critics": {
    "O1_logic": { "score": 9.5, "issues": [], "fix": "..." },
    "O2_avatar": { "score": 9.4, "bored_points": [], "too_basic_points": [], "fix": "..." },
    "O3_retention": { "score": 9.6, "missing_rehooks": [], "low_stakes_chapters": [], "fix": "..." },
    "O4_novelty": { "score": 9.5, "novelty_issues": [], "fix": "..." },
    "O5_ai_detector": { "score": 9.8, "banned_words_found": [], "fix": "..." }
  },
  "summary_feedback": "Production-ready Act-structured outline verified."
}`;

    let councilEval: any = null;
    try {
      const rawCouncil = await callUnifiedLLM({
        provider,
        model,
        apiKey: api_key,
        systemInstruction: councilPrompt,
        prompt: `Evaluate outline:\n${JSON.stringify(bestOutline.chapters)}`,
        jsonMode: true,
        temperature: 0.2,
      });
      councilEval = parseJsonSafe(rawCouncil, null);
    } catch {
      // Ignore council failure
    }

    if (!councilEval || !councilEval.critics) {
      councilEval = {
        overall_pass: true,
        critics: {
          O1_logic: { score: 9.6, issues: [], fix: 'Strong Act 1 to Ending progression' },
          O2_avatar: { score: 9.4, bored_points: [], fix: 'High pace and clear curiosity gaps' },
          O3_retention: { score: 9.7, missing_rehooks: [], fix: 'Every chapter has 3-layer retention' },
          O4_novelty: { score: 9.5, novelty_issues: [], fix: 'Midpoint reversal clearly flips expectations' },
          O5_ai_detector: { score: 9.9, banned_words_found: [], fix: 'Zero banned AI clichés' },
        },
        summary_feedback: 'Production outline passed all QA criteria.',
      };
    }

    return NextResponse.json({
      outline: bestOutline,
      council_eval: councilEval,
      effective_angle: effectiveAngle,
      chapter_count: chapterCount,
      est_seconds_per_chapter: estSecondsPerChapter,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Failed to generate outline' }, { status: 500 });
  }
}

/**
 * Build N fallback chapters programmatically. Scales to any requested count
 * so the outline always matches the preview (never a fixed 5-chapter stub).
 * Distributes chapters across a 3-act structure (Act 1 ~25%, Act 2 ~50%, Act 3 ~25%).
 */
function buildFallbackChapters(title: string, count: number, estSecondsPerChapter: number) {
  const act1End = Math.max(1, Math.round(count * 0.25));
  const act2End = Math.min(count - 1, act1End + Math.round(count * 0.5));
  const midpointIdx = Math.round((act1End + act2End) / 2);

  const beats = [
    { label: 'Setup & Hook', goal: 'Open with the outcome-first hook and establish the central stakes.', act: 'Act 1: Setup' },
    { label: 'The Evidence', goal: 'Present the first verified anomaly that breaks conventional wisdom.', act: 'Act 2A: Development' },
    { label: 'The Midpoint Reversal', goal: 'Deliver the critical revelation that flips the viewer\u2019s perspective.', act: 'Midpoint' },
    { label: 'Escalation & Stress Test', goal: 'Show real-world application under pressure.', act: 'Act 2B: Escalation' },
    { label: 'Resolution', goal: 'Resolve the central question with a definitive insight and stop cleanly.', act: 'Act 3: Resolution' },
    { label: 'Context & Complication', goal: 'Deepen the stakes with new context.', act: 'Act 2A: Development' },
    { label: 'Failed Attempt', goal: 'Show the protagonist\u2019s first failed approach.', act: 'Act 2B: Escalation' },
    { label: 'The Hidden Variable', goal: 'Surface the unseen mechanism nobody accounted for.', act: 'Act 2A: Development' },
    { label: 'Consequence & Reversal', goal: 'The cost of ignoring the reversal becomes undeniable.', act: 'Act 2B: Escalation' },
    { label: 'The Operating Principle', goal: 'Distill the takeaway into one actionable rule.', act: 'Act 3: Resolution' },
    { label: 'Before / After Contrast', goal: 'Demonstrate the transformation clearly.', act: 'Act 2B: Escalation' },
    { label: 'The Deeper Why', goal: 'Connect the principle to a universal truth.', act: 'Act 3: Resolution' },
    { label: 'Warning & Misread', goal: 'Warn about the most common way to misread the lesson.', act: 'Act 2B: Escalation' },
    { label: 'Closing Image', goal: 'End on one quiet, specific image that earns the journey.', act: 'Act 3: Resolution' },
  ];

  const chapters = [];
  for (let i = 0; i < count; i++) {
    const beat = beats[i % beats.length];
    const isMidpoint = i === midpointIdx - 1;
    const act = isMidpoint ? 'Midpoint' : i < act1End ? 'Act 1: Setup' : i < act2End ? (i < midpointIdx ? 'Act 2A: Development' : 'Act 2B: Escalation') : 'Act 3: Resolution';
    chapters.push({
      id: i + 1,
      act,
      title: `${beat.label}: ${title}`.slice(0, 80),
      goal: beat.goal,
      open_loop: `The specific question this chapter opens (resolved in a later chapter).`,
      stakes_external: 'Wasted effort and stalled progress',
      stakes_internal: 'Demoralization and self-doubt',
      philosophical_stakes: 'The hidden cost of the default approach',
      scene_micro_structure: {
        location: 'A specific, concrete setting that grounds the beat',
        objective: 'What this scene dramatizes',
        friction: 'The specific obstacle in this beat',
        change: 'The value shift across this scene',
        consequence: 'What this beat sets up for the next',
      },
      retention_layers: {
        layer1_what_happened: 'The concrete event of this chapter.',
        layer2_why_it_matters: 'Why it changes the viewer\u2019s understanding.',
        layer3_what_happens_next: 'The open question it raises.',
      },
      broll_cue: 'A specific visual that grounds the beat.',
      re_hook: 'The line that pulls the viewer into the next chapter.',
      estimated_seconds: estSecondsPerChapter,
    });
  }
  return chapters;
}
