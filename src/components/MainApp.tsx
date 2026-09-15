'use client';

import React, { useEffect } from 'react';
import { useScriptOSStore } from '@/lib/store';
import WizardView from '@/components/WizardView';
import ResearchView from '@/components/ResearchView';
import OutlineView from '@/components/OutlineView';
import ScriptStudioView from '@/components/ScriptStudioView';
import SettingsView from '@/components/SettingsView';
import HelpModal from '@/components/HelpModal';
import PlaybookModal from '@/components/PlaybookModal';
import ProjectLibrary from '@/components/ProjectLibrary';
import {
  Sparkles,
  Search,
  Compass,
  Film,
  Settings,
  HelpCircle,
  Cpu,
  Layers,
  Save,
  CheckCircle2,
  BookOpen,
  Sun,
  Moon,
  FolderOpen,
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
    provider,
    selectedModel,
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

  useEffect(() => {
    loadFromStorage();
    const seen = typeof window !== 'undefined' ? localStorage.getItem('scriptos_onboarding_completed') : null;
    if (!seen) {
      setShowHelpModal(true);
    }
    // Ensure the initial theme class is applied to <html>
    if (typeof window !== 'undefined') {
      document.documentElement.classList.toggle('dark', theme === 'dark');
    }
  }, [loadFromStorage, setShowHelpModal, theme]);

  useEffect(() => {
    if (initialTab) {
      setActiveTab(initialTab);
    }
    if (initialStep !== undefined) {
      setCurrentStep(initialStep);
    }
  }, [initialTab, initialStep, setActiveTab, setCurrentStep]);

  // Periodic auto-save every 10 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      saveToStorage();
    }, 10000);
    return () => clearInterval(interval);
  }, [saveToStorage]);

  // Global keyboard shortcuts
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const mod = e.metaKey || e.ctrlKey;
      // ⌘/Ctrl + S → save current project (prevent browser save dialog)
      if (mod && e.key.toLowerCase() === 's') {
        e.preventDefault();
        saveCurrentAsProject(title || undefined);
        return;
      }
      // ⌘/Ctrl + Enter → start full generation (only when not already generating and title exists)
      if (mod && e.key === 'Enter') {
        if (title?.trim() && !isGenerating) {
          e.preventDefault();
          startFullGeneration();
        }
        return;
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [saveCurrentAsProject, startFullGeneration, title, isGenerating]);

  const navItems = [
    { id: 'wizard', label: 'Wizard', icon: Sparkles, step: 1 },
    { id: 'research', label: 'Research Pack', icon: Search, step: 2 },
    { id: 'outline', label: 'Angles & Outline', icon: Compass, step: 3 },
    { id: 'script', label: 'Script Studio', icon: Film, step: 5 },
    { id: 'settings', label: 'Settings', icon: Settings, step: 0 },
  ];

  const steps = [
    { num: 1, label: 'Input Parameters', tab: 'wizard' },
    { num: 2, label: 'Local Research', tab: 'research' },
    { num: 3, label: '6 Perspective Lenses', tab: 'outline' },
    { num: 4, label: 'Outline Council (O1-O5)', tab: 'outline' },
    { num: 5, label: 'Script Council (S1-S6)', tab: 'script' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-neutral-50 via-white to-neutral-100 dark:from-neutral-950 dark:via-neutral-900 dark:to-black text-neutral-900 dark:text-neutral-100 flex flex-col font-sans selection:bg-blue-500 selection:text-white">
      {/* Onboarding Help Modal */}
      <HelpModal />
      {/* Master Technique Playbook Modal */}
      <PlaybookModal />
      {/* Project Library Modal */}
      <ProjectLibrary />

      {/* Top Header Bar */}
      <header className="sticky top-0 z-40 bg-white/80 dark:bg-neutral-900/80 backdrop-blur-xl border-b border-neutral-200 dark:border-neutral-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
          {/* Logo & Hardware Specs */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setActiveTab('wizard')}
              className="flex items-center gap-2 font-bold text-lg tracking-tight hover:opacity-80 transition-opacity"
            >
              <span className="w-8 h-8 rounded-xl bg-gradient-to-br from-neutral-900 to-neutral-700 dark:from-neutral-100 dark:to-neutral-300 text-white dark:text-neutral-900 flex items-center justify-center font-black shadow-md">
                S
              </span>
              <span>ScriptOS</span>
            </button>

            <span className="hidden md:inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-900">
              <Cpu className="w-3.5 h-3.5" />
              {provider === 'zai' ? 'Z.AI Zero-Config' : '100% Local CPU Mode'}
            </span>

            <span className="hidden lg:inline-flex items-center gap-1 text-[11px] text-neutral-500 font-mono">
              <Layers className="w-3 h-3 text-blue-500" />
              {provider.toUpperCase()} • {selectedModel}
            </span>
          </div>

          {/* Main Navigation Tabs */}
          <nav className="flex items-center gap-1">
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
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all ${
                    isActive
                      ? 'bg-neutral-900 text-white dark:bg-neutral-100 dark:text-neutral-900 shadow-sm'
                      : 'text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">{item.label}</span>
                </button>
              );
            })}
          </nav>

          {/* Help & Auto-save status */}
          <div className="flex items-center gap-2">
            {autoSaveTime && (
              <span className="hidden xl:flex items-center gap-1 text-[10px] text-neutral-400 font-mono">
                <Save className="w-3 h-3 text-emerald-500" />
                Saved {autoSaveTime}
              </span>
            )}

            <button
              onClick={() => setShowProjectLibrary(true)}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-semibold text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors border border-neutral-200 dark:border-neutral-800"
              title="Project Library — save & load scripts"
            >
              <FolderOpen className="w-3.5 h-3.5 text-purple-500" />
              <span className="hidden sm:inline">Library</span>
            </button>

            <button
              onClick={() => setShowPlaybookModal(true)}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-semibold text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors border border-neutral-200 dark:border-neutral-800"
              title="Retention & Technique Playbook"
            >
              <BookOpen className="w-3.5 h-3.5 text-blue-500" />
              <span className="hidden sm:inline">Playbook</span>
            </button>

            <button
              onClick={toggleTheme}
              className="p-2 rounded-xl text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
              title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
              aria-label="Toggle theme"
            >
              {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>

            <button
              onClick={() => setShowHelpModal(true)}
              className="p-2 rounded-xl text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
              title="Help & Architecture Documentation"
            >
              <HelpCircle className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      {/* Pipeline Stepper (Visible during project workflow) */}
      {activeTab !== 'settings' && (
        <div className="bg-white dark:bg-neutral-900 border-b border-neutral-200 dark:border-neutral-800 py-2.5 px-4">
          <div className="max-w-4xl mx-auto flex items-center justify-between gap-2 overflow-x-auto text-xs scrollbar-none">
            {steps.map((s, idx) => {
              const isPast = currentStep > s.num;
              const isCurrent = currentStep === s.num;
              return (
                <button
                  key={s.num}
                  onClick={() => {
                    setCurrentStep(s.num);
                    setActiveTab(s.tab as any);
                  }}
                  className={`flex items-center gap-2 py-1 px-2.5 rounded-lg whitespace-nowrap transition-colors ${
                    isCurrent
                      ? 'bg-blue-50 dark:bg-blue-950/50 text-blue-700 dark:text-blue-300 font-semibold'
                      : isPast
                      ? 'text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800'
                      : 'text-neutral-400 hover:text-neutral-600'
                  }`}
                >
                  <span
                    className={`w-5 h-5 rounded-full text-[10px] font-bold flex items-center justify-center ${
                      isCurrent
                        ? 'bg-blue-600 text-white'
                        : isPast
                        ? 'bg-emerald-500 text-white'
                        : 'bg-neutral-200 dark:bg-neutral-700 text-neutral-500'
                    }`}
                  >
                    {isPast ? <CheckCircle2 className="w-3.5 h-3.5" /> : s.num}
                  </span>
                  <span>{s.label}</span>
                  {idx < steps.length - 1 && <span className="text-neutral-300 dark:text-neutral-700">&rarr;</span>}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Main Workspace Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-8">
        {activeTab === 'wizard' && <WizardView />}
        {activeTab === 'research' && <ResearchView />}
        {activeTab === 'outline' && <OutlineView />}
        {activeTab === 'script' && <ScriptStudioView />}
        {activeTab === 'settings' && <SettingsView />}
      </main>

      {/* Footer Status */}
      <footer className="mt-auto py-4 border-t border-neutral-200 dark:border-neutral-800 bg-white/50 dark:bg-neutral-900/50 text-center text-xs text-neutral-400">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            ScriptOS • Powered by {provider === 'zai' ? 'Z.AI GLM (zero-config)' : provider.toUpperCase()} • {selectedModel}
          </div>
          <div className="flex items-center gap-4">
            <span className="hidden md:flex items-center gap-1.5">
              <kbd className="px-1.5 py-0.5 rounded bg-neutral-100 dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 text-[9px] font-mono">⌘/Ctrl</kbd>
              <kbd className="px-1.5 py-0.5 rounded bg-neutral-100 dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 text-[9px] font-mono">↵</kbd>
              <span className="text-[10px]">generate</span>
              <kbd className="ml-2 px-1.5 py-0.5 rounded bg-neutral-100 dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 text-[9px] font-mono">⌘/Ctrl</kbd>
              <kbd className="px-1.5 py-0.5 rounded bg-neutral-100 dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 text-[9px] font-mono">S</kbd>
              <span className="text-[10px]">save project</span>
            </span>
            <span className="hidden lg:inline">Dual Review Councils (O1-O5 & S1-S6)</span>
            <span className="hidden lg:inline">•</span>
            <span className="hidden lg:inline">Real-time web research via ZAI</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
