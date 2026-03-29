import React from 'react';

const screens = [
  { file: 'screen-home.jpg',   label: 'Dashboard',    sub: 'Balance, plan & quick actions',  color: '#00d4aa' },
  { file: 'screen-work.jpg',   label: 'Work Screen',  sub: 'Daily manufacturing tasks',       color: '#a855f7' },
  { file: 'screen-wallet.jpg', label: 'Wallet',       sub: 'Withdraw to bKash / Crypto',      color: '#60a5fa' },
  { file: 'screen-refer.jpg',  label: 'Referral',     sub: 'QR code & commission levels',     color: '#f97316' },
];

export default function Slide7({ base = '/' }: { base?: string }) {
  return (
    <div className="slide-root" style={{ background: '#06091a', fontFamily: 'Inter, sans-serif' }}>
      <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse 80% 50% at 50% 0%, rgba(0,212,170,0.06) 0%, transparent 60%)' }} />
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '2px', background: 'linear-gradient(to right, transparent, #00d4aa, transparent)' }} />

      <div style={{ position: 'relative', zIndex: 2, display: 'flex', flexDirection: 'column', height: '100%', padding: '4vh 5vw 3vh' }}>
        <div style={{ textAlign: 'center', marginBottom: '3.5vh' }}>
          <div style={{ fontSize: '1.05vw', color: '#00d4aa', letterSpacing: '0.15em', fontWeight: 600, marginBottom: '0.8vh', fontFamily: 'Space Grotesk, sans-serif' }}>APP SCREENSHOTS — PART 1 / 3</div>
          <h2 style={{ fontSize: '3.5vw', fontWeight: 800, color: '#f0f4ff', letterSpacing: '-0.02em', fontFamily: 'Space Grotesk, sans-serif', lineHeight: 1.1 }}>
            Core <span style={{ color: '#00d4aa' }}>Screens</span>
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

      <div style={{ position: 'absolute', bottom: '2.5vh', right: '5vw', fontSize: '1vw', color: 'rgba(136,146,164,0.5)' }}>7 / 10</div>
    </div>
  );
}
