import { useRef } from "react";
import Icons from "../Icons.jsx";
import { PLANS } from "../data.jsx";
import { I18N } from "../i18n.js";
import { convertCurrency } from "../currency.js";
import { authFetch } from "../session.js";

const API_URL = import.meta.env.VITE_API_URL || '';

function ProfileScreen({ user, setUser, navigate, doLogout, lang, showToast }) {
  const t = I18N[lang] || I18N.en;
  const plan = PLANS.find(p => p.id === user.plan);
  const fileRef = useRef();

  const handleImageChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) { showToast('শুধু ছবি ফাইল সিলেক্ট করুন · Only image files are allowed', 'warning'); return; }
    if (file.size > 2_000_000) { showToast('ছবির সাইজ সর্বোচ্চ ২MB হতে হবে · Image must be under 2MB', 'warning'); return; }

    const reader = new FileReader();
    reader.onload = async (ev) => {
      const img = ev.target.result; // base64 data URL
      try {
        const res = await authFetch(`${API_URL}/api/user/${user.id}/avatar-img`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ img }),
        });
        const data = await res.json();
        if (!res.ok) { showToast(data.error || 'ছবি আপলোড ব্যর্থ হয়েছে · Upload failed', 'error'); return; }
        setUser(p => ({ ...p, avatarImg: img }));
        showToast('ছবি সফলভাবে আপডেট হয়েছে · Photo updated successfully', 'success');
      } catch { showToast('নেটওয়ার্ক সমস্যা হয়েছে, আবার চেষ্টা করুন · Network error, please try again', 'error'); }
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  return (
    <>
      <div className="screen-title"><Icons.User size={18} /> {t.profile_title}</div>
      <div className="card" style={{ textAlign: 'center' }}>

        {/* Avatar — click to change */}
        <div
          onClick={() => fileRef.current?.click()}
          style={{
            width: 'clamp(64px,15vw,88px)', height: 'clamp(64px,15vw,88px)',
            borderRadius: '50%',
            background: (user.avatarImg || (user.avatar && user.avatar.startsWith('/'))) ? 'transparent' : 'linear-gradient(135deg,var(--accent),var(--accent2))',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 'clamp(24px,6vw,34px)', fontWeight: 700,
            margin: '0 auto 6px',
            boxShadow: 'var(--glow)',
            cursor: 'pointer',
            overflow: 'hidden',
            position: 'relative',
          }}
          title={lang === 'bn' ? 'ছবি পরিবর্তন করুন' : 'Change photo'}
        >
          {(user.avatarImg || (user.avatar && user.avatar.startsWith('/')))
            ? <img src={user.avatarImg || user.avatar} alt="avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            : (user.avatar || user.name?.[0] || '?')}
          {/* Camera overlay */}
          <div style={{
            position: 'absolute', bottom: 0, left: 0, right: 0,
            height: '36%', background: 'rgba(0,0,0,.5)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="white" stroke="none">
              <path d="M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2z"/><circle cx="12" cy="13" r="4" fill="none" stroke="white" strokeWidth="2"/>
            </svg>
          </div>
        </div>
        <input ref={fileRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handleImageChange} />

        <div style={{ fontSize: 10, color: 'var(--text2)', marginBottom: 10 }}>
          {lang === 'bn' ? 'ট্যাপ করে ছবি পরিবর্তন করুন' : 'Tap to change photo'}
        </div>

        <div style={{ fontFamily: 'Space Grotesk', fontSize: 'clamp(16px,4vw,20px)', fontWeight: 700 }}>{user.name}</div>
        <div style={{ fontSize: 12, color: 'var(--text2)', marginTop: 4 }}>{user.identifier}</div>
        <div style={{ marginTop: 10, display: 'flex', gap: 8, justifyContent: 'center', flexWrap: 'wrap' }}>
          <span className="badge badge-blue">{plan?.name} {t.plan_label}</span>
          <span className="badge badge-green">{t.active}</span>
        </div>
      </div>

      <div className="card">
        <div className="card-title">{t.account_details}</div>
        {[
          [t.user_code,      user.referCode],
          [t.plan_field,     plan?.name],
          [t.balance_field,  convertCurrency(user.balance, lang)],
          [t.daily_limit,    `${user.dailyLimit} ${t.devices_per_day}`],
          [t.devices_made,   user.devices?.length || 0],
          [t.team_members,   user.teamMembers?.length || 0],
        ].map(([k, v]) => (
          <div key={k} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: '1px solid var(--border)', flexWrap: 'wrap', gap: 4 }}>
            <span style={{ color: 'var(--text2)', fontSize: 13 }}>{k}</span>
            <span style={{ fontWeight: 600, fontSize: 13 }}>{v}</span>
          </div>
        ))}
      </div>

      <button className="btn btn-outline btn-full" style={{ marginBottom: 10 }} onClick={() => navigate('settings')}>
        <Icons.Settings size={16} /> {t.go_settings}
      </button>
      <button className="btn btn-danger btn-full" onClick={doLogout}>
        <Icons.Logout size={16} /> {t.logout}
      </button>
      <div style={{ height: 8 }} />
    </>
  );
}

export default ProfileScreen;
