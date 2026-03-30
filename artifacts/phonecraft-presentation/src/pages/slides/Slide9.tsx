import React from 'react';

const screens = [
  { file: 'screen-balance.jpg',  label: 'Balance',      sub: 'Earnings breakdown & 7-day chart', color: '#10b981' },
  { file: 'screen-guide.jpg',    label: 'User Guide',   sub: 'Step-by-step help for every screen', color: '#0ea5e9' },
  { file: 'screen-settings.jpg', label: 'Settings',     sub: 'Language, font size, notifications', color: '#64748b' },
  { file: 'screen-teamchat.jpg', label: 'Team Chat',    sub: 'Chat & members with your referrals',  color: '#14b8a6' },
];

export default function Slide9({ base = '/' }: { base?: string }) {
  return (
    <div className="slide-root" style={{ background: 'linear-gradient(155deg, #f0fdf4 0%, #f0f9ff 50%, #f8fafc 100%)', fontFamily: 'Inter, sans-serif' }}>
      <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse 80% 50% at 50% 0%, rgba(16,185,129,0.05) 0%, transparent 60%)' }} />
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '3px', background: 'linear-gradient(to right, transparent, #10b981, transparent)' }} />

      <div style={{ position: 'relative', zIndex: 2, display: 'flex', flexDirection: 'column', height: '100%', padding: '4vh 5vw 3vh' }}>
        <div style={{ textAlign: 'center', marginBottom: '3.5vh' }}>
          <div style={{ fontSize: '1.05vw', color: '#059669', letterSpacing: '0.15em', fontWeight: 600, marginBottom: '0.8vh', fontFamily: 'Space Grotesk, sans-serif' }}>APP SCREENSHOTS — PART 3 / 3</div>
          <h2 style={{ fontSize: '3.5vw', fontWeight: 800, color: '#0f172a', letterSpacing: '-0.02em', fontFamily: 'Space Grotesk, sans-serif', lineHeight: 1.1 }}>
            Additional <span style={{ color: '#10b981' }}>Screens</span>
          </h2>
        </div>

        <div style={{ flex: 1, display: 'flex', gap: '3vw', alignItems: 'flex-start', justifyContent: 'center' }}>
          {screens.map((s) => (
            <div key={s.file} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1.8vh', flex: '0 0 auto' }}>
              <div style={{ width: '16vw', borderRadius: '1.5vw', overflow: 'hidden', boxShadow: `0 8px 30px ${s.color}20, 0 20px 40px rgba(0,0,0,0.08)`, border: `2px solid ${s.color}30`, background: '#fff' }}>
                <img src={`${base}${s.file}`} alt={s.label} style={{ width: '100%', display: 'block' }} />
              </div>
              <div style={{ background: '#ffffff', border: `1px solid ${s.color}22`, borderRadius: '10px', padding: '1.2vh 1.4vw', textAlign: 'center', width: '16vw', boxShadow: '0 2px 10px rgba(0,0,0,0.06)' }}>
                <div style={{ fontSize: '1.15vw', fontWeight: 700, color: s.color, fontFamily: 'Space Grotesk, sans-serif' }}>{s.label}</div>
                <div style={{ fontSize: '0.95vw', color: '#64748b', marginTop: '0.3vh', lineHeight: 1.4 }}>{s.sub}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div style={{ position: 'absolute', bottom: '2.5vh', right: '5vw', fontSize: '1vw', color: 'rgba(100,116,139,0.6)' }}>9 / 10</div>
    </div>
  );
}
