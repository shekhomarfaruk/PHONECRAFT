const express  = require('express');
const cors     = require('cors');
const bcrypt   = require('bcryptjs');
const crypto   = require('crypto');
const path     = require('path');
const fs       = require('fs');
const multer   = require('multer');
const webPush  = require('web-push');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });
require('dotenv').config();

const { db, stmts, sanitizeUser, todayDate } = require('./db');
const { TelegramService } = require('./services/telegramService');

// ── Web Push VAPID setup ─────────────────────────────────────────────────────
const VAPID_PUBLIC  = process.env.VAPID_PUBLIC_KEY  || 'BMzqYPuk_-UyWtAuChDOHBT8vOnpBsYSWnFe6dPI6FHzsKPXaakfvfSWCz-etkDPn8p8gJ502QFYax6gyVLzgBg';
const VAPID_PRIVATE = process.env.VAPID_PRIVATE_KEY || 'TYZRvv8BQmxFfQ6YQA8hie5sBOTTetrNstQGIIpwyMk';
webPush.setVapidDetails('mailto:admin@phonecraft.tech', VAPID_PUBLIC, VAPID_PRIVATE);

// Send push notification to a specific user (non-blocking)
async function sendPush(userId, payload) {
  try {
    const subs = stmts.getPushSubscriptions.all(userId);
    for (const sub of subs) {
      try {
        await webPush.sendNotification(
          { endpoint: sub.endpoint, keys: { p256dh: sub.p256dh, auth: sub.auth } },
          JSON.stringify(payload)
        );
      } catch (e) {
        if (e.statusCode === 410 || e.statusCode === 404) {
          stmts.deletePushSubscription.run(userId, sub.endpoint);
        }
      }
    }
  } catch (_) {}
}

// Send push to all admin users (main admin + subadmins)
async function notifyAdmins(payload) {
  try {
    const adminIds = stmts.getAdminUsers.all().map(r => r.id);
    for (const adminId of adminIds) {
      const subs = stmts.getPushSubscriptions.all(adminId);
      for (const sub of subs) {
        try {
          await webPush.sendNotification(
            { endpoint: sub.endpoint, keys: { p256dh: sub.p256dh, auth: sub.auth } },
            JSON.stringify(payload)
          );
        } catch (e) {
          if (e.statusCode === 410 || e.statusCode === 404) {
            stmts.deletePushSubscription.run(adminId, sub.endpoint);
          }
        }
      }
    }
  } catch (_) {}
}

// Broadcast push to all subscribed users
async function broadcastPush(payload, excludeUserId) {
  try {
    const allSubs = stmts.getAllPushSubscriptions.all();
    for (const sub of allSubs) {
      if (excludeUserId && sub.user_id === excludeUserId) continue;
      try {
        await webPush.sendNotification(
          { endpoint: sub.endpoint, keys: { p256dh: sub.p256dh, auth: sub.auth } },
          JSON.stringify(payload)
        );
      } catch (e) {
        if (e.statusCode === 410 || e.statusCode === 404) {
          stmts.deletePushSubscription.run(sub.user_id, sub.endpoint);
        }
      }
    }
  } catch (_) {}
}

// ── Currency helpers ──────────────────────────────────────────────────────────
const DEFAULT_USD_RATE = 122.80;
let _usdRate = DEFAULT_USD_RATE;
let _usdRateTs = 0;
async function refreshUsdRate() {
  if (Date.now() - _usdRateTs < 7 * 60 * 1000) return _usdRate;
  try {
    const r = await fetch('https://open.er-api.com/v6/latest/USD');
    const d = await r.json();
    if (d?.rates?.BDT) { _usdRate = Number(d.rates.BDT); _usdRateTs = Date.now(); }
  } catch (_) {}
  if (typeof telegramService !== 'undefined' && telegramService) telegramService.usdRate = _usdRate;
  return _usdRate;
}
refreshUsdRate();
setInterval(refreshUsdRate, 7 * 60 * 1000);

function fmtAmt(bdt, lang) {
  const n = Number(bdt) || 0;
  if (lang === 'bn') return `৳${n.toLocaleString('en-US')}`;
  return `$${(n / _usdRate).toFixed(2)}`;
}
function biMsg(en, bn) {
  return JSON.stringify({ en, bn });
}
function getUserLang(userId) {
  try {
    const u = stmts.getUserById.get(Number(userId));
    return u?.lang || 'bn';
  } catch (_) { return 'bn'; }
}

// ── Multer for file uploads ───────────────────────────────────────────────────
const UPLOADS_DIR = path.join(__dirname, 'uploads');
if (!fs.existsSync(UPLOADS_DIR)) fs.mkdirSync(UPLOADS_DIR, { recursive: true });

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, UPLOADS_DIR),
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, `${Date.now()}-${crypto.randomBytes(6).toString('hex')}${ext}`);
  },
});
const ALLOWED_MIME = new Set([
  'image/jpeg', 'image/png', 'image/gif', 'image/webp',
  'application/pdf', 'application/zip',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'audio/mpeg', 'video/mp4',
]);
const ALLOWED_EXT = /\.(jpg|jpeg|png|gif|webp|pdf|doc|docx|zip|mp4|mp3)$/i;
const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    const extOk  = ALLOWED_EXT.test(file.originalname);
    const mimeOk = ALLOWED_MIME.has(file.mimetype);
    cb(null, extOk && mimeOk);
  },
});

const app  = express();
const PORT = process.env.PORT || 4000;
const DEFAULT_TELEGRAM_BOT = process.env.TELEGRAM_BOT_TOKEN || '';
const FINANCE_BOT = process.env.TELEGRAM_FINANCE_BOT_TOKEN || DEFAULT_TELEGRAM_BOT;
const SUPPORT_BOT = process.env.TELEGRAM_SUPPORT_BOT_TOKEN || DEFAULT_TELEGRAM_BOT;
const IS_PRODUCTION = process.env.NODE_ENV === 'production';
const MAIN_ADMIN_REFER_CODE = (process.env.MAIN_ADMIN_REFER_CODE || 'ADMIN01').trim();
const DEFAULT_ALLOWED_ORIGINS = [
  'https://phonecraft.tech',
  'https://www.phonecraft.tech',
  'http://localhost:5173',
  'http://127.0.0.1:5173',
  'http://localhost:4173',
  'http://127.0.0.1:4173',
];
const allowedOrigins = new Set([
  ...DEFAULT_ALLOWED_ORIGINS,
  ...String(process.env.ALLOWED_ORIGINS || '').split(',').map(v => v.trim()).filter(Boolean),
]);
const AUTH_SECRET = process.env.AUTH_SECRET
  || process.env.TELEGRAM_BOT_TOKEN
  || (IS_PRODUCTION ? crypto.randomBytes(32).toString('hex') : 'local-dev-auth-secret');

function parseDeviceName(ua) {
  if (!ua || ua === 'unknown') return 'Unknown Device';
  let m;
  if (/iPhone/i.test(ua)) {
    const iosVer = ua.match(/iPhone\s+OS\s+([\d_]+)/i)?.[1]?.replace(/_/g, '.') || '';
    return iosVer ? `iPhone (iOS ${iosVer})` : 'iPhone';
  }
  if (/iPad/i.test(ua)) {
    const ver = ua.match(/CPU\s+OS\s+([\d_]+)/i)?.[1]?.replace(/_/g, '.') || '';
    return ver ? `iPad (iPadOS ${ver})` : 'iPad';
  }
  m = ua.match(/SM-([A-Z0-9]+)/i);
  if (m) return `Samsung SM-${m[1]}`;
  m = ua.match(/\b(Redmi\s+Note\s+\d+\w*|Redmi\s+\d+\w*|POCO\s+\w+|Mi\s+\d+\w*)/i);
  if (m) return `Xiaomi ${m[1].trim()}`;
  m = ua.match(/\b(HUAWEI\s+[A-Z0-9\-]+)/i);
  if (m) return `Huawei ${m[1].trim()}`;
  m = ua.match(/\b(OnePlus[\w]+)/i);
  if (m) return `OnePlus ${m[1].replace('OnePlus', '').trim()}`;
  m = ua.match(/\b(CPH\d+|OPPO\s+[A-Z0-9]+)/i);
  if (m) return `Oppo ${m[1].trim()}`;
  m = ua.match(/\b(RMX\d+)\b/i);
  if (m) return `Realme ${m[1]}`;
  m = ua.match(/\bVivo\s+([A-Z0-9\-]+)/i);
  if (m) return `Vivo ${m[1].trim()}`;
  m = ua.match(/Android\s+([\d.]+)[^;)]*;\s*([^;)\n]+?)\s*(?:Build|MIUI|\))/i);
  if (m) {
    const model = m[2].trim();
    if (model && model.length > 1 && !/^Linux|wv$/i.test(model)) {
      return `${model} (Android ${m[1]})`;
    }
    return `Android ${m[1]}`;
  }
  if (/Windows NT/i.test(ua)) return 'Windows PC';
  if (/Macintosh|Mac OS X/i.test(ua)) return 'Mac';
  if (/CrOS/i.test(ua)) return 'Chromebook';
  if (/Linux/i.test(ua)) return 'Linux PC';
  return 'Unknown Device';
}

function parseChatIds(...values) {
  const ids = [];
  for (const v of values) {
    const value = String(v || '').trim();
    if (!value) continue;
    for (const part of value.split(',')) {
      const id = part.trim();
      if (id) ids.push(id);
    }
  }
  return [...new Set(ids)];
}

const FINANCE_CHAT_IDS = parseChatIds(
  process.env.TELEGRAM_FINANCE_CHAT_IDS,
  process.env.TELEGRAM_FINANCE_CHAT_ID,
  process.env.TELEGRAM_ADMIN_CHAT_ID,
  process.env.TELEGRAM_CHAT_ID,
  process.env.TELEGRAM_CHANNEL_ID,
);

const SUPPORT_CHAT_IDS = parseChatIds(
  process.env.TELEGRAM_SUPPORT_CHAT_IDS,
  process.env.TELEGRAM_SUPPORT_CHAT_ID,
  process.env.TELEGRAM_ADMIN_CHAT_ID,
  process.env.TELEGRAM_CHAT_ID,
);

const ADMIN_CHAT_IDS = parseChatIds(
  process.env.TELEGRAM_ADMIN_CHAT_IDS,
  process.env.TELEGRAM_ADMIN_CHAT_ID,
);

if (!process.env.AUTH_SECRET) {
  console.warn('[Security] AUTH_SECRET is not set. Set a stable secret in production to keep sessions valid across restarts.');
}

app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader('Permissions-Policy', 'camera=(), microphone=()');
  res.setHeader('X-Powered-By', '');
  res.removeHeader('X-Powered-By');
  if (req.path.startsWith('/api/admin')) {
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('X-Robots-Tag', 'noindex, nofollow');
  }
  next();
});

app.use(cors({
  origin(origin, callback) {
    if (!origin || allowedOrigins.has(origin)) {
      callback(null, true);
      return;
    }
    callback(null, false);
  },
}));
app.use(express.json({ limit: '5mb' }));
app.set('trust proxy', 1); // Trust exactly one hop (Replit's proxy); req.ip returns true client IP
app.use('/uploads', express.static(UPLOADS_DIR));

function createRateLimiter({ windowMs, max, prefix }) {
  const hits = new Map();

  return (req, res, next) => {
    const now = Date.now();
    const key = `${prefix}:${req.ip || 'unknown'}`;
    const current = hits.get(key);

    if (!current || current.resetAt <= now) {
      hits.set(key, { count: 1, resetAt: now + windowMs });
      next();
      return;
    }

    if (current.count >= max) {
      res.setHeader('Retry-After', Math.ceil((current.resetAt - now) / 1000));
      res.status(429).json({ error: 'Too many requests. Please try again shortly.' });
      return;
    }

    current.count += 1;

    if (hits.size > 5000 && Math.random() < 0.01) {
      for (const [entryKey, value] of hits.entries()) {
        if (value.resetAt <= now) hits.delete(entryKey);
      }
    }

    next();
  };
}

const loginLimiter = createRateLimiter({ windowMs: 15 * 60_000, max: 10, prefix: 'login' });
const adminLoginLimiter = createRateLimiter({ windowMs: 30 * 60_000, max: 5, prefix: 'adminlogin' });
const registerLimiter = createRateLimiter({ windowMs: 15 * 60_000, max: 5, prefix: 'register' });
const financeLimiter = createRateLimiter({ windowMs: 5 * 60_000, max: 10, prefix: 'finance' });
const supportLimiter = createRateLimiter({ windowMs: 60_000, max: 10, prefix: 'support' });
const manufactureLimiter = createRateLimiter({ windowMs: 60_000, max: 20, prefix: 'manufacture' });
const passwordLimiter = createRateLimiter({ windowMs: 15 * 60_000, max: 5, prefix: 'password' });

function getSettingNum(key, fallback) {
  const row = stmts.getSetting.get(key);
  const v = Number(row?.value);
  return (!row || !row.value || isNaN(v)) ? fallback : v;
}
function getSettingStr(key, fallback = '') {
  const row = stmts.getSetting.get(key);
  return (row && row.value) ? row.value : fallback;
}

function isWorkTimeOpen() {
  if (getSettingStr('work_time_enabled', '0') !== '1') return true;
  const startStr = getSettingStr('work_time_start', '09:00');
  const endStr   = getSettingStr('work_time_end',   '22:00');
  const dhaka    = new Date(Date.now() + 6 * 60 * 60 * 1000);
  const cur      = dhaka.getUTCHours().toString().padStart(2, '0') + ':' + dhaka.getUTCMinutes().toString().padStart(2, '0');
  return cur >= startStr && cur < endStr;
}

function signTokenPayload(encodedPayload) {
  return crypto.createHmac('sha256', AUTH_SECRET).update(encodedPayload).digest('base64url');
}

function issueAuthToken(user) {
  const encodedPayload = Buffer.from(JSON.stringify({
    uid: user.id,
    exp: Date.now() + (7 * 24 * 60 * 60 * 1000),
    v: 1,
  }), 'utf8').toString('base64url');

  return `${encodedPayload}.${signTokenPayload(encodedPayload)}`;
}

function verifyAuthToken(token) {
  if (!token) return null;

  const [encodedPayload, signature] = String(token).split('.');
  if (!encodedPayload || !signature) return null;

  const expectedSignature = signTokenPayload(encodedPayload);
  if (signature.length !== expectedSignature.length) return null;
  if (!crypto.timingSafeEqual(Buffer.from(signature, 'utf8'), Buffer.from(expectedSignature, 'utf8'))) return null;

  try {
    const payload = JSON.parse(Buffer.from(encodedPayload, 'base64url').toString('utf8'));
    if (!payload?.uid || !payload?.exp || payload.exp < Date.now()) return null;

    const user = stmts.getUserById.get(Number(payload.uid));
    if (!user || user.banned) return null;

    return { userId: user.id, isAdmin: !!user.is_admin, user };
  } catch (_) {
    return null;
  }
}

function getBearerToken(req) {
  const header = req.headers.authorization || '';
  return header.startsWith('Bearer ') ? header.slice(7).trim() : '';
}

function authRequired(req, res, next) {
  const auth = verifyAuthToken(getBearerToken(req));
  if (!auth) {
    res.status(401).json({ error: 'Invalid or expired session' });
    return;
  }
  req.auth = auth;

  // Guest expiry: block ALL authenticated routes with 401 (>= for exact cutoff)
  if (auth.user && auth.user.is_guest && auth.user.guest_expires_at) {
    const nowSec = Math.floor(Date.now() / 1000);
    if (nowSec >= auth.user.guest_expires_at) {
      res.status(401).json({ error: 'guest_expired' });
      return;
    }
  }

  next();
}

function requireSelfOrAdmin(paramName = 'id') {
  return (req, res, next) => {
    const targetId = Number(req.params[paramName]);
    if (req.auth?.isAdmin || targetId === req.auth?.userId) {
      next();
      return;
    }
    res.status(403).json({ error: 'Forbidden' });
  };
}

function requirePendingReferrerOrAdmin(req, res, next) {
  const pending = stmts.getPendingReg.get(Number(req.params.id));
  if (!pending || pending.status !== 'pending') {
    res.status(404).json({ error: 'Not found or already processed' });
    return;
  }
  if (!req.auth?.isAdmin && pending.referrer_id !== req.auth?.userId) {
    res.status(403).json({ error: 'Forbidden' });
    return;
  }
  req.pendingRegistration = pending;
  next();
}

// ── One-time migration: cap all existing marketplace prices to $10 ────────────
try {
  const capped = db.prepare("UPDATE marketplace_items SET price = ((ABS(CAST(RANDOM() AS INTEGER)) % 10) + 1) WHERE price > 10").run();
  if (capped.changes > 0) console.log(`[Migration] Capped ${capped.changes} marketplace item price(s) to max $10`);
} catch (_) {}

// ── Block legacy /admin-panel path (static files may persist on server) ──────
app.use('/admin-panel', (_req, res) => res.status(404).end());

// ── Serve frontend build ──────────────────────────────────────────────────────
app.use(express.static(path.join(__dirname, '..', 'dist')));

// ── Health check ─────────────────────────────────────────────────────────────
app.get('/health', (_req, res) => res.json({ status:'ok', service:'PhoneCraft API' }));

// ── Send Telegram message helper ─────────────────────────────────────────────
async function sendTelegram(text, { botToken = FINANCE_BOT, chatIds = FINANCE_CHAT_IDS } = {}) {
  if (!botToken || !Array.isArray(chatIds) || chatIds.length === 0) {
    throw new Error('Telegram bot token or chat ids are not configured');
  }

  const url = `https://api.telegram.org/bot${botToken}/sendMessage`;
  const deliveries = [];
  const errors = [];

  for (const chatId of chatIds) {
    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ chat_id: chatId, text, parse_mode: 'HTML' }),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok || !data.ok) {
        throw new Error(data.description || `Telegram send failed (${response.status})`);
      }
      deliveries.push({ chatId, result: data.result || null });
    } catch (err) {
      errors.push(`chat ${chatId}: ${err.message}`);
    }
  }

  if (deliveries.length === 0) {
    throw new Error(errors.join(' | ') || 'Telegram delivery failed');
  }

  return deliveries;
}

