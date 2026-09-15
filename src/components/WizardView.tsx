'use client';

import React from 'react';
import { useScriptOSStore } from '@/lib/store';
import { WIZARD_TEMPLATES, WizardTemplate } from '@/lib/templates';
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
  CheckCircle2,
  ArrowRight,
  Compass,
  BookOpen,
  ShieldCheck,
  Zap,
  Film,
  GitBranch,
  Wand2,
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
    provider,
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
  } = useScriptOSStore();
  const { toast } = useToast();

  const lengthPresets = [1, 3, 8, 15, 30, 45, 60, 90, 120];

  const getEstChapters = (mins: number) => {
    if (mins <= 1) return 2;
    if (mins <= 3) return 3;
    if (mins <= 8) return 5;
    if (mins <= 15) return 8;
    if (mins <= 30) return 12;
    if (mins <= 45) return 15;
    if (mins <= 60) return 18;
    if (mins <= 90) return 24;
    return Math.min(32, Math.round(24 + (mins - 90) * 0.25));
  };

  const estChapters = getEstChapters(lengthMin);
  const estWords = lengthMin * 140;

  const applyTemplate = (t: WizardTemplate) => {
    updateInputs({
      title: t.title,
      details: t.details,
      lengthMin: t.lengthMin,
      contentType: t.contentType as any,
      narrativeMode: t.narrativeMode as any,
      audienceIntent: t.audienceIntent as any,
      emotionalEngine: t.emotionalEngine as any,
      audience: 'Auto-detect',
      goal: 'Auto-detect',
      tone: 'Auto-detect',
      detectedRationale: `Applied "${t.name}" template.`,
    });
    toast('Template applied', 'success', t.name);
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
            Configure your parameters, then generate a 10/10 retention-optimized script.
          </p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
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

      {/* Quick Start Templates */}
      <section className="space-y-3">
        <div className="flex items-center gap-1.5">
          <Zap className="w-3.5 h-3.5 text-emerald-500" />
          <h2 className="text-xs font-bold uppercase tracking-wider text-neutral-700 dark:text-neutral-300">
            Quick Start Templates
          </h2>
          <span className="text-[11px] text-neutral-400">— one click fills everything</span>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5">
          {WIZARD_TEMPLATES.map((t) => {
            const isActive = title === t.title;
            return (
              <button
                key={t.id}
                type="button"
                onClick={() => applyTemplate(t)}
                className={`group relative p-3 rounded-xl border text-left transition-all overflow-hidden ${
                  isActive
                    ? 'border-emerald-500 dark:border-emerald-400 bg-emerald-50/40 dark:bg-emerald-950/20 shadow-sm'
                    : 'border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 hover:border-neutral-300 dark:hover:border-neutral-700 hover:shadow-sm'
                }`}
              >
                <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${t.accent}`} aria-hidden />
                <div className="flex items-start gap-1.5 pt-1">
                  <span className="text-base leading-none">{t.emoji}</span>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1">
                      <span className="text-[11px] font-bold text-neutral-900 dark:text-neutral-100 truncate">{t.name}</span>
                      {isActive && <CheckCircle2 className="w-3 h-3 text-emerald-500 shrink-0" />}
                    </div>
                    <p className="text-[10px] text-neutral-500 dark:text-neutral-400 mt-0.5 line-clamp-2 leading-tight">{t.desc}</p>
                    <div className="flex items-center gap-1 mt-1 text-[9px] text-neutral-400">
                      <Clock className="w-2.5 h-2.5" />
                      <span>{t.lengthMin}m</span>
                      <span className="text-neutral-300 dark:text-neutral-700">·</span>
                      <span className="truncate">{t.contentType}</span>
                    </div>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </section>

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
