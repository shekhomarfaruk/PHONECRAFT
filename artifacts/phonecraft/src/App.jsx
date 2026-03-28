import { useState, useCallback, useEffect, useRef } from "react";
import useBreakpoint from "./hooks.js";
import Icons from "./Icons.jsx";
import { GlobalStyles } from "./GlobalStyles.jsx";
import PhoneCraftBackground from "./PhoneCraftBackground.jsx";
import { playNotifSound } from "./sounds.js";
import AuthScreen from "./screens/AuthScreen.jsx";
import HomeScreen from "./screens/HomeScreen.jsx";
import NotifScreen from "./screens/NotifScreen.jsx";
import WalletScreen from "./screens/WalletScreen.jsx";
import BalanceScreen from "./screens/BalanceScreen.jsx";
import ReferScreen from "./screens/ReferScreen.jsx";
import ProfileScreen from "./screens/ProfileScreen.jsx";
import TeamChatScreen from "./screens/TeamChatScreen.jsx";
import MarketplaceScreen from "./screens/MarketplaceScreen.jsx";
import SupportScreen from "./screens/SupportScreen.jsx";
import SettingsScreen from "./screens/SettingsScreen.jsx";
import WorkScreen from "./screens/WorkScreen.jsx";
import GuideScreen from "./screens/GuideScreen.jsx";
import LandingScreen from "./screens/LandingScreen.jsx";
import SupportWidget from "./SupportWidget.jsx";
import { I18N } from "./i18n.js";
import { convertCurrency, convertCurrencyText, fetchLiveRate, getLiveRate } from "./currency.js";
import { clearStoredSession, getStoredSession, getAuthToken, authFetch, mapApiUser, saveStoredSession } from "./session.js";
import { initPush, isPushSupported } from "./push.js";

// ── Custom Balance Icon ───────────────────────────────────────────────────────
const BalanceIconImg = ({ size = 18 }) => (
  <img src="/balanceicon.png" alt="balance" style={{ width: size, height: size, objectFit: 'contain', display: 'block' }} />
);

// ── MENU (dynamic labels from i18n) ──────────────────────────────────────────
function getMenuItems(lang) {
  const t = I18N[lang] || I18N.en;
  return [
    { Icon: Icons.Home,     label: t.nav_home,     screen: 'home',          color: '#4ADE80' },
    { Icon: Icons.Work,     label: t.nav_work,     screen: 'work',          color: '#A78BFA' },
    { Icon: Icons.Bell,     label: t.nav_notif,    screen: 'notifications', color: '#FBBF24' },
    { Icon: Icons.Wallet,   label: t.nav_wallet,   screen: 'wallet',        color: '#60A5FA' },
    { Icon: BalanceIconImg, label: t.nav_balance,  screen: 'balance',       color: '#34D399' },
    { Icon: Icons.Link,     label: t.nav_refer,    screen: 'refer',         color: '#F97316' },
    { Icon: Icons.User,     label: t.nav_profile,  screen: 'profile',       color: '#F472B6' },
    { Icon: Icons.Chat,     label: t.nav_chat,     screen: 'teamchat',      color: '#2DD4BF' },
    { Icon: Icons.Market,   label: t.nav_market,   screen: 'marketplace',   color: '#FB923C' },
    { Icon: Icons.Support,  label: t.nav_support,  screen: 'support',       color: '#F87171' },
    { Icon: Icons.Book,     label: t.nav_guide,    screen: 'guide',         color: '#38BDF8' },
    { Icon: Icons.Settings, label: t.nav_settings, screen: 'settings',      color: '#94A3B8' },
  ];
}

// ── Helper: relative time from UTC datetime string ───────────────────────────
function formatRelativeTime(utcDateStr, lang) {
  if (!utcDateStr) return '';
  const t = I18N[lang] || I18N.en;
  const diff = Date.now() - new Date(utcDateStr + 'Z').getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1)  return t.time_just_now;
  if (mins < 60) return `${mins} ${t.time_min_ago}`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24)  return `${hrs} ${t.time_hr_ago}`;
  const days = Math.floor(hrs / 24);
  return `${days} ${t.time_day_ago}`;
}

