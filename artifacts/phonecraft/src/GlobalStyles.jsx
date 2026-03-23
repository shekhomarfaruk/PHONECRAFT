const GlobalStyles = ({ isDark, fontSize }) => {
  const base = { small: 13, medium: 15, large: 17, xlarge: 19 }[fontSize] || 15;
  const s = px => `${Math.round(px * base / 15)}px`;
  return (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&family=Space+Grotesk:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500;700&display=swap');

    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

    :root {
      --bg:        ${isDark ? '#0B0E11'              : '#E8EDF3'};
      --bg2:       ${isDark ? '#161A25'              : '#DDE4ED'};
      --card:      ${isDark ? 'rgba(30,35,41,0.82)'  : 'rgba(255,255,255,0.95)'};
      --border:    ${isDark ? 'rgba(43,49,57,0.9)'   : 'rgba(176,188,204,0.95)'};
      --border2:   ${isDark ? 'rgba(35,175,145,0.35)': 'rgba(27,169,123,0.45)'};
      --accent:    ${isDark ? '#23AF91'              : '#1BA97B'};
      --accent2:   ${isDark ? '#6366F1'              : '#4F46E5'};
      --accent3:   ${isDark ? '#F0B90B'              : '#D4A00A'};
      --green:     ${isDark ? '#0ECB81'              : '#0ECB81'};
      --red:       ${isDark ? '#F6465D'              : '#F6465D'};
      --yellow:    ${isDark ? '#FCD535'              : '#D4A00A'};
      --text:      ${isDark ? '#EAECEF'              : '#1E2329'};
      --text2:     ${isDark ? '#707A8A'              : '#5A6478'};
      --glow:      ${isDark ? '0 0 12px rgba(35,175,145,0.2)' : '0 0 12px rgba(27,169,123,0.12)'};
      --topbar-bg: ${isDark ? 'rgba(22,26,37,0.92)'  : 'rgba(255,255,255,0.97)'};
      --shell-bg:  ${isDark ? 'rgba(11,14,17,0.70)'  : 'rgba(232,237,243,0.80)'};
      --input-bg:  ${isDark ? 'rgba(43,49,57,0.45)'  : 'rgba(210,218,230,0.75)'};
      --sidebar-w: 240px;
      --base-font: ${base}px;
    }

    html, body { height: 100%; overflow: hidden; font-size: ${base}px; }
    body {
      background: var(--bg); color: var(--text);
      font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif; line-height: 1.5;
      -webkit-font-smoothing: antialiased;
      transition: background .3s, color .3s;
    }
    #root { height: 100%; display: flex; flex-direction: column; min-height: 0; overflow: hidden; }

    /* -- Scrollbar -- */
    ::-webkit-scrollbar { width: 4px; height: 4px; }
    ::-webkit-scrollbar-track { background: transparent; }
    ::-webkit-scrollbar-thumb { background: var(--accent); border-radius: 4px; opacity: 0.6; }

    /* ══════════════════════════════════════════════
       LAYOUT — RESPONSIVE SHELL
    ══════════════════════════════════════════════ */

    .app-outer {
      position: relative; z-index: 1;
      height: 100%; height: 100dvh;
      display: flex; align-items: stretch; justify-content: center;
    }

    .app-shell {
      display: flex; flex-direction: column;
      width: 100%; max-width: 480px;
      height: 100%; min-height: 0;
      background: var(--shell-bg);
      backdrop-filter: blur(16px); -webkit-backdrop-filter: blur(16px);
      border-left: 1px solid var(--border);
      border-right: 1px solid var(--border);
      transition: background .3s, border-color .3s;
      position: relative;
    }

    @media (min-width: 640px) {
      .app-shell { max-width: 600px; }
    }

    @media (min-width: 1024px) {
      .app-outer { align-items: stretch; }
      .app-shell {
        max-width: 1200px; width: 100%;
        flex-direction: row;
        border-left: none; border-right: none;
        border: 1px solid var(--border);
        border-radius: 0;
      }
    }

    /* -- Top Bar -- */
    .top-bar {
      display: flex; align-items: center; justify-content: space-between;
      padding: 10px 16px;
      background: var(--topbar-bg);
      border-bottom: 1px solid var(--border);
      backdrop-filter: blur(20px); -webkit-backdrop-filter: blur(20px);
      flex-shrink: 0;
      transition: background .3s, border-color .3s;
    }
    @media (min-width: 640px) {
      .top-bar { padding: 12px 24px; }
    }
    @media (min-width: 1024px) {
      .top-bar { border-left: 1px solid var(--border); }
    }

    .top-logo {
      font-family: 'Space Grotesk', sans-serif; font-size: ${s(17)}; font-weight: 700;
      color: var(--accent); letter-spacing: 0.5px;
      display: flex; align-items: center; gap: 8px;
    }
    @media (min-width: 640px) { .top-logo { font-size: ${s(17)}; } }

    .top-right { display: flex; align-items: center; gap: 8px; }
    @media (min-width: 640px) { .top-right { gap: 12px; } }

    .top-balance {
      display: flex; align-items: center; gap: 6px;
      background: var(--input-bg); border: 1px solid var(--border);
      border-radius: 8px; padding: 4px 10px;
      font-family: 'Space Grotesk', sans-serif; font-size: ${s(12)}; font-weight: 600; color: var(--accent);
    }
    @media (min-width: 640px) { .top-balance { font-size: ${s(13)}; padding: 5px 14px; } }

    .icon-btn {
      background: var(--input-bg); border: 1px solid var(--border);
      border-radius: 8px; width: 34px; height: 34px;
      display: flex; align-items: center; justify-content: center;
      cursor: pointer; color: var(--text2); transition: all .2s;
      flex-shrink: 0; overflow: hidden;
    }
    @media (min-width: 640px) { .icon-btn { width: 38px; height: 38px; } }
    .icon-btn:hover { border-color: var(--accent); color: var(--accent); }

    .notif-btn { position: relative; }
    .notif-dot {
      position: absolute; top: 4px; right: 4px;
      width: 7px; height: 7px;
      background: var(--red); border-radius: 50%;
      animation: pulse2 2s ease-in-out infinite;
    }
    @keyframes pulse2 { 0%,100%{transform:scale(1);opacity:1} 50%{transform:scale(1.3);opacity:.7} }

    .avatar-btn {
      width: 34px; height: 34px; border-radius: 8px;
      background: linear-gradient(135deg, var(--accent), var(--accent2));
      border: none;
      display: flex; align-items: center; justify-content: center;
      font-size: ${s(14)}; font-weight: 700; cursor: pointer; color: #fff;
      transition: all .2s; flex-shrink: 0;
    }
    @media (min-width: 640px) { .avatar-btn { width: 38px; height: 38px; font-size: ${s(16)}; } }
    .avatar-btn:hover { opacity: 0.85; }

    /* -- Sidebar (desktop only) -- */
    .sidebar {
      display: none;
    }
    @media (min-width: 1024px) {
      .sidebar {
        display: flex; flex-direction: column;
        width: var(--sidebar-w); flex-shrink: 0;
        background: var(--topbar-bg);
        border-right: 1px solid var(--border);
        overflow-y: auto;
        transition: background .3s;
      }
      .sidebar-logo {
        padding: 20px 20px 16px;
        font-family: 'Space Grotesk', sans-serif; font-size: ${s(16)}; font-weight: 700;
        color: var(--accent); letter-spacing: 0.5px;
        border-bottom: 1px solid var(--border);
        display: flex; align-items: center; gap: 8px;
      }
      .sidebar-user {
        padding: 16px 20px;
        border-bottom: 1px solid var(--border);
      }
      .sidebar-avatar {
        width: 44px; height: 44px; border-radius: 10px;
        background: linear-gradient(135deg, var(--accent), var(--accent2));
        display: flex; align-items: center; justify-content: center;
        font-size: ${s(18)}; font-weight: 700; margin-bottom: 8px; color: #fff;
      }
      .sidebar-nav { flex: 1; padding: 8px 0; }
      .sidebar-item {
        display: flex; align-items: center; gap: 12px;
        padding: 11px 20px; cursor: pointer; transition: all .15s;
        color: var(--text2); border-left: 3px solid transparent;
        font-weight: 500; font-size: ${s(14)};
      }
      .sidebar-item:hover { background: var(--input-bg); color: var(--text); border-left-color: var(--border2); }
      .sidebar-item.active { background: var(--input-bg); color: var(--accent); border-left-color: var(--accent); }
      .sidebar-bottom {
        padding: 12px 16px;
        border-top: 1px solid var(--border);
      }
    }

    /* -- Desktop content wrapper -- */
    .desktop-content {
      display: flex; flex-direction: column; flex: 1; min-width: 0; min-height: 0; overflow: hidden;
    }

    /* -- Screen / scroll area -- */
    .screen { flex: 1; min-height: 0; overflow-y: auto; overflow-x: hidden; padding: 16px; -webkit-overflow-scrolling: touch; }
    @media (min-width: 640px) { .screen { padding: 20px 24px; } }
    @media (min-width: 1024px) { .screen { padding: 24px 32px; } }

    /* -- Bottom Nav (mobile + tablet) -- */
    .bottom-nav {
      display: flex; align-items: center;
      background: var(--topbar-bg);
      border-top: 1px solid var(--border);
      padding: 6px 4px calc(6px + env(safe-area-inset-bottom));
      backdrop-filter: blur(20px); -webkit-backdrop-filter: blur(20px);
      flex-shrink: 0;
      transition: background .3s, border-color .3s;
    }
    @media (min-width: 640px) {
      .bottom-nav { padding: 8px 16px calc(8px + env(safe-area-inset-bottom)); }
    }
    @media (min-width: 1024px) { .bottom-nav { display: none; } }

    .nav-item {
      flex: 1; display: flex; flex-direction: column; align-items: center;
      gap: 3px; padding: 6px 2px; cursor: pointer;
      transition: all .2s; border-radius: 8px;
      -webkit-tap-highlight-color: transparent; color: var(--text2);
    }
    @media (min-width: 640px) { .nav-item { padding: 8px 4px; gap: 4px; } }
    .nav-item:hover, .nav-item.active { background: var(--input-bg); color: var(--accent); }
    .nav-item .ni { display: flex; align-items: center; transition: transform .2s; }
    .nav-item.active .ni { transform: translateY(-1px); }
    .nav-item > span:last-child { font-size: ${s(9)}; font-weight: 600; }
    @media (min-width: 640px) { .nav-item > span:last-child { font-size: ${s(10)}; } }
    .nav-item.active > span:last-child { color: var(--accent); }

    /* -- Slide Menu (mobile/tablet) -- */
    .slide-menu-overlay {
      position: fixed; inset: 0; z-index: 200;
      background: rgba(0,0,0,0.6); backdrop-filter: blur(4px);
    }
    @media (min-width: 1024px) { .slide-menu-overlay { display: none !important; } }
    .slide-menu {
      position: absolute; top: 0; right: 0; bottom: 0;
      width: min(300px, 85vw);
      background: var(--topbar-bg);
      border-left: 1px solid var(--border);
      backdrop-filter: blur(20px); padding: 20px 0;
      animation: slideIn .2s ease;
      overflow-y: auto; -webkit-overflow-scrolling: touch;
    }
    @keyframes slideIn { from{transform:translateX(100%)} to{transform:translateX(0)} }
    .menu-user { padding: 16px 20px 20px; border-bottom: 1px solid var(--border); margin-bottom: 8px; }
    .menu-avatar {
      width: 48px; height: 48px; border-radius: 10px;
      background: linear-gradient(135deg, var(--accent), var(--accent2));
      display: flex; align-items: center; justify-content: center;
      font-size: ${s(18)}; font-weight: 700; margin-bottom: 10px; color: #fff;
    }
    .menu-name { font-weight: 700; font-size: ${s(16)}; }
    .menu-code { font-size: ${s(11)}; color: var(--text2); font-family: 'JetBrains Mono', monospace; }
    .menu-balance {
      display: inline-flex; align-items: center; gap: 6px;
      background: var(--input-bg); border: 1px solid var(--border);
      border-radius: 8px; padding: 4px 10px; margin-top: 8px;
      font-family: 'Space Grotesk'; font-size: ${s(12)}; font-weight: 600; color: var(--accent);
    }
    .menu-item {
      display: flex; align-items: center; gap: 12px;
      padding: 12px 20px; cursor: pointer; transition: all .15s;
      color: var(--text); font-weight: 500; font-size: ${s(14)};
      border-left: 3px solid transparent;
    }
    .menu-item:hover, .menu-item.active { background: var(--input-bg); border-left-color: var(--accent); }
    .menu-item.active { color: var(--accent); }
    .menu-icon { color: var(--accent); width: 22px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }

    /* ══════════════════════════════════════════════
       SHARED UI COMPONENTS
    ══════════════════════════════════════════════ */

    /* Cards */
    .card {
      background: var(--card);
      border: 1px solid var(--border);
      border-radius: 12px; padding: 16px;
      backdrop-filter: blur(12px); -webkit-backdrop-filter: blur(12px);
      margin-bottom: 14px;
      transition: border-color .2s, background .3s;
      box-shadow: ${isDark ? '0 1px 3px rgba(0,0,0,0.3)' : '0 2px 8px rgba(0,0,0,0.1)'};
    }
    @media (min-width: 640px) { .card { padding: 20px; border-radius: 14px; } }
    @media (min-width: 1024px) { .card { padding: 22px; } }
    .card:hover { border-color: var(--border2); }

    .card-title {
      font-family: 'Space Grotesk', sans-serif; font-size: ${s(12)}; font-weight: 600; letter-spacing: 1px;
      color: var(--accent); text-transform: uppercase;
      margin-bottom: 12px; display: flex; align-items: center; gap: 8px;
    }
    @media (min-width: 640px) { .card-title { font-size: ${s(13)}; } }
    .card-title::after { content:''; flex:1; height:1px; background:linear-gradient(to right,var(--border),transparent); }

    /* Buttons */
    .btn {
      display: inline-flex; align-items: center; justify-content: center; gap: 8px;
      padding: 10px 18px; border-radius: 8px; font-family: 'Inter', sans-serif;
      font-size: ${s(13)}; font-weight: 600; letter-spacing: 0.3px;
      cursor: pointer; border: none; transition: all .2s;
      -webkit-tap-highlight-color: transparent;
    }
    @media (min-width: 640px) { .btn { padding: 11px 22px; font-size: ${s(14)}; } }
    .btn-primary {
      background: var(--accent);
      color: #fff; box-shadow: 0 2px 8px rgba(35,175,145,.25);
    }
    .btn-primary:hover { opacity: 0.85; box-shadow: 0 4px 16px rgba(35,175,145,.35); }
    .btn-primary:active { transform: scale(0.98); }
    .btn-outline { background: transparent; border: 1px solid var(--border); color: var(--text); font-weight: 500; }
    .btn-outline:hover { background: var(--input-bg); border-color: var(--accent); color: var(--accent); }
    .btn-danger { background: var(--red); color: #fff; }
    .btn-success { background: var(--green); color: #fff; }
    .btn-full { width: 100%; }
    .btn:disabled { opacity: .4; cursor: not-allowed; transform: none !important; }

    /* Inputs */
    .input-wrap { margin-bottom: 12px; }
    @media (min-width: 640px) { .input-wrap { margin-bottom: 14px; } }
    .input-label { font-size: ${s(12)}; color: var(--text2); letter-spacing: 0.3px;
      font-weight: 500; margin-bottom: 6px; display: block; }
    @media (min-width: 640px) { .input-label { font-size: ${s(13)}; } }
    .inp {
      width: 100%; background: var(--input-bg); border: 1px solid var(--border);
      border-radius: 8px; padding: 10px 14px; color: var(--text);
      font-family: 'Inter', sans-serif; font-size: ${s(14)}; outline: none; transition: all .2s;
    }
    @media (min-width: 640px) { .inp { padding: 12px 16px; font-size: ${s(15)}; } }
    .inp:focus { border-color: var(--accent); box-shadow: 0 0 0 2px rgba(35,175,145,0.15); }
    .inp::placeholder { color: var(--text2); }
    select.inp option { background: ${isDark ? '#1E2329' : '#fff'}; color: var(--text); }

    /* Badges */
    .badge {
      display: inline-flex; align-items: center; gap: 4px;
      padding: 2px 8px; border-radius: 6px;
      font-size: ${s(10)}; font-weight: 600;
    }
    @media (min-width: 640px) { .badge { font-size: ${s(11)}; padding: 3px 10px; } }
    .badge-green { background: rgba(14,203,129,.12); color: var(--green); border: 1px solid rgba(14,203,129,.25); }
    .badge-blue  { background: rgba(35,175,145,.12);  color: var(--accent); border: 1px solid rgba(35,175,145,.25); }
    .badge-orange{ background: rgba(240,185,11,.12);  color: var(--accent3); border: 1px solid rgba(240,185,11,.25); }

    /* Stats */
    .stats-row { display: grid; grid-template-columns: repeat(3,1fr); gap: 10px; margin-bottom: 14px; }
    @media (min-width: 640px) { .stats-row { gap: 14px; } }
    .stat-box {
      background: var(--card); border: 1px solid var(--border);
      border-radius: 10px; padding: 14px 10px; text-align: center;
      backdrop-filter: blur(12px); -webkit-backdrop-filter: blur(12px);
      transition: background .3s;
    }
    @media (min-width: 640px) { .stat-box { padding: 18px 14px; border-radius: 12px; } }
    .stat-num { font-family: 'Space Grotesk'; font-size: ${s(16)}; font-weight: 700; color: var(--accent); margin-bottom: 4px; }
    @media (min-width: 640px) { .stat-num { font-size: ${s(18)}; } }
    .stat-label { font-size: ${s(10)}; color: var(--text2); font-weight: 500; }
    @media (min-width: 640px) { .stat-label { font-size: ${s(11)}; } }

    /* Progress */
    .prog-bar { height: 4px; background: var(--input-bg); border-radius: 2px; overflow: hidden; }
    @media (min-width: 640px) { .prog-bar { height: 6px; } }
    .prog-fill { height: 100%; border-radius: 2px;
      background: linear-gradient(90deg, var(--accent), var(--green)); transition: width .5s ease; }

    /* Notifications */
    .notif-item { display: flex; gap: 12px; padding: 12px 0; border-bottom: 1px solid var(--border); }
    .notif-icon { font-size: ${s(22)}; flex-shrink: 0; }
    .notif-text { font-size: ${s(13)}; }
    @media (min-width: 640px) { .notif-text { font-size: ${s(14)}; } }
    .notif-time { font-size: ${s(11)}; color: var(--text2); margin-top: 2px; }

    /* Code display */
    .code-display {
      background: var(--input-bg); border: 1px solid var(--border);
      border-radius: 8px; padding: 12px; font-family: 'JetBrains Mono', monospace;
      font-size: ${s(15)}; color: var(--accent); letter-spacing: 2px; text-align: center; margin: 8px 0;
    }
    @media (min-width: 640px) { .code-display { font-size: ${s(18)}; padding: 14px; } }

    /* QR */
    .qr-mock {
      width: 140px; height: 140px; margin: 0 auto 12px;
      background: #fff; border-radius: 10px; padding: 10px;
      display: grid; grid-template-columns: repeat(7,1fr); gap: 2px;
    }
    @media (min-width: 640px) { .qr-mock { width: 160px; height: 160px; } }
    .qr-cell { border-radius: 1px; }

    /* Screen transition */
    .screen-enter { animation: screenFade .2s ease; }
    @keyframes screenFade { from{opacity:0;transform:translateY(8px)} to{opacity:1;transform:translateY(0)} }

    /* Terminal */
    .terminal {
      background: ${isDark ? '#0D1117' : '#1B1F23'}; border: 1px solid ${isDark ? 'rgba(35,175,145,.2)' : 'rgba(35,175,145,.15)'};
      border-radius: 10px; padding: 12px;
      font-family: 'JetBrains Mono', monospace;
      font-size: ${s(11)}; height: 200px; overflow-y: auto; color: var(--green);
    }
    @media (min-width: 640px) { .terminal { font-size: ${s(12)}; height: 240px; } }
    @media (min-width: 1024px) { .terminal { height: 280px; } }
    .terminal-header { display: flex; align-items: center; gap: 6px; margin-bottom: 10px; }
    .t-dot { width: 10px; height: 10px; border-radius: 50%; }
    .t-line { margin: 2px 0; animation: fadeIn .15s ease; }
    @keyframes fadeIn { from{opacity:0} to{opacity:1} }
    .t-cursor { display: inline-block; width: 7px; height: 14px; background: var(--green); animation: blink .8s step-end infinite; vertical-align: middle; }
    @keyframes blink { 50%{opacity:0} }

    /* Device preview */
    .device-preview {
      background: ${isDark ? 'linear-gradient(135deg,#161A25,#1E2329)' : 'linear-gradient(135deg,#F0F0F0,#E8E8E8)'};
      border: 1px solid var(--border);
      border-radius: 14px; padding: 20px;
      display: flex; flex-direction: column; align-items: center; margin-bottom: 16px;
    }
    .phone-mockup {
      width: 80px; height: 140px;
      background: ${isDark ? 'linear-gradient(145deg,#2B3139,#1E2329)' : 'linear-gradient(145deg,#E8E8E8,#D0D0D0)'};
      border: 2px solid var(--border); border-radius: 14px; margin-bottom: 12px;
      display: flex; align-items: center; justify-content: center; font-size: ${s(32)};
      position: relative; box-shadow: 0 8px 24px rgba(0,0,0,.2);
    }
    @media (min-width: 640px) { .phone-mockup { width: 96px; height: 168px; font-size: ${s(38)}; } }
    .phone-mockup::before { content:''; position:absolute; top:8px; width:30px; height:3px; background:var(--border); border-radius:2px; }

    /* Marketplace */
    .mp-grid { display: grid; grid-template-columns: 1fr; gap: 12px; }
    @media (min-width: 640px) { .mp-grid { grid-template-columns: 1fr 1fr; } }
    @media (min-width: 1024px) { .mp-grid { grid-template-columns: 1fr 1fr 1fr; } }
    .mp-card {
      background: var(--card); border: 1px solid var(--border);
      border-radius: 12px; overflow: hidden; transition: all .2s;
    }
    .mp-card:hover { border-color: var(--border2); transform: translateY(-2px); }
    .mp-img {
      height: 100px;
      background: ${isDark ? 'linear-gradient(135deg,#161A25,#1E2329)' : 'linear-gradient(135deg,#F0F0F0,#E8E8E8)'};
      display: flex; align-items: center; justify-content: center; font-size: ${s(40)};
    }
    @media (min-width: 640px) { .mp-img { height: 120px; font-size: ${s(48)}; } }
    .mp-body { padding: 12px; }
    .mp-name { font-weight: 600; margin-bottom: 4px; font-size: ${s(14)}; }
    @media (min-width: 640px) { .mp-name { font-size: ${s(15)}; } }
    .mp-specs { font-size: ${s(12)}; color: var(--text2); margin-bottom: 8px; }
    .mp-footer { display: flex; align-items: center; justify-content: space-between; gap: 8px; flex-wrap: wrap; }
    .mp-price { color: var(--accent); font-family: 'Space Grotesk'; font-size: ${s(14)}; font-weight: 700; }

    /* Plan grid */
    .plan-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-bottom: 14px; }
    @media (min-width: 640px) { .plan-grid { grid-template-columns: repeat(4,1fr); gap: 12px; } }
    @media (min-width: 1024px) { .plan-grid { grid-template-columns: repeat(4,1fr); } }
    .plan-card {
      background: var(--input-bg); border: 1px solid var(--border);
      border-radius: 10px; padding: 14px 10px; cursor: pointer; transition: all .2s; text-align: center;
    }
    .plan-card:hover { border-color: var(--border2); }
    .plan-card.selected { border-color: var(--accent); background: rgba(35,175,145,0.08); }
    .plan-name { font-family: 'Space Grotesk', sans-serif; font-size: ${s(10)}; font-weight: 600; color: var(--accent); letter-spacing: 1px; margin-bottom: 6px; }
    @media (min-width: 640px) { .plan-name { font-size: ${s(11)}; } }
    .plan-price { font-size: ${s(18)}; font-weight: 700; color: var(--text); margin-bottom: 4px; }
    .plan-limit { font-size: ${s(11)}; color: var(--text2); }

    /* Tabs */
    .tabs { display: flex; gap: 4px; background: var(--input-bg); border: 1px solid var(--border); border-radius: 8px; padding: 3px; margin-bottom: 14px; }
    .tab { flex: 1; padding: 7px; text-align: center; border-radius: 6px; cursor: pointer;
      font-size: ${s(12)}; font-weight: 500; transition: all .2s; color: var(--text2);
      display: flex; align-items: center; justify-content: center; gap: 5px; }
    @media (min-width: 640px) { .tab { font-size: ${s(13)}; padding: 8px 12px; } }
    .tab.active { background: var(--accent); color: #fff; }

    /* Chat */
    .chat-messages { display: flex; flex-direction: column; gap: 10px; margin-bottom: 12px; }
    .chat-msg { display: flex; gap: 8px; }
    .chat-msg.mine { flex-direction: row-reverse; }
    .chat-bubble {
      max-width: 75%; padding: 8px 12px; border-radius: 12px; font-size: ${s(13)}; line-height: 1.4;
    }
    @media (min-width: 640px) { .chat-bubble { font-size: ${s(14)}; } }
    .chat-bubble.other { background: var(--input-bg); border: 1px solid var(--border); }
    .chat-bubble.mine { background: var(--accent); color: #fff; }
    .chat-input-row { display: flex; gap: 8px; }
    .chat-av {
      width: 32px; height: 32px; border-radius: 8px;
      background: linear-gradient(135deg, var(--accent), var(--accent2));
      display: flex; align-items: center; justify-content: center;
      font-size: ${s(13)}; font-weight: 700; flex-shrink: 0; color: #fff;
    }
    @media (min-width: 640px) { .chat-av { width: 38px; height: 38px; font-size: ${s(15)}; } }

    /* Device result */
    .device-result { animation: deviceReveal .4s ease; }
    @keyframes deviceReveal { from{opacity:0;transform:scale(.97)} to{opacity:1;transform:scale(1)} }

    /* Auth screen */
    .auth-card {
      background: ${isDark ? 'rgba(22,26,37,0.92)' : 'rgba(255,255,255,0.92)'};
      border: 1px solid var(--border); border-radius: 16px; padding: 28px;
      backdrop-filter: blur(20px); -webkit-backdrop-filter: blur(20px);
      box-shadow: 0 8px 32px rgba(0,0,0,${isDark ? '0.4' : '0.08'});
    }
    @media (min-width: 640px) { .auth-card { padding: 36px; border-radius: 20px; } }

    /* ── Animated Logo Portal ── */
    .auth-logo-wrap {
      display: flex; flex-direction: column; align-items: center;
      margin-bottom: 8px; padding: 20px 0 10px; position: relative;
    }
    .auth-logo-portal {
      position: relative; width: 160px; height: 160px;
      display: flex; align-items: center; justify-content: center;
    }
    @media (min-width: 640px) { .auth-logo-portal { width: 190px; height: 190px; } }

    .auth-logo-ring {
      position: absolute; inset: 0; border-radius: 50%;
      border: 2px solid transparent;
      background: conic-gradient(from 0deg, #23AF91, #6366F1, #0ECB81, #23AF91) border-box;
      -webkit-mask: linear-gradient(#fff 0 0) padding-box, linear-gradient(#fff 0 0);
      -webkit-mask-composite: xor; mask-composite: exclude;
      animation: logoRingSpin 4s linear infinite;
    }
    .auth-logo-ring2 {
      position: absolute; inset: 6px; border-radius: 50%;
      border: 1px solid rgba(35,175,145,0.25);
      animation: logoRingSpin 6s linear infinite reverse;
    }
    .auth-logo-glow {
      position: absolute; inset: 10px; border-radius: 50%;
      background: radial-gradient(circle, rgba(35,175,145,0.15) 0%, transparent 70%);
      animation: logoGlowPulse 3s ease-in-out infinite;
    }
    .auth-logo-svg {
      position: relative; z-index: 2;
      animation: logoFloat 3s ease-in-out infinite;
      filter: drop-shadow(0 0 12px rgba(35,175,145,0.3));
    }
    .auth-orbit-dot {
      position: absolute; width: 5px; height: 5px; border-radius: 50%;
      z-index: 3;
    }
    .auth-orbit-dot:nth-of-type(1) { background: #23AF91; box-shadow: 0 0 8px #23AF91; animation: logoOrbit1 3s linear infinite; }
    .auth-orbit-dot:nth-of-type(2) { background: #6366F1; box-shadow: 0 0 8px #6366F1; animation: logoOrbit2 4s linear infinite; }
    .auth-orbit-dot:nth-of-type(3) { background: #0ECB81; box-shadow: 0 0 6px #0ECB81; width: 4px; height: 4px; animation: logoOrbit3 5s linear infinite; }
    .auth-orbit-dot:nth-of-type(4) { background: #FCD535; box-shadow: 0 0 6px #FCD535; width: 3px; height: 3px; animation: logoOrbit4 3.5s linear infinite; }

    @keyframes logoRingSpin { to { transform: rotate(360deg); } }
    @keyframes logoGlowPulse { 0%,100%{transform:scale(1);opacity:1} 50%{transform:scale(1.1);opacity:.6} }
    @keyframes logoFloat { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-6px)} }
    @keyframes logoOrbit1 { 0%{top:50%;left:0;transform:translate(-50%,-50%)} 25%{top:0;left:50%;transform:translate(-50%,-50%)} 50%{top:50%;left:100%;transform:translate(-50%,-50%)} 75%{top:100%;left:50%;transform:translate(-50%,-50%)} 100%{top:50%;left:0;transform:translate(-50%,-50%)} }
    @keyframes logoOrbit2 { 0%{top:0;left:50%;transform:translate(-50%,-50%)} 25%{top:50%;left:100%;transform:translate(-50%,-50%)} 50%{top:100%;left:50%;transform:translate(-50%,-50%)} 75%{top:50%;left:0;transform:translate(-50%,-50%)} 100%{top:0;left:50%;transform:translate(-50%,-50%)} }
    @keyframes logoOrbit3 { 0%{top:15%;left:15%;transform:translate(-50%,-50%)} 25%{top:15%;left:85%;transform:translate(-50%,-50%)} 50%{top:85%;left:85%;transform:translate(-50%,-50%)} 75%{top:85%;left:15%;transform:translate(-50%,-50%)} 100%{top:15%;left:15%;transform:translate(-50%,-50%)} }
    @keyframes logoOrbit4 { 0%{top:85%;left:50%;transform:translate(-50%,-50%)} 25%{top:50%;left:15%;transform:translate(-50%,-50%)} 50%{top:15%;left:50%;transform:translate(-50%,-50%)} 75%{top:50%;left:85%;transform:translate(-50%,-50%)} 100%{top:85%;left:50%;transform:translate(-50%,-50%)} }

    .auth-logo-text {
      font-family: 'Space Grotesk', sans-serif; font-size: ${s(32)}; font-weight: 700;
      color: var(--accent); margin-top: 14px; letter-spacing: 3px;
      text-shadow: 0 0 20px rgba(35,175,145,0.3);
    }
    @media (min-width: 640px) { .auth-logo-text { font-size: ${s(38)}; } }

    .auth-sub { color: var(--text2); font-size: ${s(13)}; letter-spacing: 2px; text-align: center; margin-bottom: 28px; font-weight: 500; }
    .auth-tabs {
      display: flex; gap: 4px; background: var(--input-bg);
      border: 1px solid var(--border); border-radius: 10px;
      padding: 3px; margin-bottom: 22px; width: 100%;
    }
    .auth-tab {
      flex: 1; padding: 8px; text-align: center; border-radius: 8px;
      cursor: pointer; font-weight: 600; font-size: ${s(13)};
      transition: all .2s; color: var(--text2);
    }
    .auth-tab.active { background: var(--accent); color: #fff; }

    /* Quick actions grid */
    .quick-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
    @media (min-width: 640px) { .quick-grid { grid-template-columns: repeat(4,1fr); } }

    /* Device spec grid */
    .spec-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; margin-bottom: 14px; font-size: ${s(12)}; }
    @media (min-width: 640px) { .spec-grid { grid-template-columns: repeat(4,1fr); } }

    /* Work config grid */
    .config-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-bottom: 12px; }
    @media (min-width: 640px) { .config-grid { grid-template-columns: repeat(3,1fr); } }
    @media (min-width: 1024px) { .config-grid { grid-template-columns: repeat(4,1fr); } }

    /* Tree */
    .tree-child { margin-left: 20px; border-left: 1px solid var(--border); padding-left: 12px; }
    .tree-user { display: flex; align-items: center; gap: 8px; padding: 6px 0; }
    .tree-av {
      width: 28px; height: 28px; border-radius: 8px; flex-shrink: 0;
      background: linear-gradient(135deg, var(--accent), var(--accent2));
      display: flex; align-items: center; justify-content: center; font-size: ${s(11)}; font-weight: 700; color: #fff;
    }
    @media (min-width: 640px) { .tree-av { width: 34px; height: 34px; font-size: ${s(13)}; } }

    /* Toast */
    .toast {
      position: fixed; bottom: 96px; left: 50%; transform: translateX(-50%);
      z-index: 9999;
      background: ${isDark ? 'rgba(22,26,34,0.97)' : 'rgba(255,255,255,0.98)'};
      border-radius: 20px;
      padding: 13px 14px 13px 14px;
      display: flex; align-items: center; gap: 12px;
      min-width: clamp(260px, 82vw, 380px);
      max-width: min(380px, calc(100vw - 28px));
      animation: toastIn .4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
      box-shadow: 0 12px 40px rgba(0,0,0,${isDark ? '0.65' : '0.16'}), 0 2px 10px rgba(0,0,0,${isDark ? '0.35' : '0.08'}), 0 0 0 1px rgba(255,255,255,${isDark ? '0.06' : '0.9'});
      border: 1px solid ${isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.07)'};
      backdrop-filter: blur(20px);
      -webkit-backdrop-filter: blur(20px);
    }
    .toast-success { box-shadow: 0 12px 40px rgba(0,0,0,${isDark ? '0.65' : '0.16'}), 0 2px 10px rgba(0,0,0,${isDark ? '0.35' : '0.08'}), 0 0 0 1.5px rgba(14,203,129,0.35); }
    .toast-error   { box-shadow: 0 12px 40px rgba(0,0,0,${isDark ? '0.65' : '0.16'}), 0 2px 10px rgba(0,0,0,${isDark ? '0.35' : '0.08'}), 0 0 0 1.5px rgba(246,70,93,0.35); }
    .toast-warning { box-shadow: 0 12px 40px rgba(0,0,0,${isDark ? '0.65' : '0.16'}), 0 2px 10px rgba(0,0,0,${isDark ? '0.35' : '0.08'}), 0 0 0 1.5px rgba(252,213,53,0.35); }
    .toast-info    { box-shadow: 0 12px 40px rgba(0,0,0,${isDark ? '0.65' : '0.16'}), 0 2px 10px rgba(0,0,0,${isDark ? '0.35' : '0.08'}), 0 0 0 1.5px rgba(35,175,145,0.35); }
    .toast-icon-wrap {
      width: 42px; height: 42px; border-radius: 13px;
      display: flex; align-items: center; justify-content: center;
      flex-shrink: 0;
    }
    .toast-success .toast-icon-wrap { background: rgba(14,203,129,0.14); }
    .toast-error   .toast-icon-wrap { background: rgba(246,70,93,0.14); }
    .toast-warning .toast-icon-wrap { background: rgba(252,213,53,0.12); }
    .toast-info    .toast-icon-wrap { background: rgba(35,175,145,0.12); }
    .toast-body { flex: 1; min-width: 0; }
    .toast-type-label {
      font-size: ${s(10)}; font-weight: 800; letter-spacing: 1px; text-transform: uppercase;
      margin-bottom: 2px;
    }
    .toast-success .toast-type-label { color: #0ECB81; }
    .toast-error   .toast-type-label { color: #F6465D; }
    .toast-warning .toast-type-label { color: #F0B90B; }
    .toast-info    .toast-type-label { color: var(--accent); }
    .toast-msg-text {
      font-size: ${s(13)}; font-weight: 500; color: var(--text);
      line-height: 1.45; word-break: break-word;
    }
    .toast-close {
      width: 28px; height: 28px; border-radius: 8px; flex-shrink: 0;
      display: flex; align-items: center; justify-content: center;
      background: ${isDark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.05)'};
      cursor: pointer; color: var(--text2); transition: background 0.2s;
    }
    .toast-close:hover { background: ${isDark ? 'rgba(255,255,255,0.14)' : 'rgba(0,0,0,0.1)'}; }
    @media (min-width: 640px) { .toast { font-size: ${s(14)}; bottom: 28px; } .toast-msg-text { font-size: ${s(14)}; } }
    @media (min-width: 1024px) { .toast { bottom: 36px; } }
    @keyframes toastIn { from{opacity:0;transform:translateX(-50%) translateY(16px) scale(0.93)} to{opacity:1;transform:translateX(-50%) translateY(0) scale(1)} }

    /* Icon spin */
    .theme-icon-enter { animation: spinIn .3s ease; }
    @keyframes spinIn { from{transform:rotate(-180deg)scale(0);opacity:0} to{transform:rotate(0)scale(1);opacity:1} }

    /* Responsive text utilities */
    .screen-title {
      font-family: 'Space Grotesk', sans-serif; font-size: ${s(14)}; font-weight: 600;
      color: var(--text); margin-bottom: 14px;
      display: flex; align-items: center; gap: 8px;
    }
    @media (min-width: 640px) { .screen-title { font-size: ${s(16)}; margin-bottom: 18px; } }

    /* Welcome card balance */
    .balance-num {
      font-family: 'Space Grotesk'; font-size: ${s(22)}; font-weight: 700; color: var(--accent);
      display: flex; align-items: center; gap: 6px;
    }
    @media (min-width: 640px) { .balance-num { font-size: ${s(28)}; } }
    @media (min-width: 1024px) { .balance-num { font-size: ${s(32)}; } }

    /* Big balance display */
    .big-balance {
      font-family: 'Space Grotesk'; font-size: ${s(34)}; font-weight: 700;
      color: var(--accent); display: flex; align-items: center; justify-content: center; gap: 10px;
    }
    @media (min-width: 640px) { .big-balance { font-size: ${s(44)}; } }

    /* ══════════════════════════════════════════════
       ICON ANIMATIONS & GLOW EFFECTS
    ══════════════════════════════════════════════ */

    /* Keyframes */
    @keyframes iconNavGlow {
      0%,100% { filter: drop-shadow(0 0 4px currentColor); transform: scale(1); }
      50%      { filter: drop-shadow(0 0 10px currentColor); transform: scale(1.12); }
    }
    @keyframes iconNavBounce {
      0%,100% { transform: translateY(0) scale(1); }
      30%     { transform: translateY(-3px) scale(1.08); }
      60%     { transform: translateY(-1px) scale(1.04); }
    }
    @keyframes iconTitlePulse {
      0%,100% { filter: drop-shadow(0 0 3px rgba(35,175,145,0.7)); }
      50%     { filter: drop-shadow(0 0 8px rgba(35,175,145,1)); }
    }
    @keyframes iconCardGlow {
      0%,100% { opacity: 0.9; filter: drop-shadow(0 0 2px rgba(35,175,145,0.5)); }
      50%     { opacity: 1;   filter: drop-shadow(0 0 6px rgba(35,175,145,0.85)); }
    }
    @keyframes iconBadgePulse {
      0%,100% { box-shadow: 0 0 0 0 rgba(35,175,145,0.3), 0 0 8px rgba(35,175,145,0.15); }
      50%     { box-shadow: 0 0 0 4px rgba(35,175,145,0), 0 0 16px rgba(35,175,145,0.3); }
    }
    @keyframes iconFloat {
      0%,100% { transform: translateY(0); }
      50%     { transform: translateY(-3px); }
    }
    @keyframes iconSpin {
      from { transform: rotate(0deg); }
      to   { transform: rotate(360deg); }
    }
    @keyframes iconShake {
      0%,100% { transform: rotate(0deg); }
      20%     { transform: rotate(-12deg); }
      40%     { transform: rotate(12deg); }
      60%     { transform: rotate(-8deg); }
      80%     { transform: rotate(6deg); }
    }

    /* ── Nav icon glow when active ── */
    .nav-item.active .ni {
      transform: translateY(-2px);
      filter: drop-shadow(0 0 7px rgba(35,175,145,0.85));
      animation: iconNavGlow 2.5s ease-in-out infinite;
    }

    /* ── Screen title icons ── */
    .screen-title svg {
      filter: drop-shadow(0 0 5px rgba(35,175,145,0.7));
      animation: iconTitlePulse 3s ease-in-out infinite;
    }

    /* ── Card title icons ── */
    .card-title svg {
      filter: drop-shadow(0 0 4px rgba(35,175,145,0.6));
      animation: iconCardGlow 3.5s ease-in-out infinite;
    }

    /* ── Icon badge wrapper ── (use class icon-badge on wrapper div) ── */
    .icon-badge {
      width: 38px; height: 38px; border-radius: 11px; flex-shrink: 0;
      display: flex; align-items: center; justify-content: center;
      animation: iconBadgePulse 3s ease-in-out infinite;
    }
    .icon-badge-green  { background: rgba(35,175,145,0.15); border: 1px solid rgba(35,175,145,0.2); }
    .icon-badge-blue   { background: rgba(99,102,241,0.15);  border: 1px solid rgba(99,102,241,0.2); }
    .icon-badge-orange { background: rgba(245,158,11,0.15);  border: 1px solid rgba(245,158,11,0.2); }
    .icon-badge-red    { background: rgba(239,68,68,0.15);   border: 1px solid rgba(239,68,68,0.2);  }
    .icon-badge-purple { background: rgba(167,139,250,0.15); border: 1px solid rgba(167,139,250,0.2); }
    @media (min-width: 640px) { .icon-badge { width: 44px; height: 44px; border-radius: 13px; } }

    /* ── Button icon animation ── */
    .btn svg   { transition: transform .2s; }
    .btn:hover svg  { transform: scale(1.18) rotate(3deg); }
    .btn:active svg { transform: scale(0.9); }

    /* ── Menu item icon animation ── */
    .menu-item .menu-icon svg  { transition: transform .2s, filter .2s; }
    .menu-item:hover .menu-icon svg {
      transform: scale(1.15) rotate(-5deg);
      filter: drop-shadow(0 0 5px rgba(35,175,145,0.7));
    }

    /* ── Sidebar item icon animation ── */
    .sidebar-item svg { transition: transform .2s; }
    .sidebar-item:hover svg   { transform: scale(1.12); }
    .sidebar-item.active svg  {
      filter: drop-shadow(0 0 6px rgba(35,175,145,0.7));
      animation: iconCardGlow 2.5s ease-in-out infinite;
    }

    /* ── Bell icon shake on notification ── */
    .notif-btn .icon-btn svg  { animation: iconShake 3.5s ease-in-out infinite; }

    /* ── Floating icon (success screen etc.) ── */
    .icon-float svg { animation: iconFloat 2.5s ease-in-out infinite; }

    /* ── Stat box icon glow ── */
    .stat-box svg {
      filter: drop-shadow(0 0 3px rgba(35,175,145,0.5));
      transition: filter .2s;
    }
    .stat-box:hover svg { filter: drop-shadow(0 0 8px rgba(35,175,145,0.9)); }

    /* ── Toast icon animation ── */
    .toast-icon-wrap svg { animation: iconNavBounce .5s ease; }

    /* ── Badge icon glow ── */
    .badge svg { vertical-align: middle; }

    /* ── Marketplace card phone icon float ── */
    .mp-img svg { animation: iconFloat 3s ease-in-out infinite; filter: drop-shadow(0 0 10px rgba(35,175,145,0.5)); }

    /* ── Quick action / home grid icon ── */
    .quick-grid > div svg { transition: transform .2s, filter .2s; }
    .quick-grid > div:hover svg {
      transform: scale(1.2) translateY(-2px);
      filter: drop-shadow(0 0 7px rgba(35,175,145,0.8));
    }

    /* ── Profile/wallet header icon ── */
    .icon-header-anim svg {
      filter: drop-shadow(0 0 6px rgba(35,175,145,0.6));
      animation: iconFloat 3s ease-in-out infinite;
    }
  `}</style>
  );
};

export { GlobalStyles };
