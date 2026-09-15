/**
 * ScriptOS Story Mode — a distinct methodology for storytelling videos.
 *
 * The default pipeline is tuned for documentary / investigation / explainer
 * videos (curiosity gaps, retention hooks, contrarian angles, banned-AI-word
 * burstiness). Storytelling videos have DIFFERENT VALUES and STAKES:
 *
 *   - VALUES:    character, emotion, theme, subtext, sensory detail, catharsis
 *   - STAKES:    personal / emotional / relational (not informational)
 *   - STRUCTURE: scenes + 3-act arc (not chapters + retention checkpoints)
 *   - SUCCESS:   "Did I feel something?" (not "Did I learn something?")
 *
 * This file holds the storytelling-specific DNA schema, the 6 story lenses
 * (replacing the 6 documentary lenses), the 3-act beat-sheet outline format,
 * and the story-council criteria (replacing the documentary O1-O5 / S1-S6).
 *
 * API routes branch on `story_mode` and use these definitions when it's on.
 */

// ───────────────────────────────────────────────────────────────────────────
// Story DNA (storytelling) — replaces the documentary StoryDNA when story_mode
// ───────────────────────────────────────────────────────────────────────────

export interface StoryModeDNA {
  /** The protagonist — a full character, not a "seeker". */
  protagonist: {
    name: string;
    description: string;
    core_wound: string;          // the unhealed hurt driving them
    conscious_desire: string;    // what they THINK they want
    unconscious_need: string;    // what they actually need (the dramatic irony gap)
    flaw: string;                // the trait that keeps them from the need
    voice: string;               // their distinct speech pattern + vocabulary
  };
  /** The "so what" — the universal truth this story argues. */
  theme: string;
  /** Personal/emotional stakes — what they gain or lose on a human level. */
  stakes: {
    personal: string;            // what the protagonist stands to lose internally
    relational: string;          // what they stand to lose in a relationship
    existential: string;         // what it means for who they become
  };
  /** The dramatic engine — want vs need is the core irony. */
  dramatic_engine: string;
  /** Three-act structure breakdown. */
  three_act_structure: {
    act1_setup: {
      ordinary_world: string;
      inciting_incident: string;
      refusal: string;
      decision: string;
    };
    act2_confrontation: {
      rising_action: string[];
      midpoint_revelation: string;
      dark_night: string;
      climax: string;
    };
    act3_resolution: {
      falling_action: string;
      resolution: string;
      transformation: string;     // how the protagonist has changed
    };
  };
  /** The protagonist's internal feeling curve across the story. */
  emotional_arc: Array<{ act: 1 | 2 | 3; beat: string; feeling: string }>;
  /** 3-5 concrete sensory images that ground the story. */
  sensory_anchors: string[];
  /** Moments to dramatize (show) vs summarize (tell). */
  show_vs_tell: {
    dramatize: string[];   // scenes to play out beat-by-beat
    summarize: string[];   // transitions to compress
  };
  /** The POV + narrative distance. */
  pov: 'First person' | 'Third limited' | 'Third omniscient' | 'Second person';
  /** The dramatic tension curve — where it peaks, where it breathes. */
  tension_curve: {
    opening: string;
    rising: string;
    climax: string;
    release: string;
  };
  /** Hook strategy — story hooks are different (emotional, not informational). */
  hook_strategy: {
    hook_type: 'In media res' | 'Mystery' | 'Promise' | 'Stakes' | 'Character';
    opening_image: string;
    hook_script: string;
  };
  production_notes: {
    target_duration_min: number;
    scene_count: number;
    visual_style: string;
    sound_design: string;
  };
}

// ───────────────────────────────────────────────────────────────────────────
// The 6 Story Lenses — replace the 6 documentary lenses when story_mode
// ───────────────────────────────────────────────────────────────────────────

