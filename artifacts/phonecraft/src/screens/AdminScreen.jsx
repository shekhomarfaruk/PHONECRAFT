import { useState, useEffect, useCallback, useRef } from "react";
import Icons from "../Icons.jsx";
import { PLANS } from "../data.jsx";
import { I18N } from "../i18n.js";
import { convertCurrency, convertCurrencyText, formatDateTime } from "../currency.js";
import { authFetch } from "../session.js";

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

function MiniBarChart({ data, maxH = 60 }) {
  if (!data || data.length === 0) return null;
  const max = Math.max(...data.map(d => Math.max(d.deposits || 0, d.withdrawals || 0)), 1);
  return (
    <div style={{ display: 'flex', alignItems: 'flex-end', gap: 2, height: maxH, padding: '8px 0' }}>
      {data.slice(-14).map((d, i) => (
        <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1 }}>
          <div style={{
            width: '100%', borderRadius: 2,
            height: Math.max(2, (d.deposits / max) * maxH),
            background: '#0ECB81',
          }} title={`Dep: ৳${d.deposits}`} />
          <div style={{
            width: '100%', borderRadius: 2,
            height: Math.max(2, (d.withdrawals / max) * maxH),
            background: '#F6465D',
          }} title={`Wd: ৳${d.withdrawals}`} />
        </div>
      ))}
    </div>
  );
}

