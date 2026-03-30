import { useEffect, useRef } from 'react';

export function AudioPlayer() {
  const ctxRef = useRef<AudioContext | null>(null);
  const startedRef = useRef(false);

  useEffect(() => {
    const start = () => {
      if (startedRef.current) return;
      startedRef.current = true;

      const ctx = new AudioContext();
      ctxRef.current = ctx;

      const bpm = 128;
      const beat = 60 / bpm;
      const measure = beat * 4;

      const masterGain = ctx.createGain();
      masterGain.gain.setValueAtTime(0.18, ctx.currentTime);
      masterGain.connect(ctx.destination);

      const reverb = ctx.createConvolver();
      const reverbGain = ctx.createGain();
      reverbGain.gain.setValueAtTime(0.2, ctx.currentTime);
      reverbGain.connect(masterGain);

      function makeOscNote(freq: number, startAt: number, dur: number, type: OscillatorType = 'sine', vol = 0.3) {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = type;
        osc.frequency.setValueAtTime(freq, startAt);
        gain.gain.setValueAtTime(0, startAt);
        gain.gain.linearRampToValueAtTime(vol, startAt + 0.02);
        gain.gain.setValueAtTime(vol, startAt + dur * 0.7);
        gain.gain.linearRampToValueAtTime(0, startAt + dur);
        osc.connect(gain);
        gain.connect(masterGain);
        osc.start(startAt);
        osc.stop(startAt + dur + 0.05);
      }

      function makeKick(startAt: number) {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.frequency.setValueAtTime(160, startAt);
        osc.frequency.exponentialRampToValueAtTime(40, startAt + 0.1);
        gain.gain.setValueAtTime(1, startAt);
        gain.gain.exponentialRampToValueAtTime(0.001, startAt + 0.25);
        osc.connect(gain);
        gain.connect(masterGain);
        osc.start(startAt);
        osc.stop(startAt + 0.3);
      }

      function makeSnare(startAt: number) {
        const buf = ctx.createBuffer(1, ctx.sampleRate * 0.15, ctx.sampleRate);
        const data = buf.getChannelData(0);
        for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1;
        const src = ctx.createBufferSource();
        src.buffer = buf;
        const gain = ctx.createGain();
        const filter = ctx.createBiquadFilter();
        filter.type = 'highpass';
        filter.frequency.setValueAtTime(1200, startAt);
        gain.gain.setValueAtTime(0.3, startAt);
        gain.gain.exponentialRampToValueAtTime(0.001, startAt + 0.15);
        src.connect(filter);
        filter.connect(gain);
        gain.connect(masterGain);
        src.start(startAt);
        src.stop(startAt + 0.15);
      }

      function makeHihat(startAt: number, vol = 0.08) {
        const buf = ctx.createBuffer(1, ctx.sampleRate * 0.05, ctx.sampleRate);
        const data = buf.getChannelData(0);
        for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1;
        const src = ctx.createBufferSource();
        src.buffer = buf;
        const gain = ctx.createGain();
        const filter = ctx.createBiquadFilter();
        filter.type = 'highpass';
        filter.frequency.setValueAtTime(8000, startAt);
        gain.gain.setValueAtTime(vol, startAt);
        gain.gain.exponentialRampToValueAtTime(0.001, startAt + 0.05);
        src.connect(filter);
        filter.connect(gain);
        gain.connect(masterGain);
        src.start(startAt);
        src.stop(startAt + 0.06);
      }

      const LOOP_BARS = 8;
      const LOOP_DUR = measure * LOOP_BARS;

      const melodyNotes = [
        [440, 0], [494, 0.25], [523, 0.5], [587, 0.75],
        [659, 1], [587, 1.5], [523, 2], [494, 2.5],
        [440, 3], [523, 3.25], [587, 3.5], [659, 3.75],
        [698, 4], [659, 4.5], [587, 5], [523, 5.5],
        [494, 6], [523, 6.25], [587, 6.5], [659, 6.75],
        [698, 7], [784, 7.25], [698, 7.5], [659, 7.75],
      ] as const;

      const bassNotes = [
        [110, 0], [110, 1], [123.47, 2], [123.47, 3],
        [130.81, 4], [130.81, 5], [123.47, 6], [110, 7],
      ] as const;

      function scheduleMeasures(offset: number) {
        for (let b = 0; b < LOOP_BARS; b++) {
          const t = offset + b * measure;
          makeKick(t);
          makeSnare(t + beat * 2);
          for (let s = 0; s < 8; s++) makeHihat(t + beat * s * 0.5);
        }

        melodyNotes.forEach(([freq, beatOffset]) => {
          makeOscNote(freq, offset + beatOffset * beat, beat * 0.45, 'triangle', 0.12);
        });

        bassNotes.forEach(([freq, beatOffset]) => {
          makeOscNote(freq, offset + beatOffset * beat, measure * 0.9, 'sawtooth', 0.08);
        });
      }

      function makeNotificationPing(startAt: number, freq = 880, vol = 0.25) {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, startAt);
        osc.frequency.exponentialRampToValueAtTime(freq * 1.5, startAt + 0.08);
        gain.gain.setValueAtTime(0, startAt);
        gain.gain.linearRampToValueAtTime(vol, startAt + 0.01);
        gain.gain.exponentialRampToValueAtTime(0.001, startAt + 0.3);
        osc.connect(gain);
        gain.connect(masterGain);
        osc.start(startAt);
        osc.stop(startAt + 0.35);
      }

      function makeClickSfx(startAt: number, vol = 0.15) {
        const buf = ctx.createBuffer(1, ctx.sampleRate * 0.03, ctx.sampleRate);
        const data = buf.getChannelData(0);
        for (let i = 0; i < data.length; i++) data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (ctx.sampleRate * 0.005));
        const src = ctx.createBufferSource();
        src.buffer = buf;
        const gain = ctx.createGain();
        const filter = ctx.createBiquadFilter();
        filter.type = 'bandpass';
        filter.frequency.setValueAtTime(4000, startAt);
        filter.Q.setValueAtTime(0.5, startAt);
        gain.gain.setValueAtTime(vol, startAt);
        src.connect(filter);
        filter.connect(gain);
        gain.connect(masterGain);
        src.start(startAt);
        src.stop(startAt + 0.04);
      }

      function scheduleSfx(offset: number) {
        makeNotificationPing(offset + 1.0, 880, 0.2);
        makeNotificationPing(offset + 3.0, 1046, 0.18);
        makeClickSfx(offset + 7.2, 0.18);
        makeClickSfx(offset + 8.1, 0.18);
        makeClickSfx(offset + 9.0, 0.18);
        makeNotificationPing(offset + 12.5, 1174, 0.22);
        makeNotificationPing(offset + 16.5, 1318, 0.22);
        makeClickSfx(offset + 17.5, 0.2);
        makeNotificationPing(offset + 21.0, 987, 0.22);
        makeNotificationPing(offset + 25.5, 1174, 0.25);
        makeClickSfx(offset + 26.5, 0.15);
        makeNotificationPing(offset + 29.8, 880, 0.2);
        makeNotificationPing(offset + 32.2, 1568, 0.28);
      }

      const now = ctx.currentTime;
      scheduleMeasures(now);
      scheduleSfx(now);
      scheduleMeasures(now + LOOP_DUR);

      let loopStart = now + LOOP_DUR;
      const interval = setInterval(() => {
        loopStart += LOOP_DUR;
        scheduleMeasures(loopStart);
        scheduleSfx(loopStart);
      }, (LOOP_DUR - measure) * 1000);

      return () => {
        clearInterval(interval);
        ctx.close();
      };
    };

    const cleanup = start();

    const resumeOnInteraction = () => {
      if (ctxRef.current?.state === 'suspended') {
        ctxRef.current.resume();
      }
    };
    document.addEventListener('pointerdown', resumeOnInteraction, { once: true });
    document.addEventListener('keydown', resumeOnInteraction, { once: true });

    return () => {
      document.removeEventListener('pointerdown', resumeOnInteraction);
      document.removeEventListener('keydown', resumeOnInteraction);
      cleanup?.();
    };
  }, []);

  return null;
}
