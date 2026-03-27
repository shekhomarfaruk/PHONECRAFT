import { useState, useEffect, useRef } from "react";
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
      <div onClick={() => sub.length > 0 && setOpen(o => !o)} style={{
        display: 'flex', alignItems: 'center', gap: 12,
        padding: '10px 12px', borderRadius: 12, marginBottom: 6,
        background: 'var(--input-bg)', border: '1px solid var(--border)',
        cursor: sub.length > 0 ? 'pointer' : 'default',
      }}>
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

function ChatMessage({ msg, isOwn }) {
  const avatarSrc = msg.avatar_img || (msg.avatar?.startsWith('/') ? msg.avatar : null);
  return (
    <div style={{
      display: 'flex', gap: 10, alignItems: 'flex-end',
      flexDirection: isOwn ? 'row-reverse' : 'row',
      marginBottom: 12,
    }}>
      <Avatar name={msg.username} size={32} src={avatarSrc} />
      <div style={{ maxWidth: '72%' }}>
        {!isOwn && (
          <div style={{ fontSize: 10, color: 'var(--text2)', marginBottom: 3, fontWeight: 600 }}>
            {msg.username}
          </div>
        )}
        <div style={{
          background: isOwn ? 'var(--accent)' : 'var(--input-bg)',
          color: isOwn ? '#fff' : 'var(--text)',
          borderRadius: isOwn ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
          padding: '8px 12px',
          border: isOwn ? 'none' : '1px solid var(--border)',
          wordBreak: 'break-word',
        }}>
          {msg.media_url && msg.media_type === 'image' && (
            <img
              src={`${API_URL}${msg.media_url}`}
              alt="img"
              style={{ maxWidth: '100%', maxHeight: 220, borderRadius: 8, display: 'block', marginBottom: msg.message ? 6 : 0 }}
              onClick={() => window.open(`${API_URL}${msg.media_url}`, '_blank')}
            />
          )}
          {msg.media_url && msg.media_type === 'file' && (
            <a href={`${API_URL}${msg.media_url}`} target="_blank" rel="noreferrer"
              style={{ display: 'flex', alignItems: 'center', gap: 6, color: isOwn ? '#fff' : 'var(--accent)', textDecoration: 'none', marginBottom: msg.message ? 6 : 0 }}>
              <span style={{ fontSize: 18 }}>📎</span>
              <span style={{ fontSize: 12 }}>ফাইল ডাউনলোড</span>
            </a>
          )}
          {msg.message && <div style={{ fontSize: 13 }}>{msg.message}</div>}
        </div>
        <div style={{ fontSize: 9, color: 'var(--text2)', marginTop: 3, textAlign: isOwn ? 'right' : 'left' }}>
          {new Date(msg.created_at + 'Z').toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </div>
      </div>
    </div>
  );
}

function TeamChatScreen({ user, lang, showToast, teamChatUnread, setTeamChatUnread }) {
  const t = I18N[lang] || I18N.en;
  const [tab, setTab] = useState('chat');

  // Members tab
  const [members, setMembers] = useState([]);
  const [membersLoading, setMembersLoading] = useState(true);

  // Chat tab
  const [messages, setMessages] = useState([]);
  const [chatLoading, setChatLoading] = useState(true);
  const [text, setText] = useState('');
  const [sending, setSending] = useState(false);
  const [uploading, setUploading] = useState(false);
  const bottomRef = useRef(null);
  const fileInputRef = useRef(null);
  const pollRef = useRef(null);

  const fetchMembers = async () => {
    if (!user?.id) return;
    try {
      const r = await authFetch(`${API_URL}/api/user/${user.id}/team-members`);
      const d = await r.json();
      if (d.members) setMembers(d.members);
      else if (Array.isArray(d)) setMembers(d);
    } catch (_) {}
    finally { setMembersLoading(false); }
  };

  const fetchMessages = async () => {
    try {
      const r = await authFetch(`${API_URL}/api/team-chat`);
      if (!r.ok) return;
      const d = await r.json();
      setMessages(d.messages || []);
    } catch (_) {}
    finally { setChatLoading(false); }
  };

  const markRead = async () => {
    try {
      await authFetch(`${API_URL}/api/team-chat/read`, { method: 'POST' });
      if (setTeamChatUnread) setTeamChatUnread(0);
    } catch (_) {}
  };

  useEffect(() => {
    fetchMembers();
  }, [user?.id]);

  useEffect(() => {
    if (tab !== 'chat') return;
    fetchMessages().then(() => markRead());
    pollRef.current = setInterval(() => {
      fetchMessages();
      markRead();
    }, 5000);
    return () => clearInterval(pollRef.current);
  }, [tab]);

  useEffect(() => {
    if (messages.length > 0) {
      bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages.length]);

  const sendMessage = async () => {
    if (!text.trim() || sending) return;
    setSending(true);
    try {
      const r = await authFetch(`${API_URL}/api/team-chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: text.trim() }),
      });
      if (r.ok) {
        setText('');
        await fetchMessages();
        bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
      } else {
        showToast && showToast('⚠️ বার্তা পাঠানো যায়নি', 'error');
      }
    } catch (_) {
      showToast && showToast('⚠️ সংযোগ ত্রুটি', 'error');
    }
    setSending(false);
  };

  const handleFileUpload = async (file) => {
    if (!file) return;
    if (file.size > 10 * 1024 * 1024) {
      showToast && showToast('⚠️ ফাইল সর্বোচ্চ ১০ MB', 'warning');
      return;
    }
    setUploading(true);
    try {
      const form = new FormData();
      form.append('file', file);
      form.append('caption', '');
      const token = (await import('../session.js')).getAuthToken();
      const r = await fetch(`${API_URL}/api/team-chat/upload`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: form,
      });
      if (r.ok) {
        await fetchMessages();
        bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
      } else {
        showToast && showToast('⚠️ আপলোড ব্যর্থ', 'error');
      }
    } catch (_) {
      showToast && showToast('⚠️ আপলোড ত্রুটি', 'error');
    }
    setUploading(false);
  };

  const localMembers = user?.teamMembers || members;

  return (
    <>
      <div className="screen-title"><Icons.Chat size={18}/> {t.team_chat}</div>

      {/* Tab switcher */}
      <div style={{ display:'flex', gap:8, marginBottom:12 }}>
        {[
          { id: 'chat', label: '💬 চ্যাট', badge: teamChatUnread },
          { id: 'members', label: '👥 সদস্য' },
        ].map(tb => (
          <button key={tb.id} onClick={() => setTab(tb.id)} style={{
            flex: 1, padding: '8px 0', borderRadius: 10, border: 'none', cursor: 'pointer',
            fontWeight: 700, fontSize: 13, position: 'relative',
            background: tab === tb.id ? 'var(--accent)' : 'var(--input-bg)',
            color: tab === tb.id ? '#fff' : 'var(--text)',
          }}>
            {tb.label}
            {tb.badge > 0 && tab !== 'chat' && (
              <span style={{
                position: 'absolute', top: -6, right: 8,
                background: '#F6465D', color: '#fff', borderRadius: 10,
                fontSize: 9, padding: '1px 5px', fontWeight: 700,
              }}>{tb.badge > 99 ? '99+' : tb.badge}</span>
            )}
          </button>
        ))}
      </div>

      {/* CHAT TAB */}
      {tab === 'chat' && (
        <div className="card" style={{ padding: 0, display: 'flex', flexDirection: 'column', height: '62vh', minHeight: 340 }}>
          {/* Messages */}
          <div style={{ flex: 1, overflowY: 'auto', padding: '12px 12px 0' }}>
            {chatLoading ? (
              <div style={{ textAlign: 'center', padding: 30, color: 'var(--text2)', fontSize: 13 }}>লোড হচ্ছে...</div>
            ) : messages.length === 0 ? (
              <div style={{ textAlign: 'center', padding: 30, color: 'var(--text2)' }}>
                <div style={{ fontSize: 32, marginBottom: 8 }}>💬</div>
                <div style={{ fontSize: 13 }}>কোনো বার্তা নেই। প্রথম বার্তাটি পাঠান!</div>
              </div>
            ) : (
              messages.map(msg => (
                <ChatMessage key={msg.id} msg={msg} isOwn={msg.user_id === user?.id} />
              ))
            )}
            <div ref={bottomRef} />
          </div>

          {/* Input area */}
          <div style={{
            padding: '8px 12px', borderTop: '1px solid var(--border)',
            display: 'flex', gap: 8, alignItems: 'flex-end',
          }}>
            {/* File attach button */}
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              style={{
                width: 36, height: 36, borderRadius: 10, border: '1px solid var(--border)',
                background: 'var(--input-bg)', cursor: 'pointer', display: 'flex',
                alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                opacity: uploading ? 0.5 : 1,
              }}
              title="ছবি / ফাইল পাঠান"
            >
              {uploading ? '⏳' : '📎'}
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*,.pdf,.doc,.docx,.zip"
              style={{ display: 'none' }}
              onChange={e => { handleFileUpload(e.target.files[0]); e.target.value = ''; }}
            />

            {/* Text input */}
            <textarea
              value={text}
              onChange={e => setText(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); } }}
              placeholder="বার্তা লিখুন..."
              rows={1}
              style={{
                flex: 1, padding: '8px 12px', borderRadius: 10,
                border: '1px solid var(--border)', background: 'var(--input-bg)',
                color: 'var(--text)', resize: 'none', fontSize: 13,
                fontFamily: 'inherit', outline: 'none', lineHeight: 1.5,
              }}
            />

            {/* Send button */}
            <button
              onClick={sendMessage}
              disabled={!text.trim() || sending}
              style={{
                width: 36, height: 36, borderRadius: 10, border: 'none',
                background: text.trim() ? 'var(--accent)' : 'var(--input-bg)',
                cursor: text.trim() ? 'pointer' : 'default',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                flexShrink: 0, transition: 'all .2s',
              }}
            >
              <Icons.ArrowRight size={18} color={text.trim() ? '#fff' : 'var(--text2)'} />
            </button>
          </div>
        </div>
      )}

      {/* MEMBERS TAB */}
      {tab === 'members' && (
        <>
          <div className="card" style={{ marginBottom: 10 }}>
            <div style={{ display:'flex', alignItems:'center', gap:12, justifyContent:'space-between' }}>
              <div>
                <div style={{ fontSize:11, color:'var(--text2)', marginBottom:2 }}>{t.team_total_members}</div>
                <div style={{ fontFamily:'Space Grotesk', fontSize:22, fontWeight:800, color:'var(--accent)' }}>
                  {localMembers.length}
                </div>
              </div>
              <div style={{ display:'flex', flexDirection:'column', alignItems:'flex-end', gap:4 }}>
                {user?.referralCode && (
                  <span className="badge badge-blue" style={{fontSize:11,padding:'3px 10px'}}>
                    {t.team_code_prefix} {user.referralCode}
                  </span>
                )}
                <div style={{ fontSize:11, color:'var(--text2)' }}>{t.your_ref_code_lbl}</div>
              </div>
            </div>
          </div>

          {membersLoading ? (
            <div style={{ textAlign:'center', padding:40, color:'var(--text2)' }}>
              <div style={{ marginBottom:8 }}><Icons.People size={32}/></div>
              <div>{t.team_loading}</div>
            </div>
          ) : localMembers.length === 0 ? (
            <div className="card" style={{ textAlign:'center', padding:32 }}>
              <div style={{ fontSize:40, marginBottom:12 }}>👥</div>
              <div style={{ fontWeight:700, fontSize:15, marginBottom:6 }}>{t.team_no_members_title}</div>
              <div style={{ fontSize:12, color:'var(--text2)', lineHeight:1.7 }}>{t.team_share_ref_cta}</div>
            </div>
          ) : (
            <div className="card" style={{ padding: '12px 8px' }}>
              {localMembers.map(m => <MemberCard key={m.id || m.identifier} member={m} depth={0} />)}
            </div>
          )}
        </>
      )}
    </>
  );
}

export default TeamChatScreen;
