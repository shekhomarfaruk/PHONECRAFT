import { useState, useEffect } from "react";
import { DEVICE_IMAGES } from "./data.jsx";

// ── Brand accent colors ───────────────────────────────────────────────────────
export const BRAND_ACCENT = {
  Apple:   '#A8A8B3',
  Samsung: '#1E4FDB',
  Google:  '#4285F4',
  OnePlus: '#F5010C',
  Xiaomi:  '#FF6900',
  Oppo:    '#1F8EFA',
  Vivo:    '#6070FF',
  Realme:  '#FFE600',
};

// ── Color swatch hex values ───────────────────────────────────────────────────
export const COLOR_SWATCHES = {
  'Midnight Black': '#1A1A1A',
  'Arctic White':   '#F0F0EE',
  'Ocean Blue':     '#1B4FD4',
  'Sunset Gold':    '#C9953A',
  'Deep Purple':    '#6B21A8',
  'Rose Gold':      '#C4807A',
  'Forest Green':   '#1C6B42',
  'Titanium Grey':  '#7A8088',
  'Coral Red':      '#E03A3A',
  'Pearl Silver':   '#C0C4CC',
};

// ── Fallback SVG phone (shown only if real photo fails) ──────────────────────
function FallbackPhone({ brand, ac, size }) {
  return (
    <div style={{
      width: size * 0.55,
      height: size * 1.05,
      borderRadius: size * 0.08,
      background: `linear-gradient(160deg, ${ac}22, ${ac}08)`,
      border: `2px solid ${ac}55`,
      boxShadow: `0 8px 32px rgba(0,0,0,0.4), 0 0 20px ${ac}33`,
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center', gap: 8,
    }}>
      <div style={{ fontSize: 32 }}>
        {brand === 'Apple' ? '🍎' : brand === 'Samsung' ? '📱' : brand === 'Google' ? 'G' : '📱'}
      </div>
      <div style={{ fontSize: 10, color: ac, fontWeight: 700, textAlign: 'center', padding: '0 8px', lineHeight: 1.3 }}>
        {brand}
      </div>
    </div>
  );
}

// ── Main Component ────────────────────────────────────────────────────────────
export default function PhoneMockup({ brand = 'Samsung', model = '', color = '', animating = false, size = 160 }) {
  const [loaded, setLoaded] = useState(false);
  const [error, setError]   = useState(false);

  const ac = BRAND_ACCENT[brand] || '#4285F4';
  const imgSrc = DEVICE_IMAGES[model];
  const colorHex = COLOR_SWATCHES[color] || null;

  // Reset loaded/error when model changes
  useEffect(() => {
    setLoaded(false);
    setError(false);
  }, [model]);

  return (
    <div
      style={{
        position: 'relative',
        width: size,
        height: size * 1.22,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      {/* Ambient glow ring */}
      <div style={{
        position: 'absolute', inset: 0, borderRadius: '50%',
        background: `radial-gradient(circle, ${ac}${animating ? '44' : '22'} 0%, transparent 70%)`,
        animation: animating ? 'deviceGlowPulse 1.4s ease-in-out infinite' : undefined,
        transition: 'background 0.5s',
        pointerEvents: 'none',
      }} />

      {/* Skeleton shimmer while loading */}
      {!loaded && !error && imgSrc && (
        <div style={{
          position: 'absolute',
          width: size * 0.55,
          height: size * 1.05,
          borderRadius: size * 0.08,
          background: 'linear-gradient(90deg, var(--card,#1a2a3a) 25%, var(--border,#2a3a4a) 50%, var(--card,#1a2a3a) 75%)',
          backgroundSize: '200% 100%',
          animation: 'phoneShimmer 1.4s infinite',
        }} />
      )}

      {/* Real device photo */}
      {imgSrc && !error && (
        <img
          src={imgSrc}
          alt={model}
          onLoad={() => setLoaded(true)}
          onError={() => { setError(true); }}
          style={{
            maxWidth:  size * 0.72,
            maxHeight: size * 1.18,
            objectFit: 'contain',
            display: loaded ? 'block' : 'none',
            filter: animating
              ? `drop-shadow(0 0 16px ${ac}BB) drop-shadow(0 4px 24px rgba(0,0,0,0.6))`
              : `drop-shadow(0 8px 28px rgba(0,0,0,0.55)) drop-shadow(0 0 10px ${ac}44)`,
            transition: 'filter 0.4s',
          }}
        />
      )}

      {/* Color tint badge when a color is selected */}
      {loaded && !error && colorHex && (
        <div style={{
          position: 'absolute',
          bottom: 8,
          right: 8,
          width: 14,
          height: 14,
          borderRadius: '50%',
          background: colorHex,
          border: '2px solid rgba(255,255,255,0.5)',
          boxShadow: `0 2px 8px ${colorHex}88`,
        }} />
      )}

      {/* Manufacturing pulse overlay */}
      {animating && loaded && (
        <div style={{
          position: 'absolute', inset: 0,
          background: `radial-gradient(circle, ${ac}28 0%, transparent 65%)`,
          borderRadius: '50%',
          animation: 'deviceGlowPulse 1.4s ease-in-out infinite',
          pointerEvents: 'none',
        }} />
      )}

      {/* Fallback SVG if no image or load error */}
      {(error || !imgSrc) && (
        <FallbackPhone brand={brand} ac={ac} size={size} />
      )}

      <style>{`
        @keyframes deviceGlowPulse {
          0%,100%{opacity:.45;transform:scale(.96)}
          50%{opacity:1;transform:scale(1.04)}
        }
        @keyframes phoneShimmer {
          0%{background-position:200% 0}
          100%{background-position:-200% 0}
        }
      `}</style>
    </div>
  );
}
