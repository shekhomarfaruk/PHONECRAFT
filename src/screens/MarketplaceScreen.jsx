import { useState, useEffect } from "react";
import Icons from "../Icons.jsx";
import { I18N } from "../i18n.js";

const API_URL = import.meta.env.VITE_API_URL || '';

function MarketplaceScreen({ user, lang }) {
  const t = I18N[lang] || I18N.en;
  const [filter, setFilter] = useState('all');
  const [myItems, setMyItems] = useState([]);

  useEffect(() => {
    if (!user?.id) return;
    const fetchItems = async () => {
      try {
        const res = await fetch(`${API_URL}/api/user/${user.id}/marketplace`);
        const data = await res.json();
        if (res.ok && data.items) setMyItems(data.items);
      } catch (_) {}
    };
    fetchItems();
    const interval = setInterval(fetchItems, 30_000);
    return () => clearInterval(interval);
  }, [user?.id]);

  const userItems = myItems.map(item => ({
    id:     item.id,
    name:   item.device_name,
    brand:  item.brand,
    img:    '📱',
    specs:  item.specs,
    price:  item.price,
    seller: t.you,
    status: item.status,
    isMine: true,
  }));

  const items = userItems;
  const isMe   = (item) => item.isMine;
  const isSold = (item) => item.status === 'sold';
  const filtered = items.filter(i =>
    filter === 'all' ||
    (filter === 'mine' && i.isMine) ||
    (filter === 'team' && !i.isMine)
  );

  return (
    <>
      <div className="screen-title"><Icons.Market size={18}/> {t.marketplace}</div>
      <div className="tabs">
        <div className={`tab ${filter==='all'  ?'active':''}`} onClick={()=>setFilter('all')}>{t.filter_all}</div>
        <div className={`tab ${filter==='mine' ?'active':''}`} onClick={()=>setFilter('mine')}>{t.filter_mine}</div>
        <div className={`tab ${filter==='team' ?'active':''}`} onClick={()=>setFilter('team')}>{t.filter_team}</div>
      </div>
      <div className="mp-grid">
        {filtered.length === 0 && (
          <div style={{gridColumn:'1/-1',textAlign:'center',padding:32,color:'var(--text2)',fontSize:13}}>
            {t.no_items_yet}
          </div>
        )}
        {filtered.map(item => (
          <div key={item.id} className="mp-card" style={{position:'relative',overflow:'hidden'}}>
            {isSold(item) && (
              <div style={{
                position:'absolute',inset:0,zIndex:4,
                background:'rgba(0,0,0,.55)',
                display:'flex',alignItems:'center',justifyContent:'center',
                borderRadius:'inherit',
              }}>
                <span style={{
                  fontFamily:'Space Grotesk',fontSize:13,fontWeight:900,
                  color:'#F6465D',letterSpacing:3,
                  textShadow:'0 0 12px #F6465D',
                  border:'2px solid #F6465D',
                  padding:'4px 14px',borderRadius:6,
                }}>{t.sold_label}</span>
              </div>
            )}
            <div className="mp-img">{item.img}</div>
            <div className="mp-body">
              <div className="mp-name">{item.name}</div>
              <div className="mp-specs">{item.specs || `${item.brand}`}</div>
              <div className="mp-footer">
                <div className="mp-price">${Math.min(item.price, 10)}</div>
                <div style={{display:'flex',alignItems:'center',gap:4,fontSize:11,color:'var(--text2)'}}>
                  {isMe(item) && !isSold(item) && (
                    <span className="badge badge-blue" style={{fontSize:9,padding:'1px 6px'}}>{t.active_label}</span>
                  )}
                  {isMe(item) && <span className="badge badge-blue" style={{fontSize:9,padding:'1px 6px'}}>{t.yours_badge}</span>}
                  <span>{item.seller}</span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}

export default MarketplaceScreen;
