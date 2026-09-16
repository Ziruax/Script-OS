'use client';

import React, { useEffect, useState } from 'react';
import { useScriptOSStore } from '@/lib/store';
import WizardView from '@/components/WizardView';
import ResearchView from '@/components/ResearchView';
import OutlineView from '@/components/OutlineView';
import ScriptStudioView from '@/components/ScriptStudioView';
import SettingsView from '@/components/SettingsView';
import HelpModal from '@/components/HelpModal';
import PlaybookModal from '@/components/PlaybookModal';
import ProjectLibrary from '@/components/ProjectLibrary';
import { useToast } from '@/components/Toast';
import { Logo } from '@/components/Logo';
import {
  Sparkles,
  Search,
  Compass,
  Film,
  Settings as SettingsIcon,
  HelpCircle,
  Save,
  CheckCircle2,
  BookOpen,
  Sun,
  Moon,
  FolderOpen,
  PanelLeftClose,
  PanelLeft,
} from 'lucide-react';

interface MainAppProps {
  initialTab?: 'wizard' | 'settings' | 'research' | 'outline' | 'script';
  initialStep?: number;
}

export default function MainApp({ initialTab, initialStep }: MainAppProps) {
  const {
    activeTab,
    setActiveTab,
    currentStep,
    setCurrentStep,
    setShowHelpModal,
    setShowPlaybookModal,
    autoSaveTime,
    loadFromStorage,
    saveToStorage,
    theme,
    toggleTheme,
    setShowProjectLibrary,
    saveCurrentAsProject,
    title,
    isGenerating,
    startFullGeneration,
  } = useScriptOSStore();
  const { toast } = useToast();

  // Sidebar collapse — persisted, loaded via lazy initializer (no effect needed)
  const [sidebarCollapsed, setSidebarCollapsed] = useState(() => {
    if (typeof window === 'undefined') return false;
    try { return localStorage.getItem('scriptos_sidebar_collapsed') === 'true'; } catch { return false; }
  });
  const toggleSidebar = () => {
    const next = !sidebarCollapsed;
    setSidebarCollapsed(next);
    try { localStorage.setItem('scriptos_sidebar_collapsed', String(next)); } catch {}
  };

  // On mount: load state + apply theme. We NEVER auto-open the onboarding modal —
  // the user finds it annoying. They can open it manually from the Help button.
  useEffect(() => {
    loadFromStorage();
    // Mark onboarding as seen so it never auto-shows again, even for first-time visitors.
    if (typeof window !== 'undefined') {
      try { localStorage.setItem('scriptos_onboarding_completed', 'true'); } catch {}
      document.documentElement.classList.toggle('dark', theme === 'dark');
    }
  }, [loadFromStorage, theme]);

  useEffect(() => {
    if (initialTab) setActiveTab(initialTab);
    if (initialStep !== undefined) setCurrentStep(initialStep);
  }, [initialTab, initialStep, setActiveTab, setCurrentStep]);

  // Periodic auto-save every 10 seconds
  useEffect(() => {
    const interval = setInterval(() => { saveToStorage(); }, 10000);
    return () => clearInterval(interval);
  }, [saveToStorage]);

  // Global keyboard shortcuts
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const mod = e.metaKey || e.ctrlKey;
      if (mod && e.key.toLowerCase() === 's') {
        e.preventDefault();
        const name = title || 'Untitled Project';
        saveCurrentAsProject(title || undefined);
        toast('Project saved', 'success', `"${name.slice(0, 50)}" added to your library`);
        return;
      }
      if (mod && e.key === 'Enter') {
        if (title?.trim() && !isGenerating) {
          e.preventDefault();
          startFullGeneration();
          toast('Starting full pipeline', 'info', 'Story DNA → Research → Angles → Outline → Script');
        }
        return;
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [saveCurrentAsProject, startFullGeneration, title, isGenerating, toast]);

  const navItems = [
    { id: 'wizard', label: 'Wizard', icon: Sparkles, step: 1, hint: 'Configure & generate' },
    { id: 'research', label: 'Research', icon: Search, step: 2, hint: 'Live web dossier' },
    { id: 'outline', label: 'Outline', icon: Compass, step: 3, hint: 'Angles & chapters' },
    { id: 'script', label: 'Script Studio', icon: Film, step: 5, hint: 'Write & audit' },
    { id: 'settings', label: 'Settings', icon: SettingsIcon, step: 0, hint: 'Provider & models' },
  ] as const;

  const steps = [
    { num: 1, label: 'Input', tab: 'wizard' },
    { num: 2, label: 'Research', tab: 'research' },
    { num: 3, label: 'Angles', tab: 'outline' },
    { num: 4, label: 'Outline', tab: 'outline' },
    { num: 5, label: 'Script', tab: 'script' },
  ];

  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950 text-neutral-900 dark:text-neutral-100 flex font-sans selection:bg-emerald-500/20">
      {/* Modals */}
      <HelpModal />
      <PlaybookModal />
      <ProjectLibrary />

      {/* Sidebar Navigation */}
      <aside
        className={`${
          sidebarCollapsed ? 'w-16' : 'w-60'
        } shrink-0 sticky top-0 h-screen bg-white dark:bg-neutral-900 border-r border-neutral-200 dark:border-neutral-800 flex flex-col transition-all duration-200 hidden md:flex`}
      >
        {/* Logo */}
        <button
          onClick={() => setActiveTab('wizard')}
          className="h-16 flex items-center gap-2.5 px-4 border-b border-neutral-200 dark:border-neutral-800 hover:bg-neutral-50 dark:hover:bg-neutral-800/50 transition-colors shrink-0"
          title="ScriptOS"
        >
          <Logo size={36} className="w-9 h-9 rounded-lg shrink-0" />
          {!sidebarCollapsed && (
            <div className="min-w-0">
              <div className="font-bold text-base tracking-tight leading-none">ScriptOS</div>
              <div className="text-[10px] text-neutral-400 mt-1 truncate">Retention Script OS</div>
            </div>
          )}
        </button>

        {/* Nav items */}
        <nav className="flex-1 p-2 space-y-0.5 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  setActiveTab(item.id as any);
                  if (item.step > 0) setCurrentStep(item.step);
                }}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all group relative ${
                  isActive
                    ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300'
                    : 'text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800/70 hover:text-neutral-900 dark:hover:text-neutral-100'
                }`}
                title={sidebarCollapsed ? item.label : undefined}
              >
                <Icon className={`w-[18px] h-[18px] shrink-0 ${isActive ? 'text-emerald-600 dark:text-emerald-400' : ''}`} />
                {!sidebarCollapsed && (
                  <div className="min-w-0 flex-1 text-left">
                    <div className="truncate leading-tight">{item.label}</div>
                    <div className="text-[10px] text-neutral-400 truncate leading-tight mt-0.5">{item.hint}</div>
                  </div>
                )}
                {isActive && !sidebarCollapsed && (
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
                )}
              </button>
            );
          })}
        </nav>

        {/* Sidebar footer actions */}
        <div className="p-2 border-t border-neutral-200 dark:border-neutral-800 space-y-0.5 shrink-0">
          <button
            onClick={() => setShowProjectLibrary(true)}
            className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-medium text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800/70 hover:text-neutral-900 dark:hover:text-neutral-100 transition-colors"
            title={sidebarCollapsed ? 'Project Library' : undefined}
          >
            <FolderOpen className="w-[18px] h-[18px] shrink-0 text-purple-500" />
            {!sidebarCollapsed && <span>Project Library</span>}
          </button>
          <button
            onClick={() => setShowPlaybookModal(true)}
            className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-medium text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800/70 hover:text-neutral-900 dark:hover:text-neutral-100 transition-colors"
            title={sidebarCollapsed ? 'Playbook' : undefined}
          >
            <BookOpen className="w-[18px] h-[18px] shrink-0 text-blue-500" />
            {!sidebarCollapsed && <span>Playbook</span>}
          </button>
          <button
            onClick={toggleSidebar}
            className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-medium text-neutral-500 dark:text-neutral-500 hover:bg-neutral-100 dark:hover:bg-neutral-800/70 transition-colors"
            title={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {sidebarCollapsed ? <PanelLeft className="w-[18px] h-[18px]" /> : <PanelLeftClose className="w-[18px] h-[18px]" />}
            {!sidebarCollapsed && <span>Collapse</span>}
          </button>
        </div>
      </aside>

      {/* Main column */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top bar */}
        <header className="sticky top-0 z-40 bg-white/85 dark:bg-neutral-900/85 backdrop-blur-xl border-b border-neutral-200 dark:border-neutral-800">
          <div className="px-4 sm:px-6 h-14 flex items-center justify-between gap-4">
            {/* Mobile nav (select) + status pill */}
            <div className="flex items-center gap-3 min-w-0">
              {/* Mobile logo */}
              <button
                onClick={() => setActiveTab('wizard')}
                className="md:hidden flex items-center gap-2 font-bold tracking-tight"
              >
                <Logo size={28} className="w-7 h-7 rounded-md" />
              </button>

              {/* Mobile nav dropdown */}
              <select
                value={activeTab}
                onChange={(e) => {
                  setActiveTab(e.target.value as any);
                  const item = navItems.find((i) => i.id === e.target.value);
                  if (item && item.step > 0) setCurrentStep(item.step);
                }}
                className="md:hidden text-sm font-medium bg-transparent text-neutral-900 dark:text-neutral-100 border-0 focus:outline-none cursor-pointer"
              >
                {navItems.map((i) => (
                  <option key={i.id} value={i.id}>{i.label}</option>
                ))}
              </select>
            </div>

            {/* Right side: auto-save + theme + help */}
            <div className="flex items-center gap-1.5 shrink-0">
              {autoSaveTime && (
                <span className="hidden lg:flex items-center gap-1 text-[10px] text-neutral-400 font-mono mr-1">
                  <Save className="w-3 h-3 text-emerald-500" />
                  {autoSaveTime}
                </span>
              )}
              <button
                onClick={toggleTheme}
                className="p-2 rounded-lg text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
                title={theme === 'dark' ? 'Light mode' : 'Dark mode'}
                aria-label="Toggle theme"
              >
                {theme === 'dark' ? <Sun className="w-[18px] h-[18px]" /> : <Moon className="w-[18px] h-[18px]" />}
              </button>
              <button
                onClick={() => setShowHelpModal(true)}
                className="p-2 rounded-lg text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
                title="Help & architecture"
                aria-label="Help"
              >
                <HelpCircle className="w-[18px] h-[18px]" />
              </button>
            </div>
          </div>

          {/* Pipeline stepper — slim, only during workflow */}
          {activeTab !== 'settings' && (
            <div className="px-4 sm:px-6 pb-2">
              <div className="flex items-center gap-1 overflow-x-auto text-xs scrollbar-none">
                {steps.map((s, idx) => {
                  const isPast = currentStep > s.num;
                  const isCurrent = currentStep === s.num;
                  return (
                    <button
                      key={s.num}
                      onClick={() => { setCurrentStep(s.num); setActiveTab(s.tab as any); }}
                      className={`flex items-center gap-1.5 py-1 px-2.5 rounded-lg whitespace-nowrap transition-colors ${
                        isCurrent
                          ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 font-semibold'
                          : isPast
                          ? 'text-neutral-500 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800'
                          : 'text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-300'
                      }`}
                    >
                      <span className={`w-4 h-4 rounded-full text-[9px] font-bold flex items-center justify-center ${
                        isCurrent
                          ? 'bg-emerald-600 text-white'
                          : isPast
                          ? 'bg-emerald-400 text-white'
                          : 'bg-neutral-200 dark:bg-neutral-700 text-neutral-500'
                      }`}>
                        {isPast ? <CheckCircle2 className="w-3 h-3" /> : s.num}
                      </span>
                      <span>{s.label}</span>
                      {idx < steps.length - 1 && <span className="text-neutral-300 dark:text-neutral-700 ml-1">→</span>}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </header>

        {/* Workspace */}
        <main className="flex-1 w-full px-4 sm:px-6 lg:px-8 py-6 max-w-6xl mx-auto">
          {activeTab === 'wizard' && <WizardView />}
          {activeTab === 'research' && <ResearchView />}
          {activeTab === 'outline' && <OutlineView />}
          {activeTab === 'script' && <ScriptStudioView />}
          {activeTab === 'settings' && <SettingsView />}
        </main>

        {/* Footer */}
        <footer className="mt-auto py-3 border-t border-neutral-200 dark:border-neutral-800 bg-white/40 dark:bg-neutral-900/40">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-2 text-[11px] text-neutral-400">
            <div className="flex items-center gap-1.5">
              <Logo size={14} className="w-3.5 h-3.5 rounded-sm" />
              <span>ScriptOS</span>
              <span className="text-neutral-300 dark:text-neutral-700">•</span>
              <span>Retention Script Operating System</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="hidden md:flex items-center gap-1">
                <kbd className="px-1.5 py-0.5 rounded bg-neutral-100 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-[9px] font-mono">⌘↵</kbd>
                <span>generate</span>
              </span>
              <span className="hidden md:flex items-center gap-1">
                <kbd className="px-1.5 py-0.5 rounded bg-neutral-100 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-[9px] font-mono">⌘S</kbd>
                <span>save</span>
              </span>
              <span className="hidden lg:inline">Dual Review Councils (O1-O5 & S1-S6)</span>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}
