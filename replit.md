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

### Admin Panel (`artifacts/admin-panel`)
- **Framework**: React + Vite (JSX)
- **Preview path**: `/admin-panel/` (port 24480 in dev)
- **Dev command**: `pnpm --filter @workspace/admin-panel run dev`
- Proxies `/api/*` to API server at `http://localhost:8080` via `vite.config.ts`
- Standalone login screen with sidebar navigation and 6 pages (Dashboard, Users, Finance, Support, Admins, Settings)
- Uses `is_main_admin` from API responses to determine admin role level
- Auto-logout on 401 responses, plan options fetched from `/api/admin/plans`

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
│   ├── admin-panel/              # Standalone admin panel (React + Vite)
│   │   └── src/
│   │       ├── App.jsx           # Full admin panel (login, dashboard, users, finance, support, admins, settings)
│   │       └── styles.css        # Responsive CSS with .grid-2/.grid-3/.grid-4 utilities, sidebar overlay, breakpoints at 1024/768/480px
│   └── mockup-sandbox/           # UI prototyping sandbox
├── scripts/
├── pnpm-workspace.yaml
└── .gitignore                    # *.db, *.db-wal, *.db-shm are gitignored
```

## Admin Panel

The admin panel (`AdminScreen.jsx`) is a comprehensive control center with 6 tabs:

- **Dashboard** (main admin only) — live stats (total users, active today, new signups), revenue overview with mini bar chart (last 14 days deposits vs withdrawals), pending actions with quick-process button, plan distribution bars, top 10 earners, recent activity feed, support summary, payment method breakdown
- **Users** — full-featured user management with search/filter (All/Active/Banned/Admin), bulk select for ban/unban, CSV export, broadcast messaging. User profile modal with 5 sub-tabs: Info (balance stats, edit balance/plan/admin toggle, force password reset), Transactions (full history), Referrals (L1/L2/L3 tree), Manufacturing (job history), Logins (IP/device/location)
- **Finance** — transaction queue with status filter (Pending/Approved/Rejected/All) and type filter (Deposit/Withdraw/All). Inline approve/reject with admin notes. CSV export
- **Support** — session list with unanswered filter, chat thread view with real-time polling, canned responses management (create/delete/quick-insert), session status management (resolve), admin assignment
- **Admins** (main admin only) — admin list with role badges, granular permission editor (10 permissions: view_users, edit_users, ban_users, approve_deposits, approve_withdrawals, change_settings, manage_admins, view_reports, export_data, access_support), admin activity audit log
- **Settings** (main admin only) — app control (maintenance mode toggle, announcement banner), payment accounts (bKash/Nagad/Rocket/Bank), financial limits (min/max deposit/withdraw, daily withdrawal limit, auto-hold threshold), plan management (edit price, per-task earnings, daily tasks, task time, referral percentages)

### Admin Role System

Two-tier role hierarchy:
- **Main Admin** (`refer_code = ADMIN01`): Full access to all tabs and features
- **Sub-Admin** (`is_admin = 1`): Access to Users, Finance, Support tabs only. Granular permissions controlled by Main Admin via the Admins tab

### Database Tables for Admin

- `admin_activity_log` — audit trail of all admin actions (who, what, when, IP)
- `admin_permissions` — granular permission grants per sub-admin
- `canned_responses` — pre-written support reply templates
- `support_sessions` — session metadata (status: open/in_progress/resolved, assigned_to)

## Key API Endpoints

- `GET  /api/health` — health check
- `GET  /api/me` — get current user profile (requires auth)
- `POST /api/auth/login` — login
- `POST /api/auth/register` — register
- `GET  /api/admin/users` — list users (filtered by role)
- `PATCH /api/admin/users/:id` — update user
- `GET  /api/admin/users/:id/full-profile` — complete user profile with tx/mfg/referral/login data
- `POST /api/admin/users/:id/force-password-reset` — force password reset
- `POST /api/admin/bulk-action` — bulk ban/unban users
- `GET  /api/admin/transactions` — list all transactions
- `PATCH /api/admin/transactions/:id` — approve/reject transaction
- `GET  /api/admin/stats` — enhanced dashboard stats (signups, activity, revenue chart, plan dist, top earners, support stats, method breakdown)
- `POST /api/admin/messages` — send message to user(s)
- `GET  /api/admin/support/sessions` — list support sessions
- `GET  /api/admin/support/messages/:sessionId` — get messages
- `POST /api/admin/support/reply` — send admin reply
- `PATCH /api/admin/support/sessions/:sessionId/status` — update session status
- `PATCH /api/admin/support/sessions/:sessionId/assign` — assign session to admin
- `GET  /api/admin/canned-responses` — list canned responses
- `POST /api/admin/canned-responses` — create canned response
- `DELETE /api/admin/canned-responses/:id` — delete canned response
- `GET  /api/admin/permissions/:adminId` — get admin permissions
- `POST /api/admin/permissions/:adminId` — set admin permissions
- `GET  /api/admin/activity-log` — admin audit trail
- `GET  /api/admin/export/users` — export users CSV
- `GET  /api/admin/export/transactions` — export transactions CSV
- `GET  /api/admin/plans` — list plans
- `PATCH /api/admin/plans/:id` — update plan
- `GET  /api/admin/settings` — get app settings
- `POST /api/admin/settings` — save app settings
- `POST /webhook/telegram` — support bot webhook
- `POST /webhook/telegram/finance` — finance bot webhook
