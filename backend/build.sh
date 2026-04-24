#!/usr/bin/env bash
# Render runs this script every time you deploy.
set -o errexit   # Exit immediately on any error

# ── 1. Install Python dependencies ──────────────────────────────────────────
pip install -r requirements.txt

# ── 2. Build the React frontend ──────────────────────────────────────────────
echo "Building React frontend..."
cd ../frontend
npm ci                   # clean install (uses package-lock.json)
npm run build            # outputs to frontend/dist/
cd ../backend

# ── 3. Copy React build into Django's template / static area ─────────────────
echo "Copying frontend build into Django project..."
rm -rf frontend_build
mkdir -p frontend_build
cp -r ../frontend/dist/. frontend_build/

# ── 4. Collect Django static files (incl. React assets) ─────────────────────
python manage.py collectstatic --no-input

# ── 5. Run database migrations ───────────────────────────────────────────────
python manage.py migrate
