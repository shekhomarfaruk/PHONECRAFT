const nodemailer = require('nodemailer');

let warned = false;
let cachedTransporter = null;

function readSmtpConfig() {
  const host = String(process.env.SMTP_HOST || '').trim();
  const port = Number(process.env.SMTP_PORT || 587);
  const user = String(process.env.SMTP_USER || '').trim();
  const pass = String(process.env.SMTP_PASS || '').trim();
  const from = String(process.env.SMTP_FROM || user || '').trim();
  return { host, port, user, pass, from };
}

function isSmtpConfigured() {
  const { host, user, pass } = readSmtpConfig();
  const publicUrl = String(process.env.APP_PUBLIC_URL || '').trim();
  // APP_PUBLIC_URL is required so emails contain absolute, clickable login links
  return !!(host && user && pass && publicUrl);
}

function getTransporter() {
  if (cachedTransporter) return cachedTransporter;
  const { host, port, user, pass } = readSmtpConfig();
  cachedTransporter = nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    auth: { user, pass },
  });
  return cachedTransporter;
}

async function sendMail({ to, subject, text, html }) {
  if (!isSmtpConfigured()) {
    if (!warned) {
      console.warn('[emailService] SMTP not configured (set SMTP_HOST/SMTP_USER/SMTP_PASS) — email send skipped.');
      warned = true;
    }
    return { sent: false, reason: 'smtp_not_configured' };
  }
  try {
    const { from } = readSmtpConfig();
    const info = await getTransporter().sendMail({
      from: from || 'no-reply@phonecraft.local',
      to,
      subject,
      text,
      html,
    });
    return { sent: true, messageId: info.messageId };
  } catch (err) {
    console.error('[emailService] send failed:', err && err.message ? err.message : err);
    return { sent: false, reason: 'send_failed', error: String(err && err.message || err) };
  }
}

function buildMagicLinkEmail({ name, link, appName = 'PhoneCraft', publicUrl = '' }) {
  const safeName = String(name || 'there');
  const base = String(publicUrl || process.env.APP_PUBLIC_URL || '').replace(/\/+$/, '');
  const logoUrl = base ? `${base}/logo.png` : '';
  const ukFlagUrl = base ? `${base}/flag-uk.svg` : '';
  const officeLine1 = 'PhoneCraft Ltd.';
  const officeLine2 = '71-75 Shelton Street, Covent Garden';
  const officeLine3 = 'London, WC2H 9JQ, United Kingdom';

  const subject = `${appName}: Your account is active — login link inside`;
  const text =
`Hi ${safeName},

Your ${appName} account has been approved and activated.
Click the link below to log in (valid for 24 hours, single use):

${link}

If you didn't request this, you can ignore this email.

— ${appName}
${officeLine1}
${officeLine2}
${officeLine3}`;

  const html = `
<div style="font-family:system-ui,-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif;max-width:560px;margin:0 auto;padding:24px;color:#1f2937;background:#ffffff;">
  <div style="text-align:center;padding:8px 0 20px;">
    ${logoUrl ? `<img src="${logoUrl}" alt="${appName}" width="64" height="64" style="display:inline-block;border:0;outline:0;border-radius:14px;" />` : ''}
    <div style="font-family:'Space Grotesk',system-ui,sans-serif;font-size:22px;font-weight:800;color:#0f172a;margin-top:10px;letter-spacing:-0.01em;">${appName}</div>
  </div>
  <h2 style="margin:0 0 12px;color:#0f172a;font-size:20px;">Welcome aboard, ${safeName}!</h2>
  <p style="margin:0 0 16px;font-size:14px;line-height:1.6;">Your account has been approved and is now active.</p>
  <p style="margin:0 0 20px;font-size:14px;line-height:1.6;">Click the button below to log in. The link is valid for <b>24 hours</b> and can only be used once.</p>
  <p style="margin:0 0 24px;text-align:center;">
    <a href="${link}" style="display:inline-block;padding:13px 28px;background:#1E5FD4;color:#fff;text-decoration:none;border-radius:10px;font-weight:700;font-size:14px;">Login to ${appName}</a>
  </p>
  <p style="margin:0 0 8px;font-size:12px;color:#6b7280;">If the button doesn't work, copy and paste this URL into your browser:</p>
  <p style="margin:0 0 16px;font-size:12px;color:#1E5FD4;word-break:break-all;">${link}</p>
  <hr style="border:none;border-top:1px solid #e5e7eb;margin:24px 0 16px;" />
  <div style="display:flex;align-items:flex-start;gap:10px;font-size:11px;color:#6b7280;line-height:1.6;">
    ${ukFlagUrl ? `<img src="${ukFlagUrl}" alt="UK" width="18" height="12" style="display:inline-block;border:0;outline:0;margin-top:2px;flex-shrink:0;" />` : ''}
    <div>
      <div style="font-weight:700;color:#374151;margin-bottom:2px;">${officeLine1} — Head Office</div>
      <div>${officeLine2}</div>
      <div>${officeLine3}</div>
    </div>
  </div>
  <p style="margin:14px 0 0;font-size:11px;color:#9ca3af;">If you didn't request this, you can safely ignore this email.</p>
</div>`;
  return { subject, text, html };
}

module.exports = {
  isSmtpConfigured,
  sendMail,
  buildMagicLinkEmail,
};
