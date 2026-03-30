import React from 'react';

const signupSteps = [
  { num: 1, title: 'Visit phonecraft.tech', desc: 'Open the website or install the PWA from the install prompt on your device.' },
  { num: 2, title: 'Tap "Join" / "Start Earning"', desc: 'Click the Join button or "Start Earning Today" on the home screen.' },
  { num: 3, title: 'Fill Registration Form', desc: 'Enter your name, phone number, email (optional), password, and referral code (if any).' },
  { num: 4, title: 'Choose Your Plan', desc: 'Select Free, Basic, Standard, or Premium membership to set your daily earning capacity.' },
  { num: 5, title: 'Log In & Start Working', desc: 'Log in with your credentials. Go to Dashboard → Manufacture → click tasks to start earning.' },
];

export default function Slide6({ base = '/' }: { base?: string }) {
  return (
    <div className="slide-root" style={{ background: 'linear-gradient(145deg, #ffffff 0%, #f0f9ff 50%, #faf5ff 100%)', fontFamily: 'Inter, sans-serif' }}>
      <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse 60% 70% at 100% 50%, rgba(99,102,241,0.05) 0%, transparent 65%)' }} />

      <div style={{ position: 'relative', zIndex: 2, display: 'flex', height: '100%', padding: '5vh 5vw', gap: '4vw', alignItems: 'center' }}>
        <div style={{ flex: '0 0 52%' }}>
          <div style={{ fontSize: '1.1vw', color: '#0284c7', letterSpacing: '0.15em', fontWeight: 600, marginBottom: '1vh', fontFamily: 'Space Grotesk, sans-serif' }}>ONBOARDING FLOW</div>
          <h2 style={{ fontSize: '3.8vw', fontWeight: 800, color: '#0f172a', letterSpacing: '-0.02em', fontFamily: 'Space Grotesk, sans-serif', lineHeight: 1.1, marginBottom: '4vh' }}>
            Login &amp; <span style={{ color: '#0ea5e9' }}>Sign Up</span>
          </h2>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '2vh' }}>
            {signupSteps.map((step, i) => (
              <div key={step.num} style={{ display: 'flex', gap: '2vw', alignItems: 'flex-start' }}>
                <div style={{ flexShrink: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5vh' }}>
                  <div style={{ width: '3.5vw', height: '3.5vw', borderRadius: '50%', background: i % 2 === 0 ? 'rgba(14,165,233,0.1)' : 'rgba(99,102,241,0.1)', border: `2px solid ${i % 2 === 0 ? '#0ea5e9' : '#6366f1'}`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: i % 2 === 0 ? '#0ea5e9' : '#6366f1', fontSize: '1.5vw', fontWeight: 800, fontFamily: 'Space Grotesk, sans-serif', flexShrink: 0 }}>
                    {step.num}
                  </div>
                  {i < signupSteps.length - 1 && (
                    <div style={{ width: '2px', height: '2.5vh', background: 'rgba(14,165,233,0.2)' }} />
                  )}
                </div>
                <div style={{ paddingTop: '0.3vh' }}>
                  <div style={{ fontSize: '1.4vw', fontWeight: 700, color: '#0f172a', fontFamily: 'Space Grotesk, sans-serif', marginBottom: '0.4vh' }}>{step.title}</div>
                  <div style={{ fontSize: '1.15vw', color: '#64748b', lineHeight: 1.5 }}>{step.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div style={{ flex: '0 0 44%', display: 'flex', gap: '2vw', justifyContent: 'center', alignItems: 'center' }}>
          <div style={{ width: '18vw', borderRadius: '2vw', overflow: 'hidden', boxShadow: '0 8px 40px rgba(14,165,233,0.15), 0 20px 40px rgba(0,0,0,0.08)', border: '2px solid rgba(14,165,233,0.18)', background: '#fff' }}>
            <img src={`${base}ss-home.jpg`} alt="PhoneCraft Home" style={{ width: '100%', display: 'block' }} />
          </div>
          <div style={{ width: '18vw', borderRadius: '2vw', overflow: 'hidden', boxShadow: '0 8px 40px rgba(99,102,241,0.15), 0 20px 40px rgba(0,0,0,0.08)', border: '2px solid rgba(99,102,241,0.18)', marginTop: '5vh', background: '#fff' }}>
            <img src={`${base}ss-register.jpg`} alt="PhoneCraft Register" style={{ width: '100%', display: 'block' }} />
          </div>
        </div>
      </div>

      <div style={{ position: 'absolute', bottom: '2.5vh', right: '5vw', fontSize: '1vw', color: 'rgba(100,116,139,0.6)' }}>6 / 10</div>
    </div>
  );
}