function processTransactionAction({ txId, status, adminNote = '' }) {
  if (!['approved', 'rejected'].includes(status)) {
    return { status: 400, body: { error: 'Status must be approved or rejected' } };
  }

  return db.transaction(() => {
    const tx = stmts.getTransactionById.get(Number(txId));
    if (!tx) return { status: 404, body: { error: 'Transaction not found' } };
    if (tx.status !== 'pending') return { status: 409, body: { error: 'Transaction already processed' } };

    stmts.updateTransactionStatus.run({
      id: Number(txId),
      status,
      admin_note: adminNote || '',
    });

    if (tx.type === 'withdraw' && status === 'rejected') {
      stmts.creditBalance.run(tx.amount, tx.user_id);
      stmts.insertBalanceLog.run({
        user_id: tx.user_id,
        type: 'withdrawal_refund',
        amount: tx.amount,
        note: biMsg(`Withdrawal refund (rejected) — ${tx.method}`, `উইথড্র রিফান্ড (প্রত্যাখ্যাত) — ${tx.method}`),
      });
    }

    if (tx.type === 'deposit' && status === 'approved') {
      stmts.creditBalance.run(tx.amount, tx.user_id);
      stmts.insertBalanceLog.run({
        user_id: tx.user_id,
        type: 'deposit',
        amount: tx.amount,
        note: biMsg(`Deposit approved (${tx.method} - ${tx.account})`, `ডিপোজিট অনুমোদিত (${tx.method} - ${tx.account})`),
      });
      // Admin treasury: deposit received — credit admin wallet
      const mainAdmin = db.prepare("SELECT id FROM users WHERE refer_code=? AND is_admin=1 LIMIT 1").get(MAIN_ADMIN_REFER_CODE);
      if (mainAdmin) {
        stmts.creditBalance.run(tx.amount, mainAdmin.id);
        stmts.insertBalanceLog.run({ user_id: mainAdmin.id, type: 'treasury_deposit_in', amount: tx.amount, note: `Deposit received from user #${tx.user_id} via ${tx.method}` });
      }
    }

    if (tx.type === 'withdraw' && status === 'approved') {
      // Admin treasury: withdrawal paid out — debit admin wallet
      const mainAdmin = db.prepare("SELECT id FROM users WHERE refer_code=? AND is_admin=1 LIMIT 1").get(MAIN_ADMIN_REFER_CODE);
      if (mainAdmin) {
        stmts.debitBalance.run(tx.amount, mainAdmin.id);
        stmts.insertBalanceLog.run({ user_id: mainAdmin.id, type: 'treasury_withdrawal_out', amount: -tx.amount, note: `Withdrawal paid to user #${tx.user_id} via ${tx.method} (${tx.account})` });
      }
    }

    const action = status === 'approved' ? 'approved' : 'rejected';
    // Filter out admin-only notes (Telegram commands, trxids) from user-facing message
    const isAdminOnlyNote = adminNote && (
      adminNote.startsWith('trxid:') ||
      adminNote.includes('Telegram') ||
      adminNote.includes('telegram') ||
      adminNote.includes('via Telegram') ||
      adminNote.includes('command')
    );
    const userNote = isAdminOnlyNote ? '' : (adminNote || '');
    const noteStr = userNote ? ` (${userNote})` : '';
    const noteStrBn = userNote ? ` (${userNote})` : '';
    const notifMsg = biMsg(
      `Your ${tx.type} of ${fmtAmt(tx.amount, 'en')} has been ${action}.${noteStr}`,
      `আপনার ${tx.type === 'deposit' ? 'ডিপোজিট' : 'উইথড্র'} ${fmtAmt(tx.amount, 'bn')} ${status === 'approved' ? 'অনুমোদিত হয়েছে।' : 'বাতিল হয়েছে।'}${noteStrBn}`
    );
    stmts.insertNotification.run(tx.user_id, notifMsg, status === 'approved' ? 'success' : 'warning');

    // Push notification for tx approval/rejection (use user's language)
    const pushIcon = status === 'approved' ? '✅' : '❌';
    const uLang = getUserLang(tx.user_id);
    const txLabelEn = tx.type === 'deposit' ? 'Deposit' : 'Withdrawal';
    const txLabelBn = tx.type === 'deposit' ? 'ডিপোজিট' : 'উইথড্র';
    sendPush(tx.user_id, {
      title: uLang === 'bn'
        ? `${pushIcon} ${txLabelBn} ${status === 'approved' ? 'অনুমোদিত' : 'বাতিল'}`
        : `${pushIcon} ${txLabelEn} ${status === 'approved' ? 'Approved' : 'Rejected'}`,
      body: uLang === 'bn'
        ? `${fmtAmt(tx.amount, 'bn')} ${txLabelBn} ${status === 'approved' ? 'অনুমোদন করা হয়েছে।' : 'বাতিল করা হয়েছে।'}${noteStrBn}`
        : `${fmtAmt(tx.amount, 'en')} ${txLabelEn} ${status === 'approved' ? 'has been approved.' : 'has been rejected.'}${noteStr}`,
      icon: '/logo.png',
      url: '/wallet',
      tag: `tx-${tx.id}`,
    });

    return { status: 200, body: { transaction: stmts.getTransactionById.get(Number(txId)) } };
  })();
}

const telegramService = new TelegramService({
  financeBotToken: FINANCE_BOT,
  supportBotToken: SUPPORT_BOT,
  financeChatIds: FINANCE_CHAT_IDS,
  supportChatIds: SUPPORT_CHAT_IDS,
  adminChatIds: ADMIN_CHAT_IDS,
  stmts,
  processTransactionAction,
  onSupportSessionReply: ({ sessionId, text }) => {
    stmts.insertSupportMsg.run(sessionId, 'admin', String(text || '').trim());
  },
});
telegramService.usdRate = _usdRate;

// ── Admin guard ─────────────────────────────────────────────────────────────
function requireAdmin(req, res) {
  const user = stmts.getUserById.get(req.auth?.userId);
  if (!user) { res.status(401).json({ error: 'Authentication required' }); return false; }
  if (!user || !user.is_admin) { res.status(403).json({ error: 'Admin access required' }); return false; }
  req.auth.user = user;
  req.auth.isMainAdmin = isMainAdminUser(user);
  return true;
}

function isMainAdminUser(user) {
  return !!(user && user.is_admin && user.refer_code === MAIN_ADMIN_REFER_CODE);
}

function getSubAdminPerms(adminId) {
  const rows = stmts.getAdminPermissions.all(Number(adminId));
  const map = {};
  rows.forEach(r => { if (r.granted) map[r.permission] = true; });
  return map;
}

// Returns true if allowed; sends 403 and returns false if not
function requirePerm(req, res, perm) {
  if (req.auth.isMainAdmin) return true;
  const perms = getSubAdminPerms(req.auth.userId);
  if (perms[perm]) return true;
  res.status(403).json({ error: biMsg(
    'You do not have permission to perform this action.',
    'এই কাজ করার অনুমতি আপনার নেই।'
  )});
  return false;
}

// Settings key groups for granular permission
const PAYMENT_NUM_KEYS  = new Set(['deposit_bkash','deposit_nagad','deposit_rocket','deposit_bank']);
const WALLET_ADDR_KEYS  = new Set(['deposit_wallet_1','deposit_wallet_2','deposit_wallet_3','deposit_wallet_4','deposit_wallet_5','deposit_wallet_6','deposit_wallet_7','deposit_wallet_8','deposit_wallet_9','deposit_wallet_10','wallet_rotation_index']);
const REQUIRE_PROOF_KEY = new Set(['require_withdraw_proof']);

function toClientUser(user) {
  const safe = sanitizeUser(user);
  if (!safe) return safe;
  return {
    ...safe,
    is_main_admin: isMainAdminUser(user),
  };
}

function syncDailyDoneWithCompletedJobs(userId) {
  const completedToday = stmts.getCompletedJobCountToday.get(userId)?.count || 0;
  stmts.setDailyDone.run(completedToday, userId);
  return completedToday;
}

// ══════════════════════════════════════════════════════════════════════════════
// AUTH ENDPOINTS
// ══════════════════════════════════════════════════════════════════════════════

// ── Register ─────────────────────────────────────────────────────────────────
app.post('/api/register', registerLimiter, (req, res) => {
  try {
    const { name, identifier, password, plan, refCode, device_id } = req.body || {};

    if (!name || !identifier || !password || !refCode)
      return res.status(400).json({ error: 'All fields are required including referral code' });

    // ── GUSTMODE: instant guest trial account ─────────────────────────────────
    if (String(refCode).toUpperCase() === 'GUSTMODE') {
      const clientIp = req.ip || req.socket?.remoteAddress || '';

      // device_id validated first (needed for auto-login check below)
      const safeDeviceId = String(device_id || '').trim();
      if (!safeDeviceId || safeDeviceId.length < 8 || safeDeviceId.length > 128 || !/^[a-zA-Z0-9_\-]+$/.test(safeDeviceId))
        return res.status(400).json({ error: biMsg('Invalid or missing device ID', 'Device ID অবৈধ বা অনুপস্থিত') });

      // Device lock: existing guest on this device → auto-login regardless of toggle
      // (toggle only prevents NEW guest registrations, not resuming existing sessions)
      const existingGuest = db.prepare('SELECT * FROM users WHERE is_guest = 1 AND guest_device_id = ?').get(safeDeviceId);
      if (existingGuest) {
        const token = issueAuthToken(existingGuest);
        return res.json({ token, user: toClientUser(existingGuest), plan: stmts.getPlan.get(existingGuest.plan_id), guest_resumed: true });
      }

      // New guest registration requires guest mode to be enabled
      const guestEnabled = getSettingStr('guest_mode_enabled', '1');
      if (guestEnabled !== '1') {
        return res.status(403).json({ error: biMsg('Guest mode is currently disabled', 'গেস্ট মোড বর্তমানে বন্ধ আছে') });
      }

      const cleanName = String(name).trim();
      const cleanId = String(identifier).trim();

      if (cleanName.length < 2 || cleanName.length > 60)
        return res.status(400).json({ error: 'Name must be 2–60 characters' });
      if (cleanId.length < 5 || cleanId.length > 80)
        return res.status(400).json({ error: 'Phone/email must be 5–80 characters' });

      // Check if identifier already taken
      if (stmts.getUserByIdentifier.get(cleanId))
        return res.status(400).json({ error: 'This email/phone is already registered' });

      // IP rate limit: max 3 new guest accounts per day per IP
      if (clientIp) {
        const ipCount = db.prepare(
          "SELECT COUNT(*) as cnt FROM users WHERE is_guest = 1 AND guest_ip = ? AND date(created_at, '+6 hours') >= date('now', '+6 hours')"
        ).get(clientIp);
        if ((ipCount?.cnt || 0) >= 3) {
          return res.status(429).json({ error: biMsg('Daily guest limit reached. Try again tomorrow.', 'আজকের গেস্ট সীমা শেষ। আগামীকাল চেষ্টা করুন।') });
        }
      }

      // Use cheapest plan for guests
      const guestPlan = db.prepare('SELECT * FROM plans ORDER BY rate ASC LIMIT 1').get();
      if (!guestPlan) return res.status(500).json({ error: 'No plans configured' });

      // Generate refer code
      const prefix = cleanName.split(' ')[0].substring(0, 3).toUpperCase();
      let newReferCode;
      let attempts = 0;
      do {
        newReferCode = prefix + Math.random().toString(36).substr(2, 4).toUpperCase();
        attempts++;
      } while (stmts.getUserByReferCode.get(newReferCode) && attempts < 20);

      const guestExpiresAt = Math.floor(Date.now() / 1000) + 900;
      const hash = bcrypt.hashSync(String(password || 'guest' + Date.now()), 10);

      const inserted = db.prepare(`
        INSERT INTO users (name, identifier, password, plan_id, balance, daily_done,
          refer_code, referred_by, avatar, is_guest, guest_device_id, guest_expires_at, guest_ip)
        VALUES (?, ?, ?, ?, 0, 0, ?, NULL, '🧑', 1, ?, ?, ?)
      `).run(cleanName, cleanId, hash, guestPlan.id, newReferCode, safeDeviceId || null, guestExpiresAt, clientIp || null);

      const newGuestUser = stmts.getUserById.get(inserted.lastInsertRowid);
      const token = issueAuthToken(newGuestUser);
      return res.json({ token, user: toClientUser(newGuestUser), plan: guestPlan });
    }

    if (!plan)
      return res.status(400).json({ error: 'All fields are required including referral code' });

    // ── Input length & format validation ────────────────────────────────────
    const cleanName = String(name).trim();
    const cleanId = String(identifier).trim();
    const cleanPass = String(password);
    if (cleanName.length < 2 || cleanName.length > 60)
      return res.status(400).json({ error: 'Name must be 2–60 characters' });
    if (cleanId.length < 5 || cleanId.length > 80)
      return res.status(400).json({ error: 'Phone/email must be 5–80 characters' });
    if (cleanPass.length < 6 || cleanPass.length > 100)
      return res.status(400).json({ error: 'Password must be 6–100 characters' });
    if (!/^[a-zA-Z0-9._@+\-]+$/.test(cleanId))
      return res.status(400).json({ error: 'Invalid phone/email format' });

    if (stmts.getUserByIdentifier.get(cleanId))
      return res.status(400).json({ error: 'This email/phone is already registered' });

    const referrer = stmts.getUserByReferCode.get(refCode);
    if (!referrer)
      return res.status(404).json({ error: 'Invalid referral code' });

    const planRow = stmts.getPlan.get(plan);
    if (!planRow)
      return res.status(400).json({ error: 'Invalid plan selected' });

    if (referrer.balance < planRow.rate)
      return res.status(400).json({ error: 'insufficient_balance', needed: planRow.rate, plan_name: planRow.name });

    const hash = bcrypt.hashSync(cleanPass, 10);

    const prefix = cleanName.split(' ')[0].substring(0, 3).toUpperCase();
    let newReferCode;
    let attempts = 0;
    do {
      newReferCode = prefix + Math.random().toString(36).substr(2, 4).toUpperCase();
      attempts++;
    } while (stmts.getUserByReferCode.get(newReferCode) && attempts < 20);

    const pending = stmts.insertPendingReg.run({
      name: cleanName, identifier: cleanId,
      password_hash: hash, plan_id: plan,
      refer_code_used: refCode, referrer_id: referrer.id,
      new_refer_code: newReferCode, plan_rate: planRow.rate,
    });
    const pendingId = pending.lastInsertRowid;

    const meta = JSON.stringify({ pending_id: pendingId, plan_name: planRow.name, amount: planRow.rate, new_user_name: name.trim() });
    stmts.insertNotifWithMeta.run(
      referrer.id,
      biMsg(
        `🔔 ${name.trim()} wants to join using your referral code (${planRow.name}). ${fmtAmt(planRow.rate, 'en')} will be deducted from your balance.`,
        `🔔 ${name.trim()} আপনার রেফারেল কোড ব্যবহার করে ${planRow.name} প্ল্যানে যোগ দিতে চাইছেন। আপনার ব্যালেন্স থেকে ${fmtAmt(planRow.rate, 'bn')} কাটা হবে।`
      ),
      'registration_request',
      meta
    );

    // Alert admins on Telegram (fire-and-forget)
    sendTelegram([
      `🔔 <b>নতুন Registration Request</b>`,
      `━━━━━━━━━━━━━━━━━━━`,
      `👤 নাম: <b>${name.trim()}</b>`,
      `📋 প্ল্যান: <b>${planRow.name}</b> (${fmtAmt(planRow.rate, 'bn')} / ${fmtAmt(planRow.rate, 'en')})`,
      `🔗 রেফারার: <b>${referrer.name}</b>`,
      `🆔 Pending ID: #${pendingId}`,
      `🕐 সময়: ${new Date().toLocaleString('bn-BD', { timeZone: 'Asia/Dhaka' })}`,
      `━━━━━━━━━━━━━━━━━━━`,
      `✅ রেফারারের নোটিফিকেশনে Approve/Decline অপশন আছে।`,
    ].join('\n')).catch(() => {});

    // Push notification to all admins
    notifyAdmins({
      title: '👤 নতুন Registration Request',
      body: `${name.trim()} — ${planRow.name} (${fmtAmt(planRow.rate, 'bn')} / ${fmtAmt(planRow.rate, 'en')})`,
      icon: '/logo.png', tag: 'admin-reg', url: '/xpc-ctrl-7f3b/',
    });

    res.status(202).json({ pending: true, pending_id: pendingId });
  } catch (err) {
    console.error('Register error:', err.message);
    res.status(500).json({ error: 'Registration failed' });
  }
});

