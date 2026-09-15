/**
 * Shared chapter-count + word-count math for ScriptOS.
 *
 * ONE source of truth — used by the Wizard preview, the outline generation
 * route, and the section generation route so the numbers always agree.
 *
 * Philosophy: cap the chapter count to keep LLM output quality high. Generating
 * 18 chapters in a single JSON response is unreliable (truncation); 8-10 for a
 * 1-hour video is the sweet spot (~6 min/chapter, manageable per-section calls).
 */

export function getChapterCount(mins: number): number {
  const m = Math.max(1, Math.min(120, Number(mins) || 8));
  if (m <= 1) return 2;
  if (m <= 3) return 3;
  if (m <= 8) return 5;
  if (m <= 15) return 6;
  if (m <= 30) return 8;
  if (m <= 45) return 9;
  if (m <= 60) return 10;
  if (m <= 90) return 12;
  return 14;
}

/** Spoken words per minute (YouTube narration average). */
export const WORDS_PER_MINUTE = 150;

/** Total spoken word target for the whole script. */
export function getTotalWords(mins: number): number {
  return Math.round(Math.max(1, Number(mins) || 8) * WORDS_PER_MINUTE);
}

/** Target words for a single chapter, given total length + chapter count. */
export function getWordsPerChapter(mins: number, chapterCount: number): number {
  const total = getTotalWords(mins);
  return Math.max(150, Math.round(total / Math.max(1, chapterCount)));
}

/** Target seconds for a single chapter. */
export function getSecondsPerChapter(mins: number, chapterCount: number): number {
  return Math.max(30, Math.round((Math.max(1, Number(mins) || 8) * 60) / Math.max(1, chapterCount)));
}
