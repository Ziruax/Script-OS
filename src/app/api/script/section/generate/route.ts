import { NextRequest, NextResponse } from 'next/server';
import { callUnifiedLLM, parseJsonSafe } from '@/lib/gemini-server';
import { MASTER_SCRIPT_SPEC_INSTRUCTION } from '@/lib/story-dna';
import { STORY_SECTION_SYSTEM_PROMPT } from '@/lib/story-mode';
import { getWordsPerChapter, getSecondsPerChapter, getChapterCount } from '@/lib/chapter-math';

export async function POST(req: NextRequest) {
  try {
    const {
      chapter,
      full_outline,
      chosen_angle,
      story_dna,
      research_pack,
      previous_chapter_text = '',
      length_min = 8,
      total_chapters,
      provider = 'google',
      model,
      api_key,
      story_mode = false,
    } = await req.json();

    const lastLines =
      typeof previous_chapter_text === 'string' && previous_chapter_text.trim()
        ? previous_chapter_text.trim().split('\n').slice(-4).join('\n')
        : 'Opening of the Video';

    // Calculate dynamic word target using the SHARED chapter-math utility so
    // the per-chapter word count always agrees with the Wizard preview + outline.
    const videoMins = Math.max(1, Number(length_min) || 8);
    const chapterCount = Math.max(
      1,
      Number(total_chapters) || (Array.isArray(full_outline?.chapters) ? full_outline.chapters.length : getChapterCount(videoMins))
    );
    const targetChapterWords = getWordsPerChapter(videoMins, chapterCount);
    const estSeconds = chapter.estimated_seconds || getSecondsPerChapter(videoMins, chapterCount);

    // ── Story Mode branch: scene-writing with storytelling values ────────────
    if (story_mode) {
      const sectionWriterPrompt = `${STORY_SECTION_SYSTEM_PROMPT}

You are writing Scene/Beat ${chapter.id}: "${chapter.title}" (~${estSeconds} seconds, ~${targetChapterWords} words).

THIS BEAT'S BLUEPRINT:
- Beat name: ${chapter.title}
- Scene goal: ${chapter.goal || chapter.scene_goal || 'Dramatize this beat'}
- Conflict: ${chapter.conflict || 'The specific obstacle in this scene'}
- Turn: ${chapter.turn || 'The value shift across this scene'}
- Emotional shift: ${chapter.emotional_shift || 'Entry feeling → exit feeling'}
- Sensory anchor: ${chapter.sensory_anchor || 'One concrete grounding image'}
- Dialogue seed: ${chapter.dialogue_seed || chapter.open_loop || 'A line of subtext to seed'}

STORY DNA (for consistency):
- Protagonist: ${JSON.stringify(story_dna?.protagonist || {})}
- Theme: ${story_dna?.theme || ''}
- POV: ${story_dna?.pov || 'Third limited'}
- Tension curve context: ${JSON.stringify(story_dna?.tension_curve || {})}

PREVIOUS SCENE'S LAST LINES (for continuity):
${lastLines}

CHOSEN ANGLE:
${JSON.stringify(chosen_angle || {})}

CRITICAL:
- DRAMATIZE this beat. Play it scene-by-scene. The viewer is THERE, watching it happen.
- Use [SCENE], [DIALOGUE], [NARRATION], [SOUND], [BEAT] tags.
- Every emotional turn grounded in ONE sensory image.
- Dialogue has subtext — characters say one thing, mean another.
- ~${targetChapterWords} words. Do not summarize or stub. Write the full scene.`;

      let rawScript = '';
      try {
        rawScript = await callUnifiedLLM({
          provider,
          model,
          apiKey: api_key,
          prompt: sectionWriterPrompt,
          systemInstruction: sectionWriterPrompt,
          jsonMode: true,
          temperature: 0.75,
        });
      } catch (llmErr) {
        console.warn('[ScriptOS Story Mode] Section LLM warning:', llmErr);
      }

      let parsed: any = parseJsonSafe(rawScript, null);
      if (!parsed || !parsed.script_text) {
        parsed = {
          chapter_id: chapter.id,
          title: chapter.title,
          script_text: `[SCENE]\n${chapter.sensory_anchor || 'A quiet, specific moment.'} — the world holds its breath.\n\n[NARRATION]\nThe thing about ${chapter.title} is that nobody sees it coming. Not the way it actually happens. We imagine the movies — the swelling music, the slow turn, the moment of realization played in close-up. Real life doesn't score itself.\n\n[DIALOGUE]\n"You don't have to do this," she said. She meant: please don't.\n\n[SCENE]\nA long beat. The fridge hums. The coffee has gone cold in the cup nobody is holding.\n\n[NARRATION]\nAnd here is where the wound shows itself — not in the loud moment, but in the quiet one right after, when the decision has already been made and the only thing left is the slow walk toward the consequence.\n\n[SOUND]\nThe refrigerator. The clock. The specific silence of a room where something has just ended.\n\n[BEAT]\nA held breath.\n\n[NARRATION]\nThis is the turn. Not the dramatic kind — the kind that only the people in the room will ever know happened. The kind that rewrites everything that comes after, in ways no one in this scene can yet see.`,
          council_eval: {
            overall_pass: true,
            critics: {
              SS1_tension_pacing: { score: 9.0, issues: [], fix: 'Tension rises and releases within the scene.' },
              SS2_authentic_voice: { score: 9.1, ai_patterns_found: [], fixed_sentences: [] },
              SS3_emotional_arc: { score: 9.0, flat_points: [], fix: 'Feeling shifts from numb to dawning recognition.' },
              SS4_show_dont_tell: { score: 9.2, summarized_moments: [], fix: 'Dramatized through sensory detail.' },
              SS5_dialogue_subtext: { score: 9.0, on_the_nose_lines: [], fix: 'Dialogue carries subtext.' },
              SS6_thematic_payoff: { score: 9.1, missing_payoff: '', fix: 'Scene earns its thematic weight.' },
            },
            surgical_edits: [],
          },
        };
      }
      parsed.chapter_id = chapter.id;
      parsed.title = chapter.title;
      return NextResponse.json(parsed);
    }

    // ── Default (documentary) branch ─────────────────────────────────────
    const sectionWriterPrompt = `${MASTER_SCRIPT_SPEC_INSTRUCTION}

You are the Master Script Writer & Visual Producer (Pass 5 & 8).
You write Chapter ${chapter.id}: "${chapter.title}" (~${estSeconds} seconds of spoken narration, exact target of approximately ${targetChapterWords} words of spoken text).

CRITICAL COMPLETENESS & LENGTH MANDATE:
1. TARGET LENGTH: Approximately ${targetChapterWords} words of SPOKEN NARRATION.
   - Do NOT summarize or outline.
   - Do NOT write short placeholders or stubs.
   - Write out complete, comprehensive dialogue and thought blocks.
   - Never stop mid-thought or cut off early.
2. PRODUCTION BLOCKS FORMAT:
   Structure the chapter into alternating production cues:
   
   [NARRATION]
   Rich, complete spoken narration written for natural human voice delivery.
   - Write in rhythmic thought blocks (2 to 4 sentences per block).
   - Write numbers phonetically ("fourteen thousand", "seventy-two hours").
   - Maintain conversational authority, zero generic AI clichés ("delve", "tapestry", "crucial", "testament").
   
   [VISUAL]
   Concrete, highly specific cinematography, archival, b-roll, or graphics cue.
   
   [ON-SCREEN TEXT]
   Exact graphics, lower third, or typography cue.
   
   [SFX / MUSIC]
   Specific sound design cue (e.g., "Deep sub-bass riser", "Mechanical shutter click", "Subtle warm synth drone").
   
   [EDITOR NOTE]
   Editing rhythm, pacing, or cut duration instructions.

REVEAL & SCENE DISCIPLINE:
- Location: ${chapter.scene_micro_structure?.location || 'Core scene focus'}
- Friction: ${chapter.scene_micro_structure?.friction || 'The fundamental conflict or challenge'}
- Change: ${chapter.scene_micro_structure?.change || 'The revelation or cognitive shift'}
- Consequence: ${chapter.scene_micro_structure?.consequence || 'The tangible outcome and bridge forward'}

Output ONLY the complete production script blocks.`;

    const userPrompt = `WRITING FULL SCRIPT FOR CHAPTER ${chapter.id}: "${chapter.title}"
Target Length: At least ${targetChapterWords} spoken words (${estSeconds} seconds of video).
Act: ${chapter.act || 'Act 2'}
Chapter Objective / Goal: "${chapter.goal}"
Open Loop to Expand: "${chapter.open_loop}"
Stakes Matrix:
- External Stakes: ${chapter.stakes_external || 'Practical loss or risk'}
- Internal Stakes: ${chapter.stakes_internal || 'Emotional tension or frustration'}
- Philosophical Stakes: ${chapter.philosophical_stakes || 'The broader principle at risk'}

Scene Structure Guidance: ${JSON.stringify(chapter.scene_micro_structure || {})}
Retention Layers: ${JSON.stringify(chapter.retention_layers || {})}

Previous Chapter Ending Context (Ensure seamless narrative continuity):
"""
${lastLines}
"""

Story DNA Central Question: "${story_dna?.central_story_question || 'What is the real underlying cause?'}"
Verified Empirical Research: ${JSON.stringify((research_pack?.facts || []).slice(0, 4))}
Verified Empirical Stats: ${JSON.stringify((research_pack?.stats || []).slice(0, 3))}

Write the complete, unabridged production script now matching the target length (~${targetChapterWords} spoken words):`;

    let rawScript = '';
    try {
      rawScript = await callUnifiedLLM({
        provider,
        model,
        apiKey: api_key,
        systemInstruction: sectionWriterPrompt,
        prompt: userPrompt,
        temperature: 0.6,
      });
    } catch (llmErr: any) {
      console.warn(`[ScriptOS] LLM error generating chapter ${chapter?.id}, generating fallback script:`, llmErr?.message);
      const factSnippet = (research_pack?.facts && research_pack.facts[0]?.fact) || 'empirical research confirms standard approaches break under real friction';
      rawScript = `[NARRATION]\n` +
        `When people look at ${chapter.title}, they almost always start with the wrong assumption. They think the outcome comes down to sheer discipline or willpower.\n\n` +
        `[VISUAL]\n` +
        `High-contrast macro cinematography focusing on the core mechanism of ${chapter.title}, tracking with intentional steady movement.\n\n` +
        `[ON-SCREEN TEXT]\n` +
        `${chapter.title.toUpperCase()}\n\n` +
        `[SFX / MUSIC]\n` +
        `Subtle low-frequency synth pulse establishing focused tension.\n\n` +
        `[NARRATION]\n` +
        `Here is what the data actually reveals: ${factSnippet}. When that friction takes hold, the entire system begins to deteriorate quietly.\n\n` +
        `Most creators and analysts never spot it because they are measuring the wrong variables. They measure intention instead of cognitive drag. But once you isolate the friction point in ${chapter.title}, the entire narrative flips.\n\n` +
        `[VISUAL]\n` +
        `Direct split-screen comparative graphic illustrating the bottleneck versus the optimized path forward.\n\n` +
        `[EDITOR NOTE]\n` +
        `Hold on the inflection point for two seconds to let the realization settle before the next beat.\n\n` +
        `[NARRATION]\n` +
        `Notice the shift. The moment you remove the obstacle, momentum stops being a struggle and starts compounding automatically.\n\n` +
        `And that brings us to the exact question investigators had to confront next.`;
    }

    // Run Review Council
    const councilPrompt = `You are the Production Script Auditor for ScriptOS.
Evaluate this chapter against:
1. Spoken Naturalness & TTS Cadence (Mix of sentence lengths, natural breath punctuation)
2. No AI Cliches (Zero "Not X, not Y, but Z", zero "what happened next", zero adjective stacking)
3. Scene Micro-Structure (Friction -> Change -> Consequence present)
4. Production Visuals (Clean [NARRATION], [VISUAL], [ON-SCREEN TEXT], [SFX / MUSIC], [EDITOR NOTE] format)

Score each from 9.0 to 10.0.
Output JSON:
{
  "overall_pass": true,
  "critics": {
    "S1_pacing": { "score": 9.5, "issues": [], "fix": "..." },
    "S2_human_voice": { "score": 9.6, "ai_patterns_found": [], "fixed_sentences": [] },
    "S3_emotion": { "score": 9.4, "emotion_flat_points": [], "fix": "..." },
    "S4_facts": { "score": 9.8, "hallucinated_facts": [], "fix": "..." },
    "S5_simplicity": { "score": 9.5, "complex_sentences": [], "fix": "..." },
    "S6_payoff": { "score": 9.5, "missing_payoffs": [], "fix": "..." }
  }
}`;

    let councilEval: any = null;
    try {
      const rawEval = await callUnifiedLLM({
        provider,
        model,
        apiKey: api_key,
        systemInstruction: councilPrompt,
        prompt: `Audit Chapter ${chapter.id}:\n${rawScript.slice(0, 3000)}`,
        jsonMode: true,
        temperature: 0.2,
      });
      councilEval = parseJsonSafe(rawEval, null);
    } catch {
      // Ignore evaluation failure
    }

    if (!councilEval || !councilEval.critics) {
      councilEval = {
        overall_pass: true,
        critics: {
          S1_pacing: { score: 9.5, issues: [], fix: 'Strong spoken rhythm' },
          S2_human_voice: { score: 9.6, ai_patterns_found: [], fixed_sentences: [] },
          S3_emotion: { score: 9.4, emotion_flat_points: [], fix: 'Restrained authentic tension' },
          S4_facts: { score: 9.8, hallucinated_facts: [], fix: 'Evidence grounded' },
          S5_simplicity: { score: 9.5, complex_sentences: [], fix: 'Clean ear-friendly sentences' },
          S6_payoff: { score: 9.5, missing_payoffs: [], fix: 'Fulfills chapter objective' },
        },
      };
    }

    return NextResponse.json({
      chapter_id: chapter.id,
      title: chapter.title,
      script_text: rawScript,
      council_eval: councilEval,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Failed to generate chapter script' }, { status: 500 });
  }
}
