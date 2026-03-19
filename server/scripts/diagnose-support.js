#!/usr/bin/env node
/**
 * Support & Telegram Diagnostic Test
 * Tests: API endpoint, DB insertion, Telegram delivery
 */

require('dotenv').config({ path: require('path').join(__dirname, '..', '..', '.env') });
const { db, stmts } = require('../db');
const { TelegramService } = require('../services/telegramService');

const SUPPORT_BOT = process.env.TELEGRAM_SUPPORT_BOT_TOKEN || '';
const SUPPORT_CHATS = (process.env.TELEGRAM_SUPPORT_CHAT_IDS || '').split(',').filter(Boolean);

console.log('\n📋 SUPPORT & TELEGRAM DIAGNOSTIC\n');

// 1. Check config
console.log('1️⃣ CONFIG CHECK:');
console.log(`   Support Bot Token: ${SUPPORT_BOT ? '✓ Set' : '❌ Missing'}`);
console.log(`   Support Chat IDs: ${SUPPORT_CHATS.length > 0 ? `✓ ${SUPPORT_CHATS.join(', ')}` : '❌ Missing'}`);

// 2. Check database
console.log('\n2️⃣ DATABASE CHECK:');
try {
  const tables = db.prepare(`SELECT name FROM sqlite_master WHERE type='table'`).all();
  const hasTable = tables.some(t => t.name === 'support_chats');
  console.log(`   support_chats table: ${hasTable ? '✓ Exists' : '❌ Missing'}`);
  
  const count = db.prepare('SELECT COUNT(*) as cnt FROM support_chats').get();
  console.log(`   Records in table: ${count.cnt}`);
} catch (err) {
  console.log(`   ❌ Database error: ${err.message}`);
}

// 3 & 4 & 5. Test complete flow
(async () => {
  if (!SUPPORT_BOT || SUPPORT_CHATS.length === 0) {
    console.log('   ⚠️ Skipping - Telegram not configured');
    process.exit(0);
  }

  const testSessionId = 'diag_' + Date.now();

  // 4. Test TelegramService directly
  console.log('3️⃣ TELEGRAM SERVICE TEST:');
  const telegramService = new TelegramService({
    financeBotToken: process.env.TELEGRAM_FINANCE_BOT_TOKEN || '',
    supportBotToken: SUPPORT_BOT,
    financeChatIds: [],
    supportChatIds: SUPPORT_CHATS,
    adminChatIds: [],
    stmts,
    processTransactionAction: () => {},
    onSupportSessionReply: () => {},
  });

  try {
    const result = await telegramService.forwardSupportMessage({
      sessionId: testSessionId,
      message: 'Test support message from diagnostic',
      senderName: 'Diagnostic Test',
    });
    console.log(`   forwardSupportMessage: ${result.forwarded ? '✓ Success' : '❌ Failed'}`);
    console.log(`   Deliveries: ${result.deliveries?.length || 0}`);
  } catch (err) {
    console.log(`   ❌ Error: ${err.message}`);
  }

  // 5. Check database insertion
  console.log('\n4️⃣ DATABASE INSERTION TEST:');
  try {
    stmts.insertSupportMsg.run(testSessionId, 'user', 'Diagnostic test message');
    const msgs = db.prepare('SELECT * FROM support_chats WHERE session_id = ?').all(testSessionId);
    console.log(`   Insert: ✓ Success`);
    console.log(`   Records found: ${msgs.length}`);
    if (msgs.length > 0) {
      console.log(`   Latest: "${msgs[msgs.length - 1].message}"`);
    }
  } catch (err) {
    console.log(`   ❌ Error: ${err.message}`);
  }

  // 6. Check Telegram message map
  console.log('\n5️⃣ TELEGRAM MESSAGE MAP TEST:');
  try {
    const mapCount = db.prepare('SELECT COUNT(*) as cnt FROM tg_msg_map').get();
    console.log(`   Total mapped messages: ${mapCount.cnt}`);
    const recent = db.prepare('SELECT * FROM tg_msg_map ORDER BY created_at DESC LIMIT 1').get();
    if (recent) {
      console.log(`   Latest: tg_msg_id=${recent.tg_message_id}, key=${recent.session_or_user_id}`);
    }
  } catch (err) {
    console.log(`   ⚠️ ${err.message}`);
  }

  console.log('\n✅ Diagnostic complete\n');
  process.exit(0);
})().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
