@echo off
cd /d "%~dp0backend"
echo ============================================================
echo   Starting Project Mirror: Life RPG Backend (FastAPI)...
echo   API URL: http://127.0.0.1:8000
echo   Interactive Swagger Docs: http://127.0.0.1:8000/docs
echo ============================================================
python -m uvicorn main:app --reload --port 8000
pause
