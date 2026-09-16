#!/usr/bin/env bash
set -e

echo "=== ScriptOS Setup ==="
python3 --version >/dev/null 2>&1 || { echo "Python 3 is required. Please install Python 3.10 or 3.11."; exit 1; }
python3 -m venv venv
source venv/bin/activate
pip install --upgrade pip
pip install -r requirements.txt
python backend/core/model_manager.py --download || echo "Embedding download skipped, FTS5 + TF-IDF active."
mkdir -p data
echo "Setup Complete! Run ./run.sh to start ScriptOS."
