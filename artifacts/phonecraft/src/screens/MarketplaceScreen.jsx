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

const DAILY_DEVICES = [
  { brand:'Samsung', models:['Galaxy S24','Galaxy A54','Galaxy M34','Galaxy S23 FE','Galaxy A35','Galaxy F55','Galaxy S24+','Galaxy A15','Galaxy M54','Galaxy A25'] },
  { brand:'Apple', models:['iPhone 15','iPhone 14','iPhone 13','iPhone 15 Pro','iPhone 12','iPhone SE 3','iPhone 15 Plus','iPhone 14 Pro','iPhone 13 mini','iPhone 11'] },
  { brand:'Xiaomi', models:['Redmi Note 13','Redmi 13C','POCO X6','Redmi Note 12','POCO M6 Pro','Redmi 12','Redmi Note 13 Pro','POCO F6','Redmi A3','POCO X6 Pro'] },
  { brand:'Oppo', models:['Reno 11','A98','Find X7','Reno 10','A78','Find N3 Flip','Reno 11 Pro','A58','Reno 8T','A17'] },
  { brand:'Vivo', models:['V30','Y200','X100','V29','Y100','X90 Pro','V27','Y02s','V30 Pro','Y16'] },
  { brand:'OnePlus', models:['12','Nord CE 4','11','Nord 3','Open','12R','Nord N30','10 Pro','Nord CE 3 Lite','Ace 3'] },
  { brand:'Google', models:['Pixel 8','Pixel 8 Pro','Pixel 7a','Pixel 8a','Pixel 7 Pro','Pixel Fold','Pixel 6a','Pixel 7','Pixel 8 Fold','Pixel 6 Pro'] },
  { brand:'Realme', models:['GT 6','Narzo 70','12 Pro+','GT Neo 6','C67','11 Pro','GT 5','C55','12+','Narzo 60'] },
];

const SELLER_NAMES = [
  'Rahul_S','Ahmad_R','James_O','Wei_L','Maria_S','Carlos_M','Aisha_K','David_M',
  'Priya_P','Samuel_A','Fatima_Z','Kevin_O','Li_M','Emmanuel_B','Sofia_R','Yusuf_I',
  'Grace_A','Tariq_H','Amara_D','Nguyen_L','Daniel_O','Blessing_C','Arjun_N','Zainab_M',
  'Roberto_S','Olu_B','Siti_R','Kwame_A','Amira_K','Jason_T','Adaeze_O','Raj_K',
  'Patience_A','Ali_H','Chiamaka_E','Hamid_R','Nkechi_O','Vikram_S','Josephine_N','Abdullah_F',
  'Chidi_O','Lakshmi_D','Moussa_C','Tina_B','Omar_F','Irene_W','Babatunde_A','Ananya_D',
  'Frank_A','Habib_D','Michael_T','Sandra_K','Ahmed_B','Lucy_N','Chen_X','Fatou_S',
  'Ibrahim_K','Stella_O','Rajesh_M','Hannah_A','Kwesi_D','Nadia_F','Victor_E','Cynthia_O',
];

const SPECS_LIST = [
  '6.7" AMOLED, 12GB RAM, 256GB','6.1" OLED, 8GB RAM, 128GB','6.5" LCD, 4GB RAM, 64GB',
  '6.8" Dynamic AMOLED, 12GB RAM, 512GB','6.4" Super AMOLED, 8GB RAM, 256GB',
  '6.6" IPS, 6GB RAM, 128GB','6.3" OLED, 8GB RAM, 256GB','6.9" LTPO, 16GB RAM, 512GB',
  '6.2" AMOLED, 12GB RAM, 256GB','6.7" pOLED, 8GB RAM, 128GB',
];

function seededRandom(seed) {
  let s = seed;
  return () => { s = (s * 1664525 + 1013904223) & 0xffffffff; return (s >>> 0) / 0xffffffff; };
}

function generateDailyPosts(count = 300) {
  const today = new Date();
  const daySeed = today.getFullYear() * 10000 + (today.getMonth() + 1) * 100 + today.getDate();
  const rand = seededRandom(daySeed);
  const posts = [];
  for (let i = 0; i < count; i++) {
    const brandEntry = DAILY_DEVICES[Math.floor(rand() * DAILY_DEVICES.length)];
    const model = brandEntry.models[Math.floor(rand() * brandEntry.models.length)];
    const seller = SELLER_NAMES[Math.floor(rand() * SELLER_NAMES.length)];
    const specs = SPECS_LIST[Math.floor(rand() * SPECS_LIST.length)];
    const price = (rand() * 9 + 1).toFixed(2);
    const isSold = rand() < 0.15;
    posts.push({
      id: `daily-${daySeed}-${i}`,
      name: `${brandEntry.brand} ${model}`,
      brand: brandEntry.brand,
      specs,
      price: parseFloat(price),
      seller,
      status: isSold ? 'sold' : 'active',
      isMine: false,
      isDaily: true,
    });
  }
  return posts;
}

// Try multiple key strategies to find a device image:
// 1. Exact name (e.g. "OnePlus 12", "Vivo X100", "Realme GT 5 Pro")
// 2. Strip leading brand word (e.g. "Samsung Galaxy S24" → "Galaxy S24")
// 3. For Oppo: replace "Oppo " with "OPPO " (stored with OPPO prefix)
function resolveDeviceImage(name, brand) {
  if (!name) return null;
  if (DEVICE_IMAGES[name]) return DEVICE_IMAGES[name];
  // Strip leading brand prefix (handles Apple/Samsung/Google/Xiaomi daily posts)
  const prefix = brand + ' ';
  if (name.startsWith(prefix)) {
    const stripped = name.slice(prefix.length);
    if (DEVICE_IMAGES[stripped]) return DEVICE_IMAGES[stripped];
    // For Oppo: "Oppo Reno 11" → strip → "Reno 11" → try "OPPO Reno 11"
    if (brand === 'Oppo') {
      const oppoKey = 'OPPO ' + stripped;
      if (DEVICE_IMAGES[oppoKey]) return DEVICE_IMAGES[oppoKey];
    }
  }
  return null;
}

function DevicePhoto({ name, brand, size = 100 }) {
  const [loaded, setLoaded] = useState(false);
  const [error, setError]   = useState(false);
  const src   = resolveDeviceImage(name, brand);
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

  const realMarketItems = allItems
    .filter(item => item.user_id !== user?.id)
    .map(item => ({
      id: item.id, name: item.device_name, brand: item.brand,
      specs: item.specs, price: item.price,
      seller: item.username || item.user_name || 'User',
      status: item.status, isMine: false,
    }));

  const dailyPosts = generateDailyPosts(300);
  const marketItems = [...realMarketItems, ...dailyPosts];

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
