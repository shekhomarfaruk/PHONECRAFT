import React from 'react';

export default function Slide2({ base = '/' }: { base?: string }) {
  return (
    <div className="slide-root" style={{ background: 'linear-gradient(150deg, #ffffff 0%, #f0f9ff 60%, #faf5ff 100%)', fontFamily: 'Inter, sans-serif' }}>
      <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse 80% 60% at 100% 0%, rgba(99,102,241,0.05) 0%, transparent 60%)' }} />
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '3px', background: 'linear-gradient(to right, transparent, #0ea5e9, transparent)' }} />

      <div style={{ position: 'relative', zIndex: 2, display: 'flex', flexDirection: 'column', height: '100%', padding: '4.5vh 6vw 5vh' }}>
        <div style={{ marginBottom: '3vh' }}>
          <div style={{ fontSize: '1.1vw', color: '#0284c7', letterSpacing: '0.15em', fontWeight: 600, marginBottom: '0.8vh', fontFamily: 'Space Grotesk, sans-serif' }}>APP OVERVIEW</div>
          <h2 style={{ fontSize: '3.8vw', fontWeight: 800, color: '#0f172a', letterSpacing: '-0.02em', fontFamily: 'Space Grotesk, sans-serif', lineHeight: 1.1 }}>
            What is <span style={{ color: '#0ea5e9' }}>PhoneCraft?</span>
          </h2>
        </div>

        <div style={{ display: 'flex', gap: '4vw', flex: 1, minHeight: 0 }}>
          <div style={{ flex: '0 0 55%' }}>
            <p style={{ fontSize: '1.38vw', color: '#334155', lineHeight: 1.6, marginBottom: '1.8vh' }}>
              <strong style={{ color: '#0f172a' }}>PhoneCraft</strong> is a real money-earning virtual phone manufacturing platform where members complete online phone assembly tasks and get paid in real cash — directly to their accounts.
            </p>
            <p style={{ fontSize: '1.3vw', color: '#334155', lineHeight: 1.6, marginBottom: '1.8vh' }}>
              Think of it as a <strong style={{ color: '#0ea5e9' }}>digital factory</strong> — log in, assemble virtual smartphone components (screens, processors, batteries, cameras), and each completed phone earns you real money deposited to bKash, Nagad, Rocket, or bank.
            </p>
            <p style={{ fontSize: '1.3vw', color: '#334155', lineHeight: 1.6, marginBottom: '1.8vh' }}>
              The platform uses a <strong style={{ color: '#6366f1' }}>tiered membership system</strong> — higher plans unlock more daily tasks and higher per-task earnings. Plans range from Free to Premium, each giving more manufacturing slots and better rewards.
            </p>
            <p style={{ fontSize: '1.3vw', color: '#334155', lineHeight: 1.6 }}>
              Beyond manufacturing, PhoneCraft lets you <strong style={{ color: '#0ea5e9' }}>earn through referrals</strong> — invite friends and earn commissions when they complete tasks. Your network becomes your income multiplier.
            </p>
          </div>

          <div style={{ flex: '0 0 41%', display: 'flex', flexDirection: 'column', gap: '1.8vh' }}>
            {[
              { icon: '📱', title: 'Virtual Manufacturing', desc: 'Complete phone assembly tasks online — screens, chips, cameras and more.' },
              { icon: '💰', title: 'Real Cash Withdrawals', desc: 'Withdraw earnings to bKash, Nagad, Rocket, or bank. Min ৳300.' },
              { icon: '🌍', title: 'Available in 7 Countries', desc: 'Members across Bangladesh, India, Pakistan and more earn daily.' },
              { icon: '📈', title: 'Tiered Growth', desc: 'Upgrade your plan to unlock more tasks and higher per-task earnings.' },
            ].map(item => (
              <div key={item.title} style={{ background: '#ffffff', border: '1px solid rgba(14,165,233,0.15)', borderRadius: '12px', padding: '1.8vh 1.8vw', display: 'flex', gap: '1.2vw', alignItems: 'flex-start', boxShadow: '0 2px 12px rgba(0,0,0,0.05)' }}>
                <span style={{ fontSize: '1.8vw', lineHeight: 1, flexShrink: 0 }}>{item.icon}</span>
                <div>
                  <div style={{ fontSize: '1.2vw', fontWeight: 700, color: '#0f172a', marginBottom: '0.4vh', fontFamily: 'Space Grotesk, sans-serif' }}>{item.title}</div>
                  <div style={{ fontSize: '1.05vw', color: '#64748b', lineHeight: 1.5 }}>{item.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div style={{ position: 'absolute', bottom: '2.5vh', right: '5vw', fontSize: '1vw', color: 'rgba(100,116,139,0.6)' }}>2 / 10</div>
    </div>
  );
}
