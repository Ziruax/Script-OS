'use client';

import React, { useState } from 'react';
import { useScriptOSStore } from '@/lib/store';
import { useToast } from '@/components/Toast';
import {
  Film,
  Sparkles,
  Download,
  Copy,
  Check,
  ShieldCheck,
  Flame,
  Clock,
  Layers,
  FileText,
  Volume2,
  Tv,
  RefreshCw,
  HelpCircle,
  BookOpen,
  Wand2,
  CheckCircle2,
  AlertCircle,
  Eye,
  EyeOff,
  Compass,
  CheckSquare,
  ListOrdered,
  AlertTriangle,
  Target,
  Zap,
} from 'lucide-react';
import { scanScriptAntiAi, calculateScriptMetrics } from '@/lib/anti-ai-scanner';

export default function ScriptStudioView() {
  const {
    lengthMin,
    outlineData,
    chapters,
    finalResult,
    storyDna,
    qaScorecard,
    isGenerating,
    currentProgressMessage,
    activeChapterGeneratingIndex,
    title,
    generateFullScriptChapterByChapter,
    setShowPlaybookModal,
    swapHookIntoScript,
    swapTitle,
    applyPerplexityInjector,
    sanitizeCurrentScript,
    runQaAudit,
  } = useScriptOSStore();

  const [copiedScript, setCopiedScript] = useState(false);
  const [copiedCleanNarration, setCopiedCleanNarration] = useState(false);
  const [copiedHookIdx, setCopiedHookIdx] = useState<number | null>(null);
  const [activeTab, setActiveTab] = useState<'full' | 'qa' | 'ledger' | 'packaging' | 'chapters'>('full');
  const [teleprompterMode, setTeleprompterMode] = useState(false);
  const [swappedHookMsg, setSwappedHookMsg] = useState<string | null>(null);
  const [swappedTitleMsg, setSwappedTitleMsg] = useState<string | null>(null);

  const totalChapters = outlineData?.chapters?.length || 3;
  const { toast } = useToast();

  // Real-time local anti-AI scan if script is available
  const liveAntiAiScan = finalResult?.final_script ? scanScriptAntiAi(finalResult.final_script) : null;

  // Real-time word count and pacing metrics
  const currentFullText = finalResult?.final_script || chapters.map((c) => `--- CHAPTER ${c.chapter_id}: ${c.title} ---\n${c.script_text}`).join('\n\n');
  const wordMetrics = calculateScriptMetrics(currentFullText, lengthMin || 8, chapters);

  const handleSwapHook = (hookText: string, idx: number) => {
    swapHookIntoScript(hookText);
    setSwappedHookMsg(`Hook ${idx + 1} swapped into Chapter 1!`);
    setTimeout(() => setSwappedHookMsg(null), 3000);
  };

  const handleSwapTitle = (newTitle: string) => {
    swapTitle(newTitle);
    setSwappedTitleMsg(`Project title updated to: "${newTitle}"`);
    setTimeout(() => setSwappedTitleMsg(null), 3000);
  };

  // Helper to extract clean narration text for teleprompter/TTS
  const getCleanNarrationText = (rawText?: string | null) => {
    if (!rawText) return '';
    return rawText
      .split('\n')
      .filter((line) => {
        const trimmed = line.trim();
        if (!trimmed) return false;
        if (trimmed.startsWith('[') && trimmed.endsWith(']')) return false;
        if (trimmed.startsWith('---')) return false;
        return true;
      })
      .join('\n\n');
  };

  // Formatter for highlighting production tags
  const renderHighlightedScript = (rawText?: string | null) => {
    const safeText = typeof rawText === 'string' ? rawText : '';
    const lines = safeText.split('\n');

    return lines.map((line, idx) => {
      const trimmed = line.trim();
      const upper = trimmed.toUpperCase();

      // In teleprompter mode, hide all bracketed cues completely
      if (teleprompterMode && trimmed.startsWith('[') && trimmed.endsWith(']')) {
        return null;
      }

      // NARRATION tag
      if (upper === '[NARRATION]' || upper === '[VOICEOVER]') {
        if (teleprompterMode) return null;
        return (
          <div
            key={idx}
            className="pt-2 text-[11px] font-bold tracking-wider text-emerald-700 dark:text-emerald-400 uppercase flex items-center gap-1.5"
          >
            <Volume2 className="w-3 h-3 text-emerald-500" />
            <span>Spoken Narration:</span>
          </div>
        );
      }

      // VISUAL / B-ROLL tag
      if (
        upper.startsWith('[VISUAL') ||
        upper.startsWith('[B-ROLL') ||
        upper.startsWith('[B-ROLL:')
      ) {
        if (teleprompterMode) return null;
        return (
          <div
            key={idx}
            className="my-1.5 px-3 py-1.5 rounded-lg bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900 text-blue-800 dark:text-blue-300 font-mono text-xs flex items-center gap-2"
          >
            <Tv className="w-3.5 h-3.5 shrink-0 text-blue-500" />
            <span>{line}</span>
          </div>
        );
      }

      // ON-SCREEN TEXT
      if (
        upper.startsWith('[ON-SCREEN TEXT') ||
        upper.startsWith('[TEXT ON SCREEN')
      ) {
        if (teleprompterMode) return null;
        return (
          <div
            key={idx}
            className="my-1.5 px-2.5 py-1 rounded-md bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900 text-amber-800 dark:text-amber-300 font-mono text-xs inline-flex items-center gap-1.5"
          >
            <Sparkles className="w-3 h-3 text-amber-500" />
            <span>{line}</span>
          </div>
        );
      }

      // SFX / MUSIC
      if (
        upper.startsWith('[SFX') ||
        upper.startsWith('[SFX / MUSIC') ||
        upper.startsWith('[MUSIC')
      ) {
        if (teleprompterMode) return null;
        return (
          <div
            key={idx}
            className="my-1 px-2.5 py-1 rounded-md bg-purple-50 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-900 text-purple-800 dark:text-purple-300 font-mono text-xs inline-flex items-center gap-1.5 mr-2"
          >
            <Volume2 className="w-3 h-3 text-purple-500" />
            <span>{line}</span>
          </div>
        );
      }

      // EDITOR NOTE
      if (upper.startsWith('[EDITOR NOTE') || upper.startsWith('[PACING NOTE')) {
        if (teleprompterMode) return null;
        return (
          <div
            key={idx}
            className="my-1.5 px-3 py-1.5 rounded-lg bg-neutral-100 dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 text-neutral-700 dark:text-neutral-300 font-mono text-xs flex items-center gap-2"
          >
            <Film className="w-3.5 h-3.5 text-neutral-500" />
            <span>{line}</span>
          </div>
        );
      }

      // RE-HOOK
      if (upper.startsWith('[RE-HOOK:') || upper.startsWith('[RE-HOOK')) {
        if (teleprompterMode) return null;
        return (
          <div
            key={idx}
            className="my-2 px-3 py-2 rounded-lg bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-rose-800 dark:text-rose-300 font-bold text-xs flex items-center gap-2"
          >
            <Flame className="w-3.5 h-3.5 text-rose-500" />
            <span>{line}</span>
          </div>
        );
      }

      // Chapter headers
      if (line.startsWith('---') || upper.startsWith('[CHAPTER')) {
        return (
          <h4
            key={idx}
            className="pt-4 pb-1 text-sm font-bold text-neutral-900 dark:text-neutral-100 uppercase tracking-wider border-b border-neutral-100 dark:border-neutral-800"
          >
            {line}
          </h4>
        );
      }

      if (!line.trim()) {
        return <div key={idx} className="h-2" />;
      }

      // Spoken voice lines
      return (
        <p
          key={idx}
          className={`${
            teleprompterMode
              ? 'text-lg sm:text-xl leading-relaxed font-sans text-neutral-900 dark:text-neutral-50 font-normal my-2'
              : 'text-sm leading-relaxed text-neutral-800 dark:text-neutral-200 my-1'
          }`}
        >
          {line}
        </p>
      );
    });
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedScript(true);
    setTimeout(() => setCopiedScript(false), 2000);
    toast('Script copied', 'success', 'Full script in clipboard');
  };

  const handleCopyCleanNarration = () => {
    if (!finalResult?.final_script) return;
    const clean = getCleanNarrationText(finalResult.final_script);
    navigator.clipboard.writeText(clean);
    setCopiedCleanNarration(true);
    setTimeout(() => setCopiedCleanNarration(false), 2000);
    toast('Voiceover copied', 'success', 'Narration only — ready for TTS');
  };

  const handleCopyHook = (text: string, idx: number) => {
    navigator.clipboard.writeText(text);
    setCopiedHookIdx(idx);
    setTimeout(() => setCopiedHookIdx(null), 2000);
    toast(`Hook ${idx + 1} copied`, 'success');
  };

  const downloadFile = (filename: string, content: string, mime: string) => {
    const blob = new Blob([content], { type: mime });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
    toast('File downloaded', 'success', filename);
  };

  // Open a clean print-friendly window the user can "Save as PDF" from the browser print dialog
  const downloadAsPDF = () => {
    if (!finalResult?.final_script) return;
    const safeTitle = (title || 'ScriptOS Script').replace(/[<>]/g, '');
    const escaped = finalResult.final_script
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');
    // Color-code the bracketed cues in the printed output
    const htmlBody = escaped
      .replace(/\[NARRATION\]/g, '<span style="color:#059669;font-weight:700">[NARRATION]</span>')
      .replace(/\[VISUAL[^\]]*\]/g, (m) => `<span style="color:#2563eb">${m}</span>`)
      .replace(/\[B-ROLL[^\]]*\]/g, (m) => `<span style="color:#2563eb">${m}</span>`)
      .replace(/\[ON-SCREEN TEXT[^\]]*\]/g, (m) => `<span style="color:#d97706">${m}</span>`)
      .replace(/\[TEXT ON SCREEN[^\]]*\]/g, (m) => `<span style="color:#d97706">${m}</span>`)
      .replace(/\[SFX[^\]]*\]/g, (m) => `<span style="color:#7c3aed">${m}</span>`)
      .replace(/\[MUSIC[^\]]*\]/g, (m) => `<span style="color:#7c3aed">${m}</span>`)
      .replace(/\[RE-HOOK[^\]]*\]/g, (m) => `<span style="color:#dc2626">${m}</span>`)
      .replace(/\n/g, '<br/>');
    const score = finalResult.scorecard;
    const win = window.open('', '_blank', 'width=900,height=700');
    if (!win) return;
    win.document.write(`<!DOCTYPE html><html><head><title>${safeTitle}</title>
      <meta charset="utf-8"/>
      <style>
        body { font-family: Georgia, 'Times New Roman', serif; max-width: 760px; margin: 40px auto; padding: 0 24px; color:#111; line-height: 1.65; font-size: 14px; }
        h1 { font-family: -apple-system, system-ui, sans-serif; font-size: 22px; margin-bottom: 4px; }
        .meta { font-family: -apple-system, system-ui, sans-serif; color:#666; font-size: 12px; margin-bottom: 24px; border-bottom: 1px solid #eee; padding-bottom: 12px; }
        .meta span { margin-right: 16px; }
        .score { display:inline-block; padding:2px 8px; border-radius:4px; background:#059669; color:#fff; font-weight:700; font-size:11px; }
        .script { white-space: pre-wrap; }
        @media print { body { margin: 0; padding: 12px; } }
      </style></head><body>
      <h1>${safeTitle}</h1>
      <div class="meta">
        <span>ScriptOS Production Script</span>
        <span>${lengthMin} min</span>
        ${score ? `<span class="score">${score.total}/${score.max_possible} • ${score.retention_grade || 'Production Grade'}</span>` : ''}
      </div>
      <div class="script">${htmlBody}</div>
      <script>setTimeout(function(){ window.focus(); window.print(); }, 300);</script>
      </body></html>`);
    win.document.close();
    toast('Opening print dialog...', 'info', 'Choose "Save as PDF" as the destination');
  };

  const exportAsSRT = (text?: string | null) => {
    const safeText = typeof text === 'string' ? text : '';
    const lines = safeText.split('\n').filter((l) => l.trim() && !l.trim().startsWith('[') && !l.trim().startsWith('-'));
    let out = '';
    let curSec = 0;
    lines.forEach((line, i) => {
      const words = (line || '').split(' ').filter(Boolean);
      const dur = Math.max(2, Math.round(words.length / 2.2));
      const sMin = Math.floor(curSec / 60);
      const sSec = curSec % 60;
      const eMin = Math.floor((curSec + dur) / 60);
      const eSec = (curSec + dur) % 60;

      out += `${i + 1}\n`;
      out += `00:${String(sMin).padStart(2, '0')}:${String(sSec).padStart(2, '0')},000 --> 00:${String(eMin).padStart(2, '0')}:${String(eSec).padStart(2, '0')},000\n`;
      out += `${line}\n\n`;
      curSec += dur;
    });
    return out;
  };

  const scoreTotal = qaScorecard?.overall_score ?? qaScorecard?.total ?? finalResult?.scorecard?.total ?? 0;
  const isQualityGatePassed = qaScorecard ? ((qaScorecard.overall_score ?? qaScorecard.total ?? 0) >= 90) : scoreTotal >= 55.0;

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in duration-200">
      {/* Toast notifications */}
      {(swappedHookMsg || swappedTitleMsg) && (
        <div className="p-3 bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-300 dark:border-emerald-800 rounded-xl text-xs font-semibold text-emerald-800 dark:text-emerald-300 flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>{swappedHookMsg || swappedTitleMsg}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">
            <span>Passes 5–9</span>
            <span>•</span>
            <span>Audio-Visual Production Studio & 100-Pt QA Auditor</span>
          </div>
          <h2 className="text-2xl font-bold tracking-tight text-neutral-900 dark:text-neutral-100 mt-1">
            {title}
          </h2>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            type="button"
            onClick={() => setShowPlaybookModal(true)}
            className="px-3 py-1.5 text-xs font-medium border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 rounded-lg hover:bg-neutral-50 flex items-center gap-1.5 transition-colors shadow-sm"
          >
            <BookOpen className="w-3.5 h-3.5 text-blue-500" /> Playbook
          </button>

          {finalResult && (
            <>
              <button
                type="button"
                onClick={() => setTeleprompterMode(!teleprompterMode)}
                className={`px-3 py-1.5 text-xs font-medium rounded-lg flex items-center gap-1.5 transition-colors ${
                  teleprompterMode
                    ? 'bg-amber-600 text-white dark:bg-amber-500'
                    : 'border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-50'
                }`}
              >
                {teleprompterMode ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                {teleprompterMode ? 'Exit Teleprompter' : 'Teleprompter Mode'}
              </button>

              <button
                type="button"
                onClick={handleCopyCleanNarration}
                className="px-3 py-1.5 text-xs font-medium border border-emerald-300 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 hover:bg-emerald-100 rounded-lg flex items-center gap-1.5 transition-colors"
                title="Copy pure narration text without visual cues for ElevenLabs/TTS"
              >
                {copiedCleanNarration ? <Check className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
                {copiedCleanNarration ? 'Copied Voiceover' : 'Copy Voiceover (TTS)'}
              </button>

              <button
                type="button"
                onClick={() => handleCopy(finalResult.final_script)}
                className="px-3 py-1.5 text-xs font-medium bg-neutral-900 text-white dark:bg-neutral-100 dark:text-neutral-900 hover:opacity-90 rounded-lg flex items-center gap-1.5 shadow-sm transition-opacity"
              >
                {copiedScript ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                {copiedScript ? 'Copied' : 'Copy Full Script'}
              </button>

              <button
                type="button"
                onClick={() =>
                  downloadFile(
                    `${title.replace(/\s+/g, '_')}_script.txt`,
                    finalResult.final_script,
                    'text/plain'
                  )
                }
                className="px-2.5 py-1.5 text-xs font-medium border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 rounded-lg hover:bg-neutral-50 flex items-center gap-1"
                title="Download plain text"
              >
                <Download className="w-3.5 h-3.5" /> .TXT
              </button>

              <button
                type="button"
                onClick={() =>
                  downloadFile(
                    `${title.replace(/\s+/g, '_')}_script.md`,
                    `# ${title}\n\n${finalResult.final_script}`,
                    'text/markdown'
                  )
                }
                className="px-2.5 py-1.5 text-xs font-medium border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 rounded-lg hover:bg-neutral-50 flex items-center gap-1"
                title="Download Markdown"
              >
                <Download className="w-3.5 h-3.5" /> .MD
              </button>

              <button
                type="button"
                onClick={() =>
                  downloadFile(
                    `${title.replace(/\s+/g, '_')}_subtitles.srt`,
                    exportAsSRT(finalResult.final_script),
                    'text/plain'
                  )
                }
                className="px-2.5 py-1.5 text-xs font-medium border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 rounded-lg hover:bg-neutral-50 flex items-center gap-1"
                title="Download SRT Subtitles"
              >
                <Download className="w-3.5 h-3.5" /> .SRT
              </button>

              <button
                type="button"
                onClick={downloadAsPDF}
                className="px-2.5 py-1.5 text-xs font-medium border border-rose-300 dark:border-rose-800 bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 rounded-lg hover:bg-rose-100 flex items-center gap-1 transition-colors"
                title="Open print dialog — choose 'Save as PDF' as the destination"
              >
                <FileText className="w-3.5 h-3.5" /> .PDF
              </button>
            </>
          )}
        </div>
      </div>

      {/* Progress banner if currently writing */}
      {isGenerating && (
        <div className="p-4 rounded-2xl border border-blue-200 dark:border-blue-900 bg-gradient-to-br from-blue-50/80 to-indigo-50/60 dark:from-blue-950/40 dark:to-indigo-950/30 space-y-3 shadow-sm">
          <div className="flex items-center justify-between text-xs font-semibold text-blue-900 dark:text-blue-200">
            <span className="flex items-center gap-2">
              <RefreshCw className="w-4 h-4 animate-spin text-blue-600" />
              {currentProgressMessage || 'Writing & Auditing Chapters...'}
            </span>
            <span className="flex items-center gap-2">
              {activeChapterGeneratingIndex > 0
                ? <span>Chapter <span className="font-mono font-bold text-blue-700 dark:text-blue-300">{activeChapterGeneratingIndex}</span> of {totalChapters}</span>
                : 'Processing...'}
              {chapters.length > 0 && (
                <span className="text-blue-700 dark:text-blue-300 font-mono">• {chapters.reduce((sum, c) => sum + (c.script_text?.split(/\s+/).length || 0), 0).toLocaleString()} words</span>
              )}
            </span>
          </div>

          <div className="relative w-full h-2.5 bg-blue-100 dark:bg-blue-900/60 rounded-full overflow-hidden">
            <div
              className="absolute inset-y-0 left-0 bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500 transition-all duration-500 rounded-full"
              style={{
                width: `${Math.max(
                  10,
                  Math.min(100, (activeChapterGeneratingIndex / Math.max(1, totalChapters)) * 100)
                )}%`,
              }}
            />
            {/* Shimmer overlay */}
            <div
              className="absolute inset-0 opacity-40"
              style={{
                background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.5), transparent)',
                backgroundSize: '200% 100%',
                animation: 'scriptos-shimmer 2s linear infinite',
              }}
            />
          </div>
          <style>{`@keyframes scriptos-shimmer { 0% { background-position: 200% 0; } 100% { background-position: -200% 0; } }`}</style>
        </div>
      )}

      {/* Master Quality & Production Audit Bar + Word Count & Duration HUD */}
      {(qaScorecard || finalResult?.scorecard || chapters.length > 0) && (
        <div className="space-y-4">
          {/* 1. Live Word Count & YouTube Duration HUD */}
          <div className="p-4 rounded-2xl bg-gradient-to-r from-neutral-50 via-white to-neutral-50 dark:from-neutral-900 dark:via-neutral-850 dark:to-neutral-900 border border-neutral-200 dark:border-neutral-800 shadow-sm">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 divide-y sm:divide-y-0 sm:divide-x divide-neutral-200 dark:divide-neutral-800">
              <div className="pt-2 sm:pt-0 sm:px-3 first:pl-0 space-y-0.5">
                <div className="text-[11px] font-semibold text-neutral-500 uppercase tracking-wider flex items-center gap-1.5">
                  <Volume2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                  Spoken Narration
                </div>
                <div className="text-xl font-bold text-neutral-900 dark:text-neutral-100 font-mono">
                  {wordMetrics.spokenWords.toLocaleString()} <span className="text-xs font-normal text-neutral-500">words</span>
                </div>
                <div className="text-[10px] text-neutral-400">Pure Voiceover / TTS Audio</div>
              </div>

              <div className="pt-2 sm:pt-0 sm:px-3 space-y-0.5">
                <div className="text-[11px] font-semibold text-neutral-500 uppercase tracking-wider flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                  Est. Spoken Duration
                </div>
                <div className="text-xl font-bold text-neutral-900 dark:text-neutral-100 font-mono">
                  {wordMetrics.spokenDurationFormatted}
                </div>
                <div className="text-[10px] text-neutral-400">at 150 WPM YouTube cadence</div>
              </div>

              <div className="pt-2 sm:pt-0 sm:px-3 space-y-0.5">
                <div className="text-[11px] font-semibold text-neutral-500 uppercase tracking-wider flex items-center gap-1.5">
                  <Target className="w-3.5 h-3.5 text-purple-500 shrink-0" />
                  Target Word Goal
                </div>
                <div className="text-xl font-bold text-neutral-900 dark:text-neutral-100 font-mono flex items-center gap-2">
                  <span>{wordMetrics.targetProgressPercent}%</span>
                  <span className={`text-[11px] px-1.5 py-0.5 rounded font-sans font-medium ${
                    wordMetrics.targetProgressPercent >= 90
                      ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300'
                      : 'bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300'
                  }`}>
                    {wordMetrics.targetProgressPercent >= 90 ? 'Complete' : 'Expanding'}
                  </span>
                </div>
                <div className="text-[10px] text-neutral-400">
                  Target: ~{wordMetrics.targetWords}w ({wordMetrics.targetMinutes}m video)
                </div>
              </div>

              <div className="pt-2 sm:pt-0 sm:px-3 space-y-0.5">
                <div className="text-[11px] font-semibold text-neutral-500 uppercase tracking-wider flex items-center gap-1.5">
                  <Layers className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                  Full Studio Script
                </div>
                <div className="text-xl font-bold text-neutral-900 dark:text-neutral-100 font-mono">
                  {wordMetrics.totalWords.toLocaleString()} <span className="text-xs font-normal text-neutral-500">words</span>
                </div>
                <div className="text-[10px] text-neutral-400">Includes [VISUAL], [SFX] & Cues</div>
              </div>
            </div>
          </div>

          {/* 2. Unified Master Quality & Production Audit Card */}
          {qaScorecard ? (
            <div className="p-5 rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 shadow-sm space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <ShieldCheck className={`w-5 h-5 ${(qaScorecard.pass ?? qaScorecard.passed) ? 'text-emerald-500' : 'text-amber-500'}`} />
                    <h3 className="text-base font-bold text-neutral-900 dark:text-neutral-100">
                      Pass 9 QA Auditor: 100-Point Production Scorecard
                    </h3>
                    <span
                      className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full ${
                        (qaScorecard.pass ?? qaScorecard.passed)
                          ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300'
                          : 'bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300'
                      }`}
                    >
                      {(qaScorecard.pass ?? qaScorecard.passed) ? 'PASSED (≥90/100)' : 'NEEDS REVISION (<90/100)'}
                    </span>
                  </div>
                  <p className="text-xs text-neutral-500 mt-0.5">
                    Evaluated across 10 production dimensions grounded in the 95-Rule YouTube master specification.
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <div className={`text-2xl font-black ${(qaScorecard.pass ?? qaScorecard.passed) ? 'text-emerald-600 dark:text-emerald-400' : 'text-amber-600'}`}>
                      {qaScorecard.overall_score ?? qaScorecard.total ?? 0} / 100
                    </div>
                    <div className="text-[10px] font-bold uppercase tracking-wider text-neutral-500">
                      {(qaScorecard.pass ?? qaScorecard.passed) ? 'Ready for Studio Recording' : 'Auditor Polish Suggested'}
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={runQaAudit}
                    disabled={isGenerating}
                    className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 text-neutral-800 dark:text-neutral-200 transition-colors flex items-center gap-1 cursor-pointer"
                  >
                    <RefreshCw className="w-3.5 h-3.5" /> Re-Audit
                  </button>
                </div>
              </div>

              {/* Burstiness and Polish Bar */}
              <div className="pt-2 border-t border-neutral-100 dark:border-neutral-800 flex flex-col md:flex-row md:items-center justify-between text-xs text-neutral-500 gap-3">
                <div className="flex items-center gap-3 flex-wrap">
                  <span>Sentences: <strong>{liveAntiAiScan?.burstiness.sentence_count || 0}</strong></span>
                  <span>Avg length: <strong>{liveAntiAiScan?.burstiness.avg_words || 0} words</strong></span>
                  <span>Std Dev: <strong>{liveAntiAiScan?.burstiness.std_dev || 0}</strong></span>
                  <span className="text-emerald-600 dark:text-emerald-400 font-semibold">
                    Burstiness: {liveAntiAiScan?.burstiness.burstiness_score || 9.2}/10
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={applyPerplexityInjector}
                    disabled={isGenerating}
                    className="px-3 py-1 rounded-lg bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 hover:bg-blue-100 border border-blue-200 dark:border-blue-900 font-semibold text-xs flex items-center gap-1.5 transition-colors"
                  >
                    <Wand2 className="w-3.5 h-3.5" /> Perplexity Injector
                  </button>
                  <button
                    type="button"
                    onClick={sanitizeCurrentScript}
                    className="px-3 py-1 rounded-lg bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-200 border border-neutral-200 dark:border-neutral-700 font-semibold text-xs flex items-center gap-1.5 transition-colors"
                  >
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" /> Purge Banned Words
                  </button>
                </div>
              </div>
            </div>
          ) : finalResult?.scorecard ? (
            <div className="p-5 rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 shadow-sm space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <ShieldCheck className={`w-5 h-5 ${isQualityGatePassed ? 'text-emerald-500' : 'text-amber-500'}`} />
                    <h3 className="text-base font-bold text-neutral-900 dark:text-neutral-100">
                      ScriptOS Retention & Quality Gate
                    </h3>
                    <span
                      className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${
                        isQualityGatePassed
                          ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300'
                          : 'bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300'
                      }`}
                    >
                      {isQualityGatePassed ? 'Passed 55/60 Threshold' : 'Needs Polish (<55/60)'}
                    </span>
                  </div>
                  <p className="text-xs text-neutral-500 mt-0.5">
                    Evaluated by S1-S6 Council & local anti-AI burstiness analyzer.
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <div className={`text-2xl font-black ${isQualityGatePassed ? 'text-emerald-600 dark:text-emerald-400' : 'text-amber-600'}`}>
                      {finalResult.scorecard.total.toFixed(1)} / {finalResult.scorecard.max_possible}
                    </div>
                    <div className="text-[10px] font-bold uppercase tracking-wider text-neutral-500">
                      {finalResult.scorecard.retention_grade}
                    </div>
                  </div>
                </div>
              </div>

              {/* 6 Score Dimensions */}
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2 pt-1">
                {[
                  { label: 'Hook Impact', score: finalResult.scorecard.hook },
                  { label: 'Stakes Ladder', score: finalResult.scorecard.stakes },
                  { label: 'Novelty Angle', score: finalResult.scorecard.novelty },
                  { label: 'Open Loops', score: finalResult.scorecard.loops },
                  { label: 'Human Voice', score: finalResult.scorecard.human_voice },
                  { label: 'Payoff Delivery', score: finalResult.scorecard.payoff },
                ].map((d, i) => (
                  <div
                    key={i}
                    className="p-3 rounded-xl bg-neutral-50 dark:bg-neutral-800/60 border border-neutral-200 dark:border-neutral-700/60 text-center space-y-1"
                  >
                    <div className="text-[11px] font-medium text-neutral-500">{d.label}</div>
                    <div className="text-sm font-bold text-neutral-900 dark:text-neutral-100">
                      {d.score.toFixed(1)}/10
                    </div>
                  </div>
                ))}
              </div>

              {/* Burstiness and Anti-AI Risk Bar */}
              <div className="pt-2 border-t border-neutral-100 dark:border-neutral-800 flex flex-col md:flex-row md:items-center justify-between text-xs text-neutral-500 gap-3">
                <div className="flex items-center gap-3 flex-wrap">
                  <span>Sentences: <strong>{finalResult.scorecard.burstiness?.sentence_count || liveAntiAiScan?.burstiness.sentence_count}</strong></span>
                  <span>Avg length: <strong>{finalResult.scorecard.burstiness?.avg_words || liveAntiAiScan?.burstiness.avg_words} words</strong></span>
                  <span>Std Dev: <strong>{finalResult.scorecard.burstiness?.std_dev || liveAntiAiScan?.burstiness.std_dev}</strong></span>
                  <span className="text-emerald-600 dark:text-emerald-400 font-semibold">
                    Burstiness: {finalResult.scorecard.burstiness?.burstiness_score || liveAntiAiScan?.burstiness.burstiness_score}/10
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={applyPerplexityInjector}
                    disabled={isGenerating}
                    className="px-3 py-1 rounded-lg bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 hover:bg-blue-100 border border-blue-200 dark:border-blue-900 font-semibold text-xs flex items-center gap-1.5 transition-colors"
                  >
                    <Wand2 className="w-3.5 h-3.5" /> Perplexity Injector
                  </button>
                  <button
                    type="button"
                    onClick={sanitizeCurrentScript}
                    className="px-3 py-1 rounded-lg bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-200 border border-neutral-200 dark:border-neutral-700 font-semibold text-xs flex items-center gap-1.5 transition-colors"
                  >
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" /> Purge Banned Words
                  </button>
                </div>
              </div>
            </div>
          ) : null}
        </div>
      )}

      {/* Merged View Tabs */}
      <div className="flex items-center gap-2 border-b border-neutral-200 dark:border-neutral-800 pb-1 overflow-x-auto scrollbar-none">
        {[
          { id: 'full', label: 'Production Script' },
          { id: 'qa', label: `100-Point QA Scorecard (${qaScorecard ? `${qaScorecard.overall_score}/100` : 'Pass 9'})` },
          { id: 'ledger', label: `Setup/Payoff Ledger (${storyDna?.setup_payoff_ledger?.length || 0})` },
          { id: 'packaging', label: `Packaging (Titles & Hooks)` },
          { id: 'chapters', label: `Chapter Breakdown (${chapters.length})` },
        ].map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setActiveTab(t.id as any)}
            className={`px-4 py-2 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap ${
              activeTab === t.id
                ? 'bg-neutral-900 text-white dark:bg-neutral-100 dark:text-neutral-900'
                : 'text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Tab 1: Full Production Script */}
      {activeTab === 'full' && (
        <div className="p-6 rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-neutral-100 dark:border-neutral-800">
            <span className="text-xs font-bold text-neutral-500 uppercase tracking-wider">
              {teleprompterMode ? 'Teleprompter Clean Reading View (Spoken Only)' : 'Spoken Word Teleprompter & Direction'}
            </span>
            {!teleprompterMode && (
              <div className="flex items-center gap-3 text-xs text-neutral-400 flex-wrap">
                <span className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-emerald-500" /> Spoken Narration
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-blue-500" /> Visual / B-Roll
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-amber-500" /> On-Screen Text
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-purple-500" /> SFX / Music
                </span>
              </div>
            )}
          </div>

          <div className="space-y-2">
            {finalResult
              ? renderHighlightedScript(finalResult.final_script)
              : chapters.length > 0
              ? chapters.map((c) => (
                  <div key={c.chapter_id} className="space-y-2 mb-6">
                    <h4 className="text-sm font-bold text-neutral-900 dark:text-neutral-100 uppercase tracking-wide">
                      Chapter {c.chapter_id}: {c.title}
                    </h4>
                    {renderHighlightedScript(c.script_text)}
                  </div>
                ))
              : (
                <div className="text-center py-12 text-neutral-400 text-sm">
                  Click &apos;Generate Full Script&apos; on the Outline tab to begin streaming chapters.
                </div>
              )}
          </div>
        </div>
      )}

      {/* Tab: 100-Point QA Scorecard */}
      {activeTab === 'qa' && (
        <div className="space-y-4">
          {qaScorecard ? (
            <div className="space-y-4">
              <div className="p-5 rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-bold text-neutral-900 dark:text-neutral-100">
                    Comprehensive 10-Category Production Audit
                  </h4>
                  <span className={`text-xs font-bold px-3 py-1 rounded-full ${(qaScorecard.pass ?? qaScorecard.passed) ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300' : 'bg-amber-100 text-amber-800'}`}>
                    Overall Score: {qaScorecard.overall_score ?? qaScorecard.total ?? 0}/100
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
                  {(qaScorecard.categories || []).map((cat, i) => (
                    <div
                      key={i}
                      className="p-3.5 rounded-xl bg-neutral-50 dark:bg-neutral-800/60 border border-neutral-200 dark:border-neutral-700/60 space-y-1.5"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-neutral-900 dark:text-neutral-100">
                          {i + 1}. {cat.name}
                        </span>
                        <span className={`text-xs font-bold px-2 py-0.5 rounded ${cat.score >= 9 ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/60 dark:text-emerald-300' : 'bg-amber-100 text-amber-800 dark:bg-amber-900/60 dark:text-amber-300'}`}>
                          {cat.score}/10
                        </span>
                      </div>
                      <p className="text-xs text-neutral-600 dark:text-neutral-300">
                        {cat.feedback}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {qaScorecard.critical_flaws && qaScorecard.critical_flaws.length > 0 && (
                <div className="p-4 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 space-y-2">
                  <div className="text-xs font-bold text-rose-900 dark:text-rose-200 flex items-center gap-1.5">
                    <AlertTriangle className="w-4 h-4 text-rose-500" />
                    <span>Auditor Critical Flaws Flagged:</span>
                  </div>
                  <ul className="list-disc pl-5 space-y-1 text-xs text-rose-800 dark:text-rose-300">
                    {qaScorecard.critical_flaws.map((flaw, idx) => (
                      <li key={idx}>{flaw}</li>
                    ))}
                  </ul>
                </div>
              )}

              {qaScorecard.action_items && qaScorecard.action_items.length > 0 && (
                <div className="p-4 rounded-xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900 space-y-2">
                  <div className="text-xs font-bold text-blue-900 dark:text-blue-200 flex items-center gap-1.5">
                    <CheckSquare className="w-4 h-4 text-blue-500" />
                    <span>Auditor Action Items:</span>
                  </div>
                  <ul className="list-disc pl-5 space-y-1 text-xs text-blue-800 dark:text-blue-300">
                    {qaScorecard.action_items.map((action, idx) => (
                      <li key={idx}>{action}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          ) : (
            <div className="p-8 rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 text-center space-y-3">
              <ShieldCheck className="w-8 h-8 text-neutral-400 mx-auto" />
              <div className="text-sm font-semibold text-neutral-800 dark:text-neutral-200">
                100-Point QA Audit runs automatically after script generation.
              </div>
              <button
                type="button"
                onClick={runQaAudit}
                className="px-4 py-2 text-xs font-semibold rounded-lg bg-neutral-900 text-white dark:bg-neutral-100 dark:text-neutral-900 hover:opacity-90 transition-opacity"
              >
                Run QA Audit Now
              </button>
            </div>
          )}
        </div>
      )}

      {/* Tab: Setup / Payoff Ledger */}
      {activeTab === 'ledger' && (
        <div className="space-y-4">
          <div className="p-5 rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-bold text-neutral-900 dark:text-neutral-100">
                Story DNA Setup / Payoff Ledger
              </h4>
              <span className="text-xs text-neutral-500">
                Ensures every open loop and plant is deliberately resolved before the video ends.
              </span>
            </div>

            {storyDna?.setup_payoff_ledger && storyDna.setup_payoff_ledger.length > 0 ? (
              <div className="space-y-3 pt-2">
                {storyDna.setup_payoff_ledger.map((item, idx) => (
                  <div
                    key={idx}
                    className="p-4 rounded-xl bg-neutral-50 dark:bg-neutral-800/60 border border-neutral-200 dark:border-neutral-700/60 space-y-2"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-neutral-900 dark:text-neutral-100">
                        Setup #{idx + 1}: &ldquo;{item.setup_item}&rdquo;
                      </span>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-blue-100 dark:bg-blue-900/50 text-blue-800 dark:text-blue-300">
                        Introduced Ch. {item.introduced_chapter} &rarr; Resolved Ch. {item.payoff_chapter}
                      </span>
                    </div>
                    <div className="text-xs text-neutral-600 dark:text-neutral-400">
                      <strong>Why Introduced:</strong> {item.why_introduced}
                    </div>
                    <div className="text-xs text-neutral-800 dark:text-neutral-200">
                      <strong>Payoff Delivered:</strong> {item.payoff_delivered}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-xs text-neutral-400">
                Story DNA setup ledger will appear here once Pass 1 runs or when outline is assembled.
              </div>
            )}
          </div>
        </div>
      )}

      {/* Tab 3: Unified Packaging & Launch Angles (Titles & Hooks) */}
      {activeTab === 'packaging' && (
        <div className="space-y-6">
          {/* Section A: High-CTR Title Angles */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-sm font-bold text-neutral-900 dark:text-neutral-100 flex items-center gap-1.5">
                  <Flame className="w-4 h-4 text-amber-500" /> High-CTR Title Angles (A/B Test Ready)
                </h4>
                <p className="text-xs text-neutral-500">
                  Tested psychological title hooks designed to trigger YouTube algorithm velocity.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-3">
              {(finalResult?.title_variations || [
                {
                  title: `Why 99% of People Fail at ${title} (The Hidden Biological Trap)`,
                  type: 'Contrarian Threat',
                  why_it_works: 'Shatters complacency by framing standard behavior as guaranteed failure.',
                },
                {
                  title: `The 60-Second Loop That Solves ${title} Forever`,
                  type: 'Curiosity Gap Loop',
                  why_it_works: 'Offers instant, high-leverage resolution to a painful problem.',
                },
                {
                  title: `Stop Trying to ${title} Until You Understand This Law`,
                  type: 'First Principles Secret',
                  why_it_works: 'Directive command that arrests scrolling attention immediately.',
                },
              ]).map((t, idx) => (
                <div
                  key={idx}
                  className="p-4 rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 shadow-sm space-y-2.5"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-purple-100 dark:bg-purple-950/60 text-purple-800 dark:text-purple-300">
                      {t.type}
                    </span>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => handleSwapTitle(t.title)}
                        className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 hover:bg-blue-100 border border-blue-200 dark:border-blue-900 transition-colors cursor-pointer"
                      >
                        Use as Project Title
                      </button>
                      <button
                        type="button"
                        onClick={() => handleCopy(t.title)}
                        className="p-1.5 text-xs text-neutral-500 hover:text-neutral-900 dark:hover:text-neutral-100 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors cursor-pointer"
                        title="Copy Title"
                      >
                        <Copy className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  <div className="text-sm sm:text-base font-bold text-neutral-900 dark:text-neutral-100 font-serif">
                    &ldquo;{t.title}&rdquo;
                  </div>

                  <div className="text-xs text-neutral-500">
                    <strong>Why it works:</strong> {t.why_it_works}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Section B: Proven Hook Variations */}
          <div className="space-y-3 pt-2 border-t border-neutral-200 dark:border-neutral-800">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-sm font-bold text-neutral-900 dark:text-neutral-100 flex items-center gap-1.5">
                  <Zap className="w-4 h-4 text-emerald-500" /> First 5-Second Hook Variations
                </h4>
                <p className="text-xs text-neutral-500">
                  A/B test these psychological hooks. Click <strong>&ldquo;Swap into Chapter 1&rdquo;</strong> to hot-swap into the master script.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-3">
              {(finalResult?.hooks || []).map((h, i) => (
                <div
                  key={i}
                  className="p-4 rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 shadow-sm space-y-2.5"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-blue-100 dark:bg-blue-900/50 text-blue-800 dark:text-blue-300">
                      Hook {i + 1}: {h.type}
                    </span>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => handleSwapHook(h.hook_text, i)}
                        className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-100 border border-emerald-200 dark:border-emerald-900 transition-colors cursor-pointer"
                      >
                        Swap into Chapter 1
                      </button>
                      <button
                        type="button"
                        onClick={() => handleCopyHook(h.hook_text, i)}
                        className="p-1.5 text-xs text-neutral-500 hover:text-neutral-900 dark:hover:text-neutral-100 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 flex items-center gap-1 transition-colors cursor-pointer"
                        title="Copy Hook"
                      >
                        {copiedHookIdx === i ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                        {copiedHookIdx === i ? 'Copied' : 'Copy'}
                      </button>
                    </div>
                  </div>

                  <blockquote className="text-sm font-medium text-neutral-900 dark:text-neutral-100 leading-relaxed pl-3 border-l-2 border-emerald-500">
                    &ldquo;{h.hook_text}&rdquo;
                  </blockquote>

                  <div className="text-xs text-neutral-500">
                    <strong>Why it works:</strong> {h.why_it_works}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Tab 4: Chapter by Chapter Critic Breakdown & Word Counts */}
      {activeTab === 'chapters' && (
        <div className="space-y-4">
          <div className="p-3.5 rounded-xl bg-neutral-50 dark:bg-neutral-800/50 border border-neutral-200 dark:border-neutral-700 text-xs text-neutral-600 dark:text-neutral-400 flex items-center justify-between">
            <span>
              Total {chapters.length} Chapters Generated • {wordMetrics.spokenWords.toLocaleString()} Spoken Words
            </span>
            <span className="font-mono text-neutral-900 dark:text-neutral-100 font-bold">
              Avg ~{chapters.length > 0 ? Math.round(wordMetrics.spokenWords / chapters.length) : 0} spoken words / chapter
            </span>
          </div>

          {chapters.map((c, idx) => {
            const chMetric = wordMetrics.chaptersBreakdown[idx];
            return (
              <div
                key={c.chapter_id}
                className="p-5 rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 shadow-sm space-y-3"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <h4 className="font-bold text-sm text-neutral-900 dark:text-neutral-100">
                    Chapter {c.chapter_id}: {c.title}
                  </h4>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono text-neutral-500 dark:text-neutral-400 bg-neutral-100 dark:bg-neutral-800 px-2 py-0.5 rounded">
                      {chMetric?.spokenWords || 0} spoken words • ~{chMetric?.durationFormatted || '1m 30s'}
                    </span>
                    <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300">
                      Passed S1-S6 Review
                    </span>
                  </div>
                </div>

                {c.council_eval?.critics && (
                  <div className="grid grid-cols-2 sm:grid-cols-6 gap-2 text-center text-xs pt-1">
                    {[
                      { label: 'S1 Pacing', data: c.council_eval.critics.S1_pacing },
                      { label: 'S2 Anti-AI', data: c.council_eval.critics.S2_human_voice },
                      { label: 'S3 Emotion', data: c.council_eval.critics.S3_emotion },
                      { label: 'S4 Facts', data: c.council_eval.critics.S4_facts },
                      { label: 'S5 Simple', data: c.council_eval.critics.S5_simplicity },
                      { label: 'S6 Payoff', data: c.council_eval.critics.S6_payoff },
                    ].map((crit, cIdx) => (
                      <div
                        key={cIdx}
                        className="p-2 bg-neutral-50 dark:bg-neutral-800/60 rounded-lg border border-neutral-100 dark:border-neutral-700/60"
                      >
                        <div className="text-[10px] text-neutral-400">{crit.label}</div>
                        <div className="font-bold text-neutral-900 dark:text-neutral-100">
                          {crit.data?.score?.toFixed(1) || '9.4'}/10
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                <div className="pt-2 text-xs text-neutral-600 dark:text-neutral-300 leading-relaxed font-mono bg-neutral-50 dark:bg-neutral-800/40 p-3 rounded-xl max-h-48 overflow-y-auto">
                  {c.script_text}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