export const STORY_LENSES = [
  {
    name: 'The Wound Lens',
    principle: 'Start from the protagonist\'s unhealed wound, not the topic. Every choice the character makes is a reaction to that wound. The story is the wound finally being addressed (or not).',
    application: 'Surface the wound in Act 1, let it drive the worst choices in Act 2, and resolve it (heal, accept, or tragically fail) by the climax.',
  },
  {
    name: 'The Want vs Need Lens',
    principle: 'The conscious desire (what they chase) is always the wrong target. The unconscious need (what they actually require) is hidden behind it. The dramatic engine is the gap between them closing — or not.',
    application: 'Make the want explicit and tangible. Make the need invisible until the midpoint revelation forces it into view. The climax is the moment they choose need over want (or tragically choose want).',
  },
  {
    name: 'The Sensory Anchor Lens',
    principle: 'Every abstract emotional beat must be grounded in ONE concrete sensory image the viewer can see, hear, smell, taste, or feel. Abstraction is the enemy of feeling.',
    application: 'For each major emotional turn, pick a single sensory anchor (the cold coffee cup, the hum of the fridge, the smell of rain on hot asphalt) and return to it as a motif.',
  },
  {
    name: 'The Subtext Lens',
    principle: 'Real people rarely say what they mean. Write dialogue where characters say one thing and mean another. The gap between the spoken and the meant is where emotion lives.',
    application: 'In every dialogue scene, identify what each character wants, what they\'re hiding, and what they\'re afraid of. Then write the line that reveals none of it directly.',
  },
  {
    name: 'The Reversal Lens',
    principle: 'A story without a reversal is a chronology. Engineer the specific moment where the protagonist\'s foundational assumption inverts — the thing they believed about themselves, the world, or the goal turns out to be the obstacle.',
    application: 'Place the reversal at the midpoint. Make it come from the protagonist\'s own actions (they earned the revelation by doing). Make the new truth uncomfortable but undeniable.',
  },
  {
    name: 'The Catharsis Lens',
    principle: 'A storytelling video is not a list of facts ending with a summary. It builds to an emotional release the viewer has earned by sitting with the tension. The payoff is feeling, not information.',
    application: 'Identify the specific emotion the viewer should feel at the climax (relief, grief, joy, recognition, righteous anger). Earn it through 75%+ of rising tension. Deliver it in one quiet, specific beat — not a speech.',
  },
];

// ───────────────────────────────────────────────────────────────────────────
// Story Outline — 3-act beat sheet (scenes, not chapters)
// ───────────────────────────────────────────────────────────────────────────

export interface StoryBeat {
  id: number;
  act: 1 | 2 | 3;
  beat_name: string;             // e.g. "Inciting Incident", "Midpoint Reversal"
  scene_goal: string;            // what this scene dramatizes
  conflict: string;              // the specific obstacle/tension in this scene
  turn: string;                  // how the scene turns (the value shift)
  emotional_shift: string;       // the feeling change across this scene
  sensory_anchor: string;        // the concrete grounding image
  dialogue_seed: string;         // a line of dialogue or subtext cue to seed
  estimated_seconds: number;
}

export interface StoryOutline {
  beats: StoryBeat[];
}

// ───────────────────────────────────────────────────────────────────────────
// Story Council — replaces the documentary O1-O5 (outline) + S1-S6 (script)
// ───────────────────────────────────────────────────────────────────────────

export interface StoryOutlineCouncilEval {
  overall_pass: boolean;
  critics: {
    SO1_arc?: { score: number; issues?: string[]; fix?: string };        // 3-act structure integrity
    SO2_stakes?: { score: number; weak_stakes_beats?: number[]; fix?: string };  // personal stakes present
    SO3_reversal?: { score: number; missing_reversal?: boolean; fix?: string };  // midpoint inverts assumption
    SO4_sensory?: { score: number; abstract_beats?: number[]; fix?: string };   // sensory anchors present
    SO5_subtext?: { score: number; on_the_nose_beats?: number[]; fix?: string }; // dialogue has subtext
  };
  summary_feedback?: string;
}

export interface StoryScriptCouncilEval {
  overall_pass: boolean;
  critics: {
    SS1_tension_pacing?: { score: number; issues?: string[]; fix?: string };     // tension curve rises/falls correctly
    SS2_authentic_voice?: { score: number; ai_patterns_found?: string[]; fixed_sentences?: Array<{ original: string; replacement: string }> };
    SS3_emotional_arc?: { score: number; flat_points?: string[]; fix?: string };  // feeling changes across scene
    SS4_show_dont_tell?: { score: number; summarized_moments?: string[]; fix?: string }; // dramatized, not summarized
    SS5_dialogue_subtext?: { score: number; on_the_nose_lines?: string[]; fix?: string }; // subtext + authentic speech
    SS6_thematic_payoff?: { score: number; missing_payoff?: string; fix?: string }; // earns the "so what"
  };
  surgical_edits?: Array<{ find: string; replace: string }>;
}

