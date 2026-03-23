import { useState, useEffect } from "react";
import Icons from "../Icons.jsx";
import { PLANS } from "../data.jsx";
import { I18N } from "../i18n.js";
import { QRCodeSVG } from "qrcode.react";
import { convertCurrency } from "../currency.js";

const API_URL = import.meta.env.VITE_API_URL || '';

function ReferScreen({user, showToast, lang}) {
  const t = I18N[lang] || I18N.en;
  const refLink = `${window.location.origin}/?ref=${user.referCode}`;
  const copy = (text) => { navigator.clipboard?.writeText(text).catch(()=>{}); showToast(t.copied); };

  const [refData, setRefData] = useState(null);
  useEffect(() => {
    if (!user?.id) return;
    fetch(`${API_URL}/api/user/${user.id}/referral-activity`)
      .then(r => r.json())
      .then(d => setRefData(d))
      .catch(() => {});
  }, [user?.id]);

  const treeMembers = Array.isArray(refData?.tree) ? refData.tree : (user.teamMembers || []);
  const l1Members = treeMembers.filter(member => member.level === 1);
  const l2Members = treeMembers.filter(member => member.level === 2);
  const l3Members = treeMembers.filter(member => member.level === 3);

  const l1Count = refData?.members?.l1_count ?? user.teamMembers?.length ?? 0;
  const l2Count = refData?.members?.l2_count ?? 0;
  const l3Count = refData?.members?.l3_count ?? 0;
  const l1Earn  = refData?.stats?.l1_total   ?? 0;
  const l2Earn  = refData?.stats?.l2_total   ?? 0;
  const l3Earn  = refData?.stats?.l3_total   ?? 0;

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
      <div className="screen-title"><Icons.Link size={18}/> {t.referral_system}</div>
      <div className="card" style={{textAlign:'center'}}>
        <div style={{fontSize:12,color:'var(--text2)',marginBottom:8}}>{t.your_ref_code}</div>
        <div className="code-display">{user.referCode}</div>
        <div style={{display:'flex',gap:8,justifyContent:'center',marginTop:12,flexWrap:'wrap'}}>
          <button className="btn btn-outline" onClick={()=>copy(user.referCode)}><Icons.Copy size={14}/> {t.copy_code}</button>
          <button className="btn btn-primary" onClick={()=>copy(refLink)}><Icons.Link size={14}/> {t.copy_link}</button>
          <button className="btn btn-primary" onClick={shareRef} style={{background:'linear-gradient(135deg,#23AF91,#1a8f75)'}}><Icons.Share size={14}/> {t.share_btn}</button>
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
            <Icons.Download size={14} /> {lang === 'bn' ? 'QR ডাউনলোড করুন' : 'Download QR'}
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
            <div className="stat-label">{lang === 'bn' ? 'লেভেল ১' : 'LEVEL 1'}</div>
          </div>
          <div className="stat-box">
            <div className="stat-num" style={{color:'var(--accent)'}}>4%</div>
            <div className="stat-label">{lang === 'bn' ? 'লেভেল ২' : 'LEVEL 2'}</div>
          </div>
          <div className="stat-box">
            <div className="stat-num" style={{color:'var(--accent2)'}}>1%</div>
            <div className="stat-label">{lang === 'bn' ? 'লেভেল ৩' : 'LEVEL 3'}</div>
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
        <div className="stats-row">
          <div className="stat-box">
            <div className="stat-num">{l1Count}</div>
            <div className="stat-label">LEVEL 1</div>
            <div style={{fontSize:10,color:'var(--accent)',marginTop:2}}>{convertCurrency(l1Earn, lang)}</div>
          </div>
          <div className="stat-box">
            <div className="stat-num">{l2Count}</div>
            <div className="stat-label">LEVEL 2</div>
            <div style={{fontSize:10,color:'var(--accent)',marginTop:2}}>{convertCurrency(l2Earn, lang)}</div>
          </div>
          <div className="stat-box">
            <div className="stat-num">{l3Count}</div>
            <div className="stat-label">LEVEL 3</div>
            <div style={{fontSize:10,color:'var(--accent)',marginTop:2}}>{convertCurrency(l3Earn, lang)}</div>
          </div>
        </div>
      </div>

      {/* Referral Tree */}
      <div className="card">
        <div className="card-title"><Icons.People size={14}/> {t.ref_tree}</div>
        <div className="tree-user">
          <div className="tree-av">{user.name?.[0] || '?'}</div>
          <div><div style={{fontWeight:700}}>{user.name} ({t.you})</div><span className="badge badge-blue">{t.root_badge}</span></div>
        </div>
        {[{ label: 'L1 (20%)', members: l1Members, badge: 'badge-green' }, { label: 'L2 (4%)', members: l2Members, badge: 'badge-blue' }, { label: 'L3 (1%)', members: l3Members, badge: 'badge-orange' }].map(group => (
          <div key={group.label} className="tree-child" style={{ marginTop: 10 }}>
            <div style={{ fontSize: 11, color: 'var(--text2)', fontWeight: 700, marginBottom: 8 }}>{group.label}</div>
            {group.members.length === 0 && (
              <div style={{ fontSize: 12, color: 'var(--text2)', padding: '4px 0 8px' }}>
                {lang === 'bn' ? 'এখনও কেউ নেই' : 'No members yet'}
              </div>
            )}
            {group.members.map((member) => (
              <div key={member.id} className="tree-user">
                <div className="tree-av">{member.name?.[0] || '?'}</div>
                <div style={{flex:1}}>
                  <div style={{fontWeight:600,fontSize:13}}>{member.name}</div>
                  <div style={{fontSize:11,color:'var(--text2)'}}>{t.code_label}: {member.refer_code}</div>
                </div>
                <span className={`badge ${group.badge}`}>{group.label}</span>
              </div>
            ))}
          </div>
        ))}
      </div>
    </>
  );
}

export default ReferScreen;
