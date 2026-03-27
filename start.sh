#!/bin/bash
set -e

echo "[PhoneCraft] Starting server..."
echo "[PhoneCraft] Node: $(node -v) | npm: $(npm -v)"

# Kill any previous node process that might still hold the port
pkill -f "node index.js" 2>/dev/null || true
sleep 1

cd /home/site/wwwroot/server

BINARY="node_modules/better-sqlite3/build/Release/better_sqlite3.node"

if [ -f "$BINARY" ]; then
  # Quick test: can it actually load?
  if node -e "require('better-sqlite3')" 2>/dev/null; then
    echo "[PhoneCraft] better-sqlite3 OK, launching..."
  else
    echo "[PhoneCraft] Binary incompatible, recompiling..."
    npm rebuild better-sqlite3 --build-from-source 2>&1 || {
      rm -rf node_modules/better-sqlite3
      npm install better-sqlite3 2>&1
    }
  fi
else
  echo "[PhoneCraft] Binary missing, compiling from source..."
  npm rebuild better-sqlite3 --build-from-source 2>&1 || {
    rm -rf node_modules/better-sqlite3
    npm install better-sqlite3 2>&1
  }
fi

echo "[PhoneCraft] Launching app..."
exec node index.js
