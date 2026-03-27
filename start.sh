#!/bin/bash
set -e

echo "[PhoneCraft] Starting server..."
echo "[PhoneCraft] Node version: $(node -v)"
echo "[PhoneCraft] Working dir: $(pwd)"

cd /home/site/wwwroot/server

# Rebuild native modules for the current Node.js version on Azure
echo "[PhoneCraft] Rebuilding native modules..."
npm rebuild better-sqlite3 --update-binary 2>/dev/null || npm install --production 2>/dev/null || true

echo "[PhoneCraft] Launching node server..."
exec node index.js
