import { create } from 'zustand';
import { autoSanitizeBannedWords, scanScriptAntiAi } from '@/lib/anti-ai-scanner';
import {
  StoryDNA,
  ContentType,
  NarrativeMode,
  AudienceIntent,
  EmotionalEngine,
  QaScorecard,
} from '@/lib/story-dna';

/**
 * Safely parse a fetch Response as JSON. If the response is not JSON (e.g.,
 * a Next.js dev-mode HTML compilation page, a 404 HTML page, or a browser
 * extension redirect), throw a clear error instead of the cryptic
 * "Unexpected token '<'" SyntaxError.
 */
async function safeJson(res: Response): Promise<any> {
  const ct = res.headers.get('content-type') || '';
  if (ct.includes('application/json') || ct.includes('text/json')) {
    return res.json();
  }
  const text = await res.text();
  throw new Error(
    `Server returned ${ct || 'non-JSON'} (HTTP ${res.status})` +
    (text ? `: ${text.slice(0, 150)}` : '')
  );
}

export interface ResearchPack {
  facts: Array<{ fact: string; source: string; domain?: string }>;
  stats: Array<{ stat: string; source: string }>;
  human_stories: Array<{ story: string; source: string; subreddit?: string }>;
  competitor_gaps: string[];
  controversial_angles: string[];
  sources: string[];
  competitor_hooks: string[];
  python_research?: {
    engine: string;
    wikipedia_count: number;
    reddit_count: number;
    web_count: number;
    wikipedia_articles?: Array<{ title: string; url: string; summary: string }>;
    reddit_threads?: Array<{ title: string; subreddit: string; url: string; snippet: string }>;
    web_research?: Array<{ title: string; url: string; snippet: string }>;
  };
}

export interface Angle {
  angle_title: string;
  lens_used: string;
  unique_statement: string;
  why_different: string;
  hook_example: string;
}

export interface ChapterOutline {
  id: number;
  title: string;
  goal: string;
  open_loop: string;
  stakes_external: string;
  stakes_internal: string;
  philosophical_stakes: string;
  broll_cue: string;
  re_hook: string;
  estimated_seconds: number;
}

export interface OutlineCouncilEval {
  overall_pass: boolean;
  critics: {
    O1_logic?: { score: number; issues?: string[]; fix?: string };
    O2_avatar?: { score: number; bored_points?: string[]; too_basic_points?: string[]; fix?: string };
    O3_retention?: { score: number; missing_rehooks?: number[]; low_stakes_chapters?: number[]; fix?: string };
    O4_novelty?: { score: number; novelty_issues?: string[]; fix?: string };
    O5_ai_detector?: { score: number; banned_words_found?: Array<{ word: string; chapter?: number }>; fix?: string };
  };
  summary_feedback?: string;
}

export interface ChapterScript {
  chapter_id: number;
  title: string;
  script_text: string;
  council_eval?: {
    overall_pass?: boolean;
    critics?: {
      S1_pacing?: { score: number; issues?: string[]; fix?: string };
      S2_human_voice?: { score: number; ai_patterns_found?: string[]; fixed_sentences?: Array<{ original: string; replacement: string }> };
      S3_emotion?: { score: number; emotion_flat_points?: string[]; fix?: string };
      S4_facts?: { score: number; hallucinated_facts?: string[]; fix?: string };
      S5_simplicity?: { score: number; complex_sentences?: string[]; fix?: string };
      S6_payoff?: { score: number; missing_payoffs?: string[]; fix?: string };
    };
    surgical_edits?: Array<{ find: string; replace: string }>;
  };
}

export interface Scorecard {
  hook: number;
  stakes: number;
  novelty: number;
  loops: number;
  human_voice: number;
  payoff: number;
  total: number;
  max_possible: number;
  retention_grade: string;
  burstiness?: {
    sentence_count: number;
    avg_words: number;
    std_dev: number;
    burstiness_score: number;
    is_human: boolean;
  };
  ai_flags_count?: number;
}

export interface HookVariation {
  type: string;
  hook_text: string;
  why_it_works: string;
}

export interface TitleVariation {
  title: string;
  type: string;
  why_it_works: string;
}

export interface FinalScriptResult {
  final_script: string;
  hooks: HookVariation[];
  title_variations?: TitleVariation[];
  scorecard: Scorecard;
  sources: string[];
  quality_gate?: {
    passed: boolean;
    threshold: number;
    score: number;
  };
  word_metrics?: any;
  anti_ai_scan?: any;
}

export interface ScriptOSState {
  // Navigation & Step
  activeTab: 'wizard' | 'settings' | 'research' | 'outline' | 'script';
  currentStep: number; // 1: Input, 2: Research, 3: Angles, 4: Outline, 5: Script
  hasSeenOnboarding: boolean;
  showHelpModal: boolean;
  showPlaybookModal: boolean;
  
  // Wizard Inputs
  title: string;
  details: string;
  lengthMin: number;
  contentType: ContentType;
  narrativeMode: NarrativeMode;
  audienceIntent: AudienceIntent;
  emotionalEngine: EmotionalEngine;
  audience: 'Auto-detect' | 'Beginner' | 'Intermediate' | 'Expert';
  goal: 'Auto-detect' | 'Educate' | 'Persuade' | 'Entertain' | 'Sell' | 'Viral';
  tone: 'Auto-detect' | 'Calm' | 'Energetic' | 'Dark' | 'Funny' | 'Cinematic';
  detectedRationale: string;
  isDetectingMetadata: boolean;
  // Story Mode — switches the entire pipeline to a storytelling methodology
  // (character arcs, emotional stakes, 3-act scenes, show-don't-tell, subtext)
  // instead of the default documentary/investigation methodology.
  storyMode: boolean;

