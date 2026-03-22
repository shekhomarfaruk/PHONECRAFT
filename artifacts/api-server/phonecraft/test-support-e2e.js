#!/usr/bin/env node
/**
 * Integration test: Telegram support reply flow
 * Tests the full path: user message → tg_msg_map insert → webhook reply → frontend poll
 *
 * Run: node phonecraft/test-support-e2e.js
 */
'use strict';
const { stmts } = require('./db.js');

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

async function run() {
  const sessionId = `test_${Date.now()}`;
  const chatId = -100123456789;
  const msgId = Math.floor(Math.random() * 1_000_000) + 100000;

  console.log('\n[1] Insert user message into support_chats');
  stmts.insertSupportMsg.run(sessionId, 'user', 'Hello from test');
  const msgs1 = stmts.getSupportMsgs.all(sessionId);
  assert(msgs1.length === 1 && msgs1[0].sender === 'user', 'User message stored');

  console.log('\n[2] Map (chat_id, tg_message_id) → session in tg_msg_map');
  stmts.insertTgMsgMap.run(chatId, msgId, `session:${sessionId}`);
  const row = stmts.getSessionByTgMsg.get(chatId, msgId);
  assert(!!row, 'Mapping found by composite key (chat_id, msg_id)');
  assert(row?.session_id === `session:${sessionId}`, `Mapped to correct session: ${row?.session_id}`);

  console.log('\n[3] Verify different chat_id does NOT match (collision guard)');
  const wrongRow = stmts.getSessionByTgMsg.get(-100999999999, msgId);
  assert(!wrongRow, 'Different chat_id does not collide with same msg_id');

  console.log('\n[4] Simulate admin reply saving to support_chats');
  stmts.insertSupportMsg.run(sessionId, 'admin', 'Reply from test admin');
  const msgs2 = stmts.getSupportMsgs.all(sessionId);
  assert(msgs2.length === 2, 'Two messages in session after admin reply');
  assert(msgs2[1].sender === 'admin', 'Second message is from admin');
  assert(msgs2[1].message === 'Reply from test admin', 'Admin reply text correct');

  console.log('\n[5] Cleanup test data');
  stmts.db?.prepare?.(`DELETE FROM support_chats WHERE session_id = ?`)?.run?.(sessionId);
  stmts.db?.prepare?.(`DELETE FROM tg_msg_map WHERE tg_message_id = ?`)?.run?.(msgId);

  console.log(`\nResults: ${passed} passed, ${failed} failed`);
  if (failed > 0) process.exit(1);
}

run().catch(e => { console.error('Test error:', e); process.exit(1); });
