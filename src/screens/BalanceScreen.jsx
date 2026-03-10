import { useState, useEffect, useRef } from "react";
import Icons from "../Icons.jsx";
import { PLANS } from "../data.jsx";
import { I18N } from "../i18n.js";
import { convertCurrency } from "../currency.js";

const API_URL = import.meta.env.VITE_API_URL || '';

const LOG_META = {
  daily_earn:         { icon: '⚙️',  colorPos: true,  label_bn: 'ডেইলি আয়',              label_en: 'Daily Earn'          },
  referral_bonus:     { icon: '🎁',  colorPos: true,  label_bn: 'রেফারেল বোনাস L1',       label_en: 'Referral Bonus L1'   },
  team_bonus:         { icon: '👥',  colorPos: true,  label_bn: 'টিম কমিশন',               label_en: 'Team Commission'     },
  referral_spend:     { icon: '💸',  colorPos: false, label_bn: 'রেফারেল ক্রয়',            label_en: 'Referral Spend'      },
  deposit:            { icon: '💰',  colorPos: true,  label_bn: 'ডিপোজিট',                 label_en: 'Deposit'             },
  deposit_refund:     { icon: '↩️',  colorPos: false, label_bn: 'ডিপোজিট বাতিল',           label_en: 'Deposit Cancelled'   },
  withdrawal:         { icon: '🏧',  colorPos: false, label_bn: 'উইথড্র',                   label_en: 'Withdrawal'          },
  withdrawal_refund:  { icon: '↩️',  colorPos: true,  label_bn: 'উইথড্র রিফান্ড',          label_en: 'Withdrawal Refund'   },
  marketplace_sell:   { icon: '🛒',  colorPos: true,  label_bn: 'মার্কেটপ্লেস বিক্রয়',     label_en: 'Marketplace Sale'    },
  transfer_sent:      { icon: '➡️',  colorPos: false, label_bn: 'ক্রেডিট ট্রান্সফার (পাঠানো)', label_en: 'Transfer Sent'    },
  transfer_received:  { icon: '⬅️',  colorPos: true,  label_bn: 'ক্রেডিট ট্রান্সফার (প্রাপ্ত)', label_en: 'Transfer Received' },
};

function getLabel(type, lang) {
  const m = LOG_META[type];
  if (!m) return type;
  return lang === 'bn' ? m.label_bn : m.label_en;
}

function formatDate(str, lang) {
  if (!str) return '';
  const d = new Date(str);
  if (isNaN(d)) return str;
  return d.toLocaleString(lang === 'bn' ? 'bn-BD' : 'en-GB', {
    day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit',
  });
}