// ── Approve pending registration ──────────────────────────────────────────────
app.post('/api/registration/:id/approve', authRequired, requirePendingReferrerOrAdmin, (req, res) => {
  try {
    const pendingId = Number(req.params.id);
    const pending = req.pendingRegistration;

    const referrer = stmts.getUserById.get(pending.referrer_id);
    if (!referrer || referrer.balance < pending.plan_rate)
      return res.status(400).json({ error: 'insufficient_balance' });

    const planRow = stmts.getPlan.get(pending.plan_id);

    const approveTx = db.transaction(() => {
      // Re-check inside transaction to prevent double-approval race condition
      const freshPending = stmts.getPendingReg.get(pendingId);
      if (!freshPending || freshPending.status !== 'pending')
        return { alreadyProcessed: true };

      // ── 1. Deduct plan cost from direct referrer ──────────────────────────
      const deducted = stmts.deductBalance.run(pending.plan_rate, referrer.id, pending.plan_rate);
      if (deducted.changes === 0) throw new Error('Balance deduction failed');

      // Record spend activity for direct referrer
      stmts.insertReferralActivity.run({
        user_id: referrer.id, type: 'spend', level: 0,
        amount: pending.plan_rate,
        description: `${pending.name}-এর জন্য ${planRow ? planRow.name : ''} প্ল্যান ক্রয়`,
        related_user_name: pending.name,
      });
      stmts.insertBalanceLog.run({
        user_id: referrer.id, type: 'referral_spend', amount: -pending.plan_rate,
        note: `${pending.name}-এর জন্য ${planRow ? planRow.name : ''} প্ল্যান ক্রয়`,
      });

      // ── 2. Create the new user ────────────────────────────────────────────
      const result = stmts.insertUser.run({
        name: pending.name, identifier: pending.identifier,
        password: pending.password_hash, plan_id: pending.plan_id,
        balance: 0, daily_done: 0,
        refer_code: pending.new_refer_code, referred_by: pending.refer_code_used, avatar: '🧑',
      });

      stmts.updatePendingStatus.run('approved', pendingId);

      // ── 3. Walk referral chain and credit bonuses (up to 3 levels) ────────
      const bonusLevels = planRow ? [planRow.l1, planRow.l2, planRow.l3] : [20, 4, 1];
      let currentUser = referrer;
      for (let lvl = 1; lvl <= 3; lvl++) {
        const pct = bonusLevels[lvl - 1];
        const bonus = Math.floor(pending.plan_rate * pct / 100);
        if (bonus > 0 && currentUser && !currentUser.is_guest) {
          stmts.creditBalance.run(bonus, currentUser.id);
          const logType = lvl === 1 ? 'referral_bonus' : 'team_bonus';
          stmts.insertReferralActivity.run({
            user_id: currentUser.id, type: 'bonus', level: lvl,
            amount: bonus,
            description: `${pending.name}-এর নিবন্ধন থেকে L${lvl} বোনাস (${pct}%)`,
            related_user_name: pending.name,
          });
          stmts.insertBalanceLog.run({
            user_id: currentUser.id, type: logType, amount: bonus,
            note: biMsg(
              `L${lvl} commission +${fmtAmt(bonus, 'en')} from ${pending.name}'s registration (${pct}%)`,
              `${pending.name}-এর নিবন্ধন থেকে L${lvl} কমিশন +${fmtAmt(bonus, 'bn')} (${pct}%)`
            ),
          });
          stmts.insertNotification.run(
            currentUser.id,
            biMsg(
              `🎁 Referral Bonus: L${lvl} commission +${fmtAmt(bonus, 'en')} from ${pending.name}'s registration added to your balance.`,
              `🎁 রেফারেল বোনাস: ${pending.name}-এর নিবন্ধন থেকে L${lvl} কমিশন +${fmtAmt(bonus, 'bn')} আপনার ব্যালেন্সে যোগ হয়েছে।`
            ),
            'success'
          );
        }
        // Move up the chain
        if (!currentUser.referred_by) break;
        currentUser = stmts.getUserByReferCode.get(currentUser.referred_by);
        if (!currentUser) break;
      }

      // ── 4. Notify direct referrer of approval ────────────────────────────
      stmts.insertNotification.run(
        referrer.id,
        biMsg(
          `✅ You approved ${pending.name}'s registration. ${fmtAmt(pending.plan_rate, 'en')} was deducted from your balance.`,
          `✅ আপনি ${pending.name}-এর নিবন্ধন অনুমোদন করেছেন। আপনার ব্যালেন্স থেকে ${fmtAmt(pending.plan_rate, 'bn')} কাটা হয়েছে।`
        ),
        'success'
      );

      return stmts.getUserById.get(referrer.id);
    });

    const newUser = approveTx();
    if (newUser?.alreadyProcessed)
      return res.status(409).json({ error: 'Already processed' });
    res.json({ ok: true, user: toClientUser(newUser), plan: planRow, token: issueAuthToken(newUser) });
  } catch (err) {
    console.error('Approve error:', err.message);
    res.status(500).json({ error: 'Approval failed' });
  }
});

// ── Decline pending registration ──────────────────────────────────────────────
app.post('/api/registration/:id/decline', authRequired, requirePendingReferrerOrAdmin, (req, res) => {
  try {
    const pendingId = Number(req.params.id);
    stmts.updatePendingStatus.run('declined', pendingId);
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: 'Failed' });
  }
});

// ── Check pending registration status ────────────────────────────────────────
app.get('/api/registration/:id/status', (req, res) => {
  try {
    const pending = stmts.getPendingReg.get(Number(req.params.id));
    if (!pending) return res.status(404).json({ error: 'Not found' });
    res.json({ status: pending.status });
  } catch (err) {
    res.status(500).json({ error: 'Failed' });
  }
});

// ── Login ────────────────────────────────────────────────────────────────────
app.post('/api/login', loginLimiter, async (req, res) => {
  try {
    const { identifier, password } = req.body || {};
    if (!identifier || !password) {
      return res.status(400).json({ error: 'Email/phone and password are required' });
    }

    const user = stmts.getUserByIdentifier.get(identifier.trim());
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    if (!bcrypt.compareSync(password, user.password)) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Check if user is banned
    if (user.banned) {
      return res.status(403).json({ error: 'Your account has been suspended' });
    }

    const plan = stmts.getPlan.get(user.plan_id);

    // Capture login info with device fingerprint
    const ip = req.headers['x-forwarded-for']?.split(',')[0]?.trim() || req.ip || 'unknown';
    const userAgent = req.headers['user-agent'] || 'unknown';
    const deviceId = req.headers['x-device-id'] || req.body.deviceId || '';

    const parsedDevice = parseDeviceName(userAgent);
    const logResult = stmts.insertLoginLogFull.run({
      user_id: user.id, ip, user_agent: userAgent, city: '', country: '', device_id: String(deviceId), device_name: parsedDevice,
    });
    const logId = logResult.lastInsertRowid;

    // Check if this is a new device (not seen in previous 5 logins)
    const recentLogs = db.prepare(
      'SELECT DISTINCT device_name FROM login_logs WHERE user_id = ? AND id < ? ORDER BY id DESC LIMIT 10'
    ).all(user.id, logId);
    const knownDevices = new Set(recentLogs.map(l => l.device_name));
    const isNewDevice = !knownDevices.has(parsedDevice);

    // Async geolocation + new device push (fire-and-forget, never blocks response)
    const cleanIp = (ip === '::1' || ip === '127.0.0.1' || ip === '::ffff:127.0.0.1') ? '' : ip;
    (async () => {
      let geoCity = '', geoCountry = '';
      if (cleanIp) {
        try {
          const geo = await fetch(`http://ip-api.com/json/${cleanIp}?fields=city,country`).then(r => r.json());
          geoCity = geo.city || '';
          geoCountry = geo.country || '';
          if (geoCity || geoCountry) stmts.updateLoginLogGeo.run(geoCity, geoCountry, logId);
        } catch (_) {}
      }
      if (isNewDevice) {
        const loc = [geoCity, geoCountry].filter(Boolean).join(', ') || ip;
        sendPush(user.id, {
          title: '🔐 নতুন ডিভাইসে লগইন',
          body: `${parsedDevice} থেকে লগইন হয়েছে${loc ? ` (${loc})` : ''}। আপনি না হলে পাসওয়ার্ড পরিবর্তন করুন।`,
          icon: '/logo.png',
          url: '/settings',
          tag: 'new-device-login',
        });
      }
    })();

    res.json({ user: toClientUser(user), plan, token: issueAuthToken(user) });
  } catch (err) {
    console.error('Login error:', err.message);
    res.status(500).json({ error: 'Login failed' });
  }
});

app.get('/api/me', authRequired, (req, res) => {
  try {
    const user = stmts.getUserById.get(req.auth.userId);
    if (!user) return res.status(404).json({ error: 'User not found' });
    const plan = stmts.getPlan.get(user.plan_id);
    res.json({ user: toClientUser(user), plan });
  } catch (err) {
    console.error('GET /api/me error:', err.message);
    res.status(500).json({ error: 'Failed to fetch profile' });
  }
});

// ── Plan update guard — REJECT all plan changes ─────────────────────────────
app.put('/api/users/:id/plan', (_req, res) => {
  res.status(403).json({ error: 'Plan cannot be changed after registration' });
});
app.patch('/api/users/:id/plan', (_req, res) => {
  res.status(403).json({ error: 'Plan cannot be changed after registration' });
});

// ── Admin-only login (stricter rate limit) ───────────────────────────────────
app.post('/api/admin/login', adminLoginLimiter, async (req, res) => {
  try {
    const { identifier, password } = req.body || {};
    if (!identifier || !password) {
      return res.status(400).json({ error: 'Credentials required' });
    }
    const user = stmts.getUserByIdentifier.get(identifier.trim());
    if (!user || !user.is_admin) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    if (!bcrypt.compareSync(password, user.password)) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    if (user.banned) {
      return res.status(403).json({ error: 'Account suspended' });
    }
    const token = issueAuthToken(user);
    try {
      const ip = req.headers['x-forwarded-for']?.split(',')[0]?.trim() || req.ip || '';
      stmts.insertAdminLog.run({ admin_id: user.id, action: 'admin_login', target_type: 'user', target_id: user.id, details: 'Admin panel login', ip });
    } catch (_) {}
    res.json({ token, user: toClientUser(user) });
  } catch (err) {
    res.status(500).json({ error: 'Login failed' });
  }
});

// ══════════════════════════════════════════════════════════════════════════════
// MANUFACTURING / WORK ENDPOINTS
// ══════════════════════════════════════════════════════════════════════════════

// Helper: auto-reset daily count if new day
function ensureDailyReset(userId) {
  const today = todayDate();
  stmts.resetDaily.run(today, userId, today);
}

// ── GET work status ──────────────────────────────────────────────────────────
app.get('/api/user/:id/work-status', authRequired, requireSelfOrAdmin('id'), (req, res) => {
  try {
    const userId = Number(req.params.id);
    ensureDailyReset(userId);
    const dailyDone = syncDailyDoneWithCompletedJobs(userId);
    const user = stmts.getUserById.get(userId);
    if (!user) return res.status(404).json({ error: 'User not found' });
    const plan = stmts.getPlan.get(user.plan_id);
    const GUEST_CAP = 5;
    const dailyLimit = user.is_guest ? GUEST_CAP : plan.daily;
    const activeJob = stmts.getProcessingJobByUser.get(userId) || null;
    const wtEnabled = getSettingStr('work_time_enabled', '0') === '1';
    const wtStart   = getSettingStr('work_time_start', '09:00');
    const wtEnd     = getSettingStr('work_time_end', '22:00');
    res.json({
      dailyDone,
      dailyLimit,
      canWork:          dailyDone < dailyLimit,
      perTask:          plan.per_task,
      activeJob,
      workTimeEnabled:  wtEnabled,
      workTimeStart:    wtStart,
      workTimeEnd:      wtEnd,
      isWorkOpen:       isWorkTimeOpen(),
    });
  } catch (err) {
    console.error('Work status error:', err.message);
    res.status(500).json({ error: 'Failed to get work status' });
  }
});

// ── Start manufacturing ──────────────────────────────────────────────────────
const startManufactureTx = db.transaction((body) => {
  const { userId, deviceName, brand, ram, rom, color } = body;

  if (!userId || !deviceName || !brand || !ram || !rom || !color) {
    return { status: 400, body: { error: 'All device configuration fields are required' } };
  }

  ensureDailyReset(userId);
  syncDailyDoneWithCompletedJobs(userId);
  const user = stmts.getUserById.get(userId);
  if (!user) return { status: 404, body: { error: 'User not found' } };
  if (user.banned) return { status: 403, body: { error: 'Account suspended' } };

  const GUEST_CAP = 5;
  const existingJob = stmts.getProcessingJobByUser.get(userId);
  if (existingJob) {
    const resumePlan = stmts.getPlan.get(user.plan_id);
    return {
      status: 200,
      body: {
        job: existingJob,
        resumed: true,
        dailyDone: user.daily_done,
        dailyLimit: user.is_guest ? GUEST_CAP : resumePlan.daily,
      },
    };
  }

  const plan = stmts.getPlan.get(user.plan_id);
  const guestDailyLimit = user.is_guest ? GUEST_CAP : plan.daily;
  if (user.daily_done >= guestDailyLimit) {
    if (user.is_guest) {
      return { status: 400, body: { error: 'guest_task_limit', message: biMsg('Guest trial limit reached (5 tasks). Register a real account to continue.', 'গেস্ট ট্রায়াল লিমিট পৌঁছে গেছে (৫টি টাস্ক)। চালিয়ে যেতে একটি আসল অ্যাকাউন্ট খুলুন।') } };
    }
    return { status: 400, body: { error: 'Daily task limit reached. Upgrade your plan to continue.' } };
  }

  const result = stmts.insertJob.run({
    user_id: userId, device_name: deviceName,
    brand, ram, rom, color,
  });

  const job = stmts.getJobById.get(result.lastInsertRowid);
  const updatedUser = stmts.getUserById.get(userId);

  return {
    status: 201,
    body: {
      job,
      dailyDone:  updatedUser.daily_done,
      dailyLimit: user.is_guest ? GUEST_CAP : plan.daily,
    },
  };
});

app.post('/api/manufacture/start', authRequired, manufactureLimiter, (req, res) => {
  try {
    // Block new task starts outside work hours (allow resume of existing job)
    if (!isWorkTimeOpen()) {
      const existingJob = stmts.getProcessingJobByUser.get(req.auth.userId);
      if (!existingJob) {
        return res.status(403).json({
          error: 'work_time_closed',
          workTimeStart: getSettingStr('work_time_start', '09:00'),
          workTimeEnd:   getSettingStr('work_time_end', '22:00'),
        });
      }
    }
    const result = startManufactureTx({ ...(req.body || {}), userId: req.auth.userId });
    res.status(result.status).json(result.body);
  } catch (err) {
    console.error('Manufacture start error:', err.message);
    res.status(500).json({ error: 'Failed to start manufacturing' });
  }
});

// ── Complete manufacturing ───────────────────────────────────────────────────
const completeManufactureTx = db.transaction((body) => {
  const { userId, jobId } = body;
  if (!userId || !jobId) {
    return { status: 400, body: { error: 'userId and jobId are required' } };
  }

  const job = stmts.getJobById.get(jobId);
  if (!job || job.user_id !== userId) {
    return { status: 404, body: { error: 'Manufacturing job not found' } };
  }
  if (job.status !== 'processing') {
    return { status: 400, body: { error: 'Job already completed' } };
  }

  const user = stmts.getUserById.get(userId);
  const plan = stmts.getPlan.get(user.plan_id);
  const earned = plan.per_task;

  // ── Guest task-cap guard at complete ─────────────────────────────────────
  if (user.is_guest) {
    const GUEST_CAP = 5;
    const alreadyDone = stmts.getCompletedJobCountToday.get(userId)?.count || 0;
    if (alreadyDone >= GUEST_CAP) {
      return { status: 400, body: { error: 'guest_task_limit', message: biMsg('Guest trial limit reached (5 tasks). Register a real account to continue.', 'গেস্ট ট্রায়াল লিমিট পৌঁছে গেছে (৫টি টাস্ক)। চালিয়ে যেতে একটি আসল অ্যাকাউন্ট খুলুন।') } };
    }
  }

  // ── SERVER-SIDE TIME ENFORCEMENT: ensure task_time has elapsed ──────────
  const requiredMs = (plan.task_time || 2) * 60 * 1000;
  const jobCreatedAt = new Date(job.created_at + 'Z').getTime();
  const elapsed = Date.now() - jobCreatedAt;
  if (elapsed < requiredMs) {
    const remainingSec = Math.ceil((requiredMs - elapsed) / 1000);
    return {
      status: 400,
      body: {
        error: 'Manufacturing still in progress',
        remainingSeconds: remainingSec,
      },
    };
  }

  // Complete the job
  const updated = stmts.completeJob.run('completed', earned, jobId, userId, 'processing');
  if (updated.changes === 0) {
    return { status: 400, body: { error: 'Failed to complete job' } };
  }

  const completedToday = stmts.getCompletedJobCountToday.get(userId)?.count || 0;
  stmts.setDailyDone.run(completedToday, userId);

  // Credit user balance (skip for guest accounts)
  const isGuestUser = !!user.is_guest;
  if (!isGuestUser) {
    stmts.creditBalance.run(earned, userId);
    stmts.insertBalanceLog.run({
      user_id: userId, type: 'daily_earn', amount: earned,
      note: biMsg(`${job.device_name} manufacturing complete`, `${job.device_name} উৎপাদন সম্পন্ন`),
    });
  }

  // Auto-post to marketplace with random price in USD (capped at $10)
  const marketPrice = Math.floor(Math.random() * 10) + 1;
  const specs = `${job.ram} · ${job.rom} · ${job.color}`;
  const marketResult = stmts.insertMarketItem.run({
    user_id: userId, job_id: jobId,
    device_name: job.device_name, brand: job.brand,
    specs, price: marketPrice,
  });

  // Create notification
  stmts.insertNotification.run(
    userId,
    `Your ${job.device_name} has been manufactured and posted to Marketplace for $${marketPrice}!`,
    'success'
  );

  const completedJob = stmts.getJobById.get(jobId);
  const updatedUser = stmts.getUserById.get(userId);

  const GUEST_CAP = 5;
  const guestHitCap = isGuestUser && completedToday >= GUEST_CAP;

  return {
    status: 200,
    body: {
      job: completedJob,
      marketplaceItemId: marketResult.lastInsertRowid,
      marketPrice,
      earned: isGuestUser ? 0 : earned,
      newBalance:  updatedUser.balance,
      dailyDone:   updatedUser.daily_done,
      dailyLimit:  isGuestUser ? GUEST_CAP : plan.daily,
      guest_blocked: isGuestUser,
      guest_task_limit: guestHitCap,
    },
  };
});

