# SafeNet API — must run with cwd = backend/ so `import app` works.
Set-Location $PSScriptRoot\backend
python -m uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
