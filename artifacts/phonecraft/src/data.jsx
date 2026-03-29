// ─── Plans ───────────────────────────────────────────────────────────────────
export const PLANS = [
  { id:'basic',    name:'BASIC',    price:'\u09F312,800',  rate:12800,  perTask:20,  dailyEarn:200,   daily:10, taskTime:2, color:'#23AF91', l1:20, l2:4, l3:1 },
  { id:'premium',  name:'PREMIUM',  price:'\u09F325,500',  rate:25500,  perTask:42,  dailyEarn:420,   daily:10, taskTime:2, color:'#6366F1', l1:20, l2:4, l3:1 },
  { id:'gold',     name:'GOLD',     price:'\u09F350,000',  rate:50000,  perTask:75,  dailyEarn:900,   daily:12, taskTime:2, color:'#FCD535', l1:20, l2:4, l3:1 },
  { id:'platinum', name:'PLATINUM', price:'\u09F380,000',  rate:80000,  perTask:100, dailyEarn:1600,  daily:16, taskTime:2, color:'#F0B90B', l1:20, l2:4, l3:1 },
];

// ─── Device brands (real phone brands) ───────────────────────────────────────
export const BRANDS = ['Apple','Samsung','Google','OnePlus','Xiaomi','Oppo','Vivo','Realme'];

// ─── Real phone models per brand ─────────────────────────────────────────────
export const BRAND_MODELS = {
  Apple:   ['iPhone 15 Pro Max','iPhone 15 Pro','iPhone 15 Plus','iPhone 15','iPhone 14 Pro'],
  Samsung: ['Galaxy S24 Ultra','Galaxy S24+','Galaxy S24','Galaxy S23 Ultra','Galaxy A54'],
  Google:  ['Pixel 8 Pro','Pixel 8','Pixel 7 Pro','Pixel 7a','Pixel 6a'],
  OnePlus: ['OnePlus 12','OnePlus 12R','OnePlus 11','OnePlus Nord 3','OnePlus Nord CE 3'],
  Xiaomi:  ['Xiaomi 14 Ultra','Xiaomi 14','Redmi Note 13 Pro+','Redmi Note 13 Pro','Poco X6 Pro'],
  Oppo:    ['OPPO Find X7 Ultra','OPPO Find X7','OPPO Reno 11 Pro','OPPO Reno 11','OPPO A98'],
  Vivo:    ['Vivo X100 Pro','Vivo X100','Vivo V29 Pro','Vivo V29','Vivo Y100'],
  Realme:  ['Realme GT 5 Pro','Realme GT 5','Realme 12 Pro+','Realme 12 Pro','Realme Narzo 60 Pro'],
};

