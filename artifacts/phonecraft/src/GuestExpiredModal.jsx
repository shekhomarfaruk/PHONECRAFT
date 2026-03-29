import { useState, useEffect } from 'react';

const API_URL = import.meta.env.VITE_API_URL || '';

const PLAN_COLORS = {
  basic:    '#00d2ff',
  premium:  '#7b2fff',
  gold:     '#f59e0b',
  platinum: '#e2e8f0',
};

export default function GuestExpiredModal({ lang, onRegister, onLogout }) {
  const isBn = lang === 'bn';
  const [plans, setPlans] = useState([]);

  useEffect(() => {
    fetch(`${API_URL}/api/plans`)
      .then(r => r.ok ? r.json() : null)
      .then(d => { if (d?.plans?.length) setPlans(d.plans); })
      .catch(() => {});
  }, []);

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 9999,
      background: 'rgba(0,0,0,0.93)', backdropFilter: 'blur(14px)',
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      padding: '20px 16px', overflowY: 'auto',
    }}>
      <style>{`
        @keyframes expiredPulse {
          0%, 100% { transform: scale(1); opacity: 1; }
          50% { transform: scale(1.06); opacity: .85; }
        }
        @keyframes expiredSlideUp {
          0% { opacity: 0; transform: translateY(50px); }
          100% { opacity: 1; transform: translateY(0); }
        }
      `}</style>

      <div style={{ animation: 'expiredSlideUp .4s ease', maxWidth: 400, width: '100%', textAlign: 'center' }}>
        <div style={{ fontSize: 56, marginBottom: 12, animation: 'expiredPulse 2s ease-in-out infinite' }}>⏰</div>

        <div style={{
          fontFamily: 'Space Grotesk', fontWeight: 900, fontSize: 24,
          color: '#F6465D', marginBottom: 8, lineHeight: 1.2,
        }}>
          {isBn ? 'গেস্ট ট্রায়াল শেষ হয়েছে!' : 'Guest Trial Ended!'}
        </div>

        <div style={{
          fontSize: 14, color: 'rgba(255,255,255,0.72)', lineHeight: 1.6,
          marginBottom: 20, maxWidth: 300, margin: '0 auto 20px',
        }}>
          {isBn
            ? 'আপনার ১৫ মিনিটের ফ্রি ট্রায়াল শেষ। আসল টাকা আয় করতে একটি প্ল্যান নিন।'
            : 'Your 15-minute free trial has ended. Register a real account to start earning.'}
        </div>

        {/* Plan tiers */}
        {plans.length > 0 && (
          <div style={{ marginBottom: 20 }}>
            <div style={{
              fontSize: 11, fontWeight: 700, letterSpacing: 1.5,
              color: 'rgba(255,255,255,0.45)', textTransform: 'uppercase',
              marginBottom: 10, textAlign: 'left',
            }}>
              {isBn ? 'প্ল্যান বেছে নিন' : 'Available Plans'}
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {plans.map(p => {
                const color = PLAN_COLORS[p.id] || '#00d4aa';
                return (
                  <div key={p.id} style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    background: `rgba(${hexToRgb(color)},0.08)`,
                    border: `1px solid rgba(${hexToRgb(color)},0.3)`,
                    borderRadius: 12, padding: '10px 14px',
                  }}>
                    <div style={{ textAlign: 'left' }}>
                      <div style={{ fontWeight: 800, fontSize: 13, color, fontFamily: 'Space Grotesk' }}>{p.name}</div>
                      <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.55)', marginTop: 2 }}>
                        {isBn
                          ? `প্রতি টাস্ক ৳${p.per_task} · প্রতিদিন ${p.daily}টি টাস্ক`
                          : `৳${p.per_task}/task · ${p.daily} tasks/day`}
                      </div>
                    </div>
                    <div style={{
                      fontWeight: 900, fontSize: 14, color,
                      fontFamily: 'Space Grotesk', flexShrink: 0, marginLeft: 10,
                    }}>
                      {p.price_display}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Benefits */}
        <div style={{
          background: 'rgba(0,212,180,0.08)',
          border: '1px solid rgba(0,212,180,0.22)',
          borderRadius: 14, padding: '16px 16px', marginBottom: 20,
          display: 'flex', flexDirection: 'column', gap: 10,
        }}>
          {[
            { icon: '💰', en: 'Earn real BDT/USD every day', bn: 'প্রতিদিন আসল BDT/USD আয় করুন' },
            { icon: '💸', en: 'Withdraw to bKash, Nagad or Crypto', bn: 'bKash, Nagad বা Crypto-তে উইথড্র করুন' },
            { icon: '👥', en: 'Build your referral team & earn bonuses', bn: 'রেফারেল টিম বানিয়ে বোনাস আয় করুন' },
          ].map(({ icon, en, bn }) => (
            <div key={en} style={{ display: 'flex', alignItems: 'center', gap: 10, textAlign: 'left' }}>
              <span style={{ fontSize: 20, flexShrink: 0 }}>{icon}</span>
              <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.82)', fontWeight: 500 }}>
                {isBn ? bn : en}
              </span>
            </div>
          ))}
        </div>

        <button
          onClick={onRegister}
          style={{
            width: '100%', padding: '15px 0', borderRadius: 14,
            background: 'linear-gradient(135deg, #00d4aa, #0099cc)',
            border: 'none', color: '#fff', fontSize: 16, fontWeight: 900,
            fontFamily: 'Space Grotesk', cursor: 'pointer', marginBottom: 10,
            boxShadow: '0 8px 28px rgba(0,212,180,0.4)',
          }}
        >
          {isBn ? '🚀 এখনই অ্যাকাউন্ট খুলুন' : '🚀 Create Account Now'}
        </button>

        <button
          onClick={onLogout}
          style={{
            width: '100%', padding: '10px 0', borderRadius: 12,
            background: 'transparent', border: '1px solid rgba(255,255,255,0.18)',
            color: 'rgba(255,255,255,0.45)', fontSize: 13, cursor: 'pointer',
          }}
        >
          {isBn ? 'লগআউট করুন' : 'Logout'}
        </button>
      </div>
    </div>
  );
}

function hexToRgb(hex) {
  const h = hex.replace('#', '');
  const r = parseInt(h.substring(0, 2), 16);
  const g = parseInt(h.substring(2, 4), 16);
  const b = parseInt(h.substring(4, 6), 16);
  return `${r},${g},${b}`;
}
