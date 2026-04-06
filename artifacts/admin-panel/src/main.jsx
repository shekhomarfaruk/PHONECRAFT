import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import MaintenancePage from './MaintenancePage.jsx';
import './styles.css';

// ─── Maintenance mode ──────────────────────────────────────────────────────────
// Set to false to restore normal app behaviour.
const MAINTENANCE_MODE = false;
// ──────────────────────────────────────────────────────────────────────────────

ReactDOM.createRoot(document.getElementById('root')).render(
  MAINTENANCE_MODE ? <MaintenancePage /> : (
    <React.StrictMode>
      <App />
    </React.StrictMode>
  )
);
