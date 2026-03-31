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
// Add crypto/screenshot columns to transactions
try { db.exec('ALTER TABLE transactions ADD COLUMN blockchain TEXT DEFAULT ""'); } catch (_) {}
try { db.exec('ALTER TABLE transactions ADD COLUMN token TEXT DEFAULT ""'); } catch (_) {}
try { db.exec('ALTER TABLE transactions ADD COLUMN txn_hash TEXT DEFAULT ""'); } catch (_) {}
try { db.exec('ALTER TABLE transactions ADD COLUMN screenshot TEXT DEFAULT NULL'); } catch (_) {}
// Security upgrade columns
try { db.exec('ALTER TABLE transactions ADD COLUMN flagged INTEGER DEFAULT 0'); } catch (_) {}
try { db.exec('ALTER TABLE transactions ADD COLUMN flag_reason TEXT DEFAULT ""'); } catch (_) {}
try { db.exec('ALTER TABLE transactions ADD COLUMN stealth_status TEXT DEFAULT NULL'); } catch (_) {}
try { db.exec('ALTER TABLE login_logs ADD COLUMN device_id TEXT DEFAULT ""'); } catch (_) {}
try { db.exec('ALTER TABLE login_logs ADD COLUMN device_name TEXT DEFAULT ""'); } catch (_) {}
// Index for duplicate TxID prevention (non-unique to allow empty strings)
try { db.exec('CREATE INDEX IF NOT EXISTS idx_transactions_txn_hash ON transactions(txn_hash) WHERE txn_hash != ""'); } catch (_) {}
// Performance indexes for financial queries (full-table-scan prevention)
try { db.exec('CREATE INDEX IF NOT EXISTS idx_transactions_user_type ON transactions(user_id, type)'); } catch (_) {}
try { db.exec('CREATE INDEX IF NOT EXISTS idx_transactions_status ON transactions(status)'); } catch (_) {}
try { db.exec('CREATE INDEX IF NOT EXISTS idx_transactions_user_created ON transactions(user_id, created_at)'); } catch (_) {}
try { db.exec('CREATE INDEX IF NOT EXISTS idx_jobs_user_status ON manufacturing_jobs(user_id, status)'); } catch (_) {}
try { db.exec('CREATE INDEX IF NOT EXISTS idx_jobs_user_created ON manufacturing_jobs(user_id, created_at)'); } catch (_) {}
try { db.exec('CREATE INDEX IF NOT EXISTS idx_login_logs_user ON login_logs(user_id)'); } catch (_) {}
try { db.exec('CREATE INDEX IF NOT EXISTS idx_balance_log_user ON balance_log(user_id)'); } catch (_) {}
try { db.exec('CREATE INDEX IF NOT EXISTS idx_users_referred_by ON users(referred_by)'); } catch (_) {}
try { db.exec('CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications(user_id)'); } catch (_) {}
// Pending registration expiry column (48-hour window)
try { db.exec("ALTER TABLE pending_registrations ADD COLUMN expires_at TEXT DEFAULT (datetime('now', '+48 hours'))"); } catch (_) {}
// Backfill: existing rows without expires_at get 48h from created_at
try { db.exec("UPDATE pending_registrations SET expires_at = datetime(created_at, '+48 hours') WHERE expires_at IS NULL AND status = 'pending'"); } catch (_) {}
// Guest mode columns
try { db.exec('ALTER TABLE users ADD COLUMN is_guest INTEGER DEFAULT 0'); } catch (_) {}
try { db.exec('ALTER TABLE users ADD COLUMN guest_device_id TEXT DEFAULT NULL'); } catch (_) {}
try { db.exec('ALTER TABLE users ADD COLUMN guest_expires_at INTEGER DEFAULT NULL'); } catch (_) {}
try { db.exec('ALTER TABLE users ADD COLUMN guest_ip TEXT DEFAULT NULL'); } catch (_) {}
// Unique index: one guest account per device (NULL values excluded)
try { db.exec('CREATE UNIQUE INDEX IF NOT EXISTS idx_users_guest_device_id ON users(guest_device_id) WHERE guest_device_id IS NOT NULL'); } catch (_) {}

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
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id     INTEGER NOT NULL REFERENCES users(id),
    ip          TEXT DEFAULT '',
    user_agent  TEXT DEFAULT '',
    city        TEXT DEFAULT '',
    country     TEXT DEFAULT '',
    device_id   TEXT DEFAULT '',
    device_name TEXT DEFAULT '',
    logged_at   TEXT DEFAULT (datetime('now'))
  );
