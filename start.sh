#!/bin/bash
set -e

echo "[PhoneCraft] Starting server..."
echo "[PhoneCraft] Node: $(node -v) | npm: $(npm -v)"
echo "[PhoneCraft] Working dir: $(pwd)"

cd /home/site/wwwroot/server

echo "[PhoneCraft] Rebuilding better-sqlite3 for Node $(node -v)..."

# Try prebuilt binary first (fast), then compile from source (reliable)
if npm rebuild better-sqlite3 2>&1; then
  echo "[PhoneCraft] Rebuild succeeded."
else
  echo "[PhoneCraft] Prebuilt binary failed. Compiling from source..."
  npm install --build-from-source better-sqlite3 2>&1 || {
    echo "[PhoneCraft] Source build failed. Running full npm install..."
    rm -rf node_modules/better-sqlite3
    npm install better-sqlite3 --save 2>&1 || true
  }
fi

echo "[PhoneCraft] Launching app..."
exec node index.js
