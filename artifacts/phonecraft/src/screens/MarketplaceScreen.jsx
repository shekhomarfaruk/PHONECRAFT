import { useState, useEffect } from "react";
import Icons from "../Icons.jsx";
import { DEVICE_IMAGES } from "../data.jsx";
import { I18N } from "../i18n.js";
import { authFetch } from "../session.js";

const API_URL = import.meta.env.VITE_API_URL || '';

const BRAND_COLORS = {
  Apple: '#A0A0A0', Samsung: '#1428A0', Google: '#4285F4',
  OnePlus: '#F5010C', Xiaomi: '#FF6900', Oppo: '#1F8EFA',
  Vivo: '#415FFF', Realme: '#FFE600',
};

function DevicePhoto({ name, brand, size = 100 }) {
  const [loaded, setLoaded] = useState(false);
  const [error, setError]   = useState(false);
  const src   = DEVICE_IMAGES[name];
  const color = BRAND_COLORS[brand] || '#23AF91';

  return (
    <div style={{
      width: '100%', height: size,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      position: 'relative',
      background: `radial-gradient(circle at 50% 60%, ${color}18 0%, transparent 70%)`,
    }}>
      {!loaded && !error && src && (
        <div style={{
          width: size * 0.45, height: size * 0.82,
          borderRadius: 10,
          background: 'var(--border)',
          animation: 'mpShimmer 1.4s ease-in-out infinite',
        }} />
      )}
      {src && !error && (
        <img
          src={src}
          alt={name}
          onLoad={() => setLoaded(true)}
          onError={() => setError(true)}
          style={{
            maxHeight: size * 0.88,
            maxWidth: '80%',
            objectFit: 'contain',
            display: loaded ? 'block' : 'none',
            filter: `drop-shadow(0 4px 16px rgba(0,0,0,0.4)) drop-shadow(0 0 6px ${color}33)`,
            animation: 'mpFloat 3s ease-in-out infinite',
          }}
        />
      )}
      {(error || !src) && (
        <div style={{
          display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4,
        }}>
          <Icons.Smartphone size={32} color={color} />
          <div style={{ fontSize: 9, color, fontWeight: 700 }}>{brand}</div>
        </div>
      )}
      <style>{`
        @keyframes mpFloat { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-4px)} }
        @keyframes mpShimmer { 0%,100%{opacity:.4} 50%{opacity:.8} }
      `}</style>
    </div>
  );
}

function ItemGrid({ items, emptyText, lang }) {
  const t = I18N[lang] || I18N.en;
  const isSold = (item) => item.status === 'sold';
  return (
    <div className="mp-grid">
      {items.length === 0 && (
        <div style={{gridColumn:'1/-1',textAlign:'center',padding:32,color:'var(--text2)',fontSize:13}}>
          {emptyText}
        </div>
      )}
      {items.map(item => (
        <div key={item.id} className="mp-card" style={{position:'relative',overflow:'hidden'}}>
          {isSold(item) && (
            <div style={{position:'absolute',inset:0,zIndex:4,background:'rgba(0,0,0,.55)',display:'flex',alignItems:'center',justifyContent:'center',borderRadius:'inherit'}}>
              <span style={{fontFamily:'Space Grotesk',fontSize:13,fontWeight:900,color:'#F6465D',letterSpacing:3,textShadow:'0 0 12px #F6465D',border:'2px solid #F6465D',padding:'4px 14px',borderRadius:6}}>{t.sold_label}</span>
            </div>
          )}
          <div className="mp-img">
            <DevicePhoto name={item.name} brand={item.brand} size={130} />
          </div>
          <div className="mp-body">
            <div className="mp-name">{item.name}</div>
            <div className="mp-specs">{item.specs || item.brand}</div>
            <div className="mp-footer">
              <div className="mp-price">${Math.min(item.price, 10)}</div>
              <div style={{display:'flex',alignItems:'center',gap:4,fontSize:11,color:'var(--text2)'}}>
                {item.isMine && !isSold(item) && <span className="badge badge-blue" style={{fontSize:9,padding:'1px 6px'}}>{t.active_label}</span>}
                {item.isMine && <span className="badge badge-blue" style={{fontSize:9,padding:'1px 6px'}}>{t.yours_badge}</span>}
                {!item.isMine && item.seller && <span style={{fontSize:10,color:'var(--text2)'}}>@{item.seller}</span>}
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

function MarketplaceScreen({ user, lang }) {
  const t = I18N[lang] || I18N.en;
  const [tab,      setTab]      = useState('mine');
  const [myItems,  setMyItems]  = useState([]);
  const [allItems, setAllItems] = useState([]);
  const [allLoading, setAllLoading] = useState(false);

  useEffect(() => {
    if (!user?.id) return;
    const fetchMine = async () => {
      try {
        const res = await authFetch(`${API_URL}/api/user/${user.id}/marketplace`);
        const data = await res.json();
        if (res.ok && data.items) setMyItems(data.items);
      } catch (_) {}
    };
    fetchMine();
    const iv = setInterval(fetchMine, 30_000);
    return () => clearInterval(iv);
  }, [user?.id]);

  useEffect(() => {
    if (tab !== 'all') return;
    setAllLoading(true);
    authFetch(`${API_URL}/api/marketplace/all`)
      .then(r => r.json())
      .then(d => { if (d.items) setAllItems(d.items); })
      .catch(() => {})
      .finally(() => setAllLoading(false));
    const iv = setInterval(() => {
      authFetch(`${API_URL}/api/marketplace/all`)
        .then(r => r.json()).then(d => { if (d.items) setAllItems(d.items); }).catch(() => {});
    }, 30_000);
    return () => clearInterval(iv);
  }, [tab]);

  const userItems = myItems.map(item => ({
    id: item.id, name: item.device_name, brand: item.brand,
    specs: item.specs, price: item.price, seller: t.you,
    status: item.status, isMine: true,
  }));

  const marketItems = allItems
    .filter(item => item.user_id !== user?.id)
    .map(item => ({
      id: item.id, name: item.device_name, brand: item.brand,
      specs: item.specs, price: item.price,
      seller: item.username || item.user_name || 'User',
      status: item.status, isMine: false,
    }));

  return (
    <>
      <div className="screen-title"><Icons.Market size={18}/> {t.marketplace}</div>
      <div className="tabs">
        <div className={`tab ${tab==='mine'?'active':''}`} onClick={()=>setTab('mine')}>
          📦 My Listing
        </div>
        <div className={`tab ${tab==='all'?'active':''}`} onClick={()=>setTab('all')}>
          🌐 Marketplace
        </div>
      </div>

      {tab === 'mine' && (
        <ItemGrid items={userItems} emptyText={t.no_items_yet} lang={lang} />
      )}
      {tab === 'all' && (
        allLoading
          ? <div style={{textAlign:'center',padding:32,color:'var(--text2)',fontSize:13}}>Loading...</div>
          : <ItemGrid items={marketItems} emptyText={t.no_items_yet} lang={lang} />
      )}
    </>
  );
}

export default MarketplaceScreen;
