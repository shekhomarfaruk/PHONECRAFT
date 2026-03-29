import { useState, useEffect, useRef, useCallback } from "react";
import Icons from "../Icons.jsx";
import { PLANS, BRANDS, BRAND_MODELS, DEVICE_CONFIGS, DEVICE_IMAGES, generateTerminalLines } from "../data.jsx";
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

// ── Real Device Image Component ────────────────────────────────────────────
function DeviceImage({ brand, model, animating = false, size = 160 }) {
  const [loaded, setLoaded] = useState(false);
  const [error, setError]   = useState(false);
  const accentColor = BRAND_COLORS[brand] || '#23AF91';
  const imgSrc = DEVICE_IMAGES[model];

  return (
    <div style={{
      position: 'relative',
      width: size,
      height: size * 1.22,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
    }}>
      {/* Glow ring */}
      <div style={{
        position: 'absolute', inset: 0, borderRadius: '50%',
        background: `radial-gradient(circle, ${accentColor}22 0%, transparent 70%)`,
        animation: animating ? 'deviceGlowPulse 1.4s ease-in-out infinite' : undefined,
      }} />

      {/* Skeleton loader */}
      {!loaded && !error && imgSrc && (
        <div style={{
          width: size * 0.55, height: size * 1.05,
          borderRadius: size * 0.08,
          background: 'linear-gradient(135deg,var(--card) 25%,var(--border) 50%,var(--card) 75%)',
          backgroundSize: '200% 100%',
          animation: 'shimmer 1.5s infinite',
        }} />
      )}

      {/* Real device photo */}
      {imgSrc && !error && (
        <img
          src={imgSrc}
          alt={model}
          onLoad={() => setLoaded(true)}
          onError={() => setError(true)}
          style={{
            maxWidth: size * 0.65,
            maxHeight: size * 1.1,
            objectFit: 'contain',
            display: loaded ? 'block' : 'none',
            filter: animating
              ? `drop-shadow(0 0 14px ${accentColor}99)`
              : `drop-shadow(0 8px 24px rgba(0,0,0,0.5)) drop-shadow(0 0 8px ${accentColor}44)`,
            transition: 'filter .4s',
          }}
        />
      )}

      {/* Fallback — CSS device silhouette */}
      {(error || !imgSrc) && (
        <div style={{
          width: size * 0.52, height: size * 1.0,
          borderRadius: size * 0.08,
          background: `linear-gradient(160deg, ${accentColor}22, ${accentColor}08)`,
          border: `2px solid ${accentColor}55`,
          boxShadow: `0 8px 32px rgba(0,0,0,0.4), 0 0 20px ${accentColor}33`,
          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 6,
        }}>
          <Icons.Smartphone size={28} color={accentColor} />
          <div style={{ fontSize: 9, color: accentColor, fontWeight: 700, textAlign: 'center', padding: '0 6px', lineHeight: 1.3 }}>
            {brand}
          </div>
        </div>
      )}

      {/* Manufacturing pulse overlay */}
      {animating && loaded && (
        <div style={{
          position: 'absolute', inset: 0,
          background: `radial-gradient(circle, ${accentColor}30 0%, transparent 65%)`,
          borderRadius: '50%',
          animation: 'deviceGlowPulse 1.4s ease-in-out infinite',
          pointerEvents: 'none',
        }} />
      )}

      <style>{`
        @keyframes deviceGlowPulse {
          0%,100%{opacity:.4;transform:scale(.95)}
          50%{opacity:1;transform:scale(1.05)}
        }
        @keyframes shimmer {
          0%{background-position:200% 0}
          100%{background-position:-200% 0}
        }
      `}</style>
    </div>
  );
}

