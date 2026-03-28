import { useState } from "react";
import Icons from "../Icons.jsx";
import { PLANS } from "../data.jsx";
import { I18N } from "../i18n.js";
import { convertCurrency } from "../currency.js";

const API_URL = import.meta.env.VITE_API_URL || '';

const IconInput = ({ Icon, children }) => (
  <div style={{ position: 'relative' }}>
    <span style={{ position: 'absolute', left: 13, top: '50%', transform: 'translateY(-50%)', color: 'var(--text2)', display: 'flex', pointerEvents: 'none' }}><Icon /></span>
    {children}
  </div>
);

const EyeIcon = ({ open }) => open ? (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>
  </svg>
) : (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94"/><path d="M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19"/><line x1="1" y1="1" x2="23" y2="23"/>
  </svg>
);

const PwInput = ({ value, onChange, placeholder, style }) => {
  const [show, setShow] = useState(false);
  return (
    <div style={{ position: 'relative' }}>
      <span style={{ position: 'absolute', left: 13, top: '50%', transform: 'translateY(-50%)', color: 'var(--text2)', display: 'flex', pointerEvents: 'none' }}><Icons.Lock /></span>
      <input
        className="inp"
        style={{ paddingLeft: 42, paddingRight: 42, ...style }}
        type={show ? 'text' : 'password'}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
      />
      <button
        type="button"
        onClick={() => setShow(s => !s)}
        style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text2)', display: 'flex', alignItems: 'center', padding: 4 }}
      >
        <EyeIcon open={show} />
      </button>
    </div>
  );
};

