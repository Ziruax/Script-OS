export type ContentType =
  | 'Documentary'
  | 'True crime'
  | 'Historical'
  | 'Business'
  | 'Technology'
  | 'Science'
  | 'Educational'
  | 'Explainer'
  | 'Personal story'
  | 'Workplace story'
  | 'Revenge story'
  | 'Mystery'
  | 'Investigative'
  | 'Commentary'
  | 'List'
  | 'Case study'
  | 'Biography'
  | 'News analysis'
  | 'Finance'
  | 'Health'
  | 'Other';

export type NarrativeMode =
  | 'Chronological'
  | 'Nonlinear'
  | 'Mystery-first'
  | 'Outcome-first'
  | 'Character-first'
  | 'Problem-first'
  | 'Investigation'
  | 'Transformation'
  | 'Conflict escalation'
  | 'Question-driven';

export type AudienceIntent =
  | 'Learn'
  | 'Understand'
  | 'Feel'
  | 'Discover'
  | 'Be shocked'
  | 'Solve'
  | 'Compare'
  | 'Avoid a mistake'
  | 'Become informed'
  | 'Follow a story';

export type EmotionalEngine =
  | 'Curiosity'
  | 'Suspense'
  | 'Fear'
  | 'Anger'
  | 'Empathy'
  | 'Surprise'
  | 'Hope'
  | 'Injustice'
  | 'Fascination'
  | 'Humor'
  | 'Admiration'
  | 'Disbelief';

export const CONTENT_TYPES: ContentType[] = [
  'Documentary',
  'True crime',
  'Historical',
  'Business',
  'Technology',
  'Science',
  'Educational',
  'Explainer',
  'Personal story',
  'Workplace story',
  'Revenge story',
  'Mystery',
  'Investigative',
  'Commentary',
  'List',
  'Case study',
  'Biography',
  'News analysis',
  'Finance',
  'Health',
  'Other',
];

export const NARRATIVE_MODES: NarrativeMode[] = [
  'Chronological',
  'Nonlinear',
  'Mystery-first',
  'Outcome-first',
  'Character-first',
  'Problem-first',
  'Investigation',
  'Transformation',
  'Conflict escalation',
  'Question-driven',
];

export const AUDIENCE_INTENTS: AudienceIntent[] = [
  'Learn',
  'Understand',
  'Feel',
  'Discover',
  'Be shocked',
  'Solve',
  'Compare',
  'Avoid a mistake',
  'Become informed',
  'Follow a story',
];

export const EMOTIONS: EmotionalEngine[] = [
  'Curiosity',
  'Suspense',
  'Fear',
  'Anger',
  'Empathy',
  'Surprise',
  'Hope',
  'Injustice',
  'Fascination',
  'Humor',
  'Admiration',
  'Disbelief',
];

export type HookStructureType =
  | 'Outcome-first'
  | 'Contradiction'
  | 'Unanswered consequence'
  | 'Specific mystery'
  | 'Dramatic moment'
  | 'Unexpected explanation'
  | 'Information asymmetry';

export interface SetupPayoffItem {
  setup?: string;
  setup_item?: string;
  purpose?: string;
  why_introduced?: string;
  payoff?: string;
  payoff_delivered?: string;
  chapter_introduced?: number;
  introduced_chapter?: number;
  chapter_resolved?: number;
  payoff_chapter?: number;
}

export interface RetentionCheckpoint {
  timestamp_min: number;
  type: 'Clue' | 'Reversal' | 'Discovery' | 'Conflict' | 'Unexpected consequence' | 'Important question' | 'Payoff';
  event: string;
}

