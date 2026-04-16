import { useState, useEffect, useRef } from "react";
import Icons from "../Icons.jsx";
import { PLANS } from "../data.jsx";
import { I18N } from "../i18n.js";
import { QRCodeSVG } from "qrcode.react";
import { convertCurrency } from "../currency.js";
import { authFetch } from "../session.js";

const API_URL = import.meta.env.VITE_API_URL || '';

// ── Referral Share Card Modal ──────────────────────────────────────────────────
function ReferralCardModal({ user, lang, onClose, l1Earn, l2Earn, l3Earn }) {
  const t = I18N[lang] || I18N.en;
  const refLink = `${window.location.origin}/?ref=${user.referCode}`;
  const canvasRef = useRef(null);
  const [downloading, setDownloading] = useState(false);
  const [qrReady, setQrReady] = useState(false);
  const isBn = lang === 'bn';

  const downloadCard = async () => {
    if (!qrReady) return;
    setDownloading(true);
    try {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const a = document.createElement('a');
      a.download = `phonecraft-referral-${user.referCode}.png`;
      a.href = canvas.toDataURL('image/png');
      a.click();
    } finally {
      setDownloading(false);
    }
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const W = canvas.width;
    const H = canvas.height;

    const accentColor = '#23AF91';
    const bgDark = '#0B0E11';
    const bg2 = '#161A25';
    const textMain = '#EAECEF';
    const textSub = '#848E9C';
    const goldColor = '#FCD535';

    ctx.clearRect(0, 0, W, H);

    // Polyfill roundRect if not available
    if (!ctx.roundRect) {
      ctx.roundRect = function(x, y, w, h, r) {
        const radius = typeof r === 'number' ? r : (Array.isArray(r) ? r[0] : 0);
        this.beginPath();
        this.moveTo(x + radius, y);
        this.lineTo(x + w - radius, y);
        this.quadraticCurveTo(x + w, y, x + w, y + radius);
        this.lineTo(x + w, y + h - radius);
        this.quadraticCurveTo(x + w, y + h, x + w - radius, y + h);
        this.lineTo(x + radius, y + h);
        this.quadraticCurveTo(x, y + h, x, y + h - radius);
        this.lineTo(x, y + radius);
        this.quadraticCurveTo(x, y, x + radius, y);
        this.closePath();
      };
    }

    // Background gradient
    const bgGrad = ctx.createLinearGradient(0, 0, W, H);
    bgGrad.addColorStop(0, '#0d1117');
    bgGrad.addColorStop(0.5, '#0f1a24');
    bgGrad.addColorStop(1, '#0a1620');
    ctx.fillStyle = bgGrad;
    ctx.roundRect(0, 0, W, H, 20);
    ctx.fill();

    // Top accent bar
    const topGrad = ctx.createLinearGradient(0, 0, W, 0);
    topGrad.addColorStop(0, '#23AF91');
    topGrad.addColorStop(1, '#1a8f75');
    ctx.fillStyle = topGrad;
    ctx.fillRect(0, 0, W, 5);

    // Glow circles (decorative)
    ctx.save();
    ctx.globalAlpha = 0.06;
    const glow1 = ctx.createRadialGradient(W * 0.8, H * 0.15, 10, W * 0.8, H * 0.15, 120);
    glow1.addColorStop(0, '#23AF91');
    glow1.addColorStop(1, 'transparent');
    ctx.fillStyle = glow1;
    ctx.fillRect(0, 0, W, H);
    ctx.restore();

    // Logo text area at top
    ctx.save();
    ctx.font = 'bold 16px Space Grotesk, sans-serif';
    ctx.fillStyle = accentColor;
    ctx.fillText('PHONECRAFT', 24, 38);
    ctx.font = '11px sans-serif';
    ctx.fillStyle = textSub;
    ctx.fillText(isBn ? 'ম্যানুফ্যাকচারিং প্ল্যাটফর্ম' : 'Manufacturing · Earn · Withdraw', 24, 54);
    ctx.restore();

    // Divider
    ctx.strokeStyle = 'rgba(35,175,145,0.3)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(20, 66);
    ctx.lineTo(W - 20, 66);
    ctx.stroke();

    // Main CTA text
    ctx.save();
    ctx.font = 'bold 20px Space Grotesk, sans-serif';
    ctx.fillStyle = textMain;
    const ctaText = t.ref_card_join;
    ctx.fillText(ctaText, 24, 98);
    ctx.restore();

    // User name
    ctx.save();
    ctx.font = '13px sans-serif';
    ctx.fillStyle = textSub;
    ctx.fillText((isBn ? 'শেয়ার করেছেন: ' : 'Shared by: ') + (user.name || 'PhoneCraft User'), 24, 118);
    ctx.restore();

    // Referral code box
    ctx.save();
    ctx.fillStyle = 'rgba(35,175,145,0.12)';
    ctx.strokeStyle = 'rgba(35,175,145,0.4)';
    ctx.lineWidth = 1.5;
    ctx.roundRect(20, 130, W - 40, 54, 12);
    ctx.fill();
    ctx.stroke();
    ctx.font = '10px sans-serif';
    ctx.fillStyle = accentColor;
    ctx.fillText(isBn ? 'রেফারেল কোড' : 'REFERRAL CODE', 30, 148);
    ctx.font = 'bold 28px Space Grotesk, monospace';
    ctx.fillStyle = accentColor;
    ctx.fillText(user.referCode || '', 30, 175);
    ctx.restore();

    // Earnings row
    const eBoxY = 198;
    const eBoxH = 56;
    const eBoxW = (W - 56) / 3;
    const levels = [
      { label: 'L1 (20%)', color: '#4ADE80', val: convertCurrency(l1Earn || 0, lang) },
      { label: 'L2 (4%)',  color: accentColor, val: convertCurrency(l2Earn || 0, lang) },
      { label: 'L3 (1%)',  color: '#A78BFA',  val: convertCurrency(l3Earn || 0, lang) },
    ];
    ctx.save();
    ctx.font = '10px sans-serif';
    ctx.fillStyle = textSub;
    ctx.fillText(t.ref_card_earnings, 20, eBoxY - 6);
    ctx.restore();
    levels.forEach((lv, idx) => {
      const bx = 20 + idx * (eBoxW + 8);
      ctx.save();
      ctx.fillStyle = 'rgba(255,255,255,0.04)';
      ctx.strokeStyle = `${lv.color}30`;
      ctx.lineWidth = 1;
      ctx.roundRect(bx, eBoxY, eBoxW, eBoxH, 10);
      ctx.fill();
      ctx.stroke();
      ctx.font = '9px sans-serif';
      ctx.fillStyle = lv.color;
      ctx.fillText(lv.label, bx + 8, eBoxY + 16);
      ctx.font = 'bold 14px Space Grotesk, sans-serif';
      ctx.fillStyle = lv.color;
      ctx.fillText(lv.val, bx + 8, eBoxY + 36);
      ctx.restore();
    });

    // Scan instruction
    ctx.save();
    ctx.font = '10px sans-serif';
    ctx.fillStyle = textSub;
    ctx.fillText(t.ref_card_scan, 24, 270);
    ctx.restore();

    // Ref link (truncated)
    ctx.save();
    ctx.font = '9px monospace';
    ctx.fillStyle = 'rgba(35,175,145,0.7)';
    const shortLink = refLink.length > 48 ? refLink.slice(0, 45) + '...' : refLink;
    ctx.fillText(shortLink, 24, 286);
    ctx.restore();

    // Bottom accent line
    const botGrad = ctx.createLinearGradient(0, 0, W, 0);
    botGrad.addColorStop(0, 'rgba(35,175,145,0.6)');
    botGrad.addColorStop(1, 'rgba(99,102,241,0.6)');
    ctx.fillStyle = botGrad;
    ctx.fillRect(0, H - 4, W, 4);

    // Now render QR code into the canvas using an SVG img
    const svgEl = document.getElementById('card-qr-svg');
    if (svgEl) {
      const serializer = new XMLSerializer();
      const svgStr = serializer.serializeToString(svgEl);
      const img = new Image();
      img.onload = () => {
        const qrX = W - 120;
        const qrY = 76;
        const qrSize = 110;
        ctx.save();
        ctx.fillStyle = '#fff';
        ctx.roundRect(qrX - 8, qrY - 8, qrSize + 16, qrSize + 16, 10);
        ctx.fill();
        ctx.drawImage(img, qrX, qrY, qrSize, qrSize);
        ctx.restore();
        setQrReady(true);
      };
      img.onerror = () => setQrReady(true);
      img.src = 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svgStr)));
    } else {
      setQrReady(true);
    }
  }, [user, lang, l1Earn, l2Earn, l3Earn]);

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 2000,
      background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(6px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: 16,
    }}
      onClick={e => e.target === e.currentTarget && onClose()}
    >
      <div style={{
        background: 'var(--card)', borderRadius: 20,
        border: '1px solid rgba(35,175,145,0.3)',
        padding: 20, maxWidth: 400, width: '100%',
        maxHeight: '92vh', overflowY: 'auto',
        display: 'flex', flexDirection: 'column', gap: 14,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ fontWeight: 800, fontSize: 15 }}>{t.ref_card_title}</div>
          <button onClick={onClose} style={{ background: 'var(--input-bg)', border: '1px solid var(--border)', borderRadius: '50%', width: 30, height: 30, cursor: 'pointer', color: 'var(--text2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Icons.X size={14} />
          </button>
        </div>

        {/* Hidden QR SVG for canvas rendering */}
        <div style={{ position: 'absolute', opacity: 0, pointerEvents: 'none', top: -9999 }}>
          <QRCodeSVG
            id="card-qr-svg"
            value={`${window.location.origin}/?ref=${user.referCode}`}
            size={120}
            bgColor="#ffffff"
            fgColor="#0B0E11"
            level="M"
          />
        </div>

        <canvas
          ref={canvasRef}
          width={360}
          height={300}
          style={{ width: '100%', borderRadius: 14, border: '1px solid rgba(35,175,145,0.2)' }}
        />

        <button
          className="btn btn-primary btn-full"
          onClick={downloadCard}
          disabled={downloading || !qrReady}
          style={{ fontSize: 14, padding: '12px 0', borderRadius: 12, fontWeight: 700, opacity: qrReady ? 1 : 0.6 }}
        >
          <Icons.Download size={15} /> {downloading ? '...' : !qrReady ? (isBn ? 'প্রস্তুত হচ্ছে...' : 'Preparing...') : t.ref_card_download}
        </button>

        <button
          onClick={onClose}
          className="btn btn-outline btn-full"
          style={{ fontSize: 13, padding: '10px 0', borderRadius: 12 }}
        >
          {t.ref_card_close}
        </button>
      </div>
    </div>
  );
}

