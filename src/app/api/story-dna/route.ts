import { NextRequest, NextResponse } from 'next/server';
import { callUnifiedLLM, parseJsonSafe } from '@/lib/gemini-server';
import { MASTER_SCRIPT_SPEC_INSTRUCTION, StoryDNA } from '@/lib/story-dna';

export async function POST(req: NextRequest) {
  try {
    const {
      title,
      details = '',
      length_min = 15,
      content_type = 'Documentary',
      narrative_mode = 'Investigation',
      audience_intent = 'Understand',
      emotional_engine = 'Curiosity',
      secondary_emotions = ['Suspense'],
      research_pack,
      provider = 'google',
      model,
      api_key,
    } = await req.json();

    const systemPrompt = `${MASTER_SCRIPT_SPEC_INSTRUCTION}

You are the Master Story Strategist for ScriptOS (Pass 1).
Your sole job is to formulate the complete "STORY DNA" blueprint for a production-ready YouTube script.

STRICT BLUEPRINT REQUIREMENTS:
1. CENTRAL STORY QUESTION: Exactly ONE dominant question that the entire video progressively answers.
2. STORY PROMISE:
   - Viewer promise: What will they understand, experience, or solve?
   - Curiosity gap: What specific information is deliberately withheld temporarily?
   - Emotional promise: What emotional arc will they feel?
   - Ending payoff: What final revelation makes the journey worthwhile?
3. MIDPOINT REVERSAL (40-55%):
   The story MUST NOT just get "more difficult". A fundamental revelation or new interpretation must invert what everyone previously assumed.
4. SETUP / PAYOFF LEDGER:
   Define 4-6 specific narrative setups that will pay off later (e.g. strange email, missing transaction, subtle character fear, anomaly).
5. 3-LAYER LOOP HIERARCHY:
   - Macro loop: Main question of the whole video.
   - Section loops: 4-6 chapter-level questions.
   - Micro loops: 3-4 local paragraph tension points.
6. RETENTION CHECKPOINTS:
   Schedule a meaningful narrative event (clue, conflict, unexpected consequence, reversal, payoff) every 1.5 to 3 minutes.
7. HOOK ENGINE:
   Choose from: 'Outcome-first' | 'Contradiction' | 'Unanswered consequence' | 'Specific mystery' | 'Dramatic moment' | 'Unexpected explanation' | 'Information asymmetry'.
   Must contain at least two of: Specificity, Contradiction, Stakes, Mystery, Unanswered question, Unexpected consequence, Emotional tension, Information gap.
   NO AI HYPE OR ADJECTIVE STACKING.

OUTPUT FORMAT: Strict valid JSON matching the StoryDNA schema:
{
  "content_type": "${content_type}",
  "narrative_mode": "${narrative_mode}",
  "audience_intent": "${audience_intent}",
  "emotional_engine": {
    "primary": "${emotional_engine}",
    "secondary": ["${secondary_emotions[0] || 'Suspense'}"]
  },
  "central_story_question": "...",
  "story_promise": {
    "viewer_promise": "...",
    "curiosity_gap": "...",
    "emotional_promise": "...",
    "ending_payoff": "..."
  },
  "character_map": {
    "protagonist": "...",
    "external_goal": "...",
    "internal_need": "...",
    "fear": "...",
    "constraint": "...",
    "stakes": "...",
    "contradiction": "...",
    "antagonistic_force": "..."
  },
  "conflict_type": "Person vs ...",
  "timeline_strategy": {
    "mode": "Nonlinear",
    "rationale": "..."
  },
  "midpoint_reversal": {
    "setup": "...",
    "discovery": "...",
    "new_interpretation": "..."
  },
  "setup_payoff_ledger": [
    {
      "setup": "...",
      "purpose": "...",
      "payoff": "...",
      "chapter_introduced": 1,
      "chapter_resolved": 4
    }
  ],
  "open_loops": {
    "macro_loop": "...",
    "section_loops": [
      {
        "chapter_id": 1,
        "loop_question": "...",
        "resolution_point": "..."
      }
    ],
    "micro_loops": [
      {
        "description": "...",
        "resolved_in": "..."
      }
    ]
  },
  "retention_checkpoints": [
    {
      "timestamp_min": 1.5,
      "type": "Clue",
      "event": "..."
    }
  ],
  "hook_strategy": {
    "hook_type": "Outcome-first",
    "elements_used": ["Specificity", "Contradiction", "Stakes"],
    "hook_script": "..."
  },
  "production_notes": {
    "target_duration_min": ${Number(length_min) || 15},
    "estimated_word_count": ${Math.round((Number(length_min) || 15) * 155)},
    "visual_pace": "Documentary archival & deliberate pacing",
    "music_arc": "Curiosity ambient -> tension build -> revelation lift -> quiet reflective outro"
  }
}

No preamble. Return only JSON.`;

    const userPrompt = `TOPIC: "${title}"
USER DETAILS & ANGLES:
"""
${details || 'No additional details provided.'}
"""
LENGTH: ${length_min} minutes
CONTENT TYPE: ${content_type}
NARRATIVE MODE: ${narrative_mode}
AUDIENCE INTENT: ${audience_intent}
PRIMARY EMOTIONAL ENGINE: ${emotional_engine}

VERIFIED RESEARCH DOSSIER AVAILABLE:
${JSON.stringify((research_pack?.facts || []).slice(0, 5))}
${JSON.stringify((research_pack?.human_stories || []).slice(0, 3))}

Architect the full, production-ready STORY DNA now.`;

    const raw = await callUnifiedLLM({
      provider,
      model,
      apiKey: api_key,
      prompt: userPrompt,
      systemInstruction: systemPrompt,
      jsonMode: true,
      temperature: 0.5,
    });

    const parsed: StoryDNA = parseJsonSafe(raw, null);

    if (!parsed || !parsed.central_story_question) {
      // Robust default Story DNA
      const estWords = Math.round((Number(length_min) || 15) * 155);
      const fallbackDna: StoryDNA = {
        content_type: content_type as any,
        narrative_mode: narrative_mode as any,
        audience_intent: audience_intent as any,
        emotional_engine: {
          primary: emotional_engine as any,
          secondary: ['Fascination', 'Suspense'] as any,
        },
        central_story_question: `Why did the conventional system fail, and what was the hidden variable nobody accounted for?`,
        story_promise: {
          viewer_promise: `Understand the hidden mechanism behind ${title} and why the standard advice guarantees failure.`,
          curiosity_gap: `The specific psychological friction that was discovered only after looking at the failed data.`,
          emotional_promise: `Relief and clarity from realizing failure was structural, not personal.`,
          ending_payoff: `A definitive, counter-intuitive operating principle that permanently replaces willpower.`,
        },
        character_map: {
          protagonist: `The seeker or investigator confronting the breakdown of ${title}`,
          external_goal: `To achieve lasting execution without burnout`,
          internal_need: `To abandon reliance on raw willpower and accept human cognitive limits`,
          fear: `That they are fundamentally incapable of consistency`,
          constraint: `A daily environment saturated with dopamine triggers and switching friction`,
          stakes: `Years of wasted potential and repeated demoralizing collapse`,
          contradiction: `Intensely motivated in theory, paralyzed in practice`,
          antagonistic_force: `Industrial productivity dogmas and cognitive friction`,
        },
        conflict_type: 'Person vs System',
        timeline_strategy: {
          mode: 'Nonlinear',
          rationale: 'Begin at the point of collapse to hook attention, then step back to trace the invisible origin.',
        },
        midpoint_reversal: {
          setup: 'Everyone assumed the problem was lack of discipline and motivation.',
          discovery: 'Auditing the neurological data revealed dopamine depletion occurs automatically within 72 hours under friction.',
          new_interpretation: 'The people who succeeded never had more discipline—they simply eliminated the decision point.',
        },
        setup_payoff_ledger: [
          {
            setup: 'The 72-hour cognitive friction threshold',
            purpose: 'Establish why streaks break predictably',
            payoff: 'Reveals the 60-second micro-loop in Chapter 4',
            chapter_introduced: 1,
            chapter_resolved: 4,
          },
          {
            setup: 'The anonymous creator who posted 47 days to zero views',
            purpose: 'Emotional human grounding of despair',
            payoff: 'Their 4-word opening fix explained in Chapter 5',
            chapter_introduced: 2,
            chapter_resolved: 5,
          },
        ],
        open_loops: {
          macro_loop: `How did the 1% bypass the friction that traps 99% of people?`,
          section_loops: [
            {
              chapter_id: 1,
              loop_question: `What happened on Day 3 that doomed the attempt before it even started?`,
              resolution_point: `The dopamine switching cost payoff`,
            },
          ],
          micro_loops: [
            {
              description: `The anomaly in the lab data`,
              resolved_in: `Paragraph 4`,
            },
          ],
        },
        retention_checkpoints: [
          { timestamp_min: 1.5, type: 'Clue', event: 'The 72-hour cliff introduced' },
          { timestamp_min: 4.0, type: 'Discovery', event: 'The willpower myth dismantled with empirical study' },
          { timestamp_min: 7.5, type: 'Reversal', event: 'The Midpoint Reversal: why trying harder accelerates failure' },
          { timestamp_min: 11.0, type: 'Conflict', event: 'The friction test applied to modern daily routines' },
          { timestamp_min: 14.0, type: 'Payoff', event: 'The definitive architectural rule for permanent automaticity' },
        ],
        hook_strategy: {
          hook_type: 'Outcome-first',
          elements_used: ['Specificity', 'Contradiction', 'Stakes'],
          hook_script: `By day three, eighty-two percent of people have already made the decision to quit. The strange part is, none of them realize it yet.`,
        },
        production_notes: {
          target_duration_min: Number(length_min) || 15,
          estimated_word_count: estWords,
          visual_pace: 'Controlled documentary tension',
          music_arc: 'Curiosity ambient -> investigative pulse -> reflective payoff',
        },
      };
      return NextResponse.json(fallbackDna);
    }

    return NextResponse.json(parsed);
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || 'Failed to generate Story DNA' },
      { status: 500 }
    );
  }
}
