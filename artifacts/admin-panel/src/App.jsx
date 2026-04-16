import { useState, useEffect, useCallback, useRef } from 'react';
import { playNotifSound } from './sounds.js';
import {
  LayoutDashboard, Users, CreditCard, MessageSquare, Shield, ShieldOff, Settings,
  LogOut, TrendingUp, Clock, Trophy, BarChart2, User, X, ChevronDown,
  Download, Upload, Send, Lock, RefreshCw, Eye, CheckCircle, Ban, UserCheck,
  Menu, Search, Filter, FileText, Star, AlertTriangle, Reply, Trash2,
  ChevronRight, Edit, ArrowUpRight, ArrowDownRight, Activity,
  Flag, Globe, Bell, BellOff, BellRing, Link, Zap, MessageCircle,
  Wallet, ArrowLeftRight, PlusCircle, MinusCircle, SlidersHorizontal,
  Factory, Network, UserPlus, TrendingDown, Package, Megaphone,
  MapPin, ChevronUp, Cpu, ShieldCheck, BookOpen, Layers,
} from 'lucide-react';

const BASE = import.meta.env.BASE_URL || '/admin-panel/';
const API = `${window.location.origin}`;

/** Parse bilingual JSON message {en, bn} based on lang */
function parseMsg(text, lang = 'en') {
  if (!text) return '';
  const s = String(text);
  if (s.startsWith('{') && s.includes('"en"')) {
    try {
      const p = JSON.parse(s);
      return (lang === 'bn' ? p.bn : p.en) || p.en || p.bn || s;
    } catch (_) {}
  }
  return s;
}

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

