import React from 'react';

export default function Slide2({ base = '/' }: { base?: string }) {
  return (
    <div className="slide-root" style={{ background: '#06091a', fontFamily: 'Inter, sans-serif' }}>
      <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse 80% 60% at 100% 0%, rgba(124,58,237,0.07) 0%, transparent 60%)' }} />
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '2px', background: 'linear-gradient(to right, transparent, #00d4aa, transparent)' }} />

      <div style={{ position: 'relative', zIndex: 2, display: 'flex', flexDirection: 'column', height: '100%', padding: '4.5vh 6vw 5vh' }}>
        <div style={{ marginBottom: '3vh' }}>
          <div style={{ fontSize: '1.1vw', color: '#00d4aa', letterSpacing: '0.15em', fontWeight: 600, marginBottom: '0.8vh', fontFamily: 'Space Grotesk, sans-serif' }}>APP OVERVIEW</div>
          <h2 style={{ fontSize: '3.8vw', fontWeight: 800, color: '#f0f4ff', letterSpacing: '-0.02em', fontFamily: 'Space Grotesk, sans-serif', lineHeight: 1.1 }}>
            What is <span style={{ color: '#00d4aa' }}>PhoneCraft?</span>
          </h2>
        </div>

        <div style={{ display: 'flex', gap: '4vw', flex: 1, minHeight: 0 }}>
          <div style={{ flex: '0 0 55%' }}>
            <p style={{ fontSize: '1.38vw', color: '#c8d0e0', lineHeight: 1.6, marginBottom: '1.8vh' }}>
              <strong style={{ color: '#f0f4ff' }}>PhoneCraft</strong> is a real money-earning virtual phone manufacturing platform where members complete online phone assembly tasks and get paid in real cash — directly to their accounts.
            </p>
            <p style={{ fontSize: '1.3vw', color: '#c8d0e0', lineHeight: 1.6, marginBottom: '1.8vh' }}>
              Think of it as a <strong style={{ color: '#00d4aa' }}>digital factory</strong> — log in, assemble virtual smartphone components (screens, processors, batteries, cameras), and each completed phone earns you real money deposited to bKash, Nagad, Rocket, or bank.
            </p>
            <p style={{ fontSize: '1.3vw', color: '#c8d0e0', lineHeight: 1.6, marginBottom: '1.8vh' }}>
              The platform uses a <strong style={{ color: '#a855f7' }}>tiered membership system</strong> — higher plans unlock more daily tasks and higher per-task earnings. Plans range from Free to Premium, each giving more manufacturing slots and better rewards.
            </p>
            <p style={{ fontSize: '1.3vw', color: '#c8d0e0', lineHeight: 1.6 }}>
              Beyond manufacturing, PhoneCraft lets you <strong style={{ color: '#00d4aa' }}>earn through referrals</strong> — invite friends and earn commissions when they complete tasks. Your network becomes your income multiplier.
            </p>
          </div>

          <div style={{ flex: '0 0 41%', display: 'flex', flexDirection: 'column', gap: '1.8vh' }}>
            {[
              { icon: '📱', title: 'Virtual Manufacturing', desc: 'Complete phone assembly tasks online — screens, chips, cameras and more.' },
              { icon: '💰', title: 'Real Cash Withdrawals', desc: 'Withdraw earnings to bKash, Nagad, Rocket, or bank. Min ৳300.' },
              { icon: '🌍', title: 'Available in 7 Countries', desc: 'Members across Bangladesh, India, Pakistan and more earn daily.' },
              { icon: '📈', title: 'Tiered Growth', desc: 'Upgrade your plan to unlock more tasks and higher per-task earnings.' },
            ].map(item => (
              <div key={item.title} style={{ background: 'rgba(13,20,48,0.8)', border: '1px solid rgba(0,212,170,0.15)', borderRadius: '12px', padding: '1.8vh 1.8vw', display: 'flex', gap: '1.2vw', alignItems: 'flex-start' }}>
                <span style={{ fontSize: '1.8vw', lineHeight: 1, flexShrink: 0 }}>{item.icon}</span>
                <div>
                  <div style={{ fontSize: '1.2vw', fontWeight: 700, color: '#f0f4ff', marginBottom: '0.4vh', fontFamily: 'Space Grotesk, sans-serif' }}>{item.title}</div>
                  <div style={{ fontSize: '1.05vw', color: '#8892a4', lineHeight: 1.5 }}>{item.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div style={{ position: 'absolute', bottom: '2.5vh', right: '5vw', fontSize: '1vw', color: 'rgba(136,146,164,0.5)' }}>2 / 10</div>
    </div>
  );
}
