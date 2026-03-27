import { useState, useEffect } from "react";
import { QRCodeSVG } from "qrcode.react";
import Icons from "../Icons.jsx";
import { I18N } from "../i18n.js";
import { convertCurrency } from "../currency.js";
import { authFetch } from "../session.js";

const API_URL = import.meta.env.VITE_API_URL || '';
const USD_RATE = 122.80;

const BLOCKCHAIN_OPTIONS = [
  { value: 'eth',      label: 'Ethereum',  short: 'ETH',  icon: 'https://assets.coingecko.com/coins/images/279/small/ethereum.png' },
  { value: 'op',       label: 'Optimism',  short: 'OP',   icon: 'https://assets.coingecko.com/coins/images/25244/small/Optimism.png' },
  { value: 'base',     label: 'Base',      short: 'BASE', icon: 'https://assets.coingecko.com/asset_platforms/images/131/small/base.jpeg' },
  { value: 'polygon',  label: 'Polygon',   short: 'POL',  icon: 'https://assets.coingecko.com/coins/images/4713/small/matic-token-icon.png' },
  { value: 'arbitrum', label: 'Arbitrum',  short: 'ARB',  icon: 'https://assets.coingecko.com/coins/images/16547/small/photo_2023-03-29_21.47.00.jpeg' },
];

const TOKEN_OPTIONS = [
  { value: 'usdt', label: 'USDT', icon: 'https://assets.coingecko.com/coins/images/325/small/Tether.png',  color: '#26A17B' },
  { value: 'usdc', label: 'USDC', icon: 'https://assets.coingecko.com/coins/images/6319/small/usdc.png',  color: '#2775CA' },
];

const PAYMENT_OPTIONS = [
  { value: 'crypto', label: 'Crypto', logo: '/crypto-logo.png',                                                          bg: '#00D2B4', text: '#111', letter: 'C' },
  { value: 'bkash',  label: 'bKash',  logo: 'https://cdn.brandfetch.io/id_4D40okd/w/400/h/400/theme/dark/icon.jpeg',   bg: '#E2136E', text: '#fff', letter: 'b' },
  { value: 'nagad',  label: 'Nagad',  logo: 'https://cdn.brandfetch.io/idPKXOsXfF/w/512/h/512/theme/dark/logo.png',     bg: '#F05A28', text: '#fff', letter: 'N' },
  { value: 'rocket', label: 'Rocket', logo: '/rocket-logo.png',                                                          bg: '#8B2FC9', text: '#fff', letter: 'R' },
];

const COMING_SOON_DEPOSIT  = new Set(['bkash', 'nagad', 'rocket']);
const COMING_SOON_WITHDRAW = new Set(['rocket']);

const ALL_CRYPTO_KEYS = BLOCKCHAIN_OPTIONS.flatMap(b =>
  TOKEN_OPTIONS.map(tk => `crypto_${b.value}_${tk.value}`)
);

function ImgIcon({ src, alt, size = 28, fallback, fallbackBg = '#555', fallbackColor = '#fff' }) {
  const [err, setErr] = useState(false);
  if (!src || err) {
    return (
      <span style={{
        width: size, height: size, borderRadius: '50%',
        background: fallbackBg, color: fallbackColor,
        display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
        fontSize: size * 0.45, fontWeight: 800, flexShrink: 0,
      }}>
        {fallback}
      </span>
    );
  }
  return (
    <img src={src} alt={alt} width={size} height={size}
      style={{ borderRadius: '50%', objectFit: 'cover', flexShrink: 0 }}
      onError={() => setErr(true)} />
  );
}

