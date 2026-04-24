#!/usr/bin/env bash
# Render build script for the Django backend.
# Set -o errexit so the build fails fast on any error.
set -o errexit

# Always run from the backend directory (where manage.py lives)
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "${SCRIPT_DIR}"

echo "==> Working directory: $(pwd)"
echo "==> Python: $(python --version)"

# 1. Install Python dependencies
pip install -r requirements.txt

# 2. Collect static files (includes React assets from frontend_build/assets/)
python manage.py collectstatic --no-input

# 3. Run database migrations
python manage.py migrate

# 4. Create superuser automatically if DJANGO_SUPERUSER_* env vars are set
#    This is idempotent — skips creation if the user already exists.
if [[ -n "${DJANGO_SUPERUSER_USERNAME}" && -n "${DJANGO_SUPERUSER_PASSWORD}" && -n "${DJANGO_SUPERUSER_EMAIL}" ]]; then
    echo "==> Creating superuser '${DJANGO_SUPERUSER_USERNAME}' (skipped if already exists)..."
    python manage.py createsuperuser \
        --no-input \
        --username "${DJANGO_SUPERUSER_USERNAME}" \
        --email    "${DJANGO_SUPERUSER_EMAIL}" \
        || echo "==> Superuser already exists, skipping."
fi

echo "==> Build complete!"
