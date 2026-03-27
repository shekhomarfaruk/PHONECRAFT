import { useState, useEffect, useRef } from "react";
import Icons from "../Icons.jsx";
import { PLANS, AVATARS, COUNTRIES, RANDOM_NAMES, maskName, randItem } from "../data.jsx";
import { I18N } from "../i18n.js";
import { convertCurrency } from "../currency.js";
import PwaInstallGuideModal from "../components/PwaInstallGuideModal.jsx";
import { RegistrationModal } from "./NotifScreen.jsx";

// ── Static pool so it doesn't re-generate every render ──────────────────────
const EARN_DATA = Array.from({ length: 14 }, () => {
  const country = randItem(COUNTRIES);
  const name    = maskName(randItem(RANDOM_NAMES));
  const amount  = randItem([200,420,900,1600]);   // matches plan dailyEarn values
  const avatar  = randItem(AVATARS);
  return { country, name, amount, avatar };
});

function EarningsTicker({ lang = 'en' }) {
  const t = I18N[lang] || I18N.en;
  // Duplicate for seamless loop
  const items = [...EARN_DATA, ...EARN_DATA];
  const dur   = EARN_DATA.length * 2.4;   // seconds

  return (
    <div className="card" style={{padding:'14px 0 14px'}}>
      <div className="card-title" style={{paddingLeft:16,marginBottom:10}}>
        <Icons.TrendUp size={14}/> {t.home_earning_now}
      </div>

      {/* inject keyframes */}
      <style>{`
        @keyframes earnScroll {
          0%   { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .earn-track {
          display: flex;
          gap: 10px;
          animation: earnScroll ${dur}s linear infinite;
          width: max-content;
        }
        .earn-track:hover { animation-play-state: paused; }
        .earn-card {
          flex-shrink: 0;
          width: 148px;
          background: var(--input-bg);
          border: 1px solid var(--border);
          border-radius: 12px;
          padding: 12px 12px 10px;
          display: flex;
          flex-direction: column;
          gap: 5px;
          transition: border-color .2s;
        }
        .earn-card:hover { border-color: var(--accent); }
      `}</style>

      <div style={{overflow:'hidden',paddingLeft:16}}>
        <div className="earn-track">
          {items.map((e, i) => (
            <div key={i} className="earn-card">
              <div style={{display:'flex',alignItems:'center',gap:7}}>
                {e.avatar.startsWith('/') ? <img src={e.avatar} alt="" style={{width:24,height:24,borderRadius:'50%',objectFit:'cover'}} /> : <span style={{fontSize:18,lineHeight:1}}>{e.avatar}</span>}
                <span style={{fontSize:18,lineHeight:1}}>{e.country.flag}</span>
              </div>
              <div style={{fontWeight:700,fontSize:12,color:'var(--text)',whiteSpace:'nowrap',overflow:'hidden',textOverflow:'ellipsis'}}>
                {e.name}
              </div>
              <div style={{fontSize:9,color:'var(--text2)',letterSpacing:.5}}>{e.country.name}</div>
              <div style={{
                fontFamily:'Space Grotesk',fontSize:13,fontWeight:900,
                color:'var(--green)',marginTop:2,
                display:'flex',alignItems:'center',gap:4,
              }}>
                <Icons.Coin size={11}/>
                {convertCurrency(e.amount, lang)}
              </div>
              <div style={{
                fontSize:8,fontWeight:700,letterSpacing:1.5,
                color:'var(--green)',opacity:.7,
              }}>{t.home_earned_today}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

const LIVE_COLORS = ['#23AF91','#6366F1','#F59E0B','#EF4444','#3B82F6','#EC4899','#10B981','#8B5CF6'];
const LIVE_ITEMS = [
  { code: 'BD', text: 'R***** from Bangladesh bought NovaTech Pro 4G!',   time: 'Just now'  },
  { code: 'IN', text: 'S***** from India bought QuantumX Ultra 5G!',      time: '1 min ago' },
  { code: 'MY', text: 'J***** from Malaysia bought ByteCore Lite 3G!',    time: '3 min ago' },
  { code: 'PK', text: 'K***** from Pakistan bought NexGen Max 4G!',       time: '5 min ago' },
  { code: 'NG', text: 'A***** from Nigeria bought StellarPhone Max 4G!',  time: '6 min ago' },
  { code: 'PH', text: 'M***** from Philippines bought OrbTech Pro 5G!',   time: '8 min ago' },
  { code: 'ID', text: 'F***** from Indonesia bought NanoCore Ultra 4G!',  time: '9 min ago' },
  { code: 'TR', text: 'E***** from Turkey bought ByteCore X1 5G!',        time: '11 min ago'},
];

function LiveActivityTicker({ t }) {
  const items = [...LIVE_ITEMS, ...LIVE_ITEMS];
  const dur   = LIVE_ITEMS.length * 2.8;
  return (
    <div className="card" style={{ padding: '14px 0', overflow: 'hidden' }}>
      <div className="card-title" style={{ paddingLeft: 16, marginBottom: 10 }}>
        <Icons.TrendUp size={14} /> {t.live_activity}
      </div>
      <style>{`
        @keyframes liveScroll { 0%{transform:translateY(0)} 100%{transform:translateY(-50%)} }
        .live-track { display:flex; flex-direction:column; animation:liveScroll ${dur}s linear infinite; }
        .live-track:hover { animation-play-state:paused; }
        .live-row { display:flex; align-items:center; gap:12px; padding:9px 16px; border-bottom:1px solid var(--border); }
      `}</style>
      <div style={{ height: 180, overflow: 'hidden' }}>
        <div className="live-track">
          {items.map((a, i) => (
            <div key={i} className="live-row">
              <span style={{ width: 28, height: 28, borderRadius: '50%', background: `linear-gradient(135deg, ${LIVE_COLORS[i % LIVE_COLORS.length]}, ${LIVE_COLORS[(i+3) % LIVE_COLORS.length]})`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 800, color: '#fff', letterSpacing: 0.5, flexShrink: 0 }}>{a.code}</span>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 12, fontWeight: 500, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{a.text}</div>
                <div style={{ fontSize: 10, color: 'var(--text2)', marginTop: 1 }}>{a.time}</div>
              </div>
              <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--green)', flexShrink: 0, boxShadow: '0 0 6px var(--green)' }} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function HomeScreen({user, setUser, navigate, lang, showToast, notifications = [], setNotifications, teamChatUnread = 0}) {
  const t      = I18N[lang] || I18N.en;
  const plan   = PLANS.find(p => p.id === user.plan);
  const [showInstallGuide, setShowInstallGuide] = useState(false);
  const [regModalNotif, setRegModalNotif] = useState(null);
  const shownIds = useRef(new Set());

  const pendingRegs = notifications.filter(
    n => n.type === 'registration_request' && !n.read
  );

  useEffect(() => {
    if (pendingRegs.length > 0 && !regModalNotif) {
      const unseen = pendingRegs.find(n => !shownIds.current.has(n.id));
      if (unseen) {
        shownIds.current.add(unseen.id);
        setRegModalNotif(unseen);
      }
    }
  }, [pendingRegs.length]);

  return (
    <>
      <PwaInstallGuideModal open={showInstallGuide} onClose={() => setShowInstallGuide(false)} lang={lang} />

      {regModalNotif && (
        <RegistrationModal
          notif={regModalNotif}
          onClose={() => setRegModalNotif(null)}
          setItems={setNotifications}
          showToast={showToast}
          lang={lang}
          userId={user.id}
          setUser={setUser}
        />
      )}

      {pendingRegs.map(notif => {
        let parsed = {};
        try { parsed = JSON.parse(notif.meta || '{}'); } catch (_) {}
        return (
          <div
            key={notif.id}
            className="card"
            style={{
              background: 'linear-gradient(135deg, rgba(246,70,93,0.12), rgba(245,158,11,0.12))',
              borderColor: 'rgba(246,70,93,0.4)',
              padding: '14px 16px',
              animation: 'regPulse 2s ease-in-out infinite',
            }}
          >
            <style>{`
              @keyframes regPulse {
                0%, 100% { box-shadow: 0 0 0 0 rgba(246,70,93,0.3); }
                50% { box-shadow: 0 0 16px 4px rgba(246,70,93,0.15); }
              }
            `}</style>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 10 }}>
              <div style={{
                width: 42, height: 42, borderRadius: '50%',
                background: 'linear-gradient(135deg, #F6465D, #F59E0B)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 20, flexShrink: 0,
              }}><Icons.Bell size={20} color="#fff" /></div>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 800, fontSize: 13, color: 'var(--text)' }}>
                  {t.home_new_reg}
                </div>
                <div style={{ fontSize: 12, color: 'var(--text2)', marginTop: 2 }}>
                  <strong>{parsed.new_user_name || '?'}</strong> — {parsed.plan_name || '?'} ({convertCurrency(parsed.amount || 0, lang)})
                </div>
              </div>
            </div>
            <div style={{ display: 'flex', gap: 10 }}>
              <button
                onClick={() => setRegModalNotif(notif)}
                className="btn btn-success"
                style={{ flex: 1, fontSize: 13, padding: '10px 0', fontWeight: 700, borderRadius: 10 }}
              >
                {t.home_accept}
              </button>
              <button
                onClick={() => setRegModalNotif(notif)}
                className="btn btn-danger"
                style={{ flex: 1, fontSize: 13, padding: '10px 0', fontWeight: 700, borderRadius: 10 }}
              >
                {t.home_decline}
              </button>
            </div>
          </div>
        );
      })}

      <div
        className="card"
        onClick={() => setShowInstallGuide(true)}
        style={{
          cursor: 'pointer',
          background: 'linear-gradient(135deg, rgba(35,175,145,.18), rgba(99,102,241,.16))',
          borderColor: 'rgba(35,175,145,.36)',
          padding: '12px 14px',
          display: 'flex',
          alignItems: 'center',
          gap: 12,
        }}
      >
        <div style={{
          width: 44, height: 44, borderRadius: 12,
          background: 'rgba(10,12,16,.45)',
          border: '1px solid rgba(35,175,145,.28)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          overflow: 'hidden', flexShrink: 0,
        }}>
          <img src="/logo.png" alt="" style={{ width: 30, height: 30, objectFit: 'contain' }} />
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontFamily: 'Space Grotesk', fontWeight: 800, fontSize: 14 }}>
            {t.home_install_app}
          </div>
          <div style={{ fontSize: 12, color: 'var(--text2)', marginTop: 2 }}>
            {t.home_install_sub}
          </div>
        </div>
        <div style={{ color: 'var(--accent)', fontWeight: 900, fontSize: 18, flexShrink: 0 }}>›</div>
      </div>

      {/* ── Welcome card ── */}
      <div className="card" style={{background:'linear-gradient(135deg,rgba(35,175,145,.12),rgba(99,102,241,.12))',borderColor:'rgba(35,175,145,.3)'}}>
        <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',flexWrap:'wrap',gap:12}}>
          <div>
            <div style={{fontSize:12,color:'var(--text2)',marginBottom:4}}>{t.welcome}</div>
            <div style={{fontFamily:'Space Grotesk',fontSize:'clamp(16px,4vw,22px)',fontWeight:900}}>{user.name}</div>
            <div style={{marginTop:8}}>
              <span className="badge badge-blue">{plan?.name} {t.plan_label}</span>
              <span style={{marginLeft:8,fontSize:11,color:'var(--text2)'}}>{plan ? convertCurrency(plan.rate, lang) : ''}</span>
            </div>
          </div>
          <div style={{textAlign:'right'}}>
            <div style={{fontSize:11,color:'var(--text2)',marginBottom:4}}>{t.balance_label}</div>
            <div className="balance-num"><Icons.Coin size={20}/>{convertCurrency(user.balance, lang)}</div>
          </div>
        </div>
      </div>

      {/* ── Stats row ── */}
      <div className="stats-row">
        {[
          {num:user.teamMembers?.length||0,            label:t.team_label,    Icon:Icons.People},
          {num:user.devices?.length||0,                label:t.devices_label, Icon:Icons.Smartphone},
          {num:convertCurrency(user.balance, lang), label:t.balance_label, Icon:Icons.Coin},
        ].map((s,i) => (
          <div key={i} className="stat-box">
            <div style={{color:'var(--accent)',display:'flex',justifyContent:'center',marginBottom:4}}><s.Icon size={18}/></div>
            <div className="stat-num">{s.num}</div>
            <div className="stat-label">{s.label}</div>
          </div>
        ))}
      </div>

      {/* ── Plans guide ── */}
      <div className="card">
        <div className="card-title"><Icons.Coin size={14}/> {t.plan_prices}</div>
        <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(130px,1fr))',gap:8}}>
          {PLANS.map(p=>(
            <div key={p.id} style={{
              background: user.plan===p.id ? `${p.color}18` : 'var(--input-bg)',
              border:`1px solid ${user.plan===p.id ? p.color : 'var(--border)'}`,
              borderRadius:10,padding:'10px 12px',
            }}>
              <div style={{fontFamily:'Space Grotesk',fontSize:10,color:p.color,marginBottom:4}}>{p.name}</div>
              <div style={{fontWeight:700,fontSize:14,marginBottom:2}}>{convertCurrency(p.rate, lang)}</div>
              <div style={{fontSize:10,color:'var(--text2)'}}>{t.home_daily}: {convertCurrency(p.dailyEarn, lang)} ({p.daily} {t.home_tasks_plural})</div>
              <div style={{fontSize:10,color:'var(--text2)',marginTop:2}}>{t.home_per_task}: {convertCurrency(p.perTask, lang)}</div>
              <div style={{fontSize:10,color:'var(--text2)',marginTop:2}}>Ref: {p.l1}%/{p.l2}%/{p.l3}%</div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Quick Actions ── */}
      <div className="card">
        <div className="card-title">{t.quick_actions}</div>
        <div className="quick-grid">
          {[
            {Icon:Icons.Market, label:t.nav_market,   screen:'marketplace', color:'var(--accent2)'},
            {Icon:Icons.Link,   label:t.nav_refer,    screen:'refer',       color:'var(--green)'},
            {Icon:Icons.Wallet, label:t.nav_wallet,   screen:'wallet',      color:'var(--accent3)'},
            {Icon:Icons.Coin,   label:t.nav_balance,  screen:'balance',     color:'var(--accent)'},
          ].map(a => (
            <button key={a.screen} onClick={()=>navigate(a.screen)}
              className="btn btn-outline"
              style={{flexDirection:'column',gap:6,padding:'14px 8px',color:a.color,borderColor:`${a.color}44`}}>
              <a.Icon size={22}/><span style={{fontSize:11}}>{a.label}</span>
            </button>
          ))}
        </div>

        {/* Team Chat quick access */}
        <div
          onClick={() => navigate('teamchat')}
          style={{
            marginTop: 10, padding: '12px 14px', borderRadius: 12,
            background: 'linear-gradient(135deg, rgba(45,212,191,.12), rgba(99,102,241,.10))',
            border: '1px solid rgba(45,212,191,.3)',
            cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 12,
            transition: 'all .15s',
          }}
        >
          <div style={{
            width: 40, height: 40, borderRadius: 10, flexShrink: 0,
            background: 'linear-gradient(135deg, #2DD4BF, #6366F1)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            position: 'relative',
          }}>
            <Icons.Chat size={20} color="#fff" />
            {teamChatUnread > 0 && (
              <span style={{
                position: 'absolute', top: -6, right: -6,
                background: '#F6465D', color: '#fff', borderRadius: 10,
                fontSize: 9, padding: '2px 5px', fontWeight: 700, lineHeight: 1.2,
              }}>{teamChatUnread > 99 ? '99+' : teamChatUnread}</span>
            )}
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 700, fontSize: 13 }}>{t.nav_chat || 'Team Chat'}</div>
            <div style={{ fontSize: 11, color: 'var(--text2)', marginTop: 2 }}>
              {teamChatUnread > 0
                ? (typeof t.chat_new_msgs === 'function' ? t.chat_new_msgs(teamChatUnread) : `${teamChatUnread} new messages`)
                : (t.chat_connect || 'Connect with your team')}
            </div>
          </div>
          <div style={{ color: 'var(--accent)', fontWeight: 900, fontSize: 18 }}>›</div>
        </div>
      </div>

      <EarningsTicker lang={lang} />

      <LiveActivityTicker t={t} />
    </>
  );
}

export default HomeScreen;
