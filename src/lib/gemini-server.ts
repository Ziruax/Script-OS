import { GoogleGenAI } from '@google/genai';

// Lazy ZAI singleton — created on first use (server-side only)
let _zaiPromise: Promise<any> | null = null;
async function getZai() {
  if (!_zaiPromise) {
    const mod = await import('z-ai-web-dev-sdk');
    const ZAI = (mod as any).default || mod;
    _zaiPromise = ZAI.create();
  }
  return _zaiPromise;
}

export function getGeminiClient(customApiKey?: string) {
  const key = customApiKey || process.env.GEMINI_API_KEY;
  if (!key) {
    throw new Error('No API key provided. Please configure GEMINI_API_KEY or provide a key.');
  }
  return new GoogleGenAI({
    apiKey: key,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

export async function callUnifiedLLM({
  provider = 'google',
  model = 'gemini-2.5-flash',
  apiKey,
  systemInstruction,
  prompt,
  jsonMode = false,
  temperature = 0.7,
}: {
  provider?: string;
  model?: string;
  apiKey?: string;
  systemInstruction?: string;
  prompt: string;
  jsonMode?: boolean;
  temperature?: number;
}): Promise<string> {
  const activeProvider = provider.toLowerCase().trim();

  // ── ZAI provider (zero-config, uses system-managed credentials) ──────────
  if (activeProvider === 'zai') {
    const zai = await getZai();
    const messages: Array<{ role: 'system' | 'user' | 'assistant'; content: string }> = [];
    if (systemInstruction) {
      messages.push({ role: 'system', content: systemInstruction });
    }
    let userContent = prompt;
    if (jsonMode) {
      userContent += '\n\nOutput strictly valid JSON with no markdown wrapping, no preamble.';
    }
    messages.push({ role: 'user', content: userContent });

    const completion = await zai.chat.completions.create({
      model: model || 'glm-4.6',
      messages,
      thinking: { type: 'disabled' },
      temperature,
    } as any);

    const text: string | undefined = completion?.choices?.[0]?.message?.content;
    if (!text) {
      throw new Error('ZAI returned an empty response.');
    }
    return text;
  }

  const effectiveKey = apiKey?.trim() || (activeProvider === 'google' ? process.env.GEMINI_API_KEY : '');

  // If provider is Google (or no other provider key provided), use @google/genai with automatic model fallback
  if (activeProvider === 'google' || (!effectiveKey && process.env.GEMINI_API_KEY)) {
    const ai = getGeminiClient(effectiveKey || process.env.GEMINI_API_KEY);

    // Normalize requested model — only use real, currently-available Gemini models
    let requestedModel = model?.trim() || 'gemini-2.5-flash';
    // Fictional / deprecated -> safe modern default
    const KNOWN_GOOD = new Set([
      'gemini-2.5-flash',
      'gemini-2.5-flash-lite',
      'gemini-2.5-pro',
      'gemini-2.0-flash',
      'gemini-2.0-flash-lite',
      'gemini-1.5-pro',
      'gemini-1.5-flash',
    ]);
    if (!KNOWN_GOOD.has(requestedModel)) {
      requestedModel = 'gemini-2.5-flash';
    }

    // Supported active models in order of resilience
    const fallbackList = ['gemini-2.5-flash', 'gemini-2.0-flash', 'gemini-2.5-flash-lite', 'gemini-1.5-flash'];
    const candidateModels = [
      requestedModel,
      ...fallbackList.filter((m) => m !== requestedModel),
    ];

    const config: Record<string, any> = {
      temperature,
    };
    if (systemInstruction) {
      config.systemInstruction = systemInstruction;
    }
    if (jsonMode) {
      config.responseMimeType = 'application/json';
    }

    let lastError: any = null;
    for (const targetModel of candidateModels) {
      // Allow up to 2 attempts per model for transient errors with brief delay
      for (let attempt = 0; attempt < 2; attempt++) {
        try {
          const response = await ai.models.generateContent({
            model: targetModel,
            contents: prompt,
            config,
          });
          if (response.text !== undefined && response.text !== null) {
            return response.text;
          }
        } catch (err: any) {
          lastError = err;
          const msg = err?.message || String(err);
          const isTransient =
            msg.includes('503') ||
            msg.includes('429') ||
            msg.includes('UNAVAILABLE') ||
            msg.includes('high demand') ||
            msg.includes('Resource has been exhausted') ||
            msg.includes('Quota exceeded') ||
            msg.includes('not found') ||
            msg.includes('no longer available');

          if (isTransient) {
            console.warn(`[ScriptOS] Model ${targetModel} (attempt ${attempt + 1}) encountered transient error: ${msg.slice(0, 100)}. Trying fallback...`);
            // Brief backoff before next attempt/model
            await new Promise((resolve) => setTimeout(resolve, attempt === 0 ? 600 : 300));
            if (attempt === 0 && (msg.includes('503') || msg.includes('high demand'))) {
              // Retry once for high demand before switching model
              continue;
            }
            break; // Move to next candidate model
          }
          // Non-transient error, throw immediately
          throw err;
        }
      }
    }

    // If all candidate models failed
    throw lastError || new Error('All Gemini model candidates failed to respond.');
  }

  // Handle OpenAI, XAI, DeepSeek, OpenRouter, Groq, NVIDIA NIM — all OpenAI-compatible
  if (['openai', 'xai', 'deepseek', 'openrouter', 'groq', 'nvidia', 'nim'].includes(activeProvider)) {
    let endpoint = 'https://api.openai.com/v1/chat/completions';
    if (activeProvider === 'xai') endpoint = 'https://api.x.ai/v1/chat/completions';
    if (activeProvider === 'deepseek') endpoint = 'https://api.deepseek.com/chat/completions';
    if (activeProvider === 'openrouter') endpoint = 'https://openrouter.ai/api/v1/chat/completions';
    if (activeProvider === 'groq') endpoint = 'https://api.groq.com/openai/v1/chat/completions';
    if (activeProvider === 'nvidia' || activeProvider === 'nim') endpoint = 'https://integrate.api.nvidia.com/v1/chat/completions';

    const messages = [];
    if (systemInstruction) messages.push({ role: 'system', content: systemInstruction });
    messages.push({ role: 'user', content: prompt });

    const defaultModel =
      activeProvider === 'deepseek' ? 'deepseek-chat' :
      activeProvider === 'groq' ? 'llama-3.3-70b-versatile' :
      activeProvider === 'nvidia' || activeProvider === 'nim' ? 'meta/llama-3.3-70b-instruct' :
      'gpt-4o-mini';

    const body: Record<string, any> = {
      model: model || defaultModel,
      messages,
      temperature,
    };
    if (jsonMode) {
      body.response_format = { type: 'json_object' };
    }

    const res = await fetch(endpoint, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${effectiveKey}`,
        'Content-Type': 'application/json',
        // NVIDIA NIM requires an Accept header; harmless for the others.
        ...(activeProvider === 'nvidia' || activeProvider === 'nim' ? { Accept: 'application/json' } : {}),
      },
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      const err = await res.text();
      throw new Error(`${activeProvider.toUpperCase()} Error: ${res.status} ${err}`);
    }
    const data = await res.json();
    return data.choices?.[0]?.message?.content || '';
  }

  // Handle Anthropic / Claude
  if (['claude', 'anthropic'].includes(activeProvider)) {
    let userContent = prompt;
    if (jsonMode) {
      userContent += '\n\nOutput strictly valid JSON with no markdown wrapping.';
    }

    const res = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'x-api-key': effectiveKey || '',
        'anthropic-version': '2023-06-01',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: model || 'claude-3-5-sonnet-20241022',
        max_tokens: 4096,
        system: systemInstruction,
        messages: [{ role: 'user', content: userContent }],
        temperature,
      }),
    });

    if (!res.ok) {
      const err = await res.text();
      throw new Error(`Claude Error: ${res.status} ${err}`);
    }
    const data = await res.json();
    return data.content?.[0]?.text || '';
  }

  throw new Error(`Unsupported provider: ${provider}`);
}

export function parseJsonSafe(raw: string, defaultVal: any = {}): any {
  let cleaned = raw.trim();
  const match = cleaned.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
  if (match) {
    cleaned = match[1].trim();
  }
  try {
    return JSON.parse(cleaned);
  } catch (e) {
    const objectMatch = cleaned.match(/(\{[\s\S]*\}|\[[\s\S]*\])/);
    if (objectMatch) {
      try {
        return JSON.parse(objectMatch[1]);
      } catch (err) {
        // Fallback
      }
    }
    return defaultVal;
  }
}
