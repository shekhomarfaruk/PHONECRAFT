import { useState } from "react";
import Icons from "../Icons.jsx";
import { PLANS } from "../data.jsx";
import { I18N } from "../i18n.js";
import { convertCurrency } from "../currency.js";

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

export default function AuthScreen({ isDark, tab, setTab, loginForm, setLoginForm, regForm, setRegForm, doLogin, doRegister, loading, lang }) {
  const t = I18N[lang] || I18N.en;
  return (
    <div className="auth-card">
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
