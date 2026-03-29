import React from 'react';

export default function Slide1({ base = '/' }: { base?: string }) {
  return (
    <div className="slide-root" style={{ background: '#06091a', fontFamily: 'Space Grotesk, sans-serif' }}>
      <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse 70% 80% at 30% 50%, rgba(0,212,170,0.06) 0%, transparent 70%), radial-gradient(ellipse 60% 60% at 80% 20%, rgba(124,58,237,0.08) 0%, transparent 60%)' }} />
      <div style={{ position: 'absolute', top: '8vh', left: '5vw', width: '2px', height: '84vh', background: 'linear-gradient(to bottom, transparent, rgba(0,212,170,0.4), transparent)' }} />

      <div style={{ position: 'relative', zIndex: 2, display: 'flex', height: '100%', alignItems: 'center', padding: '0 5vw' }}>
        <div style={{ flex: '0 0 52%', paddingRight: '4vw' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.6vw', background: 'rgba(0,212,170,0.1)', border: '1px solid rgba(0,212,170,0.3)', borderRadius: '999px', padding: '0.5vh 1.2vw', marginBottom: '3vh' }}>
            <div style={{ width: '0.5vw', height: '0.5vw', borderRadius: '50%', background: '#00d4aa' }} />
            <span style={{ fontSize: '1.1vw', color: '#00d4aa', letterSpacing: '0.15em', fontWeight: 600 }}>VIRTUAL MANUFACTURING PLATFORM</span>
          </div>

          <h1 style={{ fontSize: '6.5vw', fontWeight: 800, lineHeight: 1, letterSpacing: '-0.02em', marginBottom: '2.5vh', color: '#f0f4ff' }}>
            PHONE<span style={{ color: '#00d4aa' }}>CRAFT</span>
          </h1>

          <p style={{ fontSize: '1.8vw', color: '#8892a4', lineHeight: 1.5, marginBottom: '4vh', maxWidth: '38vw', fontFamily: 'Inter, sans-serif', fontWeight: 400 }}>
            Real money-earning virtual phone manufacturing platform. Build phones, earn cash, grow your income — from anywhere in the world.
          </p>

          <div style={{ display: 'flex', gap: '2.5vw', marginBottom: '4vh' }}>
            {[
              { value: '58,800+', label: 'Active Members' },
              { value: '$0.16–$0.81', label: 'Per Task Earned' },
              { value: '7', label: 'Countries' },
            ].map(s => (
              <div key={s.label}>
                <div style={{ fontSize: '2.8vw', fontWeight: 700, color: '#00d4aa', lineHeight: 1 }}>{s.value}</div>
                <div style={{ fontSize: '1.1vw', color: '#8892a4', marginTop: '0.4vh', fontFamily: 'Inter, sans-serif' }}>{s.label}</div>
              </div>
            ))}
          </div>

          <div style={{ display: 'flex', gap: '1vw' }}>
            <div style={{ background: 'linear-gradient(135deg, #00d4aa, #00b891)', borderRadius: '8px', padding: '1vh 2vw' }}>
              <span style={{ fontSize: '1.3vw', fontWeight: 700, color: '#06091a' }}>Start Earning Today</span>
            </div>
            <div style={{ border: '1px solid rgba(0,212,170,0.3)', borderRadius: '8px', padding: '1vh 2vw' }}>
              <span style={{ fontSize: '1.3vw', fontWeight: 600, color: '#00d4aa' }}>Watch How It Works</span>
            </div>
          </div>
        </div>

        <div style={{ flex: '0 0 48%', display: 'flex', justifyContent: 'center', alignItems: 'center', position: 'relative' }}>
          <div style={{ position: 'absolute', width: '35vw', height: '35vw', borderRadius: '50%', background: 'radial-gradient(circle, rgba(0,212,170,0.08) 0%, transparent 70%)', top: '50%', left: '50%', transform: 'translate(-50%,-50%)' }} />
          <div style={{ position: 'relative', width: '22vw', borderRadius: '2.5vw', overflow: 'hidden', boxShadow: '0 0 60px rgba(0,212,170,0.25), 0 30px 60px rgba(0,0,0,0.6)', border: '2px solid rgba(0,212,170,0.25)' }}>
            <img src={`${base}ss-home.jpg`} alt="PhoneCraft Home Screen" style={{ width: '100%', display: 'block' }} />
          </div>
          <div style={{ position: 'absolute', top: '10%', right: '5%', background: 'rgba(13,20,48,0.9)', border: '1px solid rgba(0,212,170,0.2)', borderRadius: '12px', padding: '1.2vh 1.5vw', backdropFilter: 'blur(12px)' }}>
            <div style={{ fontSize: '1.8vw', fontWeight: 700, color: '#00d4aa' }}>$0.81</div>
            <div style={{ fontSize: '0.9vw', color: '#8892a4', fontFamily: 'Inter, sans-serif' }}>Max per task</div>
          </div>
          <div style={{ position: 'absolute', bottom: '12%', left: '2%', background: 'rgba(13,20,48,0.9)', border: '1px solid rgba(124,58,237,0.3)', borderRadius: '12px', padding: '1.2vh 1.5vw', backdropFilter: 'blur(12px)' }}>
            <div style={{ fontSize: '1.8vw', fontWeight: 700, color: '#a855f7' }}>Live</div>
            <div style={{ fontSize: '0.9vw', color: '#8892a4', fontFamily: 'Inter, sans-serif' }}>Real withdrawals</div>
          </div>
        </div>
      </div>

      <div style={{ position: 'absolute', bottom: '3vh', left: '5vw', right: '5vw', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontSize: '1vw', color: 'rgba(136,146,164,0.5)', fontFamily: 'Inter, sans-serif' }}>phonecraft.tech</span>
        <span style={{ fontSize: '1vw', color: 'rgba(136,146,164,0.5)', fontFamily: 'Inter, sans-serif' }}>1 / 10</span>
      </div>
    </div>
  );
}
