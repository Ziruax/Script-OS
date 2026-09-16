#!/usr/bin/env bash
set -e

echo "╔══════════════════════════════════════════╗"
echo "║          ScriptOS — One-Click Setup       ║"
echo "╚══════════════════════════════════════════╝"
echo

# ── 1. Check Python ──────────────────────────────────
echo "[1/4] Checking Python..."
if ! command -v python3 &>/dev/null; then
    echo "  ⚠ Python 3 not found! Install Python 3.10+ from https://python.org"
    exit 1
fi
PYVER=$(python3 --version 2>&1 | awk '{print $2}')
echo "  ✓ Python $PYVER found."

# ── 2. Check Bun / Node.js ──────────────────────────
echo "[2/4] Checking Bun / Node.js..."
if command -v bun &>/dev/null; then
    PKG_MGR="bun"
    echo "  ✓ Bun found."
elif command -v node &>/dev/null; then
    PKG_MGR="npm"
    NODEVER=$(node --version 2>&1)
    echo "  ✓ Node.js $NODEVER found (using npm)."
else
    echo "  ⚠ Neither Bun nor Node.js found!"
    echo "    Install one of:"
    echo "      Bun:     https://bun.sh"
    echo "      Node.js: https://nodejs.org"
    exit 1
fi

# ── 3. Install Python dependencies (optional) ──────
echo "[3/4] Installing Python dependencies..."
if [ ! -d venv ]; then
    python3 -m venv venv
fi
source venv/bin/activate
python -m pip install --upgrade pip -q
pip install -r requirements.txt -q 2>/dev/null || echo "  ⚠ Some Python packages failed (non-critical)."
echo "  ✓ Python dependencies installed."
mkdir -p data

# ── 4. Install JavaScript dependencies (required) ───
echo "[4/4] Installing JavaScript dependencies..."
if [ "$PKG_MGR" = "bun" ]; then
    bun install
    echo "  ✓ Dependencies installed via Bun."
else
    npm install
    echo "  ✓ Dependencies installed via npm."
fi

echo
echo "╔══════════════════════════════════════════╗"
echo "║          ✓ Setup Complete!               ║"
echo "║  Run ./run.sh to start ScriptOS          ║"
echo "║  and open it in your browser.            ║"
echo "╚══════════════════════════════════════════╝"