app.post('/api/manufacture/complete', authRequired, manufactureLimiter, (req, res) => {
  try {
    const result = completeManufactureTx({ ...(req.body || {}), userId: req.auth.userId });
    res.status(result.status).json(result.body);
  } catch (err) {
    console.error('Manufacture complete error:', err.message);
    res.status(500).json({ error: 'Failed to complete manufacturing' });
  }
});

// ── User's marketplace items ─────────────────────────────────────────────────
app.get('/api/user/:id/marketplace', authRequired, requireSelfOrAdmin('id'), (req, res) => {
  try {
    const userId = Number(req.params.id);
    const items = stmts.getUserMarketItems.all(userId);
    res.json({ items });
  } catch (err) {
    console.error('Marketplace fetch error:', err.message);
    res.status(500).json({ error: 'Failed to fetch marketplace items' });
  }
});

// ── All marketplace items (public listing) ────────────────────────────────────
app.get('/api/marketplace/all', authRequired, (req, res) => {
  try {
    const items = db.prepare(`
      SELECT m.*, u.name as seller_name
      FROM marketplace_items m
      LEFT JOIN users u ON u.id = m.user_id
      ORDER BY m.id DESC LIMIT 200
    `).all();
    res.json({ items });
  } catch (err) {
    console.error('All marketplace fetch error:', err.message);
    res.status(500).json({ error: 'Failed to fetch marketplace items' });
  }
});

// ── User's notifications ─────────────────────────────────────────────────────
app.get('/api/user/:id/notifications', authRequired, requireSelfOrAdmin('id'), (req, res) => {
  try {
    const userId = Number(req.params.id);
    const notifications = stmts.getNotifications.all(userId);
    res.json({ notifications });
  } catch (err) {
    console.error('Notifications fetch error:', err.message);
    res.status(500).json({ error: 'Failed to fetch notifications' });
  }
});

// ── Mark notification(s) read ────────────────────────────────────────────────
app.patch('/api/user/:id/notifications/:notifId/read', authRequired, requireSelfOrAdmin('id'), (req, res) => {
  try {
    const userId  = Number(req.params.id);
    const notifId = Number(req.params.notifId);
    stmts.markNotifRead.run(notifId, userId);
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: 'Failed to mark as read' });
  }
});

app.patch('/api/user/:id/notifications/read-all', authRequired, requireSelfOrAdmin('id'), (req, res) => {
  try {
    const userId = Number(req.params.id);
    stmts.markAllNotifsRead.run(userId);
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: 'Failed to mark all as read' });
  }
});

// ── Upload / update user avatar image ────────────────────────────────────────
app.patch('/api/user/:id/avatar-img', authRequired, requireSelfOrAdmin('id'), (req, res) => {
  try {
    const userId = Number(req.params.id);
    const { img } = req.body || {};
    if (!img) return res.status(400).json({ error: 'No image provided' });
    // Accept base64 data URLs up to ~2MB
    if (img.length > 3_500_000) return res.status(400).json({ error: 'Image too large (max 2MB)' });
    stmts.updateAvatarImg.run(img, userId);
    res.json({ ok: true, avatar_img: img });
  } catch (err) {
    console.error('Avatar update error:', err.message);
    res.status(500).json({ error: 'Failed to update avatar' });
  }
});

// ── User's balance log (unified) ─────────────────────────────────────────────
app.get('/api/user/:id/balance-log', authRequired, requireSelfOrAdmin('id'), (req, res) => {
  try {
    const userId = Number(req.params.id);
    const log     = stmts.getBalanceLog.all(userId);
    const summary = stmts.getBalanceSummary.get(userId);
    const user    = stmts.getUserById.get(userId);
    res.json({ log, summary, balance: user ? user.balance : 0 });
  } catch (err) {
    console.error('Balance log error:', err.message);
    res.status(500).json({ error: 'Failed to fetch balance log' });
  }
});

// ── User's referral activity ─────────────────────────────────────────────────
app.get('/api/user/:id/referral-activity', authRequired, requireSelfOrAdmin('id'), (req, res) => {
  try {
    const userId  = Number(req.params.id);
    const userRow = stmts.getUserById.get(userId);
    if (!userRow) return res.status(404).json({ error: 'User not found' });
    const activity = stmts.getReferralActivity.all(userId);
    const stats    = stmts.getReferralStats.get(userId);
    const members  = stmts.getReferralMemberCounts.get(
      userRow.refer_code, userRow.refer_code, userRow.refer_code
    );
    const tree = stmts.getReferralTreeMembers.all(userRow.refer_code);
    res.json({ activity, stats, members, tree });
  } catch (err) {
    console.error('Referral activity error:', err.message);
    res.status(500).json({ error: 'Failed to fetch referral activity' });
  }
});

// ── Work country access check ─────────────────────────────────────────────────
app.get('/api/work/access', authRequired, async (req, res) => {
  try {
    const rows = stmts.getAllSettings.all();
    const settings = {};
    rows.forEach(r => { settings[r.key] = r.value; });
    const blockedList = (settings.work_blocked_countries || '').trim();

    if (!blockedList) return res.json({ blocked: false, country: '' });

    // Detect user country from IP
    const rawIp = req.headers['x-forwarded-for'] || req.socket?.remoteAddress || '';
    const ip    = rawIp.split(',')[0].trim().replace(/^::ffff:/, '');
    const isLocal = !ip || ip === '127.0.0.1' || ip.startsWith('192.168.') || ip.startsWith('10.');
    if (isLocal) return res.json({ blocked: false, country: 'LOCAL' });

    try {
      const geoResp = await fetch(`http://ip-api.com/json/${ip}?fields=countryCode`);
      const geo     = await geoResp.json();
      const code    = (geo.countryCode || '').toUpperCase();
      const blocked = blockedList.toUpperCase().split(',').map(c => c.trim()).includes(code);
      return res.json({ blocked, country: code });
    } catch (_) {
      return res.json({ blocked: false, country: '' });
    }
  } catch (err) {
    console.error('Work access check error:', err.message);
    res.json({ blocked: false });
  }
});

// ── Team members (referred users) list ───────────────────────────────────────
app.get('/api/user/:id/team-members', authRequired, requireSelfOrAdmin('id'), (req, res) => {
  try {
    const userId  = Number(req.params.id);
    const userRow = stmts.getUserById.get(userId);
    if (!userRow) return res.status(404).json({ error: 'User not found' });
    const tree = stmts.getReferralTreeMembers.all(userRow.refer_code);
    const members = tree.map(m => ({
      id: m.id, name: m.name,
      plan: m.plan, avatar: m.avatar, avatar_img: m.avatar_img,
      earnings: m.earnings, referrals: [],
    }));
    res.json({ members });
  } catch (err) {
    console.error('Team members error:', err.message);
    res.status(500).json({ error: 'Failed to fetch team members' });
  }
});

// ── Public plans listing ─────────────────────────────────────────────────────
app.get('/api/plans', (req, res) => {
  try {
    const plans = db.prepare('SELECT id, name, price_display, rate, per_task, daily_earn, daily, color FROM plans ORDER BY rate ASC').all();
    res.json({ plans });
  } catch (e) {
    res.status(500).json({ error: 'Failed to fetch plans' });
  }
});

app.get('/api/app-settings', (req, res) => {
  try {
    const rows = stmts.getAllSettings.all();
    const info = {};
    rows.forEach(r => { info[r.key] = r.value; });
    res.json({
      maintenance_mode:     info.maintenance_mode     || 'false',
      announcement_banner:  info.announcement_banner  || '',
      crypto_enabled:       info.crypto_enabled !== 'false' ? 'true' : 'false',
    });
  } catch (e) {
    res.json({ maintenance_mode: 'false', announcement_banner: '', crypto_enabled: 'true' });
  }
});

