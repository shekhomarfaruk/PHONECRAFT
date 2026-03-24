import { useState, useEffect, useRef, useCallback } from "react";
import Icons from "../Icons.jsx";
import { I18N } from "../i18n.js";
import { authFetch } from "../session.js";

const API_URL = import.meta.env.VITE_API_URL || '';

function TeamChatScreen({ user, showToast, lang }) {
  const t = I18N[lang] || I18N.en;
  const [roomData,    setRoomData]    = useState(null);
  const [input,       setInput]       = useState('');
  const [sending,     setSending]     = useState(false);
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

  const members  = roomData?.members  || [];
  const messages = roomData?.messages || [];
  const noMembers = members.length <= 1;
  const roomTitle = roomData
    ? (roomData.isOwnRoom ? t.team_leader_room : `${roomData.roomOwnerName}${t.team_member_room}`)
    : '';

  const memberAvatar = (m) => {
    const src = m.avatar_img || (m.avatar?.startsWith('/') ? m.avatar : null);
    if (src) return <img src={src} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />;
    return <span style={{ fontSize: 13, fontWeight: 700 }}>{m.name?.[0] || '?'}</span>;
  };

  return (
    <>
      {/* Title row */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14, flexWrap: 'wrap' }}>
        <div className="screen-title" style={{ marginBottom: 0 }}>
          <Icons.Chat size={18}/> {t.team_chat}
        </div>
        <span className="badge badge-green">{members.length} {t.members_suffix}</span>
      </div>

      {/* Chat card */}
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
            <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text2)', marginBottom: 8, textTransform: 'uppercase', letterSpacing: 0.5 }}>
              {t.team_members_label} ({members.length})
            </div>
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
            const isMe = msg.sender_id === user.id;
            const time = msg.created_at
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
                    background: isMe ? 'linear-gradient(135deg,#6c47ff,#a855f7)' : 'var(--input-bg)',
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
    </>
  );
}

export default TeamChatScreen;
