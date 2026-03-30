import React from 'react';

const steps = [
  {
    num: '01',
    title: 'Register & Choose Plan',
    desc: 'Sign up with phone number or email. Select a membership plan — Free, Basic, Standard, or Premium. Each plan unlocks more manufacturing slots.',
    color: '#0ea5e9',
    bg: 'rgba(14,165,233,0.08)',
    border: 'rgba(14,165,233,0.2)',
  },
  {
    num: '02',
    title: 'Log In & Access Dashboard',
    desc: 'Log in to your personal dashboard. See your balance, active tasks, earnings history, referral stats, and daily manufacturing opportunities.',
    color: '#0284c7',
    bg: 'rgba(2,132,199,0.07)',
    border: 'rgba(2,132,199,0.18)',
  },
  {
    num: '03',
    title: 'Manufacture Phones',
    desc: 'Click on available manufacturing tasks. Assemble virtual phone components — screens, processors, batteries, cameras. Each completed phone earns cash.',
    color: '#6366f1',
    bg: 'rgba(99,102,241,0.07)',
    border: 'rgba(99,102,241,0.18)',
  },
  {
    num: '04',
    title: 'Earn & Withdraw',
    desc: 'Earnings accumulate in your wallet instantly. Withdraw anytime to bKash, Nagad, Rocket, or bank. Minimum withdrawal is ৳300 BDT ($2.40 USD).',
    color: '#8b5cf6',
    bg: 'rgba(139,92,246,0.07)',
    border: 'rgba(139,92,246,0.18)',
  },
];

export default function Slide3({ base = '/' }: { base?: string }) {
  return (
    <div className="slide-root" style={{ background: 'linear-gradient(160deg, #f8fafc 0%, #f0f9ff 60%, #fdf4ff 100%)', fontFamily: 'Inter, sans-serif' }}>
      <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse 60% 50% at 50% 100%, rgba(14,165,233,0.05) 0%, transparent 70%)' }} />

      <div style={{ position: 'relative', zIndex: 2, display: 'flex', flexDirection: 'column', height: '100%', padding: '6vh 6vw' }}>
        <div style={{ marginBottom: '5vh', textAlign: 'center' }}>
          <div style={{ fontSize: '1.1vw', color: '#0284c7', letterSpacing: '0.15em', fontWeight: 600, marginBottom: '1vh', fontFamily: 'Space Grotesk, sans-serif' }}>WORKFLOW</div>
          <h2 style={{ fontSize: '4vw', fontWeight: 800, color: '#0f172a', letterSpacing: '-0.02em', fontFamily: 'Space Grotesk, sans-serif', lineHeight: 1.1 }}>
            How It <span style={{ color: '#0ea5e9' }}>Works</span>
          </h2>
          <p style={{ fontSize: '1.4vw', color: '#64748b', marginTop: '1.5vh', maxWidth: '50vw', margin: '1.5vh auto 0' }}>
            From registration to real cash in 4 simple steps
          </p>
        </div>

        <div style={{ display: 'flex', gap: '2vw', flex: 1, alignItems: 'center' }}>
          {steps.map((step, i) => (
            <React.Fragment key={step.num}>
              <div style={{ flex: 1, background: '#ffffff', border: `1px solid ${step.border}`, borderRadius: '16px', padding: '3.5vh 2vw', display: 'flex', flexDirection: 'column', height: '60vh', boxShadow: '0 4px 20px rgba(0,0,0,0.06)' }}>
                <div style={{ fontSize: '3.5vw', fontWeight: 900, color: step.color, opacity: 0.18, fontFamily: 'Space Grotesk, sans-serif', lineHeight: 1, marginBottom: '2vh' }}>{step.num}</div>
                <div style={{ width: '3vw', height: '3px', background: step.color, borderRadius: '2px', marginBottom: '2.5vh' }} />
                <h3 style={{ fontSize: '1.6vw', fontWeight: 700, color: '#0f172a', marginBottom: '2vh', fontFamily: 'Space Grotesk, sans-serif', lineHeight: 1.2 }}>{step.title}</h3>
                <p style={{ fontSize: '1.25vw', color: '#475569', lineHeight: 1.7 }}>{step.desc}</p>
                <div style={{ marginTop: 'auto', display: 'inline-block', background: step.bg, border: `1px solid ${step.border}`, borderRadius: '999px', padding: '0.6vh 1.2vw', alignSelf: 'flex-start' }}>
                  <span style={{ fontSize: '1vw', color: step.color, fontWeight: 600 }}>Step {i + 1}</span>
                </div>
              </div>
              {i < steps.length - 1 && (
                <div style={{ color: '#0ea5e9', fontSize: '2vw', opacity: 0.4, flexShrink: 0 }}>&#8594;</div>
              )}
            </React.Fragment>
          ))}
        </div>
      </div>

      <div style={{ position: 'absolute', bottom: '2.5vh', right: '5vw', fontSize: '1vw', color: 'rgba(100,116,139,0.6)' }}>3 / 10</div>
    </div>
  );
}
