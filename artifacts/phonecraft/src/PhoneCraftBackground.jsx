import { useEffect, useRef } from 'react';

const TEAL   = { r: 35,  g: 175, b: 145 };
const INDIGO = { r: 99,  g: 102, b: 241 };
const GREEN  = { r: 14,  g: 203, b: 129 };

const rgba = (r, g, b, a) => `rgba(${r},${g},${b},${a})`;
const rand = (min, max) => min + Math.random() * (max - min);

// ── Floating particle ─────────────────────────────────────────────────────────
class Particle {
  constructor(w, h) { this.reset(w, h, true); }
  reset(w, h, init = false) {
    this.x = rand(0, w); this.y = init ? rand(0, h) : h + 20;
    this.vx = rand(-0.12, 0.12); this.vy = rand(-0.18, -0.06);
    this.size = rand(1, 2.2); this.alpha = rand(0.12, 0.4);
    this.color = [TEAL, INDIGO, GREEN][Math.floor(rand(0, 3))];
    this.life = rand(0.6, 1); this.maxLife = this.life;
    this.pulse = rand(0, Math.PI * 2); this.pulseSpeed = rand(0.01, 0.03);
  }
  update(w, h) {
    this.x += this.vx; this.y += this.vy;
    this.pulse += this.pulseSpeed; this.life -= 0.001;
    if (this.y < -20 || this.x < -20 || this.x > w + 20 || this.life <= 0) this.reset(w, h);
  }
  draw(ctx) {
    const fade = Math.min(1, this.life / 0.15) * Math.min(1, (this.maxLife - this.life) / 0.1);
    const a = this.alpha * (0.7 + 0.3 * Math.sin(this.pulse)) * fade;
    if (a < 0.01) return;
    const { r, g, b } = this.color;
    ctx.beginPath(); ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
    ctx.fillStyle = rgba(r, g, b, a); ctx.fill();
    ctx.beginPath(); ctx.arc(this.x, this.y, this.size * 3, 0, Math.PI * 2);
    ctx.fillStyle = rgba(r, g, b, a * 0.12); ctx.fill();
  }
}

// ── Glow orb ──────────────────────────────────────────────────────────────────
class GlowOrb {
  constructor(w, h) {
    this.x = rand(w * 0.1, w * 0.9); this.y = rand(h * 0.1, h * 0.9);
    this.baseX = this.x; this.baseY = this.y;
    this.radius = rand(80, 200); this.phase = rand(0, Math.PI * 2);
    this.speed = rand(0.002, 0.007);
    this.driftX = rand(20, 60); this.driftY = rand(20, 60);
    this.color = [TEAL, INDIGO, GREEN][Math.floor(rand(0, 3))];
    this.alpha = rand(0.025, 0.06);
  }
  update() {
    this.phase += this.speed;
    this.x = this.baseX + Math.sin(this.phase) * this.driftX;
    this.y = this.baseY + Math.cos(this.phase * 0.7) * this.driftY;
  }
  draw(ctx) {
    const { r, g, b } = this.color;
    const g2 = ctx.createRadialGradient(this.x, this.y, 0, this.x, this.y, this.radius);
    g2.addColorStop(0, rgba(r, g, b, this.alpha));
    g2.addColorStop(1, rgba(r, g, b, 0));
    ctx.fillStyle = g2;
    ctx.beginPath(); ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2); ctx.fill();
  }
}

