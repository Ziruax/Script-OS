#!/usr/bin/env bash
set -e

echo "╔══════════════════════════════════════════╗"
echo "║          Starting ScriptOS...             ║"
echo "╚══════════════════════════════════════════╝"
echo

# Activate Python venv if it exists (optional — for local research engine)
if [ -f venv/bin/activate ]; then
    source venv/bin/activate
    echo "✓ Python venv activated."
else
    echo "ℹ No Python venv found (optional — ZAI web search works without it)."
fi

# Start the Next.js dev server (port 3000) + open browser
if command -v bun &>/dev/null; then
    echo "✓ Starting via Bun on http://localhost:3000 ..."
    echo
    echo "  Press Ctrl+C to stop ScriptOS."
    echo
    # Open browser after 5 seconds (non-blocking)
    (sleep 5 && (open http://localhost:3000 2>/dev/null || xdg-open http://localhost:3000 2>/dev/null) &) 2>/dev/null
    exec bun run dev
elif command -v npx &>/dev/null; then
    echo "✓ Starting via npm on http://localhost:3000 ..."
    echo
    echo "  Press Ctrl+C to stop ScriptOS."
    echo
    (sleep 5 && (open http://localhost:3000 2>/dev/null || xdg-open http://localhost:3000 2>/dev/null) &) 2>/dev/null
    exec npx next dev -p 3000
else
    echo "⚠ Neither Bun nor Node.js found! Run ./setup.sh first."
    exit 1
fi