function AdminNotifPanel({ open, onClose, authFetch, onNavigate, adminUser, lang }) {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(false);
  const [inbox, setInbox] = useState([]);
  const [tab, setTab] = useState('activity');

  useEffect(() => {
    if (!open) return;
    setLoading(true);
    authFetch(`${API}/api/admin/stats`)
      .then(r => r.json())
      .then(d => setStats(d))
      .catch(() => {})
      .finally(() => setLoading(false));
    // Also load admin's in-app notifications
    if (adminUser?.id) {
      authFetch(`${API}/api/user/${adminUser.id}/notifications`)
        .then(r => r.json())
        .then(d => setInbox((d.notifications || []).slice(0, 30)))
        .catch(() => {});
    }
  }, [open, adminUser?.id]);

  if (!open) return null;

  const pendingDeposits = stats?.pendingDeposits || 0;
  const pendingWithdrawals = stats?.pendingWithdrawals || 0;
  const unreplied = stats?.support?.unrepliedSessions || 0;
  const recentActivity = (stats?.recentActivity || []).slice(0, 8);
  const total = pendingDeposits + pendingWithdrawals + unreplied;

  const typeIcon = { success: '✅', info: '🔔', warning: '⚠️', error: '❌' };

  function getNotifPage(message) {
    const txt = (parseMsg(message, 'en') + ' ' + parseMsg(message, 'bn')).toLowerCase();
    if (txt.includes('deposit') || txt.includes('withdraw') || txt.includes('transaction') || txt.includes('payment')) return 'finance';
    if (txt.includes('support') || txt.includes('chat') || txt.includes('reply') || txt.includes('message')) return 'support';
    if (txt.includes('plan') || txt.includes('balance')) return 'users';
    return 'users';
  }

  return (
    <>
      <div className="notif-panel-overlay" onClick={onClose} />
      <div className="notif-panel">
        <div className="notif-panel-header">
          <div className="notif-panel-title">🔔 {lang === 'bn' ? 'নোটিফিকেশন' : 'Notifications'}</div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text2)', display: 'flex', padding: 4 }}>
            <X size={18} />
          </button>
        </div>
        {/* Tabs */}
        <div style={{ display: 'flex', borderBottom: '1px solid var(--border)', background: 'var(--card)' }}>
          {['activity', 'inbox'].map(t => (
            <button key={t} onClick={() => setTab(t)} style={{
              flex: 1, padding: '9px 0', fontSize: 12, fontWeight: 700,
              background: 'none', border: 'none', cursor: 'pointer',
              color: tab === t ? 'var(--primary)' : 'var(--text2)',
              borderBottom: tab === t ? '2px solid var(--primary)' : '2px solid transparent',
              transition: 'all .15s',
            }}>
              {t === 'activity'
                ? (lang === 'bn' ? '📊 অ্যাক্টিভিটি' : '📊 Activity')
                : (lang === 'bn' ? `📩 ইনবক্স${inbox.length ? ` (${inbox.length})` : ''}` : `📩 Inbox${inbox.length ? ` (${inbox.length})` : ''}`)}
            </button>
          ))}
        </div>
        <div className="notif-panel-body">
          {tab === 'activity' && (loading ? (
            <div className="notif-empty">
              <RefreshCw size={24} style={{ opacity: 0.4, animation: 'spin 1s linear infinite' }} />
              <div style={{ fontSize: 13 }}>Loading...</div>
            </div>
          ) : (
            <>
              {total === 0 && recentActivity.length === 0 ? (
                <div className="notif-empty">
                  <CheckCircle size={32} color="var(--success)" style={{ opacity: 0.6 }} />
                  <div style={{ fontSize: 13, fontWeight: 600 }}>{lang === 'bn' ? 'সব ঠিক আছে!' : 'All clear!'}</div>
                  <div style={{ fontSize: 12 }}>{lang === 'bn' ? 'কোনো পেন্ডিং কাজ নেই' : 'No pending actions'}</div>
                </div>
              ) : (
                <>
                  {pendingDeposits > 0 && (
                    <div className="notif-item" onClick={() => { onNavigate('finance'); onClose(); }}>
                      <div className="notif-icon" style={{ background: 'rgba(5,150,105,0.1)' }}>💰</div>
                      <div className="notif-content">
                        <div className="notif-content-title">{pendingDeposits} {lang === 'bn' ? 'পেন্ডিং ডিপোজিট' : `Pending Deposit${pendingDeposits > 1 ? 's' : ''}`}</div>
                        <div className="notif-content-sub">{lang === 'bn' ? 'অনুমোদনের অপেক্ষা → ফাইন্যান্স' : 'Awaiting approval → Finance'}</div>
                      </div>
                      <ChevronRight size={14} color="var(--text2)" />
                    </div>
                  )}
                  {pendingWithdrawals > 0 && (
                    <div className="notif-item" onClick={() => { onNavigate('finance'); onClose(); }}>
                      <div className="notif-icon" style={{ background: 'rgba(220,38,38,0.1)' }}>💸</div>
                      <div className="notif-content">
                        <div className="notif-content-title">{pendingWithdrawals} {lang === 'bn' ? 'পেন্ডিং উইথড্র' : `Pending Withdrawal${pendingWithdrawals > 1 ? 's' : ''}`}</div>
                        <div className="notif-content-sub">{lang === 'bn' ? 'অনুমোদনের অপেক্ষা → ফাইন্যান্স' : 'Awaiting approval → Finance'}</div>
                      </div>
                      <ChevronRight size={14} color="var(--text2)" />
                    </div>
                  )}
                  {unreplied > 0 && (
                    <div className="notif-item" onClick={() => { onNavigate('support'); onClose(); }}>
                      <div className="notif-icon" style={{ background: 'rgba(124,58,237,0.1)' }}>💬</div>
                      <div className="notif-content">
                        <div className="notif-content-title">{unreplied} {lang === 'bn' ? 'অনুত্তরিত সাপোর্ট' : `Unanswered Support${unreplied > 1 ? 's' : ''}`}</div>
                        <div className="notif-content-sub">{lang === 'bn' ? 'ব্যবহারকারী অপেক্ষা করছে → সাপোর্ট' : 'Users waiting for reply → Support'}</div>
                      </div>
                      <ChevronRight size={14} color="var(--text2)" />
                    </div>
                  )}
                  {recentActivity.length > 0 && (
                    <div style={{ padding: '10px 16px 4px', fontSize: 10, fontWeight: 700, color: 'var(--text2)', textTransform: 'uppercase', letterSpacing: '0.8px' }}>
                      {lang === 'bn' ? 'সাম্প্রতিক কার্যক্রম' : 'Recent Activity'}
                    </div>
                  )}
                  {recentActivity.map((a, i) => (
                    <div key={i} className="notif-item" style={{ cursor: 'default', alignItems: 'flex-start' }}>
                      <div className="notif-icon" style={{ background: a.type === 'signup' ? 'rgba(37,99,235,0.1)' : a.type === 'deposit' ? 'rgba(5,150,105,0.1)' : 'rgba(220,38,38,0.1)', fontSize: 15, marginTop: 2 }}>
                        {a.type === 'signup' ? '👤' : a.type === 'deposit' ? '💰' : '💸'}
                      </div>
                      <div className="notif-content">
                        <div className="notif-content-title" style={{ display: 'flex', alignItems: 'center', gap: 5, flexWrap: 'wrap' }}>
                          <span>{a.user_name}</span>
                          <span style={{ fontSize: 10, opacity: 0.6, background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: 3, padding: '0 4px' }}>#{a.user_id}</span>
                          {a.type === 'signup' && <span style={{ fontSize: 10, color: 'var(--text2)' }}>{lang === 'bn' ? 'যোগ দিয়েছে' : 'joined'}</span>}
                          {(a.type === 'deposit' || a.type === 'withdraw') && (
                            <span style={{ color: a.type === 'deposit' ? 'var(--success)' : 'var(--danger)', fontWeight: 700 }}>
                              {a.type === 'deposit' ? '+' : '-'}৳{Number(a.amount).toLocaleString()}
                            </span>
                          )}
                        </div>
                        <div className="notif-content-sub" style={{ marginTop: 2, lineHeight: 1.6 }}>
                          {a.type === 'signup' && a.referrer_name && <span>{lang === 'bn' ? 'রেফার: ' : 'Ref: '}<b>{a.referrer_name}</b> · </span>}
                          {a.type === 'signup' && a.plan_name && <span>{a.plan_name} · ৳{Number(a.plan_rate).toLocaleString()} · </span>}
                          {(a.type === 'deposit' || a.type === 'withdraw') && a.method && <span style={{ textTransform: 'uppercase', fontWeight: 600 }}>{a.method}{a.account ? ` · ${a.account}` : ''} · </span>}
                          {fmtDate(a.created_at)}
                        </div>
                      </div>
                    </div>
                  ))}
                </>
              )}
            </>
          ))}
          {tab === 'inbox' && (
            inbox.length === 0 ? (
              <div className="notif-empty">
                <Bell size={32} style={{ opacity: 0.3 }} />
                <div style={{ fontSize: 13 }}>{lang === 'bn' ? 'কোনো নোটিফিকেশন নেই' : 'No notifications yet'}</div>
              </div>
            ) : (
              inbox.map(n => (
                <div key={n.id} className="notif-item" onClick={() => { onNavigate(getNotifPage(n.message)); onClose(); }}
                  style={{ cursor: 'pointer', background: n.read ? 'transparent' : 'rgba(37,99,235,0.04)', borderLeft: n.read ? 'none' : '3px solid var(--primary)' }}>
                  <div className="notif-icon" style={{ background: n.type === 'success' ? 'rgba(5,150,105,0.1)' : n.type === 'warning' ? 'rgba(234,88,12,0.1)' : n.type === 'error' ? 'rgba(220,38,38,0.1)' : 'rgba(37,99,235,0.1)', fontSize: 15 }}>
                    {typeIcon[n.type] || '🔔'}
                  </div>
                  <div className="notif-content">
                    <div className="notif-content-title" style={{ whiteSpace: 'pre-wrap', lineHeight: 1.45 }}>
                      {parseMsg(n.message, lang)}
                    </div>
                    <div className="notif-content-sub">{fmtDate(n.created_at)}</div>
                  </div>
                  <ChevronRight size={14} color="var(--text2)" />
                </div>
              ))
            )
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

/* ─────────────────────────────────────────────────────────────────────────────
   NEW PAGES
───────────────────────────────────────────────────────────────────────────── */

function PendingRegistrationsPage({ authFetch, toast, isMain }) {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const r = await authFetch(`${API}/api/admin/users`);
      const d = await r.json();
      if (r.ok) {
        const cutoff = Date.now() - 7 * 24 * 60 * 60 * 1000;
        const recent = (d.users || []).filter(u => !u.is_admin && new Date(u.created_at + 'Z').getTime() > cutoff);
        recent.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
        setUsers(recent);
      }
    } catch {}
    finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  const banUser = async (id, banned) => {
    try {
      const r = await authFetch(`${API}/api/admin/users/${id}`, { method: 'PATCH', body: JSON.stringify({ banned: !banned }) });
      if (r.ok) { toast(banned ? 'User unbanned' : 'User banned'); load(); }
    } catch { toast('Failed', 'error'); }
  };

  const filtered = users.filter(u => !search || u.name?.toLowerCase().includes(search.toLowerCase()) || u.identifier?.toLowerCase().includes(search.toLowerCase()));

  const hoursAgo = (d) => {
    const ms = Date.now() - new Date(d + 'Z').getTime();
    const h = Math.floor(ms / 3600000);
    return h < 24 ? `${h}h ago` : `${Math.floor(h / 24)}d ago`;
  };

  return (
    <>
      <div className="page-header">
        <div>
          <h1><UserPlus size={20} style={{ verticalAlign: 'middle', marginRight: 8, color: 'var(--accent)' }} />Recent Registrations</h1>
          <div className="subtitle">Users registered in the last 7 days — {filtered.length} accounts</div>
        </div>
        <button className="btn btn-outline btn-sm" onClick={load}><RefreshCw size={14} /></button>
      </div>

      <div className="card" style={{ padding: '14px 16px', marginBottom: 16 }}>
        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
          <Search size={15} color="var(--text2)" style={{ flexShrink: 0 }} />
          <input className="inp" style={{ marginBottom: 0 }} placeholder="Search by name or identifier..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>
      </div>

      {loading ? (
        <div className="card" style={{ textAlign: 'center', padding: 60, color: 'var(--text2)' }}>Loading...</div>
      ) : filtered.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: 60, color: 'var(--text2)' }}>
          <UserPlus size={40} style={{ opacity: 0.2, marginBottom: 12 }} />
          <div>No new registrations in the last 7 days</div>
        </div>
      ) : (
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>User</th>
                <th>Refer Code</th>
                <th>Plan</th>
                <th>Balance</th>
                <th>Registered</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(u => (
                <tr key={u.id}>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <Avatar src={u.avatar_img || u.avatar} name={u.name} size={34} style={{ borderRadius: 8 }} />
                      <div>
                        <div style={{ fontWeight: 700, fontSize: 13 }}>{u.name}</div>
                        <div style={{ fontSize: 10, color: 'var(--text2)' }}>{u.identifier}</div>
                      </div>
                    </div>
                  </td>
                  <td><code style={{ fontSize: 11, background: 'var(--bg2)', padding: '2px 6px', borderRadius: 4 }}>{u.refer_code}</code></td>
                  <td><span className="badge badge-blue">{u.plan_type || 'NONE'}</span></td>
                  <td style={{ fontWeight: 700, color: 'var(--success)' }}>{formatMoney(u.balance || 0)}</td>
                  <td style={{ fontSize: 11, color: 'var(--text2)' }}>
                    <div>{fmtDate(u.created_at)}</div>
                    <div style={{ color: '#3B82F6', fontWeight: 600 }}>{hoursAgo(u.created_at)}</div>
                  </td>
                  <td>
                    <span className={`badge ${u.banned ? 'badge-red' : 'badge-green'}`}>
                      {u.banned ? 'Banned' : 'Active'}
                    </span>
                  </td>
                  <td>
                    <button
                      className={`btn btn-sm ${u.banned ? 'btn-success' : 'btn-danger'}`}
                      onClick={() => banUser(u.id, u.banned)}
                    >
                      {u.banned ? <><CheckCircle size={12} /> Unban</> : <><Ban size={12} /> Ban</>}
                    </button>
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

function ReferralNetworkPage({ authFetch, toast }) {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const r = await authFetch(`${API}/api/admin/users`);
      const d = await r.json();
      if (r.ok) setUsers((d.users || []).filter(u => !u.is_admin));
    } catch {}
    finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  const referralMap = {};
  users.forEach(u => {
    if (u.refer_code) {
      const referrer = users.find(x => x.refer_code === u.referred_by);
      if (referrer) {
        if (!referralMap[referrer.id]) referralMap[referrer.id] = { referrer, count: 0, balance: 0 };
        referralMap[referrer.id].count++;
        referralMap[referrer.id].balance += Number(u.balance) || 0;
      }
    }
  });

  const referrers = Object.values(referralMap).sort((a, b) => b.count - a.count);

  const filtered = search
    ? users.filter(u => u.name?.toLowerCase().includes(search.toLowerCase()) || u.identifier?.toLowerCase().includes(search.toLowerCase()) || u.refer_code?.toLowerCase().includes(search.toLowerCase()))
    : users;

  return (
    <>
      <div className="page-header">
        <div>
          <h1><Network size={20} style={{ verticalAlign: 'middle', marginRight: 8, color: 'var(--accent)' }} />Referral Network</h1>
          <div className="subtitle">{users.length} users · {referrers.length} active referrers</div>
        </div>
        <button className="btn btn-outline btn-sm" onClick={load}><RefreshCw size={14} /></button>
      </div>

      <div className="stats-grid" style={{ gridTemplateColumns: 'repeat(3, 1fr)' }}>
        <div className="stat-card">
          <div className="stat-value" style={{ color: 'var(--accent)' }}>{users.length}</div>
          <div className="stat-label">Total Users</div>
        </div>
        <div className="stat-card">
          <div className="stat-value" style={{ color: 'var(--success)' }}>{referrers.length}</div>
          <div className="stat-label">Active Referrers</div>
        </div>
        <div className="stat-card">
          <div className="stat-value" style={{ color: 'var(--warning)' }}>
            {users.filter(u => u.referred_by).length}
          </div>
          <div className="stat-label">Referred Users</div>
        </div>
      </div>

      <div className="card">
        <div className="card-title"><Trophy size={16} color="#F59E0B" /> Top Referrers</div>
        {loading ? (
          <div style={{ textAlign: 'center', padding: 40, color: 'var(--text2)' }}>Loading...</div>
        ) : referrers.length === 0 ? (
          <div style={{ textAlign: 'center', padding: 40, color: 'var(--text2)' }}>No referrals yet</div>
        ) : referrers.slice(0, 20).map((item, i) => (
          <div key={item.referrer.id} className="referral-card">
            <div style={{
              width: 28, height: 28, borderRadius: 8, flexShrink: 0,
              background: i === 0 ? 'linear-gradient(135deg,#F59E0B,#FCD34D)' : i === 1 ? 'linear-gradient(135deg,#9CA3AF,#D1D5DB)' : i === 2 ? 'linear-gradient(135deg,#B45309,#D97706)' : 'var(--bg2)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: 12,
              color: i < 3 ? '#fff' : 'var(--text2)'
            }}>
              #{i + 1}
            </div>
            <Avatar src={item.referrer.avatar_img || item.referrer.avatar} name={item.referrer.name} size={36} style={{ borderRadius: 10 }} />
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 700, fontSize: 13 }}>{item.referrer.name}</div>
              <div style={{ fontSize: 11, color: 'var(--text2)' }}>{item.referrer.refer_code}</div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontWeight: 800, fontSize: 16, color: 'var(--accent)' }}>{item.count}</div>
              <div style={{ fontSize: 10, color: 'var(--text2)' }}>referrals</div>
            </div>
            <div style={{ textAlign: 'right', minWidth: 90 }}>
              <div style={{ fontWeight: 700, fontSize: 13, color: 'var(--success)' }}>{formatMoney(item.referrer.balance || 0)}</div>
              <div style={{ fontSize: 10, color: 'var(--text2)' }}>balance</div>
            </div>
          </div>
        ))}
      </div>

      <div className="card">
        <div className="card-title"><Users size={16} /> All Users with Referral Info</div>
        <div style={{ marginBottom: 12 }}>
          <input className="inp" style={{ marginBottom: 0 }} placeholder="Search users..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <div className="table-wrap">
          <table>
            <thead><tr><th>User</th><th>Refer Code</th><th>Referred By</th><th>Balance</th><th>Plan</th></tr></thead>
            <tbody>
              {filtered.slice(0, 50).map(u => {
                const refBy = users.find(x => x.refer_code === u.referred_by);
                return (
                  <tr key={u.id}>
                    <td>
                      <div style={{ fontWeight: 600, fontSize: 13 }}>{u.name}</div>
                      <div style={{ fontSize: 10, color: 'var(--text2)' }}>{u.identifier}</div>
                    </td>
                    <td><code style={{ fontSize: 11 }}>{u.refer_code}</code></td>
                    <td style={{ fontSize: 12, color: refBy ? 'var(--accent)' : 'var(--text2)' }}>
                      {refBy ? refBy.name : u.referred_by ? u.referred_by : '—'}
                    </td>
                    <td style={{ fontWeight: 700, color: 'var(--success)' }}>{formatMoney(u.balance || 0)}</td>
                    <td><span className="badge badge-blue">{u.plan_type || '—'}</span></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}

function ManufacturingPage({ authFetch, toast }) {
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [sr, ur] = await Promise.all([
        authFetch(`${API}/api/admin/stats`),
        authFetch(`${API}/api/admin/users`),
      ]);
      const [sd, ud] = await Promise.all([sr.json(), ur.json()]);
      if (sr.ok) setStats(sd);
      if (ur.ok) setUsers((ud.users || []).filter(u => !u.is_admin));
    } catch {}
    finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  const topEarners = [...users].sort((a, b) => (Number(b.balance) || 0) - (Number(a.balance) || 0)).slice(0, 10);
  const topByPlan = (plan) => users.filter(u => u.plan_type === plan);

  const planColors = { BASIC: '#3B82F6', PREMIUM: '#8B5CF6', GOLD: '#F59E0B', PLATINUM: '#10B981' };
  const planCounts = ['BASIC', 'PREMIUM', 'GOLD', 'PLATINUM'].map(p => ({ plan: p, count: topByPlan(p).length, color: planColors[p] }));
  const totalWithPlan = planCounts.reduce((s, p) => s + p.count, 0);

  return (
    <>
      <div className="page-header">
        <div>
          <h1><Factory size={20} style={{ verticalAlign: 'middle', marginRight: 8, color: 'var(--accent)' }} />Manufacturing Analytics</h1>
          <div className="subtitle">Platform-wide production stats and worker performance</div>
        </div>
        <button className="btn btn-outline btn-sm" onClick={load}><RefreshCw size={14} /></button>
      </div>

      {loading ? (
        <div className="card" style={{ textAlign: 'center', padding: 60, color: 'var(--text2)' }}>Loading...</div>
      ) : (
        <>
          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-value" style={{ color: 'var(--accent)' }}>{stats?.totalUsers || users.length}</div>
              <div className="stat-label">Total Workers</div>
            </div>
            <div className="stat-card">
              <div className="stat-value" style={{ color: 'var(--success)' }}>{totalWithPlan}</div>
              <div className="stat-label">Active Plans</div>
            </div>
            <div className="stat-card">
              <div className="stat-value" style={{ color: 'var(--warning)' }}>{stats?.pendingDeposits || 0}</div>
              <div className="stat-label">Pending Deposits</div>
            </div>
            <div className="stat-card">
              <div className="stat-value" style={{ color: 'var(--danger)' }}>{stats?.pendingWithdrawals || 0}</div>
              <div className="stat-label">Pending Withdrawals</div>
            </div>
          </div>

          <div className="grid-2" style={{ gap: 16 }}>
            <div className="card">
              <div className="card-title"><Cpu size={16} color="var(--accent)" /> Plan Distribution</div>
              {planCounts.map(p => (
                <div key={p.plan} style={{ marginBottom: 14 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                    <span style={{ fontSize: 12, fontWeight: 700, color: p.color }}>{p.plan}</span>
                    <span style={{ fontSize: 12, fontWeight: 800 }}>{p.count} workers</span>
                  </div>
                  <div className="progress-bar">
                    <div className="progress-bar-fill" style={{ width: totalWithPlan > 0 ? `${(p.count / totalWithPlan) * 100}%` : '0%', background: p.color }} />
                  </div>
                </div>
              ))}
            </div>

            <div className="card">
              <div className="card-title"><BarChart2 size={16} color="var(--success)" /> Platform Overview</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {[
                  { label: 'Total Deposits', value: formatMoney(stats?.totalDeposits || 0), color: 'var(--success)' },
                  { label: 'Total Withdrawals', value: formatMoney(stats?.totalWithdrawals || 0), color: 'var(--danger)' },
                  { label: 'Active Workers', value: users.filter(u => u.plan_type).length, color: 'var(--accent)' },
                  { label: 'Banned Users', value: users.filter(u => u.banned).length, color: 'var(--warning)' },
                  { label: 'Support Tickets', value: stats?.support?.totalSessions || 0, color: 'var(--info)' },
                  { label: 'Unreplied Tickets', value: stats?.support?.unrepliedSessions || 0, color: 'var(--danger)' },
                ].map(row => (
                  <div key={row.label} className="mfg-stat-row">
                    <span style={{ fontSize: 12, color: 'var(--text2)' }}>{row.label}</span>
                    <span style={{ fontSize: 14, fontWeight: 800, color: row.color }}>{row.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="card">
            <div className="card-title"><Trophy size={16} color="#F59E0B" /> Top 10 Earners</div>
            {topEarners.length === 0 ? (
              <div style={{ textAlign: 'center', padding: 30, color: 'var(--text2)' }}>No data</div>
            ) : topEarners.map((u, i) => (
              <div key={u.id} style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '10px 12px', borderRadius: 10, background: i === 0 ? 'rgba(245,158,11,0.06)' : 'var(--bg2)', border: `1px solid ${i === 0 ? 'rgba(245,158,11,0.2)' : 'var(--border)'}`, marginBottom: 8 }}>
                <div style={{ width: 26, height: 26, borderRadius: 8, background: i < 3 ? ['linear-gradient(135deg,#F59E0B,#FCD34D)', 'linear-gradient(135deg,#9CA3AF,#D1D5DB)', 'linear-gradient(135deg,#B45309,#D97706)'][i] : 'var(--bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: 11, color: i < 3 ? '#fff' : 'var(--text2)', flexShrink: 0 }}>
                  {i + 1}
                </div>
                <Avatar src={u.avatar_img || u.avatar} name={u.name} size={32} style={{ borderRadius: 8 }} />
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 700, fontSize: 13 }}>{u.name}</div>
                  <div style={{ fontSize: 10, color: 'var(--text2)' }}>{u.plan_type || 'No Plan'}</div>
                </div>
                <div style={{ fontWeight: 800, fontSize: 16, color: 'var(--success)' }}>{formatMoney(u.balance || 0)}</div>
              </div>
            ))}
          </div>
        </>
      )}
    </>
  );
}

function AnnouncementsPage({ authFetch, toast, isMain }) {
  const [settings, setSettings] = useState({});
  const [saving, setSaving] = useState(false);
  const [imgUploading, setImgUploading] = useState(false);
  const imgInputRef = useRef(null);

  const load = useCallback(async () => {
    try {
      const r = await authFetch(`${API}/api/admin/settings`);
      const d = await r.json();
      if (r.ok && d.settings) setSettings(d.settings);
    } catch {}
  }, []);

  useEffect(() => { load(); }, [load]);

  const save = async () => {
    setSaving(true);
    try {
      const keys = ['announcement_active', 'announcement_text', 'announcement_type', 'announcement_image', 'login_notice', 'login_notice_active'];
      const filtered = Object.fromEntries(keys.filter(k => k in settings).map(k => [k, settings[k]]));
      const r = await authFetch(`${API}/api/admin/settings`, { method: 'POST', body: JSON.stringify({ settings: filtered }) });
      if (r.ok) { toast('Announcements saved!'); load(); }
      else toast('Failed to save', 'error');
    } catch { toast('Error', 'error'); }
    finally { setSaving(false); }
  };

  const uploadImage = async (file) => {
    if (!file) return;
    setImgUploading(true);
    try {
      const fd = new FormData();
      fd.append('image', file);
      const r = await authFetch(`${API}/api/admin/settings/upload-announcement-image`, { method: 'POST', body: fd, skipContentType: true });
      const d = await r.json();
      if (r.ok && d.url) {
        setSettings(p => ({ ...p, announcement_image: d.url }));
        toast('Image uploaded!', 'success');
      } else toast(d.error || 'Upload failed', 'error');
    } catch { toast('Upload failed', 'error'); }
    finally { setImgUploading(false); }
  };

  const toggle = (key, onVal = '1', offVal = '0') =>
    setSettings(p => ({ ...p, [key]: p[key] === onVal ? offVal : onVal }));

  const annTypes = ['info', 'warning', 'success', 'error'];
  const typeColors = { info: '#2563EB', warning: '#D97706', success: '#059669', error: '#DC2626' };
  const typeIcons = { info: 'ℹ️', warning: '⚠️', success: '✅', error: '❌' };

  const announcementImageFull = settings.announcement_image
    ? (settings.announcement_image.startsWith('http') ? settings.announcement_image : `${API}${settings.announcement_image}`)
    : null;

  return (
    <>
      <div className="page-header">
        <div>
          <h1><Megaphone size={20} style={{ verticalAlign: 'middle', marginRight: 8, color: 'var(--accent)' }} />Announcements</h1>
          <div className="subtitle">Manage banners and notices shown to users in the app</div>
        </div>
        <button className="btn btn-primary btn-sm" onClick={save} disabled={saving}>{saving ? 'Saving...' : '💾 Save All'}</button>
      </div>

      {/* ── App Announcement Banner ── */}
      <div className="card" style={{ borderColor: settings.announcement_active === '1' ? 'rgba(37,99,235,0.35)' : 'var(--border)' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18 }}>
          <div className="card-title" style={{ marginBottom: 0 }}><BellRing size={16} color="var(--accent)" /> App Announcement Banner</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ fontSize: 12, fontWeight: 700, color: settings.announcement_active === '1' ? 'var(--success)' : 'var(--text2)' }}>
              {settings.announcement_active === '1' ? '● LIVE' : '○ OFF'}
            </span>
            <div onClick={() => toggle('announcement_active', '1', '0')}
              style={{ width: 48, height: 26, borderRadius: 13, background: settings.announcement_active === '1' ? 'var(--success)' : 'var(--border)', cursor: 'pointer', position: 'relative', transition: 'background 0.2s', flexShrink: 0 }}>
              <div style={{ width: 20, height: 20, borderRadius: '50%', background: '#fff', position: 'absolute', top: 3, left: settings.announcement_active === '1' ? 25 : 3, transition: 'left 0.2s', boxShadow: '0 1px 4px rgba(0,0,0,0.2)' }} />
            </div>
          </div>
        </div>

        {/* Type selector */}
        <div style={{ marginBottom: 14 }}>
          <label className="input-label">Announcement Type</label>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {annTypes.map(t => (
              <button key={t} onClick={() => setSettings(p => ({ ...p, announcement_type: t }))}
                className="btn btn-sm"
                style={{ background: settings.announcement_type === t ? typeColors[t] : 'transparent', color: settings.announcement_type === t ? '#fff' : typeColors[t], border: `2px solid ${typeColors[t]}`, borderRadius: 8, textTransform: 'capitalize' }}>
                {typeIcons[t]} {t}
              </button>
            ))}
          </div>
        </div>

        {/* Message */}
        <label className="input-label">Announcement Message</label>
        <textarea className="inp" rows={3} placeholder="Enter announcement message for users..." value={settings.announcement_text || ''} onChange={e => setSettings(p => ({ ...p, announcement_text: e.target.value }))} style={{ marginBottom: 14 }} />

        {/* Image Upload */}
        <label className="input-label">📸 Announcement Image (optional)</label>
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14, flexWrap: 'wrap' }}>
          {announcementImageFull ? (
            <div style={{ position: 'relative', flexShrink: 0 }}>
              <img src={announcementImageFull} alt="Announcement" style={{ width: 140, height: 90, objectFit: 'cover', borderRadius: 10, border: '2px solid var(--accent)', display: 'block' }} />
              <button
                onClick={() => setSettings(p => ({ ...p, announcement_image: '' }))}
                style={{ position: 'absolute', top: -8, right: -8, width: 22, height: 22, borderRadius: '50%', background: 'var(--danger)', border: 'none', color: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 700, lineHeight: 1 }}
                title="Remove image"
              >×</button>
            </div>
          ) : (
            <div
              onClick={() => imgInputRef.current?.click()}
              style={{ width: 140, height: 90, borderRadius: 10, border: '2px dashed var(--border)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 6, cursor: 'pointer', background: 'var(--bg2)', flexShrink: 0, transition: 'border-color 0.2s' }}
              onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--accent)'}
              onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border)'}
            >
              <Upload size={20} color="var(--text2)" />
              <span style={{ fontSize: 11, color: 'var(--text2)' }}>{imgUploading ? 'Uploading...' : 'Click to upload'}</span>
            </div>
          )}
          <div style={{ flex: 1, minWidth: 180 }}>
            <div style={{ fontSize: 12, color: 'var(--text2)', lineHeight: 1.7 }}>
              Upload a banner image for the announcement. Supported formats: JPG, PNG, WebP, GIF.<br/>
              Recommended size: <b>1200 × 400px</b> or any wide/banner format.
            </div>
            <div style={{ display: 'flex', gap: 8, marginTop: 10 }}>
              <button className="btn btn-outline btn-sm" onClick={() => imgInputRef.current?.click()} disabled={imgUploading}>
                <Upload size={13} /> {announcementImageFull ? 'Change Image' : 'Upload Image'}
              </button>
              {announcementImageFull && (
                <button className="btn btn-outline btn-sm" style={{ borderColor: 'var(--danger)', color: 'var(--danger)' }} onClick={() => setSettings(p => ({ ...p, announcement_image: '' }))}>
                  Remove
                </button>
              )}
            </div>
          </div>
        </div>
        <input ref={imgInputRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={e => { if (e.target.files?.[0]) uploadImage(e.target.files[0]); e.target.value = ''; }} />

        {/* Live Preview */}
        {settings.announcement_active === '1' && settings.announcement_text && (
          <div style={{ marginTop: 16, borderRadius: 12, overflow: 'hidden', border: `1px solid ${typeColors[settings.announcement_type || 'info']}40` }}>
            <div style={{ fontSize: 11, color: 'var(--text2)', padding: '6px 14px', background: 'var(--bg2)', borderBottom: `1px solid ${typeColors[settings.announcement_type || 'info']}20`, fontWeight: 600 }}>
              LIVE PREVIEW
            </div>
            {announcementImageFull && (
              <img src={announcementImageFull} alt="" style={{ width: '100%', maxHeight: 180, objectFit: 'cover', display: 'block' }} />
            )}
            <div style={{ padding: '12px 16px', background: `${typeColors[settings.announcement_type || 'info']}12`, color: typeColors[settings.announcement_type || 'info'], fontSize: 13, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 8 }}>
              <BellRing size={13} /> {settings.announcement_text}
            </div>
          </div>
        )}
      </div>

      {/* ── Login Screen Notice ── */}
      <div className="card">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18 }}>
          <div className="card-title" style={{ marginBottom: 0 }}><BookOpen size={16} color="var(--warning)" /> Login Screen Notice</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ fontSize: 12, fontWeight: 700, color: settings.login_notice_active === '1' ? 'var(--success)' : 'var(--text2)' }}>
              {settings.login_notice_active === '1' ? '● LIVE' : '○ OFF'}
            </span>
            <div onClick={() => toggle('login_notice_active', '1', '0')}
              style={{ width: 48, height: 26, borderRadius: 13, background: settings.login_notice_active === '1' ? 'var(--success)' : 'var(--border)', cursor: 'pointer', position: 'relative', transition: 'background 0.2s', flexShrink: 0 }}>
              <div style={{ width: 20, height: 20, borderRadius: '50%', background: '#fff', position: 'absolute', top: 3, left: settings.login_notice_active === '1' ? 25 : 3, transition: 'left 0.2s', boxShadow: '0 1px 4px rgba(0,0,0,0.2)' }} />
            </div>
          </div>
        </div>
        <div style={{ fontSize: 12, color: 'var(--text2)', marginBottom: 10, lineHeight: 1.6 }}>
          This notice appears at the top of the login/register screen. Use it to highlight important updates, promotions, or temporary messages.
        </div>
        <label className="input-label">Notice Text</label>
        <textarea className="inp" rows={3} placeholder="e.g. New plan packages launched! Login to see your options." value={settings.login_notice || ''} onChange={e => setSettings(p => ({ ...p, login_notice: e.target.value }))} />
        {settings.login_notice_active === '1' && settings.login_notice && (
          <div style={{ marginTop: 10, padding: '10px 14px', borderRadius: 8, background: 'rgba(252,213,53,0.1)', border: '1px solid rgba(252,213,53,0.3)', fontSize: 13, color: '#D97706', fontWeight: 600 }}>
            ⚡ Preview: {settings.login_notice}
          </div>
        )}
      </div>

      <button className="btn btn-primary btn-full" onClick={save} disabled={saving}>
        {saving ? 'Saving...' : '💾 Save Announcements'}
      </button>
    </>
  );
}

function ActivityLogPage({ authFetch, toast }) {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const r = await authFetch(`${API}/api/admin/activity-log`);
      const d = await r.json();
      if (r.ok) setLogs(d.logs || []);
    } catch {}
    finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  const actionCategories = {
    balance: ['balance', 'credit', 'debit', 'adjust'],
    user: ['ban', 'unban', 'user', 'register', 'plan'],
    finance: ['deposit', 'withdrawal', 'transfer', 'approve', 'reject'],
    settings: ['setting', 'payment', 'config'],
    security: ['login', 'permission', 'admin'],
  };

  const filteredLogs = logs.filter(l => {
    const matchSearch = !search || (l.admin_name || '').toLowerCase().includes(search.toLowerCase()) || (l.action || '').toLowerCase().includes(search.toLowerCase()) || (l.details || '').toLowerCase().includes(search.toLowerCase());
    if (!matchSearch) return false;
    if (filter === 'all') return true;
    const keywords = actionCategories[filter] || [];
    return keywords.some(kw => (l.action || '').toLowerCase().includes(kw) || (l.details || '').toLowerCase().includes(kw));
  });

  const actionColor = (action) => {
    const a = (action || '').toLowerCase();
    if (a.includes('ban') || a.includes('reject') || a.includes('delete')) return 'var(--danger)';
    if (a.includes('approve') || a.includes('credit') || a.includes('unban')) return 'var(--success)';
    if (a.includes('balance') || a.includes('debit')) return 'var(--warning)';
    if (a.includes('login') || a.includes('permission')) return 'var(--info)';
    return 'var(--accent)';
  };

  return (
    <>
      <div className="page-header">
        <div>
          <h1><Clock size={20} style={{ verticalAlign: 'middle', marginRight: 8, color: 'var(--accent)' }} />Activity Log</h1>
          <div className="subtitle">{filteredLogs.length} actions recorded</div>
        </div>
        <button className="btn btn-outline btn-sm" onClick={load}><RefreshCw size={14} /></button>
      </div>

      <div className="card" style={{ padding: '14px 16px', marginBottom: 16 }}>
        <div style={{ display: 'flex', gap: 10, alignItems: 'center', marginBottom: 10 }}>
          <Search size={15} color="var(--text2)" style={{ flexShrink: 0 }} />
          <input className="inp" style={{ marginBottom: 0 }} placeholder="Search by admin, action, or details..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <div className="filter-bar" style={{ marginBottom: 0 }}>
          {['all', 'balance', 'user', 'finance', 'settings', 'security'].map(f => (
            <button key={f} className={`btn btn-sm ${filter === f ? 'btn-primary' : 'btn-outline'}`} onClick={() => setFilter(f)} style={{ textTransform: 'capitalize' }}>{f}</button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="card" style={{ textAlign: 'center', padding: 60, color: 'var(--text2)' }}>Loading...</div>
      ) : filteredLogs.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: 60, color: 'var(--text2)' }}>
          <Clock size={40} style={{ opacity: 0.2, marginBottom: 12 }} />
          <div>No activity found</div>
        </div>
      ) : (
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          {filteredLogs.slice(0, 200).map((l, i) => (
            <div key={l.id || i} className="activity-row" style={{ padding: '12px 20px' }}>
              <div className="activity-dot" style={{ background: actionColor(l.action) }} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                  <span style={{ fontWeight: 700, fontSize: 13, color: 'var(--accent)' }}>{l.admin_name || 'Admin'}</span>
                  <span style={{ fontSize: 12, fontWeight: 600, color: actionColor(l.action) }}>{l.action}</span>
                  {l.details && <span style={{ fontSize: 11, color: 'var(--text2)', wordBreak: 'break-word' }}>— {l.details}</span>}
                </div>
              </div>
              <div style={{ fontSize: 11, color: 'var(--text2)', flexShrink: 0, whiteSpace: 'nowrap' }}>{fmtDate(l.created_at)}</div>
            </div>
          ))}
        </div>
      )}
    </>
  );
}

