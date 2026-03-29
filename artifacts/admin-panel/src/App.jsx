import { useState, useEffect, useCallback, useRef } from 'react';
import { playNotifSound } from './sounds.js';
import {
  LayoutDashboard, Users, CreditCard, MessageSquare, Shield, Settings,
  LogOut, TrendingUp, Clock, Trophy, BarChart2, User, X, ChevronDown,
  Download, Send, Lock, RefreshCw, Eye, CheckCircle, Ban, UserCheck,
  Menu, Search, Filter, FileText, Star, AlertTriangle, Reply, Trash2,
  ChevronRight, Edit, ArrowUpRight, ArrowDownRight, Activity,
  Flag, Globe, Bell, BellOff, BellRing, Link,
} from 'lucide-react';

const BASE = import.meta.env.BASE_URL || '/admin-panel/';
const API = `${window.location.origin}`;

function Toast({ toasts }) {
  return (
    <div className="toast-container">
      {toasts.map(t => <div key={t.id} className={`toast toast-${t.type}`}>{t.msg}</div>)}
    </div>
  );
}

const DEFAULT_USD_RATE = 122.80;
let _adminCur = localStorage.getItem('admin-currency') || 'bdt';
function formatMoney(n) {
  const v = Number(n) || 0;
  if (_adminCur === 'usd') return `$${(v / DEFAULT_USD_RATE).toFixed(2)}`;
  return `৳${v.toLocaleString()}`;
}
function formatMoneyUSD(n, rate) { const r = rate > 0 ? rate : DEFAULT_USD_RATE; return `$${((Number(n) || 0) / r).toFixed(2)}`; }
function fmtDate(d) { if (!d) return '—'; try { return new Date(d.includes('Z') ? d : d + 'Z').toLocaleString('en-GB', { timeZone: 'Asia/Dhaka', day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' }); } catch { return d; } }

function Avatar({ src, name, size = 36, style = {} }) {
  const isPath = src && (src.startsWith('/') || src.startsWith('http'));
  if (isPath) {
    return <img src={src.startsWith('http') ? src : `${API}${src}`} alt={name || ''} style={{ width: size, height: size, borderRadius: '50%', objectFit: 'cover', flexShrink: 0, ...style }} onError={(e) => { e.target.style.display = 'none'; e.target.nextSibling && (e.target.nextSibling.style.display = 'flex'); }} />;
  }
  return (
    <div style={{ width: size, height: size, borderRadius: '50%', background: 'linear-gradient(135deg, #1E40AF, #3B82F6)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: size * 0.4, fontWeight: 700, flexShrink: 0, color: '#fff', ...style }}>
      {name?.[0] || '?'}
    </div>
  );
}

function MfgBackground() {
  const gearPath = "M12 2a1 1 0 0 1 1 1v1.07A7 7 0 0 1 17.93 8H19a1 1 0 0 1 0 2h-1.07A7 7 0 0 1 13 14.93V16a1 1 0 0 1-2 0v-1.07A7 7 0 0 1 6.07 10H5a1 1 0 0 1 0-2h1.07A7 7 0 0 1 11 3.07V2a1 1 0 0 1 1-1zm0 5a3 3 0 1 0 0 6 3 3 0 0 0 0-6z";
  const dots = Array.from({ length: 12 }, (_, i) => ({
    left: `${Math.random() * 90 + 5}%`,
    top: `${Math.random() * 90 + 5}%`,
    dur: `${4 + Math.random() * 6}s`,
    delay: `${Math.random() * 4}s`,
  }));
  return (
    <div className="mfg-bg" aria-hidden="true">
      <div className="mfg-bg-layer" />
      <div className="mfg-grid" />
      <svg className="mfg-gear" style={{ top: -40, left: -40, width: 200, height: 200 }} viewBox="0 0 24 24" fill="#1E40AF"><path d={gearPath}/></svg>
      <svg className="mfg-gear reverse" style={{ top: '30%', right: -60, width: 180, height: 180 }} viewBox="0 0 24 24" fill="#EA580C"><path d={gearPath}/></svg>
      <svg className="mfg-gear slow" style={{ bottom: -50, left: '40%', width: 240, height: 240 }} viewBox="0 0 24 24" fill="#1E40AF"><path d={gearPath}/></svg>
      <svg className="mfg-gear" style={{ bottom: '20%', right: 60, width: 120, height: 120, animationDuration: '18s' }} viewBox="0 0 24 24" fill="#2563EB"><path d={gearPath}/></svg>
      <svg className="mfg-circuit" style={{ top: '15%', left: '20%', width: 300, height: 160 }} viewBox="0 0 300 160" fill="none" stroke="#1E40AF" strokeWidth="1.5">
        <path d="M0 80 H60 V30 H120 V80 H180 V120 H240 V80 H300" />
        <circle cx="60" cy="80" r="4" fill="#1E40AF" />
        <circle cx="120" cy="30" r="4" fill="#1E40AF" />
        <circle cx="180" cy="80" r="4" fill="#1E40AF" />
        <circle cx="240" cy="120" r="4" fill="#1E40AF" />
      </svg>
      <svg className="mfg-circuit" style={{ bottom: '10%', right: '15%', width: 250, height: 120, animationDelay: '2s' }} viewBox="0 0 250 120" fill="none" stroke="#EA580C" strokeWidth="1.5">
        <path d="M0 60 H50 V20 H100 V60 H150 V100 H200 V60 H250" />
        <circle cx="50" cy="60" r="3" fill="#EA580C" />
        <circle cx="100" cy="20" r="3" fill="#EA580C" />
        <circle cx="150" cy="60" r="3" fill="#EA580C" />
      </svg>
      <div className="mfg-particles">
        {dots.map((d, i) => (
          <div key={i} className="mfg-dot" style={{ left: d.left, top: d.top, '--dur': d.dur, '--delay': d.delay }} />
        ))}
      </div>
    </div>
  );
}

function AdminNotifPanel({ open, onClose, authFetch, onNavigate }) {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!open) return;
    setLoading(true);
    authFetch(`${API}/api/admin/stats`)
      .then(r => r.json())
      .then(d => setStats(d))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [open]);

  if (!open) return null;

  const pendingDeposits = stats?.pendingDeposits || 0;
  const pendingWithdrawals = stats?.pendingWithdrawals || 0;
  const unreplied = stats?.support?.unrepliedSessions || 0;
  const recentActivity = (stats?.recentActivity || []).slice(0, 8);
  const total = pendingDeposits + pendingWithdrawals + unreplied;

  return (
    <>
      <div className="notif-panel-overlay" onClick={onClose} />
      <div className="notif-panel">
        <div className="notif-panel-header">
          <div className="notif-panel-title">🔔 Activity Overview</div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text2)', display: 'flex', padding: 4 }}>
            <X size={18} />
          </button>
        </div>
        <div className="notif-panel-body">
          {loading ? (
            <div className="notif-empty">
              <RefreshCw size={24} style={{ opacity: 0.4, animation: 'spin 1s linear infinite' }} />
              <div style={{ fontSize: 13 }}>Loading...</div>
            </div>
          ) : (
            <>
              {total === 0 && recentActivity.length === 0 ? (
                <div className="notif-empty">
                  <CheckCircle size={32} color="var(--success)" style={{ opacity: 0.6 }} />
                  <div style={{ fontSize: 13, fontWeight: 600 }}>All clear!</div>
                  <div style={{ fontSize: 12 }}>No pending actions</div>
                </div>
              ) : (
                <>
                  {pendingDeposits > 0 && (
                    <div className="notif-item" onClick={() => { onNavigate('finance'); onClose(); }}>
                      <div className="notif-icon" style={{ background: 'rgba(5,150,105,0.1)' }}>💰</div>
                      <div className="notif-content">
                        <div className="notif-content-title">{pendingDeposits} Pending Deposit{pendingDeposits > 1 ? 's' : ''}</div>
                        <div className="notif-content-sub">Awaiting approval → Finance</div>
                      </div>
                      <ChevronRight size={14} color="var(--text2)" />
                    </div>
                  )}
                  {pendingWithdrawals > 0 && (
                    <div className="notif-item" onClick={() => { onNavigate('finance'); onClose(); }}>
                      <div className="notif-icon" style={{ background: 'rgba(220,38,38,0.1)' }}>💸</div>
                      <div className="notif-content">
                        <div className="notif-content-title">{pendingWithdrawals} Pending Withdrawal{pendingWithdrawals > 1 ? 's' : ''}</div>
                        <div className="notif-content-sub">Awaiting approval → Finance</div>
                      </div>
                      <ChevronRight size={14} color="var(--text2)" />
                    </div>
                  )}
                  {unreplied > 0 && (
                    <div className="notif-item" onClick={() => { onNavigate('support'); onClose(); }}>
                      <div className="notif-icon" style={{ background: 'rgba(124,58,237,0.1)' }}>💬</div>
                      <div className="notif-content">
                        <div className="notif-content-title">{unreplied} Unanswered Support{unreplied > 1 ? 's' : ''}</div>
                        <div className="notif-content-sub">Users waiting for reply → Support</div>
                      </div>
                      <ChevronRight size={14} color="var(--text2)" />
                    </div>
                  )}
                  {recentActivity.length > 0 && (
                    <div style={{ padding: '10px 16px 4px', fontSize: 10, fontWeight: 700, color: 'var(--text2)', textTransform: 'uppercase', letterSpacing: '0.8px' }}>
                      Recent Activity
                    </div>
                  )}
                  {recentActivity.map((a, i) => (
                    <div key={i} className="notif-item" style={{ cursor: 'default' }}>
                      <div className="notif-icon" style={{ background: a.type === 'signup' ? 'rgba(37,99,235,0.1)' : a.type === 'deposit' ? 'rgba(5,150,105,0.1)' : 'rgba(220,38,38,0.1)', fontSize: 15 }}>
                        {a.type === 'signup' ? '👤' : a.type === 'deposit' ? '💰' : '💸'}
                      </div>
                      <div className="notif-content">
                        <div className="notif-content-title">{a.user_name || a.detail}</div>
                        <div className="notif-content-sub">
                          {a.type === 'signup' ? 'New registration' : `${a.type === 'deposit' ? '+' : '-'}৳${a.detail?.split(' ')[0]}`}
                          {' · '}{fmtDate(a.created_at)}
                        </div>
                      </div>
                    </div>
                  ))}
                </>
              )}
            </>
          )}
        </div>
      </div>
    </>
  );
}

// ── Admin Push Subscription ───────────────────────────────────────────────────
async function initAdminPush(token) {
  try {
    if (!('serviceWorker' in navigator) || !('PushManager' in window)) return;
    const reg = await navigator.serviceWorker.register(
      (import.meta.env.BASE_URL || '/xpc-ctrl-7f3b/') + 'sw.js',
      { scope: import.meta.env.BASE_URL || '/xpc-ctrl-7f3b/' }
    );
    const vapidRes = await fetch(`${window.location.origin}/api/push/vapid-public-key`);
    if (!vapidRes.ok) return;
    const { publicKey } = await vapidRes.json();
    const permission = await Notification.requestPermission();
    if (permission !== 'granted') return;
    const sub = await reg.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(publicKey),
    });
    const { endpoint, keys } = sub.toJSON();
    await fetch(`${window.location.origin}/api/push/subscribe`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ endpoint, p256dh: keys.p256dh, auth: keys.auth }),
    });
  } catch (_) {}
}