// ── Circuit trace with moving pulse dot ───────────────────────────────────────
class CircuitTrace {
  constructor(w, h) { this.init(w, h); }
  init(w, h) {
    this.x = rand(0, w); this.y = rand(0, h);
    const dirs = [0, Math.PI / 2, Math.PI, (3 * Math.PI) / 2];
    this.segments = [];
    let cx = this.x, cy = this.y;
    const segCount = Math.floor(rand(3, 6));
    for (let i = 0; i < segCount; i++) {
      const dir = dirs[Math.floor(rand(0, dirs.length))];
      const len = rand(40, 120);
      cx += Math.cos(dir) * len; cy += Math.sin(dir) * len;
      this.segments.push({ x: cx, y: cy });
    }
    this.color = [TEAL, INDIGO][Math.floor(rand(0, 2))];
    this.alpha = rand(0.06, 0.14);
    this.pulsePos = 0;
    this.pulseSpeed = rand(0.003, 0.008);
    this.totalLen = this._totalLen();
    this.life = rand(0.5, 1); this.maxLife = this.life;
  }
  _totalLen() {
    let len = 0, px = this.x, py = this.y;
    for (const s of this.segments) {
      len += Math.hypot(s.x - px, s.y - py);
      px = s.x; py = s.y;
    }
    return len;
  }
  update(w, h) {
    this.pulsePos = (this.pulsePos + this.pulseSpeed) % 1;
    this.life -= 0.0008;
    if (this.life <= 0) this.init(w, h);
  }
  _pointAt(t) {
    const target = t * this.totalLen;
    let acc = 0, px = this.x, py = this.y;
    for (const s of this.segments) {
      const segLen = Math.hypot(s.x - px, s.y - py);
      if (acc + segLen >= target) {
        const frac = (target - acc) / segLen;
        return { x: px + (s.x - px) * frac, y: py + (s.y - py) * frac };
      }
      acc += segLen; px = s.x; py = s.y;
    }
    return { x: px, y: py };
  }
  draw(ctx) {
    const fade = Math.min(1, this.life / 0.12);
    const { r, g, b } = this.color;
    // Draw trace
    ctx.beginPath();
    ctx.moveTo(this.x, this.y);
    for (const s of this.segments) ctx.lineTo(s.x, s.y);
    ctx.strokeStyle = rgba(r, g, b, this.alpha * fade);
    ctx.lineWidth = 1;
    ctx.stroke();
    // Draw junction dots
    ctx.fillStyle = rgba(r, g, b, this.alpha * fade * 2);
    for (const s of this.segments) {
      ctx.beginPath(); ctx.arc(s.x, s.y, 2.5, 0, Math.PI * 2); ctx.fill();
    }
    // Moving pulse dot
    const pt = this._pointAt(this.pulsePos);
    ctx.beginPath(); ctx.arc(pt.x, pt.y, 3, 0, Math.PI * 2);
    ctx.fillStyle = rgba(r, g, b, 0.85 * fade); ctx.fill();
    ctx.beginPath(); ctx.arc(pt.x, pt.y, 7, 0, Math.PI * 2);
    ctx.fillStyle = rgba(r, g, b, 0.15 * fade); ctx.fill();
  }
}

// ── Floating manufacturing symbol ─────────────────────────────────────────────
const MFG_SYMBOLS = ['⚙', '📱', '🔧', '⚡', '◈', '⬡', '◉', '▣'];
class FloatSymbol {
  constructor(w, h) { this.init(w, h, true); }
  init(w, h, first = false) {
    this.x = rand(0, w); this.y = first ? rand(0, h) : h + 30;
    this.vy = rand(-0.12, -0.04); this.vx = rand(-0.05, 0.05);
    this.alpha = rand(0.03, 0.09);
    this.size = rand(10, 20);
    this.sym = MFG_SYMBOLS[Math.floor(rand(0, MFG_SYMBOLS.length))];
    this.rot = rand(0, Math.PI * 2); this.rotSpeed = rand(-0.003, 0.003);
    this.color = [TEAL, INDIGO][Math.floor(rand(0, 2))];
  }
  update(w, h) {
    this.x += this.vx; this.y += this.vy; this.rot += this.rotSpeed;
    if (this.y < -40) this.init(w, h);
  }
  draw(ctx) {
    const { r, g, b } = this.color;
    ctx.save();
    ctx.translate(this.x, this.y);
    ctx.rotate(this.rot);
    ctx.font = `${this.size}px sans-serif`;
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.globalAlpha = this.alpha;
    ctx.fillStyle = rgba(r, g, b, 1);
    ctx.fillText(this.sym, 0, 0);
    ctx.restore();
    ctx.globalAlpha = 1;
  }
}

