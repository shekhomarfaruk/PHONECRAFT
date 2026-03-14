import { useMemo, useState } from 'react';

function guideText(lang) {
  const isBn = lang === 'bn';
  return {
    title: isBn ? 'PWA অ্যাপ ইনস্টল গাইড' : 'PWA App Install Guide',
    subtitle: isBn
      ? 'ব্রাউজার থেকে হোম স্ক্রিনে PhoneCraft যোগ করুন'
      : 'Add PhoneCraft to your home screen directly from browser',
    android: isBn ? 'অ্যান্ড্রয়েড' : 'Android',
    ios: isBn ? 'আইফোন / আইপ্যাড' : 'iPhone / iPad',
    close: isBn ? 'বন্ধ করুন' : 'Close',
    note: isBn
      ? 'ইনস্টল করার পরে অ্যাপটি ব্রাউজার বার ছাড়া দ্রুত খুলবে।'
      : 'After installation, the app opens faster without browser chrome.',
    androidSteps: [
      {
        title: isBn ? 'Chrome মেনু খুলুন' : 'Open Chrome Menu',
        desc: isBn ? 'উপরে ডানদিকে ⋮ ট্যাপ করুন' : 'Tap the three dots (⋮) in the top-right corner',
      },
      {
        title: isBn ? 'Add to Home Screen' : 'Tap Add to Home Screen',
        desc: isBn ? 'Install App বা Add to Home Screen বেছে নিন' : 'Choose Install App or Add to Home Screen',
      },
      {
        title: isBn ? 'Confirm করুন' : 'Confirm Installation',
        desc: isBn ? 'Add চাপুন, আইকন হোম স্ক্রিনে আসবে' : 'Tap Add, then icon appears on your home screen',
      },
    ],
    iosSteps: [
      {
        title: isBn ? 'Safari Share চাপুন' : 'Tap Safari Share',
        desc: isBn ? 'নিচের টুলবারে Share আইকন চাপুন' : 'Press the Share icon in the Safari toolbar',
      },
      {
        title: isBn ? 'Add to Home Screen' : 'Choose Add to Home Screen',
        desc: isBn ? 'শেয়ার তালিকা থেকে অপশনটি বেছে নিন' : 'Find the Add to Home Screen option in the list',
      },
      {
        title: isBn ? 'Add নিশ্চিত করুন' : 'Confirm Add',
        desc: isBn ? 'Add চাপলেই PhoneCraft icon তৈরি হবে' : 'Tap Add and PhoneCraft icon will be created',
      },
    ],
  };
}