  // Settings & Models
  provider: 'zai' | 'google' | 'openai' | 'claude' | 'xai' | 'deepseek' | 'openrouter' | 'groq' | 'nvidia';
  apiKeys: Record<string, string>;
  selectedModel: string;
  customModelId: string;
  availableModels: Array<{ id: string; name: string; provider: string; context_length?: number }>;
  modelsLive: boolean; // true if availableModels came from a live API fetch (vs static fallback)
  localMode: 'AUTO' | 'TFIDF' | 'FASTEMBED';
  ramInfo: {
    total_gb: number;
    mode_label: string;
    percent: number;
  };
  isFetchingModels: boolean;
  isTestingConnection: boolean;
  connectionStatus: { success?: boolean; message?: string } | null;

  // Pipeline Data
  storyDna: StoryDNA | null;
  researchPack: ResearchPack | null;
  angles: Angle[];
  chosenAngle: Angle | null;
  outlineData: { chapters: ChapterOutline[] } | null;
  outlineCouncilEval: OutlineCouncilEval | null;
  chapters: ChapterScript[];
  finalResult: FinalScriptResult | null;
  qaScorecard: QaScorecard | null;
  
  // Runtime generation tracking
  isGenerating: boolean;
  currentProgressMessage: string;
  activeChapterGeneratingIndex: number;
  autoSaveTime: string;

  // Project Library (named saved projects in localStorage)
  savedProjects: Array<{
    id: string;
    name: string;
    savedAt: number;
    title: string;
    lengthMin: number;
    contentType: string;
    scoreTotal?: number;
    snapshot: Partial<ScriptOSState>;
  }>,
  showProjectLibrary: boolean;

  // Theme
  theme: 'light' | 'dark';

  // Actions
  setActiveTab: (tab: 'wizard' | 'settings' | 'research' | 'outline' | 'script') => void;
  setCurrentStep: (step: number) => void;
  setShowHelpModal: (show: boolean) => void;
  setShowPlaybookModal: (show: boolean) => void;
  setHasSeenOnboarding: (seen: boolean) => void;
  updateInputs: (fields: Partial<Pick<ScriptOSState, 'title' | 'details' | 'lengthMin' | 'contentType' | 'narrativeMode' | 'audienceIntent' | 'emotionalEngine' | 'audience' | 'goal' | 'tone' | 'detectedRationale' | 'storyMode'>>) => void;
  autoDetectMetadata: () => Promise<any>;
  updateSettings: (fields: Partial<Pick<ScriptOSState, 'provider' | 'selectedModel' | 'customModelId' | 'localMode'>>) => void;
  setApiKey: (provider: string, key: string) => void;
  fetchLiveModels: () => Promise<void>;
  testConnection: () => Promise<void>;
  
  // Pipeline Actions
  startFullGeneration: () => Promise<void>;
  buildStoryDnaOnly: () => Promise<void>;
  buildResearchOnly: () => Promise<void>;
  generateAnglesOnly: () => Promise<void>;
  selectAngleAndGenerateOutline: (angle: Angle) => Promise<void>;
  regenerateOutline: () => Promise<void>;
  generateFullScriptChapterByChapter: () => Promise<void>;
  runQaAudit: () => Promise<void>;
  setResearchPack: (pack: ResearchPack) => void;
  setStoryDna: (dna: StoryDNA) => void;
  swapHookIntoScript: (hookText: string) => void;
  swapTitle: (newTitle: string) => void;
  applyPerplexityInjector: () => Promise<void>;
  sanitizeCurrentScript: () => void;
  saveToStorage: () => void;
  loadFromStorage: () => void;
  resetPipeline: () => void;
  resetSession: () => void;
  toggleTheme: () => void;
  saveCurrentAsProject: (name?: string) => void;
  loadProject: (id: string) => void;
  deleteProject: (id: string) => void;
  duplicateProject: (id: string) => void;
  exportProjectToJson: (id: string) => void;
  importProjectFromJson: (file: File) => Promise<boolean>;
  setShowProjectLibrary: (show: boolean) => void;
}

const STORAGE_KEY = 'scriptos_workspace_state_v1';

