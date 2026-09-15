import os
import sys
import json
import webbrowser
import threading
import time
from typing import Dict, Any, Optional
from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import JSONResponse, FileResponse
from pydantic import BaseModel

from backend.core.db import init_db, save_script_record, get_script_record, list_all_scripts
from backend.core.security import save_api_keys, get_api_keys
from backend.core.model_manager import check_ram, list_models, get_search_mode
from backend.agents.orchestrator import ScriptOrchestrator
from backend.tools.humanizer import format_export

app = FastAPI(title="ScriptOS API", version="1.0.0", description="Complete Local Script Operating System")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("startup")
def on_startup():
    init_db()
    ram_info = check_ram()
    print(f"[*] ScriptOS Backend Initialized. {ram_info['mode_label']}")

# Models & Requests
class ModelsListRequest(BaseModel):
    provider: str
    api_key: str

class SaveKeysRequest(BaseModel):
    keys: Dict[str, str]

class ResearchRequest(BaseModel):
    title: str
    details: Optional[str] = ""

class AnglesRequest(BaseModel):
    title: str
    details: Optional[str] = ""
    research_pack: Dict[str, Any]
    provider: Optional[str] = "google"
    model: Optional[str] = None
    api_key: Optional[str] = None

class OutlineRequest(BaseModel):
    title: str
    details: Optional[str] = ""
    length_min: Optional[int] = 8
    audience: Optional[str] = "Intermediate"
    goal: Optional[str] = "Viral"
    tone: Optional[str] = "Cinematic"
    chosen_angle: Dict[str, Any]
    research_pack: Dict[str, Any]
    provider: Optional[str] = "google"
    model: Optional[str] = None
    api_key: Optional[str] = None

class SectionGenerateRequest(BaseModel):
    chapter: Dict[str, Any]
    full_outline: Dict[str, Any]
    chosen_angle: Dict[str, Any]
    research_pack: Dict[str, Any]
    previous_chapter_text: Optional[str] = ""
    provider: Optional[str] = "google"
    model: Optional[str] = None
    api_key: Optional[str] = None

class HumanizeFinalRequest(BaseModel):
    chapters: list
    title: str
    research_pack: Dict[str, Any]
    outline: Dict[str, Any]
    provider: Optional[str] = "google"
    model: Optional[str] = None
    api_key: Optional[str] = None

# API Endpoints
@app.get("/api/health")
def health():
    return {"status": "ok", "system": "ScriptOS Local Engine", "time": time.time()}

@app.get("/api/system/status")
def system_status():
    ram = check_ram()
    keys = get_api_keys()
    saved_providers = [p for p, k in keys.items() if k]
    return {
        "ram": ram,
        "search_mode": get_search_mode(),
        "configured_providers": saved_providers,
        "has_google_key": bool(keys.get("google") or os.environ.get("GEMINI_API_KEY"))
    }

@app.post("/api/models/list")
def fetch_models(req: ModelsListRequest):
    """Live fetch models from provider using key."""
    if not req.api_key.strip():
        raise HTTPException(status_code=400, detail="API Key is required to fetch models")
    models = list_models(req.provider, req.api_key)
    return {"provider": req.provider, "models": models}

@app.post("/api/settings/save-keys")
def save_keys_endpoint(req: SaveKeysRequest):
    success = save_api_keys(req.keys)
    return {"success": success, "message": "API keys encrypted and saved locally in data/.env.enc"}

