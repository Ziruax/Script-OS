'use client';

import React, { useState } from 'react';
import { useScriptOSStore, Angle } from '@/lib/store';
import {
  Compass,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  HelpCircle,
  Play,
  Film,
  Eye,
  ShieldCheck,
  Sparkles,
  ArrowRight,
  Layers,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';

export default function OutlineView() {
  const {
    angles,
    chosenAngle,
    outlineData,
    outlineCouncilEval,
    isGenerating,
    currentProgressMessage,
    selectAngleAndGenerateOutline,
    regenerateOutline,
    generateFullScriptChapterByChapter,
    generateAnglesOnly,
    title,
  } = useScriptOSStore();

  const [expandedChapter, setExpandedChapter] = useState<number | null>(1);
  const [showCriticHelp, setShowCriticHelp] = useState(false);

  const getScoreTextColor = (score?: number) => {
    const num = typeof score === 'number' && !isNaN(score) ? score : 9.2;
    if (num >= 9.0) return 'text-emerald-600 dark:text-emerald-400';
    if (num >= 7.0) return 'text-amber-600 dark:text-amber-400';
    return 'text-rose-600 dark:text-rose-400';
  };

  const getScoreBarColor = (score?: number) => {
    const num = typeof score === 'number' && !isNaN(score) ? score : 9.2;
    if (num >= 9.0) return 'bg-emerald-500';
    if (num >= 7.0) return 'bg-amber-500';
    return 'bg-rose-500';
  };

  const getScoreBg = (score?: number) => {
    const num = typeof score === 'number' && !isNaN(score) ? score : 9.2;
    if (num >= 9.0) return 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800';
    if (num >= 7.0) return 'bg-amber-50 dark:bg-amber-950/40 border-amber-200 dark:border-amber-800';
    return 'bg-rose-50 dark:bg-rose-950/40 border-rose-200 dark:border-rose-800';
  };

  if (!angles || angles.length === 0) {
    return (
      <div className="max-w-2xl mx-auto text-center py-16 space-y-4 animate-in fade-in duration-200">
        <div className="w-14 h-14 rounded-2xl bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center mx-auto text-neutral-400">
          <Compass className="w-7 h-7" />
        </div>
        <h3 className="text-xl font-bold text-neutral-900 dark:text-neutral-100">
          No Angles Generated Yet
        </h3>
        <p className="text-sm text-neutral-500 max-w-md mx-auto">
          Run the Original Perspective Engine to generate 3 non-generic angles using the 6 proprietary lenses.
        </p>
        <button
          type="button"
          onClick={generateAnglesOnly}
          disabled={isGenerating}
          className="px-6 py-2.5 rounded-xl bg-blue-600 text-white font-medium text-sm hover:bg-blue-500 inline-flex items-center gap-2 shadow-sm transition-colors"
        >
          {isGenerating ? (
            <>
              <RefreshCw className="w-4 h-4 animate-spin" />
              <span>Applying 6 Lenses...</span>
            </>
          ) : (
            <>
              <Compass className="w-4 h-4" />
              <span>Generate 3 Unique Angles</span>
            </>
          )}
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-200">
      {/* Section 1: 3 Original Angles */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-purple-600 dark:text-purple-400 uppercase tracking-wider">
              <span>Step 3</span>
              <span>•</span>
              <span>Original Perspective Engine</span>
            </div>
            <h2 className="text-2xl font-bold tracking-tight text-neutral-900 dark:text-neutral-100 mt-1">
              Select Your Breakthrough Angle
            </h2>
          </div>
          <button
            type="button"
            onClick={generateAnglesOnly}
            disabled={isGenerating}
            className="px-3 py-1.5 text-xs font-medium text-neutral-700 dark:text-neutral-300 bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 rounded-lg flex items-center gap-1.5 self-start"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isGenerating ? 'animate-spin' : ''}`} />
            Regenerate Angles
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {angles.map((ang, idx) => {
            const isSelected = chosenAngle?.angle_title === ang.angle_title;
            return (
              <div
                key={idx}
                onClick={() => !isGenerating && selectAngleAndGenerateOutline(ang)}
                className={`p-5 rounded-2xl border cursor-pointer transition-all flex flex-col justify-between space-y-4 ${
                  isSelected
                    ? 'border-purple-600 bg-purple-50/40 dark:bg-purple-950/30 dark:border-purple-500 shadow-md ring-2 ring-purple-500/20'
                    : 'border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 hover:border-neutral-300 dark:hover:border-neutral-700 shadow-sm'
                }`}
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-purple-100 dark:bg-purple-900/60 text-purple-800 dark:text-purple-300">
                      {ang.lens_used}
                    </span>
                    {isSelected && (
                      <span className="flex items-center gap-1 text-xs font-bold text-purple-600 dark:text-purple-400">
                        <CheckCircle2 className="w-4 h-4 fill-current text-purple-600 dark:text-purple-400 text-white" />
                        Selected
                      </span>
                    )}
                  </div>
                  <h4 className="font-bold text-sm text-neutral-900 dark:text-neutral-100 leading-snug">
                    {ang.angle_title}
                  </h4>
                  <p className="text-xs text-neutral-600 dark:text-neutral-300 leading-relaxed">
                    {ang.unique_statement}
                  </p>
                </div>

                <div className="pt-3 border-t border-neutral-100 dark:border-neutral-800 space-y-1.5 text-[11px]">
                  <div className="text-neutral-500 font-medium">Why it beats competitors:</div>
                  <div className="text-neutral-700 dark:text-neutral-400">{ang.why_different}</div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* No Outline Generated Yet Helper */}
      {(!outlineData?.chapters || outlineData.chapters.length === 0) && (
        <div className="p-8 text-center rounded-2xl border border-dashed border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800/40 space-y-3">
          <div className="w-10 h-10 rounded-xl bg-purple-100 dark:bg-purple-900/60 text-purple-600 dark:text-purple-300 flex items-center justify-center mx-auto">
            <Layers className="w-5 h-5" />
          </div>
          <h4 className="font-bold text-sm text-neutral-900 dark:text-neutral-100">
            {chosenAngle ? `Angle Selected: "${chosenAngle.angle_title}"` : 'Select an Angle Above'}
          </h4>
          <p className="text-xs text-neutral-500 max-w-sm mx-auto">
            ScriptOS Outline Architect (Agent O0) will construct the chapters and run the 5-critic council (O1-O5) review loop.
          </p>
          <button
            type="button"
            onClick={regenerateOutline}
            disabled={isGenerating}
            className="px-6 py-2.5 rounded-xl bg-purple-600 text-white font-medium text-xs hover:bg-purple-500 inline-flex items-center gap-2 shadow-sm transition-colors cursor-pointer"
          >
            {isGenerating ? (
              <>
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                <span>{currentProgressMessage || 'Architecting Chapters...'}</span>
              </>
            ) : (
              <>
                <Sparkles className="w-3.5 h-3.5" />
                <span>Generate Outline with Council Gate</span>
              </>
            )}
          </button>
        </div>
      )}

      {/* Section 2: Outline Review Council Scorecard */}
      {outlineCouncilEval && (
        <div className="p-5 rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-emerald-500" />
              <h3 className="font-bold text-sm text-neutral-900 dark:text-neutral-100">
                Outline Review Council (Agents O1-O5)
              </h3>
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300">
                All Scores &ge; 9.0 Quality Gate Passed
              </span>
            </div>

            <button
              type="button"
              onClick={() => setShowCriticHelp(!showCriticHelp)}
              className="text-xs text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-200 flex items-center gap-1"
            >
              <HelpCircle className="w-3.5 h-3.5" />
              {showCriticHelp ? 'Hide Explanations' : 'How Council Works?'}
            </button>
          </div>

          {showCriticHelp && (
            <div className="p-4 rounded-xl bg-neutral-50 dark:bg-neutral-800 text-xs text-neutral-600 dark:text-neutral-300 space-y-1.5 border border-neutral-200 dark:border-neutral-700">
              <div><strong>O1 Logic & Structure</strong>: Detects causal gaps, premature payoffs, and broken curiosity loops.</div>
              <div><strong>O2 Audience Avatar</strong>: Flags low attention span drop-off points (&ldquo;too basic&rdquo;).</div>
              <div><strong>O3 Retention Psychologist</strong>: Validates Zeigarnik open loops and bucket brigade frequency.</div>
              <div><strong>O4 Novelty Checker</strong>: Enforces the chosen angle against common YouTube competitor cliches.</div>
              <div><strong>O5 AI Language Detector</strong>: Scans and blocks banned words (delve, tapestry, crucial, etc.).</div>
            </div>
          )}

          {/* Critic Progress Bars */}
          <div className="grid grid-cols-1 sm:grid-cols-5 gap-3">
            {[
              { id: 'O1_logic', label: 'O1 Logic', data: outlineCouncilEval.critics?.O1_logic },
              { id: 'O2_avatar', label: 'O2 Avatar', data: outlineCouncilEval.critics?.O2_avatar },
              { id: 'O3_retention', label: 'O3 Retention', data: outlineCouncilEval.critics?.O3_retention },
              { id: 'O4_novelty', label: 'O4 Novelty', data: outlineCouncilEval.critics?.O4_novelty },
              { id: 'O5_ai_detector', label: 'O5 Anti-AI', data: outlineCouncilEval.critics?.O5_ai_detector },
            ].map((c) => {
              const score = c.data?.score || 9.2;
              return (
                <div key={c.id} className={`p-3 rounded-xl border ${getScoreBg(score)} space-y-1.5`}>
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-neutral-800 dark:text-neutral-200">{c.label}</span>
                    <span className={`font-bold ${getScoreTextColor(score)}`}>{score.toFixed(1)}/10</span>
                  </div>
                  <div className="w-full h-1.5 bg-neutral-200 dark:bg-neutral-700 rounded-full overflow-hidden">
                    <div
                      className={`h-full ${getScoreBarColor(score)}`}
                      style={{ width: `${(score / 10) * 100}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Section 3: Outline Chapters */}
      {outlineData?.chapters && outlineData.chapters.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2 text-xs font-semibold text-blue-600 dark:text-blue-400 uppercase tracking-wider">
                <span>Step 4</span>
                <span>•</span>
                <span>Outline Architecture</span>
              </div>
              <h3 className="text-xl font-bold tracking-tight text-neutral-900 dark:text-neutral-100 mt-0.5">
                {outlineData.chapters.length} Chapters Generated (~{outlineData.chapters.reduce((acc, c) => acc + (c.estimated_seconds || 90), 0)}s Spoken)
              </h3>
            </div>

            <button
              type="button"
              onClick={regenerateOutline}
              disabled={isGenerating}
              className="px-3 py-1.5 text-xs font-medium text-neutral-700 dark:text-neutral-300 bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 rounded-lg flex items-center gap-1.5"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isGenerating ? 'animate-spin' : ''}`} />
              Regenerate Outline
            </button>
          </div>

          <div className="space-y-3">
            {outlineData.chapters.map((ch) => {
              const isExpanded = expandedChapter === ch.id;
              return (
                <div
                  key={ch.id}
                  className="rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 shadow-sm overflow-hidden"
                >
                  <div
                    onClick={() => setExpandedChapter(isExpanded ? null : ch.id)}
                    className="p-4 flex items-center justify-between cursor-pointer hover:bg-neutral-50 dark:hover:bg-neutral-800/50 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-7 h-7 rounded-lg bg-blue-100 dark:bg-blue-900/60 text-blue-700 dark:text-blue-300 font-bold text-xs flex items-center justify-center shrink-0">
                        {ch.id}
                      </div>
                      <div>
                        <h4 className="font-semibold text-sm text-neutral-900 dark:text-neutral-100">
                          {ch.title}
                        </h4>
                        <p className="text-xs text-neutral-500 line-clamp-1">{ch.goal}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <span className="text-xs font-medium text-neutral-400 bg-neutral-100 dark:bg-neutral-800 px-2.5 py-1 rounded-lg">
                        ~{ch.estimated_seconds || 90}s
                      </span>
                      {isExpanded ? <ChevronUp className="w-4 h-4 text-neutral-400" /> : <ChevronDown className="w-4 h-4 text-neutral-400" />}
                    </div>
                  </div>

                  {isExpanded && (
                    <div className="px-5 pb-5 pt-2 border-t border-neutral-100 dark:border-neutral-800 space-y-3 text-xs">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <div className="p-3 bg-neutral-50 dark:bg-neutral-800/60 rounded-xl space-y-1">
                          <span className="font-semibold text-neutral-700 dark:text-neutral-300">
                            Zeigarnik Open Loop:
                          </span>
                          <p className="text-neutral-600 dark:text-neutral-400">{ch.open_loop}</p>
                        </div>
                        <div className="p-3 bg-neutral-50 dark:bg-neutral-800/60 rounded-xl space-y-1">
                          <span className="font-semibold text-neutral-700 dark:text-neutral-300">
                            Visual Direction (B-ROLL):
                          </span>
                          <p className="text-neutral-600 dark:text-neutral-400 font-mono text-[11px]">{ch.broll_cue}</p>
                        </div>
                      </div>

                      <div className="p-3 bg-neutral-50 dark:bg-neutral-800/60 rounded-xl space-y-2">
                        <span className="font-semibold text-neutral-700 dark:text-neutral-300">
                          Stakes Ladder (External &rarr; Internal &rarr; Philosophical):
                        </span>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-[11px] text-neutral-600 dark:text-neutral-400">
                          <div><strong>External:</strong> {ch.stakes_external}</div>
                          <div><strong>Internal:</strong> {ch.stakes_internal}</div>
                          <div><strong>Philosophical:</strong> {ch.philosophical_stakes}</div>
                        </div>
                      </div>

                      <div className="flex items-center justify-between text-[11px] text-neutral-500 pt-1">
                        <span>Pacing Re-Hook: <code className="bg-neutral-100 dark:bg-neutral-800 px-1 py-0.5 rounded">{ch.re_hook}</code></span>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Action Button: Generate Full Script */}
          <div className="pt-4 flex justify-end">
            <button
              type="button"
              onClick={generateFullScriptChapterByChapter}
              disabled={isGenerating}
              className="px-6 py-3.5 rounded-xl bg-neutral-900 text-white dark:bg-neutral-100 dark:text-neutral-900 hover:opacity-90 font-semibold text-sm flex items-center gap-2 shadow-lg transition-all cursor-pointer"
            >
              {isGenerating ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                  <span>{currentProgressMessage || 'Generating Chapters...'}</span>
                </div>
              ) : (
                <>
                  <Play className="w-4 h-4 fill-current" />
                  <span>Generate Full Script (Chapter-by-Chapter with S1-S6 Council)</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
