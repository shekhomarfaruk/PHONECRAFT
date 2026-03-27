function isSoundEnabled() {
  return localStorage.getItem('app-sound') !== 'off';
}

export function playNotifSound() {
  if (!isSoundEnabled()) return;
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();

    const note = (freq, start, dur, vol = 0.14, type = 'sine') => {
      const osc  = ctx.createOscillator();
      const harm = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      harm.connect(gain);
      gain.connect(ctx.destination);

      osc.type  = type;
      harm.type = 'sine';
      osc.frequency.value  = freq;
      harm.frequency.value = freq * 2.01;

      const t = ctx.currentTime + start;
      gain.gain.setValueAtTime(0, t);
      gain.gain.linearRampToValueAtTime(vol, t + 0.025);
      gain.gain.setValueAtTime(vol, t + 0.06);
      gain.gain.exponentialRampToValueAtTime(0.001, t + dur);

      osc.start(t);  osc.stop(t + dur);
      harm.start(t); harm.stop(t + dur);
    };

    // PhoneCraft signature: D-major arpeggio (D5 → F#5 → A5 → D6)
    note(587,  0,    0.55, 0.14);
    note(740,  0.13, 0.50, 0.12);
    note(880,  0.26, 0.55, 0.14);
    note(1175, 0.40, 0.65, 0.11);
    // soft echo at low volume
    note(1175, 0.62, 0.45, 0.05);
  } catch (_) {}
}

export function playActivitySound() {
  if (!isSoundEnabled()) return;
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const osc  = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.type = 'sine';
    osc.frequency.setValueAtTime(660, ctx.currentTime);
    osc.frequency.linearRampToValueAtTime(880, ctx.currentTime + 0.08);
    gain.gain.setValueAtTime(0, ctx.currentTime);
    gain.gain.linearRampToValueAtTime(0.13, ctx.currentTime + 0.03);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.35);
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.35);
  } catch (_) {}
}