@app.get("/api/settings/models")
def get_default_models():
    """Default fallback list of recommended models per provider."""
    return {
        "google": [
            {"id": "gemini-2.0-flash", "name": "Gemini 2.0 Flash (Recommended)", "context_length": 1048576},
            {"id": "gemini-1.5-pro", "name": "Gemini 1.5 Pro", "context_length": 2097152},
            {"id": "gemini-1.5-flash", "name": "Gemini 1.5 Flash", "context_length": 1048576}
        ],
        "openai": [
            {"id": "gpt-4o-mini", "name": "GPT-4o Mini (Cost Efficient)", "context_length": 128000},
            {"id": "gpt-4o", "name": "GPT-4o", "context_length": 128000}
        ],
        "claude": [
            {"id": "claude-3-5-sonnet-20241022", "name": "Claude 3.5 Sonnet", "context_length": 200000},
            {"id": "claude-3-5-haiku-20241022", "name": "Claude 3.5 Haiku", "context_length": 200000}
        ],
        "deepseek": [
            {"id": "deepseek-chat", "name": "DeepSeek V3", "context_length": 64000},
            {"id": "deepseek-reasoner", "name": "DeepSeek R1", "context_length": 64000}
        ],
        "xai": [
            {"id": "grok-2-latest", "name": "Grok 2", "context_length": 131072},
            {"id": "grok-2-mini", "name": "Grok 2 Mini", "context_length": 131072}
        ],
        "openrouter": [
            {"id": "deepseek/deepseek-r1", "name": "DeepSeek R1 (OpenRouter)", "context_length": 64000},
            {"id": "anthropic/claude-3.5-sonnet", "name": "Claude 3.5 Sonnet (OpenRouter)", "context_length": 200000}
        ]
    }

@app.post("/api/research/build")
def build_research_endpoint(req: ResearchRequest):
    orch = ScriptOrchestrator()
    pack = orch.generate_research(req.title, req.details or "")
    return pack

@app.post("/api/angles/generate")
def generate_angles_endpoint(req: AnglesRequest):
    orch = ScriptOrchestrator(provider=req.provider, model=req.model, api_key=req.api_key)
    angles = orch.generate_angles(req.title, req.details or "", req.research_pack)
    return {"angles": angles}

@app.post("/api/outline/generate")
def generate_outline_endpoint(req: OutlineRequest):
    orch = ScriptOrchestrator(provider=req.provider, model=req.model, api_key=req.api_key)
    result = orch.generate_outline_with_council(
        title=req.title,
        details=req.details or "",
        length_min=req.length_min or 8,
        audience=req.audience or "Intermediate",
        goal=req.goal or "Viral",
        tone=req.tone or "Cinematic",
        chosen_angle=req.chosen_angle,
        research_pack=req.research_pack
    )
    return result

@app.post("/api/script/section/generate")
def generate_section_endpoint(req: SectionGenerateRequest):
    orch = ScriptOrchestrator(provider=req.provider, model=req.model, api_key=req.api_key)
    section_result = orch.write_section_with_council(
        chapter=req.chapter,
        full_outline=req.full_outline,
        chosen_angle=req.chosen_angle,
        research_pack=req.research_pack,
        previous_chapter_text=req.previous_chapter_text or ""
    )
    return section_result

@app.post("/api/script/humanize")
def humanize_endpoint(req: HumanizeFinalRequest):
    orch = ScriptOrchestrator(provider=req.provider, model=req.model, api_key=req.api_key)
    res = orch.assemble_and_humanize(
        chapters=req.chapters,
        title=req.title,
        research_pack=req.research_pack,
        outline=req.outline
    )

    # Save complete script record in local SQLite DB
    try:
        sid = save_script_record({
            "title": req.title,
            "angle": req.outline.get("chosen_angle", {}),
            "outline": req.outline,
            "chapters": req.chapters,
            "final_script": res["final_script"],
            "scorecard": res["scorecard"],
            "hooks": res["hooks"]
        })
        res["script_id"] = sid
    except Exception as e:
        print(f"[!] DB Save error: {e}")

    return res

# Static file serving for standalone build
OUT_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "out"))
if os.path.exists(OUT_DIR):
    app.mount("/", StaticFiles(directory=OUT_DIR, html=True), name="static")

if __name__ == "__main__":
    import uvicorn
    def open_browser():
        time.sleep(1.8)
        webbrowser.open("http://127.0.0.1:8000")

    threading.Thread(target=open_browser, daemon=True).start()
    uvicorn.run("backend.main:app", host="127.0.0.1", port=8000, reload=False)
