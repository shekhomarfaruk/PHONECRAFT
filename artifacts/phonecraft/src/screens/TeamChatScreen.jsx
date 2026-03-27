import { useState, useEffect } from "react";
import Icons from "../Icons.jsx";
import { I18N } from "../i18n.js";
import { authFetch } from "../session.js";

const API_URL = import.meta.env.VITE_API_URL || '';

function Avatar({ name, size = 40, src }) {
  const [err, setErr] = useState(false);
  const colors = ['#6c47ff','#a855f7','#00b894','#0984e3','#e17055','#fdcb6e'];
  const bg = colors[(name || '?').charCodeAt(0) % colors.length];
  if (src && !err) {
    return (
      <img src={src} alt={name} onError={() => setErr(true)}
        style={{ width: size, height: size, borderRadius: '50%', objectFit: 'cover', flexShrink: 0 }}/>
    );
  }
  return (
    <div style={{
      width: size, height: size, borderRadius: '50%', flexShrink: 0,
      background: `linear-gradient(135deg,${bg},${bg}99)`,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontWeight: 700, fontSize: size * 0.38, color: '#fff',
    }}>
      {(name || '?')[0].toUpperCase()}
    </div>
  );
}

function MemberCard({ member, depth = 0 }) {
  const [open, setOpen] = useState(false);
  const sub = member.referrals || [];
  const avatarSrc = member.avatar_img || (member.avatar?.startsWith('/') ? member.avatar : null);

  return (
    <div style={{ marginLeft: depth * 16 }}>
      <div
        onClick={() => sub.length > 0 && setOpen(o => !o)}
        style={{
          display: 'flex', alignItems: 'center', gap: 12,
          padding: '10px 12px', borderRadius: 12, marginBottom: 6,
          background: 'var(--input-bg)', border: '1px solid var(--border)',
          cursor: sub.length > 0 ? 'pointer' : 'default',
          transition: 'all .15s',
        }}
      >
        <Avatar name={member.name} size={38} src={avatarSrc} />
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontWeight: 700, fontSize: 13, color: 'var(--text)', display:'flex',alignItems:'center',gap:6 }}>
            {member.name}
            {member.plan && member.plan !== 'free' && (
              <span className="badge badge-blue" style={{fontSize:9,padding:'1px 5px'}}>{member.plan}</span>
            )}
          </div>
          <div style={{ fontSize: 11, color: 'var(--text2)', marginTop: 2 }}>
            @{member.identifier || member.username || '—'}
            {member.earnings !== undefined && (
              <span style={{ marginLeft: 8, color: 'var(--accent)' }}>৳{member.earnings}</span>
            )}
          </div>
        </div>
        {sub.length > 0 && (
          <div style={{ fontSize: 11, color: 'var(--text2)', display:'flex',alignItems:'center',gap:4 }}>
            <Icons.People size={13}/>
            <span>{sub.length}</span>
            <Icons.ArrowRight size={12} style={{ transform: open ? 'rotate(90deg)' : 'none', transition:'transform .2s' }}/>
          </div>
        )}
      </div>

      {open && sub.map(m => <MemberCard key={m.id} member={m} depth={depth + 1} />)}
    </div>
  );
}

function TeamChatScreen({ user, showToast, lang }) {
  const t = I18N[lang] || I18N.en;
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchTeam = async () => {
    if (!user?.id) return;
    try {
      const r = await authFetch(`${API_URL}/api/user/${user.id}/team-members`);
      const d = await r.json();
      if (d.members) setMembers(d.members);
      else if (Array.isArray(d)) setMembers(d);
    } catch (_) {}
    finally { setLoading(false); }
  };

  useEffect(() => {
    fetchTeam();
    const iv = setInterval(fetchTeam, 30_000);
    return () => clearInterval(iv);
  }, [user?.id]);

  // Also use locally available teamMembers from App.jsx polling
  const localMembers = user?.teamMembers || members;

  return (
    <>
      <div className="screen-title"><Icons.People size={18}/> {t.team_chat}</div>

      <div className="card" style={{ marginBottom: 10 }}>
        <div style={{ display:'flex', alignItems:'center', gap:12, justifyContent:'space-between' }}>
          <div>
            <div style={{ fontSize:11, color:'var(--text2)', marginBottom:2 }}>মোট Team Member</div>
            <div style={{ fontFamily:'Space Grotesk', fontSize:22, fontWeight:800, color:'var(--accent)' }}>
              {localMembers.length}
            </div>
          </div>
          <div style={{ display:'flex', flexDirection:'column', alignItems:'flex-end', gap:4 }}>
            {user?.referralCode && (
              <span className="badge badge-blue" style={{fontSize:11,padding:'3px 10px'}}>
                কোড: {user.referralCode}
              </span>
            )}
            <div style={{ fontSize:11, color:'var(--text2)' }}>আপনার রেফারেল কোড</div>
          </div>
        </div>
      </div>

      {loading ? (
        <div style={{ textAlign:'center', padding:40, color:'var(--text2)' }}>
          <div style={{ marginBottom:8 }}><Icons.People size={32}/></div>
          <div>Loading team...</div>
        </div>
      ) : localMembers.length === 0 ? (
        <div className="card" style={{ textAlign:'center', padding:32 }}>
          <div style={{ fontSize:40, marginBottom:12 }}>👥</div>
          <div style={{ fontWeight:700, fontSize:15, marginBottom:6 }}>কোনো Team Member নেই</div>
          <div style={{ fontSize:12, color:'var(--text2)', lineHeight:1.7 }}>
            আপনার Referral Code শেয়ার করুন<br/>এবং নতুন সদস্য আনুন!
          </div>
        </div>
      ) : (
        <div className="card" style={{ padding: '12px 8px' }}>
          {localMembers.map(m => <MemberCard key={m.id || m.identifier} member={m} depth={0} />)}
        </div>
      )}
    </>
  );
}

export default TeamChatScreen;
