# ScriptOS — Project Worklog & Handover

This is the single shared worklog for the ScriptOS project. All agents MUST append (never overwrite) new sections delimited by `---`.

---
Task ID: 1
Agent: main (Z.ai Code)
Task: Delete current project, clone https://github.com/Ziruax/Script-OS, understand the complete code end to end, fix issues to make it run on Next.js 16, and verify end-to-end with Agent Browser.

Work Log:
- First clone attempt found the repo contained only a README.md (empty). Reported to user; user re-pushed real code.
- Re-cloned the updated repo to /tmp/Script-OS-tmp — full Next.js + Python app "ScriptOS" (Local Script Operating System).
- Read all key files end-to-end: package.json, README.md, metadata.json, next.config.ts, tsconfig.json, app/layout.tsx, app/page.tsx, app/outline|research|script|settings/page.tsx, components/MainApp.tsx, lib/store.ts (1014 lines), lib/gemini-server.ts, lib/python-researcher.ts, lib/utils.ts, app/api/health/route.ts, app/api/models/list/route.ts, app/api/research/search/route.ts, app/api/story-dna/route.ts, scripts/research_engine.py.
- Stopped the running dev server, deleted current project files (src/, prisma/, public/, db/, configs) while preserving system essentials (.env, Caddyfile, skills/, .zscripts/, upload/, download/, mini-services/, examples/, tests/, .git).
- Copied repo into /home/z/my-project, reorganizing app/components/lib/hooks under src/ to match the system's tsconfig path alias `@/* -> ./src/*`.
- Authored a merged package.json: repo deps (@google/genai, motion, zustand, lucide-react, tailwind-merge, clsx, cva) + system Next 16.1.1 + z-ai-web-dev-sdk (kept for planned ZAI provider enhancement).
- Fixed tsconfig.json path alias to `./src/*`.
- Fixed next.config.ts for Next.js 16: removed invalid `eslint` key (moved out of next.config in v16) and removed the `webpack` config that broke Turbopack (Turbopack is default in v16). Added `allowedDevOrigins: ['*.space-z.ai']` to silence cross-origin dev warnings from the sandbox preview.
- Updated eslint.config.mjs to ignore system demo folders (examples/, tests/, mini-services/, backend/, scripts/).
- `bun install` succeeded (193 packages, Next 16.3.5 installed). `bun run lint` clean.
- Started dev server (background, port 3000). Ready in 309ms, no errors.
- Verified with curl: GET / → 200 (43KB HTML, correct title + UI markers). GET /api/health → 200 (`status: ok`).
- Verified with Agent Browser: page loads with zero page errors and clean console (only React DevTools + HMR connected). Dismissed onboarding modal. Tab navigation confirmed working for Wizard, Research Pack, Angles & Outline, Script Studio, Settings. Settings tab shows all 6 providers, API key input, Fetch/Test buttons, model list. Footer present with correct text. Sticky-footer layout verified (root `min-h-screen flex flex-col` + `main flex-1`). Captured desktop + mobile screenshots.

Stage Summary:
- ScriptOS is fully cloned, adapted to Next.js 16, and running cleanly on http://localhost:3000.
- Architecture understood end-to-end:
  - Frontend: Next.js 16 App Router, React 19, Tailwind 4, Zustand store, lucide-react, motion.
  - Pipeline: Wizard (input + auto-detect metadata) → Research Pack (Python research_engine.py via /api/research/search) → Story DNA (/api/story-dna) → Angles & Outline (6 perspective lenses, O1-O5 council) → Script Studio (S1-S6 council, section-by-section) → Humanizer + Scorecard + SRT/TXT/MD export.
  - LLM: multi-provider via lib/gemini-server.ts `callUnifiedLLM()` — Google Gemini (primary, @google/genai with model fallback chain), OpenAI, Anthropic Claude, xAI Grok, DeepSeek, OpenRouter. API key passed per-request from Settings, or GEMINI_API_KEY env fallback.
  - Python research engine is optional with graceful 8s timeout + null fallback (app still works without Python deps).
  - The repo's backend/ FastAPI server is an alternative standalone desktop deployment; the web app does NOT depend on it (Next.js API routes are self-contained).
- Critical fixes applied for Next 16: removed invalid `eslint` config key, removed Turbopack-incompatible `webpack` config, fixed `@/*` path alias after moving dirs into src/, added `allowedDevOrigins`.
- No GEMINI_API_KEY in .env (only DATABASE_URL). App loads and renders fine; users enter their own key in Settings (per-request). LLM-dependent actions require a key.

Unresolved issues / risks / next-phase priorities:
- No GEMINI_API_KEY in environment — LLM generation pipeline cannot run end-to-end without a user-supplied key. HIGH PRIORITY opportunity: add a "ZAI" provider that uses the system's z-ai-web-dev-sdk (already in deps) so the app works out-of-the-box with zero user key configuration.
- Python research engine (scripts/research_engine.py) needs `wikipedia` + `ddgs`/`duckduckgo_search` packages installed; currently falls back to empty results. Could install + wire up, or replace with z-ai-web-dev-sdk web-search skill.
- Standalone routes /outline, /research, /script, /settings exist (deep-link wrappers) — system convention prefers single / entry; these are harmless but noted.
- Repro: the repo pins some future-dated/fictional Gemini model IDs (gemini-3.5-flash, gemini-3.8-flash) that don't exist on the real API; live fetch will return real models and the fallback list may 404. The fallback chain in gemini-server.ts handles this gracefully but the default selected model "gemini-3.8-flash" will fail until the user picks a real model.
- Next phase: await user instructions; proactively add ZAI provider, install Python research deps or swap to z-ai web-search, polish styling, add more features.
