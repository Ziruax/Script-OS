import os
import sys
import psutil
import requests
from typing import List, Dict, Any

MODELS_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", "models"))

def check_ram() -> Dict[str, Any]:
    """Check system RAM and return metrics with recommended operating mode."""
    mem = psutil.virtual_memory()
    total_gb = round(mem.total / (1024 ** 3), 1)
    avail_gb = round(mem.available / (1024 ** 3), 1)
    used_gb = round(mem.used / (1024 ** 3), 1)
    percent = mem.percent

    if total_gb <= 4.5:
        mode_label = f"Your PC {total_gb}GB - Using Ultra-Light Mode (FTS5 + TF-IDF)"
        search_mode = "TFIDF"
    elif total_gb <= 8.5:
        mode_label = f"Your PC {total_gb}GB - Balanced Mode (TF-IDF + FastEmbed capable)"
        search_mode = "AUTO"
    else:
        mode_label = f"Your PC {total_gb}GB - High Performance Mode"
        search_mode = "FASTEMBED"

    return {
        "total_gb": total_gb,
        "available_gb": avail_gb,
        "used_gb": used_gb,
        "percent": percent,
        "mode_label": mode_label,
        "recommended_search_mode": search_mode
    }

def get_search_mode() -> str:
    """Return TFIDF if RAM < 6GB else FAST_EMBED."""
    mem = psutil.virtual_memory()
    total_gb = mem.total / (1024 ** 3)
    return "TFIDF" if total_gb < 6.0 else "FASTEMBED"

def download_models():
    """Download BAAI/bge-small-en-v1.5 quantized to ./models/ folder."""
    os.makedirs(MODELS_DIR, exist_ok=True)
    print(f"[*] Initializing local model download in: {MODELS_DIR}")
    try:
        from fastembed import TextEmbedding
        # Set cache dir directly to project ./models/
        os.environ["FASTEMBED_CACHE_PATH"] = MODELS_DIR
        print("[*] Downloading/verifying BAAI/bge-small-en-v1.5 (quantized ~80MB)...")
        _ = TextEmbedding(model_name="BAAI/bge-small-en-v1.5", cache_dir=MODELS_DIR)
        print("[✓] Model downloaded successfully to project models directory.")
    except Exception as e:
        print(f"[!] Optional local embedding model download skipped or failed: {e}")
        print("[i] ScriptOS will default smoothly to ultra-fast SQLite FTS5 + TF-IDF.")

