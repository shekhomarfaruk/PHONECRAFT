import React from 'react';

export default function Slide7({ base = '/' }: { base?: string }) {
  return (
    <div className="slide-root" style={{ background: '#06091a', fontFamily: 'Inter, sans-serif' }}>
      <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse 100% 60% at 50% 100%, rgba(0,212,170,0.05) 0%, transparent 70%)' }} />

      <div style={{ position: 'relative', zIndex: 2, display: 'flex', flexDirection: 'column', height: '100%', padding: '5vh 5vw' }}>
        <div style={{ textAlign: 'center', marginBottom: '4vh' }}>
          <div style={{ fontSize: '1.1vw', color: '#00d4aa', letterSpacing: '0.15em', fontWeight: 600, marginBottom: '1vh', fontFamily: 'Space Grotesk, sans-serif' }}>ACTUAL APP SCREENS</div>
          <h2 style={{ fontSize: '3.8vw', fontWeight: 800, color: '#f0f4ff', letterSpacing: '-0.02em', fontFamily: 'Space Grotesk, sans-serif', lineHeight: 1.1 }}>
            App <span style={{ color: '#00d4aa' }}>Screenshots</span>
          </h2>
        </div>

        <div style={{ flex: 1, display: 'flex', gap: '3vw', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2vh' }}>
            <div style={{ width: '20vw', borderRadius: '2vw', overflow: 'hidden', boxShadow: '0 0 50px rgba(0,212,170,0.22), 0 25px 50px rgba(0,0,0,0.6)', border: '2px solid rgba(0,212,170,0.25)' }}>
              <img src={`${base}ss-dashboard.jpg`} alt="Dashboard Screen" style={{ width: '100%', display: 'block' }} />
            </div>
            <div style={{ background: 'rgba(13,20,48,0.8)', border: '1px solid rgba(0,212,170,0.2)', borderRadius: '10px', padding: '1.2vh 1.8vw', textAlign: 'center' }}>
              <div style={{ fontSize: '1.2vw', fontWeight: 700, color: '#00d4aa', fontFamily: 'Space Grotesk, sans-serif' }}>Dashboard</div>
              <div style={{ fontSize: '1vw', color: '#8892a4', marginTop: '0.3vh' }}>Balance, plan info & quick actions</div>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2vh', marginTop: '-6vh' }}>
            <div style={{ width: '20vw', borderRadius: '2vw', overflow: 'hidden', boxShadow: '0 0 50px rgba(124,58,237,0.22), 0 25px 50px rgba(0,0,0,0.6)', border: '2px solid rgba(124,58,237,0.25)' }}>
              <img src={`${base}ss-work.jpg`} alt="Work Screen" style={{ width: '100%', display: 'block' }} />
            </div>
            <div style={{ background: 'rgba(13,20,48,0.8)', border: '1px solid rgba(124,58,237,0.2)', borderRadius: '10px', padding: '1.2vh 1.8vw', textAlign: 'center' }}>
              <div style={{ fontSize: '1.2vw', fontWeight: 700, color: '#a855f7', fontFamily: 'Space Grotesk, sans-serif' }}>Work Screen</div>
              <div style={{ fontSize: '1vw', color: '#8892a4', marginTop: '0.3vh' }}>Manufacturing tasks (9 AM–10 PM BD)</div>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2vh' }}>
            <div style={{ width: '20vw', borderRadius: '2vw', overflow: 'hidden', boxShadow: '0 0 50px rgba(0,184,145,0.22), 0 25px 50px rgba(0,0,0,0.6)', border: '2px solid rgba(0,184,145,0.25)' }}>
              <img src={`${base}ss-wallet.jpg`} alt="Wallet Screen" style={{ width: '100%', display: 'block' }} />
            </div>
            <div style={{ background: 'rgba(13,20,48,0.8)', border: '1px solid rgba(0,184,145,0.2)', borderRadius: '10px', padding: '1.2vh 1.8vw', textAlign: 'center' }}>
              <div style={{ fontSize: '1.2vw', fontWeight: 700, color: '#00b891', fontFamily: 'Space Grotesk, sans-serif' }}>Wallet</div>
              <div style={{ fontSize: '1vw', color: '#8892a4', marginTop: '0.3vh' }}>Withdraw to bKash, Nagad, Crypto & more</div>
            </div>
          </div>
        </div>

        <div style={{ textAlign: 'center', marginTop: '2.5vh' }}>
          <p style={{ fontSize: '1.2vw', color: '#8892a4' }}>
            Available as a Progressive Web App (PWA) — install on Android and iPhone, works offline
          </p>
        </div>
      </div>

      <div style={{ position: 'absolute', bottom: '2.5vh', right: '5vw', fontSize: '1vw', color: 'rgba(136,146,164,0.5)' }}>7 / 8</div>
    </div>
  );
}
