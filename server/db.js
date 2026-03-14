const Database = require('better-sqlite3');
const bcrypt = require('bcryptjs');
const path = require('path');

const DB_PATH = path.join(__dirname, 'phonecraft.db');
const db = new Database(DB_PATH);

// Enable WAL mode for better concurrent performance
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

// ── Schema ──────────────────────────────────────────────────────────────────────
db.exec(`
  CREATE TABLE IF NOT EXISTS plans (
    id            TEXT PRIMARY KEY,
    name          TEXT NOT NULL,
    price_display TEXT NOT NULL,
    rate          INTEGER NOT NULL,
    per_task      INTEGER NOT NULL,
    daily_earn    INTEGER NOT NULL,
    daily         INTEGER NOT NULL,
    task_time     INTEGER NOT NULL,
    color         TEXT NOT NULL,
    l1            INTEGER NOT NULL,
    l2            INTEGER NOT NULL,
    l3            INTEGER NOT NULL
  );

  CREATE TABLE IF NOT EXISTS users (
    id              INTEGER PRIMARY KEY AUTOINCREMENT,
    name            TEXT NOT NULL,
    identifier      TEXT UNIQUE NOT NULL,
    password        TEXT NOT NULL,
    plan_id         TEXT NOT NULL REFERENCES plans(id),
    balance         REAL DEFAULT 0,
    daily_done      INTEGER DEFAULT 0,
    last_task_reset TEXT DEFAULT '',
    refer_code      TEXT UNIQUE NOT NULL,
    referred_by     TEXT,
    avatar          TEXT DEFAULT '🧑',
    created_at      TEXT DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS manufacturing_jobs (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id     INTEGER NOT NULL REFERENCES users(id),
    device_name TEXT NOT NULL,
    brand       TEXT NOT NULL,
    ram         TEXT NOT NULL,
    rom         TEXT NOT NULL,
    color       TEXT NOT NULL,
    progress    INTEGER DEFAULT 0,
    status      TEXT DEFAULT 'processing',
    earned      INTEGER DEFAULT 0,
    created_at  TEXT DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS marketplace_items (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id     INTEGER NOT NULL REFERENCES users(id),
    job_id      INTEGER NOT NULL REFERENCES manufacturing_jobs(id),
    device_name TEXT NOT NULL,
    brand       TEXT NOT NULL,
    specs       TEXT NOT NULL,
    price       INTEGER NOT NULL,
    status      TEXT DEFAULT 'active',
    created_at  TEXT DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS notifications (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id     INTEGER NOT NULL REFERENCES users(id),
    message     TEXT NOT NULL,
    type        TEXT DEFAULT 'success',
    read        INTEGER DEFAULT 0,
    created_at  TEXT DEFAULT (datetime('now'))
  );
`);

// Add last_task_reset column if upgrading from older schema
try { db.exec('ALTER TABLE users ADD COLUMN last_task_reset TEXT DEFAULT ""'); } catch (_) {}
// Add sold_at column if upgrading from older schema
try { db.exec('ALTER TABLE marketplace_items ADD COLUMN sold_at TEXT DEFAULT NULL'); } catch (_) {}
// Add admin/ban columns if upgrading from older schema
try { db.exec('ALTER TABLE users ADD COLUMN is_admin INTEGER DEFAULT 0'); } catch (_) {}
try { db.exec('ALTER TABLE users ADD COLUMN banned INTEGER DEFAULT 0'); } catch (_) {}
// Add meta column to notifications (for actionable notifications)
try { db.exec('ALTER TABLE notifications ADD COLUMN meta TEXT DEFAULT NULL'); } catch (_) {}
// Add avatar_img column for user profile photo
try { db.exec('ALTER TABLE users ADD COLUMN avatar_img TEXT DEFAULT NULL'); } catch (_) {}

