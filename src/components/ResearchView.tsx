'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useScriptOSStore } from '@/lib/store';
import { useToast } from '@/components/Toast';
import {
  Search,
  ExternalLink,
  BookOpen,
  BarChart3,
  MessageSquare,
  AlertCircle,
  Lightbulb,
  CheckCircle2,
  RefreshCw,
  ArrowRight,
  Edit3,
  Globe,
  Sparkles,
  Plus,
  Compass,
  ChevronDown,
  Filter,
  Quote,
  Copy,
  Link2,
  Wand2,
} from 'lucide-react';

type SourceFilter = 'all' | 'wikipedia' | 'reddit' | 'web';

// Reusable collapsible card wrapper
function CollapsibleCard({
  id,
  collapsed,
  onToggle,
  headerIcon: Icon,
  iconColor,
  title,
  badge,
  children,
  className = '',
}: {
  id: string;
  collapsed: boolean;
  onToggle: () => void;
  headerIcon: any;
  iconColor: string;
  title: string;
  badge?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={`p-5 rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 shadow-sm ${className}`}>
      <button
        type="button"
        onClick={onToggle}
        className="w-full flex items-center justify-between gap-2 text-left"
        aria-expanded={!collapsed}
      >
        <div className="flex items-center gap-2 text-sm font-semibold text-neutral-900 dark:text-neutral-100">
          <Icon className={`w-4 h-4 ${iconColor}`} />
          {title}
        </div>
        <div className="flex items-center gap-2">
          {badge}
          <ChevronDown className={`w-4 h-4 text-neutral-400 transition-transform duration-200 ${collapsed ? '' : 'rotate-180'}`} />
        </div>
      </button>
      {!collapsed && <div className="mt-3 space-y-3">{children}</div>}
    </div>
  );
}

