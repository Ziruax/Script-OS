export interface BannedWordMatch {
  word: string;
  category: string;
  count: number;
  suggestedReplacement: string;
}

export interface AntiAiScanResult {
  totalFlags: number;
  aiRiskScore: number; // 0 - 100% (lower is better, <10% is human)
  isHumanPassing: boolean;
  matches: BannedWordMatch[];
  burstiness: {
    sentence_count: number;
    avg_words: number;
    std_dev: number;
    burstiness_score: number;
    is_human: boolean;
  };
}

export const BANNED_PATTERNS: Array<{
  phrase: string;
  category: 'Core AI Marker' | 'Filler Opening' | 'Hedge Phrase' | 'Overused Transition' | 'Intensifier' | 'Formal Closing';
  replacement: string;
}> = [
  // Core AI markers
  { phrase: 'delve into', category: 'Core AI Marker', replacement: 'look into' },
  { phrase: 'delve', category: 'Core AI Marker', replacement: 'dig' },
  { phrase: 'leverage', category: 'Core AI Marker', replacement: 'use' },
  { phrase: 'utilize', category: 'Core AI Marker', replacement: 'use' },
  { phrase: 'harness', category: 'Core AI Marker', replacement: 'tap into' },
  { phrase: 'underscore', category: 'Core AI Marker', replacement: 'highlight' },
  { phrase: 'foster', category: 'Core AI Marker', replacement: 'build' },
  { phrase: 'streamline', category: 'Core AI Marker', replacement: 'simplify' },
  { phrase: 'embark on a journey', category: 'Core AI Marker', replacement: 'start' },
  { phrase: 'embark on', category: 'Core AI Marker', replacement: 'start' },
  { phrase: 'embark', category: 'Core AI Marker', replacement: 'start' },
  { phrase: 'elevate', category: 'Core AI Marker', replacement: 'boost' },
  { phrase: 'tapestry', category: 'Core AI Marker', replacement: 'web' },
  { phrase: 'pivotal', category: 'Core AI Marker', replacement: 'huge' },
  { phrase: 'meticulous', category: 'Core AI Marker', replacement: 'careful' },
  { phrase: 'meticulously', category: 'Core AI Marker', replacement: 'carefully' },

  // Filler openings
  { phrase: "in today's digital landscape", category: 'Filler Opening', replacement: 'right now' },
  { phrase: "in today's world", category: 'Filler Opening', replacement: 'today' },
  { phrase: 'in the ever-evolving world of', category: 'Filler Opening', replacement: 'in' },
  { phrase: 'when it comes to', category: 'Filler Opening', replacement: 'with' },
  { phrase: "let's dive in", category: 'Filler Opening', replacement: 'look here' },
  { phrase: 'hey guys', category: 'Filler Opening', replacement: '' },

  // Hedge words
  { phrase: "it's important to note that", category: 'Hedge Phrase', replacement: 'remember' },
  { phrase: 'it is important to note that', category: 'Hedge Phrase', replacement: 'notice' },
  { phrase: 'it may be argued that', category: 'Hedge Phrase', replacement: 'some argue' },
  { phrase: 'it is essential to understand', category: 'Hedge Phrase', replacement: 'here is the deal' },
  { phrase: 'it is crucial to', category: 'Hedge Phrase', replacement: 'you must' },

  // Overused transitions
  { phrase: 'furthermore', category: 'Overused Transition', replacement: 'and' },
  { phrase: 'moreover', category: 'Overused Transition', replacement: 'plus' },
  { phrase: 'additionally', category: 'Overused Transition', replacement: 'also' },
  { phrase: 'consequently', category: 'Overused Transition', replacement: 'so' },
  { phrase: 'in conclusion', category: 'Overused Transition', replacement: 'bottom line' },

  // Intensifiers
  { phrase: 'crucial', category: 'Intensifier', replacement: 'key' },
  { phrase: 'vital', category: 'Intensifier', replacement: 'necessary' },
  { phrase: 'paramount', category: 'Intensifier', replacement: 'top priority' },
  { phrase: 'transformative', category: 'Intensifier', replacement: 'game-changing' },
  { phrase: 'comprehensive', category: 'Intensifier', replacement: 'complete' },
  { phrase: 'robust', category: 'Intensifier', replacement: 'tough' },
  { phrase: 'seamless', category: 'Intensifier', replacement: 'smooth' },

  // Formal closings
  { phrase: 'by following these steps', category: 'Formal Closing', replacement: 'with this system' },
  { phrase: 'at the end of the day', category: 'Formal Closing', replacement: 'ultimately' },
];

export function computeBurstinessScore(text?: string | null) {
  const safeText = typeof text === 'string' ? text : '';
  const sentences = safeText
    .split(/[.!?]+/)
    .map((s) => s.replace(/\[.*?\]/g, '').trim())
    .filter((s) => s.length > 2);

  if (!sentences.length) {
    return { sentence_count: 0, avg_words: 0, std_dev: 0, burstiness_score: 0, is_human: false };
  }

  const lengths = sentences.map((s) => s.split(/\s+/).filter(Boolean).length);
  const avg = lengths.reduce((a, b) => a + b, 0) / lengths.length;
  const variance = lengths.reduce((a, b) => a + Math.pow(b - avg, 2), 0) / lengths.length;
  const stdDev = Math.sqrt(variance);

  // High standard deviation = human cadence (rhythmic mix of 3-word punches and 22-word narratives)
  const burstinessScore = Math.min(10.0, Math.max(1.0, Math.round((stdDev / 4.8) * 8.5 * 10) / 10));

  return {
    sentence_count: sentences.length,
    avg_words: Math.round(avg * 10) / 10,
    std_dev: Math.round(stdDev * 100) / 100,
    burstiness_score: burstinessScore,
    is_human: stdDev >= 4.0,
  };
}

