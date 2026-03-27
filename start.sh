#!/bin/bash
set -e

echo "[PhoneCraft] Starting server..."
echo "[PhoneCraft] Node: $(node -v) | npm: $(npm -v)"
echo "[PhoneCraft] Working dir: $(pwd)"

cd /home/site/wwwroot/server

BINARY="node_modules/better-sqlite3/build/Release/better_sqlite3.node"

if [ -f "$BINARY" ]; then
  echo "[PhoneCraft] Binary found at $BINARY"
else
  echo "[PhoneCraft] Binary missing — compiling better-sqlite3 from source..."
  if npm rebuild better-sqlite3 --build-from-source; then
    echo "[PhoneCraft] Rebuild succeeded."
  else
    echo "[PhoneCraft] Rebuild failed, fresh install..."
    rm -rf node_modules/better-sqlite3
    npm install better-sqlite3 --ignore-scripts=false
  fi
fi

echo "[PhoneCraft] Launching app..."
exec node index.js
