import { useState, useEffect } from "react";
import { QRCodeSVG } from "qrcode.react";
import Icons from "../Icons.jsx";
import { I18N } from "../i18n.js";
import { convertCurrency } from "../currency.js";
import { authFetch } from "../session.js";

const API_URL = import.meta.env.VITE_API_URL || '';

const COIN_OPTIONS = [
  { value: 'usdt_trc20', label: 'USDT (TRC20)', key: 'crypto_usdt_trc20' },
  { value: 'usdt_bep20', label: 'USDT (BEP20)', key: 'crypto_usdt_bep20' },
  { value: 'bnb',        label: 'BNB (BEP20)',  key: 'crypto_bnb' },
];

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
    <button
      onClick={handleCopy}
      style={{
        background: copied ? 'rgba(0,210,180,.15)' : 'var(--input-bg)',
        border: `1px solid ${copied ? 'var(--accent)' : 'var(--border)'}`,
        borderRadius: 8,
        padding: '6px 12px',
        cursor: 'pointer',
        fontSize: 12,
        fontWeight: 600,
        color: copied ? 'var(--accent)' : 'var(--text2)',
        display: 'flex',
        alignItems: 'center',
        gap: 4,
        transition: 'all .2s',
        flexShrink: 0,
      }}
    >
      {copied ? <Icons.CheckCircle size={13} /> : <Icons.Copy size={13} />}
      {copied ? 'Copied' : 'Copy'}
    </button>
  );
}

