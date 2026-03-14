import { useState } from "react";
import Icons from "../Icons.jsx";
import { I18N } from "../i18n.js";
import { convertCurrency, convertCurrencyText } from "../currency.js";
import { mapApiUser, saveStoredSession } from "../session.js";

const API_URL = import.meta.env.VITE_API_URL || '';

function RegistrationModal({ notif, onClose, setItems, showToast, lang, userId, setUser }) {
  const [loading, setLoading] = useState('');
  const [done, setDone] = useState('');

  let parsed = {};
  try { parsed = JSON.parse(notif.meta || '{}'); } catch (_) {}
  const { pending_id, plan_name, amount, new_user_name } = parsed;

  const act = async (action) => {
    setLoading(action);
    try {
      const res = await fetch(`${API_URL}/api/registration/${pending_id}/${action}`, { method: 'POST' });
      const data = await res.json();
      if (!res.ok) {
        if (data.error === 'insufficient_balance') {
          showToast('⚠️ ' + (lang === 'bn' ? 'অপর্যাপ্ত ব্যালেন্স' : 'Insufficient Balance'));
        } else {
          showToast('⚠️ ' + (data.error || 'Failed'));
        }
        setLoading('');
        return;
      }
      setDone(action);
      // Refresh user balance in app state after approval
      if (action === 'approve' && data.user && setUser) {
        setUser(prev => {
          const nextUser = mapApiUser(data.user, null, data.token, prev);
          saveStoredSession(nextUser);
          return nextUser;
        });
      }
      // Mark as read on server so it doesn't reappear after next poll
      fetch(`${API_URL}/api/user/${userId}/notifications/${notif.id}/read`, { method: 'PATCH' }).catch(() => {});
      setItems(prev => prev.map(n => n.id === notif.id ? { ...n, read: true } : n));
      showToast(action === 'approve'
        ? '✅ ' + (lang === 'bn' ? 'নিবন্ধন অনুমোদন করা হয়েছে' : 'Registration approved')
        : '❌ ' + (lang === 'bn' ? 'প্রত্যাখ্যান করা হয়েছে' : 'Registration declined'));
    } catch (_) {
      showToast('⚠️ Network error');
      setLoading('');
    }
  };

  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed', inset: 0, zIndex: 9999,
        background: 'rgba(0,0,0,0.65)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '0 20px',
      }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          background: 'var(--card)',
          borderRadius: 16,
          padding: '24px 20px',
          width: '100%',
          maxWidth: 380,
          boxShadow: '0 8px 40px rgba(0,0,0,0.4)',
          border: '1px solid var(--border)',
        }}
      >
        {done ? (
          <>
            <div style={{ textAlign: 'center', fontSize: 48, marginBottom: 12 }}>
              {done === 'approve' ? '✅' : '❌'}
            </div>
            <div style={{ textAlign: 'center', fontSize: 15, fontWeight: 700, marginBottom: 20 }}>
              {done === 'approve'
                ? (lang === 'bn' ? `অনুমোদিত — ${convertCurrency(amount, lang)} কাটা হয়েছে` : `Approved — ${convertCurrency(amount, lang)} deducted`)
                : (lang === 'bn' ? 'প্রত্যাখ্যান করা হয়েছে' : 'Declined')}
            </div>
            <button
              onClick={onClose}
              style={{ width: '100%', padding: '10px 0', borderRadius: 10, border: 'none', background: 'var(--accent)', color: '#fff', fontFamily: 'Space Grotesk', fontWeight: 700, fontSize: 14, cursor: 'pointer' }}
            >
              {lang === 'bn' ? 'বন্ধ করুন' : 'Close'}
            </button>
          </>
        ) : (
          <>
            <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text)', marginBottom: 4 }}>
              {lang === 'bn' ? 'নিবন্ধন অনুরোধ' : 'Registration Request'}
            </div>
            <div style={{ fontSize: 12, color: 'var(--text2)', marginBottom: 16 }}>
              {lang === 'bn' ? 'নতুন ব্যবহারকারী আপনার রেফারেল কোড ব্যবহার করে নিবন্ধন করতে চাইছেন।' : 'A new user wants to register using your referral code.'}
            </div>

            <div style={{ background: 'rgba(35,175,145,.08)', border: '1px solid rgba(35,175,145,.25)', borderRadius: 10, padding: '12px 14px', marginBottom: 18 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                <span style={{ fontSize: 12, color: 'var(--text2)' }}>{lang === 'bn' ? 'নাম' : 'Name'}</span>
                <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--text)' }}>{new_user_name}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                <span style={{ fontSize: 12, color: 'var(--text2)' }}>{lang === 'bn' ? 'প্ল্যান' : 'Plan'}</span>
                <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--accent)' }}>{plan_name}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ fontSize: 12, color: 'var(--text2)' }}>{lang === 'bn' ? 'কাটা হবে' : 'Will deduct'}</span>
                <span style={{ fontSize: 14, fontWeight: 700, color: '#F6465D' }}>{convertCurrency(amount, lang)}</span>
              </div>
            </div>

            <div style={{ display: 'flex', gap: 10 }}>
              <button
                onClick={() => act('approve')}
                disabled={!!loading}
                style={{ flex: 1, padding: '11px 0', borderRadius: 10, border: 'none', background: 'linear-gradient(135deg,#23AF91,#1a8f75)', color: '#fff', fontFamily: 'Space Grotesk', fontWeight: 700, fontSize: 14, cursor: 'pointer', opacity: loading ? .6 : 1 }}
              >
                {loading === 'approve' ? '...' : (lang === 'bn' ? '✅ সম্মত' : '✅ Agree')}
              </button>
              <button
                onClick={() => act('decline')}
                disabled={!!loading}
                style={{ flex: 1, padding: '11px 0', borderRadius: 10, border: '1px solid rgba(246,70,93,.5)', background: 'rgba(246,70,93,.08)', color: '#F6465D', fontFamily: 'Space Grotesk', fontWeight: 700, fontSize: 14, cursor: 'pointer', opacity: loading ? .6 : 1 }}
              >
                {loading === 'decline' ? '...' : (lang === 'bn' ? '❌ বাতিল' : '❌ Cancel')}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function NotifScreen({items, setItems, user, setUser, lang, showToast}) {
  const t = I18N[lang] || I18N.en;
  const unread = items.filter(n => !n.read).length;
  const [modalNotif, setModalNotif] = useState(null);

  const handleNotifClick = (n) => {
    if (n.type === 'registration_request') {
      setModalNotif(n);
    } else {
      markRead(n.id);
    }
  };

  const markRead = (id) => {
    setItems(prev => prev.map(n => n.id === id ? {...n, read:true} : n));
    if (user?.id) {
      fetch(`${API_URL}/api/user/${user.id}/notifications/${id}/read`, { method: 'PATCH' }).catch(() => {});
    }
  };

  const markAllRead = () => {
    setItems(prev => prev.map(n => ({...n, read:true})));
    if (user?.id) {
      fetch(`${API_URL}/api/user/${user.id}/notifications/read-all`, { method: 'PATCH' }).catch(() => {});
    }
  };

  return (
    <>
      {modalNotif && (
        <RegistrationModal
          notif={modalNotif}
          onClose={() => setModalNotif(null)}
          setItems={setItems}
          showToast={showToast}
          lang={lang}
          userId={user.id}
          setUser={setUser}
        />
      )}

      <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:12,flexWrap:'wrap',gap:8}}>
        <div className="screen-title" style={{margin:0}}>
          <Icons.Bell size={18}/> {t.notifications}
          {unread > 0 && (
            <span style={{ marginLeft:8, background:'#F6465D', color:'#fff', borderRadius:10, fontSize:10, padding:'2px 8px', fontFamily:'Space Grotesk', verticalAlign:'middle' }}>{unread}</span>
          )}
        </div>
        {unread > 0 && (
          <button className="btn btn-outline" style={{fontSize:11,padding:'5px 14px'}} onClick={markAllRead}>
            <Icons.CheckCircle size={13}/> {t.notif_mark_all}
          </button>
        )}
      </div>

      <div className="card" style={{padding:0,overflow:'hidden'}}>
        {items.length === 0 && (
          <div style={{padding:24,textAlign:'center',color:'var(--text2)',fontSize:13}}>
            {t.notif_no_notifs}
          </div>
        )}
        {items.map((n, i) => (
          <div
            key={n.id}
            onClick={() => handleNotifClick(n)}
            className="notif-item"
            style={{
              cursor: 'pointer',
              background: n.read ? 'transparent' : 'rgba(35,175,145,.07)',
              borderLeft: n.read ? '3px solid transparent' : '3px solid var(--accent)',
              borderBottom: i < items.length-1 ? '1px solid var(--border)' : 'none',
              padding:'12px 14px',
              display:'flex', alignItems:'flex-start', gap:12,
              transition:'background .2s',
            }}
          >
            <div style={{fontSize:22,flexShrink:0,lineHeight:1}}>{n.icon}</div>
            <div style={{flex:1,minWidth:0}}>
              <div style={{ fontSize:13, fontWeight:n.read?400:600, lineHeight:1.45, color:n.read?'var(--text2)':'var(--text)' }}>{convertCurrencyText(n.rawText || n.text, lang)}</div>
              <div style={{fontSize:11,color:'var(--text2)',marginTop:3}}>{n.time}</div>
              {n.type === 'registration_request' && !n.read && (
                <div style={{ marginTop:6, fontSize:11, color:'var(--accent)', fontWeight:600 }}>
                  {lang === 'bn' ? '👆 ট্যাপ করুন অনুমোদন/বাতিল করতে' : '👆 Tap to approve or cancel'}
                </div>
              )}
            </div>
            {!n.read && (
              <span style={{ width:8, height:8, borderRadius:'50%', background: n.type === 'registration_request' ? '#F6465D' : 'var(--accent)', flexShrink:0, marginTop:4, boxShadow:'0 0 6px var(--accent)' }}/>
            )}
          </div>
        ))}
      </div>
    </>
  );
}

export default NotifScreen;