function BalanceScreen({ user, setUser, showToast, lang, isDark }) {
  const t = I18N[lang] || I18N.en;
  const [log, setLog] = useState([]);
  const [summary, setSummary] = useState({ daily_earned: 0, referral_earned: 0, team_earned: 0 });
  const [loading, setLoading] = useState(true);
  const [toIdentifier, setToIdentifier] = useState('');
  const [transferAmt, setTransferAmt] = useState('');
  const [transferring, setTransferring] = useState(false);
  const [resolvedName, setResolvedName] = useState('');
  const [lookupLoading, setLookupLoading] = useState(false);
  const lookupTimer = useRef(null);

  // Debounced lookup: auto-fetch name when identifier changes
  useEffect(() => {
    setResolvedName('');
    if (!toIdentifier.trim()) return;
    clearTimeout(lookupTimer.current);
    setLookupLoading(true);
    lookupTimer.current = setTimeout(async () => {
      try {
        const r = await fetch(`${API_URL}/api/lookup-user?identifier=${encodeURIComponent(toIdentifier.trim())}`);
        const d = await r.json();
        setResolvedName(r.ok ? d.name : '');
      } catch { setResolvedName(''); }
      finally { setLookupLoading(false); }
    }, 600);
    return () => clearTimeout(lookupTimer.current);
  }, [toIdentifier]);

  const plan = PLANS.find(p => p.id === user.plan) || PLANS[0];

  const doTransfer = async () => {
    const amt = Number(transferAmt);
    if (!toIdentifier.trim() || !amt || amt <= 0) return;
    if (amt > user.balance) { showToast(lang === 'bn' ? 'অপর্যাপ্ত ব্যালেন্স' : 'Insufficient balance', 'error'); return; }
    setTransferring(true);
    try {
      const r = await fetch(`${API_URL}/api/transfer`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fromUserId: user.id, toIdentifier: toIdentifier.trim(), amount: amt }),
      });
      const data = await r.json();
      if (!r.ok) { showToast(data.error || 'Transfer failed', 'error'); return; }
      setUser(p => p ? { ...p, balance: data.newBalance } : p);
      showToast(lang === 'bn' ? `${data.receiverName}-কে ${convertCurrency(amt, lang)} ট্রান্সফার সফল` : `Transferred ${convertCurrency(amt, lang)} to ${data.receiverName}`, 'success');
      setToIdentifier('');
      setTransferAmt('');
      setResolvedName('');
      // Refresh log
      fetch(`${API_URL}/api/user/${user.id}/balance-log`)
        .then(r => r.json())
        .then(d => { setLog(d.log || []); setSummary(d.summary || {}); })
        .catch(() => {});
    } finally {
      setTransferring(false);
    }
  };

  useEffect(() => {
    if (!user?.id) return;
    setLoading(true);
    fetch(`${API_URL}/api/user/${user.id}/balance-log`)
      .then(r => r.json())
      .then(data => {
        setLog(data.log || []);
        setSummary(data.summary || { daily_earned: 0, referral_earned: 0, team_earned: 0 });
        if (typeof data.balance === 'number') {
          setUser(p => p ? { ...p, balance: data.balance } : p);
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [user?.id]);

  const mfgEarnings  = summary.daily_earned   || 0;
  const refEarnings  = summary.referral_earned || 0;
  const teamEarnings = summary.team_earned     || 0;
  const totalEarnings = mfgEarnings + refEarnings + teamEarnings;

  return (
    <>
      <div className="screen-title"><img src="/balanceicon.png" alt="balance" style={{ width: 18, height: 18, objectFit: 'contain', verticalAlign: 'middle' }} /> {t.balance_screen}</div>

      {/* Main Balance */}
      <div className="card" style={{ background: 'linear-gradient(135deg,rgba(35,175,145,.1),rgba(99,102,241,.1))', borderColor: 'rgba(35,175,145,.3)', textAlign: 'center' }}>
        <div style={{ fontSize: 12, color: 'var(--text2)', marginBottom: 10 }}>{t.your_balance}</div>
        <div className="big-balance"><Icons.Coin size={32} />{convertCurrency(user.balance, lang)}</div>
        <div style={{ fontSize: 12, color: 'var(--text2)', marginTop: 6 }}>{t.credits_label}</div>
        <div style={{ marginTop: 12 }}><span className="badge badge-blue">{plan.name} {t.plan_label}</span></div>
      </div>

      {/* Earnings Summary */}
      <div className="card">
        <div className="card-title"><Icons.TrendUp size={14} /> {t.earn_breakdown}</div>
        <div style={{ textAlign: 'center', marginBottom: 12 }}>
          <div style={{ fontFamily: 'Space Grotesk', fontSize: 24, fontWeight: 900, color: 'var(--green)' }}>{convertCurrency(totalEarnings, lang)}</div>
          <div style={{ fontSize: 11, color: 'var(--text2)', marginTop: 4 }}>
            {user.dailyDone}/{plan.daily} {t.completed} · {convertCurrency(plan.perTask, lang)}/{lang === 'bn' ? 'টাস্ক' : 'task'}
          </div>
        </div>
        {[
          { label: t.mfg_earn,        amt: mfgEarnings,  Icon: Icons.Work,   desc: `${user.dailyDone} × ${convertCurrency(plan.perTask, lang)}` },
          { label: t.referral_profit, amt: refEarnings,   Icon: Icons.Link,   desc: 'L1 (20%)' },
          { label: t.team_commission, amt: teamEarnings,  Icon: Icons.People, desc: 'L2 (4%) + L3 (1%)' },
        ].map((e, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 0', borderBottom: i < 2 ? '1px solid var(--border)' : 'none' }}>
            <span style={{ color: 'var(--accent)', display: 'flex', flexShrink: 0 }}><e.Icon size={18} /></span>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 600 }}>{e.label}</div>
              <div style={{ fontSize: 10, color: 'var(--text2)' }}>{e.desc}</div>
            </div>
            <span style={{ fontFamily: 'Space Grotesk', fontSize: 13, color: 'var(--green)', flexShrink: 0 }}>+{convertCurrency(e.amt, lang)}</span>
          </div>
        ))}
      </div>

      {/* Plan Info */}
      <div className="card">
        <div className="card-title"><Icons.Coin size={14} /> {t.your_plan}</div>
        <div className="stats-row">
          <div className="stat-box">
            <div className="stat-num" style={{ color: plan.color }}>{convertCurrency(plan.perTask, lang)}</div>
            <div className="stat-label">{t.per_task}</div>
          </div>
          <div className="stat-box">
            <div className="stat-num" style={{ color: 'var(--green)' }}>{convertCurrency(plan.dailyEarn, lang)}</div>
            <div className="stat-label">{t.per_day}</div>
          </div>
          <div className="stat-box">
            <div className="stat-num">{plan.daily}</div>
            <div className="stat-label">{t.tasks_per_day}</div>
          </div>
        </div>
      </div>

      {/* Credit Transfer */}
      <div className="card">
        <div className="card-title"><Icons.Link size={14} /> {lang === 'bn' ? 'ক্রেডিট ট্রান্সফার' : 'Credit Transfer'}</div>
        <div style={{
          background: isDark ? 'rgba(35,175,145,0.07)' : 'linear-gradient(135deg,rgba(35,175,145,.12),rgba(99,102,241,.12))',
          border: isDark ? '1px solid rgba(35,175,145,0.15)' : '1px solid rgba(35,175,145,.3)',
          borderRadius: 10, padding: 14, marginBottom: 16, textAlign: 'center'
        }}>
          <div style={{ fontSize: 11, color: 'var(--text2)', marginBottom: 6 }}>{lang === 'bn' ? 'পাঠানোযোগ্য ব্যালেন্স' : 'Available Balance'}</div>
          <div style={{ fontFamily: 'Space Grotesk', fontSize: 'clamp(20px,5vw,28px)', color: 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
            <Icons.Coin size={20} />{convertCurrency(user.balance, lang)}
          </div>
        </div>
        <div className="input-wrap">
          <label className="input-label">{lang === 'bn' ? 'প্রাপকের ফোন / ইমেইল' : 'Recipient Phone / Email'}</label>
          <input
            className="inp"
            placeholder={lang === 'bn' ? 'ফোন নম্বর বা ইমেইল লিখুন' : 'Enter phone or email'}
            value={toIdentifier}
            onChange={e => setToIdentifier(e.target.value)}
          />
          {toIdentifier.trim() && (
            <div style={{ marginTop: 6, fontSize: 12, display: 'flex', alignItems: 'center', gap: 6 }}>
              {lookupLoading ? (
                <span style={{ color: 'var(--text2)' }}>{lang === 'bn' ? 'খোঁজা হচ্ছে...' : 'Looking up...'}</span>
              ) : resolvedName ? (
                <>
                  <span style={{ color: 'var(--green)' }}>✓</span>
                  <span style={{ color: 'var(--green)', fontWeight: 600 }}>{resolvedName}</span>
                </>
              ) : (
                <span style={{ color: 'var(--red)' }}>{lang === 'bn' ? 'ব্যবহারকারী পাওয়া যায়নি' : 'User not found'}</span>
              )}
            </div>
          )}
        </div>
        <div className="input-wrap">
          <label className="input-label">{lang === 'bn' ? 'পরিমাণ (৳)' : 'Amount (৳)'}</label>
          <input
            className="inp"
            type="number"
            placeholder={lang === 'bn' ? 'পরিমাণ লিখুন' : 'Enter amount'}
            value={transferAmt}
            onChange={e => setTransferAmt(e.target.value)}
          />
        </div>
        <div style={{ background: 'rgba(217,119,6,.08)', border: '1px solid rgba(217,119,6,.2)', borderRadius: 10, padding: 12, marginBottom: 14, fontSize: 12, color: 'var(--yellow)' }}>
          {lang === 'bn' ? 'ট্রান্সফার করা ক্রেডিট ফেরত নেওয়া যাবে না। সঠিক তথ্য নিশ্চিত করুন।' : 'Transferred credits cannot be reversed. Please verify recipient details.'}
        </div>
        <button
          className="btn btn-primary btn-full"
          disabled={transferring || !toIdentifier.trim() || !transferAmt || !resolvedName}
          onClick={doTransfer}
        >
          {transferring
            ? (lang === 'bn' ? 'প্রসেস হচ্ছে...' : 'Processing...')
            : <><Icons.Link size={16} /> {lang === 'bn' ? 'ট্রান্সফার করুন' : 'Transfer'}</>
          }
        </button>
      </div>

      {/* Activity Log */}
      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <div className="card-title" style={{ padding: '14px 16px 10px' }}>
          <Icons.TrendUp size={14} /> {lang === 'bn' ? 'ব্যালেন্স অ্যাক্টিভিটি' : 'Balance Activity'}
        </div>
        {loading ? (
          <div style={{ padding: '16px', textAlign: 'center', color: 'var(--text2)', fontSize: 12 }}>...</div>
        ) : log.length === 0 ? (
          <div style={{ padding: '20px', textAlign: 'center', color: 'var(--text2)', fontSize: 12 }}>
            {lang === 'bn' ? 'কোনো অ্যাক্টিভিটি নেই।' : 'No activity yet.'}
          </div>
        ) : (
          log.map((entry, i) => {
            const meta = LOG_META[entry.type] || { icon: '📋', colorPos: entry.amount >= 0 };
            const isCredit = entry.amount >= 0;
            return (
              <div key={entry.id} style={{
                display: 'flex', alignItems: 'flex-start', gap: 12,
                padding: '11px 16px',
                borderBottom: i < log.length - 1 ? '1px solid var(--border)' : 'none',
              }}>
                <div style={{
                  width: 36, height: 36, borderRadius: '50%', flexShrink: 0,
                  background: isCredit ? 'rgba(35,175,145,.12)' : 'rgba(246,70,93,.12)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 17,
                }}>
                  {meta.icon}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)' }}>
                    {getLabel(entry.type, lang)}
                  </div>
                  {entry.note ? (
                    <div style={{ fontSize: 11, color: 'var(--text2)', marginTop: 2, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {entry.note}
                    </div>
                  ) : null}
                  <div style={{ fontSize: 10, color: 'var(--text2)', marginTop: 1 }}>{formatDate(entry.created_at, lang)}</div>
                </div>
                <div style={{
                  fontFamily: 'Space Grotesk', fontSize: 14, fontWeight: 700, flexShrink: 0,
                  color: isCredit ? 'var(--green)' : '#F6465D',
                }}>
                  {isCredit ? '+' : ''}{convertCurrency(Math.abs(entry.amount), lang)}
                </div>
              </div>
            );
          })
        )}
      </div>
    </>
  );
}

export default BalanceScreen;
