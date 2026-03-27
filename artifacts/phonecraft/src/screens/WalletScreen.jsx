import { useState, useEffect, useRef } from "react";
import { QRCodeSVG } from "qrcode.react";
import Icons from "../Icons.jsx";
import { I18N } from "../i18n.js";
import { convertCurrency } from "../currency.js";
import { authFetch } from "../session.js";

const API_URL = import.meta.env.VITE_API_URL || '';
const BASE_URL = import.meta.env.BASE_URL || '/';

const BLOCKCHAIN_OPTIONS = [
  { value: 'eth',      label: 'Ethereum',  short: 'ETH',  icon: 'https://assets.coingecko.com/coins/images/279/small/ethereum.png' },
  { value: 'op',       label: 'Optimism',  short: 'OP',   icon: 'https://assets.coingecko.com/coins/images/25244/small/Optimism.png' },
  { value: 'base',     label: 'Base',      short: 'BASE', icon: 'https://assets.coingecko.com/asset_platforms/images/131/small/base.jpeg' },
  { value: 'polygon',  label: 'Polygon',   short: 'POL',  icon: 'https://assets.coingecko.com/coins/images/4713/small/matic-token-icon.png' },
  { value: 'arbitrum', label: 'Arbitrum',  short: 'ARB',  icon: 'https://assets.coingecko.com/coins/images/16547/small/photo_2023-03-29_21.47.00.jpeg' },
];

const TOKEN_OPTIONS = [
  { value: 'usdt', label: 'USDT', icon: 'https://assets.coingecko.com/coins/images/325/small/Tether.png', color: '#26A17B' },
  { value: 'usdc', label: 'USDC', icon: 'https://assets.coingecko.com/coins/images/6319/small/usdc.png',  color: '#2775CA' },
];

const PAYMENT_OPTIONS = [
  { value: 'crypto', label: 'Crypto', logo: `${BASE_URL}crypto-logo.png`,                                                    bg: '#00D2B4', text: '#111', letter: 'C' },
  { value: 'bkash',  label: 'bKash',  logo: 'https://cdn.brandfetch.io/id_4D40okd/w/400/h/400/theme/dark/icon.jpeg',        bg: '#E2136E', text: '#fff', letter: 'b' },
  { value: 'nagad',  label: 'Nagad',  logo: 'https://cdn.brandfetch.io/idPKXOsXfF/w/512/h/512/theme/dark/logo.png',          bg: '#F05A28', text: '#fff', letter: 'N' },
  { value: 'rocket', label: 'Rocket', logo: `${BASE_URL}rocket-logo.png`,                                                    bg: '#8B2FC9', text: '#fff', letter: 'R' },
];

const COMING_SOON_DEPOSIT  = new Set(['bkash', 'nagad', 'rocket']);
const COMING_SOON_WITHDRAW = new Set(['rocket']);

function ImgIcon({ src, alt, size = 28, fallback, fallbackBg = '#555', fallbackColor = '#fff' }) {
  const [err, setErr] = useState(false);
  if (!src || err) {
    return (
      <span style={{ width: size, height: size, borderRadius: '50%', background: fallbackBg, color: fallbackColor, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: size * 0.45, fontWeight: 800, flexShrink: 0 }}>
        {fallback}
      </span>
    );
  }
  return <img src={src} alt={alt} width={size} height={size} style={{ borderRadius: '50%', objectFit: 'cover', flexShrink: 0 }} onError={() => setErr(true)} />;
}

function CopyButton({ text, showToast }) {
  const [copied, setCopied] = useState(false);
  const handleCopy = async () => {
    try { await navigator.clipboard.writeText(text); setCopied(true); showToast('Copied!'); setTimeout(() => setCopied(false), 2000); }
    catch { showToast('Copy failed'); }
  };
  return (
    <button type="button" onClick={handleCopy} style={{ background: copied ? 'rgba(0,210,180,.15)' : 'var(--input-bg)', border: `1px solid ${copied ? 'var(--accent)' : 'var(--border)'}`, borderRadius: 8, padding: '6px 12px', cursor: 'pointer', fontSize: 12, fontWeight: 600, color: copied ? 'var(--accent)' : 'var(--text2)', display: 'flex', alignItems: 'center', gap: 4, transition: 'all .2s', flexShrink: 0 }}>
      {copied ? <Icons.CheckCircle size={13}/> : <Icons.Copy size={13}/>}
      {copied ? 'Copied' : 'Copy'}
    </button>
  );
}