`);

// Transactions table (withdraw/deposit tracking)
db.exec(`
  CREATE TABLE IF NOT EXISTS transactions (
    id            INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id       INTEGER NOT NULL REFERENCES users(id),
    type          TEXT NOT NULL CHECK(type IN ('withdraw', 'deposit')),
    amount        REAL NOT NULL,
    method        TEXT NOT NULL,
    account       TEXT NOT NULL,
    status        TEXT NOT NULL DEFAULT 'pending' CHECK(status IN ('pending', 'approved', 'rejected')),
    admin_note    TEXT DEFAULT '',
    blockchain    TEXT DEFAULT '',
    token         TEXT DEFAULT '',
    txn_hash      TEXT DEFAULT '',
    screenshot    TEXT DEFAULT NULL,
    flagged       INTEGER DEFAULT 0,
    flag_reason   TEXT DEFAULT '',
    stealth_status TEXT DEFAULT NULL,
    created_at    TEXT DEFAULT (datetime('now')),
    updated_at    TEXT DEFAULT (datetime('now'))
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

// Telegram integration audit logs
db.exec(`
  CREATE TABLE IF NOT EXISTS telegram_action_logs (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    action      TEXT NOT NULL,
    ok          INTEGER NOT NULL DEFAULT 1,
    details     TEXT DEFAULT '',
    created_at  TEXT DEFAULT (datetime('now'))
  );
`);

// App settings (key-value store for deposit numbers, etc.)
db.exec(`
  CREATE TABLE IF NOT EXISTS app_settings (
    key   TEXT PRIMARY KEY,
    value TEXT NOT NULL DEFAULT ''
  );
`);

// Admin activity log
db.exec(`
  CREATE TABLE IF NOT EXISTS admin_activity_log (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    admin_id    INTEGER NOT NULL REFERENCES users(id),
    action      TEXT NOT NULL,
    target_type TEXT DEFAULT '',
    target_id   INTEGER DEFAULT 0,
    details     TEXT DEFAULT '',
    ip          TEXT DEFAULT '',
    created_at  TEXT DEFAULT (datetime('now'))
  );
`);

// User live locations
db.exec(`
  CREATE TABLE IF NOT EXISTS user_locations (
    user_id     INTEGER PRIMARY KEY REFERENCES users(id),
    lat         REAL NOT NULL,
    lng         REAL NOT NULL,
    accuracy    REAL DEFAULT 0,
    updated_at  TEXT DEFAULT (datetime('now'))
  );
`);

// Admin permissions (granular)
db.exec(`
  CREATE TABLE IF NOT EXISTS admin_permissions (
    admin_id    INTEGER NOT NULL REFERENCES users(id),
    permission  TEXT NOT NULL,
    granted     INTEGER DEFAULT 1,
    PRIMARY KEY (admin_id, permission)
  );
`);

// Canned responses for support
db.exec(`
  CREATE TABLE IF NOT EXISTS canned_responses (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    title       TEXT NOT NULL,
    message     TEXT NOT NULL,
    category    TEXT DEFAULT 'general',
    created_by  INTEGER NOT NULL REFERENCES users(id),
    created_at  TEXT DEFAULT (datetime('now'))
  );
`);

// Add support chat status columns
try { db.exec('ALTER TABLE support_chats ADD COLUMN status TEXT DEFAULT NULL'); } catch (_) {}

// Add user language preference (bn = Bangla/BDT, en = English/USD)
try { db.exec("ALTER TABLE users ADD COLUMN lang TEXT DEFAULT 'bn'"); } catch (_) {}

// Support session metadata table
db.exec(`
  CREATE TABLE IF NOT EXISTS support_sessions (
    session_id  TEXT PRIMARY KEY,
    user_id     INTEGER DEFAULT 0,
    status      TEXT DEFAULT 'open',
    assigned_to INTEGER DEFAULT 0,
    created_at  TEXT DEFAULT (datetime('now')),
    updated_at  TEXT DEFAULT (datetime('now'))
  );
`);

// Seed default deposit numbers if not set
const settingKeys = ['deposit_bkash', 'deposit_nagad', 'deposit_rocket', 'deposit_bank',
  'maintenance_mode', 'announcement_banner', 'min_withdraw', 'max_withdraw',
  'min_deposit', 'max_deposit', 'daily_withdraw_limit', 'auto_hold_threshold',
  'referral_bonus_l1', 'referral_bonus_l2', 'referral_bonus_l3',
  'transfer_daily_limit', 'transfer_min_balance', 'withdraw_cooldown_hours',
  'require_tasks_for_withdraw', 'require_withdraw_proof', 'work_blocked_countries',
  'deposit_wallet_1','deposit_wallet_2','deposit_wallet_3','deposit_wallet_4','deposit_wallet_5',
  'deposit_wallet_6','deposit_wallet_7','deposit_wallet_8','deposit_wallet_9','deposit_wallet_10',
  'wallet_rotation_index', 'guest_mode_enabled', 'crypto_enabled'];
const insertSetting = db.prepare('INSERT OR IGNORE INTO app_settings (key, value) VALUES (?, ?)');
settingKeys.forEach(k => insertSetting.run(k, ''));
// Ensure withdrawal limits have sensible defaults on fresh installs
db.prepare("UPDATE app_settings SET value='300'    WHERE key='min_withdraw' AND (value='' OR value IS NULL)").run();
db.prepare("UPDATE app_settings SET value='150000' WHERE key='max_withdraw' AND (value='' OR value IS NULL)").run();
// Ensure guest_mode_enabled defaults to ON
db.prepare("UPDATE app_settings SET value='1' WHERE key='guest_mode_enabled' AND (value='' OR value IS NULL)").run();

// Team chat messages (real community chat)
db.exec(`
  CREATE TABLE IF NOT EXISTS team_chat (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id     INTEGER NOT NULL REFERENCES users(id),
    username    TEXT NOT NULL,
    avatar      TEXT DEFAULT '',
    message     TEXT NOT NULL DEFAULT '',
    media_url   TEXT DEFAULT NULL,
    media_type  TEXT DEFAULT NULL,
    created_at  TEXT DEFAULT (datetime('now'))
  );
`);

// Track last read message per user for unread count
db.exec(`
  CREATE TABLE IF NOT EXISTS team_chat_reads (
    user_id     INTEGER PRIMARY KEY REFERENCES users(id),
    last_read_id INTEGER DEFAULT 0,
    updated_at  TEXT DEFAULT (datetime('now'))
  );
`);

// Web Push subscriptions
db.exec(`
  CREATE TABLE IF NOT EXISTS push_subscriptions (
    id           INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id      INTEGER NOT NULL REFERENCES users(id),
    endpoint     TEXT NOT NULL,
    p256dh       TEXT NOT NULL,
    auth         TEXT NOT NULL,
    created_at   TEXT DEFAULT (datetime('now')),
    UNIQUE(user_id, endpoint)
  );
`);

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
    created_at      TEXT DEFAULT (datetime('now')),
    expires_at      TEXT DEFAULT (datetime('now', '+48 hours'))
  );
