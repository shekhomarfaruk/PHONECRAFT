import React from 'react'

export default function MaintenancePage() {
  return (
    <div style={styles.wrapper}>
      <div style={styles.card}>
        <div style={styles.iconWrap}>
          <svg xmlns="http://www.w3.org/2000/svg" width="80" height="80" viewBox="0 0 64 64" fill="none">
            <ellipse cx="32" cy="38" rx="22" ry="10" fill="#555" opacity="0.4"/>
            <ellipse cx="32" cy="28" rx="18" ry="12" fill="#888"/>
            <ellipse cx="22" cy="30" rx="10" ry="7" fill="#aaa"/>
            <ellipse cx="42" cy="30" rx="8" ry="6" fill="#aaa"/>
            <ellipse cx="32" cy="24" rx="14" ry="10" fill="#ccc"/>
            <circle cx="26" cy="26" r="2.5" fill="#444"/>
            <circle cx="32" cy="25" r="2.5" fill="#444"/>
            <circle cx="38" cy="26" r="2.5" fill="#444"/>
            <ellipse cx="24" cy="38" rx="5" ry="3" fill="#999" opacity="0.7"/>
            <ellipse cx="40" cy="40" rx="4" ry="2.5" fill="#999" opacity="0.6"/>
          </svg>
        </div>
        <h1 style={styles.heading}>Hmmm... can't reach this page</h1>
        <p style={styles.domain}>
          <strong>phonecraft.tech's</strong> server IP address could not be found.
        </p>
        <p style={styles.tryLabel}>Try:</p>
        <ul style={styles.list}>
          <li>Checking the connection</li>
          <li>Checking the proxy, firewall, and DNS settings</li>
        </ul>
        <p style={styles.errorCode}>ERR_NAME_NOT_RESOLVED</p>
        <button style={styles.button} onClick={() => window.location.reload()}>Refresh</button>
      </div>
    </div>
  )
}

const styles = {
  wrapper: {
    position: 'fixed',
    inset: 0,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#2b2b2b',
    fontFamily: '"Segoe UI", Arial, sans-serif',
    padding: '24px',
    boxSizing: 'border-box',
  },
  card: {
    maxWidth: '480px',
    width: '100%',
  },
  iconWrap: {
    marginBottom: '24px',
  },
  heading: {
    fontSize: '28px',
    fontWeight: '400',
    color: '#e8e8e8',
    margin: '0 0 14px 0',
    lineHeight: '1.3',
  },
  domain: {
    fontSize: '15px',
    color: '#c8c8c8',
    margin: '0 0 16px 0',
    lineHeight: '1.5',
  },
  tryLabel: {
    fontSize: '15px',
    fontWeight: '700',
    color: '#c8c8c8',
    margin: '0 0 6px 0',
  },
  list: {
    fontSize: '15px',
    color: '#c8c8c8',
    margin: '0 0 16px 0',
    paddingLeft: '20px',
    lineHeight: '1.8',
  },
  errorCode: {
    fontSize: '11px',
    color: '#888',
    margin: '0 0 20px 0',
    letterSpacing: '0.5px',
  },
  button: {
    backgroundColor: '#0078d4',
    color: '#fff',
    border: 'none',
    borderRadius: '4px',
    padding: '8px 20px',
    fontSize: '14px',
    cursor: 'pointer',
    fontFamily: 'inherit',
  },
}