export default function ResearchView() {
  const {
    researchPack,
    title,
    isGenerating,
    buildResearchOnly,
    generateAnglesOnly,
    setResearchPack,
  } = useScriptOSStore();
  const { toast } = useToast();

  const [isEditing, setIsEditing] = useState(false);
  const [customSearchQuery, setCustomSearchQuery] = useState('');
  const [isSearchingCustom, setIsSearchingCustom] = useState(false);
  const [customSearchResults, setCustomSearchResults] = useState<any | null>(null);

  // Persisted source filter + collapsed-cards state (survives reloads)
  const [sourceFilter, setSourceFilter] = useState<SourceFilter>(() => {
    if (typeof window === 'undefined') return 'all';
    try {
      const saved = localStorage.getItem('scriptos_research_filter');
      return (saved === 'wikipedia' || saved === 'reddit' || saved === 'web') ? saved : 'all';
    } catch {
      return 'all';
    }
  });
  const [collapsedCards, setCollapsedCards] = useState<Record<string, boolean>>(() => {
    if (typeof window === 'undefined') return {};
    try {
      const saved = localStorage.getItem('scriptos_research_collapsed');
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  const toggleCard = (id: string) => setCollapsedCards((p) => {
    const next = { ...p, [id]: !p[id] };
    try { localStorage.setItem('scriptos_research_collapsed', JSON.stringify(next)); } catch {}
    return next;
  });

  // Persist source filter when it changes
  useEffect(() => {
    try { localStorage.setItem('scriptos_research_filter', sourceFilter); } catch {}
  }, [sourceFilter]);

  // Keyboard shortcut: 1/2/3/4 cycles the source filter (only when on Research tab + pythonData exists)
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      // Don't fire when typing in an input/textarea
      const tag = (e.target as HTMLElement)?.tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA' || (e.target as HTMLElement)?.isContentEditable) return;
      if (e.key === '1') setSourceFilter('all');
      else if (e.key === '2') setSourceFilter('wikipedia');
      else if (e.key === '3') setSourceFilter('reddit');
      else if (e.key === '4') setSourceFilter('web');
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  const handleCustomSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customSearchQuery.trim()) return;
    setIsSearchingCustom(true);
    try {
      const res = await fetch('/api/research/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: customSearchQuery }),
      });
      const data = await res.json();
      setCustomSearchResults(data);
    } catch (err) {
      console.error('Search error:', err);
    } finally {
      setIsSearchingCustom(false);
    }
  };

  const handleAddFactToDossier = (factText: string, sourceUrl: string) => {
    if (!researchPack) return;
    setResearchPack({
      ...researchPack,
      facts: [...(researchPack.facts || []), { fact: factText, source: sourceUrl }],
      sources: Array.from(new Set([...(researchPack.sources || []), sourceUrl])),
    });
  };

  const handleAddRedditToDossier = (storyText: string, threadUrl: string, subreddit: string) => {
    if (!researchPack) return;
    setResearchPack({
      ...researchPack,
      human_stories: [
        ...(researchPack.human_stories || []),
        { story: `[${subreddit}] ${storyText}`, source: threadUrl },
      ],
      sources: Array.from(new Set([...(researchPack.sources || []), threadUrl])),
    });
  };

  if (!researchPack) {
    return (
      <div className="max-w-2xl mx-auto text-center py-16 space-y-4 animate-in fade-in duration-200">
        <div className="w-14 h-14 rounded-2xl bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center mx-auto text-neutral-400">
          <Search className="w-7 h-7" />
        </div>
        <h3 className="text-xl font-bold text-neutral-900 dark:text-neutral-100">
          No Local Research Pack Built Yet
        </h3>
        <p className="text-sm text-neutral-500 max-w-md mx-auto">
          ScriptOS queries local Wikipedia, Google Search, and Reddit libraries to compile a 100% verified factual dossier before writing.
        </p>
        <button
          type="button"
          onClick={buildResearchOnly}
          disabled={isGenerating}
          className="px-6 py-2.5 rounded-xl bg-blue-600 text-white font-medium text-sm hover:bg-blue-500 inline-flex items-center gap-2 shadow-sm transition-colors cursor-pointer"
        >
          {isGenerating ? (
            <>
              <RefreshCw className="w-4 h-4 animate-spin" />
              <span>Building Multi-Source Research Pack...</span>
            </>
          ) : (
            <>
              <Search className="w-4 h-4" />
              <span>Run Python Research Engine for &quot;{title}&quot;</span>
            </>
          )}
        </button>
      </div>
    );
  }

  const pythonData = researchPack.python_research;

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-blue-600 dark:text-blue-400 uppercase tracking-wider">
            <span>Step 2</span>
            <span>•</span>
            <span>Python Multi-Source Intelligence Dossier</span>
          </div>
          <h2 className="text-2xl font-bold tracking-tight text-neutral-900 dark:text-neutral-100 mt-1">
            Research Pack: {title}
          </h2>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setIsEditing(!isEditing)}
            className="px-3 py-1.5 text-xs font-medium border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 rounded-lg hover:bg-neutral-50 dark:hover:bg-neutral-700 flex items-center gap-1.5 cursor-pointer"
          >
            <Edit3 className="w-3.5 h-3.5" />
            {isEditing ? 'Done Editing' : 'Edit Dossier'}
          </button>

          <button
            type="button"
            onClick={buildResearchOnly}
            disabled={isGenerating}
            className="px-3 py-1.5 text-xs font-medium text-neutral-700 dark:text-neutral-300 bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 rounded-lg flex items-center gap-1.5 cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isGenerating ? 'animate-spin' : ''}`} />
            Re-run Python Search
          </button>
        </div>
      </div>

      {/* Python Engine Status Banner */}
      <div className="p-4 rounded-xl bg-blue-50/60 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900/60 flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center shrink-0 font-mono font-bold">
            Py
          </div>
          <div>
            <div className="font-semibold text-blue-950 dark:text-blue-200 flex items-center gap-2">
              <span>Python 3 Live Research Grounding Active</span>
              <span className="px-2 py-0.5 rounded-full text-[10px] bg-blue-200/80 dark:bg-blue-800 text-blue-900 dark:text-blue-100 font-mono">
                100% Empirical Facts
              </span>
            </div>
            <div className="text-blue-700 dark:text-blue-300 text-[11px] mt-0.5">
              Verified by: Wikipedia API • DuckDuckGo / Google Search • Reddit Community Threads
            </div>
          </div>
        </div>

        {pythonData && (
          <div className="flex items-center gap-2 flex-wrap">
            <span className="px-2 py-1 rounded bg-white dark:bg-neutral-800 border border-blue-200 dark:border-blue-900 text-[11px] font-medium text-neutral-700 dark:text-neutral-300">
              📚 Wikipedia: <strong>{pythonData.wikipedia_count || pythonData.wikipedia_articles?.length || 0}</strong>
            </span>
            <span className="px-2 py-1 rounded bg-white dark:bg-neutral-800 border border-blue-200 dark:border-blue-900 text-[11px] font-medium text-neutral-700 dark:text-neutral-300">
              💬 Reddit: <strong>{pythonData.reddit_count || pythonData.reddit_threads?.length || 0}</strong>
            </span>
            <span className="px-2 py-1 rounded bg-white dark:bg-neutral-800 border border-blue-200 dark:border-blue-900 text-[11px] font-medium text-neutral-700 dark:text-neutral-300">
              🌐 Web: <strong>{pythonData.web_count || pythonData.web_research?.length || 0}</strong>
            </span>
          </div>
        )}
      </div>

      {/* Source Type Filter + Collapsible Controls */}
      {pythonData && (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 rounded-xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800">
          <div className="flex items-center gap-2 flex-wrap">
            <Filter className="w-3.5 h-3.5 text-neutral-400" />
            <span className="text-[11px] font-semibold text-neutral-500 uppercase tracking-wider">Filter sources:</span>
            {([
              { id: 'all', label: 'All', count: (pythonData.wikipedia_count || 0) + (pythonData.reddit_count || 0) + (pythonData.web_count || 0), tint: 'bg-neutral-900 dark:bg-neutral-100 text-white dark:text-neutral-900' },
              { id: 'wikipedia', label: 'Wikipedia', count: pythonData.wikipedia_count || 0, tint: 'bg-sky-100 dark:bg-sky-950 text-sky-800 dark:text-sky-300 border border-sky-200 dark:border-sky-900' },
              { id: 'reddit', label: 'Reddit', count: pythonData.reddit_count || 0, tint: 'bg-orange-100 dark:bg-orange-950 text-orange-800 dark:text-orange-300 border border-orange-200 dark:border-orange-900' },
              { id: 'web', label: 'Web', count: pythonData.web_count || 0, tint: 'bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-900' },
            ] as const).map((f) => {
              const isActive = sourceFilter === f.id;
              return (
                <button
                  key={f.id}
                  type="button"
                  onClick={() => setSourceFilter(f.id as SourceFilter)}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-all ${
                    isActive
                      ? 'bg-neutral-900 text-white dark:bg-neutral-100 dark:text-neutral-900 shadow-sm'
                      : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 hover:bg-neutral-200 dark:hover:bg-neutral-700'
                  }`}
                >
                  {f.label}
                  <span className={`ml-1.5 px-1.5 py-0.5 rounded text-[9px] font-mono ${
                    isActive ? 'bg-white/20' : 'bg-neutral-200 dark:bg-neutral-700'
                  }`}>{f.count}</span>
                </button>
              );
            })}
          </div>
          <div className="flex items-center gap-3">
            <span className="hidden sm:flex items-center gap-1 text-[9px] text-neutral-400">
              <kbd className="px-1 py-0.5 rounded bg-neutral-100 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 font-mono">1</kbd>
              <kbd className="px-1 py-0.5 rounded bg-neutral-100 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 font-mono">2</kbd>
              <kbd className="px-1 py-0.5 rounded bg-neutral-100 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 font-mono">3</kbd>
              <kbd className="px-1 py-0.5 rounded bg-neutral-100 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 font-mono">4</kbd>
              <span className="ml-0.5">to filter</span>
            </span>
            <button
              type="button"
              onClick={() => {
                setCollapsedCards({});
                try { localStorage.setItem('scriptos_research_collapsed', '{}'); } catch {}
              }}
              className="text-[10px] text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-300 transition-colors"
              title="Expand all cards"
            >
              Expand all
            </button>
          </div>
        </div>
      )}

      {/* Grid of dossier cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Card 1: Facts — collapsible */}
        <CollapsibleCard
          id="facts"
          collapsed={!!collapsedCards['facts']}
          onToggle={() => toggleCard('facts')}
          headerIcon={BookOpen}
          iconColor="text-blue-500"
          title="Counter-Intuitive Verified Facts"
          badge={<span className="text-[11px] text-neutral-400 font-mono">{researchPack.facts?.length || 0} verified</span>}
        >
          <div className="space-y-2.5">
            {researchPack.facts?.map((f, i) => (
              <div
                key={i}
                className="p-3 rounded-xl bg-neutral-50 dark:bg-neutral-800/60 border border-neutral-200 dark:border-neutral-700/60 text-xs space-y-1.5"
              >
                <div className="text-neutral-800 dark:text-neutral-200 leading-relaxed font-medium">
                  {f.fact}
                </div>
                {f.source && (
                  <a
                    href={f.source}
                    target="_blank"
                    rel="noreferrer"
                    className="text-[11px] text-blue-600 dark:text-blue-400 hover:underline inline-flex items-center gap-1 font-mono truncate max-w-full"
                  >
                    Citation: {f.source} <ExternalLink className="w-3 h-3 shrink-0" />
                  </a>
                )}
              </div>
            ))}
          </div>
        </CollapsibleCard>

        {/* Card 2: Shocking Stat & Competitor Gaps — collapsible */}
        <CollapsibleCard
          id="stats"
          collapsed={!!collapsedCards['stats']}
          onToggle={() => toggleCard('stats')}
          headerIcon={BarChart3}
          iconColor="text-emerald-500"
          title="High-Stakes Quantitative Metrics"
          badge={<span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-mono">Data Grounded</span>}
        >
          <div className="space-y-2.5">
            {researchPack.stats?.map((s, i) => (
              <div
                key={i}
                className="p-4 rounded-xl bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-900/60 text-xs space-y-2"
              >
                <div className="text-sm font-bold text-emerald-950 dark:text-emerald-200 leading-snug">
                  {s.stat}
                </div>
                {s.source && (
                  <a
                    href={s.source}
                    target="_blank"
                    rel="noreferrer"
                    className="text-[11px] text-emerald-700 dark:text-emerald-400 hover:underline inline-flex items-center gap-1 font-mono truncate max-w-full"
                  >
                    Source: {s.source} <ExternalLink className="w-3 h-3 shrink-0" />
                  </a>
                )}
              </div>
            ))}
          </div>

          {/* Competitor Gaps */}
          <div className="pt-2 border-t border-neutral-100 dark:border-neutral-800 space-y-2">
            <div className="flex items-center gap-2 text-xs font-semibold text-neutral-800 dark:text-neutral-200">
              <AlertCircle className="w-3.5 h-3.5 text-amber-500" />
              What Top 10 Competitor Videos Missed:
            </div>
            <ul className="space-y-1.5 pl-4 list-disc text-xs text-neutral-600 dark:text-neutral-400">
              {researchPack.competitor_gaps?.map((gap, i) => (
                <li key={i}>{gap}</li>
              ))}
            </ul>
          </div>
        </CollapsibleCard>

        {/* Card 3: Human Stories (Reddit/Quora) — collapsible */}
        <CollapsibleCard
          id="human-stories"
          collapsed={!!collapsedCards['human-stories']}
          onToggle={() => toggleCard('human-stories')}
          headerIcon={MessageSquare}
          iconColor="text-purple-500"
          title="Authentic Human Confessions & Reddit Community Threads"
          badge={<span className="text-[11px] text-purple-600 dark:text-purple-400 font-mono">Real Struggles</span>}
          className="md:col-span-2"
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {researchPack.human_stories?.map((st, i) => (
              <div
                key={i}
                className="p-3.5 rounded-xl bg-neutral-50 dark:bg-neutral-800/60 border border-neutral-200 dark:border-neutral-700/60 text-xs space-y-2"
              >
                <div className="text-neutral-800 dark:text-neutral-200 italic leading-relaxed">
                  &ldquo;{st.story}&rdquo;
                </div>
                {st.source && (
                  <a
                    href={st.source}
                    target="_blank"
                    rel="noreferrer"
                    className="text-[10px] text-purple-600 dark:text-purple-400 hover:underline font-mono inline-flex items-center gap-1 truncate max-w-full"
                  >
                    Thread: {st.source} <ExternalLink className="w-2.5 h-2.5 shrink-0" />
                  </a>
                )}
              </div>
            ))}
          </div>
        </CollapsibleCard>

        {/* Card 4: Python Wikipedia Articles — collapsible + filter-aware */}
        {pythonData?.wikipedia_articles && pythonData.wikipedia_articles.length > 0 && (sourceFilter === 'all' || sourceFilter === 'wikipedia') && (
          <CollapsibleCard
            id="wikipedia-sources"
            collapsed={!!collapsedCards['wikipedia-sources']}
            onToggle={() => toggleCard('wikipedia-sources')}
            headerIcon={Globe}
            iconColor="text-sky-500"
            title="Wikipedia Library Knowledge (Encyclopedic Definitions & Scientific Theory)"
            badge={<span className="px-2 py-0.5 rounded text-[10px] bg-sky-100 dark:bg-sky-950 text-sky-700 dark:text-sky-300 font-mono">{pythonData.wikipedia_articles.length} articles</span>}
            className="md:col-span-2"
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {pythonData.wikipedia_articles.map((art, i) => (
                <div
                  key={i}
                  className="p-3.5 rounded-xl bg-sky-50/40 dark:bg-sky-950/20 border border-sky-200 dark:border-sky-900/40 text-xs space-y-1.5"
                >
                  <div className="font-bold text-sky-950 dark:text-sky-200 text-sm">
                    {art.title}
                  </div>
                  <p className="text-neutral-700 dark:text-neutral-300 leading-relaxed">
                    {art.summary}
                  </p>
                  <a
                    href={art.url}
                    target="_blank"
                    rel="noreferrer"
                    className="text-[11px] text-sky-600 dark:text-sky-400 hover:underline inline-flex items-center gap-1 font-mono"
                  >
                    Read full Wikipedia entry <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              ))}
            </div>
          </CollapsibleCard>
        )}

        {/* Card 5: Live Web Research Sources — collapsible + filter-aware */}
        {pythonData && (sourceFilter === 'all' || sourceFilter === 'web') && pythonData.web_research && pythonData.web_research.length > 0 && (
          <CollapsibleCard
            id="web-sources"
            collapsed={!!collapsedCards['web-sources']}
            onToggle={() => toggleCard('web-sources')}
            headerIcon={Globe}
            iconColor="text-emerald-500"
            title="Live Web Research Sources"
            badge={<span className="px-2 py-0.5 rounded text-[10px] bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 font-mono">{pythonData.web_research.length} results</span>}
            className="md:col-span-2"
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {pythonData.web_research.map((w, i) => (
                <a
                  key={i}
                  href={w.url}
                  target="_blank"
                  rel="noreferrer"
                  className="block p-3.5 rounded-xl bg-emerald-50/40 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-900/40 text-xs space-y-1.5 hover:border-emerald-400 dark:hover:border-emerald-700 hover:shadow-sm transition-all"
                >
                  <div className="font-bold text-emerald-950 dark:text-emerald-200 text-sm flex items-start gap-1.5">
                    <Globe className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" />
                    <span className="line-clamp-2">{w.title}</span>
                  </div>
                  {w.snippet && (
                    <p className="text-neutral-700 dark:text-neutral-300 leading-relaxed line-clamp-3">{w.snippet}</p>
                  )}
                  <div className="text-[10px] text-emerald-600 dark:text-emerald-400 font-mono truncate flex items-center gap-1">
                    {w.url} <ExternalLink className="w-2.5 h-2.5 shrink-0" />
                  </div>
                </a>
              ))}
            </div>
          </CollapsibleCard>
        )}

        {/* Card 6: Reddit Community Threads — collapsible + filter-aware */}
        {pythonData && (sourceFilter === 'all' || sourceFilter === 'reddit') && pythonData.reddit_threads && pythonData.reddit_threads.length > 0 && (
          <CollapsibleCard
            id="reddit-sources"
            collapsed={!!collapsedCards['reddit-sources']}
            onToggle={() => toggleCard('reddit-sources')}
            headerIcon={Quote}
            iconColor="text-orange-500"
            title="Reddit Community Threads (Human Stories)"
            badge={<span className="px-2 py-0.5 rounded text-[10px] bg-orange-100 dark:bg-orange-950 text-orange-700 dark:text-orange-300 font-mono">{pythonData.reddit_threads.length} threads</span>}
            className="md:col-span-2"
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {pythonData.reddit_threads.map((r, i) => (
                <a
                  key={i}
                  href={r.url}
                  target="_blank"
                  rel="noreferrer"
                  className="block p-3.5 rounded-xl bg-orange-50/40 dark:bg-orange-950/20 border border-orange-200 dark:border-orange-900/40 text-xs space-y-1.5 hover:border-orange-400 dark:hover:border-orange-700 hover:shadow-sm transition-all"
                >
                  <div className="font-bold text-orange-950 dark:text-orange-200 text-sm flex items-start gap-1.5">
                    <Quote className="w-3.5 h-3.5 text-orange-500 shrink-0 mt-0.5" />
                    <span className="line-clamp-2">{r.title}</span>
                  </div>
                  {r.snippet && (
                    <p className="text-neutral-700 dark:text-neutral-300 leading-relaxed italic line-clamp-3">&ldquo;{r.snippet}&rdquo;</p>
                  )}
                  <div className="text-[10px] text-orange-600 dark:text-orange-400 font-mono truncate flex items-center gap-1">
                    {r.subreddit || r.host_name || r.url} <ExternalLink className="w-2.5 h-2.5 shrink-0" />
                  </div>
                </a>
              ))}
            </div>
          </CollapsibleCard>
        )}
      </div>

      {/* Interactive Python Deep Search Bar */}
      <div className="p-5 rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900/60 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Search className="w-4 h-4 text-neutral-600 dark:text-neutral-400" />
            <h4 className="text-sm font-bold text-neutral-900 dark:text-neutral-100">
              Live Python Research Explorer
            </h4>
          </div>
          <span className="text-xs text-neutral-500">
            Query Wikipedia, Reddit, and Google in real-time
          </span>
        </div>

        <form onSubmit={handleCustomSearch} className="flex gap-2">
          <input
            type="text"
            value={customSearchQuery}
            onChange={(e) => setCustomSearchQuery(e.target.value)}
            placeholder="Search any study, scientific concept, or Reddit question (e.g. 'Zeigarnik effect focus')..."
            className="flex-1 px-4 py-2 text-xs rounded-xl border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            type="submit"
            disabled={isSearchingCustom || !customSearchQuery.trim()}
            className="px-4 py-2 text-xs font-semibold rounded-xl bg-neutral-900 text-white dark:bg-neutral-100 dark:text-neutral-900 hover:opacity-90 disabled:opacity-50 flex items-center gap-1.5 cursor-pointer"
          >
            {isSearchingCustom ? (
              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Search className="w-3.5 h-3.5" />
            )}
            Search Python
          </button>
        </form>

        {customSearchResults && (
          <div className="pt-2 space-y-3 animate-in fade-in duration-200">
            <div className="text-xs font-semibold text-neutral-700 dark:text-neutral-300 flex items-center justify-between">
              <span>Results for &quot;{customSearchResults.topic}&quot;:</span>
              <span className="text-neutral-400 font-mono text-[10px]">
                {customSearchResults.metrics?.engine}
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {/* Wikipedia results */}
              {customSearchResults.wikipedia_articles?.map((w: any, idx: number) => (
                <div
                  key={`w-${idx}`}
                  className="p-3 rounded-xl bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-xs space-y-1.5"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-sky-600 dark:text-sky-400">
                      Wikipedia: {w.title}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleAddFactToDossier(w.summary, w.url)}
                      className="px-2 py-0.5 rounded text-[10px] bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-300 hover:bg-blue-100 flex items-center gap-1 cursor-pointer"
                    >
                      <Plus className="w-3 h-3" /> Add to Facts
                    </button>
                  </div>
                  <p className="text-neutral-600 dark:text-neutral-300 line-clamp-3">
                    {w.summary}
                  </p>
                </div>
              ))}

              {/* Reddit results */}
              {customSearchResults.reddit_threads?.map((r: any, idx: number) => (
                <div
                  key={`r-${idx}`}
                  className="p-3 rounded-xl bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-xs space-y-1.5"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-amber-600 dark:text-amber-400">
                      {r.subreddit}: {r.title.slice(0, 40)}...
                    </span>
                    <button
                      type="button"
                      onClick={() => handleAddRedditToDossier(r.snippet, r.url, r.subreddit)}
                      className="px-2 py-0.5 rounded text-[10px] bg-amber-50 dark:bg-amber-950 text-amber-600 dark:text-amber-300 hover:bg-amber-100 flex items-center gap-1 cursor-pointer"
                    >
                      <Plus className="w-3 h-3" /> Add to Stories
                    </button>
                  </div>
                  <p className="text-neutral-600 dark:text-neutral-300 line-clamp-3">
                    {r.snippet}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Next Step Action Button */}
      <div className="pt-4 flex justify-end">
        <button
          type="button"
          onClick={generateAnglesOnly}
          disabled={isGenerating}
          className="px-6 py-3 rounded-xl bg-neutral-900 text-white dark:bg-neutral-100 dark:text-neutral-900 hover:opacity-90 font-semibold text-sm flex items-center gap-2 shadow-md transition-all cursor-pointer"
        >
          {isGenerating ? (
            <span>Applying 6 Lenses...</span>
          ) : (
            <>
              <span>Proceed to Step 3: Original Angles & Outline</span>
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>
      </div>
    </div>
  );
}