function urlBase64ToUint8Array(base64String) {
  const padding = '='.repeat((4 - base64String.length % 4) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const raw = atob(base64);
  return new Uint8Array([...raw].map(c => c.charCodeAt(0)));
}

export default function App() {
  const [token, setToken] = useState(() => localStorage.getItem('admin_token') || '');
  const [adminUser, setAdminUser] = useState(null);
  const [page, setPage] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [toasts, setToasts] = useState([]);
  const [notifOpen, setNotifOpen] = useState(false);
  const [pendingCount, setPendingCount] = useState(0);
  const prevPendingRef = useRef(null);
  const [adminCurrency, setAdminCurrency] = useState(() => localStorage.getItem('admin-currency') || 'bdt');
  const [treasuryBalance, setTreasuryBalance] = useState(null);

  const toast = (msg, type = 'success') => {
    const id = Date.now();
    setToasts(p => [...p, { id, msg, type }]);
    setTimeout(() => setToasts(p => p.filter(t => t.id !== id)), 3000);
  };

  const authFetch = async (url, opts = {}) => {
    const headers = { 'Content-Type': 'application/json', ...(opts.headers || {}), ...(token ? { Authorization: `Bearer ${token}` } : {}) };
    const res = await fetch(url, { ...opts, headers });
    if (res.status === 401) { localStorage.removeItem('admin_token'); setToken(''); setAdminUser(null); }
    return res;
  };

  useEffect(() => {
    if (!token) return;
    authFetch(`${API}/api/me`).then(r => r.json()).then(d => {
      if (d.user && d.user.is_admin) {
        setAdminUser(d.user);
        initAdminPush(token);
      } else {
        localStorage.removeItem('admin_token');
        setToken('');
      }
    }).catch(() => { localStorage.removeItem('admin_token'); setToken(''); });
  }, [token]);

  useEffect(() => {
    if (!token || !adminUser) return;
    const fetchPending = () => {
      authFetch(`${API}/api/admin/stats`).then(r => r.json()).then(d => {
        const n = (d.pendingDeposits || 0) + (d.pendingWithdrawals || 0) + (d.support?.unrepliedSessions || 0);
        if (prevPendingRef.current !== null && n > prevPendingRef.current) {
          playNotifSound();
        }
        prevPendingRef.current = n;
        setPendingCount(n);
      }).catch(() => {});
    };
    fetchPending();
    const t = setInterval(fetchPending, 30_000);
    return () => clearInterval(t);
  }, [token, adminUser]);

  const logout = () => { localStorage.removeItem('admin_token'); setToken(''); setAdminUser(null); };

  const toggleCurrency = () => {
    const next = adminCurrency === 'bdt' ? 'usd' : 'bdt';
    _adminCur = next;
    localStorage.setItem('admin-currency', next);
    setAdminCurrency(next);
  };

  const refreshTreasury = useCallback(async () => {
    if (!token) return;
    try {
      const r = await authFetch(`${API}/api/me`);
      const d = await r.json();
      if (r.ok && d.user) setTreasuryBalance(d.user.balance ?? 0);
    } catch {}
  }, [token]);

  useEffect(() => {
    refreshTreasury();
    const t = setInterval(refreshTreasury, 30_000);
    return () => clearInterval(t);
  }, [refreshTreasury]);

  if (!token || !adminUser) return <LoginScreen onLogin={(t, u) => { setToken(t); setAdminUser(u); localStorage.setItem('admin_token', t); initAdminPush(t); }} />;

  const isMain = !!adminUser.is_main_admin;
  const navItems = [
    ...(isMain ? [{ id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard }] : []),
    { id: 'users', label: 'Users', icon: Users },
    { id: 'finance', label: 'Finance', icon: CreditCard },
    ...(isMain ? [{ id: 'flagged', label: 'Flagged', icon: Flag }] : []),
    ...(isMain ? [{ id: 'ip-tracking', label: 'IP Tracking', icon: Globe }] : []),
    ...(isMain ? [{ id: 'live-locations', label: 'Live Locations', icon: Activity }] : []),
    { id: 'support', label: 'Support', icon: MessageSquare },
    ...(isMain ? [{ id: 'admins', label: 'Admin & Roles', icon: Shield }] : []),
    { id: 'notifications', label: 'Notifications', icon: Bell },
    ...(isMain ? [{ id: 'settings', label: 'Settings', icon: Settings }] : []),
  ];

  const activePage = navItems.find(n => n.id === page) ? page : navItems[0]?.id || 'users';
  if (activePage !== page) setPage(activePage);

  const pageLabels = {
    dashboard: 'Dashboard', users: 'Users', finance: 'Finance', flagged: 'Flagged',
    'ip-tracking': 'IP Tracking', 'live-locations': 'Live Locations', support: 'Support',
    admins: 'Admin & Roles', notifications: 'Notification Settings', settings: 'Settings',
  };

  return (
    <div className="app-layout">
      <MfgBackground />
      <Toast toasts={toasts} />
      <AdminNotifPanel
        open={notifOpen}
        onClose={() => setNotifOpen(false)}
        authFetch={authFetch}
        onNavigate={(p) => { setPage(p); setSidebarOpen(false); }}
      />
      <div className="hamburger" onClick={() => setSidebarOpen(p => !p)}><Menu size={20} /></div>
      <div className={`sidebar-overlay ${sidebarOpen ? 'open' : ''}`} onClick={() => setSidebarOpen(false)} />
      <aside className={`sidebar ${sidebarOpen ? 'open' : ''}`}>
        <div className="sidebar-header">
          <div className="sidebar-brand">
            <div className="sidebar-brand-icon">
              <Shield size={20} color="#fff" />
            </div>
            <div>
              <h2>PhoneCraft</h2>
              <div className="user-info">Admin Console</div>
            </div>
          </div>
          <div className="sidebar-admin-badge">
            <Shield size={9} /> {isMain ? 'Main Admin' : 'Admin'}
          </div>
          <div style={{ marginTop: 8, fontSize: 12, color: 'rgba(255,255,255,0.8)', fontWeight: 600 }}>
            {adminUser.name}
          </div>
        </div>
        <nav className="sidebar-nav">
          {navItems.map(n => {
            const Icon = n.icon;
            return (
              <div key={n.id} className={`nav-item ${page === n.id ? 'active' : ''}`} onClick={() => { setPage(n.id); setSidebarOpen(false); }}>
                <Icon size={17} /> {n.label}
              </div>
            );
          })}
        </nav>
        <div className="sidebar-footer">
          <div className="nav-item" onClick={logout} style={{ color: 'var(--danger)' }}><LogOut size={17} /> Logout</div>
        </div>
      </aside>
      <main className="main-content" onClick={() => sidebarOpen && setSidebarOpen(false)}>
        <div className="admin-topbar">
          <div className="topbar-left">
            <div className="topbar-page-title">{pageLabels[page] || page}</div>
          </div>
          <div className="topbar-right">
            {isMain && treasuryBalance !== null && (
              <div
                title="Admin Treasury Balance (live)"
                onClick={() => { setPage('dashboard'); refreshTreasury(); }}
                style={{ background: 'linear-gradient(135deg,rgba(14,203,129,0.15),rgba(14,203,129,0.05))', border: '1px solid rgba(14,203,129,0.3)', borderRadius: 8, padding: '4px 12px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}
              >
                <span style={{ fontSize: 10, color: 'var(--text2)' }}>Treasury</span>
                <span style={{ fontWeight: 800, fontSize: 14, color: '#0ECB81' }}>{formatMoney(treasuryBalance)}</span>
              </div>
            )}
            <button
              onClick={toggleCurrency}
              title={adminCurrency === 'bdt' ? 'Switch to USD ($)' : 'Switch to BDT (৳)'}
              style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 8, padding: '4px 10px', cursor: 'pointer', fontWeight: 700, fontSize: 13, color: adminCurrency === 'usd' ? '#22C55E' : '#F59E0B', display: 'flex', alignItems: 'center', gap: 4 }}
            >
              {adminCurrency === 'bdt' ? '৳ BDT' : '$ USD'}
            </button>
            <div className="topbar-icon-btn" onClick={(e) => { e.stopPropagation(); setNotifOpen(p => !p); }} title="Activity & Alerts">
              <Bell size={18} />
              {pendingCount > 0 && <span className="topbar-badge">{pendingCount > 9 ? '9+' : pendingCount}</span>}
            </div>
            <div style={{ width: 32, height: 32, borderRadius: 8, background: 'linear-gradient(135deg,#1E40AF,#3B82F6)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 13, fontWeight: 800 }}>
              {adminUser.name?.[0] || 'A'}
            </div>
          </div>
        </div>

        {page === 'dashboard' && <DashboardPage authFetch={authFetch} toast={toast} isMain={isMain} treasuryBalance={treasuryBalance} refreshTreasury={refreshTreasury} />}
        {page === 'users' && <UsersPage authFetch={authFetch} toast={toast} isMain={isMain} adminUser={adminUser} />}
        {page === 'finance' && <FinancePage authFetch={authFetch} toast={toast} isMain={isMain} />}
        {page === 'flagged' && <FlaggedPage authFetch={authFetch} toast={toast} />}
        {page === 'ip-tracking' && <IpTrackingPage authFetch={authFetch} toast={toast} />}
        {page === 'live-locations' && <LiveLocationsPage authFetch={authFetch} toast={toast} />}
        {page === 'support' && <SupportPage authFetch={authFetch} toast={toast} />}
        {page === 'admins' && <AdminsPage authFetch={authFetch} toast={toast} adminUser={adminUser} />}
        {page === 'notifications' && <NotificationsPage authFetch={authFetch} toast={toast} token={token} />}
        {page === 'settings' && <SettingsPage authFetch={authFetch} toast={toast} />}
      </main>
    </div>
  );
}

function LoginScreen({ onLogin }) {
  const [id, setId] = useState('');
  const [pw, setPw] = useState('');
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState('');

  const login = async (e) => {
    e.preventDefault();
    setLoading(true); setErr('');
    try {
      const res = await fetch(`${API}/api/admin/login`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identifier: id, password: pw }),
      });
      const data = await res.json();
      if (res.ok && data.token && data.user?.is_admin) {
        onLogin(data.token, data.user);
      } else {
        setErr(data.error || 'Invalid credentials');
      }
    } catch { setErr('Connection error'); }
    finally { setLoading(false); }
  };

  return (
    <div className="login-container">
      <MfgBackground />
      <form className="login-box" onSubmit={login}>
        <div className="login-logo">
          <div className="login-logo-icon"><Shield size={22} color="#fff" /></div>
        </div>
        <h1>Secure Access</h1>
        <p className="subtitle">Authorized Personnel Only</p>
        {err && (
          <div style={{ background: 'rgba(220,38,38,0.07)', border: '1px solid rgba(220,38,38,0.2)', borderRadius: 10, padding: '10px 14px', color: 'var(--danger)', fontSize: 12, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
            <AlertTriangle size={14} /> {err}
          </div>
        )}
        <label className="input-label">Identifier</label>
        <input className="inp" value={id} onChange={e => setId(e.target.value)} placeholder="Admin ID or phone" autoFocus />
        <label className="input-label">Password</label>
        <input className="inp" type="password" value={pw} onChange={e => setPw(e.target.value)} placeholder="Enter password" />
        <button className="btn btn-primary btn-full" type="submit" disabled={loading} style={{ marginTop: 8 }}>
          <Lock size={14} /> {loading ? 'Verifying...' : 'Sign in to Admin Panel'}
        </button>
        <div style={{ marginTop: 16, textAlign: 'center', fontSize: 11, color: 'var(--text2)' }}>
          Secure • Encrypted • Admin Access Only
        </div>
      </form>
    </div>
  );
}

function AnalyticsChart({ authFetch }) {
  const [period, setPeriod] = useState('daily');
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);

  const loadAnalytics = useCallback(async (p) => {
    setLoading(true);
    try {
      const r = await authFetch(`${API}/api/admin/analytics?period=${p}`);
      const d = await r.json();
      if (r.ok) setData(d.data || []);
    } catch {}
    finally { setLoading(false); }
  }, []);

  useEffect(() => { loadAnalytics(period); }, [period, loadAnalytics]);

  const maxVal = Math.max(...data.map(d => Math.max(d.deposits || 0, d.withdrawals || 0, Math.abs(d.netProfit || 0))), 1);
  const W = 500, H = 170, ML = 52, MT = 10, MB = 26, MR = 8;
  const plotW = W - ML - MR;
  const plotH = H - MT - MB;
  const n = data.length;
  const xPos = i => ML + (n <= 1 ? plotW / 2 : (i / (n - 1)) * plotW);
  const yPos = v => MT + plotH - Math.max(0, (Math.max(0, v) / maxVal) * plotH);

  const polyline = (key, color) => {
    if (!data.length) return null;
    const pts = data.map((d, i) => `${xPos(i)},${yPos(d[key])}`).join(' ');
    return <polyline key={key} points={pts} fill="none" stroke={color} strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" />;
  };

  const periodLabel = p => {
    if (!p) return '';
    if (p.includes('-W')) return `W${p.split('-W')[1]}`;
    if (p.length === 7) return p.slice(5);
    return p.slice(5);
  };

  return (
    <div className="card">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
        <div className="card-title" style={{ margin: 0 }}><Activity size={16} /> Financial Analytics</div>
        <div style={{ display: 'flex', gap: 6 }}>
          {['daily', 'weekly', 'monthly'].map(p => (
            <button key={p} className={`btn btn-sm ${period === p ? 'btn-primary' : 'btn-outline'}`}
              onClick={() => setPeriod(p)} style={{ textTransform: 'capitalize', fontSize: 11 }}>{p}</button>
          ))}
        </div>
      </div>
      {loading ? (
        <div style={{ height: 160, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text2)' }}>Loading chart...</div>
      ) : data.length === 0 ? (
        <div style={{ height: 160, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text2)' }}>No transaction data yet</div>
      ) : (
        <svg viewBox={`0 0 ${W} ${H}`} style={{ width: '100%', height: 'auto', overflow: 'visible' }}>
          {[0, 0.25, 0.5, 0.75, 1].map(t => {
            const y = MT + plotH * (1 - t);
            return (
              <g key={t}>
                <line x1={ML} y1={y} x2={W - MR} y2={y} stroke="rgba(30,64,175,0.08)" strokeWidth="1" />
                <text x={ML - 4} y={y + 4} textAnchor="end" fontSize="9" fill="#94A3B8">{formatMoney(Math.round(maxVal * t))}</text>
              </g>
            );
          })}
          {data.map((d, i) => {
            if (n > 18 && i % Math.ceil(n / 10) !== 0) return null;
            return <text key={i} x={xPos(i)} y={H - 7} textAnchor="middle" fontSize="8.5" fill="#94A3B8">{periodLabel(d.period)}</text>;
          })}
          {polyline('deposits', 'var(--success)')}
          {polyline('withdrawals', 'var(--danger)')}
          {polyline('netProfit', '#60a5fa')}
          {data.map((d, i) => (
            <g key={i}>
              <circle cx={xPos(i)} cy={yPos(d.deposits)} r="3" fill="var(--success)" />
              <circle cx={xPos(i)} cy={yPos(d.withdrawals)} r="3" fill="var(--danger)" />
              <circle cx={xPos(i)} cy={yPos(Math.max(0, d.netProfit))} r="3" fill="#60a5fa" />
            </g>
          ))}
        </svg>
      )}
      <div style={{ display: 'flex', justifyContent: 'center', gap: 20, fontSize: 11, color: 'var(--text2)', marginTop: 4 }}>
        {[['var(--success)', 'Deposits'], ['var(--danger)', 'Withdrawals'], ['#60a5fa', 'Net Profit']].map(([c, lbl]) => (
          <span key={lbl}><span style={{ display: 'inline-block', width: 10, height: 10, borderRadius: 2, background: c, marginRight: 4, verticalAlign: 'middle' }} />{lbl}</span>
        ))}
      </div>
    </div>
  );
}

function DashboardPage({ authFetch, toast, isMain, treasuryBalance, refreshTreasury }) {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const r = await authFetch(`${API}/api/admin/stats`);
      const d = await r.json();
      if (r.ok) setStats(d);
    } catch {}
    finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  if (loading || !stats) return <div className="card" style={{ textAlign: 'center', padding: 60, color: 'var(--text2)' }}>Loading dashboard...</div>;

  const chartData = (stats.revenueChart || []).slice(-14);
  const chartMax = Math.max(...chartData.map(d => Math.max(d.deposits || 0, d.withdrawals || 0)), 1);

  return (
    <>
      <div className="page-header">
        <div><h1>Dashboard</h1><div className="subtitle">Platform overview & analytics</div></div>
        <button className="btn btn-outline btn-sm" onClick={load}><RefreshCw size={14} /> Refresh</button>
      </div>

      <div className="stats-grid">
        <div className="stat-card"><div className="stat-value" style={{ color: 'var(--accent)' }}>{stats.totalUsers || 0}</div><div className="stat-label">Total Users</div></div>
        <div className="stat-card"><div className="stat-value" style={{ color: 'var(--info)' }}>{stats.activeToday || 0}</div><div className="stat-label">Active Today</div></div>
        <div className="stat-card"><div className="stat-value" style={{ color: 'var(--success)' }}>{stats.newUsersToday || 0}</div><div className="stat-label">New Today</div></div>
        <div className="stat-card"><div className="stat-value" style={{ color: stats.profitLoss >= 0 ? 'var(--success)' : 'var(--danger)' }}>{stats.profitLoss >= 0 ? '+' : ''}{formatMoney(stats.profitLoss || 0)}</div><div className="stat-label">Net Profit</div></div>
      </div>

      {isMain && treasuryBalance !== null && (
        <div className="card" style={{ borderColor: 'rgba(14,203,129,0.3)', background: 'linear-gradient(135deg,rgba(14,203,129,0.07),rgba(14,203,129,0.02))', marginBottom: 20 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
            <div>
              <div style={{ fontSize: 12, color: 'var(--text2)', fontWeight: 600, letterSpacing: 1, marginBottom: 4 }}>ADMIN TREASURY BALANCE</div>
              <div style={{ fontSize: 36, fontWeight: 900, color: '#0ECB81', lineHeight: 1 }}>{formatMoney(treasuryBalance)}</div>
              <div style={{ fontSize: 12, color: 'var(--text2)', marginTop: 6 }}>
                Auto-updated: deposits credit treasury, withdrawals debit treasury
              </div>
            </div>
            <button className="btn btn-sm btn-outline" onClick={refreshTreasury}><RefreshCw size={13} /> Refresh</button>
          </div>
        </div>
      )}

      <div className="grid-2">
        <div className="card">
          <div className="card-title"><ArrowDownRight size={16} color="var(--success)" /> Deposits</div>
          <div style={{ fontSize: 28, fontWeight: 900, color: 'var(--success)' }}>{formatMoney(stats.deposits?.sum || 0)}</div>
          <div style={{ fontSize: 12, color: 'var(--text2)', marginTop: 4 }}>{stats.deposits?.count || 0} total transactions</div>
        </div>
        <div className="card">
          <div className="card-title"><ArrowUpRight size={16} color="var(--danger)" /> Withdrawals</div>
          <div style={{ fontSize: 28, fontWeight: 900, color: 'var(--danger)' }}>{formatMoney(stats.withdrawals?.sum || 0)}</div>
          <div style={{ fontSize: 12, color: 'var(--text2)', marginTop: 4 }}>{stats.withdrawals?.count || 0} total transactions</div>
        </div>
      </div>

      <div className="grid-2">
        <div className="card" style={{ borderColor: 'rgba(252,213,53,0.3)' }}>
          <div className="card-title"><Clock size={16} color="var(--warning)" /> Pending Actions</div>
          <div className="grid-2" style={{ marginTop: 8 }}>
            <div style={{ padding: 14, borderRadius: 10, background: 'rgba(14,203,129,0.08)', textAlign: 'center' }}>
              <div style={{ fontSize: 32, fontWeight: 900, color: 'var(--success)' }}>{stats.pendingDeposits || 0}</div>
              <div style={{ fontSize: 11, color: 'var(--text2)' }}>Deposits</div>
            </div>
            <div style={{ padding: 14, borderRadius: 10, background: 'rgba(246,70,93,0.08)', textAlign: 'center' }}>
              <div style={{ fontSize: 32, fontWeight: 900, color: 'var(--danger)' }}>{stats.pendingWithdrawals || 0}</div>
              <div style={{ fontSize: 11, color: 'var(--text2)' }}>Withdrawals</div>
            </div>
          </div>
        </div>

        {stats.support && (
          <div className="card">
            <div className="card-title"><MessageSquare size={16} color="var(--info)" /> Support Summary</div>
            <div className="grid-3" style={{ marginTop: 8 }}>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 24, fontWeight: 900, color: 'var(--info)' }}>{stats.support.totalSessions}</div>
                <div style={{ fontSize: 10, color: 'var(--text2)' }}>Sessions</div>
              </div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 24, fontWeight: 900, color: 'var(--danger)' }}>{stats.support.unrepliedSessions}</div>
                <div style={{ fontSize: 10, color: 'var(--text2)' }}>Unanswered</div>
              </div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 24, fontWeight: 900, color: 'var(--success)' }}>{stats.support.adminReplies}</div>
                <div style={{ fontSize: 10, color: 'var(--text2)' }}>Replies</div>
              </div>
            </div>
          </div>
        )}
      </div>

      <AnalyticsChart authFetch={authFetch} />

      <div className="grid-2">
        {stats.planDistribution?.length > 0 && (
          <div className="card">
            <div className="card-title"><BarChart2 size={16} /> Plan Distribution</div>
            {stats.planDistribution.map((p, i) => {
              const total = stats.planDistribution.reduce((s, x) => s + x.count, 0) || 1;
              const pct = Math.round((p.count / total) * 100);
              return (
                <div key={i} style={{ marginBottom: 10 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, marginBottom: 4 }}>
                    <span style={{ fontWeight: 700, color: p.color }}>{p.name}</span>
                    <span style={{ color: 'var(--text2)' }}>{p.count} ({pct}%)</span>
                  </div>
                  <div className="progress-bar"><div className="progress-bar-fill" style={{ width: `${pct}%`, background: p.color }} /></div>
                </div>
              );
            })}
          </div>
        )}

        {stats.topEarners?.length > 0 && (
          <div className="card">
            <div className="card-title"><Trophy size={16} color="var(--warning)" /> Top Earners <span style={{ fontSize: 10, color: 'var(--text2)', fontWeight: 400 }}>(Task + Referral income)</span></div>
            {stats.topEarners.filter(u => (u.earned || 0) > 0).map((u, i) => (
              <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 10px', borderRadius: 8, background: 'rgba(35,175,145,0.05)', marginBottom: 4 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <span style={{ fontWeight: 800, color: i === 0 ? '#ffd700' : i === 1 ? '#c0c0c0' : i === 2 ? '#cd7f32' : 'var(--warning)', minWidth: 24 }}>#{i + 1}</span>
                  <span style={{ fontWeight: 600 }}>{u.name}</span>
                </div>
                <span style={{ fontWeight: 700, color: 'var(--success)' }}>{formatMoney(u.earned)}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {stats.recentActivity?.length > 0 && (
        <div className="card">
          <div className="card-title"><Activity size={16} /> Recent Activity</div>
          <div style={{ maxHeight: 300, overflowY: 'auto' }}>
            {stats.recentActivity.map((a, i) => (
              <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0', borderBottom: '1px solid var(--border)', fontSize: 13 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ fontSize: 16 }}>{a.type === 'signup' ? '👤' : a.type === 'deposit' ? '💰' : '💸'}</span>
                  <div>
                    <span style={{ fontWeight: 600 }}>{a.user_name || a.detail}</span>
                    {a.type !== 'signup' && (
                      <span style={{ color: a.type === 'deposit' ? 'var(--success)' : 'var(--danger)', marginLeft: 6 }}>
                        {a.type === 'deposit' ? '+' : '-'}৳{a.detail?.split(' ')[0]}
                        <span style={{ color: 'var(--text2)', fontSize: 11, marginLeft: 4 }}>{a.detail?.split(' ')[1]?.toUpperCase()}</span>
                      </span>
                    )}
                    {a.type === 'signup' && <span style={{ color: 'var(--text2)', marginLeft: 6, fontSize: 11 }}>joined</span>}
                  </div>
                </div>
                <span style={{ color: 'var(--text2)', fontSize: 11 }}>{fmtDate(a.created_at)}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {stats.methodBreakdown?.length > 0 && (
        <div className="card">
          <div className="card-title"><CreditCard size={16} /> Payment Method Breakdown</div>
          <div className="table-wrap">
            <table>
              <thead><tr><th>Method</th><th>Type</th><th>Count</th><th>Total</th></tr></thead>
              <tbody>
                {stats.methodBreakdown.map((m, i) => (
                  <tr key={i}>
                    <td style={{ fontWeight: 600 }}>{m.method?.toUpperCase()}</td>
                    <td><span className={`badge ${m.type === 'deposit' ? 'badge-green' : 'badge-red'}`}>{m.type}</span></td>
                    <td>{m.count}</td>
                    <td style={{ fontWeight: 700, color: m.type === 'deposit' ? 'var(--success)' : 'var(--danger)' }}>{formatMoney(m.total)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </>
  );
}

function UsersPage({ authFetch, toast, isMain, adminUser }) {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');
  const [selected, setSelected] = useState(null);
  const [profile, setProfile] = useState(null);
  const [profileTab, setProfileTab] = useState('info');
  const [saving, setSaving] = useState(false);
  const [editForm, setEditForm] = useState({});
  const [bulkMode, setBulkMode] = useState(false);
  const [bulkIds, setBulkIds] = useState(new Set());
  const [msgTarget, setMsgTarget] = useState('all');
  const [msgUserId, setMsgUserId] = useState('');
  const [msgText, setMsgText] = useState('');
  const [msgSending, setMsgSending] = useState(false);
  const [planOptions, setPlanOptions] = useState([]);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const r = await authFetch(`${API}/api/admin/users`);
      const d = await r.json();
      if (r.ok) setUsers(d.users || []);
      else toast('Failed to load users', 'error');
    } catch { toast('Failed to load users', 'error'); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  useEffect(() => {
    if (!isMain) return;
    authFetch(`${API}/api/admin/plans`).then(r => r.json()).then(d => {
      if (d.plans && d.plans.length) setPlanOptions(d.plans);
      else setPlanOptions([{ id: 'basic', name: 'Basic' }, { id: 'premium', name: 'Premium' }, { id: 'gold', name: 'Gold' }, { id: 'platinum', name: 'Platinum' }]);
    }).catch(() => setPlanOptions([{ id: 'basic', name: 'Basic' }, { id: 'premium', name: 'Premium' }, { id: 'gold', name: 'Gold' }, { id: 'platinum', name: 'Platinum' }]));
  }, [isMain]);

  const filtered = users.filter(u => {
    if (!isMain && u.is_admin) return false;
    const q = search.toLowerCase();
    const match = !q || u.name.toLowerCase().includes(q) || u.identifier.toLowerCase().includes(q) || u.refer_code.toLowerCase().includes(q) || String(u.id) === q;
    const statusMatch = filter === 'all' || (filter === 'banned' && u.banned) || (filter === 'admin' && u.is_admin) || (filter === 'active' && !u.banned && !u.is_admin);
    return match && statusMatch;
  });

  const selectUser = async (u) => {
    setSelected(u);
    setProfileTab('info');
    setEditForm({ balance: u.balance, plan_id: u.plan_id, is_admin: !!u.is_admin });
    setProfile(null);
    try {
      const r = await authFetch(`${API}/api/admin/users/${u.id}/full-profile`);
      const d = await r.json();
      if (r.ok) setProfile(d);
    } catch {}
  };

  const selectUserById = async (id) => {
    const u = users.find(u => u.id === id);
    if (u) { selectUser(u); return; }
    // If not in list (e.g., sub-admin), fetch it
    try {
      const r = await authFetch(`${API}/api/admin/users/${id}/full-profile`);
      const d = await r.json();
      if (r.ok) {
        const fakeUser = { id, name: d.user?.name || '?', balance: d.user?.balance || 0, plan_id: d.user?.plan_id, is_admin: d.user?.is_admin || 0 };
        setSelected(fakeUser);
        setProfileTab('info');
        setEditForm({ balance: fakeUser.balance, plan_id: fakeUser.plan_id, is_admin: !!fakeUser.is_admin });
        setProfile(d);
      }
    } catch {}
  };

  const saveUser = async () => {
    if (!selected) return;
    setSaving(true);
    try {
      const body = isMain ? { balance: Number(editForm.balance), plan_id: editForm.plan_id, banned: selected.banned, is_admin: editForm.is_admin } : { banned: selected.banned };
      const r = await authFetch(`${API}/api/admin/users/${selected.id}`, { method: 'PATCH', body: JSON.stringify(body) });
      if (r.ok) { toast('User updated'); load(); }
      else toast((await r.json()).error || 'Failed', 'error');
    } catch { toast('Connection error', 'error'); }
    finally { setSaving(false); }
  };

  const toggleBan = async (u) => {
    try {
      const r = await authFetch(`${API}/api/admin/users/${u.id}`, { method: 'PATCH', body: JSON.stringify({ banned: u.banned ? 0 : 1 }) });
      if (r.ok) { toast(u.banned ? 'User unbanned' : 'User banned'); load(); if (selected?.id === u.id) setSelected(p => ({ ...p, banned: u.banned ? 0 : 1 })); }
    } catch { toast('Failed', 'error'); }
  };

  const resetPw = async (uid) => {
    const pw = prompt('Enter new password (min 6 chars):');
    if (!pw || pw.length < 6) return;
    try {
      const r = await authFetch(`${API}/api/admin/users/${uid}/force-password-reset`, { method: 'POST', body: JSON.stringify({ newPassword: pw }) });
      if (r.ok) toast('Password reset done');
      else toast('Failed', 'error');
    } catch { toast('Failed', 'error'); }
  };

  const bulkAction = async (action) => {
    if (bulkIds.size === 0) return;
    try {
      const r = await authFetch(`${API}/api/admin/bulk-action`, { method: 'POST', body: JSON.stringify({ action, userIds: [...bulkIds] }) });
      const d = await r.json();
      if (r.ok) { toast(`${d.affected} users ${action === 'ban' ? 'banned' : 'unbanned'}`); setBulkIds(new Set()); load(); }
    } catch { toast('Failed', 'error'); }
  };

  const exportCSV = async () => {
    try {
      const r = await authFetch(`${API}/api/admin/export/users`);
      const d = await r.json();
      const items = d.users || [];
      if (!items.length) return toast('No data', 'warning');
      const h = Object.keys(items[0]);
      const csv = [h.join(','), ...items.map(r => h.map(k => `"${String(r[k] || '').replace(/"/g, '""')}"`).join(','))].join('\n');
      const a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([csv], { type: 'text/csv' })); a.download = 'users_export.csv'; a.click();
      toast(`${items.length} users exported`);
    } catch { toast('Export failed', 'error'); }
  };

  const sendMsg = async () => {
    const text = msgText.trim();
    if (!text) return;
    setMsgSending(true);
    try {
      const r = await authFetch(`${API}/api/admin/messages`, { method: 'POST', body: JSON.stringify({ target: msgTarget, userId: msgTarget === 'user' ? Number(msgUserId) : undefined, message: text }) });
      const d = await r.json();
      if (r.ok) { setMsgText(''); toast(`Delivered to ${d.delivered || 0} users`); }
      else toast(d.error || 'Failed', 'error');
    } catch { toast('Failed', 'error'); }
    finally { setMsgSending(false); }
  };

  return (
    <>
      <div className="page-header">
        <div><h1>User Management</h1><div className="subtitle">{users.length} total users</div></div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button className={`btn btn-sm ${bulkMode ? 'btn-primary' : 'btn-outline'}`} onClick={() => { setBulkMode(!bulkMode); setBulkIds(new Set()); }}>
            {bulkMode ? 'Exit Bulk' : 'Bulk Select'}
          </button>
          {isMain && <button className="btn btn-outline btn-sm" onClick={exportCSV}><Download size={14} /> Export CSV</button>}
        </div>
      </div>

      {bulkMode && bulkIds.size > 0 && (
        <div className="card" style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 20px', borderColor: 'var(--accent)' }}>
          <span style={{ fontWeight: 700 }}>{bulkIds.size} selected</span>
          <button className="btn btn-danger btn-sm" onClick={() => bulkAction('ban')}>Ban All</button>
          <button className="btn btn-success btn-sm" onClick={() => bulkAction('unban')}>Unban All</button>
        </div>
      )}

      <div className="card">
        <div className="card-title"><Send size={16} /> Broadcast Message</div>
        <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
          <button className={`btn btn-sm ${msgTarget === 'all' ? 'btn-primary' : 'btn-outline'}`} onClick={() => setMsgTarget('all')}>All Users</button>
          <button className={`btn btn-sm ${msgTarget === 'user' ? 'btn-primary' : 'btn-outline'}`} onClick={() => setMsgTarget('user')}>Single User</button>
        </div>
        {msgTarget === 'user' && (
          <select className="inp" value={msgUserId} onChange={e => setMsgUserId(e.target.value)}>
            <option value="">Select user...</option>
            {users.filter(u => !u.banned).map(u => <option key={u.id} value={u.id}>{u.name} ({u.identifier})</option>)}
          </select>
        )}
        <textarea className="inp" rows={2} placeholder="Type message..." value={msgText} onChange={e => setMsgText(e.target.value)} />
        <button className="btn btn-primary btn-sm" onClick={sendMsg} disabled={msgSending}>{msgSending ? 'Sending...' : 'Send Message'}</button>
      </div>

      <div className="card" style={{ padding: '14px 18px' }}>
        <div style={{ display: 'flex', gap: 10, alignItems: 'center', marginBottom: 12 }}>
          <div style={{ flex: 1, position: 'relative' }}>
            <Search size={16} style={{ position: 'absolute', left: 12, top: 11, color: 'var(--text2)' }} />
            <input className="inp" style={{ paddingLeft: 36, marginBottom: 0 }} placeholder="Search by name, email, ID, or refer code..." value={search} onChange={e => setSearch(e.target.value)} />
          </div>
        </div>
        <div className="filter-bar">
          {[{ id: 'all', label: 'All' }, { id: 'active', label: 'Active' }, { id: 'banned', label: 'Banned' }, ...(isMain ? [{ id: 'admin', label: 'Admins' }] : [])].map(f => (
            <button key={f.id} className={`btn btn-sm ${filter === f.id ? 'btn-primary' : 'btn-outline'}`} onClick={() => setFilter(f.id)}>{f.label}</button>
          ))}
        </div>
      </div>

      {/* User Profile Modal */}
      {selected && (
        <div className="modal-overlay" onClick={() => setSelected(null)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{selected.name}</h2>
              <button className="btn btn-outline btn-sm" onClick={() => setSelected(null)}><X size={16} /></button>
            </div>

            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 16 }}>
              <span className="badge badge-blue">ID: {selected.id}</span>
              <span className="badge badge-blue">{selected.identifier}</span>
              <span className="badge badge-purple">REF: {selected.refer_code}</span>
              {selected.referred_by && <span className="badge badge-blue">By: {selected.referred_by}</span>}
              <span className={`badge ${selected.banned ? 'badge-red' : 'badge-green'}`}>{selected.banned ? 'Banned' : 'Active'}</span>
              {selected.is_admin && <span className="badge badge-purple">Admin</span>}
            </div>

            <div className="filter-bar">
              {['info', 'transactions', 'referrals', 'manufacturing', 'logins'].map(t => (
                <button key={t} className={`btn btn-sm ${profileTab === t ? 'btn-primary' : 'btn-outline'}`} onClick={() => setProfileTab(t)}>
                  {t.charAt(0).toUpperCase() + t.slice(1)}
                </button>
              ))}
            </div>

            {profileTab === 'info' && (
              <>
                {profile && (
                  <div className="grid-4">
                    <div className="stat-card"><div className="stat-value" style={{ fontSize: 18, color: 'var(--success)' }}>{formatMoney(selected.balance)}</div><div className="stat-label">Balance</div></div>
                    <div className="stat-card"><div className="stat-value" style={{ fontSize: 18, color: 'var(--info)' }}>{formatMoney(profile.balanceSummary?.total_credit || 0)}</div><div className="stat-label">Earned</div></div>
                    <div className="stat-card"><div className="stat-value" style={{ fontSize: 18, color: 'var(--accent)' }}>{formatMoney(profile.txStats?.total_deposited || 0)}</div><div className="stat-label">Deposited</div></div>
                    <div className="stat-card"><div className="stat-value" style={{ fontSize: 18, color: 'var(--danger)' }}>{formatMoney(profile.txStats?.total_withdrawn || 0)}</div><div className="stat-label">Withdrawn</div></div>
                  </div>
                )}
                {isMain && (
                  <div className="grid-2" style={{ marginBottom: 16 }}>
                    <div><label className="input-label">Balance</label><input className="inp" type="number" value={editForm.balance ?? ''} onChange={e => setEditForm(p => ({ ...p, balance: e.target.value }))} /></div>
                    <div><label className="input-label">Plan</label>
                      <select className="inp" value={editForm.plan_id || ''} onChange={e => setEditForm(p => ({ ...p, plan_id: e.target.value }))}>
                        {planOptions.map(p => <option key={p.id || p} value={p.id || p}>{(p.name || p).toUpperCase()}</option>)}
                      </select>
                    </div>
                  </div>
                )}
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                  {isMain && <button className="btn btn-primary btn-sm" onClick={saveUser} disabled={saving}>{saving ? 'Saving...' : 'Save Changes'}</button>}
                  <button className={`btn btn-sm ${selected.banned ? 'btn-success' : 'btn-danger'}`} onClick={() => toggleBan(selected)}>{selected.banned ? 'Unban' : 'Ban'}</button>
                  {isMain && <button className="btn btn-outline btn-sm" onClick={() => resetPw(selected.id)}><Lock size={14} /> Reset Password</button>}
                </div>
              </>
            )}

            {profileTab === 'transactions' && profile && (
              <div style={{ maxHeight: 350, overflowY: 'auto' }}>
                {(profile.transactions || []).length === 0 ? <div style={{ textAlign: 'center', padding: 30, color: 'var(--text2)' }}>No transactions</div> : (
                  <div className="table-wrap"><table><thead><tr><th>Type</th><th>Amount</th><th>Method</th><th>Status</th><th>Date</th></tr></thead><tbody>
                    {profile.transactions.map(tx => (
                      <tr key={tx.id}>
                        <td>{tx.type === 'deposit' ? '💰' : '💸'} {tx.type}</td>
                        <td style={{ fontWeight: 700 }}>{formatMoney(tx.amount)}</td>
                        <td>{tx.method}</td>
                        <td><span className={`badge ${tx.status === 'approved' ? 'badge-green' : tx.status === 'rejected' ? 'badge-red' : 'badge-yellow'}`}>{tx.status}</span></td>
                        <td style={{ fontSize: 11, color: 'var(--text2)' }}>{fmtDate(tx.created_at)}</td>
                      </tr>
                    ))}
                  </tbody></table></div>
                )}
              </div>
            )}

            {profileTab === 'referrals' && profile && (
              <>
                <div className="grid-3">
                  <div className="stat-card"><div className="stat-value" style={{ fontSize: 20 }}>{profile.referralMembers?.l1_count || 0}</div><div className="stat-label">Level 1</div></div>
                  <div className="stat-card"><div className="stat-value" style={{ fontSize: 20 }}>{profile.referralMembers?.l2_count || 0}</div><div className="stat-label">Level 2</div></div>
                  <div className="stat-card"><div className="stat-value" style={{ fontSize: 20 }}>{profile.referralMembers?.l3_count || 0}</div><div className="stat-label">Level 3</div></div>
                </div>
                <div style={{ maxHeight: 250, overflowY: 'auto' }}>
                  {(profile.referralTree || []).map(r => (
                    <div
                      key={r.id}
                      onClick={() => selectUserById(r.id)}
                      style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 6px', borderBottom: '1px solid var(--border)', fontSize: 13, paddingLeft: (r.level - 1) * 20 + 6, cursor: 'pointer', borderRadius: 6, transition: 'background .15s' }}
                      onMouseEnter={e => e.currentTarget.style.background = 'var(--bg2)'}
                      onMouseLeave={e => e.currentTarget.style.background = ''}
                    >
                      <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <ChevronRight size={12} style={{ color: 'var(--accent)', flexShrink: 0 }} />
                        {r.name} <span className="badge badge-blue" style={{ fontSize: 9 }}>L{r.level}</span>
                      </span>
                      <span style={{ color: 'var(--text2)', fontSize: 11 }}>{r.refer_code}</span>
                    </div>
                  ))}
                </div>
              </>
            )}

            {profileTab === 'manufacturing' && profile && (
              <>
                <div className="grid-2">
                  <div className="stat-card"><div className="stat-value" style={{ fontSize: 20 }}>{profile.mfgStats?.total_jobs || 0}</div><div className="stat-label">Total Jobs</div></div>
                  <div className="stat-card"><div className="stat-value" style={{ fontSize: 20, color: 'var(--success)' }}>{formatMoney(profile.mfgStats?.total_earned || 0)}</div><div className="stat-label">Total Earned</div></div>
                </div>
                <div style={{ maxHeight: 250, overflowY: 'auto' }}>
                  {(profile.recentJobs || []).map(j => (
                    <div key={j.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid var(--border)', fontSize: 13 }}>
                      <span>{j.device_name} <span style={{ color: 'var(--text2)' }}>({j.brand})</span></span>
                      <span style={{ color: 'var(--success)', fontWeight: 700 }}>+{formatMoney(j.earned)}</span>
                    </div>
                  ))}
                </div>
              </>
            )}

            {profileTab === 'logins' && profile && (
              <div style={{ maxHeight: 300, overflowY: 'auto' }}>
                <div className="table-wrap"><table><thead><tr><th>IP</th><th>Location</th><th>Date</th></tr></thead><tbody>
                  {(profile.loginLogs || []).map(l => (
                    <tr key={l.id}>
                      <td style={{ fontFamily: 'monospace', color: 'var(--accent)' }}>{l.ip || 'local'}</td>
                      <td>{l.city}{l.city && l.country ? ', ' : ''}{l.country || 'Local'}</td>
                      <td style={{ fontSize: 11, color: 'var(--text2)' }}>{fmtDate(l.logged_at)}</td>
                    </tr>
                  ))}
                </tbody></table></div>
              </div>
            )}
          </div>
        </div>
      )}

      {loading ? <div className="card" style={{ textAlign: 'center', padding: 60, color: 'var(--text2)' }}>Loading users...</div> : filtered.length === 0 ? <div className="card" style={{ textAlign: 'center', padding: 60, color: 'var(--text2)' }}>No users found</div> : (
        <div className="table-wrap">
          <table>
            <thead><tr>{bulkMode && <th style={{ width: 30 }}></th>}<th>User</th><th>Plan</th><th>Balance</th><th>Status</th><th>Joined</th><th>Actions</th></tr></thead>
            <tbody>
              {filtered.map(u => (
                <tr key={u.id}>
                  {bulkMode && <td><input type="checkbox" checked={bulkIds.has(u.id)} onChange={() => { const n = new Set(bulkIds); n.has(u.id) ? n.delete(u.id) : n.add(u.id); setBulkIds(n); }} /></td>}
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer' }} onClick={() => selectUser(u)}>
                      <Avatar src={u.avatar_img || u.avatar} name={u.name} size={36} />
                      <div>
                        <div style={{ fontWeight: 700 }}>{u.name} {u.is_admin && <span className="badge badge-purple" style={{ fontSize: 8 }}>Admin</span>}</div>
                        <div style={{ fontSize: 11, color: 'var(--text2)' }}>{u.identifier} · {u.refer_code}</div>
                      </div>
                    </div>
                  </td>
                  <td><span style={{ color: u.plan_color, fontWeight: 600 }}>{u.plan_name}</span></td>
                  <td style={{ fontWeight: 700 }}>{formatMoney(u.balance)}</td>
                  <td><span className={`badge ${u.banned ? 'badge-red' : 'badge-green'}`}>{u.banned ? 'Banned' : 'Active'}</span></td>
                  <td style={{ fontSize: 11, color: 'var(--text2)' }}>{fmtDate(u.created_at)}</td>
                  <td>
                    <div style={{ display: 'flex', gap: 4 }}>
                      <button className="btn btn-outline btn-sm" onClick={() => selectUser(u)}><Eye size={14} /></button>
                      <button className={`btn btn-sm ${u.banned ? 'btn-success' : 'btn-danger'}`} onClick={() => toggleBan(u)}>{u.banned ? <UserCheck size={14} /> : <Ban size={14} />}</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}

function FinancePage({ authFetch, toast, isMain }) {
  const [transactions, setTx] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('pending');
  const [typeFilter, setTypeFilter] = useState('all');
  const [processing, setProcessing] = useState(null);
  const [note, setNote] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const r = await authFetch(`${API}/api/admin/transactions`);
      const d = await r.json();
      if (r.ok) setTx(d.transactions || []);
    } catch {}
    finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleTx = async (id, status) => {
    setProcessing(id);
    try {
      const r = await authFetch(`${API}/api/admin/transactions/${id}`, { method: 'PATCH', body: JSON.stringify({ status, admin_note: note }) });
      if (r.ok) { toast(`Transaction ${status}`); setNote(''); load(); }
      else toast((await r.json()).error || 'Failed', 'error');
    } catch { toast('Failed', 'error'); }
    finally { setProcessing(null); }
  };

  const exportCSV = async () => {
    try {
      const r = await authFetch(`${API}/api/admin/export/transactions`);
      const d = await r.json();
      const items = d.transactions || [];
      if (!items.length) return toast('No data', 'warning');
      const h = Object.keys(items[0]);
      const csv = [h.join(','), ...items.map(r => h.map(k => `"${String(r[k] || '').replace(/"/g, '""')}"`).join(','))].join('\n');
      const a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([csv], { type: 'text/csv' })); a.download = 'transactions_export.csv'; a.click();
      toast(`${items.length} records exported`);
    } catch { toast('Export failed', 'error'); }
  };

  const filtered = transactions.filter(tx => {
    const s = statusFilter === 'all' || tx.status === statusFilter;
    const t = typeFilter === 'all' || tx.type === typeFilter;
    return s && t;
  });

  const pendingCount = transactions.filter(t => t.status === 'pending').length;

  return (
    <>
      <div className="page-header">
        <div><h1>Financial Management</h1><div className="subtitle">{transactions.length} total transactions · {pendingCount} pending</div></div>
        <div style={{ display: 'flex', gap: 8 }}>
          {isMain && <button className="btn btn-outline btn-sm" onClick={exportCSV}><Download size={14} /> Export CSV</button>}
          <button className="btn btn-outline btn-sm" onClick={load}><RefreshCw size={14} /></button>
        </div>
      </div>

      <div className="grid-3">
        <div className="stat-card"><div className="stat-value" style={{ color: 'var(--warning)' }}>{transactions.filter(t => t.status === 'pending').length}</div><div className="stat-label">Pending</div></div>
        <div className="stat-card"><div className="stat-value" style={{ color: 'var(--success)' }}>{transactions.filter(t => t.status === 'approved').length}</div><div className="stat-label">Approved</div></div>
        <div className="stat-card"><div className="stat-value" style={{ color: 'var(--danger)' }}>{transactions.filter(t => t.status === 'rejected').length}</div><div className="stat-label">Rejected</div></div>
      </div>

      <div className="card" style={{ padding: '14px 18px' }}>
        <div className="filter-bar">
          {['pending', 'approved', 'rejected', 'all'].map(f => (
            <button key={f} className={`btn btn-sm ${statusFilter === f ? 'btn-primary' : 'btn-outline'}`} onClick={() => setStatusFilter(f)}>
              {f.charAt(0).toUpperCase() + f.slice(1)} {f === 'pending' ? `(${pendingCount})` : ''}
            </button>
          ))}
          <div style={{ width: 1, background: 'var(--border)', margin: '0 4px' }} />
          {['all', 'deposit', 'withdraw'].map(f => (
            <button key={f} className={`btn btn-sm ${typeFilter === f ? 'btn-primary' : 'btn-outline'}`} onClick={() => setTypeFilter(f)}>
              {f === 'all' ? 'All Types' : f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {loading ? <div className="card" style={{ textAlign: 'center', padding: 60, color: 'var(--text2)' }}>Loading...</div> : filtered.length === 0 ? <div className="card" style={{ textAlign: 'center', padding: 60, color: 'var(--text2)' }}>No transactions found</div> : (
        <div className="table-wrap">
          <table>
            <thead><tr><th>Type</th><th>User</th><th>Amount</th><th>Method / Details</th><th>Status</th><th>Date</th><th>Actions</th></tr></thead>
            <tbody>
              {filtered.map(tx => {
                const isCrypto = tx.method === 'crypto';
                return (
                <tr key={tx.id} style={{ background: tx.status === 'pending' ? 'rgba(252,213,53,0.03)' : undefined }}>
                  <td>{tx.type === 'deposit' ? <span style={{ color: 'var(--success)' }}>💰 Deposit</span> : <span style={{ color: 'var(--danger)' }}>💸 Withdraw</span>}</td>
                  <td>
                    <div style={{ fontWeight: 600 }}>{tx.user_name}</div>
                    <div style={{ fontSize: 10, color: 'var(--text2)' }}>ID: {tx.user_id} · {tx.user_identifier}</div>
                  </td>
                  <td style={{ fontWeight: 700, fontSize: 15 }}>{formatMoney(tx.amount)}</td>
                  <td style={{ maxWidth: 220 }}>
                    <span className="badge badge-blue" style={{ marginBottom: 4 }}>{tx.method?.toUpperCase()}</span>
                    {isCrypto ? (
                      <div style={{ fontSize: 11, marginTop: 4 }}>
                        {tx.blockchain && <div style={{ color: 'var(--text2)' }}>⛓ {tx.blockchain?.toUpperCase()}</div>}
                        {tx.token && <div style={{ color: 'var(--text2)' }}>💎 {tx.token?.toUpperCase()}</div>}
                        {tx.txn_hash && <div style={{ fontFamily: 'monospace', fontSize: 10, color: 'var(--accent)', wordBreak: 'break-all' }}>🔗 {tx.txn_hash}</div>}
                        {tx.screenshot && (
                          <a href={tx.screenshot} target="_blank" rel="noreferrer" style={{ display: 'inline-block', marginTop: 4 }}>
                            <img src={tx.screenshot} alt="screenshot" style={{ width: 48, height: 48, objectFit: 'cover', borderRadius: 6, border: '1px solid var(--border)', cursor: 'pointer' }} title="Click to view screenshot" />
                          </a>
                        )}
                      </div>
                    ) : (
                      <div style={{ fontFamily: 'monospace', fontSize: 11, color: 'var(--text2)', marginTop: 4 }}>{tx.account}</div>
                    )}
                  </td>
                  <td><span className={`badge ${tx.status === 'approved' ? 'badge-green' : tx.status === 'rejected' ? 'badge-red' : 'badge-yellow'}`}>{tx.status}</span></td>
                  <td style={{ fontSize: 11, color: 'var(--text2)' }}>{fmtDate(tx.created_at)}</td>
                  <td>
                    {tx.status === 'pending' ? (
                      <div style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
                        <input className="inp" style={{ width: 100, marginBottom: 0, fontSize: 11, padding: '4px 8px' }} placeholder="Note..."
                          value={processing === tx.id ? note : ''}
                          onFocus={() => { setProcessing(tx.id); setNote(''); }}
                          onChange={e => setNote(e.target.value)} />
                        <button className="btn btn-success btn-sm" disabled={processing !== null && processing !== tx.id} onClick={() => handleTx(tx.id, 'approved')}>
                          <CheckCircle size={14} />
                        </button>
                        <button className="btn btn-danger btn-sm" disabled={processing !== null && processing !== tx.id} onClick={() => handleTx(tx.id, 'rejected')}>
                          <X size={14} />
                        </button>
                      </div>
                    ) : (
                      <span style={{ fontSize: 11, color: 'var(--text2)' }}>{tx.admin_note || '—'}</span>
                    )}
                  </td>
                </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}

function SupportPage({ authFetch, toast }) {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [active, setActive] = useState(null);
  const [msgs, setMsgs] = useState([]);
  const [msgsLoading, setMsgsLoading] = useState(false);
  const [reply, setReply] = useState('');
  const [replying, setReplying] = useState(false);
  const [canned, setCanned] = useState([]);
  const [newCanned, setNewCanned] = useState({ title: '', message: '' });
  const [filter, setFilter] = useState('all');
  const msgsEndRef = useRef(null);

  const loadSessions = useCallback(async () => {
    setLoading(true);
    try { const r = await authFetch(`${API}/api/admin/support/sessions`); const d = await r.json(); if (r.ok) setSessions(d.sessions || []); } catch {}
    finally { setLoading(false); }
  }, []);

  const loadMsgs = useCallback(async (sid) => {
    setMsgsLoading(true);
    try { const r = await authFetch(`${API}/api/admin/support/messages/${sid}`); const d = await r.json(); if (r.ok) setMsgs(d.messages || []); } catch {}
    finally { setMsgsLoading(false); }
  }, []);

  const loadCanned = useCallback(async () => {
    try { const r = await authFetch(`${API}/api/admin/canned-responses`); const d = await r.json(); if (r.ok) setCanned(d.responses || []); } catch {}
  }, []);

  useEffect(() => { loadSessions(); loadCanned(); }, [loadSessions, loadCanned]);

  useEffect(() => {
    if (!active) return;
    const iv = setInterval(() => loadMsgs(active), 5000);
    return () => clearInterval(iv);
  }, [active, loadMsgs]);

  useEffect(() => { msgsEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [msgs]);

  const sendReply = async () => {
    if (!reply.trim() || !active) return;
    setReplying(true);
    try {
      const r = await authFetch(`${API}/api/admin/support/reply`, { method: 'POST', body: JSON.stringify({ sessionId: active, message: reply.trim() }) });
      if (r.ok) { setReply(''); loadMsgs(active); loadSessions(); }
      else toast('Reply failed', 'error');
    } catch { toast('Failed', 'error'); }
    finally { setReplying(false); }
  };

  const resolveSession = async (sid) => {
    try { await authFetch(`${API}/api/admin/support/sessions/${sid}/status`, { method: 'PATCH', body: JSON.stringify({ status: 'resolved' }) }); loadSessions(); toast('Session resolved'); } catch {}
  };

  const addCanned = async () => {
    if (!newCanned.title || !newCanned.message) return;
    try {
      const r = await authFetch(`${API}/api/admin/canned-responses`, { method: 'POST', body: JSON.stringify(newCanned) });
      if (r.ok) { setNewCanned({ title: '', message: '' }); loadCanned(); toast('Saved'); }
    } catch {}
  };

  const delCanned = async (id) => {
    try { await authFetch(`${API}/api/admin/canned-responses/${id}`, { method: 'DELETE' }); loadCanned(); } catch {}
  };

  const filteredSessions = sessions.filter(s => filter === 'all' || s.admin_replies === 0);

  return (
    <>
      <div className="page-header">
        <div><h1>Support Management</h1><div className="subtitle">{sessions.length} conversations</div></div>
        <button className="btn btn-outline btn-sm" onClick={loadSessions}><RefreshCw size={14} /></button>
      </div>

      {!active ? (
        <>
          <div className="filter-bar">
            <button className={`btn btn-sm ${filter === 'all' ? 'btn-primary' : 'btn-outline'}`} onClick={() => setFilter('all')}>All Chats</button>
            <button className={`btn btn-sm ${filter === 'unanswered' ? 'btn-primary' : 'btn-outline'}`} onClick={() => setFilter('unanswered')}>Unanswered</button>
          </div>

          {loading ? <div className="card" style={{ textAlign: 'center', padding: 60, color: 'var(--text2)' }}>Loading...</div> : filteredSessions.length === 0 ? <div className="card" style={{ textAlign: 'center', padding: 60, color: 'var(--text2)' }}>No chats</div> : (
            <div className="table-wrap">
              <table>
                <thead><tr><th>User</th><th>Messages</th><th>Status</th><th>Last Active</th><th>Actions</th></tr></thead>
                <tbody>
                  {filteredSessions.map(s => (
                    <tr key={s.session_id}>
                      <td style={{ fontWeight: 600 }}>{s.user_name || 'Unknown'}</td>
                      <td>{s.user_msgs} msgs · {s.admin_replies} replies</td>
                      <td><span className={`badge ${s.admin_replies > 0 ? 'badge-green' : 'badge-red'}`}>{s.admin_replies > 0 ? 'Replied' : 'Pending'}</span></td>
                      <td style={{ fontSize: 11, color: 'var(--text2)' }}>{fmtDate(s.last_active)}</td>
                      <td>
                        <div style={{ display: 'flex', gap: 4 }}>
                          <button className="btn btn-primary btn-sm" onClick={() => { setActive(s.session_id); loadMsgs(s.session_id); }}>Open</button>
                          <button className="btn btn-outline btn-sm" onClick={() => resolveSession(s.session_id)}><CheckCircle size={14} /></button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          <div className="card" style={{ marginTop: 20 }}>
            <div className="card-title"><Reply size={16} /> Canned Responses</div>
            {canned.map(c => (
              <div key={c.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0', borderBottom: '1px solid var(--border)' }}>
                <div><strong>{c.title}</strong> <span style={{ color: 'var(--text2)', fontSize: 12 }}>— {c.message.substring(0, 60)}</span></div>
                <button className="btn btn-outline btn-sm" onClick={() => delCanned(c.id)}><Trash2 size={14} /></button>
              </div>
            ))}
            <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
              <input className="inp" style={{ flex: 1, marginBottom: 0 }} placeholder="Title" value={newCanned.title} onChange={e => setNewCanned(p => ({ ...p, title: e.target.value }))} />
              <input className="inp" style={{ flex: 2, marginBottom: 0 }} placeholder="Message" value={newCanned.message} onChange={e => setNewCanned(p => ({ ...p, message: e.target.value }))} />
              <button className="btn btn-primary btn-sm" onClick={addCanned}>Add</button>
            </div>
          </div>
        </>
      ) : (
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <div style={{ padding: '14px 20px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: 12, background: 'var(--card2)' }}>
            <button className="btn btn-outline btn-sm" onClick={() => { setActive(null); setMsgs([]); }}><X size={14} /> Back</button>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 700 }}>{sessions.find(s => s.session_id === active)?.user_name || 'Chat'}</div>
              <div style={{ fontSize: 10, color: 'var(--text2)', fontFamily: 'monospace' }}>{active}</div>
            </div>
            <button className="btn btn-outline btn-sm" onClick={() => resolveSession(active)}><CheckCircle size={14} /> Resolve</button>
          </div>

          <div style={{ height: 400, overflowY: 'auto', padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: 10 }}>
            {msgsLoading ? <div style={{ textAlign: 'center', padding: 40, color: 'var(--text2)' }}>Loading...</div> :
              msgs.length === 0 ? <div style={{ textAlign: 'center', padding: 40, color: 'var(--text2)' }}>No messages</div> :
                msgs.map((m, i) => (
                  <div key={m.id || i} style={{
                    alignSelf: m.sender === 'user' ? 'flex-start' : 'flex-end', maxWidth: '70%',
                    padding: '10px 14px', borderRadius: 14, fontSize: 13,
                    background: m.sender === 'user' ? 'var(--card2)' : 'rgba(35,175,145,0.15)',
                    border: `1px solid ${m.sender === 'user' ? 'var(--border)' : 'rgba(35,175,145,0.3)'}`,
                  }}>
                    <div style={{ fontSize: 10, color: 'var(--text2)', marginBottom: 4 }}>
                      {m.sender === 'user' ? '👤 User' : '🛡️ Admin'} · {m.created_at ? new Date(m.created_at + 'Z').toLocaleTimeString() : ''}
                    </div>
                    {m.message}
                  </div>
                ))
            }
            <div ref={msgsEndRef} />
          </div>

          {canned.length > 0 && (
            <div style={{ padding: '8px 20px', borderTop: '1px solid var(--border)', display: 'flex', gap: 6, flexWrap: 'wrap' }}>
              {canned.map(c => (
                <button key={c.id} className="btn btn-outline btn-sm" onClick={() => setReply(c.message)}>{c.title}</button>
              ))}
            </div>
          )}

          <div style={{ padding: '12px 20px', borderTop: '1px solid var(--border)', display: 'flex', gap: 8 }}>
            <input className="inp" style={{ flex: 1, marginBottom: 0 }} placeholder="Type reply..." value={reply} onChange={e => setReply(e.target.value)} onKeyDown={e => e.key === 'Enter' && sendReply()} disabled={replying} />
            <button className="btn btn-primary" onClick={sendReply} disabled={replying || !reply.trim()}><Send size={16} /></button>
          </div>
        </div>
      )}
    </>
  );
}

function ResetDatabaseCard({ authFetch, toast }) {
  const [open, setOpen] = useState(false);
  const [phrase, setPhrase] = useState('');
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  const doReset = async () => {
    if (phrase !== 'RESET CONFIRM') {
      toast('Type the exact phrase: RESET CONFIRM', 'error');
      return;
    }
    setLoading(true);
    try {
      const r = await authFetch(`${API}/api/admin/reset-database`, {
        method: 'POST',
        body: JSON.stringify({ confirmPhrase: 'RESET CONFIRM' }),
      });
      const d = await r.json();
      if (r.ok) {
        setDone(true);
        toast('Database reset complete!', 'success');
      } else {
        toast(d.error || 'Reset failed', 'error');
      }
    } catch {
      toast('Connection error', 'error');
    }
    setLoading(false);
  };

  return (
    <div className="card" style={{ borderColor: 'rgba(220,38,38,0.4)', background: 'rgba(220,38,38,0.04)' }}>
      <div className="card-title" style={{ color: 'var(--danger)' }}>
        <AlertTriangle size={16} color="var(--danger)" /> Danger Zone — Reset Database
      </div>
      <div style={{ fontSize: 13, color: 'var(--text2)', marginBottom: 14, lineHeight: 1.6 }}>
        This will <strong style={{ color: 'var(--danger)' }}>permanently delete</strong> all users, transactions, support chats, and activity logs.
        Your main admin account will be preserved. <strong>This cannot be undone.</strong>
      </div>

      {!open && !done && (
        <button className="btn btn-sm" style={{ background: 'rgba(220,38,38,0.12)', color: 'var(--danger)', border: '1px solid rgba(220,38,38,0.3)' }} onClick={() => setOpen(true)}>
          <Trash2 size={14} /> Reset All Server Data
        </button>
      )}

      {open && !done && (
        <div style={{ background: 'rgba(220,38,38,0.07)', border: '1px solid rgba(220,38,38,0.25)', borderRadius: 12, padding: 16 }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--danger)', marginBottom: 10 }}>
            ⚠️ Type <code style={{ background: 'rgba(220,38,38,0.15)', padding: '2px 6px', borderRadius: 4 }}>RESET CONFIRM</code> to proceed:
          </div>
          <input
            className="inp"
            placeholder="RESET CONFIRM"
            value={phrase}
            onChange={e => setPhrase(e.target.value)}
            style={{ marginBottom: 12, borderColor: phrase === 'RESET CONFIRM' ? 'var(--danger)' : undefined }}
          />
          <div style={{ display: 'flex', gap: 8 }}>
            <button
              className="btn btn-sm"
              style={{ background: 'var(--danger)', color: '#fff', border: 'none', opacity: phrase === 'RESET CONFIRM' ? 1 : 0.5 }}
              onClick={doReset}
              disabled={loading || phrase !== 'RESET CONFIRM'}
            >
              {loading ? 'Resetting...' : '🗑️ Confirm Reset'}
            </button>
            <button className="btn btn-outline btn-sm" onClick={() => { setOpen(false); setPhrase(''); }}>
              Cancel
            </button>
          </div>
        </div>
      )}

      {done && (
        <div style={{ background: 'rgba(14,203,129,0.08)', border: '1px solid rgba(14,203,129,0.25)', borderRadius: 10, padding: '12px 16px', fontSize: 13, color: 'var(--success)' }}>
          ✅ Database reset complete. All user data cleared. Refresh the page to continue.
          <button className="btn btn-outline btn-sm" style={{ marginLeft: 12 }} onClick={() => window.location.reload()}>Refresh</button>
        </div>
      )}
    </div>
  );
}

function AdminsPage({ authFetch, toast, adminUser }) {
  const [users, setUsers] = useState([]);
  const [logs, setLogs] = useState([]);
  const [logsLoading, setLogsLoading] = useState(true);
  const [editPerms, setEditPerms] = useState(null);
  const [perms, setPerms] = useState({});
  const [chatMsgs, setChatMsgs] = useState([]);
  const [chatText, setChatText] = useState('');
  const [chatLoading, setChatLoading] = useState(false);
  const [chatSending, setChatSending] = useState(false);
  const chatEndRef = useRef(null);
  const isMain = adminUser?.is_main_admin;

  const loadUsers = useCallback(async () => {
    try { const r = await authFetch(`${API}/api/admin/users`); const d = await r.json(); if (r.ok) setUsers((d.users || []).filter(u => u.is_admin && !u.is_main_admin)); } catch {}
  }, []);

  const loadLogs = useCallback(async () => {
    setLogsLoading(true);
    try { const r = await authFetch(`${API}/api/admin/activity-log`); const d = await r.json(); if (r.ok) setLogs(d.logs || []); } catch {}
    finally { setLogsLoading(false); }
  }, []);

  const loadChat = useCallback(async () => {
    setChatLoading(true);
    try { const r = await authFetch(`${API}/api/admin/group-chat`); const d = await r.json(); if (r.ok) setChatMsgs(d.messages || []); } catch {}
    finally { setChatLoading(false); }
  }, []);

  const sendChat = async () => {
    if (!chatText.trim() || isMain) return;
    setChatSending(true);
    try {
      const r = await authFetch(`${API}/api/admin/group-chat/send`, {
        method: 'POST',
        body: JSON.stringify({ message: chatText.trim() }),
      });
      if (r.ok) { setChatText(''); loadChat(); } else { toast('Failed to send', 'error'); }
    } catch { toast('Connection error', 'error'); }
    setChatSending(false);
  };

  useEffect(() => { loadUsers(); loadLogs(); loadChat(); }, [loadUsers, loadLogs, loadChat]);
  useEffect(() => { const t = setInterval(loadChat, 5000); return () => clearInterval(t); }, [loadChat]);
  useEffect(() => { chatEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [chatMsgs]);

  const loadPerms = async (adminId) => {
    try {
      const r = await authFetch(`${API}/api/admin/permissions/${adminId}`);
      const d = await r.json();
      if (r.ok) { setEditPerms(adminId); setPerms(d.permissions || {}); }
    } catch {}
  };

  const savePerms = async () => {
    if (!editPerms) return;
    try {
      const r = await authFetch(`${API}/api/admin/permissions/${editPerms}`, { method: 'POST', body: JSON.stringify({ permissions: perms }) });
      if (r.ok) { toast('Permissions saved'); setEditPerms(null); }
    } catch { toast('Failed', 'error'); }
  };

  const PERM_GROUPS = [
    {
      label: '👥 User Management',
      color: 'rgba(59,130,246,0.12)',
      perms: [
        { key: 'view_users',        label: 'View Users' },
        { key: 'edit_users',        label: 'Edit User Info' },
        { key: 'ban_users',         label: 'Ban / Unban Users' },
        { key: 'edit_user_balance', label: 'Edit User Balance & Plan' },
        { key: 'view_sensitive_data', label: 'View Sensitive Data (IDs, Logs)' },
      ],
    },
    {
      label: '💰 Finance',
      color: 'rgba(14,203,129,0.1)',
      perms: [
        { key: 'approve_deposits',    label: 'Approve Deposits' },
        { key: 'approve_withdrawals', label: 'Approve Withdrawals' },
        { key: 'require_proof',       label: 'Require Withdrawal Proof' },
      ],
    },
    {
      label: '⚙️ Settings',
      color: 'rgba(252,213,53,0.08)',
      perms: [
        { key: 'modify_payment_numbers',  label: 'Modify Payment Numbers (bKash, Nagad…)' },
        { key: 'modify_wallet_addresses', label: 'Modify Crypto Wallet Addresses' },
        { key: 'change_settings',         label: 'Change General Settings' },
        { key: 'manage_admins',           label: 'Manage Admin Accounts' },
      ],
    },
    {
      label: '📊 Reports & Support',
      color: 'rgba(99,102,241,0.08)',
      perms: [
        { key: 'view_reports',  label: 'View Reports & Stats' },
        { key: 'export_data',   label: 'Export Data' },
        { key: 'access_support', label: 'Access Support Chat' },
      ],
    },
  ];

  return (
    <>
      <div className="page-header">
        <div><h1>Admin & Roles</h1><div className="subtitle">Manage admin access and permissions</div></div>
      </div>

      <div className="card">
        <div className="card-title"><Shield size={16} /> Admin List</div>
        {users.map(u => (
          <div key={u.id} style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '14px', marginBottom: 8, borderRadius: 12, background: u.is_main_admin ? 'rgba(139,92,246,0.06)' : 'rgba(59,130,246,0.06)', border: `1px solid ${u.is_main_admin ? 'rgba(139,92,246,0.15)' : 'rgba(59,130,246,0.15)'}` }}>
            <Avatar src={u.avatar_img || u.avatar} name={u.name} size={44} style={{ borderRadius: 12 }} />
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 700, fontSize: 14 }}>{u.name} {u.is_main_admin && <span className="badge badge-purple">Main Admin</span>}</div>
              <div style={{ fontSize: 11, color: 'var(--text2)' }}>{u.identifier} · {u.refer_code}</div>
            </div>
            {!u.is_main_admin && (
              <button className="btn btn-outline btn-sm" onClick={() => loadPerms(u.id)}><Settings size={14} /> Permissions</button>
            )}
          </div>
        ))}
      </div>

      {editPerms && (
        <div className="card" style={{ borderColor: 'rgba(99,102,241,0.3)' }}>
          <div className="modal-header">
            <h2 style={{ fontSize: 16 }}>Set Permissions — {users.find(u => u.id === editPerms)?.name || 'Admin'}</h2>
            <button className="btn btn-outline btn-sm" onClick={() => setEditPerms(null)}><X size={14} /></button>
          </div>
          {PERM_GROUPS.map(group => (
            <div key={group.label} style={{ marginBottom: 16 }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text2)', marginBottom: 8, paddingBottom: 6, borderBottom: '1px solid var(--border)' }}>{group.label}</div>
              <div className="grid-2">
                {group.perms.map(({ key, label }) => (
                  <label key={key} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '9px 12px', borderRadius: 8, background: perms[key] ? group.color : 'var(--bg2)', border: `1px solid ${perms[key] ? 'rgba(14,203,129,0.25)' : 'var(--border)'}`, cursor: 'pointer', transition: 'all 0.15s' }}>
                    <input type="checkbox" checked={!!perms[key]} onChange={() => setPerms(p => ({ ...p, [key]: !p[key] }))} />
                    <span style={{ fontSize: 12, fontWeight: perms[key] ? 600 : 400 }}>{label}</span>
                  </label>
                ))}
              </div>
            </div>
          ))}
          <button className="btn btn-primary btn-full" style={{ marginTop: 8 }} onClick={savePerms}>Save Permissions</button>
        </div>
      )}

      <div className="card">
        <div className="card-title"><Clock size={16} /> Activity Log</div>
        {logsLoading ? <div style={{ textAlign: 'center', padding: 30, color: 'var(--text2)' }}>Loading...</div> : logs.length === 0 ? <div style={{ textAlign: 'center', padding: 30, color: 'var(--text2)' }}>No activity yet</div> : (
          <div style={{ maxHeight: 400, overflowY: 'auto' }}>
            <div className="table-wrap">
              <table>
                <thead><tr><th>Admin</th><th>Action</th><th>Details</th><th>Date</th></tr></thead>
                <tbody>
                  {logs.slice(0, 100).map(l => (
                    <tr key={l.id}>
                      <td style={{ fontWeight: 600, color: 'var(--accent)' }}>{l.admin_name || 'Admin'}</td>
                      <td>{l.action}</td>
                      <td style={{ fontSize: 11, color: 'var(--text2)', maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{l.details || '—'}</td>
                      <td style={{ fontSize: 11, color: 'var(--text2)' }}>{fmtDate(l.created_at)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Admin Group Chat */}
      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
          <div className="card-title" style={{ marginBottom: 0 }}>
            <MessageSquare size={16} /> Admin Group Chat
            {isMain && <span className="badge badge-purple" style={{ marginLeft: 8, fontSize: 9 }}>Read Only</span>}
          </div>
          <button className="btn btn-outline btn-sm" onClick={loadChat}><RefreshCw size={12} /> Refresh</button>
        </div>
        <div style={{
          background: 'var(--bg2)', borderRadius: 12, padding: 12,
          height: 280, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 8,
          border: '1px solid var(--border)',
        }}>
          {chatLoading
            ? <div style={{ textAlign: 'center', color: 'var(--text2)', marginTop: 40 }}>Loading messages...</div>
            : chatMsgs.length === 0
              ? <div style={{ textAlign: 'center', color: 'var(--text2)', marginTop: 40 }}>No messages yet</div>
              : chatMsgs.map(m => (
                <div key={m.id} style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                  <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'linear-gradient(135deg,var(--accent),var(--accent2))', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 700, flexShrink: 0, color: '#fff' }}>
                    {(m.sender_name || 'A')[0].toUpperCase()}
                  </div>
                  <div>
                    <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--accent)', marginBottom: 2 }}>
                      {m.sender_name || 'Admin'}
                      <span style={{ color: 'var(--text2)', fontWeight: 400, marginLeft: 8 }}>{fmtDate(m.created_at)}</span>
                    </div>
                    {m.message ? (
                      <div style={{ fontSize: 13, background: 'var(--card)', padding: '7px 12px', borderRadius: '0 10px 10px 10px', border: '1px solid var(--border)' }}>
                        {m.message}
                      </div>
                    ) : null}
                    {m.media_url && m.media_type === 'image' && (
                      <img src={m.media_url} alt="" style={{ maxWidth: 220, borderRadius: 8, marginTop: 6, display: 'block' }} />
                    )}
                    {m.media_url && m.media_type === 'file' && (
                      <a href={m.media_url} target="_blank" rel="noreferrer" style={{ fontSize: 12, color: 'var(--accent)', marginTop: 4, display: 'block' }}>📎 Attachment</a>
                    )}
                  </div>
                </div>
              ))
          }
          <div ref={chatEndRef} />
        </div>
        {!isMain && (
          <div style={{ display: 'flex', gap: 8, marginTop: 10 }}>
            <input
              className="inp"
              style={{ flex: 1 }}
              placeholder="Type a message to the group..."
              value={chatText}
              onChange={e => setChatText(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && !e.shiftKey && sendChat()}
            />
            <button className="btn btn-primary" onClick={sendChat} disabled={chatSending || !chatText.trim()}>
              <Send size={14} /> Send
            </button>
          </div>
        )}
        {isMain && (
          <div style={{ fontSize: 11, color: 'var(--text2)', marginTop: 8, textAlign: 'center' }}>
            Main admin can read messages. Sub-admins communicate here.
          </div>
        )}
      </div>

      {/* Access Link — visible to main admin only */}
      {isMain && (
        <div className="card" style={{ borderColor: 'rgba(139,92,246,0.3)', background: 'rgba(139,92,246,0.04)' }}>
          <div className="card-title"><Link size={16} /> Admin Panel Access Link</div>
          <div style={{ fontSize: 12, color: 'var(--text2)', marginBottom: 10 }}>Share this path with new admins to reach the login screen:</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'var(--bg2)', borderRadius: 8, padding: '10px 14px', border: '1px solid var(--border)' }}>
            <code style={{ fontFamily: 'monospace', fontSize: 13, flex: 1, wordBreak: 'break-all' }}>/xpc-ctrl-7f3b/</code>
            <button className="btn btn-outline btn-sm" onClick={() => { navigator.clipboard.writeText('/xpc-ctrl-7f3b/'); toast('Copied!'); }}>
              Copy
            </button>
          </div>
        </div>
      )}

      {/* ⚠️ Danger Zone — Reset Database (main admin only) */}
      {isMain && <ResetDatabaseCard authFetch={authFetch} toast={toast} />}
    </>
  );
}

function LiveLocationsPage({ authFetch, toast }) {
  const [locations, setLocations] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const r = await authFetch(`${API}/api/admin/live-locations`);
      const d = await r.json();
      if (r.ok) setLocations(d.locations || []);
    } catch {}
    finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  const minsAgo = (ts) => {
    if (!ts) return '—';
    const diff = Date.now() - new Date(ts + 'Z').getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return 'just now';
    if (mins < 60) return `${mins}m ago`;
    return `${Math.floor(mins / 60)}h ago`;
  };

  return (
    <>
      <div className="page-header">
        <div><h1>📍 Live Locations</h1><div className="subtitle">{locations.length} users sharing location (last 2 hours)</div></div>
        <button className="btn btn-outline btn-sm" onClick={load}><RefreshCw size={14} /> Refresh</button>
      </div>

      {loading ? (
        <div className="card" style={{ textAlign: 'center', padding: 60, color: 'var(--text2)' }}>Loading...</div>
      ) : locations.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: 60, color: 'var(--text2)' }}>
          <div style={{ fontSize: 40, marginBottom: 12 }}>📍</div>
          <div style={{ fontWeight: 600 }}>No active locations</div>
          <div style={{ fontSize: 12, marginTop: 6 }}>Users share their location when they open the app</div>
        </div>
      ) : (
        <div className="table-wrap">
          <table>
            <thead><tr><th>User</th><th>Coordinates</th><th>Accuracy</th><th>Last Updated</th><th>Map</th></tr></thead>
            <tbody>
              {locations.map(l => (
                <tr key={l.user_id}>
                  <td>
                    <div style={{ fontWeight: 600 }}>{l.name}</div>
                    <div style={{ fontSize: 11, color: 'var(--text2)' }}>{l.identifier}</div>
                  </td>
                  <td style={{ fontFamily: 'monospace', fontSize: 12 }}>
                    <div>{Number(l.lat).toFixed(5)}</div>
                    <div>{Number(l.lng).toFixed(5)}</div>
                  </td>
                  <td style={{ fontSize: 12, color: 'var(--text2)' }}>{l.accuracy ? `±${Math.round(l.accuracy)}m` : '—'}</td>
                  <td>
                    <div style={{ fontSize: 12 }}>{fmtDate(l.updated_at)}</div>
                    <div style={{ fontSize: 11, color: 'var(--text2)' }}>{minsAgo(l.updated_at)}</div>
                  </td>
                  <td>
                    <a
                      href={`https://www.google.com/maps?q=${l.lat},${l.lng}&z=15`}
                      target="_blank" rel="noreferrer"
                      className="btn btn-outline btn-sm"
                      style={{ textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 4 }}
                    >
                      <Globe size={12} /> View Map
                    </a>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}

function SettingsPage({ authFetch, toast }) {
  const [settings, setSettings] = useState({});
  const [saving, setSaving] = useState(false);
  const [plans, setPlans] = useState([]);
  const [editPlan, setEditPlan] = useState(null);

  const load = useCallback(async () => {
    try {
      const [sr, pr] = await Promise.all([
        authFetch(`${API}/api/admin/settings`),
        authFetch(`${API}/api/admin/plans`),
      ]);
      const sd = await sr.json();
      const pd = await pr.json();
      if (sr.ok && sd.settings) setSettings(sd.settings);
      if (pr.ok) setPlans(pd.plans || []);
    } catch {}
  }, []);

  useEffect(() => { load(); }, [load]);

  const save = async () => {
    setSaving(true);
    try {
      const r = await authFetch(`${API}/api/admin/settings`, { method: 'POST', body: JSON.stringify({ settings }) });
      if (r.ok) {
        toast('Settings saved');
        await load();
      } else toast('Failed to save', 'error');
    } catch { toast('Failed', 'error'); }
    finally { setSaving(false); }
  };

  const savePlan = async (plan) => {
    try {
      const r = await authFetch(`${API}/api/admin/plans/${plan.id}`, { method: 'PATCH', body: JSON.stringify(plan) });
      if (r.ok) { toast('Plan updated'); setEditPlan(null); load(); }
      else toast('Failed', 'error');
    } catch { toast('Failed', 'error'); }
  };

  return (
    <>
      <div className="page-header">
        <div><h1>App Settings</h1><div className="subtitle">Configure platform parameters</div></div>
        <button className="btn btn-primary btn-sm" onClick={save} disabled={saving}>{saving ? 'Saving...' : 'Save All Settings'}</button>
      </div>

      <div className="card" style={{ borderColor: 'rgba(239,68,68,0.2)' }}>
        <div className="card-title"><AlertTriangle size={16} color="var(--danger)" /> App Control</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
          <span style={{ fontSize: 13, fontWeight: 600 }}>Maintenance Mode</span>
          <div onClick={() => setSettings(p => ({ ...p, maintenance_mode: p.maintenance_mode === 'true' ? 'false' : 'true' }))}
            style={{ width: 48, height: 26, borderRadius: 13, background: settings.maintenance_mode === 'true' ? 'var(--danger)' : 'var(--border)', cursor: 'pointer', position: 'relative', transition: 'background 0.2s' }}>
            <div style={{ width: 22, height: 22, borderRadius: '50%', background: '#fff', position: 'absolute', top: 2, left: settings.maintenance_mode === 'true' ? 24 : 2, transition: 'left 0.2s' }} />
          </div>
        </div>
        <label className="input-label">Announcement Banner</label>
        <input className="inp" placeholder="Shows to all users" value={settings.announcement_banner || ''} onChange={e => setSettings(p => ({ ...p, announcement_banner: e.target.value }))} />

        <div style={{ marginTop: 16 }}>
          <label className="input-label">🌍 Work Blocked Countries</label>
          <input className="inp" placeholder="Comma-separated ISO codes, e.g: US,IN,PK" value={settings.work_blocked_countries || ''} onChange={e => setSettings(p => ({ ...p, work_blocked_countries: e.target.value }))} />
          <div style={{ fontSize: 11, color: 'var(--text2)', marginTop: 4 }}>
            Users from these countries will see a "Work Not Available" overlay. Leave blank to allow all countries.
          </div>
        </div>
      </div>

      <div className="card">
        <div className="card-title"><CreditCard size={16} /> Payment Accounts</div>
        <div className="grid-2">
          {['bkash', 'nagad', 'rocket'].map(m => (
            <div key={m}>
              <label className="input-label">{m.charAt(0).toUpperCase() + m.slice(1)} Number</label>
              <input className="inp" value={settings[`deposit_${m}`] || ''} onChange={e => setSettings(p => ({ ...p, [`deposit_${m}`]: e.target.value }))} />
            </div>
          ))}
        </div>
      </div>

      <div className="card">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
          <div className="card-title" style={{ color: 'var(--accent)', margin: 0 }}>💎 Crypto Wallet Addresses</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ fontSize: 12, fontWeight: 700, color: settings.crypto_enabled === 'false' ? 'var(--danger)' : 'var(--accent)' }}>
              {settings.crypto_enabled === 'false' ? 'OFF' : 'ON'}
            </span>
            <div
              onClick={() => setSettings(p => ({ ...p, crypto_enabled: p.crypto_enabled === 'false' ? 'true' : 'false' }))}
              style={{
                width: 48, height: 26, borderRadius: 13,
                background: settings.crypto_enabled === 'false' ? 'var(--border)' : 'var(--accent)',
                cursor: 'pointer', position: 'relative', transition: 'background 0.2s', flexShrink: 0,
              }}
            >
              <div style={{
                width: 22, height: 22, borderRadius: '50%', background: '#fff',
                position: 'absolute', top: 2,
                left: settings.crypto_enabled === 'false' ? 2 : 24,
                transition: 'left 0.2s',
              }} />
            </div>
          </div>
        </div>
        <div style={{ fontSize: 12, color: 'var(--text2)', marginBottom: 16 }}>
          {settings.crypto_enabled === 'false'
            ? '⛔ Crypto is DISABLED — users cannot deposit or withdraw via crypto.'
            : 'Enter wallet addresses per blockchain and token. Leave blank to hide from users.'}
        </div>
        {[
          { chain: 'eth',      label: 'Ethereum'      },
          { chain: 'op',       label: 'Optimism (OP)' },
          { chain: 'base',     label: 'Base'          },
          { chain: 'polygon',  label: 'Polygon'       },
          { chain: 'arbitrum', label: 'Arbitrum'      },
        ].map(({ chain, label }) => {
          const usdtVal = settings[`crypto_${chain}_usdt`] || '';
          const usdcVal = settings[`crypto_${chain}_usdc`] || '';
          const sameAddr = usdtVal && usdcVal && usdtVal === usdcVal;
          return (
            <div key={chain} style={{ marginBottom: 16, padding: '12px 14px', borderRadius: 10, background: 'var(--bg2)', border: `1px solid ${sameAddr ? 'var(--yellow,#f59e0b)' : 'var(--border)'}` }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--accent)', marginBottom: 10, textTransform: 'uppercase', letterSpacing: 0.5 }}>
                ⛓ {label}
              </div>
              {sameAddr && (
                <div style={{ fontSize: 11, color: '#f59e0b', background: 'rgba(245,158,11,.1)', border: '1px solid rgba(245,158,11,.3)', borderRadius: 6, padding: '6px 10px', marginBottom: 10 }}>
                  ⚠️ USDT and USDC have the SAME address. Enter different addresses below if needed.
                </div>
              )}
              <div className="grid-2">
                {['usdt', 'usdc'].map(tok => {
                  const key = `crypto_${chain}_${tok}`;
                  return (
                    <div key={tok}>
                      <label className="input-label">{tok.toUpperCase()} Address</label>
                      <input
                        className="inp"
                        placeholder="0x..."
                        value={settings[key] || ''}
                        onChange={e => setSettings(p => ({ ...p, [key]: e.target.value }))}
                      />
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {/* ── Rotating Deposit Wallet Addresses ── */}
      <div className="card">
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
          <div className="card-title" style={{ color: '#f59e0b', margin: 0 }}>🔄 Rotating Deposit Wallets (10 slots)</div>
          {settings.wallet_rotation_index !== undefined && settings.wallet_rotation_index !== '' && (
            <span style={{ fontSize: 11, background: 'rgba(245,158,11,.15)', border: '1px solid rgba(245,158,11,.4)', color: '#f59e0b', borderRadius: 6, padding: '2px 8px', fontWeight: 700 }}>
              Current Slot: #{parseInt(settings.wallet_rotation_index || 0) + 1}
            </span>
          )}
        </div>
        <div style={{ fontSize: 12, color: 'var(--text2)', marginBottom: 16, lineHeight: 1.6 }}>
          Set up to 10 deposit wallet addresses. Each user visit will show the next address in rotation (Round-Robin).<br/>
          <span style={{ color: '#f59e0b' }}>⚡ Empty slots will be skipped automatically.</span>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {[1,2,3,4,5,6,7,8,9,10].map(i => {
            const key = `deposit_wallet_${i}`;
            const val = settings[key] || '';
            return (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{
                  width: 32, height: 32, borderRadius: 8, flexShrink: 0,
                  background: val ? 'rgba(0,210,180,.15)' : 'var(--bg2)',
                  border: `1px solid ${val ? 'var(--accent)' : 'var(--border)'}`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontWeight: 800, fontSize: 12,
                  color: val ? 'var(--accent)' : 'var(--text2)',
                }}>
                  {i}
                </div>
                <input
                  className="inp"
                  style={{ flex: 1, borderColor: val ? 'rgba(0,210,180,.5)' : undefined }}
                  placeholder={`Wallet Address #${i} (0x... or any crypto address)`}
                  value={val}
                  onChange={e => setSettings(p => ({ ...p, [key]: e.target.value }))}
                />
                {val && (
                  <button
                    type="button"
                    onClick={() => setSettings(p => ({ ...p, [key]: '' }))}
                    style={{ background: 'rgba(239,68,68,.1)', border: '1px solid rgba(239,68,68,.3)', borderRadius: 6, padding: '4px 8px', color: '#ef4444', cursor: 'pointer', fontSize: 12, flexShrink: 0 }}
                  >✕</button>
                )}
              </div>
            );
          })}
        </div>
        <div style={{ marginTop: 14, padding: '10px 14px', background: 'rgba(245,158,11,.06)', border: '1px solid rgba(245,158,11,.2)', borderRadius: 8, fontSize: 11, color: 'var(--text2)' }}>
          💡 <b>How it works:</b> When a user opens Crypto Deposit, the system automatically shows the next wallet from this list. Each visit shows a different wallet.
        </div>
      </div>

      <div className="card">
        <div className="card-title"><Shield size={16} /> Financial Limits</div>
        <div className="grid-3">
          {[
            { key: 'min_deposit', label: 'Min Deposit' },
            { key: 'max_deposit', label: 'Max Deposit' },
            { key: 'min_withdraw', label: 'Min Withdraw' },
            { key: 'max_withdraw', label: 'Max Withdraw' },
            { key: 'daily_withdraw_limit', label: 'Daily WD Limit' },
            { key: 'auto_hold_threshold', label: 'Auto-Hold Threshold' },
          ].map(({ key, label }) => (
            <div key={key}>
              <label className="input-label">{label}</label>
              <input className="inp" type="number" value={settings[key] || ''} onChange={e => setSettings(p => ({ ...p, [key]: e.target.value }))} placeholder="0 = no limit" />
            </div>
          ))}
        </div>
      </div>

      <div className="card">
        <div className="card-title"><Flag size={16} color="var(--danger)" /> Security & Transfer Rules</div>
        <div className="grid-3">
          {[
            { key: 'transfer_daily_limit', label: 'Transfer Daily Limit (৳)', ph: 'Default 5000' },
            { key: 'transfer_min_balance', label: 'Min Balance After Transfer (৳)', ph: 'Default 10' },
            { key: 'withdraw_cooldown_hours', label: 'Withdraw Cooldown (hours)', ph: 'Default 24' },
          ].map(({ key, label, ph }) => (
            <div key={key}>
              <label className="input-label">{label}</label>
              <input className="inp" type="number" value={settings[key] || ''} onChange={e => setSettings(p => ({ ...p, [key]: e.target.value }))} placeholder={ph} />
            </div>
          ))}
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginTop: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <span style={{ fontSize: 13, fontWeight: 600 }}>Require Daily Tasks Before Withdraw</span>
            <div onClick={() => setSettings(p => ({ ...p, require_tasks_for_withdraw: p.require_tasks_for_withdraw === 'true' ? 'false' : 'true' }))}
              style={{ width: 48, height: 26, borderRadius: 13, background: settings.require_tasks_for_withdraw === 'true' ? 'var(--accent)' : 'var(--border)', cursor: 'pointer', position: 'relative', transition: 'background 0.2s' }}>
              <div style={{ width: 22, height: 22, borderRadius: '50%', background: '#fff', position: 'absolute', top: 2, left: settings.require_tasks_for_withdraw === 'true' ? 24 : 2, transition: 'left 0.2s' }} />
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <span style={{ fontSize: 13, fontWeight: 600 }}>Require Withdraw Proof (Screenshot)</span>
            <div onClick={() => setSettings(p => ({ ...p, require_withdraw_proof: p.require_withdraw_proof === 'true' ? 'false' : 'true' }))}
              style={{ width: 48, height: 26, borderRadius: 13, background: settings.require_withdraw_proof === 'true' ? 'var(--accent)' : 'var(--border)', cursor: 'pointer', position: 'relative', transition: 'background 0.2s' }}>
              <div style={{ width: 22, height: 22, borderRadius: '50%', background: '#fff', position: 'absolute', top: 2, left: settings.require_withdraw_proof === 'true' ? 24 : 2, transition: 'left 0.2s' }} />
            </div>
          </div>
        </div>
      </div>

      <div className="card">
        <div className="card-title"><Star size={16} color="var(--warning)" /> Plan Management</div>
        {plans.map(plan => (
          <div key={plan.id} style={{ padding: '14px', marginBottom: 10, borderRadius: 12, background: 'var(--bg2)', border: '1px solid var(--border)' }}>
            {editPlan?.id === plan.id ? (
              <>
                <div className="grid-3" style={{ marginBottom: 12 }}>
                  <div><label className="input-label">Price (৳)</label><input className="inp" type="number" value={editPlan.rate} onChange={e => setEditPlan(p => ({ ...p, rate: e.target.value }))} /></div>
                  <div><label className="input-label">Per Task (৳)</label><input className="inp" type="number" value={editPlan.per_task} onChange={e => setEditPlan(p => ({ ...p, per_task: e.target.value }))} /></div>
                  <div><label className="input-label">Daily Tasks</label><input className="inp" type="number" value={editPlan.daily} onChange={e => setEditPlan(p => ({ ...p, daily: e.target.value }))} /></div>
                  <div><label className="input-label">Task Time (min)</label><input className="inp" type="number" value={editPlan.task_time} onChange={e => setEditPlan(p => ({ ...p, task_time: e.target.value }))} /></div>
                  <div><label className="input-label">L1 %</label><input className="inp" type="number" value={editPlan.l1} onChange={e => setEditPlan(p => ({ ...p, l1: e.target.value }))} /></div>
                  <div><label className="input-label">L2 %</label><input className="inp" type="number" value={editPlan.l2} onChange={e => setEditPlan(p => ({ ...p, l2: e.target.value }))} /></div>
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                  <button className="btn btn-primary btn-sm" onClick={() => savePlan(editPlan)}>Save</button>
                  <button className="btn btn-outline btn-sm" onClick={() => setEditPlan(null)}>Cancel</button>
                </div>
              </>
            ) : (
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <span style={{ fontWeight: 800, color: plan.color, fontSize: 15 }}>{plan.name}</span>
                  <span style={{ color: 'var(--text2)', fontSize: 12, marginLeft: 12 }}>৳{plan.rate?.toLocaleString()} · ৳{plan.per_task}/task · {plan.daily} tasks/day</span>
                </div>
                <button className="btn btn-outline btn-sm" onClick={() => setEditPlan({ ...plan })}><Edit size={14} /> Edit</button>
              </div>
            )}
          </div>
        ))}
      </div>
    </>
  );
}

function FlaggedPage({ authFetch, toast }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const r = await authFetch(`${API}/api/admin/flagged`);
      const d = await r.json();
      if (r.ok) setItems(d.flagged || []);
    } catch {}
    finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  const unflag = async (id) => {
    setProcessing(id);
    try {
      const r = await authFetch(`${API}/api/admin/flag/${id}`, { method: 'POST', body: JSON.stringify({ flag: false }) });
      if (r.ok) { toast('Unflagged'); load(); }
      else toast('Failed', 'error');
    } catch { toast('Failed', 'error'); }
    finally { setProcessing(null); }
  };

  const setStealth = async (id, stealthStatus) => {
    setProcessing(id);
    try {
      const r = await authFetch(`${API}/api/admin/stealth/${id}`, { method: 'POST', body: JSON.stringify({ stealthStatus }) });
      if (r.ok) { toast(`Stealth set: ${stealthStatus || 'cleared'}`); load(); }
      else toast('Failed', 'error');
    } catch { toast('Failed', 'error'); }
    finally { setProcessing(null); }
  };

  return (
    <>
      <div className="page-header">
        <div><h1>Flagged Transactions</h1><div className="subtitle">{items.length} flagged items</div></div>
        <button className="btn btn-outline btn-sm" onClick={load}><RefreshCw size={14} /></button>
      </div>

      {loading ? <div className="card" style={{ textAlign: 'center', padding: 60, color: 'var(--text2)' }}>Loading...</div> : items.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: 60, color: 'var(--text2)' }}>
          <CheckCircle size={40} style={{ marginBottom: 12, opacity: 0.4 }} />
          <div>No flagged transactions</div>
        </div>
      ) : (
        <div className="table-wrap">
          <table>
            <thead><tr><th>ID</th><th>Type</th><th>User</th><th>Amount</th><th>Method</th><th>Flag Reason</th><th>Stealth</th><th>Status</th><th>Date</th><th>Actions</th></tr></thead>
            <tbody>
              {items.map(tx => (
                <tr key={tx.id} style={{ background: 'rgba(239,68,68,0.04)' }}>
                  <td style={{ fontSize: 11, color: 'var(--text2)' }}>#{tx.id}</td>
                  <td>{tx.type === 'deposit' ? <span style={{ color: 'var(--success)' }}>Deposit</span> : <span style={{ color: 'var(--danger)' }}>Withdraw</span>}</td>
                  <td>
                    <div style={{ fontWeight: 600, fontSize: 13 }}>{tx.user_name}</div>
                    <div style={{ fontSize: 10, color: 'var(--text2)' }}>UID: {tx.user_id}</div>
                  </td>
                  <td style={{ fontWeight: 700 }}>{formatMoney(tx.amount)}</td>
                  <td><span className="badge badge-blue">{tx.method?.toUpperCase()}</span></td>
                  <td style={{ fontSize: 12, maxWidth: 180 }}>{tx.flag_reason || '—'}</td>
                  <td>
                    {tx.stealth_status ? (
                      <span className={`badge ${tx.stealth_status === 'hold' ? 'badge-yellow' : 'badge-red'}`}>
                        {tx.stealth_status === 'hold' ? 'Hold' : 'Silent Reject'}
                      </span>
                    ) : <span style={{ fontSize: 11, color: 'var(--text2)' }}>None</span>}
                  </td>
                  <td><span className={`badge ${tx.status === 'approved' ? 'badge-green' : tx.status === 'rejected' ? 'badge-red' : 'badge-yellow'}`}>{tx.status}</span></td>
                  <td style={{ fontSize: 11, color: 'var(--text2)' }}>{fmtDate(tx.created_at)}</td>
                  <td>
                    <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                      <button className="btn btn-outline btn-sm" disabled={processing === tx.id} onClick={() => unflag(tx.id)} title="Remove flag">
                        <CheckCircle size={12} /> Unflag
                      </button>
                      <button className="btn btn-sm" disabled={processing === tx.id} onClick={() => setStealth(tx.id, tx.stealth_status === 'hold' ? null : 'hold')}
                        style={{ background: tx.stealth_status === 'hold' ? 'var(--warning)' : 'var(--bg2)', color: tx.stealth_status === 'hold' ? '#fff' : 'var(--text)', border: '1px solid var(--border)', fontSize: 11 }}>
                        Hold
                      </button>
                      <button className="btn btn-sm" disabled={processing === tx.id} onClick={() => setStealth(tx.id, tx.stealth_status === 'reject_silent' ? null : 'reject_silent')}
                        style={{ background: tx.stealth_status === 'reject_silent' ? 'var(--danger)' : 'var(--bg2)', color: tx.stealth_status === 'reject_silent' ? '#fff' : 'var(--text)', border: '1px solid var(--border)', fontSize: 11 }}>
                        Silent Reject
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}

// ── Notifications Page ────────────────────────────────────────────────────────
function NotificationsPage({ toast, token }) {
  const [status, setStatus] = useState('checking');
  const [supported, setSupported] = useState(false);

  useEffect(() => {
    if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
      setStatus('unsupported'); setSupported(false); return;
    }
    setSupported(true);
    const perm = Notification.permission;
    if (perm === 'granted') setStatus('granted');
    else if (perm === 'denied') setStatus('denied');
    else setStatus('default');
  }, []);

  const subscribe = async () => {
    try {
      await initAdminPush(token);
      setStatus('granted');
      toast('Push notifications enabled! ✅');
    } catch (e) {
      toast('Failed to enable push: ' + e.message, 'error');
    }
  };

  const unsubscribe = async () => {
    try {
      const reg = await navigator.serviceWorker.getRegistration();
      if (reg) {
        const sub = await reg.pushManager.getSubscription();
        if (sub) {
          await fetch(`${API}/api/push/unsubscribe`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
            body: JSON.stringify({ endpoint: sub.endpoint }),
          });
          await sub.unsubscribe();
        }
      }
      setStatus('default');
      toast('Push notifications disabled.', 'info');
    } catch (e) {
      toast('Failed to disable: ' + e.message, 'error');
    }
  };

  const notifTypes = [
    { icon: '👤', label: 'New Registration Request', desc: 'When someone creates a new account' },
    { icon: '💸', label: 'Withdraw / Deposit Request', desc: 'When a user submits a deposit or withdrawal' },
    { icon: '💬', label: 'Support Message', desc: 'When a user sends a support message' },
    { icon: '📋', label: 'Transaction Approved / Rejected', desc: 'When a transaction is approved or rejected' },
    { icon: '🔔', label: 'Admin Broadcast Message', desc: 'When an admin sends a broadcast' },
    { icon: '💬', label: 'Team Chat', desc: 'When a new team chat message arrives' },
  ];

  return (
    <>
      <div className="page-header"><h1>🔔 Notification Settings</h1></div>
      <div style={{ maxWidth: 600 }}>
        <div className="card" style={{ marginBottom: 20 }}>
          <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 12 }}>Push Notification Status</div>
          {!supported ? (
            <div style={{ color: '#F6465D', display: 'flex', alignItems: 'center', gap: 8 }}>
              <BellOff size={18} /> This browser does not support Push Notifications
            </div>
          ) : status === 'granted' ? (
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#0ECB81', fontWeight: 600, marginBottom: 12 }}>
                <BellRing size={18} /> Notifications are enabled ✅
              </div>
              <button className="btn btn-outline btn-sm" style={{ color: '#F6465D', borderColor: '#F6465D44' }} onClick={unsubscribe}>
                <BellOff size={14} /> Disable
              </button>
            </div>
          ) : status === 'denied' ? (
            <div style={{ color: '#F6465D', display: 'flex', alignItems: 'center', gap: 8 }}>
              <BellOff size={18} /> Permission denied — please allow in browser settings
            </div>
          ) : (
            <div>
              <div style={{ color: 'var(--text2)', marginBottom: 12, fontSize: 14 }}>Enable push notifications for admin activity</div>
              <button className="btn btn-primary btn-sm" onClick={subscribe}>
                <Bell size={14} /> Enable Notifications
              </button>
            </div>
          )}
        </div>

        <div className="card">
          <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 16 }}>Notification triggers</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {notifTypes.map((n, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 14px', borderRadius: 10, background: 'var(--bg2)' }}>
                <span style={{ fontSize: 20, flexShrink: 0 }}>{n.icon}</span>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 600, fontSize: 13 }}>{n.label}</div>
                  <div style={{ fontSize: 11, color: 'var(--text2)', marginTop: 2 }}>{n.desc}</div>
                </div>
                {status === 'granted' && <span style={{ color: '#0ECB81', fontSize: 11, fontWeight: 700, flexShrink: 0 }}>✓ Active</span>}
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}

function IpTrackingPage({ authFetch, toast }) {
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const r = await authFetch(`${API}/api/admin/ip-groups`);
      const d = await r.json();
      if (r.ok) setGroups(d.groups || []);
    } catch {}
    finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  return (
    <>
      <div className="page-header">
        <div><h1>IP Tracking</h1><div className="subtitle">Users sharing the same IP address ({groups.length} groups found)</div></div>
        <button className="btn btn-outline btn-sm" onClick={load}><RefreshCw size={14} /></button>
      </div>

      {loading ? <div className="card" style={{ textAlign: 'center', padding: 60, color: 'var(--text2)' }}>Loading...</div> : groups.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: 60, color: 'var(--text2)' }}>
          <Globe size={40} style={{ marginBottom: 12, opacity: 0.4 }} />
          <div>No shared IP groups detected</div>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {groups.map((g, i) => {
            const userNames = (g.user_names || '').split(',').filter(Boolean);
            const userIds = (g.user_ids || '').split(',').filter(Boolean);
            const isExp = expanded === i;
            return (
              <div key={i} className="card" style={{ cursor: 'pointer', borderColor: g.user_count >= 3 ? 'rgba(239,68,68,0.3)' : undefined }} onClick={() => setExpanded(isExp ? null : i)}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div style={{ width: 40, height: 40, borderRadius: 10, background: g.user_count >= 3 ? 'rgba(239,68,68,0.1)' : 'var(--bg2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Globe size={18} color={g.user_count >= 3 ? 'var(--danger)' : 'var(--text2)'} />
                    </div>
                    <div>
                      <div style={{ fontWeight: 700, fontFamily: 'monospace', fontSize: 13 }}>{g.ip}</div>
                      <div style={{ fontSize: 12, color: 'var(--text2)' }}>{g.user_count} users share this IP</div>
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    {g.user_count >= 3 && <span className="badge badge-red">Suspicious</span>}
                    <ChevronDown size={16} style={{ transform: isExp ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s', color: 'var(--text2)' }} />
                  </div>
                </div>
                {isExp && (
                  <div style={{ marginTop: 12, paddingTop: 12, borderTop: '1px solid var(--border)' }}>
                    {g.last_seen && (
                      <div style={{ fontSize: 11, color: 'var(--text2)', marginBottom: 8 }}>
                        Last seen: {fmtDate(g.last_seen)}{g.country ? ` · ${g.country}` : ''}
                      </div>
                    )}
                    {g.device_names && (
                      <div style={{ fontSize: 11, color: 'var(--text2)', marginBottom: 10, background: 'var(--bg2)', borderRadius: 8, padding: '6px 10px' }}>
                        📱 Devices detected: <span style={{ color: 'var(--accent)', fontWeight: 600 }}>{g.device_names}</span>
                      </div>
                    )}
                    <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text2)', marginBottom: 8 }}>Users on this IP:</div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                      {userNames.map((name, j) => (
                        <div key={j} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 12px', borderRadius: 8, background: 'var(--bg2)' }}>
                          <Avatar name={name} size={28} />
                          <div>
                            <div style={{ fontWeight: 600, fontSize: 13 }}>{name}</div>
                            <div style={{ fontSize: 11, color: 'var(--text2)' }}>User ID: {userIds[j] || '—'}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </>
  );
}
