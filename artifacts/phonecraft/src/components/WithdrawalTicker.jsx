import { useState, useEffect, useRef } from "react";
import Icons from "../Icons.jsx";
import { I18N } from "../i18n.js";
import { convertCurrency } from "../currency.js";

const API_URL = import.meta.env.VITE_API_URL || '';

const FALLBACK_WITHDRAWALS = [
  { name: 'Rahim', amount: 500, method: 'bKash' },
  { name: 'Karim', amount: 1200, method: 'Nagad' },
  { name: 'Sumon', amount: 800, method: 'bKash' },
  { name: 'Salma', amount: 2500, method: 'Rocket' },
  { name: 'Jamal', amount: 600, method: 'bKash' },
  { name: 'Mina',  amount: 1500, method: 'Nagad' },
  { name: 'Ratan', amount: 3000, method: 'bKash' },
  { name: 'Parveen', amount: 900, method: 'Rocket' },
];

const METHOD_COLORS = {
  bkash:  '#E2136E',
  nagad:  '#F05A28',
  rocket: '#8B2FC9',
  crypto: '#26A17B',
};

function getMethodColor(method) {
  if (!method) return '#23AF91';
  return METHOD_COLORS[method.toLowerCase()] || '#23AF91';
}

function formatMethod(method) {
  if (!method) return 'bKash';
  const m = method.toLowerCase();
  if (m === 'bkash') return 'bKash';
  if (m === 'nagad') return 'Nagad';
  if (m === 'rocket') return 'Rocket';
  if (m === 'crypto') return 'Crypto';
  return method;
}

export default function WithdrawalTicker({ lang = 'en' }) {
  const t = I18N[lang] || I18N.en;
  const [items, setItems] = useState(FALLBACK_WITHDRAWALS);
  const intervalRef = useRef(null);

  const fetchData = () => {
    fetch(`${API_URL}/api/public/recent-withdrawals`)
      .then(r => r.ok ? r.json() : null)
      .then(d => {
        if (d?.withdrawals?.length > 0) {
          setItems(d.withdrawals);
        }
      })
      .catch(() => {});
  };

  useEffect(() => {
    fetchData();
    intervalRef.current = setInterval(fetchData, 30000);
    return () => clearInterval(intervalRef.current);
  }, []);

  const displayItems = items.length > 0
    ? [...items, ...items]
    : [...FALLBACK_WITHDRAWALS, ...FALLBACK_WITHDRAWALS];

  const dur = Math.max(items.length, FALLBACK_WITHDRAWALS.length) * 2.5;

  return (
    <div className="card" style={{ padding: '14px 0 14px', overflow: 'hidden' }}>
      <div className="card-title" style={{ paddingLeft: 16, marginBottom: 10, display: 'flex', alignItems: 'center', gap: 6 }}>
        <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#23AF91', display: 'inline-block', boxShadow: '0 0 6px #23AF91', animation: 'wtPulse 1.5s ease-in-out infinite' }} />
        <Icons.Coin size={14} /> {t.ticker_title}
      </div>
      <style>{`
        @keyframes wtPulse { 0%,100%{opacity:1} 50%{opacity:0.3} }
        @keyframes wtScroll { 0%{transform:translateY(0)} 100%{transform:translateY(-50%)} }
        .wt-track { display:flex; flex-direction:column; animation:wtScroll ${dur}s linear infinite; }
        .wt-track:hover { animation-play-state:paused; }
        .wt-row { display:flex; align-items:center; gap:10px; padding:8px 16px; border-bottom:1px solid var(--border); }
      `}</style>
      <div style={{ height: 160, overflow: 'hidden' }}>
        <div className="wt-track">
          {displayItems.map((item, i) => {
            const color = getMethodColor(item.method);
            const initial = (item.name || 'U')[0].toUpperCase();
            return (
              <div key={i} className="wt-row">
                <div style={{
                  width: 28, height: 28, borderRadius: '50%',
                  background: `linear-gradient(135deg, ${color}, ${color}99)`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 11, fontWeight: 800, color: '#fff', flexShrink: 0,
                }}>
                  {initial}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 12, fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {item.name} {t.ticker_earned}{' '}
                    <span style={{ color: '#23AF91', fontWeight: 800 }}>{convertCurrency(item.amount, lang)}</span>{' '}
                    {t.ticker_via}{' '}
                    <span style={{ color, fontWeight: 700 }}>{formatMethod(item.method)}</span>
                  </div>
                </div>
                <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#23AF91', flexShrink: 0, boxShadow: '0 0 6px #23AF91' }} />
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
