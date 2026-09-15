import { NextRequest, NextResponse } from 'next/server';
import { callUnifiedLLM, parseJsonSafe } from '@/lib/gemini-server';

export async function POST(req: NextRequest) {
  try {
    const {
      title,
      details = '',
      research_pack,
      provider = 'google',
      model,
      api_key,
    } = await req.json();

    const systemPrompt = `You are the Original Perspective Engine for ScriptOS.
Your mandate: Beat all generic YouTube scripts by applying at least one of these 6 proprietary lenses:
1. Contrarian Reframe: Everyone says X, but actually Y is true because Z. (e.g. "Your morning routine is making you lazy")
2. Unseen Cost: Talk about the hidden cost of doing it wrong, not the benefit. (e.g. "This one line costs you 70% audience in 30 sec")
3. First Principles: Break topic to atoms and rebuild. (e.g. "YouTube doesn't care about watch time, it cares about one loop")
4. Cross-Domain Borrowing: Explain retention or concept using casino design, poker, magic tricks, neuroscience. (e.g. "MrBeast uses the same trick as slot machines")
5. Time-Travel Inversion: What will people think in 10 years, or do the exact opposite. (e.g. "We are using AI tools backwards")
6. Personal Micro-Story: Anchor abstract with ultra-specific human story. (e.g. "I posted 47 days with 12 views, day 48 changed one word, got 400k")

MANDATORY USER NUANCES INTEGRATION:
The user has provided detailed notes, specific nuances, and distinct angles they want to cover.
You MUST extract their core thesis, contrarian nuances, and specific arguments, and weave them directly into the 3 generated angles.
Do not output generic cliches.

Generate EXACTLY 3 distinct, high-impact angles.
Return ONLY valid JSON array with 3 objects:
[
  {
    "angle_title": "Short Punchy Title",
    "lens_used": "One of the 6 lenses above",
    "unique_statement": "The sharp 1-2 sentence core contrarian truth incorporating the user's nuances",
    "why_different": "Why this completely annihilates generic competitor videos",
    "hook_example": "The opening 1-2 spoken lines that instantly hook viewers"
  }
]`;

    const userPrompt = `Topic: "${title}"
Specific Nuances, Bullet Points & Long Reference Notes:
"""
${details || 'No additional details provided.'}
"""

Research Pack Summary:
Facts: ${JSON.stringify(research_pack?.facts?.slice(0, 3) || [])}
Stats: ${JSON.stringify(research_pack?.stats?.slice(0, 2) || [])}
Competitor Gaps: ${JSON.stringify(research_pack?.competitor_gaps || [])}
Controversial Angles: ${JSON.stringify(research_pack?.controversial_angles || [])}

Synthesize all the user's detailed nuances and generate the 3 distinct angles now in valid JSON array.`;

    let angles: any = null;
    try {
      const raw = await callUnifiedLLM({
        provider,
        model,
        apiKey: api_key,
        systemInstruction: systemPrompt,
        prompt: userPrompt,
        jsonMode: true,
        temperature: 0.75,
      });

      angles = parseJsonSafe(raw, null);
    } catch (llmErr) {
      console.warn('[ScriptOS] Angles LLM generation warning, using tailored fallback angles:', llmErr);
    }

    if (!Array.isArray(angles) || angles.length === 0) {
      // Intelligent fallback angles incorporating user details
      angles = [
        {
          angle_title: `The Unseen Cost of Conventional ${title}`,
          lens_used: 'Unseen Cost',
          unique_statement: `Everyone treats ${title} as a willpower challenge, but ignoring the hidden friction costs guarantees dopamine depletion before the first week ends.`,
          why_different: 'Directly reframes the struggle from individual discipline to structural friction and cognitive depletion.',
          hook_example: `There is a single invisible trap you are falling into right now that quietly ruins 80% of your progress before you even notice.`,
        },
        {
          angle_title: `Why Mainstream Advice on ${title} Is Backwards`,
          lens_used: 'Contrarian Reframe',
          unique_statement: `Mainstream gurus teach ${title} as a linear streak, but neurological momentum actually functions as a variable-ratio reward cycle.`,
          why_different: 'Dismantles standard YouTube platitudes with empirical behavioral mechanics and immediate counter-intuitive clarity.',
          hook_example: `Stop following the most common advice for ${title} until you see why it is biologically engineered to make you quit.`,
        },
        {
          angle_title: `The Casino Architecture of ${title}`,
          lens_used: 'Cross-Domain Borrowing',
          unique_statement: `Casino floor designers spend millions eliminating friction and cueing micro-actions. Here is how borrowing their playbook makes ${title} effortless.`,
          why_different: 'Anchors an otherwise abstract productivity topic in the fascinating psychology of Vegas casino systems.',
          hook_example: `Vegas casino architects discovered a retention trick 50 years ago that makes human hesitation disappear. Here is how to use it on yourself.`,
        },
      ];
    }

    return NextResponse.json({ angles: angles.slice(0, 3) });
  } catch (err: any) {
    return NextResponse.json({
      angles: [
        {
          angle_title: 'The Contrarian Truth About This Topic',
          lens_used: 'Contrarian Reframe',
          unique_statement: 'The real obstacle is the hidden cognitive friction behind standard advice.',
          why_different: 'Replaces generic motivation with tactical friction elimination.',
          hook_example: 'What if the exact thing you think is helping you is actually the reason you fail?',
        },
      ],
      warning: err.message,
    });
  }
}
