// Web Audio API sound engine for PhoneCraft
let audioCtx = null;

function getCtx() {
  if (!audioCtx || audioCtx.state === 'closed') {
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return null;
    audioCtx = new AC();
  }
  if (audioCtx.state === 'suspended') audioCtx.resume();
  return audioCtx;
}

function tone(ctx, freq, startT, dur, type = 'sine', vol = 0.18, fadeOut = true) {
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.type = type;
  osc.frequency.setValueAtTime(freq, startT);
  gain.gain.setValueAtTime(0, startT);
  gain.gain.linearRampToValueAtTime(vol, startT + 0.01);
  if (fadeOut) {
    gain.gain.setValueAtTime(vol, startT + dur - 0.04);
    gain.gain.linearRampToValueAtTime(0, startT + dur);
  }
  osc.start(startT);
  osc.stop(startT + dur + 0.01);
}

// ── Click tick (brand / model selection) ─────────────────────────────────────
function playClick() {
  const ctx = getCtx(); if (!ctx) return;
  const t = ctx.currentTime;
  tone(ctx, 880, t,        0.06, 'sine', 0.12);
  tone(ctx, 1200, t + 0.04, 0.04, 'sine', 0.08);
}

// ── Start manufacturing — ascending arpeggio ──────────────────────────────────
function playStart() {
  const ctx = getCtx(); if (!ctx) return;
  const t = ctx.currentTime;
  [440, 554, 659, 880].forEach((f, i) => {
    tone(ctx, f, t + i * 0.1, 0.18, 'triangle', 0.15);
  });
}

// ── Manufacturing complete — success fanfare ──────────────────────────────────
function playComplete() {
  const ctx = getCtx(); if (!ctx) return;
  const t = ctx.currentTime;
  // Chord + rising notes
  [523, 659, 784].forEach(f => tone(ctx, f, t, 0.12, 'triangle', 0.10));
  [659, 784, 1047].forEach((f, i) => tone(ctx, f, t + 0.15 + i * 0.12, 0.20, 'triangle', 0.14));
  tone(ctx, 1047, t + 0.55, 0.30, 'triangle', 0.18);
  // Sparkling overtone
  tone(ctx, 2093, t + 0.55, 0.20, 'sine', 0.06);
}

// ── Daily limit reached — descending warning ──────────────────────────────────
function playLimit() {
  const ctx = getCtx(); if (!ctx) return;
  const t = ctx.currentTime;
  [523, 440, 370, 294].forEach((f, i) => {
    tone(ctx, f, t + i * 0.13, 0.16, 'sawtooth', 0.10);
  });
}

// ── Notification ping ─────────────────────────────────────────────────────────
function playNotification() {
  const ctx = getCtx(); if (!ctx) return;
  const t = ctx.currentTime;
  tone(ctx, 880,  t,       0.10, 'sine', 0.14);
  tone(ctx, 1320, t + 0.12, 0.14, 'sine', 0.12);
  tone(ctx, 880,  t + 0.28, 0.08, 'sine', 0.10);
}

// ── Balance received — coin-like chime ───────────────────────────────────────
function playBalance() {
  const ctx = getCtx(); if (!ctx) return;
  const t = ctx.currentTime;
  tone(ctx, 1047, t,        0.10, 'triangle', 0.16);
  tone(ctx, 1319, t + 0.10, 0.12, 'triangle', 0.14);
  tone(ctx, 1568, t + 0.22, 0.18, 'triangle', 0.18);
  tone(ctx, 2093, t + 0.38, 0.22, 'sine',     0.12);
}

// ── Error buzz ────────────────────────────────────────────────────────────────
function playError() {
  const ctx = getCtx(); if (!ctx) return;
  const t = ctx.currentTime;
  tone(ctx, 220, t,        0.12, 'sawtooth', 0.15);
  tone(ctx, 180, t + 0.14, 0.10, 'sawtooth', 0.12);
  tone(ctx, 150, t + 0.26, 0.14, 'sawtooth', 0.10);
}

// ── Login / welcome ───────────────────────────────────────────────────────────
function playWelcome() {
  const ctx = getCtx(); if (!ctx) return;
  const t = ctx.currentTime;
  [523, 659, 784, 1047].forEach((f, i) => {
    tone(ctx, f, t + i * 0.08, 0.14, 'triangle', 0.13);
  });
}

// ── Progress tick (during terminal) ──────────────────────────────────────────
function playTick() {
  const ctx = getCtx(); if (!ctx) return;
  const t = ctx.currentTime;
  tone(ctx, 660, t, 0.04, 'square', 0.04);
}

// ── Hook ──────────────────────────────────────────────────────────────────────
export function useSound() {
  function playTone(type) {
    try {
      switch (type) {
        case 'click':        playClick();        break;
        case 'start':        playStart();        break;
        case 'complete':     playComplete();     break;
        case 'limit':        playLimit();        break;
        case 'notification': playNotification(); break;
        case 'balance':      playBalance();      break;
        case 'error':        playError();        break;
        case 'welcome':      playWelcome();      break;
        case 'tick':         playTick();         break;
        default: break;
      }
    } catch (e) {
      // silently ignore — audio not available
    }
  }
  return { playTone };
}