// ── Scanning line ─────────────────────────────────────────────────────────────
class ScanLine {
  constructor(h) { this.y = rand(0, h); this.speed = rand(0.3, 0.7); this.h = h; }
  update() { this.y += this.speed; if (this.y > this.h + 10) this.y = -10; }
  draw(ctx, w) {
    const g = ctx.createLinearGradient(0, this.y - 2, 0, this.y + 2);
    g.addColorStop(0, 'rgba(35,175,145,0)');
    g.addColorStop(0.5, 'rgba(35,175,145,0.06)');
    g.addColorStop(1, 'rgba(35,175,145,0)');
    ctx.fillStyle = g;
    ctx.fillRect(0, this.y - 2, w, 4);
  }
}

// ── Connection lines ──────────────────────────────────────────────────────────
function drawConnections(ctx, particles, maxDist) {
  for (let i = 0; i < particles.length; i++) {
    for (let j = i + 1; j < particles.length; j++) {
      const dx = particles[i].x - particles[j].x;
      const dy = particles[i].y - particles[j].y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < maxDist) {
        ctx.beginPath();
        ctx.moveTo(particles[i].x, particles[i].y);
        ctx.lineTo(particles[j].x, particles[j].y);
        ctx.strokeStyle = rgba(TEAL.r, TEAL.g, TEAL.b, (1 - dist / maxDist) * 0.07);
        ctx.lineWidth = 0.5;
        ctx.stroke();
      }
    }
  }
}

// ── Grid ──────────────────────────────────────────────────────────────────────
function drawGrid(ctx, w, h, time) {
  ctx.strokeStyle = rgba(43, 49, 57, 0.12);
  ctx.lineWidth = 0.5;
  const sp = 60; const off = (time * 6) % sp;
  for (let y = -sp + off; y < h + sp; y += sp) {
    ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(w, y); ctx.stroke();
  }
  for (let x = 0; x < w; x += sp) {
    ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, h); ctx.stroke();
  }
}

// ── Vignette ──────────────────────────────────────────────────────────────────
function drawVignette(ctx, w, h) {
  const g = ctx.createRadialGradient(w / 2, h / 2, w * 0.2, w / 2, h / 2, w * 0.72);
  g.addColorStop(0, 'rgba(0,0,0,0)');
  g.addColorStop(1, 'rgba(0,0,0,0.42)');
  ctx.fillStyle = g; ctx.fillRect(0, 0, w, h);
}

// ── Main component ────────────────────────────────────────────────────────────
export default function PhoneCraftBackground({ isDark = true }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let raf;
    let time = 0;
    const mobile = window.innerWidth < 640;
    let w = window.innerWidth, h = window.innerHeight;
    canvas.width = w; canvas.height = h;

    let particles   = Array.from({ length: mobile ? 30 : 55  }, () => new Particle(w, h));
    let orbs        = Array.from({ length: mobile ? 3  : 5   }, () => new GlowOrb(w, h));
    let circuits    = Array.from({ length: mobile ? 6  : 14  }, () => new CircuitTrace(w, h));
    let floatSyms   = Array.from({ length: mobile ? 8  : 18  }, () => new FloatSymbol(w, h));
    let scanLines   = Array.from({ length: 3 }, () => new ScanLine(h));
    const connDist  = mobile ? 90 : 130;

    const resize = () => {
      w = window.innerWidth; h = window.innerHeight;
      canvas.width = w; canvas.height = h;
    };

    const frame = () => {
      time += 1 / 60;
      ctx.clearRect(0, 0, w, h);

      drawGrid(ctx, w, h, time);
      for (const o of orbs)      { o.update(); o.draw(ctx); }
      for (const c of circuits)  { c.update(w, h); c.draw(ctx); }
      for (const s of floatSyms) { s.update(w, h); s.draw(ctx); }
      for (const sl of scanLines){ sl.update(); sl.draw(ctx, w); }
      drawConnections(ctx, particles, connDist);
      for (const p of particles) { p.update(w, h); p.draw(ctx); }
      drawVignette(ctx, w, h);

      raf = requestAnimationFrame(frame);
    };

    window.addEventListener('resize', resize);
    raf = requestAnimationFrame(frame);
    return () => { cancelAnimationFrame(raf); window.removeEventListener('resize', resize); };
  }, []);

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 0,
      background: 'linear-gradient(180deg, #0B0E11 0%, #0D1117 45%, #0B0E11 100%)',
      overflow: 'hidden',
    }}>
      <canvas ref={canvasRef} style={{ display: 'block' }} />
    </div>
  );
}