/* ─────────────────────────────────────────────────────────────────────────────
   MAIN APP SHELL
───────────────────────────────────────────────────────────────────────────── */
export default function App() {
  const [token, setToken] = useState(() => localStorage.getItem('admin_token') || '');
  const [adminUser, setAdminUser] = useState(null);
  const [adminPerms, setAdminPerms] = useState({});
  const [page, setPage] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [toasts, setToasts] = useState([]);
  const [notifOpen, setNotifOpen] = useState(false);
  const [pendingCount, setPendingCount] = useState(0);
  const prevPendingRef = useRef(null);
  const [adminCurrency, setAdminCurrency] = useState(() => localStorage.getItem('admin-currency') || 'bdt');
  const [adminLang, setAdminLang] = useState(() => localStorage.getItem('admin-lang') || 'en');
  const [treasuryBalance, setTreasuryBalance] = useState(null);

  const toast = (msg, type = 'success') => {
    const id = Date.now();
    setToasts(p => [...p, { id, msg, type }]);
    setTimeout(() => setToasts(p => p.filter(t => t.id !== id)), 3000);
  };

  const authFetch = async (url, opts = {}) => {
    const isFormData = opts.body instanceof FormData;
    const baseHeaders = isFormData ? {} : { 'Content-Type': 'application/json' };
    const headers = { ...baseHeaders, ...(opts.headers || {}), ...(token ? { Authorization: `Bearer ${token}` } : {}) };
    const { skipContentType, ...restOpts } = opts;
    const res = await fetch(url, { ...restOpts, headers });
    if (res.status === 401) { localStorage.removeItem('admin_token'); setToken(''); setAdminUser(null); }
    return res;
  };

  useEffect(() => {
    if (!token) return;
    authFetch(`${API}/api/me`).then(r => r.json()).then(d => {
      if (d.user && d.user.is_admin) {
        setAdminUser(d.user);
        initAdminPush(token);
        if (!d.user.is_main_admin) {
          authFetch(`${API}/api/admin/my-permissions`).then(r => r.json()).then(pd => {
            if (pd.permissions) setAdminPerms(pd.permissions);
          }).catch(() => {});
        } else {
          setAdminPerms({ _isMain: true });
        }
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
        if (prevPendingRef.current !== null && n > prevPendingRef.current) playNotifSound();
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

  const canAccess = (item) => {
    if (isMain) return true;
    if (item.mainOnly) return false;
    if (!item.perm) return true;
    if (Array.isArray(item.perm)) return item.perm.some(p => !!adminPerms[p]);
    return !!adminPerms[item.perm];
  };

  const NAV_GROUPS = [
    {
      label: 'Overview',
      items: [
        { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, perm: 'view_reports' },
      ],
    },
    {
      label: 'Users',
      items: [
        { id: 'users', label: 'User Management', icon: Users, perm: 'view_users' },
        { id: 'pending-regs', label: 'Recent Registrations', icon: UserPlus, perm: 'view_users' },
        { id: 'referrals', label: 'Referral Network', icon: Network, perm: 'view_users' },
      ],
    },
    {
      label: 'Finance',
      items: [
        { id: 'finance', label: 'Transactions', icon: CreditCard, perm: ['approve_deposits', 'approve_withdrawals'] },
        { id: 'wallet', label: 'Wallet Control', icon: Wallet, perm: 'edit_user_balance' },
        { id: 'payment-settings', label: 'Payment Accounts', icon: Layers, perm: ['modify_payment_numbers', 'modify_wallet_addresses'] },
      ],
    },
    {
      label: 'Engagement',
      items: [
        { id: 'support', label: 'Support Center', icon: MessageSquare, perm: 'access_support' },
        { id: 'admin-chat', label: 'Admin Chat', icon: MessageCircle, perm: null },
        { id: 'notifications', label: 'Notifications', icon: Bell, perm: null },
        { id: 'announcements', label: 'Announcements', icon: Megaphone, perm: 'change_settings' },
      ],
    },
    {
      label: 'Security',
      items: [
        { id: 'flagged', label: 'Flagged Activity', icon: Flag, mainOnly: true },
        { id: 'ip-tracking', label: 'IP Tracking', icon: Globe, mainOnly: true },
        { id: 'live-locations', label: 'Live Locations', icon: MapPin, mainOnly: true },
      ],
    },
    {
      label: 'Operations',
      items: [
        { id: 'controls', label: 'Quick Controls', icon: Zap, mainOnly: true },
        { id: 'manufacturing', label: 'Manufacturing Stats', icon: Factory, perm: 'view_reports' },
      ],
    },
    {
      label: 'System',
      items: [
        { id: 'settings', label: 'App Settings', icon: Settings, mainOnly: true },
        { id: 'admins', label: 'Admin & Roles', icon: Shield, mainOnly: true },
        { id: 'activity-log', label: 'Activity Log', icon: Clock, mainOnly: true },
      ],
    },
  ];

  const allItems = NAV_GROUPS.flatMap(g => g.items);
  const currentItem = allItems.find(i => i.id === page);
  const currentGroup = NAV_GROUPS.find(g => g.items.some(i => i.id === page));

  const navigate = (id) => {
    const item = allItems.find(i => i.id === id);
    if (item && !canAccess(item)) return;
    setPage(id);
    setSidebarOpen(false);
  };

  const pageLabels = Object.fromEntries(allItems.map(i => [i.id, i.label]));

  return (
    <div className="app-layout">
      <MfgBackground />
      <Toast toasts={toasts} />
      <AdminNotifPanel
        open={notifOpen}
        onClose={() => setNotifOpen(false)}
        authFetch={authFetch}
        onNavigate={(p) => { setPage(p); setSidebarOpen(false); }}
        adminUser={adminUser}
        lang={adminLang}
      />

      <div className="hamburger" onClick={() => setSidebarOpen(p => !p)}><Menu size={20} /></div>
      <div className={`sidebar-overlay ${sidebarOpen ? 'open' : ''}`} onClick={() => setSidebarOpen(false)} />

      {/* ── DARK SIDEBAR ── */}
      <aside className={`sidebar ${sidebarOpen ? 'open' : ''}`}>
        <div className="sidebar-header">
          <div className="sidebar-brand">
            <div className="sidebar-brand-icon">
              <Cpu size={20} color="#fff" />
            </div>
            <div>
              <h2>PhoneCraft</h2>
              <div className="user-info">Admin Console</div>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 4 }}>
            <div className="sidebar-admin-badge">
              <Shield size={9} />
              {isMain ? 'Main Admin' : 'Sub Admin'}
            </div>
          </div>
          <div className="sidebar-admin-name">{adminUser.name}</div>
        </div>

        <nav className="sidebar-nav">
          {NAV_GROUPS.map(group => {
            const visibleItems = isMain ? group.items : group.items.filter(item => {
              if (item.mainOnly) return true;
              return true;
            });
            return (
              <div key={group.label} className="nav-group">
                <div className="nav-section-label">{group.label}</div>
                {visibleItems.map(item => {
                  const Icon = item.icon;
                  const accessible = canAccess(item);
                  const isActive = page === item.id;
                  const isPending = item.id === 'finance' && pendingCount > 0;
                  const isSupportPending = item.id === 'support' && pendingCount > 0;
                  return (
                    <div
                      key={item.id}
                      className={`nav-item ${isActive ? 'active' : ''} ${!accessible ? 'locked' : ''}`}
                      onClick={() => accessible && navigate(item.id)}
                      title={!accessible ? (item.mainOnly ? 'Main admin only' : 'Permission required') : item.label}
                    >
                      <Icon size={16} className="nav-icon" />
                      <span className="nav-label">{item.label}</span>
                      {!accessible && <Lock size={11} className="nav-lock-icon" />}
                      {accessible && isPending && <span className="badge-count">{pendingCount > 9 ? '9+' : pendingCount}</span>}
                      {accessible && isSupportPending && !isPending && <span className="badge-count">!</span>}
                    </div>
                  );
                })}
              </div>
            );
          })}
        </nav>

        <div className="sidebar-footer">
          {isMain && treasuryBalance !== null && (
            <div onClick={() => { setPage('dashboard'); setSidebarOpen(false); }}
              style={{ padding: '8px 12px', borderRadius: 9, background: 'rgba(14,203,129,0.12)', border: '1px solid rgba(14,203,129,0.2)', cursor: 'pointer', marginBottom: 6 }}>
              <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: 1 }}>Treasury</div>
              <div style={{ fontWeight: 800, fontSize: 16, color: '#0ECB81' }}>{formatMoney(treasuryBalance)}</div>
            </div>
          )}
          <div className="nav-item logout-btn" onClick={logout}>
            <LogOut size={16} className="nav-icon" />
            <span className="nav-label">Logout</span>
          </div>
        </div>
      </aside>

      {/* ── MAIN CONTENT ── */}
      <main className="main-content" onClick={() => sidebarOpen && setSidebarOpen(false)}>
        <div className="admin-topbar">
          <div className="topbar-left">
            <div className="topbar-breadcrumb">
              {currentGroup && (
                <>
                  <span className="topbar-section">{currentGroup.label}</span>
                  <span className="topbar-sep">/</span>
                </>
              )}
              <span className="topbar-page-title">{pageLabels[page] || page}</span>
            </div>
            {!isMain && currentItem && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '3px 8px', borderRadius: 6, background: canAccess(currentItem) ? 'rgba(5,150,105,0.1)' : 'rgba(220,38,38,0.1)', border: `1px solid ${canAccess(currentItem) ? 'rgba(5,150,105,0.2)' : 'rgba(220,38,38,0.2)'}`, fontSize: 10, fontWeight: 700, color: canAccess(currentItem) ? '#059669' : '#DC2626' }}>
                {canAccess(currentItem) ? <><ShieldCheck size={10} /> Access Granted</> : <><Lock size={10} /> Restricted</>}
              </div>
            )}
          </div>
          <div className="topbar-right">
            <div style={{ display: 'flex', gap: 2, background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 8, padding: 2 }}>
              <button onClick={() => { setAdminLang('en'); localStorage.setItem('admin-lang', 'en'); }} style={{ background: adminLang === 'en' ? 'var(--accent)' : 'none', color: adminLang === 'en' ? '#fff' : 'var(--text2)', border: 'none', borderRadius: 6, padding: '3px 8px', cursor: 'pointer', fontWeight: 700, fontSize: 11 }}>EN</button>
              <button onClick={() => { setAdminLang('bn'); localStorage.setItem('admin-lang', 'bn'); }} style={{ background: adminLang === 'bn' ? 'var(--accent)' : 'none', color: adminLang === 'bn' ? '#fff' : 'var(--text2)', border: 'none', borderRadius: 6, padding: '3px 8px', cursor: 'pointer', fontWeight: 700, fontSize: 11 }}>বাং</button>
            </div>
            <button onClick={toggleCurrency} title={adminCurrency === 'bdt' ? 'Switch to USD' : 'Switch to BDT'}
              style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 8, padding: '4px 10px', cursor: 'pointer', fontWeight: 700, fontSize: 13, color: adminCurrency === 'usd' ? '#22C55E' : '#F59E0B', display: 'flex', alignItems: 'center', gap: 4 }}>
              {adminCurrency === 'bdt' ? '৳ BDT' : '$ USD'}
            </button>
            <div className="topbar-icon-btn" onClick={(e) => { e.stopPropagation(); setNotifOpen(p => !p); }} title="Alerts">
              <Bell size={18} />
              {pendingCount > 0 && <span className="topbar-badge">{pendingCount > 9 ? '9+' : pendingCount}</span>}
            </div>
            <div style={{ width: 34, height: 34, borderRadius: 10, background: isMain ? 'linear-gradient(135deg,#1E40AF,#3B82F6)' : 'linear-gradient(135deg,#7C3AED,#8B5CF6)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 14, fontWeight: 800, cursor: 'pointer' }}
              title={`${adminUser.name} · ${isMain ? 'Main Admin' : 'Sub Admin'}`}>
              {adminUser.name?.[0]?.toUpperCase() || 'A'}
            </div>
          </div>
        </div>

        {/* ── SUB-ADMIN ACCESS MATRIX (shown on admins page for main admin) ── */}
        {page === 'dashboard' && <DashboardPage authFetch={authFetch} toast={toast} isMain={isMain} treasuryBalance={treasuryBalance} refreshTreasury={refreshTreasury} />}
        {page === 'users' && <UsersPage authFetch={authFetch} toast={toast} isMain={isMain} adminUser={adminUser} adminPerms={adminPerms} />}
        {page === 'pending-regs' && <PendingRegistrationsPage authFetch={authFetch} toast={toast} isMain={isMain} />}
        {page === 'referrals' && <ReferralNetworkPage authFetch={authFetch} toast={toast} />}
        {page === 'finance' && <FinancePage authFetch={authFetch} toast={toast} isMain={isMain} adminPerms={adminPerms} />}
        {page === 'wallet' && <WalletManagementPage authFetch={authFetch} toast={toast} isMain={isMain} />}
        {page === 'payment-settings' && <PaymentSettingsPage authFetch={authFetch} toast={toast} adminPerms={isMain ? { modify_payment_numbers: true, modify_wallet_addresses: true } : adminPerms} />}
        {page === 'support' && <SupportPage authFetch={authFetch} toast={toast} />}
        {page === 'admin-chat' && <AdminChatPage authFetch={authFetch} toast={toast} adminUser={adminUser} />}
        {page === 'notifications' && <NotificationsPage authFetch={authFetch} toast={toast} token={token} />}
        {page === 'announcements' && <AnnouncementsPage authFetch={authFetch} toast={toast} isMain={isMain} />}
        {page === 'flagged' && <FlaggedPage authFetch={authFetch} toast={toast} />}
        {page === 'ip-tracking' && <IpTrackingPage authFetch={authFetch} toast={toast} />}
        {page === 'live-locations' && <LiveLocationsPage authFetch={authFetch} toast={toast} />}
        {page === 'controls' && <ControlsPage authFetch={authFetch} toast={toast} />}
        {page === 'manufacturing' && <ManufacturingPage authFetch={authFetch} toast={toast} />}
        {page === 'settings' && <SettingsPage authFetch={authFetch} toast={toast} />}
        {page === 'admins' && <AdminsPage authFetch={authFetch} toast={toast} adminUser={adminUser} navGroups={NAV_GROUPS} />}
        {page === 'activity-log' && <ActivityLogPage authFetch={authFetch} toast={toast} />}
      </main>
    </div>
  );
}