// ── Payment Confirmation Page ──────────────────────────────────────────────────
function PaymentPage({ page, onBack, onConfirm, showToast, lang, user }) {
  const t = I18N[lang] || I18N.en;
  const [txId, setTxId] = useState('');
  const [confirming, setConfirming] = useState(false);
  const [timer, setTimer] = useState(3600);
  const timerRef = useRef(null);

  useEffect(() => {
    timerRef.current = setInterval(() => setTimer(p => p > 0 ? p - 1 : 0), 1000);
    return () => clearInterval(timerRef.current);
  }, []);

  const fmtTimer = (s) => `${String(Math.floor(s/3600)).padStart(2,'0')}:${String(Math.floor((s%3600)/60)).padStart(2,'0')}:${String(s%60).padStart(2,'0')}`;

  const payOpt = PAYMENT_OPTIONS.find(p => p.value === page.method) || PAYMENT_OPTIONS[0];
  const amtDisplay = page.tab === 'deposit'
    ? (lang === 'bn' ? `৳${page.amount}` : `$${page.cryptoAmount || page.amount}`)
    : (lang === 'bn' ? `৳${page.amount}` : `$${page.amount}`);

  const handleConfirm = async () => {
    if (page.tab === 'deposit' && page.method === 'crypto' && !txId.trim()) {
      showToast(lang === 'bn' ? 'Transaction ID/Hash দিন' : 'Enter Transaction ID/Hash'); return;
    }
    setConfirming(true);
    await onConfirm({ ...page, txId });
    setConfirming(false);
  };

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <div style={{ background: 'linear-gradient(135deg,#0f4c3a,#1a7a5e)', padding: '16px 16px 20px', position: 'relative' }}>
        <button onClick={onBack} style={{ background: 'rgba(255,255,255,.15)', border: 'none', borderRadius: 8, padding: '6px 10px', color: '#fff', cursor: 'pointer', fontSize: 13, display: 'flex', alignItems: 'center', gap: 6, marginBottom: 12 }}>
          ← {lang === 'bn' ? 'ফিরে যান' : 'Back'}
        </button>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <div style={{ fontSize: 11, color: 'rgba(255,255,255,.7)', marginBottom: 4, textTransform: 'uppercase', letterSpacing: 1 }}>
              {page.tab === 'deposit' ? (lang === 'bn' ? 'ডিপোজিট' : 'DEPOSIT') : (lang === 'bn' ? 'উইথড্র' : 'WITHDRAW')}
            </div>
            <div style={{ fontSize: 28, fontWeight: 800, color: '#fff', fontFamily: 'Space Grotesk' }}>
              {amtDisplay}
            </div>
            <div style={{ fontSize: 11, color: 'rgba(255,255,255,.6)', marginTop: 4 }}>
              {lang === 'bn' ? 'কম বা বেশি পাঠাবেন না' : 'Send exact amount only'}
            </div>
          </div>
          <div style={{ background: 'rgba(255,255,255,.15)', borderRadius: 10, padding: '8px 14px', textAlign: 'center' }}>
            <div style={{ fontSize: 9, fontWeight: 800, color: '#fff', letterSpacing: 2, textTransform: 'uppercase' }}>PAY</div>
            <div style={{ fontSize: 10, fontWeight: 700, color: 'rgba(255,255,255,.8)' }}>SERVICE</div>
          </div>
        </div>
      </div>

      <div style={{ padding: '16px 16px 100px', flex: 1 }}>
        {/* Warning */}
        <div style={{ background: 'rgba(239,68,68,.08)', border: '1px solid rgba(239,68,68,.3)', borderRadius: 10, padding: '10px 14px', marginBottom: 16, fontSize: 12, color: '#ef4444', fontWeight: 600 }}>
          ⚠️ {lang === 'bn' ? `আপনি যদি টাকার পরিমাণ পরিবর্তন করেন (${amtDisplay}), আপনি ক্রেডিট পেতে সক্ষম হবেন না।` : `If you change the amount (${amtDisplay}), you will not receive credit.`}
        </div>

        {/* Wallet Address */}
        {page.walletAddr && (
          <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 14, padding: 16, marginBottom: 16 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
              <div>
                <div style={{ fontSize: 11, color: 'var(--text2)', marginBottom: 4 }}>
                  {lang === 'bn' ? 'ওয়ালেট নম্বর' : 'Wallet No'} *
                </div>
                <div style={{ fontSize: 11, color: 'var(--text2)' }}>
                  {lang === 'bn' ? 'শুধুমাত্র এই নম্বরে পাঠান' : 'Send only to this address'}
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: payOpt.bg, borderRadius: 10, padding: '8px 12px' }}>
                <ImgIcon src={payOpt.logo} alt={payOpt.label} size={24} fallback={payOpt.letter} fallbackBg="rgba(255,255,255,.3)" fallbackColor="#fff"/>
                <span style={{ fontSize: 11, fontWeight: 700, color: '#fff' }}>{payOpt.label}</span>
              </div>
            </div>

            {/* QR Code with Logo */}
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 14 }}>
              <div style={{ background: '#fff', borderRadius: 16, padding: 14, boxShadow: '0 4px 20px rgba(0,0,0,.15)' }}>
                <QRCodeSVG
                  value={page.walletAddr}
                  size={180}
                  level="H"
                  imageSettings={{ src: `${BASE_URL}logo.png`, height: 40, width: 40, excavate: true }}
                />
              </div>
            </div>

            {/* Address */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{ background: 'var(--input-bg)', border: '1px solid var(--border)', borderRadius: 8, padding: '10px 12px', fontFamily: 'monospace', fontSize: 12, fontWeight: 600, flex: 1, wordBreak: 'break-all', letterSpacing: .3 }}>
                {page.walletAddr}
              </div>
              <CopyButton text={page.walletAddr} showToast={showToast}/>
            </div>
          </div>
        )}

        {/* Blockchain + Token info */}
        {page.method === 'crypto' && page.blockchain && page.token && (
          <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
            {[BLOCKCHAIN_OPTIONS.find(b => b.value === page.blockchain), TOKEN_OPTIONS.find(t => t.value === page.token)].filter(Boolean).map((item, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'var(--input-bg)', border: '1px solid var(--border)', borderRadius: 8, padding: '8px 12px', flex: 1 }}>
                <ImgIcon src={item.icon} alt={item.label || item.short} size={20} fallback={(item.short || item.label)[0]} fallbackBg={item.color || '#555'} fallbackColor="#fff"/>
                <span style={{ fontSize: 12, fontWeight: 700 }}>{item.label || item.short}</span>
              </div>
            ))}
          </div>
        )}

        {/* Order Details */}
        <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 14, padding: 16, marginBottom: 16 }}>
          <div style={{ fontWeight: 700, fontSize: 13, marginBottom: 12 }}>
            <Icons.Note size={14}/> {lang === 'bn' ? 'অর্ডার বিবরণ' : 'Order Details'}
          </div>
          {[
            { label: lang === 'bn' ? 'ধরন' : 'Type', value: page.tab === 'deposit' ? (lang === 'bn' ? 'ডিপোজিট' : 'Deposit') : (lang === 'bn' ? 'উইথড্র' : 'Withdraw') },
            { label: lang === 'bn' ? 'পরিমাণ' : 'Amount', value: amtDisplay, accent: true },
            { label: lang === 'bn' ? 'পদ্ধতি' : 'Method', value: page.method?.toUpperCase() },
            { label: lang === 'bn' ? 'সময়' : 'Time', value: new Date().toLocaleString() },
            { label: lang === 'bn' ? 'মেয়াদ' : 'Expires in', value: fmtTimer(timer), timer: true },
          ].map(({ label, value, accent, timer: isTimer }) => (
            <div key={label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0', borderBottom: '1px solid var(--border)' }}>
              <span style={{ fontSize: 12, color: 'var(--text2)' }}>{label}</span>
              <span style={{ fontSize: 12, fontWeight: 700, color: accent ? 'var(--accent)' : isTimer ? '#f59e0b' : 'var(--text)' }}>{value}</span>
            </div>
          ))}
        </div>

        {/* TxID input (for deposit proof) */}
        {page.tab === 'deposit' && page.method === 'crypto' && (
          <div className="input-wrap" style={{ marginBottom: 16 }}>
            <label className="input-label">
              {lang === 'bn' ? 'Transaction Hash/ID লিখুন (প্রয়োজন)' : 'Enter Transaction Hash/ID (Required)'}
            </label>
            <input
              className="inp"
              placeholder={lang === 'bn' ? 'Tx Hash অবশ্যই পূরণ করতে হবে!' : 'Transaction hash is required!'}
              value={txId}
              onChange={e => setTxId(e.target.value)}
              style={{ borderColor: !txId.trim() ? 'rgba(239,68,68,.5)' : 'var(--border)' }}
            />
          </div>
        )}

        {/* Warning */}
        <div style={{ background: 'rgba(239,68,68,.06)', border: '1px solid rgba(239,68,68,.2)', borderRadius: 10, padding: '10px 14px', marginBottom: 20, fontSize: 11, color: 'var(--text2)' }}>
          <div style={{ fontWeight: 700, color: '#ef4444', marginBottom: 4 }}>
            {lang === 'bn' ? 'সতর্কতা:' : 'Warning:'}
          </div>
          {lang === 'bn'
            ? 'লেনদেন আইডি সঠিকভাবে পূরণ করতে হবে, অন্যথায় স্কোর বাতিল হবে!'
            : 'Transaction ID must be filled correctly, otherwise the order will be cancelled!'}
        </div>

        {/* Confirm Button */}
        <button
          className="btn btn-primary btn-full"
          onClick={handleConfirm}
          disabled={confirming}
          style={{ fontSize: 15, padding: '14px 0', borderRadius: 12 }}
        >
          {confirming
            ? (lang === 'bn' ? 'প্রক্রিয়াকরণ...' : 'Processing...')
            : page.tab === 'deposit'
              ? (lang === 'bn' ? '✓ নিশ্চিত করুন' : '✓ Confirm Deposit')
              : (lang === 'bn' ? '✓ উইথড্র নিশ্চিত করুন' : '✓ Confirm Withdraw')}
        </button>
      </div>
    </div>
  );
}