export function scanScriptAntiAi(text?: string | null): AntiAiScanResult {
  const safeText = typeof text === 'string' ? text : '';
  const lower = safeText.toLowerCase();
  const matches: BannedWordMatch[] = [];
  let totalFlags = 0;

  for (const item of BANNED_PATTERNS) {
    const regex = new RegExp(`\\b${item.phrase}\\b`, 'gi');
    const count = (safeText.match(regex) || []).length;
    if (count > 0) {
      matches.push({
        word: item.phrase,
        category: item.category,
        count,
        suggestedReplacement: item.replacement,
      });
      totalFlags += count;
    }
  }

  const burstiness = computeBurstinessScore(safeText);

  // AI risk calculation: 0-100%
  // Lower is better. If totalFlags == 0 and burstiness > 7, risk is < 5%
  let risk = Math.min(100, totalFlags * 8.5);
  if (burstiness.std_dev < 3.2) risk += 20; // penalize robotic uniform sentence lengths
  else if (burstiness.std_dev >= 4.5) risk = Math.max(2, risk - 15); // reward high burstiness

  risk = Math.min(100, Math.max(2, Math.round(risk)));

  return {
    totalFlags,
    aiRiskScore: risk,
    isHumanPassing: risk < 10,
    matches,
    burstiness,
  };
}

export function autoSanitizeBannedWords(text?: string | null): { sanitizedText: string; replacementsCount: number } {
  let result = typeof text === 'string' ? text : '';
  let count = 0;

  for (const item of BANNED_PATTERNS) {
    const regex = new RegExp(`\\b${item.phrase}\\b`, 'gi');
    if (regex.test(result)) {
      const matches = result.match(regex) || [];
      count += matches.length;
      result = result.replace(regex, (match) => {
        // preserve casing
        if (!item.replacement) return '';
        if (match[0] === match[0].toUpperCase()) {
          return item.replacement.charAt(0).toUpperCase() + item.replacement.slice(1);
        }
        return item.replacement;
      });
    }
  }

  return { sanitizedText: result, replacementsCount: count };
}

export interface ScriptWordMetrics {
  totalWords: number;
  spokenWords: number;
  targetWords: number;
  spokenDurationSeconds: number;
  spokenDurationFormatted: string;
  targetProgressPercent: number;
  targetMinutes: number;
  chaptersBreakdown: Array<{
    chapterIndex: number;
    title: string;
    spokenWords: number;
    totalWords: number;
    durationFormatted: string;
  }>;
}

export function extractSpokenNarration(rawText?: string | null): string {
  if (!rawText) return '';
  return rawText
    .split('\n')
    .filter((line) => {
      const trimmed = line.trim();
      if (!trimmed) return false;
      if (trimmed.startsWith('[') && trimmed.endsWith(']')) return false;
      if (trimmed.startsWith('---') && trimmed.endsWith('---')) return false;
      if (trimmed.startsWith('#')) return false;
      return true;
    })
    .join('\n');
}

export function calculateScriptMetrics(
  scriptText?: string | null,
  targetMinutes: number = 10,
  chaptersList?: Array<{ chapter_id?: number; title?: string; script_text?: string }>
): ScriptWordMetrics {
  const safeText = typeof scriptText === 'string' ? scriptText : '';
  const allWords = safeText.split(/\s+/).filter(Boolean).length;

  const spokenText = extractSpokenNarration(safeText);
  const spokenWords = spokenText.split(/\s+/).filter(Boolean).length;

  const targetWords = Math.max(150, Math.round((targetMinutes || 10) * 150));
  const spokenDurationSeconds = Math.round((spokenWords / 150) * 60);
  const mins = Math.floor(spokenDurationSeconds / 60);
  const secs = spokenDurationSeconds % 60;
  const spokenDurationFormatted = `${mins}m ${secs.toString().padStart(2, '0')}s`;
  const targetProgressPercent = targetWords > 0 ? Math.min(200, Math.round((spokenWords / targetWords) * 100)) : 100;

  const chaptersBreakdown: Array<{
    chapterIndex: number;
    title: string;
    spokenWords: number;
    totalWords: number;
    durationFormatted: string;
  }> = [];

  if (chaptersList && chaptersList.length > 0) {
    chaptersList.forEach((c, idx) => {
      const cSafe = c.script_text || '';
      const cTotal = cSafe.split(/\s+/).filter(Boolean).length;
      const cSpoken = extractSpokenNarration(cSafe).split(/\s+/).filter(Boolean).length;
      const cSecs = Math.round((cSpoken / 150) * 60);
      const cM = Math.floor(cSecs / 60);
      const cS = cSecs % 60;
      chaptersBreakdown.push({
        chapterIndex: c.chapter_id || idx + 1,
        title: c.title || `Chapter ${idx + 1}`,
        spokenWords: cSpoken,
        totalWords: cTotal,
        durationFormatted: `${cM}m ${cS.toString().padStart(2, '0')}s`,
      });
    });
  }

  return {
    totalWords: allWords,
    spokenWords,
    targetWords,
    spokenDurationSeconds,
    spokenDurationFormatted,
    targetProgressPercent,
    targetMinutes,
    chaptersBreakdown,
  };
}
