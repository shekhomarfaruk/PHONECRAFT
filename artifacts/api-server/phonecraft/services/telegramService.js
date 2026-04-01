const DEFAULT_USD_RATE = 122.80;
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
    this.usdRate = DEFAULT_USD_RATE;
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

  async sendMessage(text, { botToken, chatIds, replyToMessageId, reply_markup } = {}) {
    if (!botToken || !Array.isArray(chatIds) || chatIds.length === 0) {
      this.logAction('sendMessage', false, `bot=${!!botToken} chatIds=${JSON.stringify(chatIds)}`);
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

        if (reply_markup) {
          payload.reply_markup = reply_markup;
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

  async sendPhotoToChats(base64Data, caption, { botToken, chatIds } = {}) {
    if (!botToken || !Array.isArray(chatIds) || chatIds.length === 0) return [];
    const url = `https://api.telegram.org/bot${botToken}/sendPhoto`;
    const deliveries = [];
    for (const chatId of chatIds) {
      try {
        const imgBuffer = Buffer.from(base64Data.replace(/^data:image\/\w+;base64,/, ''), 'base64');
        const blob = new Blob([imgBuffer], { type: 'image/png' });
        const form = new FormData();
        form.append('chat_id', chatId);
        form.append('caption', caption || '📸 Screenshot');
        form.append('parse_mode', 'HTML');
        form.append('photo', blob, 'screenshot.png');
        const response = await fetch(url, { method: 'POST', body: form });
        const data = await response.json().catch(() => ({}));
        if (response.ok && data.ok) deliveries.push(chatId);
      } catch (_) {}
    }
    return deliveries;
  }

  async sendDepositNotification({ userId, userName, userIdentifier, amount, requestId, paymentMethod, accountNumber, blockchain, token, txnHash, coinType, screenshot, timestamp }) {
    const isCrypto = String(paymentMethod || '').toUpperCase() === 'CRYPTO';
    const lines = [
      '📥 <b>নতুন Deposit Request</b>',
      '━━━━━━━━━━━━━━━━━━━',
      `👤 <b>User ID:</b> ${userId}`,
      `🙍 <b>নাম:</b> ${userName || ''}`,
      `📱 <b>Identifier:</b> <code>${userIdentifier || ''}</code>`,
      `💳 <b>Payment Method:</b> ${paymentMethod || ''}`,
      `💰 <b>Amount:</b> ৳${Number(amount).toLocaleString()} (~$${(Number(amount) / (this.usdRate || DEFAULT_USD_RATE)).toFixed(2)})`,
    ];
    if (isCrypto) {
      lines.push(`⛓ <b>Blockchain:</b> ${blockchain || ''}`);
      lines.push(`💎 <b>Token:</b> ${token ? token.toUpperCase() : ''}`);
      lines.push(`🔗 <b>TxnHash:</b> <code>${txnHash || accountNumber || ''}</code>`);
    } else {
      lines.push(`🔢 <b>TrxID / Account:</b> <code>${accountNumber || ''}</code>`);
    }
    lines.push(
      `🆔 <b>Request ID:</b> #${requestId}`,
      `🕐 <b>সময়:</b> ${timestamp}`,
      '━━━━━━━━━━━━━━━━━━━',
      '🔐 <i>Admin Panel থেকে approve/reject করুন।</i>',
    );
    const text = lines.join('\n');

    const deliveries = await this.sendMessage(text, {
      botToken: this.financeBotToken,
      chatIds: this.financeChatIds,
    });

    if (screenshot) {
      const screenshotCaption = `📸 Screenshot — Deposit #${requestId} | User: ${userName || userId}`;
      this.sendPhotoToChats(screenshot, screenshotCaption, {
        botToken: this.financeBotToken,
        chatIds: this.financeChatIds,
      }).catch(() => {});
    }

    this.logAction('sendDepositNotification', true, `requestId=${requestId} deliveries=${deliveries.length}`);
    return deliveries;
  }

  async sendWithdrawNotification({ userId, userName, userIdentifier, amount, paymentMethod, accountNumber, requestId, screenshot, timestamp }) {
    const lines = [
      '📤 <b>Withdraw Request</b>',
      '━━━━━━━━━━━━━━━━━━━',
      `👤 <b>User ID:</b> ${userId}`,
      `🙍 <b>নাম:</b> ${userName || ''}`,
      `📱 <b>Identifier:</b> <code>${userIdentifier || ''}</code>`,
      `💳 <b>Payment Method:</b> ${paymentMethod || ''}`,
      `💰 <b>Amount:</b> ৳${Number(amount).toLocaleString()} (~$${(Number(amount) / (this.usdRate || DEFAULT_USD_RATE)).toFixed(2)})`,
      `🔢 <b>Account:</b> <code>${accountNumber || ''}</code>`,
      `🆔 <b>Request ID:</b> #${requestId}`,
      `🕐 <b>সময়:</b> ${timestamp}`,
      '━━━━━━━━━━━━━━━━━━━',
      '🔐 <i>Admin Panel থেকে approve/reject করুন।</i>',
    ];
    const text = lines.join('\n');

    const deliveries = await this.sendMessage(text, {
      botToken: this.financeBotToken,
      chatIds: this.financeChatIds,
    });

    if (screenshot) {
      const screenshotCaption = `📸 Screenshot — Withdraw #${requestId} | User: ${userName || userId}`;
      this.sendPhotoToChats(screenshot, screenshotCaption, {
        botToken: this.financeBotToken,
        chatIds: this.financeChatIds,
      }).catch(() => {});
    }

    this.logAction('sendWithdrawNotification', true, `requestId=${requestId} deliveries=${deliveries.length}`);
    return deliveries;
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
    return { handled: false, reason: 'no-commands' };
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

    for (const delivery of deliveries) {
      if (delivery?.result?.message_id) {
        const deliveryChatId = delivery.result.chat?.id ?? 0;
        this.stmts.insertTgMsgMap.run(deliveryChatId, delivery.result.message_id, `session:${sessionId}`);
      }
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
      const mapped = this.stmts.getSessionByTgMsg.get(chatId, replyToId);
      if (!mapped) {
        this.logAction('handleSupportUpdate', false, `admin-reply: no tg_msg_map entry for chat_id=${chatId} msg_id=${replyToId}`);
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

    for (const delivery of deliveries) {
      if (delivery?.result?.message_id) {
        const deliveryChatId = delivery.result.chat?.id ?? 0;
        this.stmts.insertTgMsgMap.run(deliveryChatId, delivery.result.message_id, `tguser:${chatId}`);
      }
    }

    this.logAction('handleSupportUpdate', true, `from=${chatId} deliveries=${deliveries.length}`);
    return { handled: true, mode: 'user-forward' };
  }
}

module.exports = { TelegramService };
