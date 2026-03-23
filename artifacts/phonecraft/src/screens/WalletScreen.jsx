import { useState, useEffect } from "react";
import Icons from "../Icons.jsx";
import { I18N } from "../i18n.js";
import { convertCurrency } from "../currency.js";

const API_URL = import.meta.env.VITE_API_URL || '';

function WalletScreen({user, setUser, showToast, lang}) {
  const t = I18N[lang] || I18N.en;
  const [tab,       setTab      ] = useState('withdraw');
  const [amount,    setAmount   ] = useState('');
  const [method,    setMethod   ] = useState('bkash');
  const [acct,      setAcct     ] = useState('');
  const [submitted, setSubmitted] = useState(false);

  // Deposit payment numbers from admin
  const [depositInfo, setDepositInfo] = useState({ bkash:'', nagad:'', rocket:'', bank:'' });

  // Transaction history
  const [transactions, setTransactions] = useState([]);
  const [txLoading, setTxLoading]       = useState(false);

  // Fetch deposit numbers
  useEffect(() => {
    fetch(`${API_URL}/api/deposit-info`)
      .then(r => r.json())
      .then(data => setDepositInfo(data))
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (!user?.id) return;
    setTxLoading(true);
    fetch(`${API_URL}/api/user/${user.id}/transactions`)
      .then(r => r.json())
      .then(data => { if (data.transactions) setTransactions(data.transactions); })
      .catch(() => {})
      .finally(() => setTxLoading(false));
  }, [user?.id]);

  const isCrypto = method === 'crypto';

  const submit = async () => {
    if (isCrypto) return;
    if (!amount || !acct) { showToast(t.fill_all_fields); return; }
    if (tab === 'withdraw' && parseInt(amount) > user.balance) {
      showToast(t.insufficient_balance); return;
    }
    setSubmitted(true);

    try {
      const res = await fetch(`${API_URL}/api/withdraw`, {
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
        fetch(`${API_URL}/api/user/${user.id}/transactions`)
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

  // Which number to show as "send to" for deposit tab
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

        {/* Crypto unavailable notice */}
        {isCrypto && (
          <div style={{
            background:'rgba(239,68,68,.08)', border:'1px solid rgba(239,68,68,.3)',
            borderRadius:10, padding:'14px 16px', margin:'4px 0 14px',
            display:'flex', alignItems:'center', gap:12,
          }}>
            <span><Icons.AlertTriangle size={22} color="#ef4444" /></span>
            <div>
              <div style={{fontWeight:700, fontSize:13, color:'#ef4444', marginBottom:2}}>
                Crypto Not Available
              </div>
              <div style={{fontSize:12, color:'var(--text2)'}}>
                Crypto payment is currently not available in your country.
                <br/>
                <span style={{color:'var(--text2)', opacity:.7}}>
                  আপনার দেশে ক্রিপ্টো পেমেন্ট এখনও চালু হয়নি।
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Deposit instruction box */}
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
            </div>
            <div style={{fontSize:11, color:'var(--text2)', marginTop:6}}>
              টাকা পাঠানোর পর নিচে আপনার নম্বর ও পরিমাণ দিয়ে সাবমিট করুন।
            </div>
          </div>
        )}

        {/* Account number / crypto fields */}
        {!isCrypto && (
          <>
            <div className="input-wrap">
              <label className="input-label">
                {method === 'bank'
                  ? (lang === 'bn' ? 'ব্যাংক অ্যাকাউন্ট নম্বর' : 'Bank Account Number')
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

        {/* Crypto fields placeholder (just shows unavailable) */}
        {isCrypto && (
          <div style={{opacity:.4, pointerEvents:'none'}}>
            <div className="input-wrap">
              <label className="input-label">Wallet Address</label>
              <input className="inp" placeholder="0x..." disabled/>
            </div>
            <div className="input-wrap">
              <label className="input-label">Network</label>
              <select className="inp" disabled>
                <option>TRC20 (TRON)</option>
                <option>ERC20 (Ethereum)</option>
                <option>BEP20 (BSC)</option>
              </select>
            </div>
            <div className="input-wrap">
              <label className="input-label">Amount (USDT)</label>
              <input className="inp" type="number" placeholder="0.00" disabled/>
            </div>
          </div>
        )}

        {/* Warning note */}
        {!isCrypto && (
          <div style={{background:'rgba(217,119,6,.08)',border:'1px solid rgba(217,119,6,.2)',borderRadius:10,padding:12,marginBottom:14,fontSize:12,color:'var(--yellow)'}}>
            {t.wallet_note}
          </div>
        )}

        {/* Submit button */}
        {!isCrypto && (
          <button className="btn btn-primary btn-full" onClick={submit} disabled={submitted}>
            {submitted
              ? t.processing_lbl
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
