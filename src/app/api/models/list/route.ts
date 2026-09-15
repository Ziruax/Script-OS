import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const { provider = 'google', api_key = '' } = await req.json();
    const cleanProvider = provider.toLowerCase().trim();
    const effectiveKey = api_key.trim() || (cleanProvider === 'google' ? process.env.GEMINI_API_KEY : '');

    // For ZAI, no key is ever needed. For other providers, we still return the full
    // fallback model catalogue (200) even without a key so the user can browse and
    // select any model — they just won't be able to actually generate with it until
    // they paste a key. A key enables the LIVE fetch from the provider's API.
    const models: Array<{ id: string; name: string; provider: string; context_length?: number }> = [];

    // ZAI provider — zero-config, system-managed credentials (no key required).
    // Returns the full catalogue of GLM models available via z-ai-web-dev-sdk.
    if (cleanProvider === 'zai') {
      models.push(
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
      );
      return NextResponse.json({ provider: 'zai', models });
    }

    // For non-ZAI providers: try a LIVE fetch if a key is present, otherwise return
    // the full static fallback catalogue so the user can still browse every option.
    if (cleanProvider === 'google' || cleanProvider === 'gemini') {
      const url = `https://generativelanguage.googleapis.com/v1/models?key=${effectiveKey}`;
      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        for (const m of data.models || []) {
          const id = (m.name || '').replace('models/', '');
          if (m.supportedGenerationMethods?.includes('generateContent')) {
            models.push({
              id,
              name: id === 'gemini-3.8-flash'
                ? 'Gemini 3.8 Flash (10 RPM • 250k TPM • 1,500 RPD) [Default]'
                : `${m.displayName || id} (${id})`,
              provider: 'google',
              context_length: m.inputTokenLimit || 1000000,
            });
          }
        }
        // Ensure gemini-3.8-flash is always present and first
        if (!models.some((m) => m.id === 'gemini-3.8-flash')) {
          models.unshift({
            id: 'gemini-3.8-flash',
            name: 'Gemini 3.8 Flash (10 RPM • 250k TPM • 1,500 RPD) [Default]',
            provider: 'google',
            context_length: 1048576,
          });
        } else {
          // Sort gemini-3.8-flash to the top
          models.sort((a, b) => (a.id === 'gemini-3.8-flash' ? -1 : b.id === 'gemini-3.8-flash' ? 1 : 0));
        }
      } else {
        // Fallback default Google models
        models.push(
          { id: 'gemini-3.8-flash', name: 'Gemini 3.8 Flash (10 RPM • 250k TPM • 1,500 RPD) [Default]', provider: 'google', context_length: 1048576 },
          { id: 'gemini-2.0-flash', name: 'Gemini 2.0 Flash', provider: 'google', context_length: 1048576 },
          { id: 'gemini-1.5-pro', name: 'Gemini 1.5 Pro', provider: 'google', context_length: 2097152 },
          { id: 'gemini-1.5-flash', name: 'Gemini 1.5 Flash', provider: 'google', context_length: 1048576 },
          { id: 'gemini-2.0-flash-exp', name: 'Gemini 2.0 Flash Experimental', provider: 'google', context_length: 1048576 }
        );
      }
    } else if (cleanProvider === 'openai') {
      const res = await fetch('https://api.openai.com/v1/models', {
        headers: { Authorization: `Bearer ${effectiveKey}` },
      });
      if (res.ok) {
        const data = await res.json();
        for (const m of data.data || []) {
          if (['gpt-4', 'gpt-3.5', 'o1', 'o3'].some((k) => m.id.includes(k))) {
            models.push({
              id: m.id,
              name: m.id,
              provider: 'openai',
              context_length: 128000,
            });
          }
        }
        models.sort((a, b) => b.id.localeCompare(a.id));
      } else {
        models.push(
          { id: 'gpt-4o', name: 'GPT-4o', provider: 'openai', context_length: 128000 },
          { id: 'gpt-4o-mini', name: 'GPT-4o Mini', provider: 'openai', context_length: 128000 },
          { id: 'o1-preview', name: 'o1 Preview', provider: 'openai', context_length: 128000 }
        );
      }
    } else if (cleanProvider === 'claude' || cleanProvider === 'anthropic') {
      const res = await fetch('https://api.anthropic.com/v1/models', {
        headers: {
          'x-api-key': effectiveKey,
          'anthropic-version': '2023-06-01',
        },
      });
      if (res.ok) {
        const data = await res.json();
        for (const m of data.data || []) {
          models.push({
            id: m.id,
            name: `${m.display_name || m.id} (${m.id})`,
            provider: 'anthropic',
            context_length: 200000,
          });
        }
      } else {
        models.push(
          { id: 'claude-3-7-sonnet-20250219', name: 'Claude 3.7 Sonnet', provider: 'anthropic', context_length: 200000 },
          { id: 'claude-3-5-sonnet-20241022', name: 'Claude 3.5 Sonnet', provider: 'anthropic', context_length: 200000 },
          { id: 'claude-3-5-haiku-20241022', name: 'Claude 3.5 Haiku', provider: 'anthropic', context_length: 200000 }
        );
      }
    } else if (cleanProvider === 'xai' || cleanProvider === 'grok') {
      const res = await fetch('https://api.x.ai/v1/models', {
        headers: { Authorization: `Bearer ${effectiveKey}` },
      });
      if (res.ok) {
        const data = await res.json();
        for (const m of data.data || []) {
          models.push({ id: m.id, name: m.id, provider: 'xai', context_length: 131072 });
        }
      } else {
        models.push(
          { id: 'grok-2-latest', name: 'Grok 2 Latest', provider: 'xai', context_length: 131072 },
          { id: 'grok-2-mini', name: 'Grok 2 Mini', provider: 'xai', context_length: 131072 }
        );
      }
    } else if (cleanProvider === 'deepseek') {
      const res = await fetch('https://api.deepseek.com/models', {
        headers: { Authorization: `Bearer ${effectiveKey}` },
      });
      if (res.ok) {
        const data = await res.json();
        for (const m of data.data || []) {
          models.push({ id: m.id, name: m.id, provider: 'deepseek', context_length: 64000 });
        }
      } else {
        models.push(
          { id: 'deepseek-chat', name: 'DeepSeek V3 (deepseek-chat)', provider: 'deepseek', context_length: 64000 },
          { id: 'deepseek-reasoner', name: 'DeepSeek R1 (deepseek-reasoner)', provider: 'deepseek', context_length: 64000 }
        );
      }
    } else if (cleanProvider === 'openrouter') {
      const res = await fetch('https://openrouter.ai/api/v1/models', {
        headers: { Authorization: `Bearer ${effectiveKey}` },
      });
      if (res.ok) {
        const data = await res.json();
        for (const m of (data.data || []).slice(0, 50)) {
          models.push({
            id: m.id,
            name: m.name || m.id,
            provider: 'openrouter',
            context_length: m.context_length || 32000,
          });
        }
      } else {
        models.push(
          { id: 'deepseek/deepseek-r1', name: 'DeepSeek R1', provider: 'openrouter', context_length: 64000 },
          { id: 'anthropic/claude-3.5-sonnet', name: 'Claude 3.5 Sonnet', provider: 'openrouter', context_length: 200000 },
          { id: 'google/gemini-2.0-flash-001', name: 'Gemini 2.0 Flash', provider: 'openrouter', context_length: 1000000 }
        );
      }
    }

    return NextResponse.json({ provider: cleanProvider, models });
  } catch (err: any) {
    return NextResponse.json({ detail: err.message || 'Error fetching models' }, { status: 500 });
  }
}
