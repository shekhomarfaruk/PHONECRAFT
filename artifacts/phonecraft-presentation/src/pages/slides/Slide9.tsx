import React from 'react';

const screens = [
  { file: 'screen-balance.jpg',  label: 'Balance',      sub: 'Earnings breakdown & 7-day chart', color: '#34d399' },
  { file: 'screen-guide.jpg',    label: 'User Guide',   sub: 'Step-by-step help for every screen', color: '#38bdf8' },
  { file: 'screen-settings.jpg', label: 'Settings',     sub: 'Language, font size, notifications', color: '#94a3b8' },
  { file: 'screen-teamchat.jpg', label: 'Team Chat',    sub: 'Chat & members with your referrals',  color: '#2dd4bf' },
];

export default function Slide9({ base = '/' }: { base?: string }) {
  return (
    <div className="slide-root" style={{ background: '#06091a', fontFamily: 'Inter, sans-serif' }}>
      <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse 80% 50% at 50% 0%, rgba(52,211,153,0.06) 0%, transparent 60%)' }} />
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '2px', background: 'linear-gradient(to right, transparent, #34d399, transparent)' }} />

      <div style={{ position: 'relative', zIndex: 2, display: 'flex', flexDirection: 'column', height: '100%', padding: '4vh 5vw 3vh' }}>
        <div style={{ textAlign: 'center', marginBottom: '3.5vh' }}>
          <div style={{ fontSize: '1.05vw', color: '#34d399', letterSpacing: '0.15em', fontWeight: 600, marginBottom: '0.8vh', fontFamily: 'Space Grotesk, sans-serif' }}>APP SCREENSHOTS — PART 3 / 3</div>
          <h2 style={{ fontSize: '3.5vw', fontWeight: 800, color: '#f0f4ff', letterSpacing: '-0.02em', fontFamily: 'Space Grotesk, sans-serif', lineHeight: 1.1 }}>
            Additional <span style={{ color: '#34d399' }}>Screens</span>
          </h2>
        </div>

        <div style={{ flex: 1, display: 'flex', gap: '3vw', alignItems: 'flex-start', justifyContent: 'center' }}>
          {screens.map((s) => (
            <div key={s.file} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1.8vh', flex: '0 0 auto' }}>
              <div style={{ width: '16vw', borderRadius: '1.5vw', overflow: 'hidden', boxShadow: `0 0 40px ${s.color}33, 0 20px 40px rgba(0,0,0,0.7)`, border: `2px solid ${s.color}44` }}>
                <img src={`${base}${s.file}`} alt={s.label} style={{ width: '100%', display: 'block' }} />
              </div>
              <div style={{ background: 'rgba(13,20,48,0.9)', border: `1px solid ${s.color}33`, borderRadius: '10px', padding: '1.2vh 1.4vw', textAlign: 'center', width: '16vw' }}>
                <div style={{ fontSize: '1.15vw', fontWeight: 700, color: s.color, fontFamily: 'Space Grotesk, sans-serif' }}>{s.label}</div>
                <div style={{ fontSize: '0.95vw', color: '#8892a4', marginTop: '0.3vh', lineHeight: 1.4 }}>{s.sub}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div style={{ position: 'absolute', bottom: '2.5vh', right: '5vw', fontSize: '1vw', color: 'rgba(136,146,164,0.5)' }}>9 / 10</div>
    </div>
  );
}
