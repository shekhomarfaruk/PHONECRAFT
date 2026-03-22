class TelegramService {
  constructor({
    financeBotToken = '',
    supportBotToken = '',
    financeChatIds = [],
    supportChatIds = [],
    adminChatIds = [],
    stmts,
    processTransactionAction,
    onSupportSessionReply,
  }) {
    this.financeBotToken = String(financeBotToken || '').trim();
    this.supportBotToken = String(supportBotToken || '').trim();
    this.financeChatIds = Array.isArray(financeChatIds) ? financeChatIds.map((v) => String(v)) : [];
    this.supportChatIds = Array.isArray(supportChatIds) ? supportChatIds.map((v) => String(v)) : [];
    this.adminChatIds = new Set((Array.isArray(adminChatIds) ? adminChatIds : []).map((v) => String(v)));
    this.stmts = stmts;
    this.processTransactionAction = processTransactionAction;
    this.onSupportSessionReply = onSupportSessionReply;
  }

  logAction(action, ok, details = '') {
    const safeDetails = String(details || '').slice(0, 1000);
    try {
      if (this.stmts?.insertTelegramLog) {
        this.stmts.insertTelegramLog.run({
          action,
          ok: ok ? 1 : 0,
          details: safeDetails,
        });
      }
    } catch (_) {}

    const prefix = ok ? '[Telegram][OK]' : '[Telegram][ERR]';
    console.log(`${prefix} ${action}${safeDetails ? ` :: ${safeDetails}` : ''}`);
  }

  async sendMessage(text, { botToken, chatIds, replyToMessageId } = {}) {
    if (!botToken || !Array.isArray(chatIds) || chatIds.length === 0) {
      throw new Error('Telegram bot token or chat ids are not configured');
    }

    const url = `https://api.telegram.org/bot${botToken}/sendMessage`;
    const deliveries = [];
    const errors = [];

    for (const chatId of chatIds) {
      try {
        const payload = {
          chat_id: chatId,
          text,
          parse_mode: 'HTML',
        };

        if (replyToMessageId) {
          payload.reply_to_message_id = replyToMessageId;
          payload.allow_sending_without_reply = true;
        }

        const response = await fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });

        const data = await response.json().catch(() => ({}));
        if (!response.ok || !data.ok) {
          throw new Error(data.description || `Telegram send failed (${response.status})`);
        }

        deliveries.push({ chatId: String(chatId), result: data.result || null });
      } catch (err) {
        errors.push(`chat ${chatId}: ${err.message}`);
      }
    }

    if (deliveries.length === 0) {
      throw new Error(errors.join(' | ') || 'Telegram delivery failed');
    }

    return deliveries;
  }

  async sendDepositNotification({ userId, amount, requestId, timestamp }) {
    const text = [
      '📥 New Deposit Request',
      `User ID: ${userId}`,
      `Amount: ${amount}`,
      `Request ID: ${requestId}`,
      `Time: ${timestamp}`,
    ].join('\n');

    const deliveries = await this.sendMessage(text, {
      botToken: this.financeBotToken,
      chatIds: this.financeChatIds,
    });

    this.logAction('sendDepositNotification', true, `requestId=${requestId} deliveries=${deliveries.length}`);
    return deliveries;
  }

  async sendWithdrawNotification({ userId, amount, paymentMethod, accountNumber, requestId }) {
    const text = [
      '📤 Withdraw Request',
      `User ID: ${userId}`,
      `Amount: ${amount}`,
      `Method: ${paymentMethod}`,
      `Account: ${accountNumber}`,
      `Request ID: ${requestId}`,
    ].join('\n');

    const deliveries = await this.sendMessage(text, {
      botToken: this.financeBotToken,
      chatIds: this.financeChatIds,
    });

    this.logAction('sendWithdrawNotification', true, `requestId=${requestId} deliveries=${deliveries.length}`);
    return deliveries;
  }

  validateTrxId(trxId) {
    const value = String(trxId || '').trim();
    return /^[A-Za-z0-9_-]{4,64}$/.test(value);
  }

  isAdminChatId(chatId) {
    return this.adminChatIds.has(String(chatId));
  }

  getMessageText(msg) {
    return String(msg?.text || msg?.caption || '').trim();
  }

  async replyToChat(chatId, text, options = {}) {
    return this.sendMessage(text, {
      botToken: options.botToken || this.financeBotToken,
      chatIds: [String(chatId)],
      replyToMessageId: options.replyToMessageId,
    });
  }

  async handleAdminCommands(update) {
    const msg = update?.message;
    if (!msg) return { handled: false, reason: 'no-message' };

    const chatId = String(msg.chat?.id || '');
    const senderId = String(msg.from?.id || '');
    const text = this.getMessageText(msg);
    if (!text.startsWith('/')) return { handled: false, reason: 'not-command' };

    const isAdminActor = this.isAdminChatId(chatId) || this.isAdminChatId(senderId);
    if (!isAdminActor) {
      this.logAction('handleAdminCommands', false, `unauthorized chat=${chatId} sender=${senderId}`);
      return { handled: false, reason: 'unauthorized' };
    }

    const [command, ...args] = text.split(/\s+/);

    if (command === '/approve') {
      if (args.length < 2) {
        await this.replyToChat(chatId, 'Usage: /approve {request_id} {trxid_or_number}', {
          replyToMessageId: msg.message_id,
        });
        return { handled: true, ok: false };
      }

      const requestId = Number(args[0]);
      const trxId = String(args[1] || '').trim();

      if (!Number.isInteger(requestId) || requestId <= 0) {
        await this.replyToChat(chatId, 'Invalid request_id', { replyToMessageId: msg.message_id });
        return { handled: true, ok: false };
      }

      if (!this.validateTrxId(trxId)) {
        await this.replyToChat(chatId, 'Invalid trxid_or_number format', { replyToMessageId: msg.message_id });
        return { handled: true, ok: false };
      }

      const tx = this.stmts.getTransactionById.get(requestId);
      if (!tx) {
        await this.replyToChat(chatId, 'Request not found', { replyToMessageId: msg.message_id });
        return { handled: true, ok: false };
      }
      if (tx.type !== 'deposit') {
        await this.replyToChat(chatId, 'Request is not a deposit', { replyToMessageId: msg.message_id });
        return { handled: true, ok: false };
      }

      const result = this.processTransactionAction({
        txId: requestId,
        status: 'approved',
        adminNote: `trxid:${trxId}`,
      });

      if (result.status !== 200) {
        await this.replyToChat(chatId, `Approve failed: ${result.body?.error || 'unknown error'}`, {
          replyToMessageId: msg.message_id,
        });
        this.logAction('approve', false, `tx=${requestId} reason=${result.body?.error || 'failed'}`);
        return { handled: true, ok: false, result };
      }

      await this.replyToChat(chatId, `Approved deposit #${requestId} with trxid ${trxId}`, {
        replyToMessageId: msg.message_id,
      });
      this.logAction('approve', true, `tx=${requestId}`);
      return { handled: true, ok: true, result };
    }

    if (command === '/reject') {
      if (args.length < 1) {
        await this.replyToChat(chatId, 'Usage: /reject {request_id}', { replyToMessageId: msg.message_id });
        return { handled: true, ok: false };
      }

      const requestId = Number(args[0]);
      if (!Number.isInteger(requestId) || requestId <= 0) {
        await this.replyToChat(chatId, 'Invalid request_id', { replyToMessageId: msg.message_id });
        return { handled: true, ok: false };
      }

      const tx = this.stmts.getTransactionById.get(requestId);
      if (!tx) {
        await this.replyToChat(chatId, 'Request not found', { replyToMessageId: msg.message_id });
        return { handled: true, ok: false };
      }
      if (tx.type !== 'deposit') {
        await this.replyToChat(chatId, 'Request is not a deposit', { replyToMessageId: msg.message_id });
        return { handled: true, ok: false };
      }

      const result = this.processTransactionAction({
        txId: requestId,
        status: 'rejected',
        adminNote: 'Rejected via Telegram command',
      });

      if (result.status !== 200) {
        await this.replyToChat(chatId, `Reject failed: ${result.body?.error || 'unknown error'}`, {
          replyToMessageId: msg.message_id,
        });
        this.logAction('reject', false, `tx=${requestId} reason=${result.body?.error || 'failed'}`);
        return { handled: true, ok: false, result };
      }

      await this.replyToChat(chatId, `Rejected deposit #${requestId}`, { replyToMessageId: msg.message_id });
      this.logAction('reject', true, `tx=${requestId}`);
      return { handled: true, ok: true, result };
    }

    if (command === '/paid') {
      if (args.length < 1) {
        await this.replyToChat(chatId, 'Usage: /paid {request_id}', { replyToMessageId: msg.message_id });
        return { handled: true, ok: false };
      }

      const requestId = Number(args[0]);
      if (!Number.isInteger(requestId) || requestId <= 0) {
        await this.replyToChat(chatId, 'Invalid request_id', { replyToMessageId: msg.message_id });
        return { handled: true, ok: false };
      }

      const tx = this.stmts.getTransactionById.get(requestId);
      if (!tx) {
        await this.replyToChat(chatId, 'Request not found', { replyToMessageId: msg.message_id });
        return { handled: true, ok: false };
      }
      if (tx.type !== 'withdraw') {
        await this.replyToChat(chatId, 'Request is not a withdraw', { replyToMessageId: msg.message_id });
        return { handled: true, ok: false };
      }

      const result = this.processTransactionAction({
        txId: requestId,
        status: 'approved',
        adminNote: 'Marked paid via Telegram command',
      });

      if (result.status !== 200) {
        await this.replyToChat(chatId, `Paid failed: ${result.body?.error || 'unknown error'}`, {
          replyToMessageId: msg.message_id,
        });
        this.logAction('paid', false, `tx=${requestId} reason=${result.body?.error || 'failed'}`);
        return { handled: true, ok: false, result };
      }

      await this.replyToChat(chatId, `Marked withdraw #${requestId} as paid`, { replyToMessageId: msg.message_id });
      this.logAction('paid', true, `tx=${requestId}`);
      return { handled: true, ok: true, result };
    }

    return { handled: false, reason: 'unknown-command' };
  }

  async forwardSupportMessage({ sessionId, message, senderName }) {
    if (!this.supportBotToken || this.supportChatIds.length === 0) {
      this.logAction('forwardSupportMessage', false, 'support bot/chat not configured');
      return { forwarded: false };
    }

    const tgMsg = [
      '💬 <b>Live Support</b>',
      `👤 ${senderName || 'Guest'}`,
      `🔑 Session: <code>${sessionId}</code>`,
      '━━━━━━━━━━━━━━━',
      String(message || '').trim(),
      '━━━━━━━━━━━━━━━',
      '👆 <i>Reply this message to respond</i>',
    ].join('\n');

    const deliveries = await this.sendMessage(tgMsg, {
      botToken: this.supportBotToken,
      chatIds: this.supportChatIds,
    });

    const primaryDelivery = deliveries[0];
    if (primaryDelivery?.result?.message_id) {
      this.stmts.insertTgMsgMap.run(primaryDelivery.result.message_id, `session:${sessionId}`);
    }

    this.logAction('forwardSupportMessage', true, `session=${sessionId} deliveries=${deliveries.length}`);
    return { forwarded: true, deliveries };
  }

  async replyToUser({ targetChatId, text }) {
    const deliveries = await this.sendMessage(String(text || '').trim(), {
      botToken: this.supportBotToken,
      chatIds: [String(targetChatId)],
    });
    this.logAction('replyToUser', true, `chat=${targetChatId}`);
    return deliveries;
  }

  async handleSupportUpdate(update) {
    const msg = update?.message;
    if (!msg) return { handled: false, reason: 'no-message' };

    const chatId = String(msg.chat?.id || '');
    const senderId = String(msg.from?.id || '');
    const text = this.getMessageText(msg);
    if (!text) return { handled: false, reason: 'empty-message' };

    const isAdmin = this.isAdminChatId(chatId) || this.isAdminChatId(senderId);

    if (isAdmin && msg.reply_to_message?.message_id) {
      const replyToId = msg.reply_to_message.message_id;
      const mapped = this.stmts.getSessionByTgMsg.get(replyToId);
      if (!mapped) {
        this.logAction('handleSupportUpdate', false, `admin-reply: no tg_msg_map entry for msg_id=${replyToId}`);
        return { handled: false, reason: 'no-mapping' };
      }

      const sessionKey = String(mapped.session_id || '');
      this.logAction('handleSupportUpdate', true, `admin-reply: mapped msg_id=${replyToId} → ${sessionKey}`);

      if (sessionKey.startsWith('tguser:')) {
        const userChatId = sessionKey.slice('tguser:'.length);
        await this.replyToUser({ targetChatId: userChatId, text });
        return { handled: true, mode: 'tguser-reply' };
      }

      if (sessionKey.startsWith('session:')) {
        const sessionId = sessionKey.slice('session:'.length);
        if (this.onSupportSessionReply) {
          this.onSupportSessionReply({ sessionId, text });
          this.logAction('supportSessionReply', true, `session=${sessionId} text="${text.slice(0, 80)}"`);
        } else {
          this.logAction('supportSessionReply', false, `no onSupportSessionReply handler registered`);
        }
        return { handled: true, mode: 'session-reply' };
      }

      this.logAction('handleSupportUpdate', false, `admin-reply: unrecognized session key format: ${sessionKey}`);
      return { handled: false, reason: 'invalid-mapping' };
    }

    if (isAdmin) {
      return { handled: false, reason: 'admin-non-reply' };
    }

    // Telegram user support flow
    await this.replyToUser({
      targetChatId: chatId,
      text: 'Support will contact you soon',
    });

    const adminForward = [
      '💬 <b>Telegram Support</b>',
      `User ID: <code>${chatId}</code>`,
      `Name: ${msg.from?.first_name || 'Unknown'} ${msg.from?.last_name || ''}`.trim(),
      '━━━━━━━━━━━━━━━',
      text,
      '━━━━━━━━━━━━━━━',
      '👆 <i>Reply this message to respond to the user</i>',
    ].join('\n');

    const deliveries = await this.sendMessage(adminForward, {
      botToken: this.supportBotToken,
      chatIds: [...this.adminChatIds],
    });

    const primaryDelivery = deliveries[0];
    if (primaryDelivery?.result?.message_id) {
      this.stmts.insertTgMsgMap.run(primaryDelivery.result.message_id, `tguser:${chatId}`);
    }

    this.logAction('handleSupportUpdate', true, `from=${chatId} deliveries=${deliveries.length}`);
    return { handled: true, mode: 'user-forward' };
  }
}

module.exports = { TelegramService };