function ToastBox({ toast, setToast, lang }) {
  const t = I18N[lang] || I18N.en;
  const label = toast.type === 'success' ? t.toast_success
    : toast.type === 'error'   ? t.toast_error
    : toast.type === 'warning' ? t.toast_warning
    : t.toast_info;
  return (
    <div className={`toast toast-${toast.type}`}>
      <div className="toast-icon-wrap">
        {toast.type === 'success' ? <Icons.CheckCircle size={22} />
          : toast.type === 'error' ? <Icons.AlertCircle size={22} />
          : toast.type === 'warning' ? <Icons.AlertTriangle size={22} />
          : <Icons.Info size={22} />}
      </div>
      <div className="toast-body">
        <div className="toast-type-label">{label}</div>
        <div className="toast-msg-text">{toast.msg}</div>
      </div>
      <div className="toast-close" onClick={() => setToast(null)}>
        <Icons.X size={16} />
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// MAIN APP
// ══════════════════════════════════════════════════════════════════════════════
const API_URL = import.meta.env.VITE_API_URL || '';

export default function App() {
  const [isDark,        setIsDark       ] = useState(() => localStorage.getItem('app-theme') !== 'light');
  const [showLanding,   setShowLanding  ] = useState(true);
  const [auth,          setAuth         ] = useState(null);
  const [authTab,       setAuthTab      ] = useState('login');
  const [screen,        setScreen       ] = useState('home');
  const [menuOpen,      setMenuOpen     ] = useState(false);
  const [toast,         setToast        ] = useState(null);
  const [lang,          setLang         ] = useState(() => localStorage.getItem('app-lang') || 'en');
  const [notifications, setNotifications] = useState([]);
  const [user,          setUser         ] = useState(null);
  const [fontSize,      setFontSize     ] = useState(() => localStorage.getItem('app-font-size') || 'medium');
  const [appSettings,   setAppSettings  ] = useState(() => {
    try { const c = localStorage.getItem('app-settings'); return c ? JSON.parse(c) : { maintenance_mode: 'false', announcement_banner: '' }; } catch { return { maintenance_mode: 'false', announcement_banner: '' }; }
  });
  const [settingsLoaded, setSettingsLoaded] = useState(() => !!localStorage.getItem('app-settings'));
  const [usdRate,       setUsdRate      ] = useState(() => getLiveRate());
  const [teamChatUnread, setTeamChatUnread] = useState(0);

  // Apply font size as CSS variable on root
  useEffect(() => {
    const map = { small: '13px', medium: '15px', large: '17px', xlarge: '19px' };
    document.documentElement.style.setProperty('--base-font', map[fontSize] || '15px');
    localStorage.setItem('app-font-size', fontSize);
  }, [fontSize]);

  // Persist language to localStorage + sync to server when logged in
  useEffect(() => {
    localStorage.setItem('app-lang', lang);
    const tok = auth?.token;
    const uid = user?.id;
    if (tok && uid) {
      fetch(`${API_URL}/api/user/${uid}/lang`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${tok}` },
        body: JSON.stringify({ lang }),
      }).catch(() => {});
    }
  }, [lang, user?.id, auth?.token]);

  // Persist theme to localStorage
  useEffect(() => { localStorage.setItem('app-theme', isDark ? 'dark' : 'light'); }, [isDark]);

  // Fetch & poll app settings (maintenance mode, announcement banner)
  useEffect(() => {
    const fetchAppSettings = () => {
      fetch(`${API_URL}/api/app-settings`)
        .then(r => r.json())
        .then(data => {
          setAppSettings(data);
          setSettingsLoaded(true);
          try { localStorage.setItem('app-settings', JSON.stringify(data)); } catch {}
        })
        .catch(() => { setSettingsLoaded(true); });
    };
    fetchAppSettings();
    const interval = setInterval(fetchAppSettings, 30000);
    return () => clearInterval(interval);
  }, []);

  // Auto-logout non-main-admin users when maintenance mode turns on
  useEffect(() => {
    if (appSettings.maintenance_mode === 'true' && user && !user.is_main_admin) {
      doLogout();
    }
  }, [appSettings.maintenance_mode, user?.is_main_admin]);

  // Fetch & cache live USD→BDT rate (every 7 minutes)
  useEffect(() => {
    const doFetch = async () => {
      const rate = await fetchLiveRate();
      setUsdRate(rate);
    };
    doFetch();
    const iv = setInterval(doFetch, 7 * 60 * 1000);
    return () => clearInterval(iv);
  }, []);

  // Persist user session to localStorage (auto-updates on any user change)
  useEffect(() => {
    if (user?.id && user?.authToken) {
      saveStoredSession(user);
    }
  }, [user]);

  // Restore session on app load
  useEffect(() => {
    try {
      const u = getStoredSession();
      if (u?.id && u?.authToken) {
          setUser(u);
          setAuth(true);
          setShowLanding(false);
          // Reinit push after session restore
          if (isPushSupported()) initPush(u.id);
      } else if (u?.id) {
        clearStoredSession();
      }
    } catch (_) {}
  }, []);

  // Live location tracking — send GPS to backend every 5 minutes
  useEffect(() => {
    if (!auth) return;
    if (!('geolocation' in navigator)) return;
    const sendLocation = (pos) => {
      const { latitude: lat, longitude: lng, accuracy } = pos.coords;
      authFetch(`${API_URL}/api/user/location`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ lat, lng, accuracy }),
      }).catch(() => {});
    };
    const opts = { enableHighAccuracy: false, timeout: 10000, maximumAge: 60000 };
    navigator.geolocation.getCurrentPosition(sendLocation, () => {}, opts);
    const iv = setInterval(() => {
      navigator.geolocation.getCurrentPosition(sendLocation, () => {}, opts);
    }, 5 * 60 * 1000);
    return () => clearInterval(iv);
  }, [auth]);

  const [loginForm,     setLoginForm    ] = useState({ identifier: '', password: '' });
  const [regForm,       setRegForm      ] = useState({ name: '', identifier: '', password: '', plan: '', refCode: '' });
  const [authLoading,   setAuthLoading  ] = useState(false);
  const [pendingRegId,  setPendingRegId ] = useState(null);
  const prevNotifCountRef = useRef(0);
  const { isMobile, isDesktop } = useBreakpoint();

  // ── Read ?ref= URL param → auto-fill signup ────────────────────────────────
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const ref = params.get('ref');
    if (ref) {
      setRegForm(p => ({ ...p, refCode: ref }));
      setShowLanding(false);
      setAuthTab('register');
    }
  }, []);

  // ── Poll pending registration status ──────────────────────────────────────
  useEffect(() => {
    if (!pendingRegId) return;
    const poll = setInterval(async () => {
      try {
        const res = await fetch(`${API_URL}/api/registration/${pendingRegId}/status`);
        const data = await res.json();
        if (data.status === 'approved') {
          clearInterval(poll);
          setPendingRegId(null);
          showToast(lang === 'bn' ? '✅ নিবন্ধন অনুমোদিত হয়েছে! লগইন করুন।' : '✅ Registration approved! Please login.');
          setAuthTab('login');
        } else if (data.status === 'declined') {
          clearInterval(poll);
          setPendingRegId(null);
          showToast(lang === 'bn' ? '❌ রেফারার নিবন্ধন প্রত্যাখ্যান করেছেন।' : '❌ Registration declined by referrer.');
          setAuthTab('register');
        }
      } catch (_) {}
    }, 5000);
    return () => clearInterval(poll);
  }, [pendingRegId, lang]);

  const showToast = useCallback((msg, type) => {
    const t = type || 'info';
    setToast({ msg, type: t });
    setTimeout(() => setToast(null), 3500);
  }, []);

  // ── Unified polling (pauses when tab hidden) ─────────────────────────────
  useEffect(() => {
    if (!user?.id) return;
    let cancelled = false;
    let notifTimer, balanceTimer, treeTimer, chatUnreadTimer;

    const isVisible = () => document.visibilityState !== 'hidden';

    const fetchNotifications = async () => {
      if (!isVisible()) return;
      try {
        const res = await authFetch(`${API_URL}/api/user/${user.id}/notifications`);
        const data = await res.json();
        if (!res.ok || !data.notifications) return;
        const mapped = data.notifications.map(n => ({
          id:   n.id,
          type: n.type,
          meta: n.meta || null,
          iconKey: n.type === 'sold' ? 'Dollar' : n.type === 'success' ? 'Smartphone' : n.type === 'registration_request' ? 'Bell' : 'Info',
          rawText: n.message,
          text: convertCurrencyText(n.message, lang),
          time: formatRelativeTime(n.created_at, lang),
          read: !!n.read,
        }));
        if (mapped.length > prevNotifCountRef.current && prevNotifCountRef.current > 0) {
          playNotifSound();
        }
        prevNotifCountRef.current = mapped.length;
        setNotifications(mapped);
      } catch (_) {}
    };

    const refreshBalance = async () => {
      if (!isVisible()) return;
      try {
        const res = await authFetch(`${API_URL}/api/user/${user.id}/balance-log`);
        if (!res.ok) return;
        const data = await res.json();
        if (typeof data.balance === 'number') {
          setUser(p => p ? { ...p, balance: data.balance } : p);
        }
      } catch (_) {}
    };

    const refreshReferralTree = async () => {
      if (!isVisible() || cancelled) return;
      try {
        const res = await authFetch(`${API_URL}/api/user/${user.id}/referral-activity`);
        if (!res.ok) return;
        const data = await res.json();
        if (cancelled || !Array.isArray(data.tree)) return;
        setUser(prev => prev ? { ...prev, teamMembers: data.tree } : prev);
      } catch (_) {}
    };

    const fetchChatUnread = async () => {
      if (!isVisible() || cancelled) return;
      try {
        const res = await authFetch(`${API_URL}/api/team-chat/unread`);
        if (!res.ok) return;
        const d = await res.json();
        setTeamChatUnread(d.unread || 0);
      } catch (_) {}
    };

    fetchNotifications();
    refreshBalance();
    refreshReferralTree();
    fetchChatUnread();

    notifTimer = setInterval(fetchNotifications, 8_000);
    balanceTimer = setInterval(refreshBalance, 15_000);
    treeTimer = setInterval(refreshReferralTree, 120_000);
    chatUnreadTimer = setInterval(fetchChatUnread, 30_000);

    const onVisChange = () => {
      if (isVisible()) {
        fetchNotifications();
        refreshBalance();
        fetchChatUnread();
      }
    };
    document.addEventListener('visibilitychange', onVisChange);

    return () => {
      cancelled = true;
      clearInterval(notifTimer);
      clearInterval(balanceTimer);
      clearInterval(treeTimer);
      clearInterval(chatUnreadTimer);
      document.removeEventListener('visibilitychange', onVisChange);
    };
  }, [user?.id]);

  const unreadCount = notifications.filter(n => !n.read).length;

  // ── Auth ──────────────────────────────────────────────────────────────────
  const translateServerError = (errStr, l) => {
    const t = I18N[l] || I18N.en;
    if (!errStr) return t.toast_connection_error;
    // Handle bilingual JSON error messages from server
    if (typeof errStr === 'string' && errStr.startsWith('{') && errStr.includes('"en"')) {
      try {
        const parsed = JSON.parse(errStr);
        return (l === 'bn' ? parsed.bn : parsed.en) || errStr;
      } catch (_) {}
    }
    const map = {
      'Invalid credentials':                   t.err_invalid_credentials,
      'This email/phone is already registered':t.err_email_phone_taken,
      'Invalid referral code':                 t.err_ref_invalid,
      'Invalid plan selected':                 t.err_plan_invalid,
      'User not found':                        t.err_user_not_found,
      'Your account has been suspended':       t.err_account_suspended,
      'All fields are required including referral code': t.err_all_fields_ref,
      'Insufficient balance':                  t.err_insufficient_balance,
      'This Transaction ID has already been used': t.err_duplicate_txid,
    };
    if (errStr.startsWith('Withdraw cooldown')) return t.err_withdraw_cooldown;
    if (errStr.startsWith('Complete') && errStr.includes('daily tasks')) return t.err_tasks_incomplete;
    if (errStr.startsWith('Daily transfer limit')) return t.err_daily_limit;
    if (errStr.startsWith('Must keep minimum')) return t.err_min_balance;
    return map[errStr] || errStr;
  };

  const doLogin = async () => {
    const t = I18N[lang] || I18N.en;
    if (!loginForm.identifier || !loginForm.password) { showToast('⚠️ ' + t.auth_fill_all); return; }
    setAuthLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(loginForm),
      });
      const data = await res.json();
      if (!res.ok) { showToast('⚠️ ' + translateServerError(data.error, lang)); return; }
      const nextUser = mapApiUser(data.user, data.plan, data.token);
      setUser(nextUser);
      saveStoredSession(nextUser);
      setAuth(true);
      // Init push notifications after login
      if (isPushSupported()) initPush(nextUser.id);
    } catch { showToast('⚠️ ' + t.auth_conn_error); }
    finally { setAuthLoading(false); }
  };

  const doRegister = async () => {
    const t = I18N[lang] || I18N.en;
    if (!regForm.name || !regForm.identifier || !regForm.password || !regForm.plan || !regForm.refCode) {
      showToast('⚠️ ' + t.auth_all_required); return;
    }
    setAuthLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(regForm),
      });
      const data = await res.json();
      if (!res.ok) {
        if (data.error === 'insufficient_balance') {
          showToast(lang === 'bn'
            ? `⚠️ রেফারারের ব্যালেন্স অপর্যাপ্ত। প্রয়োজন: ${convertCurrency(data.needed, 'bn')}`
            : `⚠️ Referrer has insufficient balance. Needed: ${convertCurrency(data.needed, 'en')}`);
        } else {
          showToast('⚠️ ' + translateServerError(data.error, lang));
        }
        return;
      }
      if (data.pending) {
        setPendingRegId(data.pending_id);
        return;
      }
      const nextUser = mapApiUser(data.user, data.plan, data.token);
      setUser(nextUser);
      saveStoredSession(nextUser);
      setAuth(true);
      showToast('✅ ' + t.auth_welcome);
    } catch { showToast('⚠️ ' + t.auth_conn_error); }
    finally { setAuthLoading(false); }
  };

  const navigate = (s) => {
    setScreen(s);
    setMenuOpen(false);
    window.history.pushState({ screen: s }, '');
  };

  // Handle browser back button / backspace
  useEffect(() => {
    // Set initial history state so the very first back press lands on home
    window.history.replaceState({ screen: 'home' }, '');

    const onPop = (e) => {
      const s = e.state?.screen || 'home';
      setScreen(s);
      setMenuOpen(false);
    };
    window.addEventListener('popstate', onPop);
    return () => window.removeEventListener('popstate', onPop);
  }, []);

  const doLogout = useCallback(() => {
    setAuth(null);
    setUser(null);
    clearStoredSession();
    setShowLanding(true);
    setScreen('home');
  }, []);

  const addNotif = useCallback((notif) => {
    const t = I18N[lang] || I18N.en;
    setNotifications(prev => [{ ...notif, rawText: notif.rawText || notif.text, text: convertCurrencyText(notif.rawText || notif.text, lang), id: Date.now(), time: t.time_just_now, read: false }, ...prev]);
    playNotifSound();
  }, [lang]);

  // ── Pending registration waiting screen ──────────────────────────────────
  if (!auth && pendingRegId) return (
    <>
      <GlobalStyles isDark={isDark} fontSize={fontSize} />
      <PhoneCraftBackground isDark={isDark} />
      <div style={{ position:'relative', zIndex:1, height:'100dvh', display:'flex', alignItems:'center', justifyContent:'center', padding:24 }}>
        <div style={{ textAlign:'center', maxWidth:340 }}>
          <div style={{ fontSize:48, marginBottom:16 }}>⏳</div>
          <div style={{ fontFamily:'Space Grotesk', fontWeight:900, fontSize:22, marginBottom:10, color:'var(--text)' }}>
            {lang === 'bn' ? 'অনুমোদনের অপেক্ষায়' : 'Waiting for Approval'}
          </div>
          <p style={{ fontSize:14, color:'var(--text2)', lineHeight:1.75, marginBottom:24 }}>
            {lang === 'bn'
              ? 'আপনার রেফারার এখন একটি নোটিফিকেশন পেয়েছেন। তিনি অনুমোদন করলে আপনার অ্যাকাউন্ট তৈরি হবে।'
              : 'Your referrer has been notified. Once they approve, your account will be created automatically.'}
          </p>
          <div style={{ display:'flex', alignItems:'center', justifyContent:'center', gap:8, marginBottom:20 }}>
            <div style={{ width:8, height:8, borderRadius:'50%', background:'#23AF91', animation:'pulse 1.5s ease-in-out infinite' }} />
            <div style={{ width:8, height:8, borderRadius:'50%', background:'#23AF91', animation:'pulse 1.5s ease-in-out infinite .3s' }} />
            <div style={{ width:8, height:8, borderRadius:'50%', background:'#23AF91', animation:'pulse 1.5s ease-in-out infinite .6s' }} />
          </div>
          <style>{`@keyframes pulse{0%,100%{opacity:.3;transform:scale(.8)}50%{opacity:1;transform:scale(1.2)}}`}</style>
          <button
            onClick={() => { setPendingRegId(null); setAuthTab('register'); }}
            style={{ padding:'10px 24px', borderRadius:10, border:'1px solid rgba(112,122,138,.3)', background:'transparent', color:'var(--text2)', fontSize:13, cursor:'pointer', fontFamily:'Inter,sans-serif' }}
          >
            {lang === 'bn' ? 'বাতিল করুন' : 'Cancel'}
          </button>
        </div>
      </div>
    </>
  );

  // ── Wait for settings before rendering anything (prevents flash) ────────────
  if (!settingsLoaded) return (
    <>
      <GlobalStyles isDark={isDark} fontSize={fontSize} />
      <PhoneCraftBackground isDark={isDark} />
    </>
  );

  // ── Maintenance mode gate (blocks landing, login, and app for non-main-admin) ──
  if (appSettings.maintenance_mode === 'true' && !user?.is_main_admin) return (
    <>
      <GlobalStyles isDark={isDark} fontSize={fontSize} />
      <PhoneCraftBackground isDark={isDark} />
      <div style={{
        position: 'fixed', inset: 0, zIndex: 9999,
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        padding: 32, textAlign: 'center',
      }}>
        <div style={{ fontSize: 64, marginBottom: 20 }}>🔧</div>
        <div style={{ fontFamily: 'Space Grotesk', fontSize: 24, fontWeight: 800, color: 'var(--accent)', marginBottom: 12 }}>
          Under Maintenance
        </div>
        <div style={{ fontSize: 15, color: 'var(--text2)', maxWidth: 320, lineHeight: 1.6 }}>
          {lang === 'bn'
            ? 'PhoneCraft এখন রক্ষণাবেক্ষণে আছে। অল্প কিছুক্ষণ পর আবার চেষ্টা করুন।'
            : 'PhoneCraft is currently under maintenance. Please check back soon.'}
        </div>
        <div style={{ marginTop: 24, fontSize: 12, color: 'var(--text2)', opacity: .6 }}>
          {lang === 'bn' ? 'আমরা দ্রুত ফিরে আসছি ⏳' : 'We\'ll be back shortly ⏳'}
        </div>
      </div>
    </>
  );

  // ── Landing screen (pre-auth) ─────────────────────────────────────────────
  if (!auth && showLanding) return (
    <>
      <GlobalStyles isDark={isDark} fontSize={fontSize} />
      <PhoneCraftBackground isDark={isDark} />
      <div style={{ position: 'relative', zIndex: 1, height: '100dvh', overflowY: 'auto' }}>
        <LandingScreen
          isDark={isDark}
          lang={lang}
          setLang={setLang}
          onGetStarted={() => { setShowLanding(false); setAuthTab('register'); }}
          onLogin={() => { setShowLanding(false); setAuthTab('login'); }}
        />
      </div>
      <SupportWidget lang={lang} />
      {toast && <ToastBox toast={toast} setToast={setToast} lang={lang} />}
    </>
  );

  // ── Auth screen ───────────────────────────────────────────────────────────
  if (!auth) return (
    <>
      <GlobalStyles isDark={isDark} fontSize={fontSize} />
      <PhoneCraftBackground isDark={isDark} />
      <div style={{ position: 'relative', zIndex: 1, height: '100dvh', display: 'flex', alignItems: 'flex-start', justifyContent: 'center', padding: '20px 16px', overflowY: 'auto' }}>
        <div style={{ position: 'fixed', top: 16, right: 16, zIndex: 10, display: 'flex', gap: 8 }}>
          <div className="icon-btn" onClick={() => setShowLanding(true)} title="Back to Home" style={{ width: 'auto', padding: '0 12px', gap: 6, fontSize: 13, color: 'var(--text2)' }}>
            <span style={{ fontSize: 15, lineHeight: 1 }}>←</span>
          </div>
          <div className="icon-btn" onClick={() => setIsDark(!isDark)}>
            <span className="theme-icon-enter" key={isDark ? 'moon' : 'sun'}>{isDark ? <Icons.Sun /> : <Icons.Moon />}</span>
          </div>
        </div>
        <div style={{ width: '100%', maxWidth: 480 }}>
          <AuthScreen isDark={isDark} tab={authTab} setTab={setAuthTab}
            loginForm={loginForm} setLoginForm={setLoginForm}
            regForm={regForm} setRegForm={setRegForm}
            doLogin={doLogin} doRegister={doRegister} loading={authLoading} lang={lang} />
        </div>
      </div>
      <SupportWidget lang={lang} />
      {toast && <ToastBox toast={toast} setToast={setToast} lang={lang} />}
    </>
  );

  const tErr = (e) => translateServerError(e, lang);
  const screenProps = { user, setUser, showToast, navigate, lang, addNotif, isDark, fontSize, setFontSize, notifications, setNotifications, appSettings, tErr, usdRate, teamChatUnread, setTeamChatUnread };

  const t = I18N[lang] || I18N.en;
  const menuItems = getMenuItems(lang);

  return (
    <>
      <GlobalStyles isDark={isDark} fontSize={fontSize} />
      <PhoneCraftBackground isDark={isDark} />
      <div className="app-outer">
        <div className="app-shell">

          {/* ── DESKTOP SIDEBAR ── */}
          {isDesktop && (
            <aside className="sidebar">
              <div className="sidebar-logo"><img src="/logo.png" alt="" style={{ width: 34, height: 34, objectFit: 'contain' }} /> PHONECRAFT</div>
              <div className="sidebar-user">
                <div className="sidebar-avatar" style={{ overflow: 'hidden', padding: 0 }}>
                  {(user.avatarImg || (user.avatar && user.avatar.startsWith('/')))
                    ? <img src={user.avatarImg || user.avatar} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '50%' }} />
                    : (user.avatar || user.name?.[0] || '?')}
                </div>
                <div style={{ fontWeight: 700, fontSize: 15 }}>{user.name}</div>
                <div style={{ fontSize: 11, color: 'var(--text2)', marginTop: 2 }}>{user.identifier}</div>
                <div style={{ marginTop: 8, display: 'flex', alignItems: 'center', gap: 6, color: 'var(--accent)', fontFamily: 'Space Grotesk', fontSize: 12 }}>
                  <Icons.Coin size={14} />{convertCurrency(user.balance, lang, usdRate)}
                </div>
                <div style={{ fontSize: 10, color: 'var(--text2)', marginTop: 4, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 3 }}>
                  <span>💱</span>
                  <span>{t.sidebar_live_rate}: <b style={{ color: 'var(--accent)' }}>৳{usdRate.toFixed(2)}</b></span>
                  <span style={{ fontSize: 8, opacity: 0.55 }}>({t.just_now})</span>
                </div>
              </div>
              <nav className="sidebar-nav">
                {menuItems.map(m => (
                  <div key={m.screen} className={`sidebar-item ${screen === m.screen ? 'active' : ''}`} onClick={() => navigate(m.screen)}>
                    <m.Icon size={18} color={m.color} />
                    <span>{m.label}</span>
                    {m.screen === 'notifications' && unreadCount > 0 && (
                      <span style={{ marginLeft: 'auto', background: 'var(--accent)', color: '#fff', borderRadius: 10, fontSize: 10, padding: '1px 6px', fontFamily: 'Space Grotesk' }}>{unreadCount}</span>
                    )}
                    {m.screen === 'teamchat' && teamChatUnread > 0 && (
                      <span style={{ marginLeft: 'auto', background: '#2DD4BF', color: '#000', borderRadius: 10, fontSize: 10, padding: '1px 6px', fontFamily: 'Space Grotesk', fontWeight: 700 }}>{teamChatUnread > 99 ? '99+' : teamChatUnread}</span>
                    )}
                  </div>
                ))}
              </nav>
              <div className="sidebar-bottom">
                <div style={{ display: 'flex', gap: 8, marginBottom: 10, justifyContent: 'center' }}>
                  <button className="btn btn-outline" style={{ fontSize: 11, padding: '6px 14px', opacity: lang === 'en' ? 1 : .5 }} onClick={() => setLang('en')}>EN</button>
                  <button className="btn btn-outline" style={{ fontSize: 11, padding: '6px 14px', opacity: lang === 'bn' ? 1 : .5 }} onClick={() => setLang('bn')}>বাং</button>
                </div>
                <button className="btn btn-danger btn-full" style={{ fontSize: 13 }} onClick={doLogout}>
                  <Icons.Logout size={16} /> {t.logout}
                </button>
              </div>
            </aside>
          )}

          {/* ── MAIN AREA ── */}
          <div className="desktop-content">

            {/* TOP BAR */}
            <header className="top-bar">
              {!isDesktop && <div className="top-logo"><img src="/logo.png" alt="" style={{ width: 28, height: 28, objectFit: 'contain' }} /> PHONECRAFT</div>}
              {isDesktop && (
                <div style={{ fontFamily: 'Space Grotesk', fontSize: 13, fontWeight: 700, color: 'var(--text2)', letterSpacing: 1, display: 'flex', alignItems: 'center', gap: 8, textTransform: 'uppercase' }}>
                  {menuItems.find(m => m.screen === screen)?.label || 'Dashboard'}
                </div>
              )}
              <div className="top-right">
                <div className="top-balance"><Icons.Coin size={14} />{convertCurrency(user.balance, lang, usdRate)}</div>
                <div className="icon-btn" onClick={() => setIsDark(!isDark)} title="Toggle theme">
                  <span className="theme-icon-enter" key={isDark ? 'dark' : 'light'}>{isDark ? <Icons.Sun /> : <Icons.Moon />}</span>
                </div>
                <div className="icon-btn notif-btn" style={{ position: 'relative', overflow: 'visible' }} onClick={() => navigate('notifications')}>
                  <Icons.Bell />
                  {unreadCount > 0 && (
                    <span style={{ position: 'absolute', top: -6, right: -6, background: '#F6465D', color: '#fff', borderRadius: 12, fontSize: 10, fontWeight: 700, padding: '2px 5px', fontFamily: 'Space Grotesk', lineHeight: 1.3, minWidth: 18, height: 18, textAlign: 'center', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 10, boxShadow: '0 1px 4px rgba(0,0,0,0.4)' }}>{unreadCount > 99 ? '99+' : unreadCount}</span>
                  )}
                </div>
                {!isDesktop && (
                  <div className="avatar-btn" onClick={() => setMenuOpen(true)} style={{ overflow: 'hidden', padding: 0 }}>
                    {(user.avatarImg || (user.avatar && user.avatar.startsWith('/'))) ? <img src={user.avatarImg || user.avatar} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : (user.avatar || user.name?.[0] || '?')}
                  </div>
                )}
                {isDesktop && (
                  <div className="avatar-btn" style={{ cursor: 'default', overflow: 'hidden', padding: 0 }}>
                    {(user.avatarImg || (user.avatar && user.avatar.startsWith('/'))) ? <img src={user.avatarImg || user.avatar} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : (user.avatar || user.name?.[0] || '?')}
                  </div>
                )}
              </div>
            </header>

            {/* ── ANNOUNCEMENT BANNER ── */}
            {appSettings.announcement_banner && (
              <div style={{
                background: 'linear-gradient(90deg, #f59e0b, #ef4444)',
                color: '#fff', padding: '10px 16px',
                fontSize: 13, fontWeight: 600, textAlign: 'center',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                letterSpacing: .2, lineHeight: 1.4,
              }}>
                <span>📢</span>
                {appSettings.announcement_banner}
              </div>
            )}

            {/* ── MAINTENANCE MODE SCREEN ── */}
            {appSettings.maintenance_mode === 'true' && !user?.is_main_admin && (
              <div style={{
                position: 'fixed', inset: 0, zIndex: 9999,
                background: 'var(--bg)', display: 'flex', flexDirection: 'column',
                alignItems: 'center', justifyContent: 'center',
                padding: 32, textAlign: 'center',
              }}>
                <div style={{ fontSize: 64, marginBottom: 20 }}>🔧</div>
                <div style={{ fontFamily: 'Space Grotesk', fontSize: 24, fontWeight: 800, color: 'var(--accent)', marginBottom: 12 }}>
                  Under Maintenance
                </div>
                <div style={{ fontSize: 15, color: 'var(--text2)', maxWidth: 320, lineHeight: 1.6 }}>
                  {lang === 'bn'
                    ? 'PhoneCraft এখন রক্ষণাবেক্ষণে আছে। অল্প কিছুক্ষণ পর আবার চেষ্টা করুন।'
                    : 'PhoneCraft is currently under maintenance. Please check back soon.'}
                </div>
                <div style={{ marginTop: 24, fontSize: 12, color: 'var(--text2)', opacity: .6 }}>
                  {lang === 'bn' ? 'আমরা দ্রুত ফিরে আসছি ⏳' : 'We\'ll be back shortly ⏳'}
                </div>
              </div>
            )}

            {/* SCREEN */}
            <main className="screen screen-enter" key={screen}>
              {screen === 'home'          && <HomeScreen         {...screenProps} />}
              {screen === 'work'          && <WorkScreen         {...screenProps} />}
              {screen === 'notifications' && <NotifScreen items={notifications} setItems={setNotifications} user={user} setUser={setUser} lang={lang} showToast={showToast} />}
              {screen === 'wallet'        && <WalletScreen       {...screenProps} />}
              {screen === 'balance'       && <BalanceScreen      {...screenProps} />}
              {screen === 'refer'         && <ReferScreen        {...screenProps} />}
              {screen === 'profile'       && <ProfileScreen      user={user} setUser={setUser} navigate={navigate} doLogout={doLogout} lang={lang} showToast={showToast} />}
              {screen === 'teamchat'      && <TeamChatScreen     user={user} lang={lang} showToast={showToast} teamChatUnread={teamChatUnread} setTeamChatUnread={setTeamChatUnread} />}
              {screen === 'marketplace'   && <MarketplaceScreen  user={user} lang={lang} />}
              {screen === 'support'       && <SupportScreen      user={user} showToast={showToast} lang={lang} />}
              {screen === 'guide'         && <GuideScreen        navigate={navigate} lang={lang} />}
              {screen === 'settings'      && <SettingsScreen     user={user} setUser={setUser} showToast={showToast} lang={lang} setLang={setLang} doLogout={doLogout} fontSize={fontSize} setFontSize={setFontSize} />}
            </main>

            {/* BOTTOM NAV */}
            {!isDesktop && (
              <nav className="bottom-nav">
                {[
                  { Icon: Icons.Home,     label: t.nav_home,   s: 'home',        color: '#4ADE80' },
                  { Icon: Icons.Work,     label: t.nav_work,   s: 'work',        color: '#A78BFA' },
                  { Icon: Icons.Market,   label: t.nav_market, s: 'marketplace', color: '#FB923C' },
                  { Icon: Icons.Wallet,   label: t.nav_wallet, s: 'wallet',      color: '#60A5FA' },
                ].map(n => (
                  <div key={n.s} className={`nav-item ${screen === n.s ? 'active' : ''}`} onClick={() => navigate(n.s)}>
                    <span className="ni"><n.Icon size={isMobile ? 20 : 22} color={n.color} /></span>
                    <span>{n.label}</span>
                  </div>
                ))}
              </nav>
            )}
          </div>

          {/* SLIDE MENU (mobile/tablet) */}
          {menuOpen && !isDesktop && (
            <div className="slide-menu-overlay" onClick={() => setMenuOpen(false)}>
              <div className="slide-menu" onClick={e => e.stopPropagation()}>
                <div style={{ display: 'flex', justifyContent: 'flex-end', padding: '4px 16px 0' }}>
                  <div className="icon-btn" onClick={() => setMenuOpen(false)}><Icons.X size={18} /></div>
                </div>
                <div className="menu-user">
                  <div className="menu-avatar" style={{ overflow: 'hidden', padding: 0 }}>
                    {(user.avatarImg || (user.avatar && user.avatar.startsWith('/'))) ? <img src={user.avatarImg || user.avatar} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '50%' }} /> : (user.avatar || user.name?.[0] || '?')}
                  </div>
                  <div className="menu-name">{user.name}</div>
                  <div className="menu-code">ID: {user.referCode}</div>
                  <div className="menu-balance"><Icons.Coin size={13} />{convertCurrency(user.balance, lang)}</div>
                </div>
                {menuItems.map(m => (
                  <div key={m.screen} className={`menu-item ${screen === m.screen ? 'active' : ''}`} onClick={() => navigate(m.screen)}>
                    <span className="menu-icon"><m.Icon size={18} color={m.color} /></span>
                    <span>{m.label}</span>
                    {m.screen === 'notifications' && unreadCount > 0 && (
                      <span style={{ marginLeft: 'auto', background: '#F6465D', color: '#fff', borderRadius: 10, fontSize: 10, padding: '1px 6px' }}>{unreadCount}</span>
                    )}
                    {m.screen === 'teamchat' && teamChatUnread > 0 && (
                      <span style={{ marginLeft: 'auto', background: '#2DD4BF', color: '#000', borderRadius: 10, fontSize: 10, padding: '1px 6px', fontWeight: 700 }}>{teamChatUnread > 99 ? '99+' : teamChatUnread}</span>
                    )}
                  </div>
                ))}
                <div style={{ padding: '8px 16px', display: 'flex', gap: 8, borderTop: '1px solid var(--border)', marginTop: 4 }}>
                  <button className="btn btn-outline" style={{ flex: 1, fontSize: 11, opacity: lang === 'en' ? 1 : .5 }} onClick={() => setLang('en')}>EN</button>
                  <button className="btn btn-outline" style={{ flex: 1, fontSize: 11, opacity: lang === 'bn' ? 1 : .5 }} onClick={() => setLang('bn')}>বাং</button>
                </div>
                <div style={{ padding: '8px 16px 16px' }}>
                  <button className="btn btn-danger btn-full" style={{ fontSize: 13 }} onClick={doLogout}>
                    <Icons.Logout size={16} /> {t.logout}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {toast && <ToastBox toast={toast} setToast={setToast} lang={lang} />}
    </>
  );
}