// ── Main WalletScreen ──────────────────────────────────────────────────────────
function WalletScreen({ user, setUser, showToast, lang, appSettings, tErr, usdRate = 122.80 }) {
  const t = I18N[lang] || I18N.en;
  const isBn = lang === 'bn';
  const cryptoEnabled = appSettings?.crypto_enabled !== 'false';

  const [tab,        setTab      ] = useState('withdraw');
  const [amount,     setAmount   ] = useState('');
  const [method,     setMethod   ] = useState('crypto');
  const [acct,       setAcct     ] = useState('');
  const [submitted,  setSubmitted] = useState(false);
  const [screenshot, setScreenshot] = useState(null);
  const [paymentPage, setPaymentPage] = useState(null);

  const [depositInfo,  setDepositInfo ] = useState({});
  const [transactions, setTransactions] = useState([]);
  const [txLoading,    setTxLoading   ] = useState(false);
  const [rotatingWallet, setRotatingWallet] = useState('');

  const [blockchain,   setBlockchain  ] = useState('');
  const [token,        setToken       ] = useState('');
  const [txnHash,      setTxnHash     ] = useState('');
  const [cryptoAmount, setCryptoAmount] = useState('');
  const [cryptoWithdrawWallet, setCryptoWithdrawWallet] = useState('');

  useEffect(() => {
    authFetch(`${API_URL}/api/deposit-info`)
      .then(r => r.json())
      .then(data => setDepositInfo(data))
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (!user?.id) return;
    setTxLoading(true);
    authFetch(`${API_URL}/api/user/${user.id}/transactions`)
      .then(r => r.json())
      .then(data => { if (data.transactions) setTransactions(data.transactions); })
      .catch(() => {})
      .finally(() => setTxLoading(false));
  }, [user?.id]);

  useEffect(() => {
    if (!cryptoEnabled && method === 'crypto') setMethod('bkash');
  }, [cryptoEnabled, method]);

  useEffect(() => {
    const comingSoonSet = tab === 'deposit' ? COMING_SOON_DEPOSIT : COMING_SOON_WITHDRAW;
    if (comingSoonSet.has(method)) setMethod('crypto');
  }, [tab]);

  useEffect(() => {
    setBlockchain(''); setToken('');
  }, [tab, method]);

  // Fetch rotating wallet when crypto deposit + blockchain + token selected
  useEffect(() => {
    if (method === 'crypto' && tab === 'deposit' && blockchain && token) {
      authFetch(`${API_URL}/api/deposit/next-wallet`)
        .then(r => r.json())
        .then(d => { if (d.wallet) setRotatingWallet(d.wallet); else setRotatingWallet(''); })
        .catch(() => setRotatingWallet(''));
    } else {
      setRotatingWallet('');
    }
  }, [method, tab, blockchain, token]);

  const visiblePaymentOptions = cryptoEnabled
    ? PAYMENT_OPTIONS
    : PAYMENT_OPTIONS.filter(o => o.value !== 'crypto');

  const isComingSoon = (val) =>
    tab === 'deposit' ? COMING_SOON_DEPOSIT.has(val) : COMING_SOON_WITHDRAW.has(val);

  const isCrypto      = method === 'crypto';
  const cryptoKey     = `crypto_${blockchain}_${token}`;
  const cryptoAddr    = depositInfo[cryptoKey] || rotatingWallet || '';
  const selectedChain = BLOCKCHAIN_OPTIONS.find(b => b.value === blockchain);
  const selectedToken = TOKEN_OPTIONS.find(tk => tk.value === token);

  const amountLabel       = isBn ? t.amount_label : 'Amount ($ USD)';
  const amountPlaceholder = isBn ? t.enter_amount : '$ Enter USD amount';

  const depositNumber = { bkash: depositInfo.bkash, nagad: depositInfo.nagad, rocket: depositInfo.rocket }[method] || '';

  // ── Submit — shows payment page first for deposits ──────────────────────────
  const submit = async () => {
    if (isCrypto) {
      if (!blockchain || !token) { showToast(isBn ? 'Blockchain ও Token বেছে নিন' : 'Select Blockchain and Token'); return; }

      if (tab === 'deposit') {
        if (!cryptoAmount) { showToast(t.fill_all_fields); return; }
        const walletToUse = rotatingWallet || cryptoAddr;
        if (!walletToUse) { showToast(isBn ? 'কোনো wallet address সেট করা নেই' : 'No wallet address configured'); return; }
        // Show payment page
        setPaymentPage({
          tab, method, blockchain, token,
          amount: isBn ? cryptoAmount : Math.round(Number(cryptoAmount) * usdRate),
          cryptoAmount, walletAddr: walletToUse,
        });
        return;
      }

      // Crypto Withdraw
      if (!cryptoWithdrawWallet.trim() || !cryptoAmount) { showToast(t.fill_all_fields); return; }
      const wAmt = isBn ? Number(cryptoAmount) : Math.round(Number(cryptoAmount) * usdRate);
      if (wAmt > user.balance) { showToast(t.insufficient_balance); return; }
      setSubmitted(true);
      try {
        const res = await authFetch(`${API_URL}/api/withdraw`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userId: user.id, user: user.name, identifier: user.identifier,
            amount: wAmt, method: 'crypto',
            account: cryptoWithdrawWallet.trim(), type: 'withdraw',
            blockchain, token, txnHash: '',
          }),
        });
        const data = await res.json();
        if (res.ok) {
          showToast(`${t.withdraw} ${t.request_sent}`);
          if (data.newBalance !== undefined) setUser(prev => ({ ...prev, balance: data.newBalance }));
          authFetch(`${API_URL}/api/user/${user.id}/transactions`).then(r => r.json()).then(d => { if (d.transactions) setTransactions(d.transactions); }).catch(() => {});
        } else { showToast((tErr ? tErr(data.error) : data.error) || t.toast_request_failed); }
      } catch (_) { showToast(t.toast_connection_error); }
      setTimeout(() => setSubmitted(false), 3000);
      setCryptoAmount(''); setCryptoWithdrawWallet('');
      return;
    }

    // Fiat deposit
    if (tab === 'deposit') {
      if (!amount) { showToast(t.fill_all_fields); return; }
      if (!depositNumber) { showToast(isBn ? 'Deposit number সেট করা নেই' : 'Deposit number not configured'); return; }
      setPaymentPage({ tab, method, amount, walletAddr: depositNumber });
      return;
    }

    // Fiat Withdraw
    if (!amount || !acct) { showToast(t.fill_all_fields); return; }
    if (parseInt(amount) > user.balance) { showToast(t.insufficient_balance); return; }
    setSubmitted(true);
    try {
      const res = await authFetch(`${API_URL}/api/withdraw`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.id, user: user.name, identifier: user.identifier, amount, method, account: acct, type: tab }),
      });
      const data = await res.json();
      if (res.ok) {
        showToast(`${t.withdraw} ${t.request_sent}`);
        if (data.newBalance !== undefined) setUser(prev => ({ ...prev, balance: data.newBalance }));
        authFetch(`${API_URL}/api/user/${user.id}/transactions`).then(r => r.json()).then(d => { if (d.transactions) setTransactions(d.transactions); }).catch(() => {});
      } else { showToast((tErr ? tErr(data.error) : data.error) || t.toast_request_failed); }
    } catch (_) { showToast(t.toast_connection_error); }
    setTimeout(() => setSubmitted(false), 3000);
    setAmount(''); setAcct('');
  };

  // ── Confirm from payment page ────────────────────────────────────────────────
  const confirmPayment = async (page) => {
    const isBnAmt = isBn;
    if (page.method === 'crypto' && page.tab === 'deposit') {
      const coinLabel = `${page.token?.toUpperCase()} on ${BLOCKCHAIN_OPTIONS.find(b => b.value === page.blockchain)?.label || page.blockchain}`;
      try {
        const res = await authFetch(`${API_URL}/api/withdraw`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userId: user.id, user: user.name, identifier: user.identifier,
            amount: page.amount, method: 'crypto',
            account: page.walletAddr, type: 'deposit', coinType: coinLabel,
            blockchain: page.blockchain, token: page.token, txnHash: page.txId || '',
            screenshot: screenshot || null,
          }),
        });
        const data = await res.json();
        if (res.ok) {
          showToast(`${t.deposit} ${t.request_sent}`);
          if (data.newBalance !== undefined) setUser(prev => ({ ...prev, balance: data.newBalance }));
          authFetch(`${API_URL}/api/user/${user.id}/transactions`).then(r => r.json()).then(d => { if (d.transactions) setTransactions(d.transactions); }).catch(() => {});
          setPaymentPage(null); setCryptoAmount(''); setTxnHash(''); setScreenshot(null);
        } else {
          showToast((tErr ? tErr(data.error) : data.error) || t.toast_request_failed);
        }
      } catch (_) { showToast(t.toast_connection_error); }
    } else {
      // Fiat deposit
      try {
        const res = await authFetch(`${API_URL}/api/withdraw`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId: user.id, user: user.name, identifier: user.identifier, amount: page.amount, method: page.method, account: page.walletAddr, type: 'deposit' }),
        });
        const data = await res.json();
        if (res.ok) {
          showToast(`${t.deposit} ${t.request_sent}`);
          if (data.newBalance !== undefined) setUser(prev => ({ ...prev, balance: data.newBalance }));
          authFetch(`${API_URL}/api/user/${user.id}/transactions`).then(r => r.json()).then(d => { if (d.transactions) setTransactions(d.transactions); }).catch(() => {});
          setPaymentPage(null); setAmount(''); setAcct('');
        } else { showToast((tErr ? tErr(data.error) : data.error) || t.toast_request_failed); }
      } catch (_) { showToast(t.toast_connection_error); }
    }
  };

  // Show payment page if active
  if (paymentPage) {
    return (
      <PaymentPage
        page={paymentPage}
        onBack={() => setPaymentPage(null)}
        onConfirm={confirmPayment}
        showToast={showToast}
        lang={lang}
        user={user}
      />
    );
  }

  return (
    <>
      <div className="screen-title"><Icons.Wallet size={18}/> {t.withdraw_deposit}</div>
      <div className="tabs">
        <div className={`tab ${tab==='withdraw'?'active':''}`} onClick={() => setTab('withdraw')}>
          <Icons.Transfer size={14}/> {t.withdraw}
        </div>
        <div className={`tab ${tab==='deposit'?'active':''}`} onClick={() => setTab('deposit')}>
          <Icons.Coin size={14}/> {t.deposit}
        </div>
      </div>

      <div className="card">
        {/* Balance */}
        <div style={{ background:'var(--input-bg)', border:'1px solid var(--border)', borderRadius:10, padding:14, marginBottom:16, textAlign:'center' }}>
          <div style={{ fontSize:11, color:'var(--text2)', marginBottom:6 }}>{t.avail_balance}</div>
          <div style={{ fontFamily:'Space Grotesk', fontSize:'clamp(20px,5vw,28px)', color:'var(--accent)', display:'flex', alignItems:'center', justifyContent:'center', gap:8 }}>
            <Icons.Coin size={22}/>{convertCurrency(user.balance, lang)}
          </div>
          <div style={{ fontSize:11, color:'var(--text2)', marginTop:6, display:'flex', alignItems:'center', justifyContent:'center', gap:4 }}>
            <span>💱</span>
            <span>1 USD = <b style={{ color:'var(--accent)' }}>৳{Number(usdRate).toFixed(2)}</b> BDT</span>
          </div>
        </div>

        {/* Payment Method Grid */}
        <div className="input-wrap">
          <label className="input-label">{t.payment_method}</label>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:8 }}>
            {visiblePaymentOptions.map(opt => {
              const isActive = method === opt.value;
              const cs = isComingSoon(opt.value);
              return (
                <button type="button" key={opt.value} onClick={() => { if (!cs) setMethod(opt.value); }}
                  style={{ display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', gap:4, padding:'10px 2px', borderRadius:12, position:'relative', border:`2px solid ${isActive ? 'var(--accent)' : cs ? 'rgba(255,255,255,.08)' : 'var(--border)'}`, background:isActive?'rgba(0,210,180,.1)':cs?'rgba(255,255,255,.03)':'var(--input-bg)', cursor:cs?'default':'pointer', transition:'all .2s', opacity:cs?0.55:1 }}>
                  <ImgIcon src={opt.logo} alt={opt.label} size={28} fallback={opt.letter} fallbackBg={opt.bg} fallbackColor={opt.text}/>
                  <span style={{ fontSize:9, fontWeight:700, letterSpacing:.2, color:isActive?'var(--accent)':'var(--text2)', lineHeight:1 }}>{opt.label}</span>
                  {cs && <span style={{ position:'absolute', bottom:3, left:'50%', transform:'translateX(-50%)', fontSize:7, fontWeight:800, letterSpacing:.3, whiteSpace:'nowrap', background:'rgba(217,119,6,.85)', color:'#fff', borderRadius:4, padding:'1px 4px' }}>SOON</span>}
                </button>
              );
            })}
          </div>
        </div>

        {/* Non-crypto deposit instruction */}
        {!isCrypto && tab === 'deposit' && depositNumber && (
          <div style={{ background:'rgba(0,210,180,.07)', border:'1px solid rgba(0,210,180,.25)', borderRadius:10, padding:'12px 14px', marginBottom:14 }}>
            <div style={{ fontSize:11, fontWeight:700, color:'var(--accent)', marginBottom:6, textTransform:'uppercase', letterSpacing:.5 }}>
              <Icons.Upload size={13}/> {t.wallet_deposit_send_here}
            </div>
            <div style={{ display:'flex', alignItems:'center', gap:10 }}>
              <span style={{ background:'var(--input-bg)', border:'1px solid var(--border)', borderRadius:8, padding:'8px 14px', fontFamily:'monospace', fontSize:16, fontWeight:700, letterSpacing:1, flex:1, textAlign:'center' }}>
                {method.toUpperCase()}: {depositNumber}
              </span>
              <CopyButton text={depositNumber} showToast={showToast}/>
            </div>
            <div style={{ fontSize:11, color:'var(--text2)', marginTop:6 }}>{t.wallet_deposit_then_submit}</div>
          </div>
        )}

        {/* Crypto Section */}
        {isCrypto && (
          <div style={{ marginBottom:14 }}>
            {/* Blockchain */}
            <div className="input-wrap">
              <label className="input-label">{t.wallet_blockchain_lbl}</label>
              <div style={{ display:'flex', gap:8, overflowX:'auto', paddingBottom:4, WebkitOverflowScrolling:'touch' }}>
                {BLOCKCHAIN_OPTIONS.map(b => {
                  const isActive = blockchain === b.value;
                  return (
                    <button type="button" key={b.value} onClick={() => { setBlockchain(b.value); setToken(''); }}
                      style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:5, padding:'10px 12px', borderRadius:12, flexShrink:0, border:`2px solid ${isActive?'var(--accent)':'var(--border)'}`, background:isActive?'rgba(0,210,180,.1)':'var(--input-bg)', cursor:'pointer', transition:'all .2s', minWidth:70 }}>
                      <ImgIcon src={b.icon} alt={b.label} size={30} fallback={b.short[0]}/>
                      <span style={{ fontSize:10, fontWeight:700, letterSpacing:.3, color:isActive?'var(--accent)':'var(--text2)', whiteSpace:'nowrap' }}>{b.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Token */}
            {blockchain && (
              <div className="input-wrap">
                <label className="input-label">{t.wallet_token_lbl}</label>
                <div style={{ display:'flex', gap:10 }}>
                  {TOKEN_OPTIONS.map(tk => {
                    const isActive = token === tk.value;
                    return (
                      <button type="button" key={tk.value} onClick={() => setToken(tk.value)}
                        style={{ flex:1, display:'flex', alignItems:'center', justifyContent:'center', gap:8, padding:'12px 0', borderRadius:12, border:`2px solid ${isActive?'var(--accent)':'var(--border)'}`, background:isActive?'rgba(0,210,180,.12)':'var(--input-bg)', cursor:'pointer', transition:'all .2s' }}>
                        <ImgIcon src={tk.icon} alt={tk.label} size={24} fallback={tk.label[0]} fallbackBg={tk.color} fallbackColor="#fff"/>
                        <span style={{ fontWeight:700, fontSize:15, color:isActive?'var(--accent)':'var(--text2)' }}>{tk.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Deposit: QR preview */}
            {tab === 'deposit' && blockchain && token && (() => {
              const addr = rotatingWallet || cryptoAddr;
              return (
                <>
                  {addr ? (
                    <div style={{ background:'rgba(0,210,180,.07)', border:'1px solid rgba(0,210,180,.25)', borderRadius:10, padding:'16px 14px', marginBottom:14, textAlign:'center' }}>
                      <div style={{ display:'flex', alignItems:'center', justifyContent:'center', gap:8, marginBottom:10 }}>
                        <ImgIcon src={selectedChain?.icon} alt={selectedChain?.label} size={20} fallback={selectedChain?.short[0]}/>
                        <span style={{ fontWeight:700, fontSize:12 }}>{selectedChain?.label}</span>
                        <span style={{ color:'var(--text2)' }}>·</span>
                        <ImgIcon src={selectedToken?.icon} alt={selectedToken?.label} size={20} fallback={selectedToken?.label[0]} fallbackBg={selectedToken?.color} fallbackColor="#fff"/>
                        <span style={{ fontWeight:700, fontSize:12 }}>{selectedToken?.label}</span>
                      </div>
                      <div style={{ display:'inline-block', background:'#fff', borderRadius:12, padding:10, boxShadow:'0 2px 12px rgba(0,0,0,.1)' }}>
                        <QRCodeSVG value={addr} size={160} level="H" imageSettings={{ src:`${BASE_URL}logo.png`, height:34, width:34, excavate:true }}/>
                      </div>
                      <div style={{ display:'flex', alignItems:'center', gap:8, marginTop:10, justifyContent:'center' }}>
                        <span style={{ background:'var(--input-bg)', border:'1px solid var(--border)', borderRadius:8, padding:'8px 12px', fontFamily:'monospace', fontSize:11, fontWeight:600, letterSpacing:.5, wordBreak:'break-all', flex:1, textAlign:'center' }}>{addr}</span>
                        <CopyButton text={addr} showToast={showToast}/>
                      </div>
                    </div>
                  ) : (
                    <div style={{ background:'rgba(239,68,68,.08)', border:'1px solid rgba(239,68,68,.3)', borderRadius:10, padding:'14px 16px', marginBottom:14, textAlign:'center', fontSize:13, color:'#ef4444' }}>
                      {selectedToken?.label} on {selectedChain?.label} — {t.wallet_not_configured}
                    </div>
                  )}
                  <div className="input-wrap">
                    <label className="input-label">{amountLabel}</label>
                    <input className="inp" type="number" placeholder={amountPlaceholder} value={cryptoAmount} onChange={e => setCryptoAmount(e.target.value)}/>
                  </div>
                </>
              );
            })()}

            {/* Withdraw: wallet + amount */}
            {tab === 'withdraw' && blockchain && token && (
              <>
                <div className="input-wrap">
                  <label className="input-label">{t.crypto_wallet_addr_lbl}</label>
                  <input className="inp" placeholder={t.crypto_wallet_addr_ph} value={cryptoWithdrawWallet} onChange={e => setCryptoWithdrawWallet(e.target.value)}/>
                </div>
                <div className="input-wrap">
                  <label className="input-label">{amountLabel}</label>
                  <input className="inp" type="number" placeholder={amountPlaceholder} value={cryptoAmount} onChange={e => setCryptoAmount(e.target.value)}/>
                </div>
              </>
            )}
          </div>
        )}

        {/* Non-crypto account + amount */}
        {!isCrypto && (
          <>
            <div className="input-wrap">
              <label className="input-label">{t.account_number}</label>
              <input className="inp" placeholder={`${method.toUpperCase()} ${t.number_placeholder}`} value={acct} onChange={e => setAcct(e.target.value)}/>
            </div>
            <div className="input-wrap">
              <label className="input-label">{t.amount_label}</label>
              <input className="inp" type="number" placeholder={t.enter_amount} value={amount} onChange={e => setAmount(e.target.value)}/>
            </div>
          </>
        )}

        {!isCrypto && (
          <div style={{ background:'rgba(217,119,6,.08)', border:'1px solid rgba(217,119,6,.2)', borderRadius:10, padding:12, marginBottom:14, fontSize:12, color:'var(--yellow)' }}>
            {t.wallet_note}
          </div>
        )}

        {/* Submit */}
        {(!isCrypto || (blockchain && token)) && (
          <button className="btn btn-primary btn-full" onClick={submit} disabled={submitted}>
            {submitted
              ? t.processing_lbl
              : isCrypto && tab === 'deposit'
                ? <><Icons.Coin size={16}/> {t.wallet_crypto_dep_btn}</>
                : isCrypto && tab === 'withdraw'
                  ? <><Icons.Transfer size={16}/> {t.wallet_crypto_wd_btn}</>
                  : tab === 'withdraw'
                    ? <><Icons.Transfer size={16}/> {t.req_withdraw}</>
                    : <><Icons.Coin size={16}/> {t.sub_deposit}</>
            }
          </button>
        )}
      </div>

      {/* Transaction History */}
      <div className="card">
        <div className="card-title">{t.tx_history}</div>
        {txLoading ? (
          <div style={{ textAlign:'center', padding:20, color:'var(--text2)' }}>{t.loading}</div>
        ) : transactions.length === 0 ? (
          <div style={{ textAlign:'center', padding:20, color:'var(--text2)', fontSize:13 }}>{t.no_transactions}</div>
        ) : (
          transactions.map((tx, i) => (
            <div key={tx.id} style={{ display:'flex', alignItems:'center', gap:10, padding:'10px 0', borderBottom:i<transactions.length-1?'1px solid var(--border)':'none' }}>
              <span style={{ color:'var(--accent)', display:'flex', flexShrink:0 }}>
                {tx.type==='deposit'?<Icons.TrendUp size={18}/>:<Icons.Transfer size={18}/>}
              </span>
              <div style={{ flex:1, minWidth:0 }}>
                <div style={{ fontWeight:600, fontSize:13 }}>
                  {tx.type==='deposit'?t.deposit:t.withdraw} — {convertCurrency(Number(tx.amount),lang)}
                </div>
                <div style={{ fontSize:11, color:'var(--text2)' }}>
                  {tx.method?.toUpperCase()} | {tx.created_at?new Date(tx.created_at+'Z').toLocaleDateString():''}
                </div>
                {tx.admin_note && (
                  <div style={{ fontSize:11, color:'var(--yellow)', marginTop:2 }}>
                    <Icons.Note size={12}/> {tx.admin_note}
                  </div>
                )}
              </div>
              <span className={`badge ${tx.status==='approved'?'badge-green':tx.status==='rejected'?'badge-orange':'badge-blue'}`}>
                {tx.status==='approved'?t.approved:tx.status==='rejected'?t.rejected:t.pending}
              </span>
            </div>
          ))
        )}
      </div>
    </>
  );
}

export default WalletScreen;
