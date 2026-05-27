#!/bin/sh

echo "=== YSSF Backend Startup ==="
echo "NODE_ENV: $NODE_ENV"
echo "PORT: $PORT"

# Start the app
echo "Starting app on port $PORT..."
exec node dist/index.js
