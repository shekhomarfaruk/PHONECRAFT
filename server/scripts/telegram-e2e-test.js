const path = require('path');
const dotenv = require('dotenv');

dotenv.config({ path: path.resolve(__dirname, '..', '.env') });
dotenv.config({ path: path.resolve(__dirname, '..', '..', '.env') });

function parseIds(value) {
  return String(value || '')
    .split(',')
    .map((v) => v.trim())
    .filter(Boolean);
}

function normalizeChatId(rawId) {
  const id = String(rawId || '').trim();
  if (!id) return '';

  // Telegram channels are typically represented as -100xxxxxxxxxx for bot APIs.
  if (/^100\d{8,}$/.test(id)) return `-${id}`;
  return id;
}

function unique(values) {
  return [...new Set(values.filter(Boolean))];
}

async function tgCall(token, method, payload) {
  const url = `https://api.telegram.org/bot${token}/${method}`;
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload || {}),
  });
  const data = await res.json().catch(() => ({}));
  return {
    ok: !!data.ok,
    status: res.status,
    data,
  };
}

async function getWebhookInfo(token) {
  const url = `https://api.telegram.org/bot${token}/getWebhookInfo`;
  const res = await fetch(url);
  const data = await res.json().catch(() => ({}));
  return {
    ok: !!data.ok,
    status: res.status,
    data,
  };
}

async function setWebhook(token, url) {
  return tgCall(token, 'setWebhook', {
    url,
    allowed_updates: ['message'],
  });
}

async function sendText(token, chatId, text) {
  return tgCall(token, 'sendMessage', {
    chat_id: chatId,
    text,
  });
}

function pickArg(name) {
  const key = `--${name}=`;
  const found = process.argv.find((arg) => arg.startsWith(key));
  return found ? found.slice(key.length) : '';
}

function shortJson(v) {
  return JSON.stringify(v);
}

async function main() {
  const financeToken = process.env.TELEGRAM_FINANCE_BOT_TOKEN || process.env.FINANCE_BOT_TOKEN || '';
  const supportToken = process.env.TELEGRAM_SUPPORT_BOT_TOKEN || process.env.SUPPORT_BOT_TOKEN || '';
  const webhookBase = process.env.WEBHOOK_URL || '';

  const extraChatId = pickArg('extraChatId');

  const financeChats = unique(
    parseIds(process.env.TELEGRAM_FINANCE_CHAT_IDS || process.env.TELEGRAM_FINANCE_CHAT_ID)
      .concat(parseIds(extraChatId))
      .map(normalizeChatId)
  );

  const supportAdminChats = unique(
    parseIds(process.env.TELEGRAM_ADMIN_CHAT_IDS || process.env.TELEGRAM_SUPPORT_CHAT_IDS)
      .map(normalizeChatId)
  );

  if (!financeToken || !supportToken || !webhookBase) {
    console.error('[E2E] Missing required env: TELEGRAM_FINANCE_BOT_TOKEN, TELEGRAM_SUPPORT_BOT_TOKEN, WEBHOOK_URL');
    process.exit(1);
  }

  const supportWebhook = `${webhookBase}/webhook/telegram`;
  const financeWebhook = `${webhookBase}/webhook/telegram/finance`;

  console.log('[E2E] Setting webhooks...');
  const [supportSet, financeSet] = await Promise.all([
    setWebhook(supportToken, supportWebhook),
    setWebhook(financeToken, financeWebhook),
  ]);

  console.log('[E2E] setWebhook support:', shortJson({ ok: supportSet.ok, status: supportSet.status, desc: supportSet.data.description }));
  console.log('[E2E] setWebhook finance:', shortJson({ ok: financeSet.ok, status: financeSet.status, desc: financeSet.data.description }));

  console.log('[E2E] Fetching webhook info...');
  const [supportInfo, financeInfo] = await Promise.all([
    getWebhookInfo(supportToken),
    getWebhookInfo(financeToken),
  ]);

  console.log('[E2E] getWebhookInfo support:', shortJson(supportInfo.data.result || supportInfo.data));
  console.log('[E2E] getWebhookInfo finance:', shortJson(financeInfo.data.result || financeInfo.data));

  console.log('[E2E] Sending finance test messages...');
  for (const chatId of financeChats) {
    const r = await sendText(financeToken, chatId, '[E2E] Finance bot test message: /paid 999999');
    console.log(`[E2E] finance chat ${chatId}:`, shortJson({ ok: r.ok, status: r.status, desc: r.data.description || 'sent', message_id: r.data?.result?.message_id || null }));
  }

  console.log('[E2E] Sending support test messages...');
  for (const chatId of supportAdminChats) {
    const r = await sendText(supportToken, chatId, '[E2E] Support bot test delivery OK');
    console.log(`[E2E] support chat ${chatId}:`, shortJson({ ok: r.ok, status: r.status, desc: r.data.description || 'sent', message_id: r.data?.result?.message_id || null }));
  }

  const allOk = supportSet.ok && financeSet.ok && supportInfo.ok && financeInfo.ok;
  if (!allOk) {
    console.error('[E2E] Webhook verification failed. Check logs above.');
    process.exit(2);
  }

  console.log('[E2E] Completed.');
}

main().catch((err) => {
  console.error('[E2E] Fatal:', err.message);
  process.exit(99);
});
