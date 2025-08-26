#!/usr/bin/env bash
# Install dependencies
pip install -r requirements.txt

# (Optional) run migrations if you use a real DB in production
# python manage.py migrate --noinput

# Collect static assets to STATIC_ROOT
python manage.py collectstatic --noinput --clear