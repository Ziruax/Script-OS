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
  Sliders,
  Shield,
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

  const providers = [
    { id: 'google', name: 'Google Gemini', desc: 'Free high-rate tier (Recommended)', freeTier: true },
    { id: 'openai', name: 'OpenAI', desc: 'GPT-4o, GPT-4o Mini', freeTier: false },
    { id: 'claude', name: 'Anthropic Claude', desc: 'Claude 3.5 Sonnet, Haiku', freeTier: false },
    { id: 'deepseek', name: 'DeepSeek', desc: 'DeepSeek V3, DeepSeek R1', freeTier: false },
    { id: 'xai', name: 'xAI Grok', desc: 'Grok 2, Grok 2 Mini', freeTier: false },
    { id: 'openrouter', name: 'OpenRouter', desc: 'Aggregator (All open & closed models)', freeTier: false },
  ];

  const filteredModels = availableModels.filter(
    (m) =>
      m.id.toLowerCase().includes(modelSearch.toLowerCase()) ||
      m.name.toLowerCase().includes(modelSearch.toLowerCase())
  );

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-200">
      {/* Page Header */}
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-neutral-900 dark:text-neutral-100 flex items-center gap-2.5">
          <Key className="w-6 h-6 text-blue-500" />
          Settings & Local Hardware Config
        </h2>
        <p className="text-sm text-neutral-500 mt-1">
          ScriptOS runs 100% locally on your machine. Configure your external LLM provider brain and local vector mode.
        </p>
      </div>

      {/* Hardware / RAM Status Banner */}
      <div className="p-4 rounded-xl border border-emerald-200 dark:border-emerald-900/60 bg-emerald-50/50 dark:bg-emerald-950/20 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-lg bg-emerald-100 dark:bg-emerald-900/50 text-emerald-700 dark:text-emerald-300">
            <Cpu className="w-5 h-5" />
          </div>
          <div>
            <div className="text-sm font-semibold text-emerald-950 dark:text-emerald-200 flex items-center gap-2">
              Hardware Profile: {ramInfo.mode_label}
            </div>
            <div className="text-xs text-emerald-700 dark:text-emerald-400 mt-0.5">
              Available Memory: ~{ramInfo.total_gb.toFixed(1)} GB. Zero GPU required. CPU-only NLP optimizations active.
            </div>
          </div>
        </div>

        <div className="px-3 py-1 rounded-full text-xs font-semibold bg-emerald-200 dark:bg-emerald-900 text-emerald-900 dark:text-emerald-100 uppercase tracking-wide">
          100% Local CPU Mode
        </div>
      </div>

      {/* Provider Selector */}
      <div className="space-y-4">
        <label className="text-sm font-semibold text-neutral-900 dark:text-neutral-100 flex items-center justify-between">
          <span>1. Select LLM Provider Brain</span>
          <span className="text-xs font-normal text-neutral-500">
            User provides their own key • Stored encrypted in <code className="text-xs bg-neutral-100 dark:bg-neutral-800 px-1 py-0.5 rounded">data/.env.enc</code>
          </span>
        </label>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
          {providers.map((p) => {
            const isSelected = provider === p.id;
            return (
              <button
                key={p.id}
                type="button"
                onClick={() => updateSettings({ provider: p.id as any })}
                className={`p-3.5 rounded-xl border text-left transition-all ${
                  isSelected
                    ? 'border-blue-600 bg-blue-50/50 dark:bg-blue-950/30 dark:border-blue-500 shadow-sm'
                    : 'border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 hover:border-neutral-300 dark:hover:border-neutral-700'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-sm text-neutral-900 dark:text-neutral-100">
                    {p.name}
                  </span>
                  {p.freeTier && (
                    <span className="text-[10px] font-semibold uppercase px-1.5 py-0.5 rounded bg-amber-100 dark:bg-amber-950/70 text-amber-800 dark:text-amber-300">
                      Free Tier
                    </span>
                  )}
                </div>
                <p className="text-xs text-neutral-500 mt-1">{p.desc}</p>
              </button>
            );
          })}
        </div>
      </div>

      {/* API Key Input & Model Fetching */}
      <div className="p-5 rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 space-y-4 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <label className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">
            2. {provider.toUpperCase()} API Key
          </label>
          {provider === 'google' && (
            <a
              href="https://aistudio.google.com"
              target="_blank"
              rel="noreferrer"
              className="text-xs text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1"
            >
              Get Free Google Gemini Key from AI Studio <ExternalLink className="w-3 h-3" />
            </a>
          )}
        </div>

        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <input
              type={showKey ? 'text' : 'password'}
              value={apiKeys[provider] || ''}
              onChange={(e) => setApiKey(provider, e.target.value)}
              placeholder={`Paste your ${provider.toUpperCase()} API key here...`}
              className="w-full px-3.5 py-2.5 pr-10 text-sm rounded-xl border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
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
            className="px-4 py-2.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-500 rounded-xl flex items-center gap-2 disabled:opacity-50 transition-colors shadow-sm shrink-0"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isFetchingModels ? 'animate-spin' : ''}`} />
            Fetch Models
          </button>

          <button
            type="button"
            onClick={testConnection}
            disabled={isTestingConnection}
            className="px-4 py-2.5 text-xs font-semibold text-neutral-800 dark:text-neutral-200 bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 border border-neutral-300 dark:border-neutral-700 rounded-xl flex items-center gap-2 disabled:opacity-50 transition-colors shrink-0"
          >
            {isTestingConnection ? 'Testing...' : 'Test Connection'}
          </button>
        </div>

        {/* Connection status notification */}
        {connectionStatus && (
          <div
            className={`p-3 rounded-xl text-xs flex items-center gap-2 ${
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
        )}

        {/* Searchable Model Dropdown */}
        <div className="pt-2 border-t border-neutral-100 dark:border-neutral-800 space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <label className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">
              3. Selected Active Model ({availableModels.length} available)
            </label>
            <input
              type="text"
              value={modelSearch}
              onChange={(e) => setModelSearch(e.target.value)}
              placeholder="Search models..."
              className="text-xs px-2.5 py-1 rounded-lg border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>

          <div className="max-h-48 overflow-y-auto border border-neutral-200 dark:border-neutral-800 rounded-xl divide-y divide-neutral-100 dark:divide-neutral-800 bg-neutral-50/50 dark:bg-neutral-900/50">
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
                        ? 'bg-blue-100/70 dark:bg-blue-900/40 text-blue-900 dark:text-blue-200 font-semibold'
                        : 'hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-700 dark:text-neutral-300'
                    }`}
                  >
                    <div>
                      <div>{m.name}</div>
                      <div className="text-[10px] text-neutral-400">{m.id}</div>
                    </div>
                    {isSelected && <CheckCircle2 className="w-4 h-4 text-blue-600 dark:text-blue-400" />}
                  </button>
                );
              })
            ) : (
              <div className="p-4 text-center text-xs text-neutral-500">
                No matching models found. Click &apos;Fetch Models&apos; to query live endpoints.
              </div>
            )}
          </div>

          {/* Custom Model ID Override */}
          <div className="pt-2">
            <label className="text-xs font-medium text-neutral-600 dark:text-neutral-400 block mb-1">
              Or specify Custom Model ID / Fine-tune:
            </label>
            <input
              type="text"
              value={customModelId}
              onChange={(e) => updateSettings({ customModelId: e.target.value })}
              placeholder="e.g. gemini-2.0-flash or gpt-4o-2024-08-06"
              className="w-full px-3 py-2 text-xs rounded-xl border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>
        </div>
      </div>

      {/* Local Vector Mode */}
      <div className="p-5 rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 space-y-4 shadow-sm">
        <label className="text-sm font-semibold text-neutral-900 dark:text-neutral-100 flex items-center gap-2">
          <Layers className="w-4 h-4 text-purple-500" />
          4. Local Search & Embedding Mode
        </label>
        <p className="text-xs text-neutral-500">
          How local search scans research documents on your local hard drive:
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {[
            {
              id: 'AUTO',
              title: 'Auto-Select (Recommended)',
              desc: 'Selects FTS5 + TF-IDF on <=8GB PCs, or FastEmbed if sufficient memory is detected.',
            },
            {
              id: 'TFIDF',
              title: 'FTS5 + TF-IDF Only',
              desc: 'Pure CPU, zero RAM overhead. Uses SQLite BM25 + scikit-learn. Fast and lightweight.',
            },
            {
              id: 'FASTEMBED',
              title: 'FastEmbed (bge-small-en)',
              desc: 'Dense semantic embeddings with ONNX Runtime. Recommended for 8GB+ RAM.',
            },
          ].map((mode) => {
            const isSelected = localMode === mode.id;
            return (
              <button
                key={mode.id}
                type="button"
                onClick={() => updateSettings({ localMode: mode.id as any })}
                className={`p-3 rounded-xl border text-left transition-all text-xs ${
                  isSelected
                    ? 'border-purple-600 bg-purple-50/50 dark:bg-purple-950/30 dark:border-purple-500'
                    : 'border-neutral-200 dark:border-neutral-800 hover:border-neutral-300 dark:hover:border-neutral-700'
                }`}
              >
                <div className="font-semibold text-neutral-900 dark:text-neutral-100 mb-1">{mode.title}</div>
                <div className="text-[11px] text-neutral-500">{mode.desc}</div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Security note */}
      <div className="flex items-center gap-2 text-xs text-neutral-500">
        <Shield className="w-4 h-4 text-neutral-400 shrink-0" />
        <span>
          ScriptOS never uploads your keys to any centralized server. All keys are encrypted locally using AES/Fernet encryption tied to this computer.
        </span>
      </div>
    </div>
  );
}