// Referral activity log (deductions + bonuses from referrals)
db.exec(`
  CREATE TABLE IF NOT EXISTS referral_activity (
    id                INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id           INTEGER NOT NULL REFERENCES users(id),
    type              TEXT NOT NULL,
    level             INTEGER DEFAULT 0,
    amount            REAL NOT NULL,
    description       TEXT DEFAULT '',
    related_user_name TEXT DEFAULT '',
    created_at        TEXT DEFAULT (datetime('now'))
  );
`);

// Login tracking table
db.exec(`
  CREATE TABLE IF NOT EXISTS login_logs (
    id         INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id    INTEGER NOT NULL REFERENCES users(id),
    ip         TEXT DEFAULT '',
    user_agent TEXT DEFAULT '',
    city       TEXT DEFAULT '',
    country    TEXT DEFAULT '',
    logged_at  TEXT DEFAULT (datetime('now'))
  );
`);

// Transactions table (withdraw/deposit tracking)
db.exec(`
  CREATE TABLE IF NOT EXISTS transactions (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id     INTEGER NOT NULL REFERENCES users(id),
    type        TEXT NOT NULL CHECK(type IN ('withdraw', 'deposit')),
    amount      REAL NOT NULL,
    method      TEXT NOT NULL,
    account     TEXT NOT NULL,
    status      TEXT NOT NULL DEFAULT 'pending' CHECK(status IN ('pending', 'approved', 'rejected')),
    admin_note  TEXT DEFAULT '',
    created_at  TEXT DEFAULT (datetime('now')),
    updated_at  TEXT DEFAULT (datetime('now'))
  );
`);

// Unified balance log — every credit/debit recorded here
db.exec(`
  CREATE TABLE IF NOT EXISTS balance_log (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id     INTEGER NOT NULL REFERENCES users(id),
    type        TEXT NOT NULL,
    amount      REAL NOT NULL,
    note        TEXT DEFAULT '',
    created_at  TEXT DEFAULT (datetime('now'))
  );
`);

// Live support chat messages
db.exec(`
  CREATE TABLE IF NOT EXISTS support_chats (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    session_id  TEXT NOT NULL,
    sender      TEXT NOT NULL,
    message     TEXT NOT NULL,
    created_at  TEXT DEFAULT (datetime('now'))
  );
`);

// Telegram message_id → support session mapping (for webhook replies)
db.exec(`
  CREATE TABLE IF NOT EXISTS tg_msg_map (
    tg_message_id INTEGER PRIMARY KEY,
    session_id    TEXT NOT NULL,
    created_at    TEXT DEFAULT (datetime('now'))
  );
`);

// App settings (key-value store for deposit numbers, etc.)
db.exec(`
  CREATE TABLE IF NOT EXISTS app_settings (
    key   TEXT PRIMARY KEY,
    value TEXT NOT NULL DEFAULT ''
  );
`);

// Seed default deposit numbers if not set
const settingKeys = ['deposit_bkash', 'deposit_nagad', 'deposit_rocket', 'deposit_bank'];
const insertSetting = db.prepare('INSERT OR IGNORE INTO app_settings (key, value) VALUES (?, ?)');
settingKeys.forEach(k => insertSetting.run(k, ''));

// Pending registrations table (awaiting referrer approval)
db.exec(`
  CREATE TABLE IF NOT EXISTS pending_registrations (
    id              INTEGER PRIMARY KEY AUTOINCREMENT,
    name            TEXT NOT NULL,
    identifier      TEXT NOT NULL,
    password_hash   TEXT NOT NULL,
    plan_id         TEXT NOT NULL,
    refer_code_used TEXT NOT NULL,
    referrer_id     INTEGER NOT NULL,
    new_refer_code  TEXT NOT NULL,
    plan_rate       INTEGER NOT NULL,
    status          TEXT DEFAULT 'pending',
    created_at      TEXT DEFAULT (datetime('now'))
  );
`);

