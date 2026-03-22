import { useState, useEffect, useRef } from 'react';
import Icons from './Icons.jsx';

const API_URL = import.meta.env.VITE_API_URL || '';

function getSessionId() {
  let sid = localStorage.getItem('support_session');
  if (!sid) {
    sid = 'sess_' + Math.random().toString(36).slice(2) + Date.now().toString(36);
    localStorage.setItem('support_session', sid);
  }
  return sid;
}

export default function SupportWidget({ lang = 'en', userName = '' }) {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const [sessionId] = useState(getSessionId);
  const bottomRef = useRef(null);
  const pollRef   = useRef(null);

  const isBn = lang === 'bn';

  const fetchMsgs = async () => {
    try {
      const r = await fetch(`${API_URL}/api/support/messages/${sessionId}`);
      const d = await r.json();
      if (d.messages && d.messages.length > 0) setMessages(d.messages);
    } catch (_) {}
  };

  // Load messages + start polling when widget opens; stop when closed
  useEffect(() => {
    if (!open) {
      clearInterval(pollRef.current);
      return;
    }
    fetch(`${API_URL}/api/support/messages/${sessionId}`)
      .then(r => r.json())
      .then(d => {
        if (d.messages && d.messages.length > 0) {
          setMessages(d.messages);
        } else {
          setMessages([{
            id: 0, sender: 'bot',
            message: isBn
              ? '👋 হ্যালো! ফোনক্রাফট সাপোর্টে স্বাগতম। আপনার প্রশ্ন লিখুন।'
              : '👋 Hello! Welcome to PhoneCraft Support. How can we help you?',
            created_at: new Date().toISOString(),
          }]);
        }
      })
      .catch(() => {});
    // Poll every 3 seconds for admin replies
    pollRef.current = setInterval(fetchMsgs, 3000);
    return () => clearInterval(pollRef.current);
  }, [open]);

  // Scroll to bottom on new message
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = async () => {
    const msg = input.trim();
    if (!msg || sending) return;
    setInput('');
    setSending(true);
    // Optimistically add user message
    const userMsg = { id: Date.now(), sender: 'user', message: msg, created_at: new Date().toISOString() };
    setMessages(p => [...p, userMsg]);
    try {
      const r = await fetch(`${API_URL}/api/support/message`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId, message: msg, senderName: userName || 'Guest' }),
      });
      await r.json();
      // Admin replies arrive via polling
    } catch {
      setMessages(p => [...p, { id: Date.now() + 1, sender: 'bot', message: isBn ? '❌ সংযোগ সমস্যা। আবার চেষ্টা করুন।' : '❌ Connection error. Please try again.', created_at: new Date().toISOString() }]);
    } finally {
      setSending(false);
    }
  };

  return (
    <>
      <style>{`
        .sw-widget { position:fixed; bottom:24px; right:20px; z-index:9000; display:flex; flex-direction:column; align-items:flex-end; gap:10px; }
        .sw-btn { width:52px; height:52px; border-radius:50%; border:none; background:linear-gradient(135deg,#23AF91,#1a8f75); color:#fff; font-size:22px; cursor:pointer; box-shadow:0 4px 18px rgba(35,175,145,.45); display:flex; align-items:center; justify-content:center; transition:transform .2s, box-shadow .2s; position:relative; }
        .sw-btn:hover { transform:scale(1.08); box-shadow:0 6px 24px rgba(35,175,145,.55); }
        .sw-pulse { position:absolute; top:-2px; right:-2px; width:12px; height:12px; background:#4ade80; border-radius:50%; border:2px solid #0B0E11; }
        .sw-pulse::after { content:''; position:absolute; inset:-3px; border-radius:50%; border:2px solid rgba(74,222,128,.5); animation:swPulse 1.8s ease-in-out infinite; }
        @keyframes swPulse { 0%,100%{transform:scale(1);opacity:1} 50%{transform:scale(1.5);opacity:0} }
        .sw-box { width:300px; background:#161A25; border:1px solid rgba(43,49,57,.9); border-radius:16px; overflow:hidden; box-shadow:0 8px 40px rgba(0,0,0,.5); animation:swSlideUp .22s ease; }
        @keyframes swSlideUp { from{opacity:0;transform:translateY(12px)} to{opacity:1;transform:translateY(0)} }
        .sw-head { background:linear-gradient(135deg,rgba(35,175,145,.15),rgba(99,102,241,.1)); padding:12px 14px; display:flex; align-items:center; gap:10px; border-bottom:1px solid rgba(43,49,57,.9); }
        .sw-msgs { height:260px; overflow-y:auto; padding:10px 12px; display:flex; flex-direction:column; gap:8px; scrollbar-width:thin; scrollbar-color:rgba(43,49,57,.9) transparent; }
        .sw-bubble { max-width:82%; padding:8px 11px; border-radius:12px; font-size:12.5px; line-height:1.55; }
        .sw-bubble.user  { align-self:flex-end; background:linear-gradient(135deg,#23AF91,#1a8f75); color:#fff; border-bottom-right-radius:3px; }
        .sw-bubble.bot   { align-self:flex-start; background:rgba(43,49,57,.7); color:rgba(234,236,239,.9); border-bottom-left-radius:3px; }
        .sw-bubble.admin { align-self:flex-start; background:linear-gradient(135deg,rgba(99,102,241,.25),rgba(99,102,241,.1)); border:1px solid rgba(99,102,241,.3); color:#c7d2fe; border-bottom-left-radius:3px; }
        .sw-inp { display:flex; gap:6px; padding:10px 10px; border-top:1px solid rgba(43,49,57,.9); background:rgba(11,14,17,.6); }
        .sw-inp input { flex:1; background:rgba(43,49,57,.5); border:1px solid rgba(43,49,57,.9); border-radius:8px; padding:7px 10px; color:#EAECEF; font-size:12px; outline:none; font-family:Inter,sans-serif; }
        .sw-inp input:focus { border-color:rgba(35,175,145,.4); }
        .sw-inp input::placeholder { color:#707A8A; }
        .sw-inp button { background:linear-gradient(135deg,#23AF91,#1a8f75); border:none; border-radius:8px; width:32px; height:32px; color:#fff; font-size:14px; cursor:pointer; display:flex; align-items:center; justify-content:center; flex-shrink:0; }
        .sw-inp button:disabled { opacity:.5; cursor:not-allowed; }
      `}</style>

      <div className="sw-widget">
        {open && (
          <div className="sw-box">
            {/* Header */}
            <div className="sw-head">
              <div style={{ width:32, height:32, borderRadius:'50%', background:'rgba(35,175,145,.2)', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}><Icons.Chat size={18} /></div>
              <div style={{ flex:1 }}>
                <div style={{ fontFamily:'Space Grotesk', fontWeight:700, fontSize:13, color:'#EAECEF' }}>
                  {isBn ? 'লাইভ সাপোর্ট' : 'Live Support'}
                </div>
                <div style={{ fontSize:10, color:'#4ade80', display:'flex', alignItems:'center', gap:4 }}>
                  <span style={{ width:6, height:6, borderRadius:'50%', background:'#4ade80', display:'inline-block' }} />
                  {isBn ? 'অনলাইন' : 'Online'}
                </div>
              </div>
              <button onClick={() => setOpen(false)} style={{ background:'none', border:'none', color:'#707A8A', fontSize:18, cursor:'pointer', lineHeight:1 }}>×</button>
            </div>

            {/* Messages */}
            <div className="sw-msgs">
              {messages.map((m, i) => (
                <div key={m.id || i} className={`sw-bubble ${m.sender}`}>{m.message}</div>
              ))}
              {sending && <div className="sw-bubble bot" style={{ opacity:.6 }}>...</div>}
              <div ref={bottomRef} />
            </div>

            {/* Input */}
            <div className="sw-inp">
              <input
                placeholder={isBn ? 'মেসেজ লিখুন...' : 'Type a message...'}
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && sendMessage()}
              />
              <button onClick={sendMessage} disabled={!input.trim() || sending}>
                ➤
              </button>
            </div>
          </div>
        )}

        {/* Floating button */}
        <button className="sw-btn" onClick={() => setOpen(p => !p)} title={isBn ? 'লাইভ সাপোর্ট' : 'Live Support'}>
          <div className="sw-pulse" />
          {open ? '×' : <Icons.Chat size={22} />}
        </button>
      </div>
    </>
  );
}