// ─── Real device images from GSMArena CDN ────────────────────────────────────
const GSM = 'https://fdn2.gsmarena.com/vv/pics';
export const DEVICE_IMAGES = {
  // Apple
  'iPhone 15 Pro Max':   `${GSM}/apple/apple-iphone-15-pro-max-1.jpg`,
  'iPhone 15 Pro':       `${GSM}/apple/apple-iphone-15-pro-1.jpg`,
  'iPhone 15 Plus':      `${GSM}/apple/apple-iphone-15-plus-1.jpg`,
  'iPhone 15':           `${GSM}/apple/apple-iphone-15-1.jpg`,
  'iPhone 14 Pro':       `${GSM}/apple/apple-iphone-14-pro-1.jpg`,
  // Samsung
  'Galaxy S24 Ultra':    `${GSM}/samsung/samsung-galaxy-s24-ultra-5g-sm-s928-1.jpg`,
  'Galaxy S24+':         `${GSM}/samsung/samsung-galaxy-s24-plus-5g-sm-s926-1.jpg`,
  'Galaxy S24':          `${GSM}/samsung/samsung-galaxy-s24-5g-sm-s921-1.jpg`,
  'Galaxy S23 Ultra':    `${GSM}/samsung/samsung-galaxy-s23-ultra-5g-1.jpg`,
  'Galaxy A54':          'https://fdn2.gsmarena.com/vv/bigpic/samsung-galaxy-a54.jpg',
  // Google
  'Pixel 8 Pro':         `${GSM}/google/google-pixel-8-pro-1.jpg`,
  'Pixel 8':             `${GSM}/google/google-pixel-8-1.jpg`,
  'Pixel 7 Pro':         `${GSM}/google/google-pixel-7-pro-1.jpg`,
  'Pixel 7a':            `${GSM}/google/google-pixel-7a-1.jpg`,
  'Pixel 6a':            `${GSM}/google/google-pixel-6a-1.jpg`,
  // OnePlus
  'OnePlus 12':          `${GSM}/oneplus/oneplus-12-1.jpg`,
  'OnePlus 12R':         `${GSM}/oneplus/oneplus-12r-1.jpg`,
  'OnePlus 11':          `${GSM}/oneplus/oneplus-11-1.jpg`,
  'OnePlus Nord 3':      `${GSM}/oneplus/oneplus-nord-3-1.jpg`,
  'OnePlus Nord CE 3':   `${GSM}/oneplus/oneplus-nord-ce3-1.jpg`,
  // Xiaomi
  'Xiaomi 14 Ultra':     `${GSM}/xiaomi/xiaomi-14-ultra-1.jpg`,
  'Xiaomi 14':           `${GSM}/xiaomi/xiaomi-14-1.jpg`,
  'Redmi Note 13 Pro+':  `${GSM}/xiaomi/xiaomi-redmi-note-13-pro-plus-1.jpg`,
  'Redmi Note 13 Pro':   `${GSM}/xiaomi/xiaomi-redmi-note-13-pro-1.jpg`,
  'Poco X6 Pro':         `${GSM}/xiaomi/xiaomi-poco-x6-pro-1.jpg`,
  // OPPO
  'OPPO Find X7 Ultra':  `${GSM}/oppo/oppo-find-x7-ultra-1.jpg`,
  'OPPO Find X7':        `${GSM}/oppo/oppo-find-x7-1.jpg`,
  'OPPO Reno 11 Pro':    `${GSM}/oppo/oppo-reno11-pro-1.jpg`,
  'OPPO Reno 11':        `${GSM}/oppo/oppo-reno11-1.jpg`,
  'OPPO A98':            `${GSM}/oppo/oppo-a98-1.jpg`,
  // Vivo
  'Vivo X100 Pro':       `${GSM}/vivo/vivo-x100-pro-1.jpg`,
  'Vivo X100':           `${GSM}/vivo/vivo-x100-1.jpg`,
  'Vivo V29 Pro':        `${GSM}/vivo/vivo-v29-pro-1.jpg`,
  'Vivo V29':            `${GSM}/vivo/vivo-v29-1.jpg`,
  'Vivo Y100':           `${GSM}/vivo/vivo-y100-1.jpg`,
  // Realme
  'Realme GT 5 Pro':     `${GSM}/realme/realme-gt5-pro-1.jpg`,
  'Realme GT 5':         `${GSM}/realme/realme-gt5-1.jpg`,
  'Realme 12 Pro+':      `${GSM}/realme/realme-12-pro-plus-1.jpg`,
  'Realme 12 Pro':       `${GSM}/realme/realme-12-pro-1.jpg`,
  'Realme Narzo 60 Pro': `${GSM}/realme/realme-narzo60-pro-1.jpg`,
};

// ─── Device configuration options ────────────────────────────────────────────
export const DEVICE_CONFIGS = {
  rams:   ['4GB', '6GB', '8GB', '12GB'],
  roms:   ['64GB', '128GB', '256GB', '512GB'],
  colors: ['Midnight Black', 'Arctic White', 'Ocean Blue', 'Sunset Gold'],
};

