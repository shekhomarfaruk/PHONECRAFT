# 🔧 TELEGRAM INTEGRATION FIX GUIDE

## Problem
Support messages and Telegram notifications (deposit/withdraw) not reaching Telegram.

## Root Cause
**Frontend API URL not configured for production.**

When you deploy to `https://phonecraft.tech`, the frontend needs to know:
- Where to send support messages
- Where to send deposit/withdraw requests  
- Where to fetch support history

Without `VITE_API_URL`, the frontend defaults to empty string `` and makes relative requests that fail.

## Solution

### Local Development
```bash
# This works automatically (Vite proxy redirects /api to localhost:4000)
npm run dev
```

### Production Deployment

**Before building, set this environment variable:**

```bash
# Linux/Mac
export VITE_API_URL=https://phonecraft.tech
npm run build

# Windows PowerShell
$env:VITE_API_URL="https://phonecraft.tech"
npm run build

# Or create .env.local (git-ignored, won't commit)
echo "VITE_API_URL=https://phonecraft.tech" > .env.local
npm run build
```

**Then deploy `dist/` to your server.**

## Verification Checklist

✅ **Backend is running:**
```bash
cd server && npm start
# Should see:
# [Telegram] Finance bot configured: yes
# [Telegram] Support bot configured: yes
# [Telegram] Support webhook registered ✓
```

✅ **Frontend has correct API URL:**
- Open browser DevTools → Network tab
- Send a support message
- Should see POST request to: `https://phonecraft.tech/api/support/message`

✅ **Database insertion working:**
```bash
cd server && node scripts/diagnose-support.js
# Should show "✓ Success" for all 5 checks
```

✅ **Telegram delivery working:**
```bash
cd server && npm run telegram:e2e
# Should show "sent" status for all chats
```

## Quick Test

```bash
# Terminal 1: Start backend
cd server && npm start

# Terminal 2: (wait 2 sec, then) Run diagnostic
cd server && node scripts/diagnose-support.js

# Terminal 3: (wait 2 sec, then) Simulate frontend API calls
cd server && node scripts/simulate-frontend.js
```

If all 3 pass ✓, your setup is working.

## Common Issues

| Issue | Fix |
|-------|-----|
| Support messages not reaching Telegram | Check `VITE_API_URL` is set before build |
| 404 on `/api/support/message` | Frontend sending to wrong URL - rebuild with correct `VITE_API_URL` |
| Telegram webhook not registered | Server not running or `WEBHOOK_URL` env not set |
| `503 Service Unavailable` | Backend server is down - `npm start` in server/ |
| Messages in DB but no Telegram | Check bot tokens in `.env` are correct |

## Environment Variables Required

```bash
# .env (DO NOT COMMIT - server only)
TELEGRAM_FINANCE_BOT_TOKEN=8770085094:AAHpTS5Ob-...
TELEGRAM_FINANCE_CHAT_IDS=-1003887307980
TELEGRAM_SUPPORT_BOT_TOKEN=8623958866:AAGWeU-qqk6...
TELEGRAM_SUPPORT_CHAT_IDS=-1003885723195
TELEGRAM_ADMIN_CHAT_IDS=5973619782,5667850636,8018451923
WEBHOOK_URL=https://phonecraft.tech

# .env.local or deployment ENV (Frontend only)
VITE_API_URL=https://phonecraft.tech
```

## After Fix

Send a test message:
1. Open app at `https://phonecraft.tech`
2. Go to Support
3. Send: "Test message"
4. Check Telegram `@phonecraftbot` - message should appear in support channel within 1 second ✓
