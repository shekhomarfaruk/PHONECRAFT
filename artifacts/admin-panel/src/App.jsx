import { useState, useEffect, useCallback, useRef } from 'react';
import {
  LayoutDashboard, Users, CreditCard, MessageSquare, Shield, Settings,
  LogOut, TrendingUp, Clock, Trophy, BarChart2, User, X, ChevronDown,
  Download, Send, Lock, RefreshCw, Eye, CheckCircle, Ban, UserCheck,
  Menu, Search, Filter, FileText, Star, AlertTriangle, Reply, Trash2,
  ChevronRight, Edit, ArrowUpRight, ArrowDownRight, Activity,
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

function formatMoney(n) { return `৳${(Number(n) || 0).toLocaleString()}`; }
function fmtDate(d) { if (!d) return '—'; try { return new Date(d.includes('Z') ? d : d + 'Z').toLocaleString('en-GB', { timeZone: 'Asia/Dhaka', day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' }); } catch { return d; } }

function Avatar({ src, name, size = 36, style = {} }) {
  const isPath = src && (src.startsWith('/') || src.startsWith('http'));
  if (isPath) {
    return <img src={src.startsWith('http') ? src : `${API}${src}`} alt={name || ''} style={{ width: size, height: size, borderRadius: '50%', objectFit: 'cover', flexShrink: 0, ...style }} onError={(e) => { e.target.style.display = 'none'; e.target.nextSibling && (e.target.nextSibling.style.display = 'flex'); }} />;
  }
  return (
    <div style={{ width: size, height: size, borderRadius: '50%', background: 'linear-gradient(135deg, var(--accent), var(--accent2))', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: size * 0.4, fontWeight: 700, flexShrink: 0, color: '#fff', ...style }}>
      {name?.[0] || '?'}
    </div>
  );
}

export default function App() {
  const [token, setToken] = useState(() => localStorage.getItem('admin_token') || '');
  const [adminUser, setAdminUser] = useState(null);
  const [page, setPage] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [toasts, setToasts] = useState([]);

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
      } else {
        localStorage.removeItem('admin_token');
        setToken('');
      }
    }).catch(() => { localStorage.removeItem('admin_token'); setToken(''); });
  }, [token]);

  const logout = () => { localStorage.removeItem('admin_token'); setToken(''); setAdminUser(null); };

  if (!token || !adminUser) return <LoginScreen onLogin={(t, u) => { setToken(t); setAdminUser(u); localStorage.setItem('admin_token', t); }} />;

  const isMain = !!adminUser.is_main_admin;
  const navItems = [
    ...(isMain ? [{ id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard }] : []),
    { id: 'users', label: 'Users', icon: Users },
    { id: 'finance', label: 'Finance', icon: CreditCard },
    { id: 'support', label: 'Support', icon: MessageSquare },
    ...(isMain ? [{ id: 'admins', label: 'Admin & Roles', icon: Shield }] : []),
    ...(isMain ? [{ id: 'settings', label: 'Settings', icon: Settings }] : []),
  ];

  const activePage = navItems.find(n => n.id === page) ? page : navItems[0]?.id || 'users';
  if (activePage !== page) setPage(activePage);

  return (
    <div className="app-layout">
      <Toast toasts={toasts} />
      <div className="hamburger" onClick={() => setSidebarOpen(p => !p)}><Menu size={20} /></div>
      <div className={`sidebar-overlay ${sidebarOpen ? 'open' : ''}`} onClick={() => setSidebarOpen(false)} />
      <aside className={`sidebar ${sidebarOpen ? 'open' : ''}`}>
        <div className="sidebar-header">
          <h2>🛡️ PhoneCraft Admin</h2>
          <div className="user-info">{adminUser.name} ({isMain ? 'Main Admin' : 'Sub-Admin'})</div>
        </div>
        <nav className="sidebar-nav">
          {navItems.map(n => {
            const Icon = n.icon;
            return (
              <div key={n.id} className={`nav-item ${page === n.id ? 'active' : ''}`} onClick={() => { setPage(n.id); setSidebarOpen(false); }}>
                <Icon size={18} /> {n.label}
              </div>
            );
          })}
        </nav>
        <div className="sidebar-footer">
          <div className="nav-item" onClick={logout} style={{ color: 'var(--danger)' }}><LogOut size={18} /> Logout</div>
        </div>
      </aside>
      <main className="main-content" onClick={() => sidebarOpen && setSidebarOpen(false)}>
        {page === 'dashboard' && <DashboardPage authFetch={authFetch} toast={toast} />}
        {page === 'users' && <UsersPage authFetch={authFetch} toast={toast} isMain={isMain} adminUser={adminUser} />}
        {page === 'finance' && <FinancePage authFetch={authFetch} toast={toast} isMain={isMain} />}
        {page === 'support' && <SupportPage authFetch={authFetch} toast={toast} />}
        {page === 'admins' && <AdminsPage authFetch={authFetch} toast={toast} />}
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
      const res = await fetch(`${API}/api/login`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identifier: id, password: pw }),
      });
      const data = await res.json();
      if (res.ok && data.token && data.user?.is_admin) {
        onLogin(data.token, data.user);
      } else if (res.ok && data.token && !data.user?.is_admin) {
        setErr('Access denied. Admin account required.');
      } else {
        setErr(data.error || 'Login failed');
      }
    } catch { setErr('Connection error'); }
    finally { setLoading(false); }
  };

  return (
    <div className="login-container">
      <form className="login-box" onSubmit={login}>
        <h1>🛡️ Admin Panel</h1>
        <p className="subtitle">PhoneCraft Management Console</p>
        {err && <div style={{ background: 'rgba(246,70,93,0.1)', border: '1px solid var(--danger)', borderRadius: 10, padding: '10px 14px', color: 'var(--danger)', fontSize: 12, marginBottom: 16 }}>{err}</div>}
        <label className="input-label">Identifier</label>
        <input className="inp" value={id} onChange={e => setId(e.target.value)} placeholder="Enter admin identifier" autoFocus />
        <label className="input-label">Password</label>
        <input className="inp" type="password" value={pw} onChange={e => setPw(e.target.value)} placeholder="Enter password" />
        <button className="btn btn-primary btn-full" type="submit" disabled={loading} style={{ marginTop: 8 }}>
          {loading ? 'Logging in...' : 'Login to Admin Panel'}
        </button>
      </form>
    </div>
  );
}

