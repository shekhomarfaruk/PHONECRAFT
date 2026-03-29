<div align="center">

<img src="https://img.shields.io/badge/PhoneCraft-Virtual%20Manufacturing%20Platform-0f172a?style=for-the-badge&logo=smartphone&logoColor=white" alt="PhoneCraft" />

<br/><br/>

<p>
  <img src="https://img.shields.io/badge/React-20232A?style=flat-square&logo=react&logoColor=61DAFB" />
  <img src="https://img.shields.io/badge/Node.js-339933?style=flat-square&logo=node.js&logoColor=white" />
  <img src="https://img.shields.io/badge/SQLite-003B57?style=flat-square&logo=sqlite&logoColor=white" />
  <img src="https://img.shields.io/badge/Vite-646CFF?style=flat-square&logo=vite&logoColor=white" />
  <img src="https://img.shields.io/badge/pnpm-F69220?style=flat-square&logo=pnpm&logoColor=white" />
  <img src="https://img.shields.io/badge/Telegram-2CA5E0?style=flat-square&logo=telegram&logoColor=white" />
</p>

<h1>📱 PhoneCraft</h1>
<p><strong>Virtual Phone Manufacturing Platform — Earn Real Money by Manufacturing Phones</strong></p>

<p>
  <a href="#features">Features</a> ·
  <a href="#tech-stack">Tech Stack</a> ·
  <a href="#architecture">Architecture</a> ·
  <a href="#getting-started">Getting Started</a> ·
  <a href="#api-reference">API</a> ·
  <a href="#admin-panel">Admin Panel</a>
</p>

</div>

---

## ✨ What is PhoneCraft?

**PhoneCraft** is a gamified virtual manufacturing platform where users assemble virtual smartphones and earn **real money (BDT / USD)**. Users pick device specs, start a manufacturing job, and collect earnings once it completes — all within a clean, mobile-first web app.

> **Bilingual** — Full English + Bangla (বাংলা) support throughout the UI, API responses, and admin panel. Currency automatically switches between **USD ($)** and **BDT (৳)** based on language mode.

---

## 🚀 Features

### For Users
| Feature | Details |
|---|---|
| 🏭 **Virtual Manufacturing** | Choose brand, specs, RAM, ROM, colour — start a timed job and earn per completion |
| 💰 **Real Earnings** | Balance credited in BDT; withdrawals via bKash, Nagad, Rocket, Bank, or Crypto |
| 🎁 **Guest Trial Mode** | 15-minute trial with 5 tasks using code `GUSTMODE` — no registration required |
| 👥 **3-Level Referrals** | Earn commission from Level 1, 2, and 3 referrals |
| 🛒 **Marketplace** | Completed devices auto-list on the in-app marketplace |
| 💬 **Live Support** | Real-time chat widget backed by Telegram support bot |
| 🔔 **Push Notifications** | Web push for task completions, balance updates, and announcements |
| 🌐 **Bilingual** | EN / বাংলা toggle — all text, errors, and currency switch instantly |

### For Administrators
| Feature | Details |
|---|---|
| 📊 **Live Dashboard** | Real-time stats, 14-day revenue chart, pending actions, top earners |
| 👤 **User Management** | Search/filter/ban/unban, bulk actions, CSV export, broadcast messages |
| 💳 **Finance Queue** | Approve/reject deposits & withdrawals with admin notes |
| 🛡️ **Stealth Controls** | Silent-hold / silent-reject transactions — sub-admins see "approved" |
| 🔑 **Granular Permissions** | 15 permission toggles for sub-admins across 4 categories |
| 🗺️ **IP Tracking** | Users grouped by shared IP — suspicious flag for 3+ accounts |
| ⏰ **Work Time Scheduler** | Restrict manufacturing to specific hours with ON/OFF toggle |
| ⚙️ **Full Settings Control** | Payment accounts, crypto wallets, withdrawal limits, cooldowns, plans |

---

## 🏗️ Architecture

```
phonecraft/
├── artifacts/
│   ├── phonecraft/               # ⚛️  React + Vite — User-facing frontend
│   │   └── src/
│   │       ├── screens/          #    WorkScreen, WalletScreen, HomeScreen…
│   │       ├── session.js        #    JWT auth, guest expiry handling
│   │       ├── push.js           #    Web Push subscription
│   │       └── App.jsx
│   │
│   ├── api-server/               # 🟢  Node.js + Express — REST API
│   │   └── phonecraft/
│   │       ├── index.js          #    All route handlers (~3400 lines)
│   │       ├── db.js             #    SQLite schema + prepared statements
│   │       └── services/
│   │           └── telegramService.js
│   │
│   ├── admin-panel/              # 🔧  React + Vite — Admin control centre
│   │   └── src/
│   │       └── App.jsx           #    Dashboard, Users, Finance, Support, Admins, Settings
│   │
│   └── phonecraft-presentation/  # 📊  React slide deck (investor/demo)
│
├── pnpm-workspace.yaml
└── README.md
```

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| **Frontend** | React 18, Vite, CSS Modules |
| **Backend** | Node.js 24, Express, CommonJS |
| **Database** | SQLite via `better-sqlite3` |
| **Auth** | JWT (HMAC-SHA256), bcrypt |
| **Bots** | Telegram Bot API (Finance + Support bots) |
| **Push** | Web Push (VAPID) |
| **Monorepo** | pnpm workspaces |
| **Security** | Helmet, CORS, rate limiting, device fingerprinting |

---

## ⚡ Getting Started

### Prerequisites
- **Node.js** ≥ 24
- **pnpm** ≥ 9

### Installation

```bash
# Clone the repository
git clone https://github.com/shekhomarfaruk/PHONECRAFT.git
cd PHONECRAFT

# Install all workspace dependencies
pnpm install
```

