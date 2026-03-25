const express  = require('express');
const cors     = require('cors');
const bcrypt   = require('bcryptjs');
const crypto   = require('crypto');
const path     = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });
require('dotenv').config();

const { db, stmts, sanitizeUser, todayDate } = require('./db');
const { TelegramService } = require('./services/telegramService');

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
  res.setHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
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
app.set('trust proxy', true);

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
const registerLimiter = createRateLimiter({ windowMs: 15 * 60_000, max: 10, prefix: 'register' });
const financeLimiter = createRateLimiter({ windowMs: 5 * 60_000, max: 20, prefix: 'finance' });
const supportLimiter = createRateLimiter({ windowMs: 60_000, max: 20, prefix: 'support' });

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
        note: `উইথড্র রিফান্ড (প্রত্যাখ্যাত) — ${tx.method}`,
      });
    }

    if (tx.type === 'deposit' && status === 'approved') {
      stmts.creditBalance.run(tx.amount, tx.user_id);
      stmts.insertBalanceLog.run({
        user_id: tx.user_id,
        type: 'deposit',
        amount: tx.amount,
        note: `ডিপোজিট অনুমোদিত (${tx.method} - ${tx.account})`,
      });
    }

    const action = status === 'approved' ? 'approved' : 'rejected';
    const noteStr = adminNote ? ` Note: ${adminNote}` : '';
    const notifMsg = `Your ${tx.type} of ৳${tx.amount.toLocaleString()} has been ${action}.${noteStr}`;
    stmts.insertNotification.run(tx.user_id, notifMsg, status === 'approved' ? 'success' : 'warning');

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
    const { name, identifier, password, plan, refCode } = req.body || {};

    if (!name || !identifier || !password || !plan || !refCode)
      return res.status(400).json({ error: 'All fields are required including referral code' });

    if (stmts.getUserByIdentifier.get(identifier))
      return res.status(400).json({ error: 'This email/phone is already registered' });

    const referrer = stmts.getUserByReferCode.get(refCode);
    if (!referrer)
      return res.status(404).json({ error: 'Invalid referral code' });

    const planRow = stmts.getPlan.get(plan);
    if (!planRow)
      return res.status(400).json({ error: 'Invalid plan selected' });

    if (referrer.balance < planRow.rate)
      return res.status(400).json({ error: 'insufficient_balance', needed: planRow.rate, plan_name: planRow.name });

    const hash = bcrypt.hashSync(password, 10);

    const prefix = name.trim().split(' ')[0].substring(0, 3).toUpperCase();
    let newReferCode;
    let attempts = 0;
    do {
      newReferCode = prefix + Math.random().toString(36).substr(2, 4).toUpperCase();
      attempts++;
    } while (stmts.getUserByReferCode.get(newReferCode) && attempts < 20);

    const pending = stmts.insertPendingReg.run({
      name: name.trim(), identifier: identifier.trim(),
      password_hash: hash, plan_id: plan,
      refer_code_used: refCode, referrer_id: referrer.id,
      new_refer_code: newReferCode, plan_rate: planRow.rate,
    });
    const pendingId = pending.lastInsertRowid;

    const meta = JSON.stringify({ pending_id: pendingId, plan_name: planRow.name, amount: planRow.rate, new_user_name: name.trim() });
    stmts.insertNotifWithMeta.run(
      referrer.id,
      `🔔 ${name.trim()} আপনার রেফারেল কোড ব্যবহার করে ${planRow.name} প্ল্যানে যোগ দিতে চাইছেন। আপনার ব্যালেন্স থেকে ৳${planRow.rate.toLocaleString()} কাটা হবে।`,
      'registration_request',
      meta
    );

    // Alert admins on Telegram (fire-and-forget)
    sendTelegram([
      `🔔 <b>নতুন Registration Request</b>`,
      `━━━━━━━━━━━━━━━━━━━`,
      `👤 নাম: <b>${name.trim()}</b>`,
      `📋 প্ল্যান: <b>${planRow.name}</b> (৳${planRow.rate.toLocaleString()})`,
      `🔗 রেফারার: <b>${referrer.name}</b>`,
      `🆔 Pending ID: #${pendingId}`,
      `🕐 সময়: ${new Date().toLocaleString('bn-BD', { timeZone: 'Asia/Dhaka' })}`,
      `━━━━━━━━━━━━━━━━━━━`,
      `✅ রেফারারের নোটিফিকেশনে Approve/Decline অপশন আছে।`,
    ].join('\n')).catch(() => {});

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
        if (bonus > 0 && currentUser) {
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
            note: `${pending.name}-এর নিবন্ধন থেকে L${lvl} কমিশন (${pct}%)`,
          });
          stmts.insertNotification.run(
            currentUser.id,
            `🎁 রেফারেল বোনাস: ${pending.name}-এর নিবন্ধন থেকে L${lvl} কমিশন +৳${bonus.toLocaleString()} আপনার ব্যালেন্সে যোগ হয়েছে।`,
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
        `✅ আপনি ${pending.name}-এর নিবন্ধন অনুমোদন করেছেন। আপনার ব্যালেন্স থেকে ৳${pending.plan_rate.toLocaleString()} কাটা হয়েছে।`,
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

    // Capture login info
    const ip = req.headers['x-forwarded-for']?.split(',')[0]?.trim() || req.ip || 'unknown';
    const userAgent = req.headers['user-agent'] || 'unknown';

    const logResult = stmts.insertLoginLog.run({
      user_id: user.id, ip, user_agent: userAgent, city: '', country: '',
    });
    const logId = logResult.lastInsertRowid;

    // Async geolocation (fire-and-forget, never blocks response)
    const cleanIp = (ip === '::1' || ip === '127.0.0.1' || ip === '::ffff:127.0.0.1') ? '' : ip;
    if (cleanIp) {
      fetch(`http://ip-api.com/json/${cleanIp}?fields=city,country`)
        .then(r => r.json())
        .then(geo => {
          if (geo.city || geo.country) {
            stmts.updateLoginLogGeo.run(geo.city || '', geo.country || '', logId);
          }
        })
        .catch(() => {});
    }

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
    const activeJob = stmts.getProcessingJobByUser.get(userId) || null;
    res.json({
      dailyDone,
      dailyLimit: plan.daily,
      canWork:    dailyDone < plan.daily,
      perTask:    plan.per_task,
      activeJob,
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

  const existingJob = stmts.getProcessingJobByUser.get(userId);
  if (existingJob) {
    return {
      status: 200,
      body: {
        job: existingJob,
        resumed: true,
        dailyDone: user.daily_done,
        dailyLimit: stmts.getPlan.get(user.plan_id).daily,
      },
    };
  }

  const plan = stmts.getPlan.get(user.plan_id);
  if (user.daily_done >= plan.daily) {
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
      dailyLimit: plan.daily,
    },
  };
});

