import { useEffect, useState } from "react";

// ── Boishakhi color palette ────────────────────────────────────────────────────
const B = {
  red:       '#C0392B',
  redLight:  '#E74C3C',
  saffron:   '#E8880A',
  gold:      '#F4C430',
  goldLight: '#FDE68A',
  orange:    '#F97316',
  green:     '#196F3D',
  cream:     '#FFF8E7',
  darkBg:    '#120800',
  warmBg:    '#1C0A05',
};

// ── Alpona-inspired SVG border ornament ───────────────────────────────────────
function CornerOrn({ flip = false }) {
  const s = flip ? 'scaleX(-1)' : 'none';
  return (
    <svg width="52" height="52" viewBox="0 0 52 52" fill="none" style={{ transform: s, flexShrink: 0 }}>
      <circle cx="8" cy="8" r="5" stroke={B.gold} strokeWidth="1.2" fill="none" opacity=".7"/>
      <circle cx="8" cy="8" r="2" fill={B.gold} opacity=".5"/>
      <path d="M13 8 Q26 2 26 26 Q2 26 8 13" stroke={B.gold} strokeWidth="1" fill="none" opacity=".45"/>
      <path d="M18 8 Q26 8 26 18" stroke={B.saffron} strokeWidth="0.8" fill="none" opacity=".4"/>
      <circle cx="26" cy="26" r="3" stroke={B.saffron} strokeWidth="1" fill="none" opacity=".5"/>
    </svg>
  );
}

// ── Decorative divider ─────────────────────────────────────────────────────────
function FestiveDivider() {
  return (
    <div style={{ display:'flex', alignItems:'center', gap:8, margin:'10px 0' }}>
      <div style={{ flex:1, height:1, background:`linear-gradient(90deg,transparent,${B.gold}88)` }} />
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
        <path d="M10 2 L12 8 L18 8 L13 12 L15 18 L10 14 L5 18 L7 12 L2 8 L8 8 Z" fill={B.gold} opacity=".8"/>
      </svg>
      <div style={{ flex:1, height:1, background:`linear-gradient(90deg,${B.gold}88,transparent)` }} />
    </div>
  );
}

// ── Slide data ─────────────────────────────────────────────────────────────────
const SLIDES = [
  {
    tag:       'LIMITED TIME OFFER',
    title:     'Boishakhi Special Offer',
    highlight: 'Start from just ৳3,000',
    sub:       'The more you invest, the more you earn',
    plans: [
      { name:'MINI',     badge:'STARTER',  invest:'৳3,000', daily:'৳50/day',  accent: B.gold,    accentDim:'rgba(244,196,48,.15)', accentBorder:'rgba(244,196,48,.45)' },
      { name:'STANDARD', badge:'POPULAR',  invest:'৳6,000', daily:'৳100/day', accent: B.redLight, accentDim:'rgba(231,76,60,.15)',  accentBorder:'rgba(231,76,60,.45)' },
    ],
  },
  {
    tag:       'EARN FROM HOME',
    title:     'Daily Income, Every Day',
    highlight: '10 tasks · Only 2 minutes each',
    sub:       'Manufacture virtual phones and sell them',
    plans: [
      { name:'GOLD',     badge:'PREMIUM',  invest:'৳50,000', daily:'৳900/day',   accent: B.gold,   accentDim:'rgba(244,196,48,.15)', accentBorder:'rgba(244,196,48,.45)' },
      { name:'PLATINUM', badge:'ELITE',    invest:'৳80,000', daily:'৳1,600/day', accent: B.orange, accentDim:'rgba(249,115,22,.15)', accentBorder:'rgba(249,115,22,.45)' },
    ],
  },
];

