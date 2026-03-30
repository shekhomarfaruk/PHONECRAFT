import { useEffect } from "react";
import VideoTemplate from "@/components/video/VideoTemplate";

declare global {
  interface Window {
    speakText?: (text: string) => void;
    playSfx?: () => void;
  }
}

let sharedAudioCtx: AudioContext | null = null;

function getAudioCtx(): AudioContext {
  if (!sharedAudioCtx) {
    sharedAudioCtx = new AudioContext();
  }
  return sharedAudioCtx;
}

function createChimeSfx(): void {
  try {
    const ctx = getAudioCtx();
    const resume = ctx.state === 'suspended' ? ctx.resume() : Promise.resolve();
    resume.then(() => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.type = 'sine';
      osc.frequency.setValueAtTime(880, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(1320, ctx.currentTime + 0.08);
      osc.frequency.exponentialRampToValueAtTime(660, ctx.currentTime + 0.25);
      gain.gain.setValueAtTime(0, ctx.currentTime);
      gain.gain.linearRampToValueAtTime(0.22, ctx.currentTime + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.38);
      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 0.4);
    });
  } catch (_) {}
}

function startAmbientMusic(ctx: AudioContext): void {
  const masterGain = ctx.createGain();
  masterGain.gain.setValueAtTime(0.08, ctx.currentTime);
  masterGain.connect(ctx.destination);

  const notes = [220, 277.18, 329.63, 369.99, 440, 493.88];

  const playNote = (freq: number, startTime: number, duration: number, volume = 0.06) => {
    const osc = ctx.createOscillator();
    const env = ctx.createGain();
    osc.connect(env);
    env.connect(masterGain);
    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq, startTime);
    env.gain.setValueAtTime(0, startTime);
    env.gain.linearRampToValueAtTime(volume, startTime + 0.1);
    env.gain.setValueAtTime(volume, startTime + duration - 0.3);
    env.gain.linearRampToValueAtTime(0, startTime + duration);
    osc.start(startTime);
    osc.stop(startTime + duration);
  };

  const pad = (freq: number, start: number, dur: number) => {
    const osc = ctx.createOscillator();
    const env = ctx.createGain();
    osc.connect(env);
    env.connect(masterGain);
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(freq, start);
    env.gain.setValueAtTime(0, start);
    env.gain.linearRampToValueAtTime(0.04, start + 0.5);
    env.gain.setValueAtTime(0.04, start + dur - 0.5);
    env.gain.linearRampToValueAtTime(0, start + dur);
    osc.start(start);
    osc.stop(start + dur);
  };

  const totalDuration = 40;
  const t0 = ctx.currentTime;

  pad(110, t0, totalDuration);
  pad(165, t0, totalDuration);
  pad(220, t0 + 0.1, totalDuration - 0.1);

  const melody = [
    [220, 0.8], [277, 0.4], [329, 0.8], [369, 0.4],
    [440, 1.2], [369, 0.4], [329, 0.8], [277, 0.4],
    [247, 1.6], [220, 0.8], [261, 0.4], [293, 0.8],
    [329, 0.4], [369, 0.8], [415, 0.4], [440, 1.6],
  ];

  let t = t0 + 2;
  for (let loop = 0; loop < 3; loop++) {
    for (const [freq, dur] of melody) {
      playNote(freq as number, t, dur as number * 0.9, 0.05);
      t += dur as number;
    }
    t += 0.5;
  }
}

export default function App() {
  useEffect(() => {
    window.playSfx = createChimeSfx;

    window.speakText = (text: string) => {
      try {
        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.rate = 1.0;
        utterance.pitch = 1.0;
        utterance.volume = 0.9;
        window.speechSynthesis.speak(utterance);
      } catch (_) {}
    };

    const handleInteraction = () => {
      const ctx = getAudioCtx();
      ctx.resume().then(() => startAmbientMusic(ctx));
      document.removeEventListener('click', handleInteraction);
      document.removeEventListener('touchstart', handleInteraction);
    };

    const ctx = getAudioCtx();
    if (ctx.state === 'running') {
      startAmbientMusic(ctx);
    } else {
      document.addEventListener('click', handleInteraction);
      document.addEventListener('touchstart', handleInteraction);
    }

    return () => {
      document.removeEventListener('click', handleInteraction);
      document.removeEventListener('touchstart', handleInteraction);
    };
  }, []);

  return <VideoTemplate />;
}
