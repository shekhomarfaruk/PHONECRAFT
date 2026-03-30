import React from 'react';

export default function Slide10({ base = '/' }: { base?: string }) {
  return (
    <div className="slide-root" style={{ background: 'linear-gradient(145deg, #f0f9ff 0%, #e0f2fe 40%, #f0fdf4 100%)', fontFamily: 'Space Grotesk, sans-serif' }}>
      <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse 90% 80% at 50% 50%, rgba(14,165,233,0.08) 0%, rgba(99,102,241,0.05) 40%, transparent 70%)' }} />
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '3px', background: 'linear-gradient(to right, #6366f1, #0ea5e9, #6366f1)' }} />
      <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '3px', background: 'linear-gradient(to right, #6366f1, #0ea5e9, #6366f1)' }} />

      <div style={{ position: 'relative', zIndex: 2, display: 'flex', flexDirection: 'column', height: '100%', alignItems: 'center', justifyContent: 'center', padding: '0 10vw', textAlign: 'center' }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.6vw', background: 'rgba(14,165,233,0.1)', border: '1px solid rgba(14,165,233,0.3)', borderRadius: '999px', padding: '0.6vh 1.5vw', marginBottom: '3.5vh' }}>
          <div style={{ width: '0.6vw', height: '0.6vw', borderRadius: '50%', background: '#0ea5e9' }} />
          <span style={{ fontSize: '1.1vw', color: '#0284c7', letterSpacing: '0.15em', fontWeight: 600 }}>NOW LIVE AT PHONECRAFT.TECH</span>
        </div>

        <h2 style={{ fontSize: '6vw', fontWeight: 900, letterSpacing: '-0.03em', lineHeight: 1, marginBottom: '2.5vh', color: '#0f172a' }}>
          Start Earning<br /><span style={{ color: '#0ea5e9' }}>Real Money</span><br />Today
        </h2>

        <p style={{ fontSize: '1.7vw', color: '#475569', maxWidth: '55vw', lineHeight: 1.7, marginBottom: '5vh', fontFamily: 'Inter, sans-serif' }}>
          Join 58,800+ members across 7 countries who are earning daily by manufacturing virtual phones. Real tasks, real withdrawals, real income.
        </p>

        <div style={{ display: 'flex', gap: '2vw', marginBottom: '6vh' }}>
          {[
            { val: '58,800+', label: 'Active Members' },
            { val: '$0.81',   label: 'Max Per Task' },
            { val: '7',       label: 'Countries' },
            { val: '24/7',    label: 'Live Support' },
          ].map(s => (
            <div key={s.label} style={{ background: '#ffffff', border: '1px solid rgba(14,165,233,0.18)', borderRadius: '14px', padding: '2.5vh 2.5vw', boxShadow: '0 4px 20px rgba(0,0,0,0.07)' }}>
              <div style={{ fontSize: '3vw', fontWeight: 900, color: '#0ea5e9', lineHeight: 1 }}>{s.val}</div>
              <div style={{ fontSize: '1vw', color: '#64748b', marginTop: '0.8vh', fontFamily: 'Inter, sans-serif' }}>{s.label}</div>
            </div>
          ))}
        </div>

        <div style={{ background: 'linear-gradient(135deg, #0ea5e9, #0284c7)', borderRadius: '12px', padding: '1.8vh 4vw', marginBottom: '3vh', boxShadow: '0 6px 24px rgba(14,165,233,0.35)' }}>
          <span style={{ fontSize: '1.8vw', fontWeight: 800, color: '#ffffff', letterSpacing: '-0.01em' }}>phonecraft.tech</span>
        </div>

        <p style={{ fontSize: '1.2vw', color: '#64748b', fontFamily: 'Inter, sans-serif' }}>
          Available on Android, iPhone &amp; Web Browser — Install as App (PWA)
        </p>
      </div>

      <div style={{ position: 'absolute', bottom: '2.5vh', right: '5vw', fontSize: '1vw', color: 'rgba(100,116,139,0.6)' }}>10 / 10</div>
    </div>
  );
}
