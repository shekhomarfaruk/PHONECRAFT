import React from 'react';

export default function Slide4({ base = '/' }: { base?: string }) {
  return (
    <div className="slide-root" style={{ background: 'linear-gradient(145deg, #f8fafc 0%, #f0f9ff 50%, #faf5ff 100%)', fontFamily: 'Inter, sans-serif' }}>
      <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse 70% 60% at 0% 50%, rgba(14,165,233,0.05) 0%, transparent 60%), radial-gradient(ellipse 50% 50% at 100% 100%, rgba(99,102,241,0.05) 0%, transparent 60%)' }} />

      <div style={{ position: 'relative', zIndex: 2, display: 'flex', flexDirection: 'column', height: '100%', padding: '6vh 6vw' }}>
        <div style={{ marginBottom: '4.5vh', textAlign: 'center' }}>
          <div style={{ fontSize: '1.1vw', color: '#0284c7', letterSpacing: '0.15em', fontWeight: 600, marginBottom: '1vh', fontFamily: 'Space Grotesk, sans-serif' }}>INCOME STREAMS</div>
          <h2 style={{ fontSize: '4vw', fontWeight: 800, color: '#0f172a', letterSpacing: '-0.02em', fontFamily: 'Space Grotesk, sans-serif', lineHeight: 1.1 }}>
            How to <span style={{ color: '#0ea5e9' }}>Earn Money</span>
          </h2>
        </div>

        <div style={{ display: 'flex', gap: '2.5vw', flex: 1, alignItems: 'stretch' }}>
          <div style={{ flex: 1, background: '#ffffff', border: '1px solid rgba(14,165,233,0.2)', borderRadius: '20px', padding: '4vh 2.5vw', display: 'flex', flexDirection: 'column', boxShadow: '0 4px 24px rgba(14,165,233,0.1)' }}>
            <div style={{ width: '5vw', height: '5vw', background: 'rgba(14,165,233,0.1)', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '3vh', fontSize: '2.5vw' }}>
              📱
            </div>
            <h3 style={{ fontSize: '2vw', fontWeight: 800, color: '#0ea5e9', marginBottom: '1.5vh', fontFamily: 'Space Grotesk, sans-serif' }}>Manufacturing Tasks</h3>
            <p style={{ fontSize: '1.35vw', color: '#334155', lineHeight: 1.7, marginBottom: '3vh', flex: 1 }}>
              Complete virtual phone assembly tasks daily. Each manufactured phone earns you real cash. The more tasks you complete, the more you earn.
            </p>
            <div style={{ background: 'rgba(14,165,233,0.07)', border: '1px solid rgba(14,165,233,0.15)', borderRadius: '12px', padding: '2vh 1.5vw' }}>
              <div style={{ fontSize: '2.8vw', fontWeight: 900, color: '#0ea5e9', fontFamily: 'Space Grotesk, sans-serif' }}>$0.16 – $0.81</div>
              <div style={{ fontSize: '1.1vw', color: '#64748b', marginTop: '0.5vh' }}>Earned per manufacturing task</div>
            </div>
            <div style={{ marginTop: '2vh' }}>
              <div style={{ fontSize: '1.2vw', color: '#334155', marginBottom: '0.8vh' }}>Daily task limits by plan:</div>
              {[['Free', '3 tasks/day'], ['Basic', '10 tasks/day'], ['Standard', '25 tasks/day'], ['Premium', '50 tasks/day']].map(([plan, tasks]) => (
                <div key={plan} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1.1vw', color: '#64748b', borderBottom: '1px solid rgba(14,165,233,0.08)', padding: '0.4vh 0' }}>
                  <span>{plan}</span><span style={{ color: '#0ea5e9', fontWeight: 600 }}>{tasks}</span>
                </div>
              ))}
            </div>
          </div>

          <div style={{ flex: 1, background: '#ffffff', border: '1px solid rgba(99,102,241,0.2)', borderRadius: '20px', padding: '4vh 2.5vw', display: 'flex', flexDirection: 'column', boxShadow: '0 4px 24px rgba(99,102,241,0.08)' }}>
            <div style={{ width: '5vw', height: '5vw', background: 'rgba(99,102,241,0.1)', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '3vh', fontSize: '2.5vw' }}>
              👥
            </div>
            <h3 style={{ fontSize: '2vw', fontWeight: 800, color: '#6366f1', marginBottom: '1.5vh', fontFamily: 'Space Grotesk, sans-serif' }}>Referral Bonuses</h3>
            <p style={{ fontSize: '1.35vw', color: '#334155', lineHeight: 1.7, marginBottom: '3vh', flex: 1 }}>
              Share your unique referral code with friends and family. Earn bonus cash every time someone signs up and starts earning through your link.
            </p>
            <div style={{ background: 'rgba(99,102,241,0.07)', border: '1px solid rgba(99,102,241,0.15)', borderRadius: '12px', padding: '2vh 1.5vw', marginBottom: '2vh' }}>
              <div style={{ fontSize: '2.8vw', fontWeight: 900, color: '#6366f1', fontFamily: 'Space Grotesk, sans-serif' }}>Bonus</div>
              <div style={{ fontSize: '1.1vw', color: '#64748b', marginTop: '0.5vh' }}>Per successful referral sign-up</div>
            </div>
            <div style={{ fontSize: '1.2vw', color: '#334155', lineHeight: 1.6 }}>
              Multi-level referral system — earn from your direct referrals and their activity. Your network grows, your income grows.
            </div>
          </div>

          <div style={{ flex: 1, background: '#ffffff', border: '1px solid rgba(139,92,246,0.18)', borderRadius: '20px', padding: '4vh 2.5vw', display: 'flex', flexDirection: 'column', boxShadow: '0 4px 24px rgba(139,92,246,0.07)' }}>
            <div style={{ width: '5vw', height: '5vw', background: 'rgba(139,92,246,0.1)', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '3vh', fontSize: '2.5vw' }}>
              🏪
            </div>
            <h3 style={{ fontSize: '2vw', fontWeight: 800, color: '#8b5cf6', marginBottom: '1.5vh', fontFamily: 'Space Grotesk, sans-serif' }}>Marketplace</h3>
            <p style={{ fontSize: '1.35vw', color: '#334155', lineHeight: 1.7, marginBottom: '3vh', flex: 1 }}>
              Buy and sell manufactured phones in the in-app marketplace. Trade completed devices with other members for additional profit beyond task rewards.
            </p>
            <div style={{ background: 'rgba(139,92,246,0.07)', border: '1px solid rgba(139,92,246,0.15)', borderRadius: '12px', padding: '2vh 1.5vw', marginBottom: '2vh' }}>
              <div style={{ fontSize: '2.8vw', fontWeight: 900, color: '#8b5cf6', fontFamily: 'Space Grotesk, sans-serif' }}>Trade</div>
              <div style={{ fontSize: '1.1vw', color: '#64748b', marginTop: '0.5vh' }}>Phone marketplace between members</div>
            </div>
            <div style={{ fontSize: '1.2vw', color: '#334155', lineHeight: 1.6 }}>
              Complete phones have real value. Buy low, sell high — the marketplace adds a trading dimension to your earning strategy.
            </div>
          </div>
        </div>
      </div>

      <div style={{ position: 'absolute', bottom: '2.5vh', right: '5vw', fontSize: '1vw', color: 'rgba(100,116,139,0.6)' }}>4 / 10</div>
    </div>
  );
}
