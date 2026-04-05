import React from 'react'

export default function MaintenancePage() {
  return (
    <div style={styles.wrapper}>
      <div style={styles.card}>
        <div style={styles.iconWrap}>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="48"
            height="48"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#b91c1c"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8" x2="12" y2="12" />
            <line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
        </div>
        <h1 style={styles.heading}>Website Unavailable</h1>
        <p style={styles.subheading}>
          This domain has expired or is temporarily disabled.
        </p>
        <p style={styles.body}>
          Please contact support or try again later.
        </p>
        <div style={styles.divider} />
        <p style={styles.footer}>Error&nbsp;521&nbsp;·&nbsp;Site Unavailable</p>
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
    backgroundColor: '#f5f5f5',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    padding: '24px',
    boxSizing: 'border-box',
  },
  card: {
    textAlign: 'center',
    maxWidth: '420px',
    width: '100%',
  },
  iconWrap: {
    marginBottom: '20px',
  },
  heading: {
    fontSize: '22px',
    fontWeight: '700',
    color: '#111827',
    margin: '0 0 10px 0',
    letterSpacing: '-0.3px',
  },
  subheading: {
    fontSize: '15px',
    color: '#374151',
    margin: '0 0 8px 0',
    lineHeight: '1.5',
  },
  body: {
    fontSize: '14px',
    color: '#6b7280',
    margin: '0',
    lineHeight: '1.5',
  },
  divider: {
    height: '1px',
    backgroundColor: '#e5e7eb',
    margin: '24px 0',
  },
  footer: {
    fontSize: '12px',
    color: '#9ca3af',
    margin: '0',
    letterSpacing: '0.3px',
  },
}