export default function AdminScreen({ user, showToast, lang }) {
  const t = I18N[lang] || I18N.en;
  const isBn = lang === 'bn';
  const formatMoney = (amount) => convertCurrency(Number(amount) || 0, lang);
  const formatStamp = (value) => formatDateTime(value ? `${value}Z` : '', lang);
  const isMainAdmin = !!user?.isMainAdmin;

  const authHeaders = {
    'Content-Type': 'application/json',
    ...(user?.authToken ? { Authorization: `Bearer ${user.authToken}` } : {}),
  };

  const showApiError = (data, fallback) => {
    const msg = data?.error || fallback || t.toast_connection_error;
    showToast(msg, 'error');
  };

  const [activeTab, setActiveTab] = useState('dashboard');

  // ── Users tab state ──────────────────────────────────────────────
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [profileTab, setProfileTab] = useState('info');
  const [loginLogs, setLoginLogs] = useState([]);
  const [logsLoading, setLogsLoading] = useState(false);
  const [editBalance, setEditBalance] = useState('');
  const [editPlan, setEditPlan] = useState('');
  const [editIsAdmin, setEditIsAdmin] = useState(false);
  const [addBalanceAmount, setAddBalanceAmount] = useState('');
  const [saving, setSaving] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [userStatusFilter, setUserStatusFilter] = useState('all');
  const [bulkSelected, setBulkSelected] = useState(new Set());
  const [bulkMode, setBulkMode] = useState(false);

  // ── Messages state ──────────────────────────────────────────────
  const [messageTarget, setMessageTarget] = useState('all');
  const [messageUserId, setMessageUserId] = useState('');
  const [messageText, setMessageText] = useState('');
  const [messageSending, setMessageSending] = useState(false);

  // ── Transactions tab state ──────────────────────────────────────
  const [transactions, setTransactions] = useState([]);
  const [txLoading, setTxLoading] = useState(false);
  const [processingTxId, setProcessingTxId] = useState(null);
  const [adminNote, setAdminNote] = useState('');
  const [txFilter, setTxFilter] = useState('pending');
  const [txTypeFilter, setTxTypeFilter] = useState('all');

  // ── Settings tab state ──────────────────────────────────────────
  const [settingsData, setSettingsData] = useState({});
  const [settingsSaving, setSettingsSaving] = useState(false);
  const [plans, setPlans] = useState([]);
  const [editingPlan, setEditingPlan] = useState(null);

  // ── Dashboard tab state ─────────────────────────────────────────
  const [stats, setStats] = useState(null);
  const [statsLoading, setStatsLoading] = useState(false);

  // ── Support tab state ───────────────────────────────────────────
  const [supportSessions, setSupportSessions] = useState([]);
  const [supportLoading, setSupportLoading] = useState(false);
  const [activeSupportSession, setActiveSupportSession] = useState(null);
  const [supportMessages, setSupportMessages] = useState([]);
  const [supportMsgsLoading, setSupportMsgsLoading] = useState(false);
  const [supportReply, setSupportReply] = useState('');
  const [supportReplying, setSupportReplying] = useState(false);
  const [cannedResponses, setCannedResponses] = useState([]);
  const [newCanned, setNewCanned] = useState({ title: '', message: '', category: 'general' });
  const [supportFilter, setSupportFilter] = useState('all');

  // ── Admin/Roles tab state ───────────────────────────────────────
  const [adminLogs, setAdminLogs] = useState([]);
  const [adminLogsLoading, setAdminLogsLoading] = useState(false);
  const [editPermissions, setEditPermissions] = useState(null);
  const [permData, setPermData] = useState({});

  // ── Data fetchers ───────────────────────────────────────────────
  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const res = await authFetch(`${API_URL}/api/admin/users`, { headers: authHeaders });
      const data = await res.json();
      if (res.ok) setUsers(data.users || []);
      else showApiError(data);
    } catch { showToast(t.toast_connection_error, 'error'); }
    finally { setLoading(false); }
  }, [user?.authToken, lang]);

  const fetchTransactions = useCallback(async () => {
    setTxLoading(true);
    try {
      const res = await authFetch(`${API_URL}/api/admin/transactions`, { headers: authHeaders });
      const data = await res.json();
      if (res.ok) setTransactions(data.transactions || []);
      else showApiError(data);
    } catch { showToast(t.toast_connection_error, 'error'); }
    finally { setTxLoading(false); }
  }, [user?.authToken, lang]);

  const fetchStats = useCallback(async () => {
    setStatsLoading(true);
    try {
      const res = await authFetch(`${API_URL}/api/admin/stats`, { headers: authHeaders });
      const data = await res.json();
      if (res.ok) setStats(data);
      else showApiError(data);
    } catch { showToast(t.toast_connection_error, 'error'); }
    finally { setStatsLoading(false); }
  }, [user?.authToken, lang]);

  const fetchSettings = useCallback(async () => {
    try {
      const res = await authFetch(`${API_URL}/api/admin/settings`, { headers: authHeaders });
      const data = await res.json();
      if (res.ok && data.settings) setSettingsData(prev => ({ ...prev, ...data.settings }));
    } catch {}
  }, [user?.authToken]);

  const fetchPlans = useCallback(async () => {
    try {
      const res = await authFetch(`${API_URL}/api/admin/plans`, { headers: authHeaders });
      const data = await res.json();
      if (res.ok) setPlans(data.plans || []);
    } catch {}
  }, [user?.authToken]);

  const fetchSupportSessions = useCallback(async () => {
    setSupportLoading(true);
    try {
      const res = await authFetch(`${API_URL}/api/admin/support/sessions`, { headers: authHeaders });
      const data = await res.json();
      if (res.ok) setSupportSessions(data.sessions || []);
    } catch {}
    finally { setSupportLoading(false); }
  }, [user?.authToken]);

  const fetchSupportMessages = useCallback(async (sessionId) => {
    setSupportMsgsLoading(true);
    try {
      const res = await authFetch(`${API_URL}/api/admin/support/messages/${sessionId}`, { headers: authHeaders });
      const data = await res.json();
      if (res.ok) setSupportMessages(data.messages || []);
    } catch {}
    finally { setSupportMsgsLoading(false); }
  }, [user?.authToken]);

  const fetchCannedResponses = useCallback(async () => {
    try {
      const res = await authFetch(`${API_URL}/api/admin/canned-responses`, { headers: authHeaders });
      const data = await res.json();
      if (res.ok) setCannedResponses(data.responses || []);
    } catch {}
  }, [user?.authToken]);

  const fetchAdminLogs = useCallback(async () => {
    setAdminLogsLoading(true);
    try {
      const res = await authFetch(`${API_URL}/api/admin/activity-log`, { headers: authHeaders });
      const data = await res.json();
      if (res.ok) setAdminLogs(data.logs || []);
    } catch {}
    finally { setAdminLogsLoading(false); }
  }, [user?.authToken]);


  useEffect(() => { fetchUsers(); }, [fetchUsers]);

  useEffect(() => {
    if (activeTab === 'transactions') fetchTransactions();
    if (activeTab === 'dashboard') fetchStats();
    if (activeTab === 'settings') { fetchSettings(); fetchPlans(); }
    if (activeTab === 'support') { fetchSupportSessions(); fetchCannedResponses(); }
    if (activeTab === 'admins') fetchAdminLogs();
  }, [activeTab]);

  useEffect(() => {
    if (!isMainAdmin && ['admins', 'settings', 'dashboard'].includes(activeTab)) {
      setActiveTab('users');
    }
  }, [isMainAdmin, activeTab]);


  useEffect(() => {
    if (!activeSupportSession) return;
    const interval = setInterval(() => fetchSupportMessages(activeSupportSession), 5000);
    return () => clearInterval(interval);
  }, [activeSupportSession, fetchSupportMessages]);

  // ── User actions ────────────────────────────────────────────────
  const selectUser = async (u) => {
    setSelectedUser(u);
    setProfileTab('info');
    setEditBalance(String(u.balance));
    setEditPlan(u.plan_id);
    setEditIsAdmin(!!u.is_admin);
    setAddBalanceAmount('');
    setUserProfile(null);

    try {
      const res = await authFetch(`${API_URL}/api/admin/users/${u.id}/full-profile`, { headers: authHeaders });
      const data = await res.json();
      if (res.ok) setUserProfile(data);
    } catch {}
  };

  const saveUser = async () => {
    if (!selectedUser) return;
    setSaving(true);
    try {
      const body = isMainAdmin
        ? { balance: Number(editBalance), plan_id: editPlan, banned: selectedUser.banned, is_admin: editIsAdmin }
        : { banned: selectedUser.banned };
      const res = await authFetch(`${API_URL}/api/admin/users/${selectedUser.id}`, {
        method: 'PATCH', headers: authHeaders, body: JSON.stringify(body),
      });
      const data = await res.json();
      if (res.ok) { showToast(t.admin_user_updated); fetchUsers(); setSelectedUser(prev => ({ ...prev, balance: data.user.balance, plan_id: data.user.plan_id, is_admin: data.user.is_admin })); }
      else showApiError(data);
    } catch { showToast(t.toast_connection_error, 'error'); }
    finally { setSaving(false); }
  };

  const addBalanceToUser = async () => {
    if (!selectedUser || !addBalanceAmount) return;
    const amount = Number(addBalanceAmount);
    if (amount <= 0) return showToast(t.admin_amount_positive, 'error');
    setSaving(true);
    try {
      const newBalance = Number(selectedUser.balance) + amount;
      const res = await authFetch(`${API_URL}/api/admin/users/${selectedUser.id}`, {
        method: 'PATCH', headers: authHeaders, body: JSON.stringify({ balance: newBalance }),
      });
      const data = await res.json();
      if (res.ok) { showToast(`${formatMoney(amount)} ${t.admin_balance_added}`); fetchUsers(); setAddBalanceAmount(''); setSelectedUser(prev => ({ ...prev, balance: data.user.balance })); }
      else showApiError(data);
    } catch { showToast(t.toast_connection_error, 'error'); }
    finally { setSaving(false); }
  };

  const toggleBan = async (u) => {
    const newBanned = u.banned ? 0 : 1;
    try {
      const res = await authFetch(`${API_URL}/api/admin/users/${u.id}`, {
        method: 'PATCH', headers: authHeaders, body: JSON.stringify({ banned: newBanned }),
      });
      if (res.ok) { showToast(newBanned ? t.admin_user_banned : t.admin_user_unbanned); fetchUsers(); if (selectedUser?.id === u.id) setSelectedUser(prev => ({ ...prev, banned: newBanned })); }
    } catch { showToast(t.toast_connection_error, 'error'); }
  };

  const forcePasswordReset = async (userId) => {
    const newPw = prompt(isBn ? 'নতুন পাসওয়ার্ড দিন (কমপক্ষে ৬ অক্ষর):' : 'Enter new password (min 6 chars):');
    if (!newPw || newPw.length < 6) return;
    try {
      const res = await authFetch(`${API_URL}/api/admin/users/${userId}/force-password-reset`, {
        method: 'POST', headers: authHeaders, body: JSON.stringify({ newPassword: newPw }),
      });
      if (res.ok) showToast(isBn ? 'পাসওয়ার্ড রিসেট হয়েছে' : 'Password reset done', 'success');
      else showApiError(await res.json());
    } catch { showToast(t.toast_connection_error, 'error'); }
  };

  const handleBulkAction = async (action) => {
    if (bulkSelected.size === 0) return;
    try {
      const res = await authFetch(`${API_URL}/api/admin/bulk-action`, {
        method: 'POST', headers: authHeaders, body: JSON.stringify({ action, userIds: [...bulkSelected] }),
      });
      const data = await res.json();
      if (res.ok) { showToast(`${data.affected} users ${action === 'ban' ? 'banned' : 'unbanned'}`, 'success'); setBulkSelected(new Set()); fetchUsers(); }
      else showApiError(data);
    } catch { showToast(t.toast_connection_error, 'error'); }
  };

  // ── Transaction actions ─────────────────────────────────────────
  const handleTransaction = async (txId, status) => {
    setProcessingTxId(txId);
    try {
      const res = await authFetch(`${API_URL}/api/admin/transactions/${txId}`, {
        method: 'PATCH', headers: authHeaders, body: JSON.stringify({ status, admin_note: adminNote }),
      });
      if (res.ok) { showToast(`Transaction ${status}`, 'success'); setAdminNote(''); fetchTransactions(); }
      else showApiError(await res.json());
    } catch { showToast(t.toast_connection_error, 'error'); }
    finally { setProcessingTxId(null); }
  };

  const sendAdminMessage = async () => {
    const text = messageText.trim();
    if (!text) return showToast(t.admin_enter_msg, 'warning');
    if (messageTarget === 'user' && !messageUserId) return showToast(t.admin_select_user_warn, 'warning');
    setMessageSending(true);
    try {
      const res = await authFetch(`${API_URL}/api/admin/messages`, {
        method: 'POST', headers: authHeaders,
        body: JSON.stringify({ target: messageTarget, userId: messageTarget === 'user' ? Number(messageUserId) : undefined, message: text }),
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok) { setMessageText(''); showToast(t.admin_msg_sent_rcpt(data.delivered || 0), 'success'); }
      else showApiError(data);
    } catch { showToast(t.toast_connection_error, 'error'); }
    finally { setMessageSending(false); }
  };

  // ── Support actions ─────────────────────────────────────────────
  const sendSupportReply = async () => {
    const text = supportReply.trim();
    if (!text || !activeSupportSession) return;
    setSupportReplying(true);
    try {
      const res = await authFetch(`${API_URL}/api/admin/support/reply`, {
        method: 'POST', headers: authHeaders, body: JSON.stringify({ sessionId: activeSupportSession, message: text }),
      });
      if (res.ok) { setSupportReply(''); fetchSupportMessages(activeSupportSession); fetchSupportSessions(); showToast(t.admin_reply_sent, 'success'); }
      else showApiError(await res.json(), 'Reply failed');
    } catch { showToast(t.toast_connection_error, 'error'); }
    finally { setSupportReplying(false); }
  };

  const updateSessionStatus = async (sessionId, status) => {
    try {
      await authFetch(`${API_URL}/api/admin/support/sessions/${sessionId}/status`, {
        method: 'PATCH', headers: authHeaders, body: JSON.stringify({ status }),
      });
      fetchSupportSessions();
    } catch {}
  };

  const assignSession = async (sessionId, adminId) => {
    try {
      await authFetch(`${API_URL}/api/admin/support/sessions/${sessionId}/assign`, {
        method: 'PATCH', headers: authHeaders, body: JSON.stringify({ adminId }),
      });
      fetchSupportSessions();
    } catch {}
  };

  const addCannedResponse = async () => {
    if (!newCanned.title || !newCanned.message) return;
    try {
      const res = await authFetch(`${API_URL}/api/admin/canned-responses`, {
        method: 'POST', headers: authHeaders, body: JSON.stringify(newCanned),
      });
      if (res.ok) { setNewCanned({ title: '', message: '', category: 'general' }); fetchCannedResponses(); showToast('Saved', 'success'); }
    } catch {}
  };

  const deleteCannedResponse = async (id) => {
    try {
      await authFetch(`${API_URL}/api/admin/canned-responses/${id}`, { method: 'DELETE', headers: authHeaders });
      fetchCannedResponses();
    } catch {}
  };

  // ── Settings actions ────────────────────────────────────────────
  const saveSettings = async () => {
    setSettingsSaving(true);
    try {
      const res = await authFetch(`${API_URL}/api/admin/settings`, {
        method: 'POST', headers: authHeaders, body: JSON.stringify({ settings: settingsData }),
      });
      if (res.ok) showToast(t.admin_settings_saved, 'success');
      else showApiError(await res.json().catch(() => ({})), t.admin_save_failed);
    } catch { showToast(t.toast_connection_error, 'error'); }
    finally { setSettingsSaving(false); }
  };

  const savePlan = async (plan) => {
    try {
      const res = await authFetch(`${API_URL}/api/admin/plans/${plan.id}`, {
        method: 'PATCH', headers: authHeaders, body: JSON.stringify(plan),
      });
      if (res.ok) { showToast('Plan updated', 'success'); setEditingPlan(null); fetchPlans(); }
      else showApiError(await res.json());
    } catch { showToast(t.toast_connection_error, 'error'); }
  };

  // ── Permission actions ──────────────────────────────────────────
  const loadPermissions = async (adminId) => {
    try {
      const res = await authFetch(`${API_URL}/api/admin/permissions/${adminId}`, { headers: authHeaders });
      const data = await res.json();
      if (res.ok) { setEditPermissions(adminId); setPermData(data.permissions || {}); }
    } catch {}
  };

  const savePermissions = async () => {
    if (!editPermissions) return;
    try {
      const res = await authFetch(`${API_URL}/api/admin/permissions/${editPermissions}`, {
        method: 'POST', headers: authHeaders, body: JSON.stringify({ permissions: permData }),
      });
      if (res.ok) { showToast('Permissions updated', 'success'); setEditPermissions(null); }
    } catch {}
  };

  // ── Export CSV ──────────────────────────────────────────────────
  const exportCSV = async (type) => {
    try {
      const res = await authFetch(`${API_URL}/api/admin/export/${type}`, { headers: authHeaders });
      const data = await res.json();
      const items = data[type] || [];
      if (items.length === 0) return showToast('No data', 'warning');
      const headers = Object.keys(items[0]);
      const csv = [headers.join(','), ...items.map(r => headers.map(h => `"${String(r[h] || '').replace(/"/g, '""')}"`).join(','))].join('\n');
      const blob = new Blob([csv], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url; a.download = `${type}_export.csv`; a.click();
      URL.revokeObjectURL(url);
      showToast(`${items.length} records exported`, 'success');
    } catch { showToast('Export failed', 'error'); }
  };

  // ── Filters ─────────────────────────────────────────────────────
  const filtered = users.filter(u => {
    if (!isMainAdmin && u.is_admin) return false;
    const q = searchQuery.toLowerCase();
    const matchesSearch = !q || u.name.toLowerCase().includes(q) || u.identifier.toLowerCase().includes(q) || u.refer_code.toLowerCase().includes(q) || String(u.id) === q;
    const matchesStatus = userStatusFilter === 'all' || (userStatusFilter === 'banned' && u.banned) || (userStatusFilter === 'admin' && u.is_admin) || (userStatusFilter === 'active' && !u.banned && !u.is_admin);
    return matchesSearch && matchesStatus;
  });

  const filteredTx = transactions.filter(tx => {
    const statusMatch = txFilter === 'all' || tx.status === txFilter;
    const typeMatch = txTypeFilter === 'all' || tx.type === txTypeFilter;
    return statusMatch && typeMatch;
  });

  const messageCandidates = users.filter(u => !u.banned && (!u.is_admin || u.id === user.id));

  const tabs = [
    ...(isMainAdmin ? [{ id: 'dashboard', label: isBn ? 'ড্যাশবোর্ড' : 'Dashboard', icon: Icons.BarChart }] : []),
    { id: 'users', label: t.admin_users, icon: Icons.People },
    { id: 'transactions', label: isBn ? 'ফাইন্যান্স' : 'Finance', icon: Icons.Transfer },
    { id: 'support', label: t.nav_support, icon: Icons.Headset },
    ...(isMainAdmin ? [{ id: 'admins', label: isBn ? 'এডমিন' : 'Admins', icon: Icons.Shield }] : []),
    ...(isMainAdmin ? [{ id: 'settings', label: t.settings, icon: Icons.Settings }] : []),
  ];

  return (
    <>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <div className="screen-title"><Icons.Shield size={18} /> {t.admin_panel}</div>
      </div>

      {/* Tab bar */}
      <div style={{ display: 'flex', gap: 0, marginBottom: 16, borderRadius: 10, overflow: 'hidden', border: '1px solid var(--border)', background: 'var(--card)' }}>
        {tabs.map(tab => {
          const active = activeTab === tab.id;
          const TabIcon = tab.icon;
          return (
            <div key={tab.id} onClick={() => setActiveTab(tab.id)} style={{
              flex: 1, padding: '9px 6px', textAlign: 'center', cursor: 'pointer',
              fontSize: 11, fontWeight: 700, letterSpacing: 0.3,
              display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 4,
              background: active ? 'var(--accent)' : 'transparent',
              color: active ? '#fff' : 'var(--text2)', transition: 'all 0.2s',
            }}>
              <TabIcon size={16} color={active ? '#fff' : undefined} />
              <span style={{ lineHeight: 1 }}>{tab.label}</span>
            </div>
          );
        })}
      </div>

      {/* ════════════════════════════════════════════════════════════════════════ */}
      {/* DASHBOARD TAB */}
      {/* ════════════════════════════════════════════════════════════════════════ */}
      {activeTab === 'dashboard' && (
        <>
          {statsLoading || !stats ? (
            <div className="card" style={{ textAlign: 'center', padding: 40 }}>
              <div style={{ color: 'var(--text2)' }}>{t.admin_loading_dash || 'Loading...'}</div>
            </div>
          ) : (
            <>
              {/* Live Stats Row */}
              <div className="stats-row">
                <div className="stat-box">
                  <div className="stat-num" style={{ color: '#0ECB81' }}>{stats.totalUsers || 0}</div>
                  <div className="stat-label">{isBn ? 'মোট ইউজার' : 'Total Users'}</div>
                </div>
                <div className="stat-box">
                  <div className="stat-num" style={{ color: '#6366F1' }}>{stats.activeToday || 0}</div>
                  <div className="stat-label">{isBn ? 'আজ সক্রিয়' : 'Active Today'}</div>
                </div>
                <div className="stat-box">
                  <div className="stat-num" style={{ color: '#14B8A6' }}>{stats.newUsersToday || 0}</div>
                  <div className="stat-label">{isBn ? 'আজ নতুন' : 'New Today'}</div>
                </div>
              </div>

              {/* Revenue Overview */}
              <div className="card">
                <div className="card-title"><Icons.TrendUp size={14} /> {isBn ? 'রাজস্ব সংক্ষেপ' : 'Revenue Overview'}</div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 12 }}>
                  <div style={{ padding: 10, borderRadius: 8, background: 'rgba(14,203,129,0.1)', textAlign: 'center' }}>
                    <div style={{ fontSize: 18, fontWeight: 900, color: '#0ECB81' }}>{formatMoney(stats.deposits?.sum || 0)}</div>
                    <div style={{ fontSize: 10, color: 'var(--text2)' }}>{isBn ? 'মোট ডিপোজিট' : 'Total Deposits'}</div>
                  </div>
                  <div style={{ padding: 10, borderRadius: 8, background: 'rgba(246,70,93,0.1)', textAlign: 'center' }}>
                    <div style={{ fontSize: 18, fontWeight: 900, color: '#F6465D' }}>{formatMoney(stats.withdrawals?.sum || 0)}</div>
                    <div style={{ fontSize: 10, color: 'var(--text2)' }}>{isBn ? 'মোট উইথড্র' : 'Total Withdrawals'}</div>
                  </div>
                </div>
                <div style={{ textAlign: 'center', padding: '8px 0', borderTop: '1px solid var(--border)' }}>
                  <div style={{ fontSize: 12, color: 'var(--text2)', marginBottom: 4 }}>{isBn ? 'নেট মুনাফা' : 'Net Profit'}</div>
                  <div style={{ fontSize: 24, fontWeight: 900, color: stats.profitLoss >= 0 ? '#0ECB81' : '#F6465D' }}>
                    {stats.profitLoss >= 0 ? '+' : ''}{formatMoney(stats.profitLoss || 0)}
                  </div>
                </div>
                {stats.revenueChart && <MiniBarChart data={stats.revenueChart} />}
                <div style={{ display: 'flex', justifyContent: 'center', gap: 16, fontSize: 10, color: 'var(--text2)' }}>
                  <span><span style={{ display: 'inline-block', width: 8, height: 8, borderRadius: 2, background: '#0ECB81', marginRight: 4 }} />{isBn ? 'ডিপোজিট' : 'Deposits'}</span>
                  <span><span style={{ display: 'inline-block', width: 8, height: 8, borderRadius: 2, background: '#F6465D', marginRight: 4 }} />{isBn ? 'উইথড্র' : 'Withdrawals'}</span>
                </div>
              </div>

              {/* Pending Actions - Quick Approve */}
              <div className="card" style={{ borderColor: 'rgba(252,213,53,0.3)' }}>
                <div className="card-title"><Icons.Clock size={14} /> {isBn ? 'পেন্ডিং অ্যাকশন' : 'Pending Actions'}</div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                  <div style={{ padding: 12, borderRadius: 8, background: 'rgba(14,203,129,0.08)', border: '1px solid rgba(14,203,129,0.2)', textAlign: 'center' }}>
                    <div style={{ fontSize: 24, fontWeight: 900, color: '#0ECB81' }}>{stats.pendingDeposits || 0}</div>
                    <div style={{ fontSize: 11, color: 'var(--text2)' }}>{isBn ? 'ডিপোজিট পেন্ডিং' : 'Pending Deposits'}</div>
                  </div>
                  <div style={{ padding: 12, borderRadius: 8, background: 'rgba(246,70,93,0.08)', border: '1px solid rgba(246,70,93,0.2)', textAlign: 'center' }}>
                    <div style={{ fontSize: 24, fontWeight: 900, color: '#F6465D' }}>{stats.pendingWithdrawals || 0}</div>
                    <div style={{ fontSize: 11, color: 'var(--text2)' }}>{isBn ? 'উইথড্র পেন্ডিং' : 'Pending Withdrawals'}</div>
                  </div>
                </div>
                {(stats.pendingDeposits > 0 || stats.pendingWithdrawals > 0) && (
                  <button className="btn btn-primary btn-full" style={{ marginTop: 10 }} onClick={() => { setActiveTab('transactions'); setTxFilter('pending'); }}>
                    {isBn ? 'এখনই প্রসেস করুন' : 'Process Now'} →
                  </button>
                )}
              </div>

              {/* Plan Distribution */}
              {stats.planDistribution && stats.planDistribution.length > 0 && (
                <div className="card">
                  <div className="card-title"><Icons.People size={14} /> {isBn ? 'প্ল্যান ডিস্ট্রিবিউশন' : 'Plan Distribution'}</div>
                  {stats.planDistribution.map((p, i) => {
                    const total = stats.planDistribution.reduce((s, x) => s + x.count, 0) || 1;
                    const pct = Math.round((p.count / total) * 100);
                    return (
                      <div key={i} style={{ marginBottom: 8 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, marginBottom: 4 }}>
                          <span style={{ fontWeight: 700, color: p.color }}>{p.name}</span>
                          <span style={{ color: 'var(--text2)' }}>{p.count} ({pct}%)</span>
                        </div>
                        <div style={{ height: 6, borderRadius: 3, background: 'var(--border)' }}>
                          <div style={{ height: '100%', borderRadius: 3, background: p.color, width: `${pct}%`, transition: 'width 0.5s' }} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Top Earners */}
              {stats.topEarners && stats.topEarners.length > 0 && (
                <div className="card">
                  <div className="card-title"><Icons.Trophy size={14} /> {isBn ? 'শীর্ষ আয়কারী' : 'Top Earners'}</div>
                  {stats.topEarners.map((u, i) => (
                    <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '7px 10px', borderRadius: 8, background: 'rgba(35,175,145,0.07)', marginBottom: 4 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <span style={{ fontWeight: 700, color: '#FCD535', minWidth: 20 }}>#{i + 1}</span>
                        <span style={{ fontSize: 13, fontWeight: 600 }}>{u.name}</span>
                      </div>
                      <span style={{ fontWeight: 700, color: '#0ECB81' }}>{formatMoney(u.balance)}</span>
                    </div>
                  ))}
                </div>
              )}

              {/* Recent Activity Feed */}
              {stats.recentActivity && stats.recentActivity.length > 0 && (
                <div className="card">
                  <div className="card-title"><Icons.Clock size={14} /> {isBn ? 'সাম্প্রতিক কার্যকলাপ' : 'Recent Activity'}</div>
                  <div style={{ maxHeight: 250, overflowY: 'auto' }}>
                    {stats.recentActivity.map((a, i) => (
                      <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '6px 0', borderBottom: '1px solid var(--border)', fontSize: 12 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                          <span style={{ fontSize: 14 }}>
                            {a.type === 'signup' ? '👤' : a.type === 'deposit' ? '💰' : '💸'}
                          </span>
                          <span>{a.type === 'signup' ? (isBn ? `${a.detail} যোগ দিয়েছেন` : `${a.detail} joined`) : `৳${a.detail}`}</span>
                        </div>
                        <span style={{ color: 'var(--text2)', fontSize: 10 }}>{formatStamp(a.created_at)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Support Stats */}
              {stats.support && (
                <div className="card">
                  <div className="card-title"><Icons.Chat size={14} /> {isBn ? 'সাপোর্ট সারাংশ' : 'Support Summary'}</div>
                  <div className="stats-row">
                    <div className="stat-box">
                      <div className="stat-num" style={{ color: '#6366F1' }}>{stats.support.totalSessions}</div>
                      <div className="stat-label">{isBn ? 'সেশন' : 'Sessions'}</div>
                    </div>
                    <div className="stat-box">
                      <div className="stat-num" style={{ color: '#F6465D' }}>{stats.support.unrepliedSessions}</div>
                      <div className="stat-label">{isBn ? 'উত্তরবিহীন' : 'Unanswered'}</div>
                    </div>
                    <div className="stat-box">
                      <div className="stat-num" style={{ color: '#0ECB81' }}>{stats.support.adminReplies}</div>
                      <div className="stat-label">{isBn ? 'উত্তর' : 'Replies'}</div>
                    </div>
                  </div>
                </div>
              )}

              {/* Method Breakdown */}
              {stats.methodBreakdown && stats.methodBreakdown.length > 0 && (
                <div className="card">
                  <div className="card-title"><Icons.CreditCard size={14} /> {isBn ? 'পদ্ধতি অনুযায়ী' : 'By Payment Method'}</div>
                  {stats.methodBreakdown.map((m, i) => (
                    <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid var(--border)', fontSize: 12 }}>
                      <span style={{ fontWeight: 600 }}>{m.method?.toUpperCase()} ({m.type})</span>
                      <span style={{ color: m.type === 'deposit' ? '#0ECB81' : '#F6465D', fontWeight: 700 }}>{m.count}x = {formatMoney(m.total)}</span>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </>
      )}

      {/* ════════════════════════════════════════════════════════════════════════ */}
      {/* USERS TAB */}
      {/* ════════════════════════════════════════════════════════════════════════ */}
      {activeTab === 'users' && (
        <>
          {/* Broadcast Message */}
          <div className="card">
            <div className="card-title"><Icons.Bell size={14} /> {t.admin_send_msg_users}</div>
            <div style={{ display: 'flex', gap: 8, marginBottom: 10 }}>
              <button className={`btn ${messageTarget === 'all' ? 'btn-primary' : 'btn-outline'}`} style={{ flex: 1 }} onClick={() => setMessageTarget('all')}>{t.admin_all_users_lbl}</button>
              <button className={`btn ${messageTarget === 'user' ? 'btn-primary' : 'btn-outline'}`} style={{ flex: 1 }} onClick={() => setMessageTarget('user')}>{t.admin_single_user}</button>
            </div>
            {messageTarget === 'user' && (
              <div className="input-wrap">
                <label className="input-label">{t.admin_select_user_lbl}</label>
                <select className="inp" value={messageUserId} onChange={e => setMessageUserId(e.target.value)}>
                  <option value="">{t.admin_choose_user}</option>
                  {messageCandidates.map(u => <option key={u.id} value={u.id}>{u.name} ({u.identifier})</option>)}
                </select>
              </div>
            )}
            <div className="input-wrap">
              <label className="input-label">{t.admin_message_lbl}</label>
              <textarea className="inp" rows={3} maxLength={1000} placeholder={t.admin_msg_ph} value={messageText} onChange={e => setMessageText(e.target.value)} />
            </div>
            <button className="btn btn-primary btn-full" onClick={sendAdminMessage} disabled={messageSending}>{messageSending ? t.admin_sending : t.admin_send}</button>
          </div>

          {/* Bulk Mode Toggle */}
          <div style={{ display: 'flex', gap: 8, marginBottom: 12, alignItems: 'center' }}>
            <button className={`btn ${bulkMode ? 'btn-primary' : 'btn-outline'}`} style={{ fontSize: 11, padding: '4px 12px' }} onClick={() => { setBulkMode(!bulkMode); setBulkSelected(new Set()); }}>
              {isBn ? 'বাল্ক সিলেক্ট' : 'Bulk Select'}
            </button>
            {bulkMode && bulkSelected.size > 0 && (
              <>
                <span style={{ fontSize: 11, color: 'var(--text2)' }}>{bulkSelected.size} selected</span>
                <button className="btn btn-danger" style={{ fontSize: 11, padding: '4px 10px' }} onClick={() => handleBulkAction('ban')}>Ban All</button>
                <button className="btn btn-success" style={{ fontSize: 11, padding: '4px 10px' }} onClick={() => handleBulkAction('unban')}>Unban All</button>
              </>
            )}
            {isMainAdmin && (
              <button className="btn btn-outline" style={{ fontSize: 11, padding: '4px 10px', marginLeft: 'auto' }} onClick={() => exportCSV('users')}>
                <Icons.Download size={12} /> CSV
              </button>
            )}
          </div>

          {/* Stats */}
          <div className="stats-row">
            <div className="stat-box">
              <div className="stat-num">{isMainAdmin ? users.length : users.filter(u => !u.is_admin).length}</div>
              <div className="stat-label">{t.admin_total_users}</div>
            </div>
            <div className="stat-box">
              <div className="stat-num">{users.filter(u => !u.banned && !u.is_admin).length}</div>
              <div className="stat-label">{t.admin_active}</div>
            </div>
            <div className="stat-box">
              <div className="stat-num">{users.filter(u => u.banned).length}</div>
              <div className="stat-label">{isBn ? 'ব্যান' : 'Banned'}</div>
            </div>
          </div>

          {/* Search & Filter */}
          <div className="card" style={{ padding: '12px 16px' }}>
            <input className="inp" placeholder={t.admin_search_ph} value={searchQuery} onChange={e => setSearchQuery(e.target.value)} style={{ marginBottom: 8 }} />
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
              {[
                { id: 'all', label: t.all, count: isMainAdmin ? users.length : users.filter(u => !u.is_admin).length },
                { id: 'active', label: t.active, count: users.filter(u => !u.banned && !u.is_admin).length },
                { id: 'banned', label: t.admin_filter_banned, count: users.filter(u => u.banned).length },
                ...(isMainAdmin ? [{ id: 'admin', label: t.admin_admin_label, count: users.filter(u => u.is_admin).length }] : []),
              ].map(f => (
                <button key={f.id} className={`btn ${userStatusFilter === f.id ? 'btn-primary' : 'btn-outline'}`} style={{ fontSize: 11, padding: '4px 12px', borderRadius: 6 }} onClick={() => setUserStatusFilter(f.id)}>
                  {f.label} ({f.count})
                </button>
              ))}
            </div>
          </div>

          {/* Selected User Full Profile */}
          {selectedUser && (
            <div className="card" style={{ borderColor: 'var(--accent)', boxShadow: '0 0 16px rgba(35,175,145,0.15)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                <div className="card-title" style={{ marginBottom: 0 }}><Icons.User size={14} /> {selectedUser.name}</div>
                <div className="icon-btn" onClick={() => setSelectedUser(null)}><Icons.X size={16} /></div>
              </div>

              {/* User badges */}
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 14 }}>
                <span className="badge badge-blue">ID: {selectedUser.id}</span>
                <span className="badge badge-blue">{selectedUser.identifier}</span>
                <span className="badge badge-blue">REF: {selectedUser.refer_code}</span>
                {selectedUser.referred_by && <span className="badge badge-blue">BY: {selectedUser.referred_by}</span>}
                <span className={`badge ${selectedUser.banned ? 'badge-orange' : 'badge-green'}`}>{selectedUser.banned ? t.admin_banned : t.admin_active}</span>
                {selectedUser.is_admin && <span className="badge badge-green">{t.admin_admin_label}</span>}
              </div>

              {/* Profile sub-tabs */}
              <div style={{ display: 'flex', gap: 4, marginBottom: 12, flexWrap: 'wrap' }}>
                {['info', 'transactions', 'referrals', 'manufacturing', 'logins'].map(tab => (
                  <button key={tab} className={`btn ${profileTab === tab ? 'btn-primary' : 'btn-outline'}`} style={{ fontSize: 10, padding: '4px 10px' }} onClick={() => setProfileTab(tab)}>
                    {tab === 'info' ? (isBn ? 'তথ্য' : 'Info') : tab === 'transactions' ? (isBn ? 'লেনদেন' : 'Transactions') : tab === 'referrals' ? (isBn ? 'রেফারেল' : 'Referrals') : tab === 'manufacturing' ? (isBn ? 'উৎপাদন' : 'Mfg') : (isBn ? 'লগইন' : 'Logins')}
                  </button>
                ))}
              </div>

              {/* Info tab */}
              {profileTab === 'info' && (
                <>
                  {userProfile && (
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 12 }}>
                      <div style={{ padding: 8, borderRadius: 8, background: 'rgba(14,203,129,0.08)', textAlign: 'center' }}>
                        <div style={{ fontSize: 14, fontWeight: 700, color: '#0ECB81' }}>{formatMoney(selectedUser.balance)}</div>
                        <div style={{ fontSize: 10, color: 'var(--text2)' }}>{isBn ? 'ব্যালেন্স' : 'Balance'}</div>
                      </div>
                      <div style={{ padding: 8, borderRadius: 8, background: 'rgba(99,102,241,0.08)', textAlign: 'center' }}>
                        <div style={{ fontSize: 14, fontWeight: 700, color: '#6366F1' }}>{formatMoney(userProfile.balanceSummary?.total_credit || 0)}</div>
                        <div style={{ fontSize: 10, color: 'var(--text2)' }}>{isBn ? 'মোট আয়' : 'Total Earned'}</div>
                      </div>
                      <div style={{ padding: 8, borderRadius: 8, background: 'rgba(14,203,129,0.08)', textAlign: 'center' }}>
                        <div style={{ fontSize: 14, fontWeight: 700, color: '#14B8A6' }}>{formatMoney(userProfile.txStats?.total_deposited || 0)}</div>
                        <div style={{ fontSize: 10, color: 'var(--text2)' }}>{isBn ? 'মোট ডিপোজিট' : 'Deposited'}</div>
                      </div>
                      <div style={{ padding: 8, borderRadius: 8, background: 'rgba(246,70,93,0.08)', textAlign: 'center' }}>
                        <div style={{ fontSize: 14, fontWeight: 700, color: '#F6465D' }}>{formatMoney(userProfile.txStats?.total_withdrawn || 0)}</div>
                        <div style={{ fontSize: 10, color: 'var(--text2)' }}>{isBn ? 'মোট উইথড্র' : 'Withdrawn'}</div>
                      </div>
                    </div>
                  )}

                  {isMainAdmin && (
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 12 }}>
                      <div className="input-wrap" style={{ marginBottom: 0 }}>
                        <label className="input-label">{t.admin_balance}</label>
                        <input className="inp" type="number" value={editBalance} onChange={e => setEditBalance(e.target.value)} />
                      </div>
                      <div className="input-wrap" style={{ marginBottom: 0 }}>
                        <label className="input-label">{t.admin_plan}</label>
                        <select className="inp" value={editPlan} onChange={e => setEditPlan(e.target.value)}>
                          {PLANS.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                        </select>
                      </div>
                    </div>
                  )}

                  {isMainAdmin && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
                      <label className="input-label" style={{ marginBottom: 0 }}>{t.admin_user_admin_lbl}</label>
                      <div onClick={() => { if (selectedUser.id !== user.id && !selectedUser.is_main_admin) setEditIsAdmin(!editIsAdmin); }}
                        style={{ width: 44, height: 24, borderRadius: 12, background: editIsAdmin ? '#0ECB81' : 'var(--border)', cursor: 'pointer', position: 'relative', transition: 'background 0.2s' }}>
                        <div style={{ width: 20, height: 20, borderRadius: '50%', background: '#fff', position: 'absolute', top: 2, left: editIsAdmin ? 22 : 2, transition: 'left 0.2s' }} />
                      </div>
                    </div>
                  )}

                  {!isMainAdmin && !selectedUser.is_admin && (
                    <div style={{ marginBottom: 12, padding: 12, borderRadius: 8, background: 'rgba(14,203,129,0.07)', border: '1px solid rgba(14,203,129,0.2)' }}>
                      <div style={{ fontWeight: 700, fontSize: 12, marginBottom: 8 }}><Icons.Dollar size={13} /> {t.admin_add_balance}</div>
                      <div style={{ display: 'flex', gap: 8 }}>
                        <input className="inp" type="number" value={addBalanceAmount} onChange={e => setAddBalanceAmount(e.target.value)} placeholder={t.admin_enter_amount} style={{ flex: 1 }} />
                        <button className="btn btn-success" onClick={addBalanceToUser} disabled={saving || !addBalanceAmount} style={{ fontSize: 12, padding: '6px 16px' }}>{saving ? '...' : t.admin_add_btn}</button>
                      </div>
                    </div>
                  )}

                  <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                    {isMainAdmin && <button className="btn btn-primary" onClick={saveUser} disabled={saving} style={{ flex: 1 }}>{saving ? t.admin_saving : t.admin_save}</button>}
                    <button className={`btn ${selectedUser.banned ? 'btn-success' : 'btn-danger'}`} onClick={() => toggleBan(selectedUser)} style={{ flex: 1 }}>{selectedUser.banned ? t.admin_unban_user : t.admin_ban_user}</button>
                    {isMainAdmin && <button className="btn btn-outline" onClick={() => forcePasswordReset(selectedUser.id)} style={{ flex: 1, fontSize: 11 }}><Icons.Lock size={12} /> {isBn ? 'পাসওয়ার্ড রিসেট' : 'Reset PW'}</button>}
                  </div>
                </>
              )}

              {/* Transactions tab */}
              {profileTab === 'transactions' && userProfile && (
                <div style={{ maxHeight: 300, overflowY: 'auto' }}>
                  {(userProfile.transactions || []).length === 0 ? (
                    <div style={{ textAlign: 'center', padding: 20, color: 'var(--text2)', fontSize: 13 }}>{isBn ? 'কোন লেনদেন নেই' : 'No transactions'}</div>
                  ) : userProfile.transactions.map(tx => (
                    <div key={tx.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid var(--border)', fontSize: 12 }}>
                      <div>
                        <span style={{ fontWeight: 700 }}>{tx.type === 'deposit' ? '💰' : '💸'} {formatMoney(tx.amount)}</span>
                        <span style={{ color: 'var(--text2)', marginLeft: 6 }}>{tx.method}</span>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <span className={`badge ${tx.status === 'approved' ? 'badge-green' : tx.status === 'rejected' ? 'badge-orange' : 'badge-blue'}`} style={{ fontSize: 9 }}>{tx.status}</span>
                        <div style={{ fontSize: 10, color: 'var(--text2)' }}>{formatStamp(tx.created_at)}</div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Referrals tab */}
              {profileTab === 'referrals' && userProfile && (
                <div>
                  <div className="stats-row" style={{ marginBottom: 12 }}>
                    <div className="stat-box">
                      <div className="stat-num">{userProfile.referralMembers?.l1_count || 0}</div>
                      <div className="stat-label">L1</div>
                    </div>
                    <div className="stat-box">
                      <div className="stat-num">{userProfile.referralMembers?.l2_count || 0}</div>
                      <div className="stat-label">L2</div>
                    </div>
                    <div className="stat-box">
                      <div className="stat-num">{userProfile.referralMembers?.l3_count || 0}</div>
                      <div className="stat-label">L3</div>
                    </div>
                  </div>
                  <div style={{ maxHeight: 200, overflowY: 'auto' }}>
                    {(userProfile.referralTree || []).map(r => (
                      <div key={r.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid var(--border)', fontSize: 12, paddingLeft: (r.level - 1) * 16 }}>
                        <span>{r.name} <span className="badge badge-blue" style={{ fontSize: 8 }}>L{r.level}</span></span>
                        <span style={{ color: 'var(--text2)', fontSize: 10 }}>{r.refer_code}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Manufacturing tab */}
              {profileTab === 'manufacturing' && userProfile && (
                <div>
                  <div className="stats-row" style={{ marginBottom: 12 }}>
                    <div className="stat-box">
                      <div className="stat-num">{userProfile.mfgStats?.total_jobs || 0}</div>
                      <div className="stat-label">{isBn ? 'মোট কাজ' : 'Total Jobs'}</div>
                    </div>
                    <div className="stat-box">
                      <div className="stat-num">{formatMoney(userProfile.mfgStats?.total_earned || 0)}</div>
                      <div className="stat-label">{isBn ? 'মোট আয়' : 'Earned'}</div>
                    </div>
                  </div>
                  <div style={{ maxHeight: 200, overflowY: 'auto' }}>
                    {(userProfile.recentJobs || []).map(j => (
                      <div key={j.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid var(--border)', fontSize: 12 }}>
                        <span>{j.device_name} <span style={{ color: 'var(--text2)' }}>({j.brand})</span></span>
                        <span style={{ color: '#0ECB81', fontWeight: 700 }}>+{formatMoney(j.earned)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Login history tab */}
              {profileTab === 'logins' && userProfile && (
                <div style={{ maxHeight: 240, overflowY: 'auto' }}>
                  {(userProfile.loginLogs || []).map(log => (
                    <div key={log.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid var(--border)', fontSize: 12 }}>
                      <div>
                        <div style={{ fontFamily: 'monospace', color: 'var(--accent)' }}>{log.ip || 'localhost'}</div>
                        <div style={{ color: 'var(--text2)', fontSize: 11 }}>{parseDevice(log.user_agent)}</div>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontWeight: 600 }}>{log.city}{log.city && log.country ? ', ' : ''}{log.country || 'Local'}</div>
                        <div style={{ color: 'var(--text2)', fontSize: 10 }}>{formatStamp(log.logged_at)}</div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* User list */}
          {loading ? (
            <div className="card" style={{ textAlign: 'center', padding: 40 }}>
              <div style={{ color: 'var(--text2)' }}>{t.admin_loading_users}</div>
            </div>
          ) : filtered.length === 0 ? (
            <div className="card" style={{ textAlign: 'center', padding: 40, color: 'var(--text2)', fontSize: 13 }}>{t.admin_no_users}</div>
          ) : (
            filtered.map(u => (
              <div key={u.id} className="card" style={{ padding: '12px 16px', borderColor: selectedUser?.id === u.id ? 'var(--accent)' : undefined, opacity: u.banned ? 0.7 : 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  {bulkMode && (
                    <input type="checkbox" checked={bulkSelected.has(u.id)} onChange={() => {
                      const next = new Set(bulkSelected);
                      next.has(u.id) ? next.delete(u.id) : next.add(u.id);
                      setBulkSelected(next);
                    }} />
                  )}
                  <div onClick={() => selectUser(u)} style={{
                    width: 40, height: 40, borderRadius: '50%', cursor: 'pointer',
                    background: 'linear-gradient(135deg, var(--accent), var(--accent2))',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 16, fontWeight: 700, flexShrink: 0, overflow: 'hidden',
                  }}>
                    {u.avatar && u.avatar.startsWith('/') ? <img src={u.avatar} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '50%' }} onError={e => { e.target.style.display = 'none'; }} /> : (u.avatar || u.name?.[0] || '?')}
                  </div>
                  <div style={{ flex: 1, minWidth: 0, cursor: 'pointer' }} onClick={() => selectUser(u)}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
                      <span style={{ fontWeight: 700, fontSize: 14 }}>{u.name}</span>
                      {u.is_admin && <span className="badge badge-blue" style={{ fontSize: 8, padding: '1px 5px' }}>{t.admin_admin_label}</span>}
                      <span className={`badge ${u.banned ? 'badge-orange' : 'badge-green'}`} style={{ fontSize: 8, padding: '1px 5px' }}>{u.banned ? t.admin_banned : t.admin_active}</span>
                      <span className="badge badge-blue" style={{ fontSize: 8, padding: '1px 5px', color: u.plan_color }}>{u.plan_name}</span>
                    </div>
                    <div style={{ fontSize: 11, color: 'var(--text2)', marginTop: 2 }}>
                      {u.identifier} | REF: {u.refer_code} | {t.admin_balance}: {formatMoney(u.balance)}
                    </div>
                  </div>
                  <button className={`btn ${u.banned ? 'btn-success' : 'btn-danger'}`} style={{ fontSize: 10, padding: '4px 10px', flexShrink: 0 }} onClick={e => { e.stopPropagation(); toggleBan(u); }}>
                    {u.banned ? (t.admin_unban_short) : (t.admin_ban_short)}
                  </button>
                </div>
              </div>
            ))
          )}
        </>
      )}

      {/* ════════════════════════════════════════════════════════════════════════ */}
      {/* TRANSACTIONS/FINANCE TAB */}
      {/* ════════════════════════════════════════════════════════════════════════ */}
      {activeTab === 'transactions' && (
        <>
          {/* Filter bar */}
          <div className="card" style={{ padding: '10px 14px' }}>
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 8 }}>
              {['pending', 'approved', 'rejected', 'all'].map(f => (
                <button key={f} className={`btn ${txFilter === f ? 'btn-primary' : 'btn-outline'}`} style={{ fontSize: 11, padding: '4px 12px' }} onClick={() => setTxFilter(f)}>
                  {f === 'pending' ? (isBn ? 'পেন্ডিং' : 'Pending') : f === 'approved' ? (isBn ? 'অনুমোদিত' : 'Approved') : f === 'rejected' ? (isBn ? 'প্রত্যাখ্যাত' : 'Rejected') : (isBn ? 'সব' : 'All')}
                  {f === 'pending' && ` (${transactions.filter(t => t.status === 'pending').length})`}
                </button>
              ))}
            </div>
            <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
              {['all', 'deposit', 'withdraw'].map(f => (
                <button key={f} className={`btn ${txTypeFilter === f ? 'btn-primary' : 'btn-outline'}`} style={{ fontSize: 10, padding: '3px 10px' }} onClick={() => setTxTypeFilter(f)}>
                  {f === 'all' ? (isBn ? 'সব ধরন' : 'All Types') : f === 'deposit' ? (isBn ? 'ডিপোজিট' : 'Deposit') : (isBn ? 'উইথড্র' : 'Withdraw')}
                </button>
              ))}
              {isMainAdmin && (
                <button className="btn btn-outline" style={{ fontSize: 10, padding: '3px 10px', marginLeft: 'auto' }} onClick={() => exportCSV('transactions')}>
                  <Icons.Download size={11} /> CSV
                </button>
              )}
            </div>
          </div>

          {/* Transactions stats */}
          <div className="stats-row">
            <div className="stat-box">
              <div className="stat-num" style={{ color: '#FCD535' }}>{transactions.filter(t => t.status === 'pending').length}</div>
              <div className="stat-label">{isBn ? 'পেন্ডিং' : 'Pending'}</div>
            </div>
            <div className="stat-box">
              <div className="stat-num" style={{ color: '#0ECB81' }}>{transactions.filter(t => t.status === 'approved').length}</div>
              <div className="stat-label">{isBn ? 'অনুমোদিত' : 'Approved'}</div>
            </div>
            <div className="stat-box">
              <div className="stat-num" style={{ color: '#F6465D' }}>{transactions.filter(t => t.status === 'rejected').length}</div>
              <div className="stat-label">{isBn ? 'প্রত্যাখ্যাত' : 'Rejected'}</div>
            </div>
          </div>

          {txLoading ? (
            <div className="card" style={{ textAlign: 'center', padding: 40 }}><div style={{ color: 'var(--text2)' }}>{t.admin_loading_tx}</div></div>
          ) : filteredTx.length === 0 ? (
            <div className="card" style={{ textAlign: 'center', padding: 40, color: 'var(--text2)', fontSize: 13 }}>{t.admin_no_transactions}</div>
          ) : (
            filteredTx.map(tx => (
              <div key={tx.id} className="card" style={{ padding: '12px 16px', borderColor: tx.status === 'pending' ? 'rgba(252,213,53,0.3)' : undefined }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ fontSize: 18 }}>{tx.type === 'deposit' ? '💰' : '💸'}</span>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: 14 }}>{tx.type === 'deposit' ? t.deposit : t.withdraw} — {formatMoney(tx.amount)}</div>
                      <div style={{ fontSize: 11, color: 'var(--text2)' }}>{tx.user_name} ({tx.user_identifier})</div>
                      <div style={{ fontSize: 11, color: 'var(--text2)' }}>{tx.method?.toUpperCase()} — {tx.account}</div>
                    </div>
                  </div>
                  <span className={`badge ${tx.status === 'approved' ? 'badge-green' : tx.status === 'rejected' ? 'badge-orange' : 'badge-blue'}`}>
                    {tx.status === 'approved' ? t.approved : tx.status === 'rejected' ? t.rejected : t.pending}
                  </span>
                </div>
                <div style={{ fontSize: 11, color: 'var(--text2)', marginBottom: 8 }}>
                  {formatStamp(tx.created_at)}
                  {tx.admin_note ? ` | ${convertCurrencyText(tx.admin_note, lang)}` : ''}
                </div>
                {tx.status === 'pending' && (
                  <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                    <input className="inp" placeholder={isBn ? 'নোট (ঐচ্ছিক)' : 'Note (optional)'}
                      value={processingTxId === tx.id ? adminNote : ''}
                      onFocus={() => { setProcessingTxId(tx.id); setAdminNote(''); }}
                      onChange={e => setAdminNote(e.target.value)}
                      style={{ flex: 1, fontSize: 12, padding: '6px 10px', marginBottom: 0 }} />
                    <button className="btn btn-success" style={{ fontSize: 11, padding: '6px 12px' }} disabled={processingTxId !== null && processingTxId !== tx.id} onClick={() => handleTransaction(tx.id, 'approved')}>
                      {processingTxId === tx.id ? '...' : (isBn ? 'অনুমোদন' : 'Approve')}
                    </button>
                    <button className="btn btn-danger" style={{ fontSize: 11, padding: '6px 12px' }} disabled={processingTxId !== null && processingTxId !== tx.id} onClick={() => handleTransaction(tx.id, 'rejected')}>
                      {isBn ? 'প্রত্যাখ্যান' : 'Reject'}
                    </button>
                  </div>
                )}
              </div>
            ))
          )}
        </>
      )}

      {/* ════════════════════════════════════════════════════════════════════════ */}
      {/* SUPPORT TAB */}
      {/* ════════════════════════════════════════════════════════════════════════ */}
      {activeTab === 'support' && (
        <>
          {!activeSupportSession ? (
            <>
              {/* Support filter */}
              <div style={{ display: 'flex', gap: 6, marginBottom: 12 }}>
                {['all', 'unanswered'].map(f => (
                  <button key={f} className={`btn ${supportFilter === f ? 'btn-primary' : 'btn-outline'}`} style={{ fontSize: 11, padding: '4px 12px' }} onClick={() => setSupportFilter(f)}>
                    {f === 'all' ? (isBn ? 'সব চ্যাট' : 'All Chats') : (isBn ? 'উত্তরবিহীন' : 'Unanswered')}
                  </button>
                ))}
                <button className="btn btn-outline" style={{ fontSize: 11, padding: '4px 12px', marginLeft: 'auto' }} onClick={fetchSupportSessions} disabled={supportLoading}>
                  <Icons.Refresh size={12} />
                </button>
              </div>

              {/* Session list */}
              <div className="card">
                <div className="card-title"><Icons.Chat size={14} /> {isBn ? 'সাপোর্ট চ্যাট' : 'Support Chats'}</div>
                {supportLoading ? (
                  <div style={{ textAlign: 'center', padding: 24, color: 'var(--text2)' }}>{t.admin_loading}</div>
                ) : supportSessions.filter(s => supportFilter === 'all' || s.admin_replies === 0).length === 0 ? (
                  <div style={{ textAlign: 'center', padding: 24, color: 'var(--text2)' }}>{isBn ? 'কোন চ্যাট নেই' : 'No chats'}</div>
                ) : (
                  supportSessions.filter(s => supportFilter === 'all' || s.admin_replies === 0).map(sess => {
                    const hasReply = sess.admin_replies > 0;
                    return (
                      <div key={sess.session_id} onClick={() => { setActiveSupportSession(sess.session_id); fetchSupportMessages(sess.session_id); }}
                        style={{ padding: '10px 12px', borderRadius: 10, cursor: 'pointer', marginBottom: 6, background: hasReply ? 'rgba(14,203,129,0.07)' : 'rgba(246,70,93,0.07)', border: `1px solid ${hasReply ? 'rgba(14,203,129,0.2)' : 'rgba(246,70,93,0.2)'}` }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                          <span style={{ fontWeight: 700, fontSize: 13 }}><Icons.User size={12} /> {sess.user_name || 'Unknown'}</span>
                          <span className={`badge ${hasReply ? 'badge-green' : 'badge-orange'}`} style={{ fontSize: 10 }}>{hasReply ? (isBn ? 'উত্তর দেওয়া' : 'Replied') : (isBn ? 'পেন্ডিং' : 'Pending')}</span>
                        </div>
                        <div style={{ fontSize: 12, overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis', marginBottom: 4 }}>{sess.last_message || '—'}</div>
                        <div style={{ display: 'flex', gap: 12, fontSize: 11, color: 'var(--text2)' }}>
                          <span><Icons.Chat size={11} /> {sess.user_msgs} msgs</span>
                          <span><Icons.Reply size={11} /> {sess.admin_replies} replies</span>
                          <span style={{ marginLeft: 'auto' }}>{sess.last_active ? new Date(sess.last_active + 'Z').toLocaleString() : ''}</span>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>

              {/* Canned Responses */}
              <div className="card">
                <div className="card-title"><Icons.Reply size={14} /> {isBn ? 'প্রস্তুত উত্তর' : 'Canned Responses'}</div>
                {cannedResponses.map(cr => (
                  <div key={cr.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0', borderBottom: '1px solid var(--border)', fontSize: 12 }}>
                    <div><strong>{cr.title}</strong> <span style={{ color: 'var(--text2)' }}>— {cr.message.substring(0, 50)}...</span></div>
                    <button className="btn btn-outline" style={{ fontSize: 10, padding: '2px 8px' }} onClick={() => deleteCannedResponse(cr.id)}>
                      <Icons.X size={10} />
                    </button>
                  </div>
                ))}
                <div style={{ marginTop: 10, display: 'flex', gap: 6 }}>
                  <input className="inp" placeholder={isBn ? 'শিরোনাম' : 'Title'} value={newCanned.title} onChange={e => setNewCanned(p => ({ ...p, title: e.target.value }))} style={{ flex: 1, marginBottom: 0 }} />
                  <input className="inp" placeholder={isBn ? 'বার্তা' : 'Message'} value={newCanned.message} onChange={e => setNewCanned(p => ({ ...p, message: e.target.value }))} style={{ flex: 2, marginBottom: 0 }} />
                  <button className="btn btn-primary" style={{ fontSize: 11, padding: '4px 12px' }} onClick={addCannedResponse}>+</button>
                </div>
              </div>
            </>
          ) : (
            /* Chat thread */
            <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
              <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: 10, background: 'rgba(35,175,145,0.08)' }}>
                <button className="icon-btn" onClick={() => { setActiveSupportSession(null); setSupportMessages([]); }}><Icons.X size={16} /></button>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 700, fontSize: 13 }}><Icons.User size={13} /> {supportSessions.find(s => s.session_id === activeSupportSession)?.user_name || 'Unknown'}</div>
                  <div style={{ fontFamily: 'monospace', fontSize: 10, color: 'var(--text2)' }}>{activeSupportSession}</div>
                </div>
                <div style={{ display: 'flex', gap: 4 }}>
                  <button className="btn btn-outline" style={{ fontSize: 10, padding: '3px 8px' }} onClick={() => updateSessionStatus(activeSupportSession, 'resolved')}>
                    <Icons.CheckCircle size={11} /> {isBn ? 'সমাধান' : 'Resolve'}
                  </button>
                  <button className="btn btn-outline" style={{ fontSize: 10, padding: '3px 8px' }} onClick={() => fetchSupportMessages(activeSupportSession)}>
                    <Icons.Refresh size={11} />
                  </button>
                </div>
              </div>

              {/* Messages */}
              <div style={{ height: 300, overflowY: 'auto', padding: '12px 14px', display: 'flex', flexDirection: 'column', gap: 8 }}>
                {supportMsgsLoading ? (
                  <div style={{ textAlign: 'center', padding: 24, color: 'var(--text2)' }}>{t.admin_loading}</div>
                ) : supportMessages.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: 24, color: 'var(--text2)' }}>{isBn ? 'কোন বার্তা নেই' : 'No messages'}</div>
                ) : supportMessages.map((m, i) => (
                  <div key={m.id || i} style={{
                    alignSelf: m.sender === 'user' ? 'flex-start' : 'flex-end', maxWidth: '80%',
                    padding: '8px 12px', borderRadius: 12, fontSize: 13,
                    background: m.sender === 'user' ? 'rgba(43,49,57,0.7)' : 'linear-gradient(135deg,rgba(35,175,145,0.3),rgba(35,175,145,0.15))',
                    border: m.sender === 'admin' ? '1px solid rgba(35,175,145,0.3)' : '1px solid rgba(43,49,57,0.5)',
                  }}>
                    <div style={{ fontSize: 10, color: 'var(--text2)', marginBottom: 3 }}>
                      {m.sender === 'user' ? <><Icons.User size={10} /> User</> : <><Icons.Shield size={10} /> Admin</>}
                      {' · '}{m.created_at ? new Date(m.created_at + 'Z').toLocaleTimeString() : ''}
                    </div>
                    {m.message}
                  </div>
                ))}
              </div>

              {/* Canned response quick select */}
              {cannedResponses.length > 0 && (
                <div style={{ padding: '6px 14px', borderTop: '1px solid var(--border)', display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                  {cannedResponses.map(cr => (
                    <button key={cr.id} className="btn btn-outline" style={{ fontSize: 10, padding: '2px 8px' }} onClick={() => setSupportReply(cr.message)}>
                      {cr.title}
                    </button>
                  ))}
                </div>
              )}

              {/* Reply */}
              <div style={{ padding: '10px 14px', borderTop: '1px solid var(--border)', display: 'flex', gap: 8 }}>
                <input className="inp" style={{ flex: 1, marginBottom: 0 }} placeholder={isBn ? 'উত্তর লিখুন...' : 'Type reply...'} value={supportReply} onChange={e => setSupportReply(e.target.value)} onKeyDown={e => e.key === 'Enter' && sendSupportReply()} disabled={supportReplying} />
                <button className="btn btn-primary" onClick={sendSupportReply} disabled={supportReplying || !supportReply.trim()} style={{ padding: '6px 16px' }}>
                  <Icons.Send size={14} />
                </button>
              </div>
            </div>
          )}
        </>
      )}

      {/* ════════════════════════════════════════════════════════════════════════ */}
      {/* ADMINS TAB */}
      {/* ════════════════════════════════════════════════════════════════════════ */}
      {activeTab === 'admins' && (
        <>
          {/* Admin list */}
          <div className="card">
            <div className="card-title"><Icons.Shield size={14} /> {isBn ? 'এডমিন তালিকা' : 'Admin List'}</div>
            {users.filter(u => u.is_admin).map(u => (
              <div key={u.id} style={{ padding: '12px', marginBottom: 8, borderRadius: 10, background: u.is_main_admin ? 'rgba(139,92,246,0.08)' : 'rgba(59,130,246,0.08)', border: `1px solid ${u.is_main_admin ? 'rgba(139,92,246,0.2)' : 'rgba(59,130,246,0.2)'}` }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{ width: 40, height: 40, borderRadius: 10, background: u.is_main_admin ? 'linear-gradient(135deg,#8B5CF6,#7C3AED)' : 'linear-gradient(135deg,#3B82F6,#2563EB)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, fontWeight: 700, color: '#fff', flexShrink: 0 }}>
                    {u.avatar || u.name?.[0] || '?'}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <span style={{ fontWeight: 700, fontSize: 14 }}>{u.name}</span>
                      <span className="badge" style={{ fontSize: 8, padding: '1px 5px', background: u.is_main_admin ? '#8B5CF6' : '#3B82F6', color: '#fff' }}>
                        {u.is_main_admin ? 'Main Admin' : 'Sub-Admin'}
                      </span>
                      {u.id === user.id && <span className="badge badge-blue" style={{ fontSize: 8 }}>YOU</span>}
                    </div>
                    <div style={{ fontSize: 11, color: 'var(--text2)', marginTop: 2 }}>{u.identifier} | REF: {u.refer_code}</div>
                  </div>
                  {!u.is_main_admin && isMainAdmin && (
                    <button className="btn btn-outline" style={{ fontSize: 10, padding: '4px 10px' }} onClick={() => loadPermissions(u.id)}>
                      <Icons.Settings size={11} /> {isBn ? 'পারমিশন' : 'Perms'}
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Permission editor */}
          {editPermissions && (
            <div className="card" style={{ borderColor: 'rgba(99,102,241,0.3)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                <div className="card-title" style={{ marginBottom: 0 }}><Icons.Lock size={14} /> {isBn ? 'পারমিশন সেট করুন' : 'Set Permissions'}</div>
                <div className="icon-btn" onClick={() => setEditPermissions(null)}><Icons.X size={16} /></div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                {['view_users', 'edit_users', 'ban_users', 'approve_deposits', 'approve_withdrawals', 'change_settings', 'manage_admins', 'view_reports', 'export_data', 'access_support'].map(perm => (
                  <div key={perm} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '6px 8px', borderRadius: 6, background: 'var(--card)', border: '1px solid var(--border)' }}>
                    <input type="checkbox" checked={!!permData[perm]} onChange={() => setPermData(p => ({ ...p, [perm]: !p[perm] }))} />
                    <span style={{ fontSize: 11 }}>{perm.replace(/_/g, ' ')}</span>
                  </div>
                ))}
              </div>
              <button className="btn btn-primary btn-full" style={{ marginTop: 12 }} onClick={savePermissions}>{isBn ? 'সংরক্ষণ করুন' : 'Save Permissions'}</button>
            </div>
          )}

          {/* Admin Activity Log */}
          <div className="card">
            <div className="card-title"><Icons.Clock size={14} /> {isBn ? 'এডমিন কার্যকলাপ লগ' : 'Admin Activity Log'}</div>
            {adminLogsLoading ? (
              <div style={{ textAlign: 'center', padding: 20, color: 'var(--text2)' }}>{t.admin_loading}</div>
            ) : adminLogs.length === 0 ? (
              <div style={{ textAlign: 'center', padding: 20, color: 'var(--text2)', fontSize: 13 }}>{isBn ? 'কোন লগ নেই' : 'No logs yet'}</div>
            ) : (
              <div style={{ maxHeight: 300, overflowY: 'auto' }}>
                {adminLogs.slice(0, 50).map(log => (
                  <div key={log.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid var(--border)', fontSize: 12 }}>
                    <div>
                      <span style={{ fontWeight: 700, color: 'var(--accent)' }}>{log.admin_name || 'Admin'}</span>
                      <span style={{ color: 'var(--text2)', marginLeft: 6 }}>{log.action}</span>
                      {log.details && <span style={{ color: 'var(--text2)', marginLeft: 4, fontSize: 10 }}>({log.details.substring(0, 40)})</span>}
                    </div>
                    <span style={{ color: 'var(--text2)', fontSize: 10, whiteSpace: 'nowrap' }}>{formatStamp(log.created_at)}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}

      {/* ════════════════════════════════════════════════════════════════════════ */}
      {/* SETTINGS TAB */}
      {/* ════════════════════════════════════════════════════════════════════════ */}
      {activeTab === 'settings' && (
        <>
          {/* App Control */}
          <div className="card" style={{ borderColor: 'rgba(239,68,68,0.3)' }}>
            <div className="card-title"><Icons.AlertTriangle size={14} /> {isBn ? 'অ্যাপ কন্ট্রোল' : 'App Control'}</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
              <label style={{ fontSize: 12, fontWeight: 700 }}>{isBn ? 'মেইন্টেন্যান্স মোড' : 'Maintenance Mode'}</label>
              <div onClick={() => setSettingsData(p => ({ ...p, maintenance_mode: p.maintenance_mode === 'true' ? 'false' : 'true' }))}
                style={{ width: 44, height: 24, borderRadius: 12, background: settingsData.maintenance_mode === 'true' ? '#EF4444' : 'var(--border)', cursor: 'pointer', position: 'relative' }}>
                <div style={{ width: 20, height: 20, borderRadius: '50%', background: '#fff', position: 'absolute', top: 2, left: settingsData.maintenance_mode === 'true' ? 22 : 2, transition: 'left 0.2s' }} />
              </div>
            </div>
            <div className="input-wrap">
              <label className="input-label">{isBn ? 'ঘোষণা ব্যানার' : 'Announcement Banner'}</label>
              <input className="inp" placeholder={isBn ? 'সব ইউজারকে দেখাবে' : 'Shows to all users'} value={settingsData.announcement_banner || ''} onChange={e => setSettingsData(p => ({ ...p, announcement_banner: e.target.value }))} />
            </div>
          </div>

          {/* Payment Settings */}
          <div className="card">
            <div className="card-title"><Icons.CreditCard size={14} /> {isBn ? 'পেমেন্ট অ্যাকাউন্ট' : 'Payment Accounts'}</div>
            {['bkash', 'nagad', 'rocket', 'bank'].map(method => (
              <div key={method} className="input-wrap">
                <label className="input-label">{method.charAt(0).toUpperCase() + method.slice(1)} {isBn ? 'নম্বর' : 'Number'}</label>
                <input className="inp" value={settingsData[`deposit_${method}`] || ''} onChange={e => setSettingsData(p => ({ ...p, [`deposit_${method}`]: e.target.value }))} />
              </div>
            ))}
          </div>

          {/* Financial Limits */}
          <div className="card">
            <div className="card-title"><Icons.Shield size={14} /> {isBn ? 'আর্থিক সীমা' : 'Financial Limits'}</div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              {[
                { key: 'min_deposit', label: isBn ? 'সর্বনিম্ন ডিপোজিট' : 'Min Deposit' },
                { key: 'max_deposit', label: isBn ? 'সর্বোচ্চ ডিপোজিট' : 'Max Deposit' },
                { key: 'min_withdraw', label: isBn ? 'সর্বনিম্ন উইথড্র' : 'Min Withdraw' },
                { key: 'max_withdraw', label: isBn ? 'সর্বোচ্চ উইথড্র' : 'Max Withdraw' },
                { key: 'daily_withdraw_limit', label: isBn ? 'দৈনিক উইথড্র সীমা' : 'Daily WD Limit' },
                { key: 'auto_hold_threshold', label: isBn ? 'অটো-হোল্ড থ্রেশোল্ড' : 'Auto-Hold Threshold' },
              ].map(({ key, label }) => (
                <div key={key} className="input-wrap" style={{ marginBottom: 0 }}>
                  <label className="input-label">{label}</label>
                  <input className="inp" type="number" value={settingsData[key] || ''} onChange={e => setSettingsData(p => ({ ...p, [key]: e.target.value }))} placeholder="0 = no limit" />
                </div>
              ))}
            </div>
          </div>

          {/* Plan Management */}
          <div className="card">
            <div className="card-title"><Icons.Star size={14} /> {isBn ? 'প্ল্যান ম্যানেজমেন্ট' : 'Plan Management'}</div>
            {plans.map(plan => (
              <div key={plan.id} style={{ padding: '10px', marginBottom: 8, borderRadius: 8, background: 'var(--card)', border: '1px solid var(--border)' }}>
                {editingPlan?.id === plan.id ? (
                  <>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 8 }}>
                      <div className="input-wrap" style={{ marginBottom: 0 }}>
                        <label className="input-label">Price (৳)</label>
                        <input className="inp" type="number" value={editingPlan.rate} onChange={e => setEditingPlan(p => ({ ...p, rate: e.target.value }))} />
                      </div>
                      <div className="input-wrap" style={{ marginBottom: 0 }}>
                        <label className="input-label">Per Task (৳)</label>
                        <input className="inp" type="number" value={editingPlan.per_task} onChange={e => setEditingPlan(p => ({ ...p, per_task: e.target.value }))} />
                      </div>
                      <div className="input-wrap" style={{ marginBottom: 0 }}>
                        <label className="input-label">Daily Tasks</label>
                        <input className="inp" type="number" value={editingPlan.daily} onChange={e => setEditingPlan(p => ({ ...p, daily: e.target.value }))} />
                      </div>
                      <div className="input-wrap" style={{ marginBottom: 0 }}>
                        <label className="input-label">Task Time (min)</label>
                        <input className="inp" type="number" value={editingPlan.task_time} onChange={e => setEditingPlan(p => ({ ...p, task_time: e.target.value }))} />
                      </div>
                      <div className="input-wrap" style={{ marginBottom: 0 }}>
                        <label className="input-label">L1 %</label>
                        <input className="inp" type="number" value={editingPlan.l1} onChange={e => setEditingPlan(p => ({ ...p, l1: e.target.value }))} />
                      </div>
                      <div className="input-wrap" style={{ marginBottom: 0 }}>
                        <label className="input-label">L2 %</label>
                        <input className="inp" type="number" value={editingPlan.l2} onChange={e => setEditingPlan(p => ({ ...p, l2: e.target.value }))} />
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: 8 }}>
                      <button className="btn btn-primary" style={{ flex: 1 }} onClick={() => savePlan(editingPlan)}>{isBn ? 'সংরক্ষণ' : 'Save'}</button>
                      <button className="btn btn-outline" style={{ flex: 1 }} onClick={() => setEditingPlan(null)}>{isBn ? 'বাতিল' : 'Cancel'}</button>
                    </div>
                  </>
                ) : (
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <span style={{ fontWeight: 700, color: plan.color, fontSize: 14 }}>{plan.name}</span>
                      <span style={{ color: 'var(--text2)', fontSize: 12, marginLeft: 8 }}>৳{plan.rate?.toLocaleString()} | ৳{plan.per_task}/task | {plan.daily} tasks/day</span>
                    </div>
                    <button className="btn btn-outline" style={{ fontSize: 10, padding: '4px 10px' }} onClick={() => setEditingPlan({ ...plan })}>
                      <Icons.Settings size={11} /> Edit
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>

          <button className="btn btn-primary btn-full" onClick={saveSettings} disabled={settingsSaving}>
            {settingsSaving ? (isBn ? 'সংরক্ষণ হচ্ছে...' : 'Saving...') : (isBn ? 'সব সেটিংস সংরক্ষণ করুন' : 'Save All Settings')}
          </button>
        </>
      )}
    </>
  );
}