// ── Seed plans ──────────────────────────────────────────────────────────────────
const PLANS = [
  { id:'basic',    name:'BASIC',    price_display:'\u09F312,800',  rate:12800,  per_task:20,  daily_earn:200,   daily:10, task_time:2, color:'#00d2ff', l1:20, l2:4, l3:1 },
  { id:'premium',  name:'PREMIUM',  price_display:'\u09F325,500',  rate:25500,  per_task:42,  daily_earn:420,   daily:10, task_time:2, color:'#7b2fff', l1:20, l2:4, l3:1 },
  { id:'gold',     name:'GOLD',     price_display:'\u09F350,000',  rate:50000,  per_task:75,  daily_earn:900,   daily:12, task_time:2, color:'#ffd700', l1:20, l2:4, l3:1 },
  { id:'platinum', name:'PLATINUM', price_display:'\u09F380,000',  rate:80000,  per_task:100, daily_earn:1600,  daily:16, task_time:2, color:'#ff6b35', l1:20, l2:4, l3:1 },
];

const upsertPlan = db.prepare(`
  INSERT OR REPLACE INTO plans (id, name, price_display, rate, per_task, daily_earn, daily, task_time, color, l1, l2, l3)
  VALUES (@id, @name, @price_display, @rate, @per_task, @daily_earn, @daily, @task_time, @color, @l1, @l2, @l3)
`);

const seedPlans = db.transaction(() => {
  for (const p of PLANS) upsertPlan.run(p);
});
seedPlans();

// ── Seed / harden admin user ───────────────────────────────────────────────────
const IS_PRODUCTION = process.env.NODE_ENV === 'production';
const adminIdentifier = (process.env.ADMIN_IDENTIFIER || 'admin').trim();
const adminPassword = process.env.ADMIN_PASSWORD || '';
const adminHashFromEnv = adminPassword ? bcrypt.hashSync(adminPassword, 10) : null;
const existingAdmin = db.prepare('SELECT * FROM users WHERE refer_code = ?').get('ADMIN01');

if (!existingAdmin) {
  if (adminHashFromEnv) {
    db.prepare(`
      INSERT INTO users (name, identifier, password, plan_id, balance, daily_done, refer_code, avatar)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `).run('Admin', adminIdentifier, adminHashFromEnv, 'platinum', 10000000, 0, 'ADMIN01', '🧑');
  } else if (!IS_PRODUCTION) {
    const devHash = bcrypt.hashSync('admin123', 10);
    db.prepare(`
      INSERT INTO users (name, identifier, password, plan_id, balance, daily_done, refer_code, avatar)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `).run('Admin', 'admin', devHash, 'platinum', 10000000, 0, 'ADMIN01', '🧑');
  } else {
    console.warn('[Security] ADMIN_PASSWORD is not set. Admin bootstrap skipped in production.');
  }
} else if (adminHashFromEnv) {
  db.prepare('UPDATE users SET identifier = ?, password = ? WHERE refer_code = ?').run(adminIdentifier, adminHashFromEnv, 'ADMIN01');
} else if (IS_PRODUCTION && existingAdmin.identifier === 'admin' && bcrypt.compareSync('admin123', existingAdmin.password)) {
  console.warn('[Security] Default admin credentials are still active. Set ADMIN_PASSWORD in production.');
}

// Ensure admin always has is_admin flag
db.prepare('UPDATE users SET is_admin = 1 WHERE refer_code = ?').run('ADMIN01');

// ── Helper: today's date in Asia/Dhaka ──────────────────────────────────────────
function todayDate() {
  return new Date().toLocaleDateString('en-CA', { timeZone: 'Asia/Dhaka' }); // YYYY-MM-DD
}