export interface StoryDNA {
  content_type: ContentType;
  narrative_mode: NarrativeMode;
  audience_intent: AudienceIntent;
  emotional_engine: {
    primary: EmotionalEngine;
    secondary: EmotionalEngine[];
  };
  central_story_question: string;
  story_promise: {
    viewer_promise: string;
    curiosity_gap: string;
    emotional_promise: string;
    ending_payoff: string;
  };
  character_map?: {
    protagonist: string;
    external_goal: string;
    internal_need: string;
    fear: string;
    constraint: string;
    stakes: string;
    contradiction: string;
    antagonistic_force: string;
  };
  conflict_type: string;
  timeline_strategy: {
    mode: 'Chronological' | 'Nonlinear';
    rationale: string;
  };
  midpoint_reversal: {
    setup?: string;
    discovery?: string;
    new_interpretation?: string;
    false_victory_or_apparent_crisis?: string;
    true_realization_or_shift?: string;
    pivot_mechanism?: string;
    actual_truth_revealed?: string;
  };
  setup_payoff_ledger: SetupPayoffItem[];
  open_loops: {
    macro_loop: string;
    section_loops: Array<{
      chapter_id: number;
      loop_question: string;
      resolution_point: string;
    }>;
    micro_loops: Array<{
      description: string;
      resolved_in: string;
    }>;
  };
  retention_checkpoints: RetentionCheckpoint[];
  hook_strategy: {
    hook_type: HookStructureType;
    elements_used: string[];
    hook_script: string;
  };
  production_notes: {
    target_duration_min: number;
    estimated_word_count: number;
    visual_pace: string;
    music_arc: string;
  };
}

export interface QaCategoryScore {
  name: string;
  score: number;
  feedback: string;
}

export interface QaScorecard {
  total?: number; // 0 to 100
  overall_score?: number; // 0 to 100
  passed?: boolean; // >= 90
  pass?: boolean; // >= 90
  categories?: QaCategoryScore[];
  critical_flaws?: string[];
  action_items?: string[];
  scores?: {
    hook: number; // /10
    story_structure: number; // /10
    retention: number; // /15
    narrative_progression: number; // /10
    emotional_engagement: number; // /10
    information_quality: number; // /10
    clarity: number; // /10
    tts_naturalness: number; // /10
    originality: number; // /5
    visual_producibility: number; // /5
    ending_payoff: number; // /5
  };
  critiques?: {
    strengths: string[];
    weaknesses: string[];
    required_fixes: string[];
  };
}

/**
 * 95-Rule Master AI Instructions for Spoken YouTube Narration & Story Architecture
 */
export const MASTER_SCRIPT_SPEC_INSTRUCTION = `You are a world-class YouTube narrative writer, investigative researcher, and senior story editor operating under the Production-Ready Scriptwriting Specification.

CORE MISSION:
Transform the input premise into a complete, narratively coherent, emotionally engaging, factually responsible, TTS-ready YouTube script that maximizes viewer attention without artificial hype, repetitive hooks, fabricated information, or obvious AI patterns.

CRITICAL PRINCIPLES:
1. FIVE GOALS AT ONCE: Immediate attention, clear narrative progression, continuous curiosity, emotional/intellectual payoff, natural spoken delivery.
2. NO GENERIC AI PROSE: Ban "Not X. Not Y. But Z.", "little did they know", "what happened next", "everything changed", "shocking truth", "dark secret", "you won't believe", "but here's the thing", "journey", "at the heart of", "more than just".
3. SPECIFICITY BEATS ADJECTIVES: Never write "terrifying, shocking, unbelievable moment". Write what people actually did ("Nobody moved for several seconds").
4. SHOW VS TELL: Tell straightforward chronological transitions; SHOW decisions, emotion, conflict, and character choices.
5. WRITING FOR TTS:
   - Mix short, medium, and developing sentences for natural cadence.
   - Numbers written out phonetically when natural: "nineteen ninety-seven", "eight seventeen p.m."
   - Breathable punctuation; no dense parentheticals, no excessive semicolons.
6. AUDIO-VISUAL SCRIPT FORMAT:
   Every chapter must be formatted with distinct production blocks:
   [NARRATION]
   Spoken text only, written for the ear.
   
   [VISUAL]
   Specific camera, archival, or motion graphics direction.
   
   [ON-SCREEN TEXT]
   Exact textual overlay or graphic timestamp.
   
   [SFX / MUSIC]
   Targeted audio cues reinforcing realism, not melodramatic noise.
   
   [EDITOR NOTE]
   Cut pacing or pacing instruction.
7. SETUP & PAYOFF DISCIPLINE:
   Every introduced clue, document, fear, or anomaly must receive a payoff.
8. MIDPOINT RULE:
   The midpoint must meaningfully alter the viewer's interpretation (not just "things got worse", but "what we thought was happening was completely wrong").
9. RESEARCH HIERARCHY:
   Never invent missing facts. Tier 1 (Official records, academic research) > Tier 2 (Reputable journalism) > Tier 3 (Books) > Tier 4 (Reddit/user stories). If uncertain, state as uncertain.`;
