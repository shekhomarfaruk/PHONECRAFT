import { useState, useEffect, useCallback } from "react";
import Icons from "../Icons.jsx";
import { PLANS } from "../data.jsx";
import { I18N } from "../i18n.js";
import { convertCurrency, convertCurrencyText, formatDateTime } from "../currency.js";

const API_URL = import.meta.env.VITE_API_URL || '';

function parseDevice(ua) {
  if (!ua || ua === 'unknown') return 'Unknown';
  if (ua.includes('iPhone'))    return 'iPhone';
  if (ua.includes('iPad'))      return 'iPad';
  if (ua.includes('Android')) {
    const m = ua.match(/Android\s[\d.]+;\s([^)]+)\)/);
    return m ? m[1].split(' Build')[0].trim() : 'Android';
  }
  if (ua.includes('Windows'))   return 'Windows PC';
  if (ua.includes('Macintosh')) return 'Mac';
  if (ua.includes('Linux'))     return 'Linux';
  return ua.substring(0, 30);
}

export default function AdminScreen({ user, showToast, lang }) {
  const t = I18N[lang] || I18N.en;
  const formatMoney = (amount) => convertCurrency(Number(amount) || 0, lang);
  const formatStamp = (value) => formatDateTime(value ? `${value}Z` : '', lang);
  const isMainAdmin = !!user?.isMainAdmin;

  // Tab state
  const [activeTab, setActiveTab] = useState('users');

  // Users tab state
  const [users, setUsers]               = useState([]);
  const [loading, setLoading]           = useState(true);
  const [selectedUser, setSelectedUser] = useState(null);
  const [loginLogs, setLoginLogs]       = useState([]);
  const [logsLoading, setLogsLoading]   = useState(false);
  const [editBalance, setEditBalance]   = useState('');
  const [editPlan, setEditPlan]         = useState('');
  const [editIsAdmin, setEditIsAdmin]   = useState(false);
  const [saving, setSaving]             = useState(false);
  const [searchQuery, setSearchQuery]   = useState('');

  // Transactions tab state
  const [transactions, setTransactions]     = useState([]);
  const [txLoading, setTxLoading]           = useState(false);
  const [processingTxId, setProcessingTxId] = useState(null);
  const [adminNote, setAdminNote]           = useState('');

  // Settings tab state
  const [settingsData, setSettingsData] = useState({ deposit_bkash: '', deposit_nagad: '', deposit_rocket: '', deposit_bank: '' });
  const [settingsSaving, setSettingsSaving] = useState(false);

  const fetchSettings = useCallback(async () => {
    try {
      const res = await fetch(`${API_URL}/api/admin/settings`, { headers });
      const data = await res.json();
      if (res.ok && data.settings) {
        setSettingsData(prev => ({ ...prev, ...data.settings }));
      }
    } catch {}
  }, []);

  const saveSettings = async () => {
    setSettingsSaving(true);
    try {
      const res = await fetch(`${API_URL}/api/admin/settings`, {
        method: 'POST', headers,
        body: JSON.stringify({ settings: settingsData }),
      });
      if (res.ok) showToast('✅ ' + (lang === 'bn' ? 'সেটিংস সংরক্ষিত!' : 'Settings saved!'), 'success');
      else showToast('❌ ' + (lang === 'bn' ? 'সংরক্ষণ ব্যর্থ' : 'Failed to save'), 'error');
    } catch { showToast('❌ Error', 'error'); }
    finally { setSettingsSaving(false); }
  };

  // Dashboard tab state
  const [stats, setStats]             = useState(null);
  const [statsLoading, setStatsLoading] = useState(false);

  const headers = { 'Content-Type': 'application/json', 'x-user-id': String(user.id) };

  // ── Data fetchers ──────────────────────────────────────────────────────────
  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/admin/users`, { headers });
      const data = await res.json();
      if (res.ok) setUsers(data.users || []);
      else showToast(t.toast_connection_error);
    } catch { showToast(t.toast_connection_error); }
    finally { setLoading(false); }
  }, []);

  const fetchTransactions = useCallback(async () => {
    setTxLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/admin/transactions`, { headers });
      const data = await res.json();
      if (res.ok) setTransactions(data.transactions || []);
      else showToast(t.toast_connection_error);
    } catch { showToast(t.toast_connection_error); }
    finally { setTxLoading(false); }
  }, []);

  const fetchStats = useCallback(async () => {
    setStatsLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/admin/stats`, { headers });
      const data = await res.json();
      if (res.ok) setStats(data);
      else showToast(t.toast_connection_error);
    } catch { showToast(t.toast_connection_error); }
    finally { setStatsLoading(false); }
  }, []);

  useEffect(() => { fetchUsers(); }, [fetchUsers]);

  useEffect(() => {
    if (activeTab === 'transactions') fetchTransactions();
    if (activeTab === 'dashboard') fetchStats();
    if (activeTab === 'settings') fetchSettings();
  }, [activeTab]);

  useEffect(() => {
    if (!isMainAdmin && (activeTab === 'admins' || activeTab === 'settings')) {
      setActiveTab('users');
    }
  }, [isMainAdmin, activeTab]);

  // ── User actions ───────────────────────────────────────────────────────────
  const selectUser = async (u) => {
    setSelectedUser(u);
    setEditBalance(String(u.balance));
    setEditPlan(u.plan_id);
    setEditIsAdmin(!!u.is_admin);
    setLogsLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/admin/users/${u.id}/logs`, { headers });
      const data = await res.json();
      if (res.ok) setLoginLogs(data.logs || []);
    } catch {}
    finally { setLogsLoading(false); }
  };

  const saveUser = async () => {
    if (!selectedUser) return;
    setSaving(true);
    try {
      const res = await fetch(`${API_URL}/api/admin/users/${selectedUser.id}`, {
        method: 'PATCH', headers,
        body: JSON.stringify({
          balance: Number(editBalance), plan_id: editPlan,
          banned: selectedUser.banned, is_admin: editIsAdmin,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        showToast(t.admin_user_updated);
        fetchUsers();
        setSelectedUser(prev => ({
          ...prev, balance: data.user.balance,
          plan_id: data.user.plan_id, is_admin: data.user.is_admin,
        }));
      } else { showToast(data.error || t.toast_connection_error); }
    } catch { showToast(t.toast_connection_error); }
    finally { setSaving(false); }
  };

  const toggleBan = async (u) => {
    const newBanned = u.banned ? 0 : 1;
    try {
      const res = await fetch(`${API_URL}/api/admin/users/${u.id}`, {
        method: 'PATCH', headers,
        body: JSON.stringify({ banned: newBanned }),
      });
      const data = await res.json();
      if (res.ok) {
        showToast(newBanned ? t.admin_user_banned : t.admin_user_unbanned);
        fetchUsers();
        if (selectedUser?.id === u.id) setSelectedUser(prev => ({ ...prev, banned: newBanned }));
      } else { showToast(data.error || t.toast_connection_error); }
    } catch { showToast(t.toast_connection_error); }
  };

  // ── Transaction actions ────────────────────────────────────────────────────
  const handleTransaction = async (txId, status) => {
    setProcessingTxId(txId);
    try {
      const res = await fetch(`${API_URL}/api/admin/transactions/${txId}`, {
        method: 'PATCH', headers,
        body: JSON.stringify({ status, admin_note: adminNote }),
      });
      const data = await res.json();
      if (res.ok) {
        showToast(lang === 'bn'
          ? `ট্রান্সঅ্যাকশন ${status === 'approved' ? 'অনুমোদিত' : 'প্রত্যাখ্যাত'}`
          : `Transaction ${status}`);
        setAdminNote('');
        setProcessingTxId(null);
        fetchTransactions();
      } else {
        showToast(data.error || t.toast_connection_error);
      }
    } catch { showToast(t.toast_connection_error); }
    finally { setProcessingTxId(null); }
  };

  // ── Filters ────────────────────────────────────────────────────────────────
  const filtered = searchQuery
    ? users.filter(u =>
        u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        u.identifier.toLowerCase().includes(searchQuery.toLowerCase()) ||
        u.refer_code.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : users;

  return (
    <>
      <div className="screen-title"><Icons.Shield size={18} /> {t.admin_panel}</div>

      {/* Tab bar */}
      <div style={{
        display: 'flex', gap: 0, marginBottom: 16, borderRadius: 10, overflow: 'hidden',
        border: '1px solid var(--border)', background: 'var(--card)',
      }}>
        {[
          { id: 'users', label: t.admin_users, icon: <Icons.User size={14} /> },
          ...(isMainAdmin ? [{ id: 'admins', label: t.admin_admins, icon: <Icons.Shield size={14} /> }] : []),
          { id: 'transactions', label: t.admin_transactions, icon: <Icons.Wallet size={14} /> },
          { id: 'dashboard', label: t.admin_dashboard, icon: <Icons.TrendUp size={14} /> },
          ...(isMainAdmin ? [{ id: 'settings', label: lang === 'bn' ? 'সেটিংস' : 'Settings', icon: <Icons.Settings size={14} /> }] : []),
        ].map(tab => (
          <div key={tab.id} onClick={() => setActiveTab(tab.id)} style={{
            flex: 1, padding: '10px 8px', textAlign: 'center', cursor: 'pointer',
            fontSize: 12, fontWeight: 700, letterSpacing: 0.5,
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
            background: activeTab === tab.id ? 'var(--accent)' : 'transparent',
            color: activeTab === tab.id ? '#fff' : 'var(--text2)',
            transition: 'all 0.2s',
          }}>
            {tab.icon} {tab.label}
          </div>
        ))}
      </div>

      {/* ══════════════════════════════════════════════════════════════════════ */}
      {/* USERS TAB */}
      {/* ══════════════════════════════════════════════════════════════════════ */}
      {activeTab === 'users' && (
        <>
          {/* Stats */}
          <div className="stats-row">
            <div className="stat-box">
              <div className="stat-num">{users.length}</div>
              <div className="stat-label">{t.admin_total_users}</div>
            </div>
            <div className="stat-box">
              <div className="stat-num">{users.filter(u => u.banned).length}</div>
              <div className="stat-label">{t.admin_banned}</div>
            </div>
            <div className="stat-box">
              <div className="stat-num">{users.filter(u => !u.banned && !u.is_admin).length}</div>
              <div className="stat-label">{t.admin_active}</div>
            </div>
          </div>

          {/* Search */}
          <div className="card" style={{ padding: '12px 16px' }}>
            <input className="inp" placeholder={t.admin_search_ph}
              value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
              style={{ marginBottom: 0 }} />
          </div>

          {/* Selected user detail panel */}
          {selectedUser && (
            <div className="card" style={{ borderColor: 'var(--accent)', boxShadow: 'var(--glow)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                <div className="card-title" style={{ marginBottom: 0 }}>
                  <Icons.User size={14} /> {selectedUser.name}
                </div>
                <div className="icon-btn" onClick={() => setSelectedUser(null)}><Icons.X size={16} /></div>
              </div>

              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 14 }}>
                <span className="badge badge-blue">ID: {selectedUser.id}</span>
                <span className="badge badge-blue">{selectedUser.identifier}</span>
                <span className="badge badge-blue">REF: {selectedUser.refer_code}</span>
                {selectedUser.referred_by && <span className="badge badge-blue">BY: {selectedUser.referred_by}</span>}
                <span className={`badge ${selectedUser.banned ? 'badge-orange' : 'badge-green'}`}>
                  {selectedUser.banned ? t.admin_banned : t.admin_active}
                </span>
                {selectedUser.is_admin ? <span className="badge badge-green">{t.admin_admin_label}</span> : null}
              </div>

              {/* Edit form */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 12 }}>
                <div className="input-wrap" style={{ marginBottom: 0 }}>
                  <label className="input-label">{t.admin_balance}</label>
                  <input className="inp" type="number" value={editBalance}
                    onChange={e => setEditBalance(e.target.value)} />
                </div>
                <div className="input-wrap" style={{ marginBottom: 0 }}>
                  <label className="input-label">{t.admin_plan}</label>
                  <select className="inp" value={editPlan} onChange={e => setEditPlan(e.target.value)}>
                    {PLANS.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                  </select>
                </div>
              </div>

              {/* Admin toggle */}
              {isMainAdmin && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
                <label className="input-label" style={{ marginBottom: 0 }}>{t.admin_admin_label}</label>
                <div
                  onClick={() => {
                    if (selectedUser.id === user.id) {
                      showToast(t.admin_cannot_self_demote);
                      return;
                    }
                    setEditIsAdmin(!editIsAdmin);
                  }}
                  style={{
                    width: 44, height: 24, borderRadius: 12,
                    background: editIsAdmin ? '#0ECB81' : 'var(--border)',
                    cursor: selectedUser.id === user.id ? 'not-allowed' : 'pointer',
                    position: 'relative', transition: 'background 0.2s',
                  }}
                >
                  <div style={{
                    width: 20, height: 20, borderRadius: '50%', background: '#fff',
                    position: 'absolute', top: 2,
                    left: editIsAdmin ? 22 : 2,
                    transition: 'left 0.2s',
                  }} />
                </div>
                {editIsAdmin && <span className="badge badge-green">{t.admin_admin_label}</span>}
              </div>
              )}

              <div style={{ display: 'flex', gap: 8 }}>
                <button className="btn btn-primary" onClick={saveUser} disabled={saving} style={{ flex: 1 }}>
                  {saving ? t.admin_saving : t.admin_save}
                </button>
                <button className={`btn ${selectedUser.banned ? 'btn-success' : 'btn-danger'}`}
                  onClick={() => toggleBan(selectedUser)} style={{ flex: 1 }}>
                  {selectedUser.banned ? t.admin_unban_user : t.admin_ban_user}
                </button>
              </div>

              {/* Login History */}
              <div style={{ marginTop: 16 }}>
                <div className="card-title"><Icons.Lock size={14} /> {t.admin_login_history}</div>
                {logsLoading ? (
                  <div style={{ textAlign: 'center', padding: 20, color: 'var(--text2)' }}>{t.admin_loading}</div>
                ) : loginLogs.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: 20, color: 'var(--text2)', fontSize: 13 }}>{t.admin_no_logs}</div>
                ) : (
                  <div style={{ maxHeight: 240, overflowY: 'auto' }}>
                    {loginLogs.map(log => (
                      <div key={log.id} style={{
                        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                        padding: '8px 0', borderBottom: '1px solid var(--border)', fontSize: 12,
                      }}>
                        <div>
                          <div style={{ fontFamily: 'JetBrains Mono', color: 'var(--accent)' }}>{log.ip || 'localhost'}</div>
                          <div style={{ color: 'var(--text2)', fontSize: 11 }}>{parseDevice(log.user_agent)}</div>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                          <div style={{ fontWeight: 600 }}>
                            {log.city}{log.city && log.country ? ', ' : ''}{log.country || (log.city ? '' : 'Local')}
                          </div>
                          <div style={{ color: 'var(--text2)', fontSize: 10 }}>
                            {formatStamp(log.logged_at)}
                          </div>
                        </div>
                      </div>
                    ))}
                </div>
                )}
              </div>
            </div>
          )}

          {/* User list */}
          {loading ? (
            <div className="card" style={{ textAlign: 'center', padding: 40 }}>
              <div style={{ color: 'var(--text2)' }}>{t.admin_loading_users}</div>
            </div>
          ) : filtered.length === 0 ? (
            <div className="card" style={{ textAlign: 'center', padding: 40, color: 'var(--text2)', fontSize: 13 }}>
              {t.admin_no_users}
            </div>
          ) : (
            filtered.map(u => (
              <div key={u.id} className="card" onClick={() => selectUser(u)}
                style={{
                  cursor: 'pointer', padding: '12px 16px',
                  borderColor: selectedUser?.id === u.id ? 'var(--accent)' : undefined,
                  opacity: u.banned ? 0.6 : 1,
                }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{
                    width: 40, height: 40, borderRadius: '50%',
                    background: 'linear-gradient(135deg, var(--accent), var(--accent2))',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 16, fontWeight: 700, flexShrink: 0,
                  }}>{u.avatar || u.name[0]}</div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
                      <span style={{ fontWeight: 700, fontSize: 14 }}>{u.name}</span>
                      {u.is_admin ? <span className="badge badge-blue" style={{ fontSize: 8, padding: '1px 5px' }}>{t.admin_admin_label}</span> : null}
                      <span className={`badge ${u.banned ? 'badge-orange' : 'badge-green'}`} style={{ fontSize: 8, padding: '1px 5px' }}>
                        {u.banned ? t.admin_banned : t.admin_active}
                      </span>
                      <span className="badge badge-blue" style={{ fontSize: 8, padding: '1px 5px', color: u.plan_color }}>
                        {u.plan_name}
                      </span>
                    </div>
                    <div style={{ fontSize: 11, color: 'var(--text2)', marginTop: 2 }}>
                      {u.identifier} | REF: {u.refer_code} | {lang === 'bn' ? 'ব্যালেন্স' : 'Balance'}: {formatMoney(u.balance)}
                    </div>
                    {u.lastLogin && (
                      <div style={{ fontSize: 10, color: 'var(--text2)', marginTop: 2 }}>
                        Last: {u.lastLogin.ip || 'local'}
                        {u.lastLogin.city ? ` - ${u.lastLogin.city}, ${u.lastLogin.country}` : ''}
                        {' | '}{parseDevice(u.lastLogin.user_agent)}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </>
      )}

      {/* ══════════════════════════════════════════════════════════════════════ */}
      {/* ADMINS TAB */}
      {/* ══════════════════════════════════════════════════════════════════════ */}
      {activeTab === 'admins' && (
        <>
          <div className="stats-row">
            <div className="stat-box">
              <div className="stat-num">{users.filter(u => u.is_admin).length}</div>
              <div className="stat-label">{t.admin_admins}</div>
            </div>
            <div className="stat-box">
              <div className="stat-num">{users.length}</div>
              <div className="stat-label">{t.admin_total_users}</div>
            </div>
            <div className="stat-box">
              <div className="stat-num">{users.filter(u => !u.banned && !u.is_admin).length}</div>
              <div className="stat-label">{t.admin_active}</div>
            </div>
          </div>

          {loading ? (
            <div className="card" style={{ textAlign: 'center', padding: 40 }}>
              <div style={{ color: 'var(--text2)' }}>{t.admin_loading_users}</div>
            </div>
          ) : users.filter(u => u.is_admin).length === 0 ? (
            <div className="card" style={{ textAlign: 'center', padding: 40, color: 'var(--text2)', fontSize: 13 }}>
              No admins found
            </div>
          ) : (
            users.filter(u => u.is_admin).map(u => (
              <div key={u.id} className="card" style={{ padding: '14px 16px', borderColor: 'rgba(35,175,145,0.3)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{
                    width: 44, height: 44, borderRadius: 10,
                    background: 'linear-gradient(135deg, var(--accent), var(--accent2))',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 18, fontWeight: 700, flexShrink: 0, color: '#fff',
                  }}>{u.avatar || u.name[0]}</div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                      <span style={{ fontWeight: 700, fontSize: 15 }}>{u.name}</span>
                      <span className="badge badge-green" style={{ fontSize: 9, padding: '2px 6px' }}>
                        <Icons.Shield size={10} /> {t.admin_admin_label}
                      </span>
                      {u.id === user.id && (
                        <span className="badge badge-blue" style={{ fontSize: 8, padding: '1px 5px' }}>YOU</span>
                      )}
                    </div>
                    <div style={{ fontSize: 12, color: 'var(--text2)', marginTop: 3, fontFamily: 'JetBrains Mono' }}>
                      {u.identifier}
                    </div>
                    <div style={{ display: 'flex', gap: 10, marginTop: 6, fontSize: 11, color: 'var(--text2)', flexWrap: 'wrap' }}>
                      <span>REF: <span style={{ color: 'var(--accent)', fontWeight: 600 }}>{u.refer_code}</span></span>
                      <span>{lang === 'bn' ? 'ব্যালেন্স' : 'Balance'}: <span style={{ color: 'var(--accent)', fontWeight: 600 }}>{formatMoney(u.balance)}</span></span>
                      <span>Plan: <span style={{ color: u.plan_color || 'var(--accent)', fontWeight: 600 }}>{u.plan_name}</span></span>
                    </div>
                    {u.lastLogin && (
                      <div style={{ fontSize: 10, color: 'var(--text2)', marginTop: 4 }}>
                        {lang === 'bn' ? 'সর্বশেষ লগইন' : 'Last login'}: {u.lastLogin.ip || 'local'}
                        {u.lastLogin.city ? ` — ${u.lastLogin.city}, ${u.lastLogin.country}` : ''}
                        {' | '}{parseDevice(u.lastLogin.user_agent)}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </>
      )}

      {/* ══════════════════════════════════════════════════════════════════════ */}
      {/* TRANSACTIONS TAB */}
      {/* ══════════════════════════════════════════════════════════════════════ */}
      {activeTab === 'transactions' && (
        <>
          {txLoading ? (
            <div className="card" style={{ textAlign: 'center', padding: 40 }}>
              <div style={{ color: 'var(--text2)' }}>{t.admin_loading_tx}</div>
            </div>
          ) : transactions.length === 0 ? (
            <div className="card" style={{ textAlign: 'center', padding: 40, color: 'var(--text2)', fontSize: 13 }}>
              {t.admin_no_transactions}
            </div>
          ) : (
            transactions.map(tx => (
              <div key={tx.id} className="card" style={{ padding: '12px 16px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ fontSize: 18 }}>{tx.type === 'deposit' ? '\u{1F4B0}' : '\u{1F4B8}'}</span>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: 14 }}>
                        {tx.type === 'deposit' ? t.deposit : t.withdraw} — {formatMoney(tx.amount)}
                      </div>
                      <div style={{ fontSize: 11, color: 'var(--text2)' }}>
                        {tx.user_name} ({tx.user_identifier}) | {tx.method} — {tx.account}
                      </div>
                    </div>
                  </div>
                  <span className={`badge ${
                    tx.status === 'approved' ? 'badge-green' :
                    tx.status === 'rejected' ? 'badge-orange' : 'badge-blue'
                  }`}>
                    {tx.status === 'approved' ? t.approved : tx.status === 'rejected' ? t.rejected : t.pending}
                  </span>
                </div>
                <div style={{ fontSize: 11, color: 'var(--text2)', marginBottom: 8 }}>
                  {formatStamp(tx.created_at)}
                  {tx.admin_note ? ` | ${lang === 'bn' ? 'নোট' : 'Note'}: ${convertCurrencyText(tx.admin_note, lang)}` : ''}
                </div>
                {tx.status === 'pending' && (
                  <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                    <input className="inp" placeholder={t.admin_note_ph}
                      value={processingTxId === tx.id ? adminNote : ''}
                      onFocus={() => { setProcessingTxId(tx.id); setAdminNote(''); }}
                      onChange={e => setAdminNote(e.target.value)}
                      style={{ flex: 1, fontSize: 12, padding: '6px 10px', marginBottom: 0 }}
                    />
                    <button className="btn btn-success"
                      style={{ fontSize: 11, padding: '6px 12px' }}
                      disabled={processingTxId !== null}
                      onClick={() => handleTransaction(tx.id, 'approved')}>
                      {processingTxId === tx.id ? '...' : t.admin_approve}
                    </button>
                    <button className="btn btn-danger"
                      style={{ fontSize: 11, padding: '6px 12px' }}
                      disabled={processingTxId !== null}
                      onClick={() => handleTransaction(tx.id, 'rejected')}>
                      {t.admin_reject}
                    </button>
                  </div>
                )}
              </div>
            ))
          )}
        </>
      )}

      {/* ══════════════════════════════════════════════════════════════════════ */}
      {/* DASHBOARD TAB */}
      {/* ══════════════════════════════════════════════════════════════════════ */}
      {activeTab === 'dashboard' && (
        <>
          {statsLoading || !stats ? (
            <div className="card" style={{ textAlign: 'center', padding: 40 }}>
              <div style={{ color: 'var(--text2)' }}>{t.admin_loading_dash}</div>
            </div>
          ) : (
            <>
              {/* Row 1: Withdrawals, Deposits, Pending */}
              <div className="stats-row">
                <div className="stat-box">
                  <div className="stat-num">{stats.withdrawals.count}</div>
                  <div className="stat-label">{t.admin_withdrawals}</div>
                  <div style={{ fontSize: 11, color: 'var(--text2)', marginTop: 4 }}>
                    {formatMoney(stats.withdrawals.sum)}
                  </div>
                </div>
                <div className="stat-box">
                  <div className="stat-num">{stats.deposits.count}</div>
                  <div className="stat-label">{t.admin_deposits}</div>
                  <div style={{ fontSize: 11, color: 'var(--text2)', marginTop: 4 }}>
                    {formatMoney(stats.deposits.sum)}
                  </div>
                </div>
                <div className="stat-box">
                  <div className="stat-num" style={{ color: '#FCD535' }}>{stats.pendingCount}</div>
                  <div className="stat-label">{t.admin_pending}</div>
                </div>
              </div>

              {/* Row 2: Referrals, Today's Earnings, All-Time Earnings */}
              <div className="stats-row">
                <div className="stat-box">
                  <div className="stat-num">{stats.referralCount}</div>
                  <div className="stat-label">{t.admin_referrals}</div>
                </div>
                <div className="stat-box">
                  <div className="stat-num" style={{ fontSize: 16 }}>{formatMoney(stats.todayEarnings)}</div>
                  <div className="stat-label">{t.admin_today_earned}</div>
                </div>
                <div className="stat-box">
                  <div className="stat-num" style={{ fontSize: 16 }}>{formatMoney(stats.alltimeEarnings)}</div>
                  <div className="stat-label">{t.admin_alltime_earned}</div>
                </div>
              </div>

              {/* Profit/Loss card */}
              <div className="card" style={{ textAlign: 'center' }}>
                <div className="card-title"><Icons.TrendUp size={14} /> {t.admin_profit_loss}</div>
                <div style={{
                  fontFamily: 'Space Grotesk', fontSize: 28, fontWeight: 900,
                  color: stats.profitLoss >= 0 ? '#0ECB81' : '#F6465D',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                }}>
                  {stats.profitLoss >= 0 ? '+' : '-'}{formatMoney(Math.abs(stats.profitLoss))}
                </div>
                <div style={{ fontSize: 12, color: 'var(--text2)', marginTop: 8 }}>
                  {t.admin_deposits} ({formatMoney(stats.deposits.sum)})
                  {' - '}{t.admin_withdrawals} ({formatMoney(stats.withdrawals.sum)})
                </div>
              </div>

              {/* Daily users summary */}
              <div className="card">
                <div className="card-title"><Icons.User size={14} /> {t.admin_users_overview}</div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  <div style={{ padding: '10px', borderRadius: 8, background: 'rgba(35,175,145,0.1)', textAlign: 'center' }}>
                    <div style={{ fontFamily: 'Space Grotesk', fontSize: 20, fontWeight: 700, color: '#23AF91' }}>
                      {users.length}
                    </div>
                    <div style={{ fontSize: 10, color: 'var(--text2)', marginTop: 4 }}>{t.admin_total_users}</div>
                  </div>
                  <div style={{ padding: '10px', borderRadius: 8, background: 'rgba(14,203,129,0.1)', textAlign: 'center' }}>
                    <div style={{ fontFamily: 'Space Grotesk', fontSize: 20, fontWeight: 700, color: '#0ECB81' }}>
                      {users.filter(u => u.is_admin).length}
                    </div>
                    <div style={{ fontSize: 10, color: 'var(--text2)', marginTop: 4 }}>{t.admin_admins}</div>
                  </div>
                  <div style={{ padding: '10px', borderRadius: 8, background: 'rgba(246,70,93,0.1)', textAlign: 'center' }}>
                    <div style={{ fontFamily: 'Space Grotesk', fontSize: 20, fontWeight: 700, color: '#F6465D' }}>
                      {users.filter(u => u.banned).length}
                    </div>
                    <div style={{ fontSize: 10, color: 'var(--text2)', marginTop: 4 }}>{t.admin_banned}</div>
                  </div>
                  <div style={{ padding: '10px', borderRadius: 8, background: 'rgba(99,102,241,0.1)', textAlign: 'center' }}>
                    <div style={{ fontFamily: 'Space Grotesk', fontSize: 20, fontWeight: 700, color: '#6366F1' }}>
                      {stats.referralCount}
                    </div>
                    <div style={{ fontSize: 10, color: 'var(--text2)', marginTop: 4 }}>{t.admin_referred}</div>
                  </div>
                </div>
              </div>
            </>
          )}
        </>
      )}

      {/* ══════════════════════════════════════════════════════════════════════ */}
      {/* SETTINGS TAB */}
      {/* ══════════════════════════════════════════════════════════════════════ */}
      {activeTab === 'settings' && (
        <>
          <div className="card">
            <div className="card-title">💳 {lang === 'bn' ? 'ডিপোজিট নম্বর সেটিংস' : 'Deposit Payment Numbers'}</div>
            <div style={{ fontSize: 13, color: 'var(--text2)', marginBottom: 14 }}>
              {lang === 'bn' ? 'ব্যবহারকারীরা ডিপোজিটের সময় এই নম্বরগুলো দেখতে পাবেন।' : 'Users will see these numbers on the deposit screen.'}
            </div>
            {[
              { key: 'deposit_bkash',  label: 'bKash',   placeholder: '017XXXXXXXX' },
              { key: 'deposit_nagad',  label: 'Nagad',   placeholder: '016XXXXXXXX' },
              { key: 'deposit_rocket', label: 'Rocket',  placeholder: '018XXXXXXXX' },
              { key: 'deposit_bank',   label: lang === 'bn' ? 'ব্যাংক অ্যাকাউন্ট' : 'Bank Account', placeholder: 'XXXXXXXXXXXXXXXX' },
            ].map(({ key, label, placeholder }) => (
              <div key={key} className="input-wrap">
                <label className="input-label">{label}</label>
                <input
                  className="inp"
                  placeholder={placeholder}
                  value={settingsData[key] || ''}
                  onChange={e => setSettingsData(p => ({ ...p, [key]: e.target.value }))}
                />
              </div>
            ))}
            <button
              className="btn btn-primary btn-full"
              disabled={settingsSaving}
              onClick={saveSettings}
            >
              {settingsSaving
                ? (lang === 'bn' ? 'সংরক্ষণ হচ্ছে...' : 'Saving...')
                : (lang === 'bn' ? '💾 সংরক্ষণ করুন' : '💾 Save Settings')
              }
            </button>
          </div>
        </>
      )}

      <div style={{ height: 16 }} />
    </>
  );
}