function WalletScreen({user, setUser, showToast, lang}) {
  const t = I18N[lang] || I18N.en;
  const [tab,       setTab      ] = useState('withdraw');
  const [amount,    setAmount   ] = useState('');
  const [method,    setMethod   ] = useState('bkash');
  const [acct,      setAcct     ] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const [depositInfo, setDepositInfo] = useState({ bkash:'', nagad:'', rocket:'', bank:'', crypto_usdt_trc20:'', crypto_usdt_bep20:'', crypto_bnb:'' });

  const [transactions, setTransactions] = useState([]);
  const [txLoading, setTxLoading]       = useState(false);

  const [coinType, setCoinType] = useState('usdt_trc20');
  const [txnHash, setTxnHash]  = useState('');
  const [cryptoAmount, setCryptoAmount] = useState('');

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

  const isCrypto = method === 'crypto';

  const selectedCoin = COIN_OPTIONS.find(c => c.value === coinType);
  const cryptoAddress = selectedCoin ? (depositInfo[selectedCoin.key] || '') : '';

  const submit = async () => {
    if (isCrypto) {
      if (!txnHash.trim() || !cryptoAmount) { showToast(t.fill_all_fields); return; }
      setSubmitted(true);
      try {
        const res = await authFetch(`${API_URL}/api/withdraw`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userId: user.id,
            user: user.name,
            identifier: user.identifier,
            amount: cryptoAmount,
            method: 'crypto',
            account: txnHash.trim(),
            type: 'deposit',
            coinType: selectedCoin?.label || coinType,
          }),
        });
        const data = await res.json();
        if (res.ok) {
          showToast(`${t.deposit} ${t.request_sent}`);
          if (data.newBalance !== undefined) {
            setUser(prev => ({ ...prev, balance: data.newBalance }));
          }
          authFetch(`${API_URL}/api/user/${user.id}/transactions`)
            .then(r => r.json())
            .then(d => { if (d.transactions) setTransactions(d.transactions); })
            .catch(() => {});
        } else {
          showToast(data.error || t.toast_request_failed);
        }
      } catch (_) {
        showToast(t.toast_connection_error);
      }
      setTimeout(() => setSubmitted(false), 3000);
      setTxnHash(''); setCryptoAmount('');
      return;
    }

    if (!amount || !acct) { showToast(t.fill_all_fields); return; }
    if (tab === 'withdraw' && parseInt(amount) > user.balance) {
      showToast(t.insufficient_balance); return;
    }
    setSubmitted(true);

    try {
      const res = await authFetch(`${API_URL}/api/withdraw`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.id,
          user: user.name,
          identifier: user.identifier,
          amount, method, account: acct,
          type: tab,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        showToast(`${tab === 'withdraw' ? t.withdraw : t.deposit} ${t.request_sent}`);
        if (data.newBalance !== undefined) {
          setUser(prev => ({ ...prev, balance: data.newBalance }));
        }
        authFetch(`${API_URL}/api/user/${user.id}/transactions`)
          .then(r => r.json())
          .then(d => { if (d.transactions) setTransactions(d.transactions); })
          .catch(() => {});
      } else {
        showToast(data.error || t.toast_request_failed);
      }
    } catch (_) {
      showToast(t.toast_connection_error);
    }

    setTimeout(() => setSubmitted(false), 3000);
    setAmount(''); setAcct('');
  };

  const depositNumber = {
    bkash:  depositInfo.bkash,
    nagad:  depositInfo.nagad,
    rocket: depositInfo.rocket,
    bank:   depositInfo.bank,
  }[method] || '';

  return (
    <>
      <div className="screen-title"><Icons.Wallet size={18}/> {t.withdraw_deposit}</div>
      <div className="tabs">
        <div className={`tab ${tab==='withdraw'?'active':''}`} onClick={()=>setTab('withdraw')}>
          <Icons.Transfer size={14}/> {t.withdraw}
        </div>
        <div className={`tab ${tab==='deposit'?'active':''}`} onClick={()=>setTab('deposit')}>
          <Icons.Coin size={14}/> {t.deposit}
        </div>
      </div>

      <div className="card">
        {/* Balance box */}
        <div style={{background:'var(--input-bg)',border:'1px solid var(--border)',borderRadius:10,padding:14,marginBottom:16,textAlign:'center'}}>
          <div style={{fontSize:11,color:'var(--text2)',marginBottom:6}}>{t.avail_balance}</div>
          <div style={{fontFamily:'Space Grotesk',fontSize:'clamp(20px,5vw,28px)',color:'var(--accent)',display:'flex',alignItems:'center',justifyContent:'center',gap:8}}>
            <Icons.Coin size={22}/>{convertCurrency(user.balance, lang)}
          </div>
        </div>

        {/* Payment method */}
        <div className="input-wrap">
          <label className="input-label">{t.payment_method}</label>
          <select className="inp" value={method} onChange={e=>setMethod(e.target.value)}>
            <option value="bkash">bKash</option>
            <option value="nagad">Nagad</option>
            <option value="rocket">Rocket</option>
            <option value="bank">{t.bank_transfer}</option>
            <option value="crypto">Crypto (USDT)</option>
          </select>
        </div>

        {/* Deposit instruction box with copy button */}
        {!isCrypto && tab === 'deposit' && depositNumber && (
          <div style={{
            background:'rgba(0,210,180,.07)', border:'1px solid rgba(0,210,180,.25)',
            borderRadius:10, padding:'12px 14px', marginBottom:14,
          }}>
            <div style={{fontSize:11, fontWeight:700, color:'var(--accent)', marginBottom:6, textTransform:'uppercase', letterSpacing:.5}}>
              <Icons.Upload size={13} /> এই নম্বরে টাকা পাঠান
            </div>
            <div style={{display:'flex', alignItems:'center', gap:10}}>
              <span style={{
                background:'var(--input-bg)', border:'1px solid var(--border)',
                borderRadius:8, padding:'8px 14px', fontFamily:'monospace',
                fontSize:16, fontWeight:700, letterSpacing:1, flex:1, textAlign:'center',
              }}>
                {method.toUpperCase()}: {depositNumber}
              </span>
              <CopyButton text={depositNumber} showToast={showToast} />
            </div>
            <div style={{fontSize:11, color:'var(--text2)', marginTop:6}}>
              টাকা পাঠানোর পর নিচে আপনার নম্বর ও পরিমাণ দিয়ে সাবমিট করুন।
            </div>
          </div>
        )}

        {/* Crypto deposit section */}
        {isCrypto && tab === 'deposit' && (
          <div style={{marginBottom:14}}>
            <div className="input-wrap">
              <label className="input-label">Select Coin</label>
              <select className="inp" value={coinType} onChange={e => setCoinType(e.target.value)}>
                {COIN_OPTIONS.map(c => (
                  <option key={c.value} value={c.value}>{c.label}</option>
                ))}
              </select>
            </div>

            {cryptoAddress ? (
              <div style={{
                background:'rgba(0,210,180,.07)', border:'1px solid rgba(0,210,180,.25)',
                borderRadius:10, padding:'16px 14px', marginBottom:14, textAlign:'center',
              }}>
                <div style={{fontSize:11, fontWeight:700, color:'var(--accent)', marginBottom:12, textTransform:'uppercase', letterSpacing:.5}}>
                  {selectedCoin?.label} Wallet Address
                </div>
                <div style={{
                  display:'inline-block', background:'#fff', borderRadius:12, padding:12,
                  boxShadow:'0 2px 12px rgba(0,0,0,.1)',
                }}>
                  <QRCodeSVG
                    value={cryptoAddress}
                    size={180}
                    level="H"
                    imageSettings={{
                      src: `${import.meta.env.BASE_URL}logo.png`,
                      height: 36,
                      width: 36,
                      excavate: true,
                    }}
                  />
                </div>
                <div style={{display:'flex', alignItems:'center', gap:8, marginTop:12, justifyContent:'center'}}>
                  <span style={{
                    background:'var(--input-bg)', border:'1px solid var(--border)',
                    borderRadius:8, padding:'8px 12px', fontFamily:'monospace',
                    fontSize:12, fontWeight:600, letterSpacing:.5,
                    wordBreak:'break-all', flex:1, textAlign:'center',
                  }}>
                    {cryptoAddress}
                  </span>
                  <CopyButton text={cryptoAddress} showToast={showToast} />
                </div>
              </div>
            ) : (
              <div style={{
                background:'rgba(239,68,68,.08)', border:'1px solid rgba(239,68,68,.3)',
                borderRadius:10, padding:'14px 16px', marginBottom:14,
                textAlign:'center', fontSize:13, color:'#ef4444',
              }}>
                Wallet address not configured for {selectedCoin?.label}
              </div>
            )}

            <div className="input-wrap">
              <label className="input-label">Amount (BDT)</label>
              <input className="inp" type="number" placeholder="Enter amount in BDT" value={cryptoAmount} onChange={e => setCryptoAmount(e.target.value)} />
            </div>
            <div className="input-wrap">
              <label className="input-label">Transaction Hash (TxnHash)</label>
              <input className="inp" placeholder="Paste your TxnHash here" value={txnHash} onChange={e => setTxnHash(e.target.value)} />
            </div>
          </div>
        )}

        {/* Crypto withdraw not supported notice */}
        {isCrypto && tab === 'withdraw' && (
          <div style={{
            background:'rgba(217,119,6,.08)', border:'1px solid rgba(217,119,6,.2)',
            borderRadius:10, padding:'14px 16px', margin:'4px 0 14px',
            textAlign:'center', fontSize:13, color:'var(--yellow)',
          }}>
            Crypto withdrawal is not available. Please use bKash/Nagad/Rocket/Bank for withdrawals.
          </div>
        )}

        {/* Account number fields for non-crypto */}
        {!isCrypto && (
          <>
            <div className="input-wrap">
              <label className="input-label">
                {method === 'bank'
                  ? (t.wallet_bank_account)
                  : t.account_number}
              </label>
              <input
                className="inp"
                placeholder={`${method.toUpperCase()} ${t.number_placeholder}`}
                value={acct}
                onChange={e=>setAcct(e.target.value)}
              />
            </div>
            <div className="input-wrap">
              <label className="input-label">{t.amount_label}</label>
              <input className="inp" type="number" placeholder={t.enter_amount} value={amount} onChange={e=>setAmount(e.target.value)}/>
            </div>
          </>
        )}

        {/* Warning note */}
        {!isCrypto && (
          <div style={{background:'rgba(217,119,6,.08)',border:'1px solid rgba(217,119,6,.2)',borderRadius:10,padding:12,marginBottom:14,fontSize:12,color:'var(--yellow)'}}>
            {t.wallet_note}
          </div>
        )}

        {/* Submit button */}
        {(!isCrypto || (isCrypto && tab === 'deposit')) && !(isCrypto && tab === 'withdraw') && (
          <button className="btn btn-primary btn-full" onClick={submit} disabled={submitted || (isCrypto && !cryptoAddress)}>
            {submitted
              ? t.processing_lbl
              : isCrypto
                ? <><Icons.Coin size={16}/> Submit Crypto Deposit</>
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
          <div style={{ textAlign: 'center', padding: 20, color: 'var(--text2)' }}>{t.loading}</div>
        ) : transactions.length === 0 ? (
          <div style={{ textAlign: 'center', padding: 20, color: 'var(--text2)', fontSize: 13 }}>
            {t.no_transactions}
          </div>
        ) : (
          transactions.map((tx, i) => (
            <div key={tx.id} style={{
              display: 'flex', alignItems: 'center', gap: 10, padding: '10px 0',
              borderBottom: i < transactions.length - 1 ? '1px solid var(--border)' : 'none',
            }}>
              <span style={{ color: 'var(--accent)', display: 'flex', flexShrink: 0 }}>
                {tx.type === 'deposit' ? <Icons.TrendUp size={18} /> : <Icons.Transfer size={18} />}
              </span>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontWeight: 600, fontSize: 13 }}>
                  {tx.type === 'deposit' ? t.deposit : t.withdraw} — {convertCurrency(Number(tx.amount), lang)}
                </div>
                <div style={{ fontSize: 11, color: 'var(--text2)' }}>
                  {tx.method?.toUpperCase()} | {tx.created_at ? new Date(tx.created_at + 'Z').toLocaleDateString() : ''}
                </div>
                {tx.admin_note ? (
                  <div style={{ fontSize: 11, color: 'var(--yellow)', marginTop: 2 }}>
                    <Icons.Note size={12} /> {tx.admin_note}
                  </div>
                ) : null}
              </div>
              <span className={`badge ${
                tx.status === 'approved' ? 'badge-green' :
                tx.status === 'rejected' ? 'badge-orange' : 'badge-blue'
              }`}>
                {tx.status === 'approved' ? t.approved : tx.status === 'rejected' ? t.rejected : t.pending}
              </span>
            </div>
          ))
        )}
      </div>
    </>
  );
}

export default WalletScreen;
