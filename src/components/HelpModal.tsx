'use client';

import React, { useState } from 'react';
import { useScriptOSStore } from '@/lib/store';
import {
  Sparkles,
  Cpu,
  Sliders,
  ShieldCheck,
  Zap,
  CheckCircle2,
  X,
  ExternalLink,
  ChevronRight,
  ChevronLeft,
  Key,
} from 'lucide-react';

export default function HelpModal() {
  const { showHelpModal, setShowHelpModal, setHasSeenOnboarding, setActiveTab } = useScriptOSStore();
  const [activeStep, setActiveStep] = useState(0);

  if (!showHelpModal) return null;

  const steps = [
    {
      title: 'Welcome to ScriptOS',
      subtitle: 'The 10/10 Retention Script Operating System',
      icon: <Sparkles className="w-8 h-8 text-amber-500" />,
      content: (
        <div className="space-y-3 text-sm text-neutral-600 dark:text-neutral-300">
          <p>
            ScriptOS is built for serious video creators, writers, and educators who refuse to produce generic AI-slop scripts.
          </p>
          <div className="p-3 bg-neutral-100 dark:bg-neutral-800/80 rounded-lg space-y-2 border border-neutral-200 dark:border-neutral-700">
            <div className="flex items-center gap-2 font-medium text-neutral-900 dark:text-neutral-100">
              <Cpu className="w-4 h-4 text-emerald-500" />
              100% Local-First Architecture
            </div>
            <p className="text-xs text-neutral-500 dark:text-neutral-400">
              Runs on 4GB-8GB RAM CPU-only PCs. All search, scraping, SQLite FTS5 database, and humanizer algorithms run locally.
            </p>
          </div>
          <p className="text-xs text-neutral-500">
            The only external call is to your chosen LLM brain (Google Gemini, OpenAI, Claude, DeepSeek, XAI Grok, or OpenRouter).
          </p>
        </div>
      ),
    },
    {
      title: 'Connecting Your LLM Brain',
      subtitle: 'Use Free Google Gemini or Your Own Keys',
      icon: <Key className="w-8 h-8 text-blue-500" />,
      content: (
        <div className="space-y-3 text-sm text-neutral-600 dark:text-neutral-300">
          <p>
            We recommend the <strong>Google Gemini API</strong> because Google provides a high-quota free tier at{' '}
            <a
              href="https://aistudio.google.com"
              target="_blank"
              rel="noreferrer"
              className="text-blue-600 dark:text-blue-400 underline inline-flex items-center gap-1"
            >
              aistudio.google.com <ExternalLink className="w-3 h-3" />
            </a>
            .
          </p>
          <ul className="list-disc pl-5 space-y-1 text-xs text-neutral-600 dark:text-neutral-400">
            <li>1. Visit AI Studio and click <strong>Get API key</strong>.</li>
            <li>2. In ScriptOS <strong>Settings</strong>, paste your key.</li>
            <li>3. Click <strong>Fetch Models</strong> to populate live available models.</li>
            <li>4. Select <strong>gemini-2.0-flash</strong> (or any model of your choice).</li>
          </ul>
          <div className="p-2.5 bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900 rounded text-xs text-blue-800 dark:text-blue-300">
            Keys are stored locally with machine-level encryption in <code className="bg-blue-100 dark:bg-blue-900/50 px-1 py-0.5 rounded">data/.env.enc</code>.
          </div>
        </div>
      ),
    },
    {
      title: 'The Original Perspective Engine',
      subtitle: '6 Lenses to Beat Generic Competitor Videos',
      icon: <Sliders className="w-8 h-8 text-purple-500" />,
      content: (
        <div className="space-y-3 text-sm text-neutral-600 dark:text-neutral-300">
          <p>
            Standard AI tools vomit the same cliches found in the top 10 YouTube search results. ScriptOS executes local research first, then applies 6 proprietary lenses:
          </p>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="p-2 bg-neutral-100 dark:bg-neutral-800 rounded border border-neutral-200 dark:border-neutral-700">
              <strong>Contrarian Reframe</strong>: Invert conventional guru advice.
            </div>
            <div className="p-2 bg-neutral-100 dark:bg-neutral-800 rounded border border-neutral-200 dark:border-neutral-700">
              <strong>Unseen Cost</strong>: Highlight the hidden price of doing it wrong.
            </div>
            <div className="p-2 bg-neutral-100 dark:bg-neutral-800 rounded border border-neutral-200 dark:border-neutral-700">
              <strong>First Principles</strong>: Atomic deconstruction of the truth.
            </div>
            <div className="p-2 bg-neutral-100 dark:bg-neutral-800 rounded border border-neutral-200 dark:border-neutral-700">
              <strong>Cross-Domain</strong>: Casino & magic tricks applied to retention.
            </div>
          </div>
        </div>
      ),
    },
    {
      title: 'The Dual Review Councils',
      subtitle: 'O1-O5 (Outline) and S1-S6 (Script) Quality Gates',
      icon: <ShieldCheck className="w-8 h-8 text-emerald-500" />,
      content: (
        <div className="space-y-3 text-sm text-neutral-600 dark:text-neutral-300">
          <p>
            ScriptOS never outputs a draft without subjecting it to our automated Review Council:
          </p>
          <ul className="space-y-2 text-xs text-neutral-600 dark:text-neutral-300">
            <li className="flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
              <span><strong>Outline Council (O1-O5)</strong>: Checks logical leaks, audience boredom points, missing open loops, and banned AI filler. Loops automatically until scores hit 9.0+.</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
              <span><strong>Script Council (S1-S6)</strong>: Evaluates spoken pacing, visual B-ROLL cues, anti-AI burstiness, factual integrity, Grade 6 simplicity, and viral payoff.</span>
            </li>
          </ul>
          <div className="p-2.5 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900 rounded text-xs text-emerald-800 dark:text-emerald-300 font-medium">
            Result: A 10/10 production script with production cues, high burstiness, and 3 A/B hook variations.
          </div>
        </div>
      ),
    },
  ];

  const handleFinish = () => {
    setShowHelpModal(false);
    setHasSeenOnboarding(true);
  };

  const handleGoSettings = () => {
    setShowHelpModal(false);
    setHasSeenOnboarding(true);
    setActiveTab('settings');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="px-6 pt-6 pb-4 flex items-center justify-between border-b border-neutral-100 dark:border-neutral-800">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-neutral-100 dark:bg-neutral-800 rounded-xl">
              {steps[activeStep].icon}
            </div>
            <div>
              <h3 className="font-semibold text-neutral-900 dark:text-neutral-100 text-lg">
                {steps[activeStep].title}
              </h3>
              <p className="text-xs text-neutral-500">
                Step {activeStep + 1} of {steps.length}: {steps[activeStep].subtitle}
              </p>
            </div>
          </div>
          <button
            onClick={() => setShowHelpModal(false)}
            className="p-1.5 rounded-lg text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 flex-1 min-h-[260px]">
          {steps[activeStep].content}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-neutral-50 dark:bg-neutral-900/60 border-t border-neutral-100 dark:border-neutral-800 flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            {steps.map((_, i) => (
              <button
                key={i}
                onClick={() => setActiveStep(i)}
                className={`w-2 h-2 rounded-full transition-all ${
                  i === activeStep ? 'w-6 bg-neutral-900 dark:bg-neutral-100' : 'bg-neutral-300 dark:bg-neutral-700'
                }`}
              />
            ))}
          </div>

          <div className="flex items-center gap-2">
            {activeStep > 0 && (
              <button
                onClick={() => setActiveStep((prev) => prev - 1)}
                className="px-3 py-1.5 text-xs font-medium text-neutral-700 dark:text-neutral-300 hover:bg-neutral-200 dark:hover:bg-neutral-800 rounded-lg flex items-center gap-1 transition-colors"
              >
                <ChevronLeft className="w-4 h-4" /> Back
              </button>
            )}

            {activeStep < steps.length - 1 ? (
              <button
                onClick={() => setActiveStep((prev) => prev + 1)}
                className="px-4 py-1.5 text-xs font-medium bg-neutral-900 text-white dark:bg-neutral-100 dark:text-neutral-900 hover:opacity-90 rounded-lg flex items-center gap-1 transition-opacity shadow-sm"
              >
                Next <ChevronRight className="w-4 h-4" />
              </button>
            ) : (
              <div className="flex items-center gap-2">
                <button
                  onClick={handleGoSettings}
                  className="px-3 py-1.5 text-xs font-medium text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/50 hover:bg-blue-100 rounded-lg transition-colors border border-blue-200 dark:border-blue-900"
                >
                  Configure API Keys
                </button>
                <button
                  onClick={handleFinish}
                  className="px-4 py-1.5 text-xs font-medium bg-emerald-600 text-white hover:bg-emerald-500 rounded-lg flex items-center gap-1 transition-colors shadow-sm"
                >
                  Get Started
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
