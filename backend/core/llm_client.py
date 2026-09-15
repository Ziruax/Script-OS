import os
import json
import re
import hashlib
import requests
from typing import Dict, Any, Optional
from backend.core.security import get_key_for_provider
from backend.core.db import get_cached_llm, set_cached_llm

def clean_json_string(raw: str) -> str:
    """Extract clean JSON from model markdown response."""
    text = raw.strip()
    match = re.search(r"```(?:json)?\s*([\s\S]*?)\s*```", text)
    if match:
        text = match.group(1).strip()
    return text

def parse_json_safely(raw: str, default: Any = None) -> Any:
    cleaned = clean_json_string(raw)
    try:
        return json.loads(cleaned)
    except Exception:
        # Try to find { ... } or [ ... ]
        m = re.search(r"(\{[\s\S]*\}|\[[\s\S]*\])", cleaned)
        if m:
            try:
                return json.loads(m.group(1))
            except Exception:
                pass
    return default if default is not None else {"error": "Failed to parse JSON", "raw": raw}

class UnifiedLLMClient:
    def __init__(self, provider: str = "google", model: Optional[str] = None, api_key: Optional[str] = None):
        self.provider = provider.lower().strip()
        self.api_key = api_key or get_key_for_provider(self.provider) or os.environ.get("GEMINI_API_KEY", "")
        self.model = model or self._get_default_model(self.provider)

    def _get_default_model(self, provider: str) -> str:
        defaults = {
            "google": "gemini-2.0-flash",
            "openai": "gpt-4o-mini",
            "anthropic": "claude-3-5-sonnet-20241022",
            "xai": "grok-2-mini",
            "deepseek": "deepseek-chat",
            "openrouter": "deepseek/deepseek-r1"
        }
        return defaults.get(provider, "gemini-2.0-flash")

    def generate(self, system_prompt: str, user_prompt: str, temperature: float = 0.7, force_json: bool = False, use_cache: bool = True) -> str:
        """Execute LLM call across whichever provider is configured."""
        cache_key = hashlib.md5(f"{self.provider}_{self.model}_{system_prompt}_{user_prompt}_{temperature}_{force_json}".encode()).hexdigest()
        if use_cache:
            cached = get_cached_llm(cache_key)
            if cached:
                return cached

        res_text = ""
        try:
            if self.provider in ["google", "gemini"]:
                res_text = self._call_google(system_prompt, user_prompt, temperature, force_json)
            elif self.provider == "openai":
                res_text = self._call_openai_compatible("https://api.openai.com/v1/chat/completions", system_prompt, user_prompt, temperature, force_json)
            elif self.provider in ["xai", "grok"]:
                res_text = self._call_openai_compatible("https://api.x.ai/v1/chat/completions", system_prompt, user_prompt, temperature, force_json)
            elif self.provider == "deepseek":
                res_text = self._call_openai_compatible("https://api.deepseek.com/chat/completions", system_prompt, user_prompt, temperature, force_json)
            elif self.provider == "openrouter":
                res_text = self._call_openai_compatible("https://openrouter.ai/api/v1/chat/completions", system_prompt, user_prompt, temperature, force_json)
            elif self.provider in ["claude", "anthropic"]:
                res_text = self._call_anthropic(system_prompt, user_prompt, temperature, force_json)
            else:
                # Fallback to Google
                res_text = self._call_google(system_prompt, user_prompt, temperature, force_json)
        except Exception as e:
            print(f"[!] LLM error ({self.provider}/{self.model}): {e}")
            raise e

        if res_text and use_cache:
            set_cached_llm(cache_key, self.provider, self.model, f"SYS:{system_prompt}\nUSR:{user_prompt}", res_text)

        return res_text

    def _call_google(self, system: str, user: str, temp: float, json_mode: bool) -> str:
        # Try REST endpoint directly using user's key or environment key
        url = f"https://generativelanguage.googleapis.com/v1beta/models/{self.model}:generateContent?key={self.api_key}"
        payload: Dict[str, Any] = {
            "contents": [
                {
                    "parts": [{"text": user}]
                }
            ],
            "generationConfig": {
                "temperature": temp,
            }
        }
        if system:
            payload["systemInstruction"] = {
                "parts": [{"text": system}]
            }
        if json_mode:
            payload["generationConfig"]["responseMimeType"] = "application/json"

        headers = {"Content-Type": "application/json"}
        r = requests.post(url, headers=headers, json=payload, timeout=60)
        if r.status_code != 200:
            raise RuntimeError(f"Google API Error {r.status_code}: {r.text}")
        data = r.json()
        parts = data.get("candidates", [{}])[0].get("content", {}).get("parts", [])
        return parts[0].get("text", "") if parts else ""

    def _call_openai_compatible(self, endpoint: str, system: str, user: str, temp: float, json_mode: bool) -> str:
        headers = {
            "Authorization": f"Bearer {self.api_key}",
            "Content-Type": "application/json"
        }
        messages = []
        if system:
            messages.append({"role": "system", "content": system})
        messages.append({"role": "user", "content": user})

        body: Dict[str, Any] = {
            "model": self.model,
            "messages": messages,
            "temperature": temp
        }
        if json_mode:
            body["response_format"] = {"type": "json_object"}

        r = requests.post(endpoint, headers=headers, json=body, timeout=60)
        if r.status_code != 200:
            raise RuntimeError(f"API Error {r.status_code}: {r.text}")
        data = r.json()
        return data["choices"][0]["message"]["content"]

    def _call_anthropic(self, system: str, user: str, temp: float, json_mode: bool) -> str:
        url = "https://api.anthropic.com/v1/messages"
        headers = {
            "x-api-key": self.api_key,
            "anthropic-version": "2023-06-01",
            "Content-Type": "application/json"
        }
        user_content = user
        if json_mode:
            user_content += "\n\nCRITICAL: Reply ONLY with a valid raw JSON object. No conversational wrapper."

        body = {
            "model": self.model,
            "max_tokens": 4096,
            "system": system,
            "messages": [{"role": "user", "content": user_content}],
            "temperature": temp
        }
        r = requests.post(url, headers=headers, json=body, timeout=60)
        if r.status_code != 200:
            raise RuntimeError(f"Anthropic API Error {r.status_code}: {r.text}")
        data = r.json()
        return data["content"][0]["text"]
