#!/usr/bin/env bash
# Render build script.
# The React frontend build is already committed to git (backend/frontend_build/).
# This script only needs to install Python deps, collect static, and migrate.
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

echo "==> Build complete!"
