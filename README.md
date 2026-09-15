# ScriptOS - Complete Local Script Operating System

Professional-grade local operating system that takes user input and outputs 10/10 retention-optimized, undetectable, unique-perspective video scripts.

Built to run 100% locally on 4GB-8GB RAM CPU-only computers with zero external dependencies, except for the multi-provider LLM brain (Google Gemini, OpenAI, Claude, XAI Grok, DeepSeek, OpenRouter).

---

## ⚡ Quick Start (3 Steps)

1. **Install Python 3.10 or 3.11** from [python.org](https://www.python.org/downloads/) (Make sure to check *"Add Python to PATH"* during installation).
2. **Double-click `setup.bat`** (or run `./setup.sh` on Mac/Linux). Wait 2-3 minutes while it sets up the virtual environment, installs local NLP libraries, and prepares the SQLite FTS5 database.
3. **Double-click `run.bat`** (or run `./run.sh`).
   - Your default browser will automatically open to `http://127.0.0.1:8000`.
   - Go to **Settings**, paste your free Google Gemini API key (from [aistudio.google.com](https://aistudio.google.com)), or any key from OpenAI/Anthropic/DeepSeek/XAI/OpenRouter.
   - Click **"Fetch Models"** to see all live available models, select your model (e.g., `gemini-2.0-flash`), and start writing 10/10 retention scripts!

---

## 🧠 System Architecture

- **Local Research Engine (`backend/tools/search.py`)**: Uses DuckDuckGo search (`duckduckgo_search`), Wikipedia (`wikipedia`), YouTube Transcript API (`youtube_transcript_api`), and Trafilatura to scrape real facts, competitor gaps, Reddit human failure/success stories, and shocking statistics with sources.
- **Original Perspective Engine (`backend/agents/prompts.py`)**: Applies 6 proprietary lenses (Contrarian Reframe, Unseen Cost, First Principles, Cross-Domain Borrowing, Time-Travel Inversion, Personal Micro-Story) to generate 3 non-generic angles.
- **Outline Review Council (O1-O5)**: Evaluates structural logic, audience boredom points, retention psychology, novelty, and bans AI cliches in a single token-saving LLM call. Automatically loops until scores reach 9.0+.
- **Section-by-Section Generation (S0) & Review Council (S1-S6)**: Writes chapters in Grade 6 spoken word with explicit `[B-ROLL:]`, `[SFX:]`, `[TEXT ON SCREEN:]`, and `[RE-HOOK:]` cues. S1-S6 audits pacing, emotional curves, facts, and anti-AI burstiness surgically without discarding context.
- **Local Humanizer & Scorecard (`backend/tools/humanizer.py`)**: Replaces robotic corporate words, measures burstiness variance, generates 3 A/B hook variations, and produces an exportable production script with SRT/TXT/Markdown download options.

---

## 📁 Project Structure

```
ScriptOS/
├── backend/
│   ├── core/
│   │   ├── model_manager.py     # RAM detection, model download, live model fetcher
│   │   ├── llm_client.py        # Multi-provider client (Google, OpenAI, Claude, Grok, DeepSeek)
│   │   ├── db.py                # SQLite FTS5 database & cache
│   │   └── security.py          # Fernet local encrypted key storage
│   ├── tools/
│   │   ├── search.py            # Local research pack generator
│   │   ├── local_search.py      # SQLite FTS5 + TF-IDF + FastEmbed
│   │   └── humanizer.py         # Anti-AI detector, burstiness analyzer, SRT exporter
│   ├── agents/
│   │   ├── prompts.py           # 12 Hook types, 12 Retention tools, Council prompts
│   │   └── orchestrator.py      # State machine with context preservation & surgical loops
│   └── main.py                  # FastAPI server with REST endpoints & static file hosting
├── app/                         # Next.js 15 UI frontend
├── run.py                       # Python launcher
├── setup.bat / setup.sh         # One-click environment setup
├── run.bat / run.sh             # One-click local runner
└── requirements.txt             # Pure CPU local Python dependencies
```
