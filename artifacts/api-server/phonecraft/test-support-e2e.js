#!/usr/bin/env node
/**
 * API-level integration test: Telegram support reply flow
 *
 * Exercises the actual HTTP endpoints:
 *   POST /api/support/message             — user sends chat message
 *   POST /webhook/telegram                — simulated Telegram webhook (admin reply)
 *   GET  /api/support/messages/:sessionId — frontend polling
 *
 * Run: node phonecraft/test-support-e2e.js
 * (server must be running on PORT=8080)
 */
'use strict';
const { db } = require('./db.js');

const BASE = `http://localhost:${process.env.PORT || 8080}`;
const ADMIN_CHAT_ID = process.env.TEST_CHAT_ID
  ? Number(process.env.TEST_CHAT_ID)
  : -1003885723195;
const ADMIN_SENDER_ID = '5973619782';

let passed = 0;
let failed = 0;

function assert(condition, label) {
  if (condition) {
    console.log(`  ✓ ${label}`);
    passed++;
  } else {
    console.error(`  ✗ ${label}`);
    failed++;
  }
}

async function post(path, body) {
  const r = await fetch(`${BASE}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  return r.json();
}

async function get(path) {
  const r = await fetch(`${BASE}${path}`);
  return r.json();
}

async function run() {
  const sessionId = `e2e_${Date.now()}`;
  let fakeTgMsgId = 0;

  console.log(`\n=== Support E2E test (session: ${sessionId}) ===\n`);

  // ── Step 1: User sends a support message via HTTP API ──────────────────────
  console.log('[1] POST /api/support/message (user message)');
  const sendResult = await post('/api/support/message', {
    sessionId,
    message: 'I need help with my order',
    senderName: 'TestUser',
  });
  assert(sendResult?.ok === true, 'API returns { ok: true }');

  // ── Step 2: Verify message is stored and retrievable ──────────────────────
  console.log('\n[2] GET /api/support/messages/:sessionId (before admin reply)');
  const before = await get(`/api/support/messages/${sessionId}`);
  assert(Array.isArray(before?.messages), 'Response has messages array');
  assert(before.messages.length === 1, 'Exactly 1 message (user)');
  assert(before.messages[0]?.sender === 'user', 'Sender is "user"');
  assert(before.messages[0]?.message === 'I need help with my order', 'Message text matches');

  // ── Step 3: Inject tg_msg_map entry as if the bot forwarded to Telegram ───
  // In production, telegramService.forwardSupportMessage() does this after
  // receiving a real message_id from the Telegram sendMessage API.
  console.log('\n[3] Inject tg_msg_map entry (simulating bot forward to Telegram)');
  fakeTgMsgId = 700000 + Math.floor(Math.random() * 99999);
  db.prepare('INSERT OR IGNORE INTO tg_msg_map (chat_id, tg_message_id, session_id) VALUES (?, ?, ?)')
    .run(ADMIN_CHAT_ID, fakeTgMsgId, `session:${sessionId}`);
  const mapped = db.prepare('SELECT session_id FROM tg_msg_map WHERE chat_id = ? AND tg_message_id = ?')
    .get(ADMIN_CHAT_ID, fakeTgMsgId);
  assert(mapped?.session_id === `session:${sessionId}`, `Composite key (chat_id, msg_id) resolves to correct session`);

  // Also verify cross-chat collision guard
  const wrongChatRow = db.prepare('SELECT session_id FROM tg_msg_map WHERE chat_id = ? AND tg_message_id = ?')
    .get(-100999999999, fakeTgMsgId);
  assert(!wrongChatRow, 'Different chat_id does not collide with same msg_id');

  // ── Step 4: Simulate Telegram admin reply-to-message webhook ──────────────
  console.log('\n[4] POST /webhook/telegram (admin reply-to-message)');
  const webhookRes = await fetch(`${BASE}/webhook/telegram`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      message: {
        message_id: fakeTgMsgId + 1,
        chat: { id: String(ADMIN_CHAT_ID) },
        from: { id: ADMIN_SENDER_ID, first_name: 'Admin' },
        text: 'We have resolved your issue!',
        reply_to_message: { message_id: fakeTgMsgId },
      },
    }),
  });
  const webhookBody = await webhookRes.text();
  assert(webhookRes.ok && webhookBody === 'OK', `Webhook returned 200 OK (got: ${webhookBody})`);

  // Allow async DB write to complete
  await new Promise(r => setTimeout(r, 300));

  // ── Step 5: Frontend polling sees admin reply ──────────────────────────────
  console.log('\n[5] GET /api/support/messages/:sessionId (after admin reply)');
  const after = await get(`/api/support/messages/${sessionId}`);
  assert(Array.isArray(after?.messages), 'Response has messages array');
  assert(after.messages.length === 2, 'Exactly 2 messages (user + admin)');
  const adminMsg = after.messages.find(m => m.sender === 'admin');
  assert(!!adminMsg, 'Admin message present in session');
  assert(adminMsg?.message === 'We have resolved your issue!', 'Admin reply text correct');

  // ── Cleanup ────────────────────────────────────────────────────────────────
  db.prepare('DELETE FROM support_chats WHERE session_id = ?').run(sessionId);
  db.prepare('DELETE FROM tg_msg_map WHERE chat_id = ? AND tg_message_id = ?').run(ADMIN_CHAT_ID, fakeTgMsgId);

  // ── Summary ────────────────────────────────────────────────────────────────
  console.log(`\nResults: ${passed} passed, ${failed} failed`);
  if (failed > 0) process.exit(1);
}

run().catch(e => {
  console.error('Test error:', e);
  process.exit(1);
});
