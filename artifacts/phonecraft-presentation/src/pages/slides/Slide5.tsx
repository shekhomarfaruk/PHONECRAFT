import React from 'react';

const features = [
  { icon: '🏭', title: 'Virtual Manufacturing', desc: 'Complete phone assembly tasks — screens, processors, batteries, cameras', color: '#00d4aa' },
  { icon: '💳', title: 'Multi-Payment Withdraw', desc: 'bKash, Nagad, Rocket, bank — withdraw to any method', color: '#00d4aa' },
  { icon: '📊', title: 'Live Dashboard', desc: 'Real-time balance, task history, earnings analytics', color: '#00d4aa' },
  { icon: '👥', title: 'Referral System', desc: 'Multi-level referral earning with unique codes', color: '#a855f7' },
  { icon: '🏪', title: 'Phone Marketplace', desc: 'Buy and sell manufactured phones peer-to-peer', color: '#a855f7' },
  { icon: '📈', title: 'Tiered Membership', desc: 'Free, Basic, Standard, Premium — more plan, more earn', color: '#a855f7' },
  { icon: '🌐', title: 'Bilingual (EN + BN)', desc: 'Full English and Bengali language support throughout', color: '#7c3aed' },
  { icon: '💬', title: 'Live Support Chat', desc: '24/7 in-app support with real admin agents', color: '#7c3aed' },
  { icon: '🔒', title: 'Secure Deposits', desc: 'Deposit via bKash, Nagad, Rocket with proof upload', color: '#7c3aed' },
  { icon: '📱', title: 'PWA / Mobile App', desc: 'Install as app on Android and iPhone, works offline', color: '#00d4aa' },
  { icon: '🛡️', title: 'Admin Control Panel', desc: 'Full admin dashboard for user management and settings', color: '#a855f7' },
  { icon: '🔔', title: 'Telegram Notifications', desc: 'Instant alerts for deposits, withdrawals, support', color: '#7c3aed' },
];

export default function Slide5({ base = '/' }: { base?: string }) {
  return (
    <div className="slide-root" style={{ background: '#06091a', fontFamily: 'Inter, sans-serif' }}>
      <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse 80% 50% at 50% 0%, rgba(0,212,170,0.04) 0%, transparent 60%)' }} />

      <div style={{ position: 'relative', zIndex: 2, display: 'flex', flexDirection: 'column', height: '100%', padding: '4.5vh 5vw' }}>
        <div style={{ marginBottom: '3.5vh', textAlign: 'center' }}>
          <div style={{ fontSize: '1.1vw', color: '#00d4aa', letterSpacing: '0.15em', fontWeight: 600, marginBottom: '0.8vh', fontFamily: 'Space Grotesk, sans-serif' }}>PLATFORM CAPABILITIES</div>
          <h2 style={{ fontSize: '3.8vw', fontWeight: 800, color: '#f0f4ff', letterSpacing: '-0.02em', fontFamily: 'Space Grotesk, sans-serif', lineHeight: 1.1 }}>
            All <span style={{ color: '#00d4aa' }}>Features</span>
          </h2>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1.5vw', flex: 1 }}>
          {features.map(f => (
            <div key={f.title} style={{ background: 'rgba(13,20,48,0.8)', border: `1px solid ${f.color}20`, borderRadius: '14px', padding: '2.5vh 1.8vw', display: 'flex', flexDirection: 'column', gap: '1.2vh' }}>
              <div style={{ fontSize: '2vw', lineHeight: 1 }}>{f.icon}</div>
              <div style={{ fontSize: '1.25vw', fontWeight: 700, color: f.color, fontFamily: 'Space Grotesk, sans-serif', lineHeight: 1.2 }}>{f.title}</div>
              <div style={{ fontSize: '1.05vw', color: '#8892a4', lineHeight: 1.5 }}>{f.desc}</div>
            </div>
          ))}
        </div>
      </div>

      <div style={{ position: 'absolute', bottom: '2vh', right: '5vw', fontSize: '1vw', color: 'rgba(136,146,164,0.5)' }}>5 / 10</div>
    </div>
  );
}
