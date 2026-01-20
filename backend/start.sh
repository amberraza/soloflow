#!/bin/bash

# Default to port 8000 if PORT is not set
PORT="${PORT:-8000}"

echo "Starting app on port $PORT..."

# Run migrations
echo "Running migrations..."
python manage.py migrate

# Start Gunicorn
echo "Starting Gunicorn..."
exec gunicorn config.wsgi:application --bind "0.0.0.0:$PORT"
