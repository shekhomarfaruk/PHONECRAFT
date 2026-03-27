import { useState, useEffect, useRef, useCallback } from "react";
import Icons from "../Icons.jsx";
import { I18N } from "../i18n.js";
import { authFetch } from "../session.js";

const API_URL = import.meta.env.VITE_API_URL || '';

// ── Team Chat Tab ─────────────────────────────────────────────────────────────
function TeamChat({ user, showToast, lang }) {
  const t = I18N[lang] || I18N.en;
  const [roomData,  setRoomData]  = useState(null);
  const [input,     setInput]     = useState('');
  const [sending,   setSending]   = useState(false);
  const [showMembers, setShowMembers] = useState(false);
  const bottomRef = useRef(null);
  const pollRef   = useRef(null);

  const fetchRoom = useCallback(async () => {
    try {
      const r = await authFetch(`${API_URL}/api/team/room`);
      const d = await r.json();
      if (r.ok) setRoomData(d);
    } catch (_) {}
  }, []);

  useEffect(() => {
    fetchRoom();
    pollRef.current = setInterval(fetchRoom, 3000);
    return () => clearInterval(pollRef.current);
  }, [fetchRoom]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [roomData?.messages?.length]);

  const sendMessage = async () => {
    if (!input.trim() || sending) return;
    const text = input.trim();
    setInput('');
    setSending(true);
    // Optimistic add
    setRoomData(prev => prev ? {
      ...prev,
      messages: [...prev.messages, {
        id: Date.now(), room_id: prev.roomId,
        sender_id: user.id, sender_name: user.name,
        message: text, created_at: new Date().toISOString(),
      }]
    } : prev);
    try {
      const res = await authFetch(`${API_URL}/api/team/message`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: text }),
      });
      if (!res.ok) {
        const d = await res.json();
        showToast(d.error || 'Failed to send');
      }
    } catch (_) {
      showToast('Connection error');
    }
    setSending(false);
  };

  const handleKey = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); }
  };

  const members = roomData?.members || [];
  const messages = roomData?.messages || [];
  const noMembers = members.length <= 1; // only self
  const roomTitle = roomData
    ? (roomData.isOwnRoom ? t.team_leader_room : `${roomData.roomOwnerName}${t.team_member_room}`)
    : '';

  // Avatar helper
  const memberAvatar = (m) => {
    const src = m.avatar_img || (m.avatar?.startsWith('/') ? m.avatar : null);
    if (src) return <img src={src} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />;
    return <span style={{ fontSize: 13, fontWeight: 700 }}>{m.name?.[0] || '?'}</span>;
  };

  return (
    <div className="card" style={{ padding: 0, display: 'flex', flexDirection: 'column', height: 'calc(100dvh - 230px)', minHeight: 340 }}>

      {/* Header */}
      <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0 }}>
        <div style={{
          width: 38, height: 38, borderRadius: '50%', flexShrink: 0,
          background: 'linear-gradient(135deg,#6c47ff,#a855f7)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}><Icons.People size={18} color="#fff" /></div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontWeight: 700, fontSize: 14, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {roomTitle || t.team_chat}
          </div>
          <div style={{ fontSize: 11, color: 'var(--accent)', display: 'flex', alignItems: 'center', gap: 4 }}>
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--accent)', display: 'inline-block' }}/>
            {members.length} {t.team_members_label}
          </div>
        </div>
        {/* Members toggle */}
        <button
          onClick={() => setShowMembers(s => !s)}
          style={{ background: showMembers ? 'var(--accent)' : 'var(--input-bg)', border: 'none', borderRadius: 8, padding: '5px 10px', cursor: 'pointer', color: showMembers ? '#fff' : 'var(--text2)', fontSize: 11, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 4 }}
        >
          <Icons.People size={12} /> {t.team_members_label}
        </button>
      </div>

      {/* Members panel */}
      {showMembers && (
        <div style={{ padding: '10px 14px', borderBottom: '1px solid var(--border)', background: 'var(--input-bg)', flexShrink: 0 }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text2)', marginBottom: 8, textTransform: 'uppercase', letterSpacing: 0.5 }}>{t.team_members_label} ({members.length})</div>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {members.map(m => (
              <div key={m.id} style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'var(--card)', borderRadius: 20, padding: '4px 10px 4px 4px', border: '1px solid var(--border)' }}>
                <div style={{ width: 24, height: 24, borderRadius: '50%', overflow: 'hidden', background: 'linear-gradient(135deg,var(--accent),var(--accent2))', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, padding: 0 }}>
                  {memberAvatar(m)}
                </div>
                <span style={{ fontSize: 11, fontWeight: 600, whiteSpace: 'nowrap' }}>
                  {m.isMe ? t.team_you : m.name}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Messages */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '12px 12px 6px', display: 'flex', flexDirection: 'column', gap: 8 }}>

        {messages.length === 0 && (
          <div style={{ textAlign: 'center', padding: '28px 12px', color: 'var(--text2)' }}>
            <div style={{ marginBottom: 8 }}><Icons.People size={36} /></div>
            <div style={{ fontWeight: 600, marginBottom: 4, fontSize: 15 }}>{t.team_chat}</div>
            <div style={{ fontSize: 12 }}>
              {noMembers ? t.team_no_members : t.team_empty_msg}
            </div>
          </div>
        )}

        {messages.map((msg) => {
          const isMe  = msg.sender_id === user.id;
          const time  = msg.created_at
            ? new Date(msg.created_at + (msg.created_at.includes('Z') ? '' : 'Z'))
                .toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            : '';
          const sender = members.find(m => m.id === msg.sender_id);
          const senderAvatar = sender
            ? (sender.avatar_img || (sender.avatar?.startsWith('/') ? sender.avatar : null))
            : null;

          return (
            <div key={msg.id} style={{ display: 'flex', justifyContent: isMe ? 'flex-end' : 'flex-start', alignItems: 'flex-end', gap: 6 }}>
              {!isMe && (
                <div style={{
                  width: 28, height: 28, borderRadius: '50%', flexShrink: 0, overflow: 'hidden', padding: 0,
                  background: 'linear-gradient(135deg,#6c47ff,#a855f7)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700, color: '#fff',
                }}>
                  {senderAvatar
                    ? <img src={senderAvatar} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    : (msg.sender_name?.[0] || '?')}
                </div>
              )}
              <div style={{ maxWidth: '72%' }}>
                {!isMe && (
                  <div style={{ fontSize: 10, fontWeight: 700, marginBottom: 2, paddingLeft: 2, color: 'var(--text2)', letterSpacing: 0.2 }}>
                    {msg.sender_name}
                  </div>
                )}
                <div style={{
                  background: isMe
                    ? 'linear-gradient(135deg,#6c47ff,#a855f7)'
                    : 'var(--input-bg)',
                  color: isMe ? '#fff' : 'var(--text)',
                  border: isMe ? 'none' : '1px solid var(--border)',
                  borderRadius: isMe ? '18px 18px 4px 18px' : '18px 18px 18px 4px',
                  padding: '9px 13px', fontSize: 13, lineHeight: 1.5, wordBreak: 'break-word',
                }}>
                  {msg.message}
                  <div style={{ fontSize: 10, opacity: .55, marginTop: 3, textAlign: 'right' }}>{time}</div>
                </div>
              </div>
            </div>
          );
        })}

        <div ref={bottomRef}/>
      </div>

      {/* Input */}
      <div style={{ padding: '10px 12px', borderTop: '1px solid var(--border)', display: 'flex', gap: 8, alignItems: 'flex-end', flexShrink: 0 }}>
        <textarea
          className="inp"
          rows={1}
          style={{ flex: 1, resize: 'none', borderRadius: 20, padding: '9px 14px', fontSize: 13, lineHeight: 1.4, maxHeight: 90, overflowY: 'auto' }}
          placeholder={t.team_msg_ph}
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={handleKey}
        />
        <button
          onClick={sendMessage}
          disabled={!input.trim() || sending}
          style={{
            width: 40, height: 40, borderRadius: '50%', border: 'none', cursor: 'pointer', flexShrink: 0,
            background: input.trim() ? 'linear-gradient(135deg,#6c47ff,#a855f7)' : 'var(--input-bg)',
            color: input.trim() ? '#fff' : 'var(--text2)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all .2s',
          }}
        >
          <Icons.Send size={16}/>
        </button>
      </div>
    </div>
  );
}