// ─── Terminal log line generator (60 lines → 2s each = 120s total) ──────────
export function generateTerminalLines(deviceName, ram, rom) {
  return [
    '[BOOT] Initializing secure manufacturing environment...',
    '[BOOT] Loading kernel modules...',
    '[BOOT] Mounting encrypted filesystem...',
    '[SYS] Hardware abstraction layer v4.2 loaded',
    '[SYS] Verifying manufacturing license...',
    '[SYS] License verified ✓',
    `[INIT] Loading blueprint: ${deviceName}...`,
    '[INIT] Parsing device specifications...',
    '[INIT] Blueprint validation passed ✓',
    '[CPU] Selecting 8-core Snapdragon 8 Gen 3...',
    '[CPU] Allocating processor cores...',
    '[CPU] Clock speed: 3.2GHz configured ✓',
    '[CPU] Thermal management profile loaded',
    `[MEM] Initializing RAM module: ${ram}...`,
    '[MEM] Running memory integrity check...',
    '[MEM] LPDDR5X frequency: 4266MHz ✓',
    `[ROM] Preparing storage: ${rom}...`,
    '[ROM] Formatting UFS 4.0 partition...',
    '[ROM] Writing base filesystem...',
    '[ROM] Storage benchmark: 4200 MB/s read ✓',
    '[DISP] Configuring AMOLED display panel...',
    '[DISP] Resolution: 2400x1080 @ 120Hz ✓',
    '[DISP] HDR10+ calibration complete',
    '[NET] Initializing 5G/LTE modem...',
    '[NET] Configuring Wi-Fi 7 chipset...',
    '[NET] Bluetooth 5.4 LE paired ✓',
    '[NET] NFC module initialized ✓',
    '[GPU] Loading Adreno 750 graphics pipeline...',
    '[GPU] Shader compilation (1/3)...',
    '[GPU] Shader compilation (2/3)...',
    '[GPU] Shader compilation (3/3)...',
    '[GPU] Vulkan 1.3 driver ready ✓',
    '[CAM] Programming neural ISP 108MP rear...',
    '[CAM] Calibrating ultrawide 12MP lens...',
    '[CAM] Front camera 32MP initialized ✓',
    '[CAM] OIS stabilization configured',
    '[SENSOR] Calibrating accelerometer...',
    '[SENSOR] Gyroscope 6-axis ready ✓',
    '[SENSOR] Proximity & ambient light configured',
    '[SENSOR] Under-display fingerprint mapped ✓',
    '[BATT] Configuring 5000mAh Li-Po cell...',
    '[BATT] Fast charge 67W profile loaded',
    '[BATT] Wireless charging 15W enabled ✓',
    '[AUDIO] Stereo speaker tuning...',
    '[AUDIO] Dolby Atmos codec loaded ✓',
    '[AI] Loading on-device ML engine...',
    '[AI] Neural processing unit initialized',
    '[AI] AI model weights loaded (2.4GB) ✓',
    '[COMPILE] Building firmware v4.2.1...',
    '[COMPILE] Linking system libraries...',
    '[COMPILE] Optimizing binary for ARM64...',
    '[COMPILE] Firmware compiled ✓',
    '[SEC] Generating 256-bit encryption keys...',
    '[SEC] Secure boot chain signed ✓',
    '[SEC] TrustZone environment ready',
    '[QC] Running quality assurance suite...',
    '[QC] Hardware stress test (47/47 passed)...',
    '[QC] Network connectivity test passed ✓',
    '[QC] All 94 tests passed ✓',
    '[DONE] Manufacturing complete!',
  ];
}