// ── Deposit payment info (public) ────────────────────────────────────────────
app.get('/api/deposit-info', (req, res) => {
  try {
    const rows = stmts.getAllSettings.all();
    const info = {};
    rows.forEach(r => { info[r.key] = r.value; });
    const wallets = [];
    for (let i = 1; i <= 10; i++) {
      const w = info[`deposit_wallet_${i}`] || '';
      if (w.trim()) wallets.push(w.trim());
    }
    res.json({
      bkash:  info.deposit_bkash  || '',
      nagad:  info.deposit_nagad  || '',
      rocket: info.deposit_rocket || '',
      bank:   info.deposit_bank   || '',
      crypto_eth_usdt:      info.crypto_eth_usdt      || '',
      crypto_eth_usdc:      info.crypto_eth_usdc      || '',
      crypto_op_usdt:       info.crypto_op_usdt       || '',
      crypto_op_usdc:       info.crypto_op_usdc       || '',
      crypto_base_usdt:     info.crypto_base_usdt     || '',
      crypto_base_usdc:     info.crypto_base_usdc     || '',
      crypto_polygon_usdt:  info.crypto_polygon_usdt  || '',
      crypto_polygon_usdc:  info.crypto_polygon_usdc  || '',
      crypto_arbitrum_usdt: info.crypto_arbitrum_usdt || '',
      crypto_arbitrum_usdc: info.crypto_arbitrum_usdc || '',
      deposit_wallets: wallets,
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch deposit info' });
  }
});

// ── Rotating deposit wallet address ───────────────────────────────────────────
app.get('/api/deposit/next-wallet', (req, res) => {
  try {
    const rows = stmts.getAllSettings.all();
    const info = {};
    rows.forEach(r => { info[r.key] = r.value; });
    const wallets = [];
    for (let i = 1; i <= 10; i++) {
      const w = info[`deposit_wallet_${i}`] || '';
      if (w.trim()) wallets.push(w.trim());
    }
    if (!wallets.length) return res.json({ wallet: '', index: 0, total: 0 });
    const currentIdx = parseInt(info.wallet_rotation_index || '0', 10);
    const nextIdx = (currentIdx + 1) % wallets.length;
    stmts.setSetting.run('wallet_rotation_index', String(nextIdx));
    res.json({ wallet: wallets[currentIdx], index: currentIdx, total: wallets.length });
  } catch (err) {
    res.status(500).json({ error: 'Failed to get wallet' });
  }
});

// ── Admin settings ────────────────────────────────────────────────────────────
app.get('/api/admin/settings', authRequired, (req, res) => {
  if (!requireAdmin(req, res)) return;
  if (!req.auth.isMainAdmin) {
    const p = getSubAdminPerms(req.auth.userId);
    if (!p.change_settings && !p.modify_payment_numbers && !p.modify_wallet_addresses && !p.require_proof) {
      return res.status(403).json({ error: biMsg('You do not have permission to view settings.','সেটিংস দেখার অনুমতি আপনার নেই।') });
    }
  }
  try {
    const rows = stmts.getAllSettings.all();
    const settings = {};
    rows.forEach(r => { settings[r.key] = r.value; });
    res.json({ settings });
  } catch (err) { res.status(500).json({ error: 'Failed' }); }
});

app.post('/api/admin/settings', authRequired, (req, res) => {
  if (!requireAdmin(req, res)) return;
  if (!req.auth.isMainAdmin) {
    const p = getSubAdminPerms(req.auth.userId);
    const body2 = req.body || {};
    const keys = body2.settings ? Object.keys(body2.settings) : ([body2.key].filter(Boolean));
    for (const k of keys) {
      if (PAYMENT_NUM_KEYS.has(k)  && !p.modify_payment_numbers) return res.status(403).json({ error: biMsg('No permission to modify payment numbers.','পেমেন্ট নম্বর পরিবর্তনের অনুমতি নেই।') });
      if (WALLET_ADDR_KEYS.has(k)  && !p.modify_wallet_addresses) return res.status(403).json({ error: biMsg('No permission to modify wallet addresses.','ওয়ালেট ঠিকানা পরিবর্তনের অনুমতি নেই।') });
      if (REQUIRE_PROOF_KEY.has(k) && !p.require_proof)            return res.status(403).json({ error: biMsg('No permission to change withdrawal proof setting.','উইথড্র প্রুফ সেটিং পরিবর্তনের অনুমতি নেই।') });
      if (!PAYMENT_NUM_KEYS.has(k) && !WALLET_ADDR_KEYS.has(k) && !REQUIRE_PROOF_KEY.has(k) && !p.change_settings)
        return res.status(403).json({ error: biMsg('No permission to change general settings.','সাধারণ সেটিংস পরিবর্তনের অনুমতি নেই।') });
    }
  }
  try {
    const body = req.body || {};
    // Batch update: { settings: { key: value, ... } }
    if (body.settings && typeof body.settings === 'object') {
      for (const [k, v] of Object.entries(body.settings)) {
        stmts.setSetting.run(k, v ?? '');
      }
      return res.json({ ok: true });
    }
    // Single update: { key, value }
    const { key, value } = body;
    if (!key) return res.status(400).json({ error: 'key required' });
    stmts.setSetting.run(key, value ?? '');
    res.json({ ok: true });
  } catch (err) { res.status(500).json({ error: 'Failed' }); }
});

// ── Dedicated guest-mode toggle ───────────────────────────────────────────────
app.get('/api/admin/settings/guest-mode', authRequired, (req, res) => {
  if (!requireAdmin(req, res)) return;
  try {
    const enabled = getSettingStr('guest_mode_enabled', '1') === '1';
    res.json({ guest_mode_enabled: enabled });
  } catch (err) { res.status(500).json({ error: 'Failed' }); }
});

app.put('/api/admin/settings/guest-mode', authRequired, (req, res) => {
  if (!requireAdmin(req, res)) return;
  if (!req.auth.isMainAdmin) {
    const p = getSubAdminPerms(req.auth.userId);
    if (!p.change_settings) return res.status(403).json({ error: biMsg('No permission to change general settings.','সাধারণ সেটিংস পরিবর্তনের অনুমতি নেই।') });
  }
  try {
    const { enabled } = req.body || {};
    if (typeof enabled !== 'boolean') return res.status(400).json({ error: 'enabled (boolean) required' });
    stmts.setSetting.run('guest_mode_enabled', enabled ? '1' : '0');
    res.json({ ok: true, guest_mode_enabled: enabled });
  } catch (err) { res.status(500).json({ error: 'Failed' }); }
});

// ── Change password ──────────────────────────────────────────────────────────
app.patch('/api/user/:id/change-password', authRequired, passwordLimiter, requireSelfOrAdmin('id'), async (req, res) => {
  try {
    const userId = Number(req.params.id);
    const { currentPassword, newPassword } = req.body || {};
    if (!currentPassword || !newPassword)
      return res.status(400).json({ error: 'Both passwords are required' });
    if (newPassword.length < 6)
      return res.status(400).json({ error: 'New password must be at least 6 characters' });

    const user = stmts.getUserById.get(userId);
    if (!user) return res.status(404).json({ error: 'User not found' });
    if (!bcrypt.compareSync(currentPassword, user.password))
      return res.status(401).json({ error: 'Current password is incorrect' });

    const newHash = bcrypt.hashSync(newPassword, 10);
    db.prepare('UPDATE users SET password = ? WHERE id = ?').run(newHash, userId);
    res.json({ ok: true });
  } catch (err) {
    console.error('Change password error:', err.message);
    res.status(500).json({ error: 'Failed to change password' });
  }
});

// ── Update emoji avatar ──────────────────────────────────────────────────────
app.patch('/api/user/:id/avatar', authRequired, requireSelfOrAdmin('id'), (req, res) => {
  try {
    const userId = Number(req.params.id);
    const { avatar } = req.body || {};
    if (!avatar) return res.status(400).json({ error: 'Avatar required' });
    db.prepare('UPDATE users SET avatar = ? WHERE id = ?').run(String(avatar), userId);
    res.json({ ok: true, avatar });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update avatar' });
  }
});

// ── User language preference ──────────────────────────────────────────────────
app.patch('/api/user/:id/lang', authRequired, requireSelfOrAdmin('id'), (req, res) => {
  try {
    const userId = Number(req.params.id);
    const { lang } = req.body || {};
    if (!['en', 'bn'].includes(lang)) return res.status(400).json({ error: 'Invalid language' });
    db.prepare("UPDATE users SET lang = ? WHERE id = ?").run(lang, userId);
    res.json({ ok: true, lang });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update language' });
  }
});

// ── User's transactions ──────────────────────────────────────────────────────
app.get('/api/user/:id/transactions', authRequired, requireSelfOrAdmin('id'), (req, res) => {
  try {
    const userId = Number(req.params.id);
    const transactions = stmts.getUserTransactions.all(userId);
    res.json({ transactions });
  } catch (err) {
    console.error('Transactions fetch error:', err.message);
    res.status(500).json({ error: 'Failed to fetch transactions' });
  }
});

// ══════════════════════════════════════════════════════════════════════════════
// EXISTING ENDPOINTS
// ══════════════════════════════════════════════════════════════════════════════

// ── Withdraw / Deposit request (DB-tracked) ─────────────────────────────────
app.post('/api/withdraw', authRequired, financeLimiter, async (req, res) => {
  const { amount, method, account, type, blockchain, token, txnHash, screenshot, coinType } = req.body || {};

  if (!amount || !method || !account || !type) {
    return res.status(400).json({ error: 'Missing fields' });
  }
  if (!['withdraw', 'deposit'].includes(type)) {
    return res.status(400).json({ error: 'Invalid type' });
  }
  const numAmount = Math.round(Number(amount) * 100) / 100;
  if (isNaN(numAmount) || numAmount <= 0 || numAmount > 10_000_000) {
    return res.status(400).json({ error: 'Invalid amount' });
  }
  if (String(method).length > 50 || String(account).length > 200) {
    return res.status(400).json({ error: 'Invalid request' });
  }

  // ── Min/max limits from settings ────────────────────────────────────────
  if (type === 'withdraw') {
    const minWd = getSettingNum('min_withdraw', 0);
    const maxWd = getSettingNum('max_withdraw', 0);
    if (minWd > 0 && numAmount < minWd)
      return res.status(400).json({ error: biMsg(`Minimum withdrawal is ${fmtAmt(minWd, 'en')}`, `সর্বনিম্ন উইথড্র পরিমাণ ${fmtAmt(minWd, 'bn')}`) });
    if (maxWd > 0 && numAmount > maxWd)
      return res.status(400).json({ error: biMsg(`Maximum withdrawal is ${fmtAmt(maxWd, 'en')}`, `সর্বোচ্চ উইথড্র পরিমাণ ${fmtAmt(maxWd, 'bn')}`) });
  }
  if (type === 'deposit') {
    const minDep = getSettingNum('min_deposit', 0);
    const maxDep = getSettingNum('max_deposit', 0);
    if (minDep > 0 && numAmount < minDep)
      return res.status(400).json({ error: biMsg(`Minimum deposit is ${fmtAmt(minDep, 'en')}`, `সর্বনিম্ন ডিপোজিট পরিমাণ ${fmtAmt(minDep, 'bn')}`) });
    if (maxDep > 0 && numAmount > maxDep)
      return res.status(400).json({ error: biMsg(`Maximum deposit is ${fmtAmt(maxDep, 'en')}`, `সর্বোচ্চ ডিপোজিট পরিমাণ ${fmtAmt(maxDep, 'bn')}`) });
  }

  const isCrypto = method === 'crypto';
  const safeBlockchain = String(blockchain || '');
  const safeToken = String(token || '');
  const safeTxnHash = String(txnHash || account || '');
  const safeScreenshot = screenshot ? String(screenshot).substring(0, 2000000) : null;

  try {
    const result = db.transaction(() => {
      const userRow = stmts.getUserById.get(req.auth.userId);
      if (!userRow) return { status: 404, body: { error: 'User not found' } };
      if (userRow.banned) return { status: 403, body: { error: 'Account suspended' } };

      // ── Guest: block withdrawals ──
      if (userRow.is_guest && type === 'withdraw') {
        return { status: 403, body: { error: 'guest_mode', message: biMsg('Guest accounts cannot withdraw. Register a real account to earn and withdraw real money.', 'গেস্ট অ্যাকাউন্ট দিয়ে উইথড্র করা যাবে না। আসল টাকা আয় করতে একটি অ্যাকাউন্ট খুলুন।') } };
      }

      // ── Deposit: duplicate TxID prevention ──
      if (type === 'deposit' && safeTxnHash) {
        const existing = stmts.getTransactionByTxnHash.get(safeTxnHash);
        if (existing) {
          return { status: 400, body: { error: 'This Transaction ID has already been used' } };
        }
      }

      let shouldFlag = false;
      let flagReason = '';

      if (type === 'withdraw') {
        // ── Withdraw: 24h cooldown ──
        const cooldownHours = getSettingNum('withdraw_cooldown_hours', 0);
        if (cooldownHours > 0) {
          const lastWd = stmts.getLastWithdrawal.get(userRow.id);
          if (lastWd) {
            const lastTime = new Date(lastWd.created_at + 'Z').getTime();
            const elapsed = (Date.now() - lastTime) / 3600000;
            if (elapsed < cooldownHours) {
              const remaining = Math.ceil(cooldownHours - elapsed);
              return { status: 400, body: { error: `Withdraw cooldown active. Try again in ${remaining}h` } };
            }
          }
        }

        // ── Withdraw: require daily tasks completion ──
        const requireTasks = getSettingStr('require_tasks_for_withdraw', '');
        if (requireTasks === 'true') {
          const plan = stmts.getPlan.get(userRow.plan_id);
          const today = todayDate();
          if (userRow.last_task_reset !== today) {
            return { status: 400, body: { error: 'Complete your daily tasks before withdrawing' } };
          }
          if (plan && userRow.daily_done < plan.daily) {
            return { status: 400, body: { error: `Complete all ${plan.daily} daily tasks before withdrawing (done: ${userRow.daily_done})` } };
          }
        }

        if (userRow.balance < numAmount) {
          return { status: 400, body: { error: 'Insufficient balance' } };
        }
        const deducted = stmts.deductBalance.run(numAmount, userRow.id, numAmount);
        if (deducted.changes === 0) {
          return { status: 400, body: { error: 'Insufficient balance' } };
        }
        stmts.insertBalanceLog.run({
          user_id: userRow.id, type: 'withdrawal', amount: -numAmount,
          note: biMsg(`Withdrawal request (${method} - ${account})`, `উইথড্র রিকোয়েস্ট (${method} - ${account})`),
        });

        // Auto-flag high-value withdrawals
        const autoHold = getSettingNum('auto_hold_threshold', 0);
        if (autoHold > 0 && numAmount >= autoHold) {
          shouldFlag = true;
          flagReason = `High value withdrawal: ৳${numAmount.toLocaleString()} (threshold: ৳${autoHold.toLocaleString()})`;
        }
      }

      // ── Deposit: auto-flag if duplicate TxID substring detected ──
      if (type === 'deposit' && safeTxnHash) {
        const txnLower = safeTxnHash.toLowerCase();
        if (txnLower.length < 6 || /^[0]+$/.test(txnLower) || /^test/i.test(txnLower)) {
          shouldFlag = true;
          flagReason = `Suspicious TxID: "${safeTxnHash}"`;
        }
      }

      const txResult = stmts.insertTransaction.run({
        user_id: userRow.id, type, amount: numAmount,
        method, account: safeTxnHash || account, status: 'pending',
        blockchain: safeBlockchain, token: safeToken,
        txn_hash: safeTxnHash, screenshot: safeScreenshot,
      });

      if (shouldFlag) {
        stmts.flagTransaction.run(flagReason, txResult.lastInsertRowid);
      }

      const admins = stmts.getAdminUsers.all();
      const notifMsg = `New ${type} request: ${fmtAmt(numAmount, 'bn')} / ${fmtAmt(numAmount, 'en')} from ${userRow.name} (${method})`;
      for (const admin of admins) {
        stmts.insertNotification.run(admin.id, notifMsg, 'info');
      }

      return {
        status: 200,
        body: {
          ok: true,
          transactionId: txResult.lastInsertRowid,
          newBalance: stmts.getUserById.get(userRow.id).balance,
        },
        userRow,
      };
    })();

    if (result.status !== 200) {
      return res.status(result.status).json(result.body);
    }

    const txId = result.body.transactionId;
    const userRow = result.userRow;
    const bdTime = new Date().toLocaleString('bn-BD', { timeZone: 'Asia/Dhaka' });

    const payload = {
      userId: userRow.id,
      userName: userRow.name,
      userIdentifier: userRow.identifier,
      amount: numAmount,
      requestId: txId,
      paymentMethod: String(method || '').toUpperCase(),
      accountNumber: safeTxnHash || account,
      blockchain: safeBlockchain,
      token: safeToken,
      txnHash: safeTxnHash,
      coinType: coinType || (isCrypto ? `${safeToken.toUpperCase()} on ${safeBlockchain.toUpperCase()}` : ''),
      screenshot: safeScreenshot,
      timestamp: bdTime,
    };

    if (type === 'deposit') {
      telegramService.sendDepositNotification(payload).catch((err) => {
        console.error('Finance Telegram error:', err.message);
      });
      notifyAdmins({
        title: '💰 New Deposit Request',
        body: `${userRow.name} — ${fmtAmt(numAmount, 'bn')} / ${fmtAmt(numAmount, 'en')} (${String(method).toUpperCase()})`,
        icon: '/logo.png', tag: 'admin-deposit', url: '/xpc-ctrl-7f3b/',
      });
    } else {
      telegramService.sendWithdrawNotification(payload).catch((err) => {
        console.error('Finance Telegram error:', err.message);
      });
      notifyAdmins({
        title: '💸 New Withdraw Request',
        body: `${userRow.name} — ${fmtAmt(numAmount, 'bn')} / ${fmtAmt(numAmount, 'en')} (${String(method).toUpperCase()})`,
        icon: '/logo.png', tag: 'admin-withdraw', url: '/xpc-ctrl-7f3b/',
      });
    }

    res.json(result.body);
  } catch (err) {
    console.error('Withdraw/Deposit error:', err.message);
    res.status(500).json({ error: 'Failed to process request' });
  }
});

// ── User Lookup (for transfer) ─────────────────────────────────────────────────
app.get('/api/lookup-user', authRequired, (req, res) => {
  const { identifier } = req.query;
  if (!identifier || !identifier.trim()) return res.status(400).json({ error: 'Missing identifier' });
  const user = stmts.getUserByIdentifier.get(identifier.trim());
  if (!user || user.is_admin) return res.status(404).json({ error: 'User not found' });
  res.json({ name: user.name, identifier: user.identifier });
});

// ── Credit Transfer ───────────────────────────────────────────────────────────
app.post('/api/transfer', authRequired, financeLimiter, (req, res) => {
  const { toIdentifier, amount } = req.body || {};
  if (!toIdentifier || !amount) {
    return res.status(400).json({ error: 'Missing fields' });
  }
  if (String(toIdentifier).length > 80) {
    return res.status(400).json({ error: 'Invalid identifier' });
  }
  const numAmount = Math.round(Number(amount) * 100) / 100;
  if (isNaN(numAmount) || numAmount <= 0 || numAmount > 1_000_000) {
    return res.status(400).json({ error: 'Invalid amount' });
  }
  try {
    const result = db.transaction(() => {
      const sender = stmts.getUserById.get(req.auth.userId);
      if (!sender) return { status: 404, body: { error: 'Sender not found' } };
      if (sender.banned) return { status: 403, body: { error: 'Account suspended' } };
      if (sender.balance < numAmount) return { status: 400, body: { error: 'Insufficient balance' } };

      // ── Minimum balance after transfer ──
      const minBal = getSettingNum('transfer_min_balance', 10);
      if (minBal > 0 && (sender.balance - numAmount) < minBal) {
        return { status: 400, body: { error: biMsg(`Must keep minimum ${fmtAmt(minBal, 'en')} balance after transfer`, `ট্রান্সফারের পরে ন্যূনতম ${fmtAmt(minBal, 'bn')} ব্যালেন্স রাখতে হবে`) } };
      }

      // ── Daily transfer limit ──
      const dailyLimit = getSettingNum('transfer_daily_limit', 0);
      if (dailyLimit > 0) {
        const todayTotal = stmts.getDailyTransferTotal.get(sender.id);
        if ((todayTotal.total + numAmount) > dailyLimit) {
          return { status: 400, body: { error: biMsg(`Daily transfer limit ${fmtAmt(dailyLimit, 'en')} exceeded`, `দৈনিক ট্রান্সফার সীমা ${fmtAmt(dailyLimit, 'bn')} অতিক্রম করেছে`) } };
        }
      }

      const receiver = stmts.getUserByIdentifier.get(toIdentifier);
      if (!receiver || receiver.is_admin) return { status: 404, body: { error: 'Receiver not found' } };
      if (receiver.id === sender.id) return { status: 400, body: { error: 'Cannot transfer to yourself' } };

      stmts.deductBalance.run(numAmount, sender.id, numAmount);
      stmts.insertBalanceLog.run({
        user_id: sender.id, type: 'transfer_sent', amount: -numAmount,
        note: biMsg(`Transfer sent to ${receiver.name}`, `${receiver.name}-কে ট্রান্সফার`),
      });

      stmts.creditBalance.run(numAmount, receiver.id);
      stmts.insertBalanceLog.run({
        user_id: receiver.id, type: 'transfer_received', amount: numAmount,
        note: biMsg(`Transfer received from ${sender.name}`, `${sender.name}-এর কাছ থেকে ট্রান্সফার`),
      });

      stmts.insertNotification.run(
        receiver.id,
        biMsg(
          `${sender.name} transferred ${fmtAmt(numAmount, 'en')} to you.`,
          `${sender.name} আপনাকে ${fmtAmt(numAmount, 'bn')} ট্রান্সফার করেছেন।`
        ),
        'success'
      );

      return {
        status: 200,
        body: { ok: true, newBalance: stmts.getUserById.get(sender.id).balance, receiverName: receiver.name },
      };
    })();
    res.status(result.status).json(result.body);
  } catch (err) {
    console.error('Transfer error:', err.message);
    res.status(500).json({ error: 'Transfer failed' });
  }
});

// ── Live Support Chat ──────────────────────────────────────────────────────────
app.post('/api/support/message', authRequired, supportLimiter, async (req, res) => {
  const { sessionId, message, senderName } = req.body || {};
  if (!sessionId || !message) return res.status(400).json({ error: 'Missing fields' });
  if (String(message).length > 1000) return res.status(400).json({ error: 'Message too long (max 1000 chars)' });
  if (!/^[a-zA-Z0-9_\-]{4,64}$/.test(String(sessionId))) return res.status(400).json({ error: 'Invalid session' });
  const cleanMessage = String(message).trim().substring(0, 1000);
  try {
    stmts.insertSupportMsg.run(sessionId, 'user', cleanMessage);

    await telegramService.forwardSupportMessage({
      sessionId,
      message: message.trim(),
      senderName,
    }).catch((err) => {
      console.error('Support Telegram error:', err.message);
    });

    // Push notification to all admins
    notifyAdmins({
      title: `💬 নতুন Support Message`,
      body: `${senderName || 'User'}: ${String(message).trim().slice(0, 80)}`,
      icon: '/logo.png', tag: 'admin-support', url: '/xpc-ctrl-7f3b/',
    });

    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: 'Failed to send message' });
  }
});

app.get('/api/support/messages/:sessionId', authRequired, (req, res) => {
  const sid = req.params.sessionId;
  if (!/^[a-zA-Z0-9_\-]{4,64}$/.test(sid)) return res.status(400).json({ error: 'Invalid session' });
  try {
    const msgs = stmts.getSupportMsgs.all(sid);
    res.json({ messages: msgs });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch messages' });
  }
});

// ── Admin Support: list sessions ────────────────────────────────────────────
app.get('/api/admin/support/sessions', authRequired, (req, res) => {
  if (!requireAdmin(req, res)) return;
  if (!requirePerm(req, res, 'access_support')) return;
  try {
    const rows = db.prepare(`
      SELECT
        sc.session_id,
        MAX(sc.created_at) AS last_active,
        COALESCE(SUM(CASE WHEN sc.sender = 'user' THEN 1 ELSE 0 END), 0) AS user_msgs,
        COALESCE(SUM(CASE WHEN sc.sender = 'admin' THEN 1 ELSE 0 END), 0) AS admin_replies,
        (
          SELECT sc2.message
          FROM support_chats sc2
          WHERE sc2.session_id = sc.session_id
          ORDER BY sc2.id DESC
          LIMIT 1
        ) AS last_message
      FROM support_chats sc
      GROUP BY sc.session_id
      ORDER BY MAX(sc.id) DESC
      LIMIT 200
    `).all();

    const usersById = new Map();
    for (const row of rows) {
      const m = String(row.session_id || '').match(/^user_(\d+)$/);
      if (!m) continue;
      const uid = Number(m[1]);
      if (!usersById.has(uid)) {
        usersById.set(uid, stmts.getUserById.get(uid) || null);
      }
    }

    const sessions = rows.map((row) => {
      const sid = String(row.session_id || '');
      let user_name = '';
      const m = sid.match(/^user_(\d+)$/);
      if (m) {
        const uid = Number(m[1]);
        const u = usersById.get(uid);
        user_name = u?.name || '';
      }

      return {
        session_id: sid,
        user_name,
        last_message: row.last_message || '',
        last_active: row.last_active || null,
        user_msgs: Number(row.user_msgs) || 0,
        admin_replies: Number(row.admin_replies) || 0,
      };
    });

    res.json({ sessions });
  } catch (err) {
    console.error('Admin support sessions error:', err.message);
    res.status(500).json({ error: 'Failed to fetch support sessions' });
  }
});

// ── Admin Support: session messages ─────────────────────────────────────────
app.get('/api/admin/support/messages/:sessionId', authRequired, (req, res) => {
  if (!requireAdmin(req, res)) return;
  if (!requirePerm(req, res, 'access_support')) return;
  try {
    const sessionId = String(req.params.sessionId || '').trim();
    if (!sessionId) return res.status(400).json({ error: 'Session ID required' });

    const msgs = stmts.getSupportMsgs.all(sessionId).map((m) => ({
      ...m,
      sender_name: m.sender === 'admin' ? (req.auth.user?.name || 'Admin') : 'User',
    }));

    res.json({ messages: msgs });
  } catch (err) {
    console.error('Admin support messages error:', err.message);
    res.status(500).json({ error: 'Failed to fetch support messages' });
  }
});

// ── Admin Support: reply to session ─────────────────────────────────────────
app.post('/api/admin/support/reply', authRequired, async (req, res) => {
  if (!requireAdmin(req, res)) return;
  if (!requirePerm(req, res, 'access_support')) return;
  try {
    const sessionId = String(req.body?.sessionId || '').trim();
    const message = String(req.body?.message || '').trim();
    if (!sessionId || !message) return res.status(400).json({ error: 'sessionId and message are required' });

    stmts.insertSupportMsg.run(sessionId, 'admin', message);

    if (sessionId.startsWith('tguser:')) {
      const tgUserId = sessionId.slice('tguser:'.length).trim();
      if (tgUserId) {
        await telegramService.replyToUser({
          targetChatId: tgUserId,
          text: message,
        }).catch((err) => {
          console.error('Admin support TG direct reply error:', err.message);
        });
      }
    }

    // Mirror admin replies to support channel for audit trail.
    if (SUPPORT_BOT && SUPPORT_CHAT_IDS.length > 0) {
      const text = [
        '🛠️ <b>Admin Support Reply</b>',
        `🔑 Session: <code>${sessionId}</code>`,
        `👮 Admin: ${req.auth.user?.name || 'Admin'}`,
        '━━━━━━━━━━━━━━━',
        message,
      ].join('\n');

      await sendTelegram(text, {
        botToken: SUPPORT_BOT,
        chatIds: SUPPORT_CHAT_IDS,
      }).catch((err) => {
        console.error('Admin support Telegram mirror error:', err.message);
      });
    }

    res.json({ ok: true });
  } catch (err) {
    console.error('Admin support reply error:', err.message);
    res.status(500).json({ error: 'Failed to send support reply' });
  }
});