function CopyButton({ text, showToast }) {
  const [copied, setCopied] = useState(false);
  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      showToast('Copied!');
      setTimeout(() => setCopied(false), 2000);
    } catch {
      showToast('Copy failed');
    }
  };
  return (
    <button type="button" onClick={handleCopy} style={{
      background: copied ? 'rgba(0,210,180,.15)' : 'var(--input-bg)',
      border: `1px solid ${copied ? 'var(--accent)' : 'var(--border)'}`,
      borderRadius: 8, padding: '6px 12px', cursor: 'pointer',
      fontSize: 12, fontWeight: 600,
      color: copied ? 'var(--accent)' : 'var(--text2)',
      display: 'flex', alignItems: 'center', gap: 4,
      transition: 'all .2s', flexShrink: 0,
    }}>
      {copied ? <Icons.CheckCircle size={13}/> : <Icons.Copy size={13}/>}
      {copied ? 'Copied' : 'Copy'}
    </button>
  );
}

function WalletScreen({ user, setUser, showToast, lang, appSettings }) {
  const t = I18N[lang] || I18N.en;
  const isBn = lang === 'bn';
  const cryptoEnabled = appSettings?.crypto_enabled !== 'false';

  const [tab,        setTab      ] = useState('withdraw');
  const [amount,     setAmount   ] = useState('');
  const [method,     setMethod   ] = useState('crypto');
  const [acct,       setAcct     ] = useState('');
  const [submitted,  setSubmitted] = useState(false);
  const [screenshot, setScreenshot] = useState(null);

  const emptyDepositInfo = {
    bkash: '', nagad: '', rocket: '',
    ...Object.fromEntries(ALL_CRYPTO_KEYS.map(k => [k, ''])),
  };
  const [depositInfo,  setDepositInfo ] = useState(emptyDepositInfo);
  const [transactions, setTransactions] = useState([]);
  const [txLoading,    setTxLoading   ] = useState(false);

  const [blockchain,   setBlockchain  ] = useState('');
  const [token,        setToken       ] = useState('');
  const [txnHash,      setTxnHash     ] = useState('');
  const [cryptoAmount, setCryptoAmount] = useState('');
  const [cryptoWithdrawWallet, setCryptoWithdrawWallet] = useState('');
  const [usdBdtRate,   setUsdBdtRate  ] = useState(null);

  useEffect(() => {
    authFetch(`${API_URL}/api/deposit-info`)
      .then(r => r.json())
      .then(data => setDepositInfo(prev => ({ ...prev, ...data })))
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

  // Auto-switch away from "Coming Soon" methods when tab changes
  useEffect(() => {
    const comingSoonSet = tab === 'deposit' ? COMING_SOON_DEPOSIT : COMING_SOON_WITHDRAW;
    if (comingSoonSet.has(method)) setMethod('crypto');
  }, [tab]);

  // Reset blockchain/token when switching tabs or methods
  useEffect(() => {
    setBlockchain(''); setToken('');
  }, [tab, method]);

  // Fetch realtime USD to BDT rate
  useEffect(() => {
    fetch('https://open.er-api.com/v6/latest/USD')
      .then(r => r.json())
      .then(d => { if (d.rates?.BDT) setUsdBdtRate(Number(d.rates.BDT).toFixed(2)); })
      .catch(() => {});
  }, []);

  const visiblePaymentOptions = cryptoEnabled
    ? PAYMENT_OPTIONS
    : PAYMENT_OPTIONS.filter(o => o.value !== 'crypto');

  const isComingSoon = (val) =>
    tab === 'deposit' ? COMING_SOON_DEPOSIT.has(val) : COMING_SOON_WITHDRAW.has(val);

  const isCrypto      = method === 'crypto';
  const cryptoKey     = `crypto_${blockchain}_${token}`;
  const cryptoAddr    = depositInfo[cryptoKey] || '';
  const selectedChain = BLOCKCHAIN_OPTIONS.find(b => b.value === blockchain);
  const selectedToken = TOKEN_OPTIONS.find(tk => tk.value === token);
  const coinLabel     = `${selectedToken?.label} on ${selectedChain?.label}`;

  const amountLabel       = isBn ? 'পরিমাণ (৳ BDT)' : 'Amount ($ USD)';
  const amountPlaceholder = isBn ? '৳ পরিমাণ লিখুন'  : '$ Enter USD amount';

  const handleScreenshotChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => setScreenshot(ev.target.result);
    reader.readAsDataURL(file);
  };

  const submit = async () => {
    if (isCrypto) {
      const effectiveRate = usdBdtRate ? Number(usdBdtRate) : USD_RATE;
      if (tab === 'deposit') {
        if (!txnHash.trim() || !cryptoAmount) { showToast(t.fill_all_fields); return; }
        setSubmitted(true);
        const amountInBDT = isBn
          ? Number(cryptoAmount)
          : Math.round(Number(cryptoAmount) * effectiveRate);
        const coinLabel2 = `${token.toUpperCase()} on ${BLOCKCHAIN_OPTIONS.find(b=>b.value===blockchain)?.label || blockchain}`;
        try {
          const res = await authFetch(`${API_URL}/api/withdraw`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              userId: user.id, user: user.name, identifier: user.identifier,
              amount: amountInBDT, method: 'crypto',
              account: txnHash.trim(), type: 'deposit', coinType: coinLabel2,
              blockchain, token, txnHash: txnHash.trim(),
              screenshot: screenshot || null,
            }),
          });
          const data = await res.json();
          if (res.ok) {
            showToast(`${t.deposit} ${t.request_sent}`);
            if (data.newBalance !== undefined)
              setUser(prev => ({ ...prev, balance: data.newBalance }));
            authFetch(`${API_URL}/api/user/${user.id}/transactions`)
              .then(r => r.json()).then(d => { if (d.transactions) setTransactions(d.transactions); }).catch(() => {});
          } else {
            showToast(data.error || t.toast_request_failed);
          }
        } catch (_) { showToast(t.toast_connection_error); }
        setTimeout(() => setSubmitted(false), 3000);
        setTxnHash(''); setCryptoAmount(''); setScreenshot(null);
        return;
      }
      // crypto withdraw
      if (!cryptoWithdrawWallet.trim() || !cryptoAmount) { showToast(t.fill_all_fields); return; }
      if (parseInt(isBn ? cryptoAmount : Math.round(Number(cryptoAmount) * (usdBdtRate ? Number(usdBdtRate) : USD_RATE))) > user.balance) {
        showToast(t.insufficient_balance); return;
      }
      setSubmitted(true);
      const wAmt = isBn ? Number(cryptoAmount) : Math.round(Number(cryptoAmount) * (usdBdtRate ? Number(usdBdtRate) : USD_RATE));
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
          if (data.newBalance !== undefined)
            setUser(prev => ({ ...prev, balance: data.newBalance }));
          authFetch(`${API_URL}/api/user/${user.id}/transactions`)
            .then(r => r.json()).then(d => { if (d.transactions) setTransactions(d.transactions); }).catch(() => {});
        } else { showToast(data.error || t.toast_request_failed); }
      } catch (_) { showToast(t.toast_connection_error); }
      setTimeout(() => setSubmitted(false), 3000);
      setCryptoAmount(''); setCryptoWithdrawWallet('');
      return;
    }

    if (!amount || !acct) { showToast(t.fill_all_fields); return; }
    if (tab === 'withdraw' && parseInt(amount) > user.balance) { showToast(t.insufficient_balance); return; }
    setSubmitted(true);
    try {
      const res = await authFetch(`${API_URL}/api/withdraw`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.id, user: user.name, identifier: user.identifier,
          amount, method, account: acct, type: tab,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        showToast(`${tab === 'withdraw' ? t.withdraw : t.deposit} ${t.request_sent}`);
        if (data.newBalance !== undefined)
          setUser(prev => ({ ...prev, balance: data.newBalance }));
        authFetch(`${API_URL}/api/user/${user.id}/transactions`)
          .then(r => r.json()).then(d => { if (d.transactions) setTransactions(d.transactions); }).catch(() => {});
      } else { showToast(data.error || t.toast_request_failed); }
    } catch (_) { showToast(t.toast_connection_error); }
    setTimeout(() => setSubmitted(false), 3000);
    setAmount(''); setAcct('');
  };

  const depositNumber = {
    bkash: depositInfo.bkash, nagad: depositInfo.nagad,
    rocket: depositInfo.rocket,
  }[method] || '';

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
        <div style={{background:'var(--input-bg)',border:'1px solid var(--border)',borderRadius:10,padding:14,marginBottom:16,textAlign:'center'}}>
          <div style={{fontSize:11,color:'var(--text2)',marginBottom:6}}>{t.avail_balance}</div>
          <div style={{fontFamily:'Space Grotesk',fontSize:'clamp(20px,5vw,28px)',color:'var(--accent)',display:'flex',alignItems:'center',justifyContent:'center',gap:8}}>
            <Icons.Coin size={22}/>{convertCurrency(user.balance, lang)}
          </div>
          {usdBdtRate && (
            <div style={{fontSize:11,color:'var(--text2)',marginTop:6,display:'flex',alignItems:'center',justifyContent:'center',gap:4}}>
              <span>💱</span>
              <span>1 USD = <b style={{color:'var(--accent)'}}>৳{usdBdtRate}</b> BDT</span>
              <span style={{fontSize:9,opacity:.6}}>(Live)</span>
            </div>
          )}
        </div>

        {/* ── Payment Method Grid ── */}
        <div className="input-wrap">
          <label className="input-label">{t.payment_method}</label>
          <div style={{display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:8}}>
            {visiblePaymentOptions.map(opt => {
              const isActive = method === opt.value;
              const cs = isComingSoon(opt.value);
              return (
                <button
                  type="button"
                  key={opt.value}
                  onClick={() => { if (!cs) setMethod(opt.value); }}
                  style={{
                    display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center',
                    gap:4, padding:'10px 2px', borderRadius:12, position:'relative',
                    border: `2px solid ${isActive ? 'var(--accent)' : cs ? 'rgba(255,255,255,.08)' : 'var(--border)'}`,
                    background: isActive ? 'rgba(0,210,180,.1)' : cs ? 'rgba(255,255,255,.03)' : 'var(--input-bg)',
                    cursor: cs ? 'default' : 'pointer', transition:'all .2s',
                    opacity: cs ? 0.55 : 1,
                  }}
                >
                  {opt.logo ? (
                    <ImgIcon src={opt.logo} alt={opt.label} size={28}
                      fallback={opt.letter} fallbackBg={opt.bg} fallbackColor={opt.text} />
                  ) : (
                    <span style={{
                      width:28, height:28, borderRadius:'50%',
                      background: isActive ? opt.bg : 'var(--border)',
                      display:'inline-flex', alignItems:'center', justifyContent:'center',
                      fontSize:14, transition:'all .2s',
                    }}>
                      {opt.letter}
                    </span>
                  )}
                  <span style={{
                    fontSize:9, fontWeight:700, letterSpacing:.2,
                    color: isActive ? 'var(--accent)' : 'var(--text2)',
                    lineHeight:1,
                  }}>
                    {opt.label}
                  </span>
                  {cs && (
                    <span style={{
                      position:'absolute', bottom:3, left:'50%', transform:'translateX(-50%)',
                      fontSize:7, fontWeight:800, letterSpacing:.3, whiteSpace:'nowrap',
                      background:'rgba(217,119,6,.85)', color:'#fff',
                      borderRadius:4, padding:'1px 4px',
                    }}>
                      SOON
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Non-crypto deposit instruction */}
        {!isCrypto && tab === 'deposit' && depositNumber && (
          <div style={{background:'rgba(0,210,180,.07)',border:'1px solid rgba(0,210,180,.25)',borderRadius:10,padding:'12px 14px',marginBottom:14}}>
            <div style={{fontSize:11,fontWeight:700,color:'var(--accent)',marginBottom:6,textTransform:'uppercase',letterSpacing:.5}}>
              <Icons.Upload size={13}/> এই নম্বরে টাকা পাঠান
            </div>
            <div style={{display:'flex',alignItems:'center',gap:10}}>
              <span style={{background:'var(--input-bg)',border:'1px solid var(--border)',borderRadius:8,padding:'8px 14px',fontFamily:'monospace',fontSize:16,fontWeight:700,letterSpacing:1,flex:1,textAlign:'center'}}>
                {method.toUpperCase()}: {depositNumber}
              </span>
              <CopyButton text={depositNumber} showToast={showToast}/>
            </div>
            <div style={{fontSize:11,color:'var(--text2)',marginTop:6}}>
              টাকা পাঠানোর পর নিচে আপনার নম্বর ও পরিমাণ দিয়ে সাবমিট করুন।
            </div>
          </div>
        )}

        {/* ── Crypto section (both deposit & withdraw) ── */}
        {isCrypto && (
          <div style={{marginBottom:14}}>
            {/* Blockchain selector */}
            <div className="input-wrap">
              <label className="input-label">Blockchain</label>
              <div style={{display:'flex', gap:8, overflowX:'auto', paddingBottom:4, WebkitOverflowScrolling:'touch'}}>
                {BLOCKCHAIN_OPTIONS.map(b => {
                  const isActive = blockchain === b.value;
                  return (
                    <button type="button" key={b.value} onClick={() => { setBlockchain(b.value); setToken(''); }}
                      style={{
                        display:'flex', flexDirection:'column', alignItems:'center', gap:5,
                        padding:'10px 12px', borderRadius:12, flexShrink:0,
                        border: `2px solid ${isActive ? 'var(--accent)' : 'var(--border)'}`,
                        background: isActive ? 'rgba(0,210,180,.1)' : 'var(--input-bg)',
                        cursor:'pointer', transition:'all .2s', minWidth:70,
                      }}>
                      <ImgIcon src={b.icon} alt={b.label} size={30} fallback={b.short[0]} />
                      <span style={{fontSize:10, fontWeight:700, letterSpacing:.3, color: isActive ? 'var(--accent)' : 'var(--text2)', whiteSpace:'nowrap'}}>
                        {b.label}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Token selector — appears after blockchain selected */}
            {blockchain && (
              <div className="input-wrap">
                <label className="input-label">Token</label>
                <div style={{display:'flex', gap:10}}>
                  {TOKEN_OPTIONS.map(tk => {
                    const isActive = token === tk.value;
                    return (
                      <button type="button" key={tk.value} onClick={() => setToken(tk.value)}
                        style={{
                          flex:1, display:'flex', alignItems:'center', justifyContent:'center',
                          gap:8, padding:'12px 0', borderRadius:12,
                          border: `2px solid ${isActive ? 'var(--accent)' : 'var(--border)'}`,
                          background: isActive ? 'rgba(0,210,180,.12)' : 'var(--input-bg)',
                          cursor:'pointer', transition:'all .2s',
                        }}>
                        <ImgIcon src={tk.icon} alt={tk.label} size={24} fallback={tk.label[0]} fallbackBg={tk.color} fallbackColor="#fff" />
                        <span style={{fontWeight:700, fontSize:15, color: isActive ? 'var(--accent)' : 'var(--text2)'}}>
                          {tk.label}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* DEPOSIT: QR + TxnHash + Screenshot — only when token selected */}
            {tab === 'deposit' && blockchain && token && (() => {
              const ck   = `crypto_${blockchain}_${token}`;
              const addr = depositInfo[ck] || '';
              const sc   = BLOCKCHAIN_OPTIONS.find(b => b.value === blockchain);
              const tk   = TOKEN_OPTIONS.find(t => t.value === token);
              return (
                <>
                  <div key={ck}>
                    {addr ? (
                      <div style={{background:'rgba(0,210,180,.07)',border:'1px solid rgba(0,210,180,.25)',borderRadius:10,padding:'16px 14px',marginBottom:14,textAlign:'center'}}>
                        <div style={{display:'flex',alignItems:'center',justifyContent:'center',gap:8,marginBottom:12}}>
                          <ImgIcon src={sc?.icon} alt={sc?.label} size={22} fallback={sc?.short[0]}/>
                          <span style={{fontWeight:700,fontSize:13}}>{sc?.label}</span>
                          <span style={{color:'var(--text2)'}}>·</span>
                          <ImgIcon src={tk?.icon} alt={tk?.label} size={22} fallback={tk?.label[0]} fallbackBg={tk?.color} fallbackColor="#fff"/>
                          <span style={{fontWeight:700,fontSize:13}}>{tk?.label}</span>
                        </div>
                        <div style={{fontSize:10,color:'var(--text2)',marginBottom:12,textTransform:'uppercase',letterSpacing:.5}}>Deposit Wallet Address</div>
                        <div style={{display:'inline-block',background:'#fff',borderRadius:12,padding:12,boxShadow:'0 2px 12px rgba(0,0,0,.1)'}}>
                          <QRCodeSVG value={addr} size={180} level="H"
                            imageSettings={{ src:`${import.meta.env.BASE_URL}logo.png`, height:36, width:36, excavate:true }}/>
                        </div>
                        <div style={{display:'flex',alignItems:'center',gap:8,marginTop:12,justifyContent:'center'}}>
                          <span style={{background:'var(--input-bg)',border:'1px solid var(--border)',borderRadius:8,padding:'8px 12px',fontFamily:'monospace',fontSize:12,fontWeight:600,letterSpacing:.5,wordBreak:'break-all',flex:1,textAlign:'center'}}>
                            {addr}
                          </span>
                          <CopyButton text={addr} showToast={showToast}/>
                        </div>
                      </div>
                    ) : (
                      <div style={{background:'rgba(239,68,68,.08)',border:'1px solid rgba(239,68,68,.3)',borderRadius:10,padding:'14px 16px',marginBottom:14,textAlign:'center',fontSize:13,color:'#ef4444'}}>
                        <ImgIcon src={tk?.icon} alt={tk?.label} size={18} fallback={tk?.label[0]} fallbackBg={tk?.color} fallbackColor="#fff"/>
                        {' '}{tk?.label} on {sc?.label} — wallet not configured yet
                      </div>
                    )}
                  </div>
                  <div className="input-wrap">
                    <label className="input-label">{amountLabel}</label>
                    <input className="inp" type="number" placeholder={amountPlaceholder}
                      value={cryptoAmount} onChange={e => setCryptoAmount(e.target.value)}/>
                  </div>
                  <div className="input-wrap">
                    <label className="input-label">🔗 Transaction Hash (TxnHash)</label>
                    <input className="inp" placeholder="Paste your TxnHash here"
                      value={txnHash} onChange={e => setTxnHash(e.target.value)}/>
                  </div>
                  <div className="input-wrap">
                    <label className="input-label">📸 Screenshot (Transaction Proof)</label>
                    <label style={{display:'flex',alignItems:'center',gap:10,cursor:'pointer',background:'var(--input-bg)',border:`2px dashed ${screenshot ? 'var(--accent)' : 'var(--border)'}`,borderRadius:10,padding:'12px 14px',transition:'all .2s'}}>
                      <input type="file" accept="image/*" style={{display:'none'}} onChange={handleScreenshotChange}/>
                      {screenshot ? (
                        <>
                          <img src={screenshot} alt="preview" style={{width:48,height:48,borderRadius:8,objectFit:'cover',flexShrink:0}}/>
                          <div style={{flex:1}}><div style={{fontSize:12,fontWeight:700,color:'var(--accent)'}}>Screenshot uploaded ✓</div><div style={{fontSize:11,color:'var(--text2)'}}>ছবি পরিবর্তন করতে ক্লিক করুন</div></div>
                        </>
                      ) : (
                        <><span style={{fontSize:24}}>🖼️</span><div><div style={{fontSize:12,fontWeight:700}}>ছবি আপলোড করুন</div><div style={{fontSize:11,color:'var(--text2)'}}>Transaction screenshot (optional)</div></div></>
                      )}
                    </label>
                  </div>
                </>
              );
            })()}

            {/* WITHDRAW: wallet address + amount — only when token selected */}
            {tab === 'withdraw' && blockchain && token && (
              <>
                <div className="input-wrap">
                  <label className="input-label">🔑 আপনার Crypto Wallet Address</label>
                  <input className="inp" placeholder="0x... অথবা আপনার wallet address"
                    value={cryptoWithdrawWallet} onChange={e => setCryptoWithdrawWallet(e.target.value)}/>
                </div>
                <div className="input-wrap">
                  <label className="input-label">{amountLabel}</label>
                  <input className="inp" type="number" placeholder={amountPlaceholder}
                    value={cryptoAmount} onChange={e => setCryptoAmount(e.target.value)}/>
                </div>
              </>
            )}
          </div>
        )}

        {/* Non-crypto account + amount fields */}
        {!isCrypto && (
          <>
            <div className="input-wrap">
              <label className="input-label">{t.account_number}</label>
              <input className="inp"
                placeholder={`${method.toUpperCase()} ${t.number_placeholder}`}
                value={acct} onChange={e => setAcct(e.target.value)}/>
            </div>
            <div className="input-wrap">
              <label className="input-label">{t.amount_label}</label>
              <input className="inp" type="number" placeholder={t.enter_amount}
                value={amount} onChange={e => setAmount(e.target.value)}/>
            </div>
          </>
        )}

        {/* Warning */}
        {!isCrypto && (
          <div style={{background:'rgba(217,119,6,.08)',border:'1px solid rgba(217,119,6,.2)',borderRadius:10,padding:12,marginBottom:14,fontSize:12,color:'var(--yellow)'}}>
            {t.wallet_note}
          </div>
        )}

        {/* Submit */}
        {(!isCrypto || (blockchain && token)) && (
          <button className="btn btn-primary btn-full" onClick={submit} disabled={submitted}>
            {submitted
              ? t.processing_lbl
              : isCrypto && tab === 'deposit'
                ? <><Icons.Coin size={16}/> {isBn ? 'ক্রিপ্টো ডিপোজিট সাবমিট করুন' : 'Submit Crypto Deposit'}</>
                : isCrypto && tab === 'withdraw'
                  ? <><Icons.Transfer size={16}/> {isBn ? 'ক্রিপ্টো উইথড্র করুন' : 'Submit Crypto Withdraw'}</>
                  : tab === 'withdraw'
                    ? <><Icons.Transfer size={16}/> {t.req_withdraw}</>
                    : <><Icons.Coin size={16}/> {t.sub_deposit}</>
            }
          </button>
        )}
      </div>

      {/* Transaction history */}
      <div className="card">
        <div className="card-title">{t.tx_history}</div>
        {txLoading ? (
          <div style={{textAlign:'center',padding:20,color:'var(--text2)'}}>{t.loading}</div>
        ) : transactions.length === 0 ? (
          <div style={{textAlign:'center',padding:20,color:'var(--text2)',fontSize:13}}>{t.no_transactions}</div>
        ) : (
          transactions.map((tx, i) => (
            <div key={tx.id} style={{display:'flex',alignItems:'center',gap:10,padding:'10px 0',borderBottom:i<transactions.length-1?'1px solid var(--border)':'none'}}>
              <span style={{color:'var(--accent)',display:'flex',flexShrink:0}}>
                {tx.type==='deposit'?<Icons.TrendUp size={18}/>:<Icons.Transfer size={18}/>}
              </span>
              <div style={{flex:1,minWidth:0}}>
                <div style={{fontWeight:600,fontSize:13}}>
                  {tx.type==='deposit'?t.deposit:t.withdraw} — {convertCurrency(Number(tx.amount),lang)}
                </div>
                <div style={{fontSize:11,color:'var(--text2)'}}>
                  {tx.method?.toUpperCase()} | {tx.created_at?new Date(tx.created_at+'Z').toLocaleDateString():''}
                </div>
                {tx.admin_note && (
                  <div style={{fontSize:11,color:'var(--yellow)',marginTop:2}}>
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
