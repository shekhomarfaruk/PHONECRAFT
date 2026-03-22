import { useState, useEffect, useRef, useCallback } from "react";
import Icons from "../Icons.jsx";
import { I18N } from "../i18n.js";

const API_URL = import.meta.env.VITE_API_URL || '';

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
      const r = await fetch(`${API_URL}/api/support/messages/${sessionId}`);
      const d = await r.json();
      if (d.messages) setMessages(d.messages);
    } catch (_) {}
  }, [sessionId]);

  useEffect(() => {
    fetchMsgs();
    pollRef.current = setInterval(fetchMsgs, 3000);
    return () => clearInterval(pollRef.current);
  }, [fetchMsgs]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = async () => {
    if (!input.trim() || sending) return;
    const text = input.trim();
    setInput('');
    setSending(true);
    // Optimistic add
    setMessages(prev => [...prev, {
      id: Date.now(), session_id: sessionId,
      sender: 'user', message: text,
      created_at: new Date().toISOString(),
    }]);
    try {
      await fetch(`${API_URL}/api/support/message`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId, message: text, senderName: user?.name || 'Guest' }),
      });
    } catch (_) {
      showToast('⚠️ Failed to send');
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
          <Icons.Chat size={14}/> {lang === 'bn' ? 'লাইভ চ্যাট' : 'Live Chat'}
        </div>
        <div className={`tab ${tab === 'faq' ? 'active' : ''}`} onClick={() => setTab('faq')}>
          <Icons.Info size={14}/> FAQ
        </div>
      </div>

      {/* ── FAQ ─────────────────────────────────────────────── */}
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

      {/* ── Live Chat ────────────────────────────────────────── */}
      {tab === 'chat' && (
        <div className="card" style={{ padding: 0, display: 'flex', flexDirection: 'column', height: 'calc(100dvh - 230px)', minHeight: 340 }}>

          {/* Header */}
          <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0 }}>
            <div style={{
              width: 38, height: 38, borderRadius: '50%', flexShrink: 0,
              background: 'linear-gradient(135deg,var(--accent),var(--accent2))',
              display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18,
            }}>🎧</div>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 700, fontSize: 14 }}>PhoneCraft Support</div>
              <div style={{ fontSize: 11, color: 'var(--accent)', display: 'flex', alignItems: 'center', gap: 4 }}>
                <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--accent)', display: 'inline-block' }}/>
                {lang === 'bn' ? 'অনলাইন' : 'Online'}
              </div>
            </div>
          </div>

          {/* Messages */}
          <div style={{ flex: 1, overflowY: 'auto', padding: '12px 12px 6px', display: 'flex', flexDirection: 'column', gap: 8 }}>

            {messages.length === 0 && (
              <div style={{ textAlign: 'center', padding: '28px 12px', color: 'var(--text2)' }}>
                <div style={{ fontSize: 36, marginBottom: 8 }}>👋</div>
                <div style={{ fontWeight: 600, marginBottom: 4, fontSize: 15 }}>
                  {lang === 'bn' ? 'হ্যালো! কীভাবে সাহায্য করতে পারি?' : 'Hi! How can we help?'}
                </div>
                <div style={{ fontSize: 12 }}>
                  {lang === 'bn'
                    ? 'আপনার সমস্যা লিখুন, সাপোর্ট টিম উত্তর দেবে।'
                    : 'Type your issue below and our support team will reply.'}
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
                      {isAdmin ? '🎧' : '🤖'}
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
                        {isAdmin ? (lang === 'bn' ? 'সাপোর্ট' : 'Support') : 'Bot'}
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
                  {lang === 'bn' ? 'সাপোর্ট টিম টাইপ করছে...' : 'Support is typing...'}
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
              placeholder={lang === 'bn' ? 'মেসেজ লিখুন...' : 'Type a message...'}
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