// ───────────────────────────────────────────────────────────────────────────
// System prompt fragments — used by the API routes when story_mode is on
// ───────────────────────────────────────────────────────────────────────────

export const STORY_DNA_SYSTEM_PROMPT = `You are the Master Story Strategist for ScriptOS Story Mode.
Your sole job is to architect a STORYTELLING blueprint — not a documentary, not an explainer, not a retention-optimized informational script. This is a story with a protagonist, a wound, a want that masks a need, and an emotional arc.

STORYTELLING VALUES (different from documentary):
- CHARACTER over TOPIC: the protagonist's internal change IS the story.
- EMOTION over INFORMATION: the goal is to make the viewer FEEL something, not learn something.
- STAKES are PERSONAL/EMOTIONAL, not informational — what does the protagonist lose on a human level?
- SHOW over TELL: dramatize, don't summarize. Sensory detail over abstraction.
- SUBTEXT over STATEMENT: characters say one thing and mean another.
- CATHARSIS over SUMMARY: the ending is an earned emotional release, not a recap.

STRICT BLUEPRINT REQUIREMENTS:
1. PROTAGONIST: a full character with a core_wound, a conscious_desire (what they chase), an unconscious_need (what they actually require), a flaw, and a distinct voice.
2. THEME: the "so what" — the universal truth this story argues (one sentence).
3. STAKES: personal, relational, and existential — not informational.
4. DRAMATIC ENGINE: the gap between want and need is the engine. It must close (or tragically fail to).
5. THREE-ACT STRUCTURE: Act 1 (setup: ordinary world, inciting incident, refusal, decision), Act 2 (confrontation: rising action, midpoint revelation, dark night, climax), Act 3 (resolution: falling action, resolution, transformation).
6. EMOTIONAL ARC: the protagonist's feeling must CHANGE across each act — no flat stretches.
7. SENSORY ANCHORS: 3-5 concrete images that ground the story (sight, sound, smell, touch, taste).
8. SHOW VS TELL: explicit dramatize vs summarize moments.
9. POV: the narrative distance (first person, third limited, etc.).
10. TENSION CURVE: opening, rising, climax, release — map the dramatic tension.
11. HOOK: an EMOTIONAL hook (in media res, mystery, promise, stakes, or character) — NOT a curiosity-gap or "outcome-first" information hook. Include an opening image.

Output ONLY valid JSON matching the StoryModeDNA schema.`;

export const STORY_ANGLES_SYSTEM_PROMPT = `You are the Story Perspective Engine for ScriptOS Story Mode.
Your mandate: apply one of these 6 STORYTELLING lenses (NOT the documentary lenses) to generate 3 distinct story angles. The documentary lenses (Contrarian Reframe, Unseen Cost, etc.) are WRONG for storytelling — they optimize for informational retention, not emotional truth.

THE 6 STORY LENSES:
${STORY_LENSES.map((l, i) => `${i + 1}. ${l.name}: ${l.principle}\n   Application: ${l.application}`).join('\n\n')}

MANDATORY: weave the user's specific nuances (characters, setting, events) directly into the 3 generated angles. Do not output generic cliches.

Generate EXACTLY 3 distinct story angles. Each angle picks ONE lens as primary.
Return ONLY valid JSON array with 3 objects:
[
  {
    "angle_title": "Short evocative title",
    "lens_used": "One of the 6 story lenses above",
    "protagonist_wound": "The specific unhealed hurt driving this angle",
    "want_vs_need": "The conscious desire masking the unconscious need",
    "emotional_promise": "The specific feeling the viewer will earn by the end",
    "opening_image": "The concrete sensory image the story opens on"
  }
]`;