def list_models(provider: str, api_key: str) -> List[Dict[str, Any]]:
    """Live fetch models from provider using the given API key."""
    provider = provider.lower().strip()
    models: List[Dict[str, Any]] = []

    if not api_key:
        return models

    try:
        if provider in ["google", "gemini"]:
            url = f"https://generativelanguage.googleapis.com/v1/models?key={api_key}"
            res = requests.get(url, timeout=12)
            if res.status_code == 200:
                data = res.json()
                for m in data.get("models", []):
                    name = m.get("name", "").replace("models/", "")
                    disp = m.get("displayName", name)
                    # Filter for generative models
                    if "generateContent" in m.get("supportedGenerationMethods", []):
                        ctx = m.get("inputTokenLimit", 1000000)
                        models.append({
                            "id": name,
                            "name": f"{disp} ({name})",
                            "provider": "google",
                            "context_length": ctx
                        })
            else:
                # Fallback list if key was rejected or network restricted
                models = [
                    {"id": "gemini-3.8-flash", "name": "Gemini 3.8 Flash (10 RPM • 250k TPM • 1,500 RPD) [Default]", "provider": "google", "context_length": 1048576},
                    {"id": "gemini-2.0-flash", "name": "Gemini 2.0 Flash", "provider": "google", "context_length": 1048576},
                    {"id": "gemini-1.5-pro", "name": "Gemini 1.5 Pro", "provider": "google", "context_length": 2097152},
                    {"id": "gemini-1.5-flash", "name": "Gemini 1.5 Flash", "provider": "google", "context_length": 1048576},
                    {"id": "gemini-2.0-flash-exp", "name": "Gemini 2.0 Flash Experimental", "provider": "google", "context_length": 1048576},
                ]

        elif provider == "openai":
            url = "https://api.openai.com/v1/models"
            headers = {"Authorization": f"Bearer {api_key}"}
            res = requests.get(url, headers=headers, timeout=12)
            if res.status_code == 200:
                data = res.json()
                for m in data.get("data", []):
                    mid = m.get("id", "")
                    if any(x in mid for x in ["gpt-4", "gpt-3.5", "o1", "o3", "chatgpt"]):
                        models.append({
                            "id": mid,
                            "name": mid,
                            "provider": "openai",
                            "context_length": 128000
                        })
                models.sort(key=lambda x: x["id"], reverse=True)
            else:
                models = [
                    {"id": "gpt-4o", "name": "GPT-4o", "provider": "openai", "context_length": 128000},
                    {"id": "gpt-4o-mini", "name": "GPT-4o Mini", "provider": "openai", "context_length": 128000},
                    {"id": "o1-preview", "name": "o1 Preview", "provider": "openai", "context_length": 128000},
                ]

        elif provider in ["claude", "anthropic"]:
            url = "https://api.anthropic.com/v1/models"
            headers = {
                "x-api-key": api_key,
                "anthropic-version": "2023-06-01"
            }
            res = requests.get(url, headers=headers, timeout=12)
            if res.status_code == 200:
                data = res.json()
                for m in data.get("data", []):
                    mid = m.get("id", "")
                    disp = m.get("display_name", mid)
                    models.append({
                        "id": mid,
                        "name": f"{disp} ({mid})",
                        "provider": "anthropic",
                        "context_length": 200000
                    })
            else:
                models = [
                    {"id": "claude-3-7-sonnet-20250219", "name": "Claude 3.7 Sonnet", "provider": "anthropic", "context_length": 200000},
                    {"id": "claude-3-5-sonnet-20241022", "name": "Claude 3.5 Sonnet", "provider": "anthropic", "context_length": 200000},
                    {"id": "claude-3-5-haiku-20241022", "name": "Claude 3.5 Haiku", "provider": "anthropic", "context_length": 200000},
                ]

        elif provider in ["xai", "grok"]:
            url = "https://api.x.ai/v1/models"
            headers = {"Authorization": f"Bearer {api_key}"}
            res = requests.get(url, headers=headers, timeout=12)
            if res.status_code == 200:
                data = res.json()
                for m in data.get("data", []):
                    mid = m.get("id", "")
                    models.append({
                        "id": mid,
                        "name": mid,
                        "provider": "xai",
                        "context_length": 131072
                    })
            else:
                models = [
                    {"id": "grok-2-latest", "name": "Grok 2 Latest", "provider": "xai", "context_length": 131072},
                    {"id": "grok-2-mini", "name": "Grok 2 Mini", "provider": "xai", "context_length": 131072},
                    {"id": "grok-beta", "name": "Grok Beta", "provider": "xai", "context_length": 131072},
                ]

        elif provider == "deepseek":
            url = "https://api.deepseek.com/models"
            headers = {"Authorization": f"Bearer {api_key}"}
            res = requests.get(url, headers=headers, timeout=12)
            if res.status_code == 200:
                data = res.json()
                for m in data.get("data", []):
                    mid = m.get("id", "")
                    models.append({
                        "id": mid,
                        "name": mid,
                        "provider": "deepseek",
                        "context_length": 64000
                    })
            else:
                models = [
                    {"id": "deepseek-chat", "name": "DeepSeek V3 (deepseek-chat)", "provider": "deepseek", "context_length": 64000},
                    {"id": "deepseek-reasoner", "name": "DeepSeek R1 (deepseek-reasoner)", "provider": "deepseek", "context_length": 64000},
                ]

        elif provider == "openrouter":
            url = "https://openrouter.ai/api/v1/models"
            headers = {"Authorization": f"Bearer {api_key}"}
            res = requests.get(url, headers=headers, timeout=12)
            if res.status_code == 200:
                data = res.json()
                for m in data.get("data", []):
                    mid = m.get("id", "")
                    name = m.get("name", mid)
                    ctx = m.get("context_length", 32000)
                    models.append({
                        "id": mid,
                        "name": name,
                        "provider": "openrouter",
                        "context_length": ctx
                    })
                # Pick top prominent ones first
                models.sort(key=lambda x: x["id"])
            else:
                models = [
                    {"id": "deepseek/deepseek-r1", "name": "DeepSeek R1 (via OpenRouter)", "provider": "openrouter", "context_length": 64000},
                    {"id": "anthropic/claude-3.5-sonnet", "name": "Claude 3.5 Sonnet (via OpenRouter)", "provider": "openrouter", "context_length": 200000},
                    {"id": "google/gemini-2.0-flash-001", "name": "Gemini 2.0 Flash (via OpenRouter)", "provider": "openrouter", "context_length": 1000000},
                    {"id": "meta-llama/llama-3.3-70b-instruct", "name": "Llama 3.3 70B Instruct", "provider": "openrouter", "context_length": 131072},
                ]

    except Exception as e:
        print(f"[!] Error fetching models for {provider}: {e}")

    return models

if __name__ == "__main__":
    if "--download" in sys.argv:
        download_models()
    elif "--ram" in sys.argv:
        print(check_ram())
