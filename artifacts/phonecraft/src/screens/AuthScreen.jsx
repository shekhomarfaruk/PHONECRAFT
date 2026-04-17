import { useState, useEffect } from "react";
import { QRCodeSVG } from "qrcode.react";
import Icons from "../Icons.jsx";
import { PLANS } from "../data.jsx";
import { I18N } from "../i18n.js";
import { convertCurrency } from "../currency.js";
import { LEGAL, LEGAL_BN, LegalModal } from "./LandingScreen.jsx";

const API_URL  = import.meta.env.VITE_API_URL || '';
const BASE_URL = import.meta.env.BASE_URL || '/';

// ── Blockchain options for DirectPaySheet ────────────────────────────────────
const BLOCKCHAIN_OPTIONS = [
  { value: 'trc20',    label: 'TRC20 (Tron)',      short: 'TRC20', icon: 'https://assets.coingecko.com/coins/images/1094/small/tron-logo.png' },
  { value: 'bep20',    label: 'BNB Chain (BEP20)', short: 'BEP20', icon: 'https://assets.coingecko.com/coins/images/825/small/bnb-icon2_2x.png' },
  { value: 'polygon',  label: 'Polygon',            short: 'POL',   icon: 'https://assets.coingecko.com/coins/images/4713/small/matic-token-icon.png' },
  { value: 'arbitrum', label: 'Arbitrum One',       short: 'ARB',   icon: 'https://assets.coingecko.com/coins/images/16547/small/photo_2023-03-29_21.47.00.jpeg' },
  { value: 'avax',     label: 'AVAX C-Chain',       short: 'AVAX',  icon: 'https://assets.coingecko.com/coins/images/12559/small/coin-round-red.png' },
];
const BDT_DEP_METHODS = [
  { value: 'bkash',  label: 'bKash',  bg: '#E2136E', logo: 'https://cdn.brandfetch.io/id_4D40okd/w/400/h/400/theme/dark/icon.jpeg' },
  { value: 'nagad',  label: 'Nagad',  bg: '#F05A28', logo: 'https://cdn.brandfetch.io/idPKXOsXfF/w/512/h/512/theme/dark/logo.png' },
  { value: 'rocket', label: 'Rocket', bg: '#8B2FC9', logo: `${BASE_URL}rocket-logo.png` },
];

// ── Shared UI helpers for DirectPaySheet ─────────────────────────────────────
function SheetOverlay({ children, onClose }) {
  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 3000, display: 'flex', flexDirection: 'column', background: 'rgba(0,0,0,0.72)' }}
      onClick={e => e.target === e.currentTarget && onClose()}>
      <div style={{ flex: 1 }} onClick={onClose} />
      <div style={{ background: 'var(--bg2,#161A25)', borderRadius: '24px 24px 0 0', maxHeight: '92vh', display: 'flex', flexDirection: 'column', border: '1px solid var(--border)' }}>
        {children}
      </div>
    </div>
  );
}
function SheetHead({ label, title, onClose, onBack }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '16px 20px', borderBottom: '1px solid var(--border)', flexShrink: 0 }}>
      {onBack && (
        <button onClick={onBack} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text2)', padding: 4, display: 'flex' }}>
          <Icons.ChevronLeft size={20} />
        </button>
      )}
      <div style={{ flex: 1 }}>
        {label && <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: 1, textTransform: 'uppercase', color: 'var(--accent)', marginBottom: 2 }}>{label}</div>}
        <div style={{ fontWeight: 800, fontSize: 16 }}>{title}</div>
      </div>
      <button onClick={onClose} style={{ background: 'var(--input-bg)', border: '1px solid var(--border)', borderRadius: '50%', width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: 'var(--text2)' }}>
        <Icons.X size={15} />
      </button>
    </div>
  );
}
function DpImgIcon({ src, alt, size = 36, fallback, fallbackBg = '#555' }) {
  const [err, setErr] = useState(false);
  if (!src || err) return <span style={{ width: size, height: size, borderRadius: '50%', background: fallbackBg, color: '#fff', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: size * 0.42, fontWeight: 800, flexShrink: 0 }}>{fallback}</span>;
  return <img src={src} alt={alt} width={size} height={size} style={{ borderRadius: '50%', objectFit: 'cover', flexShrink: 0 }} onError={() => setErr(true)} />;
}
function DpCopyBtn({ text, isBn }) {
  const [copied, setCopied] = useState(false);
  const handle = () => {
    navigator.clipboard?.writeText(text).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <button type="button" onClick={handle} style={{ background: copied ? 'rgba(16,185,129,.15)' : 'var(--input-bg)', border: `1px solid ${copied ? 'var(--accent)' : 'var(--border)'}`, borderRadius: 8, padding: '6px 14px', cursor: 'pointer', fontSize: 12, fontWeight: 600, color: copied ? 'var(--accent)' : 'var(--text2)', display: 'flex', alignItems: 'center', gap: 5, transition: 'all .2s', flexShrink: 0 }}>
      {copied ? <Icons.CheckCircle size={13} /> : <Icons.Copy size={13} />}
      {copied ? (isBn ? 'কপি হয়েছে' : 'Copied') : (isBn ? 'কপি' : 'Copy')}
    </button>
  );
}

