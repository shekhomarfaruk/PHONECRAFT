export default function GuestExpiredModal({ lang, onRegister, onLogout }) {
  const isBn = lang === 'bn';
  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 9999,
      background: 'rgba(0,0,0,0.92)', backdropFilter: 'blur(12px)',
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      padding: 24, textAlign: 'center',
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

      <div style={{ animation: 'expiredSlideUp .4s ease', maxWidth: 360, width: '100%' }}>
        <div style={{ fontSize: 64, marginBottom: 16, animation: 'expiredPulse 2s ease-in-out infinite' }}>⏰</div>

        <div style={{
          fontFamily: 'Space Grotesk', fontWeight: 900, fontSize: 26,
          color: '#F6465D', marginBottom: 10, lineHeight: 1.2,
        }}>
          {isBn ? 'গেস্ট ট্রায়াল শেষ হয়েছে!' : 'Guest Trial Ended!'}
        </div>

        <div style={{
          fontSize: 15, color: 'rgba(255,255,255,0.75)', lineHeight: 1.7,
          marginBottom: 28, maxWidth: 300, margin: '0 auto 28px',
        }}>
          {isBn
            ? 'আপনার ১৫ মিনিটের ফ্রি ট্রায়াল শেষ। আসল টাকা আয় করতে একটি অ্যাকাউন্ট খুলুন।'
            : 'Your 15-minute free trial has ended. Register a real account to start earning actual money.'}
        </div>

        <div style={{
          background: 'rgba(0,212,180,0.08)',
          border: '1px solid rgba(0,212,180,0.25)',
          borderRadius: 16, padding: '20px 18px', marginBottom: 24,
          display: 'flex', flexDirection: 'column', gap: 12,
        }}>
          {[
            { icon: '💰', en: 'Earn real BDT/USD every day', bn: 'প্রতিদিন আসল BDT/USD আয় করুন' },
            { icon: '💸', en: 'Withdraw to bKash, Nagad or Crypto', bn: 'bKash, Nagad বা Crypto-তে উইথড্র করুন' },
            { icon: '👥', en: 'Build your referral team & earn bonuses', bn: 'রেফারেল টিম বানিয়ে বোনাস আয় করুন' },
          ].map(({ icon, en, bn }) => (
            <div key={en} style={{ display: 'flex', alignItems: 'center', gap: 12, textAlign: 'left' }}>
              <span style={{ fontSize: 22, flexShrink: 0 }}>{icon}</span>
              <span style={{ fontSize: 14, color: 'rgba(255,255,255,0.85)', fontWeight: 500 }}>
                {isBn ? bn : en}
              </span>
            </div>
          ))}
        </div>

        <button
          onClick={onRegister}
          style={{
            width: '100%', padding: '16px 0', borderRadius: 16,
            background: 'linear-gradient(135deg, #00d4aa, #0099cc)',
            border: 'none', color: '#fff', fontSize: 17, fontWeight: 900,
            fontFamily: 'Space Grotesk', cursor: 'pointer', marginBottom: 12,
            boxShadow: '0 8px 32px rgba(0,212,180,0.4)',
          }}
        >
          {isBn ? '🚀 এখনই অ্যাকাউন্ট খুলুন' : '🚀 Create Account Now'}
        </button>

        <button
          onClick={onLogout}
          style={{
            width: '100%', padding: '10px 0', borderRadius: 12,
            background: 'transparent', border: '1px solid rgba(255,255,255,0.2)',
            color: 'rgba(255,255,255,0.5)', fontSize: 14, cursor: 'pointer',
          }}
        >
          {isBn ? 'লগআউট করুন' : 'Logout'}
        </button>
      </div>
    </div>
  );
}