export default function WorkScreen({ user, setUser, showToast, addNotif, lang, navigate, onShowGuestPlanModal }) {
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
      if (!res.ok) {
        if (data.error === 'guest_task_limit' && onShowGuestPlanModal) {
          showToast(lang === 'bn'
            ? 'আপনি এই ট্রায়ালের টাস্ক লিমিটে পৌঁছেছেন।'
            : "You've reached the task limit for this trial.", 'error');
          setTimeout(() => onShowGuestPlanModal(), 600);
        } else {
          showToast(data.message || data.error, 'error');
        }
        setStarting(false);
        return;
      }

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
      if (!res.ok) { showToast(data.error || data.message, 'error'); return; }

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

      // Guest: show task-limit message + upgrade prompt when cap hit
      if (data.guest_task_limit && onShowGuestPlanModal) {
        showToast(lang === 'bn'
          ? 'আপনি এই ট্রায়ালের টাস্ক লিমিটে পৌঁছেছেন।'
          : "You've reached the task limit for this trial.", 'error');
        setTimeout(() => onShowGuestPlanModal(), 1200);
      } else if (data.guest_blocked && onShowGuestPlanModal) {
        // Guest completed a task but hasn't hit cap yet — still nudge
        setTimeout(() => onShowGuestPlanModal(), 1200);
      }
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

  // ── Time gate: 9 AM – 10 PM Bangladesh time (UTC+6) ─────────────────────────
  const nowBDT  = new Date(new Date().getTime() + 6 * 60 * 60 * 1000);
  const bdtHour = nowBDT.getUTCHours();
  const isWorkHour = bdtHour >= 9 && bdtHour < 22;

  // ── Country access check ──────────────────────────────────────────────────
  const [countryAccess, setCountryAccess] = useState({ loading: false, blocked: false });
  useEffect(() => {
    authFetch(`${API_URL}/api/work/access`)
      .then(r => r.json())
      .then(d => setCountryAccess({ loading: false, blocked: !!d.blocked }))
      .catch(() => setCountryAccess({ loading: false, blocked: false }));
  }, []);

  // ── Restriction overlays (early return — nav stays accessible) ──────────────
  const restrictionOverlayStyle = {
    display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center',
    gap:18, textAlign:'center', padding:32,
    minHeight:'calc(100dvh - 160px)',
  };
  const backBtn = navigate && (
    <button onClick={() => navigate('home')} style={{
      marginTop:8, padding:'10px 28px', borderRadius:24,
      border:'1px solid var(--border)',
      background:'var(--input-bg)', color:'var(--text)',
      fontSize:14, fontWeight:600, cursor:'pointer',
    }}>← {t.nav_home}</button>
  );

  if (countryAccess.blocked) {
    return (
      <>
        <div className="screen-title"><Icons.Work size={18}/> {t.nav_work}</div>
        <div style={restrictionOverlayStyle}>
          <div style={{fontSize:50}}>🌍</div>
          <div style={{fontFamily:'Space Grotesk',fontSize:22,fontWeight:800}}>{t.work_country_blocked}</div>
          <div style={{fontSize:14,color:'var(--text2)',maxWidth:280,lineHeight:1.7}}>{t.work_country_msg}</div>
          <div style={{fontSize:12,color:'var(--text2)',opacity:.7}}>{t.work_country_sub}</div>
          {backBtn}
        </div>
      </>
    );
  }

  if (!isWorkHour) {
    return (
      <>
        <div className="screen-title"><Icons.Work size={18}/> {t.nav_work}</div>
        <div style={restrictionOverlayStyle}>
          <div style={{fontSize:50}}>🕘</div>
          <div style={{fontFamily:'Space Grotesk',fontSize:22,fontWeight:800}}>{t.work_time_over}</div>
          <div style={{fontSize:14,color:'var(--text2)',maxWidth:280,lineHeight:1.7}}>
            {t.work_time_msg_line1}<br/>
            <b style={{color:'var(--accent)'}}>{t.work_time_range}</b><br/>
            {t.work_time_msg_line2}
          </div>
          <div style={{fontSize:12,color:'var(--text2)',opacity:.6}}>
            {t.work_cur_time_lbl} {nowBDT.getUTCHours().toString().padStart(2,'0')}:{nowBDT.getUTCMinutes().toString().padStart(2,'0')}
          </div>
          {backBtn}
        </div>
      </>
    );
  }

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
                {t.work_select_model}
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
              <DeviceImage brand={brand} model={deviceName} size={130} />
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
          <DeviceImage brand={brand} model={deviceName} animating={progress < 100} />
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
        <DeviceImage brand={jobBrand} model={jobModel} />
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