function ForgotPasswordModal({ lang, onClose }) {
  const isBn = lang === 'bn';
  const [step, setStep] = useState('request'); // 'request' | 'code' | 'done'
  const [identifier, setIdentifier] = useState('');
  const [token, setToken] = useState('');
  const [newPw, setNewPw] = useState('');
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState('');

  const requestReset = async () => {
    if (!identifier.trim()) { setMsg(isBn ? 'ইমেইল/ফোন দিন' : 'Enter your email or phone'); return; }
    setLoading(true);
    setMsg('');
    try {
      const res = await fetch(`${API_URL}/api/forgot-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identifier: identifier.trim() }),
      });
      if (res.ok) {
        setStep('code');
        setMsg(isBn
          ? 'রিসেট কোড অ্যাডমিনকে পাঠানো হয়েছে। সাপোর্টে যোগাযোগ করুন এবং কোড নিন।'
          : 'Reset code sent to admin. Contact support to get your code.');
      } else {
        setMsg(isBn ? 'কোনো সমস্যা হয়েছে। আবার চেষ্টা করুন।' : 'Something went wrong. Try again.');
      }
    } catch (_) { setMsg(isBn ? 'কানেকশন সমস্যা' : 'Connection error'); }
    setLoading(false);
  };

  const doReset = async () => {
    if (!token.trim() || !newPw) { setMsg(isBn ? 'কোড এবং নতুন পাসওয়ার্ড দিন' : 'Enter code and new password'); return; }
    if (newPw.length < 6) { setMsg(isBn ? 'পাসওয়ার্ড কমপক্ষে ৬ অক্ষর' : 'Password must be at least 6 characters'); return; }
    setLoading(true);
    setMsg('');
    try {
      const res = await fetch(`${API_URL}/api/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: token.trim(), newPassword: newPw }),
      });
      const d = await res.json();
      if (res.ok) {
        setStep('done');
        setMsg(isBn ? 'পাসওয়ার্ড রিসেট সফল হয়েছে! এখন লগইন করুন।' : 'Password reset successful! You can now log in.');
      } else {
        setMsg(d.error || (isBn ? 'কোড ভুল বা মেয়াদ শেষ' : 'Invalid or expired code'));
      }
    } catch (_) { setMsg(isBn ? 'কানেকশন সমস্যা' : 'Connection error'); }
    setLoading(false);
  };

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 9999,
      background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20,
    }}>
      <div style={{
        background: 'var(--card)', borderRadius: 20, padding: '28px 24px',
        width: '100%', maxWidth: 360,
        border: '1px solid var(--border)',
        boxShadow: '0 24px 60px rgba(0,0,0,0.5)',
        animation: 'fpSlide .3s cubic-bezier(.34,1.56,.64,1)',
      }}>
        <style>{`@keyframes fpSlide { 0%{opacity:0;transform:translateY(32px)} 100%{opacity:1;transform:none} }`}</style>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <div style={{ fontFamily: 'Space Grotesk', fontWeight: 800, fontSize: 18 }}>
            🔑 {isBn ? 'পাসওয়ার্ড ভুলে গেছেন?' : 'Forgot Password?'}
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text2)', fontSize: 22, lineHeight: 1 }}>×</button>
        </div>

        {step === 'request' && (
          <>
            <div style={{ fontSize: 13, color: 'var(--text2)', marginBottom: 16 }}>
              {isBn ? 'আপনার অ্যাকাউন্টের ইমেইল বা ফোন নম্বর দিন। অ্যাডমিন একটি রিসেট কোড পাঠাবেন।' : 'Enter your account email or phone. Admin will send you a reset code.'}
            </div>
            <div className="input-wrap">
              <label className="input-label">{isBn ? 'ইমেইল / ফোন' : 'Email / Phone'}</label>
              <IconInput Icon={Icons.Mail}>
                <input className="inp" style={{ paddingLeft: 42 }}
                  placeholder={isBn ? 'আপনার ইমেইল বা ফোন' : 'Your email or phone'}
                  value={identifier} onChange={e => setIdentifier(e.target.value)} />
              </IconInput>
            </div>
            {msg && <div style={{ fontSize: 12, color: 'var(--text2)', marginBottom: 12, padding: '8px 12px', background: 'var(--input-bg)', borderRadius: 8 }}>{msg}</div>}
            <button className="btn btn-primary btn-full" onClick={requestReset} disabled={loading}>
              {loading ? '...' : (isBn ? 'কোড পাঠান' : 'Send Reset Code')}
            </button>
          </>
        )}

        {step === 'code' && (
          <>
            {msg && <div style={{ fontSize: 12, color: 'var(--accent)', marginBottom: 14, padding: '10px 12px', background: 'rgba(35,175,145,.08)', borderRadius: 8, border: '1px solid rgba(35,175,145,.2)' }}>{msg}</div>}
            <div className="input-wrap">
              <label className="input-label">{isBn ? 'রিসেট কোড (৬ ডিজিট)' : 'Reset Code (6 digits)'}</label>
              <input className="inp" placeholder={isBn ? 'অ্যাডমিনের দেওয়া কোড' : 'Code from admin'}
                value={token} onChange={e => setToken(e.target.value)} maxLength={6} />
            </div>
            <div className="input-wrap">
              <label className="input-label">{isBn ? 'নতুন পাসওয়ার্ড' : 'New Password'}</label>
              <PwInput value={newPw} onChange={e => setNewPw(e.target.value)} placeholder={isBn ? 'নতুন পাসওয়ার্ড' : 'New password'} />
            </div>
            {msg && step === 'code' && !msg.includes('admin') && (
              <div style={{ fontSize: 12, color: '#ef4444', marginBottom: 12 }}>{msg}</div>
            )}
            <button className="btn btn-primary btn-full" onClick={doReset} disabled={loading}>
              {loading ? '...' : (isBn ? 'পাসওয়ার্ড রিসেট করুন' : 'Reset Password')}
            </button>
          </>
        )}

        {step === 'done' && (
          <>
            <div style={{ textAlign: 'center', padding: '16px 0' }}>
              <div style={{ fontSize: 48, marginBottom: 12 }}>✅</div>
              <div style={{ fontWeight: 700, fontSize: 16, marginBottom: 8 }}>
                {isBn ? 'সফল!' : 'Success!'}
              </div>
              <div style={{ fontSize: 13, color: 'var(--text2)', marginBottom: 20 }}>{msg}</div>
              <button className="btn btn-primary btn-full" onClick={onClose}>
                {isBn ? 'লগইন করুন' : 'Go to Login'}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default function AuthScreen({ isDark, tab, setTab, loginForm, setLoginForm, regForm, setRegForm, doLogin, doRegister, loading, lang }) {
  const t = I18N[lang] || I18N.en;
  const isBn = lang === 'bn';
  const [showForgot, setShowForgot] = useState(false);

  return (
    <div className="auth-card">
      {showForgot && <ForgotPasswordModal lang={lang} onClose={() => setShowForgot(false)} />}

      {/* ── Animated Logo Portal ── */}
      <div className="auth-logo-wrap">
        <div className="auth-logo-portal">
          <div className="auth-logo-ring" />
          <div className="auth-logo-ring2" />
          <div className="auth-logo-glow" />
          <div className="auth-logo-svg"><img src="/logo.png" alt="PhoneCraft" style={{ width: 110, height: 110, objectFit: 'contain' }} /></div>
          <span className="auth-orbit-dot" />
          <span className="auth-orbit-dot" />
          <span className="auth-orbit-dot" />
          <span className="auth-orbit-dot" />
        </div>
        <div className="auth-logo-text">PHONECRAFT</div>
      </div>
      <div className="auth-sub">{t.auth_sub}</div>
      <div className="auth-tabs">
        <div className={`auth-tab ${tab==='login'?'active':''}`} onClick={()=>setTab('login')}>{t.auth_login_tab}</div>
        <div className={`auth-tab ${tab==='register'?'active':''}`} onClick={()=>setTab('register')}>{t.auth_register_tab}</div>
      </div>

      {tab==='login' ? (
        <>
          <div className="input-wrap">
            <label className="input-label">{t.auth_email}</label>
            <IconInput Icon={Icons.Mail}>
              <input className="inp" style={{paddingLeft:42}} placeholder={t.auth_email_ph} value={loginForm.identifier} onChange={e=>setLoginForm(p=>({...p,identifier:e.target.value}))}/>
            </IconInput>
          </div>
          <div className="input-wrap">
            <label className="input-label">{t.auth_password}</label>
            <PwInput
              value={loginForm.password}
              onChange={e=>setLoginForm(p=>({...p,password:e.target.value}))}
              placeholder={t.auth_password_ph}
            />
          </div>
          <button className="btn btn-primary btn-full" style={{marginTop:8}} onClick={doLogin} disabled={loading}><Icons.Lock size={16}/> {loading ? '...' : t.auth_login_btn}</button>
          {/* Forgot Password link */}
          <button
            type="button"
            onClick={() => setShowForgot(true)}
            style={{
              background: 'none', border: 'none', cursor: 'pointer',
              color: 'var(--accent)', fontSize: 12, fontWeight: 600,
              marginTop: 12, display: 'block', width: '100%', textAlign: 'center',
              textDecoration: 'underline', opacity: 0.8,
            }}
          >
            {isBn ? '🔑 পাসওয়ার্ড ভুলে গেছেন?' : '🔑 Forgot password?'}
          </button>
        </>
      ) : (
        <>
          <div className="input-wrap">
            <label className="input-label">{t.auth_name}</label>
            <IconInput Icon={Icons.User}><input className="inp" style={{paddingLeft:42}} placeholder={t.auth_name_ph} value={regForm.name} onChange={e=>setRegForm(p=>({...p,name:e.target.value}))}/></IconInput>
          </div>
          <div className="input-wrap">
            <label className="input-label">{t.auth_email}</label>
            <IconInput Icon={Icons.Mail}><input className="inp" style={{paddingLeft:42}} placeholder={t.auth_email2_ph} value={regForm.identifier} onChange={e=>setRegForm(p=>({...p,identifier:e.target.value}))}/></IconInput>
          </div>
          <div className="input-wrap">
            <label className="input-label">{t.auth_password}</label>
            <PwInput
              value={regForm.password}
              onChange={e=>setRegForm(p=>({...p,password:e.target.value}))}
              placeholder={t.auth_pass2_ph}
            />
          </div>
          <div className="input-wrap">
            <label className="input-label">{t.auth_refcode} <span style={{color:'var(--red)'}}>{t.auth_refcode_req}</span></label>
            <IconInput Icon={Icons.Link}><input className="inp" style={{paddingLeft:42}} placeholder={t.auth_refcode_ph} value={regForm.refCode} onChange={e=>setRegForm(p=>({...p,refCode:e.target.value}))}/></IconInput>
          </div>
          <div style={{marginBottom:14}}>
            <label className="input-label">{t.auth_select_plan}</label>
            <div className="plan-grid">
              {PLANS.map(plan=>(
                <div key={plan.id} className={`plan-card ${regForm.plan===plan.id?'selected':''}`} onClick={()=>setRegForm(p=>({...p,plan:plan.id}))}>
                  <div className="plan-name" style={{color:plan.color}}>{plan.name}</div>
                  <div className="plan-price">{convertCurrency(plan.rate, lang)}</div>
                  <div style={{fontSize:11,color:'var(--text2)',marginTop:4,lineHeight:1.5}}>
                    <div>{convertCurrency(plan.perTask, lang)}/{t.auth_task} &middot; {plan.daily} {t.auth_tasks_day}</div>
                    <div style={{color:plan.color,fontWeight:700}}>{t.auth_daily}: {convertCurrency(plan.dailyEarn, lang)}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <button className="btn btn-primary btn-full" onClick={doRegister} disabled={loading}><Icons.Star size={15}/> {loading ? '...' : t.auth_register_btn}</button>
        </>
      )}
    </div>
  );
}