app.post('/api/manufacture/start', authRequired, (req, res) => {
  try {
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

  // Complete the job
  const updated = stmts.completeJob.run('completed', earned, jobId, userId, 'processing');
  if (updated.changes === 0) {
    return { status: 400, body: { error: 'Failed to complete job' } };
  }

  const completedToday = stmts.getCompletedJobCountToday.get(userId)?.count || 0;
  stmts.setDailyDone.run(completedToday, userId);

  // Credit user balance
  stmts.creditBalance.run(earned, userId);

  // Log to balance_log
  stmts.insertBalanceLog.run({
    user_id: userId, type: 'daily_earn', amount: earned,
    note: `${job.device_name} উৎপাদন সম্পন্ন`,
  });

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

  return {
    status: 200,
    body: {
      job: completedJob,
      marketplaceItemId: marketResult.lastInsertRowid,
      marketPrice,
      earned,
      newBalance:  updatedUser.balance,
      dailyDone:   updatedUser.daily_done,
      dailyLimit:  plan.daily,
    },
  };
});

app.post('/api/manufacture/complete', authRequired, (req, res) => {
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

// ── Deposit payment info (public) ────────────────────────────────────────────
app.get('/api/deposit-info', (req, res) => {
  try {
    const rows = stmts.getAllSettings.all();
    const info = {};
    rows.forEach(r => { info[r.key] = r.value; });
    res.json({
      bkash:             info.deposit_bkash       || '',
      nagad:             info.deposit_nagad       || '',
      rocket:            info.deposit_rocket      || '',
      bank:              info.deposit_bank        || '',
      crypto_usdt_trc20: info.crypto_usdt_trc20 || '',
      crypto_usdt_bep20: info.crypto_usdt_bep20 || '',
      crypto_usdt_erc20: info.crypto_usdt_erc20 || '',
      crypto_bnb:        info.crypto_bnb        || '',
      crypto_eth:        info.crypto_eth        || '',
      crypto_btc:        info.crypto_btc        || '',
      crypto_trx:        info.crypto_trx        || '',
      crypto_ltc:        info.crypto_ltc        || '',
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch deposit info' });
  }
});

// ── Admin settings ────────────────────────────────────────────────────────────
app.get('/api/admin/settings', authRequired, (req, res) => {
  if (!requireAdmin(req, res)) return;
  if (!req.auth.isMainAdmin) return res.status(403).json({ error: 'Main admin access required' });
  try {
    const rows = stmts.getAllSettings.all();
    const settings = {};
    rows.forEach(r => { settings[r.key] = r.value; });
    res.json({ settings });
  } catch (err) { res.status(500).json({ error: 'Failed' }); }
});

app.post('/api/admin/settings', authRequired, (req, res) => {
  if (!requireAdmin(req, res)) return;
  if (!req.auth.isMainAdmin) return res.status(403).json({ error: 'Main admin access required' });
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

// ── Change password ──────────────────────────────────────────────────────────
app.patch('/api/user/:id/change-password', authRequired, requireSelfOrAdmin('id'), async (req, res) => {
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
  const { amount, method, account, type } = req.body || {};

  if (!amount || !method || !account || !type) {
    return res.status(400).json({ error: 'Missing fields' });
  }
  if (!['withdraw', 'deposit'].includes(type)) {
    return res.status(400).json({ error: 'Invalid type' });
  }
  const numAmount = Number(amount);
  if (isNaN(numAmount) || numAmount <= 0) {
    return res.status(400).json({ error: 'Invalid amount' });
  }

  try {
    const result = db.transaction(() => {
      const userRow = stmts.getUserById.get(req.auth.userId);
      if (!userRow) return { status: 404, body: { error: 'User not found' } };
      if (userRow.banned) return { status: 403, body: { error: 'Account suspended' } };
      if (type === 'withdraw') {
        if (userRow.balance < numAmount) {
          return { status: 400, body: { error: 'Insufficient balance' } };
        }
        const deducted = stmts.deductBalance.run(numAmount, userRow.id, numAmount);
        if (deducted.changes === 0) {
          return { status: 400, body: { error: 'Insufficient balance' } };
        }
        stmts.insertBalanceLog.run({
          user_id: userRow.id, type: 'withdrawal', amount: -numAmount,
          note: `উইথড্র রিকোয়েস্ট (${method} - ${account})`,
        });
      }
      if (type === 'deposit') {
        // Do NOT credit balance immediately — wait for admin approval
        // Balance will be credited when admin approves via /api/admin/transactions/:id
      }

      // Insert transaction record
      const txResult = stmts.insertTransaction.run({
        user_id: userRow.id, type, amount: numAmount,
        method, account, status: 'pending',
      });

      // Notify all admin users
      const admins = stmts.getAdminUsers.all();
      const notifMsg = `New ${type} request: ৳${numAmount.toLocaleString()} from ${userRow.name} (${method})`;
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
      };
    })();

    if (result.status !== 200) {
      return res.status(result.status).json(result.body);
    }

    // Send Telegram event notification (fire-and-forget, outside transaction)
    const txId = result.body.transactionId;
    const payload = {
      userId: req.auth.userId,
      amount: Number(amount),
      requestId: txId,
      paymentMethod: String(method || '').toUpperCase(),
      accountNumber: account,
      timestamp: new Date().toISOString(),
    };

    if (type === 'deposit') {
      telegramService.sendDepositNotification(payload).catch((err) => {
        console.error('Finance Telegram error:', err.message);
      });
    } else {
      telegramService.sendWithdrawNotification(payload).catch((err) => {
        console.error('Finance Telegram error:', err.message);
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
  if (!user) return res.status(404).json({ error: 'User not found' });
  res.json({ name: user.name, identifier: user.identifier });
});

// ── Credit Transfer ───────────────────────────────────────────────────────────
app.post('/api/transfer', authRequired, financeLimiter, (req, res) => {
  const { toIdentifier, amount } = req.body || {};
  if (!toIdentifier || !amount) {
    return res.status(400).json({ error: 'Missing fields' });
  }
  const numAmount = Number(amount);
  if (isNaN(numAmount) || numAmount <= 0) {
    return res.status(400).json({ error: 'Invalid amount' });
  }
  try {
    const result = db.transaction(() => {
      const sender = stmts.getUserById.get(req.auth.userId);
      if (!sender) return { status: 404, body: { error: 'Sender not found' } };
      if (sender.banned) return { status: 403, body: { error: 'Account suspended' } };
      if (sender.balance < numAmount) return { status: 400, body: { error: 'Insufficient balance' } };

      const receiver = stmts.getUserByIdentifier.get(toIdentifier);
      if (!receiver) return { status: 404, body: { error: 'Receiver not found' } };
      if (receiver.id === sender.id) return { status: 400, body: { error: 'Cannot transfer to yourself' } };

      stmts.deductBalance.run(numAmount, sender.id, numAmount);
      stmts.insertBalanceLog.run({
        user_id: sender.id, type: 'transfer_sent', amount: -numAmount,
        note: `${receiver.name}-কে ট্রান্সফার`,
      });

      stmts.creditBalance.run(numAmount, receiver.id);
      stmts.insertBalanceLog.run({
        user_id: receiver.id, type: 'transfer_received', amount: numAmount,
        note: `${sender.name}-এর কাছ থেকে ট্রান্সফার`,
      });

      stmts.insertNotification.run(
        receiver.id,
        `${sender.name} আপনাকে ৳${numAmount.toLocaleString()} ট্রান্সফার করেছেন।`,
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
app.post('/api/support/message', supportLimiter, async (req, res) => {
  const { sessionId, message, senderName } = req.body || {};
  if (!sessionId || !message) return res.status(400).json({ error: 'Missing fields' });
  try {
    stmts.insertSupportMsg.run(sessionId, 'user', message.trim());

    await telegramService.forwardSupportMessage({
      sessionId,
      message: message.trim(),
      senderName,
    }).catch((err) => {
      console.error('Support Telegram error:', err.message);
    });

    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: 'Failed to send message' });
  }
});

app.get('/api/support/messages/:sessionId', (req, res) => {
  try {
    const msgs = stmts.getSupportMsgs.all(req.params.sessionId);
    res.json({ messages: msgs });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch messages' });
  }
});

// ── Admin Support: list sessions ────────────────────────────────────────────
app.get('/api/admin/support/sessions', authRequired, (req, res) => {
  if (!requireAdmin(req, res)) return;
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
      if ((req.body.balance !== undefined && Number(req.body.balance) !== Number(user.balance)) ||
          (req.body.plan_id !== undefined && req.body.plan_id !== user.plan_id)) {
        return res.status(403).json({ error: 'You cannot modify user balance or plan' });
      }
      if (id === adminId && req.body.banned !== undefined && req.body.banned) {
        return res.status(400).json({ error: 'Cannot ban yourself' });
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
        note: `Admin ব্যালেন্স সংশোধন: ৳${user.balance.toLocaleString()} → ৳${balance.toLocaleString()}`,
      });
      stmts.insertNotification.run(id, `Your balance has been updated to ৳${balance.toLocaleString()}`, 'info');
    }

    if (plan_id !== user.plan_id) {
      stmts.insertNotification.run(id, `Your plan has been changed to ${plan.name}`, 'info');
    }

    if (banned !== user.banned) {
      stmts.insertNotification.run(id, banned ? 'Your account has been suspended' : 'Your account has been reactivated', banned ? 'warning' : 'success');
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
    const { status, admin_note } = req.body || {};

    const result = processTransactionAction({
      txId,
      status,
      adminNote: admin_note || '',
    });

    // Notify admin on Telegram about approval/rejection
    if (result.status === 200) {
      const tx = result.body.transaction;
      logAdminAction(req, `transaction_${status}`, 'transaction', txId, `${tx.type} ৳${tx.amount}`);
      const icon = status === 'approved' ? '✅' : '❌';
      const tgMsg = [
        `${icon} <b>${tx.type === 'deposit' ? 'Deposit' : 'Withdraw'} ${status === 'approved' ? 'Approved' : 'Rejected'}</b>`,
        `👤 User ID: ${tx.user_id}`,
        `💵 পরিমাণ: <b>৳${tx.amount.toLocaleString()}</b>`,
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

// ── GET /api/admin/stats — enhanced financial dashboard data ─────────────────
app.get('/api/admin/stats', authRequired, (req, res) => {
  if (!requireAdmin(req, res)) return;
  if (!req.auth.isMainAdmin) return res.status(403).json({ error: 'Main admin access required' });
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
  if (!req.auth.isMainAdmin) return res.status(403).json({ error: 'Main admin access required' });
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
  try {
    const userId = Number(req.params.id);
    const user = stmts.getUserById.get(userId);
    if (!user) return res.status(404).json({ error: 'User not found' });

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
  if (!req.auth.isMainAdmin) return res.status(403).json({ error: 'Main admin access required' });
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
  if (!req.auth.isMainAdmin) return res.status(403).json({ error: 'Main admin access required' });
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
  if (!req.auth.isMainAdmin) return res.status(403).json({ error: 'Main admin access required' });
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