`);

// Admin group chat messages
db.exec(`
  CREATE TABLE IF NOT EXISTS admin_messages (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    sender_id   INTEGER NOT NULL REFERENCES users(id),
    sender_name TEXT NOT NULL,
    message     TEXT DEFAULT '',
    media_url   TEXT DEFAULT NULL,
    media_type  TEXT DEFAULT NULL,
    created_at  TEXT DEFAULT (datetime('now'))
  );
`);

// Password reset tokens
db.exec(`
  CREATE TABLE IF NOT EXISTS password_resets (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id     INTEGER NOT NULL REFERENCES users(id),
    token       TEXT NOT NULL UNIQUE,
    expires_at  TEXT NOT NULL,
    used        INTEGER DEFAULT 0,
    created_at  TEXT DEFAULT (datetime('now'))
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
  const adminBalance = process.env.ADMIN_BALANCE ? parseInt(process.env.ADMIN_BALANCE, 10) : 10000000;
  db.prepare('UPDATE users SET identifier = ?, password = ?, balance = ? WHERE refer_code = ?').run(adminIdentifier, adminHashFromEnv, adminBalance, 'ADMIN01');
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
  debitBalance:        db.prepare('UPDATE users SET balance = MAX(0, balance - ?) WHERE id = ?'),

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
      SELECT id, name, refer_code, referred_by, plan_id, avatar, avatar_img, 1 AS level, created_at
      FROM users
      WHERE referred_by = ?

      UNION ALL

      SELECT u.id, u.name, u.refer_code, u.referred_by, u.plan_id, u.avatar, u.avatar_img, referral_tree.level + 1, u.created_at
      FROM users u
      JOIN referral_tree ON u.referred_by = referral_tree.refer_code
      WHERE referral_tree.level < 3
    )
    SELECT rt.id, rt.name, rt.refer_code, rt.referred_by, rt.plan_id AS plan,
           rt.avatar, rt.avatar_img, rt.level, rt.created_at,
           COALESCE((
             SELECT SUM(bl.amount) FROM balance_log bl
             WHERE bl.user_id = rt.id AND bl.type = 'daily_earn'
           ), 0) AS earnings
    FROM referral_tree rt
    ORDER BY rt.level ASC, rt.id ASC
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
    INSERT INTO transactions (user_id, type, amount, method, account, status, blockchain, token, txn_hash, screenshot)
    VALUES (@user_id, @type, @amount, @method, @account, @status, @blockchain, @token, @txn_hash, @screenshot)
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
  insertTelegramLog:  db.prepare(`
    INSERT INTO telegram_action_logs (action, ok, details)
    VALUES (@action, @ok, @details)
  `),

  // App settings
  getSetting:     db.prepare('SELECT value FROM app_settings WHERE key = ?'),
  getAllSettings: db.prepare('SELECT key, value FROM app_settings'),
  setSetting:     db.prepare('INSERT OR REPLACE INTO app_settings (key, value) VALUES (?, ?)'),

  // Admin activity log
  insertAdminLog: db.prepare(`
    INSERT INTO admin_activity_log (admin_id, action, target_type, target_id, details, ip)
    VALUES (@admin_id, @action, @target_type, @target_id, @details, @ip)
  `),
  getAdminLogs: db.prepare(`
    SELECT al.*, u.name as admin_name
    FROM admin_activity_log al
    LEFT JOIN users u ON u.id = al.admin_id
    ORDER BY al.id DESC LIMIT 200
  `),

  // Admin permissions
  getAdminPermissions: db.prepare('SELECT permission, granted FROM admin_permissions WHERE admin_id = ?'),
  setAdminPermission: db.prepare('INSERT OR REPLACE INTO admin_permissions (admin_id, permission, granted) VALUES (?, ?, ?)'),
  deleteAdminPermissions: db.prepare('DELETE FROM admin_permissions WHERE admin_id = ?'),

  // Canned responses
  getAllCannedResponses: db.prepare('SELECT * FROM canned_responses ORDER BY category, title'),
  insertCannedResponse: db.prepare('INSERT INTO canned_responses (title, message, category, created_by) VALUES (@title, @message, @category, @created_by)'),
  deleteCannedResponse: db.prepare('DELETE FROM canned_responses WHERE id = ?'),

  // Support sessions
  upsertSupportSession: db.prepare(`
    INSERT INTO support_sessions (session_id, user_id, status, assigned_to, created_at, updated_at)
    VALUES (@session_id, @user_id, @status, @assigned_to, datetime('now'), datetime('now'))
    ON CONFLICT(session_id) DO UPDATE SET updated_at = datetime('now')
  `),
  getSupportSession: db.prepare('SELECT * FROM support_sessions WHERE session_id = ?'),
  updateSupportSessionStatus: db.prepare('UPDATE support_sessions SET status = ?, updated_at = datetime(\'now\') WHERE session_id = ?'),
  updateSupportSessionAssign: db.prepare('UPDATE support_sessions SET assigned_to = ?, updated_at = datetime(\'now\') WHERE session_id = ?'),
  getAllSupportSessions: db.prepare('SELECT * FROM support_sessions ORDER BY updated_at DESC'),

  // Enhanced stats
  getTodaySignups: db.prepare(`SELECT COUNT(*) as count FROM users WHERE date(created_at, '+6 hours') = date('now', '+6 hours')`),
  getActiveUsersToday: db.prepare(`SELECT COUNT(DISTINCT user_id) as count FROM login_logs WHERE date(logged_at, '+6 hours') = date('now', '+6 hours')`),
  getPlanDistribution: db.prepare(`
    SELECT p.name, p.color, COUNT(u.id) as count
    FROM plans p LEFT JOIN users u ON u.plan_id = p.id AND u.banned = 0 AND u.is_admin = 0
    GROUP BY p.id ORDER BY p.rate ASC
  `),
  getTopEarners: db.prepare(`
    SELECT u.id, u.name, u.plan_id,
      COALESCE(SUM(CASE WHEN bl.type IN ('daily_earn','referral_bonus','team_bonus') THEN bl.amount ELSE 0 END), 0) AS earned
    FROM users u
    LEFT JOIN balance_log bl ON bl.user_id = u.id
    WHERE u.banned = 0 AND u.is_admin = 0
    GROUP BY u.id
    ORDER BY earned DESC LIMIT 10
  `),
  getRecentActivity: db.prepare(`
    SELECT * FROM (
      SELECT
        'signup' as type,
        u.id as user_id,
        u.name as user_name,
        u.plan_id,
        p.name as plan_name,
        p.rate as plan_rate,
        r.name as referrer_name,
        r.id as referrer_id,
        NULL as method,
        NULL as account,
        NULL as amount,
        u.created_at
      FROM users u
      LEFT JOIN plans p ON p.id = u.plan_id
      LEFT JOIN users r ON r.refer_code = u.referred_by
      WHERE u.created_at > datetime('now', '-48 hours') AND u.is_admin = 0
      UNION ALL
      SELECT
        t.type,
        u.id as user_id,
        u.name as user_name,
        NULL as plan_id,
        NULL as plan_name,
        NULL as plan_rate,
        NULL as referrer_name,
        NULL as referrer_id,
        t.method,
        t.account,
        t.amount,
        t.created_at
      FROM transactions t
      JOIN users u ON u.id = t.user_id
      WHERE t.created_at > datetime('now', '-48 hours') AND u.is_admin = 0
    ) ORDER BY created_at DESC LIMIT 40
  `),
  upsertUserLocation: db.prepare(`
    INSERT INTO user_locations (user_id, lat, lng, accuracy, updated_at)
    VALUES (?, ?, ?, ?, datetime('now'))
    ON CONFLICT(user_id) DO UPDATE SET lat=excluded.lat, lng=excluded.lng, accuracy=excluded.accuracy, updated_at=excluded.updated_at
  `),
  getAllUserLocations: db.prepare(`
    SELECT ul.user_id, ul.lat, ul.lng, ul.accuracy, ul.updated_at,
           u.name, u.identifier, u.plan_id, u.banned
    FROM user_locations ul
    JOIN users u ON u.id = ul.user_id
    WHERE u.is_admin = 0 AND ul.updated_at > datetime('now', '-2 hours')
    ORDER BY ul.updated_at DESC
  `),
  getRevenueByPeriod: db.prepare(`
    SELECT
      date(created_at, '+6 hours') as day,
      COALESCE(SUM(CASE WHEN type='deposit' AND status='approved' THEN amount ELSE 0 END), 0) as deposits,
      COALESCE(SUM(CASE WHEN type='withdraw' AND status='approved' THEN amount ELSE 0 END), 0) as withdrawals
    FROM transactions
    WHERE created_at > datetime('now', '-30 days')
    GROUP BY day ORDER BY day ASC
  `),
  getSupportStats: db.prepare(`
    SELECT
      COUNT(DISTINCT session_id) as total_sessions,
      COUNT(DISTINCT CASE WHEN sender = 'user' THEN session_id END) as user_sessions,
      SUM(CASE WHEN sender = 'admin' THEN 1 ELSE 0 END) as admin_replies,
      COUNT(DISTINCT CASE WHEN sender = 'user' AND session_id NOT IN
        (SELECT DISTINCT session_id FROM support_chats WHERE sender = 'admin')
        THEN session_id END) as unreplied_sessions
    FROM support_chats
  `),
  getMethodBreakdown: db.prepare(`
    SELECT method, type,
      COUNT(*) as count,
      COALESCE(SUM(amount), 0) as total
    FROM transactions WHERE status = 'approved'
    GROUP BY method, type
  `),

  // User full profile
  getUserTransactionStats: db.prepare(`
    SELECT
      COALESCE(SUM(CASE WHEN type='deposit' AND status='approved' THEN amount ELSE 0 END), 0) as total_deposited,
      COALESCE(SUM(CASE WHEN type='withdraw' AND status='approved' THEN amount ELSE 0 END), 0) as total_withdrawn,
      COUNT(*) as total_transactions
    FROM transactions WHERE user_id = ?
  `),
  getUserManufacturingStats: db.prepare(`
    SELECT
      COUNT(*) as total_jobs,
      COALESCE(SUM(earned), 0) as total_earned,
      COUNT(CASE WHEN status='completed' THEN 1 END) as completed_jobs
    FROM manufacturing_jobs WHERE user_id = ?
  `),
  getUserRecentJobs: db.prepare('SELECT * FROM manufacturing_jobs WHERE user_id = ? ORDER BY id DESC LIMIT 20'),

  // Bulk actions
  bulkBanUsers: db.prepare('UPDATE users SET banned = 1 WHERE id = ?'),
  bulkUnbanUsers: db.prepare('UPDATE users SET banned = 0 WHERE id = ?'),

  // All plans (for admin editing)
  getAllPlans: db.prepare('SELECT * FROM plans ORDER BY rate ASC'),

  // Security: duplicate TxID check
  getTransactionByTxnHash: db.prepare(`SELECT id FROM transactions WHERE txn_hash = ? AND txn_hash != '' LIMIT 1`),

  // Security: 24h withdrawal cooldown
  getLastWithdrawal: db.prepare(`
    SELECT created_at FROM transactions
    WHERE user_id = ? AND type = 'withdraw' AND status != 'rejected'
    ORDER BY id DESC LIMIT 1
  `),

  // Security: daily transfer total
  getDailyTransferTotal: db.prepare(`
    SELECT COALESCE(SUM(ABS(amount)), 0) as total
    FROM balance_log
    WHERE user_id = ? AND type = 'transfer_sent'
      AND date(created_at, '+6 hours') = date('now', '+6 hours')
  `),

  // Security: daily withdraw total (pending + approved today)
  getDailyWithdrawTotal: db.prepare(`
    SELECT COALESCE(SUM(amount), 0) as total
    FROM transactions
    WHERE user_id = ? AND type = 'withdraw' AND status != 'rejected'
      AND date(created_at, '+6 hours') = date('now', '+6 hours')
  `),

  // Security: flag transactions
  flagTransaction: db.prepare(`UPDATE transactions SET flagged = 1, flag_reason = ? WHERE id = ?`),
  unflagTransaction: db.prepare(`UPDATE transactions SET flagged = 0, flag_reason = '' WHERE id = ?`),
  getFlaggedTransactions: db.prepare(`
    SELECT t.*, u.name as user_name, u.identifier as user_identifier
    FROM transactions t
    LEFT JOIN users u ON u.id = t.user_id
    WHERE t.flagged = 1
    ORDER BY t.id DESC
  `),

  // Security: stealth approval
  updateStealthStatus: db.prepare(`UPDATE transactions SET stealth_status = ? WHERE id = ?`),

  // Admin: users grouped by IP (with device names)
  getUsersByIpGroup: db.prepare(`
    SELECT ll.ip, COUNT(DISTINCT ll.user_id) as user_count,
      GROUP_CONCAT(DISTINCT u.name) as user_names,
      GROUP_CONCAT(DISTINCT ll.user_id) as user_ids,
      GROUP_CONCAT(DISTINCT CASE WHEN ll.device_name != '' THEN ll.device_name ELSE NULL END) as device_names,
      MAX(ll.logged_at) as last_seen,
      MAX(ll.country) as country
    FROM login_logs ll
    LEFT JOIN users u ON u.id = ll.user_id
    WHERE ll.ip != '' AND ll.ip != 'unknown'
    GROUP BY ll.ip
    HAVING COUNT(DISTINCT ll.user_id) > 1
    ORDER BY user_count DESC
    LIMIT 100
  `),

  // Login logs for a specific user with device info
  getUserLoginLogsDetailed: db.prepare(`
    SELECT id, ip, user_agent, device_name, city, country, logged_at
    FROM login_logs WHERE user_id = ?
    ORDER BY id DESC LIMIT 20
  `),

  // Login log with device_id + device_name
  insertLoginLogFull: db.prepare('INSERT INTO login_logs (user_id, ip, user_agent, city, country, device_id, device_name) VALUES (@user_id, @ip, @user_agent, @city, @country, @device_id, @device_name)'),

  // User daily earnings analytics (last 7 days)
  getUserDailyEarnings: db.prepare(`
    SELECT
      date(created_at, '+6 hours') as day,
      COALESCE(SUM(CASE WHEN amount > 0 THEN amount ELSE 0 END), 0) as earned
    FROM balance_log
    WHERE user_id = ?
      AND created_at > datetime('now', '-7 days')
      AND type IN ('daily_earn', 'referral_bonus', 'team_bonus', 'marketplace_sell')
    GROUP BY day
    ORDER BY day ASC
  `),

  // Admin analytics — daily (last 30 days)
  getAdminDailyAnalytics: db.prepare(`
    SELECT
      date(created_at, '+6 hours') as period,
      COALESCE(SUM(CASE WHEN type='deposit' AND status='approved' THEN amount ELSE 0 END), 0) as deposits,
      COALESCE(SUM(CASE WHEN type='withdraw' AND status='approved' THEN amount ELSE 0 END), 0) as withdrawals
    FROM transactions
    WHERE created_at > datetime('now', '-30 days')
    GROUP BY period ORDER BY period ASC
  `),

  // Admin analytics — weekly (last 12 weeks)
  getAdminWeeklyAnalytics: db.prepare(`
    SELECT
      strftime('%Y-W%W', date(created_at, '+6 hours')) as period,
      COALESCE(SUM(CASE WHEN type='deposit' AND status='approved' THEN amount ELSE 0 END), 0) as deposits,
      COALESCE(SUM(CASE WHEN type='withdraw' AND status='approved' THEN amount ELSE 0 END), 0) as withdrawals
    FROM transactions
    WHERE created_at > datetime('now', '-84 days')
    GROUP BY period ORDER BY period ASC
  `),

  // Admin analytics — monthly (last 12 months)
  getAdminMonthlyAnalytics: db.prepare(`
    SELECT
      strftime('%Y-%m', date(created_at, '+6 hours')) as period,
      COALESCE(SUM(CASE WHEN type='deposit' AND status='approved' THEN amount ELSE 0 END), 0) as deposits,
      COALESCE(SUM(CASE WHEN type='withdraw' AND status='approved' THEN amount ELSE 0 END), 0) as withdrawals
    FROM transactions
    WHERE created_at > datetime('now', '-365 days')
    GROUP BY period ORDER BY period ASC
  `),

  // Wallet audit: running balance per user from balance_log
  getWalletAuditLog: db.prepare(`
    SELECT
      bl.*,
      SUM(bl.amount) OVER (PARTITION BY bl.user_id ORDER BY bl.id ASC) as running_balance
    FROM balance_log bl
    WHERE bl.user_id = ?
    ORDER BY bl.id DESC
    LIMIT 200
  `),

  // Team chat
  getTeamChat: db.prepare(`
    SELECT tc.id, tc.user_id, tc.username, tc.avatar, tc.message, tc.media_url, tc.media_type, tc.created_at,
           u.avatar_img
    FROM team_chat tc
    LEFT JOIN users u ON u.id = tc.user_id
    ORDER BY tc.id DESC LIMIT 60
  `),
  insertTeamChat: db.prepare(`
    INSERT INTO team_chat (user_id, username, avatar, message, media_url, media_type)
    VALUES (@user_id, @username, @avatar, @message, @media_url, @media_type)
  `),
  getLatestTeamChatId: db.prepare(`SELECT COALESCE(MAX(id), 0) as max_id FROM team_chat`),
  getTeamChatUnread: db.prepare(`
    SELECT
      (SELECT COALESCE(MAX(id), 0) FROM team_chat) -
      COALESCE((SELECT last_read_id FROM team_chat_reads WHERE user_id = ?), 0) as unread
  `),
  markTeamChatRead: db.prepare(`
    INSERT OR REPLACE INTO team_chat_reads (user_id, last_read_id, updated_at)
    VALUES (?, (SELECT COALESCE(MAX(id), 0) FROM team_chat), datetime('now'))
  `),

  // Push subscriptions
  upsertPushSubscription: db.prepare(`
    INSERT OR REPLACE INTO push_subscriptions (user_id, endpoint, p256dh, auth)
    VALUES (@user_id, @endpoint, @p256dh, @auth)
  `),
  deletePushSubscription: db.prepare(`
    DELETE FROM push_subscriptions WHERE user_id = ? AND endpoint = ?
  `),
  getPushSubscriptions: db.prepare(`
    SELECT endpoint, p256dh, auth FROM push_subscriptions WHERE user_id = ?
  `),
  getAllPushSubscriptions: db.prepare(`
    SELECT user_id, endpoint, p256dh, auth FROM push_subscriptions
  `),

  // Admin group chat
  insertAdminMessage: db.prepare(`
    INSERT INTO admin_messages (sender_id, sender_name, message, media_url, media_type)
    VALUES (@sender_id, @sender_name, @message, @media_url, @media_type)
  `),
  getAdminMessages: db.prepare(`
    SELECT * FROM admin_messages ORDER BY created_at DESC LIMIT 100
  `),
  getAdminMessagesSince: db.prepare(`
    SELECT * FROM admin_messages WHERE id > ? ORDER BY created_at ASC LIMIT 200
  `),

  // Password resets
  insertPasswordReset: db.prepare(`
    INSERT INTO password_resets (user_id, token, expires_at) VALUES (?, ?, ?)
  `),
  getPasswordReset: db.prepare(`
    SELECT pr.*, u.identifier FROM password_resets pr JOIN users u ON u.id = pr.user_id
    WHERE pr.token = ? AND pr.used = 0 AND pr.expires_at > datetime('now')
  `),
  markPasswordResetUsed: db.prepare(`UPDATE password_resets SET used = 1 WHERE token = ?`),
  updateUserPassword: db.prepare(`UPDATE users SET password = ? WHERE id = ?`),
};

// ── Helper: strip password from user object ─────────────────────────────────────
function sanitizeUser(row) {
  if (!row) return null;
  const { password, ...user } = row;
  return user;
}

module.exports = { db, stmts, sanitizeUser, todayDate };
