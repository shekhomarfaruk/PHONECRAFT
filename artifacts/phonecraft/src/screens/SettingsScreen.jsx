import { useState, useEffect } from "react";
import Icons from "../Icons.jsx";
import { MALE_AVATARS, FEMALE_AVATARS } from "../data.jsx";
import { I18N } from "../i18n.js";
import { authFetch } from "../session.js";

const API_URL = import.meta.env.VITE_API_URL || '';

export default function SettingsScreen({ user, setUser, showToast, lang, setLang, doLogout, fontSize, setFontSize }) {
  const t = I18N[lang] || I18N.en;
  const authHeaders = {
    'Content-Type': 'application/json',
    ...(user?.authToken ? { Authorization: `Bearer ${user.authToken}` } : {}),
  };
  const [curPass,  setCurPass]  = useState('');
  const [newPass,  setNewPass]  = useState('');
  const [conPass,  setConPass]  = useState('');
  const [soundOn, setSoundOn] = useState(() => localStorage.getItem('app-sound') !== 'off');
  const toggleSound = () => {
    const next = !soundOn;
    setSoundOn(next);
    localStorage.setItem('app-sound', next ? 'on' : 'off');
  };

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
    if (newPass.length < 6) { showToast(t.settings_pass_short, 'error'); return; }
    try {
      const res = await authFetch(`${API_URL}/api/user/${user.id}/change-password`, {
        method: 'PATCH',
        headers: authHeaders,
        body: JSON.stringify({ currentPassword: curPass, newPassword: newPass }),
      });
      const data = await res.json();
      if (!res.ok) {
        let msg = data.error || '';
        if (msg === 'Current password is incorrect') {
          msg = t.settings_wrong_pass;
        } else if (msg === 'Invalid or expired session') {
          msg = t.settings_session_exp;
        } else if (msg === 'Both passwords are required') {
          msg = t.settings_both_pass;
        } else if (msg === 'New password must be at least 6 characters') {
          msg = t.settings_new_pass_short;
        } else if (!msg) {
          msg = t.settings_fail_change;
        }
        showToast(msg, 'error');
        return;
      }
      showToast(t.settings_pass_changed, 'success');
      setCurPass(''); setNewPass(''); setConPass('');
    } catch {
      showToast(t.settings_conn_error, 'error');
    }
  };

  const saveAvatar = async (av) => {
    setUser(p => ({ ...p, avatar: av }));
    try {
      await authFetch(`${API_URL}/api/user/${user.id}/avatar`, {
        method: 'PATCH',
        headers: authHeaders,
        body: JSON.stringify({ avatar: av }),
      });
    } catch (_) {}
    showToast(t.settings_avatar_saved, 'success');
  };

  return (
    <>
      <div className="screen-title"><Icons.Settings size={18} /> {t.settings}</div>

      {/* ─── Language ─── */}
      <div className="card">
        <div className="card-title"><Icons.Language size={14} /> {t.language_lbl}</div>
        <div style={{ fontSize: 13, color: 'var(--text2)', marginBottom: 12 }}>{t.language_hint}</div>
        <div style={{ display: 'flex', gap: 10 }}>
          <div onClick={() => setLang('en')} style={{
            flex: 1, padding: '14px 10px', borderRadius: 12, cursor: 'pointer', textAlign: 'center',
            border: `2px solid ${lang === 'en' ? 'var(--accent)' : 'var(--border)'}`,
            background: lang === 'en' ? 'var(--input-bg)' : 'transparent',
            boxShadow: lang === 'en' ? 'var(--glow)' : 'none', transition: 'all .2s',
          }}>
            <div style={{ fontSize: 16, marginBottom: 6, fontWeight: 800, color: 'var(--accent)', fontFamily: 'Space Grotesk', letterSpacing: 1 }}>EN</div>
            <div style={{ fontFamily: 'Space Grotesk', fontSize: 11, color: lang === 'en' ? 'var(--accent)' : 'var(--text2)', letterSpacing: 1 }}>ENGLISH</div>
          </div>
          <div onClick={() => setLang('bn')} style={{
            flex: 1, padding: '14px 10px', borderRadius: 12, cursor: 'pointer', textAlign: 'center',
            border: `2px solid ${lang === 'bn' ? 'var(--accent)' : 'var(--border)'}`,
            background: lang === 'bn' ? 'var(--input-bg)' : 'transparent',
            boxShadow: lang === 'bn' ? 'var(--glow)' : 'none', transition: 'all .2s',
          }}>
            <div style={{ fontSize: 16, marginBottom: 6, fontWeight: 800, color: 'var(--accent)', fontFamily: 'Space Grotesk', letterSpacing: 1 }}>বাং</div>
            <div style={{ fontFamily: 'Space Grotesk', fontSize: 11, color: lang === 'bn' ? 'var(--accent)' : 'var(--text2)', letterSpacing: 1 }}>বাংলা</div>
          </div>
        </div>
      </div>

      {/* ─── Notification Sound ─── */}
      <div className="card">
        <div className="card-title"><Icons.Bell size={14} /> {t.settings_sound}</div>
        <div style={{ fontSize: 13, color: 'var(--text2)', marginBottom: 14 }}>{t.settings_sound_hint}</div>
        <div onClick={toggleSound} style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '14px 16px', borderRadius: 14, cursor: 'pointer',
          border: `2px solid ${soundOn ? 'var(--accent)' : 'var(--border)'}`,
          background: soundOn ? 'var(--input-bg)' : 'transparent',
          boxShadow: soundOn ? 'var(--glow)' : 'none',
          transition: 'all .2s',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <span style={{ display:'flex', alignItems:'center' }}>{soundOn ? <Icons.Bell size={22} /> : <Icons.BellOff size={22} />}</span>
            <div style={{ fontWeight: 700, fontSize: '0.9em', color: soundOn ? 'var(--accent)' : 'var(--text)' }}>
              {soundOn ? t.settings_sound_on : t.settings_sound_off}
            </div>
          </div>
          <div style={{
            width: 46, height: 26, borderRadius: 13,
            background: soundOn ? 'var(--accent)' : 'var(--border)',
            position: 'relative', transition: 'background .2s', flexShrink: 0,
          }}>
            <div style={{
              position: 'absolute', top: 3,
              left: soundOn ? 22 : 3,
              width: 20, height: 20, borderRadius: '50%', background: '#fff',
              transition: 'left .2s', boxShadow: '0 1px 4px rgba(0,0,0,.25)',
            }} />
          </div>
        </div>
      </div>

      {/* ─── Font Size ─── */}
      <div className="card">
        <div className="card-title"><Icons.FontSize size={14} /> {t.settings_font_size}</div>
        <div style={{ fontSize: 13, color: 'var(--text2)', marginBottom: 4 }}>
          {t.settings_font_hint}
        </div>
        <div style={{ padding: '10px 14px', background: 'var(--input-bg)', borderRadius: 10, border: '1px solid var(--border)', marginBottom: 14, fontStyle: 'italic', color: 'var(--text2)', lineHeight: 1.5 }}>
          {t.settings_font_sample}
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
        <div className="card-title"><Icons.Smile size={14} /> {t.choose_avatar}</div>
        <div style={{ fontSize: 13, color: 'var(--text2)', marginBottom: 12 }}>{t.select_av_hint}</div>

        <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--accent)', letterSpacing: 1, textTransform: 'uppercase', marginBottom: 8 }}>
          {t.settings_male}
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 8, marginBottom: 16 }}>
          {MALE_AVATARS.map((av) => (
            <div key={av} onClick={() => saveAvatar(av)}
              style={{
                textAlign: 'center', padding: 4, borderRadius: 14, cursor: 'pointer',
                border: `2.5px solid ${user.avatar === av ? 'var(--accent)' : 'var(--border)'}`,
                background: user.avatar === av ? 'var(--input-bg)' : 'transparent',
                transform: user.avatar === av ? 'scale(1.08)' : 'scale(1)',
                boxShadow: user.avatar === av ? 'var(--glow)' : 'none',
                transition: 'all .2s',
              }}>
              <img src={av} alt="" style={{ width: '100%', aspectRatio: '1', borderRadius: 10, objectFit: 'cover' }} />
            </div>
          ))}
        </div>

        <div style={{ fontSize: 11, fontWeight: 700, color: '#EC4899', letterSpacing: 1, textTransform: 'uppercase', marginBottom: 8 }}>
          {t.settings_female}
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 8 }}>
          {FEMALE_AVATARS.map((av) => (
            <div key={av} onClick={() => saveAvatar(av)}
              style={{
                textAlign: 'center', padding: 4, borderRadius: 14, cursor: 'pointer',
                border: `2.5px solid ${user.avatar === av ? '#EC4899' : 'var(--border)'}`,
                background: user.avatar === av ? 'var(--input-bg)' : 'transparent',
                transform: user.avatar === av ? 'scale(1.08)' : 'scale(1)',
                boxShadow: user.avatar === av ? '0 0 12px rgba(236,72,153,0.3)' : 'none',
                transition: 'all .2s',
              }}>
              <img src={av} alt="" style={{ width: '100%', aspectRatio: '1', borderRadius: 10, objectFit: 'cover' }} />
            </div>
          ))}
        </div>

        {user.avatar && (
          <div style={{ marginTop: 14, display: 'flex', alignItems: 'center', gap: 12, padding: '10px 12px', background: 'var(--input-bg)', borderRadius: 12, border: '1px solid var(--border)' }}>
            <div style={{ width: 44, height: 44, borderRadius: '50%', flexShrink: 0, overflow: 'hidden', border: '2px solid var(--accent)' }}>
              {user.avatar.startsWith('/') ? (
                <img src={user.avatar} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              ) : (
                <div style={{ width: '100%', height: '100%', background: 'linear-gradient(135deg, #23AF91, #6366F1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 800, fontSize: 18, fontFamily: 'Space Grotesk' }}>{user.avatar}</div>
              )}
            </div>
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
        <div className="card-title"><Icons.AlertTriangle size={14} /> {t.danger_zone}</div>
        <button className="btn btn-danger btn-full" onClick={doLogout}>
          <Icons.Logout size={16} /> {t.logout}
        </button>
      </div>
      <div style={{ height: 8 }} />
    </>
  );
}