// ── DirectPaySheet — opens like a Deposit sheet, captures TxID ───────────────
function DirectPaySheet({ planRate, lang, onConfirm, onClose }) {
  const isBn = lang === 'bn';
  const [tab, setTab]             = useState('bdt');
  const [bdtStep, setBdtStep]     = useState(1);
  const [bdtMethod, setBdtMethod] = useState('');
  const [blockchain, setBlockchain] = useState('');
  const [txnHash, setTxnHash]     = useState('');
  const [depositInfo, setDepositInfo] = useState(null);
  const [rotatingWallet, setRotatingWallet] = useState('');

  useEffect(() => {
    fetch(`${API_URL}/api/deposit-info`)
      .then(r => r.json()).then(setDepositInfo).catch(() => setDepositInfo({}));
  }, []);

  useEffect(() => {
    if (blockchain) {
      fetch(`${API_URL}/api/deposit/next-wallet`)
        .then(r => r.json()).then(d => setRotatingWallet(d.wallet || '')).catch(() => {});
    }
  }, [blockchain]);

  const selectedBdt   = BDT_DEP_METHODS.find(m => m.value === bdtMethod);
  const depositNumber = depositInfo?.[bdtMethod] || '';
  const cryptoAddr    = rotatingWallet || depositInfo?.[`crypto_${blockchain}_usdt`] || '';

  const switchTab = (t) => { setTab(t); setBdtStep(1); setBdtMethod(''); setBlockchain(''); setTxnHash(''); };

  const canConfirm = txnHash.trim().length >= 4;

  const handleConfirm = () => {
    if (!canConfirm) return;
    onConfirm(txnHash.trim());
  };

  const TxInput = (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      <label style={{ fontSize: 12, color: 'var(--text2)', fontWeight: 600 }}>
        {isBn ? 'ট্রানজেকশন ID / Hash *' : 'Transaction ID / Hash *'}
      </label>
      <input
        type="text"
        value={txnHash}
        onChange={e => setTxnHash(e.target.value)}
        placeholder={isBn ? 'পেমেন্টের পর TxID দিন' : 'Paste your TxID after payment'}
        style={{ padding: '11px 13px', borderRadius: 10, background: 'var(--input-bg)', border: `1.5px solid ${canConfirm ? 'var(--accent)' : 'var(--border)'}`, color: 'var(--text)', fontSize: 13, fontFamily: 'monospace', outline: 'none', transition: 'border .2s', width: '100%', boxSizing: 'border-box' }}
      />
      {txnHash.length > 0 && !canConfirm && <div style={{ fontSize: 11, color: '#f87171' }}>{isBn ? 'কমপক্ষে ৪ অক্ষর দিন' : 'Minimum 4 characters'}</div>}
    </div>
  );

  const AmountBadge = (
    <div style={{ padding: '10px 14px', background: 'rgba(192,57,43,0.08)', border: '1px solid rgba(192,57,43,0.3)', borderRadius: 10, display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
      <span style={{ fontSize: 12, color: 'var(--text2)' }}>{isBn ? 'পাঠানোর পরিমাণ' : 'Amount to Send'}</span>
      <span style={{ fontFamily: 'Space Grotesk', fontWeight: 800, fontSize: 15, color: '#E8880A' }}>{convertCurrency(planRate, lang)}</span>
    </div>
  );

  const ConfirmBtn = (
    <button
      type="button"
      onClick={handleConfirm}
      disabled={!canConfirm}
      className="btn btn-primary btn-full"
      style={{ borderRadius: 14, padding: '14px 0', fontSize: 15, opacity: canConfirm ? 1 : 0.45 }}
    >
      <>{isBn ? 'নিশ্চিত করুন' : 'Confirm Payment'}</>
    </button>
  );

  const WarnNote = (
    <div style={{ padding: '9px 12px', borderRadius: 9, background: 'rgba(245,158,11,0.07)', border: '1px solid rgba(245,158,11,0.2)', fontSize: 11.5, color: '#D97706', lineHeight: 1.6, display: 'flex', alignItems: 'flex-start', gap: 7 }}>
      <Icons.AlertTriangle size={13} style={{ flexShrink: 0, marginTop: 1 }} />
      <span>{isBn ? 'ভুল TxID দিলে অ্যাকাউন্ট অনুমোদন হবে না।' : 'Incorrect TxID will cause rejection. Pay first, then submit.'}</span>
    </div>
  );

  return (
    <SheetOverlay onClose={onClose}>
      <SheetHead
        label={isBn ? 'সরাসরি পেমেন্ট' : 'Direct Payment'}
        title={tab === 'bdt'
          ? (bdtStep === 1 ? (isBn ? 'পদ্ধতি বেছে নিন' : 'Choose Method') : (isBn ? 'পেমেন্ট বিবরণ' : 'Payment Details'))
          : 'USDT Crypto'}
        onClose={onClose}
        onBack={tab === 'bdt' && bdtStep === 2 ? () => setBdtStep(1) : null}
      />

      {/* Tab switcher */}
      <div style={{ display: 'flex', gap: 8, margin: '12px 20px 4px', padding: 4, background: 'var(--card)', borderRadius: 16 }}>
        {[['bdt', isBn ? 'BDT' : 'BDT'], ['usdt', 'USDT Crypto']].map(([key, lbl]) => (
          <button key={key} onClick={() => switchTab(key)} style={{ flex: 1, padding: '10px 0', borderRadius: 12, fontSize: 13, fontWeight: 700, border: 'none', cursor: 'pointer', transition: 'all .2s', background: tab === key ? 'var(--accent)' : 'transparent', color: tab === key ? '#fff' : 'var(--text2)' }}>
            {lbl}
          </button>
        ))}
      </div>

      <div style={{ overflowY: 'auto', padding: '12px 20px 36px', display: 'flex', flexDirection: 'column', gap: 14 }}>

        {/* ── BDT Step 1: choose method ── */}
        {tab === 'bdt' && bdtStep === 1 && (
          <>
            {AmountBadge}
            <p style={{ fontSize: 13, color: 'var(--text2)', margin: 0 }}>{isBn ? 'মোবাইল ব্যাংকিং পদ্ধতি বেছে নিন:' : 'Choose your mobile banking method:'}</p>
            {BDT_DEP_METHODS.map(m => (
              <button key={m.value} onClick={() => { setBdtMethod(m.value); setBdtStep(2); }}
                style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '14px 16px', borderRadius: 16, background: 'var(--card)', border: '1px solid var(--border)', cursor: 'pointer', textAlign: 'left' }}>
                <DpImgIcon src={m.logo} alt={m.label} size={46} fallback={m.label[0]} fallbackBg={m.bg} />
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 700, fontSize: 15 }}>{m.label}</div>
                  <div style={{ fontSize: 12, color: 'var(--text2)' }}>{isBn ? 'মোবাইল ব্যাংকিং' : 'Mobile Banking'}</div>
                </div>
                <Icons.ChevronRight size={16} style={{ color: 'var(--text2)' }} />
              </button>
            ))}
          </>
        )}

        {/* ── BDT Step 2: deposit details + TxID ── */}
        {tab === 'bdt' && bdtStep === 2 && selectedBdt && (
          <>
            {AmountBadge}
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: 14, background: 'var(--card)', borderRadius: 14, border: '1px solid var(--border)' }}>
              <DpImgIcon src={selectedBdt.logo} alt={selectedBdt.label} size={40} fallback={selectedBdt.label[0]} fallbackBg={selectedBdt.bg} />
              <div>
                <div style={{ fontWeight: 700 }}>{selectedBdt.label} {isBn ? 'পেমেন্ট' : 'Payment'}</div>
                <div style={{ fontSize: 12, color: 'var(--text2)' }}>{isBn ? 'নিচের নম্বরে পাঠান' : 'Send to the number below'}</div>
              </div>
            </div>
            {depositNumber ? (
              <div style={{ padding: 16, background: 'rgba(232,136,10,.08)', border: '1px solid rgba(232,136,10,.3)', borderRadius: 14, textAlign: 'center' }}>
                <div style={{ fontSize: 11, color: 'var(--text2)', marginBottom: 4 }}>{selectedBdt.label} {isBn ? 'অ্যাকাউন্ট' : 'Account'}</div>
                <div style={{ fontFamily: 'monospace', fontSize: 22, fontWeight: 800, letterSpacing: 2, marginBottom: 10 }}>{depositNumber}</div>
                <div style={{ display: 'flex', justifyContent: 'center' }}>
                  <DpCopyBtn text={depositNumber} isBn={isBn} />
                </div>
              </div>
            ) : (
              <div style={{ padding: 12, background: 'rgba(239,68,68,.08)', border: '1px solid rgba(239,68,68,.3)', borderRadius: 12, fontSize: 13, color: '#ef4444', textAlign: 'center' }}>
                {isBn ? 'ডিপোজিট নম্বর এখনো সেট করা হয়নি।' : 'Deposit number not configured yet.'}
              </div>
            )}
            {TxInput}
            {WarnNote}
            {ConfirmBtn}
          </>
        )}

        {/* ── USDT Crypto ── */}
        {tab === 'usdt' && (
          <>
            {AmountBadge}
            <p style={{ fontSize: 13, color: 'var(--text2)', margin: 0 }}>{isBn ? 'নেটওয়ার্ক বেছে নিন:' : 'Select Network:'}</p>
            {BLOCKCHAIN_OPTIONS.map(b => (
              <button key={b.value} onClick={() => setBlockchain(b.value)}
                style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 14px', borderRadius: 14, background: blockchain === b.value ? 'rgba(232,136,10,.1)' : 'var(--card)', border: `1px solid ${blockchain === b.value ? '#E8880A' : 'var(--border)'}`, cursor: 'pointer', transition: 'all .15s' }}>
                <DpImgIcon src={b.icon} alt={b.label} size={36} fallback={b.short[0]} fallbackBg="#333" />
                <div style={{ flex: 1, textAlign: 'left' }}>
                  <div style={{ fontWeight: 700, fontSize: 14, color: blockchain === b.value ? '#E8880A' : 'var(--text)' }}>{b.label}</div>
                </div>
                <div style={{ width: 20, height: 20, borderRadius: '50%', border: `2px solid ${blockchain === b.value ? '#E8880A' : 'var(--border)'}`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  {blockchain === b.value && <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#E8880A' }} />}
                </div>
              </button>
            ))}

            {blockchain && (cryptoAddr ? (
              <div style={{ padding: 16, background: 'rgba(232,136,10,.08)', border: '1px solid rgba(232,136,10,.3)', borderRadius: 14, textAlign: 'center' }}>
                <div style={{ display: 'inline-block', background: '#fff', borderRadius: 12, padding: 10, marginBottom: 12 }}>
                  <QRCodeSVG value={cryptoAddr} size={160} level="H" imageSettings={{ src: `${BASE_URL}logo.png`, height: 34, width: 34, excavate: true }} />
                </div>
                <div style={{ fontFamily: 'monospace', fontSize: 12, wordBreak: 'break-all', fontWeight: 600, marginBottom: 10 }}>{cryptoAddr}</div>
                <div style={{ display: 'flex', justifyContent: 'center' }}>
                  <DpCopyBtn text={cryptoAddr} isBn={isBn} />
                </div>
              </div>
            ) : (
              <div style={{ padding: 12, background: 'rgba(239,68,68,.08)', border: '1px solid rgba(239,68,68,.3)', borderRadius: 12, fontSize: 13, color: '#ef4444', textAlign: 'center' }}>
                {isBn ? 'এই নেটওয়ার্কের জন্য ওয়ালেট সেট করা হয়নি।' : 'No wallet configured for this network.'}
              </div>
            ))}

            {blockchain && cryptoAddr && (
              <>
                <div style={{ padding: '9px 12px', borderRadius: 9, background: 'rgba(240,176,11,.07)', border: '1px solid rgba(240,176,11,.2)', fontSize: 12, color: 'var(--text2)', lineHeight: 1.7 }}>
                  <div style={{ fontWeight: 700, color: '#f0b90b', marginBottom: 4, display: 'flex', alignItems: 'center', gap: 5 }}><Icons.AlertTriangle size={13} style={{ flexShrink: 0 }} /> {isBn ? 'গুরুত্বপূর্ণ:' : 'Important:'}</div>
                  {(isBn
                    ? ['শুধুমাত্র USDT পাঠান।', 'ভুল নেটওয়ার্কে পাঠালে টাকা হারিয়ে যাবে।', 'স্মার্ট কন্ট্র্যাক্ট সাপোর্ট করে না।']
                    : ['Send USDT only — other coins will not be credited.', 'Wrong network = permanent loss.', 'Smart-contract deposits not supported.']
                  ).map((n, i) => <div key={i}>{i + 1}. {n}</div>)}
                </div>
                {TxInput}
                {WarnNote}
                {ConfirmBtn}
              </>
            )}
          </>
        )}
      </div>
    </SheetOverlay>
  );
}

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
  const [step, setStep] = useState('request');
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
            <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}><Icons.Lock size={18} />{isBn ? 'পাসওয়ার্ড ভুলে গেছেন?' : 'Forgot Password?'}</span>
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
            {msg && <div style={{ fontSize: 12, color: 'var(--accent)', marginBottom: 14, padding: '10px 12px', background: 'rgba(16,185,129,.08)', borderRadius: 8, border: '1px solid rgba(16,185,129,.2)' }}>{msg}</div>}
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
              <div style={{ fontSize: 48, marginBottom: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#0ECB81' }}><Icons.CheckCircle size={48} /></div>
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

// ── Step Progress Bar ─────────────────────────────────────────────────────────
const STEP_LABELS = {
  en: ['Choose Plan', 'Your Details', 'Order Summary', 'Awaiting Approval'],
  bn: ['প্ল্যান বেছে নিন', 'আপনার তথ্য', 'অর্ডার সারাংশ', 'অনুমোদনের অপেক্ষায়'],
};

function StepProgressBar({ currentStep, lang }) {
  const isBn = lang === 'bn';
  const labels = isBn ? STEP_LABELS.bn : STEP_LABELS.en;
  return (
    <div style={{ marginBottom: 24 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 0 }}>
        {labels.map((label, i) => {
          const stepNum = i + 1;
          const isDone = stepNum < currentStep;
          const isActive = stepNum === currentStep;
          const dotColor = isDone ? '#C0392B' : isActive ? '#E8880A' : 'rgba(112,122,138,0.35)';
          const textColor = isDone ? '#C0392B' : isActive ? '#EAECEF' : 'rgba(112,122,138,0.55)';
          return (
            <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', position: 'relative' }}>
              {i < labels.length - 1 && (
                <div style={{
                  position: 'absolute', top: 14, left: '50%', width: '100%', height: 2,
                  background: stepNum < currentStep
                    ? 'linear-gradient(90deg,#C0392B,#E8880A)'
                    : 'rgba(112,122,138,0.2)',
                  zIndex: 0,
                }} />
              )}
              <div style={{
                width: 28, height: 28, borderRadius: '50%',
                background: isDone ? '#C0392B' : isActive ? 'rgba(232,136,10,0.2)' : 'rgba(10,20,40,0.55)',
                border: `2px solid ${dotColor}`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontFamily: 'Space Grotesk', fontWeight: 800, fontSize: 12,
                color: isDone ? '#fff' : isActive ? '#E8880A' : 'rgba(112,122,138,0.5)',
                zIndex: 1, position: 'relative',
                boxShadow: isActive ? '0 0 12px rgba(232,136,10,0.4)' : 'none',
                transition: 'all .3s',
              }}>
                {isDone ? (
                  <svg width="13" height="11" viewBox="0 0 13 11" fill="none">
                    <polyline points="1,5.5 5,9.5 12,1.5" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                ) : stepNum}
              </div>
              <div style={{
                fontSize: 9.5, marginTop: 5, color: textColor,
                fontWeight: isActive ? 700 : 500, textAlign: 'center',
                fontFamily: 'Space Grotesk', lineHeight: 1.2,
                maxWidth: 64, wordBreak: 'break-word',
                transition: 'all .3s',
              }}>
                {label}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── Step 1: Plan Selection ────────────────────────────────────────────────────
function Step1PlanSelect({ regForm, setRegForm, onNext, lang, isGuest }) {
  const isBn = lang === 'bn';
  const selectedPlan = PLANS.find(p => p.id === regForm.plan);
  const canContinue = isGuest || !!selectedPlan;

  return (
    <div>
      <div style={{ marginBottom: 16, textAlign: 'center' }}>
        <div style={{ fontFamily: 'Space Grotesk', fontWeight: 800, fontSize: 18, color: 'var(--text)', marginBottom: 4 }}>
          {isBn ? 'আপনার প্ল্যান বেছে নিন' : 'Choose Your Plan'}
        </div>
        <div style={{ fontSize: 12, color: 'var(--text2)' }}>
          {isGuest
            ? (isBn ? 'গেস্ট ট্রায়ালে প্ল্যান নির্বাচন ঐচ্ছিক' : 'Plan selection is optional for guest trial')
            : (isBn ? 'আপনার লক্ষ্য অনুযায়ী সঠিক প্ল্যান বেছে নিন' : 'Select the plan that matches your goals')
          }
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 20 }}>
        {PLANS.map(plan => {
          const isSelected = regForm.plan === plan.id;
          return (
            <div
              key={plan.id}
              onClick={() => setRegForm(p => ({ ...p, plan: plan.id }))}
              style={{
                borderRadius: 14,
                border: isSelected ? `2px solid ${plan.color}` : '1.5px solid rgba(112,122,138,0.2)',
                background: isSelected
                  ? `linear-gradient(135deg,${plan.color}18,${plan.color}08)`
                  : 'rgba(22,26,34,0.6)',
                padding: '14px 16px',
                cursor: 'pointer',
                transition: 'all .2s',
                boxShadow: isSelected ? `0 0 20px ${plan.color}28` : 'none',
                position: 'relative',
              }}
            >
              {isSelected && (
                <div style={{
                  position: 'absolute', top: 10, right: 12,
                  background: plan.color, borderRadius: '50%',
                  width: 20, height: 20,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <svg width="11" height="9" viewBox="0 0 11 9" fill="none"><polyline points="1,4.5 4,8 10,1" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                </div>
              )}
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 10, marginBottom: 8 }}>
                <span style={{ fontFamily: 'Space Grotesk', fontWeight: 900, fontSize: 16, color: plan.color }}>
                  {plan.name}
                </span>
                <span style={{ fontFamily: 'Space Grotesk', fontWeight: 800, fontSize: 20, color: 'var(--text)' }}>
                  {convertCurrency(plan.rate, lang)}
                </span>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px 16px' }}>
                <div style={{ fontSize: 11.5, color: 'var(--text2)' }}>
                  <span style={{ color: plan.color, fontWeight: 700 }}>
                    {convertCurrency(plan.dailyEarn, lang)}
                  </span>
                  {' '}{isBn ? 'দৈনিক আয়' : 'daily earnings'}
                </div>
                <div style={{ fontSize: 11.5, color: 'var(--text2)' }}>
                  <span style={{ fontWeight: 700, color: 'var(--text)' }}>{plan.daily}</span>
                  {' '}{isBn ? 'টাস্ক/দিন' : 'tasks/day'}
                </div>
                <div style={{ fontSize: 11.5, color: 'var(--text2)' }}>
                  {convertCurrency(plan.perTask, lang)}{isBn ? '/টাস্ক' : '/task'}
                </div>
                <div style={{ fontSize: 11.5, color: 'var(--text2)' }}>
                  <span style={{ color: '#FBBF24', fontWeight: 700 }}>
                    {isBn ? 'কমিশন' : 'Commission'}:
                  </span>
                  {' '}L1 {plan.l1}% · L2 {plan.l2}% · L3 {plan.l3}%
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div style={{
        position: 'sticky', bottom: 0,
        background: 'linear-gradient(to top, var(--card) 80%, transparent)',
        paddingTop: 12, paddingBottom: 4,
      }}>
        <button
          className="btn btn-primary btn-full"
          onClick={onNext}
          disabled={!canContinue}
          style={{ opacity: !canContinue ? 0.5 : 1, transition: 'opacity .2s' }}
        >
          {isBn ? 'পরবর্তী ধাপ →' : 'Continue →'}
        </button>
        {!canContinue && (
          <div style={{ textAlign: 'center', fontSize: 11, color: 'var(--text2)', marginTop: 6 }}>
            {isBn ? 'একটি প্ল্যান বেছে নিন' : 'Please select a plan to continue'}
          </div>
        )}
      </div>
    </div>
  );
}

// ── Step 2: Account Details ───────────────────────────────────────────────────
function Step2Details({ regForm, setRegForm, onNext, onBack, lang, showLegal, onError }) {
  const isBn = lang === 'bn';
  const selectedPlan = PLANS.find(p => p.id === regForm.plan);
  const [agreed, setAgreed] = useState(false);

  const validate = () => {
    if (!regForm.name.trim()) return isBn ? 'নাম দিন' : 'Enter your name';
    if (!regForm.identifier.trim()) return isBn ? 'ইমেইল/ফোন দিন' : 'Enter email or phone';
    if (!regForm.password || regForm.password.length < 6) return isBn ? 'পাসওয়ার্ড কমপক্ষে ৬ অক্ষর' : 'Password must be at least 6 characters';
    // referral code is optional — no referral code → direct payment is auto-selected at Step 3
    if (!agreed) return isBn ? 'শর্তাবলীতে সম্মত হন' : 'Please agree to the terms';
    return null;
  };

  const handleNext = () => {
    const err = validate();
    if (err) { if (onError) onError(err); return; }
    onNext();
  };

  return (
    <div>
      <div style={{ marginBottom: 16, textAlign: 'center' }}>
        <div style={{ fontFamily: 'Space Grotesk', fontWeight: 800, fontSize: 18, color: 'var(--text)', marginBottom: 4 }}>
          {isBn ? 'আপনার তথ্য দিন' : 'Your Details'}
        </div>
        <div style={{ fontSize: 12, color: 'var(--text2)' }}>
          {isBn ? 'অ্যাকাউন্ট তৈরির জন্য তথ্য পূরণ করুন' : 'Fill in your account information'}
        </div>
      </div>

      {selectedPlan && (
        <div style={{
          display: 'flex', alignItems: 'center', gap: 10,
          background: `linear-gradient(135deg,${selectedPlan.color}18,${selectedPlan.color}08)`,
          border: `1px solid ${selectedPlan.color}40`,
          borderRadius: 10, padding: '9px 14px', marginBottom: 18,
        }}>
          <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', color: selectedPlan.color }}><Icons.Package size={16} /></span>
          <div>
            <div style={{ fontFamily: 'Space Grotesk', fontWeight: 800, fontSize: 12, color: selectedPlan.color }}>
              {selectedPlan.name} {isBn ? 'প্ল্যান নির্বাচিত' : 'Plan Selected'}
            </div>
            <div style={{ fontSize: 11, color: 'var(--text2)' }}>
              {convertCurrency(selectedPlan.rate, lang)} · {convertCurrency(selectedPlan.dailyEarn, lang)}{isBn ? ' দৈনিক আয়' : ' daily earnings'}
            </div>
          </div>
        </div>
      )}

      <div className="input-wrap">
        <label className="input-label">{isBn ? 'পূর্ণ নাম' : 'Full Name'}</label>
        <IconInput Icon={Icons.User}>
          <input className="inp" style={{ paddingLeft: 42 }} placeholder={isBn ? 'আপনার পূর্ণ নাম' : 'Your full name'} value={regForm.name} onChange={e => setRegForm(p => ({ ...p, name: e.target.value }))} />
        </IconInput>
      </div>
      <div className="input-wrap">
        <label className="input-label">{isBn ? 'ইমেইল / ফোন' : 'Email / Phone'}</label>
        <IconInput Icon={Icons.Mail}>
          <input className="inp" style={{ paddingLeft: 42 }} placeholder={isBn ? 'ইমেইল বা মোবাইল' : 'Email or mobile'} value={regForm.identifier} onChange={e => setRegForm(p => ({ ...p, identifier: e.target.value }))} />
        </IconInput>
      </div>
      <div className="input-wrap">
        <label className="input-label">{isBn ? 'পাসওয়ার্ড' : 'Password'}</label>
        <PwInput value={regForm.password} onChange={e => setRegForm(p => ({ ...p, password: e.target.value }))} placeholder={isBn ? 'পাসওয়ার্ড তৈরি করুন' : 'Create password'} />
      </div>
      <div className="input-wrap">
        <label className="input-label">
          {isBn ? 'রেফারেল কোড' : 'Referral Code'}{' '}
          <span style={{ color: 'var(--text2)', fontWeight: 400, fontSize: 11, marginLeft: 4 }}>
            {isBn ? '(ঐচ্ছিক — না থাকলে সরাসরি পেমেন্ট করুন)' : '(optional — leave blank to pay directly)'}
          </span>
        </label>
        <IconInput Icon={Icons.Link}>
          <input className="inp" style={{ paddingLeft: 42 }} placeholder={isBn ? 'রেফারেল কোড দিন (না থাকলে খালি রাখুন)' : 'Enter referral code (leave blank for direct pay)'} value={regForm.refCode} onChange={e => setRegForm(p => ({ ...p, refCode: e.target.value }))} />
        </IconInput>
        <div style={{
          marginTop: 8, padding: '10px 13px', borderRadius: 10,
          background: 'linear-gradient(135deg,rgba(14,203,129,0.08),rgba(59,130,246,0.06))',
          border: '1px solid rgba(14,203,129,0.25)',
          display: 'flex', alignItems: 'flex-start', gap: 8,
        }}>
          <span style={{ flexShrink: 0, display: 'flex', alignItems: 'center', color: 'var(--accent)' }}><Icons.Info size={16} /></span>
          <div style={{ fontSize: 12, lineHeight: 1.55, color: 'var(--text2)' }}>
            {isBn
              ? <>ফ্রি <b style={{ color: 'var(--accent)' }}>১৫ মিনিটের গেস্ট ট্রায়াল</b> পেতে কোড হিসেবে <b style={{ color: 'var(--accent)', letterSpacing: 1 }}>GUSTMODE</b> ব্যবহার করুন।</>
              : <>For a free <b style={{ color: 'var(--accent)' }}>15-minute guest trial</b>, use code <b style={{ color: 'var(--accent)', letterSpacing: 1 }}>GUSTMODE</b>.</>
            }
          </div>
        </div>
      </div>

      <label style={{ display: 'flex', alignItems: 'flex-start', gap: 10, cursor: 'pointer', marginBottom: 16, padding: '10px 12px', borderRadius: 10, background: agreed ? 'rgba(16,185,129,0.07)' : 'rgba(10,20,40,0.4)', border: agreed ? '1px solid rgba(16,185,129,0.3)' : '1px solid rgba(10,20,40,0.65)', transition: 'all .2s' }}>
        <div style={{ position: 'relative', flexShrink: 0, marginTop: 2 }}>
          <input type="checkbox" checked={agreed} onChange={e => setAgreed(e.target.checked)} style={{ position: 'absolute', opacity: 0, width: 0, height: 0 }} />
          <div style={{ width: 18, height: 18, borderRadius: 5, border: agreed ? '2px solid #10B981' : '2px solid rgba(112,122,138,0.5)', background: agreed ? '#10B981' : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all .2s' }}>
            {agreed && <svg width="11" height="9" viewBox="0 0 11 9" fill="none"><polyline points="1,4.5 4,8 10,1" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>}
          </div>
        </div>
        <span style={{ fontSize: 11.5, color: 'var(--text2)', lineHeight: 1.6 }}>
          {isBn
            ? <>আমি PhoneCraft Ltd-এর{' '}
                <span onClick={e => { e.preventDefault(); showLegal('terms'); }} style={{ color: 'var(--accent)', fontWeight: 700, cursor: 'pointer', textDecoration: 'underline' }}>সেবার শর্তাবলী</span>
                {' '}এবং{' '}
                <span onClick={e => { e.preventDefault(); showLegal('privacy'); }} style={{ color: 'var(--accent)', fontWeight: 700, cursor: 'pointer', textDecoration: 'underline' }}>গোপনীয়তা নীতি</span>
                {' '}পড়েছি এবং সম্মত হয়েছি।</>
            : <>I agree to PhoneCraft Ltd's{' '}
                <span onClick={e => { e.preventDefault(); showLegal('terms'); }} style={{ color: 'var(--accent)', fontWeight: 700, cursor: 'pointer', textDecoration: 'underline' }}>Terms of Service</span>
                {' '}and{' '}
                <span onClick={e => { e.preventDefault(); showLegal('privacy'); }} style={{ color: 'var(--accent)', fontWeight: 700, cursor: 'pointer', textDecoration: 'underline' }}>Privacy Policy</span>
                .</>
          }
        </span>
      </label>

      <div style={{ display: 'flex', gap: 10 }}>
        <button
          onClick={onBack}
          style={{ flex: 1, padding: '12px 0', borderRadius: 10, border: '1px solid rgba(112,122,138,0.3)', background: 'transparent', color: 'var(--text2)', fontSize: 14, cursor: 'pointer', fontFamily: 'Inter,sans-serif', fontWeight: 600 }}
        >
          ← {isBn ? 'পিছনে' : 'Back'}
        </button>
        <button className="btn btn-primary" style={{ flex: 2, opacity: !agreed ? 0.5 : 1, transition: 'opacity .2s' }} onClick={handleNext} disabled={!agreed}>
          {isBn ? 'পরবর্তী ধাপ →' : 'Continue →'}
        </button>
      </div>
    </div>
  );
}

// ── Step 3: Order Summary ─────────────────────────────────────────────────────
function Step3OrderSummary({ regForm, setRegForm, onBack, onConfirm, loading, lang, appSettings }) {
  const isBn = lang === 'bn';
  const selectedPlan = PLANS.find(p => p.id === regForm.plan);
  if (!selectedPlan) return null;
  const isGuest  = String(regForm.refCode).toUpperCase() === 'GUSTMODE';
  const payMethod = regForm.paymentMethod || 'referrer';
  const txnHash   = regForm.txnHash || '';

  const set = (k, v) => setRegForm(f => ({ ...f, [k]: v }));
  const hasRefCode = !!regForm.refCode && String(regForm.refCode).toUpperCase() !== 'GUSTMODE';

  useEffect(() => {
    // Auto-select direct pay if no referral code provided (paymentMethod may be undefined initially)
    if (!hasRefCode && !isGuest) {
      set('paymentMethod', 'direct');
    }
  }, [hasRefCode]);

  const [showDirectSheet, setShowDirectSheet] = useState(false);
  const [refCodeWarn, setRefCodeWarn] = useState(false);

  const openDirectSheet = () => { set('paymentMethod', 'direct'); setShowDirectSheet(true); };
  const closeDirectSheet = () => {
    setShowDirectSheet(false);
    if (!regForm.txnHash) set('paymentMethod', hasRefCode ? 'referrer' : 'direct');
  };
  const handleDirectConfirm = (hash) => {
    set('txnHash', hash);
    setShowDirectSheet(false);
  };

  const switchToReferrer = () => {
    if (!hasRefCode) { setRefCodeWarn(true); setTimeout(() => setRefCodeWarn(false), 3500); return; }
    setRefCodeWarn(false);
    set('paymentMethod', 'referrer'); set('txnHash', '');
  };

  const canConfirmDirect = !isGuest && payMethod === 'direct' && txnHash.trim().length >= 4;
  const btnDisabled = loading || (!isGuest && payMethod === 'direct' && !canConfirmDirect);

  return (
    <div>
      {/* DirectPaySheet bottom sheet */}
      {showDirectSheet && (
        <DirectPaySheet
          planRate={selectedPlan.rate}
          lang={lang}
          onConfirm={handleDirectConfirm}
          onClose={closeDirectSheet}
        />
      )}

      <div style={{ marginBottom: 16, textAlign: 'center' }}>
        <div style={{ fontFamily: 'Space Grotesk', fontWeight: 800, fontSize: 18, color: 'var(--text)', marginBottom: 4 }}>
          {isBn ? 'অর্ডার সারাংশ' : 'Order Summary'}
        </div>
        <div style={{ fontSize: 12, color: 'var(--text2)' }}>
          {isBn ? 'নিশ্চিত করুন এবং অ্যাক্টিভেশন অনুরোধ করুন' : 'Review and request activation'}
        </div>
      </div>

      {/* Plan card */}
      <div style={{
        borderRadius: 16,
        border: `1.5px solid ${selectedPlan.color}55`,
        background: `linear-gradient(135deg,${selectedPlan.color}22, var(--card))`,
        padding: '18px 18px 14px',
        marginBottom: 16,
        boxShadow: `0 4px 18px ${selectedPlan.color}18`,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14, paddingBottom: 12, borderBottom: '1px solid var(--border)' }}>
          <div style={{ width: 40, height: 40, borderRadius: 10, background: `${selectedPlan.color}22`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: selectedPlan.color }}><Icons.Package size={20} /></div>
          <div>
            <div style={{ fontFamily: 'Space Grotesk', fontWeight: 900, fontSize: 16, color: selectedPlan.color }}>{selectedPlan.name}</div>
            <div style={{ fontSize: 11, color: 'var(--text2)' }}>{isBn ? 'ফোনক্রাফ্ট ম্যানুফ্যাকচারিং প্ল্যান' : 'PhoneCraft Manufacturing Plan'}</div>
          </div>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <SummaryRow label={isBn ? 'অ্যাক্টিভেশন খরচ' : 'Activation Cost'} value={isGuest ? (isBn ? 'বিনামূল্যে' : 'Free') : convertCurrency(selectedPlan.rate, lang)} highlight accent={selectedPlan.color} />
          <SummaryRow label={isBn ? 'দৈনিক আয়' : 'Daily Earnings'} value={convertCurrency(selectedPlan.dailyEarn, lang)} />
          <SummaryRow label={isBn ? 'টাস্ক/দিন' : 'Tasks/Day'} value={`${selectedPlan.daily}`} />
          <SummaryRow label={isBn ? 'প্রতি টাস্কে আয়' : 'Earn per Task'} value={convertCurrency(selectedPlan.perTask, lang)} />
          <SummaryRow label={isBn ? 'রেফারেল কমিশন (L1)' : 'Referral Commission (L1)'} value={`${selectedPlan.l1}%`} />
        </div>
      </div>

      {/* Payment method toggle — non-guest only */}
      {!isGuest && (
        <div style={{ marginBottom: 16 }}>
          <div style={{ fontSize: 12, color: 'var(--text2)', fontWeight: 600, marginBottom: 8 }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}><Icons.CreditCard size={13} />{isBn ? 'পেমেন্ট পদ্ধতি' : 'Payment Method'}</span>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button type="button" onClick={switchToReferrer}
              style={{ flex: 1, padding: '11px 8px', borderRadius: 10, cursor: 'pointer', border: payMethod === 'referrer' ? '2px solid #E8880A' : '1.5px solid var(--border)', background: payMethod === 'referrer' ? 'rgba(232,136,10,0.12)' : 'var(--input-bg)', color: payMethod === 'referrer' ? '#E8880A' : 'var(--text2)', fontFamily: 'Inter,sans-serif', fontWeight: 700, fontSize: 12, textAlign: 'center', lineHeight: 1.4, transition: 'all .18s' }}>
              <Icons.People size={16} /><br /><span style={{ fontSize: 11 }}>{isBn ? 'রেফারার পেমেন্ট করবেন' : 'Referrer Pays'}</span>
            </button>
            <button type="button" onClick={openDirectSheet}
              style={{ flex: 1, padding: '11px 8px', borderRadius: 10, cursor: 'pointer', border: payMethod === 'direct' ? '2px solid #C0392B' : '1.5px solid var(--border)', background: payMethod === 'direct' ? 'rgba(192,57,43,0.12)' : 'var(--input-bg)', color: payMethod === 'direct' ? '#E8880A' : 'var(--text2)', fontFamily: 'Inter,sans-serif', fontWeight: 700, fontSize: 12, textAlign: 'center', lineHeight: 1.4, transition: 'all .18s' }}>
              <Icons.CreditCard size={16} /><br /><span style={{ fontSize: 11 }}>{isBn ? 'আমি সরাসরি পেমেন্ট করব' : "I'll Pay Directly"}</span>
            </button>
          </div>
          {refCodeWarn && (
            <div style={{ marginTop: 8, padding: '9px 12px', borderRadius: 9, background: 'rgba(248,113,113,0.08)', border: '1px solid rgba(248,113,113,0.3)', fontSize: 12, color: '#FCA5A5', lineHeight: 1.5 }}>
              <span style={{ display: 'flex', alignItems: 'flex-start', gap: 6 }}><Icons.AlertTriangle size={13} style={{ flexShrink: 0, marginTop: 1 }} /><span>{isBn ? 'রেফারার পেমেন্টের জন্য একটি বৈধ রেফারেল কোড প্রয়োজন। পিছনে যান এবং কোড যোগ করুন, অথবা "আমি সরাসরি পেমেন্ট করব" বেছে নিন।' : 'A referral code is required for Referrer Pays. Go back and add one, or choose "I\'ll Pay Directly".'}</span></span>
            </div>
          )}
          {!hasRefCode && !refCodeWarn && (
            <div style={{ marginTop: 7, fontSize: 11, color: 'var(--text2)', textAlign: 'center' }}>
              {isBn ? 'রেফারেল কোড নেই? "আমি সরাসরি পেমেন্ট করব" বেছে নিন।' : 'No referral code? Choose "I\'ll Pay Directly".'}
            </div>
          )}
        </div>
      )}

      {/* Referrer pays info */}
      {!isGuest && payMethod === 'referrer' && (
        <div style={{ borderRadius: 12, padding: '13px 15px', marginBottom: 16, background: 'linear-gradient(135deg,rgba(232,136,10,0.1),rgba(192,57,43,0.07))', border: '1px solid rgba(232,136,10,0.3)' }}>
          <div style={{ display: 'flex', gap: 9, alignItems: 'flex-start' }}>
            <span style={{ display: 'flex', alignItems: 'center', flexShrink: 0, color: '#E8880A' }}><Icons.People size={18} /></span>
            <div>
              <div style={{ fontFamily: 'Space Grotesk', fontWeight: 700, fontSize: 12.5, color: '#E8880A', marginBottom: 4 }}>{isBn ? 'রেফারার পেমেন্ট' : 'Referrer Payment'}</div>
              <div style={{ fontSize: 12, color: 'var(--text2)', lineHeight: 1.65 }}>
                {isBn ? 'আপনার রেফারার তাদের নিজস্ব ওয়ালেট ব্যালেন্স থেকে আপনার অ্যাক্টিভেশন খরচ পরিশোধ করবেন।' : 'Your referrer pays the activation cost from their own wallet balance.'}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Guest — free trial note */}
      {isGuest && (
        <div style={{ borderRadius: 12, padding: '13px 15px', marginBottom: 16, background: 'linear-gradient(135deg,rgba(14,203,129,0.08),rgba(232,136,10,0.06))', border: '1px solid rgba(14,203,129,0.25)' }}>
          <div style={{ display: 'flex', gap: 9, alignItems: 'flex-start' }}>
            <span style={{ display: 'flex', alignItems: 'center', flexShrink: 0, color: '#0ECB81' }}><Icons.CreditCard size={18} /></span>
            <div>
              <div style={{ fontFamily: 'Space Grotesk', fontWeight: 700, fontSize: 12.5, color: '#0ECB81', marginBottom: 4 }}>{isBn ? 'পেমেন্ট' : 'Payment'}</div>
              <div style={{ fontSize: 12, color: 'var(--text2)', lineHeight: 1.65 }}>{isBn ? 'গেস্ট ট্রায়াল সম্পূর্ণ বিনামূল্যে।' : 'Guest trial is completely free. No payment required.'}</div>
            </div>
          </div>
        </div>
      )}

      {/* Direct pay — TxID confirmed badge OR prompt to open sheet */}
      {!isGuest && payMethod === 'direct' && (
        txnHash.trim().length >= 4 ? (
          <div style={{ borderRadius: 12, padding: '13px 15px', marginBottom: 16, background: 'rgba(14,203,129,0.08)', border: '1px solid rgba(14,203,129,0.35)', display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ display: 'flex', alignItems: 'center', flexShrink: 0, color: '#0ECB81' }}><Icons.CheckCircle size={22} /></span>
            <div style={{ flex: 1 }}>
              <div style={{ fontFamily: 'Space Grotesk', fontWeight: 700, fontSize: 12.5, color: '#0ECB81', marginBottom: 2 }}>
                {isBn ? 'পেমেন্ট তথ্য নিশ্চিত হয়েছে' : 'Payment Info Confirmed'}
              </div>
              <div style={{ fontFamily: 'monospace', fontSize: 12, color: 'var(--text2)', wordBreak: 'break-all' }}>
                TxID: {txnHash.length > 20 ? txnHash.slice(0, 16) + '…' + txnHash.slice(-6) : txnHash}
              </div>
            </div>
            <button type="button" onClick={openDirectSheet}
              style={{ padding: '5px 10px', borderRadius: 7, border: '1px solid rgba(232,136,10,0.4)', background: 'rgba(232,136,10,0.12)', color: '#E8880A', cursor: 'pointer', fontSize: 11, fontWeight: 700, flexShrink: 0 }}>
              {isBn ? 'পরিবর্তন' : 'Change'}
            </button>
          </div>
        ) : (
          <button type="button" onClick={openDirectSheet}
            style={{ width: '100%', marginBottom: 16, padding: '13px 16px', borderRadius: 12, border: '1.5px dashed rgba(192,57,43,0.55)', background: 'rgba(192,57,43,0.05)', color: '#E8880A', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 10, textAlign: 'left' }}>
            <span style={{ display: 'flex', alignItems: 'center', color: '#C0392B' }}><Icons.CreditCard size={22} /></span>
            <div>
              <div style={{ fontWeight: 700, fontSize: 13, marginBottom: 2, color: '#E8880A' }}>{isBn ? 'পেমেন্ট পদ্ধতি নির্বাচন করুন' : 'Choose Payment Method'}</div>
              <div style={{ fontSize: 11.5, color: 'var(--text2)' }}>{isBn ? 'bKash, Nagad, Rocket বা USDT Crypto' : 'bKash, Nagad, Rocket or USDT Crypto'}</div>
            </div>
            <Icons.ChevronRight size={16} style={{ color: '#E8880A', marginLeft: 'auto', flexShrink: 0 }} />
          </button>
        )
      )}

      {/* Admin verifies note for direct pay */}
      {!isGuest && payMethod === 'direct' && (
        <div style={{ borderRadius: 10, padding: '10px 14px', marginBottom: 16, background: 'rgba(244,196,48,0.07)', border: '1px solid rgba(244,196,48,0.25)', fontSize: 12, color: '#F4C430', display: 'flex', gap: 8, alignItems: 'flex-start' }}>
          <span style={{ display: 'flex', alignItems: 'center', color: '#F4C430' }}><Icons.Shield size={14} /></span>
          <span>{isBn ? 'অ্যাডমিন আপনার TxID যাচাই করে অ্যাকাউন্ট অ্যাক্টিভ করবেন।' : 'An admin will verify your TxID and activate your account.'}</span>
        </div>
      )}

      <div style={{ display: 'flex', gap: 10 }}>
        <button onClick={onBack}
          style={{ flex: 1, padding: '12px 0', borderRadius: 10, border: '1px solid rgba(112,122,138,0.3)', background: 'transparent', color: 'var(--text2)', fontSize: 14, cursor: 'pointer', fontFamily: 'Inter,sans-serif', fontWeight: 600 }}>
          ← {isBn ? 'পিছনে' : 'Back'}
        </button>
        <button className="btn btn-primary" style={{ flex: 2, opacity: btnDisabled && !loading ? 0.5 : 1 }} onClick={onConfirm} disabled={btnDisabled}>
          {loading ? (
            <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
              <span style={{ display: 'inline-block', width: 14, height: 14, borderRadius: '50%', border: '2px solid rgba(255,255,255,0.3)', borderTopColor: '#fff', animation: 'spin .7s linear infinite' }} />
              {isBn ? 'প্রক্রিয়াকরণ...' : 'Processing...'}
            </span>
          ) : (
            <><Icons.CheckCircle size={15} style={{ marginRight: 6 }} />{isBn ? 'অ্যাক্টিভেশন অনুরোধ করুন' : 'Request Activation'}</>
          )}
        </button>
      </div>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );
}


function SummaryRow({ label, value, highlight, accent }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
      <span style={{ fontSize: 12, color: 'var(--text2)' }}>{label}</span>
      <span style={{ fontSize: 13, fontWeight: highlight ? 800 : 600, color: highlight ? (accent || 'var(--accent)') : 'var(--text)', fontFamily: highlight ? 'Space Grotesk' : 'inherit' }}>
        {value}
      </span>
    </div>
  );
}

// ── Step 4: Waiting for Approval ──────────────────────────────────────────────
function Step4Waiting({ lang, onCancel, paymentMethod, identifier }) {
  const isBn = lang === 'bn';
  const isDirectPay = paymentMethod === 'direct';
  const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(identifier || '').trim());
  const ringColor = isDirectPay ? '232,136,10' : '192,57,43';
  const dotColor  = isDirectPay ? '#E8880A' : '#C0392B';

  return (
    <div style={{ textAlign: 'center', padding: '8px 0 16px' }}>
      <div style={{ position: 'relative', width: 80, height: 80, margin: '0 auto 20px' }}>
        <div style={{
          position: 'absolute', inset: 0, borderRadius: '50%',
          border: `3px solid rgba(${ringColor},0.2)`,
          animation: 'waitPulseRing 2s ease-out infinite',
        }} />
        <div style={{
          position: 'absolute', inset: 8, borderRadius: '50%',
          border: `2px solid rgba(${ringColor},0.35)`,
          animation: 'waitPulseRing 2s ease-out infinite .4s',
        }} />
        <div style={{
          position: 'absolute', inset: 20, borderRadius: '50%',
          background: `rgba(${ringColor},0.12)`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 26,
        }}>{isDirectPay ? <Icons.Shield size={26} /> : <Icons.Clock size={26} />}</div>
      </div>

      <style>{`
        @keyframes waitPulseRing {
          0%  { transform: scale(0.95); opacity: 0.8; }
          70% { transform: scale(1.15); opacity: 0; }
          100%{ transform: scale(0.95); opacity: 0; }
        }
        @keyframes waitDot {
          0%,100%{ opacity:.3; transform:scale(.7); }
          50%    { opacity:1;  transform:scale(1.3); }
        }
      `}</style>

      <div style={{ fontFamily: 'Space Grotesk', fontWeight: 900, fontSize: 20, marginBottom: 10, color: 'var(--text)' }}>
        {isDirectPay
          ? (isBn ? 'অ্যাডমিন যাচাইয়ের অপেক্ষায়' : 'Awaiting Admin Verification')
          : (isBn ? 'অনুমোদনের অপেক্ষায়' : 'Waiting for Approval')
        }
      </div>

      <p style={{ fontSize: 13.5, color: 'var(--text2)', lineHeight: 1.75, marginBottom: 18, maxWidth: 310, margin: '0 auto 18px' }}>
        {isDirectPay
          ? (isBn
            ? (isEmail
              ? 'আপনার পেমেন্ট TxID জমা হয়েছে। অনুমোদনের পর আপনার ইমেইলে একটি লগইন লিংক পাঠানো হবে — ইনবক্স চেক করুন।'
              : 'আপনার পেমেন্ট TxID জমা হয়েছে। আমাদের অ্যাডমিন টিম যাচাই করে আপনার অ্যাকাউন্ট অ্যাক্টিভ করবেন।')
            : (isEmail
              ? 'Your payment TxID has been submitted. After approval, a one-time login link will be emailed to you — check your inbox.'
              : 'Your payment TxID has been submitted. Our admin team will verify your payment and activate your account.')
          )
          : (isBn
            ? 'আপনার রেফারার একটি নোটিফিকেশন পেয়েছেন। তিনি অনুমোদন করলে আপনার অ্যাকাউন্ট স্বয়ংক্রিয়ভাবে তৈরি হবে।'
            : 'Your referrer has been notified. Once they approve, your account will be created automatically.'
          )
        }
      </p>

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, marginBottom: 20 }}>
        {[0, 0.3, 0.6].map((delay, i) => (
          <div key={i} style={{ width: 9, height: 9, borderRadius: '50%', background: dotColor, animation: `waitDot 1.6s ease-in-out ${delay}s infinite` }} />
        ))}
      </div>

      {isDirectPay && (
        <div style={{
          borderRadius: 10, padding: '10px 14px', marginBottom: 14, textAlign: 'left',
          background: 'rgba(245,158,11,0.07)', border: '1px solid rgba(245,158,11,0.22)',
          fontSize: 12, color: '#D97706', lineHeight: 1.65,
        }}>
          <span style={{ display: 'flex', alignItems: 'flex-start', gap: 6 }}><Icons.AlertTriangle size={13} style={{ flexShrink: 0, marginTop: 1 }} /><span>{isBn ? 'ভুল TxID দেওয়া হলে বা পেমেন্ট না করা হলে অনুরোধটি বাতিল হতে পারে।' : 'If the TxID is invalid or payment was not made, the request may be rejected.'}</span></span>
        </div>
      )}

      <div style={{
        borderRadius: 12, padding: '12px 16px', marginBottom: 20, textAlign: 'left',
        background: `rgba(${ringColor},0.07)`,
        border: `1px solid rgba(${ringColor},0.2)`,
      }}>
        <div style={{ fontFamily: 'Space Grotesk', fontWeight: 700, fontSize: 12, color: dotColor, marginBottom: 6 }}>
          {isBn ? 'অনুমোদনের পরে কী হবে?' : 'What happens after approval?'}
        </div>
        <div style={{ fontSize: 12, color: 'var(--text2)', lineHeight: 1.7 }}>
          {isBn
            ? 'আপনার অ্যাকাউন্ট সক্রিয় হয়ে যাবে এবং আপনি লগইন করে কাজ শুরু করতে পারবেন।'
            : 'Your account will be activated and you can log in to start working and earning immediately.'
          }
        </div>
      </div>

      <button
        onClick={onCancel}
        style={{ padding: '10px 24px', borderRadius: 10, border: '1px solid rgba(112,122,138,.3)', background: 'transparent', color: 'var(--text2)', fontSize: 13, cursor: 'pointer', fontFamily: 'Inter,sans-serif' }}
      >
        {isBn ? 'বাতিল করুন' : 'Cancel'}
      </button>
    </div>
  );
}

// ── Main Register Flow ────────────────────────────────────────────────────────
function RegisterFlow({ regForm, setRegForm, doRegister, loading, lang, pendingRegId, setPendingRegId, setAuthTab, appSettings }) {
  const isBn = lang === 'bn';
  const [checkoutStep, setCheckoutStep] = useState(1);
  const [localError, setLocalError] = useState('');
  const [showLegalDoc, setShowLegalDoc] = useState(null);
  const legalDocs = lang === 'bn' ? LEGAL_BN : LEGAL;

  const showError = (msg) => { setLocalError(msg); setTimeout(() => setLocalError(''), 3500); };

  const isGuest = String(regForm.refCode).toUpperCase() === 'GUSTMODE';

  const handleStep1Next = () => {
    if (!regForm.plan && !isGuest) { setLocalError(isBn ? 'একটি প্ল্যান বেছে নিন' : 'Please select a plan'); return; }
    setLocalError('');
    setCheckoutStep(2);
  };

  const handleStep2Next = () => {
    setLocalError('');
    const id = String(regForm.identifier || '').trim();
    if (id.includes('@') && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(id)) {
      setLocalError(lang === 'bn' ? 'সঠিক ইমেইল ঠিকানা দিন' : 'Please enter a valid email address');
      return;
    }
    setCheckoutStep(3);
  };

  const handleConfirmActivation = async () => {
    setLocalError('');
    await doRegister(() => setCheckoutStep(4));
  };

  if (pendingRegId) {
    return (
      <div>
        <StepProgressBar currentStep={4} lang={lang} />
        <Step4Waiting
          lang={lang}
          paymentMethod={regForm.paymentMethod}
          identifier={regForm.identifier}
          onCancel={() => { setPendingRegId(null); setCheckoutStep(1); setAuthTab('register'); }}
        />
      </div>
    );
  }

  return (
    <div>
      {showLegalDoc && <LegalModal doc={legalDocs[showLegalDoc]} onClose={() => setShowLegalDoc(null)} />}
      <StepProgressBar currentStep={checkoutStep} lang={lang} />
      {localError && (
        <div style={{ marginBottom: 12, padding: '9px 13px', borderRadius: 8, background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', fontSize: 12.5, color: '#f87171', textAlign: 'center' }}>
          <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}><Icons.AlertTriangle size={13} /><span>{localError}</span></span>
        </div>
      )}
      {checkoutStep === 1 && (
        <Step1PlanSelect
          regForm={regForm}
          setRegForm={setRegForm}
          onNext={handleStep1Next}
          lang={lang}
          isGuest={isGuest}
        />
      )}
      {checkoutStep === 2 && (
        <Step2Details
          regForm={regForm}
          setRegForm={setRegForm}
          onNext={handleStep2Next}
          onBack={() => setCheckoutStep(1)}
          lang={lang}
          showLegal={(doc) => setShowLegalDoc(doc)}
          onError={showError}
        />
      )}
      {checkoutStep === 3 && (
        <Step3OrderSummary
          regForm={regForm}
          setRegForm={setRegForm}
          onBack={() => setCheckoutStep(2)}
          onConfirm={handleConfirmActivation}
          loading={loading}
          lang={lang}
          appSettings={appSettings}
        />
      )}
    </div>
  );
}

// ── AuthScreen (main export) ──────────────────────────────────────────────────
export default function AuthScreen({ isDark, tab, setTab, loginForm, setLoginForm, regForm, setRegForm, doRegister, doLogin, loading, lang, loginNotice, pendingRegId, setPendingRegId, appSettings }) {
  const t = I18N[lang] || I18N.en;
  const isBn = lang === 'bn';
  const [showForgot, setShowForgot] = useState(false);
  const [showLegal, setShowLegal] = useState(null);
  const legalDocs = lang === 'bn' ? LEGAL_BN : LEGAL;

  return (
    <div className="auth-card">
      {showForgot && <ForgotPasswordModal lang={lang} onClose={() => setShowForgot(false)} />}
      {showLegal && <LegalModal doc={legalDocs[showLegal]} onClose={() => setShowLegal(null)} />}

      {loginNotice && (
        <div style={{
          background: 'linear-gradient(90deg,rgba(245,158,11,0.15),rgba(239,68,68,0.12))',
          border: '1px solid rgba(245,158,11,0.4)',
          borderRadius: 10, padding: '10px 14px',
          marginBottom: 14, fontSize: 13, color: '#D97706',
          fontWeight: 600, textAlign: 'center', lineHeight: 1.5,
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
        }}>
          <Icons.Zap size={14} />{loginNotice}
        </div>
      )}

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
        <div className={`auth-tab ${tab === 'login' ? 'active' : ''}`} onClick={() => setTab('login')}>{t.auth_login_tab}</div>
        <div className={`auth-tab ${tab === 'register' ? 'active' : ''}`} onClick={() => setTab('register')}>{t.auth_register_tab}</div>
      </div>

      {tab === 'login' ? (
        <>
          <div className="input-wrap">
            <label className="input-label">{t.auth_email}</label>
            <IconInput Icon={Icons.Mail}>
              <input className="inp" style={{ paddingLeft: 42 }} placeholder={t.auth_email_ph} value={loginForm.identifier} onChange={e => setLoginForm(p => ({ ...p, identifier: e.target.value }))} />
            </IconInput>
          </div>
          <div className="input-wrap">
            <label className="input-label">{t.auth_password}</label>
            <PwInput
              value={loginForm.password}
              onChange={e => setLoginForm(p => ({ ...p, password: e.target.value }))}
              placeholder={t.auth_password_ph}
            />
          </div>
          <button className="btn btn-primary btn-full" style={{ marginTop: 8 }} onClick={doLogin} disabled={loading}><Icons.Lock size={16} /> {loading ? '...' : t.auth_login_btn}</button>
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
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5 }}><Icons.Lock size={12} />{isBn ? 'পাসওয়ার্ড ভুলে গেছেন?' : 'Forgot password?'}</span>
          </button>
        </>
      ) : (
        <RegisterFlow
          regForm={regForm}
          setRegForm={setRegForm}
          doRegister={doRegister}
          loading={loading}
          lang={lang}
          pendingRegId={pendingRegId}
          setPendingRegId={setPendingRegId}
          setAuthTab={setTab}
          appSettings={appSettings}
        />
      )}
    </div>
  );
}
