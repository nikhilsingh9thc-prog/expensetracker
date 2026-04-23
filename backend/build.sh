#!/usr/bin/env bash
# Render runs this script every time you deploy.
set -o errexit   # Exit immediately on any error

pip install -r requirements.txt
python manage.py collectstatic --no-input
python manage.py migrate
