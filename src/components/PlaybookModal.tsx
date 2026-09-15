'use client';

import React, { useState } from 'react';
import { useScriptOSStore } from '@/lib/store';
import {
  BookOpen,
  X,
  Sparkles,
  Flame,
  ShieldCheck,
  Compass,
  Layers,
  Clock,
  Eye,
  CheckCircle2,
  AlertTriangle,
  Tv,
} from 'lucide-react';
import { BANNED_PATTERNS } from '@/lib/anti-ai-scanner';

export default function PlaybookModal() {
  const { showPlaybookModal, setShowPlaybookModal } = useScriptOSStore();
  const [activeTab, setActiveTab] = useState<'lenses' | 'hooks' | 'retention' | 'story' | 'anti_ai' | 'council'>('lenses');

  if (!showPlaybookModal) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-4xl max-h-[90vh] bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800 shadow-2xl flex flex-col overflow-hidden">
        {/* Modal Header */}
        <div className="p-5 border-b border-neutral-200 dark:border-neutral-800 flex items-center justify-between bg-neutral-50/50 dark:bg-neutral-800/30">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-sm">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-neutral-900 dark:text-neutral-100 flex items-center gap-2">
                ScriptOS Master Technique & Retention Playbook
              </h2>
              <p className="text-xs text-neutral-500">
                The attention engineering formulas and dual-council rubrics powering your scripts.
              </p>
            </div>
          </div>
          <button
            onClick={() => setShowPlaybookModal(false)}
            className="p-2 rounded-xl text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="px-5 pt-3 border-b border-neutral-200 dark:border-neutral-800 flex items-center gap-2 overflow-x-auto text-xs scrollbar-none bg-white dark:bg-neutral-900">
          {[
            { id: 'lenses', label: '6 Perspective Lenses', icon: Compass },
            { id: 'hooks', label: 'Hook Engineering', icon: Flame },
            { id: 'retention', label: 'Retention & Pacing', icon: Clock },
            { id: 'story', label: 'Story Frameworks', icon: Layers },
            { id: 'anti_ai', label: 'Anti-AI Human Voice', icon: ShieldCheck },
            { id: 'council', label: '10/10 Quality Gate', icon: Sparkles },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`pb-3 px-3 font-semibold flex items-center gap-1.5 whitespace-nowrap border-b-2 transition-all ${
                  isActive
                    ? 'border-blue-600 text-blue-600 dark:text-blue-400'
                    : 'border-transparent text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-200'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Scrollable Content Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 text-sm">
          {/* 1. Lenses Tab */}
          {activeTab === 'lenses' && (
            <div className="space-y-4">
              <div className="text-xs text-neutral-500">
                Standard AI scripts summarize what exists. ScriptOS passes your topic through 6 proprietary lenses to engineer a thesis competitors cannot duplicate.
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {[
                  {
                    name: 'Lens 1: Contrarian Reframe',
                    formula: 'Everyone says X, but actually Y is true because of Z.',
                    example: '"Your morning routine is making you lazy. High performers have no routine."',
                  },
                  {
                    name: 'Lens 2: The Unseen Cost',
                    formula: 'Expose the hidden invisible penalty of doing it wrong or waiting.',
                    example: '"This one sentence in your script quietly loses 70% of viewers by second 28."',
                  },
                  {
                    name: 'Lens 3: First Principles Deconstruction',
                    formula: 'Break the domain down to atomic biological/psychological reality.',
                    example: '"YouTube doesn\'t reward watch time. It rewards one specific dopamine loop."',
                  },
                  {
                    name: 'Lens 4: Cross-Domain Borrowing',
                    formula: 'Explain domain A using the ruthless mechanics of domain B.',
                    example: '"Top creators use the exact same variable payoff engine as casino slot machines."',
                  },
                  {
                    name: 'Lens 5: Time-Travel Inversion',
                    formula: 'Invert current consensus: what will look backwards in 5 years?',
                    example: '"In 2 years, people who use AI to write will lose. People who use AI to think will win."',
                  },
                  {
                    name: 'Lens 6: Personal Micro-Story Injection',
                    formula: 'Anchor abstract principles with visceral human struggle data.',
                    example: '"I posted 47 videos with 12 views. On day 48, I changed 4 words. It hit 420k."',
                  },
                ].map((item, idx) => (
                  <div
                    key={idx}
                    className="p-4 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50/60 dark:bg-neutral-800/40 space-y-2"
                  >
                    <h4 className="font-bold text-neutral-900 dark:text-neutral-100 text-xs text-blue-600 dark:text-blue-400 uppercase tracking-wide">
                      {item.name}
                    </h4>
                    <p className="text-xs text-neutral-600 dark:text-neutral-300 font-mono">
                      <strong>Formula:</strong> {item.formula}
                    </p>
                    <div className="p-2 rounded-lg bg-white dark:bg-neutral-900 text-xs italic text-neutral-700 dark:text-neutral-300 border border-neutral-100 dark:border-neutral-800">
                      {item.example}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 2. Hooks Tab */}
          {activeTab === 'hooks' && (
            <div className="space-y-4">
              <div className="text-xs text-neutral-500">
                The first 5 seconds dictate 80% of retention. ScriptOS synthesizes 5 proven formula variants for every script:
              </div>
              <div className="space-y-3">
                {[
                  {
                    type: '1. Forbidden Knowledge Hook',
                    formula: '"The ___ they don\'t want you to know / that no one talks about"',
                    examples: [
                      'The 3 words YouTube removed from its own creator academy.',
                      'The retention trick leaked by a top editing team on a private podcast.',
                    ],
                  },
                  {
                    type: '2. Contrarian Threat Hook',
                    formula: '"Stop doing X. Start doing Y."',
                    examples: [
                      'Stop writing hooks. Start writing threats.',
                      'Your storytelling is too good. That is why no one watches.',
                    ],
                  },
                  {
                    type: '3. High-Stakes Failure Hook',
                    formula: '"I lost ___ because of this 7-second mistake"',
                    examples: [
                      'I lost 100k subscribers because of one transition word.',
                      'I tested 100 hooks. 99 failed for the exact same second-7 reason.',
                    ],
                  },
                  {
                    type: '4. Visual Shock + Stat Hook',
                    formula: '[Show visual graph/stat], then deliver immediate pattern interrupt',
                    examples: [
                      '[Show 97% drop graph] This is what happens to your video at second 31.',
                      'MrBeast says the word "but" 17 times in 60 seconds on purpose. Here is why.',
                    ],
                  },
                  {
                    type: '5. Personal Confession Hook',
                    formula: 'Vulnerable admission that shatters authority pretense',
                    examples: [
                      'I used to write scripts like a university professor. No wonder everyone clicked off.',
                      'For a year I thought I was bad at YouTube. I was just writing for the wrong brain.',
                    ],
                  },
                ].map((hook, i) => (
                  <div
                    key={i}
                    className="p-4 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-800/30 space-y-2"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-xs text-neutral-900 dark:text-neutral-100">{hook.type}</span>
                      <span className="text-[11px] font-mono text-neutral-400">{hook.formula}</span>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                      {hook.examples.map((ex, exIdx) => (
                        <div
                          key={exIdx}
                          className="p-2.5 rounded-lg bg-white dark:bg-neutral-900 text-xs text-neutral-700 dark:text-neutral-300 border border-neutral-100 dark:border-neutral-800 italic"
                        >
                          &ldquo;{ex}&rdquo;
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 3. Retention & Pacing Tab */}
          {activeTab === 'retention' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="p-4 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-800/30 space-y-2">
                  <h4 className="font-bold text-xs text-blue-600 dark:text-blue-400 uppercase tracking-wider">
                    Zeigarnik Open Loops
                  </h4>
                  <p className="text-xs text-neutral-600 dark:text-neutral-300">
                    Withhold resolution on an intriguing promise. Maintain 2-3 open loops at all times. Only resolve Loop 1 once Loop 2 has escalated.
                  </p>
                  <div className="p-2 rounded bg-white dark:bg-neutral-900 text-xs font-mono text-neutral-700 dark:text-neutral-300 border border-neutral-100 dark:border-neutral-800">
                    &ldquo;There is a single line I will reveal at the end of this video. If you say it, retention doubles. But first...&rdquo;
                  </div>
                </div>

                <div className="p-4 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-800/30 space-y-2">
                  <h4 className="font-bold text-xs text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">
                    Bucket Brigades
                  </h4>
                  <p className="text-xs text-neutral-600 dark:text-neutral-300">
                    Short bridging triggers embedded at paragraph endings that compel uninterrupted listening:
                  </p>
                  <ul className="text-xs space-y-1 list-disc pl-4 text-neutral-700 dark:text-neutral-300">
                    <li>&ldquo;But here&apos;s what no one tells you...&rdquo;</li>
                    <li>&ldquo;And it gets worse...&rdquo;</li>
                    <li>&ldquo;This is where it gets interesting...&rdquo;</li>
                    <li>&ldquo;The real reason is not what you think...&rdquo;</li>
                  </ul>
                </div>

                <div className="p-4 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-800/30 space-y-2">
                  <h4 className="font-bold text-xs text-amber-600 dark:text-amber-400 uppercase tracking-wider">
                    The Stakes Ladder
                  </h4>
                  <p className="text-xs text-neutral-600 dark:text-neutral-300">
                    Every section must climb all 3 rungs within 60 seconds:
                  </p>
                  <div className="text-xs space-y-1">
                    <div><strong>External:</strong> You will lose views and wasted hours.</div>
                    <div><strong>Internal:</strong> Anxiety, self-doubt, and creative burnout.</div>
                    <div><strong>Philosophical:</strong> Remaining an amateur while knowing you could be a pro.</div>
                  </div>
                </div>

                <div className="p-4 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-800/30 space-y-2">
                  <h4 className="font-bold text-xs text-rose-600 dark:text-rose-400 uppercase tracking-wider">
                    Pattern Interrupts (Every 2-4s)
                  </h4>
                  <p className="text-xs text-neutral-600 dark:text-neutral-300">
                    ScriptOS automatically injects production cues into narration:
                  </p>
                  <div className="text-xs font-mono space-y-1 text-neutral-700 dark:text-neutral-300">
                    <div>[B-ROLL: Macro close-up of clock]</div>
                    <div>[SFX: Record scratch / low bass drop]</div>
                    <div>[TEXT ON SCREEN: BOLD KEYWORDS]</div>
                    <div>[RE-HOOK: &ldquo;Wait, this flips everything.&rdquo;]</div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* 4. Story Frameworks Tab */}
          {activeTab === 'story' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="p-4 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-800/30 space-y-2">
                  <h4 className="font-bold text-xs text-purple-600 dark:text-purple-400 uppercase">
                    ABT: And, But, Therefore
                  </h4>
                  <p className="text-xs text-neutral-600 dark:text-neutral-300">
                    The foundational DNA of engaging narrative sentences. Prevents monotonous &ldquo;and then, and then&rdquo; lists:
                  </p>
                  <div className="p-2.5 rounded bg-white dark:bg-neutral-900 text-xs text-neutral-700 dark:text-neutral-300 border border-neutral-100 dark:border-neutral-800">
                    &ldquo;I wanted to grow AND I posted daily, BUT nothing happened, THEREFORE I had to tear apart 100 viral scripts to find the flaw.&rdquo;
                  </div>
                </div>

                <div className="p-4 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-800/30 space-y-2">
                  <h4 className="font-bold text-xs text-blue-600 dark:text-blue-400 uppercase">
                    Dan Harmon Story Circle
                  </h4>
                  <p className="text-xs text-neutral-600 dark:text-neutral-300">
                    8-step mythic transformation applied to video structure:
                  </p>
                  <ol className="text-xs space-y-0.5 list-decimal pl-4 text-neutral-700 dark:text-neutral-300">
                    <li>Comfort &rarr; 2. Want &rarr; 3. Enter Unfamiliar</li>
                    <li>4. Adapt &rarr; 5. Find &rarr; 6. Take Price</li>
                    <li>7. Return &rarr; 8. Irrevocably Changed</li>
                  </ol>
                </div>

                <div className="p-4 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-800/30 space-y-2">
                  <h4 className="font-bold text-xs text-amber-600 dark:text-amber-400 uppercase">
                    Kishotenketsu (No-Conflict Twist)
                  </h4>
                  <p className="text-xs text-neutral-600 dark:text-neutral-300">
                    Four-act classic structure for educational & technical scripts:
                  </p>
                  <div className="text-xs space-y-1">
                    <div><strong>Ki:</strong> Introduction of the concept</div>
                    <div><strong>Sho:</strong> Development & standard mechanism</div>
                    <div><strong>Ten:</strong> The shocking Twist / Hidden trap</div>
                    <div><strong>Ketsu:</strong> Resolution & practical blueprint</div>
                  </div>
                </div>

                <div className="p-4 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-800/30 space-y-2">
                  <h4 className="font-bold text-xs text-emerald-600 dark:text-emerald-400 uppercase">
                    The TED Throughline
                  </h4>
                  <p className="text-xs text-neutral-600 dark:text-neutral-300">
                    One single unifying core thesis stated in 10 words or fewer, reinforced from new perspectives every 3 minutes.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* 5. Anti-AI Voice & Banned Words Tab */}
          {activeTab === 'anti_ai' && (
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-rose-50/50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900 text-xs text-rose-900 dark:text-rose-300">
                <strong>The Anti-AI Moat:</strong> Detectors (Originality.ai, GPTZero) look for statistical uniformity and corporate clichés. ScriptOS enforces human variance and bans all recognized AI markers.
              </div>

              <div className="space-y-2">
                <h4 className="font-bold text-xs text-neutral-900 dark:text-neutral-100 uppercase tracking-wider">
                  Master Banned Words & Automatic Replacements ({BANNED_PATTERNS.length} rules)
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                  {BANNED_PATTERNS.map((p, i) => (
                    <div
                      key={i}
                      className="p-2 rounded-lg bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-xs flex items-center justify-between"
                    >
                      <span className="line-through text-rose-600 dark:text-rose-400 font-mono">{p.phrase}</span>
                      <span className="text-neutral-400">&rarr;</span>
                      <span className="font-bold text-emerald-600 dark:text-emerald-400 font-mono">
                        {p.replacement || '(delete)'}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
                <div className="p-3 rounded-xl bg-neutral-50 dark:bg-neutral-800/50 border border-neutral-200 dark:border-neutral-700 space-y-1">
                  <div className="font-bold text-xs text-blue-600">High Burstiness</div>
                  <p className="text-xs text-neutral-500">
                    Mix 3-word punchy fragments with 20-word rolling explanations. Standard deviation &gt; 4.5 words.
                  </p>
                </div>
                <div className="p-3 rounded-xl bg-neutral-50 dark:bg-neutral-800/50 border border-neutral-200 dark:border-neutral-700 space-y-1">
                  <div className="font-bold text-xs text-purple-600">Conversational Flaws</div>
                  <p className="text-xs text-neutral-500">
                    Start with And, But, So. Include self-corrections: &ldquo;Actually wait, that is wrong.&rdquo;
                  </p>
                </div>
                <div className="p-3 rounded-xl bg-neutral-50 dark:bg-neutral-800/50 border border-neutral-200 dark:border-neutral-700 space-y-1">
                  <div className="font-bold text-xs text-emerald-600">Extreme Specificity</div>
                  <p className="text-xs text-neutral-500">
                    Replace &ldquo;many people&rdquo; with &ldquo;my friend Alex posted 40 videos with 20 views&rdquo;.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* 6. 10/10 Quality Gate Rubric */}
          {activeTab === 'council' && (
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 text-xs text-emerald-900 dark:text-emerald-300">
                <strong>The 55/60 Rule:</strong> ScriptOS will not mark a script as Production-Ready unless the aggregate council score across all 6 dimensions exceeds 55.0 / 60.0.
              </div>

              <div className="space-y-2">
                {[
                  { metric: '1. Hook Impact (/10)', question: 'Would a distracted viewer stop scrolling in under 2 seconds?' },
                  { metric: '2. Stakes Ladder (/10)', question: 'Are External, Internal, and Philosophical consequences clear in 60 seconds?' },
                  { metric: '3. Novelty Angle (/10)', question: 'Does this contain at least one counter-intuitive insight missing from top 10 competitors?' },
                  { metric: '4. Retention Loops (/10)', question: 'Are 2 to 3 open loops active at all times with tightly-timed payoffs?' },
                  { metric: '5. Human Voice (/10)', question: 'Zero banned words, burstiness > 7.0, and passes anti-AI detection (<10% flag)?' },
                  { metric: '6. Payoff Delivery (/10)', question: 'Does the final chapter overdeliver on the title promise by at least 20%?' },
                ].map((row, i) => (
                  <div
                    key={i}
                    className="p-3 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 flex items-center justify-between text-xs"
                  >
                    <span className="font-bold text-neutral-900 dark:text-neutral-100">{row.metric}</span>
                    <span className="text-neutral-500 italic">{row.question}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-800/40 flex items-center justify-between">
          <span className="text-xs text-neutral-500">
            All agents (O1-O5 & S1-S6) enforce these exact rubrics.
          </span>
          <button
            type="button"
            onClick={() => setShowPlaybookModal(false)}
            className="px-4 py-2 text-xs font-semibold bg-neutral-900 text-white dark:bg-neutral-100 dark:text-neutral-900 rounded-xl hover:opacity-90 transition-opacity"
          >
            Close Playbook
          </button>
        </div>
      </div>
    </div>
  );
}