export default function BoishakhOfferModal({ onClose }) {
  const [slide, setSlide] = useState(0);
  const cur = SLIDES[slide];

  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = prev; };
  }, []);

  const next = () => slide < SLIDES.length - 1 ? setSlide(s => s + 1) : onClose();
  const prev = () => slide > 0 && setSlide(s => s - 1);

  return (
    <div
      onClick={onClose}
      style={{
        position:'fixed', inset:0, zIndex:9999,
        background:'rgba(0,0,0,0.82)',
        display:'flex', alignItems:'center', justifyContent:'center',
        padding:'16px',
        backdropFilter:'blur(6px)',
      }}
    >
      <style>{`
        @keyframes boiIn    { from{opacity:0;transform:scale(.88) translateY(24px)} to{opacity:1;transform:scale(1) translateY(0)} }
        @keyframes boiPulse { 0%,100%{box-shadow:0 0 0 0 rgba(232,136,10,.55)} 60%{box-shadow:0 0 0 16px rgba(232,136,10,0)} }
        @keyframes boiShine { 0%{background-position:-400px 0} 100%{background-position:400px 0} }
        @keyframes boiFloat { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-4px)} }
        .boi-glow-btn { animation:boiPulse 2.4s ease-in-out infinite; }
        .boi-float    { animation:boiFloat 3s ease-in-out infinite; }
      `}</style>

      <div
        onClick={e => e.stopPropagation()}
        style={{
          width:'100%', maxWidth:400,
          borderRadius:24, overflow:'hidden',
          animation:'boiIn .38s cubic-bezier(.34,1.56,.64,1) both',
          boxShadow:`0 24px 64px rgba(0,0,0,.75), 0 0 0 2px ${B.gold}55`,
          background: B.darkBg,
        }}
      >
        {/* ── FESTIVE HEADER ─────────────────────────────────────────────────── */}
        <div style={{
          background: `linear-gradient(135deg,${B.red},#8B1A1A,${B.red})`,
          padding:'0',
          position:'relative',
          overflow:'hidden',
        }}>
          {/* Shimmer shine */}
          <div style={{
            position:'absolute', inset:0,
            background:'linear-gradient(90deg,transparent 0%,rgba(255,255,255,.18) 50%,transparent 100%)',
            backgroundSize:'400% 100%',
            animation:'boiShine 3.5s linear infinite',
            pointerEvents:'none',
          }}/>

          {/* Top geometric strip */}
          <div style={{
            height:6,
            background:`repeating-linear-gradient(90deg,${B.gold} 0,${B.gold} 8px,${B.red} 8px,${B.red} 16px,${B.saffron} 16px,${B.saffron} 24px,${B.green} 24px,${B.green} 32px)`,
          }}/>

          {/* Header content */}
          <div style={{ padding:'16px 16px 14px', position:'relative', zIndex:1 }}>
            {/* Close button */}
            <button onClick={onClose} style={{
              position:'absolute', top:12, right:12,
              width:30, height:30, borderRadius:'50%',
              background:'rgba(0,0,0,.3)', border:`1.5px solid ${B.gold}66`,
              color:B.goldLight, fontSize:14, fontWeight:700, cursor:'pointer',
              display:'flex', alignItems:'center', justifyContent:'center',
            }}>✕</button>

            {/* Corner ornaments + title */}
            <div style={{ display:'flex', alignItems:'center', gap:8 }}>
              <CornerOrn />
              <div style={{ flex:1, textAlign:'center' }}>
                <div style={{
                  fontSize:10, fontWeight:800, letterSpacing:3,
                  color:B.goldLight, textTransform:'uppercase', opacity:.85, marginBottom:4,
                }}>
                  ANNOUNCEMENT
                </div>
                <div style={{
                  fontFamily:"'Space Grotesk', sans-serif",
                  fontSize:'clamp(18px,4.5vw,24px)',
                  fontWeight:900, color:'#fff',
                  textShadow:`0 2px 10px rgba(0,0,0,.5)`,
                  lineHeight:1.2,
                }}>
                  Boishakhi Special
                </div>
              </div>
              <CornerOrn flip />
            </div>

            {/* Tag badge */}
            <div style={{ textAlign:'center', marginTop:8 }}>
              <span style={{
                display:'inline-block',
                padding:'3px 14px', borderRadius:20,
                background:`rgba(244,196,48,.18)`,
                border:`1px solid ${B.gold}88`,
                fontSize:10, fontWeight:800, letterSpacing:2,
                color: B.goldLight,
              }}>
                {cur.tag}
              </span>
            </div>
          </div>

          {/* Bottom geometric strip */}
          <div style={{
            height:4,
            background:`repeating-linear-gradient(90deg,${B.saffron} 0,${B.saffron} 6px,${B.gold} 6px,${B.gold} 12px,${B.red} 12px,${B.red} 18px,${B.green} 18px,${B.green} 24px)`,
            opacity:.7,
          }}/>
        </div>

        {/* ── BODY ────────────────────────────────────────────────────────────── */}
        <div style={{ padding:'18px 16px 0', background: B.warmBg }}>

          {/* Title + sub */}
          <div style={{ textAlign:'center', marginBottom:14 }}>
            <div style={{
              fontFamily:"'Space Grotesk', sans-serif",
              fontWeight:900, fontSize:'clamp(16px,4vw,21px)',
              background:`linear-gradient(90deg,${B.gold},${B.saffron},${B.gold})`,
              WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent',
              lineHeight:1.25, marginBottom:4,
            }}>
              {cur.title}
            </div>
            <div style={{ fontSize:12, color:'rgba(255,255,255,.5)' }}>{cur.sub}</div>
          </div>

          <FestiveDivider />

          {/* Plan cards */}
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10, margin:'10px 0 14px' }}>
            {cur.plans.map(p => (
              <div key={p.name} style={{
                borderRadius:14,
                background: p.accentDim,
                border:`1.5px solid ${p.accentBorder}`,
                padding:'14px 10px',
                textAlign:'center',
                position:'relative',
              }}>
                {/* Badge */}
                <div style={{
                  fontSize:8, fontWeight:800, letterSpacing:1.5,
                  color:p.accent, opacity:.85, marginBottom:4,
                }}>
                  {p.badge}
                </div>
                {/* Plan name */}
                <div style={{
                  fontFamily:'Space Grotesk', fontWeight:900, fontSize:15,
                  color:p.accent, marginBottom:6,
                }}>
                  {p.name}
                </div>
                {/* Price */}
                <div style={{
                  fontFamily:'Space Grotesk', fontWeight:900,
                  fontSize:'clamp(18px,4vw,22px)', color:'#fff', lineHeight:1,
                }}>
                  {p.invest}
                </div>
                {/* Daily */}
                <div style={{
                  fontSize:10, color:p.accent,
                  marginTop:5, fontWeight:700,
                  opacity:.9,
                }}>
                  {p.daily}
                </div>
              </div>
            ))}
          </div>

          {/* Highlight box */}
          <div style={{
            borderRadius:14, padding:'13px 16px', marginBottom:16,
            background:`linear-gradient(135deg,rgba(192,57,43,.25),rgba(232,136,10,.15))`,
            border:`1px solid ${B.saffron}55`,
            textAlign:'center',
          }}>
            <div style={{
              fontFamily:"'Space Grotesk', sans-serif",
              fontSize:'clamp(15px,4vw,20px)',
              fontWeight:900, color:B.goldLight,
              lineHeight:1.3, marginBottom:4,
            }}>
              {cur.highlight}
            </div>
            <div style={{ fontSize:11, color:'rgba(255,255,255,.55)' }}>
              Invest today — earn every single day
            </div>
          </div>
        </div>

        {/* ── FOOTER ─────────────────────────────────────────────────────────── */}
        <div style={{ display:'flex', gap:10, padding:'0 16px 18px', background:B.warmBg }}>
          <button
            onClick={slide === 0 ? onClose : prev}
            style={{
              flex:1, padding:'13px 0', borderRadius:12,
              background:`rgba(255,255,255,.06)`,
              border:`1.5px solid rgba(255,255,255,.15)`,
              color:'rgba(255,255,255,.65)',
              fontFamily:"'Space Grotesk', sans-serif",
              fontWeight:700, fontSize:14, cursor:'pointer',
            }}
          >
            {slide === 0 ? 'Close' : 'Previous'}
          </button>
          <button
            className="boi-glow-btn"
            onClick={next}
            style={{
              flex:2, padding:'13px 0', borderRadius:12,
              background:`linear-gradient(135deg,${B.saffron},${B.red})`,
              border:'none', color:'#fff',
              fontFamily:"'Space Grotesk', sans-serif",
              fontWeight:900, fontSize:14, cursor:'pointer',
              letterSpacing:.5,
            }}
          >
            {slide < SLIDES.length - 1 ? 'Next' : 'Get Started Now'}
          </button>
        </div>

        {/* Slide dots */}
        <div style={{ display:'flex', justifyContent:'center', gap:6, paddingBottom:16, background:B.warmBg }}>
          {SLIDES.map((_,i) => (
            <div key={i}
              onClick={() => setSlide(i)}
              style={{
                width: i===slide ? 24 : 7, height:7, borderRadius:4,
                background: i===slide ? B.gold : 'rgba(255,255,255,.2)',
                transition:'all .25s', cursor:'pointer',
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
