import React from 'react';

const screens = [
  { file: 'screen-home.jpg',   label: 'Dashboard',    sub: 'Balance, plan & quick actions',  color: '#0ea5e9' },
  { file: 'screen-work.jpg',   label: 'Work Screen',  sub: 'Daily manufacturing tasks',       color: '#6366f1' },
  { file: 'screen-wallet.jpg', label: 'Wallet',       sub: 'Withdraw to bKash / Crypto',      color: '#0284c7' },
  { file: 'screen-refer.jpg',  label: 'Referral',     sub: 'QR code & commission levels',     color: '#8b5cf6' },
];

export default function Slide7({ base = '/' }: { base?: string }) {
  return (
    <div className="slide-root" style={{ background: 'linear-gradient(160deg, #f8fafc 0%, #f0f9ff 60%, #faf5ff 100%)', fontFamily: 'Inter, sans-serif' }}>
      <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse 80% 50% at 50% 0%, rgba(14,165,233,0.05) 0%, transparent 60%)' }} />
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '3px', background: 'linear-gradient(to right, transparent, #0ea5e9, transparent)' }} />

      <div style={{ position: 'relative', zIndex: 2, display: 'flex', flexDirection: 'column', height: '100%', padding: '4vh 5vw 3vh' }}>
        <div style={{ textAlign: 'center', marginBottom: '3.5vh' }}>
          <div style={{ fontSize: '1.05vw', color: '#0284c7', letterSpacing: '0.15em', fontWeight: 600, marginBottom: '0.8vh', fontFamily: 'Space Grotesk, sans-serif' }}>APP SCREENSHOTS — PART 1 / 3</div>
          <h2 style={{ fontSize: '3.5vw', fontWeight: 800, color: '#0f172a', letterSpacing: '-0.02em', fontFamily: 'Space Grotesk, sans-serif', lineHeight: 1.1 }}>
            Core <span style={{ color: '#0ea5e9' }}>Screens</span>
          </h2>
        </div>

        <div style={{ flex: 1, display: 'flex', gap: '3vw', alignItems: 'flex-start', justifyContent: 'center' }}>
          {screens.map((s) => (
            <div key={s.file} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1.8vh', flex: '0 0 auto' }}>
              <div style={{ width: '16vw', borderRadius: '1.5vw', overflow: 'hidden', boxShadow: `0 8px 30px ${s.color}22, 0 20px 40px rgba(0,0,0,0.1)`, border: `2px solid ${s.color}33`, background: '#fff' }}>
                <img src={`${base}${s.file}`} alt={s.label} style={{ width: '100%', display: 'block' }} />
              </div>
              <div style={{ background: '#ffffff', border: `1px solid ${s.color}25`, borderRadius: '10px', padding: '1.2vh 1.4vw', textAlign: 'center', width: '16vw', boxShadow: '0 2px 10px rgba(0,0,0,0.06)' }}>
                <div style={{ fontSize: '1.15vw', fontWeight: 700, color: s.color, fontFamily: 'Space Grotesk, sans-serif' }}>{s.label}</div>
                <div style={{ fontSize: '0.95vw', color: '#64748b', marginTop: '0.3vh', lineHeight: 1.4 }}>{s.sub}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div style={{ position: 'absolute', bottom: '2.5vh', right: '5vw', fontSize: '1vw', color: 'rgba(100,116,139,0.6)' }}>7 / 10</div>
    </div>
  );
}
