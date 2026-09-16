@echo off
chcp 65001 >nul 2>&1
title ScriptOS Setup

echo ╔══════════════════════════════════════════╗
echo ║          ScriptOS — One-Click Setup       ║
echo ╚══════════════════════════════════════════╝
echo.

REM ── 1. Check Python ──────────────────────────────────
echo [1/4] Checking Python...
python --version >nul 2>&1
if %errorlevel% neq 0 (
    echo   ⚠ Python not found! Install Python 3.10+ from https://python.org
    echo     Make sure to check "Add Python to PATH" during installation.
    pause
    exit /b 1
)
for /f "tokens=2" %%v in ('python --version 2^>^&1') do set PYVER=%%v
echo   ✓ Python %PYVER% found.

REM ── 2. Check Node.js / Bun ──────────────────────────
echo [2/4] Checking Node.js / Bun...
where bun >nul 2>&1
if %errorlevel% equ 0 (
    set PKG_MGR=bun
    echo   ✓ Bun found.
) else (
    where node >nul 2>&1
    if %errorlevel% equ 0 (
        set PKG_MGR=npm
        for /f "tokens=2" %%v in ('node --version 2^>^&1') do set NODEVER=%%v
        echo   ✓ Node.js %NODEVER% found ^(using npm^).
    ) else (
        echo   ⚠ Neither Bun nor Node.js found!
        echo     Install one of:
        echo       Bun:    https://bun.sh
        echo       Node.js: https://nodejs.org
        pause
        exit /b 1
    )
)

REM ── 3. Install Python dependencies (optional — for local research engine) ─
echo [3/4] Installing Python dependencies...
if not exist venv (
    python -m venv venv
)
call venv\Scripts\activate
python -m pip install --upgrade pip -q
pip install -r requirements.txt -q 2>nul
if %errorlevel% neq 0 (
    echo   ⚠ Some Python packages failed to install ^(non-critical — ZAI web search is used by default^).
) else (
    echo   ✓ Python dependencies installed.
)
if not exist data mkdir data

REM ── 4. Install JavaScript dependencies (required — the Next.js app) ──────
echo [4/4] Installing JavaScript dependencies...
if "%PKG_MGR%"=="bun" (
    call bun install
    echo   ✓ Dependencies installed via Bun.
) else (
    call npm install
    echo   ✓ Dependencies installed via npm.
)

echo.
echo ╔══════════════════════════════════════════╗
echo ║          ✓ Setup Complete!               ║
echo ║  Now double-click run.bat to start       ║
echo ║  ScriptOS and open it in your browser.   ║
echo ╚══════════════════════════════════════════╝
echo.
pause
