#!/usr/bin/env python3
"""
ScriptOS Launcher — cross-platform.
Starts the Next.js dev server on port 3000 and opens the browser.

Usage:
    python run.py

Requires: Bun or Node.js installed (run setup.bat / setup.sh first).
"""
import subprocess
import sys
import time
import threading
import webbrowser
import os
import shutil


def open_browser_delayed(url: str, delay: float = 5.0):
    """Open the browser after a short delay (let the server boot first)."""
    time.sleep(delay)
    webbrowser.open(url)


def main():
    print("╔══════════════════════════════════════════╗")
    print("║          Starting ScriptOS...             ║")
    print("╚══════════════════════════════════════════╝")
    print()

    # Activate venv if it exists (optional — for local research engine)
    venv_activate = os.path.join(
        "venv", "Scripts" if sys.platform == "win32" else "bin", "activate"
    )
    if os.path.isfile(venv_activate):
        # On Windows we'd need to run activate in cmd; on Unix we can source it.
        # For simplicity, we just note it and let the subprocess inherit the env.
        print("✓ Python venv found (optional).")

    url = "http://localhost:3000"

    # Choose the command: bun run dev > npx next dev > npm run dev
    if shutil.which("bun"):
        cmd = ["bun", "run", "dev"]
        mgr = "Bun"
    elif shutil.which("npx"):
        cmd = ["npx", "next", "dev", "-p", "3000"]
        mgr = "npx"
    elif shutil.which("npm"):
        cmd = ["npm", "run", "dev"]
        mgr = "npm"
    else:
        print("⚠ Neither Bun nor Node.js found! Run setup first.")
        print("  Install Bun:    https://bun.sh")
        print("  Install Node.js: https://nodejs.org")
        sys.exit(1)

    print(f"✓ Starting via {mgr} on {url} ...")
    print()
    print("  Press Ctrl+C to stop ScriptOS.")
    print()

    # Open the browser in a background thread after 5 seconds
    t = threading.Thread(target=open_browser_delayed, args=(url,), daemon=True)
    t.start()

    # Start the dev server (this blocks until the user presses Ctrl+C)
    try:
        subprocess.run(cmd, cwd=os.path.dirname(os.path.abspath(__file__)))
    except KeyboardInterrupt:
        print("\nScriptOS stopped.")


if __name__ == "__main__":
    main()