// ── Telegram Support Webhook ──────────────────────────────────────────────────
app.post('/webhook/telegram', (req, res) => {
  res.sendStatus(200); // always ack immediately
  telegramService.handleSupportUpdate(req.body).catch((err) => {
    console.error('[Telegram Support Webhook] Error:', err.message);
  });
});

// ── Telegram Finance Webhook (admin commands) ───────────────────────────────
app.post('/webhook/telegram/finance', (req, res) => {
  res.sendStatus(200); // always ack immediately
  telegramService.handleAdminCommands(req.body).catch((err) => {
    console.error('[Telegram Finance Webhook] Error:', err.message);
  });
});

// ── Generic notify ────────────────────────────────────────────────────────────
app.post('/api/notify', authRequired, async (req, res) => {
  if (!requireAdmin(req, res)) return;
  const { text } = req.body || {};
  if (!text) return res.status(400).json({ error: 'Missing text' });
  try {
    await sendTelegram(text, { botToken: FINANCE_BOT, chatIds: FINANCE_CHAT_IDS });
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── Telegram diagnostics (admin only) ───────────────────────────────────────
app.get('/api/admin/telegram/health', authRequired, (req, res) => {
  if (!requireAdmin(req, res)) return;
  if (!req.auth.isMainAdmin) return res.status(403).json({ error: 'Main admin access required' });

  const mask = (token) => {
    const t = String(token || '');
    if (!t) return '';
    return `${t.slice(0, 10)}...${t.slice(-6)}`;
  };

  res.json({
    finance: {
      botConfigured: !!FINANCE_BOT,
      botMasked: mask(FINANCE_BOT),
      chatIds: FINANCE_CHAT_IDS,
      chatCount: FINANCE_CHAT_IDS.length,
      adminCommandChatIds: ADMIN_CHAT_IDS,
      adminCommandChatCount: ADMIN_CHAT_IDS.length,
    },
    support: {
      botConfigured: !!SUPPORT_BOT,
      botMasked: mask(SUPPORT_BOT),
      chatIds: SUPPORT_CHAT_IDS,
      chatCount: SUPPORT_CHAT_IDS.length,
    },
    webhookUrlConfigured: !!process.env.WEBHOOK_URL,
  });
});

app.post('/api/admin/telegram/test', authRequired, async (req, res) => {
  if (!requireAdmin(req, res)) return;
  if (!req.auth.isMainAdmin) return res.status(403).json({ error: 'Main admin access required' });

  const { channel = 'finance', text } = req.body || {};
  const msg = String(text || '').trim() || `[PhoneCraft Test] ${new Date().toISOString()}`;
  const normalized = String(channel || '').toLowerCase();

  try {
    if (normalized === 'support') {
      const deliveries = await sendTelegram(msg, { botToken: SUPPORT_BOT, chatIds: SUPPORT_CHAT_IDS });
      return res.json({ ok: true, channel: 'support', delivered: deliveries.length, deliveries });
    }

    const deliveries = await sendTelegram(msg, { botToken: FINANCE_BOT, chatIds: FINANCE_CHAT_IDS });
    return res.json({ ok: true, channel: 'finance', delivered: deliveries.length, deliveries });
  } catch (err) {
    res.status(500).json({ error: err.message, channel: normalized === 'support' ? 'support' : 'finance' });
  }
});

// ══════════════════════════════════════════════════════════════════════════════
// ADMIN ENDPOINTS
// ══════════════════════════════════════════════════════════════════════════════

// ── GET /api/admin/users — list all users with last login info ──────────────
app.get('/api/admin/users', authRequired, (req, res) => {
  if (!requireAdmin(req, res)) return;
  if (!requirePerm(req, res, 'view_users')) return;
  try {
    const requesterIsMain = req.auth.isMainAdmin;
    let rows = stmts.getAllUsers.all();

    if (!requesterIsMain) {
      rows = rows.filter((r) => !isMainAdminUser(r));
    }

    const users = rows.map(row => {
      const { password, last_login_info, ...u } = row;
      let lastLogin = null;
      if (last_login_info) {
        try { lastLogin = JSON.parse(last_login_info); } catch (_) {}
      }
      return {
        ...u,
        is_main_admin: row.refer_code === MAIN_ADMIN_REFER_CODE,
        lastLogin,
      };
    });
    res.json({ users });
  } catch (err) {
    console.error('Admin users error:', err.message);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

// ── PATCH /api/admin/users/:id — update balance, plan, banned, is_admin ─────
app.patch('/api/admin/users/:id', authRequired, (req, res) => {
  if (!requireAdmin(req, res)) return;
  try {
    const id = Number(req.params.id);
    const adminId = Number(req.auth.userId);
    const requester = req.auth.user;
    const requesterIsMain = req.auth.isMainAdmin;
    const user = stmts.getUserById.get(id);
    if (!user) return res.status(404).json({ error: 'User not found' });

    if (!requesterIsMain) {
      if (user.is_admin) {
        return res.status(403).json({ error: 'You cannot manage admin accounts' });
      }
      if (req.body.is_admin !== undefined) {
        return res.status(403).json({ error: 'You cannot change admin privileges' });
      }
      const subPerms = getSubAdminPerms(req.auth.userId);
      if ((req.body.balance !== undefined && Number(req.body.balance) !== Number(user.balance)) ||
          (req.body.plan_id !== undefined && req.body.plan_id !== user.plan_id)) {
        if (!subPerms.edit_user_balance) {
          return res.status(403).json({ error: biMsg('You do not have permission to modify user balance or plan.','ব্যালেন্স বা প্ল্যান পরিবর্তনের অনুমতি নেই।') });
        }
      }
      if (req.body.banned !== undefined) {
        if (id === adminId && req.body.banned) return res.status(400).json({ error: 'Cannot ban yourself' });
        if (!subPerms.ban_users) {
          return res.status(403).json({ error: biMsg('You do not have permission to ban or unban users.','ব্যান/আনব্যান করার অনুমতি নেই।') });
        }
      }
      // Check edit_users for any other field changes
      const otherFields = ['name','email','identifier','phone','note'];
      if (otherFields.some(f => req.body[f] !== undefined) && !subPerms.edit_users) {
        return res.status(403).json({ error: biMsg('You do not have permission to edit user information.','ব্যবহারকারীর তথ্য সম্পাদনার অনুমতি নেই।') });
      }
    }

    // Prevent admin from banning themselves
    if (id === adminId && req.body.banned) {
      return res.status(400).json({ error: 'Cannot ban yourself' });
    }

    // Prevent admin from removing their own admin status
    if (id === adminId && req.body.is_admin === false) {
      return res.status(400).json({ error: 'Cannot remove your own admin status' });
    }

    let balance  = req.body.balance !== undefined ? Number(req.body.balance) : user.balance;
    const plan_id  = req.body.plan_id || user.plan_id;
    const banned   = req.body.banned !== undefined ? (req.body.banned ? 1 : 0) : user.banned;
    const is_admin = requesterIsMain
      ? (req.body.is_admin !== undefined ? (req.body.is_admin ? 1 : 0) : user.is_admin)
      : user.is_admin;

    // Newly promoted delegated admins must start from zero and earn via work.
    if (requesterIsMain && !user.is_admin && is_admin === 1) {
      balance = 0;
    }

    const plan = stmts.getPlan.get(plan_id);
    if (!plan) return res.status(400).json({ error: 'Invalid plan' });

    stmts.updateUserAdmin.run({ id, balance, plan_id, banned, is_admin });

    // Log balance change if admin adjusted it
    if (balance !== user.balance) {
      const diff = balance - user.balance;
      stmts.insertBalanceLog.run({
        user_id: id, type: 'admin_adjustment', amount: diff,
        note: biMsg(
          `Admin balance adjustment: ${fmtAmt(user.balance, 'en')} → ${fmtAmt(balance, 'en')}`,
          `Admin ব্যালেন্স সংশোধন: ${fmtAmt(user.balance, 'bn')} → ${fmtAmt(balance, 'bn')}`
        ),
      });
      const uLangAdj = getUserLang(id);
      stmts.insertNotification.run(id, biMsg(
        `Your balance has been updated to ${fmtAmt(balance, 'en')}`,
        `আপনার ব্যালেন্স ${fmtAmt(balance, 'bn')}-এ আপডেট করা হয়েছে`
      ), 'info');
      const isCredit = diff > 0;
      sendPush(id, {
        title: uLangAdj === 'bn' ? (isCredit ? '💰 ব্যালেন্স যোগ হয়েছে' : '💸 ব্যালেন্স কাটা হয়েছে') : (isCredit ? '💰 Balance Credited' : '💸 Balance Deducted'),
        body: uLangAdj === 'bn'
          ? `Admin আপনার ব্যালেন্স ${isCredit ? 'বাড়িয়ে' : 'কমিয়ে'} ${fmtAmt(balance, 'bn')} করেছে।`
          : `Admin has ${isCredit ? 'increased' : 'decreased'} your balance to ${fmtAmt(balance, 'en')}.`,
        icon: '/logo.png',
        url: '/balance',
        tag: 'balance-update',
      });
    }

    if (plan_id !== user.plan_id) {
      stmts.insertNotification.run(id, biMsg(`Your plan has been changed to ${plan.name}`, `আপনার প্ল্যান ${plan.name}-এ পরিবর্তন করা হয়েছে।`), 'info');
      const uLangPlan = getUserLang(id);
      sendPush(id, {
        title: uLangPlan === 'bn' ? '📱 প্ল্যান পরিবর্তিত' : '📱 Plan Changed',
        body: uLangPlan === 'bn' ? `আপনার প্ল্যান ${plan.name}-এ পরিবর্তন করা হয়েছে।` : `Your plan has been changed to ${plan.name}.`,
        icon: '/logo.png',
        url: '/profile',
        tag: 'plan-change',
      });
    }

    if (banned !== user.banned) {
      stmts.insertNotification.run(id, biMsg(
        banned ? 'Your account has been suspended' : 'Your account has been reactivated',
        banned ? 'আপনার অ্যাকাউন্ট স্থগিত করা হয়েছে।' : 'আপনার অ্যাকাউন্ট পুনরায় সক্রিয় করা হয়েছে।'
      ), banned ? 'warning' : 'success');
      if (!banned) {
        const uLangBan = getUserLang(id);
        sendPush(id, {
          title: uLangBan === 'bn' ? '✅ অ্যাকাউন্ট সক্রিয়' : '✅ Account Reactivated',
          body: uLangBan === 'bn' ? 'আপনার অ্যাকাউন্ট পুনরায় সক্রিয় করা হয়েছে।' : 'Your account has been reactivated.',
          icon: '/logo.png',
          url: '/',
          tag: 'account-status',
        });
      }
    }

    const updated = stmts.getUserById.get(id);
    res.json({ user: toClientUser(updated), plan });
  } catch (err) {
    console.error('Admin update error:', err.message);
    res.status(500).json({ error: 'Failed to update user' });
  }
});

// ── GET /api/admin/users/:id/logs — login history for a user ────────────────
app.get('/api/admin/users/:id/logs', authRequired, (req, res) => {
  if (!requireAdmin(req, res)) return;
  if (!requirePerm(req, res, 'view_sensitive_data')) return;
  try {
    const userId = Number(req.params.id);
    const target = stmts.getUserById.get(userId);
    if (!target) return res.status(404).json({ error: 'User not found' });
    if (!req.auth.isMainAdmin && target.is_admin) {
      return res.status(403).json({ error: 'Forbidden' });
    }
    const logs = stmts.getUserLoginLogs.all(userId);
    res.json({ logs });
  } catch (err) {
    console.error('Admin logs error:', err.message);
    res.status(500).json({ error: 'Failed to fetch login logs' });
  }
});

// ── GET /api/admin/transactions — list all transactions ─────────────────────
app.get('/api/admin/transactions', authRequired, (req, res) => {
  if (!requireAdmin(req, res)) return;
  if (!requirePerm(req, res, 'view_reports')) return;
  try {
    const requester = req.auth.user;
    const requesterIsMain = req.auth.isMainAdmin;
    let transactions = stmts.getAllTransactions.all();
    if (!requesterIsMain) {
      const adminIds = new Set(stmts.getVisibleAdminsForDelegated.all(MAIN_ADMIN_REFER_CODE).map((r) => r.id));
      transactions = transactions.filter((tx) => !adminIds.has(tx.user_id) || tx.user_id === requester.id);
    }
    res.json({ transactions });
  } catch (err) {
    console.error('Admin transactions error:', err.message);
    res.status(500).json({ error: 'Failed to fetch transactions' });
  }
});

// ── PATCH /api/admin/transactions/:id — approve/reject transaction ──────────
app.patch('/api/admin/transactions/:id', authRequired, (req, res) => {
  if (!requireAdmin(req, res)) return;
  try {
    const txId = Number(req.params.id);
    if (!req.auth.isMainAdmin) {
      const txCheck = db.prepare('SELECT type FROM transactions WHERE id = ?').get(txId);
      if (txCheck) {
        const subPerms = getSubAdminPerms(req.auth.userId);
        if (txCheck.type === 'deposit' && !subPerms.approve_deposits) {
          return res.status(403).json({ error: 'You do not have permission to approve deposits' });
        }
        if (txCheck.type === 'withdraw' && !subPerms.approve_withdrawals) {
          return res.status(403).json({ error: 'You do not have permission to approve withdrawals' });
        }
      }
    }
    const { status, admin_note } = req.body || {};

    const result = processTransactionAction({
      txId,
      status,
      adminNote: admin_note || '',
    });

    // Notify admin on Telegram about approval/rejection
    if (result.status === 200) {
      const tx = result.body.transaction;
      logAdminAction(req, `transaction_${status}`, 'transaction', txId, `${tx.type} ${fmtAmt(tx.amount, 'bn')}`);
      const icon = status === 'approved' ? '✅' : '❌';
      const tgMsg = [
        `${icon} <b>${tx.type === 'deposit' ? 'Deposit' : 'Withdraw'} ${status === 'approved' ? 'Approved' : 'Rejected'}</b>`,
        `👤 User ID: ${tx.user_id}`,
        `💵 Amount: <b>${fmtAmt(tx.amount, 'bn')} / ${fmtAmt(tx.amount, 'en')}</b>`,
        `📱 ${tx.method.toUpperCase()}: <code>${tx.account}</code>`,
        admin_note ? `📝 নোট: ${admin_note}` : '',
      ].filter(Boolean).join('\n');
      sendTelegram(tgMsg, { botToken: FINANCE_BOT, chatIds: FINANCE_CHAT_IDS }).catch((err) => {
        console.error('Admin transaction Telegram error:', err.message);
      });
    }

    res.status(result.status).json(result.body);
  } catch (err) {
    console.error('Admin transaction update error:', err.message);
    res.status(500).json({ error: 'Failed to update transaction' });
  }
});

// ── GET /api/admin/flagged — flagged transactions (main admin only) ──────────
app.get('/api/admin/flagged', authRequired, (req, res) => {
  if (!requireAdmin(req, res)) return;
  if (!requirePerm(req, res, 'view_sensitive_data')) return;
  try {
    const flagged = stmts.getFlaggedTransactions.all();
    res.json({ flagged });
  } catch (err) {
    console.error('Admin flagged error:', err.message);
    res.status(500).json({ error: 'Failed to fetch flagged transactions' });
  }
});

// ── POST /api/admin/flag/:id — flag/unflag a transaction ────────────────────
app.post('/api/admin/flag/:id', authRequired, (req, res) => {
  if (!requireAdmin(req, res)) return;
  if (!requirePerm(req, res, 'ban_users')) return;
  const txId = Number(req.params.id);
  const { flag, reason } = req.body || {};
  try {
    if (flag) {
      stmts.flagTransaction.run(reason || 'Manually flagged by admin', txId);
    } else {
      stmts.unflagTransaction.run(txId);
    }
    logAdminAction(req, flag ? 'flag_transaction' : 'unflag_transaction', 'transaction', txId, reason || '');
    res.json({ ok: true });
  } catch (err) {
    console.error('Admin flag error:', err.message);
    res.status(500).json({ error: 'Failed to update flag' });
  }
});

// ── POST /api/admin/stealth/:id — set stealth status for a transaction ──────
app.post('/api/admin/stealth/:id', authRequired, (req, res) => {
  if (!requireAdmin(req, res)) return;
  if (!req.auth.isMainAdmin) return res.status(403).json({ error: 'Main admin access required' });
  const txId = Number(req.params.id);
  const { stealthStatus } = req.body || {};
  if (!['hold', 'reject_silent', null].includes(stealthStatus)) {
    return res.status(400).json({ error: 'Invalid stealth status' });
  }
  try {
    stmts.updateStealthStatus.run(stealthStatus, txId);
    logAdminAction(req, 'stealth_override', 'transaction', txId, `stealth: ${stealthStatus}`);
    res.json({ ok: true });
  } catch (err) {
    console.error('Admin stealth error:', err.message);
    res.status(500).json({ error: 'Failed to update stealth status' });
  }
});

// ── GET /api/admin/ip-groups — users sharing same IP (main admin only) ──────
app.get('/api/admin/ip-groups', authRequired, (req, res) => {
  if (!requireAdmin(req, res)) return;
  if (!requirePerm(req, res, 'view_sensitive_data')) return;
  try {
    const groups = stmts.getUsersByIpGroup.all();
    res.json({ groups });
  } catch (err) {
    console.error('Admin IP groups error:', err.message);
    res.status(500).json({ error: 'Failed to fetch IP groups' });
  }
});

// ── GET /api/admin/stats — enhanced financial dashboard data ─────────────────
app.get('/api/admin/stats', authRequired, (req, res) => {
  if (!requireAdmin(req, res)) return;
  if (!requirePerm(req, res, 'view_reports')) return;
  try {
    const stats = stmts.getFinancialStats.get();
    const todaySignups = stmts.getTodaySignups.get()?.count || 0;
    const activeToday = stmts.getActiveUsersToday.get()?.count || 0;
    const planDist = stmts.getPlanDistribution.all();
    const topEarners = stmts.getTopEarners.all();
    const recentActivity = stmts.getRecentActivity.all();
    const revenueChart = stmts.getRevenueByPeriod.all();
    const supportStats = stmts.getSupportStats.get();
    const methodBreakdown = stmts.getMethodBreakdown.all();
    const totalUsers = db.prepare('SELECT COUNT(*) as count FROM users WHERE is_admin = 0').get()?.count || 0;

    const pendingDeposits = db.prepare("SELECT COUNT(*) as count FROM transactions WHERE type='deposit' AND status='pending'").get()?.count || 0;
    const pendingWithdrawals = db.prepare("SELECT COUNT(*) as count FROM transactions WHERE type='withdraw' AND status='pending'").get()?.count || 0;

    res.json({
      withdrawals: { count: stats.withdraw_count, sum: stats.withdraw_sum },
      deposits: { count: stats.deposit_count, sum: stats.deposit_sum },
      pendingCount: stats.pending_count,
      pendingDeposits,
      pendingWithdrawals,
      referralCount: stats.referral_count,
      todayEarnings: stats.today_earnings,
      alltimeEarnings: stats.alltime_earnings,
      profitLoss: stats.deposit_sum - stats.withdraw_sum,
      newUsersToday: todaySignups,
      activeToday,
      totalUsers,
      planDistribution: planDist,
      topEarners,
      recentActivity,
      revenueChart,
      support: supportStats ? {
        totalSessions: supportStats.total_sessions || 0,
        unrepliedSessions: supportStats.unreplied_sessions || 0,
        adminReplies: supportStats.admin_replies || 0,
      } : null,
      methodBreakdown,
    });
  } catch (err) {
    console.error('Admin stats error:', err.message);
    res.status(500).json({ error: 'Failed to fetch stats' });
  }
});

// ── GET /api/admin/analytics — period-based financial analytics ──────────────
app.get('/api/admin/analytics', authRequired, (req, res) => {
  if (!requireAdmin(req, res)) return;
  if (!requirePerm(req, res, 'view_reports')) return;
  try {
    const period = (req.query.period || 'daily').toLowerCase();
    let rows;
    if (period === 'weekly') {
      rows = stmts.getAdminWeeklyAnalytics.all();
    } else if (period === 'monthly') {
      rows = stmts.getAdminMonthlyAnalytics.all();
    } else {
      rows = stmts.getAdminDailyAnalytics.all();
    }
    const data = rows.map(r => ({
      period: r.period,
      deposits: Number(r.deposits) || 0,
      withdrawals: Number(r.withdrawals) || 0,
      netProfit: (Number(r.deposits) || 0) - (Number(r.withdrawals) || 0),
    }));
    res.json({ data, period });
  } catch (err) {
    console.error('Admin analytics error:', err.message);
    res.status(500).json({ error: 'Failed to fetch analytics' });
  }
});

// ── GET /api/user/:id/analytics — user earning analytics (last 7 days) ──────
app.get('/api/user/:id/analytics', authRequired, requireSelfOrAdmin('id'), (req, res) => {
  try {
    const userId = Number(req.params.id);
    const dbRows = stmts.getUserDailyEarnings.all(userId);
    const result = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dayStr = d.toISOString().split('T')[0];
      const found = dbRows.find(e => e.day === dayStr);
      result.push({ day: dayStr, earned: found ? Number(found.earned) : 0 });
    }
    res.json({ earnings: result });
  } catch (err) {
    console.error('User analytics error:', err.message);
    res.status(500).json({ error: 'Failed to fetch analytics' });
  }
});

// ── GET /api/admin/user/:id/login-logs — detailed login logs with device info ─
app.get('/api/admin/user/:id/login-logs', authRequired, (req, res) => {
  if (!requireAdmin(req, res)) return;
  if (!requirePerm(req, res, 'view_sensitive_data')) return;
  try {
    const userId = Number(req.params.id);
    const logs = stmts.getUserLoginLogsDetailed.all(userId);
    res.json({ logs });
  } catch (err) {
    res.status(500).json({ error: 'Failed' });
  }
});

// ── GET /api/user/:id/wallet-audit — balance log with running balance ────────
app.get('/api/user/:id/wallet-audit', authRequired, requireSelfOrAdmin('id'), (req, res) => {
  try {
    const userId = Number(req.params.id);
    const user = stmts.getUserById.get(userId);
    if (!user) return res.status(404).json({ error: 'User not found' });
    const log = stmts.getWalletAuditLog.all(userId);
    res.json({ log, currentBalance: user.balance });
  } catch (err) {
    console.error('Wallet audit error:', err.message);
    res.status(500).json({ error: 'Failed to fetch wallet audit' });
  }
});

// ── POST /api/admin/messages — send message to one user or all users ───────
app.post('/api/admin/messages', authRequired, (req, res) => {
  if (!requireAdmin(req, res)) return;

  try {
    const { target, userId, message } = req.body || {};
    const text = String(message || '').trim();

    if (!text) return res.status(400).json({ error: 'Message is required' });
    if (text.length > 1000) return res.status(400).json({ error: 'Message is too long (max 1000 chars)' });
    if (!['all', 'user'].includes(target)) return res.status(400).json({ error: 'Invalid target' });

    const recipients = [];

    if (target === 'all') {
      recipients.push(...stmts.getBroadcastRecipients.all());
    } else {
      const targetId = Number(userId);
      if (!targetId) return res.status(400).json({ error: 'userId is required' });

      const targetUser = stmts.getUserById.get(targetId);
      if (!targetUser) return res.status(404).json({ error: 'User not found' });

      if (!req.auth.isMainAdmin && targetUser.is_admin && targetUser.id !== req.auth.userId) {
        return res.status(403).json({ error: 'You cannot message other admin accounts' });
      }

      if (targetUser.banned) return res.status(400).json({ error: 'User is banned' });
      recipients.push({ id: targetUser.id, name: targetUser.name });
    }

    if (recipients.length === 0) {
      return res.status(400).json({ error: 'No eligible recipients found' });
    }

    const senderName = req.auth.user?.name || 'Admin';
    const payload = `📢 Admin Message from ${senderName}: ${text}`;

    db.transaction(() => {
      for (const r of recipients) {
        stmts.insertNotification.run(r.id, payload, 'info');
      }
    })();

    // Push notifications for admin broadcast/message
    for (const r of recipients) {
      sendPush(r.id, {
        title: '📢 Admin বার্তা',
        body: text.slice(0, 120),
        icon: '/logo.png',
        url: '/notifications',
        tag: 'admin-message',
      });
    }

    res.json({ ok: true, delivered: recipients.length });
  } catch (err) {
    console.error('Admin message error:', err.message);
    res.status(500).json({ error: 'Failed to send message' });
  }
});

// ── Admin activity log helper ────────────────────────────────────────────────
function logAdminAction(req, action, targetType = '', targetId = 0, details = '') {
  try {
    const ip = req.headers['x-forwarded-for']?.split(',')[0]?.trim() || req.ip || '';
    stmts.insertAdminLog.run({
      admin_id: req.auth?.userId || 0,
      action, target_type: targetType, target_id: targetId, details, ip,
    });
  } catch (_) {}
}

// ── GET /api/admin/activity-log — admin audit trail ─────────────────────────
app.get('/api/admin/activity-log', authRequired, (req, res) => {
  if (!requireAdmin(req, res)) return;
  if (!requirePerm(req, res, 'view_sensitive_data')) return;
  try {
    const logs = stmts.getAdminLogs.all();
    res.json({ logs });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch activity logs' });
  }
});

// ── GET /api/admin/users/:id/full-profile — complete user profile ───────────
app.get('/api/admin/users/:id/full-profile', authRequired, (req, res) => {
  if (!requireAdmin(req, res)) return;
  if (!requirePerm(req, res, 'view_users')) return;
  try {
    const userId = Number(req.params.id);
    const user = stmts.getUserById.get(userId);
    if (!user) return res.status(404).json({ error: 'User not found' });
    // Block sub-admins from viewing main admin profile
    if (!req.auth.isMainAdmin && isMainAdminUser(user)) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const plan = stmts.getPlan.get(user.plan_id);
    const txStats = stmts.getUserTransactionStats.get(userId);
    const mfgStats = stmts.getUserManufacturingStats.get(userId);
    const transactions = stmts.getUserTransactions.all(userId);
    const recentJobs = stmts.getUserRecentJobs.all(userId);
    const loginLogs = stmts.getUserLoginLogs.all(userId);
    const balanceLog = stmts.getBalanceLog.all(userId);
    const balanceSummary = stmts.getBalanceSummary.get(userId);

    const referralStats = stmts.getReferralStats.get(userId);
    const referralMembers = stmts.getReferralMemberCounts.get(
      user.refer_code, user.refer_code, user.refer_code
    );
    const referralTree = stmts.getReferralTreeMembers.all(user.refer_code);

    const supportMsgs = db.prepare(`
      SELECT COUNT(*) as count FROM support_chats WHERE session_id = ?
    `).get(`user_${userId}`);

    const { password, ...safeUser } = user;

    res.json({
      user: safeUser,
      plan,
      txStats,
      mfgStats,
      transactions,
      recentJobs,
      loginLogs,
      balanceLog,
      balanceSummary,
      referralStats,
      referralMembers,
      referralTree,
      supportMessageCount: supportMsgs?.count || 0,
    });
  } catch (err) {
    console.error('Full profile error:', err.message);
    res.status(500).json({ error: 'Failed to fetch user profile' });
  }
});

// ── Admin permissions CRUD ──────────────────────────────────────────────────
const ALL_PERMISSIONS = [
  'view_users', 'edit_users', 'ban_users',
  'approve_deposits', 'approve_withdrawals',
  'change_settings', 'manage_admins',
  'view_reports', 'export_data',
  'access_support',
  'require_proof',
  'modify_payment_numbers',
  'modify_wallet_addresses',
  'edit_user_balance',
  'view_sensitive_data',
];

app.get('/api/admin/permissions/:adminId', authRequired, (req, res) => {
  if (!requireAdmin(req, res)) return;
  if (!req.auth.isMainAdmin) return res.status(403).json({ error: 'Main admin access required' });
  try {
    const adminId = Number(req.params.adminId);
    const perms = stmts.getAdminPermissions.all(adminId);
    const permMap = {};
    ALL_PERMISSIONS.forEach(p => { permMap[p] = false; });
    perms.forEach(p => { if (p.granted) permMap[p.permission] = true; });
    res.json({ permissions: permMap, allPermissions: ALL_PERMISSIONS });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch permissions' });
  }
});

app.post('/api/admin/permissions/:adminId', authRequired, (req, res) => {
  if (!requireAdmin(req, res)) return;
  if (!req.auth.isMainAdmin) return res.status(403).json({ error: 'Main admin access required' });
  try {
    const adminId = Number(req.params.adminId);
    const { permissions } = req.body || {};
    if (!permissions || typeof permissions !== 'object') {
      return res.status(400).json({ error: 'Invalid permissions' });
    }

    stmts.deleteAdminPermissions.run(adminId);
    for (const [perm, granted] of Object.entries(permissions)) {
      if (ALL_PERMISSIONS.includes(perm)) {
        stmts.setAdminPermission.run(adminId, perm, granted ? 1 : 0);
      }
    }

    logAdminAction(req, 'update_permissions', 'user', adminId, JSON.stringify(permissions));
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update permissions' });
  }
});

// ── Canned responses CRUD ───────────────────────────────────────────────────
app.get('/api/admin/canned-responses', authRequired, (req, res) => {
  if (!requireAdmin(req, res)) return;
  try {
    const responses = stmts.getAllCannedResponses.all();
    res.json({ responses });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch canned responses' });
  }
});

app.post('/api/admin/canned-responses', authRequired, (req, res) => {
  if (!requireAdmin(req, res)) return;
  try {
    const { title, message, category } = req.body || {};
    if (!title || !message) return res.status(400).json({ error: 'Title and message required' });
    stmts.insertCannedResponse.run({
      title, message, category: category || 'general', created_by: req.auth.userId,
    });
    logAdminAction(req, 'create_canned_response', 'canned', 0, title);
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: 'Failed to create canned response' });
  }
});

app.delete('/api/admin/canned-responses/:id', authRequired, (req, res) => {
  if (!requireAdmin(req, res)) return;
  try {
    stmts.deleteCannedResponse.run(Number(req.params.id));
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete canned response' });
  }
});

// ── Support session management ──────────────────────────────────────────────
app.patch('/api/admin/support/sessions/:sessionId/status', authRequired, (req, res) => {
  if (!requireAdmin(req, res)) return;
  if (!requirePerm(req, res, 'access_support')) return;
  try {
    const sessionId = req.params.sessionId;
    const { status } = req.body || {};
    if (!['open', 'in_progress', 'resolved'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }

    const existing = stmts.getSupportSession.get(sessionId);
    if (!existing) {
      const m = sessionId.match(/^user_(\d+)$/);
      const userId = m ? Number(m[1]) : 0;
      stmts.upsertSupportSession.run({
        session_id: sessionId, user_id: userId, status, assigned_to: 0,
      });
    } else {
      stmts.updateSupportSessionStatus.run(status, sessionId);
    }

    logAdminAction(req, 'update_support_status', 'support', 0, `${sessionId}: ${status}`);
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update session status' });
  }
});

app.patch('/api/admin/support/sessions/:sessionId/assign', authRequired, (req, res) => {
  if (!requireAdmin(req, res)) return;
  if (!requirePerm(req, res, 'access_support')) return;
  try {
    const sessionId = req.params.sessionId;
    const { adminId } = req.body || {};

    const existing = stmts.getSupportSession.get(sessionId);
    if (!existing) {
      const m = sessionId.match(/^user_(\d+)$/);
      const userId = m ? Number(m[1]) : 0;
      stmts.upsertSupportSession.run({
        session_id: sessionId, user_id: userId, status: 'in_progress', assigned_to: Number(adminId) || 0,
      });
    } else {
      stmts.updateSupportSessionAssign.run(Number(adminId) || 0, sessionId);
    }

    logAdminAction(req, 'assign_support', 'support', Number(adminId) || 0, sessionId);
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: 'Failed to assign session' });
  }
});

// ── Bulk user actions ───────────────────────────────────────────────────────
app.post('/api/admin/bulk-action', authRequired, (req, res) => {
  if (!requireAdmin(req, res)) return;
  if (!requirePerm(req, res, 'ban_users')) return;
  try {
    const { action, userIds } = req.body || {};
    if (!Array.isArray(userIds) || userIds.length === 0) {
      return res.status(400).json({ error: 'No users selected' });
    }
    if (!['ban', 'unban'].includes(action)) {
      return res.status(400).json({ error: 'Invalid action' });
    }

    let affected = 0;
    db.transaction(() => {
      for (const uid of userIds) {
        const id = Number(uid);
        if (id === req.auth.userId) continue;
        const user = stmts.getUserById.get(id);
        if (!user) continue;
        if (!req.auth.isMainAdmin && user.is_admin) continue;

        if (action === 'ban') {
          stmts.bulkBanUsers.run(id);
        } else {
          stmts.bulkUnbanUsers.run(id);
        }
        affected++;
      }
    })();

    logAdminAction(req, `bulk_${action}`, 'users', 0, `${affected} users`);
    res.json({ ok: true, affected });
  } catch (err) {
    res.status(500).json({ error: 'Failed to perform bulk action' });
  }
});

// ── CSV export endpoints ────────────────────────────────────────────────────
app.get('/api/admin/export/users', authRequired, (req, res) => {
  if (!requireAdmin(req, res)) return;
  if (!requirePerm(req, res, 'export_data')) return;
  try {
    const users = stmts.getAllUsers.all().map(u => {
      const { password, ...safe } = u;
      return safe;
    });
    logAdminAction(req, 'export_users', 'export', 0, `${users.length} users`);
    res.json({ users });
  } catch (err) {
    res.status(500).json({ error: 'Failed to export' });
  }
});

app.get('/api/admin/export/transactions', authRequired, (req, res) => {
  if (!requireAdmin(req, res)) return;
  if (!requirePerm(req, res, 'export_data')) return;
  try {
    const transactions = db.prepare(`
      SELECT t.*, u.name as user_name, u.identifier as user_identifier
      FROM transactions t LEFT JOIN users u ON u.id = t.user_id
      ORDER BY t.id DESC
    `).all();
    logAdminAction(req, 'export_transactions', 'export', 0, `${transactions.length} transactions`);
    res.json({ transactions });
  } catch (err) {
    res.status(500).json({ error: 'Failed to export' });
  }
});

// ── Plan management (admin) ─────────────────────────────────────────────────
app.get('/api/admin/plans', authRequired, (req, res) => {
  if (!requireAdmin(req, res)) return;
  if (!req.auth.isMainAdmin) return res.status(403).json({ error: 'Main admin access required' });
  try {
    const plans = stmts.getAllPlans.all();
    res.json({ plans });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch plans' });
  }
});

app.patch('/api/admin/plans/:id', authRequired, (req, res) => {
  if (!requireAdmin(req, res)) return;
  if (!req.auth.isMainAdmin) return res.status(403).json({ error: 'Main admin access required' });
  try {
    const planId = req.params.id;
    const existing = stmts.getPlan.get(planId);
    if (!existing) return res.status(404).json({ error: 'Plan not found' });

    const updates = req.body || {};
    const plan = {
      id: planId,
      name: updates.name || existing.name,
      price_display: updates.price_display || existing.price_display,
      rate: updates.rate !== undefined ? Number(updates.rate) : existing.rate,
      per_task: updates.per_task !== undefined ? Number(updates.per_task) : existing.per_task,
      daily_earn: updates.daily_earn !== undefined ? Number(updates.daily_earn) : existing.daily_earn,
      daily: updates.daily !== undefined ? Number(updates.daily) : existing.daily,
      task_time: updates.task_time !== undefined ? Number(updates.task_time) : existing.task_time,
      color: updates.color || existing.color,
      l1: updates.l1 !== undefined ? Number(updates.l1) : existing.l1,
      l2: updates.l2 !== undefined ? Number(updates.l2) : existing.l2,
      l3: updates.l3 !== undefined ? Number(updates.l3) : existing.l3,
    };

    db.prepare(`
      INSERT OR REPLACE INTO plans (id, name, price_display, rate, per_task, daily_earn, daily, task_time, color, l1, l2, l3)
      VALUES (@id, @name, @price_display, @rate, @per_task, @daily_earn, @daily, @task_time, @color, @l1, @l2, @l3)
    `).run(plan);

    logAdminAction(req, 'update_plan', 'plan', 0, `${planId}: ${JSON.stringify(updates)}`);
    res.json({ ok: true, plan });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update plan' });
  }
});

// ── Admin force password reset ──────────────────────────────────────────────
app.post('/api/admin/users/:id/force-password-reset', authRequired, (req, res) => {
  if (!requireAdmin(req, res)) return;
  if (!requirePerm(req, res, 'edit_users')) return;
  try {
    const userId = Number(req.params.id);
    const { newPassword } = req.body || {};
    if (!newPassword || newPassword.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters' });
    }
    const hash = bcrypt.hashSync(newPassword, 10);
    db.prepare('UPDATE users SET password = ? WHERE id = ?').run(hash, userId);
    logAdminAction(req, 'force_password_reset', 'user', userId, '');
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: 'Failed to reset password' });
  }
});

