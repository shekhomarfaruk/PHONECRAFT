import { useState, useEffect, useRef } from "react";
import { QRCodeSVG } from "qrcode.react";
import Icons from "../Icons.jsx";
import { I18N } from "../i18n.js";
import { convertCurrency } from "../currency.js";
import { authFetch } from "../session.js";

const API_URL = import.meta.env.VITE_API_URL || '';
const BASE_URL = import.meta.env.BASE_URL || '/';

const BLOCKCHAIN_OPTIONS = [
  { value: 'trc20',    label: 'TRC20',           short: 'TRC20',   icon: 'https://assets.coingecko.com/coins/images/1094/small/tron-logo.png' },
  { value: 'bep20',    label: 'BNB-Chain (BEP20)',short: 'BEP20',   icon: 'https://assets.coingecko.com/coins/images/825/small/bnb-icon2_2x.png' },
  { value: 'polygon',  label: 'Polygon',          short: 'POL',     icon: 'https://assets.coingecko.com/coins/images/4713/small/matic-token-icon.png' },
  { value: 'arbitrum', label: 'Arbitrum One',     short: 'ARB',     icon: 'https://assets.coingecko.com/coins/images/16547/small/photo_2023-03-29_21.47.00.jpeg' },
  { value: 'avax',     label: 'AVAX C-Chain',     short: 'AVAX',    icon: 'https://assets.coingecko.com/coins/images/12559/small/coin-round-red.png' },
  { value: 'erc20',    label: 'ERC20',            short: 'ERC20',   icon: 'https://assets.coingecko.com/coins/images/279/small/ethereum.png', fee: 'Additional fees: 5USDT' },
];

const PAYMENT_OPTIONS = [
  { value: 'bkash',  label: 'bKash',  logo: 'https://cdn.brandfetch.io/id_4D40okd/w/400/h/400/theme/dark/icon.jpeg',       bg: '#E2136E', text: '#fff', letter: 'b' },
  { value: 'nagad',  label: 'Nagad',  logo: 'https://cdn.brandfetch.io/idPKXOsXfF/w/512/h/512/theme/dark/logo.png',         bg: '#F05A28', text: '#fff', letter: 'N' },
  { value: 'rocket', label: 'Rocket', logo: `${BASE_URL}rocket-logo.png`,                                                    bg: '#8B2FC9', text: '#fff', letter: 'R' },
  { value: 'crypto', label: 'Crypto (USDT)', logo: `${BASE_URL}crypto-logo.png`,                                             bg: '#26A17B', text: '#fff', letter: 'C' },
];

// ── Helpers ─────────────────────────────────────────────────────────────────
function ImgIcon({ src, alt, size = 28, fallback, fallbackBg = '#555', fallbackColor = '#fff' }) {
  const [err, setErr] = useState(false);
  if (!src || err) return (
    <span style={{ width: size, height: size, borderRadius: '50%', background: fallbackBg, color: fallbackColor, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: size * 0.45, fontWeight: 800, flexShrink: 0 }}>
      {fallback}
    </span>
  );
  return <img src={src} alt={alt} width={size} height={size} style={{ borderRadius: '50%', objectFit: 'cover', flexShrink: 0 }} onError={() => setErr(true)} />;
}

function CopyButton({ text, showToast, label = 'Copy', copiedLabel = 'Copied' }) {
  const [copied, setCopied] = useState(false);
  const handle = async () => {
    try { await navigator.clipboard.writeText(text); setCopied(true); showToast(copiedLabel + '!'); setTimeout(() => setCopied(false), 2000); }
    catch { showToast('Copy failed'); }
  };
  return (
    <button type="button" onClick={handle} style={{ background: copied ? 'rgba(35,175,145,.15)' : 'var(--input-bg)', border: `1px solid ${copied ? 'var(--accent)' : 'var(--border)'}`, borderRadius: 8, padding: '6px 12px', cursor: 'pointer', fontSize: 12, fontWeight: 600, color: copied ? 'var(--accent)' : 'var(--text2)', display: 'flex', alignItems: 'center', gap: 4, transition: 'all .2s', flexShrink: 0 }}>
      {copied ? <Icons.CheckCircle size={13} /> : <Icons.Copy size={13} />}
      {copied ? copiedLabel : label}
    </button>
  );
}

// ── Bottom Sheet overlay ──────────────────────────────────────────────────────
function Sheet({ children, onClose }) {
  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 1000, display: 'flex', flexDirection: 'column', background: 'rgba(0,0,0,0.7)' }}
      onClick={e => e.target === e.currentTarget && onClose()}>
      <div style={{ flex: 1 }} onClick={onClose} />
      <div style={{ background: 'var(--bg2,#161A25)', borderRadius: '24px 24px 0 0', maxHeight: '92vh', display: 'flex', flexDirection: 'column', border: '1px solid var(--border)' }}>
        {children}
      </div>
    </div>
  );
}

function SheetHeader({ label, title, onClose, onBack }) {
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

// ── Submission success card ──────────────────────────────────────────────────
function SubmissionCard({ type, lang, onClose }) {
  const isBn = lang === 'bn';
  const isDeposit = type === 'deposit' || type === 'deposit_auto';
  const isAutoVerified = type === 'deposit_auto';
  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 9999, background: 'rgba(0,0,0,0.65)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
      <div style={{ background: 'var(--card)', border: `1px solid ${isAutoVerified ? 'rgba(35,175,145,.6)' : 'rgba(35,175,145,.35)'}`, borderRadius: 24, padding: '32px 28px', maxWidth: 360, width: '100%', textAlign: 'center', boxShadow: '0 24px 80px rgba(0,0,0,0.5)' }}>
        <style>{`@keyframes cardSlideUp{0%{opacity:0;transform:translateY(40px) scale(.92)}100%{opacity:1;transform:translateY(0) scale(1)}}@keyframes successPulse{0%,100%{box-shadow:0 0 0 0 rgba(35,175,145,.4)}50%{box-shadow:0 0 0 18px rgba(35,175,145,0)}}`}</style>
        <div style={{ width: 80, height: 80, borderRadius: '50%', background: 'linear-gradient(135deg,rgba(35,175,145,.2),rgba(35,175,145,.05))', border: '2px solid rgba(35,175,145,.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px', animation: 'successPulse 2s ease-in-out infinite' }}>
          <svg width="38" height="38" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 11-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
        </div>
        {isAutoVerified && (
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: 'rgba(35,175,145,.15)', border: '1px solid rgba(35,175,145,.4)', borderRadius: 20, padding: '4px 12px', marginBottom: 12, fontSize: 12, fontWeight: 700, color: 'var(--accent)' }}>
            ⚡ {isBn ? 'স্বয়ংক্রিয়ভাবে যাচাই হয়েছে' : 'Auto Verified'}
          </div>
        )}
        <div style={{ fontFamily: 'Space Grotesk', fontWeight: 900, fontSize: 22, marginBottom: 8 }}>
          {isAutoVerified
            ? (isBn ? '✅ ব্যালেন্স যোগ হয়েছে!' : '✅ Balance Credited!')
            : (isBn ? (isDeposit ? 'ডিপোজিট জমা হয়েছে!' : 'উইথড্র অনুরোধ হয়েছে!') : (isDeposit ? 'Deposit Submitted!' : 'Withdrawal Requested!'))}
        </div>
        <div style={{ fontSize: 14, color: 'var(--text2)', lineHeight: 1.6, marginBottom: 28, background: 'var(--input-bg)', borderRadius: 14, padding: '16px 18px', border: '1px solid var(--border)' }}>
          {isAutoVerified
            ? (isBn ? 'আপনার ক্রিপ্টো ডিপোজিট অন-চেইনে যাচাই হয়েছে এবং ব্যালেন্স তাৎক্ষণিক যোগ হয়েছে।' : 'Your crypto deposit was verified on-chain and the balance has been credited to your account instantly.')
            : (isBn ? `আপনার ${isDeposit ? 'ডিপোজিট' : 'উইথড্র'} সাপোর্ট টিম অনুমোদন করবে। অনুগ্রহ করে অপেক্ষা করুন।` : `Your ${isDeposit ? 'deposit' : 'withdrawal'} will be approved by the support team. Please wait.`)}
        </div>
        <button onClick={onClose} className="btn btn-primary btn-full" style={{ fontSize: 15, padding: '14px 0', borderRadius: 14, fontWeight: 800 }}>
          {isBn ? '✓ ঠিক আছে' : '✓ Got it'}
        </button>
      </div>
    </div>
  );
}

