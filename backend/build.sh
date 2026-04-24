#!/usr/bin/env bash
# Render runs this script every time you deploy.
# Works whether Render's root dir is 'backend/' or the repo root.
set -o errexit   # Exit immediately on any error

# Resolve the directory where this script lives (always the backend folder)
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "${SCRIPT_DIR}/.." && pwd)"
FRONTEND_DIR="${REPO_ROOT}/frontend"
BACKEND_DIR="${SCRIPT_DIR}"

echo "==> Backend dir: ${BACKEND_DIR}"
echo "==> Frontend dir: ${FRONTEND_DIR}"

# ── 1. Install Python dependencies ──────────────────────────────────────────
cd "${BACKEND_DIR}"
pip install -r requirements.txt

# ── 2. Build the React frontend ──────────────────────────────────────────────
echo "==> Building React frontend..."
cd "${FRONTEND_DIR}"
npm ci                   # clean install (uses package-lock.json)
npm run build            # outputs to frontend/dist/

# ── 3. Copy React build into Django's template / static area ─────────────────
echo "==> Copying frontend build into Django project..."
cd "${BACKEND_DIR}"
rm -rf frontend_build
mkdir -p frontend_build
cp -r "${FRONTEND_DIR}/dist/." frontend_build/

# ── 4. Collect Django static files (incl. React assets) ─────────────────────
python manage.py collectstatic --no-input

# ── 5. Run database migrations ───────────────────────────────────────────────
python manage.py migrate

echo "==> Build complete!"