// ─── Avatars ─────────────────────────────────────────────────────────────────
export const MALE_AVATARS = [
  '/avatars/male-1.png','/avatars/male-2.png','/avatars/male-3.png','/avatars/male-4.png','/avatars/male-5.png',
  '/avatars/male-6.png','/avatars/male-7.png','/avatars/male-8.png','/avatars/male-9.png','/avatars/male-10.png',
];
export const FEMALE_AVATARS = [
  '/avatars/female-1.png','/avatars/female-2.png','/avatars/female-3.png','/avatars/female-4.png','/avatars/female-5.png',
  '/avatars/female-6.png','/avatars/female-7.png','/avatars/female-8.png','/avatars/female-9.png','/avatars/female-10.png',
];
export const AVATARS = [...MALE_AVATARS, ...FEMALE_AVATARS];

// ─── Random names for auto-notifications ─────────────────────────────────────
export const RANDOM_NAMES = [
  'Rahim B.','Sonia K.','Jamal T.','Mitu R.','Karim A.',
  'Nasrin H.','Shakib L.','Priya D.','Rubel M.','Farida C.',
  'Tanvir O.','Lina S.','Hassan J.','Meeru P.','Bablu N.',
  'Riya F.','Sumon Q.','Farhan I.','Dipa G.','Arif E.',
];

// ─── Countries ───────────────────────────────────────────────────────────────
export const COUNTRIES = [
  { flag:'🇧🇩', name:'Bangladesh' },{ flag:'🇮🇳', name:'India' },
  { flag:'🇵🇰', name:'Pakistan' }, { flag:'🇮🇩', name:'Indonesia' },
  { flag:'🇲🇾', name:'Malaysia' }, { flag:'🇵🇭', name:'Philippines' },
  { flag:'🇳🇬', name:'Nigeria' },  { flag:'🇬🇭', name:'Ghana' },
  { flag:'🇰🇪', name:'Kenya' },    { flag:'🇹🇷', name:'Turkey' },
  { flag:'🇧🇷', name:'Brazil' },   { flag:'🇲🇽', name:'Mexico' },
  { flag:'🇸🇦', name:'Saudi Arabia' }, { flag:'🇦🇪', name:'UAE' },
  { flag:'🇪🇬', name:'Egypt' },    { flag:'🇮🇶', name:'Iraq' },
  { flag:'🇺🇿', name:'Uzbekistan' }, { flag:'🇰🇭', name:'Cambodia' },
  { flag:'🇳🇵', name:'Nepal' },    { flag:'🇱🇰', name:'Sri Lanka' },
];

// ─── Helpers ─────────────────────────────────────────────────────────────────
export const randItem = (arr) => arr[Math.floor(Math.random() * arr.length)];
export const fmtTaka  = (n)   => '৳' + Number(n).toLocaleString();

export const maskName = (name) => {
  const parts = name.split(' ');
  return parts.map(p => p[0] + '*'.repeat(Math.max(1, p.length - 1))).join(' ');
};

export const randomActivity = () => {
  const country = randItem(COUNTRIES);
  const name    = maskName(randItem(RANDOM_NAMES));
  const brand   = randItem(BRANDS);
  const suffix  = ['Pro','Ultra','Lite','Max','Mini'][Math.floor(Math.random()*5)];
  const gen     = (Math.floor(Math.random()*4)+1) + 'G';
  const device  = brand + ' ' + suffix + ' ' + gen;
  return {
    id:     Date.now() + Math.random(),
    type:   'sold',
    read:   false,
    icon:   country.flag,
    text:   `${name} from ${country.name} bought ${device}!`,
    time:   'Just now',
    itemId: Math.floor(Math.random()*4)+1,
  };
};

// ─── QR Mock component ────────────────────────────────────────────────────────
export const QRMock = () => {
  const cells = Array.from({ length: 49 }, (_, i) => {
    const r = Math.floor(i/7), c = i%7;
    const corner = (r<2&&c<2)||(r<2&&c>4)||(r>4&&c<2);
    return corner || (Math.random() > 0.5 && !corner);
  });
  return (
    <div className="qr-mock">
      {cells.map((filled,i) => <div key={i} className="qr-cell" style={{background:filled?'#000':'#fff'}}/>)}
    </div>
  );
};
