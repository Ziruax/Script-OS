'use client';

import React from 'react';
import { useScriptOSStore } from '@/lib/store';
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
  AlertTriangle,
  ArrowRight,
  Compass,
  BookOpen,
  ShieldCheck,
  Zap,
  Film,
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
    availableModels,
    isGenerating,
    currentProgressMessage,
    updateInputs,
    updateSettings,
    autoDetectMetadata,
    buildStoryDnaOnly,
    startFullGeneration,
    setShowHelpModal,
    setActiveTab,
  } = useScriptOSStore();

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

  return (
    <div className="max-w-3xl mx-auto space-y-8 animate-in fade-in duration-200">
      {/* Title & Pitch */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-neutral-900 dark:text-neutral-100 flex items-center gap-2">
            <Sparkles className="w-6 h-6 text-amber-500" />
            ScriptOS Project Wizard
          </h2>
          <p className="text-sm text-neutral-500 mt-1">
            Configure your video parameters. ScriptOS will run local research, apply original perspective lenses, and assemble a 10/10 script.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setShowHelpModal(true)}
          className="px-3 py-1.5 text-xs font-medium text-neutral-700 dark:text-neutral-300 bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 rounded-lg flex items-center gap-1.5 shrink-0 self-start transition-colors"
        >
          <HelpCircle className="w-4 h-4 text-neutral-500" />
          Onboarding Guide
        </button>
      </div>

      <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-6 shadow-sm space-y-6">
        {/* Field 1: Title */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <label className="text-sm font-semibold text-neutral-900 dark:text-neutral-100 flex items-center gap-1.5">
              1. Video Title / Idea / Core Topic
              <span className="text-rose-500">*</span>
            </label>
            <span className="text-xs text-neutral-400">Target audience hook anchor</span>
          </div>
          <input
            type="text"
            value={title || ''}
            onChange={(e) => updateInputs({ title: e.target.value })}
            placeholder="e.g. Why 99% of People Fail to Stay Consistent"
            className="w-full px-4 py-3 rounded-xl border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 text-base focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Field 2: Details / Nuances */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <label className="text-sm font-semibold text-neutral-900 dark:text-neutral-100 flex items-center gap-1.5">
              2. Specific Nuances & Angles to Cover
              <span className="text-xs font-normal text-neutral-400">(Accepts long detailed notes, bullet points, transcripts)</span>
            </label>
            <span className="text-xs text-neutral-400 font-mono">
              {(details || '').length} chars • {(details || '').split(/\s+/).filter(Boolean).length} words
            </span>
          </div>
          <textarea
            rows={5}
            value={details || ''}
            onChange={(e) => updateInputs({ details: e.target.value })}
            placeholder="- Break down dopamine depletion in the first 72 hours&#10;- Contrast willpower vs environmental friction&#10;- Expose why 21-day habit advice is flawed&#10;- Provide 60-second micro-loop protocol&#10;- Feel free to paste detailed essays, case studies, or counter-arguments"
            className="w-full px-4 py-3 rounded-xl border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-y font-mono"
          />
          <p className="text-[11px] text-neutral-500 dark:text-neutral-400">
            ScriptOS preserves and distributes all your specific nuances, sub-arguments, and contrarian points across the chapter outline.
          </p>
        </div>

        {/* Field 3: Timing / Length Slider & Custom Minute Entry */}
        <div className="space-y-3 p-4 rounded-xl bg-neutral-50/70 dark:bg-neutral-800/40 border border-neutral-200 dark:border-neutral-700/60">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <label className="text-sm font-semibold text-neutral-900 dark:text-neutral-100 flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-blue-500" />
              3. Target Script Length: <span className="text-blue-600 dark:text-blue-400 font-bold">{lengthMin} Minutes</span>
              {lengthMin >= 60 && (
                <span className="text-[10px] font-semibold uppercase px-2 py-0.5 rounded-full bg-purple-100 dark:bg-purple-900/60 text-purple-700 dark:text-purple-300">
                  Feature / Documentary ({(lengthMin / 60).toFixed(1)} hrs)
                </span>
              )}
              {lengthMin >= 30 && lengthMin < 60 && (
                <span className="text-[10px] font-semibold uppercase px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-900/60 text-blue-700 dark:text-blue-300">
                  Deep-Dive Long-Form
                </span>
              )}
            </label>

            <span className="text-xs text-neutral-500 font-mono">
              ~{estChapters} chapters • ~{estWords.toLocaleString()} spoken words
            </span>
          </div>

          {/* Preset Buttons up to 120 Mins */}
          <div className="grid grid-cols-3 sm:grid-cols-5 md:grid-cols-9 gap-1.5 pt-1">
            {lengthPresets.map((min) => (
              <button
                key={min}
                type="button"
                onClick={() => updateInputs({ lengthMin: min })}
                className={`py-1.5 px-2 rounded-lg text-xs font-semibold border transition-all ${
                  lengthMin === min
                    ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                    : 'bg-white dark:bg-neutral-800 border-neutral-200 dark:border-neutral-700 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-700'
                }`}
              >
                {min >= 60 ? `${min / 60}h` : `${min}m`}
              </button>
            ))}
          </div>

          {/* Interactive Range Slider + Custom Numeric Entry */}
          <div className="pt-2 flex flex-col sm:flex-row sm:items-center gap-4">
            <div className="flex-1 space-y-1">
              <div className="flex justify-between text-[11px] text-neutral-400">
                <span>1 min (Short)</span>
                <span>30 min</span>
                <span>60 min (1 hour)</span>
                <span>120 min (2 hours)</span>
              </div>
              <input
                type="range"
                min={1}
                max={120}
                step={1}
                value={lengthMin}
                onChange={(e) => updateInputs({ lengthMin: Math.max(1, Math.min(120, parseInt(e.target.value) || 1)) })}
                className="w-full accent-blue-600 cursor-pointer h-2 bg-neutral-200 dark:bg-neutral-700 rounded-lg appearance-none"
              />
            </div>

            {/* Custom Minutes Input */}
            <div className="flex items-center gap-2 shrink-0">
              <label className="text-xs font-medium text-neutral-600 dark:text-neutral-400 whitespace-nowrap">
                Custom Mins:
              </label>
              <div className="flex items-center">
                <input
                  type="number"
                  min={1}
                  max={120}
                  value={lengthMin}
                  onChange={(e) => {
                    const val = parseInt(e.target.value);
                    if (!isNaN(val)) {
                      updateInputs({ lengthMin: Math.max(1, Math.min(120, val)) });
                    }
                  }}
                  className="w-20 px-2.5 py-1 text-xs text-center font-bold font-mono rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <span className="ml-1.5 text-xs text-neutral-400">min</span>
              </div>
            </div>
          </div>
        </div>

        {/* Strategy Auto-Detect Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-1">
          <div className="text-xs font-semibold text-neutral-700 dark:text-neutral-300 flex items-center gap-1.5">
            <Target className="w-4 h-4 text-purple-500" />
            Strategy & Positioning (Audience, Goal & Tone)
          </div>

          <button
            type="button"
            disabled={!title.trim() || isDetectingMetadata}
            onClick={() => autoDetectMetadata()}
            className="text-xs font-medium text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300 flex items-center gap-1 transition-colors self-start sm:self-auto"
          >
            <Sparkles className="w-3.5 h-3.5" />
            {isDetectingMetadata ? 'Analyzing Topic...' : 'Auto-Detect from Title & Nuances'}
          </button>
        </div>

        {detectedRationale && (
          <div className="p-3 rounded-xl bg-purple-50 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-800/60 text-xs text-purple-900 dark:text-purple-200">
            <span className="font-semibold">AI Detection Rationale: </span>
            {detectedRationale}
          </div>
        )}

        {/* Unified Strategic Architecture & Archetype Grid */}
        <div className="space-y-3 p-4 rounded-xl bg-neutral-50 dark:bg-neutral-800/50 border border-neutral-200 dark:border-neutral-700/60">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-neutral-700 dark:text-neutral-300 flex items-center gap-1.5">
              <Compass className="w-3.5 h-3.5 text-blue-500" />
              Narrative Strategy & Psychological Architecture
            </span>
            <span className="text-[10px] text-neutral-500">
              Synchronizes Story DNA with downstream pipeline
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {/* 1. Content Type */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-neutral-700 dark:text-neutral-300 flex items-center gap-1">
                <BookOpen className="w-3.5 h-3.5 text-blue-500" />
                Content Format
              </label>
              <select
                value={contentType}
                onChange={(e) => updateInputs({ contentType: e.target.value as any })}
                className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 focus:outline-none focus:ring-1 focus:ring-blue-500"
              >
                {CONTENT_TYPES.map((ct) => (
                  <option key={ct} value={ct}>{ct}</option>
                ))}
              </select>
            </div>

            {/* 2. Narrative Mode */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-neutral-700 dark:text-neutral-300 flex items-center gap-1">
                <Compass className="w-3.5 h-3.5 text-indigo-500" />
                Narrative Mode
              </label>
              <select
                value={narrativeMode}
                onChange={(e) => updateInputs({ narrativeMode: e.target.value as any })}
                className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 focus:outline-none focus:ring-1 focus:ring-blue-500"
              >
                {NARRATIVE_MODES.map((nm) => (
                  <option key={nm} value={nm}>{nm}</option>
                ))}
              </select>
            </div>

            {/* 3. Audience Level */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-neutral-700 dark:text-neutral-300 flex items-center gap-1">
                <Users className="w-3.5 h-3.5 text-emerald-500" />
                Audience Depth
              </label>
              <select
                value={audience}
                onChange={(e) => updateInputs({ audience: e.target.value as any })}
                className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 focus:outline-none focus:ring-1 focus:ring-blue-500"
              >
                <option value="Auto-detect">Auto-detect from Topic</option>
                <option value="Beginner">Beginner (Zero assumed knowledge)</option>
                <option value="Intermediate">Intermediate (Practitioner seeking edge)</option>
                <option value="Expert">Expert (Nuanced insider mastery)</option>
              </select>
            </div>

            {/* 4. Merged Primary Goal & Audience Intent */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-neutral-700 dark:text-neutral-300 flex items-center gap-1">
                <Target className="w-3.5 h-3.5 text-purple-500" />
                Primary Goal & Psychological Intent
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
                className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 focus:outline-none focus:ring-1 focus:ring-blue-500"
              >
                <option value="Auto-detect">Auto-detect from Topic</option>
                <option value="Viral">Viral Retention (Curiosity Payoff)</option>
                <option value="Educate">Deep Mastery (Actionable Framework)</option>
                <option value="Persuade">Conviction Shift (Belief Reversal)</option>
                <option value="Entertain">Drama & Tension (Emotional Catharsis)</option>
                <option value="Sell">Direct Action (Immediate Pain Solution)</option>
              </select>
            </div>

            {/* 5. Merged Narrative Tone & Emotional Engine */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-neutral-700 dark:text-neutral-300 flex items-center gap-1">
                <Flame className="w-3.5 h-3.5 text-amber-500" />
                Tone & Emotional Engine
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
                className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 focus:outline-none focus:ring-1 focus:ring-blue-500"
              >
                <option value="Auto-detect">Auto-detect from Topic</option>
                <option value="Cinematic">Cinematic (High Stakes Tension)</option>
                <option value="Calm">Calm Focus (Intellectual Wonder)</option>
                <option value="Energetic">Energetic (Urgent Alarm & Action)</option>
                <option value="Dark">Dark Forensic (Quiet Betrayal / Risk)</option>
                <option value="Funny">Self-Deprecating (Vulnerable Empathy)</option>
              </select>
            </div>

            {/* 6. Active Archetype Summary Badge */}
            <div className="space-y-1 flex flex-col justify-end">
              <div className="p-2 rounded-lg bg-blue-50/70 dark:bg-blue-950/40 border border-blue-200/70 dark:border-blue-900/60 text-[11px] text-blue-900 dark:text-blue-200">
                <div className="font-semibold flex items-center gap-1">
                  <Zap className="w-3 h-3 text-amber-500" /> Story Archetype:
                </div>
                <div className="truncate text-neutral-700 dark:text-neutral-300 font-mono text-[10px] mt-0.5">
                  {contentType} • {narrativeMode} • {audienceIntent}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Story DNA Blueprint Card (if available) */}
        {storyDna && (
          <div className="p-4 rounded-xl bg-gradient-to-br from-indigo-50/70 to-blue-50/50 dark:from-indigo-950/30 dark:to-blue-950/20 border border-indigo-200 dark:border-indigo-800/60 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                <span className="text-xs font-bold uppercase tracking-wider text-indigo-900 dark:text-indigo-200">
                  Pass 1: Story DNA Strategic Blueprint Active
                </span>
              </div>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-indigo-100 dark:bg-indigo-900/60 text-indigo-700 dark:text-indigo-300">
                {storyDna.setup_payoff_ledger?.length || 0} Setups in Ledger
              </span>
            </div>

            <div className="space-y-2 text-xs">
              <div>
                <span className="font-semibold text-neutral-900 dark:text-neutral-100">Central Story Question: </span>
                <span className="italic text-neutral-700 dark:text-neutral-300 font-serif">&ldquo;{storyDna.central_story_question}&rdquo;</span>
              </div>

              {storyDna.midpoint_reversal && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                  <div className="p-2 rounded-lg bg-white/70 dark:bg-neutral-800/70 border border-indigo-100 dark:border-neutral-700">
                    <span className="text-[10px] uppercase font-bold text-amber-600 dark:text-amber-400 block">Midpoint False Belief</span>
                    <span className="text-neutral-800 dark:text-neutral-200">{storyDna.midpoint_reversal.false_victory_or_apparent_crisis}</span>
                  </div>
                  <div className="p-2 rounded-lg bg-white/70 dark:bg-neutral-800/70 border border-indigo-100 dark:border-neutral-700">
                    <span className="text-[10px] uppercase font-bold text-indigo-600 dark:text-indigo-400 block">Deeper Truth Revealed</span>
                    <span className="text-neutral-800 dark:text-neutral-200">{storyDna.midpoint_reversal.actual_truth_revealed}</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Live Pipeline Preview cards — estimated word count, chapter count, read time */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
          {[
            {
              label: 'Est. Word Count',
              value: (Math.round(lengthMin * 155)).toLocaleString(),
              sub: 'words',
              icon: Layers,
              tint: 'text-blue-600 dark:text-blue-400',
              bg: 'from-blue-50/70 to-cyan-50/40 dark:from-blue-950/20 dark:to-cyan-950/10',
              border: 'border-blue-200/70 dark:border-blue-900/50',
            },
            {
              label: 'Est. Chapters',
              value: String(Math.max(3, Math.min(12, Math.round(lengthMin / 3)))),
              sub: 'sections',
              icon: BookOpen,
              tint: 'text-purple-600 dark:text-purple-400',
              bg: 'from-purple-50/70 to-fuchsia-50/40 dark:from-purple-950/20 dark:to-fuchsia-950/10',
              border: 'border-purple-200/70 dark:border-purple-900/50',
            },
            {
              label: 'Read Time',
              value: `${lengthMin}m`,
              sub: lengthMin >= 60 ? `${(lengthMin / 60).toFixed(1)}h` : 'minutes',
              icon: Clock,
              tint: 'text-emerald-600 dark:text-emerald-400',
              bg: 'from-emerald-50/70 to-teal-50/40 dark:from-emerald-950/20 dark:to-teal-950/10',
              border: 'border-emerald-200/70 dark:border-emerald-900/50',
            },
            {
              label: 'B-Roll Cues',
              value: String(Math.max(3, Math.min(12, Math.round(lengthMin / 3)) * 2)),
              sub: 'est. shots',
              icon: Film,
              tint: 'text-amber-600 dark:text-amber-400',
              bg: 'from-amber-50/70 to-orange-50/40 dark:from-amber-950/20 dark:to-orange-950/10',
              border: 'border-amber-200/70 dark:border-amber-900/50',
            },
          ].map((card) => {
            const Icon = card.icon;
            return (
              <div
                key={card.label}
                className={`p-3 rounded-xl bg-gradient-to-br ${card.bg} border ${card.border} flex flex-col gap-1`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-[10px] uppercase font-bold tracking-wider text-neutral-500 dark:text-neutral-400">
                    {card.label}
                  </span>
                  <Icon className={`w-3.5 h-3.5 ${card.tint}`} />
                </div>
                <div className="flex items-baseline gap-1">
                  <span className={`text-xl font-bold ${card.tint}`}>{card.value}</span>
                  <span className="text-[10px] text-neutral-400">{card.sub}</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Quick Architect Story DNA Button */}
        <div className="flex items-center justify-between pt-1">
          <button
            type="button"
            disabled={!title.trim() || isGenerating}
            onClick={buildStoryDnaOnly}
            className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
          >
            <Sparkles className="w-3.5 h-3.5" />
            {storyDna ? 'Re-Architect Story DNA (Pass 1)' : 'Architect Story DNA Blueprint (Pass 1)'}
          </button>
        </div>

        {/* Model Selection Quick Bar */}
        <div className="pt-3 border-t border-neutral-100 dark:border-neutral-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2 text-xs text-neutral-600 dark:text-neutral-400">
            <Layers className="w-4 h-4 text-blue-500 shrink-0" />
            <span>Active Brain:</span>
            <span className="font-semibold text-neutral-900 dark:text-neutral-100">
              {selectedModel}
            </span>
            <span className="px-2 py-0.5 rounded-md text-[10px] font-mono bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
              Multi-Model Fallback Protected
            </span>
          </div>

          <button
            type="button"
            onClick={() => setActiveTab('settings')}
            className="text-xs text-blue-600 dark:text-blue-400 hover:underline font-medium text-left"
          >
            Change Model or Provider in Settings &rarr;
          </button>
        </div>

        {/* Execution Action Button */}
        <div className="pt-2">
          <button
            type="button"
            disabled={!title.trim() || isGenerating}
            onClick={startFullGeneration}
            className="w-full py-4 px-6 rounded-xl bg-neutral-900 text-white dark:bg-neutral-100 dark:text-neutral-900 hover:opacity-90 font-semibold text-base flex items-center justify-center gap-2 shadow-lg disabled:opacity-50 transition-all cursor-pointer"
          >
            {isGenerating ? (
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin" />
                <span>{currentProgressMessage || 'Executing ScriptOS Pipeline...'}</span>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Play className="w-5 h-5 fill-current" />
                <span>Execute 9-Pass ScriptOS Pipeline (Story DNA &rarr; Python Research &rarr; Angles &rarr; Outline)</span>
                <ArrowRight className="w-5 h-5" />
              </div>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
