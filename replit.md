# Workspace

## Overview

pnpm workspace monorepo. The primary product is **PhoneCraft** — a virtual phone manufacturing platform where users earn money by completing tasks. It has a React + Vite frontend and a standalone CommonJS Node.js + SQLite backend.

## Stack

- **Monorepo tool**: pnpm workspaces
- **Node.js version**: 24
- **Package manager**: pnpm

### PhoneCraft Frontend (`artifacts/phonecraft`)
- **Framework**: React + Vite (TypeScript)
- **Preview path**: `/` (port 24470 in dev)
- **Dev command**: `pnpm --filter @workspace/phonecraft run dev`
- Proxies `/api/*` and `/webhook/*` to API server at `http://localhost:8080` via `vite.config.ts`

### PhoneCraft API Server (`artifacts/api-server`)
- **Runtime**: CommonJS Node.js (NOT ESM — `"type":"commonjs"` in `phonecraft/package.json`)
- **Entry**: `artifacts/api-server/phonecraft/index.js`
- **Dev command**: `export PORT=8080 NODE_ENV=development && node phonecraft/index.js`
- **Database**: SQLite via `better-sqlite3` v12.8.0 (requires Python3 for build)
- **Auth**: JWT signed with `AUTH_SECRET` secret (stored in Replit Secrets, NOT env vars)
- **DB file**: `artifacts/api-server/phonecraft/phonecraft.db` (gitignored)

### Component Preview Server (`artifacts/mockup-sandbox`)
- Used for UI mockup prototyping on canvas (not part of the main product)

## Environment Variables & Secrets

Set in Replit (shared env vars in `.replit` `[userenv.shared]`):
- `WEBHOOK_URL` — Replit dev domain for Telegram webhook registration
- `TELEGRAM_FINANCE_CHAT_IDS` — Finance bot group chat IDs
- `TELEGRAM_FINANCE_CHAT_ID` — Primary finance chat ID
- `TELEGRAM_SUPPORT_CHAT_IDS` — Support group chat ID
- `TELEGRAM_ADMIN_CHAT_IDS` — Admin Telegram user IDs (for admin auth)
- `MAIN_ADMIN_REFER_CODE` — Main admin's referral code

Set as Replit **Secrets** (encrypted, not in `.replit`):
- `AUTH_SECRET` — JWT signing secret
- `TELEGRAM_FINANCE_BOT_TOKEN` — Finance Telegram bot token
- `TELEGRAM_SUPPORT_BOT_TOKEN` — Support Telegram bot token
- `ADMIN_PASSWORD` — Admin panel password
- `TELEGRAM_ADMIN_CHAT_IDS` — (also as secret for secure access)
- `TELEGRAM_SUPPORT_CHAT_IDS` — (also as secret)
- `TELEGRAM_FINANCE_BOT_TOKEN` — (also as secret)

## Telegram Integration

Two bots:
1. **Finance bot** (token: `TELEGRAM_FINANCE_BOT_TOKEN`) — handles deposit/withdrawal notifications
2. **Support bot** (token: `TELEGRAM_SUPPORT_BOT_TOKEN`) — handles live support chat

Support flow:
- User sends message → stored in `support_chats` DB table + forwarded to Telegram support group
- `tg_msg_map` table maps Telegram `message_id` → `session:sessionId`
- Admin replies via Telegram reply-to → webhook fires → `onSupportSessionReply` → stored in DB → frontend polls every 3s
- Admin can also reply via the admin panel Support tab

## Structure

```text
workspace/
├── artifacts/
│   ├── phonecraft/               # React + Vite frontend
│   │   ├── src/
│   │   │   ├── screens/          # App screens (HomeScreen, AdminScreen, etc.)
│   │   │   ├── SupportWidget.jsx # Live support chat widget
│   │   │   └── App.jsx
│   │   └── vite.config.ts        # Proxies /api & /webhook to :8080
│   ├── api-server/
│   │   └── phonecraft/           # CommonJS Node.js API server
│   │       ├── index.js          # Main Express server (all routes)
│   │       ├── db.js             # SQLite DB schema + prepared statements
│   │       └── services/
│   │           └── telegramService.js
│   └── mockup-sandbox/           # UI prototyping sandbox
├── scripts/
├── pnpm-workspace.yaml
└── .gitignore                    # *.db, *.db-wal, *.db-shm are gitignored
```

## Admin Panel

The admin panel (`AdminScreen.jsx`) has the following tabs:
- **Users** — manage users, search, filter by status (All/Active/Banned/Admin), edit balance/plan, ban/unban
- **Admins** — manage admin access (main admin only)
- **Transactions** — approve/reject deposits and withdrawals
- **Support** — view all support sessions, read message threads, send replies
- **Ops** — system operations
- **Dashboard** — financial stats, user activity, top earners, support summary (main admin only)
- **Settings** — payment account settings (main admin only)

## Key API Endpoints

- `GET  /api/health` — health check
- `POST /api/auth/login` — login
- `POST /api/auth/register` — register
- `GET  /api/admin/users` — list users
- `GET  /api/admin/support/sessions` — list support sessions
- `GET  /api/admin/support/messages/:sessionId` — get messages for a session
- `POST /api/admin/support/reply` — send admin reply to support session
- `GET  /api/admin/stats` — financial + activity dashboard stats
- `POST /webhook/telegram` — support bot webhook
- `POST /webhook/telegram/finance` — finance bot webhook
