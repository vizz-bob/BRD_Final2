#!/bin/bash
# ============================================================
# BRD Platform – Django Backend Entrypoint
# Runs migrations then hands off to the CMD (gunicorn)
# ============================================================
set -e

echo "========================================"
echo "  BRD Backend Entrypoint"
echo "========================================"

echo "[1/3] Applying database migrations..."
python manage.py migrate --noinput

echo "[2/3] Collecting static files..."
python manage.py collectstatic --noinput 2>/dev/null || true

echo "[3/3] Starting application server..."
exec "$@"