// ── Prepared statements ─────────────────────────────────────────────────────────
const stmts = {
  // Auth
  getUserByIdentifier: db.prepare('SELECT * FROM users WHERE identifier = ?'),
  getUserByReferCode:  db.prepare('SELECT * FROM users WHERE refer_code = ?'),
  getPlan:             db.prepare('SELECT * FROM plans WHERE id = ?'),
  deductBalance:       db.prepare('UPDATE users SET balance = balance - ? WHERE id = ? AND balance >= ?'),
  insertUser:          db.prepare(`
    INSERT INTO users (name, identifier, password, plan_id, balance, daily_done, refer_code, referred_by, avatar)
    VALUES (@name, @identifier, @password, @plan_id, @balance, @daily_done, @refer_code, @referred_by, @avatar)
  `),
  getUserById:         db.prepare('SELECT * FROM users WHERE id = ?'),
  updateAvatarImg:     db.prepare('UPDATE users SET avatar_img = ? WHERE id = ?'),

  // Work / Manufacturing
  resetDaily:          db.prepare('UPDATE users SET daily_done = 0, last_task_reset = ? WHERE id = ? AND last_task_reset != ?'),
  incrementDaily:      db.prepare('UPDATE users SET daily_done = daily_done + 1 WHERE id = ?'),
  setDailyDone:        db.prepare('UPDATE users SET daily_done = ? WHERE id = ?'),
  creditBalance:       db.prepare('UPDATE users SET balance = balance + ? WHERE id = ?'),

  insertJob:           db.prepare(`
    INSERT INTO manufacturing_jobs (user_id, device_name, brand, ram, rom, color, progress, status, earned)
    VALUES (@user_id, @device_name, @brand, @ram, @rom, @color, 0, 'processing', 0)
  `),
  getJobById:          db.prepare('SELECT * FROM manufacturing_jobs WHERE id = ?'),
  getProcessingJobByUser: db.prepare(`
    SELECT * FROM manufacturing_jobs
    WHERE user_id = ? AND status = 'processing'
    ORDER BY id DESC
    LIMIT 1
  `),
  completeJob:         db.prepare('UPDATE manufacturing_jobs SET progress = 100, status = ?, earned = ? WHERE id = ? AND user_id = ? AND status = ?'),
  getCompletedJobCountToday: db.prepare(`
    SELECT COUNT(*) as count
    FROM manufacturing_jobs
    WHERE user_id = ?
      AND status = 'completed'
      AND date(created_at, '+6 hours') = date('now', '+6 hours')
  `),

  insertMarketItem:    db.prepare(`
    INSERT INTO marketplace_items (user_id, job_id, device_name, brand, specs, price, status)
    VALUES (@user_id, @job_id, @device_name, @brand, @specs, @price, 'active')
  `),

  insertNotification:  db.prepare(`
    INSERT INTO notifications (user_id, message, type) VALUES (?, ?, ?)
  `),
  insertNotifWithMeta: db.prepare(`
    INSERT INTO notifications (user_id, message, type, meta) VALUES (?, ?, ?, ?)
  `),
  getNotifications:    db.prepare('SELECT * FROM notifications WHERE user_id = ? ORDER BY id DESC LIMIT 50'),

  // Referral activity
  insertReferralActivity: db.prepare(`
    INSERT INTO referral_activity (user_id, type, level, amount, description, related_user_name)
    VALUES (@user_id, @type, @level, @amount, @description, @related_user_name)
  `),
  getReferralActivity: db.prepare(`
    SELECT * FROM referral_activity WHERE user_id = ? ORDER BY id DESC LIMIT 100
  `),
  getReferralStats: db.prepare(`
    SELECT
      COALESCE(SUM(CASE WHEN type='bonus' AND level=1 THEN amount ELSE 0 END), 0) AS l1_total,
      COALESCE(SUM(CASE WHEN type='bonus' AND level=2 THEN amount ELSE 0 END), 0) AS l2_total,
      COALESCE(SUM(CASE WHEN type='bonus' AND level=3 THEN amount ELSE 0 END), 0) AS l3_total,
      COALESCE(SUM(CASE WHEN type='spend'  THEN amount ELSE 0 END), 0) AS spend_total
    FROM referral_activity WHERE user_id = ?
  `),
  getReferralMemberCounts: db.prepare(`
    SELECT
      (SELECT COUNT(*) FROM users WHERE referred_by = ?) AS l1_count,
      (SELECT COUNT(*) FROM users WHERE referred_by IN
        (SELECT refer_code FROM users WHERE referred_by = ?)) AS l2_count,
      (SELECT COUNT(*) FROM users WHERE referred_by IN
        (SELECT refer_code FROM users WHERE referred_by IN
          (SELECT refer_code FROM users WHERE referred_by = ?))) AS l3_count
  `),
  getReferralTreeMembers: db.prepare(`
    WITH RECURSIVE referral_tree AS (
      SELECT id, name, refer_code, referred_by, 1 AS level, created_at
      FROM users
      WHERE referred_by = ?

      UNION ALL

      SELECT u.id, u.name, u.refer_code, u.referred_by, referral_tree.level + 1, u.created_at
      FROM users u
      JOIN referral_tree ON u.referred_by = referral_tree.refer_code
      WHERE referral_tree.level < 3
    )
    SELECT id, name, refer_code, referred_by, level, created_at
    FROM referral_tree
    ORDER BY level ASC, id ASC
  `),

  // Unified balance log
  insertBalanceLog: db.prepare(`
    INSERT INTO balance_log (user_id, type, amount, note)
    VALUES (@user_id, @type, @amount, @note)
  `),
  getBalanceLog: db.prepare(`
    SELECT * FROM balance_log WHERE user_id = ? ORDER BY id DESC LIMIT 100
  `),
  getBalanceSummary: db.prepare(`
    SELECT
      COALESCE(SUM(CASE WHEN amount > 0 THEN amount ELSE 0 END), 0) AS total_credit,
      COALESCE(SUM(CASE WHEN amount < 0 THEN amount ELSE 0 END), 0) AS total_debit,
      COALESCE(SUM(CASE WHEN type='daily_earn' THEN amount ELSE 0 END), 0) AS daily_earned,
      COALESCE(SUM(CASE WHEN type='referral_bonus' THEN amount ELSE 0 END), 0) AS referral_earned,
      COALESCE(SUM(CASE WHEN type='team_bonus' THEN amount ELSE 0 END), 0) AS team_earned
    FROM balance_log WHERE user_id = ?
  `),

  // Pending registrations
  insertPendingReg:    db.prepare(`
    INSERT INTO pending_registrations (name, identifier, password_hash, plan_id, refer_code_used, referrer_id, new_refer_code, plan_rate)
    VALUES (@name, @identifier, @password_hash, @plan_id, @refer_code_used, @referrer_id, @new_refer_code, @plan_rate)
  `),
  getPendingReg:       db.prepare('SELECT * FROM pending_registrations WHERE id = ?'),
  updatePendingStatus: db.prepare('UPDATE pending_registrations SET status = ? WHERE id = ?'),

  // Marketplace queries
  getUserMarketItems:  db.prepare('SELECT * FROM marketplace_items WHERE user_id = ? ORDER BY id DESC'),
  getStaleActiveItems: db.prepare(`SELECT * FROM marketplace_items WHERE status = 'active' AND created_at <= datetime('now', '-30 minutes')`),
  markItemSold:        db.prepare(`UPDATE marketplace_items SET status = 'sold', sold_at = datetime('now') WHERE id = ?`),

  // Notification read status
  markNotifRead:       db.prepare('UPDATE notifications SET read = 1 WHERE id = ? AND user_id = ?'),
  markAllNotifsRead:   db.prepare('UPDATE notifications SET read = 1 WHERE user_id = ?'),

  // Admin
  getAllUsers:          db.prepare(`
    SELECT u.*, p.name as plan_name, p.color as plan_color,
      (SELECT json_object('ip', ll.ip, 'user_agent', ll.user_agent, 'city', ll.city, 'country', ll.country, 'logged_at', ll.logged_at)
       FROM login_logs ll WHERE ll.user_id = u.id ORDER BY ll.id DESC LIMIT 1
      ) as last_login_info
    FROM users u
    LEFT JOIN plans p ON p.id = u.plan_id
    ORDER BY u.id DESC
  `),
  updateUserAdmin:     db.prepare('UPDATE users SET balance = @balance, plan_id = @plan_id, banned = @banned, is_admin = @is_admin WHERE id = @id'),
  getUserLoginLogs:    db.prepare('SELECT * FROM login_logs WHERE user_id = ? ORDER BY id DESC LIMIT 50'),
  insertLoginLog:      db.prepare('INSERT INTO login_logs (user_id, ip, user_agent, city, country) VALUES (@user_id, @ip, @user_agent, @city, @country)'),
  updateLoginLogGeo:   db.prepare('UPDATE login_logs SET city = ?, country = ? WHERE id = ?'),

  // Transactions
  insertTransaction:   db.prepare(`
    INSERT INTO transactions (user_id, type, amount, method, account, status)
    VALUES (@user_id, @type, @amount, @method, @account, @status)
  `),
  getTransactionById:  db.prepare('SELECT * FROM transactions WHERE id = ?'),
  getUserTransactions: db.prepare('SELECT * FROM transactions WHERE user_id = ? ORDER BY id DESC LIMIT 50'),
  getAllTransactions:   db.prepare(`
    SELECT t.*, u.name as user_name, u.identifier as user_identifier
    FROM transactions t
    LEFT JOIN users u ON u.id = t.user_id
    ORDER BY t.id DESC
    LIMIT 200
  `),
  updateTransactionStatus: db.prepare(`
    UPDATE transactions SET status = @status, admin_note = @admin_note, updated_at = datetime('now')
    WHERE id = @id
  `),
  getAdminUsers:       db.prepare('SELECT id FROM users WHERE is_admin = 1'),
  getVisibleAdminsForDelegated: db.prepare(`
    SELECT id FROM users WHERE is_admin = 1 AND refer_code != ?
  `),
  getFinancialStats:   db.prepare(`
    SELECT
      (SELECT COUNT(*) FROM transactions WHERE type = 'withdraw' AND status = 'approved') as withdraw_count,
      (SELECT COALESCE(SUM(amount), 0) FROM transactions WHERE type = 'withdraw' AND status = 'approved') as withdraw_sum,
      (SELECT COUNT(*) FROM transactions WHERE type = 'deposit' AND status = 'approved') as deposit_count,
      (SELECT COALESCE(SUM(amount), 0) FROM transactions WHERE type = 'deposit' AND status = 'approved') as deposit_sum,
      (SELECT COUNT(*) FROM transactions WHERE status = 'pending') as pending_count,
      (SELECT COUNT(*) FROM users WHERE referred_by IS NOT NULL AND referred_by != '') as referral_count,
      (SELECT COALESCE(SUM(earned), 0) FROM manufacturing_jobs WHERE date(created_at, '+6 hours') = date('now', '+6 hours')) as today_earnings,
      (SELECT COALESCE(SUM(earned), 0) FROM manufacturing_jobs) as alltime_earnings
  `),
  getPendingTransactionCount: db.prepare("SELECT COUNT(*) as count FROM transactions WHERE status = 'pending'"),
  getBroadcastRecipients: db.prepare(`
    SELECT id, name
    FROM users
    WHERE banned = 0 AND is_admin = 0
    ORDER BY id ASC
  `),
  insertSupportMsg:   db.prepare('INSERT INTO support_chats (session_id, sender, message) VALUES (?, ?, ?)'),
  getSupportMsgs:     db.prepare('SELECT * FROM support_chats WHERE session_id = ? ORDER BY id ASC LIMIT 100'),
  insertTgMsgMap:     db.prepare('INSERT OR IGNORE INTO tg_msg_map (tg_message_id, session_id) VALUES (?, ?)'),
  getSessionByTgMsg:  db.prepare('SELECT session_id FROM tg_msg_map WHERE tg_message_id = ?'),

  // App settings
  getSetting:     db.prepare('SELECT value FROM app_settings WHERE key = ?'),
  getAllSettings: db.prepare('SELECT key, value FROM app_settings'),
  setSetting:     db.prepare('INSERT OR REPLACE INTO app_settings (key, value) VALUES (?, ?)'),
};

// ── Helper: strip password from user object ─────────────────────────────────────
function sanitizeUser(row) {
  if (!row) return null;
  const { password, ...user } = row;
  return user;
}

module.exports = { db, stmts, sanitizeUser, todayDate };