export const STORY_OUTLINE_SYSTEM_PROMPT = `You are the Story Outline Architect for ScriptOS Story Mode.
Your job: build a 3-ACT BEAT SHEET (scenes, not retention chapters). Storytelling structure is fundamentally different from documentary chapter structure.

STORY BEAT REQUIREMENTS:
- Each beat is a SCENE, not a "chapter" with a "goal" and "open loop".
- Every beat has: a beat_name (e.g. Inciting Incident, Midpoint Reversal), a scene_goal (what this dramatizes), a conflict (the specific obstacle), a turn (the value shift), an emotional_shift (the feeling change), a sensory_anchor (one concrete grounding image), and a dialogue_seed (a line of subtext to seed).
- ACT 1 (≈25% of runtime): Ordinary World, Inciting Incident, Refusal, Decision.
- ACT 2 (≈50%): Rising Action (2-3 beats), Midpoint Revelation, Dark Night, Climax.
- ACT 3 (≈25%): Falling Action, Resolution, Transformation.
- The midpoint MUST invert the protagonist's foundational assumption.
- Stakes are PERSONAL/EMOTIONAL — never informational.
- Show, don't tell. Every beat is dramatized, not summarized.

Output ONLY valid JSON:
{
  "outline": {
    "beats": [
      {
        "id": 1,
        "act": 1,
        "beat_name": "Ordinary World",
        "scene_goal": "...",
        "conflict": "...",
        "turn": "...",
        "emotional_shift": "...",
        "sensory_anchor": "...",
        "dialogue_seed": "...",
        "estimated_seconds": 45
      }
    ]
  },
  "council_eval": {
    "overall_pass": true,
    "critics": {
      "SO1_arc": { "score": 9.2, "issues": [], "fix": "" },
      "SO2_stakes": { "score": 9.0, "weak_stakes_beats": [], "fix": "" },
      "SO3_reversal": { "score": 9.1, "missing_reversal": false, "fix": "" },
      "SO4_sensory": { "score": 8.9, "abstract_beats": [], "fix": "" },
      "SO5_subtext": { "score": 9.0, "on_the_nose_beats": [], "fix": "" }
    },
    "summary_feedback": ""
  }
}`;

export const STORY_SECTION_SYSTEM_PROMPT = `You are the Scene Writer for ScriptOS Story Mode.
Write this SCENE with storytelling values — NOT documentary narration with [B-ROLL] and [NARRATION] tags.

STORY SCENE WRITING RULES:
1. DRAMATIZE, don't summarize. Play the scene beat-by-beat. The viewer is THERE.
2. SENSORY GROUNDING: anchor every emotional turn in one concrete sensory image (what they see, hear, smell, touch, taste). Abstraction kills feeling.
3. SUBTEXT DIALOGUE: characters say one thing and mean another. The gap between the spoken and the meant IS the emotion. Never write "on the nose" dialogue where characters state their feelings directly.
4. EMOTIONAL ARC: the feeling must CHANGE across this scene. Identify the entry emotion and the exit emotion.
5. TENSION: every scene needs a specific obstacle/tension. No tension = no scene.
6. SHOW THE WANT, HIDE THE NEED: the protagonist pursues their conscious desire; the unconscious need leaks through in gestures, avoidance, and what they DON'T say.
7. GRADE 6 SPOKEN WORD for any voiceover/narration, but dialogue should sound like the SPECIFIC character (their vocabulary, rhythm, education).

SCENE CUES (use these tags):
[NARRATION] — voiceover (only when dramatization is impossible)
[DIALOGUE] — character speech (with subtext)
[SCENE] — the sensory setting + action being dramatized
[SOUND] — diegetic sound design that carries emotion
[ON-SCREEN TEXT] — only for title cards / timestamps / documentary-style inserts
[BEAT] — a pause; silence carries weight

The Story Council will audit:
- SS1_tension_pacing: does tension rise/fall correctly?
- SS2_authentic_voice: does the protagonist sound like a real person (not AI)?
- SS3_emotional_arc: does feeling change across the scene?
- SS4_show_dont_tell: is it dramatized, not summarized?
- SS5_dialogue_subtext: is there subtext + authentic speech?
- SS6_thematic_payoff: does this scene earn its thematic weight?

Write the scene now. Output ONLY valid JSON:
{
  "chapter_id": <id>,
  "title": "<beat_name>",
  "script_text": "<the full scene with [NARRATION]/[DIALOGUE]/[SCENE]/[SOUND] tags>",
  "council_eval": {
    "overall_pass": true,
    "critics": {
      "SS1_tension_pacing": { "score": 9.0, "issues": [], "fix": "" },
      "SS2_authentic_voice": { "score": 9.1, "ai_patterns_found": [], "fixed_sentences": [] },
      "SS3_emotional_arc": { "score": 9.0, "flat_points": [], "fix": "" },
      "SS4_show_dont_tell": { "score": 9.2, "summarized_moments": [], "fix": "" },
      "SS5_dialogue_subtext": { "score": 9.0, "on_the_nose_lines": [], "fix": "" },
      "SS6_thematic_payoff": { "score": 9.1, "missing_payoff": "", "fix": "" }
    },
    "surgical_edits": []
  }
}`;
