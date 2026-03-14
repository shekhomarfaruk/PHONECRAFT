import { useMemo } from 'react';

function guideText(lang) {
  const isBn = lang === 'bn';
  return {
    title: isBn ? 'PWA ????? ?????? ????' : 'PWA App Install Guide',
    subtitle: isBn
      ? '???????? ???? ??? ???????? PhoneCraft ??? ????'
      : 'Add PhoneCraft to your home screen directly from browser',
    close: isBn ? '???? ????' : 'Close',
    note: isBn
      ? '?????? ???? ??? ??????? ???????? ??? ????? ????? ??????'
      : 'After installation, the app opens faster without browser chrome.',
    steps: [
      {
        title: isBn ? 'Step 01: Browser Menu ?????' : 'Step 01: Open Browser Menu',
        desc: isBn ? '???? ??????? ???-?? (?) ?????? ????? ?????' : 'Tap the three-dot (?) browser menu at the top-right corner.',
        img: '/pwa-guide/step-1.svg',
      },
      {
        title: isBn ? 'Step 02: Add to home screen' : 'Step 02: Tap Add to home screen',
        desc: isBn ? '?????? Add to home screen ?????? ???????? ?????' : 'Select the Add to home screen option from the menu list.',
        img: '/pwa-guide/step-2.svg',
      },
      {
        title: isBn ? 'Step 03: Install ??????? ????' : 'Step 03: Confirm Install',
        desc: isBn ? '????? Install ????? ????? ??? ?????? ??????? ?????' : 'Tap Install in the popup prompt to complete installation.',
        img: '/pwa-guide/step-3.svg',
      },
      {
        title: isBn ? 'Step 04: ??? ??????? ???? ???? ????' : 'Step 04: Open from Home Screen',
        desc: isBn ? 'PhoneCraft ????? ????? ??? ?????? ????? ???? ?????' : 'Launch PhoneCraft directly by tapping the home screen icon.',
        img: '/pwa-guide/step-4.svg',
      },
    ],
  };
}

export default function PwaInstallGuideModal({ open, onClose, lang = 'en' }) {
  const text = useMemo(() => guideText(lang), [lang]);

  if (!open) return null;

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
          width: 'min(980px, 100%)',
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

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(220px,1fr))', gap: 12 }}>
          {text.steps.map((s, idx) => (
            <div key={s.title} style={{
              border: '1px solid rgba(43,49,57,.95)',
              background: 'rgba(22,26,37,.6)',
              borderRadius: 12,
              padding: '10px',
            }}>
              <div style={{ borderRadius: 10, overflow: 'hidden', border: '1px solid rgba(35,175,145,.2)', marginBottom: 9 }}>
                <img src={s.img} alt={s.title} loading="lazy" style={{ width: '100%', display: 'block', background: '#0f141d' }} />
              </div>
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