function LoginScreen({ onLogin }) {
  const [id, setId] = useState('');
  const [pw, setPw] = useState('');
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState('');
  const [preToken, setPreToken] = useState('');
  const [totpCode, setTotpCode] = useState('');

  const login = async (e) => {
    e.preventDefault();
    setLoading(true); setErr('');
    try {
      const res = await fetch(`${API}/api/admin/login`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identifier: id, password: pw }),
      });
      const data = await res.json();
      if (res.ok && data.requires2FA && data.preToken) {
        setPreToken(data.preToken);
      } else if (res.ok && data.token && data.user?.is_admin) {
        onLogin(data.token, data.user);
      } else {
        setErr(data.error || 'Invalid credentials');
      }
    } catch { setErr('Connection error'); }
    finally { setLoading(false); }
  };

  const verify2FA = async (e) => {
    e.preventDefault();
    setLoading(true); setErr('');
    try {
      const res = await fetch(`${API}/api/admin/2fa/verify-login`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ preToken, totpCode: totpCode.replace(/\s/g, '') }),
      });
      const data = await res.json();
      if (res.ok && data.token && data.user?.is_admin) {
        onLogin(data.token, data.user);
      } else {
        setErr(data.error || 'Invalid code');
        if (res.status === 401 && data.error?.includes('expired')) {
          setPreToken('');
          setTotpCode('');
        }
      }
    } catch { setErr('Connection error'); }
    finally { setLoading(false); }
  };

  if (preToken) {
    return (
      <div className="login-container">
        <MfgBackground />
        <form className="login-box" onSubmit={verify2FA}>
          <div className="login-logo">
            <div className="login-logo-icon"><Shield size={22} color="#fff" /></div>
          </div>
          <h1>2-Factor Auth</h1>
          <p className="subtitle">Enter the code from your authenticator app</p>
          {err && (
            <div style={{ background: 'rgba(220,38,38,0.07)', border: '1px solid rgba(220,38,38,0.2)', borderRadius: 10, padding: '10px 14px', color: 'var(--danger)', fontSize: 12, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
              <AlertTriangle size={14} /> {err}
            </div>
          )}
          <label className="input-label">6-Digit Code</label>
          <input
            className="inp"
            value={totpCode}
            onChange={e => setTotpCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
            placeholder="000000"
            autoFocus
            maxLength={6}
            inputMode="numeric"
            style={{ letterSpacing: 6, fontSize: 22, textAlign: 'center', fontWeight: 700 }}
          />
          <button className="btn btn-primary btn-full" type="submit" disabled={loading || totpCode.length < 6} style={{ marginTop: 8 }}>
            <Lock size={14} /> {loading ? 'Verifying...' : 'Verify Code'}
          </button>
          <button type="button" className="btn btn-outline btn-full" style={{ marginTop: 8 }} onClick={() => { setPreToken(''); setTotpCode(''); setErr(''); }}>
            ← Back to Login
          </button>
          <div style={{ marginTop: 12, textAlign: 'center', fontSize: 11, color: 'var(--text2)' }}>
            Code expires in 5 minutes
          </div>
        </form>
      </div>
    );
  }

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

const METHOD_META = {
  bkash:  { color: '#E2136E', bg: '#fce8f3', label: 'bKash',  char: 'b' },
  nagad:  { color: '#F7941D', bg: '#fef3e2', label: 'Nagad',  char: 'N' },
  rocket: { color: '#8B2252', bg: '#f5e8f0', label: 'Rocket', char: 'R', img: `${import.meta.env.BASE_URL}rocket-logo.png` },
  crypto: { color: '#F7931A', bg: '#fef6e8', label: 'Crypto', char: '₿', img: `${import.meta.env.BASE_URL}crypto-logo.png` },
};

function MethodIcon({ method }) {
  const key = method?.toLowerCase();
  const m = METHOD_META[key];
  if (!m) return <div style={{ width: 28, height: 28, borderRadius: '50%', background: '#eee', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700, color: '#888', flexShrink: 0 }}>{method?.[0]?.toUpperCase() || '?'}</div>;
  if (m.img) return <img src={m.img} alt={m.label} style={{ width: 28, height: 28, borderRadius: '50%', objectFit: 'cover', border: `2px solid ${m.color}22`, flexShrink: 0 }} />;
  return <div style={{ width: 28, height: 28, borderRadius: '50%', background: m.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 800, color: m.color, border: `2px solid ${m.color}33`, flexShrink: 0 }}>{m.char}</div>;
}

function DashboardPage({ authFetch, toast, isMain, treasuryBalance, refreshTreasury }) {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [bkModal, setBkModal] = useState(null);

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

  if (loading || !stats) return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: 300, gap: 14 }}>
      <div style={{ width: 36, height: 36, borderRadius: '50%', border: '3px solid var(--accent)', borderTopColor: 'transparent', animation: 'spin 0.8s linear infinite' }} />
      <div style={{ color: 'var(--text2)', fontSize: 14 }}>Loading dashboard...</div>
    </div>
  );

  const profitPositive = (stats.profitLoss || 0) >= 0;

  return (
    <>
      <div className="page-header">
        <div>
          <h1>Dashboard</h1>
          <div className="subtitle">Platform overview — {new Date().toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</div>
        </div>
        <button className="btn btn-outline btn-sm" onClick={load}><RefreshCw size={14} /> Refresh</button>
      </div>

      {/* ── Hero KPI Row ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 12, marginBottom: 20 }}>
        {[
          { label: 'Total Users', value: stats.totalUsers || 0, color: 'var(--accent)', icon: '👥', fmt: 'int' },
          { label: 'Active Today', value: stats.activeToday || 0, color: '#60a5fa', icon: '⚡', fmt: 'int' },
          { label: 'New Today', value: stats.newUsersToday || 0, color: 'var(--success)', icon: '✨', fmt: 'int' },
          { label: 'Total Deposits', value: stats.deposits?.sum || 0, color: 'var(--success)', icon: '💰', fmt: 'money' },
          { label: 'Total Withdrawals', value: stats.withdrawals?.sum || 0, color: 'var(--danger)', icon: '💸', fmt: 'money' },
          { label: 'Net Profit', value: stats.profitLoss || 0, color: profitPositive ? 'var(--success)' : 'var(--danger)', icon: profitPositive ? '📈' : '📉', fmt: 'money', prefix: profitPositive ? '+' : '' },
        ].map(({ label, value, color, icon, fmt, prefix = '' }) => (
          <div key={label} className="card" style={{ padding: '16px 18px', display: 'flex', flexDirection: 'column', gap: 6 }}>
            <div style={{ fontSize: 20 }}>{icon}</div>
            <div style={{ fontSize: fmt === 'money' ? (value > 99999 ? 18 : 22) : 28, fontWeight: 900, color, lineHeight: 1.1 }}>
              {prefix}{fmt === 'money' ? formatMoney(value) : value.toLocaleString()}
            </div>
            <div style={{ fontSize: 11, color: 'var(--text2)', fontWeight: 600, letterSpacing: 0.3 }}>{label}</div>
          </div>
        ))}
      </div>

      {/* ── Treasury + Pending Row ── */}
      <div className="grid-2" style={{ marginBottom: 20 }}>
        {isMain && treasuryBalance !== null && (
          <div className="card" style={{ borderColor: 'rgba(14,203,129,0.35)', background: 'linear-gradient(135deg,rgba(14,203,129,0.06),transparent)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
              <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#0ECB81' }} />
              <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text2)', letterSpacing: 0.5, textTransform: 'uppercase' }}>Admin Treasury</div>
            </div>
            <div style={{ fontSize: 34, fontWeight: 900, color: '#0ECB81', lineHeight: 1 }}>{formatMoney(treasuryBalance)}</div>
            <div style={{ fontSize: 12, color: 'var(--text2)', marginTop: 6 }}>≈ {formatMoneyUSD(treasuryBalance)} USD</div>
            <div style={{ fontSize: 11, color: 'var(--text2)', marginTop: 6, lineHeight: 1.5 }}>
              Deposits credit, approved withdrawals debit
            </div>
            <button className="btn btn-outline btn-sm" style={{ marginTop: 12, width: 'fit-content' }} onClick={refreshTreasury}><RefreshCw size={12} /> Refresh</button>
          </div>
        )}

        <div className="card" style={{ borderColor: 'rgba(252,213,53,0.3)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
            <Clock size={15} color="var(--warning)" />
            <div style={{ fontSize: 13, fontWeight: 700 }}>Pending Approvals</div>
          </div>
          <div className="grid-2" style={{ gap: 10 }}>
            <div style={{ padding: '14px 12px', borderRadius: 12, background: 'rgba(14,203,129,0.07)', border: '1px solid rgba(14,203,129,0.18)', textAlign: 'center' }}>
              <div style={{ fontSize: 36, fontWeight: 900, color: 'var(--success)', lineHeight: 1 }}>{stats.pendingDeposits || 0}</div>
              <div style={{ fontSize: 11, color: 'var(--text2)', marginTop: 4, fontWeight: 600 }}>Deposits</div>
            </div>
            <div style={{ padding: '14px 12px', borderRadius: 12, background: 'rgba(246,70,93,0.07)', border: '1px solid rgba(246,70,93,0.18)', textAlign: 'center' }}>
              <div style={{ fontSize: 36, fontWeight: 900, color: 'var(--danger)', lineHeight: 1 }}>{stats.pendingWithdrawals || 0}</div>
              <div style={{ fontSize: 11, color: 'var(--text2)', marginTop: 4, fontWeight: 600 }}>Withdrawals</div>
            </div>
          </div>
          {((stats.pendingDeposits || 0) + (stats.pendingWithdrawals || 0)) > 0 && (
            <div style={{ marginTop: 10, padding: '7px 10px', borderRadius: 8, background: 'rgba(252,213,53,0.08)', border: '1px solid rgba(252,213,53,0.2)', fontSize: 11, color: '#D97706', fontWeight: 600 }}>
              ⚡ {(stats.pendingDeposits || 0) + (stats.pendingWithdrawals || 0)} requests awaiting your review
            </div>
          )}
        </div>

        {!isMain && (
          <div className="card">
            <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 12, color: 'var(--text2)' }}>Platform Summary</div>
            <div className="grid-2" style={{ gap: 10 }}>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 28, fontWeight: 900, color: 'var(--success)' }}>{formatMoney(stats.deposits?.sum || 0)}</div>
                <div style={{ fontSize: 11, color: 'var(--text2)' }}>Total Deposits</div>
              </div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 28, fontWeight: 900, color: 'var(--danger)' }}>{formatMoney(stats.withdrawals?.sum || 0)}</div>
                <div style={{ fontSize: 11, color: 'var(--text2)' }}>Total Withdrawals</div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ── Support + Plan Distribution ── */}
      <div className="grid-2" style={{ marginBottom: 20 }}>
        {stats.support && (
          <div className="card">
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
              <MessageSquare size={15} color="var(--info)" />
              <div style={{ fontSize: 13, fontWeight: 700 }}>Support Center</div>
            </div>
            <div style={{ display: 'flex', gap: 0 }}>
              {[
                { val: stats.support.totalSessions, label: 'Sessions', color: '#60a5fa' },
                { val: stats.support.unrepliedSessions, label: 'Unanswered', color: 'var(--danger)' },
                { val: stats.support.adminReplies, label: 'Replies', color: 'var(--success)' },
              ].map(({ val, label, color }, i) => (
                <div key={label} style={{ flex: 1, textAlign: 'center', padding: '12px 6px', borderRight: i < 2 ? '1px solid var(--border)' : 'none' }}>
                  <div style={{ fontSize: 26, fontWeight: 900, color }}>{val}</div>
                  <div style={{ fontSize: 10, color: 'var(--text2)', marginTop: 2, fontWeight: 600 }}>{label}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {stats.planDistribution?.length > 0 && (
          <div className="card">
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
              <BarChart2 size={15} />
              <div style={{ fontSize: 13, fontWeight: 700 }}>Plan Distribution</div>
            </div>
            {stats.planDistribution.map((p, i) => {
              const total = stats.planDistribution.reduce((s, x) => s + x.count, 0) || 1;
              const pct = Math.round((p.count / total) * 100);
              return (
                <div key={i} style={{ marginBottom: 9 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, marginBottom: 3 }}>
                    <span style={{ fontWeight: 700, color: p.color }}>{p.name}</span>
                    <span style={{ color: 'var(--text2)' }}>{p.count} users ({pct}%)</span>
                  </div>
                  <div className="progress-bar" style={{ height: 6 }}><div className="progress-bar-fill" style={{ width: `${pct}%`, background: p.color }} /></div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ── Analytics Chart ── */}
      <AnalyticsChart authFetch={authFetch} />

      {/* ── Top Earners + Recent Activity ── */}
      <div className="grid-2" style={{ marginTop: 20 }}>
        {stats.topEarners?.filter(u => (u.earned || 0) > 0).length > 0 && (
          <div className="card">
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
              <Trophy size={15} color="var(--warning)" />
              <div style={{ fontSize: 13, fontWeight: 700 }}>Top Earners</div>
              <span style={{ fontSize: 10, color: 'var(--text2)', marginLeft: 'auto' }}>Task + Referral</span>
            </div>
            {stats.topEarners.filter(u => (u.earned || 0) > 0).slice(0, 8).map((u, i) => (
              <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '9px 10px', borderRadius: 8, background: i % 2 === 0 ? 'var(--bg2)' : 'transparent', marginBottom: 2 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <span style={{ fontWeight: 900, fontSize: 15, color: i === 0 ? '#FFD700' : i === 1 ? '#C0C0C0' : i === 2 ? '#CD7F32' : 'var(--text2)', minWidth: 22 }}>
                    {i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `#${i + 1}`}
                  </span>
                  <span style={{ fontWeight: 600, fontSize: 13 }}>{u.name}</span>
                </div>
                <span style={{ fontWeight: 700, color: 'var(--success)', fontSize: 13 }}>{formatMoney(u.earned)}</span>
              </div>
            ))}
          </div>
        )}

        {stats.recentActivity?.length > 0 && (
          <div className="card">
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
              <Activity size={15} />
              <div style={{ fontSize: 13, fontWeight: 700 }}>Recent Activity</div>
            </div>
            <div style={{ overflowY: 'auto', maxHeight: 340 }}>
              {stats.recentActivity.slice(0, 12).map((a, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 8, padding: '8px 0', borderBottom: '1px solid var(--border)', fontSize: 12 }}>
                  <span style={{ fontSize: 15, marginTop: 1, flexShrink: 0 }}>
                    {a.type === 'signup' ? '👤' : a.type === 'deposit' ? '💰' : '💸'}
                  </span>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 5, flexWrap: 'wrap' }}>
                      <span style={{ fontWeight: 700 }}>{a.user_name}</span>
                      <span style={{ fontSize: 10, color: 'var(--text2)' }}>#{a.user_id}</span>
                    </div>
                    {a.type === 'signup' ? (
                      <div style={{ fontSize: 11, color: 'var(--text2)', marginTop: 1 }}>
                        Joined {a.plan_name ? `· ${a.plan_name} plan` : ''}
                        {a.referrer_name ? ` · Ref: ${a.referrer_name}` : ''}
                      </div>
                    ) : (
                      <div style={{ fontSize: 11, marginTop: 1 }}>
                        <span style={{ color: a.type === 'deposit' ? 'var(--success)' : 'var(--danger)', fontWeight: 700 }}>
                          {a.type === 'deposit' ? '+' : '-'}৳{Number(a.amount).toLocaleString()}
                        </span>
                        <span style={{ color: 'var(--text2)' }}> via {a.method}</span>
                      </div>
                    )}
                  </div>
                  <span style={{ color: 'var(--text2)', fontSize: 10, whiteSpace: 'nowrap', flexShrink: 0 }}>{fmtDate(a.created_at)}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* ── Payment Method Breakdown ── */}
      {stats.methodBreakdown?.length > 0 && (
        <div className="card" style={{ marginTop: 20 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
            <CreditCard size={15} />
            <div style={{ fontSize: 13, fontWeight: 700 }}>Payment Method Breakdown</div>
            <span style={{ fontSize: 10, color: 'var(--text2)', marginLeft: 'auto' }}>Click a row to see transactions</span>
          </div>
          <div className="table-wrap">
            <table>
              <thead><tr><th>Method</th><th>Type</th><th>Count</th><th>Total</th><th></th></tr></thead>
              <tbody>
                {stats.methodBreakdown.map((m, i) => (
                  <tr key={i} style={{ cursor: 'pointer' }} onClick={async () => {
                    setBkModal({ method: m.method, type: m.type, loading: true, txList: [] });
                    try {
                      const r = await authFetch(`${API}/api/admin/transactions`);
                      const d = await r.json();
                      const filtered = (d.transactions || []).filter(t => t.method?.toLowerCase() === m.method?.toLowerCase() && t.type === m.type);
                      setBkModal({ method: m.method, type: m.type, loading: false, txList: filtered });
                    } catch { setBkModal(prev => prev ? { ...prev, loading: false, error: true } : null); }
                  }}>
                    <td><div style={{ display: 'flex', alignItems: 'center', gap: 8 }}><MethodIcon method={m.method} /><span style={{ fontWeight: 700, fontSize: 13 }}>{METHOD_META[m.method?.toLowerCase()]?.label || m.method?.toUpperCase()}</span></div></td>
                    <td><span className={`badge ${m.type === 'deposit' ? 'badge-green' : 'badge-red'}`}>{m.type}</span></td>
                    <td>{m.count}</td>
                    <td style={{ fontWeight: 700, color: m.type === 'deposit' ? 'var(--success)' : 'var(--danger)' }}>{formatMoney(m.total)}</td>
                    <td style={{ color: 'var(--text2)' }}><ChevronRight size={14} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {bkModal && (
        <div className="modal-overlay" onClick={() => setBkModal(null)}>
          <div className="modal" style={{ maxWidth: 640 }} onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2 style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <MethodIcon method={bkModal.method} />
                {METHOD_META[bkModal.method?.toLowerCase()]?.label || bkModal.method?.toUpperCase()}
                <span className={`badge ${bkModal.type === 'deposit' ? 'badge-green' : 'badge-red'}`}>{bkModal.type}</span>
                <span style={{ fontSize: 13, fontWeight: 400, color: 'var(--text2)' }}>— Transactions</span>
              </h2>
              <button className="btn btn-outline btn-sm" onClick={() => setBkModal(null)}><X size={16} /></button>
            </div>
            {bkModal.loading ? (
              <div style={{ textAlign: 'center', padding: 32, color: 'var(--text2)' }}>Loading...</div>
            ) : bkModal.error ? (
              <div style={{ textAlign: 'center', padding: 32, color: 'var(--danger)' }}>Failed to load</div>
            ) : bkModal.txList.length === 0 ? (
              <div style={{ textAlign: 'center', padding: 32, color: 'var(--text2)' }}>No transactions found</div>
            ) : (
              <div style={{ maxHeight: '60vh', overflowY: 'auto' }}>
                {bkModal.txList.map(tx => (
                  <div key={tx.id} style={{ padding: '12px 16px', borderBottom: '1px solid var(--border)', display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                    <div style={{ flexShrink: 0, marginTop: 2 }}><MethodIcon method={tx.method} /></div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap', marginBottom: 3 }}>
                        <span style={{ fontWeight: 600, fontSize: 13 }}>{tx.user_name}</span>
                        <span style={{ fontSize: 10, background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: 3, padding: '0 4px', color: 'var(--text2)' }}>#{tx.user_id}</span>
                        <span style={{ fontSize: 13, fontWeight: 700, color: bkModal.type === 'deposit' ? 'var(--success)' : 'var(--danger)', marginLeft: 'auto' }}>
                          {bkModal.type === 'deposit' ? '+' : '-'}৳{Number(tx.amount).toLocaleString()}
                        </span>
                      </div>
                      <div style={{ fontSize: 11, color: 'var(--text2)', lineHeight: 1.7 }}>
                        {bkModal.method?.toLowerCase() === 'crypto' ? (
                          <>
                            {tx.blockchain && <span>🔗 {tx.blockchain}{tx.token ? ` · ${tx.token}` : ''} &nbsp;</span>}
                            {tx.account && <div style={{ wordBreak: 'break-all' }}>📍 {tx.account}</div>}
                            {tx.txn_hash && <div style={{ wordBreak: 'break-all', marginTop: 1 }}>🧾 Hash: <span style={{ fontFamily: 'monospace', fontSize: 10 }}>{tx.txn_hash}</span></div>}
                          </>
                        ) : (
                          <span>📱 {tx.account}</span>
                        )}
                        <div style={{ marginTop: 2, display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
                          <span className={`badge ${tx.status === 'approved' ? 'badge-green' : tx.status === 'rejected' ? 'badge-red' : 'badge-yellow'}`} style={{ fontSize: 10 }}>{tx.status}</span>
                          <span>{fmtDate(tx.created_at)}</span>
                          {tx.admin_note && <span>📝 {tx.admin_note}</span>}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}

function UsersPage({ authFetch, toast, isMain, adminUser, adminPerms }) {
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
  const [msgUserName, setMsgUserName] = useState('');
  const [msgSearch, setMsgSearch] = useState('');
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
    const match = !q || u.name.toLowerCase().includes(q) || u.identifier.toLowerCase().includes(q) || u.refer_code.toLowerCase().includes(q) || String(u.id).includes(q);
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
    const pw = prompt('Enter new password (min 8 chars):');
    if (!pw || pw.length < 8) return;
    try {
      const r = await authFetch(`${API}/api/admin/users/${uid}/force-password-reset`, { method: 'POST', body: JSON.stringify({ newPassword: pw }) });
      if (r.ok) toast('Password reset done');
      else toast('Failed', 'error');
    } catch { toast('Failed', 'error'); }
  };

  const resetWithdrawAccount = async (uid, method) => {
    const label = method === 'all' ? 'ALL withdrawal accounts' : `${method.toUpperCase()} withdrawal account`;
    if (!confirm(`Reset ${label} for this user? They will be able to set a new account on their next withdrawal.`)) return;
    try {
      const r = await authFetch(`${API}/api/admin/users/${uid}/withdraw-accounts`, { method: 'DELETE', body: JSON.stringify({ method }) });
      if (r.ok) toast(`${label} reset successfully`);
      else toast((await r.json()).error || 'Failed', 'error');
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
      if (r.ok) { setMsgText(''); setMsgUserId(''); setMsgUserName(''); setMsgSearch(''); toast(`Delivered to ${d.delivered || 0} users`); }
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
          <div style={{ position: 'relative', marginBottom: 6 }}>
            <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
              <div style={{ position: 'relative', flex: 1 }}>
                <Search size={14} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--text2)' }} />
                <input
                  className="inp"
                  style={{ paddingLeft: 30, marginBottom: 0 }}
                  placeholder="Search by name, ID, or refer code..."
                  value={msgSearch}
                  onChange={e => { setMsgSearch(e.target.value); if (msgUserId) { setMsgUserId(''); setMsgUserName(''); } }}
                />
              </div>
              {msgUserName && (
                <div style={{ fontSize: 12, color: 'var(--primary)', fontWeight: 600, whiteSpace: 'nowrap', display: 'flex', alignItems: 'center', gap: 4 }}>
                  ✓ {msgUserName}
                  <button style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text2)', padding: 2 }} onClick={() => { setMsgUserId(''); setMsgUserName(''); setMsgSearch(''); }}>
                    <X size={12} />
                  </button>
                </div>
              )}
            </div>
            {msgSearch && !msgUserId && (() => {
              const sq = msgSearch.toLowerCase();
              const results = users.filter(u => !u.banned && (
                u.name.toLowerCase().includes(sq) ||
                u.identifier.toLowerCase().includes(sq) ||
                u.refer_code.toLowerCase().includes(sq) ||
                String(u.id).includes(sq)
              )).slice(0, 8);
              return results.length > 0 ? (
                <div style={{ position: 'absolute', top: '100%', left: 0, right: 0, background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 8, boxShadow: '0 4px 16px rgba(0,0,0,0.12)', zIndex: 100, maxHeight: 220, overflowY: 'auto' }}>
                  {results.map(u => (
                    <div key={u.id} onClick={() => { setMsgUserId(String(u.id)); setMsgUserName(`${u.name} #${u.id}`); setMsgSearch(''); }}
                      style={{ padding: '9px 14px', cursor: 'pointer', display: 'flex', gap: 10, alignItems: 'center', borderBottom: '1px solid var(--border)' }}
                      onMouseEnter={e => e.currentTarget.style.background = 'var(--bg)'}
                      onMouseLeave={e => e.currentTarget.style.background = ''}
                    >
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: 13, fontWeight: 600 }}>{u.name}</div>
                        <div style={{ fontSize: 11, color: 'var(--text2)' }}>{u.identifier} · REF: {u.refer_code}</div>
                      </div>
                      <span style={{ fontSize: 11, background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 4, padding: '1px 6px', color: 'var(--text2)' }}>#{u.id}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <div style={{ position: 'absolute', top: '100%', left: 0, right: 0, background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 8, boxShadow: '0 4px 16px rgba(0,0,0,0.12)', zIndex: 100, padding: '10px 14px', fontSize: 12, color: 'var(--text2)' }}>
                  No users found
                </div>
              );
            })()}
          </div>
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
              {selected.referred_by && (() => {
                const referrer = users.find(u => u.refer_code === selected.referred_by);
                return (
                  <span className="badge badge-blue" title={`Referral code: ${selected.referred_by}`} style={{ cursor: 'help' }}>
                    👤 রেফার: {referrer ? `${referrer.name} (ID: ${referrer.id})` : selected.referred_by}
                  </span>
                );
              })()}
              {!selected.referred_by && <span className="badge" style={{ background: 'var(--bg2)', color: 'var(--text2)' }}>Direct / No Referrer</span>}
              <span className={`badge ${selected.banned ? 'badge-red' : 'badge-green'}`}>{selected.banned ? 'Banned' : 'Active'}</span>
              {selected.is_admin && <span className="badge badge-purple">Admin</span>}
              {selected.is_guest && <span className="badge badge-yellow">Guest</span>}
              {selected.is_test && <span className="badge badge-blue">Test Account</span>}
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
                  {(isMain || adminPerms?.ban_users) && <button className={`btn btn-sm ${selected.banned ? 'btn-success' : 'btn-danger'}`} onClick={() => toggleBan(selected)}>{selected.banned ? 'Unban' : 'Ban'}</button>}
                  {isMain && !selected.is_admin && !selected.is_guest && (
                    <button className="btn btn-outline btn-sm" style={{ borderColor: 'rgba(139,92,246,0.5)', color: '#8B5CF6' }} onClick={async () => {
                      if (!confirm(`Promote "${selected.name}" to Admin? Their balance will be reset to 0.`)) return;
                      const r = await authFetch(`${API}/api/admin/users/${selected.id}`, { method: 'PATCH', body: JSON.stringify({ is_admin: true }) });
                      if (r.ok) { toast('User promoted to Admin'); load(); setSelected(null); }
                      else toast((await r.json()).error || 'Failed', 'error');
                    }}><Shield size={14} /> Make Admin</button>
                  )}
                  {isMain && selected.is_admin && !selected.is_main_admin && (
                    <button className="btn btn-danger btn-sm" onClick={async () => {
                      if (!confirm(`Remove admin privileges from "${selected.name}"?`)) return;
                      const r = await authFetch(`${API}/api/admin/users/${selected.id}`, { method: 'PATCH', body: JSON.stringify({ is_admin: false }) });
                      if (r.ok) { toast('Admin privileges removed'); load(); setSelected(null); }
                      else toast((await r.json()).error || 'Failed', 'error');
                    }}><ShieldOff size={14} /> Remove Admin</button>
                  )}
                  {isMain && <button className="btn btn-outline btn-sm" onClick={() => resetPw(selected.id)}><Lock size={14} /> Reset Password</button>}
                  {isMain && (
                    <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginTop: 4 }}>
                      {['bkash','nagad','rocket','crypto'].map(m => (
                        <button key={m} className="btn btn-outline btn-sm" style={{ fontSize: 11 }} onClick={() => resetWithdrawAccount(selected.id, m)}>
                          🔓 Reset {m.toUpperCase()} Account
                        </button>
                      ))}
                      <button className="btn btn-danger btn-sm" style={{ fontSize: 11 }} onClick={() => resetWithdrawAccount(selected.id, 'all')}>
                        🔓 Reset ALL Withdraw Accounts
                      </button>
                    </div>
                  )}
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
            <thead><tr>{bulkMode && <th style={{ width: 30 }}></th>}<th>User</th><th>Plan</th><th>Balance</th><th>Referred By</th><th>Status</th><th>Joined</th><th>Actions</th></tr></thead>
            <tbody>
              {filtered.map(u => {
                const referrer = u.referred_by ? users.find(r => r.refer_code === u.referred_by) : null;
                return (
                <tr key={u.id}>
                  {bulkMode && <td><input type="checkbox" checked={bulkIds.has(u.id)} onChange={() => { const n = new Set(bulkIds); n.has(u.id) ? n.delete(u.id) : n.add(u.id); setBulkIds(n); }} /></td>}
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer' }} onClick={() => selectUser(u)}>
                      <Avatar src={u.avatar_img || u.avatar} name={u.name} size={36} />
                      <div>
                        <div style={{ fontWeight: 700 }}>{u.name} {u.is_admin && <span className="badge badge-purple" style={{ fontSize: 8 }}>Admin</span>}{u.is_guest && <span className="badge badge-yellow" style={{ fontSize: 8, marginLeft: 3 }}>Guest</span>}{u.is_test && <span className="badge badge-blue" style={{ fontSize: 8, marginLeft: 3 }}>Test</span>}</div>
                        <div style={{ fontSize: 11, color: 'var(--text2)' }}>{u.identifier} · {u.refer_code}</div>
                      </div>
                    </div>
                  </td>
                  <td><span style={{ color: u.plan_color, fontWeight: 600 }}>{u.plan_name}</span></td>
                  <td style={{ fontWeight: 700 }}>{formatMoney(u.balance)}</td>
                  <td style={{ fontSize: 12 }}>
                    {referrer
                      ? <div style={{ cursor: 'pointer', color: 'var(--accent)' }} onClick={() => selectUser(referrer)} title="Click to view referrer">👤 {referrer.name}<div style={{ fontSize: 10, color: 'var(--text2)' }}>ID: {referrer.id}</div></div>
                      : u.referred_by
                        ? <span style={{ fontFamily: 'monospace', color: 'var(--text2)', fontSize: 11 }}>{u.referred_by}</span>
                        : <span style={{ color: 'var(--text2)' }}>—</span>}
                  </td>
                  <td><span className={`badge ${u.banned ? 'badge-red' : 'badge-green'}`}>{u.banned ? 'Banned' : 'Active'}</span></td>
                  <td style={{ fontSize: 11, color: 'var(--text2)' }}>{fmtDate(u.created_at)}</td>
                  <td>
                    <div style={{ display: 'flex', gap: 4 }}>
                      <button className="btn btn-outline btn-sm" onClick={() => selectUser(u)}><Eye size={14} /></button>
                      {(isMain || adminPerms?.ban_users) && <button className={`btn btn-sm ${u.banned ? 'btn-success' : 'btn-danger'}`} onClick={() => toggleBan(u)}>{u.banned ? <UserCheck size={14} /> : <Ban size={14} />}</button>}
                    </div>
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

function WalletManagementPage({ authFetch, toast, isMain }) {
  const [tab, setTab] = useState('balance');
  // ── Balance Adjustment ────────────────────────────────────────────────────
  const [userSearch, setUserSearch] = useState('');
  const [foundUser, setFoundUser] = useState(null);
  const [searchLoading, setSearchLoading] = useState(false);
  const [adjMode, setAdjMode] = useState('set'); // set | credit | debit
  const [adjAmount, setAdjAmount] = useState('');
  const [adjNote, setAdjNote] = useState('');
  const [adjLoading, setAdjLoading] = useState(false);
  // ── Transfer History ──────────────────────────────────────────────────────
  const [transfers, setTransfers] = useState([]);
  const [txLoading, setTxLoading] = useState(false);
  const [txSearch, setTxSearch] = useState('');
  // ── Balance Overview ──────────────────────────────────────────────────────
  const [overview, setOverview] = useState(null);
  const [ovLoading, setOvLoading] = useState(false);

  const searchUser = async () => {
    if (!userSearch.trim()) return;
    setSearchLoading(true); setFoundUser(null);
    try {
      const r = await authFetch(`${API}/api/admin/users`);
      const d = await r.json();
      const users = d.users || [];
      const q = userSearch.trim().toLowerCase();
      const match = users.find(u =>
        String(u.id) === q || u.identifier?.toLowerCase().includes(q) || u.name?.toLowerCase().includes(q)
      );
      if (match) setFoundUser(match);
      else toast('User not found', 'error');
    } catch { toast('Search failed', 'error'); }
    finally { setSearchLoading(false); }
  };

  const applyBalance = async () => {
    if (!foundUser || !adjAmount) return;
    const num = Number(adjAmount);
    if (isNaN(num) || num < 0) return toast('Invalid amount', 'error');
    let newBalance;
    if (adjMode === 'set') newBalance = num;
    else if (adjMode === 'credit') newBalance = (Number(foundUser.balance) || 0) + num;
    else newBalance = Math.max(0, (Number(foundUser.balance) || 0) - num);
    setAdjLoading(true);
    try {
      const r = await authFetch(`${API}/api/admin/users/${foundUser.id}`, {
        method: 'PATCH',
        body: JSON.stringify({ balance: newBalance }),
      });
      const d = await r.json();
      if (r.ok) {
        toast(`Balance updated → ${formatMoney(newBalance)}`);
        setFoundUser(u => ({ ...u, balance: newBalance }));
        setAdjAmount(''); setAdjNote('');
      } else toast(d.error || 'Failed', 'error');
    } catch { toast('Failed', 'error'); }
    finally { setAdjLoading(false); }
  };

  const loadTransfers = useCallback(async () => {
    setTxLoading(true);
    try {
      const r = await authFetch(`${API}/api/admin/transactions`);
      const d = await r.json();
      const all = d.transactions || [];
      setTransfers(all.filter(t => t.type === 'transfer_sent' || t.type === 'transfer_received'));
    } catch {}
    finally { setTxLoading(false); }
  }, []);

  const loadOverview = useCallback(async () => {
    setOvLoading(true);
    try {
      const r = await authFetch(`${API}/api/admin/users`);
      const d = await r.json();
      const users = d.users || [];
      const totalBal = users.reduce((s, u) => s + (Number(u.balance) || 0), 0);
      const topUsers = [...users].sort((a, b) => (b.balance || 0) - (a.balance || 0)).slice(0, 10);
      setOverview({ totalBal, count: users.length, topUsers });
    } catch {}
    finally { setOvLoading(false); }
  }, []);

  useEffect(() => {
    if (tab === 'transfers') loadTransfers();
    if (tab === 'overview') loadOverview();
  }, [tab, loadTransfers, loadOverview]);

  const filteredTx = transfers.filter(t => {
    const q = txSearch.toLowerCase();
    return !q || t.user_name?.toLowerCase().includes(q) || t.user_identifier?.toLowerCase().includes(q) || String(t.user_id).includes(q);
  });

  const TABS = [
    { id: 'balance', label: '⚖️ Balance Adjust' },
    { id: 'transfers', label: '↔️ Transfers' },
    { id: 'overview', label: '📊 Overview' },
  ];

  return (
    <>
      <div className="page-header">
        <div><h1>Wallet Control</h1><div className="subtitle">Manage user balances and monitor transfers</div></div>
      </div>

      {/* Tabs */}
      <div className="card" style={{ padding: '10px 16px', marginBottom: 16 }}>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {TABS.map(t => (
            <button key={t.id} className={`btn btn-sm ${tab === t.id ? 'btn-primary' : 'btn-outline'}`} onClick={() => setTab(t.id)}>
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* ── Balance Adjustment ─────────────────────────────────────────── */}
      {tab === 'balance' && (
        <>
          <div className="card">
            <div className="card-title"><SlidersHorizontal size={16} /> Balance Adjustment</div>
            <p style={{ fontSize: 13, color: 'var(--text2)', marginBottom: 16 }}>
              Search a user, then set their exact balance, or credit/debit an amount. All changes are logged.
            </p>

            {/* Search */}
            <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
              <input
                className="inp" style={{ flex: 1, marginBottom: 0 }}
                placeholder="Search by name, email/ID or user ID..."
                value={userSearch} onChange={e => setUserSearch(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && searchUser()}
              />
              <button className="btn btn-primary" onClick={searchUser} disabled={searchLoading}>
                {searchLoading ? <RefreshCw size={14} /> : <Search size={14} />} Find
              </button>
            </div>

            {/* Found user card */}
            {foundUser && (
              <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 12, padding: '14px 16px', marginBottom: 16 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 8 }}>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: 16 }}>{foundUser.name}</div>
                    <div style={{ fontSize: 12, color: 'var(--text2)' }}>ID: {foundUser.id} · {foundUser.identifier}</div>
                    <div style={{ fontSize: 12, color: 'var(--text2)' }}>Plan: <span style={{ color: 'var(--accent)', fontWeight: 700 }}>{foundUser.plan_id?.toUpperCase()}</span></div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: 11, color: 'var(--text2)' }}>Current Balance</div>
                    <div style={{ fontSize: 22, fontWeight: 900, color: 'var(--accent)' }}>{formatMoney(foundUser.balance)}</div>
                  </div>
                </div>

                {/* Adjustment controls */}
                <div style={{ marginTop: 16, display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 12 }}>
                  {[
                    { v: 'set', icon: <SlidersHorizontal size={13} />, label: 'Set Exact', color: '#818CF8' },
                    { v: 'credit', icon: <PlusCircle size={13} />, label: 'Credit (+)', color: '#0ECB81' },
                    { v: 'debit', icon: <MinusCircle size={13} />, label: 'Debit (−)', color: '#F6465D' },
                  ].map(m => (
                    <button
                      key={m.v}
                      onClick={() => setAdjMode(m.v)}
                      style={{
                        display: 'flex', alignItems: 'center', gap: 6, padding: '7px 14px', borderRadius: 8,
                        border: `1.5px solid ${adjMode === m.v ? m.color : 'var(--border)'}`,
                        background: adjMode === m.v ? `${m.color}22` : 'transparent',
                        color: adjMode === m.v ? m.color : 'var(--text2)',
                        cursor: 'pointer', fontWeight: 700, fontSize: 13,
                      }}
                    >
                      {m.icon} {m.label}
                    </button>
                  ))}
                </div>

                <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
                  <div style={{ position: 'relative', flex: 1, minWidth: 120 }}>
                    <span style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text2)', fontWeight: 700 }}>৳</span>
                    <input
                      className="inp" type="number" min="0"
                      style={{ paddingLeft: 28, marginBottom: 0 }}
                      placeholder={adjMode === 'set' ? 'New balance amount' : 'Amount to ' + adjMode}
                      value={adjAmount} onChange={e => setAdjAmount(e.target.value)}
                    />
                  </div>
                  <input
                    className="inp" style={{ flex: 2, minWidth: 140, marginBottom: 0 }}
                    placeholder="Reason / note (optional)"
                    value={adjNote} onChange={e => setAdjNote(e.target.value)}
                  />
                  <button
                    className={`btn ${adjMode === 'credit' ? 'btn-success' : adjMode === 'debit' ? 'btn-danger' : 'btn-primary'}`}
                    disabled={adjLoading || !adjAmount}
                    onClick={applyBalance}
                  >
                    {adjLoading ? <RefreshCw size={14} /> : <CheckCircle size={14} />}
                    {adjMode === 'set' ? 'Set Balance' : adjMode === 'credit' ? 'Credit' : 'Debit'}
                  </button>
                </div>

                {/* Preview */}
                {adjAmount && !isNaN(Number(adjAmount)) && (
                  <div style={{ marginTop: 10, fontSize: 13, color: 'var(--text2)', display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
                    <span>Preview:</span>
                    <span style={{ fontWeight: 700, color: 'var(--text)' }}>{formatMoney(foundUser.balance)}</span>
                    <span>→</span>
                    <span style={{ fontWeight: 800, color: adjMode === 'credit' ? 'var(--success)' : adjMode === 'debit' ? 'var(--danger)' : '#818CF8' }}>
                      {adjMode === 'set' ? formatMoney(Number(adjAmount))
                        : adjMode === 'credit' ? formatMoney((Number(foundUser.balance) || 0) + Number(adjAmount))
                        : formatMoney(Math.max(0, (Number(foundUser.balance) || 0) - Number(adjAmount)))}
                    </span>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Quick tips */}
          <div className="card" style={{ background: 'rgba(99,102,241,0.04)', border: '1px solid rgba(99,102,241,0.15)' }}>
            <div style={{ fontSize: 13, color: 'var(--text2)', lineHeight: 1.7 }}>
              <div style={{ fontWeight: 700, marginBottom: 4, color: 'var(--text)' }}>ℹ️ How Balance Adjustment Works</div>
              <div>• <strong>Set Exact</strong> — Overwrite the balance to a specific value (e.g. set to ৳0 to clear)</div>
              <div>• <strong>Credit (+)</strong> — Add an amount on top of the current balance</div>
              <div>• <strong>Debit (−)</strong> — Subtract from the current balance (won't go below ৳0)</div>
              <div>• All changes appear in the admin activity log with the admin's name</div>
            </div>
          </div>
        </>
      )}

      {/* ── Transfers ──────────────────────────────────────────────────── */}
      {tab === 'transfers' && (
        <>
          <div className="card" style={{ padding: '12px 16px', marginBottom: 12, display: 'flex', gap: 8, alignItems: 'center' }}>
            <Search size={15} color="var(--text2)" />
            <input
              className="inp" style={{ flex: 1, marginBottom: 0, background: 'transparent', border: 'none', padding: 0 }}
              placeholder="Filter by user name, email, or ID..."
              value={txSearch} onChange={e => setTxSearch(e.target.value)}
            />
            <button className="btn btn-outline btn-sm" onClick={loadTransfers}><RefreshCw size={14} /></button>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginBottom: 16 }}>
            <div className="stat-card">
              <div className="stat-value">{transfers.filter(t => t.type === 'transfer_sent').length}</div>
              <div className="stat-label">Total Outgoing</div>
            </div>
            <div className="stat-card">
              <div className="stat-value">{transfers.filter(t => t.type === 'transfer_received').length}</div>
              <div className="stat-label">Total Incoming</div>
            </div>
            <div className="stat-card">
              <div className="stat-value" style={{ color: 'var(--accent)' }}>
                {formatMoney(transfers.filter(t => t.type === 'transfer_sent').reduce((s, t) => s + Math.abs(t.amount || 0), 0))}
              </div>
              <div className="stat-label">Total Volume</div>
            </div>
          </div>

          {txLoading ? (
            <div className="card" style={{ textAlign: 'center', padding: 60, color: 'var(--text2)' }}>Loading transfers…</div>
          ) : filteredTx.length === 0 ? (
            <div className="card" style={{ textAlign: 'center', padding: 60, color: 'var(--text2)' }}>No transfers found</div>
          ) : (
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Direction</th>
                    <th>User</th>
                    <th>Amount</th>
                    <th>Method</th>
                    <th>Status</th>
                    <th>Date</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredTx.map(tx => (
                    <tr key={tx.id}>
                      <td>
                        {tx.type === 'transfer_sent'
                          ? <span style={{ color: '#F59E0B', fontWeight: 700 }}>➡️ Sent</span>
                          : <span style={{ color: '#60A5FA', fontWeight: 700 }}>⬅️ Received</span>}
                      </td>
                      <td>
                        <div style={{ fontWeight: 600 }}>{tx.user_name}</div>
                        <div style={{ fontSize: 10, color: 'var(--text2)' }}>ID: {tx.user_id} · {tx.user_identifier}</div>
                      </td>
                      <td style={{ fontWeight: 700, color: tx.amount > 0 ? 'var(--success)' : 'var(--danger)' }}>
                        {tx.amount > 0 ? '+' : ''}{formatMoney(Math.abs(tx.amount))}
                      </td>
                      <td><span className="badge badge-blue">{tx.method?.toUpperCase() || 'INTERNAL'}</span></td>
                      <td><span className={`badge ${tx.status === 'approved' ? 'badge-green' : tx.status === 'rejected' ? 'badge-red' : 'badge-yellow'}`}>{tx.status}</span></td>
                      <td style={{ fontSize: 11, color: 'var(--text2)' }}>{fmtDate(tx.created_at)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}

      {/* ── Overview ───────────────────────────────────────────────────── */}
      {tab === 'overview' && (
        <>
          {ovLoading ? (
            <div className="card" style={{ textAlign: 'center', padding: 60, color: 'var(--text2)' }}>Loading…</div>
          ) : overview ? (
            <>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 12, marginBottom: 16 }}>
                <div className="stat-card">
                  <div className="stat-value" style={{ color: 'var(--accent)' }}>{formatMoney(overview.totalBal)}</div>
                  <div className="stat-label">Total User Balance</div>
                </div>
                <div className="stat-card">
                  <div className="stat-value">{overview.count}</div>
                  <div className="stat-label">Total Users</div>
                </div>
              </div>

              <div className="card">
                <div className="card-title"><Trophy size={15} /> Top 10 Balances</div>
                <div className="table-wrap">
                  <table>
                    <thead>
                      <tr><th>Rank</th><th>User</th><th>Plan</th><th>Balance</th></tr>
                    </thead>
                    <tbody>
                      {overview.topUsers.map((u, i) => (
                        <tr key={u.id}>
                          <td style={{ fontWeight: 800, color: i === 0 ? '#F59E0B' : i === 1 ? '#94A3B8' : i === 2 ? '#CD7F32' : 'var(--text2)' }}>
                            #{i + 1}
                          </td>
                          <td>
                            <div style={{ fontWeight: 600 }}>{u.name}</div>
                            <div style={{ fontSize: 10, color: 'var(--text2)' }}>ID: {u.id} · {u.identifier}</div>
                          </td>
                          <td><span className="badge badge-blue">{u.plan_id?.toUpperCase()}</span></td>
                          <td style={{ fontWeight: 700, color: 'var(--accent)' }}>{formatMoney(u.balance)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          ) : (
            <div className="card" style={{ textAlign: 'center', padding: 40, color: 'var(--text2)' }}>
              <button className="btn btn-primary" onClick={loadOverview}>Load Overview</button>
            </div>
          )}
        </>
      )}
    </>
  );
}

function FinancePage({ authFetch, toast, isMain, adminPerms }) {
  const [transactions, setTx] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('pending');
  const [typeFilter, setTypeFilter] = useState('all');
  const [processing, setProcessing] = useState(null);
  const [note, setNote] = useState('');
  const [proofModal, setProofModal] = useState(null);
  const [proofChecked, setProofChecked] = useState(false);

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
          {[
            { v: 'all', label: 'All Types' },
            { v: 'deposit', label: '💰 Deposit' },
            { v: 'withdraw', label: '💸 Withdraw' },
            { v: 'transfer_sent', label: '➡️ Transfer Out' },
            { v: 'transfer_received', label: '⬅️ Transfer In' },
          ].map(f => (
            <button key={f.v} className={`btn btn-sm ${typeFilter === f.v ? 'btn-primary' : 'btn-outline'}`} onClick={() => setTypeFilter(f.v)}>
              {f.label}
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
                  <td>
                    {tx.type === 'deposit' ? <span style={{ color: 'var(--success)' }}>💰 Deposit</span>
                     : tx.type === 'transfer_sent' ? <span style={{ color: '#F59E0B' }}>➡️ Transfer Out</span>
                     : tx.type === 'transfer_received' ? <span style={{ color: '#60A5FA' }}>⬅️ Transfer In</span>
                     : <span style={{ color: 'var(--danger)' }}>💸 Withdraw</span>}
                  </td>
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
                    {tx.status === 'pending' ? (() => {
                      const canApprove = isMain || (tx.type === 'deposit' ? adminPerms?.approve_deposits : adminPerms?.approve_withdrawals);
                      return canApprove ? (
                        <div style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
                          <button
                            className="btn btn-success btn-sm"
                            disabled={processing === tx.id}
                            onClick={() => { setProofModal({ tx, action: 'approved' }); setProofChecked(false); setNote(''); }}
                            title="Approve — verify proof first"
                          >
                            <CheckCircle size={14} />
                          </button>
                          <button
                            className="btn btn-danger btn-sm"
                            disabled={processing === tx.id}
                            onClick={() => { setProofModal({ tx, action: 'rejected' }); setProofChecked(false); setNote(''); }}
                            title="Reject"
                          >
                            <X size={14} />
                          </button>
                        </div>
                      ) : (
                        <span style={{ fontSize: 11, color: 'var(--text2)' }}>Pending — no permission</span>
                      );
                    })() : (
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

      {/* ── Proof Verification Modal ───────────────────────────────────────── */}
      {proofModal && (() => {
        const { tx, action } = proofModal;
        const isApprove = action === 'approved';
        const hasProof = tx.screenshot || tx.txn_hash;
        return (
          <div className="modal-overlay" onClick={() => setProofModal(null)}>
            <div className="modal" onClick={e => e.stopPropagation()} style={{ maxWidth: 480 }}>
              <div className="modal-header">
                <span style={{ fontWeight: 700, fontSize: 16 }}>
                  {isApprove ? '✅ Approve Transaction' : '❌ Reject Transaction'}
                </span>
                <button className="btn btn-outline btn-sm" onClick={() => setProofModal(null)}><X size={14} /></button>
              </div>

              <div style={{ padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: 12 }}>
                {/* Transaction summary */}
                <div style={{ background: 'var(--bg2)', borderRadius: 10, padding: '12px 14px', fontSize: 13 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                    <span style={{ color: 'var(--text2)' }}>Type</span>
                    <span style={{ fontWeight: 700, color: tx.type === 'deposit' ? 'var(--success)' : 'var(--danger)' }}>
                      {tx.type === 'deposit' ? '💰 Deposit' : '💸 Withdraw'}
                    </span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                    <span style={{ color: 'var(--text2)' }}>User</span>
                    <span style={{ fontWeight: 600 }}>{tx.user_name} <span style={{ color: 'var(--text2)', fontWeight: 400 }}>(ID: {tx.user_id})</span></span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                    <span style={{ color: 'var(--text2)' }}>Amount</span>
                    <span style={{ fontWeight: 700, fontSize: 15 }}>{formatMoney(tx.amount)}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                    <span style={{ color: 'var(--text2)' }}>Method</span>
                    <span className="badge badge-blue">{tx.method?.toUpperCase()}</span>
                  </div>
                  {tx.account && (
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                      <span style={{ color: 'var(--text2)' }}>Account</span>
                      <span style={{ fontFamily: 'monospace', fontSize: 12 }}>{tx.account}</span>
                    </div>
                  )}
                  {tx.txn_hash && (
                    <div style={{ marginTop: 6 }}>
                      <div style={{ color: 'var(--text2)', fontSize: 11, marginBottom: 2 }}>Transaction Hash:</div>
                      <div style={{ fontFamily: 'monospace', fontSize: 10, color: 'var(--accent)', wordBreak: 'break-all', background: 'rgba(0,0,0,0.1)', padding: '4px 8px', borderRadius: 6 }}>{tx.txn_hash}</div>
                    </div>
                  )}
                  {tx.blockchain && <div style={{ marginTop: 4, fontSize: 11, color: 'var(--text2)' }}>Chain: {tx.blockchain?.toUpperCase()} · {tx.token?.toUpperCase()}</div>}
                </div>

                {/* Screenshot proof */}
                {tx.screenshot && (
                  <div>
                    <div style={{ fontSize: 12, color: 'var(--text2)', marginBottom: 6, fontWeight: 600 }}>📎 Payment Screenshot:</div>
                    <a href={tx.screenshot} target="_blank" rel="noreferrer">
                      <img src={tx.screenshot} alt="proof" style={{ width: '100%', maxHeight: 220, objectFit: 'contain', borderRadius: 10, border: '2px solid var(--border)', cursor: 'zoom-in', background: 'var(--bg2)' }} />
                    </a>
                    <div style={{ fontSize: 11, color: 'var(--text2)', marginTop: 4 }}>Click image to open full-size</div>
                  </div>
                )}

                {/* No proof warning */}
                {!hasProof && tx.type === 'deposit' && (
                  <div style={{ background: 'rgba(252,213,53,0.1)', border: '1px solid rgba(252,213,53,0.3)', borderRadius: 8, padding: '10px 12px', fontSize: 12, color: '#ca8a04' }}>
                    ⚠️ No screenshot or transaction hash provided for this deposit.
                  </div>
                )}

                {/* Admin note */}
                <div>
                  <label style={{ fontSize: 12, color: 'var(--text2)', display: 'block', marginBottom: 4 }}>Admin Note (optional):</label>
                  <input className="inp" placeholder="Add a note..." value={note} onChange={e => setNote(e.target.value)} style={{ marginBottom: 0 }} />
                </div>

                {/* Mandatory proof confirm checkbox */}
                <label style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer', padding: '10px 12px', background: isApprove ? 'rgba(14,203,129,0.07)' : 'rgba(220,38,38,0.07)', borderRadius: 8, border: `1px solid ${isApprove ? 'rgba(14,203,129,0.25)' : 'rgba(220,38,38,0.2)'}` }}>
                  <input
                    type="checkbox"
                    checked={proofChecked}
                    onChange={e => setProofChecked(e.target.checked)}
                    style={{ width: 16, height: 16, accentColor: isApprove ? 'var(--success)' : 'var(--danger)', cursor: 'pointer' }}
                  />
                  <span style={{ fontSize: 13, fontWeight: 600 }}>
                    {isApprove
                      ? 'আমি payment proof যাচাই করেছি এবং এটি Approve করতে সম্মত।'
                      : 'আমি এই request টি Reject করতে নিশ্চিত।'}
                  </span>
                </label>

                <div style={{ display: 'flex', gap: 8 }}>
                  <button
                    className={`btn ${isApprove ? 'btn-success' : 'btn-danger'}`}
                    disabled={!proofChecked || processing === tx.id}
                    onClick={async () => {
                      setProofModal(null);
                      await handleTx(tx.id, action);
                    }}
                    style={{ flex: 1, opacity: proofChecked ? 1 : 0.5 }}
                  >
                    {processing === tx.id ? 'Processing...' : isApprove ? '✅ Approve Now' : '❌ Reject Now'}
                  </button>
                  <button className="btn btn-outline" onClick={() => setProofModal(null)} style={{ flex: 1 }}>
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </div>
        );
      })()}
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

function SelectiveResetCard({ authFetch, toast }) {
  const [open, setOpen] = useState(false);
  const [keepIds, setKeepIds] = useState('');
  const [phrase, setPhrase] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState('');

  const doReset = async () => {
    const ids = keepIds.split(',').map(s => Number(s.trim())).filter(n => n > 0);
    if (ids.length === 0) { toast('Enter at least one User ID to keep', 'error'); return; }
    if (phrase !== 'SELECTIVE RESET') { toast('Type the exact phrase: SELECTIVE RESET', 'error'); return; }
    setLoading(true);
    try {
      const r = await authFetch(`${API}/api/admin/reset-database-selective`, {
        method: 'POST',
        body: JSON.stringify({ confirmPhrase: 'SELECTIVE RESET', keepUserIds: ids }),
      });
      const d = await r.json();
      if (r.ok) { setResult(d.message); setOpen(false); toast('Selective reset done!', 'success'); }
      else toast(d.error || 'Reset failed', 'error');
    } catch { toast('Connection error', 'error'); }
    setLoading(false);
  };

  return (
    <div className="card" style={{ borderColor: 'rgba(234,179,8,0.4)', background: 'rgba(234,179,8,0.03)' }}>
      <div className="card-title" style={{ color: '#ca8a04' }}>
        <Users size={16} color="#ca8a04" /> Selective Cleanup — Keep Specific Users
      </div>
      <div style={{ fontSize: 13, color: 'var(--text2)', marginBottom: 14, lineHeight: 1.6 }}>
        Delete all test/fake users while keeping specific real users. Enter the User IDs you want to <strong>keep</strong> (comma-separated). Main admin is always kept automatically.
      </div>

      {result && (
        <div style={{ background: 'rgba(14,203,129,0.08)', border: '1px solid rgba(14,203,129,0.25)', borderRadius: 10, padding: '10px 14px', fontSize: 13, color: 'var(--success)', marginBottom: 12 }}>
          ✅ {result}
        </div>
      )}

      {!open && (
        <button className="btn btn-sm" style={{ background: 'rgba(234,179,8,0.12)', color: '#ca8a04', border: '1px solid rgba(234,179,8,0.3)' }} onClick={() => setOpen(true)}>
          <Users size={14} /> Delete Fake Users (Keep Real Ones)
        </button>
      )}

      {open && (
        <div style={{ background: 'rgba(234,179,8,0.06)', border: '1px solid rgba(234,179,8,0.2)', borderRadius: 12, padding: 16 }}>
          <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 8 }}>User IDs to KEEP (comma-separated):</div>
          <input
            className="inp"
            placeholder="e.g. 12, 13"
            value={keepIds}
            onChange={e => setKeepIds(e.target.value)}
            style={{ marginBottom: 12 }}
          />
          <div style={{ fontSize: 13, fontWeight: 700, color: '#ca8a04', marginBottom: 8 }}>
            ⚠️ Type <code style={{ background: 'rgba(234,179,8,0.15)', padding: '2px 6px', borderRadius: 4 }}>SELECTIVE RESET</code> to confirm:
          </div>
          <input
            className="inp"
            placeholder="SELECTIVE RESET"
            value={phrase}
            onChange={e => setPhrase(e.target.value)}
            style={{ marginBottom: 12, borderColor: phrase === 'SELECTIVE RESET' ? '#ca8a04' : undefined }}
          />
          <div style={{ display: 'flex', gap: 8 }}>
            <button
              className="btn btn-sm"
              style={{ background: '#ca8a04', color: '#fff', border: 'none', opacity: phrase === 'SELECTIVE RESET' ? 1 : 0.5 }}
              onClick={doReset}
              disabled={loading || phrase !== 'SELECTIVE RESET'}
            >
              {loading ? 'Cleaning...' : '🧹 Confirm Selective Cleanup'}
            </button>
            <button className="btn btn-outline btn-sm" onClick={() => { setOpen(false); setPhrase(''); setKeepIds(''); }}>
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function AdminsPage({ authFetch, toast, adminUser, navGroups = [] }) {
  const [users, setUsers] = useState([]);
  const [logs, setLogs] = useState([]);
  const [logsLoading, setLogsLoading] = useState(true);
  const [editPerms, setEditPerms] = useState(null);
  const [perms, setPerms] = useState({});
  const isMain = adminUser?.is_main_admin;

  const loadUsers = useCallback(async () => {
    try { const r = await authFetch(`${API}/api/admin/users`); const d = await r.json(); if (r.ok) setUsers((d.users || []).filter(u => u.is_admin && !u.is_main_admin)); } catch {}
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

      {/* ── Screen Access Matrix (shows which screens sub-admins can access) ── */}
      {navGroups.length > 0 && editPerms && (() => {
        const targetAdmin = users.find(u => u.id === editPerms);
        const checkAccess = (item) => {
          if (item.mainOnly) return false;
          if (!item.perm) return true;
          if (Array.isArray(item.perm)) return item.perm.some(p => !!perms[p]);
          return !!perms[item.perm];
        };
        return (
          <div className="card" style={{ borderColor: 'rgba(99,102,241,0.2)', background: 'rgba(99,102,241,0.02)' }}>
            <div className="card-title"><Layers size={16} color="var(--info)" /> Screen Access Preview — {targetAdmin?.name}</div>
            <div style={{ fontSize: 12, color: 'var(--text2)', marginBottom: 16 }}>Based on selected permissions, this admin will see:</div>
            {navGroups.map(group => {
              const accessible = group.items.filter(i => checkAccess(i));
              const locked = group.items.filter(i => !checkAccess(i));
              return (
                <div key={group.label} style={{ marginBottom: 16 }}>
                  <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text2)', marginBottom: 8, textTransform: 'uppercase', letterSpacing: 1 }}>{group.label}</div>
                  <div className="perm-matrix-grid">
                    {group.items.map(item => {
                      const can = checkAccess(item);
                      const Icon = item.icon;
                      return (
                        <div key={item.id} className={`perm-matrix-item ${can ? 'granted' : 'denied'}`}>
                          <Icon size={13} />
                          <span style={{ flex: 1 }}>{item.label}</span>
                          {item.mainOnly ? <span style={{ fontSize: 9, fontWeight: 700, opacity: 0.7 }}>MAIN ONLY</span> : can ? <CheckCircle size={12} /> : <Lock size={11} />}
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        );
      })()}

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
      {isMain && <SelectiveResetCard authFetch={authFetch} toast={toast} />}
      {isMain && <ResetDatabaseCard authFetch={authFetch} toast={toast} />}
    </>
  );
}

function AdminChatPage({ authFetch, toast, adminUser }) {
  const [chatMsgs, setChatMsgs] = useState([]);
  const [chatText, setChatText] = useState('');
  const [chatLoading, setChatLoading] = useState(false);
  const [chatSending, setChatSending] = useState(false);
  const chatEndRef = useRef(null);
  const isMain = adminUser?.is_main_admin;

  const loadChat = useCallback(async () => {
    setChatLoading(true);
    try { const r = await authFetch(`${API}/api/admin/group-chat`); const d = await r.json(); if (r.ok) setChatMsgs(d.messages || []); } catch {}
    finally { setChatLoading(false); }
  }, []);

  const sendChat = async () => {
    if (!chatText.trim()) return;
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

  useEffect(() => { loadChat(); }, [loadChat]);
  useEffect(() => { const t = setInterval(loadChat, 5000); return () => clearInterval(t); }, [loadChat]);
  useEffect(() => { chatEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [chatMsgs]);

  return (
    <>
      <div className="page-header">
        <div>
          <h1><MessageCircle size={22} style={{ verticalAlign: 'middle', marginRight: 8 }} />Admin Chat</h1>
          <div className="subtitle">Private group chat between all admins</div>
        </div>
        <button className="btn btn-outline btn-sm" onClick={loadChat}><RefreshCw size={12} /> Refresh</button>
      </div>

      <div className="card" style={{ display: 'flex', flexDirection: 'column', minHeight: 480 }}>
        {/* Chat header */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: 10, padding: '14px 16px',
          borderBottom: '1px solid var(--border)', marginBottom: 0,
          background: 'linear-gradient(90deg,rgba(59,130,246,0.07),rgba(14,203,129,0.05))',
          borderRadius: '12px 12px 0 0',
        }}>
          <div style={{ width: 38, height: 38, borderRadius: '50%', background: 'linear-gradient(135deg,#1E40AF,#0ECB81)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <MessageCircle size={18} color="#fff" />
          </div>
          <div>
            <div style={{ fontWeight: 700, fontSize: 14 }}>Admin Group Chat</div>
            <div style={{ fontSize: 11, color: 'var(--text2)' }}>
              {isMain ? '👁️ Main admin — read only' : '✏️ You can send messages'}
            </div>
          </div>
        </div>

        {/* Messages area */}
        <div style={{
          flex: 1, overflowY: 'auto', padding: '14px 16px',
          display: 'flex', flexDirection: 'column', gap: 10,
          minHeight: 340, maxHeight: 480,
          background: 'var(--bg2)',
        }}>
          {chatLoading && chatMsgs.length === 0
            ? <div style={{ textAlign: 'center', color: 'var(--text2)', marginTop: 60 }}>Loading messages...</div>
            : chatMsgs.length === 0
              ? (
                <div style={{ textAlign: 'center', marginTop: 60 }}>
                  <div style={{ fontSize: 36, marginBottom: 10 }}>💬</div>
                  <div style={{ fontWeight: 600, color: 'var(--text2)' }}>No messages yet</div>
                  <div style={{ fontSize: 12, color: 'var(--text2)', marginTop: 4 }}>Start the conversation below</div>
                </div>
              )
              : chatMsgs.map(m => (
                <div key={m.id} style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                  <div style={{
                    width: 36, height: 36, borderRadius: '50%',
                    background: 'linear-gradient(135deg,var(--primary),var(--accent))',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 14, fontWeight: 700, flexShrink: 0, color: '#fff',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
                  }}>
                    {(m.sender_name || 'A')[0].toUpperCase()}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--accent)', marginBottom: 4 }}>
                      {m.sender_name || 'Admin'}
                      <span style={{ color: 'var(--text2)', fontWeight: 400, marginLeft: 8 }}>{fmtDate(m.created_at)}</span>
                    </div>
                    {m.message && (
                      <div style={{
                        fontSize: 13, background: 'var(--card)',
                        padding: '9px 14px', borderRadius: '0 12px 12px 12px',
                        border: '1px solid var(--border)',
                        lineHeight: 1.55, wordBreak: 'break-word',
                        boxShadow: '0 1px 4px rgba(0,0,0,0.08)',
                      }}>
                        {m.message}
                      </div>
                    )}
                    {m.media_url && m.media_type === 'image' && (
                      <img src={m.media_url} alt="" style={{ maxWidth: 240, borderRadius: 10, marginTop: 6, display: 'block', border: '1px solid var(--border)' }} />
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

        {/* Input area */}
        <div style={{ padding: '12px 16px', borderTop: '1px solid var(--border)', background: 'var(--card)', borderRadius: '0 0 12px 12px' }}>
          {isMain ? (
            <div style={{
              fontSize: 12, color: 'var(--text2)', textAlign: 'center', padding: '10px',
              background: 'var(--bg2)', borderRadius: 8, border: '1px solid var(--border)',
            }}>
              👁️ Main admin has read-only access to this chat. Sub-admins use this to communicate.
            </div>
          ) : (
            <div style={{ display: 'flex', gap: 8 }}>
              <input
                className="inp"
                style={{ flex: 1 }}
                placeholder="Type a message..."
                value={chatText}
                onChange={e => setChatText(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && !e.shiftKey && !chatSending && sendChat()}
              />
              <button
                className="btn btn-primary"
                onClick={sendChat}
                disabled={chatSending || !chatText.trim()}
                style={{ minWidth: 80, gap: 6 }}
              >
                <Send size={14} /> {chatSending ? '...' : 'Send'}
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  );
}

function ControlsPage({ authFetch, toast }) {
  const [settings, setSettings] = useState({});
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    try {
      const r = await authFetch(`${API}/api/admin/settings`);
      const d = await r.json();
      if (r.ok && d.settings) setSettings(d.settings);
    } catch {}
  }, []);

  useEffect(() => { load(); }, [load]);

  const save = async () => {
    setSaving(true);
    try {
      const r = await authFetch(`${API}/api/admin/settings`, { method: 'POST', body: JSON.stringify({ settings }) });
      if (r.ok) { toast('Controls saved!'); await load(); }
      else toast('Failed to save', 'error');
    } catch { toast('Failed', 'error'); }
    finally { setSaving(false); }
  };

  const Toggle = ({ label, description, value, onChange, color = 'var(--accent)', icon }) => (
    <div style={{
      display: 'flex', alignItems: 'flex-start', gap: 14,
      padding: '16px 18px', borderRadius: 12,
      background: value ? `rgba(${color === 'var(--danger)' ? '239,68,68' : color === 'var(--success)' ? '14,203,129' : color === 'var(--primary)' ? '59,130,246' : '14,203,129'},0.06)` : 'var(--bg2)',
      border: `1.5px solid ${value ? (color === 'var(--danger)' ? 'rgba(239,68,68,0.25)' : 'rgba(14,203,129,0.25)') : 'var(--border)'}`,
      transition: 'all 0.2s',
    }}>
      <div style={{ fontSize: 22, flexShrink: 0, marginTop: 2 }}>{icon}</div>
      <div style={{ flex: 1 }}>
        <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 3 }}>{label}</div>
        {description && <div style={{ fontSize: 12, color: 'var(--text2)', lineHeight: 1.5 }}>{description}</div>}
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
        <span style={{ fontSize: 11, fontWeight: 700, color: value ? 'var(--success)' : 'var(--text2)' }}>
          {value ? 'ON' : 'OFF'}
        </span>
        <div
          onClick={onChange}
          style={{
            width: 50, height: 28, borderRadius: 14,
            background: value ? color : 'var(--border)',
            cursor: 'pointer', position: 'relative', transition: 'background 0.2s',
            boxShadow: value ? '0 2px 8px rgba(0,0,0,0.2)' : 'none',
          }}
        >
          <div style={{
            width: 22, height: 22, borderRadius: '50%', background: '#fff',
            position: 'absolute', top: 3, left: value ? 25 : 3,
            transition: 'left 0.2s', boxShadow: '0 1px 4px rgba(0,0,0,0.2)',
          }} />
        </div>
      </div>
    </div>
  );

  return (
    <>
      <div className="page-header">
        <div>
          <h1><Zap size={22} style={{ verticalAlign: 'middle', marginRight: 8 }} />Quick Controls</h1>
          <div className="subtitle">Main admin switch keys — real-time platform controls</div>
        </div>
        <button className="btn btn-primary btn-sm" onClick={save} disabled={saving}>{saving ? 'Saving...' : '💾 Save Changes'}</button>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        {/* App-wide switches */}
        <div className="card" style={{ borderColor: 'rgba(239,68,68,0.2)' }}>
          <div className="card-title" style={{ marginBottom: 14 }}>
            <AlertTriangle size={16} color="var(--danger)" /> App Status
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <Toggle
              icon="🔧"
              label="Maintenance Mode"
              description="When ON, users see a maintenance screen. Only admins can log in."
              value={settings.maintenance_mode === 'true'}
              onChange={() => setSettings(p => ({ ...p, maintenance_mode: p.maintenance_mode === 'true' ? 'false' : 'true' }))}
              color="var(--danger)"
            />
            <Toggle
              icon="👤"
              label="Guest Mode (GUSTMODE Trial)"
              description="When ON, users can register with code GUSTMODE for a free 15-min trial. Max 3 per IP/day, 5 tasks cap, no earnings."
              value={settings.guest_mode_enabled !== '0'}
              onChange={() => setSettings(p => ({ ...p, guest_mode_enabled: p.guest_mode_enabled === '0' ? '1' : '0' }))}
              color="var(--success)"
            />
          </div>
        </div>

        {/* Work time */}
        <div className="card">
          <div className="card-title" style={{ marginBottom: 14 }}>
            <Clock size={16} color="var(--primary)" /> Work Time Restriction
          </div>
          <Toggle
            icon="⏰"
            label="Restrict Work Hours"
            description="When ON, users can only start new tasks within the set hours (Dhaka time). Active jobs can still be completed."
            value={settings.work_time_enabled === '1'}
            onChange={() => setSettings(p => ({ ...p, work_time_enabled: p.work_time_enabled === '1' ? '0' : '1' }))}
            color="var(--primary)"
          />
          {settings.work_time_enabled === '1' && (
            <div style={{ display: 'flex', gap: 12, marginTop: 14 }}>
              <div style={{ flex: 1 }}>
                <label className="input-label">Start Time (Dhaka)</label>
                <input type="time" className="inp" value={settings.work_time_start || '09:00'}
                  onChange={e => setSettings(p => ({ ...p, work_time_start: e.target.value }))} />
              </div>
              <div style={{ flex: 1 }}>
                <label className="input-label">End Time (Dhaka)</label>
                <input type="time" className="inp" value={settings.work_time_end || '22:00'}
                  onChange={e => setSettings(p => ({ ...p, work_time_end: e.target.value }))} />
              </div>
            </div>
          )}
        </div>

        {/* Finance switches */}
        <div className="card">
          <div className="card-title" style={{ marginBottom: 14 }}>
            <CreditCard size={16} /> Withdrawal Rules
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <Toggle
              icon="✅"
              label="Require Daily Tasks Before Withdraw"
              description="Users must complete their daily tasks before they can withdraw."
              value={settings.require_tasks_for_withdraw === 'true'}
              onChange={() => setSettings(p => ({ ...p, require_tasks_for_withdraw: p.require_tasks_for_withdraw === 'true' ? 'false' : 'true' }))}
              color="var(--accent)"
            />
            <Toggle
              icon="📸"
              label="Require Withdraw Proof (Screenshot)"
              description="Users must upload a screenshot as proof when requesting a withdrawal."
              value={settings.require_withdraw_proof === 'true'}
              onChange={() => setSettings(p => ({ ...p, require_withdraw_proof: p.require_withdraw_proof === 'true' ? 'false' : 'true' }))}
              color="var(--accent)"
            />
          </div>
        </div>

        <button className="btn btn-primary btn-full" onClick={save} disabled={saving} style={{ marginTop: 4 }}>
          {saving ? 'Saving...' : '💾 Save All Changes'}
        </button>
      </div>
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
  const [twoFA, setTwoFA] = useState({ enabled: false, qrDataUrl: '', manualCode: '', step: 'idle', code: '', disableCode: '', loading: false });

  const load = useCallback(async () => {
    try {
      const [sr, pr, mr] = await Promise.all([
        authFetch(`${API}/api/admin/settings`),
        authFetch(`${API}/api/admin/plans`),
        authFetch(`${API}/api/admin/me`),
      ]);
      const sd = await sr.json();
      const pd = await pr.json();
      const md = await mr.json();
      if (sr.ok && sd.settings) setSettings(sd.settings);
      if (pr.ok) setPlans(pd.plans || []);
      if (mr.ok && md.user) setTwoFA(p => ({ ...p, enabled: !!md.user.totp_enabled }));
    } catch {}
  }, []);

  const setup2FA = async () => {
    setTwoFA(p => ({ ...p, loading: true }));
    try {
      const r = await authFetch(`${API}/api/admin/2fa/setup`, { method: 'POST' });
      const d = await r.json();
      if (r.ok) setTwoFA(p => ({ ...p, qrDataUrl: d.qrDataUrl, manualCode: d.manualCode, step: 'scan', loading: false }));
      else { toast(d.error || 'Failed', 'error'); setTwoFA(p => ({ ...p, loading: false })); }
    } catch { toast('Failed', 'error'); setTwoFA(p => ({ ...p, loading: false })); }
  };

  const enable2FA = async () => {
    setTwoFA(p => ({ ...p, loading: true }));
    try {
      const r = await authFetch(`${API}/api/admin/2fa/enable`, { method: 'POST', body: JSON.stringify({ totpCode: twoFA.code }) });
      const d = await r.json();
      if (r.ok) { toast('2FA enabled! Keep your authenticator app safe.', 'success'); setTwoFA({ enabled: true, qrDataUrl: '', manualCode: '', step: 'idle', code: '', disableCode: '', loading: false }); }
      else { toast(d.error || 'Invalid code', 'error'); setTwoFA(p => ({ ...p, loading: false })); }
    } catch { toast('Failed', 'error'); setTwoFA(p => ({ ...p, loading: false })); }
  };

  const disable2FA = async () => {
    setTwoFA(p => ({ ...p, loading: true }));
    try {
      const r = await authFetch(`${API}/api/admin/2fa/disable`, { method: 'POST', body: JSON.stringify({ totpCode: twoFA.disableCode }) });
      const d = await r.json();
      if (r.ok) { toast('2FA disabled', 'success'); setTwoFA({ enabled: false, qrDataUrl: '', manualCode: '', step: 'idle', code: '', disableCode: '', loading: false }); }
      else { toast(d.error || 'Invalid code', 'error'); setTwoFA(p => ({ ...p, loading: false })); }
    } catch { toast('Failed', 'error'); setTwoFA(p => ({ ...p, loading: false })); }
  };

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

      {/* 2FA Security Card */}
      <div className="card" style={{ borderColor: twoFA.enabled ? 'rgba(34,197,94,0.3)' : 'rgba(59,130,246,0.2)' }}>
        <div className="card-title"><Shield size={16} color={twoFA.enabled ? 'var(--success)' : 'var(--accent)'} /> Two-Factor Authentication (2FA)</div>
        {twoFA.enabled ? (
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14, padding: '10px 14px', background: 'rgba(34,197,94,0.07)', border: '1px solid rgba(34,197,94,0.2)', borderRadius: 10 }}>
              <div style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--success)', flexShrink: 0 }} />
              <span style={{ fontSize: 13, color: 'var(--success)', fontWeight: 600 }}>2FA is Active</span>
              <span style={{ fontSize: 12, color: 'var(--text2)' }}>— Your account is protected by an authenticator app</span>
            </div>
            {twoFA.step !== 'disable' ? (
              <button className="btn btn-outline btn-sm" style={{ borderColor: 'var(--danger)', color: 'var(--danger)' }} onClick={() => setTwoFA(p => ({ ...p, step: 'disable', disableCode: '' }))}>
                Disable 2FA
              </button>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10, maxWidth: 340 }}>
                <div style={{ fontSize: 13, color: 'var(--text2)' }}>Enter your current authenticator code to disable 2FA:</div>
                <input
                  className="inp"
                  value={twoFA.disableCode}
                  onChange={e => setTwoFA(p => ({ ...p, disableCode: e.target.value.replace(/\D/g, '').slice(0, 6) }))}
                  placeholder="000000"
                  maxLength={6}
                  inputMode="numeric"
                  style={{ letterSpacing: 4, fontSize: 18, textAlign: 'center', fontWeight: 700 }}
                />
                <div style={{ display: 'flex', gap: 8 }}>
                  <button className="btn btn-sm" style={{ background: 'var(--danger)', color: '#fff' }} disabled={twoFA.disableCode.length < 6 || twoFA.loading} onClick={disable2FA}>
                    {twoFA.loading ? 'Disabling...' : 'Confirm Disable'}
                  </button>
                  <button className="btn btn-outline btn-sm" onClick={() => setTwoFA(p => ({ ...p, step: 'idle', disableCode: '' }))}>Cancel</button>
                </div>
              </div>
            )}
          </div>
        ) : twoFA.step === 'idle' ? (
          <div>
            <div style={{ fontSize: 13, color: 'var(--text2)', marginBottom: 14 }}>
              2FA adds an extra layer of security to your admin account. You will need your authenticator app (Google Authenticator, Authy, etc.) every time you log in.
            </div>
            <button className="btn btn-primary btn-sm" onClick={setup2FA} disabled={twoFA.loading}>
              <Shield size={14} /> {twoFA.loading ? 'Loading...' : 'Setup 2FA'}
            </button>
          </div>
        ) : twoFA.step === 'scan' ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div style={{ fontSize: 13, color: 'var(--text2)' }}>
              <strong>Step 1:</strong> Scan the QR code with your authenticator app (Google Authenticator, Authy, etc.):
            </div>
            {twoFA.qrDataUrl && (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: 10 }}>
                <img src={twoFA.qrDataUrl} alt="2FA QR Code" style={{ width: 180, height: 180, border: '2px solid var(--border)', borderRadius: 12, background: '#fff', padding: 8 }} />
                <div style={{ fontSize: 11, color: 'var(--text2)' }}>
                  Can't scan? Use this manual code:<br />
                  <code style={{ fontSize: 12, letterSpacing: 2, color: 'var(--accent)', fontWeight: 700, userSelect: 'all' }}>{twoFA.manualCode}</code>
                </div>
              </div>
            )}
            <div>
              <div style={{ fontSize: 13, color: 'var(--text2)', marginBottom: 8 }}>
                <strong>Step 2:</strong> Enter the 6-digit code shown in your authenticator app to confirm setup:
              </div>
              <input
                className="inp"
                value={twoFA.code}
                onChange={e => setTwoFA(p => ({ ...p, code: e.target.value.replace(/\D/g, '').slice(0, 6) }))}
                placeholder="000000"
                maxLength={6}
                inputMode="numeric"
                style={{ letterSpacing: 4, fontSize: 18, textAlign: 'center', fontWeight: 700, maxWidth: 180 }}
              />
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <button className="btn btn-primary btn-sm" disabled={twoFA.code.length < 6 || twoFA.loading} onClick={enable2FA}>
                {twoFA.loading ? 'Activating...' : 'Activate 2FA'}
              </button>
              <button className="btn btn-outline btn-sm" onClick={() => setTwoFA(p => ({ ...p, step: 'idle', qrDataUrl: '', manualCode: '', code: '' }))}>Cancel</button>
            </div>
          </div>
        ) : null}
      </div>

      <div className="card" style={{ borderColor: 'rgba(99,102,241,0.2)' }}>
        <div className="card-title"><Globe size={16} color="var(--primary)" /> Geographic Restrictions</div>
        <div style={{ fontSize: 12, color: 'var(--text2)', marginBottom: 4, lineHeight: 1.6 }}>
          Block specific countries from accessing manufacturing/work features. Users from these countries will see a "Work Not Available" message.
        </div>
        <label className="input-label" style={{ marginTop: 10 }}>🌍 Work Blocked Countries</label>
        <input className="inp" placeholder="Comma-separated ISO codes, e.g: US,IN,PK" value={settings.work_blocked_countries || ''} onChange={e => setSettings(p => ({ ...p, work_blocked_countries: e.target.value }))} />
        <div style={{ fontSize: 11, color: 'var(--text2)', marginTop: 4 }}>
          Leave blank to allow all countries. Use ISO 3166-1 alpha-2 codes (e.g. <b>BD</b>=Bangladesh, <b>IN</b>=India, <b>US</b>=USA).
        </div>
        <div style={{ marginTop: 12, padding: '8px 12px', background: 'rgba(99,102,241,0.06)', borderRadius: 8, border: '1px solid rgba(99,102,241,0.15)', fontSize: 12, color: 'var(--text2)' }}>
          💡 Announcements → <b>Announcements</b> screen &nbsp;|&nbsp; Payment Numbers → <b>Payment Accounts</b> screen &nbsp;|&nbsp; Toggle switches → <b>Quick Controls</b>
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
        <div style={{ fontSize: 12, color: 'var(--text2)', marginTop: 14, padding: '8px 12px', background: 'rgba(59,130,246,0.06)', borderRadius: 8, border: '1px solid rgba(59,130,246,0.15)' }}>
          💡 Withdrawal toggle switches have moved to <b>Quick Controls</b> in the sidebar.
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

function AutoVerifierWallets({ settings, setSettings }) {
  const VERIFIER_WALLETS = [
    { key: 'crypto_tron_usdt', label: 'TRC20 (Tron USDT)', placeholder: 'T...', hint: 'Starts with T — Tron mainnet' },
    { key: 'crypto_eth_usdt',  label: 'ERC20 (Ethereum USDT)', placeholder: '0x...', hint: 'Starts with 0x — Ethereum mainnet' },
    { key: 'crypto_bsc_usdt',  label: 'BEP20 (BSC USDT)', placeholder: '0x...', hint: 'Starts with 0x — Binance Smart Chain' },
  ];
  const [editingKey, setEditingKey] = useState(null);

  function maskAddr(val) {
    if (!val || val.length <= 10) return val;
    return val.slice(0, 6) + '••••••••' + val.slice(-4);
  }

  return (
    <div className="card" style={{ borderColor: 'rgba(38,161,123,0.3)' }}>
      <div className="card-title" style={{ color: '#26A17B' }}>🔐 Auto-Verifier Deposit Wallets (USDT)</div>
      <div style={{ fontSize: 12, color: 'var(--text2)', marginBottom: 16, lineHeight: 1.6 }}>
        These addresses are used for <b>automatic on-chain verification</b>. When a user submits a TRC20, ERC20, or BEP20 deposit, the system confirms the transaction hash against these wallets and auto-credits the balance instantly.
      </div>
      {VERIFIER_WALLETS.map(({ key, label, placeholder, hint }) => {
        const val = settings[key] || '';
        const isEditing = editingKey === key;
        return (
          <div key={key} style={{ marginBottom: 14, padding: '12px 14px', borderRadius: 10, background: 'var(--bg2)', border: `1px solid ${val ? 'rgba(38,161,123,0.3)' : 'var(--border)'}` }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
              <label className="input-label" style={{ margin: 0, color: val ? '#26A17B' : 'var(--text2)', fontWeight: 700 }}>{label}</label>
              {val && !isEditing && (
                <button className="btn btn-outline btn-sm" style={{ fontSize: 10 }} onClick={() => setEditingKey(key)}>
                  <Edit size={11} /> Edit
                </button>
              )}
            </div>
            {(!val || isEditing) ? (
              <input
                className="inp"
                style={{ marginBottom: 4, fontFamily: 'monospace', fontSize: 12 }}
                placeholder={placeholder}
                value={val}
                onChange={e => setSettings(p => ({ ...p, [key]: e.target.value }))}
                onBlur={() => setEditingKey(null)}
                autoFocus={isEditing}
              />
            ) : (
              <div style={{ fontFamily: 'monospace', fontSize: 12, color: '#26A17B', fontWeight: 600, padding: '6px 0', wordBreak: 'break-all' }}>{maskAddr(val)}</div>
            )}
            <div style={{ fontSize: 11, color: 'var(--text2)', marginTop: 2 }}>{hint}</div>
          </div>
        );
      })}
      <div style={{ padding: '8px 12px', background: 'rgba(38,161,123,0.06)', borderRadius: 8, fontSize: 12, color: 'var(--text2)' }}>
        ⚡ Auto-verification works for TRC20, ERC20, and BEP20 only. Other networks still require manual admin approval.
      </div>
    </div>
  );
}

function PaymentSettingsPage({ authFetch, toast, adminPerms }) {
  const [settings, setSettings] = useState({});
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    try {
      const r = await authFetch(`${API}/api/admin/settings`);
      const d = await r.json();
      if (r.ok && d.settings) setSettings(d.settings);
    } catch {}
  }, []);

  useEffect(() => { load(); }, [load]);

  const save = async () => {
    setSaving(true);
    try {
      const MANAGED_KEYS = [
        'deposit_bkash', 'deposit_nagad', 'deposit_rocket',
        'crypto_tron_usdt', 'crypto_eth_usdt', 'crypto_bsc_usdt',
        ...['eth','op','base','polygon','arbitrum'].flatMap(c => [`crypto_${c}_usdt`, `crypto_${c}_usdc`]),
        ...Array.from({length:10}, (_, i) => `deposit_wallet_${i+1}`),
      ];
      const filtered = Object.fromEntries(MANAGED_KEYS.filter(k => k in settings).map(k => [k, settings[k]]));
      const r = await authFetch(`${API}/api/admin/settings`, { method: 'POST', body: JSON.stringify({ settings: filtered }) });
      if (r.ok) { toast('Payment settings saved'); await load(); }
      else { const d = await r.json(); toast(d.error || 'Failed to save', 'error'); }
    } catch { toast('Failed', 'error'); }
    finally { setSaving(false); }
  };

  return (
    <>
      <div className="page-header">
        <div><h1>Payment Settings</h1><div className="subtitle">Manage payment numbers and wallet addresses</div></div>
        <button className="btn btn-primary btn-sm" onClick={save} disabled={saving}>{saving ? 'Saving...' : 'Save Changes'}</button>
      </div>

      {adminPerms?.modify_payment_numbers && (
        <div className="card">
          <div className="card-title"><CreditCard size={16} /> Payment Account Numbers</div>
          <div className="grid-2">
            {['bkash', 'nagad', 'rocket'].map(m => (
              <div key={m}>
                <label className="input-label">{m.charAt(0).toUpperCase() + m.slice(1)} Number</label>
                <input className="inp" value={settings[`deposit_${m}`] || ''} onChange={e => setSettings(p => ({ ...p, [`deposit_${m}`]: e.target.value }))} />
              </div>
            ))}
          </div>
        </div>
      )}

      {adminPerms?.modify_wallet_addresses && (
        <>
          <AutoVerifierWallets settings={settings} setSettings={setSettings} />

          <div className="card">
            <div className="card-title" style={{ color: 'var(--accent)' }}>💎 Crypto Wallet Addresses</div>
            <div style={{ fontSize: 12, color: 'var(--text2)', marginBottom: 16 }}>
              Enter wallet addresses per blockchain and token.
            </div>
            {[
              { chain: 'eth', label: 'Ethereum' },
              { chain: 'op', label: 'Optimism (OP)' },
              { chain: 'base', label: 'Base' },
              { chain: 'polygon', label: 'Polygon' },
              { chain: 'arbitrum', label: 'Arbitrum' },
            ].map(({ chain, label }) => (
              <div key={chain} style={{ marginBottom: 16, padding: '12px 14px', borderRadius: 10, background: 'var(--bg2)', border: '1px solid var(--border)' }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--accent)', marginBottom: 10, textTransform: 'uppercase' }}>⛓ {label}</div>
                <div className="grid-2">
                  {['usdt', 'usdc'].map(tok => (
                    <div key={tok}>
                      <label className="input-label">{tok.toUpperCase()} Address</label>
                      <input className="inp" placeholder="0x..." value={settings[`crypto_${chain}_${tok}`] || ''} onChange={e => setSettings(p => ({ ...p, [`crypto_${chain}_${tok}`]: e.target.value }))} />
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <div className="card">
            <div className="card-title" style={{ color: '#f59e0b' }}>🔄 Rotating Deposit Wallets (10 slots)</div>
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
                    <div style={{ width: 32, height: 32, borderRadius: 8, flexShrink: 0, background: val ? 'rgba(0,210,180,.15)' : 'var(--bg2)', border: `1px solid ${val ? 'var(--accent)' : 'var(--border)'}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: 12, color: val ? 'var(--accent)' : 'var(--text2)' }}>
                      {i}
                    </div>
                    <input className="inp" style={{ marginBottom: 0 }} placeholder={`Wallet address #${i}...`} value={val} onChange={e => setSettings(p => ({ ...p, [key]: e.target.value }))} />
                  </div>
                );
              })}
            </div>
          </div>
        </>
      )}
    </>
  );
}
