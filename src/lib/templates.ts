/**
 * Quick Start Templates for the ScriptOS Wizard.
 * Each template pre-fills the wizard inputs with a proven, high-retention
 * video configuration so users can start generating in one click.
 */

export interface WizardTemplate {
  id: string;
  name: string;
  emoji: string;
  desc: string;
  title: string;
  details: string;
  lengthMin: number;
  contentType: string;
  narrativeMode: string;
  audienceIntent: string;
  emotionalEngine: string;
  accent: string; // tailwind gradient classes
}

export const WIZARD_TEMPLATES: WizardTemplate[] = [
  {
    id: 'productivity',
    name: 'Productivity',
    emoji: '⚡',
    desc: 'Expose the hidden friction behind consistency & habits',
    title: 'Why 99% of People Fail to Stay Consistent',
    details:
      '- Break down the dopamine depletion cycle in the first 72 hours\n- Contrast willpower-based productivity vs friction-free architecture\n- Reveal the hidden cost of traditional 21-day habit advice\n- End with the 60-second micro-loop protocol',
    lengthMin: 8,
    contentType: 'Documentary',
    narrativeMode: 'Investigation',
    audienceIntent: 'Understand',
    emotionalEngine: 'Curiosity',
    accent: 'from-amber-500 to-orange-500',
  },
  {
    id: 'true-crime',
    name: 'True Crime',
    emoji: '🔍',
    desc: 'Investigate an unsolved case with psychological depth',
    title: 'The Disappearance Nobody Could Explain',
    details:
      '- Reconstruct the timeline of the final 48 hours\n- Examine the 3 contradictions in the official statement\n- Profile the psychological state of the key witness\n- Reveal the overlooked forensic evidence\n- End with the leading theory and what still does not add up',
    lengthMin: 15,
    contentType: 'True crime',
    narrativeMode: 'Investigation',
    audienceIntent: 'Understand',
    emotionalEngine: 'Suspense',
    accent: 'from-rose-500 to-red-600',
  },
  {
    id: 'tech-explainer',
    name: 'Tech Explainer',
    emoji: '🤖',
    desc: 'Decode a complex technology with a counter-intuitive angle',
    title: 'The AI Trick Every Company Is Using Wrong',
    details:
      '- Explain the core mechanism in Grade 6 language\n- Contrast the mainstream use case vs the actually powerful one\n- Show the hidden economic incentive behind the hype\n- Include one real failure story and one success story\n- End with a 3-step practical playbook',
    lengthMin: 12,
    contentType: 'Technology',
    narrativeMode: 'Explainer',
    audienceIntent: 'Understand',
    emotionalEngine: 'Fascination',
    accent: 'from-blue-500 to-cyan-500',
  },
  {
    id: 'personal-story',
    name: 'Personal Story',
    emoji: '🎬',
    desc: 'A vulnerable turning-point story with a universal lesson',
    title: 'The Day Everything Collapsed — and What I Did Next',
    details:
      '- Open at the lowest moment (in media res)\n- Reveal the one decision that caused the collapse\n- Trace the 7-day recovery arc\n- Extract the universal principle viewers can apply\n- End with the question that changed everything',
    lengthMin: 10,
    contentType: 'Personal story',
    narrativeMode: 'Chronological',
    audienceIntent: 'Feel',
    emotionalEngine: 'Empathy',
    accent: 'from-purple-500 to-fuchsia-500',
  },
  {
    id: 'business-case',
    name: 'Business Case Study',
    emoji: '📈',
    desc: 'Reverse-engineer a company’s breakout or breakdown',
    title: 'How One Pricing Change Doubled This Startup Overnight',
    details:
      '- Establish the before-state with hard numbers\n- Reveal the single decision and the reasoning behind it\n- Trace the 90-day aftermath with metrics\n- Extract the 3 transferable principles\n- Warn about the common misread of the case',
    lengthMin: 12,
    contentType: 'Case study',
    narrativeMode: 'Investigation',
    audienceIntent: 'Apply',
    emotionalEngine: 'Curiosity',
    accent: 'from-emerald-500 to-teal-500',
  },
  {
    id: 'mystery',
    name: 'Mystery',
    emoji: '🕵️',
    desc: 'A historical or scientific mystery with a satisfying payoff',
    title: 'The Signal That Took 40 Years to Decode',
    details:
      '- Establish the anomaly and why it defied explanation\n- Profile the 3 failed attempts over decades\n- Reveal the breakthrough insight\n- Explain the mechanism clearly\n- End with the implication that changes everything',
    lengthMin: 15,
    contentType: 'Mystery',
    narrativeMode: 'Investigation',
    audienceIntent: 'Understand',
    emotionalEngine: 'Fascination',
    accent: 'from-indigo-500 to-violet-500',
  },
];
