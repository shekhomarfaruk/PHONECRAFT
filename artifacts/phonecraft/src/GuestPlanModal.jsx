import { useState, useEffect } from "react";
import Icons from "./Icons.jsx";

const API_URL = import.meta.env.VITE_API_URL || '';

export default function GuestPlanModal({ lang, onClose, onRegister }) {
  const isBn = lang === 'bn';
  const [plans, setPlans] = useState([]);

  useEffect(() => {
    fetch(`${API_URL}/api/plans`)
      .then(r => r.json())
      .then(d => { if (d.plans) setPlans(d.plans); })
      .catch(() => {});
  }, []);

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 9998,
      background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(8px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: 16,
    }}>
      <div style={{
        background: 'var(--card)',
        border: '1px solid rgba(0,212,180,.3)',
        borderRadius: 24,
        padding: '28px 20px 24px',
        maxWidth: 380,
        width: '100%',
        maxHeight: '90dvh',
        overflowY: 'auto',
        boxShadow: '0 24px 80px rgba(0,0,0,0.6)',
        animation: 'modalSlideUp .32s cubic-bezier(.34,1.56,.64,1)',
      }}>
        <style>{`
          @keyframes modalSlideUp {
            0% { opacity: 0; transform: translateY(40px) scale(.93); }
            100% { opacity: 1; transform: translateY(0) scale(1); }
          }
        `}</style>

        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 20 }}>
          <div>
            <div style={{ fontSize: 24, marginBottom: 6 }}>🏆</div>
            <div style={{ fontFamily: 'Space Grotesk', fontWeight: 900, fontSize: 20, lineHeight: 1.2 }}>
              {isBn ? 'আসল অ্যাকাউন্ট খুলুন' : 'Upgrade to Real Account'}
            </div>
            <div style={{ fontSize: 13, color: 'var(--text2)', marginTop: 6, lineHeight: 1.5 }}>
              {isBn
                ? 'গেস্ট মোডে ব্যালেন্স যোগ হয় না। আসল টাকা আয় করতে নিচের যেকোনো প্ল্যানে যোগ দিন।'
                : 'Guest accounts don\'t earn real money. Join any plan below to start earning and withdraw real cash.'}
            </div>
          </div>
          <button
            onClick={onClose}
            style={{ background: 'var(--input-bg)', border: '1px solid var(--border)', borderRadius: 8, padding: 6, cursor: 'pointer', color: 'var(--text2)', flexShrink: 0, marginLeft: 12 }}
          >
            <Icons.X size={16} />
          </button>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 20 }}>
          {plans.map(plan => (
            <div key={plan.id} style={{
              background: 'var(--input-bg)',
              border: `1px solid ${plan.color || 'var(--border)'}44`,
              borderRadius: 14,
              padding: '14px 16px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: 12,
            }}>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 800, fontSize: 14, color: plan.color || 'var(--accent)', marginBottom: 3 }}>
                  {plan.name}
                </div>
                <div style={{ fontSize: 11, color: 'var(--text2)' }}>
                  {isBn ? `প্রতি টাস্ক: ৳${plan.per_task}` : `Per task: ৳${plan.per_task}`}
                  {' · '}
                  {isBn ? `দৈনিক: ৳${plan.daily_earn}` : `Daily: ৳${plan.daily_earn}`}
                </div>
              </div>
              <div style={{ textAlign: 'right', flexShrink: 0 }}>
                <div style={{ fontFamily: 'Space Grotesk', fontWeight: 900, fontSize: 16, color: 'var(--text)' }}>
                  {lang === 'bn' ? `৳${plan.rate}` : `$${(plan.rate / 122.80).toFixed(0)}`}
                </div>
                <div style={{ fontSize: 10, color: 'var(--text2)' }}>
                  {isBn ? 'এককালীন' : 'one-time'}
                </div>
              </div>
            </div>
          ))}
        </div>

        <button
          className="btn btn-primary btn-full"
          onClick={onRegister}
          style={{ fontSize: 15, padding: '14px 0', borderRadius: 14, fontWeight: 800 }}
        >
          {isBn ? '🚀 এখনই যোগ দিন' : '🚀 Join Now'}
        </button>
        <button
          onClick={onClose}
          style={{ marginTop: 10, width: '100%', background: 'transparent', border: 'none', color: 'var(--text2)', fontSize: 13, cursor: 'pointer', padding: '6px 0' }}
        >
          {isBn ? 'পরে করব' : 'Maybe later'}
        </button>
      </div>
    </div>
  );
}