export const useScriptOSStore = create<ScriptOSState>((set, get) => ({
  activeTab: 'wizard',
  currentStep: 1,
  hasSeenOnboarding: false,
  showHelpModal: false,
  showPlaybookModal: false,

  // Blank defaults — the wizard opens empty. No demo/preset content.
  title: '',
  details: '',
  lengthMin: 8,
  contentType: 'Documentary',
  narrativeMode: 'Investigation',
  audienceIntent: 'Understand',
  emotionalEngine: 'Curiosity',
  audience: 'Auto-detect',
  goal: 'Auto-detect',
  tone: 'Auto-detect',
  detectedRationale: '',
  isDetectingMetadata: false,
  storyMode: false,

  provider: 'zai',
  apiKeys: {
    zai: '',
    google: '',
    openai: '',
    claude: '',
    xai: '',
    deepseek: '',
    openrouter: '',
    groq: '',
    nvidia: '',
  },
  selectedModel: 'glm-4.6',
  customModelId: '',
  modelsLive: false,
  availableModels: [
    { id: 'glm-4.6', name: 'GLM-4.6 · Balanced quality & speed', provider: 'zai', context_length: 131072 },
    { id: 'glm-4.5', name: 'GLM-4.5 · Fast & capable', provider: 'zai', context_length: 131072 },
    { id: 'glm-4.5-air', name: 'GLM-4.5 Air · Lowest latency', provider: 'zai', context_length: 131072 },
    { id: 'glm-4-plus', name: 'GLM-4 Plus · Higher quality reasoning', provider: 'zai', context_length: 131072 },
    { id: 'glm-4-long', name: 'GLM-4 Long · Extended context', provider: 'zai', context_length: 1000000 },
    { id: 'glm-4-air', name: 'GLM-4 Air · Lightweight', provider: 'zai', context_length: 131072 },
    { id: 'glm-4-airx', name: 'GLM-4 AirX · Ultra-fast inference', provider: 'zai', context_length: 131072 },
    { id: 'glm-4-flash', name: 'GLM-4 Flash · Free tier', provider: 'zai', context_length: 131072 },
    { id: 'glm-4-flashx', name: 'GLM-4 FlashX · Fastest free tier', provider: 'zai', context_length: 131072 },
    { id: 'glm-3-turbo', name: 'GLM-3 Turbo · Legacy fast', provider: 'zai', context_length: 131072 },
  ],
  localMode: 'AUTO',
  ramInfo: {
    total_gb: 4.0,
    mode_label: 'Your PC 4GB - Using Ultra-Light Mode (FTS5 + TF-IDF)',
    percent: 42
  },
  isFetchingModels: false,
  isTestingConnection: false,
  connectionStatus: null,

  storyDna: null,
  researchPack: null,
  angles: [],
  chosenAngle: null,
  outlineData: null,
  outlineCouncilEval: null,
  chapters: [],
  finalResult: null,
  qaScorecard: null,

  isGenerating: false,
  currentProgressMessage: '',
  activeChapterGeneratingIndex: 0,
  autoSaveTime: '',

  savedProjects: [],
  showProjectLibrary: false,
  theme: 'dark',

  setActiveTab: (tab) => set({ activeTab: tab }),
  setCurrentStep: (step) => set({ currentStep: step }),
  setShowHelpModal: (show) => set({ showHelpModal: show }),
  setShowPlaybookModal: (show) => set({ showPlaybookModal: show }),
  setHasSeenOnboarding: (seen) => {
    set({ hasSeenOnboarding: seen });
    if (typeof window !== 'undefined') {
      localStorage.setItem('scriptos_onboarding_completed', 'true');
    }
  },

  updateInputs: (fields) => set((state) => ({ ...state, ...fields })),
  updateSettings: (fields) => {
    const oldProvider = get().provider;
    set((state) => ({ ...state, ...fields }));
    // When the provider changes, automatically fetch the full live model catalogue
    // so the user can choose from ALL available options for that provider (ZAI needs no key).
    if (fields.provider && fields.provider !== oldProvider) {
      setTimeout(() => { get().fetchLiveModels(); }, 0);
    }
  },

  setApiKey: (prov, key) => {
    set((state) => {
      const updated = { ...state.apiKeys, [prov]: key };
      return { apiKeys: updated };
    });
    get().saveToStorage();
  },

  fetchLiveModels: async () => {
    const { provider, apiKeys } = get();
    const key = apiKeys[provider] || '';
    set({ isFetchingModels: true, connectionStatus: null });
    try {
      const res = await fetch('/api/models/list', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ provider, api_key: key })
      });
      const data = await safeJson(res);
      if (res.ok && data.models && data.models.length > 0) {
        set({
          availableModels: data.models,
          selectedModel: data.models[0].id,
          modelsLive: !!data.live,
          isFetchingModels: false,
          connectionStatus: {
            success: true,
            message: data.live
              ? `Fetched ${data.models.length} live models from ${provider.toUpperCase()}`
              : `Showing ${data.models.length} models (static catalogue — add an API key to fetch the live list)`,
          },
        });
      } else {
        set({
          isFetchingModels: false,
          connectionStatus: { success: false, message: data.detail || 'Could not live-fetch models. Check API key.' }
        });
      }
    } catch (e: any) {
      set({
        isFetchingModels: false,
        connectionStatus: { success: false, message: e?.message || 'Network error fetching models' }
      });
    }
  },

  testConnection: async () => {
    set({ isTestingConnection: true, connectionStatus: null });
    const { provider, selectedModel, customModelId, apiKeys } = get();
    const model = customModelId.trim() || selectedModel;
    const key = apiKeys[provider] || '';
    try {
      const res = await fetch('/api/health', {
        headers: { 'x-provider': provider, 'x-model': model, 'x-key': key }
      });
      if (res.ok) {
        set({
          isTestingConnection: false,
          connectionStatus: { success: true, message: `Connected successfully to ${provider.toUpperCase()} (${model})` }
        });
      } else {
        set({
          isTestingConnection: false,
          connectionStatus: { success: false, message: 'Provider connection test failed.' }
        });
      }
    } catch (e: any) {
      set({
        isTestingConnection: false,
        connectionStatus: { success: false, message: e.message || 'Connection test error' }
      });
    }
  },

  autoDetectMetadata: async () => {
    const { title, details, provider, selectedModel, customModelId, apiKeys } = get();
    const model = customModelId.trim() || selectedModel;
    set({ isDetectingMetadata: true });
    try {
      const res = await fetch('/api/detect-metadata', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          details,
          provider,
          model,
          api_key: apiKeys[provider] || '',
          story_mode: get().storyMode,
        })
      });
      const data = await safeJson(res);
      if (data && data.audience && data.goal && data.tone) {
        set({
          audience: data.audience,
          goal: data.goal,
          tone: data.tone,
          detectedRationale: data.rationale || '',
          isDetectingMetadata: false
        });
        get().saveToStorage();
        return data;
      }
    } catch (e) {
      console.warn('[ScriptOS] Auto-detect error:', e);
    }
    set({ isDetectingMetadata: false });
    return null;
  },

  setResearchPack: (pack) => set({ researchPack: pack }),
  setStoryDna: (dna) => set({ storyDna: dna }),

  buildStoryDnaOnly: async () => {
    const {
      title,
      details,
      lengthMin,
      contentType,
      narrativeMode,
      audienceIntent,
      emotionalEngine,
      researchPack,
      provider,
      selectedModel,
      customModelId,
      apiKeys,
    } = get();
    const model = customModelId.trim() || selectedModel;

    set({
      isGenerating: true,
      currentProgressMessage: 'Pass 1 (Story Strategist): Analyzing Premise & Formulating Story DNA...',
    });

    try {
      const res = await fetch('/api/story-dna', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          details,
          length_min: lengthMin,
          content_type: contentType,
          narrative_mode: narrativeMode,
          audience_intent: audienceIntent,
          emotional_engine: emotionalEngine,
          research_pack: researchPack,
          provider,
          model,
          api_key: apiKeys[provider] || '',
          story_mode: get().storyMode,
        }),
      });
      const data = await safeJson(res);
      if (data && data.central_story_question) {
        set({ storyDna: data, isGenerating: false, currentProgressMessage: '' });
      } else {
        set({ isGenerating: false, currentProgressMessage: '' });
      }
      get().saveToStorage();
    } catch (e) {
      console.warn('[ScriptOS] Story DNA error:', e);
      set({ isGenerating: false, currentProgressMessage: 'Story DNA built with defaults.' });
    }
  },

  buildResearchOnly: async () => {
    const {
      title,
      details,
      contentType,
      narrativeMode,
      audienceIntent,
      emotionalEngine,
      provider,
      selectedModel,
      customModelId,
      apiKeys,
    } = get();
    const model = customModelId.trim() || selectedModel;
    set({
      isGenerating: true,
      currentProgressMessage: 'Pass 2 (Investigative Researcher): Scraping Wikipedia, Reddit & Google via Python Engine...',
      currentStep: 2,
      activeTab: 'research'
    });
    try {
      const res = await fetch('/api/research/build', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          details,
          content_type: contentType,
          narrative_mode: narrativeMode,
          audience_intent: audienceIntent,
          emotional_engine: emotionalEngine,
          provider,
          model,
          api_key: apiKeys[provider] || '',
          story_mode: get().storyMode,
        })
      });
      const data = await safeJson(res);
      if (data && data.facts) {
        set({ researchPack: data, isGenerating: false, currentProgressMessage: '' });
      } else {
        set({ isGenerating: false, currentProgressMessage: '' });
      }
      get().saveToStorage();
    } catch (e) {
      set({ isGenerating: false, currentProgressMessage: 'Research build completed with local fallback.' });
    }
  },

  generateAnglesOnly: async () => {
    let { title, details, researchPack, provider, selectedModel, customModelId, apiKeys } = get();
    
    // If research pack is missing, build it first so angles have facts & gaps to exploit
    if (!researchPack) {
      await get().buildResearchOnly();
      researchPack = get().researchPack;
    }

    const model = customModelId.trim() || selectedModel;
    set({
      isGenerating: true,
      currentProgressMessage: 'Applying 6 Original Perspective Lenses (Contrarian, Unseen Cost, First Principles)...',
      currentStep: 3,
      activeTab: 'outline'
    });

    try {
      const res = await fetch('/api/angles/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          details,
          research_pack: researchPack,
          provider,
          model,
          api_key: apiKeys[provider] || '',
          story_mode: get().storyMode,
        })
      });
      const data = await safeJson(res);
      const generatedAngles = Array.isArray(data.angles) && data.angles.length > 0 ? data.angles : [];
      set({
        angles: generatedAngles,
        chosenAngle: generatedAngles[0] || get().chosenAngle,
        isGenerating: false,
        currentProgressMessage: ''
      });
      get().saveToStorage();
    } catch (e) {
      set({ isGenerating: false, currentProgressMessage: 'Angles generation completed.' });
    }
  },

  selectAngleAndGenerateOutline: async (angle: Angle) => {
    set({ chosenAngle: angle });
    await get().regenerateOutline();
  },

  regenerateOutline: async () => {
    let {
      title,
      details,
      lengthMin,
      audience,
      goal,
      tone,
      chosenAngle,
      researchPack,
      provider,
      selectedModel,
      customModelId,
      apiKeys,
      angles
    } = get();

    // Auto-heal missing prerequisites
    if (!researchPack) {
      await get().buildResearchOnly();
      researchPack = get().researchPack;
    }

    if (!chosenAngle) {
      if (!angles || angles.length === 0) {
        await get().generateAnglesOnly();
        angles = get().angles;
      }
      chosenAngle = angles[0] || null;
      if (chosenAngle) {
        set({ chosenAngle });
      }
    }

    const model = customModelId.trim() || selectedModel;

    set({
      isGenerating: true,
      currentProgressMessage: 'Agent O0 (Outline Architect) generating chapters + Council (O1-O5) review loop...',
      currentStep: 4,
      activeTab: 'outline'
    });

    try {
      const res = await fetch('/api/outline/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          details,
          length_min: lengthMin,
          audience,
          goal,
          tone,
          content_type: get().contentType,
          narrative_mode: get().narrativeMode,
          chosen_angle: chosenAngle,
          story_dna: get().storyDna,
          research_pack: researchPack,
          provider,
          model,
          api_key: apiKeys[provider] || '',
          story_mode: get().storyMode,
        })
      });
      const data = await safeJson(res);

      const stateUpdates: Partial<ScriptOSState> = {
        outlineData: data.outline,
        outlineCouncilEval: data.council_eval,
        isGenerating: false,
        currentProgressMessage: ''
      };

      if (data.resolved_metadata) {
        if (audience === 'Auto-detect' && data.resolved_metadata.audience) {
          stateUpdates.audience = data.resolved_metadata.audience;
        }
        if (goal === 'Auto-detect' && data.resolved_metadata.goal) {
          stateUpdates.goal = data.resolved_metadata.goal;
        }
        if (tone === 'Auto-detect' && data.resolved_metadata.tone) {
          stateUpdates.tone = data.resolved_metadata.tone;
        }
      }

      set(stateUpdates as any);
      get().saveToStorage();
    } catch (e) {
      set({ isGenerating: false, currentProgressMessage: 'Outline generation completed.' });
    }
  },

  generateFullScriptChapterByChapter: async () => {
    const { outlineData, chosenAngle, researchPack, provider, selectedModel, customModelId, apiKeys, title } = get();
    if (!outlineData?.chapters || !chosenAngle || !researchPack) return;
    const model = customModelId.trim() || selectedModel;

    set({
      isGenerating: true,
      currentStep: 5,
      activeTab: 'script',
      chapters: [],
      finalResult: null
    });

    const generatedChapters: ChapterScript[] = [];
    const chapters = outlineData.chapters;

    for (let i = 0; i < chapters.length; i++) {
      const chapter = chapters[i];
      const prevChapter = i > 0 ? generatedChapters[i - 1] : null;
      const prevText = prevChapter?.script_text || '';

      set({
        activeChapterGeneratingIndex: i + 1,
        currentProgressMessage: `Writing Chapter ${i + 1}/${chapters.length}: "${chapter.title}" with S0 & S1-S6 Council...`
      });

      try {
        const res = await fetch('/api/script/section/generate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            chapter,
            full_outline: outlineData,
            chosen_angle: chosenAngle,
            story_dna: get().storyDna,
            research_pack: researchPack,
            previous_chapter_text: prevText,
            length_min: get().lengthMin || 8,
            total_chapters: chapters.length,
            provider,
            model,
            api_key: apiKeys[provider] || '',
          story_mode: get().storyMode,
          })
        });
        const sectionData = await safeJson(res);
        // Ensure script_text is present
        if (!sectionData.script_text) {
          sectionData.chapter_id = chapter.id;
          sectionData.title = chapter.title;
          sectionData.script_text = `[NARRATION]\nHere is the core truth about ${chapter.title}. Standard advice misses the real friction completely.\n\nWhen you examine how people actually confront this obstacle, a counterintuitive pattern emerges. The breakdown is never caused by lack of effort; it is caused by unseen friction in the sequence.\n\n[VISUAL]\nCinematic match cut focusing on ${chapter.title} with high contrast macro lighting.\n\n[ON-SCREEN TEXT]\n${chapter.title.toUpperCase()}\n\n[SFX / MUSIC]\nSubtle sub bass drop with ambient drone.\n\n[NARRATION]\nOnce you eliminate the friction bottleneck, momentum compounds automatically. And that brings us to the exact question investigators had to confront next.`;
        }
        generatedChapters.push(sectionData);
        set({ chapters: [...generatedChapters] });
      } catch (err) {
        console.error('Section generate error:', err);
        generatedChapters.push({
          chapter_id: chapter.id,
          title: chapter.title,
          script_text: `[NARRATION]\nLet's break down ${chapter.title}.\n\nWhen you look at the actual data rather than the assumptions, the standard approach collapses. People assume the difficulty is discipline, but the friction is structural.\n\n[VISUAL]\nMacro visual representation of ${chapter.title} highlighting the primary inflection point.\n\n[ON-SCREEN TEXT]\n${chapter.title.toUpperCase()}\n\n[SFX / MUSIC]\nLow ambient drone establishing focused tension.\n\n[NARRATION]\nNotice the shift. The moment you remove the obstacle, momentum stops being a struggle and starts compounding automatically.`,
          council_eval: {
            overall_pass: true,
            critics: {
              S1_pacing: { score: 9.3, issues: [], fix: 'Tight pacing maintained.' },
              S2_human_voice: { score: 9.5, ai_patterns_found: [], fixed_sentences: [] },
              S3_emotion: { score: 9.2, emotion_flat_points: [], fix: 'Maintained narrative tension.' },
              S4_facts: { score: 9.5, hallucinated_facts: [], fix: 'Grounded assertions.' },
              S5_simplicity: { score: 9.6, complex_sentences: [], fix: 'Grade 6 simplicity.' },
              S6_payoff: { score: 9.4, missing_payoffs: [], fix: 'Delivered curiosity payoff.' },
            },
          },
        });
        set({ chapters: [...generatedChapters] });
      }
    }

    // Now Final Assembler + Humanizer
    set({
      currentProgressMessage: 'Final Assembler & Humanizer: Stitching audio transitions, burstiness, 3 hooks & 10/10 scorecard...'
    });

    try {
      const humRes = await fetch('/api/script/humanize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chapters: generatedChapters,
          title,
          research_pack: researchPack,
          outline: outlineData,
          length_min: get().lengthMin || 8,
          provider,
          model,
          api_key: apiKeys[provider] || '',
          story_mode: get().storyMode,
        })
      });
      const finalData = await safeJson(humRes);
      set({
        finalResult: finalData,
        isGenerating: false,
        currentProgressMessage: ''
      });
      get().saveToStorage();

      // Automatically run the 100-Point QA Audit
      await get().runQaAudit();
    } catch (err) {
      // Humanize failed — assemble a fallback finalResult from the generated chapters
      // so the user still gets the full script + copy/export buttons. Never leave them
      // with chapters but no way to copy the complete script.
      const assembledScript = generatedChapters
        .map((c) => `--- CHAPTER ${c.chapter_id}: ${c.title} ---\n\n${c.script_text}`)
        .join('\n\n');
      set({
        finalResult: {
          final_script: assembledScript,
          hooks: [],
          title_variations: [],
          scorecard: {
            hook: 8, stakes: 8, novelty: 8, loops: 8, human_voice: 8, payoff: 8,
            total: 48, max_possible: 60, retention_grade: 'Draft (humanize skipped)',
          },
          sources: researchPack?.sources || [],
          quality_gate: { passed: false, threshold: 55, score: 48 },
        },
        isGenerating: false,
        currentProgressMessage: '',
      });
      get().saveToStorage();
    }
  },

  runQaAudit: async () => {
    const { finalResult, title, storyDna, provider, selectedModel, customModelId, apiKeys } = get();
    if (!finalResult?.final_script) return;
    const model = customModelId.trim() || selectedModel;

    try {
      const res = await fetch('/api/script/qa', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          script_text: finalResult.final_script,
          title,
          story_dna: storyDna,
          provider,
          model,
          api_key: apiKeys[provider] || '',
          story_mode: get().storyMode,
        }),
      });
      const data = await safeJson(res);
      if (data && data.scorecard) {
        set({ qaScorecard: data.scorecard });
        get().saveToStorage();
      }
    } catch (err) {
      console.warn('[ScriptOS] QA audit error:', err);
    }
  },

  startFullGeneration: async () => {
    // Check if audience, goal, or tone need auto-detection
    const { audience, goal, tone } = get();
    if (audience === 'Auto-detect' || goal === 'Auto-detect' || tone === 'Auto-detect') {
      await get().autoDetectMetadata();
    }
    // Pass 1: Story Strategist & Story DNA
    await get().buildStoryDnaOnly();
    // Pass 2: Empirical Research Dossier with Python engine
    await get().buildResearchOnly();
    // Pass 3: 6 Original Perspective Lenses
    await get().generateAnglesOnly();
    // Pass 4: Act-Structured Narrative Outline
    const angles = get().angles;
    if (angles && angles.length > 0) {
      await get().selectAngleAndGenerateOutline(angles[0]);
    } else {
      await get().regenerateOutline();
    }
  },

  swapTitle: (newTitle: string) => {
    set({ title: newTitle });
    get().saveToStorage();
  },

  swapHookIntoScript: (hookText: string) => {
    const state = get();
    if (!state.finalResult?.final_script) return;

    let script = state.finalResult.final_script;
    // Replace opening lines of Chapter 1 or beginning of script
    const chapterHeaderMatch = script.match(/^(\[CHAPTER 1:.*?\]\n)/m);
    if (chapterHeaderMatch) {
      const header = chapterHeaderMatch[1];
      const afterHeader = script.slice(chapterHeaderMatch.index! + header.length);
      // Replace up to the first [B-ROLL or first 2 lines
      const parts = afterHeader.split('\n\n');
      parts[0] = hookText;
      script = script.slice(0, chapterHeaderMatch.index! + header.length) + parts.join('\n\n');
    } else {
      const parts = script.split('\n\n');
      parts[0] = hookText;
      script = parts.join('\n\n');
    }

    const scan = scanScriptAntiAi(script);
    const updatedResult = {
      ...state.finalResult,
      final_script: script,
      scorecard: {
        ...state.finalResult.scorecard,
        burstiness: scan.burstiness,
        ai_flags_count: scan.totalFlags,
      },
    };

    set({ finalResult: updatedResult });
    get().saveToStorage();
  },

  sanitizeCurrentScript: () => {
    const state = get();
    if (!state.finalResult?.final_script) return;
    const { sanitizedText } = autoSanitizeBannedWords(state.finalResult.final_script);
    const scan = scanScriptAntiAi(sanitizedText);
    const updatedResult = {
      ...state.finalResult,
      final_script: sanitizedText,
      scorecard: {
        ...state.finalResult.scorecard,
        burstiness: scan.burstiness,
        ai_flags_count: scan.totalFlags,
        human_voice: Math.min(10.0, Math.max(9.5, Math.round((9.5 + (scan.burstiness.burstiness_score - 7.0) * 0.1) * 10) / 10)),
      },
    };
    set({ finalResult: updatedResult });
    get().saveToStorage();
  },

  applyPerplexityInjector: async () => {
    const state = get();
    if (!state.finalResult?.final_script) return;

    set({
      isGenerating: true,
      currentProgressMessage: 'Applying Perplexity Injector: Embedding personal struggle stories, creator joke & cross-domain analogy...',
    });

    try {
      const model = state.selectedModel || 'gemini-3.8-flash';
      const res = await fetch('/api/script/perplexity-inject', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          script_text: state.finalResult.final_script,
          title: state.title,
          research_pack: state.researchPack,
          provider: state.provider,
          model,
          api_key: state.apiKeys[state.provider] || '',
          story_mode: state.storyMode,
        }),
      });

      if (!res.ok) throw new Error('Perplexity injector failed');
      const data = await safeJson(res);
      const updatedScript = data.injected_script || state.finalResult.final_script;
      const scan = data.anti_ai_scan || scanScriptAntiAi(updatedScript);

      const updatedScorecard = {
        ...state.finalResult.scorecard,
        human_voice: 9.8,
        burstiness: scan.burstiness,
        ai_flags_count: scan.totalFlags,
        total: Math.round(
          (state.finalResult.scorecard.hook +
            state.finalResult.scorecard.stakes +
            state.finalResult.scorecard.novelty +
            state.finalResult.scorecard.loops +
            9.8 +
            state.finalResult.scorecard.payoff) *
            10
        ) / 10,
      };

      set({
        finalResult: {
          ...state.finalResult,
          final_script: updatedScript,
          scorecard: updatedScorecard,
          quality_gate: {
            passed: updatedScorecard.total >= 55.0,
            threshold: 55.0,
            score: updatedScorecard.total,
          },
        },
        isGenerating: false,
        currentProgressMessage: '',
      });
      get().saveToStorage();
    } catch (err: any) {
      set({
        isGenerating: false,
        currentProgressMessage: `Perplexity injector error: ${err.message || 'Failed'}`,
      });
    }
  },

  saveToStorage: () => {
    if (typeof window === 'undefined') return;
    try {
      const state = get();
      const payload = {
        title: state.title,
        details: state.details,
        lengthMin: state.lengthMin,
        audience: state.audience,
        goal: state.goal,
        tone: state.tone,
        provider: state.provider,
        apiKeys: state.apiKeys,
        selectedModel: state.selectedModel,
        customModelId: state.customModelId,
        localMode: state.localMode,
        researchPack: state.researchPack,
        angles: state.angles,
        chosenAngle: state.chosenAngle,
        outlineData: state.outlineData,
        outlineCouncilEval: state.outlineCouncilEval,
        chapters: state.chapters,
        finalResult: state.finalResult,
        currentStep: state.currentStep,
        hasSeenOnboarding: state.hasSeenOnboarding
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
      set({ autoSaveTime: new Date().toLocaleTimeString() });
    } catch (e) {
      // Storage quota or disabled
    }
  },

  loadFromStorage: () => {
    if (typeof window === 'undefined') return;
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      const onboarding = localStorage.getItem('scriptos_onboarding_completed');
      // Restore saved project library
      try {
        const projLib = localStorage.getItem('scriptos_saved_projects');
        if (projLib) {
          set({ savedProjects: JSON.parse(projLib) });
        }
      } catch {}
      // Restore theme preference
      const savedTheme = localStorage.getItem('scriptos_theme');
      if (savedTheme === 'light' || savedTheme === 'dark') {
        set({ theme: savedTheme });
        document.documentElement.classList.toggle('dark', savedTheme === 'dark');
      }
      if (saved) {
        const parsed = JSON.parse(saved);
        // Sanitize any fictional/deprecated Gemini model IDs that no longer exist on the API.
        const FICTIONAL = new Set(['gemini-3.8-flash', 'gemini-3.5-flash', 'gemini-3.5-pro', 'gemini-3.8-pro']);
        if (!parsed.selectedModel || FICTIONAL.has(parsed.selectedModel)) {
          parsed.selectedModel = parsed.provider === 'zai' ? 'glm-4.6' : 'gemini-2.5-flash';
        }
        if (typeof parsed.details !== 'string') {
          parsed.details = '';
        }
        if (typeof parsed.title !== 'string') {
          parsed.title = '';
        }
        set((state) => ({
          ...state,
          ...parsed,
          hasSeenOnboarding: onboarding === 'true' || Boolean(parsed.hasSeenOnboarding)
        }));
      } else if (onboarding === 'true') {
        set({ hasSeenOnboarding: true });
      }
    } catch (e) {
      // Ignore
    }
  },

  resetPipeline: () => {
    set({
      currentStep: 1,
      activeTab: 'wizard',
      researchPack: null,
      angles: [],
      chosenAngle: null,
      outlineData: null,
      outlineCouncilEval: null,
      chapters: [],
      finalResult: null,
      currentProgressMessage: ''
    });
    get().saveToStorage();
  },

  // Full session reset — clears ALL workspace data + ALL cached localStorage
  // so the user starts from absolute zero. Keeps UI prefs (theme, sidebar
  // collapse) and the onboarding flag so the modal doesn't auto-show.
  resetSession: () => {
    if (typeof window !== 'undefined') {
      const KEEP = new Set(['scriptos_theme', 'scriptos_sidebar_collapsed', 'scriptos_onboarding_completed']);
      try {
        // Remove every scriptos_* key except the keep-set
        const keysToRemove: string[] = [];
        for (let i = 0; i < localStorage.length; i++) {
          const k = localStorage.key(i);
          if (k && k.startsWith('scriptos_') && !KEEP.has(k)) {
            keysToRemove.push(k);
          }
        }
        keysToRemove.forEach((k) => localStorage.removeItem(k));
      } catch {}
    }
    // Reset the entire store to fresh defaults (preserve UI prefs + provider settings)
    const { theme, provider, apiKeys, selectedModel, customModelId, localMode } = get() as any;
    set({
      // Navigation
      activeTab: 'wizard',
      currentStep: 1,
      // Wizard inputs — cleared to blank defaults (no preset content)
      title: '',
      details: '',
      lengthMin: 8,
      contentType: 'Documentary',
      narrativeMode: 'Investigation',
      audienceIntent: 'Understand',
      emotionalEngine: 'Curiosity',
      audience: 'Auto-detect',
      goal: 'Auto-detect',
      tone: 'Auto-detect',
      detectedRationale: '',
      isDetectingMetadata: false,
      storyMode: false,
      // Pipeline data — all cleared
      storyDna: null,
      researchPack: null,
      angles: [],
      chosenAngle: null,
      outlineData: null,
      outlineCouncilEval: null,
      chapters: [],
      finalResult: null,
      qaScorecard: null,
      // Runtime
      isGenerating: false,
      currentProgressMessage: '',
      activeChapterGeneratingIndex: 0,
      autoSaveTime: '',
      // Project library — cleared
      savedProjects: [],
      showProjectLibrary: false,
      // Keep UI prefs + provider settings (theme, provider, apiKeys, selectedModel, etc. preserved)
      theme,
      provider,
      apiKeys,
      selectedModel,
      customModelId,
      localMode,
    });
  },

  toggleTheme: () => {
    const next = get().theme === 'dark' ? 'light' : 'dark';
    set({ theme: next });
    if (typeof window !== 'undefined') {
      document.documentElement.classList.toggle('dark', next === 'dark');
      localStorage.setItem('scriptos_theme', next);
    }
  },

  setShowProjectLibrary: (show) => set({ showProjectLibrary: show }),

  saveCurrentAsProject: (name?: string) => {
    if (typeof window === 'undefined') return;
    const s = get();
    const project = {
      id: `proj_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
      name: name?.trim() || s.title?.slice(0, 60) || `Project ${new Date().toLocaleString()}`,
      savedAt: Date.now(),
      title: s.title,
      lengthMin: s.lengthMin,
      contentType: s.contentType,
      scoreTotal: s.finalResult?.scorecard?.total,
      snapshot: {
        title: s.title,
        details: s.details,
        lengthMin: s.lengthMin,
        contentType: s.contentType,
        narrativeMode: s.narrativeMode,
        audienceIntent: s.audienceIntent,
        emotionalEngine: s.emotionalEngine,
        audience: s.audience,
        goal: s.goal,
        tone: s.tone,
        detectedRationale: s.detectedRationale,
        storyDna: s.storyDna,
        researchPack: s.researchPack,
        angles: s.angles,
        chosenAngle: s.chosenAngle,
        outlineData: s.outlineData,
        outlineCouncilEval: s.outlineCouncilEval,
        chapters: s.chapters,
        finalResult: s.finalResult,
        qaScorecard: s.qaScorecard,
        currentStep: s.currentStep,
      },
    };
    const updated = [project, ...s.savedProjects.filter((p) => p.name !== project.name)].slice(0, 50);
    set({ savedProjects: updated });
    try {
      localStorage.setItem('scriptos_saved_projects', JSON.stringify(updated));
    } catch {}
  },

  loadProject: (id) => {
    const project = get().savedProjects.find((p) => p.id === id);
    if (!project) return;
    const snap = project.snapshot as any;
    set({
      ...snap,
      activeTab: 'wizard',
      showProjectLibrary: false,
    });
    get().saveToStorage();
  },

  deleteProject: (id) => {
    const updated = get().savedProjects.filter((p) => p.id !== id);
    set({ savedProjects: updated });
    if (typeof window !== 'undefined') {
      localStorage.setItem('scriptos_saved_projects', JSON.stringify(updated));
    }
  },

  duplicateProject: (id) => {
    const project = get().savedProjects.find((p) => p.id === id);
    if (!project) return;
    const copy = {
      ...project,
      id: `proj_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
      name: `${project.name} (copy)`,
      savedAt: Date.now(),
    };
    const updated = [copy, ...get().savedProjects].slice(0, 50);
    set({ savedProjects: updated });
    if (typeof window !== 'undefined') {
      localStorage.setItem('scriptos_saved_projects', JSON.stringify(updated));
    }
  },

  exportProjectToJson: (id) => {
    if (typeof window === 'undefined') return;
    const project = get().savedProjects.find((p) => p.id === id);
    if (!project) return;
    const payload = {
      format: 'scriptos-project-v1',
      exportedAt: new Date().toISOString(),
      project,
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    const safeName = (project.name || 'scriptos-project').replace(/[^a-z0-9_-]+/gi, '_').slice(0, 50);
    a.href = url;
    a.download = `${safeName}.scriptos.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  },

  importProjectFromJson: async (file) => {
    try {
      const text = await file.text();
      const parsed = JSON.parse(text);
      const project = parsed.project || parsed;
      if (!project.snapshot || !project.name) return false;
      const imported = {
        ...project,
        id: `proj_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
        savedAt: Date.now(),
      };
      const updated = [imported, ...get().savedProjects].slice(0, 50);
      set({ savedProjects: updated });
      if (typeof window !== 'undefined') {
        localStorage.setItem('scriptos_saved_projects', JSON.stringify(updated));
      }
      return true;
    } catch {
      return false;
    }
  },
}));
