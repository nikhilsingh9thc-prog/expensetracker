#!/usr/bin/env bash
# Render build script — builds React frontend THEN Django backend.
set -o errexit

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "${SCRIPT_DIR}"

echo "==> Working directory: $(pwd)"
echo "==> Python: $(python --version)"

# ── 1. Build React frontend ──────────────────────────────────────────────────
echo "==> Installing Node.js dependencies..."
cd ../frontend
npm ci --prefer-offline || npm install

echo "==> Building React (Vite)..."
npm run build

echo "==> Copying dist → backend/frontend_build..."
cd ../backend
rm -rf frontend_build
cp -r ../frontend/dist frontend_build

echo "==> Frontend build copied successfully."

# ── 2. Python dependencies ───────────────────────────────────────────────────
echo "==> Installing Python dependencies..."
pip install -r requirements.txt

# ── 3. Django static files ───────────────────────────────────────────────────
echo "==> Collecting static files..."
python manage.py collectstatic --no-input

# ── 4. Database migrations ───────────────────────────────────────────────────
echo "==> Running migrations..."
python manage.py migrate

# ── 5. Optional superuser creation ──────────────────────────────────────────
if [[ -n "${DJANGO_SUPERUSER_USERNAME}" && -n "${DJANGO_SUPERUSER_PASSWORD}" && -n "${DJANGO_SUPERUSER_EMAIL}" ]]; then
    echo "==> Creating superuser '${DJANGO_SUPERUSER_USERNAME}' (skipped if already exists)..."
    python manage.py createsuperuser \
        --no-input \
        --username "${DJANGO_SUPERUSER_USERNAME}" \
        --email    "${DJANGO_SUPERUSER_EMAIL}" \
        || echo "==> Superuser already exists, skipping."
fi

echo "==> Build complete!"
