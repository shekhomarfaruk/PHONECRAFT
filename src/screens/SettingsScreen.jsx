import { useState, useEffect } from "react";
import Icons from "../Icons.jsx";
import { AVATARS } from "../data.jsx";
import { I18N } from "../i18n.js";

const API_URL = import.meta.env.VITE_API_URL || '';

export default function SettingsScreen({ user, setUser, showToast, lang, setLang, doLogout, fontSize, setFontSize }) {
  const t = I18N[lang] || I18N.en;
  const [curPass,  setCurPass]  = useState('');
  const [newPass,  setNewPass]  = useState('');
  const [conPass,  setConPass]  = useState('');
  const [notifs, setNotifs] = useState(() => {
    try {
      const saved = localStorage.getItem('notif-prefs');
      return saved ? JSON.parse(saved) : { earn: true, referral: true, withdraw: true };
    } catch { return { earn: true, referral: true, withdraw: true }; }
  });

  useEffect(() => {
    localStorage.setItem('notif-prefs', JSON.stringify(notifs));
  }, [notifs]);

  const updatePass = async () => {
    if (!curPass || !newPass || !conPass) { showToast(t.pass_empty); return; }
    if (newPass !== conPass) { showToast(t.pass_no_match); return; }
    if (newPass.length < 6) { showToast(lang === 'bn' ? '⚠️ পাসওয়ার্ড কমপক্ষে ৬ অক্ষর হতে হবে' : '⚠️ Password must be at least 6 characters'); return; }
    try {
      const res = await fetch(`${API_URL}/api/user/${user.id}/change-password`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currentPassword: curPass, newPassword: newPass }),
      });
      const data = await res.json();
      if (!res.ok) { showToast('❌ ' + (data.error || (lang === 'bn' ? 'পাসওয়ার্ড পরিবর্তন ব্যর্থ' : 'Failed to change password')), 'error'); return; }
      showToast('✅ ' + (lang === 'bn' ? 'পাসওয়ার্ড সফলভাবে পরিবর্তিত হয়েছে!' : 'Password changed successfully!'), 'success');
      setCurPass(''); setNewPass(''); setConPass('');
    } catch {
      showToast('❌ ' + (lang === 'bn' ? 'সংযোগ ত্রুটি' : 'Connection error'), 'error');
    }
  };

  const saveAvatar = async (av) => {
    setUser(p => ({ ...p, avatar: av }));
    try {
      await fetch(`${API_URL}/api/user/${user.id}/avatar`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ avatar: av }),
      });
    } catch (_) {}
    showToast('✅ ' + (lang === 'bn' ? 'অবতার সংরক্ষিত' : 'Avatar saved!'), 'success');
  };

  return (
    <>
      <div className="screen-title"><Icons.Settings size={18} /> {t.settings}</div>

      {/* ─── Language ─── */}
      <div className="card">
        <div className="card-title">🌐 {t.language_lbl}</div>
        <div style={{ fontSize: 13, color: 'var(--text2)', marginBottom: 12 }}>{t.language_hint}</div>
        <div style={{ display: 'flex', gap: 10 }}>
          <div onClick={() => setLang('en')} style={{
            flex: 1, padding: '14px 10px', borderRadius: 12, cursor: 'pointer', textAlign: 'center',
            border: `2px solid ${lang === 'en' ? 'var(--accent)' : 'var(--border)'}`,
            background: lang === 'en' ? 'var(--input-bg)' : 'transparent',
            boxShadow: lang === 'en' ? 'var(--glow)' : 'none', transition: 'all .2s',
          }}>
            <div style={{ fontSize: 28, marginBottom: 6 }}>🇬🇧</div>
            <div style={{ fontFamily: 'Space Grotesk', fontSize: 11, color: lang === 'en' ? 'var(--accent)' : 'var(--text2)', letterSpacing: 1 }}>ENGLISH</div>
          </div>
          <div onClick={() => setLang('bn')} style={{
            flex: 1, padding: '14px 10px', borderRadius: 12, cursor: 'pointer', textAlign: 'center',
            border: `2px solid ${lang === 'bn' ? 'var(--accent)' : 'var(--border)'}`,
            background: lang === 'bn' ? 'var(--input-bg)' : 'transparent',
            boxShadow: lang === 'bn' ? 'var(--glow)' : 'none', transition: 'all .2s',
          }}>
            <div style={{ fontSize: 28, marginBottom: 6 }}>🇧🇩</div>
            <div style={{ fontFamily: 'Space Grotesk', fontSize: 11, color: lang === 'bn' ? 'var(--accent)' : 'var(--text2)', letterSpacing: 1 }}>বাংলা</div>
          </div>
        </div>
      </div>

      {/* ─── Font Size ─── */}
      <div className="card">
        <div className="card-title">🔡 {lang === 'bn' ? 'ফন্ট সাইজ' : 'Font Size'}</div>
        <div style={{ fontSize: 13, color: 'var(--text2)', marginBottom: 4 }}>
          {lang === 'bn' ? 'টেক্সটের আকার বেছে নিন — পুরো অ্যাপে প্রযোজ্য হবে।' : 'Choose text size — applies across the entire app.'}
        </div>
        <div style={{ padding: '10px 14px', background: 'var(--input-bg)', borderRadius: 10, border: '1px solid var(--border)', marginBottom: 14, fontStyle: 'italic', color: 'var(--text2)', lineHeight: 1.5 }}>
          {lang === 'bn' ? 'এটি একটি নমুনা টেক্সট — ফন্ট সাইজ পরিবর্তন করলে এরকম দেখাবে।' : 'This is a sample text — this is how your app will look at the selected size.'}
        </div>
        {[
          { key: 'small',  bn: 'ছোট',    en: 'Small',    preview: 'ক', px: '13px' },
          { key: 'medium', bn: 'মাঝারি', en: 'Medium',   preview: 'আ', px: '15px' },
          { key: 'large',  bn: 'বড়',     en: 'Large',    preview: 'আ', px: '17px' },
          { key: 'xlarge', bn: 'খুব বড়', en: 'X-Large',  preview: 'আ', px: '19px' },
        ].map(opt => {
          const active = (fontSize || 'medium') === opt.key;
          return (
            <div key={opt.key} onClick={() => { setFontSize(opt.key); showToast(`${opt.bn} · ${opt.en}`, 'success'); }}
              style={{
                display: 'flex', alignItems: 'center', gap: 14,
                padding: '12px 14px', borderRadius: 12, cursor: 'pointer', marginBottom: 8,
                border: `2px solid ${active ? 'var(--accent)' : 'var(--border)'}`,
                background: active ? 'var(--input-bg)' : 'transparent',
                boxShadow: active ? 'var(--glow)' : 'none',
                transition: 'all .15s',
              }}>
              <div style={{
                width: 44, height: 44, borderRadius: 10, flexShrink: 0,
                background: active ? 'rgba(35,175,145,0.12)' : 'var(--input-bg)',
                border: `1px solid ${active ? 'var(--accent)' : 'var(--border)'}`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: opt.px, fontFamily: 'Space Grotesk', fontWeight: 700,
                color: active ? 'var(--accent)' : 'var(--text2)',
                transition: 'all .15s',
              }}>
                {opt.preview}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 700, fontSize: '0.9em', color: active ? 'var(--accent)' : 'var(--text)' }}>
                  {opt.bn}
                </div>
                <div style={{ fontSize: '0.78em', color: 'var(--text2)', marginTop: 2 }}>{opt.en} · {opt.px}</div>
              </div>
              {active && (
                <div style={{ width: 20, height: 20, borderRadius: '50%', background: 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <span style={{ color: '#fff', fontSize: 12, lineHeight: 1 }}>✓</span>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* ─── Avatar ─── */}
      <div className="card">
        <div className="card-title">😀 {t.choose_avatar}</div>
        <div style={{ fontSize: 13, color: 'var(--text2)', marginBottom: 12 }}>{t.select_av_hint}</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: 8 }}>
          {AVATARS.map((av, i) => (
            <div key={i} onClick={() => saveAvatar(av)}
              style={{
                fontSize: 28, textAlign: 'center', padding: 8, borderRadius: 12, cursor: 'pointer',
                border: `2px solid ${user.avatar === av ? 'var(--accent)' : 'var(--border)'}`,
                background: user.avatar === av ? 'var(--input-bg)' : 'transparent',
                transform: user.avatar === av ? 'scale(1.1)' : 'scale(1)',
                boxShadow: user.avatar === av ? 'var(--glow)' : 'none',
                transition: 'all .15s',
              }}>
              {av}
            </div>
          ))}
        </div>
        {user.avatar && (
          <div style={{ marginTop: 12, display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px', background: 'var(--input-bg)', borderRadius: 10, border: '1px solid var(--border)' }}>
            <span style={{ fontSize: 32 }}>{user.avatar}</span>
            <div>
              <div style={{ fontWeight: 700, fontSize: 14 }}>{user.name}</div>
              <div style={{ fontSize: 11, color: 'var(--text2)' }}>{user.identifier}</div>
            </div>
          </div>
        )}
      </div>

      {/* ─── Change Password ─── */}
      <div className="card">
        <div className="card-title"><Icons.Lock size={14} /> {t.change_password}</div>
        <div className="input-wrap">
          <label className="input-label">{t.current_pass}</label>
          <input className="inp" type="password" placeholder="••••••••" value={curPass} onChange={e => setCurPass(e.target.value)} />
        </div>
        <div className="input-wrap">
          <label className="input-label">{t.new_pass}</label>
          <input className="inp" type="password" placeholder="••••••••" value={newPass} onChange={e => setNewPass(e.target.value)} />
        </div>
        <div className="input-wrap">
          <label className="input-label">{t.confirm_pass}</label>
          <input className="inp" type="password" placeholder="••••••••" value={conPass} onChange={e => setConPass(e.target.value)} />
        </div>
        <button className="btn btn-primary btn-full" onClick={updatePass}>
          <Icons.Lock size={16} /> {t.update_pass_btn}
        </button>
      </div>

      {/* ─── Notifications ─── */}
      <div className="card">
        <div className="card-title"><Icons.Bell size={14} /> {t.notif_settings}</div>
        {[
          ['earn',     t.notif_earn],
          ['referral', t.notif_referral],
          ['withdraw', t.notif_withdraw],
        ].map(([key, label]) => (
          <div key={key} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 0', borderBottom: '1px solid var(--border)' }}>
            <span style={{ fontSize: 14, fontWeight: 600 }}>{label}</span>
            <div onClick={() => setNotifs(p => ({ ...p, [key]: !p[key] }))}
              style={{ width: 44, height: 24, borderRadius: 12, background: notifs[key] ? 'var(--accent)' : 'var(--border)', cursor: 'pointer', position: 'relative', transition: 'background .2s' }}>
              <div style={{ position: 'absolute', top: 3, left: notifs[key] ? 23 : 3, width: 18, height: 18, borderRadius: '50%', background: '#fff', transition: 'left .2s', boxShadow: '0 1px 4px rgba(0,0,0,0.3)' }} />
            </div>
          </div>
        ))}
      </div>

      {/* ─── Account / Danger ─── */}
      <div className="card">
        <div className="card-title">⚠️ {t.danger_zone}</div>
        <button className="btn btn-danger btn-full" onClick={doLogout}>
          <Icons.Logout size={16} /> {t.logout}
        </button>
      </div>
      <div style={{ height: 8 }} />
    </>
  );
}