// ── Main SupportScreen ────────────────────────────────────────────────────────
function SupportScreen({ user, showToast, lang }) {
  const t = I18N[lang] || I18N.en;

  // Stable session ID per user
  const sessionId = user?.id ? `user_${user.id}` : (() => {
    let s = localStorage.getItem('support_session');
    if (!s) { s = 'guest_' + Math.random().toString(36).slice(2); localStorage.setItem('support_session', s); }
    return s;
  })();

  const [messages, setMessages] = useState([]);
  const [input,    setInput]    = useState('');
  const [sending,  setSending]  = useState(false);
  const [tab,      setTab]      = useState('chat');
  const bottomRef = useRef(null);
  const pollRef   = useRef(null);

  const faqs = [
    [t.faq_q1, t.faq_a1],
    [t.faq_q2, t.faq_a2],
    [t.faq_q3, t.faq_a3],
    [t.faq_q4, t.faq_a4],
    [t.faq_q5, t.faq_a5],
  ];

  const fetchMsgs = useCallback(async () => {
    try {
      const r = await authFetch(`${API_URL}/api/support/messages/${sessionId}`);
      const d = await r.json();
      if (d.messages) setMessages(d.messages);
    } catch (_) {}
  }, [sessionId]);

  useEffect(() => {
    if (tab !== 'chat') return;
    fetchMsgs();
    pollRef.current = setInterval(fetchMsgs, 3000);
    return () => clearInterval(pollRef.current);
  }, [fetchMsgs, tab]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = async () => {
    if (!input.trim() || sending) return;
    const text = input.trim();
    setInput('');
    setSending(true);
    setMessages(prev => [...prev, {
      id: Date.now(), session_id: sessionId,
      sender: 'user', message: text,
      created_at: new Date().toISOString(),
    }]);
    try {
      await authFetch(`${API_URL}/api/support/message`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId, message: text, senderName: user?.name || 'Guest' }),
      });
    } catch (_) {
      showToast('Failed to send', 'error');
    }
    setSending(false);
  };

  const handleKey = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); }
  };

  const lastSender = messages[messages.length - 1]?.sender;
  const hasAdmin   = messages.some(m => m.sender === 'admin');

  return (
    <>
      <div className="screen-title"><Icons.Support size={18}/> {t.support_title}</div>

      <div className="tabs" style={{ marginBottom: 0 }}>
        <div className={`tab ${tab === 'chat' ? 'active' : ''}`} onClick={() => setTab('chat')}>
          <Icons.Chat size={14}/> {t.supp_live_chat}
        </div>
        <div className={`tab ${tab === 'faq' ? 'active' : ''}`} onClick={() => setTab('faq')}>
          <Icons.Info size={14}/> FAQ
        </div>
      </div>

      {/* ── FAQ ─────────────────────────────────────────────────── */}
      {tab === 'faq' && (
        <div className="card">
          <div className="card-title">{t.faq_title}</div>
          {faqs.map(([q, a], i) => (
            <details key={i} style={{ borderBottom: '1px solid var(--border)', paddingBottom: 10, marginBottom: 10 }}>
              <summary style={{ cursor: 'pointer', fontWeight: 600, listStyle: 'none', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8 }}>
                <span>{q}</span><Icons.ArrowRight size={14}/>
              </summary>
              <p style={{ fontSize: 13, color: 'var(--text2)', marginTop: 8, lineHeight: 1.6 }}>{a}</p>
            </details>
          ))}
        </div>
      )}

      {/* ── Live Support Chat ────────────────────────────────────────── */}
      {tab === 'chat' && (
        <div className="card" style={{ padding: 0, display: 'flex', flexDirection: 'column', height: 'calc(100dvh - 230px)', minHeight: 340 }}>

          {/* Header */}
          <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0 }}>
            <div style={{
              width: 38, height: 38, borderRadius: '50%', flexShrink: 0,
              background: 'linear-gradient(135deg,var(--accent),var(--accent2))',
              display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18,
            }}><Icons.Headset size={18} color="#fff" /></div>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 700, fontSize: 14 }}>PhoneCraft Support</div>
              <div style={{ fontSize: 11, color: 'var(--accent)', display: 'flex', alignItems: 'center', gap: 4 }}>
                <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--accent)', display: 'inline-block' }}/>
                {t.supp_online}
              </div>
            </div>
          </div>

          {/* Messages */}
          <div style={{ flex: 1, overflowY: 'auto', padding: '12px 12px 6px', display: 'flex', flexDirection: 'column', gap: 8 }}>

            {messages.length === 0 && (
              <div style={{ textAlign: 'center', padding: '28px 12px', color: 'var(--text2)' }}>
                <div style={{ marginBottom: 8 }}><Icons.Chat size={36} /></div>
                <div style={{ fontWeight: 600, marginBottom: 4, fontSize: 15 }}>
                  {t.supp_greeting}
                </div>
                <div style={{ fontSize: 12 }}>
                  {t.supp_subgreeting}
                </div>
              </div>
            )}

            {messages.map((msg) => {
              const isUser  = msg.sender === 'user';
              const isAdmin = msg.sender === 'admin';
              const time    = msg.created_at
                ? new Date(msg.created_at + (msg.created_at.includes('Z') ? '' : 'Z'))
                    .toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                : '';

              return (
                <div key={msg.id} style={{ display: 'flex', justifyContent: isUser ? 'flex-end' : 'flex-start', alignItems: 'flex-end', gap: 6 }}>
                  {!isUser && (
                    <div style={{
                      width: 28, height: 28, borderRadius: '50%', flexShrink: 0,
                      background: isAdmin ? 'linear-gradient(135deg,#00b894,#00cec9)' : 'linear-gradient(135deg,#6c757d,#495057)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13,
                    }}>
                      {isAdmin ? <Icons.Headset size={13} color="#fff" /> : <Icons.Bot size={13} />}
                    </div>
                  )}
                  <div style={{
                    maxWidth: '72%',
                    background: isUser
                      ? 'linear-gradient(135deg,var(--accent),var(--accent2))'
                      : 'var(--input-bg)',
                    color: isUser ? '#fff' : 'var(--text)',
                    border: isUser ? 'none' : '1px solid var(--border)',
                    borderRadius: isUser ? '18px 18px 4px 18px' : '18px 18px 18px 4px',
                    padding: '9px 13px', fontSize: 13, lineHeight: 1.5, wordBreak: 'break-word',
                  }}>
                    {!isUser && (
                      <div style={{ fontSize: 10, fontWeight: 700, marginBottom: 3, opacity: .65, textTransform: 'uppercase', letterSpacing: .3 }}>
                        {isAdmin ? (t.supp_label) : 'Bot'}
                      </div>
                    )}
                    {msg.message}
                    <div style={{ fontSize: 10, opacity: .55, marginTop: 3, textAlign: 'right' }}>{time}</div>
                  </div>
                </div>
              );
            })}

            {/* Typing indicator */}
            {lastSender === 'user' && !hasAdmin && messages.length > 0 && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, paddingLeft: 34 }}>
                <div style={{ display: 'flex', gap: 3, alignItems: 'center' }}>
                  {[0,1,2].map(i => (
                    <span key={i} style={{
                      width: 7, height: 7, borderRadius: '50%', background: 'var(--text2)',
                      animation: `tgBounce 1.2s ${i*0.2}s infinite ease-in-out`,
                    }}/>
                  ))}
                </div>
                <span style={{ fontSize: 11, color: 'var(--text2)' }}>
                  {t.supp_typing}
                </span>
              </div>
            )}

            <div ref={bottomRef}/>
          </div>

          {/* Input */}
          <div style={{ padding: '10px 12px', borderTop: '1px solid var(--border)', display: 'flex', gap: 8, alignItems: 'flex-end', flexShrink: 0 }}>
            <textarea
              className="inp"
              rows={1}
              style={{ flex: 1, resize: 'none', borderRadius: 20, padding: '9px 14px', fontSize: 13, lineHeight: 1.4, maxHeight: 90, overflowY: 'auto' }}
              placeholder={t.supp_msg_ph}
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={handleKey}
            />
            <button
              onClick={sendMessage}
              disabled={!input.trim() || sending}
              style={{
                width: 40, height: 40, borderRadius: '50%', border: 'none', cursor: 'pointer', flexShrink: 0,
                background: input.trim() ? 'linear-gradient(135deg,var(--accent),var(--accent2))' : 'var(--input-bg)',
                color: input.trim() ? '#fff' : 'var(--text2)',
                display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all .2s',
              }}
            >
              <Icons.Send size={16}/>
            </button>
          </div>
        </div>
      )}

      <style>{`
        @keyframes tgBounce {
          0%,60%,100% { transform:translateY(0); opacity:.4; }
          30% { transform:translateY(-5px); opacity:1; }
        }
      `}</style>
    </>
  );
}

export default SupportScreen;
