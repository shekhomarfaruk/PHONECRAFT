import { useState, useEffect, useRef, useCallback } from "react";
import Icons from "../Icons.jsx";
import { PLANS, BRANDS, BRAND_MODELS, DEVICE_CONFIGS, generateTerminalLines } from "../data.jsx";
import { I18N } from "../i18n.js";
import { convertCurrency } from "../currency.js";
import { authFetch } from "../session.js";

const API_URL = import.meta.env.VITE_API_URL || '';

// ── Brand accent colors ────────────────────────────────────────────────────
const BRAND_COLORS = {
  Apple:   '#A0A0A0',
  Samsung: '#1428A0',
  Google:  '#4285F4',
  OnePlus: '#F5010C',
  Xiaomi:  '#FF6900',
  Oppo:    '#1F8EFA',
  Vivo:    '#415FFF',
  Realme:  '#FFE600',
};

// ── CSS Phone Mockup Component ─────────────────────────────────────────────
function PhoneMockup({ brand, model, color, animating = false }) {
  const accentColor = BRAND_COLORS[brand] || '#60A5FA';
  const bodyColor =
    color === 'Midnight Black' ? '#1a1a1f' :
    color === 'Arctic White'   ? '#f0f0f0' :
    color === 'Ocean Blue'     ? '#1a3a5c' :
    color === 'Sunset Gold'    ? '#7a5c1a' : '#1a1a2e';
  const screenBg =
    color === 'Arctic White' ? 'linear-gradient(160deg,#e8f0fe,#d2e3fc)' :
    'linear-gradient(160deg,#0f0f1a,#1a1a3a)';
  const textColor = color === 'Arctic White' ? '#1a1a2e' : '#fff';

  return (
    <div style={{ position: 'relative', display: 'inline-flex', alignItems: 'center' }}>
      {/* Volume buttons (left side) */}
      <div style={{ position: 'absolute', left: -6, top: 28, display: 'flex', flexDirection: 'column', gap: 5 }}>
        {[20, 24, 24].map((h, i) => (
          <div key={i} style={{ width: 4, height: h, background: bodyColor === '#f0f0f0' ? '#ccc' : '#333', borderRadius: 2, filter: 'brightness(0.7)' }} />
        ))}
      </div>
      {/* Power button (right side) */}
      <div style={{ position: 'absolute', right: -6, top: 38, width: 4, height: 28, background: bodyColor === '#f0f0f0' ? '#ccc' : '#333', borderRadius: 2, filter: 'brightness(0.7)' }} />

      {/* Phone body */}
      <div style={{
        width: 88, height: 155,
        borderRadius: 20,
        background: bodyColor,
        border: `2px solid ${bodyColor === '#f0f0f0' ? '#bbb' : '#333'}`,
        boxShadow: `0 12px 40px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.1)`,
        display: 'flex', flexDirection: 'column', alignItems: 'center',
        overflow: 'hidden',
        position: 'relative',
      }}>
        {/* Screen bezel top */}
        <div style={{ width: '100%', background: '#000', paddingTop: 4, paddingBottom: 3, display: 'flex', justifyContent: 'center' }}>
          {/* Dynamic island / pill */}
          <div style={{
            width: brand === 'Apple' ? 36 : 12, height: 8,
            background: '#111',
            borderRadius: 10,
          }} />
        </div>

        {/* Screen */}
        <div style={{
          flex: 1, width: '100%',
          background: screenBg,
          display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'space-between',
          padding: '8px 6px 6px',
          position: 'relative', overflow: 'hidden',
        }}>
          {/* Status bar */}
          <div style={{ width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
            <div style={{ fontSize: 6, color: textColor, opacity: 0.7, fontWeight: 700 }}>9:41</div>
            <div style={{ display: 'flex', gap: 2, alignItems: 'center' }}>
              {[3,4,5,6].map(h => <div key={h} style={{ width: 2, height: h, background: textColor, opacity: 0.7, borderRadius: 1 }} />)}
              <div style={{ width: 8, height: 4, border: `1px solid ${textColor}`, borderRadius: 1, opacity: 0.7, marginLeft: 2 }}>
                <div style={{ width: '70%', height: '100%', background: textColor, opacity: 0.7 }} />
              </div>
            </div>
          </div>

          {/* Brand logo area */}
          <div style={{ textAlign: 'center' }}>
            <div style={{
              fontSize: 7, fontWeight: 900, letterSpacing: 1,
              color: accentColor, textTransform: 'uppercase', marginBottom: 2,
            }}>
              {brand}
            </div>
            <div style={{
              fontSize: 6, color: textColor, opacity: 0.8,
              fontWeight: 600, lineHeight: 1.3, textAlign: 'center',
              maxWidth: 70,
            }}>
              {model}
            </div>
          </div>

          {/* Manufacturing animation */}
          {animating && (
            <div style={{ display: 'flex', gap: 3, alignItems: 'center' }}>
              {[0, 0.3, 0.6].map((delay, i) => (
                <div key={i} style={{
                  width: 4, height: 4, borderRadius: '50%',
                  background: accentColor,
                  animation: `phonePulse 1s ease-in-out ${delay}s infinite`,
                }} />
              ))}
            </div>
          )}

          {/* Wallpaper grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 3, width: '100%' }}>
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} style={{
                height: 12, borderRadius: 4,
                background: i === 0 ? accentColor : `rgba(255,255,255,0.08)`,
                opacity: i === 0 ? 0.7 : 1,
              }} />
            ))}
          </div>
        </div>

        {/* Home indicator */}
        <div style={{ width: '100%', background: '#000', paddingBottom: 5, paddingTop: 3, display: 'flex', justifyContent: 'center' }}>
          <div style={{ width: 28, height: 3, background: '#444', borderRadius: 2 }} />
        </div>
      </div>

      <style>{`
        @keyframes phonePulse {
          0%,100%{opacity:.3;transform:scale(.8)}
          50%{opacity:1;transform:scale(1.2)}
        }
      `}</style>
    </div>
  );
}

export default function WorkScreen({ user, setUser, showToast, addNotif, lang }) {
  const t = I18N[lang] || I18N.en;
  const [phase, setPhase] = useState('config'); // 'config' | 'terminal' | 'success'

  // Config form
  const [deviceName, setDeviceName] = useState('');
  const [brand, setBrand]           = useState('');
  const [ram, setRam]               = useState('');
  const [rom, setRom]               = useState('');
  const [color, setColor]           = useState('');
  const [starting, setStarting]     = useState(false);

  // Work status from backend
  const [dailyDone, setDailyDone]   = useState(user.dailyDone || 0);
  const [dailyLimit, setDailyLimit] = useState(user.dailyLimit || 10);
  const [perTask, setPerTask]       = useState(0);

  // Terminal state
  const [lines, setLines]       = useState([]);
  const [progress, setProgress] = useState(0);
  const termRef  = useRef(null);
  const timerRef = useRef(null);
  const resumeElapsedRef = useRef(0);

  // Success data (stored in ref to avoid re-renders during terminal)
  const jobRef     = useRef(null);
  const resultRef  = useRef(null);

  // ── Fetch work status on mount ─────────────────────────────────────────────
  useEffect(() => {
    if (!user.id) return;
    authFetch(`${API_URL}/api/user/${user.id}/work-status`)
      .then(r => r.json())
      .then(data => {
        if (data.dailyDone !== undefined) setDailyDone(data.dailyDone);
        if (data.dailyLimit !== undefined) setDailyLimit(data.dailyLimit);
        if (data.perTask !== undefined) setPerTask(data.perTask);
        if (data.activeJob) {
          jobRef.current = data.activeJob;
          setDeviceName(data.activeJob.device_name || '');
          setBrand(data.activeJob.brand || '');
          setRam(data.activeJob.ram || '');
          setRom(data.activeJob.rom || '');
          setColor(data.activeJob.color || '');

          const createdAt = data.activeJob.created_at ? new Date(`${data.activeJob.created_at}Z`).getTime() : Date.now();
          resumeElapsedRef.current = Math.max(0, Date.now() - createdAt);

          if (resumeElapsedRef.current >= 120000) {
            clearInterval(timerRef.current);
            completeManufacturing(data.activeJob);
          } else {
            setPhase('terminal');
          }
        }
      })
      .catch(() => {});
  }, [user.id]);

  // When brand changes, clear selected model
  const handleBrandSelect = (b) => {
    if (limitReached) return;
    setBrand(b);
    setDeviceName('');
  };

  const limitReached = dailyDone >= dailyLimit;
  const canStart = deviceName.trim() && brand && ram && rom && color && !limitReached && !starting;

  // ── Start Manufacturing ────────────────────────────────────────────────────
  const handleStart = useCallback(async () => {
    if (!canStart) return;
    setStarting(true);
    try {
      const res = await authFetch(`${API_URL}/api/manufacture/start`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.id, deviceName: deviceName.trim(),
          brand, ram, rom, color,
        }),
      });
      const data = await res.json();
      if (!res.ok) { showToast(data.error, 'error'); setStarting(false); return; }

      jobRef.current = data.job;
      resumeElapsedRef.current = 0;
      setDailyDone(data.dailyDone);
      setDailyLimit(data.dailyLimit);
      setPhase('terminal');
    } catch {
      showToast(t.toast_connection_error, 'error');
    }
    setStarting(false);
  }, [canStart, user.id, deviceName, brand, ram, rom, color, showToast, t]);

  // ── Terminal animation ─────────────────────────────────────────────────────
  useEffect(() => {
    if (phase !== 'terminal') return;
    const allLines = generateTerminalLines(deviceName, ram, rom);
    const total = allLines.length;
    const initialIdx = Math.min(total, Math.floor((resumeElapsedRef.current / 120000) * total));
    let idx = initialIdx;

    setLines(allLines.slice(0, initialIdx));
    setProgress(Math.round((initialIdx / total) * 100));

    if (resumeElapsedRef.current >= 120000) {
      completeManufacturing();
      return;
    }

    timerRef.current = setInterval(() => {
      if (idx < total) {
        setLines(prev => [...prev, allLines[idx]]);
        setProgress(Math.round(((idx + 1) / total) * 100));
        idx++;
      } else {
        clearInterval(timerRef.current);
        completeManufacturing();
      }
    }, Math.max(120, Math.floor((120000 - resumeElapsedRef.current) / Math.max(1, total - initialIdx))));

    return () => clearInterval(timerRef.current);
  }, [phase]); // eslint-disable-line react-hooks/exhaustive-deps

  // Auto-scroll terminal
  useEffect(() => {
    if (termRef.current) {
      termRef.current.scrollTop = termRef.current.scrollHeight;
    }
  }, [lines]);

  // ── Complete manufacturing (backend call) ──────────────────────────────────
  const completeManufacturing = async (jobOverride = null) => {
    if (jobOverride) jobRef.current = jobOverride;
    if (!jobRef.current) return;
    try {
      const res = await authFetch(`${API_URL}/api/manufacture/complete`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.id, jobId: jobRef.current.id }),
      });
      const data = await res.json();
      if (!res.ok) { showToast(data.error, 'error'); return; }

      resultRef.current = data;
      setDailyDone(data.dailyDone);
      setDailyLimit(data.dailyLimit);

      setUser(prev => ({ ...prev, balance: data.newBalance, dailyDone: data.dailyDone }));

      addNotif({
        type: 'success',
        iconKey: 'Smartphone',
        text: `${deviceName} — ${t.device_posted} $${Math.min(data.marketPrice, 10)}`,
      });

      setPhase('success');
    } catch {
      showToast(t.toast_connection_error, 'error');
    }
  };

  // ── Manufacture Another ────────────────────────────────────────────────────
  const handleReset = () => {
    setPhase('config');
    setDeviceName('');
    setBrand('');
    setRam('');
    setRom('');
    setColor('');
    setLines([]);
    setProgress(0);
    resumeElapsedRef.current = 0;
    jobRef.current = null;
    resultRef.current = null;
  };

  const plan = PLANS.find(p => p.id === user.plan);
  const brandModels = brand ? (BRAND_MODELS[brand] || []) : [];

  // ════════════════════════════════════════════════════════════════════════════
  // RENDER: CONFIG PHASE
  // ════════════════════════════════════════════════════════════════════════════
  if (phase === 'config') {
    return (
      <>
        <div className="screen-title"><Icons.Work size={18}/> {t.nav_work}</div>

        {/* Daily Progress */}
        <div className="card">
          <div className="card-title"><Icons.Cpu size={14}/> {t.daily_tasks}</div>
          <div style={{ display:'flex', justifyContent:'space-between', marginBottom:8 }}>
            <span style={{ fontSize:13 }}>{t.completed}</span>
            <span style={{ fontFamily:'Space Grotesk', fontSize:13, color: limitReached ? 'var(--red)' : 'var(--accent)' }}>
              {dailyDone} / {dailyLimit}
            </span>
          </div>
          <div className="prog-bar">
            <div className="prog-fill" style={{ width: `${dailyLimit > 0 ? Math.min(100, (dailyDone / dailyLimit) * 100) : 0}%` }} />
          </div>
          {limitReached && (
            <div style={{ marginTop:8, fontSize:12, color:'var(--red)', fontWeight:600 }}>
              {t.daily_limit_reached}
            </div>
          )}
          {!limitReached && plan && (
            <div style={{ marginTop:8, fontSize:11, color:'var(--text2)' }}>
              {plan.name} — {convertCurrency(plan.perTask, lang)} · {dailyLimit - dailyDone} {t.remaining}
            </div>
          )}
        </div>

        {/* Device Configuration */}
        <div className="card">
          <div className="card-title"><Icons.Smartphone size={14}/> {t.device_config}</div>

          {/* Brand */}
          <label className="input-label">{t.brand}</label>
          <div className="config-grid" style={{ marginBottom: 14 }}>
            {BRANDS.map(b => (
              <div key={b} onClick={() => handleBrandSelect(b)}
                style={{
                  background: brand === b ? `${BRAND_COLORS[b]}22` : 'var(--input-bg)',
                  border: `1px solid ${brand === b ? (BRAND_COLORS[b] || 'var(--accent)') : 'var(--border)'}`,
                  borderRadius: 10, padding: '10px 8px', textAlign: 'center',
                  cursor: limitReached ? 'not-allowed' : 'pointer', transition: 'all .2s',
                  fontSize: 11, fontWeight: 700, opacity: limitReached ? .5 : 1,
                  color: brand === b ? (BRAND_COLORS[b] || 'var(--accent)') : 'var(--text)',
                }}>
                {b}
              </div>
            ))}
          </div>

          {/* Model — shown after brand selected */}
          {brand && (
            <>
              <label className="input-label">
                {lang === 'bn' ? 'মডেল নির্বাচন করুন' : 'Select Model'}
                {deviceName && <span style={{ color: 'var(--accent)', marginLeft: 6 }}>✓</span>}
              </label>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 14 }}>
                {brandModels.map(m => (
                  <div key={m} onClick={() => !limitReached && setDeviceName(m)}
                    style={{
                      background: deviceName === m ? `${BRAND_COLORS[brand] || 'var(--accent)'}18` : 'var(--input-bg)',
                      border: `1px solid ${deviceName === m ? (BRAND_COLORS[brand] || 'var(--accent)') : 'var(--border)'}`,
                      borderRadius: 10, padding: '11px 14px',
                      cursor: limitReached ? 'not-allowed' : 'pointer', transition: 'all .2s',
                      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                      opacity: limitReached ? .5 : 1,
                    }}>
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 700, color: deviceName === m ? (BRAND_COLORS[brand] || 'var(--accent)') : 'var(--text)' }}>
                        {m}
                      </div>
                      <div style={{ fontSize: 10, color: 'var(--text2)', marginTop: 2 }}>{brand}</div>
                    </div>
                    {deviceName === m && (
                      <div style={{ width: 18, height: 18, borderRadius: '50%', background: BRAND_COLORS[brand] || 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Icons.CheckCircle size={12} color="#fff" />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </>
          )}

          {/* RAM */}
          <label className="input-label">{t.ram}</label>
          <div className="config-grid" style={{ marginBottom:14 }}>
            {DEVICE_CONFIGS.rams.map(r => (
              <div key={r} onClick={() => !limitReached && setRam(r)}
                style={{
                  background: ram===r ? 'rgba(35,175,145,.15)' : 'var(--input-bg)',
                  border: `1px solid ${ram===r ? 'var(--accent)' : 'var(--border)'}`,
                  borderRadius:10, padding:'10px 8px', textAlign:'center',
                  cursor: limitReached ? 'not-allowed' : 'pointer', transition:'all .2s',
                  fontSize:12, fontWeight:600, opacity: limitReached ? .5 : 1,
                }}>
                {r}
              </div>
            ))}
          </div>

          {/* ROM */}
          <label className="input-label">{t.storage}</label>
          <div className="config-grid" style={{ marginBottom:14 }}>
            {DEVICE_CONFIGS.roms.map(r => (
              <div key={r} onClick={() => !limitReached && setRom(r)}
                style={{
                  background: rom===r ? 'rgba(35,175,145,.15)' : 'var(--input-bg)',
                  border: `1px solid ${rom===r ? 'var(--accent)' : 'var(--border)'}`,
                  borderRadius:10, padding:'10px 8px', textAlign:'center',
                  cursor: limitReached ? 'not-allowed' : 'pointer', transition:'all .2s',
                  fontSize:12, fontWeight:600, opacity: limitReached ? .5 : 1,
                }}>
                {r}
              </div>
            ))}
          </div>

          {/* Color */}
          <label className="input-label">{t.color}</label>
          <div className="config-grid" style={{ marginBottom:14 }}>
            {DEVICE_CONFIGS.colors.map(c => (
              <div key={c} onClick={() => !limitReached && setColor(c)}
                style={{
                  background: color===c ? 'rgba(35,175,145,.15)' : 'var(--input-bg)',
                  border: `1px solid ${color===c ? 'var(--accent)' : 'var(--border)'}`,
                  borderRadius:10, padding:'10px 8px', textAlign:'center',
                  cursor: limitReached ? 'not-allowed' : 'pointer', transition:'all .2s',
                  fontSize:12, fontWeight:600, opacity: limitReached ? .5 : 1,
                }}>
                {c}
              </div>
            ))}
          </div>

          {/* Preview phone when fully configured */}
          {deviceName && brand && color && (
            <div style={{ display: 'flex', justifyContent: 'center', padding: '12px 0 4px' }}>
              <PhoneMockup brand={brand} model={deviceName} color={color} />
            </div>
          )}
        </div>

        {/* Start Button */}
        <button className="btn btn-primary btn-full" disabled={!canStart} onClick={handleStart}>
          <Icons.Zap size={16} /> {starting ? t.loading : limitReached ? t.limit_reached : t.start_mfg}
        </button>
        <div style={{ height: 16 }} />
      </>
    );
  }

  // ════════════════════════════════════════════════════════════════════════════
  // RENDER: TERMINAL PHASE
  // ════════════════════════════════════════════════════════════════════════════
  if (phase === 'terminal') {
    return (
      <>
        <div className="screen-title"><Icons.Cpu size={18}/> {t.mfg_terminal}</div>

        {/* Device info with real phone mockup */}
        <div className="device-preview">
          <PhoneMockup brand={brand} model={deviceName} color={color} animating={progress < 100} />
          <div style={{ fontFamily:'Space Grotesk', fontSize:14, fontWeight:700, marginTop: 8 }}>{deviceName}</div>
          <div style={{ fontSize:12, color:'var(--text2)', marginTop:4 }}>{brand} · {ram} · {rom}</div>
        </div>

        {/* Progress bar */}
        <div className="card">
          <div style={{ display:'flex', justifyContent:'space-between', marginBottom:8 }}>
            <span style={{ fontSize:12, fontWeight:600, color:'var(--text2)' }}>PROGRESS</span>
            <span style={{ fontFamily:'Space Grotesk', fontSize:13, color:'var(--accent)' }}>{progress}%</span>
          </div>
          <div className="prog-bar">
            <div className="prog-fill" style={{ width: `${progress}%` }} />
          </div>
        </div>

        {/* Terminal */}
        <div className="terminal" ref={termRef}>
          <div className="terminal-header">
            <div className="t-dot" style={{ background:'#ff5f56' }} />
            <div className="t-dot" style={{ background:'#ffbd2e' }} />
            <div className="t-dot" style={{ background:'#27c93f' }} />
            <span style={{ marginLeft:8, fontSize:10, color:'#0ECB8155' }}>phonecraft-mfg v4.2</span>
          </div>
          {lines.map((line, i) => (
            <div key={i} className="t-line">{line}</div>
          ))}
          {progress < 100 && <span className="t-cursor" />}
        </div>

        <div style={{ textAlign:'center', marginTop:12, fontSize:12, color:'var(--text2)' }}>
          {t.mfg_in_progress}
        </div>
      </>
    );
  }

  // ════════════════════════════════════════════════════════════════════════════
  // RENDER: SUCCESS PHASE
  // ════════════════════════════════════════════════════════════════════════════
  const result = resultRef.current;
  const job = result?.job || jobRef.current;
  const newLimitReached = dailyDone >= dailyLimit;
  const jobBrand = job?.brand || brand;
  const jobModel = job?.device_name || deviceName;
  const jobColor = job?.color || color;

  return (
    <div className="device-result">
      <div className="screen-title"><Icons.CheckCircle size={18}/> {t.processing_done}</div>

      {/* Success banner */}
      <div className="card" style={{ background:'linear-gradient(135deg,rgba(14,203,129,.1),rgba(35,175,145,.1))', borderColor:'rgba(14,203,129,.3)', textAlign:'center' }}>
        <div style={{ marginBottom:8 }}><Icons.CheckCircle size={40} /></div>
        <div style={{ fontFamily:'Space Grotesk', fontSize:16, fontWeight:900, color:'var(--green)', marginBottom:4 }}>
          {t.processing_done}
        </div>
        <div style={{ fontSize:13, color:'var(--text2)' }}>
          {t.device_posted}
        </div>
      </div>

      {/* Device preview with real phone mockup */}
      <div className="device-preview">
        <PhoneMockup brand={jobBrand} model={jobModel} color={jobColor} />
        <div style={{ fontFamily:'Space Grotesk', fontSize:15, fontWeight:700, marginTop: 8 }}>{jobModel}</div>
        <div style={{ fontSize:12, color:'var(--text2)', marginTop:4 }}>
          {jobBrand} · {job?.ram || ram} · {job?.rom || rom}
        </div>
      </div>

      {/* Specs + details */}
      <div className="card">
        <div className="card-title"><Icons.Package size={14}/> {t.device_config}</div>
        <div className="spec-grid">
          {[
            { label:'MFG ID', value: `#MFG-${job?.id || '??'}` },
            { label: t.brand, value: jobBrand },
            { label: t.ram, value: job?.ram || ram },
            { label: t.storage, value: job?.rom || rom },
            { label: t.color, value: jobColor },
            { label:'Status', value: t.completed },
          ].map(s => (
            <div key={s.label} style={{ background:'var(--input-bg)', border:'1px solid var(--border)', borderRadius:8, padding:'8px 10px' }}>
              <div style={{ fontSize:9, color:'var(--text2)', letterSpacing:1, marginBottom:2 }}>{s.label}</div>
              <div style={{ fontSize:12, fontWeight:700 }}>{s.value}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Earnings */}
      <div className="card" style={{ textAlign:'center' }}>
        <div style={{ fontSize:11, color:'var(--text2)', letterSpacing:1, marginBottom:6 }}>{t.earned_suffix}</div>
        <div style={{ fontFamily:'Space Grotesk', fontSize:26, fontWeight:900, color:'var(--green)' }}>
          +{convertCurrency(result?.earned || perTask, lang)}
        </div>
        <div style={{ marginTop:8, fontSize:12, color:'var(--text2)' }}>
          {t.balance}: {convertCurrency(result?.newBalance ?? user.balance, lang)}
        </div>
      </div>

      {/* Marketplace listing */}
      {result?.marketPrice && (
        <div className="card" style={{ display:'flex', alignItems:'center', gap:12 }}>
          <Icons.Market size={22} />
          <div style={{ flex:1 }}>
            <div style={{ fontSize:13, fontWeight:700 }}>{t.device_posted}</div>
            <div style={{ fontSize:11, color:'var(--text2)' }}>{jobModel} · {t.price_label}: ${Math.min(result.marketPrice, 10)}</div>
          </div>
          <span className="badge badge-green">{t.active}</span>
        </div>
      )}

      {/* Daily progress */}
      <div className="card">
        <div className="card-title"><Icons.Cpu size={14}/> {t.daily_progress}</div>
        <div style={{ display:'flex', justifyContent:'space-between', marginBottom:8 }}>
          <span style={{ fontSize:13 }}>{t.daily_tasks}</span>
          <span style={{ fontFamily:'Space Grotesk', fontSize:13, color: newLimitReached ? 'var(--red)' : 'var(--accent)' }}>
            {dailyDone} / {dailyLimit}
          </span>
        </div>
        <div className="prog-bar">
          <div className="prog-fill" style={{ width: `${dailyLimit > 0 ? (dailyDone / dailyLimit) * 100 : 0}%` }} />
        </div>
        {newLimitReached && (
          <div style={{ marginTop:8, fontSize:12, color:'var(--red)', fontWeight:600 }}>
            {t.daily_limit_reached}
          </div>
        )}
      </div>

      {/* Action button */}
      <button className="btn btn-primary btn-full" onClick={handleReset} disabled={newLimitReached}>
        <Icons.Zap size={16} /> {newLimitReached ? t.limit_reached : t.start_mfg}
      </button>
      <div style={{ height: 16 }} />
    </div>
  );
}