// ── PaymentPage (full-screen crypto confirmation) ────────────────────────────
function PaymentPage({ page, onBack, onConfirm, showToast, lang, user }) {
  const t = I18N[lang] || I18N.en;
  const isBn = lang === 'bn';
  const [txId, setTxId] = useState('');
  const [confirming, setConfirming] = useState(false);
  const [timer, setTimer] = useState(3600);
  const timerRef = useRef(null);
  useEffect(() => {
    timerRef.current = setInterval(() => setTimer(p => p > 0 ? p - 1 : 0), 1000);
    return () => clearInterval(timerRef.current);
  }, []);
  const fmtTimer = (s) => `${String(Math.floor(s / 3600)).padStart(2, '0')}:${String(Math.floor((s % 3600) / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;
  const payOpt = PAYMENT_OPTIONS.find(p => p.value === page.method) || PAYMENT_OPTIONS[3];
  const amtDisplay = `$${page.cryptoAmount || page.amount}`;
  const handleConfirm = async () => {
    if (!txId.trim()) { showToast(isBn ? 'Transaction ID/Hash দিন' : 'Enter Transaction Hash'); return; }
    setConfirming(true);
    await onConfirm({ ...page, txId });
    setConfirming(false);
  };
  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', display: 'flex', flexDirection: 'column' }}>
      <div style={{ background: 'linear-gradient(135deg,#07152a 0%,#0d2d4f 50%,#0a3d50 100%)', padding: '16px 16px 20px', borderBottom: '1px solid rgba(35,175,145,.2)' }}>
        <button onClick={onBack} style={{ background: 'rgba(35,175,145,.15)', border: '1px solid rgba(35,175,145,.3)', borderRadius: 8, padding: '6px 10px', color: 'var(--accent)', cursor: 'pointer', fontSize: 13, display: 'flex', alignItems: 'center', gap: 6, marginBottom: 12 }}>
          ← {isBn ? 'ফিরে যান' : 'Back'}
        </button>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <div style={{ fontSize: 11, color: 'rgba(35,175,145,.8)', marginBottom: 4, textTransform: 'uppercase', letterSpacing: 1, fontWeight: 700 }}>USDT DEPOSIT</div>
            <div style={{ fontSize: 28, fontWeight: 800, color: '#fff', fontFamily: 'Space Grotesk' }}>{amtDisplay}</div>
            <div style={{ fontSize: 11, color: 'rgba(255,255,255,.5)', marginTop: 4 }}>{isBn ? 'কম বা বেশি পাঠাবেন না' : 'Send exact amount only'}</div>
          </div>
          <img src={`${BASE_URL}logo.png`} alt="PhoneCraft" style={{ width: 44, height: 44, borderRadius: 10, objectFit: 'contain', background: 'rgba(35,175,145,.12)', padding: 4, border: '1px solid rgba(35,175,145,.25)' }} />
        </div>
      </div>
      <div style={{ padding: '16px 16px 100px', flex: 1, overflowY: 'auto' }}>
        <div style={{ background: 'rgba(239,68,68,.08)', border: '1px solid rgba(239,68,68,.3)', borderRadius: 10, padding: '10px 14px', marginBottom: 16, fontSize: 12, color: '#ef4444', fontWeight: 600 }}>
          <span style={{ display: 'flex', alignItems: 'flex-start', gap: 6 }}><Icons.AlertTriangle size={13} style={{ flexShrink: 0, marginTop: 1 }} /><span>{isBn ? `পরিমাণ পরিবর্তন করলে ক্রেডিট পাবেন না (${amtDisplay})` : `Changing the amount (${amtDisplay}) will result in no credit.`}</span></span>
        </div>
        {page.walletAddr && (
          <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 14, padding: 16, marginBottom: 16 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
              <div>
                <div style={{ fontSize: 11, color: 'var(--text2)', marginBottom: 4 }}>{isBn ? 'ওয়ালেট ঠিকানা' : 'Wallet Address'}</div>
                <div style={{ fontSize: 11, color: 'var(--text2)' }}>{isBn ? 'শুধুমাত্র এই ঠিকানায় পাঠান' : 'Send only to this address'}</div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: '#26A17B', borderRadius: 10, padding: '8px 12px' }}>
                <ImgIcon src={payOpt.logo} alt="USDT" size={24} fallback="C" fallbackBg="rgba(255,255,255,.3)" fallbackColor="#fff" />
                <span style={{ fontSize: 11, fontWeight: 700, color: '#fff' }}>USDT</span>
              </div>
            </div>
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 14 }}>
              <div style={{ background: '#fff', borderRadius: 16, padding: 14, boxShadow: '0 4px 20px rgba(0,0,0,.15)' }}>
                <QRCodeSVG value={page.walletAddr} size={180} level="H" imageSettings={{ src: `${BASE_URL}logo.png`, height: 40, width: 40, excavate: true }} />
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{ background: 'var(--input-bg)', border: '1px solid var(--border)', borderRadius: 8, padding: '10px 12px', fontFamily: 'monospace', fontSize: 12, fontWeight: 600, flex: 1, wordBreak: 'break-all', letterSpacing: .3 }}>{page.walletAddr}</div>
              <CopyButton text={page.walletAddr} showToast={showToast} label={isBn ? 'কপি' : 'Copy'} copiedLabel={isBn ? 'কপি হয়েছে' : 'Copied'} />
            </div>
          </div>
        )}
        {page.blockchain && (
          <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'var(--input-bg)', border: '1px solid var(--border)', borderRadius: 8, padding: '8px 12px', flex: 1 }}>
              <ImgIcon src={BLOCKCHAIN_OPTIONS.find(b => b.value === page.blockchain)?.icon} alt={page.blockchain} size={20} fallback={page.blockchain[0].toUpperCase()} />
              <span style={{ fontSize: 12, fontWeight: 700 }}>{BLOCKCHAIN_OPTIONS.find(b => b.value === page.blockchain)?.label || page.blockchain}</span>
            </div>
          </div>
        )}
        <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 14, padding: 16, marginBottom: 16 }}>
          <div style={{ fontWeight: 700, fontSize: 13, marginBottom: 12 }}>{isBn ? 'অর্ডার বিবরণ' : 'Order Details'}</div>
          {[
            { label: isBn ? 'ধরন' : 'Type', value: 'USDT Deposit' },
            { label: isBn ? 'পরিমাণ' : 'Amount', value: amtDisplay, accent: true },
            { label: isBn ? 'নেটওয়ার্ক' : 'Network', value: BLOCKCHAIN_OPTIONS.find(b => b.value === page.blockchain)?.label || page.blockchain },
            { label: isBn ? 'মেয়াদ' : 'Expires in', value: fmtTimer(timer), timer: true },
          ].map(({ label, value, accent, timer: isTimer }) => (
            <div key={label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0', borderBottom: '1px solid var(--border)' }}>
              <span style={{ fontSize: 12, color: 'var(--text2)' }}>{label}</span>
              <span style={{ fontSize: 12, fontWeight: 700, color: accent ? 'var(--accent)' : isTimer ? '#f59e0b' : 'var(--text)' }}>{value}</span>
            </div>
          ))}
        </div>
        <div className="input-wrap" style={{ marginBottom: 16 }}>
          <label className="input-label">{isBn ? 'Transaction Hash/ID লিখুন (প্রয়োজন)' : 'Enter Transaction Hash/ID (Required)'}</label>
          <input className="inp" placeholder="0x..." value={txId} onChange={e => setTxId(e.target.value)} style={{ borderColor: !txId.trim() ? 'rgba(239,68,68,.5)' : 'var(--border)' }} />
        </div>
        <div style={{ background: 'rgba(217,119,6,.08)', border: '1px solid rgba(217,119,6,.2)', borderRadius: 10, padding: '10px 14px', marginBottom: 20, fontSize: 12, color: 'var(--text2)' }}>
          <span style={{ display: 'flex', alignItems: 'flex-start', gap: 6 }}><Icons.AlertTriangle size={13} style={{ flexShrink: 0, marginTop: 1 }} /><span>{isBn ? 'লেনদেন আইডি সঠিকভাবে পূরণ করতে হবে, অন্যথায় স্কোর বাতিল হবে!' : 'Transaction ID must be filled correctly, otherwise the order will be cancelled!'}</span></span>
        </div>
        <button className="btn btn-primary btn-full" onClick={handleConfirm} disabled={confirming} style={{ fontSize: 15, padding: '14px 0', borderRadius: 12 }}>
          {confirming ? (isBn ? 'প্রক্রিয়াকরণ...' : 'Processing...') : (isBn ? '✓ ডিপোজিট নিশ্চিত করুন' : '✓ Confirm Deposit')}
        </button>
      </div>
    </div>
  );
}

// ── Withdraw Sheet ────────────────────────────────────────────────────────────
function WithdrawSheet({ onClose, user, setUser, showToast, lang, appSettings, tErr, usdRate, onSuccess }) {
  const t = I18N[lang] || I18N.en;
  const isBn = lang === 'bn';
  const minWithdraw = Number(appSettings?.min_withdraw) || 300;
  const maxWithdraw = Number(appSettings?.max_withdraw) || 150000;
  const cryptoEnabled = appSettings?.crypto_enabled !== 'false';

  // BDT methods: bKash, Nagad; USD (Crypto)
  const [step, setStep] = useState(1);  // 1=method, 2=details, 3=success
  const [method, setMethod] = useState('');
  const [acct, setAcct] = useState('');
  const [amount, setAmount] = useState('');
  // Crypto specific
  const [blockchain, setBlockchain] = useState('');
  const [cryptoWallet, setCryptoWallet] = useState('');
  const [cryptoAmount, setCryptoAmount] = useState('');
  const [submitting, setSubmitting] = useState(false);
  // Locked withdrawal accounts
  const [lockedAccounts, setLockedAccounts] = useState({});
  const [loadingLocked, setLoadingLocked] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setLoadingLocked(true);
    authFetch(`${API_URL}/api/withdraw-accounts`)
      .then(r => r.json())
      .then(d => { if (!cancelled && d.accounts) setLockedAccounts(d.accounts); })
      .catch(() => {})
      .finally(() => { if (!cancelled) setLoadingLocked(false); });
    return () => { cancelled = true; };
  }, []);

  const FIAT_METHODS = [
    { value: 'bkash',  label: 'bKash',  logo: PAYMENT_OPTIONS[0].logo, bg: '#E2136E', sub: 'Mobile Banking' },
    { value: 'nagad',  label: 'Nagad',  logo: PAYMENT_OPTIONS[1].logo, bg: '#F05A28', sub: 'Mobile Banking' },
    { value: 'rocket', label: 'Rocket', logo: PAYMENT_OPTIONS[2].logo, bg: '#8B2FC9', sub: 'Mobile Banking' },
  ];

  const isCrypto = method === 'crypto';

  const doSubmit = async () => {
    if (user?.isGuest) { showToast(isBn ? 'গেস্ট অ্যাকাউন্টে উইথড্র করা যায় না' : 'Guest accounts cannot withdraw', 'error'); return; }
    setSubmitting(true);
    try {
      let body;
      if (isCrypto) {
        const wAmt = Math.round(Number(cryptoAmount) * usdRate);
        if (!blockchain) { showToast(isBn ? 'নেটওয়ার্ক বেছে নিন' : 'Select a network'); setSubmitting(false); return; }
        if (!cryptoWallet.trim() || !cryptoAmount) { showToast(t.fill_all_fields); setSubmitting(false); return; }
        if (wAmt < minWithdraw) { showToast(`${isBn ? 'সর্বনিম্ন' : 'Min'} ৳${minWithdraw.toLocaleString()}`); setSubmitting(false); return; }
        if (wAmt > user.balance) { showToast(t.insufficient_balance); setSubmitting(false); return; }
        body = { amount: wAmt, method: 'crypto', account: cryptoWallet.trim(), type: 'withdraw', blockchain, token: 'usdt' };
      } else {
        const numAmt = Math.floor(Number(amount));
        if (!acct || !amount) { showToast(t.fill_all_fields); setSubmitting(false); return; }
        if (numAmt < minWithdraw) { showToast(`${isBn ? 'সর্বনিম্ন' : 'Min'} ৳${minWithdraw.toLocaleString()}`); setSubmitting(false); return; }
        if (maxWithdraw > 0 && numAmt > maxWithdraw) { showToast(`${isBn ? 'সর্বোচ্চ' : 'Max'} ৳${maxWithdraw.toLocaleString()}`); setSubmitting(false); return; }
        if (numAmt > user.balance) { showToast(t.insufficient_balance); setSubmitting(false); return; }
        body = { amount: numAmt, method, account: acct, type: 'withdraw' };
      }
      const res = await authFetch(`${API_URL}/api/withdraw`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
      const data = await res.json();
      if (res.ok) {
        if (data.newBalance !== undefined) setUser(prev => ({ ...prev, balance: data.newBalance }));
        onSuccess('withdraw');
        onClose();
      } else {
        showToast((tErr ? tErr(data.error) : data.error) || t.toast_request_failed);
      }
    } catch (_) { showToast(t.toast_connection_error); }
    setSubmitting(false);
  };

  return (
    <Sheet onClose={onClose}>
      <SheetHeader label={isBn ? 'উইথড্র' : 'Withdraw'} title={step === 1 ? (isBn ? 'পদ্ধতি বেছে নিন' : 'Choose Method') : (isBn ? 'বিবরণ দিন' : 'Enter Details')} onClose={onClose} onBack={step === 2 ? () => setStep(1) : null} />
      <div style={{ overflowY: 'auto', padding: '16px 20px 32px' }}>
        {step === 1 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <p style={{ fontSize: 13, color: 'var(--text2)', marginBottom: 6 }}>{isBn ? 'আপনার উইথড্র পদ্ধতি বেছে নিন।' : 'Select your preferred withdrawal method.'}</p>
            {FIAT_METHODS.map(m => (
              <button key={m.value} onClick={() => { setMethod(m.value); if (lockedAccounts[m.value]) setAcct(lockedAccounts[m.value]); setStep(2); }}
                style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '14px 16px', borderRadius: 16, background: 'var(--card)', border: '1px solid var(--border)', cursor: 'pointer', textAlign: 'left', transition: 'all .2s' }}>
                <ImgIcon src={m.logo} alt={m.label} size={46} fallback={m.label[0]} fallbackBg={m.bg} />
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 700, fontSize: 15 }}>{m.label}</div>
                  <div style={{ fontSize: 12, color: 'var(--text2)' }}>{m.sub}</div>
                </div>
                <Icons.ChevronRight size={16} style={{ color: 'var(--text2)' }} />
              </button>
            ))}
            {cryptoEnabled && (
              <button onClick={() => { setMethod('crypto'); if (lockedAccounts['crypto']) setCryptoWallet(lockedAccounts['crypto']); setStep(2); }}
                style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '14px 16px', borderRadius: 16, background: 'var(--card)', border: '1px solid var(--border)', cursor: 'pointer', textAlign: 'left', transition: 'all .2s' }}>
                <ImgIcon src={`${BASE_URL}crypto-logo.png`} alt="Crypto" size={46} fallback="C" fallbackBg="#26A17B" />
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 700, fontSize: 15 }}>Crypto (USDT)</div>
                  <div style={{ fontSize: 12, color: 'var(--text2)' }}>{isBn ? 'ব্লকচেইন নেটওয়ার্ক' : 'Blockchain Network'}</div>
                </div>
                <Icons.ChevronRight size={16} style={{ color: 'var(--text2)' }} />
              </button>
            )}
            <div style={{ fontSize: 12, color: 'var(--text2)', marginTop: 4, padding: '10px 12px', background: 'rgba(217,119,6,.07)', borderRadius: 10, border: '1px solid rgba(217,119,6,.2)' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}><Icons.AlertTriangle size={12} style={{ flexShrink: 0 }} /><span>{isBn ? `সর্বনিম্ন উইথড্র: ৳${minWithdraw.toLocaleString()}` : `Minimum withdrawal: ৳${minWithdraw.toLocaleString()}`}</span></span>
            </div>
          </div>
        )}
        {step === 2 && !isCrypto && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: 14, background: 'var(--card)', borderRadius: 14, border: '1px solid var(--border)', marginBottom: 4 }}>
              <ImgIcon src={FIAT_METHODS.find(m => m.value === method)?.logo} alt={method} size={40} fallback={method[0]} fallbackBg={FIAT_METHODS.find(m => m.value === method)?.bg} />
              <div>
                <div style={{ fontWeight: 700 }}>{FIAT_METHODS.find(m => m.value === method)?.label} {isBn ? 'উইথড্র' : 'Withdrawal'}</div>
                <div style={{ fontSize: 12, color: 'var(--accent)' }}>{isBn ? `ব্যালেন্স: ৳${user.balance?.toLocaleString()}` : `Balance: ৳${user.balance?.toLocaleString()}`}</div>
              </div>
            </div>
            <div className="input-wrap">
              <label className="input-label">{method.toUpperCase()} {isBn ? 'নম্বর' : 'Number'}</label>
              <input className="inp" placeholder={`${method.toUpperCase()} 01XXXXXXXXXX`} value={acct}
                onChange={lockedAccounts[method] ? undefined : e => setAcct(e.target.value)}
                readOnly={!!lockedAccounts[method]}
                style={lockedAccounts[method] ? { background: 'rgba(35,175,145,.07)', color: 'var(--accent)', cursor: 'not-allowed', fontWeight: 600 } : {}} />
              {lockedAccounts[method] && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 6, padding: '8px 12px', background: 'rgba(35,175,145,.08)', borderRadius: 10, border: '1px solid rgba(35,175,145,.25)' }}>
                  <span style={{ display: 'flex', alignItems: 'center', fontSize: 15, color: 'var(--accent)' }}><Icons.Lock size={15} /></span>
                  <span style={{ fontSize: 12, color: 'var(--accent)' }}>
                    {isBn ? 'এটি আপনার লক করা উইথড্র অ্যাকাউন্ট। পরিবর্তন করতে সাপোর্টে যোগাযোগ করুন।' : 'This is your locked withdrawal account. Contact support to change it.'}
                  </span>
                </div>
              )}
            </div>
            <div className="input-wrap">
              <label className="input-label">{isBn ? 'পরিমাণ (৳ BDT)' : 'Amount (৳ BDT)'}</label>
              <input className="inp" type="number" placeholder={`Min ৳${minWithdraw.toLocaleString()}`} value={amount} onChange={e => setAmount(e.target.value)} />
              <div style={{ fontSize: 11, color: 'var(--text2)', marginTop: 4 }}>
                {isBn ? `সর্বনিম্ন ৳${minWithdraw.toLocaleString()} · সর্বোচ্চ ৳${maxWithdraw.toLocaleString()}` : `Min ৳${minWithdraw.toLocaleString()} · Max ৳${maxWithdraw.toLocaleString()}`}
              </div>
            </div>
            <button className="btn btn-primary btn-full" onClick={doSubmit} disabled={submitting} style={{ borderRadius: 14, padding: '14px 0', fontSize: 15 }}>
              {submitting ? (isBn ? 'প্রক্রিয়াকরণ...' : 'Processing...') : (isBn ? 'উইথড্র করুন' : 'Request Withdrawal')}
            </button>
          </div>
        )}
        {step === 2 && isCrypto && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div style={{ fontSize: 13, color: 'var(--text2)', marginBottom: 2 }}>{isBn ? 'নেটওয়ার্ক বেছে নিন' : 'Select Network'}</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {BLOCKCHAIN_OPTIONS.map(b => (
                <button key={b.value} onClick={() => setBlockchain(b.value)}
                  style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 14px', borderRadius: 14, background: blockchain === b.value ? 'rgba(35,175,145,.08)' : 'var(--card)', border: `1px solid ${blockchain === b.value ? 'var(--accent)' : 'var(--border)'}`, cursor: 'pointer', transition: 'all .15s' }}>
                  <ImgIcon src={b.icon} alt={b.label} size={32} fallback={b.short[0]} />
                  <div style={{ flex: 1, textAlign: 'left' }}>
                    <div style={{ fontWeight: 700, fontSize: 14, color: blockchain === b.value ? 'var(--accent)' : 'var(--text)' }}>{b.label}</div>
                    {b.fee && <div style={{ fontSize: 11, color: 'var(--text2)' }}>{b.fee}</div>}
                  </div>
                  <div style={{ width: 20, height: 20, borderRadius: '50%', border: `2px solid ${blockchain === b.value ? 'var(--accent)' : 'var(--border)'}`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    {blockchain === b.value && <div style={{ width: 10, height: 10, borderRadius: '50%', background: 'var(--accent)' }} />}
                  </div>
                </button>
              ))}
            </div>
            <div className="input-wrap">
              <label className="input-label">{isBn ? 'আপনার USDT ওয়ালেট ঠিকানা' : 'Your USDT Wallet Address'}</label>
              <input className="inp" placeholder="0x..." value={cryptoWallet}
                onChange={lockedAccounts['crypto'] ? undefined : e => setCryptoWallet(e.target.value)}
                readOnly={!!lockedAccounts['crypto']}
                style={lockedAccounts['crypto'] ? { background: 'rgba(35,175,145,.07)', color: 'var(--accent)', cursor: 'not-allowed', fontWeight: 600, fontSize: 12 } : {}} />
              {lockedAccounts['crypto'] && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 6, padding: '8px 12px', background: 'rgba(35,175,145,.08)', borderRadius: 10, border: '1px solid rgba(35,175,145,.25)' }}>
                  <span style={{ display: 'flex', alignItems: 'center', color: 'var(--accent)' }}><Icons.Lock size={15} /></span>
                  <span style={{ fontSize: 12, color: 'var(--accent)' }}>
                    {isBn ? 'এটি আপনার লক করা ক্রিপ্টো ওয়ালেট। পরিবর্তন করতে সাপোর্টে যোগাযোগ করুন।' : 'This is your locked crypto wallet. Contact support to change it.'}
                  </span>
                </div>
              )}
            </div>
            <div className="input-wrap">
              <label className="input-label">{isBn ? 'পরিমাণ ($ USD)' : 'Amount ($ USD)'}</label>
              <input className="inp" type="number" placeholder="e.g. 50" value={cryptoAmount} onChange={e => setCryptoAmount(e.target.value)} />
              {cryptoAmount && <div style={{ fontSize: 11, color: 'var(--accent)', marginTop: 4 }}>≈ ৳{Math.round(Number(cryptoAmount) * usdRate).toLocaleString()} BDT</div>}
            </div>
            <button className="btn btn-primary btn-full" onClick={doSubmit} disabled={submitting || !blockchain} style={{ borderRadius: 14, padding: '14px 0', fontSize: 15 }}>
              {submitting ? (isBn ? 'প্রক্রিয়াকরণ...' : 'Processing...') : (isBn ? 'উইথড্র অনুরোধ করুন' : 'Request Withdrawal')}
            </button>
          </div>
        )}
      </div>
    </Sheet>
  );
}

// ── Deposit Sheet ─────────────────────────────────────────────────────────────
function DepositSheet({ onClose, user, setUser, showToast, lang, appSettings, tErr, usdRate, depositInfo, onSuccess, onShowPaymentPage }) {
  const t = I18N[lang] || I18N.en;
  const isBn = lang === 'bn';
  const [tab, setTab] = useState('bdt'); // 'bdt' | 'usdt'

  // BDT flow
  const [bdtStep, setBdtStep]   = useState(1); // 1=method, 2=details
  const [bdtMethod, setBdtMethod] = useState('');
  const [bdtAmount, setBdtAmount] = useState('');
  const [bdtTxId, setBdtTxId]   = useState('');
  const [submitting, setSubmitting] = useState(false);

  // USDT / Crypto flow
  const [blockchain, setBlockchain] = useState('');
  const [rotatingWallet, setRotatingWallet] = useState('');
  const [cryptoAmount, setCryptoAmount] = useState('');

  const BDT_DEP_METHODS = [
    { value: 'bkash', label: 'bKash', logo: PAYMENT_OPTIONS[0].logo, bg: '#E2136E' },
    { value: 'nagad', label: 'Nagad', logo: PAYMENT_OPTIONS[1].logo, bg: '#F05A28' },
    { value: 'rocket', label: 'Rocket', logo: PAYMENT_OPTIONS[2].logo, bg: '#8B2FC9' },
  ];

  const selectedBdtMethod = BDT_DEP_METHODS.find(m => m.value === bdtMethod);
  const depositNumber = depositInfo[bdtMethod] || '';

  const AUTO_VERIFIED_NETWORKS = ['trc20', 'erc20', 'bep20'];

  useEffect(() => {
    if (blockchain) {
      // For auto-verified networks the verifier matches against the canonical
      // per-network wallet, so do NOT use a rotating wallet for those networks.
      if (AUTO_VERIFIED_NETWORKS.includes(blockchain)) {
        setRotatingWallet('');
      } else {
        authFetch(`${API_URL}/api/deposit/next-wallet`)
          .then(r => r.json())
          .then(d => setRotatingWallet(d.wallet || ''))
          .catch(() => setRotatingWallet(''));
      }
    }
  }, [blockchain]);

  // For auto-verified networks always use the canonical wallet; rotating wallets
  // are only for non-auto-verified blockchains where manual review applies.
  const cryptoAddr = AUTO_VERIFIED_NETWORKS.includes(blockchain)
    ? (depositInfo[`crypto_${blockchain}_usdt`] || '')
    : (rotatingWallet || depositInfo[`crypto_${blockchain}_usdt`] || '');

  const switchTab = (t) => { setTab(t); setBdtStep(1); setBdtMethod(''); setBdtAmount(''); setBdtTxId(''); setBlockchain(''); };

  const submitBdt = async () => {
    const amt = Math.floor(Number(bdtAmount));
    if (!bdtTxId.trim() || !amt) { showToast(t.fill_all_fields); return; }
    if (!depositNumber) { showToast(isBn ? 'ডিপোজিট নম্বর সেট করা নেই' : 'Deposit number not configured'); return; }
    setSubmitting(true);
    try {
      const res = await authFetch(`${API_URL}/api/withdraw`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount: amt, method: bdtMethod, account: depositNumber, type: 'deposit', txnHash: bdtTxId }),
      });
      const data = await res.json();
      if (res.ok) {
        if (data.newBalance !== undefined) setUser(prev => ({ ...prev, balance: data.newBalance }));
        onSuccess('deposit'); onClose();
      } else { showToast((tErr ? tErr(data.error) : data.error) || t.toast_request_failed); }
    } catch (_) { showToast(t.toast_connection_error); }
    setSubmitting(false);
  };

  const goToCryptoPaymentPage = () => {
    if (!blockchain) { showToast(isBn ? 'নেটওয়ার্ক বেছে নিন' : 'Select a network'); return; }
    if (!cryptoAddr) { showToast(isBn ? 'ওয়ালেট ঠিকানা সেট করা নেই' : 'No wallet address configured'); return; }
    if (!cryptoAmount) { showToast(t.fill_all_fields); return; }
    onShowPaymentPage({ method: 'crypto', blockchain, token: 'usdt', cryptoAmount, walletAddr: cryptoAddr, tab: 'deposit', amount: Math.round(Number(cryptoAmount) * usdRate) });
    onClose();
  };

  return (
    <Sheet onClose={onClose}>
      <SheetHeader label={isBn ? 'ডিপোজিট' : 'Deposit'} title={tab === 'bdt' ? (bdtStep === 1 ? (isBn ? 'পদ্ধতি বেছে নিন' : 'Choose Method') : (isBn ? 'বিবরণ দিন' : 'Enter Details')) : 'USDT Crypto'} onClose={onClose} onBack={(tab === 'bdt' && bdtStep === 2) ? () => setBdtStep(1) : null} />

      {/* Tab switcher */}
      <div style={{ display: 'flex', gap: 8, margin: '12px 20px 4px', padding: 4, background: 'var(--card)', borderRadius: 16 }}>
        {[['bdt', isBn ? 'BDT' : 'BDT'], ['usdt', 'USDT Crypto']].map(([key, label]) => (
          <button key={key} onClick={() => switchTab(key)}
            style={{ flex: 1, padding: '10px 0', borderRadius: 12, fontSize: 13, fontWeight: 700, border: 'none', cursor: 'pointer', transition: 'all .2s', background: tab === key ? 'var(--accent)' : 'transparent', color: tab === key ? '#fff' : 'var(--text2)' }}>
            {label}
          </button>
        ))}
      </div>

      <div style={{ overflowY: 'auto', padding: '12px 20px 32px' }}>
        {/* ── BDT flow ── */}
        {tab === 'bdt' && bdtStep === 1 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <p style={{ fontSize: 13, color: 'var(--text2)', marginBottom: 4 }}>{isBn ? 'আপনার মোবাইল ব্যাংকিং পদ্ধতি বেছে নিন।' : 'Choose your mobile banking method to deposit BDT.'}</p>
            {BDT_DEP_METHODS.map(m => (
              <button key={m.value} onClick={() => { setBdtMethod(m.value); setBdtStep(2); }}
                style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '14px 16px', borderRadius: 16, background: 'var(--card)', border: '1px solid var(--border)', cursor: 'pointer', textAlign: 'left' }}>
                <ImgIcon src={m.logo} alt={m.label} size={46} fallback={m.label[0]} fallbackBg={m.bg} />
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 700, fontSize: 15 }}>{m.label}</div>
                  <div style={{ fontSize: 12, color: 'var(--text2)' }}>{isBn ? 'মোবাইল ব্যাংকিং · তাৎক্ষণিক' : 'Mobile Banking · Instant'}</div>
                </div>
                <Icons.ChevronRight size={16} style={{ color: 'var(--text2)' }} />
              </button>
            ))}
          </div>
        )}

        {tab === 'bdt' && bdtStep === 2 && selectedBdtMethod && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: 14, background: 'var(--card)', borderRadius: 14, border: '1px solid var(--border)', marginBottom: 4 }}>
              <ImgIcon src={selectedBdtMethod.logo} alt={selectedBdtMethod.label} size={40} fallback={selectedBdtMethod.label[0]} fallbackBg={selectedBdtMethod.bg} />
              <div>
                <div style={{ fontWeight: 700 }}>{selectedBdtMethod.label} {isBn ? 'ডিপোজিট' : 'Deposit'}</div>
                <div style={{ fontSize: 12, color: 'var(--text2)' }}>{isBn ? 'নিচের নম্বরে পাঠান' : 'Send to the number below'}</div>
              </div>
            </div>
            {depositNumber ? (
              <div style={{ padding: 14, background: 'rgba(35,175,145,.07)', border: '1px solid rgba(35,175,145,.25)', borderRadius: 14, textAlign: 'center' }}>
                <div style={{ fontSize: 11, color: 'var(--text2)', marginBottom: 4 }}>{selectedBdtMethod.label} {isBn ? 'নম্বরে পাঠান' : 'Account'}</div>
                <div style={{ fontFamily: 'monospace', fontSize: 20, fontWeight: 800, letterSpacing: 2 }}>{depositNumber}</div>
                <div style={{ marginTop: 8, display: 'flex', justifyContent: 'center' }}>
                  <CopyButton text={depositNumber} showToast={showToast} label={isBn ? 'কপি' : 'Copy'} copiedLabel={isBn ? 'কপি হয়েছে' : 'Copied'} />
                </div>
              </div>
            ) : (
              <div style={{ padding: 12, background: 'rgba(239,68,68,.08)', border: '1px solid rgba(239,68,68,.3)', borderRadius: 12, fontSize: 13, color: '#ef4444', textAlign: 'center' }}>
                {isBn ? 'ডিপোজিট নম্বর এখনো সেট করা হয়নি।' : 'Deposit number not configured yet.'}
              </div>
            )}
            <div className="input-wrap">
              <label className="input-label">{isBn ? 'পরিমাণ (৳ BDT)' : 'Amount (৳ BDT)'}</label>
              <input className="inp" type="number" placeholder="e.g. 5000" value={bdtAmount} onChange={e => setBdtAmount(e.target.value)} />
            </div>
            <div className="input-wrap">
              <label className="input-label">{isBn ? 'লেনদেন ID' : 'Transaction ID'}</label>
              <input className="inp" placeholder="TXN123456789" value={bdtTxId} onChange={e => setBdtTxId(e.target.value)} />
            </div>
            <div style={{ fontSize: 12, color: 'var(--text2)', padding: '10px 12px', background: 'rgba(217,119,6,.07)', borderRadius: 10, border: '1px solid rgba(217,119,6,.2)' }}>
              <span style={{ display: 'flex', alignItems: 'flex-start', gap: 6 }}><Icons.AlertTriangle size={12} style={{ flexShrink: 0, marginTop: 1 }} /><span>{isBn ? 'পেমেন্ট পাঠানোর পর Transaction ID সংরক্ষণ করুন' : 'Save the Transaction ID after making payment'}</span></span>
            </div>
            <button className="btn btn-primary btn-full" onClick={submitBdt} disabled={submitting || !depositNumber} style={{ borderRadius: 14, padding: '14px 0', fontSize: 15 }}>
              {submitting ? (isBn ? 'প্রক্রিয়াকরণ...' : 'Processing...') : (isBn ? 'ডিপোজিট জমা দিন' : 'Submit Deposit')}
            </button>
          </div>
        )}

        {/* ── USDT Crypto flow ── */}
        {tab === 'usdt' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div style={{ fontSize: 13, color: 'var(--text2)', marginBottom: 2 }}>{isBn ? 'নেটওয়ার্ক বেছে নিন:' : 'Select Network:'}</div>
            {BLOCKCHAIN_OPTIONS.map(b => (
              <button key={b.value} onClick={() => setBlockchain(b.value)}
                style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 14px', borderRadius: 14, background: blockchain === b.value ? 'rgba(35,175,145,.08)' : 'var(--card)', border: `1px solid ${blockchain === b.value ? 'var(--accent)' : 'var(--border)'}`, cursor: 'pointer', transition: 'all .15s' }}>
                <ImgIcon src={b.icon} alt={b.label} size={32} fallback={b.short[0]} />
                <div style={{ flex: 1, textAlign: 'left' }}>
                  <div style={{ fontWeight: 700, fontSize: 14, color: blockchain === b.value ? 'var(--accent)' : 'var(--text)' }}>{b.label}</div>
                  {b.fee && <div style={{ fontSize: 11, color: 'var(--text2)' }}>{b.fee}</div>}
                </div>
                <div style={{ width: 20, height: 20, borderRadius: '50%', border: `2px solid ${blockchain === b.value ? 'var(--accent)' : 'var(--border)'}`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  {blockchain === b.value && <div style={{ width: 10, height: 10, borderRadius: '50%', background: 'var(--accent)' }} />}
                </div>
              </button>
            ))}

            {blockchain && cryptoAddr && (
              <div style={{ padding: 16, background: 'rgba(35,175,145,.07)', border: '1px solid rgba(35,175,145,.25)', borderRadius: 14, textAlign: 'center' }}>
                <div style={{ display: 'inline-block', background: '#fff', borderRadius: 12, padding: 10, boxShadow: '0 4px 16px rgba(0,0,0,.1)', marginBottom: 10 }}>
                  <QRCodeSVG value={cryptoAddr} size={160} level="H" imageSettings={{ src: `${BASE_URL}logo.png`, height: 34, width: 34, excavate: true }} />
                </div>
                <div style={{ fontFamily: 'monospace', fontSize: 12, wordBreak: 'break-all', fontWeight: 600, marginBottom: 8 }}>{cryptoAddr}</div>
                <div style={{ display: 'flex', justifyContent: 'center' }}>
                  <CopyButton text={cryptoAddr} showToast={showToast} label={isBn ? 'ঠিকানা কপি' : 'Copy Address'} copiedLabel={isBn ? 'কপি হয়েছে' : 'Copied'} />
                </div>
              </div>
            )}
            {blockchain && !cryptoAddr && (
              <div style={{ padding: 12, background: 'rgba(239,68,68,.08)', border: '1px solid rgba(239,68,68,.3)', borderRadius: 12, fontSize: 13, color: '#ef4444', textAlign: 'center' }}>
                {isBn ? 'এই নেটওয়ার্কের জন্য ওয়ালেট সেট করা হয়নি।' : 'No wallet configured for this network.'}
              </div>
            )}

            {blockchain && cryptoAddr && (
              <>
                <div className="input-wrap">
                  <label className="input-label">{isBn ? 'পরিমাণ ($ USDT)' : 'Amount ($ USDT)'}</label>
                  <input className="inp" type="number" placeholder="e.g. 50" value={cryptoAmount} onChange={e => setCryptoAmount(e.target.value)} />
                  {cryptoAmount && <div style={{ fontSize: 11, color: 'var(--accent)', marginTop: 4 }}>≈ ৳{Math.round(Number(cryptoAmount) * usdRate).toLocaleString()} BDT</div>}
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8, padding: '10px 12px', background: 'rgba(240,176,11,.07)', borderRadius: 10, border: '1px solid rgba(240,176,11,.2)', fontSize: 12, color: 'var(--text2)' }}>
                  <div style={{ fontWeight: 700, color: '#f0b90b', display: 'flex', alignItems: 'center', gap: 5 }}><Icons.AlertTriangle size={13} style={{ flexShrink: 0 }} /> {isBn ? 'গুরুত্বপূর্ণ নোট:' : 'Important Notes:'}</div>
                  {[
                    isBn ? 'শুধুমাত্র USDT পাঠান, অন্য কোনো কয়েন নয়।' : 'Send USDT only — other coins will not be credited.',
                    isBn ? 'ভুল নেটওয়ার্কে পাঠালে টাকা হারিয়ে যাবে।' : 'Sending to the wrong network will result in permanent loss.',
                    isBn ? 'স্মার্ট কন্ট্র্যাক্ট ডিপোজিট সাপোর্ট করে না।' : 'Smart-contract deposits are not supported.',
                  ].map((n, i) => <div key={i}>{i + 1}. {n}</div>)}
                </div>
                <button className="btn btn-primary btn-full" onClick={goToCryptoPaymentPage} style={{ borderRadius: 14, padding: '14px 0', fontSize: 15 }}>
                  {isBn ? 'USDT পাঠিয়েছি — নিশ্চিত করুন' : "I've Sent the USDT — Confirm"}
                </button>
              </>
            )}
          </div>
        )}
      </div>
    </Sheet>
  );
}

// ── Transfer Sheet ────────────────────────────────────────────────────────────
function TransferSheet({ onClose, user, setUser, showToast, lang, tErr, onSuccess }) {
  const t = I18N[lang] || I18N.en;
  const isBn = lang === 'bn';
  const [toId, setToId]     = useState('');
  const [amount, setAmount] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const doTransfer = async () => {
    if (user?.isGuest) { showToast(isBn ? 'গেস্ট অ্যাকাউন্টে ট্রান্সফার করা যায় না' : 'Guest accounts cannot transfer', 'error'); return; }
    if (!toId.trim() || !amount) { showToast(t.fill_all_fields); return; }
    const numAmt = Math.round(Number(amount));
    if (numAmt <= 0) { showToast(t.fill_all_fields); return; }
    if (numAmt > user.balance) { showToast(t.insufficient_balance); return; }
    setSubmitting(true);
    try {
      const res = await authFetch(`${API_URL}/api/transfer`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ toIdentifier: toId.trim(), amount: numAmt }) });
      const data = await res.json();
      if (res.ok) {
        if (data.senderBalance !== undefined) setUser(prev => ({ ...prev, balance: data.senderBalance }));
        showToast(isBn ? `৳${numAmt.toLocaleString()} সফলভাবে ট্রান্সফার হয়েছে!` : `৳${numAmt.toLocaleString()} transferred successfully!`);
        onSuccess && onSuccess();
        onClose();
      } else { showToast((tErr ? tErr(data.error) : data.error) || t.toast_request_failed); }
    } catch (_) { showToast(t.toast_connection_error); }
    setSubmitting(false);
  };

  return (
    <Sheet onClose={onClose}>
      <SheetHeader label={isBn ? 'ট্রান্সফার' : 'Transfer'} title={isBn ? 'ব্যালেন্স পাঠান' : 'Send Balance'} onClose={onClose} />
      <div style={{ overflowY: 'auto', padding: '16px 20px 32px', display: 'flex', flexDirection: 'column', gap: 14 }}>
        <div style={{ padding: 14, background: 'var(--card)', borderRadius: 14, border: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ width: 44, height: 44, borderRadius: '50%', background: 'rgba(35,175,145,.12)', border: '2px solid rgba(35,175,145,.3)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Icons.Transfer size={20} style={{ color: 'var(--accent)' }} />
          </div>
          <div>
            <div style={{ fontWeight: 700 }}>{isBn ? 'ব্যালেন্স ট্রান্সফার' : 'Balance Transfer'}</div>
            <div style={{ fontSize: 12, color: 'var(--accent)' }}>{isBn ? `উপলব্ধ: ৳${user.balance?.toLocaleString()}` : `Available: ৳${user.balance?.toLocaleString()}`}</div>
          </div>
        </div>
        <div className="input-wrap">
          <label className="input-label">{isBn ? 'প্রাপকের PhoneCraft ID বা নাম' : 'Recipient PhoneCraft ID or Name'}</label>
          <input className="inp" placeholder="e.g. PC-KRM22 or phone@mail" value={toId} onChange={e => setToId(e.target.value)} />
        </div>
        <div className="input-wrap">
          <label className="input-label">{isBn ? 'পরিমাণ (৳ BDT)' : 'Amount (৳ BDT)'}</label>
          <input className="inp" type="number" placeholder="e.g. 500" value={amount} onChange={e => setAmount(e.target.value)} />
        </div>
        <div style={{ fontSize: 12, color: 'var(--text2)', padding: '10px 12px', background: 'rgba(217,119,6,.07)', borderRadius: 10, border: '1px solid rgba(217,119,6,.2)' }}>
          <span style={{ display: 'flex', alignItems: 'flex-start', gap: 6 }}><Icons.AlertTriangle size={12} style={{ flexShrink: 0, marginTop: 1 }} /><span>{isBn ? 'ট্রান্সফার নিশ্চিত করুন। এটি পূর্বাবস্থায় ফিরানো যাবে না।' : 'Confirm before sending — transfers cannot be undone.'}</span></span>
        </div>
        <button className="btn btn-primary btn-full" onClick={doTransfer} disabled={submitting} style={{ borderRadius: 14, padding: '14px 0', fontSize: 15 }}>
          {submitting ? (isBn ? 'পাঠানো হচ্ছে...' : 'Sending...') : (isBn ? 'ট্রান্সফার করুন' : 'Send Transfer')}
        </button>
      </div>
    </Sheet>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// MAIN WalletScreen
// ══════════════════════════════════════════════════════════════════════════════
function WalletScreen({ user, setUser, showToast, lang, appSettings, tErr, usdRate = 122.80, onShowGuestPlanModal }) {
  const t = I18N[lang] || I18N.en;
  const isBn = lang === 'bn';

  const [transactions,    setTransactions   ] = useState([]);
  const [txLoading,       setTxLoading      ] = useState(false);
  const [depositInfo,     setDepositInfo    ] = useState({});
  const [txFilter,        setTxFilter       ] = useState('all'); // all | deposit | withdraw | transfer
  const [balanceHidden,   setBalanceHidden  ] = useState(false);
  const [showUSD,         setShowUSD        ] = useState(false);
  const [submissionCard,  setSubmissionCard ] = useState(null);
  const [paymentPage,     setPaymentPage    ] = useState(null);

  // Sheet visibility
  const [showWithdraw, setShowWithdraw] = useState(false);
  const [showDeposit,  setShowDeposit ] = useState(false);
  const [showTransfer, setShowTransfer] = useState(false);

  const refreshTx = () => {
    if (!user?.id) return;
    setTxLoading(true);
    authFetch(`${API_URL}/api/user/${user.id}/transactions`)
      .then(r => r.json())
      .then(d => { if (d.transactions) setTransactions(d.transactions); })
      .catch(() => {})
      .finally(() => setTxLoading(false));
  };

  useEffect(() => {
    authFetch(`${API_URL}/api/deposit-info`).then(r => r.json()).then(setDepositInfo).catch(() => {});
    refreshTx();
  }, [user?.id]);

  // Crypto confirm flow
  const confirmCryptoDeposit = async (page) => {
    const coinLabel = `USDT on ${BLOCKCHAIN_OPTIONS.find(b => b.value === page.blockchain)?.label || page.blockchain}`;
    try {
      const res = await authFetch(`${API_URL}/api/withdraw`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount: page.amount, method: 'crypto', account: page.walletAddr, type: 'deposit', coinType: coinLabel, blockchain: page.blockchain, token: 'usdt', txnHash: page.txId || '' }),
      });
      const data = await res.json();
      if (res.ok) {
        if (data.newBalance !== undefined) setUser(prev => ({ ...prev, balance: data.newBalance }));
        refreshTx(); setPaymentPage(null);
        if (data.autoVerified) {
          setSubmissionCard('deposit_auto');
        } else {
          setSubmissionCard('deposit');
          if (data.pendingReview) {
            showToast(isBn ? 'ডিপোজিট জমা হয়েছে — ম্যানুয়াল পর্যালোচনার জন্য পাঠানো হয়েছে।' : 'Deposit submitted — sent for manual review.');
          }
        }
      } else { showToast((tErr ? tErr(data.error) : data.error) || t.toast_request_failed); }
    } catch (_) { showToast(t.toast_connection_error); }
  };

  if (paymentPage) {
    return <PaymentPage page={paymentPage} onBack={() => setPaymentPage(null)} onConfirm={confirmCryptoDeposit} showToast={showToast} lang={lang} user={user} />;
  }

  const usdBalance = user.balance / usdRate;
  const balDisplay = balanceHidden ? '••••••' : (showUSD ? `$${usdBalance.toFixed(2)}` : `৳${user.balance?.toLocaleString()}`);

  const filteredTx = transactions.filter(tx => {
    if (txFilter === 'all') return true;
    if (txFilter === 'deposit') return tx.type === 'deposit';
    if (txFilter === 'withdraw') return tx.type === 'withdraw';
    if (txFilter === 'transfer') return tx.type === 'transfer_sent' || tx.type === 'transfer_received';
    return true;
  });

  const TX_FILTERS = [
    { key: 'all',      label: isBn ? 'সব' : 'All' },
    { key: 'deposit',  label: isBn ? 'ডিপোজিট' : 'Deposits' },
    { key: 'withdraw', label: isBn ? 'উইথড্র' : 'Withdrawals' },
    { key: 'transfer', label: isBn ? 'ট্রান্সফার' : 'Transfers' },
  ];

  const ACTION_BTNS = [
    { key: 'withdraw', icon: <Icons.Upload size={22} />,   label: isBn ? 'উইথড্র' : 'Withdraw', color: '#6366F1', onClick: () => setShowWithdraw(true) },
    { key: 'deposit',  icon: <Icons.Download size={22} />, label: isBn ? 'ডিপোজিট' : 'Deposit',  color: 'var(--accent)', onClick: () => setShowDeposit(true) },
    { key: 'transfer', icon: <Icons.Transfer size={22} />, label: isBn ? 'ট্রান্সফার' : 'Transfer', color: '#F0B90B', onClick: () => setShowTransfer(true) },
  ];

  const txIcon = (type) => {
    if (type === 'deposit') return <Icons.TrendUp size={20} />;
    if (type === 'transfer_sent' || type === 'transfer_received') return <Icons.Send size={20} />;
    return <Icons.Transfer size={20} />;
  };
  const txColor = (type) => type === 'deposit' || type === 'transfer_received' ? 'var(--green,#0ECB81)' : '#F6465D';
  const txLabel = (tx) => {
    if (tx.type === 'deposit') return isBn ? 'ডিপোজিট' : 'Deposit';
    if (tx.type === 'transfer_sent') return isBn ? 'ট্রান্সফার (পাঠানো)' : 'Transfer Sent';
    if (tx.type === 'transfer_received') return isBn ? 'ট্রান্সফার (প্রাপ্ত)' : 'Transfer Received';
    return isBn ? 'উইথড্র' : 'Withdrawal';
  };

  return (
    <>
      {submissionCard && <SubmissionCard type={submissionCard} lang={lang} onClose={() => { setSubmissionCard(null); refreshTx(); }} />}

      {showWithdraw && <WithdrawSheet onClose={() => setShowWithdraw(false)} user={user} setUser={setUser} showToast={showToast} lang={lang} appSettings={appSettings} tErr={tErr} usdRate={usdRate} onSuccess={(type) => { setSubmissionCard(type); refreshTx(); }} />}
      {showDeposit && <DepositSheet onClose={() => setShowDeposit(false)} user={user} setUser={setUser} showToast={showToast} lang={lang} appSettings={appSettings} tErr={tErr} usdRate={usdRate} depositInfo={depositInfo} onSuccess={(type) => { setSubmissionCard(type); refreshTx(); }} onShowPaymentPage={setPaymentPage} />}
      {showTransfer && <TransferSheet onClose={() => setShowTransfer(false)} user={user} setUser={setUser} showToast={showToast} lang={lang} tErr={tErr} onSuccess={refreshTx} />}

      {/* ── Balance Card ─────────────────────────────────────────────────── */}
      <div className="card" style={{ background: 'linear-gradient(135deg,rgba(35,175,145,.12) 0%,rgba(99,102,241,.08) 100%)', border: '1px solid rgba(35,175,145,.25)', borderRadius: 20, padding: '20px 20px 16px', marginBottom: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
          <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1, color: 'var(--text2)' }}>
            {isBn ? 'উপলব্ধ ব্যালেন্স' : 'Available Balance'}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            {/* BDT / USD toggle */}
            <button onClick={() => setShowUSD(v => !v)}
              style={{ fontSize: 11, fontWeight: 700, padding: '3px 10px', borderRadius: 20, border: '1px solid var(--border)', background: 'var(--input-bg)', cursor: 'pointer', color: 'var(--text2)' }}>
              {showUSD ? 'USD' : 'BDT'}
            </button>
            <button onClick={() => setBalanceHidden(v => !v)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text2)', display: 'flex', padding: 4 }}>
              {balanceHidden ? <Icons.Eye size={16} /> : <Icons.EyeOff size={16} />}
            </button>
          </div>
        </div>
        <div style={{ fontFamily: 'Space Grotesk', fontSize: 'clamp(26px,7vw,36px)', fontWeight: 900, color: 'var(--accent)', marginBottom: 4, letterSpacing: -1 }}>
          {balDisplay}
        </div>
        {!balanceHidden && showUSD && (
          <div style={{ fontSize: 12, color: 'var(--text2)' }}>৳{user.balance?.toLocaleString()} BDT</div>
        )}
        {!balanceHidden && !showUSD && (
          <div style={{ fontSize: 12, color: 'var(--text2)' }}>≈ ${usdBalance.toFixed(2)} USD &nbsp;·&nbsp; 1 USD = ৳{Number(usdRate).toFixed(2)}</div>
        )}

        {/* Guest warning */}
        {user?.isGuest && (
          <div style={{ marginTop: 12, padding: '10px 12px', background: 'rgba(246,70,93,.08)', border: '1px solid rgba(246,70,93,.3)', borderRadius: 10, display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ display: 'flex', alignItems: 'center', color: '#F6465D' }}><Icons.Lock size={15} /></span>
            <div style={{ fontSize: 12, color: '#F6465D' }}>{isBn ? 'গেস্ট অ্যাকাউন্টে উইথড্র সীমাবদ্ধ' : 'Withdrawals unavailable for guest accounts'}</div>
          </div>
        )}

        {/* Action Buttons */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 10, marginTop: 20 }}>
          {ACTION_BTNS.map(btn => (
            <button key={btn.key} onClick={btn.onClick}
              style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, padding: '14px 8px', borderRadius: 16, border: 'none', background: 'var(--card)', cursor: 'pointer', transition: 'all .2s' }}>
              <div style={{ width: 46, height: 46, borderRadius: '50%', background: `${btn.color}1A`, border: `1.5px solid ${btn.color}4D`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: btn.color }}>
                {btn.icon}
              </div>
              <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--text2)' }}>{btn.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* ── Transaction History ───────────────────────────────────────────── */}
      <div className="card" style={{ borderRadius: 20 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
          <div className="card-title" style={{ margin: 0 }}>{isBn ? 'লেনদেনের ইতিহাস' : 'Transaction History'}</div>
          <button onClick={refreshTx} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text2)', display: 'flex', padding: 4 }}>
            <Icons.Refresh size={16} />
          </button>
        </div>

        {/* Filter pills */}
        <div style={{ display: 'flex', gap: 6, marginBottom: 14, overflowX: 'auto', paddingBottom: 2 }}>
          {TX_FILTERS.map(f => (
            <button key={f.key} onClick={() => setTxFilter(f.key)}
              style={{ padding: '6px 14px', borderRadius: 20, fontSize: 12, fontWeight: 600, border: 'none', cursor: 'pointer', flexShrink: 0, whiteSpace: 'nowrap', transition: 'all .2s', background: txFilter === f.key ? 'var(--accent)' : 'var(--input-bg)', color: txFilter === f.key ? '#fff' : 'var(--text2)' }}>
              {f.label}
            </button>
          ))}
        </div>

        {txLoading ? (
          <div style={{ textAlign: 'center', padding: 24, color: 'var(--text2)', fontSize: 13 }}>{t.loading}</div>
        ) : filteredTx.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '28px 0', color: 'var(--text2)' }}>
            <Icons.Coin size={36} style={{ opacity: .3, marginBottom: 8, display: 'block', margin: '0 auto 8px' }} />
            <div style={{ fontSize: 13 }}>{t.no_transactions || (isBn ? 'কোনো লেনদেন নেই' : 'No transactions yet')}</div>
          </div>
        ) : (
          filteredTx.map((tx, i) => (
            <div key={tx.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 0', borderBottom: i < filteredTx.length - 1 ? '1px solid var(--border)' : 'none' }}>
              <div style={{ width: 40, height: 40, borderRadius: '50%', background: `${txColor(tx.type)}15`, border: `1.5px solid ${txColor(tx.type)}40`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: txColor(tx.type), flexShrink: 0 }}>
                {txIcon(tx.type)}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
                  <span style={{ fontWeight: 700, fontSize: 13 }}>{txLabel(tx)}</span>
                  {tx.admin_note === 'auto-verified' && (
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 3, background: 'rgba(35,175,145,.12)', border: '1px solid rgba(35,175,145,.35)', borderRadius: 10, padding: '1px 7px', fontSize: 9, fontWeight: 700, color: 'var(--accent)', flexShrink: 0 }}>
                      ⚡ {isBn ? 'অটো যাচাই' : 'Auto Verified'}
                    </span>
                  )}
                </div>
                <div style={{ fontSize: 11, color: 'var(--text2)', marginTop: 2 }}>
                  {tx.method?.toUpperCase()} · {tx.created_at ? new Date(tx.created_at + 'Z').toLocaleDateString() : ''}
                </div>
                {tx.admin_note && tx.admin_note !== 'auto-verified' && (
                  <div style={{ fontSize: 11, color: 'var(--yellow)', marginTop: 3 }}>
                    <Icons.Note size={11} /> {tx.admin_note}
                  </div>
                )}
              </div>
              <div style={{ textAlign: 'right', flexShrink: 0 }}>
                <div style={{ fontWeight: 800, fontSize: 14, color: txColor(tx.type) }}>
                  {tx.type === 'deposit' || tx.type === 'transfer_received' ? '+' : '-'}৳{Number(tx.amount).toLocaleString()}
                </div>
                <span className={`badge ${tx.status === 'approved' ? 'badge-green' : tx.status === 'rejected' ? 'badge-orange' : 'badge-blue'}`} style={{ fontSize: 10, marginTop: 4, display: 'inline-block' }}>
                  {tx.status === 'approved' ? (isBn ? 'অনুমোদিত' : 'Approved') : tx.status === 'rejected' ? (isBn ? 'বাতিল' : 'Rejected') : (isBn ? 'অপেক্ষমান' : 'Pending')}
                </span>
              </div>
            </div>
          ))
        )}
      </div>
    </>
  );
}

export default WalletScreen;
