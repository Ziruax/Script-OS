@echo off
chcp 65001 >nul 2>&1
title ScriptOS

echo ╔══════════════════════════════════════════╗
echo ║          Starting ScriptOS...             ║
echo ╚══════════════════════════════════════════╝
echo.

REM Activate Python venv if it exists (optional — for local research engine)
if exist venv\Scripts\activate (
    call venv\Scripts\activate
    echo ✓ Python venv activated.
) else (
    echo ℹ No Python venv found ^(optional — ZAI web search works without it^).
)

REM Start the Next.js dev server (port 3000) + open browser
where bun >nul 2>&1
if %errorlevel% equ 0 (
    echo ✓ Starting via Bun on http://localhost:3000 ...
    echo.
    echo   Press Ctrl+C to stop ScriptOS.
    echo.
    start /b cmd /c "timeout /t 5 /nobreak >nul && start http://localhost:3000"
    bun run dev
) else (
    where npx >nul 2>&1
    if %errorlevel% equ 0 (
        echo ✓ Starting via npm on http://localhost:3000 ...
        echo.
        echo   Press Ctrl+C to stop ScriptOS.
        echo.
        start /b cmd /c "timeout /t 5 /nobreak >nul && start http://localhost:3000"
        npx next dev -p 3000
    ) else (
        echo ⚠ Neither Bun nor Node.js found! Run setup.bat first.
        pause
        exit /b 1
    )
)