function ReferScreen({user, showToast, lang}) {
  const t = I18N[lang] || I18N.en;
  const refLink = `${window.location.origin}/?ref=${user.referCode}`;
  const copy = (text) => { navigator.clipboard?.writeText(text).catch(()=>{}); showToast(t.copied); };

  const [refData, setRefData]   = useState(null);
  const [treeData, setTreeData] = useState(null);
  const [statsData, setStats]   = useState(null);
  const [showCard, setShowCard] = useState(false);

  useEffect(() => {
    if (!user?.id) return;
    // Fetch existing activity data
    authFetch(`${API_URL}/api/user/${user.id}/referral-activity`)
      .then(r => r.json()).then(d => setRefData(d)).catch(() => {});
    // Fetch structured tree (with is_active)
    authFetch(`${API_URL}/api/user/${user.id}/referral-tree`)
      .then(r => r.json()).then(d => setTreeData(d)).catch(() => {});
    // Fetch stats (counts + total commission)
    authFetch(`${API_URL}/api/user/${user.id}/referral-stats`)
      .then(r => r.json()).then(d => setStats(d)).catch(() => {});
  }, [user?.id]);

  // Prefer structured tree endpoint; fall back to legacy activity data
  const l1Members = treeData?.level1 ?? (Array.isArray(refData?.tree) ? refData.tree.filter(m => m.level === 1) : []);
  const l2Members = treeData?.level2 ?? (Array.isArray(refData?.tree) ? refData.tree.filter(m => m.level === 2) : []);
  const l3Members = treeData?.level3 ?? (Array.isArray(refData?.tree) ? refData.tree.filter(m => m.level === 3) : []);

  const l1Count = statsData?.level1_count ?? refData?.members?.l1_count ?? user.teamMembers?.length ?? 0;
  const l2Count = statsData?.level2_count ?? refData?.members?.l2_count ?? 0;
  const l3Count = statsData?.level3_count ?? refData?.members?.l3_count ?? 0;
  const l1Earn  = statsData?.l1_commission ?? refData?.stats?.l1_total ?? 0;
  const l2Earn  = statsData?.l2_commission ?? refData?.stats?.l2_total ?? 0;
  const l3Earn  = statsData?.l3_commission ?? refData?.stats?.l3_total ?? 0;
  const totalEarn = statsData?.total_commission_earned ?? (l1Earn + l2Earn + l3Earn);

  const shareRef = async () => {
    const earnRange = `${convertCurrency(20, lang)}–${convertCurrency(100, lang)}`;
    const desc = lang === 'bn'
      ? `ফোনক্রাফটে আমার সাথে যোগ দিন!\n\nভার্চুয়াল ফোন তৈরি করে প্রতিদিন আয় করুন।\nপ্রতিটি টাস্কে ${earnRange} আয়!\n\nআমার রেফারেল কোড: ${user.referCode}\nলিংক: ${refLink}`
      : `Join me on PhoneCraft!\n\nEarn real money daily by completing virtual phone manufacturing tasks.\nEarn ${earnRange} per task!\n\nMy Referral Code: ${user.referCode}\nLink: ${refLink}`;
    if (navigator.share) {
      try {
        await navigator.share({
          title: lang === 'bn' ? 'ফোনক্রাফট — ফোন তৈরি করুন, আয় করুন' : 'PhoneCraft — Build Phones. Earn Real.',
          text: desc,
          url: refLink,
        });
      } catch (_) {}
    } else {
      copy(desc);
    }
  };

  const downloadQR = () => {
    const svg = document.getElementById('refer-qr-svg');
    if (!svg) return;
    const serializer = new XMLSerializer();
    const svgStr = serializer.serializeToString(svg);
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = 240; canvas.height = 240;
      const ctx = canvas.getContext('2d');
      ctx.fillStyle = '#fff';
      ctx.fillRect(0, 0, 240, 240);
      ctx.drawImage(img, 0, 0, 240, 240);
      const a = document.createElement('a');
      a.download = `phonecraft-ref-${user.referCode}.png`;
      a.href = canvas.toDataURL('image/png');
      a.click();
    };
    img.src = 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svgStr)));
  };

  return (
    <>
      {showCard && (
        <ReferralCardModal
          user={user}
          lang={lang}
          onClose={() => setShowCard(false)}
          l1Earn={l1Earn}
          l2Earn={l2Earn}
          l3Earn={l3Earn}
        />
      )}

      <div className="screen-title"><Icons.Link size={18}/> {t.referral_system}</div>

      {/* Referral Code + Link Card */}
      <div className="card" style={{textAlign:'center'}}>
        <div style={{fontSize:12,color:'var(--text2)',marginBottom:8}}>{t.your_ref_code}</div>
        <div className="code-display">{user.referCode}</div>

        {/* Shareable link box */}
        <div style={{
          marginTop:12, padding:'10px 14px',
          background:'var(--input-bg)', borderRadius:10,
          border:'1px solid var(--border)',
          display:'flex', alignItems:'center', gap:8,
          fontSize:12, wordBreak:'break-all', textAlign:'left',
        }}>
          <Icons.Link size={13} style={{flexShrink:0,color:'var(--accent)'}} />
          <span style={{flex:1,color:'var(--text2)',lineHeight:1.5}}>{refLink}</span>
          <button
            onClick={()=>copy(refLink)}
            style={{flexShrink:0,background:'none',border:'none',cursor:'pointer',color:'var(--accent)',padding:4}}
          >
            <Icons.Copy size={15}/>
          </button>
        </div>

        <div style={{display:'flex',gap:8,justifyContent:'center',marginTop:10,flexWrap:'wrap'}}>
          <button className="btn btn-outline" onClick={()=>copy(user.referCode)}><Icons.Copy size={14}/> {t.copy_code}</button>
          <button className="btn btn-primary" onClick={shareRef} style={{background:'linear-gradient(135deg,#23AF91,#1a8f75)'}}><Icons.Share size={14}/> {t.share_btn}</button>
        </div>
        <div style={{marginTop:10}}>
          <button
            className="btn btn-primary btn-full"
            onClick={() => setShowCard(true)}
            style={{
              background: 'linear-gradient(135deg,#6366F1,#4f46e5)',
              fontSize: 13, padding: '11px 16px', borderRadius: 12,
              fontWeight: 700, display: 'flex', alignItems: 'center', gap: 8, justifyContent: 'center',
            }}
          >
            <Icons.Download size={15} /> {t.ref_generate_card}
          </button>
        </div>
      </div>

      {/* QR Code Card */}
      <div className="card">
        <div className="card-title">{t.qr_code}</div>
        <div style={{display:'flex',flexDirection:'column',alignItems:'center',gap:12,padding:'8px 0'}}>
          <div style={{
            padding:16, borderRadius:14,
            background:'#fff',
            boxShadow:'0 4px 20px rgba(35,175,145,0.2)',
            border:'3px solid rgba(35,175,145,0.4)',
          }}>
            <QRCodeSVG
              id="refer-qr-svg"
              value={refLink}
              size={180}
              bgColor="#ffffff"
              fgColor="#0B0E11"
              level="M"
              includeMargin={false}
              imageSettings={{
                src: '/logo.png',
                x: undefined, y: undefined,
                height: 36, width: 36,
                excavate: true,
              }}
            />
          </div>
          <div style={{textAlign:'center',fontSize:12,color:'var(--text2)',lineHeight:1.6}}>
            {t.scan_text}<br/>
            <span style={{fontSize:11,color:'var(--accent)',fontWeight:700}}>{user.referCode}</span>
          </div>
          <button className="btn btn-outline" onClick={downloadQR} style={{fontSize:12}}>
            <Icons.Download size={14} /> {t.ref_qr_download}
          </button>
        </div>
      </div>

      {/* Commission Structure */}
      <div className="card">
        <div className="card-title"><Icons.Coin size={14}/> {t.comm_per_plan}</div>
        <div style={{fontSize:12,color:'var(--text2)',marginBottom:12}}>
          {t.comm_note}
        </div>
        <div className="stats-row">
          <div className="stat-box">
            <div className="stat-num" style={{color:'var(--green)'}}>20%</div>
            <div className="stat-label">{t.ref_level1}</div>
          </div>
          <div className="stat-box">
            <div className="stat-num" style={{color:'var(--accent)'}}>4%</div>
            <div className="stat-label">{t.ref_level2}</div>
          </div>
          <div className="stat-box">
            <div className="stat-num" style={{color:'var(--accent2)'}}>1%</div>
            <div className="stat-label">{t.ref_level3}</div>
          </div>
        </div>
      </div>

      {/* Commission Table */}
      <div className="card">
        <div className="card-title"><Icons.TrendUp size={14}/> {t.comm_per_plan}</div>
        <div style={{overflowX:'auto'}}>
          <table style={{width:'100%',borderCollapse:'collapse',fontSize:12}}>
            <thead>
              <tr style={{borderBottom:'1px solid var(--border)'}}>
                <th style={{textAlign:'left',padding:'8px 6px',color:'var(--text2)',fontWeight:600,fontSize:10}}>{t.plan_col}</th>
                <th style={{textAlign:'right',padding:'8px 6px',color:'var(--text2)',fontWeight:600,fontSize:10}}>{t.rate_col}</th>
                <th style={{textAlign:'right',padding:'8px 6px',color:'var(--green)',fontWeight:600,fontSize:10}}>L1 (20%)</th>
                <th style={{textAlign:'right',padding:'8px 6px',color:'var(--accent)',fontWeight:600,fontSize:10}}>L2 (4%)</th>
                <th style={{textAlign:'right',padding:'8px 6px',color:'var(--accent2)',fontWeight:600,fontSize:10}}>L3 (1%)</th>
              </tr>
            </thead>
            <tbody>
              {PLANS.map(p=>(
                <tr key={p.id} style={{borderBottom:'1px solid var(--border)'}}>
                  <td style={{padding:'8px 6px',fontWeight:700,color:p.color}}>{p.name}</td>
                  <td style={{padding:'8px 6px',textAlign:'right'}}>{convertCurrency(p.rate, lang)}</td>
                  <td style={{padding:'8px 6px',textAlign:'right',color:'var(--green)',fontWeight:600}}>{convertCurrency(Math.round(p.rate*0.20), lang)}</td>
                  <td style={{padding:'8px 6px',textAlign:'right',color:'var(--accent)',fontWeight:600}}>{convertCurrency(Math.round(p.rate*0.04), lang)}</td>
                  <td style={{padding:'8px 6px',textAlign:'right',color:'var(--accent2)',fontWeight:600}}>{convertCurrency(Math.round(p.rate*0.01), lang)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Referral Stats */}
      <div className="card">
        <div className="card-title"><Icons.TrendUp size={14}/> {t.ref_stats}</div>
        {/* Total earnings summary */}
        {totalEarn > 0 && (
          <div style={{
            marginBottom:12, padding:'10px 14px',
            background:'rgba(35,175,145,0.08)', borderRadius:10,
            border:'1px solid rgba(35,175,145,0.25)',
            display:'flex', alignItems:'center', justifyContent:'space-between',
          }}>
            <span style={{fontSize:12,color:'var(--text2)',fontWeight:600}}>
              {lang === 'bn' ? 'মোট কমিশন আয়' : 'Total Commission Earned'}
            </span>
            <span style={{fontSize:15,fontWeight:800,color:'var(--green)'}}>{convertCurrency(totalEarn, lang)}</span>
          </div>
        )}
        <div className="stats-row">
          <div className="stat-box">
            <div className="stat-num" style={{color:'var(--green)'}}>{l1Count}</div>
            <div className="stat-label">LEVEL 1</div>
            <div style={{fontSize:10,color:'var(--green)',marginTop:2,fontWeight:600}}>{convertCurrency(l1Earn, lang)}</div>
          </div>
          <div className="stat-box">
            <div className="stat-num" style={{color:'var(--accent)'}}>{l2Count}</div>
            <div className="stat-label">LEVEL 2</div>
            <div style={{fontSize:10,color:'var(--accent)',marginTop:2,fontWeight:600}}>{convertCurrency(l2Earn, lang)}</div>
          </div>
          <div className="stat-box">
            <div className="stat-num" style={{color:'var(--accent2)'}}>{l3Count}</div>
            <div className="stat-label">LEVEL 3</div>
            <div style={{fontSize:10,color:'var(--accent2)',marginTop:2,fontWeight:600}}>{convertCurrency(l3Earn, lang)}</div>
          </div>
        </div>
      </div>

      {/* Referral Tree */}
      <div className="card">
        <div className="card-title"><Icons.People size={14}/> {t.ref_tree}</div>
        <div className="tree-user">
          <div className="tree-av" style={{position:'relative'}}>
            {user.name?.[0] || '?'}
            <span style={{position:'absolute',bottom:0,right:0,width:8,height:8,borderRadius:'50%',background:'var(--green)',border:'2px solid var(--card)'}}/>
          </div>
          <div>
            <div style={{fontWeight:700}}>{user.name} ({t.you})</div>
            <span className="badge badge-blue">{t.root_badge}</span>
          </div>
        </div>
        {[
          { label: 'L1 (20%)', members: l1Members, badge: 'badge-green', color: 'var(--green)' },
          { label: 'L2 (4%)',  members: l2Members, badge: 'badge-blue',  color: 'var(--accent)' },
          { label: 'L3 (1%)', members: l3Members, badge: 'badge-orange', color: 'var(--accent2)' },
        ].map(group => (
          <div key={group.label} className="tree-child" style={{ marginTop: 10 }}>
            <div style={{ fontSize: 11, color: group.color, fontWeight: 700, marginBottom: 8 }}>
              {group.label} &nbsp;
              <span style={{color:'var(--text2)',fontWeight:400}}>({group.members.length})</span>
            </div>
            {group.members.length === 0 && (
              <div style={{ fontSize: 12, color: 'var(--text2)', padding: '4px 0 8px' }}>
                {t.ref_no_members}
              </div>
            )}
            {group.members.map((member) => (
              <div key={member.id} className="tree-user" style={{alignItems:'center'}}>
                <div className="tree-av" style={{position:'relative'}}>
                  {member.name?.[0] || '?'}
                  {/* Active indicator dot */}
                  <span style={{
                    position:'absolute', bottom:0, right:0,
                    width:8, height:8, borderRadius:'50%',
                    background: member.is_active ? '#4ADE80' : '#6B7280',
                    border:'2px solid var(--card)',
                  }}/>
                </div>
                <div style={{flex:1}}>
                  <div style={{fontWeight:600,fontSize:13}}>{member.name}</div>
                  <div style={{fontSize:11,color:'var(--text2)',display:'flex',gap:6,alignItems:'center',flexWrap:'wrap'}}>
                    <span>{member.identifier}</span>
                    <span style={{color:'rgba(255,255,255,0.2)'}}>·</span>
                    <span style={{color:'rgba(255,255,255,0.35)',fontFamily:'monospace'}}>{member.refer_code}</span>
                  </div>
                </div>
                <div style={{display:'flex',flexDirection:'column',alignItems:'flex-end',gap:3}}>
                  <span className={`badge ${group.badge}`}>{group.label}</span>
                  <span style={{
                    fontSize:9, fontWeight:700, letterSpacing:0.3,
                    color: member.is_active ? '#4ADE80' : '#6B7280',
                  }}>
                    {member.is_active
                      ? (lang === 'bn' ? '● সক্রিয়' : '● ACTIVE')
                      : (lang === 'bn' ? '○ নিষ্ক্রিয়' : '○ INACTIVE')}
                  </span>
                </div>
              </div>
            ))}
          </div>
        ))}
      </div>
    </>
  );
}

export default ReferScreen;