### Environment Variables

Create the following secrets (via Replit Secrets or `.env`):

| Variable | Description |
|---|---|
| `AUTH_SECRET` | JWT signing secret (min 32 chars — keep permanent!) |
| `TELEGRAM_FINANCE_BOT_TOKEN` | Finance Telegram bot token |
| `TELEGRAM_SUPPORT_BOT_TOKEN` | Support Telegram bot token |
| `ADMIN_PASSWORD` | Admin panel master password |
| `TELEGRAM_ADMIN_CHAT_IDS` | Comma-separated Telegram admin user IDs |
| `TELEGRAM_FINANCE_CHAT_IDS` | Finance group chat IDs |
| `TELEGRAM_SUPPORT_CHAT_IDS` | Support group chat ID |
| `MAIN_ADMIN_REFER_CODE` | Main admin referral code (e.g. `ADMIN01`) |

### Run

```bash
# Start API server (port 8080)
pnpm --filter @workspace/api-server run phonecraft:dev

# Start user frontend (port auto-assigned)
pnpm --filter @workspace/phonecraft run dev

# Start admin panel
pnpm --filter @workspace/admin-panel run dev
```

---

## 🔌 API Reference

### Auth
| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/register` | Register new user (supports `GUSTMODE` for guest trial) |
| `POST` | `/api/login` | Login — returns JWT |
| `GET` | `/api/me` | Get current user profile |

### Manufacturing
| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/manufacture/start` | Start a manufacturing job |
| `POST` | `/api/manufacture/complete` | Collect earnings on job completion |
| `GET` | `/api/user/:id/work-status` | Daily progress, limit, active job, work-time window |

### Wallet
| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/withdraw` | Submit withdrawal request |
| `POST` | `/api/deposit` | Submit deposit/proof |
| `GET` | `/api/transactions` | Transaction history |
| `POST` | `/api/transfer` | Peer-to-peer balance transfer |

### Admin (all require admin JWT)
| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/admin/stats` | Dashboard stats + revenue chart |
| `GET/PATCH` | `/api/admin/users` | List / update users |
| `POST` | `/api/admin/bulk-action` | Bulk ban/unban |
| `GET/PATCH` | `/api/admin/transactions/:id` | Finance queue management |
| `GET/POST` | `/api/admin/settings` | App-wide settings |
| `GET/POST` | `/api/admin/settings/guest-mode` | Guest mode toggle |
| `GET/POST` | `/api/admin/permissions/:adminId` | Sub-admin permissions |
| `GET` | `/api/admin/ip-groups` | IP-grouped user analysis |

---

## 🔐 Security

- **JWT authentication** — HMAC-SHA256 signed, verified on every request
- **Guest expiry** — dual-layer: JWT `exp` claim + `guest_expires_at` DB column
- **Device fingerprinting** — `device_id` required (8–128 alphanumeric chars) for guest accounts
- **Rate limiting** — register, login, finance, and support endpoints are throttled
- **IP cap** — max 3 new guest accounts per IP per Dhaka calendar-day
- **Withdrawal safeguards** — cooldown period, daily limit, minimum balance, duplicate TxID rejection
- **Auto-flagging** — high-value withdrawals flagged for manual review
- **Stealth controls** — main admin can silently hold or reject transactions
- **IDOR protection** — users can only access their own data
- **Admin isolation** — sub-admins cannot access main-admin-only endpoints regardless of token

---

## 🎮 Guest Mode

New users can try PhoneCraft without registering:

1. Use referral code `GUSTMODE` at registration
2. Provide a unique `device_id` (8–128 alphanumeric chars)
3. Get **15 minutes** to complete up to **5 manufacturing tasks**
4. Earnings are blocked for guests — convert to a real account to withdraw
5. The same device is auto-resumed if the guest session is still active

```
Guest caps:
  • Session length : 15 minutes
  • Daily tasks    : 5
  • IP limit       : 3 new guest accounts / day
  • Balance credit : ✗ blocked
  • Withdraw       : ✗ blocked
```

---

## ⏰ Work Time Scheduler

Admins can restrict when manufacturing is allowed:

- Toggle ON/OFF from the admin Settings page
- Set a daily window (e.g. 09:00 – 22:00 Dhaka time / UTC+6)
- When OFF, all manufacturing start requests are blocked with a user-friendly message
- Active jobs in progress are **never** interrupted by the time window

---

## 💬 Telegram Integration

Two separate bots handle different workflows:

| Bot | Purpose |
|---|---|
| **Finance Bot** | Deposit / withdrawal notifications to finance team group |
| **Support Bot** | Bi-directional user ↔ admin live chat via Telegram reply-to |

Support flow: User message → stored in DB → forwarded to Telegram group → admin Telegram reply → webhook → stored in DB → user sees reply within 3 seconds.

---

## 🌍 Bilingual Support

Every user-facing string is stored as a bilingual JSON object:

```json
{ "en": "Manufacturing complete!", "bn": "উৎপাদন সম্পন্ন হয়েছে!" }
```

The frontend reads the active language from `localStorage` and renders the correct string. Currency formats automatically:
- **English mode** → `$1.00` (USD, 1 USD = 122.80 BDT)
- **Bangla mode** → `৳122.80` (BDT stored natively)

---

## 📊 Presentation

A slide-deck app is included at `artifacts/phonecraft-presentation/` for demos and investor pitches — 10 animated slides covering the product overview, earning model, features, and screenshots.

Export all slides as a printable page via the `/allslides` route.

---

## 📄 License

This project is proprietary software. All rights reserved.

---

<div align="center">
  <sub>Built with ❤️ — PhoneCraft &copy; 2026</sub>
</div>