// ══════════════════════════════════════════════════════════════════════════════
// AUTO-SELL ENGINE — runs every 60 seconds
// ══════════════════════════════════════════════════════════════════════════════
const BUYER_NAMES = ['Alex', 'Maria', 'Sam', 'Liu', 'Priya', 'Omar', 'Zara', 'Jonas', 'Amara', 'Yuki', 'Ravi', 'Sofia', 'Nour', 'Kai', 'Ines', 'Dan', 'Leila', 'Jin', 'Tomas', 'Aisha'];
const BUYER_COUNTRIES = [
  { name: 'United States', flag: '🇺🇸' }, { name: 'India', flag: '🇮🇳' },
  { name: 'Germany', flag: '🇩🇪' },       { name: 'Japan', flag: '🇯🇵' },
  { name: 'Brazil', flag: '🇧🇷' },        { name: 'Canada', flag: '🇨🇦' },
  { name: 'Australia', flag: '🇦🇺' },     { name: 'France', flag: '🇫🇷' },
  { name: 'UK', flag: '🇬🇧' },            { name: 'UAE', flag: '🇦🇪' },
  { name: 'Saudi Arabia', flag: '🇸🇦' },  { name: 'Turkey', flag: '🇹🇷' },
  { name: 'Nigeria', flag: '🇳🇬' },       { name: 'Indonesia', flag: '🇮🇩' },
  { name: 'Bangladesh', flag: '🇧🇩' },    { name: 'Pakistan', flag: '🇵🇰' },
  { name: 'Mexico', flag: '🇲🇽' },        { name: 'South Korea', flag: '🇰🇷' },
];
const SELL_DURATIONS = [3, 7, 14, 30];

