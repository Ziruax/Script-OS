@echo off
python --version >nul 2>&1 || echo Install Python 3.11 from python.org with Add to PATH checked && pause && exit
python -m venv venv
call venv\Scripts\activate
pip install -r requirements.txt
python backend/core/model_manager.py --download
mkdir data
echo Setup Complete! Now double-click run.bat
pause