function DashboardPage({ authFetch, toast }) {
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

      {chartData.length > 0 && (
        <div className="card">
          <div className="card-title"><BarChart2 size={16} /> Revenue Chart (14 days)</div>
          <div className="chart-bar-row">
            {chartData.map((d, i) => (
              <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2, height: '100%', justifyContent: 'flex-end' }}>
                <div className="chart-bar" style={{ height: `${Math.max(3, (d.deposits / chartMax) * 100)}%`, background: 'var(--success)' }} title={`Dep: ৳${d.deposits}`} />
                <div className="chart-bar" style={{ height: `${Math.max(3, (d.withdrawals / chartMax) * 100)}%`, background: 'var(--danger)' }} title={`Wd: ৳${d.withdrawals}`} />
              </div>
            ))}
          </div>
          <div style={{ display: 'flex', justifyContent: 'center', gap: 20, fontSize: 11, color: 'var(--text2)', marginTop: 6 }}>
            <span><span style={{ display: 'inline-block', width: 10, height: 10, borderRadius: 3, background: 'var(--success)', marginRight: 4, verticalAlign: 'middle' }} />Deposits</span>
            <span><span style={{ display: 'inline-block', width: 10, height: 10, borderRadius: 3, background: 'var(--danger)', marginRight: 4, verticalAlign: 'middle' }} />Withdrawals</span>
          </div>
        </div>
      )}

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
            <div className="card-title"><Trophy size={16} color="var(--warning)" /> Top Earners</div>
            {stats.topEarners.map((u, i) => (
              <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 10px', borderRadius: 8, background: 'rgba(35,175,145,0.05)', marginBottom: 4 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <span style={{ fontWeight: 800, color: 'var(--warning)', minWidth: 24 }}>#{i + 1}</span>
                  <span style={{ fontWeight: 600 }}>{u.name}</span>
                </div>
                <span style={{ fontWeight: 700, color: 'var(--success)' }}>{formatMoney(u.balance)}</span>
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
                  <span>{a.type === 'signup' ? `${a.detail} joined` : `৳${a.detail}`}</span>
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
                    <div key={r.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid var(--border)', fontSize: 13, paddingLeft: (r.level - 1) * 20 }}>
                      <span>{r.name} <span className="badge badge-blue" style={{ fontSize: 9 }}>L{r.level}</span></span>
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
            <thead><tr><th>Type</th><th>User</th><th>Amount</th><th>Method</th><th>Account</th><th>Status</th><th>Date</th><th>Actions</th></tr></thead>
            <tbody>
              {filtered.map(tx => (
                <tr key={tx.id} style={{ background: tx.status === 'pending' ? 'rgba(252,213,53,0.03)' : undefined }}>
                  <td>{tx.type === 'deposit' ? <span style={{ color: 'var(--success)' }}>💰 Deposit</span> : <span style={{ color: 'var(--danger)' }}>💸 Withdraw</span>}</td>
                  <td><div style={{ fontWeight: 600 }}>{tx.user_name}</div><div style={{ fontSize: 10, color: 'var(--text2)' }}>{tx.user_identifier}</div></td>
                  <td style={{ fontWeight: 700, fontSize: 15 }}>{formatMoney(tx.amount)}</td>
                  <td><span className="badge badge-blue">{tx.method?.toUpperCase()}</span></td>
                  <td style={{ fontFamily: 'monospace', fontSize: 12 }}>{tx.account}</td>
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
              ))}
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

function AdminsPage({ authFetch, toast }) {
  const [users, setUsers] = useState([]);
  const [logs, setLogs] = useState([]);
  const [logsLoading, setLogsLoading] = useState(true);
  const [editPerms, setEditPerms] = useState(null);
  const [perms, setPerms] = useState({});

  const loadUsers = useCallback(async () => {
    try { const r = await authFetch(`${API}/api/admin/users`); const d = await r.json(); if (r.ok) setUsers((d.users || []).filter(u => u.is_admin)); } catch {}
  }, []);

  const loadLogs = useCallback(async () => {
    setLogsLoading(true);
    try { const r = await authFetch(`${API}/api/admin/activity-log`); const d = await r.json(); if (r.ok) setLogs(d.logs || []); } catch {}
    finally { setLogsLoading(false); }
  }, []);

  useEffect(() => { loadUsers(); loadLogs(); }, [loadUsers, loadLogs]);

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

  const PERM_LABELS = {
    view_users: 'View Users', edit_users: 'Edit Users', ban_users: 'Ban Users',
    approve_deposits: 'Approve Deposits', approve_withdrawals: 'Approve Withdrawals',
    change_settings: 'Change Settings', manage_admins: 'Manage Admins',
    view_reports: 'View Reports', export_data: 'Export Data', access_support: 'Access Support',
  };

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
              <div style={{ fontWeight: 700, fontSize: 14 }}>{u.name} <span className={`badge ${u.is_main_admin ? 'badge-purple' : 'badge-blue'}`}>{u.is_main_admin ? 'Main Admin' : 'Sub-Admin'}</span></div>
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
            <h2 style={{ fontSize: 16 }}>Set Permissions</h2>
            <button className="btn btn-outline btn-sm" onClick={() => setEditPerms(null)}><X size={14} /></button>
          </div>
          <div className="grid-2">
            {Object.entries(PERM_LABELS).map(([key, label]) => (
              <label key={key} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 12px', borderRadius: 8, background: 'var(--bg2)', border: '1px solid var(--border)', cursor: 'pointer' }}>
                <input type="checkbox" checked={!!perms[key]} onChange={() => setPerms(p => ({ ...p, [key]: !p[key] }))} />
                <span style={{ fontSize: 12 }}>{label}</span>
              </label>
            ))}
          </div>
          <button className="btn btn-primary btn-full" style={{ marginTop: 16 }} onClick={savePerms}>Save Permissions</button>
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
      if (r.ok) toast('Settings saved');
      else toast('Failed to save', 'error');
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
      </div>

      <div className="card">
        <div className="card-title"><CreditCard size={16} /> Payment Accounts</div>
        <div className="grid-2">
          {['bkash', 'nagad', 'rocket', 'bank'].map(m => (
            <div key={m}>
              <label className="input-label">{m.charAt(0).toUpperCase() + m.slice(1)} Number</label>
              <input className="inp" value={settings[`deposit_${m}`] || ''} onChange={e => setSettings(p => ({ ...p, [`deposit_${m}`]: e.target.value }))} />
            </div>
          ))}
        </div>
      </div>

      <div className="card">
        <div className="card-title" style={{ color: 'var(--accent)' }}>💎 Crypto Wallet Addresses</div>
        <div style={{ fontSize: 12, color: 'var(--text2)', marginBottom: 16 }}>
          Enter wallet addresses per blockchain and token. Leave blank to hide from users.
        </div>
        {[
          { chain: 'eth',      label: 'Ethereum'      },
          { chain: 'op',       label: 'Optimism (OP)' },
          { chain: 'base',     label: 'Base'          },
          { chain: 'polygon',  label: 'Polygon'       },
          { chain: 'arbitrum', label: 'Arbitrum'      },
        ].map(({ chain, label }) => (
          <div key={chain} style={{ marginBottom: 16, padding: '12px 14px', borderRadius: 10, background: 'var(--bg2)', border: '1px solid var(--border)' }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--accent)', marginBottom: 10, textTransform: 'uppercase', letterSpacing: 0.5 }}>
              ⛓ {label}
            </div>
            <div className="grid-2">
              {['usdt', 'usdc'].map(tok => (
                <div key={tok}>
                  <label className="input-label">{tok.toUpperCase()} Address</label>
                  <input
                    className="inp"
                    placeholder="0x..."
                    value={settings[`crypto_${chain}_${tok}`] || ''}
                    onChange={e => setSettings(p => ({ ...p, [`crypto_${chain}_${tok}`]: e.target.value }))}
                  />
                </div>
              ))}
            </div>
          </div>
        ))}
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