const autoSellTx = db.transaction(() => {
  const staleItems = stmts.getStaleActiveItems.all();
  for (const item of staleItems) {
    stmts.markItemSold.run(item.id);
    const buyer   = BUYER_NAMES[Math.floor(Math.random() * BUYER_NAMES.length)];
    const country = BUYER_COUNTRIES[Math.floor(Math.random() * BUYER_COUNTRIES.length)];
    const days    = SELL_DURATIONS[Math.floor(Math.random() * SELL_DURATIONS.length)];
    stmts.insertNotification.run(
      item.user_id,
      `${item.device_name} — Your manufactured device sold to ${buyer} from ${country.name} ${country.flag} for ${days} days • $${item.price}`,
      'sold'
    );
  }
  return staleItems.length;
});

setInterval(() => {
  try {
    const count = autoSellTx();
    if (count > 0) console.log(`[AutoSell] Sold ${count} item(s)`);
  } catch (err) {
    console.error('[AutoSell] Error:', err.message);
  }
}, 60_000);

// ── Support chat auto-delete (24 hours) ──────────────────────────────────────
setInterval(() => {
  try {
    const deleted = db.prepare(
      "DELETE FROM support_chats WHERE created_at < datetime('now', '-24 hours')"
    ).run();
    if (deleted.changes > 0) console.log(`[SupportClean] Deleted ${deleted.changes} old message(s)`);
  } catch (err) {
    console.error('[SupportClean] Error:', err.message);
  }
}, 10 * 60_000); // every 10 minutes

// ══════════════════════════════════════════════════════════════════════════════
// PUSH NOTIFICATION ENDPOINTS
// ══════════════════════════════════════════════════════════════════════════════

// Get VAPID public key
app.get('/api/push/vapid-public-key', (_req, res) => {
  res.json({ publicKey: VAPID_PUBLIC });
});

// Subscribe / update push subscription
app.post('/api/push/subscribe', authRequired, (req, res) => {
  const { endpoint, p256dh, auth } = req.body || {};
  if (!endpoint || !p256dh || !auth) return res.status(400).json({ error: 'Invalid subscription' });
  stmts.upsertPushSubscription.run({ user_id: req.auth.userId, endpoint, p256dh, auth });
  res.json({ ok: true });
});

// Unsubscribe
app.post('/api/push/unsubscribe', authRequired, (req, res) => {
  const { endpoint } = req.body || {};
  if (endpoint) stmts.deletePushSubscription.run(req.auth.userId, endpoint);
  res.json({ ok: true });
});

// ── POST /api/user/location — store user's GPS location ──────────────────────
app.post('/api/user/location', authRequired, (req, res) => {
  const { lat, lng, accuracy } = req.body || {};
  if (lat == null || lng == null) return res.status(400).json({ error: 'lat/lng required' });
  const latN = Number(lat), lngN = Number(lng), accN = Number(accuracy) || 0;
  if (isNaN(latN) || isNaN(lngN)) return res.status(400).json({ error: 'Invalid coordinates' });
  try {
    stmts.upsertUserLocation.run(req.auth.userId, latN, lngN, accN);
    res.json({ ok: true });
  } catch (e) {
    res.status(500).json({ error: 'Failed to save location' });
  }
});

// ── GET /api/admin/live-locations — all active user locations (admin only) ───
app.get('/api/admin/live-locations', authRequired, (req, res) => {
  if (!requireAdmin(req, res)) return;
  try {
    const locations = stmts.getAllUserLocations.all();
    res.json({ locations });
  } catch (e) {
    res.status(500).json({ error: 'Failed to fetch locations' });
  }
});

// ══════════════════════════════════════════════════════════════════════════════
// TEAM CHAT ENDPOINTS
// ══════════════════════════════════════════════════════════════════════════════

// Get team chat messages (newest first, then reverse for display)
app.get('/api/team-chat', authRequired, (req, res) => {
  const rows = stmts.getTeamChat.all().reverse();
  res.json({ messages: rows });
});

// Get unread count
app.get('/api/team-chat/unread', authRequired, (req, res) => {
  const row = stmts.getTeamChatUnread.get(req.auth.userId);
  res.json({ unread: Math.max(0, row?.unread || 0) });
});

// Mark all as read
app.post('/api/team-chat/read', authRequired, (req, res) => {
  stmts.markTeamChatRead.run(req.auth.userId);
  res.json({ ok: true });
});

// Send a text message
app.post('/api/team-chat', authRequired, async (req, res) => {
  const { message } = req.body || {};
  if (!message || String(message).trim().length === 0) return res.status(400).json({ error: 'Empty message' });
  const txt = String(message).trim().slice(0, 500);
  const user = stmts.getUserById.get(req.auth.userId);
  if (!user) return res.status(404).json({ error: 'User not found' });

  stmts.insertTeamChat.run({
    user_id: user.id,
    username: user.name,
    avatar: user.avatar || '🧑',
    message: txt,
    media_url: null,
    media_type: null,
  });

  // Broadcast push to others
  broadcastPush({
    title: `💬 Team Chat — ${user.name}`,
    body: txt,
    icon: '/logo.png',
    url: '/teamchat',
    tag: 'team-chat',
  }, user.id);

  res.json({ ok: true });
});

// Upload photo/file and post to team chat
app.post('/api/team-chat/upload', authRequired, upload.single('file'), async (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'No file uploaded' });
  const user = stmts.getUserById.get(req.auth.userId);
  if (!user) return res.status(404).json({ error: 'User not found' });

  const isImage = /\.(jpg|jpeg|png|gif|webp)$/i.test(req.file.filename);
  const media_type = isImage ? 'image' : 'file';
  const media_url = `/uploads/${req.file.filename}`;
  const caption = String(req.body.caption || '').trim().slice(0, 200);

  stmts.insertTeamChat.run({
    user_id: user.id,
    username: user.name,
    avatar: user.avatar || '🧑',
    message: caption,
    media_url,
    media_type,
  });

  // Broadcast push for new media
  broadcastPush({
    title: `📎 Team Chat — ${user.name}`,
    body: isImage ? '📷 ছবি পাঠিয়েছে' : `📁 ফাইল: ${req.file.originalname}`,
    icon: '/logo.png',
    url: '/teamchat',
    tag: 'team-chat',
  }, user.id);

  res.json({ ok: true, media_url, media_type });
});

// ── Admin Group Chat ──────────────────────────────────────────────────────────
app.get('/api/admin/group-chat', authRequired, (req, res) => {
  if (!requireAdmin(req, res)) return;
  const since = Number(req.query.since || 0);
  const msgs = since
    ? stmts.getAdminMessagesSince.all(since)
    : stmts.getAdminMessages.all().reverse();
  res.json({ messages: msgs });
});

app.post('/api/admin/group-chat/send', authRequired, (req, res) => {
  if (!requireAdmin(req, res)) return;
  const { message } = req.body || {};
  if (!message || !String(message).trim()) return res.status(400).json({ error: 'Empty message' });
  const admin = req.auth.user;
  // Main admin can only read; block sending
  if (isMainAdminUser(admin)) {
    return res.status(403).json({ error: 'Main admin is read-only in group chat' });
  }
  const result = stmts.insertAdminMessage.run({
    sender_id: admin.id,
    sender_name: admin.name,
    message: String(message).trim().slice(0, 2000),
    media_url: null,
    media_type: null,
  });
  res.json({ ok: true, id: result.lastInsertRowid });
});

app.post('/api/admin/group-chat/upload', authRequired, upload.single('file'), (req, res) => {
  if (!requireAdmin(req, res)) return;
  const admin = req.auth.user;
  if (isMainAdminUser(admin)) {
    return res.status(403).json({ error: 'Main admin is read-only in group chat' });
  }
  if (!req.file) return res.status(400).json({ error: 'No file' });
  const isImage = req.file.mimetype.startsWith('image/');
  const media_url = `/uploads/${req.file.filename}`;
  const media_type = isImage ? 'image' : 'file';
  const caption = String(req.body.caption || '').trim().slice(0, 500);
  const result = stmts.insertAdminMessage.run({
    sender_id: admin.id,
    sender_name: admin.name,
    message: caption,
    media_url,
    media_type,
  });
  res.json({ ok: true, id: result.lastInsertRowid, media_url, media_type });
});

// ── Forgot Password ───────────────────────────────────────────────────────────
app.post('/api/forgot-password', (req, res) => {
  const { identifier } = req.body || {};
  if (!identifier) return res.status(400).json({ error: 'Identifier required' });
  const user = db.prepare("SELECT * FROM users WHERE identifier = ? AND is_admin = 0 AND banned = 0").get(String(identifier).trim());
  // Always return success (don't reveal if account exists)
  if (!user) return res.status(200).json({ ok: true });
  // Generate 6-digit token
  const token = Math.floor(100000 + Math.random() * 900000).toString();
  const expiresAt = new Date(Date.now() + 30 * 60 * 1000).toISOString().replace('T', ' ').slice(0, 19);
  try { stmts.insertPasswordReset.run(user.id, token, expiresAt); } catch (_) {}
  // Notify main admin via system notification
  const mainAdmin = db.prepare("SELECT id FROM users WHERE refer_code=? AND is_admin=1 LIMIT 1").get(MAIN_ADMIN_REFER_CODE);
  if (mainAdmin) {
    const adminNotifMsg = JSON.stringify({ en: `🔑 Password Reset: ${user.name} (${user.identifier}) — Code: ${token}`, bn: `🔑 পাসওয়ার্ড রিসেট: ${user.name} (${user.identifier}) — কোড: ${token}` });
    stmts.insertNotification.run(mainAdmin.id, adminNotifMsg, 'info');
  }
  res.json({ ok: true });
});

app.post('/api/reset-password', (req, res) => {
  const { token, newPassword } = req.body || {};
  if (!token || !newPassword) return res.status(400).json({ error: 'Token and new password required' });
  if (String(newPassword).length < 6) return res.status(400).json({ error: 'Password must be at least 6 characters' });
  const reset = stmts.getPasswordReset.get(String(token).trim());
  if (!reset) return res.status(400).json({ error: 'Invalid or expired reset code' });
  const bcrypt = require('bcryptjs');
  const hash = bcrypt.hashSync(String(newPassword), 10);
  stmts.updateUserPassword.run(hash, reset.user_id);
  stmts.markPasswordResetUsed.run(token);
  res.json({ ok: true, msg: 'Password reset successfully. You can now log in.' });
});

// ── Reset Database (main admin only) ─────────────────────────────────────────
app.post('/api/admin/reset-database', authRequired, (req, res) => {
  if (!req.auth?.isMainAdmin) return res.status(403).json({ error: 'Main admin only' });
  const { confirmPhrase } = req.body || {};
  if (confirmPhrase !== 'RESET CONFIRM') return res.status(400).json({ error: 'Confirmation phrase required' });

  try {
    // Save main admin before clearing
    const mainAdmin = db.prepare("SELECT * FROM users WHERE refer_code = ?").get(MAIN_ADMIN_REFER_CODE);

    // Clear all user data tables
    const tablesToClear = [
      'transactions', 'balance_log', 'notifications', 'support_chats',
      'support_sessions', 'team_chat', 'team_chat_reads', 'manufacturing_jobs',
      'referral_activity', 'admin_activity_log', 'login_logs',
      'telegram_action_logs', 'tg_msg_map', 'user_locations',
      'push_subscriptions', 'pending_registrations', 'admin_permissions',
      'admin_messages',
    ];

    db.transaction(() => {
      // Delete all users except main admin
      db.prepare("DELETE FROM users WHERE refer_code != ?").run(MAIN_ADMIN_REFER_CODE);
      // Clear all other tables
      for (const tbl of tablesToClear) {
        try { db.prepare(`DELETE FROM ${tbl}`).run(); } catch (_) {}
      }
      // Reset sqlite sequences
      try { db.prepare("DELETE FROM sqlite_sequence WHERE name != 'plans' AND name != 'app_settings' AND name != 'canned_responses'").run(); } catch (_) {}
    })();

    console.log(`[Admin] Database reset by main admin (${req.auth.identifier}) at ${new Date().toISOString()}`);
    res.json({ ok: true, message: 'Database reset complete. All user data has been cleared.' });
  } catch (err) {
    console.error('[Reset DB]', err);
    res.status(500).json({ error: 'Reset failed: ' + err.message });
  }
});

// ── SPA fallback — serve index.html for non-API routes ───────────────────────
app.get('*', (_req, res) => {
  res.sendFile(path.join(__dirname, '..', 'dist', 'index.html'));
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`PhoneCraft API running on port ${PORT}`);
  console.log(`[Telegram] Finance bot configured: ${FINANCE_BOT ? 'yes' : 'no'} | finance chats: ${FINANCE_CHAT_IDS.length}`);
  console.log(`[Telegram] Support bot configured: ${SUPPORT_BOT ? 'yes' : 'no'} | support chats: ${SUPPORT_CHAT_IDS.length}`);
  console.log(`[Telegram] Admin chat ids configured: ${ADMIN_CHAT_IDS.length}`);

  // Auto-register Telegram webhooks on startup
  const webhookBase = process.env.WEBHOOK_URL;
  if (SUPPORT_BOT && webhookBase) {
    const webhookUrl = `${webhookBase}/webhook/telegram`;
    fetch(`https://api.telegram.org/bot${SUPPORT_BOT}/setWebhook`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url: webhookUrl, allowed_updates: ['message'] }),
    })
      .then(r => r.json())
      .then(d => console.log(`[Telegram] Support webhook ${d.ok ? 'registered ✓' : 'failed ✗'}: ${webhookUrl}`))
      .catch(e => console.error('[Telegram] Support webhook registration failed:', e.message));
  }

  if (FINANCE_BOT && webhookBase) {
    const financeWebhookUrl = `${webhookBase}/webhook/telegram/finance`;
    fetch(`https://api.telegram.org/bot${FINANCE_BOT}/setWebhook`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url: financeWebhookUrl, allowed_updates: ['message'] }),
    })
      .then(r => r.json())
      .then(d => console.log(`[Telegram] Finance webhook ${d.ok ? 'registered ✓' : 'failed ✗'}: ${financeWebhookUrl}`))
      .catch(e => console.error('[Telegram] Finance webhook registration failed:', e.message));
  }
});
