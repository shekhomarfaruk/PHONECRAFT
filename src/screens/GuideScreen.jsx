import { useState } from "react";
import Icons from "../Icons.jsx";
import { I18N } from "../i18n.js";

export default function GuideScreen({ navigate, lang }) {
  const t = I18N[lang] || I18N.en;
  const [openIdx, setOpenIdx] = useState(null);

  const sections = [
    { Icon: Icons.Home,     title: t.guide_home_title,     desc: t.guide_home_desc,     color: 'var(--accent)'  },
    { Icon: Icons.Wrench,   title: t.guide_work_title,     desc: t.guide_work_desc,     color: 'var(--green)'   },
    { Icon: Icons.Wallet,   title: t.guide_wallet_title,   desc: t.guide_wallet_desc,   color: 'var(--yellow)'  },
    { Icon: Icons.BarChart,  title: t.guide_balance_title,  desc: t.guide_balance_desc,  color: 'var(--accent2)' },
    { Icon: Icons.Market,   title: t.guide_market_title,   desc: t.guide_market_desc,   color: 'var(--accent3)' },
    { Icon: Icons.Link,     title: t.guide_refer_title,    desc: t.guide_refer_desc,    color: 'var(--accent)'  },
    { Icon: Icons.Chat,     title: t.guide_chat_title,     desc: t.guide_chat_desc,     color: 'var(--green)'   },
    { Icon: Icons.User,     title: t.guide_profile_title,  desc: t.guide_profile_desc,  color: 'var(--accent2)' },
    { Icon: Icons.Settings, title: t.guide_settings_title, desc: t.guide_settings_desc, color: 'var(--text2)'   },
    { Icon: Icons.Lifebuoy, title: t.guide_support_title,  desc: t.guide_support_desc,  color: 'var(--yellow)'  },
  ];

  const tips = [t.guide_tip_1, t.guide_tip_2, t.guide_tip_3, t.guide_tip_4, t.guide_tip_5];

  return (
    <>
      <div className="screen-title"><Icons.Info size={18} /> {t.guide_title}</div>

      {/* Overview Card */}
      <div className="card" style={{ background: 'linear-gradient(135deg, rgba(35,175,145,.12), rgba(99,102,241,.12))', borderColor: 'rgba(35,175,145,.3)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
          <span style={{ flexShrink: 0, display: 'flex' }}><Icons.Smartphone size={32} /></span>
          <div>
            <div style={{ fontFamily: 'Space Grotesk', fontSize: 14, fontWeight: 700, color: 'var(--accent)', letterSpacing: 1 }}>PHONECRAFT</div>
            <div style={{ fontSize: 12, color: 'var(--text2)' }}>{t.guide_subtitle}</div>
          </div>
        </div>
        <div className="card-title"><Icons.Info size={14} /> {t.guide_overview}</div>
        <p style={{ fontSize: 13, lineHeight: 1.7, color: 'var(--text)', margin: 0 }}>{t.guide_overview_desc}</p>
      </div>

      {/* Feature Sections — Accordion */}
      {sections.map((s, i) => (
        <div key={i} className="card" style={{ padding: 0, overflow: 'hidden', cursor: 'pointer' }}
             onClick={() => setOpenIdx(openIdx === i ? null : i)}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '14px 16px' }}>
            <span style={{ flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', width: 36, height: 36, borderRadius: 10, background: 'rgba(35,175,145,.08)' }}><s.Icon size={22} /></span>
            <div style={{ flex: 1, fontWeight: 700, fontSize: 14 }}>{s.title}</div>
            <span style={{ color: 'var(--text2)', fontSize: 12, transition: 'transform .2s', transform: openIdx === i ? 'rotate(180deg)' : 'rotate(0)' }}>
              <Icons.ChevronDown size={16} />
            </span>
          </div>
          {openIdx === i && (
            <div style={{ padding: '0 16px 14px 52px', animation: 'screenFade .2s ease' }}>
              <p style={{ fontSize: 13, lineHeight: 1.7, color: 'var(--text2)', margin: 0 }}>{s.desc}</p>
              {s.title === t.guide_work_title && (
                <button className="btn btn-primary" style={{ marginTop: 12, padding: '8px 16px', fontSize: 12 }}
                        onClick={(e) => { e.stopPropagation(); navigate('work'); }}>
                  <Icons.Work size={14} /> {t.start_work}
                </button>
              )}
              {s.title === t.guide_wallet_title && (
                <button className="btn btn-outline" style={{ marginTop: 12, padding: '8px 16px', fontSize: 12 }}
                        onClick={(e) => { e.stopPropagation(); navigate('wallet'); }}>
                  <Icons.Wallet size={14} /> {t.nav_wallet}
                </button>
              )}
              {s.title === t.guide_refer_title && (
                <button className="btn btn-outline" style={{ marginTop: 12, padding: '8px 16px', fontSize: 12 }}
                        onClick={(e) => { e.stopPropagation(); navigate('refer'); }}>
                  <Icons.Link size={14} /> {t.nav_refer}
                </button>
              )}
            </div>
          )}
        </div>
      ))}

      {/* Pro Tips */}
      <div className="card">
        <div className="card-title"><Icons.Star size={14} /> {t.guide_tip_title}</div>
        {tips.map((tip, i) => (
          <div key={i} style={{ display: 'flex', gap: 10, padding: '8px 0', borderBottom: i < tips.length - 1 ? '1px solid var(--border)' : 'none' }}>
            <span style={{ color: 'var(--accent)', fontFamily: 'Space Grotesk', fontSize: 12, flexShrink: 0, paddingTop: 1 }}>0{i + 1}</span>
            <span style={{ fontSize: 13, lineHeight: 1.6 }}>{tip}</span>
          </div>
        ))}
      </div>

      <div style={{ height: 12 }} />
    </>
  );
}
