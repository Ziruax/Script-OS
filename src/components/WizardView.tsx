'use client';

import React, { useState } from 'react';
import { useScriptOSStore } from '@/lib/store';
import { getChapterCount } from '@/lib/chapter-math';
import { useToast } from '@/components/Toast';
import {
  Sparkles,
  Clock,
  Users,
  Target,
  Flame,
  HelpCircle,
  Play,
  Layers,
  BookOpen,
  ShieldCheck,
  Compass,
  Film,
  GitBranch,
  Wand2,
  ArrowRight,
  RotateCcw,
} from 'lucide-react';
import {
  CONTENT_TYPES,
  NARRATIVE_MODES,
  AUDIENCE_INTENTS,
  EMOTIONS,
  AudienceIntent,
  EmotionalEngine,
} from '@/lib/story-dna';

export default function WizardView() {
  const {
    title,
    details,
    lengthMin,
    contentType,
    narrativeMode,
    audienceIntent,
    emotionalEngine,
    audience,
    goal,
    tone,
    detectedRationale,
    isDetectingMetadata,
    storyDna,
    storyMode,
    selectedModel,
    isGenerating,
    currentProgressMessage,
    updateInputs,
    autoDetectMetadata,
    buildStoryDnaOnly,
    startFullGeneration,
    setShowHelpModal,
    setActiveTab,
    saveCurrentAsProject,
    resetSession,
  } = useScriptOSStore();
  const { toast } = useToast();

  const lengthPresets = [1, 3, 8, 15, 30, 45, 60, 90, 120];

  // Use the SHARED chapter-math so the preview count always matches the
  // outline generation + section generation counts (no more mismatch).
  const estChapters = getChapterCount(lengthMin);
  const estWords = lengthMin * 140;

  const [showResetConfirm, setShowResetConfirm] = useState(false);

  const handleReset = () => {
    // Clear ALL workspace data + cache first (synchronous localStorage wipe),
    // then force a HARD page reload so the user starts from absolute zero with
    // no in-memory remnants. The reload re-mounts the app and loadFromStorage()
    // finds nothing → fully blank state.
    resetSession();
    setShowResetConfirm(false);
    if (typeof window !== 'undefined') {
      // Hard reload — bypasses cache so nothing stale survives.
      setTimeout(() => { window.location.reload(); }, 50);
    }
  };

  const estTime = Math.round(2 + 21 + 27 + 5 + 20 + (estChapters * 9) + 5 + 3);

  return (
    <div className="space-y-6 animate-slide-up">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-neutral-900 dark:text-neutral-100">
            New Script
          </h1>
          <p className="text-sm text-neutral-500 mt-1">
            {storyMode
              ? 'Story Mode: character arcs, emotional stakes, 3-act scenes, show-don\'t-tell.'
              : 'Configure your parameters, then generate a 10/10 retention-optimized script.'}
          </p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={() => setShowResetConfirm(true)}
            className="px-3 py-1.5 text-xs font-medium text-rose-700 dark:text-rose-300 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 hover:bg-rose-100 dark:hover:bg-rose-950/60 rounded-lg flex items-center gap-1.5 transition-colors"
            title="Clear all workspace data + cached state and start from zero"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Start Fresh</span>
          </button>
          <button
            type="button"
            onClick={() => {
              const name = title ? `${title.slice(0, 50)} (branch)` : 'Quick Branch';
              saveCurrentAsProject(name);
              toast('Workspace branched', 'success', `"${name.slice(0, 40)}" saved`);
            }}
            disabled={!title.trim()}
            className="px-3 py-1.5 text-xs font-medium text-purple-700 dark:text-purple-300 bg-purple-50 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-800 hover:bg-purple-100 dark:hover:bg-purple-950/60 rounded-lg flex items-center gap-1.5 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            title="Save a copy as a new project (safe experimentation)"
          >
            <GitBranch className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Quick Branch</span>
          </button>
          <button
            type="button"
            onClick={() => setShowHelpModal(true)}
            className="px-3 py-1.5 text-xs font-medium text-neutral-600 dark:text-neutral-400 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 hover:bg-neutral-50 dark:hover:bg-neutral-800 rounded-lg flex items-center gap-1.5 transition-colors"
          >
            <HelpCircle className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Help</span>
          </button>
        </div>
      </div>

      {/* Start Fresh confirm dialog */}
      {showResetConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="w-full max-w-md bg-white dark:bg-neutral-900 rounded-2xl shadow-2xl border border-neutral-200 dark:border-neutral-800 overflow-hidden">
            <div className="p-5">
              <div className="flex items-start gap-3">
                <div className="p-2 rounded-lg bg-rose-100 dark:bg-rose-950/50 text-rose-600 dark:text-rose-400 shrink-0">
                  <RotateCcw className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-neutral-900 dark:text-neutral-100">Start Fresh?</h3>
                  <p className="text-xs text-neutral-500 mt-1 leading-relaxed">
                    This clears <strong>everything</strong>: the current workspace (title, details, research, outline, script, QA), the saved project library, and all cached state. There is no undo.
                  </p>
                </div>
              </div>
            </div>
            <div className="px-5 py-3 bg-neutral-50 dark:bg-neutral-950/40 border-t border-neutral-100 dark:border-neutral-800 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowResetConfirm(false)}
                className="px-3 py-1.5 text-xs font-medium text-neutral-600 dark:text-neutral-300 bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 hover:bg-neutral-50 dark:hover:bg-neutral-700 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleReset}
                className="px-3 py-1.5 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-500 rounded-lg flex items-center gap-1.5 transition-colors shadow-sm"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                Reset Everything
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Story Mode toggle — switches the entire pipeline methodology */}
      <div className={`relative overflow-hidden rounded-2xl border p-4 transition-all ${
        storyMode
          ? 'border-amber-300 dark:border-amber-700 bg-gradient-to-br from-amber-50 to-orange-50/60 dark:from-amber-950/30 dark:to-orange-950/20'
          : 'border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900'
      }`}>
        <div className="flex items-start gap-3">
          <div className={`p-2 rounded-lg shrink-0 ${storyMode ? 'bg-amber-100 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400' : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-500'}`}>
            <Film className="w-5 h-5" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-sm font-bold text-neutral-900 dark:text-neutral-100">Story Mode</span>
              <span className="text-[10px] font-semibold uppercase px-1.5 py-0.5 rounded-full bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
                Storytelling
              </span>
              <span className="text-[10px] text-neutral-400">
                {storyMode ? '— using character / emotion / 3-act methodology' : '— off (documentary / retention methodology)'}
              </span>
            </div>
            <p className="text-[11px] text-neutral-600 dark:text-neutral-400 mt-1 leading-relaxed">
              {storyMode ? (
                <>The pipeline now optimizes for <strong>character arcs, emotional stakes, scene structure, show-don&apos;t-tell, and subtext</strong> — not curiosity gaps or retention hooks. Switch off for documentary / explainer / investigation videos.</>
              ) : (
                <>Turn this on for <strong>storytelling videos</strong> (personal narratives, drama, biography, fiction). Storytelling has different values &amp; stakes — character, emotion, theme, catharsis — that the default documentary pipeline doesn&apos;t capture.</>
              )}
            </p>
          </div>
          <button
            type="button"
            role="switch"
            aria-checked={storyMode}
            onClick={() => updateInputs({ storyMode: !storyMode })}
            className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-amber-500/40 ${
              storyMode ? 'bg-amber-500' : 'bg-neutral-300 dark:bg-neutral-700'
            }`}
            title={storyMode ? 'Turn Story Mode off' : 'Turn Story Mode on'}
          >
            <span className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${storyMode ? 'translate-x-5' : 'translate-x-0'}`} />
          </button>
        </div>
      </div>

      {/* Main config card */}
      <section className="surface rounded-2xl p-5 sm:p-6 space-y-6">
        {/* Title */}
        <div className="space-y-1.5">
          <label className="text-sm font-semibold text-neutral-900 dark:text-neutral-100 flex items-center justify-between">
            <span>Title / Core Topic <span className="text-rose-500">*</span></span>
            <span className="text-[11px] text-neutral-400 font-normal">the hook anchor</span>
          </label>
          <input
            type="text"
            value={title || ''}
            onChange={(e) => updateInputs({ title: e.target.value })}
            placeholder="e.g. Why 99% of People Fail to Stay Consistent"
            className="w-full px-3.5 py-2.5 rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-500 transition-shadow"
          />
        </div>

        {/* Details */}
        <div className="space-y-1.5">
          <label className="text-sm font-semibold text-neutral-900 dark:text-neutral-100 flex items-center justify-between gap-2">
            <span>Nuances & Angles to Cover</span>
            <span className="text-[11px] text-neutral-400 font-mono font-normal">
              {(details || '').length} chars · {(details || '').split(/\s+/).filter(Boolean).length} words
            </span>
          </label>
          <textarea
            rows={4}
            value={details || ''}
            onChange={(e) => updateInputs({ details: e.target.value })}
            placeholder={"- Break down dopamine depletion in the first 72 hours\n- Contrast willpower vs environmental friction\n- Expose why 21-day habit advice is flawed\n- End with a 60-second micro-loop protocol"}
            className="w-full px-3.5 py-2.5 rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-500 resize-y font-mono text-[13px] leading-relaxed"
          />
          <p className="text-[11px] text-neutral-500 dark:text-neutral-400">
            ScriptOS preserves and distributes your specific nuances across the chapter outline.
          </p>
        </div>

        {/* Length */}
        <div className="space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <label className="text-sm font-semibold text-neutral-900 dark:text-neutral-100 flex items-center gap-2">
              <Clock className="w-4 h-4 text-emerald-500" />
              Target Length
              <span className="text-emerald-600 dark:text-emerald-400 font-bold">{lengthMin}m</span>
              {lengthMin >= 60 && (
                <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded-full bg-purple-100 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300">
                  {(lengthMin / 60).toFixed(1)}h feature
                </span>
              )}
            </label>
            <span className="text-[11px] text-neutral-500 font-mono">
              ~{estChapters} chapters · ~{estWords.toLocaleString()} words
            </span>
          </div>

          <div className="grid grid-cols-5 sm:grid-cols-9 gap-1.5">
            {lengthPresets.map((min) => (
              <button
                key={min}
                type="button"
                onClick={() => updateInputs({ lengthMin: min })}
                className={`py-1.5 px-2 rounded-lg text-xs font-semibold border transition-all ${
                  lengthMin === min
                    ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
                    : 'bg-white dark:bg-neutral-800 border-neutral-200 dark:border-neutral-700 text-neutral-600 dark:text-neutral-400 hover:bg-neutral-50 dark:hover:bg-neutral-700/60 hover:border-neutral-300'
                }`}
              >
                {min >= 60 ? `${min / 60}h` : `${min}m`}
              </button>
            ))}
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center gap-3 pt-1">
            <input
              type="range"
              min={1}
              max={120}
              step={1}
              value={lengthMin}
              onChange={(e) => updateInputs({ lengthMin: Math.max(1, Math.min(120, parseInt(e.target.value) || 1)) })}
              className="flex-1 accent-emerald-600 cursor-pointer h-1.5 bg-neutral-200 dark:bg-neutral-700 rounded-lg appearance-none"
            />
            <div className="flex items-center gap-1.5 shrink-0">
              <input
                type="number"
                min={1}
                max={120}
                value={lengthMin}
                onChange={(e) => {
                  const val = parseInt(e.target.value);
                  if (!isNaN(val)) updateInputs({ lengthMin: Math.max(1, Math.min(120, val)) });
                }}
                className="w-16 px-2 py-1 text-xs text-center font-mono rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 focus:outline-none focus:ring-2 focus:ring-emerald-500/40"
              />
              <span className="text-[11px] text-neutral-400">min</span>
            </div>
          </div>
        </div>

        {/* Strategy */}
        <div className="space-y-3 pt-4 border-t border-neutral-100 dark:border-neutral-800">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <label className="text-sm font-semibold text-neutral-900 dark:text-neutral-100 flex items-center gap-2">
              <Compass className="w-4 h-4 text-emerald-500" />
              Strategy & Positioning
            </label>
            <button
              type="button"
              disabled={!title.trim() || isDetectingMetadata}
              onClick={() => autoDetectMetadata()}
              className="text-xs font-medium text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300 flex items-center gap-1 transition-colors self-start sm:self-auto disabled:opacity-40"
            >
              <Wand2 className="w-3.5 h-3.5" />
              {isDetectingMetadata ? 'Analyzing…' : 'Auto-detect from title'}
            </button>
          </div>

          {detectedRationale && (
            <div className="p-2.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900/60 text-[11px] text-emerald-900 dark:text-emerald-200">
              <span className="font-semibold">Rationale: </span>
              {detectedRationale}
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            <div className="space-y-1">
              <label className="text-[11px] font-semibold text-neutral-500 dark:text-neutral-400 flex items-center gap-1">
                <BookOpen className="w-3 h-3" /> Content Format
              </label>
              <select
                value={contentType}
                onChange={(e) => updateInputs({ contentType: e.target.value as any })}
                className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 focus:outline-none focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-500"
              >
                {CONTENT_TYPES.map((ct) => <option key={ct} value={ct}>{ct}</option>)}
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-[11px] font-semibold text-neutral-500 dark:text-neutral-400 flex items-center gap-1">
                <Compass className="w-3 h-3" /> Narrative Mode
              </label>
              <select
                value={narrativeMode}
                onChange={(e) => updateInputs({ narrativeMode: e.target.value as any })}
                className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 focus:outline-none focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-500"
              >
                {NARRATIVE_MODES.map((nm) => <option key={nm} value={nm}>{nm}</option>)}
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-[11px] font-semibold text-neutral-500 dark:text-neutral-400 flex items-center gap-1">
                <Users className="w-3 h-3" /> Audience Depth
              </label>
              <select
                value={audience}
                onChange={(e) => updateInputs({ audience: e.target.value as any })}
                className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 focus:outline-none focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-500"
              >
                <option value="Auto-detect">Auto-detect</option>
                <option value="Beginner">Beginner</option>
                <option value="Intermediate">Intermediate</option>
                <option value="Expert">Expert</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-[11px] font-semibold text-neutral-500 dark:text-neutral-400 flex items-center gap-1">
                <Target className="w-3 h-3" /> Primary Goal
              </label>
              <select
                value={goal}
                onChange={(e) => {
                  const g = e.target.value as any;
                  let ai: AudienceIntent = audienceIntent;
                  if (g === 'Viral') ai = 'Discover';
                  else if (g === 'Educate') ai = 'Learn';
                  else if (g === 'Persuade') ai = 'Understand';
                  else if (g === 'Entertain') ai = 'Feel';
                  else if (g === 'Sell') ai = 'Solve';
                  updateInputs({ goal: g, audienceIntent: ai });
                }}
                className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 focus:outline-none focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-500"
              >
                <option value="Auto-detect">Auto-detect</option>
                <option value="Viral">Viral retention</option>
                <option value="Educate">Deep mastery</option>
                <option value="Persuade">Conviction shift</option>
                <option value="Entertain">Drama & tension</option>
                <option value="Sell">Direct action</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-[11px] font-semibold text-neutral-500 dark:text-neutral-400 flex items-center gap-1">
                <Flame className="w-3 h-3" /> Tone
              </label>
              <select
                value={tone}
                onChange={(e) => {
                  const t = e.target.value as any;
                  let ee: EmotionalEngine = emotionalEngine;
                  if (t === 'Cinematic') ee = 'Suspense';
                  else if (t === 'Calm') ee = 'Fascination';
                  else if (t === 'Energetic') ee = 'Curiosity';
                  else if (t === 'Dark') ee = 'Fear';
                  else if (t === 'Funny') ee = 'Humor';
                  updateInputs({ tone: t, emotionalEngine: ee });
                }}
                className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 focus:outline-none focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-500"
              >
                <option value="Auto-detect">Auto-detect</option>
                <option value="Cinematic">Cinematic</option>
                <option value="Calm">Calm</option>
                <option value="Energetic">Energetic</option>
                <option value="Dark">Dark forensic</option>
                <option value="Funny">Self-deprecating</option>
              </select>
            </div>

            <div className="flex items-end">
              <div className="w-full p-2 rounded-lg bg-neutral-50 dark:bg-neutral-800/60 border border-neutral-200 dark:border-neutral-700/60 text-[10px] text-neutral-600 dark:text-neutral-400">
                <div className="font-semibold text-neutral-700 dark:text-neutral-300">Archetype</div>
                <div className="font-mono truncate mt-0.5">{contentType} · {narrativeMode} · {audienceIntent}</div>
              </div>
            </div>
          </div>
        </div>

        {/* Story DNA (if generated) */}
        {storyDna && (
          <div className="p-4 rounded-xl bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-900/60 space-y-2.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-800 dark:text-emerald-300">
                  Story DNA Blueprint
                </span>
              </div>
              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-emerald-100 dark:bg-emerald-900/60 text-emerald-700 dark:text-emerald-300">
                {storyDna.setup_payoff_ledger?.length || 0} setups
              </span>
            </div>
            <div className="text-xs">
              <span className="font-semibold text-neutral-900 dark:text-neutral-100">Central question: </span>
              <span className="italic text-neutral-700 dark:text-neutral-300">&ldquo;{storyDna.central_story_question}&rdquo;</span>
            </div>
            {storyDna.midpoint_reversal && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                <div className="p-2 rounded-lg bg-white/70 dark:bg-neutral-800/70 border border-neutral-200 dark:border-neutral-700">
                  <span className="text-[10px] uppercase font-bold text-amber-600 dark:text-amber-400 block">False belief</span>
                  <span className="text-[11px] text-neutral-700 dark:text-neutral-300">{storyDna.midpoint_reversal.false_victory_or_apparent_crisis}</span>
                </div>
                <div className="p-2 rounded-lg bg-white/70 dark:bg-neutral-800/70 border border-neutral-200 dark:border-neutral-700">
                  <span className="text-[10px] uppercase font-bold text-emerald-600 dark:text-emerald-400 block">Deeper truth</span>
                  <span className="text-[11px] text-neutral-700 dark:text-neutral-300">{storyDna.midpoint_reversal.actual_truth_revealed}</span>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Preview cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
          {[
            { label: 'Word count', value: (Math.round(lengthMin * 155)).toLocaleString(), sub: 'words', icon: Layers },
            { label: 'Chapters', value: String(estChapters), sub: 'sections', icon: BookOpen },
            { label: 'Read time', value: `${lengthMin}m`, sub: lengthMin >= 60 ? `${(lengthMin / 60).toFixed(1)}h` : 'min', icon: Clock },
            { label: 'B-Roll cues', value: String(estChapters * 2), sub: 'est. shots', icon: Film },
          ].map((card) => {
            const Icon = card.icon;
            return (
              <div key={card.label} className="p-3 rounded-xl bg-neutral-50 dark:bg-neutral-800/40 border border-neutral-200 dark:border-neutral-700/60">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[10px] uppercase font-semibold tracking-wider text-neutral-500 dark:text-neutral-400">{card.label}</span>
                  <Icon className="w-3.5 h-3.5 text-emerald-500" />
                </div>
                <div className="flex items-baseline gap-1">
                  <span className="text-lg font-bold text-neutral-900 dark:text-neutral-100">{card.value}</span>
                  <span className="text-[10px] text-neutral-400">{card.sub}</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Est time + model bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-3 border-t border-neutral-100 dark:border-neutral-800 text-xs">
          <div className="flex items-center gap-1.5 text-neutral-500 dark:text-neutral-400">
            <Clock className="w-3.5 h-3.5 text-emerald-500" />
            <span>Est. pipeline: <span className="font-mono font-bold text-neutral-700 dark:text-neutral-200">~{estTime}s</span><span className="text-neutral-400"> ±30%</span></span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-neutral-500 dark:text-neutral-400">Brain:</span>
            <span className="font-semibold text-neutral-900 dark:text-neutral-100 font-mono text-[11px]">{selectedModel}</span>
            <button
              type="button"
              onClick={() => setActiveTab('settings')}
              className="text-emerald-600 dark:text-emerald-400 hover:underline font-medium"
            >
              Change →
            </button>
          </div>
        </div>

        {/* Secondary action: architect story DNA */}
        <div className="pt-1">
          <button
            type="button"
            disabled={!title.trim() || isGenerating}
            onClick={buildStoryDnaOnly}
            className="text-xs font-medium text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300 flex items-center gap-1.5 cursor-pointer disabled:opacity-40"
          >
            <Sparkles className="w-3.5 h-3.5" />
            {storyDna ? 'Re-architect Story DNA' : 'Architect Story DNA only (Pass 1)'}
          </button>
        </div>
      </section>

      {/* Primary action: full pipeline */}
      <button
        type="button"
        disabled={!title.trim() || isGenerating}
        onClick={startFullGeneration}
        className="w-full py-3.5 px-5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-sm flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
      >
        {isGenerating ? (
          <>
            <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
            <span>{currentProgressMessage || 'Generating…'}</span>
          </>
        ) : (
          <>
            <Play className="w-4 h-4 fill-current" />
            <span>Generate Full Script</span>
            <ArrowRight className="w-4 h-4" />
          </>
        )}
      </button>
    </div>
  );
}