export default function PwaInstallGuideModal({ open, onClose, lang = 'en' }) {
  const [tab, setTab] = useState('android');
  const text = useMemo(() => guideText(lang), [lang]);

  if (!open) return null;

  const steps = tab === 'android' ? text.androidSteps : text.iosSteps;

  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed', inset: 0, zIndex: 5000,
        background: 'rgba(0,0,0,0.65)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '16px',
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: 'min(920px, 100%)',
          maxHeight: '86dvh',
          overflowY: 'auto',
          borderRadius: 16,
          border: '1px solid rgba(35,175,145,.28)',
          background: 'linear-gradient(160deg,#0b0e11,#141a25)',
          boxShadow: '0 14px 60px rgba(0,0,0,.45)',
          color: '#EAECEF',
          padding: '18px',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8, marginBottom: 12 }}>
          <div>
            <div style={{ fontSize: 22, fontWeight: 800, fontFamily: 'Space Grotesk' }}>{text.title}</div>
            <div style={{ fontSize: 13, color: '#9AA4B2', marginTop: 4 }}>{text.subtitle}</div>
          </div>
          <button
            onClick={onClose}
            style={{
              border: '1px solid rgba(43,49,57,.9)',
              background: 'rgba(22,26,37,.7)',
              color: '#9AA4B2',
              borderRadius: 8,
              padding: '8px 12px',
              cursor: 'pointer',
              fontWeight: 700,
            }}
          >
            {text.close}
          </button>
        </div>

        <div style={{
          border: '1px solid rgba(35,175,145,.22)',
          borderRadius: 14,
          background: 'rgba(22,26,37,.5)',
          marginBottom: 14,
          overflow: 'hidden',
        }}>
          <svg viewBox="0 0 1000 290" width="100%" height="230" role="img" aria-label="PWA install illustration" style={{ display: 'block' }}>
            <defs>
              <linearGradient id="bg" x1="0" x2="1" y1="0" y2="1">
                <stop offset="0%" stopColor="#101722" />
                <stop offset="100%" stopColor="#0b0e11" />
              </linearGradient>
              <linearGradient id="acc" x1="0" x2="1" y1="0" y2="0">
                <stop offset="0%" stopColor="#23AF91" />
                <stop offset="100%" stopColor="#6366F1" />
              </linearGradient>
            </defs>
            <rect x="0" y="0" width="1000" height="290" fill="url(#bg)" />
            <circle cx="120" cy="60" r="180" fill="#23AF91" opacity="0.08" />
            <circle cx="870" cy="250" r="170" fill="#6366F1" opacity="0.08" />

            <rect x="120" y="40" rx="32" ry="32" width="185" height="230" fill="#0a0c10" stroke="#2b3139" strokeWidth="3" />
            <rect x="133" y="62" rx="16" ry="16" width="159" height="182" fill="#111827" />
            <rect x="154" y="80" rx="12" ry="12" width="118" height="62" fill="#1a2332" stroke="#23AF91" strokeOpacity="0.32" />
            <rect x="154" y="151" rx="8" ry="8" width="55" height="32" fill="#223049" />
            <rect x="217" y="151" rx="8" ry="8" width="55" height="32" fill="#223049" />
            <rect x="154" y="190" rx="8" ry="8" width="118" height="16" fill="#223049" />
            <rect x="186" y="248" rx="4" ry="4" width="54" height="5" fill="#23AF91" opacity="0.5" />

            <path d="M360 145 L545 145" stroke="url(#acc)" strokeWidth="4" strokeLinecap="round" />
            <polygon points="548,145 532,136 532,154" fill="#23AF91" />

            <rect x="575" y="52" rx="14" ry="14" width="308" height="70" fill="#121826" stroke="#2b3139" />
            <text x="600" y="86" fill="#EAECEF" fontSize="20" fontWeight="700" fontFamily="Space Grotesk, sans-serif">1. Browser Menu</text>
            <text x="600" y="107" fill="#9AA4B2" fontSize="13" fontFamily="Inter, sans-serif">Open menu and find Install / Add to Home Screen</text>

            <rect x="575" y="132" rx="14" ry="14" width="308" height="70" fill="#121826" stroke="#2b3139" />
            <text x="600" y="166" fill="#EAECEF" fontSize="20" fontWeight="700" fontFamily="Space Grotesk, sans-serif">2. Confirm Add</text>
            <text x="600" y="187" fill="#9AA4B2" fontSize="13" fontFamily="Inter, sans-serif">Accept prompt to create PhoneCraft app icon</text>

            <rect x="575" y="212" rx="14" ry="14" width="308" height="54" fill="#121826" stroke="#2b3139" />
            <text x="600" y="244" fill="#23AF91" fontSize="18" fontWeight="700" fontFamily="Space Grotesk, sans-serif">3. Open from Home Screen</text>
          </svg>
        </div>

        <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
          <button
            onClick={() => setTab('android')}
            style={{
              flex: 1,
              padding: '10px',
              borderRadius: 10,
              border: tab === 'android' ? 'none' : '1px solid rgba(35,175,145,.2)',
              background: tab === 'android' ? 'linear-gradient(135deg,#23AF91,#1a8f75)' : 'rgba(22,26,37,.7)',
              color: '#fff',
              fontWeight: 700,
              cursor: 'pointer',
            }}
          >
            {text.android}
          </button>
          <button
            onClick={() => setTab('ios')}
            style={{
              flex: 1,
              padding: '10px',
              borderRadius: 10,
              border: tab === 'ios' ? 'none' : '1px solid rgba(35,175,145,.2)',
              background: tab === 'ios' ? 'linear-gradient(135deg,#6366F1,#4f46e5)' : 'rgba(22,26,37,.7)',
              color: '#fff',
              fontWeight: 700,
              cursor: 'pointer',
            }}
          >
            {text.ios}
          </button>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(210px,1fr))', gap: 10 }}>
          {steps.map((s, idx) => (
            <div key={s.title} style={{
              border: '1px solid rgba(43,49,57,.95)',
              background: 'rgba(22,26,37,.6)',
              borderRadius: 12,
              padding: '12px 13px',
            }}>
              <div style={{ fontSize: 11, color: '#23AF91', fontWeight: 800, letterSpacing: 1.2, marginBottom: 6 }}>STEP {idx + 1}</div>
              <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 5 }}>{s.title}</div>
              <div style={{ fontSize: 12, color: '#9AA4B2', lineHeight: 1.6 }}>{s.desc}</div>
            </div>
          ))}
        </div>

        <div style={{
          marginTop: 12,
          padding: '10px 12px',
          borderRadius: 10,
          background: 'rgba(35,175,145,.08)',
          border: '1px solid rgba(35,175,145,.2)',
          fontSize: 12,
          color: '#B7C2D0',
        }}>
          {text.note}
        </div>
      </div>
    </div>
  );
}
