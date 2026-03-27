#!/bin/bash

echo "[PhoneCraft] Starting server..."
echo "[PhoneCraft] Node: $(node -v 2>/dev/null || echo unknown) | npm: $(npm -v 2>/dev/null || echo unknown)"

# Free the port if anything is holding it
python3 -c "
import os, glob, signal
port = int(os.environ.get('PORT', '8080'))
hex_port = format(port, '04X')
for netfile in ['/proc/net/tcp6', '/proc/net/tcp']:
    try:
        with open(netfile) as f:
            for line in f.readlines()[1:]:
                parts = line.split()
                if len(parts) > 9:
                    local = parts[1]
                    hp = local.split(':')[-1].upper()
                    if hp == hex_port:
                        inode = parts[9]
                        for fd in glob.glob('/proc/*/fd/*'):
                            try:
                                if os.readlink(fd) == 'socket:[' + inode + ']':
                                    pid = int(fd.split('/')[2])
                                    if pid != os.getpid():
                                        os.kill(pid, signal.SIGKILL)
                                        print('[PhoneCraft] Killed PID ' + str(pid) + ' on port ' + str(port))
                            except:
                                pass
    except:
        pass
" 2>/dev/null || true

sleep 1

cd /home/site/wwwroot/server

BINARY="node_modules/better-sqlite3/build/Release/better_sqlite3.node"

if [ -f "$BINARY" ]; then
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
