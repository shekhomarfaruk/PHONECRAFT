let _uid = 0;
const uid = () => `ic_${++_uid}`;

const Icons = {
  Home: ({ size = 20, color }) => {
    const id = uid();
    return (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
        <defs><linearGradient id={id} x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stopColor="#23AF91"/><stop offset="100%" stopColor="#4ADE80"/></linearGradient></defs>
        <path d="M3 10.5L12 3l9 7.5" stroke={color||`url(#${id})`} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M5 9.5V19a2 2 0 002 2h10a2 2 0 002-2V9.5" stroke={color||`url(#${id})`} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        <rect x="9" y="14" width="6" height="7" rx="1" fill={color||`url(#${id})`} opacity="0.2" stroke={color||`url(#${id})`} strokeWidth="1.5"/>
      </svg>
    );
  },
  Work: ({ size = 20, color }) => {
    const id = uid();
    return (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
        <defs><linearGradient id={id} x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stopColor="#6366F1"/><stop offset="100%" stopColor="#818CF8"/></linearGradient></defs>
        <rect x="2" y="7" width="20" height="14" rx="2.5" fill={color||`url(#${id})`} opacity="0.12" stroke={color||`url(#${id})`} strokeWidth="1.8"/>
        <path d="M16 7V5.5A2.5 2.5 0 0013.5 3h-3A2.5 2.5 0 008 5.5V7" stroke={color||`url(#${id})`} strokeWidth="1.8" strokeLinecap="round"/>
        <line x1="12" y1="11" x2="12" y2="17" stroke={color||`url(#${id})`} strokeWidth="1.8" strokeLinecap="round"/>
        <line x1="9" y1="14" x2="15" y2="14" stroke={color||`url(#${id})`} strokeWidth="1.8" strokeLinecap="round"/>
      </svg>
    );
  },
  Market: ({ size = 20, color }) => {
    const id = uid();
    return (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
        <defs><linearGradient id={id} x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stopColor="#F59E0B"/><stop offset="100%" stopColor="#F97316"/></linearGradient></defs>
        <circle cx="9" cy="21" r="1.5" fill={color||`url(#${id})`}/>
        <circle cx="18" cy="21" r="1.5" fill={color||`url(#${id})`}/>
        <path d="M1 1h4l2.68 13.39a2 2 0 002 1.61h9.72a2 2 0 001.95-1.57L23 6H6" stroke={color||`url(#${id})`} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M6 6h17l-1.68 8" stroke={color||`url(#${id})`} strokeWidth="0" fill={color||`url(#${id})`} opacity="0.1"/>
      </svg>
    );
  },
  Wallet: ({ size = 20, color }) => {
    const id = uid();
    return (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
        <defs><linearGradient id={id} x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stopColor="#23AF91"/><stop offset="100%" stopColor="#06B6D4"/></linearGradient></defs>
        <rect x="2" y="4" width="20" height="16" rx="3" fill={color||`url(#${id})`} opacity="0.1" stroke={color||`url(#${id})`} strokeWidth="1.8"/>
        <path d="M2 10h20" stroke={color||`url(#${id})`} strokeWidth="1.5"/>
        <circle cx="17" cy="15" r="1.5" fill={color||`url(#${id})`}/>
      </svg>
    );
  },
  Chat: ({ size = 20, color }) => {
    const id = uid();
    return (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
        <defs><linearGradient id={id} x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stopColor="#23AF91"/><stop offset="100%" stopColor="#34D399"/></linearGradient></defs>
        <path d="M21 11.5a8.38 8.38 0 01-.9 3.8 8.5 8.5 0 01-7.6 4.7 8.38 8.38 0 01-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 01-.9-3.8 8.5 8.5 0 014.7-7.6 8.38 8.38 0 013.8-.9h.5a8.48 8.48 0 018 8v.5z" fill={color||`url(#${id})`} opacity="0.12" stroke={color||`url(#${id})`} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
        <circle cx="8.5" cy="12" r="1" fill={color||`url(#${id})`}/><circle cx="12" cy="12" r="1" fill={color||`url(#${id})`}/><circle cx="15.5" cy="12" r="1" fill={color||`url(#${id})`}/>
      </svg>
    );
  },
  Bell: ({ size = 18, color }) => {
    const id = uid();
    return (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
        <defs><linearGradient id={id} x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stopColor="#F59E0B"/><stop offset="100%" stopColor="#FBBF24"/></linearGradient></defs>
        <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9" fill={color||`url(#${id})`} opacity="0.12" stroke={color||`url(#${id})`} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M13.73 21a2 2 0 01-3.46 0" stroke={color||`url(#${id})`} strokeWidth="1.8" strokeLinecap="round"/>
      </svg>
    );
  },
  Sun: ({ size = 18 }) => {
    const id = uid();
    return (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
        <defs><linearGradient id={id} x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stopColor="#FBBF24"/><stop offset="100%" stopColor="#F97316"/></linearGradient></defs>
        <circle cx="12" cy="12" r="5" fill={`url(#${id})`} opacity="0.3" stroke={`url(#${id})`} strokeWidth="2"/>
        <line x1="12" y1="1" x2="12" y2="3" stroke={`url(#${id})`} strokeWidth="2" strokeLinecap="round"/>
        <line x1="12" y1="21" x2="12" y2="23" stroke={`url(#${id})`} strokeWidth="2" strokeLinecap="round"/>
        <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" stroke={`url(#${id})`} strokeWidth="2" strokeLinecap="round"/>
        <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" stroke={`url(#${id})`} strokeWidth="2" strokeLinecap="round"/>
        <line x1="1" y1="12" x2="3" y2="12" stroke={`url(#${id})`} strokeWidth="2" strokeLinecap="round"/>
        <line x1="21" y1="12" x2="23" y2="12" stroke={`url(#${id})`} strokeWidth="2" strokeLinecap="round"/>
        <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" stroke={`url(#${id})`} strokeWidth="2" strokeLinecap="round"/>
        <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" stroke={`url(#${id})`} strokeWidth="2" strokeLinecap="round"/>
      </svg>
    );
  },
  Moon: ({ size = 18 }) => {
    const id = uid();
    return (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
        <defs><linearGradient id={id} x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stopColor="#818CF8"/><stop offset="100%" stopColor="#C084FC"/></linearGradient></defs>
        <path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z" fill={`url(#${id})`} opacity="0.25" stroke={`url(#${id})`} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    );
  },
  Coin: ({ size = 16 }) => (
    <img src="/balanceicon.png" alt="credit" style={{ width: size, height: size, objectFit: 'contain', verticalAlign: 'middle', display: 'inline-block' }} />
  ),
  User: ({ size = 16, color }) => {
    const id = uid();
    return (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
        <defs><linearGradient id={id} x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stopColor="#06B6D4"/><stop offset="100%" stopColor="#6366F1"/></linearGradient></defs>
        <circle cx="12" cy="8" r="4.5" fill={color||`url(#${id})`} opacity="0.15" stroke={color||`url(#${id})`} strokeWidth="1.8"/>
        <path d="M4 21v-1a6 6 0 0112 0v1" stroke={color||`url(#${id})`} strokeWidth="1.8" strokeLinecap="round"/>
        <path d="M16.5 8.5a3.5 3.5 0 013 1.7M18 21v-1a6 6 0 00-1-3.3" stroke={color||`url(#${id})`} strokeWidth="1.5" strokeLinecap="round" opacity="0.5"/>
      </svg>
    );
  },
  Cpu: ({ size = 22, color }) => {
    const id = uid();
    return (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
        <defs><linearGradient id={id} x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stopColor="#6366F1"/><stop offset="100%" stopColor="#A78BFA"/></linearGradient></defs>
        <rect x="4" y="4" width="16" height="16" rx="3" fill={color||`url(#${id})`} opacity="0.1" stroke={color||`url(#${id})`} strokeWidth="1.8"/>
        <rect x="8" y="8" width="8" height="8" rx="1.5" stroke={color||`url(#${id})`} strokeWidth="1.8"/>
        <line x1="9" y1="1" x2="9" y2="4" stroke={color||`url(#${id})`} strokeWidth="1.5" strokeLinecap="round"/><line x1="15" y1="1" x2="15" y2="4" stroke={color||`url(#${id})`} strokeWidth="1.5" strokeLinecap="round"/>
        <line x1="9" y1="20" x2="9" y2="23" stroke={color||`url(#${id})`} strokeWidth="1.5" strokeLinecap="round"/><line x1="15" y1="20" x2="15" y2="23" stroke={color||`url(#${id})`} strokeWidth="1.5" strokeLinecap="round"/>
        <line x1="20" y1="9" x2="23" y2="9" stroke={color||`url(#${id})`} strokeWidth="1.5" strokeLinecap="round"/><line x1="20" y1="15" x2="23" y2="15" stroke={color||`url(#${id})`} strokeWidth="1.5" strokeLinecap="round"/>
        <line x1="1" y1="9" x2="4" y2="9" stroke={color||`url(#${id})`} strokeWidth="1.5" strokeLinecap="round"/><line x1="1" y1="15" x2="4" y2="15" stroke={color||`url(#${id})`} strokeWidth="1.5" strokeLinecap="round"/>
      </svg>
    );
  },
  Smartphone: ({ size = 22, color }) => {
    const id = uid();
    return (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
        <defs><linearGradient id={id} x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stopColor="#6366F1"/><stop offset="100%" stopColor="#818CF8"/></linearGradient></defs>
        <rect x="5" y="2" width="14" height="20" rx="3" fill={color||`url(#${id})`} opacity="0.1" stroke={color||`url(#${id})`} strokeWidth="1.8"/>
        <line x1="10" y1="18" x2="14" y2="18" stroke={color||`url(#${id})`} strokeWidth="2" strokeLinecap="round"/>
        <line x1="9" y1="5" x2="15" y2="5" stroke={color||`url(#${id})`} strokeWidth="1.5" strokeLinecap="round" opacity="0.4"/>
      </svg>
    );
  },
  Zap: ({ size = 14, color }) => {
    const id = uid();
    return (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
        <defs><linearGradient id={id} x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stopColor="#F59E0B"/><stop offset="100%" stopColor="#EF4444"/></linearGradient></defs>
        <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" fill={color||`url(#${id})`} opacity="0.9"/>
      </svg>
    );
  },
  TrendUp: ({ size = 16, color }) => {
    const id = uid();
    return (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
        <defs><linearGradient id={id} x1="0%" y1="100%" x2="100%" y2="0%"><stop offset="0%" stopColor="#23AF91"/><stop offset="100%" stopColor="#4ADE80"/></linearGradient></defs>
        <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" stroke={color||`url(#${id})`} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        <polyline points="17 6 23 6 23 12" stroke={color||`url(#${id})`} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    );
  },
  Link: ({ size = 20, color }) => {
    const id = uid();
    return (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
        <defs><linearGradient id={id} x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stopColor="#23AF91"/><stop offset="100%" stopColor="#06B6D4"/></linearGradient></defs>
        <path d="M15 7h3a5 5 0 010 10h-3M9 17H6a5 5 0 010-10h3" stroke={color||`url(#${id})`} strokeWidth="2" strokeLinecap="round"/>
        <line x1="8" y1="12" x2="16" y2="12" stroke={color||`url(#${id})`} strokeWidth="2" strokeLinecap="round"/>
      </svg>
    );
  },
  People: ({ size = 20, color }) => {
    const id = uid();
    return (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
        <defs><linearGradient id={id} x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stopColor="#23AF91"/><stop offset="100%" stopColor="#6366F1"/></linearGradient></defs>
        <circle cx="9" cy="7" r="3.5" fill={color||`url(#${id})`} opacity="0.15" stroke={color||`url(#${id})`} strokeWidth="1.8"/>
        <path d="M2 21v-2a4 4 0 014-4h6a4 4 0 014 4v2" stroke={color||`url(#${id})`} strokeWidth="1.8" strokeLinecap="round"/>
        <circle cx="17" cy="8" r="2.5" stroke={color||`url(#${id})`} strokeWidth="1.5" opacity="0.6"/>
        <path d="M22 21v-1.5a3.5 3.5 0 00-3-3.45" stroke={color||`url(#${id})`} strokeWidth="1.5" strokeLinecap="round" opacity="0.6"/>
      </svg>
    );
  },
  Settings: ({ size = 20, color }) => {
    const id = uid();
    return (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
        <defs><linearGradient id={id} x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stopColor="#64748B"/><stop offset="100%" stopColor="#94A3B8"/></linearGradient></defs>
        <path d="M12.22 2h-.44a2 2 0 00-2 2v.18a2 2 0 01-1 1.73l-.43.25a2 2 0 01-2 0l-.15-.08a2 2 0 00-2.73.73l-.22.38a2 2 0 00.73 2.73l.15.1a2 2 0 011 1.72v.51a2 2 0 01-1 1.74l-.15.09a2 2 0 00-.73 2.73l.22.38a2 2 0 002.73.73l.15-.08a2 2 0 012 0l.43.25a2 2 0 011 1.73V20a2 2 0 002 2h.44a2 2 0 002-2v-.18a2 2 0 011-1.73l.43-.25a2 2 0 012 0l.15.08a2 2 0 002.73-.73l.22-.39a2 2 0 00-.73-2.73l-.15-.08a2 2 0 01-1-1.74v-.5a2 2 0 011-1.74l.15-.09a2 2 0 00.73-2.73l-.22-.38a2 2 0 00-2.73-.73l-.15.08a2 2 0 01-2 0l-.43-.25a2 2 0 01-1-1.73V4a2 2 0 00-2-2z" fill={color||`url(#${id})`} opacity="0.08" stroke={color||`url(#${id})`} strokeWidth="1.5"/>
        <circle cx="12" cy="12" r="3" stroke={color||`url(#${id})`} strokeWidth="2"/>
      </svg>
    );
  },
  Logout: ({ size = 20 }) => {
    const id = uid();
    return (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
        <defs><linearGradient id={id} x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stopColor="#EF4444"/><stop offset="100%" stopColor="#F97316"/></linearGradient></defs>
        <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4" stroke={`url(#${id})`} strokeWidth="2" strokeLinecap="round"/>
        <polyline points="16 17 21 12 16 7" stroke={`url(#${id})`} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        <line x1="21" y1="12" x2="9" y2="12" stroke={`url(#${id})`} strokeWidth="2" strokeLinecap="round"/>
      </svg>
    );
  },
  Support: ({ size = 20, color }) => {
    const id = uid();
    return (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
        <defs><linearGradient id={id} x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stopColor="#EF4444"/><stop offset="100%" stopColor="#F97316"/></linearGradient></defs>
        <circle cx="12" cy="12" r="10" fill={color||`url(#${id})`} opacity="0.1" stroke={color||`url(#${id})`} strokeWidth="1.8"/>
        <circle cx="12" cy="12" r="3" stroke={color||`url(#${id})`} strokeWidth="1.8"/>
        <line x1="12" y1="2" x2="12" y2="9" stroke={color||`url(#${id})`} strokeWidth="1.8" strokeLinecap="round"/>
        <line x1="12" y1="15" x2="12" y2="22" stroke={color||`url(#${id})`} strokeWidth="1.8" strokeLinecap="round"/>
        <line x1="2" y1="12" x2="9" y2="12" stroke={color||`url(#${id})`} strokeWidth="1.8" strokeLinecap="round"/>
        <line x1="15" y1="12" x2="22" y2="12" stroke={color||`url(#${id})`} strokeWidth="1.8" strokeLinecap="round"/>
      </svg>
    );
  },
  Send: ({ size = 18, color }) => {
    const id = uid();
    return (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
        <defs><linearGradient id={id} x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stopColor="#23AF91"/><stop offset="100%" stopColor="#06B6D4"/></linearGradient></defs>
        <path d="M22 2L11 13" stroke={color||`url(#${id})`} strokeWidth="2" strokeLinecap="round"/>
        <path d="M22 2L15 22l-4-9-9-4 20-7z" fill={color||`url(#${id})`} opacity="0.15" stroke={color||`url(#${id})`} strokeWidth="1.8" strokeLinejoin="round"/>
      </svg>
    );
  },
  Copy: ({ size = 16, color }) => {
    const id = uid();
    return (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
        <defs><linearGradient id={id} x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stopColor="#23AF91"/><stop offset="100%" stopColor="#06B6D4"/></linearGradient></defs>
        <rect x="9" y="9" width="13" height="13" rx="2" fill={color||`url(#${id})`} opacity="0.12" stroke={color||`url(#${id})`} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" stroke={color||`url(#${id})`} strokeWidth="2" strokeLinecap="round"/>
      </svg>
    );
  },
  Share: ({ size = 16, color }) => {
    const id = uid();
    return (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
        <defs><linearGradient id={id} x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stopColor="#F472B6"/><stop offset="100%" stopColor="#818CF8"/></linearGradient></defs>
        <circle cx="18" cy="5" r="3" fill={color||`url(#${id})`} opacity="0.2" stroke={color||`url(#${id})`} strokeWidth="2"/>
        <circle cx="6" cy="12" r="3" fill={color||`url(#${id})`} opacity="0.2" stroke={color||`url(#${id})`} strokeWidth="2"/>
        <circle cx="18" cy="19" r="3" fill={color||`url(#${id})`} opacity="0.2" stroke={color||`url(#${id})`} strokeWidth="2"/>
        <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" stroke={color||`url(#${id})`} strokeWidth="2" strokeLinecap="round"/>
        <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" stroke={color||`url(#${id})`} strokeWidth="2" strokeLinecap="round"/>
      </svg>
    );
  },
  ArrowRight: ({ size = 16, color }) => {
    const id = uid();
    return (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
        <defs><linearGradient id={id} x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stopColor="#23AF91"/><stop offset="100%" stopColor="#4ADE80"/></linearGradient></defs>
        <line x1="5" y1="12" x2="19" y2="12" stroke={color||`url(#${id})`} strokeWidth="2.5" strokeLinecap="round"/>
        <polyline points="12 5 19 12 12 19" stroke={color||`url(#${id})`} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    );
  },
  Star: ({ size = 16, color }) => {
    const id = uid();
    return (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
        <defs><linearGradient id={id} x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stopColor="#F59E0B"/><stop offset="100%" stopColor="#FBBF24"/></linearGradient></defs>
        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" fill={color||`url(#${id})`}/>
      </svg>
    );
  },
  CheckCircle: ({ size = 20, color }) => {
    const id = uid();
    return (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
        <defs><linearGradient id={id} x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stopColor="#23AF91"/><stop offset="100%" stopColor="#4ADE80"/></linearGradient></defs>
        <circle cx="12" cy="12" r="10" fill={color||`url(#${id})`} opacity="0.12" stroke={color||`url(#${id})`} strokeWidth="1.8"/>
        <polyline points="8 12 11 15 16 9" stroke={color||`url(#${id})`} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    );
  },
  Lock: ({ size = 18, color }) => {
    const id = uid();
    return (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
        <defs><linearGradient id={id} x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stopColor="#F59E0B"/><stop offset="100%" stopColor="#F97316"/></linearGradient></defs>
        <rect x="3" y="11" width="18" height="11" rx="3" fill={color||`url(#${id})`} opacity="0.12" stroke={color||`url(#${id})`} strokeWidth="1.8"/>
        <path d="M7 11V7a5 5 0 0110 0v4" stroke={color||`url(#${id})`} strokeWidth="2" strokeLinecap="round"/>
        <circle cx="12" cy="16" r="1.5" fill={color||`url(#${id})`}/>
      </svg>
    );
  },
  Mail: ({ size = 18, color }) => {
    const id = uid();
    return (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
        <defs><linearGradient id={id} x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stopColor="#60A5FA"/><stop offset="100%" stopColor="#6366F1"/></linearGradient></defs>
        <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" fill={color||`url(#${id})`} opacity="0.12" stroke={color||`url(#${id})`} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        <polyline points="22,6 12,13 2,6" stroke={color||`url(#${id})`} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    );
  },
  Package: ({ size = 20, color }) => {
    const id = uid();
    return (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
        <defs><linearGradient id={id} x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stopColor="#F59E0B"/><stop offset="100%" stopColor="#F97316"/></linearGradient></defs>
        <line x1="16.5" y1="9.4" x2="7.5" y2="4.21" stroke={color||`url(#${id})`} strokeWidth="2" strokeLinecap="round"/>
        <path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 002 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z" fill={color||`url(#${id})`} opacity="0.12" stroke={color||`url(#${id})`} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        <polyline points="3.27 6.96 12 12.01 20.73 6.96" stroke={color||`url(#${id})`} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        <line x1="12" y1="22.08" x2="12" y2="12" stroke={color||`url(#${id})`} strokeWidth="2" strokeLinecap="round"/>
      </svg>
    );
  },
  Bot: ({ size = 40, color }) => {
    const id = uid();
    return (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
        <defs><linearGradient id={id} x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stopColor="#06B6D4"/><stop offset="100%" stopColor="#6366F1"/></linearGradient></defs>
        <rect x="3" y="11" width="18" height="10" rx="2" fill={color||`url(#${id})`} opacity="0.12" stroke={color||`url(#${id})`} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
        <circle cx="12" cy="5" r="2" stroke={color||`url(#${id})`} strokeWidth="1.8"/>
        <path d="M12 7v4" stroke={color||`url(#${id})`} strokeWidth="1.8" strokeLinecap="round"/>
        <circle cx="8" cy="15" r="1.2" fill={color||`url(#${id})`}/>
        <circle cx="16" cy="15" r="1.2" fill={color||`url(#${id})`}/>
        <path d="M9 18h6" stroke={color||`url(#${id})`} strokeWidth="1.5" strokeLinecap="round"/>
      </svg>
    );
  },
  Transfer: ({ size = 20, color }) => {
    const id = uid();
    return (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
        <defs><linearGradient id={id} x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stopColor="#6366F1"/><stop offset="100%" stopColor="#818CF8"/></linearGradient></defs>
        <polyline points="17 1 21 5 17 9" stroke={color||`url(#${id})`} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M3 11V9a4 4 0 014-4h14" stroke={color||`url(#${id})`} strokeWidth="2" strokeLinecap="round"/>
        <polyline points="7 23 3 19 7 15" stroke={color||`url(#${id})`} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M21 13v2a4 4 0 01-4 4H3" stroke={color||`url(#${id})`} strokeWidth="2" strokeLinecap="round"/>
      </svg>
    );
  },
  Menu: ({ size = 22, color }) => {
    const id = uid();
    return (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
        <defs><linearGradient id={id} x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stopColor="#23AF91"/><stop offset="100%" stopColor="#6366F1"/></linearGradient></defs>
        <line x1="3" y1="6" x2="21" y2="6" stroke={color||`url(#${id})`} strokeWidth="2.2" strokeLinecap="round"/>
        <line x1="3" y1="12" x2="16" y2="12" stroke={color||`url(#${id})`} strokeWidth="2.2" strokeLinecap="round"/>
        <line x1="3" y1="18" x2="19" y2="18" stroke={color||`url(#${id})`} strokeWidth="2.2" strokeLinecap="round"/>
      </svg>
    );
  },
  X: ({ size = 20, color }) => {
    const id = uid();
    return (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
        <defs><linearGradient id={id} x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stopColor="#EF4444"/><stop offset="100%" stopColor="#F97316"/></linearGradient></defs>
        <line x1="18" y1="6" x2="6" y2="18" stroke={color||`url(#${id})`} strokeWidth="2.5" strokeLinecap="round"/>
        <line x1="6" y1="6" x2="18" y2="18" stroke={color||`url(#${id})`} strokeWidth="2.5" strokeLinecap="round"/>
      </svg>
    );
  },
  Shield: ({ size = 20, color }) => {
    const id = uid();
    return (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
        <defs><linearGradient id={id} x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stopColor="#23AF91"/><stop offset="100%" stopColor="#06B6D4"/></linearGradient></defs>
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" fill={color||`url(#${id})`} opacity="0.12" stroke={color||`url(#${id})`} strokeWidth="1.8" strokeLinejoin="round"/>
        <polyline points="9 12 11 14 15 10" stroke={color||`url(#${id})`} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    );
  },
  Info: ({ size = 20, color }) => {
    const id = uid();
    return (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
        <defs><linearGradient id={id} x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stopColor="#6366F1"/><stop offset="100%" stopColor="#818CF8"/></linearGradient></defs>
        <circle cx="12" cy="12" r="10" fill={color||`url(#${id})`} opacity="0.1" stroke={color||`url(#${id})`} strokeWidth="1.8"/>
        <line x1="12" y1="16" x2="12" y2="12" stroke={color||`url(#${id})`} strokeWidth="2.5" strokeLinecap="round"/>
        <circle cx="12" cy="8" r="1.2" fill={color||`url(#${id})`}/>
      </svg>
    );
  },
  ChevronDown: ({ size = 16, color }) => {
    const id = uid();
    return (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
        <defs><linearGradient id={id} x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stopColor="#23AF91"/><stop offset="100%" stopColor="#4ADE80"/></linearGradient></defs>
        <polyline points="6 9 12 15 18 9" stroke={color||`url(#${id})`} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    );
  },
  Book: ({ size = 20, color }) => {
    const id = uid();
    return (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
        <defs><linearGradient id={id} x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stopColor="#6366F1"/><stop offset="100%" stopColor="#A78BFA"/></linearGradient></defs>
        <path d="M4 19.5A2.5 2.5 0 016.5 17H20" stroke={color||`url(#${id})`} strokeWidth="1.8" strokeLinecap="round"/>
        <path d="M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z" fill={color||`url(#${id})`} opacity="0.1" stroke={color||`url(#${id})`} strokeWidth="1.8"/>
        <line x1="9" y1="7" x2="16" y2="7" stroke={color||`url(#${id})`} strokeWidth="1.5" strokeLinecap="round"/>
        <line x1="9" y1="11" x2="14" y2="11" stroke={color||`url(#${id})`} strokeWidth="1.5" strokeLinecap="round"/>
      </svg>
    );
  },
  Globe: ({ size = 20, color }) => {
    const id = uid();
    return (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
        <defs><linearGradient id={id} x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stopColor="#06B6D4"/><stop offset="100%" stopColor="#23AF91"/></linearGradient></defs>
        <circle cx="12" cy="12" r="10" fill={color||`url(#${id})`} opacity="0.1" stroke={color||`url(#${id})`} strokeWidth="1.8"/>
        <ellipse cx="12" cy="12" rx="4" ry="10" stroke={color||`url(#${id})`} strokeWidth="1.5"/>
        <line x1="2" y1="12" x2="22" y2="12" stroke={color||`url(#${id})`} strokeWidth="1.5"/>
        <path d="M4.5 7h15M4.5 17h15" stroke={color||`url(#${id})`} strokeWidth="1" opacity="0.5" strokeLinecap="round"/>
      </svg>
    );
  },
  Target: ({ size = 20, color }) => {
    const id = uid();
    return (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
        <defs><linearGradient id={id} x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stopColor="#EF4444"/><stop offset="100%" stopColor="#F97316"/></linearGradient></defs>
        <circle cx="12" cy="12" r="10" stroke={color||`url(#${id})`} strokeWidth="1.5" opacity="0.4"/>
        <circle cx="12" cy="12" r="6" stroke={color||`url(#${id})`} strokeWidth="1.8"/>
        <circle cx="12" cy="12" r="2.5" fill={color||`url(#${id})`}/>
      </svg>
    );
  },
  Document: ({ size = 20, color }) => {
    const id = uid();
    return (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
        <defs><linearGradient id={id} x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stopColor="#6366F1"/><stop offset="100%" stopColor="#818CF8"/></linearGradient></defs>
        <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8l-6-6z" fill={color||`url(#${id})`} opacity="0.1" stroke={color||`url(#${id})`} strokeWidth="1.8" strokeLinejoin="round"/>
        <polyline points="14 2 14 8 20 8" stroke={color||`url(#${id})`} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
        <line x1="8" y1="13" x2="16" y2="13" stroke={color||`url(#${id})`} strokeWidth="1.5" strokeLinecap="round"/>
        <line x1="8" y1="17" x2="13" y2="17" stroke={color||`url(#${id})`} strokeWidth="1.5" strokeLinecap="round"/>
      </svg>
    );
  },
  BarChart: ({ size = 20, color }) => {
    const id = uid();
    return (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
        <defs><linearGradient id={id} x1="0%" y1="100%" x2="100%" y2="0%"><stop offset="0%" stopColor="#6366F1"/><stop offset="100%" stopColor="#A78BFA"/></linearGradient></defs>
        <rect x="3" y="12" width="4" height="9" rx="1" fill={color||`url(#${id})`} opacity="0.3"/>
        <rect x="10" y="6" width="4" height="15" rx="1" fill={color||`url(#${id})`} opacity="0.6"/>
        <rect x="17" y="3" width="4" height="18" rx="1" fill={color||`url(#${id})`} opacity="0.9"/>
      </svg>
    );
  },
  Wrench: ({ size = 20, color }) => {
    const id = uid();
    return (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
        <defs><linearGradient id={id} x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stopColor="#23AF91"/><stop offset="100%" stopColor="#4ADE80"/></linearGradient></defs>
        <path d="M14.7 6.3a1 1 0 000 1.4l1.6 1.6a1 1 0 001.4 0l3.77-3.77a6 6 0 01-7.94 7.94l-6.91 6.91a2.12 2.12 0 01-3-3l6.91-6.91a6 6 0 017.94-7.94l-3.76 3.76z" fill={color||`url(#${id})`} opacity="0.12" stroke={color||`url(#${id})`} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    );
  },
  Dollar: ({ size = 20, color }) => {
    const id = uid();
    return (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
        <defs><linearGradient id={id} x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stopColor="#23AF91"/><stop offset="100%" stopColor="#4ADE80"/></linearGradient></defs>
        <circle cx="12" cy="12" r="10" fill={color||`url(#${id})`} opacity="0.12" stroke={color||`url(#${id})`} strokeWidth="1.8"/>
        <path d="M16 8.2C15.5 7 14 6 12 6s-4 1.2-4 3c0 3.5 8 2 8 5.5 0 1.8-1.5 3.2-4 3.5m0-12v1m0 11v1" stroke={color||`url(#${id})`} strokeWidth="2" strokeLinecap="round"/>
      </svg>
    );
  },
  Headset: ({ size = 20, color }) => {
    const id = uid();
    return (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
        <defs><linearGradient id={id} x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stopColor="#EF4444"/><stop offset="100%" stopColor="#F97316"/></linearGradient></defs>
        <path d="M3 18v-6a9 9 0 0118 0v6" stroke={color||`url(#${id})`} strokeWidth="1.8" strokeLinecap="round"/>
        <path d="M21 19a2 2 0 01-2 2h-1a2 2 0 01-2-2v-3a2 2 0 012-2h3v5zM3 19a2 2 0 002 2h1a2 2 0 002-2v-3a2 2 0 00-2-2H3v5z" fill={color||`url(#${id})`} opacity="0.2" stroke={color||`url(#${id})`} strokeWidth="1.8"/>
      </svg>
    );
  },
  Lifebuoy: ({ size = 20, color }) => {
    const id = uid();
    return (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
        <defs><linearGradient id={id} x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stopColor="#EF4444"/><stop offset="100%" stopColor="#F97316"/></linearGradient></defs>
        <circle cx="12" cy="12" r="10" stroke={color||`url(#${id})`} strokeWidth="1.8"/>
        <circle cx="12" cy="12" r="4" stroke={color||`url(#${id})`} strokeWidth="1.8"/>
        <line x1="4.93" y1="4.93" x2="9.17" y2="9.17" stroke={color||`url(#${id})`} strokeWidth="1.8" strokeLinecap="round"/>
        <line x1="14.83" y1="14.83" x2="19.07" y2="19.07" stroke={color||`url(#${id})`} strokeWidth="1.8" strokeLinecap="round"/>
        <line x1="14.83" y1="9.17" x2="19.07" y2="4.93" stroke={color||`url(#${id})`} strokeWidth="1.8" strokeLinecap="round"/>
        <line x1="4.93" y1="19.07" x2="9.17" y2="14.83" stroke={color||`url(#${id})`} strokeWidth="1.8" strokeLinecap="round"/>
      </svg>
    );
  },
  ShieldLock: ({ size = 20, color }) => {
    const id = uid();
    return (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
        <defs><linearGradient id={id} x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stopColor="#F59E0B"/><stop offset="100%" stopColor="#F97316"/></linearGradient></defs>
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" fill={color||`url(#${id})`} opacity="0.12" stroke={color||`url(#${id})`} strokeWidth="1.8" strokeLinejoin="round"/>
        <rect x="9" y="11" width="6" height="5" rx="1" stroke={color||`url(#${id})`} strokeWidth="1.5"/>
        <path d="M10 11V9a2 2 0 014 0v2" stroke={color||`url(#${id})`} strokeWidth="1.5" strokeLinecap="round"/>
        <circle cx="12" cy="13.5" r="0.8" fill={color||`url(#${id})`}/>
      </svg>
    );
  },
  Download: ({ size = 16, color }) => {
    const id = uid();
    return (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
        <defs><linearGradient id={id} x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stopColor="#23AF91"/><stop offset="100%" stopColor="#4ADE80"/></linearGradient></defs>
        <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" stroke={color||`url(#${id})`} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        <polyline points="7 10 12 15 17 10" stroke={color||`url(#${id})`} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        <line x1="12" y1="15" x2="12" y2="3" stroke={color||`url(#${id})`} strokeWidth="2" strokeLinecap="round"/>
      </svg>
    );
  },
  Upload: ({ size = 16, color }) => {
    const id = uid();
    return (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
        <defs><linearGradient id={id} x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stopColor="#6366F1"/><stop offset="100%" stopColor="#818CF8"/></linearGradient></defs>
        <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" stroke={color||`url(#${id})`} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        <polyline points="17 8 12 3 7 8" stroke={color||`url(#${id})`} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        <line x1="12" y1="3" x2="12" y2="15" stroke={color||`url(#${id})`} strokeWidth="2" strokeLinecap="round"/>
      </svg>
    );
  },
  Note: ({ size = 16, color }) => {
    const id = uid();
    return (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
        <defs><linearGradient id={id} x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stopColor="#F59E0B"/><stop offset="100%" stopColor="#FBBF24"/></linearGradient></defs>
        <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" fill={color||`url(#${id})`} opacity="0.1" stroke={color||`url(#${id})`} strokeWidth="1.8" strokeLinejoin="round"/>
        <polyline points="14 2 14 8 20 8" stroke={color||`url(#${id})`} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
        <line x1="8" y1="13" x2="16" y2="13" stroke={color||`url(#${id})`} strokeWidth="1.5" strokeLinecap="round"/>
        <line x1="8" y1="17" x2="13" y2="17" stroke={color||`url(#${id})`} strokeWidth="1.5" strokeLinecap="round"/>
      </svg>
    );
  },
  Trophy: ({ size = 16, color }) => {
    const id = uid();
    return (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
        <defs><linearGradient id={id} x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stopColor="#F59E0B"/><stop offset="100%" stopColor="#F97316"/></linearGradient></defs>
        <path d="M6 9H3a1 1 0 01-1-1V5a1 1 0 011-1h3" stroke={color||`url(#${id})`} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M18 9h3a1 1 0 001-1V5a1 1 0 00-1-1h-3" stroke={color||`url(#${id})`} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M6 4h12v6a6 6 0 01-12 0V4z" fill={color||`url(#${id})`} opacity="0.12" stroke={color||`url(#${id})`} strokeWidth="1.8"/>
        <path d="M12 16v3" stroke={color||`url(#${id})`} strokeWidth="1.8" strokeLinecap="round"/>
        <path d="M8 21h8" stroke={color||`url(#${id})`} strokeWidth="1.8" strokeLinecap="round"/>
      </svg>
    );
  },
  Diamond: ({ size = 16, color }) => {
    const id = uid();
    return (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
        <defs><linearGradient id={id} x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stopColor="#818CF8"/><stop offset="100%" stopColor="#C084FC"/></linearGradient></defs>
        <path d="M6 3h12l4 7-10 12L2 10z" fill={color||`url(#${id})`} opacity="0.12" stroke={color||`url(#${id})`} strokeWidth="1.8" strokeLinejoin="round"/>
        <path d="M2 10h20" stroke={color||`url(#${id})`} strokeWidth="1.5"/>
        <path d="M12 22l4-12M12 22l-4-12M10 3l2 7 2-7" stroke={color||`url(#${id})`} strokeWidth="1.2" opacity="0.5"/>
      </svg>
    );
  },
  AlertTriangle: ({ size = 16, color }) => {
    const id = uid();
    return (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
        <defs><linearGradient id={id} x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stopColor="#F59E0B"/><stop offset="100%" stopColor="#EF4444"/></linearGradient></defs>
        <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" fill={color||`url(#${id})`} opacity="0.1" stroke={color||`url(#${id})`} strokeWidth="1.8" strokeLinejoin="round"/>
        <line x1="12" y1="9" x2="12" y2="13" stroke={color||`url(#${id})`} strokeWidth="2" strokeLinecap="round"/>
        <circle cx="12" cy="17" r="1" fill={color||`url(#${id})`}/>
      </svg>
    );
  },
  Refresh: ({ size = 16, color }) => {
    const id = uid();
    return (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
        <defs><linearGradient id={id} x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stopColor="#23AF91"/><stop offset="100%" stopColor="#6366F1"/></linearGradient></defs>
        <polyline points="23 4 23 10 17 10" stroke={color||`url(#${id})`} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M20.49 15a9 9 0 11-2.12-9.36L23 10" stroke={color||`url(#${id})`} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    );
  },
  Reply: ({ size = 16, color }) => {
    const id = uid();
    return (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
        <defs><linearGradient id={id} x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stopColor="#6366F1"/><stop offset="100%" stopColor="#818CF8"/></linearGradient></defs>
        <polyline points="9 17 4 12 9 7" stroke={color||`url(#${id})`} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M20 18v-2a4 4 0 00-4-4H4" stroke={color||`url(#${id})`} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    );
  },
  Smile: ({ size = 16, color }) => {
    const id = uid();
    return (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
        <defs><linearGradient id={id} x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stopColor="#F59E0B"/><stop offset="100%" stopColor="#FBBF24"/></linearGradient></defs>
        <circle cx="12" cy="12" r="10" fill={color||`url(#${id})`} opacity="0.1" stroke={color||`url(#${id})`} strokeWidth="1.8"/>
        <path d="M8 14s1.5 2 4 2 4-2 4-2" stroke={color||`url(#${id})`} strokeWidth="1.8" strokeLinecap="round"/>
        <circle cx="9" cy="9.5" r="1.2" fill={color||`url(#${id})`}/>
        <circle cx="15" cy="9.5" r="1.2" fill={color||`url(#${id})`}/>
      </svg>
    );
  },
  FontSize: ({ size = 16, color }) => {
    const id = uid();
    return (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
        <defs><linearGradient id={id} x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stopColor="#6366F1"/><stop offset="100%" stopColor="#818CF8"/></linearGradient></defs>
        <path d="M4 7V4h16v3" stroke={color||`url(#${id})`} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        <line x1="12" y1="4" x2="12" y2="20" stroke={color||`url(#${id})`} strokeWidth="2" strokeLinecap="round"/>
        <line x1="8" y1="20" x2="16" y2="20" stroke={color||`url(#${id})`} strokeWidth="2" strokeLinecap="round"/>
      </svg>
    );
  },
  CreditCard: ({ size = 16, color }) => {
    const id = uid();
    return (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
        <defs><linearGradient id={id} x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stopColor="#23AF91"/><stop offset="100%" stopColor="#4ADE80"/></linearGradient></defs>
        <rect x="1" y="4" width="22" height="16" rx="2" fill={color||`url(#${id})`} opacity="0.1" stroke={color||`url(#${id})`} strokeWidth="1.8"/>
        <line x1="1" y1="10" x2="23" y2="10" stroke={color||`url(#${id})`} strokeWidth="1.8"/>
        <line x1="5" y1="15" x2="10" y2="15" stroke={color||`url(#${id})`} strokeWidth="1.5" strokeLinecap="round"/>
      </svg>
    );
  },
  Language: ({ size = 16, color }) => {
    const id = uid();
    return (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
        <defs><linearGradient id={id} x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stopColor="#23AF91"/><stop offset="100%" stopColor="#6366F1"/></linearGradient></defs>
        <circle cx="12" cy="12" r="10" stroke={color||`url(#${id})`} strokeWidth="1.8"/>
        <ellipse cx="12" cy="12" rx="4" ry="10" stroke={color||`url(#${id})`} strokeWidth="1.5"/>
        <line x1="2" y1="12" x2="22" y2="12" stroke={color||`url(#${id})`} strokeWidth="1.5"/>
        <path d="M4.5 7h15M4.5 17h15" stroke={color||`url(#${id})`} strokeWidth="1" opacity="0.5"/>
      </svg>
    );
  },
  MoreVertical: ({ size = 16, color }) => {
    const id = uid();
    return (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
        <defs><linearGradient id={id} x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stopColor="#23AF91"/><stop offset="100%" stopColor="#4ADE80"/></linearGradient></defs>
        <circle cx="12" cy="5" r="1.5" fill={color||`url(#${id})`}/>
        <circle cx="12" cy="12" r="1.5" fill={color||`url(#${id})`}/>
        <circle cx="12" cy="19" r="1.5" fill={color||`url(#${id})`}/>
      </svg>
    );
  },
  Logo: ({ size = 40 }) => (
    <svg width={size} height={size} viewBox="0 0 64 64" fill="none">
      <defs>
        <linearGradient id="logoGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#23AF91"/>
          <stop offset="100%" stopColor="#6366F1"/>
        </linearGradient>
      </defs>
      <path d="M32 4L56 18v28L32 60 8 46V18L32 4z" fill="url(#logoGrad)" opacity="0.12" stroke="url(#logoGrad)" strokeWidth="1.5"/>
      <path d="M32 10L50.5 20.5v21L32 52 13.5 41.5v-21L32 10z" fill="none" stroke="url(#logoGrad)" strokeWidth="1"/>
      <path d="M24 44V20h10a8 8 0 010 16H28" stroke="url(#logoGrad)" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
      <circle cx="24" cy="20" r="2" fill="#23AF91"/>
      <circle cx="34" cy="20" r="2" fill="#23AF91"/>
      <circle cx="38" cy="28" r="2" fill="#6366F1"/>
      <circle cx="34" cy="36" r="2" fill="#6366F1"/>
      <circle cx="24" cy="44" r="2" fill="#23AF91"/>
      <line x1="38" y1="28" x2="48" y2="28" stroke="#23AF91" strokeWidth="1" opacity="0.5"/>
      <line x1="24" y1="44" x2="16" y2="44" stroke="#6366F1" strokeWidth="1" opacity="0.5"/>
      <circle cx="48" cy="28" r="1.5" fill="#23AF91" opacity="0.6"/>
      <circle cx="16" cy="44" r="1.5" fill="#6366F1" opacity="0.6"/>
    </svg>
  ),
  AlertCircle: ({ size = 20, color }) => {
    const id = uid();
    return (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
        <defs><linearGradient id={id} x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stopColor="#EF4444"/><stop offset="100%" stopColor="#F97316"/></linearGradient></defs>
        <circle cx="12" cy="12" r="10" fill={color||`url(#${id})`} opacity="0.15" stroke={color||`url(#${id})`} strokeWidth="2"/>
        <line x1="12" y1="8" x2="12" y2="12" stroke={color||`url(#${id})`} strokeWidth="2.5" strokeLinecap="round"/>
        <circle cx="12" cy="16" r="1.3" fill={color||`url(#${id})`}/>
      </svg>
    );
  },
  LogoMark: ({ size = 24 }) => (
    <svg width={size} height={size} viewBox="0 0 64 64" fill="none">
      <defs>
        <linearGradient id="lmGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#23AF91"/>
          <stop offset="100%" stopColor="#6366F1"/>
        </linearGradient>
      </defs>
      <path d="M32 4L56 18v28L32 60 8 46V18L32 4z" fill="url(#lmGrad)" opacity="0.15" stroke="url(#lmGrad)" strokeWidth="2"/>
      <path d="M24 44V20h10a8 8 0 010 16H28" stroke="url(#lmGrad)" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round"/>
      <circle cx="24" cy="20" r="2" fill="#23AF91"/>
      <circle cx="38" cy="28" r="2" fill="#6366F1"/>
      <circle cx="24" cy="44" r="2" fill="#23AF91"/>
    </svg>
  ),
};

export default Icons;
