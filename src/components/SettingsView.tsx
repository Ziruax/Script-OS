'use client';

import React, { useState } from 'react';
import { useScriptOSStore } from '@/lib/store';
import {
  Key,
  Cpu,
  RefreshCw,
  Eye,
  EyeOff,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  Layers,
  Sparkles,
} from 'lucide-react';

export default function SettingsView() {
  const {
    provider,
    apiKeys,
    selectedModel,
    customModelId,
    availableModels,
    modelsLive,
    localMode,
    ramInfo,
    isFetchingModels,
    isTestingConnection,
    connectionStatus,
    updateSettings,
    setApiKey,
    fetchLiveModels,
    testConnection,
  } = useScriptOSStore();

  const [showKey, setShowKey] = useState(false);
  const [modelSearch, setModelSearch] = useState('');

  const isZai = provider === 'zai';

  const connectionStatusBlock = connectionStatus ? (
    <div
      className={`p-2.5 rounded-lg text-xs flex items-center gap-2 ${
        connectionStatus.success
          ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
          : 'bg-rose-50 dark:bg-rose-950/40 text-rose-800 dark:text-rose-300 border border-rose-200 dark:border-rose-800'
      }`}
    >
      {connectionStatus.success ? (
        <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
      ) : (
        <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
      )}
      <span>{connectionStatus.message}</span>
    </div>
  ) : null;

  const providers = [
    { id: 'zai', name: 'Z.AI GLM', desc: 'Zero-config · no key needed', recommended: true },
    { id: 'google', name: 'Google Gemini', desc: 'Free high-rate tier' },
    { id: 'openai', name: 'OpenAI', desc: 'GPT-4o, GPT-4o Mini' },
    { id: 'claude', name: 'Anthropic Claude', desc: 'Claude 3.5 Sonnet, Haiku' },
    { id: 'deepseek', name: 'DeepSeek', desc: 'DeepSeek V3, R1' },
    { id: 'xai', name: 'xAI Grok', desc: 'Grok 2, Grok 2 Mini' },
    { id: 'openrouter', name: 'OpenRouter', desc: 'Aggregator (all models)' },
    { id: 'groq', name: 'Groq', desc: 'Ultra-fast Llama / Mixtral inference' },
    { id: 'nvidia', name: 'NVIDIA NIM', desc: 'Hosted open models (Llama, Mistral, Qwen)' },
  ];

  const filteredModels = availableModels.filter(
    (m) =>
      m.id.toLowerCase().includes(modelSearch.toLowerCase()) ||
      m.name.toLowerCase().includes(modelSearch.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-slide-up">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-neutral-900 dark:text-neutral-100">Settings</h1>
        <p className="text-sm text-neutral-500 mt-1">
          Configure your LLM provider and local search mode.
        </p>
      </div>

      {/* Hardware profile */}
      <div className="surface rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-lg bg-emerald-100 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300">
            <Cpu className="w-5 h-5" />
          </div>
          <div>
            <div className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">{ramInfo.mode_label}</div>
            <div className="text-xs text-neutral-500 mt-0.5">
              ~{ramInfo.total_gb.toFixed(1)} GB RAM · zero GPU required
            </div>
          </div>
        </div>
        <span className="px-2.5 py-1 rounded-full text-[10px] font-semibold bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 uppercase tracking-wider shrink-0 self-start sm:self-auto">
          Local CPU Mode
        </span>
      </div>

      {/* Provider selector */}
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-xs font-bold uppercase tracking-wider text-neutral-700 dark:text-neutral-300">
            LLM Provider
          </h2>
          <span className="text-[11px] text-neutral-400">Z.AI needs no key · others require your own</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
          {providers.map((p) => {
            const isSelected = provider === p.id;
            const pIsZai = p.id === 'zai';
            return (
              <button
                key={p.id}
                type="button"
                onClick={() => updateSettings({ provider: p.id as any })}
                className={`relative p-3 rounded-xl border text-left transition-all ${
                  isSelected
                    ? pIsZai
                      ? 'border-emerald-500 dark:border-emerald-400 bg-emerald-50/40 dark:bg-emerald-950/20 shadow-sm'
                      : 'border-emerald-500 dark:border-emerald-400 bg-emerald-50/40 dark:bg-emerald-950/20 shadow-sm'
                    : 'border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 hover:border-neutral-300 dark:hover:border-neutral-700'
                }`}
              >
                {p.recommended && (
                  <span className="absolute top-2 right-2 text-[9px] font-bold uppercase px-1.5 py-0.5 rounded bg-emerald-600 text-white">
                    Default
                  </span>
                )}
                <div className="font-semibold text-sm text-neutral-900 dark:text-neutral-100 pr-16">{p.name}</div>
                <p className="text-[11px] text-neutral-500 mt-0.5">{p.desc}</p>
                {isSelected && (
                  <div className="absolute bottom-2 right-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </section>

      {/* ZAI zero-config panel OR API key panel */}
      {isZai ? (
        <section className="surface rounded-2xl p-5 space-y-3">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-emerald-100 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <div className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">Z.AI GLM — Zero-Config Active</div>
              <div className="text-xs text-neutral-500 mt-0.5">
                No API key required. Runs via the system-managed <code className="text-[10px] bg-neutral-100 dark:bg-neutral-800 px-1 py-0.5 rounded font-mono">z-ai-web-dev-sdk</code>.
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2 pt-1">
            <button
              type="button"
              onClick={fetchLiveModels}
              disabled={isFetchingModels}
              className="px-3.5 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-500 rounded-lg flex items-center gap-1.5 disabled:opacity-50 transition-colors shadow-sm"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isFetchingModels ? 'animate-spin' : ''}`} />
              Load GLM Models
            </button>
            <button
              type="button"
              onClick={testConnection}
              disabled={isTestingConnection}
              className="px-3.5 py-2 text-xs font-semibold text-neutral-700 dark:text-neutral-300 bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 hover:bg-neutral-50 dark:hover:bg-neutral-700/60 rounded-lg flex items-center gap-1.5 disabled:opacity-50 transition-colors"
            >
              {isTestingConnection ? 'Testing…' : 'Test Connection'}
            </button>
          </div>
          {connectionStatusBlock}
        </section>
      ) : (
        <section className="surface rounded-2xl p-5 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <label className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">
              {provider.toUpperCase()} API Key
            </label>
            {provider === 'google' && (
              <a
                href="https://aistudio.google.com"
                target="_blank"
                rel="noreferrer"
                className="text-xs text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1"
              >
                Get free Gemini key <ExternalLink className="w-3 h-3" />
              </a>
            )}
          </div>

          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <input
                type={showKey ? 'text' : 'password'}
                value={apiKeys[provider] || ''}
                onChange={(e) => setApiKey(provider, e.target.value)}
                placeholder={`Paste your ${provider.toUpperCase()} API key…`}
                className="w-full px-3.5 py-2.5 pr-10 text-sm rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 focus:outline-none focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-500 font-mono"
              />
              <button
                type="button"
                onClick={() => setShowKey(!showKey)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200"
              >
                {showKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            <button
              type="button"
              onClick={fetchLiveModels}
              disabled={isFetchingModels}
              className="px-3.5 py-2.5 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-500 rounded-lg flex items-center gap-1.5 disabled:opacity-50 transition-colors shadow-sm shrink-0"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isFetchingModels ? 'animate-spin' : ''}`} />
              Fetch
            </button>
            <button
              type="button"
              onClick={testConnection}
              disabled={isTestingConnection}
              className="px-3.5 py-2.5 text-xs font-semibold text-neutral-700 dark:text-neutral-300 bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 hover:bg-neutral-50 dark:hover:bg-neutral-700/60 rounded-lg flex items-center gap-1.5 disabled:opacity-50 transition-colors shrink-0"
            >
              {isTestingConnection ? 'Testing…' : 'Test'}
            </button>
          </div>

          {connectionStatusBlock}
        </section>
      )}

      {/* Model picker */}
      <section className="surface rounded-2xl p-5 space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <label className="text-sm font-semibold text-neutral-900 dark:text-neutral-100 flex items-center gap-2 flex-wrap">
            Choose Model
            <span className="text-[11px] text-neutral-400 font-normal">({availableModels.length} for {provider.toUpperCase()})</span>
            {modelsLive ? (
              <span className="text-[9px] font-bold uppercase px-1.5 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" /> Live
              </span>
            ) : (
              <span className="text-[9px] font-bold uppercase px-1.5 py-0.5 rounded-full bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
                Static catalogue
              </span>
            )}
          </label>
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={modelSearch}
              onChange={(e) => setModelSearch(e.target.value)}
              placeholder="Search models…"
              className="text-xs px-2.5 py-1 rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 focus:outline-none focus:ring-2 focus:ring-emerald-500/40 w-full sm:w-40"
            />
            <button
              type="button"
              onClick={fetchLiveModels}
              disabled={isFetchingModels || isZai}
              className="px-3 py-1.5 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-500 rounded-lg flex items-center gap-1.5 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-sm shrink-0"
              title={isZai ? 'Z.AI catalogue is always the full list' : `Fetch all live models from ${provider.toUpperCase()}`}
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isFetchingModels ? 'animate-spin' : ''}`} />
              Fetch All
            </button>
          </div>
        </div>

        {!isZai && !modelsLive && (
          <div className="p-2.5 rounded-lg bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/60 text-[11px] text-amber-800 dark:text-amber-300 flex items-center gap-2">
            <AlertCircle className="w-3.5 h-3.5 shrink-0" />
            <span>
              Showing the static catalogue. Paste your {provider.toUpperCase()} API key above and click <strong>Fetch All</strong> to load every live model from {provider.toUpperCase()}.
            </span>
          </div>
        )}

        <div className="max-h-64 overflow-y-auto border border-neutral-200 dark:border-neutral-800 rounded-lg divide-y divide-neutral-100 dark:divide-neutral-800 bg-neutral-50/50 dark:bg-neutral-900/50">
          {filteredModels.length > 0 ? (
            filteredModels.map((m) => {
              const isSelected = selectedModel === m.id && !customModelId;
              return (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => updateSettings({ selectedModel: m.id, customModelId: '' })}
                  className={`w-full px-3.5 py-2.5 text-left flex items-center justify-between text-xs transition-colors ${
                    isSelected
                      ? 'bg-emerald-50/70 dark:bg-emerald-950/40 text-emerald-900 dark:text-emerald-200 font-semibold'
                      : 'hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-700 dark:text-neutral-300'
                  }`}
                >
                  <div className="min-w-0">
                    <div className="truncate">{m.name}</div>
                    <div className="text-[10px] text-neutral-400 font-mono truncate">{m.id}</div>
                  </div>
                  {isSelected && <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 ml-2" />}
                </button>
              );
            })
          ) : (
            <div className="p-4 text-center text-xs text-neutral-500">
              No matching models. Click <strong>Fetch All</strong> above to load the live catalogue from {provider.toUpperCase()}.
            </div>
          )}
        </div>

        <div className="pt-1">
          <label className="text-[11px] font-medium text-neutral-500 dark:text-neutral-400 block mb-1">
            Or specify a custom model ID:
          </label>
          <input
            type="text"
            value={customModelId}
            onChange={(e) => updateSettings({ customModelId: e.target.value })}
            placeholder="e.g. gemini-2.5-flash or gpt-4o-mini"
            className="w-full px-3 py-2 text-xs rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 focus:outline-none focus:ring-2 focus:ring-emerald-500/40 font-mono"
          />
        </div>
      </section>

      {/* Local search mode */}
      <section className="surface rounded-2xl p-5 space-y-3">
        <label className="text-sm font-semibold text-neutral-900 dark:text-neutral-100 flex items-center gap-2">
          <Layers className="w-4 h-4 text-emerald-500" />
          Local Search & Embedding Mode
        </label>
        <p className="text-xs text-neutral-500">
          How local search scans research documents on your machine.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
          {[
            { id: 'AUTO', title: 'Auto-Select', desc: 'FTS5 + TF-IDF on ≤8GB; FastEmbed if more memory.' },
            { id: 'TFIDF', title: 'FTS5 + TF-IDF', desc: 'Pure CPU, zero RAM overhead. SQLite BM25.' },
            { id: 'FASTEMBED', title: 'FastEmbed (bge-small-en)', desc: 'Dense ONNX embeddings. 8GB+ RAM.' },
          ].map((mode) => {
            const isSelected = localMode === mode.id;
            return (
              <button
                key={mode.id}
                type="button"
                onClick={() => updateSettings({ localMode: mode.id as any })}
                className={`p-3 rounded-xl border text-left transition-all ${
                  isSelected
                    ? 'border-emerald-500 dark:border-emerald-400 bg-emerald-50/40 dark:bg-emerald-950/20'
                    : 'border-neutral-200 dark:border-neutral-800 hover:border-neutral-300 dark:hover:border-neutral-700'
                }`}
              >
                <div className="font-semibold text-xs text-neutral-900 dark:text-neutral-100 mb-1">{mode.title}</div>
                <div className="text-[10px] text-neutral-500 leading-tight">{mode.desc}</div>
              </button>
            );
          })}
        </div>
      </section>

      {/* Security note */}
      <div className="flex items-center gap-2 text-[11px] text-neutral-500">
        <Key className="w-3.5 h-3.5 text-neutral-400 shrink-0" />
        <span>Keys never leave your browser. Z.AI needs none at all.</span>
      </div>
    </div>
  );
}
