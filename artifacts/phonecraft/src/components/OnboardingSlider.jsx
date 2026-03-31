import { useState, useEffect } from "react";

const SLIDES = [
  {
    id: "welcome",
    color: "#23AF91",
    glow: "rgba(35,175,145,0.35)",
    gradient: "linear-gradient(135deg, #0d2b25 0%, #0b1e1a 100%)",
    accent: "linear-gradient(135deg, #23AF91, #1BCFAA)",
    icon: (
      <svg viewBox="0 0 48 48" fill="none" style={{ width: 36, height: 36 }}>
        <rect x="10" y="4" width="28" height="40" rx="5" fill="rgba(35,175,145,0.15)" stroke="#23AF91" strokeWidth="1.5"/>
        <rect x="15" y="10" width="18" height="12" rx="2" fill="rgba(35,175,145,0.3)"/>
        <circle cx="24" cy="38" r="2.5" fill="#23AF91"/>
        <path d="M19 16 L24 12 L29 16" stroke="#23AF91" strokeWidth="1.5" strokeLinecap="round"/>
        <circle cx="34" cy="10" r="7" fill="#1a2e2b" stroke="#23AF91" strokeWidth="1.2"/>
        <path d="M31 10 L33.5 12.5 L37 8" stroke="#4ADE80" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
    step: "০১",
    title: "স্বাগতম! PhoneCraft কী?",
    desc: "PhoneCraft হল বাংলাদেশের সেরা ভার্চুয়াল ম্যানুফ্যাকচারিং প্ল্যাটফর্ম — যেখানে আপনি ভার্চুয়াল স্মার্টফোন তৈরি করে প্রতিদিন বাস্তব টাকা আয় করতে পারেন।",
    highlight: { icon: "🌍", text: "৮৪,০০০+ সক্রিয় সদস্য বিশ্বজুড়ে" },
    tags: ["নিরাপদ", "বিশ্বস্ত", "বাংলাদেশী"],
  },
  {
    id: "howitworks",
    color: "#818CF8",
    glow: "rgba(129,140,248,0.35)",
    gradient: "linear-gradient(135deg, #151530 0%, #0e0e25 100%)",
    accent: "linear-gradient(135deg, #818CF8, #6366F1)",
    icon: (
      <svg viewBox="0 0 48 48" fill="none" style={{ width: 36, height: 36 }}>
        <circle cx="24" cy="24" r="18" stroke="#6366F1" strokeWidth="1.5" strokeDasharray="4 2"/>
        <circle cx="24" cy="24" r="8" fill="rgba(99,102,241,0.2)" stroke="#818CF8" strokeWidth="1.5"/>
        <path d="M24 16 L24 24 L30 27" stroke="#818CF8" strokeWidth="2" strokeLinecap="round"/>
        <circle cx="24" cy="8" r="3" fill="#6366F1"/>
        <circle cx="38" cy="20" r="3" fill="#818CF8" opacity="0.6"/>
        <circle cx="10" cy="30" r="3" fill="#818CF8" opacity="0.4"/>
      </svg>
    ),
    step: "০২",
    title: "কীভাবে কাজ করে?",
    desc: "মাত্র ৩টি সহজ ধাপে শুরু করুন:",
    steps: [
      { icon: (
        <svg viewBox="0 0 20 20" fill="none" style={{width:18,height:18}}>
          <circle cx="10" cy="10" r="9" stroke="#23AF91" strokeWidth="1.2"/>
          <path d="M7 10 L9.5 12.5 L13 7" stroke="#23AF91" strokeWidth="1.5" strokeLinecap="round"/>
        </svg>
      ), color: "#23AF91", text: "রেফারেল কোড দিয়ে অ্যাকাউন্ট তৈরি করুন ও প্ল্যান বেছে নিন" },
      { icon: (
        <svg viewBox="0 0 20 20" fill="none" style={{width:18,height:18}}>
          <rect x="4" y="2" width="12" height="16" rx="2" stroke="#818CF8" strokeWidth="1.2"/>
          <path d="M7 7 L13 7 M7 10 L13 10 M7 13 L10 13" stroke="#818CF8" strokeWidth="1.2" strokeLinecap="round"/>
        </svg>
      ), color: "#818CF8", text: "প্রতিদিনের ভার্চুয়াল ফোন তৈরির টাস্ক সম্পন্ন করুন (মাত্র ২ মিনিট)" },
      { icon: (
        <svg viewBox="0 0 20 20" fill="none" style={{width:18,height:18}}>
          <circle cx="10" cy="10" r="8" stroke="#FCD535" strokeWidth="1.2"/>
          <path d="M10 6 L10 14 M7.5 8.5 L10 6 L12.5 8.5" stroke="#FCD535" strokeWidth="1.2" strokeLinecap="round"/>
        </svg>
      ), color: "#FCD535", text: "আপনার আয় bKash/Nagad-এ সরাসরি উইথড্র করুন" },
    ],
  },
  {
    id: "earnings",
    color: "#FCD535",
    glow: "rgba(252,213,53,0.3)",
    gradient: "linear-gradient(135deg, #1f1a08 0%, #191500 100%)",
    accent: "linear-gradient(135deg, #FCD535, #F0B90B)",
    icon: (
      <svg viewBox="0 0 48 48" fill="none" style={{ width: 36, height: 36 }}>
        <circle cx="24" cy="24" r="18" fill="rgba(252,213,53,0.08)" stroke="#FCD535" strokeWidth="1.2"/>
        <path d="M24 13 L24 35 M19 18 L24 13 L29 18" stroke="#FCD535" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M17 28 Q17 32 24 32 Q31 32 31 28 Q31 24 24 24 Q17 24 17 20 Q17 16 24 16" stroke="#F0B90B" strokeWidth="1.5" strokeLinecap="round"/>
      </svg>
    ),
    step: "০৩",
    title: "কত টাকা আয় করবেন?",
    desc: "আপনার বিনিয়োগ অনুযায়ী প্রতিদিন আয় করুন:",
    plans: [
      { name: "BASIC",    color: "#23AF91", invest: "১২,৮০০৳", daily: "২০০৳",  monthly: "৬,০০০৳" },
      { name: "PREMIUM",  color: "#818CF8", invest: "২৫,৫০০৳", daily: "৪২০৳",  monthly: "১২,৬০০৳" },
      { name: "GOLD",     color: "#FCD535", invest: "৫০,০০০৳", daily: "৯০০৳",  monthly: "২৭,০০০৳" },
      { name: "PLATINUM", color: "#F97316", invest: "৮০,০০০৳", daily: "১,৬০০৳", monthly: "৪৮,০০০৳" },
    ],
  },
  {
    id: "referral",
    color: "#F97316",
    glow: "rgba(249,115,22,0.3)",
    gradient: "linear-gradient(135deg, #1f1108 0%, #160d04 100%)",
    accent: "linear-gradient(135deg, #F97316, #EA580C)",
    icon: (
      <svg viewBox="0 0 48 48" fill="none" style={{ width: 36, height: 36 }}>
        <circle cx="14" cy="20" r="6" fill="rgba(249,115,22,0.12)" stroke="#F97316" strokeWidth="1.3"/>
        <circle cx="34" cy="20" r="6" fill="rgba(249,115,22,0.12)" stroke="#F97316" strokeWidth="1.3"/>
        <circle cx="24" cy="10" r="6" fill="rgba(249,115,22,0.2)" stroke="#F97316" strokeWidth="1.5"/>
        <path d="M14 26 Q14 36 24 36 Q34 36 34 26" stroke="#F97316" strokeWidth="1.3" strokeLinecap="round" strokeDasharray="3 2"/>
        <path d="M20 10 L24 6 L28 10" stroke="#FCD535" strokeWidth="1.5" strokeLinecap="round"/>
      </svg>
    ),
    step: "০৪",
    title: "রেফারেল বোনাস",
    desc: "বন্ধু ও পরিবারকে রেফার করুন এবং ৩ স্তরে কমিশন আয় করুন:",
    levels: [
      { level: "লেভেল ১", rate: "২০%", desc: "আপনার সরাসরি রেফারের প্ল্যান মূল্যের ২০%", color: "#F97316" },
      { level: "লেভেল ২", rate: "৪%",  desc: "তাদের রেফারের প্ল্যান মূল্যের ৪%", color: "#FBBF24" },
      { level: "লেভেল ৩", rate: "১%",  desc: "তৃতীয় স্তরের রেফারের প্ল্যান মূল্যের ১%", color: "#FDE68A" },
    ],
    note: "💡 GOLD প্ল্যানে রেফার করলে লেভেল ১ থেকে একবারে ১০,০০০৳ আয়!",
  },
  {
    id: "cta",
    color: "#23AF91",
    glow: "rgba(35,175,145,0.4)",
    gradient: "linear-gradient(135deg, #091f1a 0%, #071612 100%)",
    accent: "linear-gradient(135deg, #23AF91, #6366F1)",
    icon: (
      <svg viewBox="0 0 48 48" fill="none" style={{ width: 36, height: 36 }}>
        <circle cx="24" cy="24" r="18" fill="rgba(35,175,145,0.06)"/>
        <path d="M16 24 L22 30 L32 18" stroke="#23AF91" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
        <circle cx="24" cy="24" r="18" stroke="url(#ctaRing)" strokeWidth="1.5"/>
        <defs>
          <linearGradient id="ctaRing" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#23AF91"/>
            <stop offset="100%" stopColor="#6366F1"/>
          </linearGradient>
        </defs>
      </svg>
    ),
    step: "০৫",
    title: "আজই শুরু করুন!",
    desc: "মাত্র কয়েক মিনিটে নিবন্ধন করুন এবং আজ থেকেই আয় শুরু করুন।",
    benefits: [
      { icon: "💰", text: "প্রতিদিন নিশ্চিত আয়" },
      { icon: "📱", text: "bKash/Nagad-এ সরাসরি উইথড্র" },
      { icon: "🤝", text: "৩ স্তরের রেফারেল সিস্টেম" },
      { icon: "🛡️", text: "২৪/৭ সাপোর্ট টিম" },
    ],
    isCTA: true,
  },
];

const LS_KEY = "pc_onboarding_done";

export default function OnboardingSlider({ onDone, onRegister, onLogin }) {
  const [idx, setIdx] = useState(0);
  const [animDir, setAnimDir] = useState(null);
  const [iconPulse, setIconPulse] = useState(false);

  useEffect(() => {
    setIconPulse(true);
    const t = setTimeout(() => setIconPulse(false), 600);
    return () => clearTimeout(t);
  }, [idx]);

  const goTo = (nextIdx, dir = "next") => {
    setAnimDir(dir);
    setTimeout(() => {
      setIdx(nextIdx);
      setAnimDir(null);
    }, 240);
  };

  const next = () => { if (idx < SLIDES.length - 1) goTo(idx + 1, "next"); };
  const prev = () => { if (idx > 0) goTo(idx - 1, "prev"); };

  const skip = () => {
    try { localStorage.setItem(LS_KEY, "1"); } catch (_) {}
    onDone();
  };

  const finish = (action) => {
    try { localStorage.setItem(LS_KEY, "1"); } catch (_) {}
    onDone();
    if (action === "register") onRegister();
    else if (action === "login") onLogin();
  };

  const slide = SLIDES[idx];
  const progress = ((idx + 1) / SLIDES.length) * 100;

  return (
    <>
      <style>{`
        @keyframes obSlideLeft  { from { opacity:0; transform:translateX(40px) scale(0.97); } to { opacity:1; transform:translateX(0) scale(1); } }
        @keyframes obSlideRight { from { opacity:0; transform:translateX(-40px) scale(0.97); } to { opacity:1; transform:translateX(0) scale(1); } }
        @keyframes obFadeOut    { from { opacity:1; transform:scale(1); } to { opacity:0; transform:scale(0.97); } }
        @keyframes obPulseGlow  { 0%,100%{ box-shadow: 0 0 0 0 var(--ob-glow,rgba(35,175,145,0.4)); } 50%{ box-shadow: 0 0 0 14px transparent; } }
        @keyframes obShimmer    { 0%{background-position:200% center} 100%{background-position:-200% center} }
        @keyframes obProgressFill { from{width:0} to{width:100%} }
        .ob-enter-next { animation: obSlideLeft .26s cubic-bezier(.22,.68,0,1.2) both; }
        .ob-enter-prev { animation: obSlideRight .26s cubic-bezier(.22,.68,0,1.2) both; }
        .ob-exit       { animation: obFadeOut .18s ease both; }
        .ob-icon-pulse { animation: obPulseGlow .6s ease; }
        .ob-skip-btn:hover { background: rgba(112,122,138,0.15) !important; color: #EAECEF !important; }
        .ob-prev-btn:hover { background: rgba(43,49,57,0.6) !important; color: #EAECEF !important; }
        .ob-next-btn:hover { filter: brightness(1.1); transform: translateY(-1px); }
        .ob-plan-card:nth-child(1) { animation-delay: .05s; }
        .ob-plan-card:nth-child(2) { animation-delay: .10s; }
        .ob-plan-card:nth-child(3) { animation-delay: .15s; }
        .ob-plan-card:nth-child(4) { animation-delay: .20s; }
        @keyframes obCardIn { from{opacity:0;transform:translateY(10px)} to{opacity:1;transform:translateY(0)} }
        .ob-plan-card { animation: obCardIn .35s ease both; }
        .ob-benefit-row { transition: background .2s; }
        .ob-benefit-row:hover { background: rgba(35,175,145,0.08) !important; }
      `}</style>

      <div style={{
        position: "fixed", inset: 0, zIndex: 9999,
        background: "rgba(0,0,0,0.9)",
        backdropFilter: "blur(12px) saturate(1.4)",
        display: "flex", alignItems: "center", justifyContent: "center",
        padding: 16,
        fontFamily: "Inter, sans-serif",
      }}>
        <div style={{
          width: "100%", maxWidth: 460,
          background: "linear-gradient(160deg, #0c1018 0%, #0a0d14 100%)",
          border: `1px solid ${slide.color}28`,
          borderRadius: 24,
          boxShadow: `0 24px 80px rgba(0,0,0,0.6), 0 0 0 1px ${slide.color}12, inset 0 1px 0 rgba(255,255,255,0.04)`,
          overflow: "hidden",
          position: "relative",
          transition: "border-color .4s ease, box-shadow .4s ease",
        }}>

          {/* Top accent bar */}
          <div style={{
            height: 3,
            background: slide.accent,
            transition: "background .4s ease",
          }} />

          {/* Progress bar */}
          <div style={{ height: 2, background: "rgba(43,49,57,0.5)", position: "relative" }}>
            <div style={{
              position: "absolute", left: 0, top: 0, bottom: 0,
              width: `${progress}%`,
              background: slide.accent,
              borderRadius: 1,
              transition: "width .4s cubic-bezier(.4,0,.2,1), background .4s ease",
            }} />
          </div>

          {/* Header: step badge + skip */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 18px 0" }}>
            <div style={{
              display: "inline-flex", alignItems: "center", gap: 6,
              background: `${slide.color}14`,
              border: `1px solid ${slide.color}35`,
              borderRadius: 20, padding: "4px 12px",
              fontSize: 10, color: slide.color,
              fontFamily: "Space Grotesk", fontWeight: 700, letterSpacing: 1.8,
              transition: "all .4s ease",
            }}>
              ধাপ {slide.step} / ০৫
            </div>
            <button
              className="ob-skip-btn"
              onClick={skip}
              style={{
                background: "transparent", border: "1px solid rgba(43,49,57,0.6)",
                color: "#5a6473", borderRadius: 8, padding: "5px 12px",
                fontSize: 11, cursor: "pointer", fontWeight: 600,
                fontFamily: "Inter, sans-serif", transition: "all .2s",
                display: "flex", alignItems: "center", gap: 5,
              }}
            >
              <svg viewBox="0 0 16 16" fill="none" style={{width:10,height:10}}>
                <path d="M4 4 L12 12 M12 4 L4 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
              </svg>
              এড়িয়ে যান
            </button>
          </div>

          {/* Slide content */}
          <div
            key={idx}
            className={animDir === "next" ? "ob-enter-next" : animDir === "prev" ? "ob-enter-prev" : ""}
            style={{ padding: "18px 20px 14px" }}
          >
            {/* Icon */}
            <div
              className={iconPulse ? "ob-icon-pulse" : ""}
              style={{
                "--ob-glow": slide.glow,
                width: 72, height: 72, borderRadius: 20,
                background: `radial-gradient(circle at 35% 35%, ${slide.color}22, ${slide.color}08)`,
                border: `1.5px solid ${slide.color}40`,
                display: "flex", alignItems: "center", justifyContent: "center",
                marginBottom: 16, position: "relative",
                transition: "border-color .4s, background .4s",
              }}
            >
              {slide.icon}
              {/* Subtle corner glow */}
              <div style={{
                position: "absolute", inset: -1, borderRadius: 21,
                background: `radial-gradient(circle at 25% 25%, ${slide.color}18, transparent 60%)`,
                pointerEvents: "none",
              }} />
            </div>

            {/* Title */}
            <h2 style={{
              fontFamily: "Space Grotesk", fontSize: 20, fontWeight: 800,
              color: "#EAECEF", marginBottom: 8, lineHeight: 1.3,
              margin: "0 0 8px 0",
            }}>
              {slide.title}
            </h2>

            {/* Desc */}
            <p style={{
              fontSize: 13, color: "#8A95A3", lineHeight: 1.75,
              marginBottom: 14, margin: "0 0 14px 0",
            }}>
              {slide.desc}
            </p>

            {/* Highlight pill */}
            {slide.highlight && (
              <div style={{
                display: "flex", alignItems: "center", gap: 8,
                background: `linear-gradient(135deg, ${slide.color}12, ${slide.color}06)`,
                border: `1px solid ${slide.color}30`,
                borderRadius: 12, padding: "10px 14px",
                fontSize: 13, color: slide.color, fontWeight: 600,
                marginBottom: 12,
              }}>
                <span style={{ fontSize: 18 }}>{slide.highlight.icon}</span>
                <span>{slide.highlight.text}</span>
              </div>
            )}

            {/* Tags */}
            {slide.tags && (
              <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginTop: 4 }}>
                {slide.tags.map((tag, i) => (
                  <span key={i} style={{
                    padding: "3px 10px", borderRadius: 20, fontSize: 11, fontWeight: 600,
                    background: "rgba(35,175,145,0.08)", border: "1px solid rgba(35,175,145,0.2)",
                    color: "#23AF91",
                  }}>{tag}</span>
                ))}
              </div>
            )}

            {/* Steps */}
            {slide.steps && (
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {slide.steps.map((s, i) => (
                  <div key={i} style={{
                    display: "flex", alignItems: "center", gap: 12,
                    background: `linear-gradient(135deg, rgba(22,26,37,0.8), rgba(14,18,28,0.5))`,
                    border: `1px solid ${s.color}22`,
                    borderLeft: `3px solid ${s.color}`,
                    borderRadius: 10, padding: "11px 14px",
                    transition: "transform .2s",
                  }}>
                    <div style={{
                      width: 32, height: 32, borderRadius: 10, flexShrink: 0,
                      background: `${s.color}14`, border: `1px solid ${s.color}30`,
                      display: "flex", alignItems: "center", justifyContent: "center",
                    }}>
                      {s.icon}
                    </div>
                    <span style={{ fontSize: 12.5, color: "#EAECEF", lineHeight: 1.6, fontWeight: 500 }}>{s.text}</span>
                  </div>
                ))}
              </div>
            )}

            {/* Plans grid */}
            {slide.plans && (
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                {slide.plans.map((p, i) => (
                  <div key={i} className="ob-plan-card" style={{
                    background: `linear-gradient(160deg, ${p.color}0e, rgba(14,18,28,0.7))`,
                    border: `1px solid ${p.color}28`,
                    borderTop: `2px solid ${p.color}`,
                    borderRadius: 12, padding: "12px 12px 10px",
                    position: "relative", overflow: "hidden",
                  }}>
                    <div style={{ position: "absolute", top: -8, right: -8, width: 40, height: 40, borderRadius: "50%", background: `${p.color}0a` }} />
                    <div style={{ fontFamily: "Space Grotesk", fontSize: 10, fontWeight: 800, color: p.color, letterSpacing: 1.5, marginBottom: 6 }}>{p.name}</div>
                    <div style={{ fontSize: 10, color: "#5a6473", marginBottom: 3 }}>বিনিয়োগ</div>
                    <div style={{ fontSize: 12, color: "#EAECEF", fontWeight: 700, marginBottom: 6 }}>{p.invest}</div>
                    <div style={{ display: "flex", justifyContent: "space-between" }}>
                      <div>
                        <div style={{ fontSize: 9, color: "#5a6473" }}>দৈনিক</div>
                        <div style={{ fontSize: 13, color: "#4ADE80", fontWeight: 800 }}>{p.daily}</div>
                      </div>
                      <div style={{ textAlign: "right" }}>
                        <div style={{ fontSize: 9, color: "#5a6473" }}>মাসিক</div>
                        <div style={{ fontSize: 11, color: "#FBBF24", fontWeight: 700 }}>{p.monthly}</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Referral levels */}
            {slide.levels && (
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {slide.levels.map((l, i) => (
                  <div key={i} style={{
                    display: "flex", alignItems: "center", gap: 12,
                    background: "linear-gradient(135deg, rgba(22,26,37,0.7), rgba(14,18,28,0.5))",
                    border: `1px solid ${l.color}25`,
                    borderRadius: 12, padding: "10px 14px",
                  }}>
                    <div style={{
                      width: 50, height: 50, borderRadius: 14, flexShrink: 0,
                      background: `radial-gradient(circle, ${l.color}18, ${l.color}06)`,
                      border: `1.5px solid ${l.color}40`,
                      display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
                      gap: 1,
                    }}>
                      <div style={{ fontFamily: "Space Grotesk", fontSize: 16, fontWeight: 900, color: l.color, lineHeight: 1 }}>{l.rate}</div>
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 12, fontWeight: 700, color: "#EAECEF", marginBottom: 3 }}>{l.level}</div>
                      <div style={{ fontSize: 11, color: "#6a7380", lineHeight: 1.5 }}>{l.desc}</div>
                    </div>
                  </div>
                ))}
                {slide.note && (
                  <div style={{
                    background: "rgba(249,115,22,0.06)", border: "1px solid rgba(249,115,22,0.2)",
                    borderRadius: 10, padding: "9px 13px",
                    fontSize: 11, color: "#F97316", lineHeight: 1.6, fontWeight: 500,
                  }}>
                    {slide.note}
                  </div>
                )}
              </div>
            )}

            {/* CTA benefits */}
            {slide.benefits && (
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                {slide.benefits.map((b, i) => (
                  <div key={i} className="ob-benefit-row" style={{
                    display: "flex", alignItems: "center", gap: 8,
                    background: "rgba(35,175,145,0.04)", border: "1px solid rgba(35,175,145,0.15)",
                    borderRadius: 10, padding: "9px 12px",
                    cursor: "default",
                  }}>
                    <span style={{ fontSize: 18 }}>{b.icon}</span>
                    <span style={{ fontSize: 11.5, color: "#EAECEF", fontWeight: 500, lineHeight: 1.4 }}>{b.text}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Progress dots */}
          <div style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: 6, padding: "4px 0" }}>
            {SLIDES.map((s, i) => (
              <div
                key={i}
                onClick={() => goTo(i, i > idx ? "next" : "prev")}
                style={{
                  width: i === idx ? 24 : 7,
                  height: 7,
                  borderRadius: 4,
                  cursor: "pointer",
                  background: i === idx ? slide.color : i < idx ? `${slide.color}50` : "rgba(43,49,57,0.7)",
                  transition: "all .35s cubic-bezier(.4,0,.2,1)",
                  boxShadow: i === idx ? `0 0 8px ${slide.color}60` : "none",
                }}
              />
            ))}
          </div>

          {/* Navigation */}
          <div style={{ display: "flex", gap: 8, padding: "12px 20px 20px" }}>
            {idx > 0 && (
              <button
                className="ob-prev-btn"
                onClick={prev}
                style={{
                  flex: 1, padding: "12px", borderRadius: 12,
                  border: "1px solid rgba(43,49,57,0.7)",
                  background: "rgba(22,26,37,0.4)",
                  color: "#6a7380", cursor: "pointer",
                  fontFamily: "Inter, sans-serif", fontSize: 13, fontWeight: 600,
                  display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
                  transition: "all .2s",
                }}
              >
                <svg viewBox="0 0 16 16" fill="none" style={{width:14,height:14}}>
                  <path d="M10 3 L5 8 L10 13" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
                </svg>
                পূর্ববর্তী
              </button>
            )}

            {!slide.isCTA ? (
              <button
                className="ob-next-btn"
                onClick={next}
                style={{
                  flex: 2, padding: "13px 16px", borderRadius: 12,
                  border: "none",
                  background: slide.accent,
                  color: "#fff", cursor: "pointer",
                  fontFamily: "Space Grotesk, sans-serif",
                  fontSize: 14, fontWeight: 700,
                  boxShadow: `0 6px 20px ${slide.color}40`,
                  display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
                  transition: "all .2s",
                }}
              >
                পরবর্তী
                <svg viewBox="0 0 16 16" fill="none" style={{width:14,height:14}}>
                  <path d="M6 3 L11 8 L6 13" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
                </svg>
              </button>
            ) : (
              <div style={{ flex: 2, display: "flex", flexDirection: "column", gap: 8 }}>
                <button
                  onClick={() => finish("register")}
                  style={{
                    width: "100%", padding: "13px 16px", borderRadius: 12,
                    border: "none",
                    background: "linear-gradient(135deg, #23AF91, #6366F1)",
                    color: "#fff", cursor: "pointer",
                    fontFamily: "Space Grotesk, sans-serif",
                    fontSize: 14, fontWeight: 700,
                    boxShadow: "0 6px 24px rgba(35,175,145,0.35)",
                    display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                    letterSpacing: 0.3,
                  }}
                >
                  <svg viewBox="0 0 18 18" fill="none" style={{width:16,height:16}}>
                    <path d="M9 2 L16 9 L9 16 M16 9 L2 9" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                  </svg>
                  এখনই নিবন্ধন করুন
                </button>
                <button
                  onClick={() => finish("login")}
                  style={{
                    width: "100%", padding: "10px 16px", borderRadius: 12,
                    border: "1px solid rgba(35,175,145,0.3)",
                    background: "rgba(35,175,145,0.06)",
                    color: "#23AF91", cursor: "pointer",
                    fontFamily: "Inter, sans-serif", fontSize: 12.5, fontWeight: 600,
                    transition: "all .2s",
                  }}
                >
                  ইতিমধ্যে অ্যাকাউন্ট আছে? লগইন →
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

export function shouldShowOnboarding() {
  try {
    return !localStorage.getItem(LS_KEY);
  } catch (_) {
    return false;
  }
}
