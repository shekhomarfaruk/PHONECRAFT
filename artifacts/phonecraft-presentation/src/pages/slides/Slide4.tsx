import React from 'react';

export default function Slide4({ base = '/' }: { base?: string }) {
  return (
    <div className="slide-root" style={{ background: '#06091a', fontFamily: 'Inter, sans-serif' }}>
      <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse 70% 60% at 0% 50%, rgba(0,212,170,0.06) 0%, transparent 60%), radial-gradient(ellipse 50% 50% at 100% 100%, rgba(124,58,237,0.07) 0%, transparent 60%)' }} />

      <div style={{ position: 'relative', zIndex: 2, display: 'flex', flexDirection: 'column', height: '100%', padding: '6vh 6vw' }}>
        <div style={{ marginBottom: '4.5vh', textAlign: 'center' }}>
          <div style={{ fontSize: '1.1vw', color: '#00d4aa', letterSpacing: '0.15em', fontWeight: 600, marginBottom: '1vh', fontFamily: 'Space Grotesk, sans-serif' }}>INCOME STREAMS</div>
          <h2 style={{ fontSize: '4vw', fontWeight: 800, color: '#f0f4ff', letterSpacing: '-0.02em', fontFamily: 'Space Grotesk, sans-serif', lineHeight: 1.1 }}>
            How to <span style={{ color: '#00d4aa' }}>Earn Money</span>
          </h2>
        </div>

        <div style={{ display: 'flex', gap: '2.5vw', flex: 1, alignItems: 'stretch' }}>
          <div style={{ flex: 1, background: 'linear-gradient(145deg, rgba(0,212,170,0.08), rgba(13,20,48,0.95))', border: '1px solid rgba(0,212,170,0.25)', borderRadius: '20px', padding: '4vh 2.5vw', display: 'flex', flexDirection: 'column' }}>
            <div style={{ width: '5vw', height: '5vw', background: 'rgba(0,212,170,0.12)', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '3vh', fontSize: '2.5vw' }}>
              📱
            </div>
            <h3 style={{ fontSize: '2vw', fontWeight: 800, color: '#00d4aa', marginBottom: '1.5vh', fontFamily: 'Space Grotesk, sans-serif' }}>Manufacturing Tasks</h3>
            <p style={{ fontSize: '1.35vw', color: '#c8d0e0', lineHeight: 1.7, marginBottom: '3vh', flex: 1 }}>
              Complete virtual phone assembly tasks daily. Each manufactured phone earns you real cash. The more tasks you complete, the more you earn.
            </p>
            <div style={{ background: 'rgba(0,212,170,0.1)', borderRadius: '12px', padding: '2vh 1.5vw' }}>
              <div style={{ fontSize: '2.8vw', fontWeight: 900, color: '#00d4aa', fontFamily: 'Space Grotesk, sans-serif' }}>$0.16 – $0.81</div>
              <div style={{ fontSize: '1.1vw', color: '#8892a4', marginTop: '0.5vh' }}>Earned per manufacturing task</div>
            </div>
            <div style={{ marginTop: '2vh' }}>
              <div style={{ fontSize: '1.2vw', color: '#c8d0e0', marginBottom: '0.8vh' }}>Daily task limits by plan:</div>
              {[['Free', '3 tasks/day'], ['Basic', '10 tasks/day'], ['Standard', '25 tasks/day'], ['Premium', '50 tasks/day']].map(([plan, tasks]) => (
                <div key={plan} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1.1vw', color: '#8892a4', borderBottom: '1px solid rgba(0,212,170,0.08)', padding: '0.4vh 0' }}>
                  <span>{plan}</span><span style={{ color: '#00d4aa' }}>{tasks}</span>
                </div>
              ))}
            </div>
          </div>

          <div style={{ flex: 1, background: 'linear-gradient(145deg, rgba(124,58,237,0.08), rgba(13,20,48,0.95))', border: '1px solid rgba(124,58,237,0.25)', borderRadius: '20px', padding: '4vh 2.5vw', display: 'flex', flexDirection: 'column' }}>
            <div style={{ width: '5vw', height: '5vw', background: 'rgba(124,58,237,0.12)', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '3vh', fontSize: '2.5vw' }}>
              👥
            </div>
            <h3 style={{ fontSize: '2vw', fontWeight: 800, color: '#a855f7', marginBottom: '1.5vh', fontFamily: 'Space Grotesk, sans-serif' }}>Referral Bonuses</h3>
            <p style={{ fontSize: '1.35vw', color: '#c8d0e0', lineHeight: 1.7, marginBottom: '3vh', flex: 1 }}>
              Share your unique referral code with friends and family. Earn bonus cash every time someone signs up and starts earning through your link.
            </p>
            <div style={{ background: 'rgba(124,58,237,0.1)', borderRadius: '12px', padding: '2vh 1.5vw', marginBottom: '2vh' }}>
              <div style={{ fontSize: '2.8vw', fontWeight: 900, color: '#a855f7', fontFamily: 'Space Grotesk, sans-serif' }}>Bonus</div>
              <div style={{ fontSize: '1.1vw', color: '#8892a4', marginTop: '0.5vh' }}>Per successful referral sign-up</div>
            </div>
            <div style={{ fontSize: '1.2vw', color: '#c8d0e0', lineHeight: 1.6 }}>
              Multi-level referral system — earn from your direct referrals and their activity. Your network grows, your income grows.
            </div>
          </div>

          <div style={{ flex: 1, background: 'linear-gradient(145deg, rgba(168,85,247,0.06), rgba(13,20,48,0.95))', border: '1px solid rgba(168,85,247,0.2)', borderRadius: '20px', padding: '4vh 2.5vw', display: 'flex', flexDirection: 'column' }}>
            <div style={{ width: '5vw', height: '5vw', background: 'rgba(168,85,247,0.12)', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '3vh', fontSize: '2.5vw' }}>
              🏪
            </div>
            <h3 style={{ fontSize: '2vw', fontWeight: 800, color: '#c084fc', marginBottom: '1.5vh', fontFamily: 'Space Grotesk, sans-serif' }}>Marketplace</h3>
            <p style={{ fontSize: '1.35vw', color: '#c8d0e0', lineHeight: 1.7, marginBottom: '3vh', flex: 1 }}>
              Buy and sell manufactured phones in the in-app marketplace. Trade completed devices with other members for additional profit beyond task rewards.
            </p>
            <div style={{ background: 'rgba(168,85,247,0.1)', borderRadius: '12px', padding: '2vh 1.5vw', marginBottom: '2vh' }}>
              <div style={{ fontSize: '2.8vw', fontWeight: 900, color: '#c084fc', fontFamily: 'Space Grotesk, sans-serif' }}>Trade</div>
              <div style={{ fontSize: '1.1vw', color: '#8892a4', marginTop: '0.5vh' }}>Phone marketplace between members</div>
            </div>
            <div style={{ fontSize: '1.2vw', color: '#c8d0e0', lineHeight: 1.6 }}>
              Complete phones have real value. Buy low, sell high — the marketplace adds a trading dimension to your earning strategy.
            </div>
          </div>
        </div>
      </div>

      <div style={{ position: 'absolute', bottom: '2.5vh', right: '5vw', fontSize: '1vw', color: 'rgba(136,146,164,0.5)' }}>4 / 10</div>
    </div>
  );
}
