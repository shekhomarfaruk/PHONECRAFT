import { useState, useEffect, useCallback } from "react";
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

export default function AdminScreen({ user, showToast, lang }) {
  const t = I18N[lang] || I18N.en;
  const isBn = lang === 'bn';
  const formatMoney = (amount) => convertCurrency(Number(amount) || 0, lang);
  const formatStamp = (value) => formatDateTime(value ? `${value}Z` : '', lang);
  const isMainAdmin = !!user?.isMainAdmin;
  
  // ── Admin Theme Toggle ────────────────────────────────────────
  const [adminThemeDark, setAdminThemeDark] = useState(() => 
    localStorage.getItem('admin-theme') !== 'light'
  );
  
  useEffect(() => {
    localStorage.setItem('admin-theme', adminThemeDark ? 'dark' : 'light');
  }, [adminThemeDark]);

  const authHeaders = {
    'Content-Type': 'application/json',
    ...(user?.authToken ? { Authorization: `Bearer ${user.authToken}` } : {}),
  };

  const showApiError = (data, fallback) => {
    const msg = data?.error || fallback || t.toast_connection_error;
    showToast(msg, 'error');
  };

  const adminThemeVars = {
    '--accent': '#F59E0B',
    '--accent2': '#EF4444',
    '--border2': 'rgba(245,158,11,0.45)',
    '--glow': '0 0 16px rgba(245,158,11,0.22)',
  };

  const adminRoles = [
    {
      title: 'Main Admin',
      desc: isBn
        ? 'সব সেটিংস, policy ও admin permission নিয়ন্ত্রণ করবে।'
        : 'Controls global settings, policy changes and admin permissions.',
      perms: ['Settings update', 'Admin promote/demote', 'Emergency override'],
    },
    {
      title: 'Finance Admin',
      desc: isBn
        ? 'Deposit/Withdraw request যাচাই করে SLA মেনে process করবে।'
        : 'Processes deposit/withdraw requests within SLA windows.',
      perms: ['Approve/Reject/Paid', 'Duplicate prevent check', 'High risk hold'],
    },
    {
      title: 'Support Admin',
      desc: isBn
        ? 'Live support chat handle ও escalation follow করবে।'
        : 'Handles live support chat and escalation workflow.',
      perms: ['First response under 3 min', 'Telegram bridge reply', 'Ticket escalation'],
    },
  ];

  const opsChecklist = isBn
    ? [
        'সকাল: pending finance request clear করুন',
        'দুপুর: suspicious account review করুন',
        'রাত: payout reconciliation + incident summary',
      ]
    : [
        'Morning: clear pending finance requests',
        'Midday: review suspicious accounts',
        'Night: payout reconciliation + incident summary',
      ];

  const financeSop = isBn
    ? [
        'Deposit SLA: 5-15 min (peak সর্বোচ্চ 30 min)',
        'Withdraw low risk: 15-60 min, high risk: manual hold',
        'Pending ছাড়া transaction action করা যাবে না',
      ]
    : [
        'Deposit SLA: 5-15 min (peak max 30 min)',
        'Withdraw low risk: 15-60 min, high risk: manual hold',
        'No transaction action unless status is pending',
      ];

  const supportSop = isBn
    ? [
        'First response target: business hour-এ 2 min',
        'Telegram reply অবশ্যই mapped thread-এ দিন',
        '15 min এর বেশি unresolved হলে escalate করুন',
      ]
    : [
        'First response target: 2 min in business hours',
        'Always reply on the mapped Telegram thread',
        'Escalate if unresolved beyond 15 min',
      ];

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
  const [editBalanceLimit, setEditBalanceLimit] = useState('');
  const [addBalanceAmount, setAddBalanceAmount] = useState('');
  const [myQuota, setMyQuota]           = useState(null);
  const [saving, setSaving]             = useState(false);
  const [searchQuery, setSearchQuery]   = useState('');
  const [messageTarget, setMessageTarget] = useState('all');
  const [messageUserId, setMessageUserId] = useState('');
  const [messageText, setMessageText] = useState('');
  const [messageSending, setMessageSending] = useState(false);

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
      const res = await authFetch(`${API_URL}/api/admin/settings`, { headers: authHeaders });
      const data = await res.json();
      if (res.ok && data.settings) {
        setSettingsData(prev => ({ ...prev, ...data.settings }));
      } else if (!res.ok) {
        showApiError(data);
      }
    } catch {
      showToast(t.toast_connection_error, 'error');
    }
  }, [user?.authToken, lang]);

  const saveSettings = async () => {
    setSettingsSaving(true);
    try {
      const res = await authFetch(`${API_URL}/api/admin/settings`, {
        method: 'POST', headers: authHeaders,
        body: JSON.stringify({ settings: settingsData }),
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok) showToast(lang === 'bn' ? 'সেটিংস সংরক্ষিত!' : 'Settings saved!', 'success');
      else showApiError(data, lang === 'bn' ? 'সংরক্ষণ ব্যর্থ' : 'Failed to save');
    } catch { showToast(t.toast_connection_error, 'error'); }
    finally { setSettingsSaving(false); }
  };

  // Dashboard tab state
  const [stats, setStats]             = useState(null);
  const [statsLoading, setStatsLoading] = useState(false);

  // Support tab state
  const [supportSessions, setSupportSessions] = useState([]);
  const [supportLoading, setSupportLoading] = useState(false);
  const [activeSupportSession, setActiveSupportSession] = useState(null);
  const [supportMessages, setSupportMessages] = useState([]);
  const [supportMsgsLoading, setSupportMsgsLoading] = useState(false);
  const [supportReply, setSupportReply] = useState('');
  const [supportReplying, setSupportReplying] = useState(false);

  const fetchMyQuota = useCallback(async () => {
    if (isMainAdmin) return;
    try {
      const res = await authFetch(`${API_URL}/api/admin/my-quota`, { headers: authHeaders });
      const data = await res.json();
      if (res.ok) setMyQuota(data);
    } catch {}
  }, [user?.authToken, isMainAdmin]);

  // ── Data fetchers ──────────────────────────────────────────────────────────
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

  const fetchSupportSessions = useCallback(async () => {
    setSupportLoading(true);
    try {
      const res = await authFetch(`${API_URL}/api/admin/support/sessions`, { headers: authHeaders });
      const data = await res.json();
      if (res.ok) setSupportSessions(data.sessions || []);
      else showApiError(data);
    } catch { showToast(t.toast_connection_error, 'error'); }
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

  const sendSupportReply = async () => {
    const text = supportReply.trim();
    if (!text || !activeSupportSession) return;
    setSupportReplying(true);
    try {
      const res = await authFetch(`${API_URL}/api/admin/support/reply`, {
        method: 'POST', headers: authHeaders,
        body: JSON.stringify({ sessionId: activeSupportSession, message: text }),
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok) {
        setSupportReply('');
        fetchSupportMessages(activeSupportSession);
        fetchSupportSessions();
        showToast(lang === 'bn' ? 'উত্তর পাঠানো হয়েছে' : 'Reply sent', 'success');
      } else showApiError(data, 'Reply failed');
    } catch { showToast(t.toast_connection_error, 'error'); }
    finally { setSupportReplying(false); }
  };

  const openSupportSession = (sessionId) => {
    setActiveSupportSession(sessionId);
    setSupportMessages([]);
    fetchSupportMessages(sessionId);
  };

  // Auto-refresh messages every 5s when a session is open
  useEffect(() => {
    if (!activeSupportSession) return;
    const interval = setInterval(() => fetchSupportMessages(activeSupportSession), 5000);
    return () => clearInterval(interval);
  }, [activeSupportSession, fetchSupportMessages]);

  useEffect(() => { fetchUsers(); }, [fetchUsers]);

  useEffect(() => {
    if (activeTab === 'transactions') fetchTransactions();
    if (activeTab === 'dashboard') fetchStats();
    if (activeTab === 'settings') fetchSettings();
    if (activeTab === 'support') fetchSupportSessions();
  }, [activeTab]);

  useEffect(() => {
    if (!isMainAdmin && (activeTab === 'admins' || activeTab === 'settings' || activeTab === 'dashboard')) {
      setActiveTab('users');
    }
  }, [isMainAdmin, activeTab]);

  useEffect(() => { fetchMyQuota(); }, [fetchMyQuota]);

  // ── User actions ───────────────────────────────────────────────────────────
  const selectUser = async (u) => {
    setSelectedUser(u);
    setEditBalance(String(u.balance));
    setEditPlan(u.plan_id);
    setEditIsAdmin(!!u.is_admin);
    setEditBalanceLimit(String(u.admin_balance_limit || 0));
    setAddBalanceAmount('');
    setLogsLoading(true);
    try {
      const res = await authFetch(`${API_URL}/api/admin/users/${u.id}/logs`, { headers: authHeaders });
      const data = await res.json();
      if (res.ok) setLoginLogs(data.logs || []);
      else showApiError(data);
    } catch { showToast(t.toast_connection_error, 'error'); }
    finally { setLogsLoading(false); }
  };

  const saveUser = async () => {
    if (!selectedUser) return;
    setSaving(true);
    try {
      const body = isMainAdmin
        ? {
            balance: Number(editBalance), plan_id: editPlan,
            banned: selectedUser.banned, is_admin: editIsAdmin,
            admin_balance_limit: editIsAdmin ? Number(editBalanceLimit) || 0 : 0,
          }
        : { banned: selectedUser.banned };
      const res = await authFetch(`${API_URL}/api/admin/users/${selectedUser.id}`, {
        method: 'PATCH', headers: authHeaders,
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (res.ok) {
        showToast(t.admin_user_updated);
        fetchUsers();
        setSelectedUser(prev => ({
          ...prev, balance: data.user.balance,
          plan_id: data.user.plan_id, is_admin: data.user.is_admin,
          admin_balance_limit: data.user.admin_balance_limit,
        }));
      } else { showApiError(data); }
    } catch { showToast(t.toast_connection_error, 'error'); }
    finally { setSaving(false); }
  };

  const addBalanceToUser = async () => {
    if (!selectedUser || !addBalanceAmount) return;
    const amount = Number(addBalanceAmount);
    if (amount <= 0) return showToast(isBn ? 'পরিমাণ ০ এর বেশি হতে হবে' : 'Amount must be greater than 0', 'error');
    setSaving(true);
    try {
      const newBalance = Number(selectedUser.balance) + amount;
      const res = await authFetch(`${API_URL}/api/admin/users/${selectedUser.id}`, {
        method: 'PATCH', headers: authHeaders,
        body: JSON.stringify({ balance: newBalance }),
      });
      const data = await res.json();
      if (res.ok) {
        showToast(isBn ? `৳${amount} ব্যালেন্স যোগ হয়েছে` : `৳${amount} balance added`);
        fetchUsers();
        fetchMyQuota();
        setAddBalanceAmount('');
        setSelectedUser(prev => ({ ...prev, balance: data.user.balance }));
      } else { showApiError(data); }
    } catch { showToast(t.toast_connection_error, 'error'); }
    finally { setSaving(false); }
  };

  const toggleBan = async (u) => {
    const newBanned = u.banned ? 0 : 1;
    try {
      const res = await authFetch(`${API_URL}/api/admin/users/${u.id}`, {
        method: 'PATCH', headers: authHeaders,
        body: JSON.stringify({ banned: newBanned }),
      });
      const data = await res.json();
      if (res.ok) {
        showToast(newBanned ? t.admin_user_banned : t.admin_user_unbanned);
        fetchUsers();
        if (selectedUser?.id === u.id) setSelectedUser(prev => ({ ...prev, banned: newBanned }));
      } else { showApiError(data); }
    } catch { showToast(t.toast_connection_error, 'error'); }
  };

  // ── Transaction actions ────────────────────────────────────────────────────
  const handleTransaction = async (txId, status) => {
    setProcessingTxId(txId);
    try {
      const res = await authFetch(`${API_URL}/api/admin/transactions/${txId}`, {
        method: 'PATCH', headers: authHeaders,
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
        showApiError(data);
      }
    } catch { showToast(t.toast_connection_error, 'error'); }
    finally { setProcessingTxId(null); }
  };

  const sendAdminMessage = async () => {
    const text = messageText.trim();
    if (!text) {
      showToast(lang === 'bn' ? 'মেসেজ লিখুন' : 'Enter a message', 'warning');
      return;
    }
    if (messageTarget === 'user' && !messageUserId) {
      showToast(lang === 'bn' ? 'একজন ব্যবহারকারী নির্বাচন করুন' : 'Select a user', 'warning');
      return;
    }

    setMessageSending(true);
    try {
      const res = await authFetch(`${API_URL}/api/admin/messages`, {
        method: 'POST',
        headers: authHeaders,
        body: JSON.stringify({
          target: messageTarget,
          userId: messageTarget === 'user' ? Number(messageUserId) : undefined,
          message: text,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        showApiError(data);
        return;
      }

      setMessageText('');
      if (messageTarget === 'user') setMessageUserId('');
      showToast(lang === 'bn'
        ? `মেসেজ পাঠানো হয়েছে (${data.delivered || 0} জন)`
        : `Message sent (${data.delivered || 0} recipients)`, 'success');
    } catch {
      showToast(t.toast_connection_error, 'error');
    } finally {
      setMessageSending(false);
    }
  };

  // ── Filters ────────────────────────────────────────────────────────────────
  const [userStatusFilter, setUserStatusFilter] = useState('all');
  const filtered = users.filter(u => {
    const q = searchQuery.toLowerCase();
    const matchesSearch = !q ||
      u.name.toLowerCase().includes(q) ||
      u.identifier.toLowerCase().includes(q) ||
      u.refer_code.toLowerCase().includes(q);
    const matchesStatus =
      userStatusFilter === 'all' ||
      (userStatusFilter === 'banned' && u.banned) ||
      (userStatusFilter === 'admin' && u.is_admin) ||
      (userStatusFilter === 'active' && !u.banned && !u.is_admin);
    return matchesSearch && matchesStatus;
  });

  const messageCandidates = users.filter(u => !u.banned && (!u.is_admin || u.id === user.id));

  return (
    <>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <div className="screen-title"><Icons.Shield size={18} /> {t.admin_panel}</div>
        <div 
          onClick={() => setAdminThemeDark(!adminThemeDark)} 
          style={{
            width: 48, height: 28, borderRadius: 14, background: adminThemeDark ? 'rgba(31, 41, 55, 0.5)' : 'rgba(243, 244, 246, 0.5)',
            border: '2px solid var(--border)', cursor: 'pointer', display: 'flex', alignItems: 'center',
            padding: '2px', transition: 'all 0.3s', justifyContent: 'center', gap: 4,
          }}
        >
          {adminThemeDark ? <Icons.Moon size={14} /> : <Icons.Sun size={14} />}
        </div>
      </div>

      {/* Tab bar */}
      <div style={{
        display: 'flex', gap: 0, marginBottom: 16, borderRadius: 10, overflow: 'hidden',
        border: '1px solid var(--border)', background: 'var(--card)',
      }}>
        {[
          { id: 'users', label: t.admin_users, icon: Icons.People },
          ...(isMainAdmin ? [{ id: 'admins', label: t.admin_admins, icon: Icons.Shield }] : []),
          { id: 'transactions', label: t.admin_transactions, icon: Icons.Transfer },
          { id: 'support', label: lang === 'bn' ? 'সাপোর্ট' : 'Support', icon: Icons.Headset },
          { id: 'ops', label: 'Ops', icon: Icons.Target },
          ...(isMainAdmin ? [{ id: 'dashboard', label: t.admin_dashboard, icon: Icons.BarChart }] : []),
          ...(isMainAdmin ? [{ id: 'settings', label: lang === 'bn' ? 'সেটিংস' : 'Settings', icon: Icons.Settings }] : []),
        ].map(tab => {
          const active = activeTab === tab.id;
          const TabIcon = tab.icon;
          return (
            <div key={tab.id} onClick={() => setActiveTab(tab.id)} style={{
              flex: 1, padding: '9px 6px', textAlign: 'center', cursor: 'pointer',
              fontSize: 11, fontWeight: 700, letterSpacing: 0.3,
              display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 4,
              background: active ? 'var(--accent)' : 'transparent',
              color: active ? '#fff' : 'var(--text2)',
              transition: 'all 0.2s',
            }}>
              <TabIcon size={16} color={active ? '#fff' : undefined} />
              <span style={{ lineHeight: 1 }}>{tab.label}</span>
            </div>
          );
        })}
      </div>

      {/* ══════════════════════════════════════════════════════════════════════ */}
      {/* USERS TAB */}
      {/* ══════════════════════════════════════════════════════════════════════ */}
      {activeTab === 'users' && (
        <>
          <div className="card">
            <div className="card-title"><Icons.Bell size={14} /> {lang === 'bn' ? 'ব্যবহারকারীদের মেসেজ পাঠান' : 'Send Message to Users'}</div>
            <div style={{ display: 'flex', gap: 8, marginBottom: 10 }}>
              <button
                className={`btn ${messageTarget === 'all' ? 'btn-primary' : 'btn-outline'}`}
                style={{ flex: 1 }}
                onClick={() => setMessageTarget('all')}
              >
                {lang === 'bn' ? 'সবার কাছে' : 'All Users'}
              </button>
              <button
                className={`btn ${messageTarget === 'user' ? 'btn-primary' : 'btn-outline'}`}
                style={{ flex: 1 }}
                onClick={() => setMessageTarget('user')}
              >
                {lang === 'bn' ? 'একজন ব্যবহারকারী' : 'Single User'}
              </button>
            </div>

            {messageTarget === 'user' && (
              <div className="input-wrap">
                <label className="input-label">{lang === 'bn' ? 'ব্যবহারকারী নির্বাচন' : 'Select User'}</label>
                <select
                  className="inp"
                  value={messageUserId}
                  onChange={e => setMessageUserId(e.target.value)}
                >
                  <option value="">{lang === 'bn' ? 'নির্বাচন করুন' : 'Choose a user'}</option>
                  {messageCandidates.map(u => (
                    <option key={u.id} value={u.id}>{u.name} ({u.identifier})</option>
                  ))}
                </select>
              </div>
            )}

            <div className="input-wrap">
              <label className="input-label">{lang === 'bn' ? 'মেসেজ' : 'Message'}</label>
              <textarea
                className="inp"
                rows={3}
                maxLength={1000}
                placeholder={lang === 'bn' ? 'এখানে মেসেজ লিখুন...' : 'Write your message...'}
                value={messageText}
                onChange={e => setMessageText(e.target.value)}
              />
            </div>

            <button className="btn btn-primary btn-full" onClick={sendAdminMessage} disabled={messageSending}>
              {messageSending
                ? (lang === 'bn' ? 'পাঠানো হচ্ছে...' : 'Sending...')
                : (lang === 'bn' ? 'পাঠান' : 'Send Message')}
            </button>
          </div>

          {/* User-admin quota card */}
          {!isMainAdmin && myQuota && (
            <div className="card" style={{ marginBottom: 12, borderColor: 'rgba(14,203,129,0.3)', background: 'rgba(14,203,129,0.05)' }}>
              <div style={{ fontWeight: 700, fontSize: 13, marginBottom: 8 }}>
                <Icons.BarChart size={13} /> {isBn ? 'আজকের ব্যালেন্স কোটা' : 'Your Daily Balance Quota'}
              </div>
              <div style={{ display: 'flex', gap: 16, fontSize: 12, flexWrap: 'wrap' }}>
                <div>
                  <span style={{ color: 'var(--text2)' }}>{isBn ? 'বাকি বার: ' : 'Adds left: '}</span>
                  <strong>{myQuota.remaining_adds}/3</strong>
                </div>
                <div>
                  <span style={{ color: 'var(--text2)' }}>{isBn ? 'দৈনিক লিমিট: ' : 'Daily limit: '}</span>
                  <strong>৳{myQuota.daily_limit}</strong>
                </div>
                <div>
                  <span style={{ color: 'var(--text2)' }}>{isBn ? 'আজ ব্যবহৃত: ' : 'Used today: '}</span>
                  <strong>৳{myQuota.used_today}</strong>
                </div>
                <div>
                  <span style={{ color: 'var(--text2)' }}>{isBn ? 'অবশিষ্ট: ' : 'Remaining: '}</span>
                  <strong style={{ color: '#0ECB81' }}>৳{myQuota.remaining_amount}</strong>
                </div>
              </div>
            </div>
          )}

          {/* Stats */}
          <div className="stats-row">
            <div className="stat-box">
              <div className="stat-num">{users.length}</div>
              <div className="stat-label">{t.admin_total_users}</div>
            </div>
            <div className="stat-box">
              <div className="stat-num">{users.filter(u => u.is_admin && !u.is_main_admin).length}</div>
              <div className="stat-label">{lang === 'bn' ? 'ইউজার অ্যাডমিন' : 'User Admins'}</div>
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
              style={{ marginBottom: 8 }} />
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
              {[
                { id: 'all', label: lang === 'bn' ? 'সকল' : 'All' },
                { id: 'active', label: lang === 'bn' ? 'সক্রিয়' : 'Active' },
                { id: 'banned', label: lang === 'bn' ? 'নিষিদ্ধ' : 'Banned' },
                ...(isMainAdmin ? [{ id: 'admin', label: lang === 'bn' ? 'অ্যাডমিন' : 'Admin' }] : []),
              ].map(f => (
                <button key={f.id}
                  className={`btn ${userStatusFilter === f.id ? 'btn-primary' : 'btn-outline'}`}
                  style={{ fontSize: 11, padding: '4px 12px', borderRadius: 6 }}
                  onClick={() => setUserStatusFilter(f.id)}>
                  {f.label}
                  {f.id === 'all' && ` (${users.length})`}
                  {f.id === 'active' && ` (${users.filter(u => !u.banned && !u.is_admin).length})`}
                  {f.id === 'banned' && ` (${users.filter(u => u.banned).length})`}
                  {f.id === 'admin' && ` (${users.filter(u => u.is_admin).length})`}
                </button>
              ))}
            </div>
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

              {/* Edit form (main admin only) */}
              {isMainAdmin && (
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
              )}

              {/* Admin toggle + balance limit (main admin only) */}
              {isMainAdmin && (
              <>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: editIsAdmin ? 8 : 12 }}>
                <label className="input-label" style={{ marginBottom: 0 }}>
                  {isBn ? 'ইউজার এডমিন' : 'User Admin'}
                </label>
                <div
                  onClick={() => {
                    if (selectedUser.id === user.id) {
                      showToast(t.admin_cannot_self_demote);
                      return;
                    }
                    if (selectedUser.is_main_admin) {
                      showToast(isBn ? 'Main Admin পরিবর্তন করা যায় না' : 'Cannot change Main Admin');
                      return;
                    }
                    setEditIsAdmin(!editIsAdmin);
                  }}
                  style={{
                    width: 44, height: 24, borderRadius: 12,
                    background: editIsAdmin ? '#0ECB81' : 'var(--border)',
                    cursor: (selectedUser.id === user.id || selectedUser.is_main_admin) ? 'not-allowed' : 'pointer',
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
              {editIsAdmin && !selectedUser.is_main_admin && (
                <div className="input-wrap" style={{ marginBottom: 12 }}>
                  <label className="input-label">
                    {isBn ? 'দৈনিক ব্যালেন্স লিমিট (৳)' : 'Daily Balance Limit (৳)'}
                  </label>
                  <input className="inp" type="number" value={editBalanceLimit}
                    onChange={e => setEditBalanceLimit(e.target.value)}
                    placeholder={isBn ? 'সর্বোচ্চ কত টাকা যোগ করতে পারবে/দিন' : 'Max amount this admin can add per day'} />
                  <div style={{ fontSize: 10, color: 'var(--text2)', marginTop: 4 }}>
                    {isBn ? 'এই এডমিন দিনে সর্বোচ্চ ৩ বার, মোট এই পরিমাণ পর্যন্ত ব্যালেন্স যোগ করতে পারবে।' : 'This admin can add balance max 3 times/day, up to this total amount.'}
                  </div>
                </div>
              )}
              </>
              )}

              {/* User-admin: Add balance section */}
              {!isMainAdmin && !selectedUser.is_admin && (
              <div style={{ marginBottom: 12, padding: 12, borderRadius: 8, background: 'rgba(14,203,129,0.07)', border: '1px solid rgba(14,203,129,0.2)' }}>
                <div style={{ fontWeight: 700, fontSize: 12, marginBottom: 8 }}>
                  <Icons.Dollar size={13} /> {isBn ? 'ব্যালেন্স যোগ করুন' : 'Add Balance'}
                </div>
                <div style={{ fontSize: 11, color: 'var(--text2)', marginBottom: 6 }}>
                  {isBn ? `বর্তমান ব্যালেন্স: ${formatMoney(selectedUser.balance)}` : `Current: ${formatMoney(selectedUser.balance)}`}
                </div>
                {myQuota && (
                  <div style={{ display: 'flex', gap: 12, fontSize: 10, color: 'var(--text2)', marginBottom: 8, flexWrap: 'wrap' }}>
                    <span>{isBn ? `আজ বাকি: ${myQuota.remaining_adds}/৩ বার` : `Today: ${myQuota.remaining_adds}/3 remaining`}</span>
                    <span>{isBn ? `লিমিট: ৳${myQuota.daily_limit}` : `Limit: ৳${myQuota.daily_limit}`}</span>
                    <span>{isBn ? `বাকি: ৳${myQuota.remaining_amount}` : `Left: ৳${myQuota.remaining_amount}`}</span>
                  </div>
                )}
                <div style={{ display: 'flex', gap: 8 }}>
                  <input className="inp" type="number" value={addBalanceAmount}
                    onChange={e => setAddBalanceAmount(e.target.value)}
                    placeholder={isBn ? 'পরিমাণ লিখুন' : 'Enter amount'}
                    style={{ flex: 1 }} />
                  <button className="btn btn-success" onClick={addBalanceToUser} disabled={saving || !addBalanceAmount}
                    style={{ fontSize: 12, padding: '6px 16px' }}>
                    {saving ? '...' : (isBn ? 'যোগ করুন' : 'Add')}
                  </button>
                </div>
              </div>
              )}

              <div style={{ display: 'flex', gap: 8 }}>
                {isMainAdmin && (
                <button className="btn btn-primary" onClick={saveUser} disabled={saving} style={{ flex: 1 }}>
                  {saving ? t.admin_saving : t.admin_save}
                </button>
                )}
                <button className={`btn ${selectedUser.banned ? 'btn-success' : 'btn-danger'}`}
                  onClick={() => toggleBan(selectedUser)} style={{ flex: isMainAdmin ? 1 : 2 }}>
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
              <div key={u.id} className="card"
                style={{
                  padding: '12px 16px',
                  borderColor: selectedUser?.id === u.id ? 'var(--accent)' : undefined,
                  opacity: u.banned ? 0.7 : 1,
                }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div
                    onClick={() => selectUser(u)}
                    style={{
                      width: 40, height: 40, borderRadius: '50%', cursor: 'pointer',
                      background: 'linear-gradient(135deg, var(--accent), var(--accent2))',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: 16, fontWeight: 700, flexShrink: 0,
                    }}>{u.avatar || u.name[0]}</div>
                  <div style={{ flex: 1, minWidth: 0, cursor: 'pointer' }} onClick={() => selectUser(u)}>
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
                  {/* Quick ban/unban button */}
                  <button
                    className={`btn ${u.banned ? 'btn-success' : 'btn-danger'}`}
                    style={{ fontSize: 10, padding: '4px 10px', flexShrink: 0, whiteSpace: 'nowrap' }}
                    onClick={e => { e.stopPropagation(); toggleBan(u); }}
                  >
                    {u.banned
                      ? (lang === 'bn' ? 'আনব্যান' : 'Unban')
                      : (lang === 'bn' ? 'ব্যান' : 'Ban')}
                  </button>
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
      {/* OPS TAB — Admin Plan & SOP */}
      {/* ══════════════════════════════════════════════════════════════════════ */}
      {activeTab === 'ops' && (
        <>
          {/* Header with theme toggle */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <div>
              <h2 style={{ margin: 0, fontSize: 18, fontWeight: 900 }}>
                <Icons.Document size={13} /> {isBn ? 'অপারেশন SOP' : 'Operations SOP'}
              </h2>
              <p style={{ margin: '4px 0 0', fontSize: 12, color: 'var(--text2)' }}>
                {isBn ? 'Admin টিমের কাজ প্রক্রিয়া এবং লক্ষ্য' : 'Team workflow and targets'}
              </p>
            </div>
            <div onClick={() => setAdminThemeDark(!adminThemeDark)} style={{
              width: 50, height: 28, borderRadius: 14, background: adminThemeDark ? '#1F2937' : '#F3F4F6',
              border: '2px solid var(--border)', cursor: 'pointer', display: 'flex', alignItems: 'center',
              padding: '2px', transition: 'all 0.3s',
            }}>
              <div style={{
                width: 24, height: 24, borderRadius: '50%', background: 'var(--accent)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                transform: adminThemeDark ? 'translateX(22px)' : 'translateX(0)',
                transition: 'transform 0.3s', fontSize: 12,
              }}>
                {adminThemeDark ? <Icons.Moon size={12} /> : <Icons.Sun size={12} />}
              </div>
            </div>
          </div>

          {/* Admin Roles Overview */}
          <div className="card" style={{ marginBottom: 16 }}>
            <div className="card-title"><Icons.People size={14} /> {isBn ? 'Admin ভূমিকা' : 'Admin Roles'}</div>
            {adminRoles.map((role, i) => (
              <div key={i} style={{
                padding: '12px', marginBottom: i < adminRoles.length - 1 ? 8 : 0,
                borderRadius: 8, background: 'rgba(245, 158, 11, 0.05)',
                border: '1px solid rgba(245, 158, 11, 0.2)',
              }}>
                <div style={{ fontWeight: 700, fontSize: 13, color: 'var(--accent)', marginBottom: 4 }}>
                  {role.title}
                </div>
                <div style={{ fontSize: 12, color: 'var(--text2)', marginBottom: 6 }}>
                  {role.desc}
                </div>
                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                  {role.perms.map((p, j) => (
                    <span key={j} className="badge badge-blue" style={{ fontSize: 10, padding: '2px 8px' }}>
                      ✓ {p}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Daily Operations Checklist */}
          <div className="card" style={{ marginBottom: 16 }}>
            <div className="card-title"><Icons.CheckCircle size={14} /> {isBn ? 'দৈনিক কাজের তালিকা' : 'Daily Checklist'}</div>
            {opsChecklist.map((item, i) => (
              <div key={i} style={{
                display: 'flex', gap: 8, alignItems: 'flex-start', padding: '8px 0',
                borderBottom: i < opsChecklist.length - 1 ? '1px solid var(--border)' : 'none',
              }}>
                <div style={{ flexShrink: 0, marginTop: 2 }}>
                  {[<Icons.Sun key="s1" size={16} />, <Icons.Sun key="s2" size={16} color="#F59E0B" />, <Icons.Moon key="m" size={16} />][i]}
                </div>
                <div style={{ flex: 1, fontSize: 13 }}>{item}</div>
              </div>
            ))}
          </div>

          {/* Finance Operations SOP */}
          <div className="card" style={{ marginBottom: 16 }}>
            <div className="card-title"><Icons.CreditCard size={14} /> {isBn ? 'ফিনান্স অপারেশন SOP' : 'Finance Operations SOP'}</div>
            <div style={{ fontSize: 12, color: 'var(--text2)', marginBottom: 10 }}>
              {isBn ? 'ডিপোজিট/উইথড্র রিকোয়েস্ট প্রসেস করার নিয়ম' : 'How to process deposit/withdraw requests'}
            </div>
            <div style={{ background: 'var(--card)', borderRadius: 8, border: '1px solid var(--border)' }}>
              {financeSop.map((item, i) => (
                <div key={i} style={{
                  padding: '10px', borderBottom: i < financeSop.length - 1 ? '1px solid var(--border)' : 'none',
                  fontSize: 12, display: 'flex', gap: 8,
                }}>
                  <span style={{ color: 'var(--accent)', fontWeight: 700, flexShrink: 0 }}>•</span>
                  <span>{item}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Support Operations SOP */}
          <div className="card" style={{ marginBottom: 16 }}>
            <div className="card-title"><Icons.Chat size={14} /> {isBn ? 'সাপোর্ট অপারেশন SOP' : 'Support Operations SOP'}</div>
            <div style={{ fontSize: 12, color: 'var(--text2)', marginBottom: 10 }}>
              {isBn ? 'লাইভ চ্যাট এবং Telegram সাপোর্ট হ্যান্ডলিং নিয়ম' : 'How to handle live chat and Telegram support'}
            </div>
            <div style={{ background: 'var(--card)', borderRadius: 8, border: '1px solid var(--border)' }}>
              {supportSop.map((item, i) => (
                <div key={i} style={{
                  padding: '10px', borderBottom: i < supportSop.length - 1 ? '1px solid var(--border)' : 'none',
                  fontSize: 12, display: 'flex', gap: 8,
                }}>
                  <span style={{ color: 'var(--accent)', fontWeight: 700, flexShrink: 0 }}>•</span>
                  <span>{item}</span>
                </div>
              ))}
            </div>
          </div>

          {/* KPI Targets */}
          <div className="card" style={{ marginBottom: 16 }}>
            <div className="card-title"><Icons.Target size={14} /> {isBn ? 'KPI টার্গেট' : 'KPI Targets'}</div>
            <div className="stats-row">
              <div className="stat-box" style={{ background: 'rgba(240, 253, 250, 0.1)' }}>
                <div style={{ fontSize: 18, fontWeight: 900, color: '#14B8A6' }}>98%</div>
                <div style={{ fontSize: 10, color: 'var(--text2)', marginTop: 4 }}>
                  {isBn ? 'Deposit সাফল্য' : 'Deposit Success'}
                </div>
              </div>
              <div className="stat-box" style={{ background: 'rgba(240, 253, 250, 0.1)' }}>
                <div style={{ fontSize: 18, fontWeight: 900, color: '#14B8A6' }}>97%</div>
                <div style={{ fontSize: 10, color: 'var(--text2)', marginTop: 4 }}>
                  {isBn ? 'Withdraw সাফল্য' : 'Withdraw Success'}
                </div>
              </div>
              <div className="stat-box" style={{ background: 'rgba(251, 191, 36, 0.1)' }}>
                <div style={{ fontSize: 18, fontWeight: 900, color: '#F59E0B' }}>60 min</div>
                <div style={{ fontSize: 10, color: 'var(--text2)', marginTop: 4 }}>
                  {isBn ? 'গড় Withdraw' : 'Avg Withdraw Time'}
                </div>
              </div>
              <div className="stat-box" style={{ background: 'rgba(239, 68, 68, 0.1)' }}>
                <div style={{ fontSize: 18, fontWeight: 900, color: '#EF4444' }}>&lt;0.5%</div>
                <div style={{ fontSize: 10, color: 'var(--text2)', marginTop: 4 }}>
                  {isBn ? 'ফ্রড লস' : 'Fraud Loss'}
                </div>
              </div>
            </div>
          </div>

          {/* Fraud Control Rules */}
          <div className="card" style={{ marginBottom: 16 }}>
            <div className="card-title"><Icons.Shield size={14} /> {isBn ? 'ফ্রড নিয়ন্ত্রণ' : 'Fraud Control Rules'}</div>
            <div style={{ fontSize: 12, color: 'var(--text2)', marginBottom: 10 }}>
              {isBn ? 'সন্দেহজনক কার্যকলাপ সনাক্ত এবং ব্লক করার নিয়ম' : 'How to identify and handle suspicious activities'}
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              <div style={{ padding: 10, borderRadius: 8, background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.3)' }}>
                <div style={{ fontWeight: 700, fontSize: 11, color: '#EF4444', marginBottom: 6, display: 'flex', alignItems: 'center', gap: 4 }}><Icons.AlertTriangle size={12} color="#EF4444" /> HIGH RISK</div>
                <ul style={{ margin: 0, paddingLeft: 16, fontSize: 11, color: 'var(--text2)' }}>
                  <li>{isBn ? 'একই ডিভাইস থেকে অনেক একাউন্ট' : 'Many accounts from same device'}</li>
                  <li>{isBn ? 'দ্রুত ডিপোজিট-উইথড্র' : 'Rapid deposit-withdraw'}</li>
                  <li>{isBn ? 'অস্বাভাবিক রেফারেল বৃদ্ধি' : 'Abnormal referral growth'}</li>
                </ul>
              </div>
              <div style={{ padding: 10, borderRadius: 8, background: 'rgba(251, 191, 36, 0.1)', border: '1px solid rgba(251, 191, 36, 0.3)' }}>
                <div style={{ fontWeight: 700, fontSize: 11, color: '#F59E0B', marginBottom: 6, display: 'flex', alignItems: 'center', gap: 4 }}><Icons.AlertTriangle size={12} color="#F59E0B" /> ACTION</div>
                <ul style={{ margin: 0, paddingLeft: 16, fontSize: 11, color: 'var(--text2)' }}>
                  <li>{isBn ? 'একাউন্টে মার্ক করুন' : 'Mark account risk flag'}</li>
                  <li>{isBn ? 'বড় লেনদেন হোল্ড করুন' : 'Hold large transactions'}</li>
                  <li>{isBn ? 'Manual KYC যাচাই' : 'Manual KYC verification'}</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Weekly Review */}
          <div className="card">
            <div className="card-title"><Icons.BarChart size={14} /> {isBn ? 'সাপ্তাহিক পর্যালোচনা' : 'Weekly Review Points'}</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <div style={{ padding: 10, borderRadius: 8, background: 'var(--card)', border: '1px solid var(--border)' }}>
                <div style={{ fontWeight: 700, fontSize: 12, marginBottom: 4 }}>1. Payout Reconciliation</div>
                <div style={{ fontSize: 11, color: 'var(--text2)' }}>
                  {isBn ? 'সব পেআউট এক্সপোর্ট করুন এবং রেকর্ড রাখুন' : 'Export all payouts and keep records'}
                </div>
              </div>
              <div style={{ padding: 10, borderRadius: 8, background: 'var(--card)', border: '1px solid var(--border)' }}>
                <div style={{ fontWeight: 700, fontSize: 12, marginBottom: 4 }}>2. Fraud Pattern Review</div>
                <div style={{ fontSize: 11, color: 'var(--text2)' }}>
                  {isBn ? 'নতুন ফ্রড প্যাটার্ন খুঁজুন এবং রুল আপডেট করুন' : 'Find new fraud patterns, update rules'}
                </div>
              </div>
              <div style={{ padding: 10, borderRadius: 8, background: 'var(--card)', border: '1px solid var(--border)' }}>
                <div style={{ fontWeight: 700, fontSize: 12, marginBottom: 4 }}>3. Retention Campaign</div>
                <div style={{ fontSize: 11, color: 'var(--text2)' }}>
                  {isBn ? 'নিষ্ক্রিয় ব্যবহারকারীদের জন্য অফার পাঠান' : 'Send offers to inactive users'}
                </div>
              </div>
            </div>
          </div>
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

              {/* Users overview */}
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
                      {stats.newUsersToday ?? '—'}
                    </div>
                    <div style={{ fontSize: 10, color: 'var(--text2)', marginTop: 4 }}>{lang === 'bn' ? 'আজ নতুন' : 'New Today'}</div>
                  </div>
                  <div style={{ padding: '10px', borderRadius: 8, background: 'rgba(246,70,93,0.1)', textAlign: 'center' }}>
                    <div style={{ fontFamily: 'Space Grotesk', fontSize: 20, fontWeight: 700, color: '#F6465D' }}>
                      {users.filter(u => u.banned).length}
                    </div>
                    <div style={{ fontSize: 10, color: 'var(--text2)', marginTop: 4 }}>{t.admin_banned}</div>
                  </div>
                  <div style={{ padding: '10px', borderRadius: 8, background: 'rgba(252,213,53,0.1)', textAlign: 'center' }}>
                    <div style={{ fontFamily: 'Space Grotesk', fontSize: 20, fontWeight: 700, color: '#FCD535' }}>
                      {stats.activeToday ?? '—'}
                    </div>
                    <div style={{ fontSize: 10, color: 'var(--text2)', marginTop: 4 }}>{lang === 'bn' ? 'আজ সক্রিয়' : 'Active Today'}</div>
                  </div>
                </div>
              </div>

              {/* Support stats */}
              {stats.support && (
                <div className="card">
                  <div className="card-title"><Icons.Chat size={14} /> {lang === 'bn' ? 'সাপোর্ট সারসংক্ষেপ' : 'Support Summary'}</div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10 }}>
                    <div style={{ padding: '10px', borderRadius: 8, background: 'rgba(99,102,241,0.1)', textAlign: 'center' }}>
                      <div style={{ fontFamily: 'Space Grotesk', fontSize: 20, fontWeight: 700, color: '#6366F1' }}>
                        {stats.support.totalSessions}
                      </div>
                      <div style={{ fontSize: 10, color: 'var(--text2)', marginTop: 4 }}>{lang === 'bn' ? 'মোট সেশন' : 'Sessions'}</div>
                    </div>
                    <div style={{ padding: '10px', borderRadius: 8, background: 'rgba(246,70,93,0.1)', textAlign: 'center' }}>
                      <div style={{ fontFamily: 'Space Grotesk', fontSize: 20, fontWeight: 700, color: '#F6465D' }}>
                        {stats.support.unrepliedSessions}
                      </div>
                      <div style={{ fontSize: 10, color: 'var(--text2)', marginTop: 4 }}>{lang === 'bn' ? 'উত্তরবিহীন' : 'Unanswered'}</div>
                    </div>
                    <div style={{ padding: '10px', borderRadius: 8, background: 'rgba(14,203,129,0.1)', textAlign: 'center' }}>
                      <div style={{ fontFamily: 'Space Grotesk', fontSize: 20, fontWeight: 700, color: '#0ECB81' }}>
                        {stats.support.adminReplies}
                      </div>
                      <div style={{ fontSize: 10, color: 'var(--text2)', marginTop: 4 }}>{lang === 'bn' ? 'উত্তর দেওয়া' : 'Replies Sent'}</div>
                    </div>
                  </div>
                </div>
              )}

              {/* Top Earners */}
              {stats.topEarners && stats.topEarners.length > 0 && (
                <div className="card">
                  <div className="card-title"><Icons.Trophy size={14} /> {lang === 'bn' ? 'শীর্ষ উপার্জনকারী' : 'Top Earners'}</div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                    {stats.topEarners.map((u, i) => (
                      <div key={i} style={{
                        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                        padding: '7px 10px', borderRadius: 8, background: 'rgba(35,175,145,0.07)',
                        border: '1px solid rgba(35,175,145,0.12)',
                      }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <span style={{ fontWeight: 700, color: '#FCD535', minWidth: 20, fontSize: 13 }}>#{i + 1}</span>
                          <span style={{ fontSize: 13, fontWeight: 600 }}>{u.name}</span>
                          {u.plan_id && <span className="badge badge-blue" style={{ fontSize: 10 }}>P{u.plan_id}</span>}
                        </div>
                        <span style={{ fontFamily: 'Space Grotesk', fontSize: 13, fontWeight: 700, color: '#0ECB81' }}>
                          {formatMoney(u.balance)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </>
      )}

      {/* ══════════════════════════════════════════════════════════════════════ */}
      {/* SUPPORT TAB */}
      {/* ══════════════════════════════════════════════════════════════════════ */}
      {activeTab === 'support' && (
        <>
          {/* Session list */}
          {!activeSupportSession ? (
            <div className="card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                <div className="card-title" style={{ marginBottom: 0 }}>
                  <Icons.Chat size={14} /> {lang === 'bn' ? 'সাপোর্ট সেশন' : 'Support Sessions'}
                </div>
                <button className="btn btn-outline" style={{ fontSize: 11, padding: '5px 12px' }}
                  onClick={fetchSupportSessions} disabled={supportLoading}>
                  <Icons.Refresh size={12} /> {lang === 'bn' ? 'রিফ্রেশ' : 'Refresh'}
                </button>
              </div>

              {supportLoading ? (
                <div style={{ textAlign: 'center', padding: 24, color: 'var(--text2)', fontSize: 13 }}>
                  {lang === 'bn' ? 'লোড হচ্ছে...' : 'Loading...'}
                </div>
              ) : supportSessions.length === 0 ? (
                <div style={{ textAlign: 'center', padding: 24, color: 'var(--text2)', fontSize: 13 }}>
                  {lang === 'bn' ? 'কোনো সাপোর্ট সেশন নেই।' : 'No support sessions yet.'}
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {supportSessions.map(sess => {
                    const hasReply = sess.admin_replies > 0;
                    const displayName = sess.user_name || (lang === 'bn' ? 'অজ্ঞাত ব্যবহারকারী' : 'Unknown User');
                    return (
                      <div key={sess.session_id}
                        onClick={() => openSupportSession(sess.session_id)}
                        style={{
                          padding: '10px 12px', borderRadius: 10, cursor: 'pointer',
                          background: hasReply ? 'rgba(14,203,129,0.07)' : 'rgba(246,70,93,0.07)',
                          border: `1px solid ${hasReply ? 'rgba(14,203,129,0.2)' : 'rgba(246,70,93,0.2)'}`,
                          transition: 'opacity .15s',
                        }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                          <div style={{ fontWeight: 700, fontSize: 13 }}>
                            <Icons.User size={12} /> {displayName}
                          </div>
                          <div style={{ display: 'flex', gap: 6 }}>
                            <span className={`badge ${hasReply ? 'badge-green' : 'badge-orange'}`} style={{ fontSize: 10 }}>
                              {hasReply
                                ? (lang === 'bn' ? '✓ উত্তর দেওয়া' : '✓ Replied')
                                : (lang === 'bn' ? 'অপেক্ষায়' : 'Pending')}
                            </span>
                          </div>
                        </div>
                        <div style={{ fontSize: 12, color: 'var(--text)', marginBottom: 4, overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis' }}>
                          {sess.last_message || '—'}
                        </div>
                        <div style={{ display: 'flex', gap: 12, fontSize: 11, color: 'var(--text2)' }}>
                          <span><Icons.Chat size={11} /> {sess.user_msgs} {lang === 'bn' ? 'মেসেজ' : 'msgs'}</span>
                          <span><Icons.Reply size={11} /> {sess.admin_replies} {lang === 'bn' ? 'উত্তর' : 'replies'}</span>
                          <span style={{ marginLeft: 'auto' }}>{sess.last_active ? new Date(sess.last_active + 'Z').toLocaleString() : ''}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          ) : (
            /* Chat thread view */
            <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
              {/* Header */}
              <div style={{
                padding: '12px 16px', borderBottom: '1px solid var(--border)',
                display: 'flex', alignItems: 'center', gap: 10,
                background: 'rgba(35,175,145,0.08)',
              }}>
                <button className="icon-btn" onClick={() => { setActiveSupportSession(null); setSupportMessages([]); }}>
                  <Icons.X size={16} />
                </button>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 700, fontSize: 13 }}>
                    <Icons.User size={13} /> {supportSessions.find(s => s.session_id === activeSupportSession)?.user_name || (lang === 'bn' ? 'অজ্ঞাত' : 'Unknown')}
                  </div>
                  <div style={{ fontFamily: 'monospace', fontSize: 10, color: 'var(--text2)', marginTop: 2 }}>
                    {activeSupportSession.slice(0, 28)}...
                  </div>
                </div>
                <button className="btn btn-outline" style={{ fontSize: 11, padding: '4px 10px' }}
                  onClick={() => fetchSupportMessages(activeSupportSession)} disabled={supportMsgsLoading}>
                  <Icons.Refresh size={14} />
                </button>
              </div>

              {/* Messages */}
              <div style={{ height: 300, overflowY: 'auto', padding: '12px 14px', display: 'flex', flexDirection: 'column', gap: 8 }}>
                {supportMsgsLoading ? (
                  <div style={{ textAlign: 'center', padding: 24, color: 'var(--text2)', fontSize: 13 }}>
                    {lang === 'bn' ? 'লোড হচ্ছে...' : 'Loading...'}
                  </div>
                ) : supportMessages.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: 24, color: 'var(--text2)', fontSize: 13 }}>
                    {lang === 'bn' ? 'কোনো মেসেজ নেই।' : 'No messages.'}
                  </div>
                ) : (
                  supportMessages.map((m, i) => (
                    <div key={m.id || i} style={{
                      alignSelf: m.sender === 'user' ? 'flex-start' : 'flex-end',
                      maxWidth: '80%',
                      padding: '8px 12px',
                      borderRadius: 12,
                      fontSize: 13,
                      background: m.sender === 'user'
                        ? 'rgba(43,49,57,0.7)'
                        : 'linear-gradient(135deg,rgba(35,175,145,0.3),rgba(35,175,145,0.15))',
                      border: m.sender === 'admin' ? '1px solid rgba(35,175,145,0.3)' : '1px solid rgba(43,49,57,0.5)',
                      color: 'var(--text)',
                    }}>
                      <div style={{ fontSize: 10, color: 'var(--text2)', marginBottom: 3 }}>
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 3 }}>{m.sender === 'user' ? <><Icons.User size={10} /> {m.sender_name || 'User'}</> : <><Icons.Shield size={10} /> {m.sender_name || 'Admin'}</>}</span>
                        {' · '}{m.created_at ? new Date(m.created_at + 'Z').toLocaleTimeString() : ''}
                      </div>
                      {m.message}
                    </div>
                  ))
                )}
              </div>

              {/* Reply box */}
              <div style={{ padding: '10px 14px', borderTop: '1px solid var(--border)', display: 'flex', gap: 8 }}>
                <input
                  className="inp"
                  style={{ flex: 1, marginBottom: 0 }}
                  placeholder={lang === 'bn' ? 'উত্তর লিখুন...' : 'Type your reply...'}
                  value={supportReply}
                  onChange={e => setSupportReply(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && sendSupportReply()}
                  disabled={supportReplying}
                />
                <button className="btn btn-primary" style={{ flexShrink: 0 }}
                  onClick={sendSupportReply} disabled={!supportReply.trim() || supportReplying}>
                  {supportReplying ? '...' : (lang === 'bn' ? 'পাঠান' : 'Send')}
                </button>
              </div>
            </div>
          )}
        </>
      )}

      {/* ══════════════════════════════════════════════════════════════════════ */}
      {/* SETTINGS TAB */}
      {/* ══════════════════════════════════════════════════════════════════════ */}
      {activeTab === 'settings' && (
        <>
          <div className="card">
            <div className="card-title"><Icons.CreditCard size={14} /> {lang === 'bn' ? 'ডিপোজিট নম্বর সেটিংস' : 'Deposit Payment Numbers'}</div>
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
                : (lang === 'bn' ? 'সংরক্ষণ করুন' : 'Save Settings')
              }
            </button>
          </div>
        </>
      )}

      <div style={{ height: 16 }} />
    </>
  );
}
