#!/bin/bash

# Set the port
PORT=8000

# Stop any program currently running on the set port
echo 'preparing port' $PORT '...'
fuser -k 8000/tcp

# switch directories
python3 -m venv .venv 
source .venv/bin/activate 
python -m pip install --upgrade pip 
python -m pip install django #gunicorn 
# gunicorn e.wsgi:application --bind 0.0.0.0:8000

# Start the server
echo 'Server starting on port' $PORT '...'
python3 -m http.server $PORT