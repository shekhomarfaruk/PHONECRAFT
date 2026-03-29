import React from 'react';

export default function Slide8({ base = '/' }: { base?: string }) {
  return (
    <div className="slide-root" style={{ background: '#06091a', fontFamily: 'Space Grotesk, sans-serif' }}>
      <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse 90% 80% at 50% 50%, rgba(0,212,170,0.08) 0%, rgba(124,58,237,0.06) 40%, transparent 70%)' }} />
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '3px', background: 'linear-gradient(to right, #7c3aed, #00d4aa, #7c3aed)' }} />
      <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '3px', background: 'linear-gradient(to right, #7c3aed, #00d4aa, #7c3aed)' }} />

      <div style={{ position: 'relative', zIndex: 2, display: 'flex', flexDirection: 'column', height: '100%', alignItems: 'center', justifyContent: 'center', padding: '0 10vw', textAlign: 'center' }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.6vw', background: 'rgba(0,212,170,0.1)', border: '1px solid rgba(0,212,170,0.3)', borderRadius: '999px', padding: '0.6vh 1.5vw', marginBottom: '3.5vh' }}>
          <div style={{ width: '0.6vw', height: '0.6vw', borderRadius: '50%', background: '#00d4aa' }} />
          <span style={{ fontSize: '1.1vw', color: '#00d4aa', letterSpacing: '0.15em', fontWeight: 600 }}>NOW LIVE AT PHONECRAFT.TECH</span>
        </div>

        <h2 style={{ fontSize: '6vw', fontWeight: 900, letterSpacing: '-0.03em', lineHeight: 1, marginBottom: '2.5vh', color: '#f0f4ff' }}>
          Start Earning<br /><span style={{ color: '#00d4aa' }}>Real Money</span><br />Today
        </h2>

        <p style={{ fontSize: '1.7vw', color: '#8892a4', maxWidth: '55vw', lineHeight: 1.7, marginBottom: '5vh', fontFamily: 'Inter, sans-serif' }}>
          Join 58,800+ members across 7 countries who are earning daily by manufacturing virtual phones. Real tasks, real withdrawals, real income.
        </p>

        <div style={{ display: 'flex', gap: '2vw', marginBottom: '6vh' }}>
          {[
            { val: '58,800+', label: 'Active Members' },
            { val: '$0.81', label: 'Max Per Task' },
            { val: '7', label: 'Countries' },
            { val: '24/7', label: 'Live Support' },
          ].map(s => (
            <div key={s.label} style={{ background: 'rgba(13,20,48,0.8)', border: '1px solid rgba(0,212,170,0.15)', borderRadius: '14px', padding: '2.5vh 2.5vw' }}>
              <div style={{ fontSize: '3vw', fontWeight: 900, color: '#00d4aa', lineHeight: 1 }}>{s.val}</div>
              <div style={{ fontSize: '1vw', color: '#8892a4', marginTop: '0.8vh', fontFamily: 'Inter, sans-serif' }}>{s.label}</div>
            </div>
          ))}
        </div>

        <div style={{ background: 'linear-gradient(135deg, #00d4aa, #00b891)', borderRadius: '12px', padding: '1.8vh 4vw', marginBottom: '3vh' }}>
          <span style={{ fontSize: '1.8vw', fontWeight: 800, color: '#06091a', letterSpacing: '-0.01em' }}>phonecraft.tech</span>
        </div>

        <p style={{ fontSize: '1.2vw', color: '#8892a4', fontFamily: 'Inter, sans-serif' }}>
          Available on Android, iPhone &amp; Web Browser — Install as App (PWA)
        </p>
      </div>
    </div>
  );
}
