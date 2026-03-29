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
    <div className="slide-root" style={{ background: '#06091a', fontFamily: 'Inter, sans-serif' }}>
      <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse 60% 70% at 100% 50%, rgba(124,58,237,0.07) 0%, transparent 65%)' }} />

      <div style={{ position: 'relative', zIndex: 2, display: 'flex', height: '100%', padding: '5vh 5vw', gap: '4vw', alignItems: 'center' }}>
        <div style={{ flex: '0 0 52%' }}>
          <div style={{ fontSize: '1.1vw', color: '#00d4aa', letterSpacing: '0.15em', fontWeight: 600, marginBottom: '1vh', fontFamily: 'Space Grotesk, sans-serif' }}>ONBOARDING FLOW</div>
          <h2 style={{ fontSize: '3.8vw', fontWeight: 800, color: '#f0f4ff', letterSpacing: '-0.02em', fontFamily: 'Space Grotesk, sans-serif', lineHeight: 1.1, marginBottom: '4vh' }}>
            Login &amp; <span style={{ color: '#00d4aa' }}>Sign Up</span>
          </h2>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '2vh' }}>
            {signupSteps.map((step, i) => (
              <div key={step.num} style={{ display: 'flex', gap: '2vw', alignItems: 'flex-start' }}>
                <div style={{ flexShrink: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5vh' }}>
                  <div style={{ width: '3.5vw', height: '3.5vw', borderRadius: '50%', background: i % 2 === 0 ? 'rgba(0,212,170,0.12)' : 'rgba(124,58,237,0.12)', border: `2px solid ${i % 2 === 0 ? '#00d4aa' : '#7c3aed'}`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: i % 2 === 0 ? '#00d4aa' : '#a855f7', fontSize: '1.5vw', fontWeight: 800, fontFamily: 'Space Grotesk, sans-serif', flexShrink: 0 }}>
                    {step.num}
                  </div>
                  {i < signupSteps.length - 1 && (
                    <div style={{ width: '2px', height: '2.5vh', background: 'rgba(0,212,170,0.2)' }} />
                  )}
                </div>
                <div style={{ paddingTop: '0.3vh' }}>
                  <div style={{ fontSize: '1.4vw', fontWeight: 700, color: '#f0f4ff', fontFamily: 'Space Grotesk, sans-serif', marginBottom: '0.4vh' }}>{step.title}</div>
                  <div style={{ fontSize: '1.15vw', color: '#8892a4', lineHeight: 1.5 }}>{step.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div style={{ flex: '0 0 44%', display: 'flex', gap: '2vw', justifyContent: 'center', alignItems: 'center' }}>
          <div style={{ width: '18vw', borderRadius: '2vw', overflow: 'hidden', boxShadow: '0 0 40px rgba(0,212,170,0.18), 0 20px 40px rgba(0,0,0,0.5)', border: '2px solid rgba(0,212,170,0.2)' }}>
            <img src={`${base}ss-home.jpg`} alt="PhoneCraft Home" style={{ width: '100%', display: 'block' }} />
          </div>
          <div style={{ width: '18vw', borderRadius: '2vw', overflow: 'hidden', boxShadow: '0 0 40px rgba(124,58,237,0.18), 0 20px 40px rgba(0,0,0,0.5)', border: '2px solid rgba(124,58,237,0.2)', marginTop: '5vh' }}>
            <img src={`${base}ss-register.jpg`} alt="PhoneCraft Register" style={{ width: '100%', display: 'block' }} />
          </div>
        </div>
      </div>

      <div style={{ position: 'absolute', bottom: '2.5vh', right: '5vw', fontSize: '1vw', color: 'rgba(136,146,164,0.5)' }}>6 / 10</div>
    </div>
  );
}
