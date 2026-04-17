/**
 * Crypto Verification Service
 * Verifies USDT deposits on TRC20 (Tron), ERC20 (Ethereum), and BEP20 (BSC)
 * using public blockchain explorer APIs — no API keys required for basic lookups.
 *
 * Each verifier confirms:
 *  - Transaction hash exists and is confirmed
 *  - Token is USDT
 *  - Recipient matches platform wallet
 *  - Amount matches within 1% tolerance
 */

const TRON_USDT_CONTRACT = 'TR7NHqjeKQxGTCi8q8ZY4pL8otSzgjLj6t';
const ETH_USDT_CONTRACT  = '0xdac17f958d2ee523a2206206994597c13d831ec7';
const BSC_USDT_CONTRACT  = '0x55d398326f99059ff775485246999027b3197955';

const FETCH_TIMEOUT_MS = 12000;

function fetchWithTimeout(url, opts = {}) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);
  return fetch(url, { ...opts, signal: controller.signal }).finally(() => clearTimeout(timer));
}

function normalizeAddr(addr) {
  return String(addr || '').trim().toLowerCase();
}

/**
 * Verify a TRC20 USDT deposit using Tronscan public API.
 * @param {string} txHash - Transaction hash (64-char hex)
 * @param {number} expectedAmountUsdt - Expected USDT amount (decimal, e.g. 50.00)
 * @param {string} walletAddress - Platform's TRC20 wallet address (T...)
 * @returns {{ ok: boolean, error?: string, data?: object }}
 */
async function verifyTRC20(txHash, expectedAmountUsdt, walletAddress) {
  try {
    if (!txHash || !/^[0-9a-f]{64}$/i.test(txHash.trim())) {
      return { ok: false, error: 'Invalid TRC20 transaction hash format' };
    }
    if (!walletAddress || !walletAddress.trim().startsWith('T')) {
      return { ok: false, error: 'Platform TRC20 wallet not configured' };
    }

    const url = `https://apilist.tronscan.org/api/transaction-info?hash=${txHash.trim()}`;
    const resp = await fetchWithTimeout(url);
    if (!resp.ok) return { ok: false, error: `Tronscan API error: ${resp.status}` };
    const data = await resp.json();

    if (!data || !data.hash) {
      return { ok: false, error: 'Transaction not found on Tron network' };
    }
    if (!data.confirmed) {
      return { ok: false, error: 'Transaction not yet confirmed on Tron network' };
    }

    const trc20Transfers = data.trc20TransferInfo || [];
    const usdtTransfer = trc20Transfers.find(t =>
      normalizeAddr(t.contract_address) === normalizeAddr(TRON_USDT_CONTRACT)
    );

    if (!usdtTransfer) {
      return { ok: false, error: 'No USDT (TRC20) transfer found in this transaction' };
    }

    const toAddr = normalizeAddr(usdtTransfer.to_address || usdtTransfer.to);
    if (toAddr !== normalizeAddr(walletAddress)) {
      return { ok: false, error: `USDT was not sent to platform wallet (received: ${usdtTransfer.to_address || usdtTransfer.to})` };
    }

    const decimals = 6;
    const receivedUsdt = Number(usdtTransfer.amount_str || usdtTransfer.amount || 0) / Math.pow(10, decimals);
    const tolerance = expectedAmountUsdt * 0.01;
    if (Math.abs(receivedUsdt - expectedAmountUsdt) > tolerance) {
      return { ok: false, error: `Amount mismatch: expected ${expectedAmountUsdt} USDT, got ${receivedUsdt.toFixed(6)} USDT` };
    }

    return { ok: true, data: { receivedUsdt, txHash, network: 'TRC20' } };
  } catch (err) {
    if (err.name === 'AbortError') return { ok: false, error: 'Tronscan API timeout — please try again' };
    return { ok: false, error: `Tronscan verification failed: ${err.message}` };
  }
}

/**
 * Verify an ERC20 USDT deposit using Etherscan public API.
 * @param {string} txHash - Transaction hash (0x...)
 * @param {number} expectedAmountUsdt - Expected USDT amount (decimal)
 * @param {string} walletAddress - Platform's ERC20 wallet address (0x...)
 * @returns {{ ok: boolean, error?: string, data?: object }}
 */
async function verifyERC20(txHash, expectedAmountUsdt, walletAddress) {
  try {
    const hash = String(txHash || '').trim();
    if (!hash || !/^0x[0-9a-f]{64}$/i.test(hash)) {
      return { ok: false, error: 'Invalid ERC20 transaction hash format (must start with 0x)' };
    }
    if (!walletAddress || !walletAddress.trim().startsWith('0x')) {
      return { ok: false, error: 'Platform ERC20 wallet not configured' };
    }

    const url = `https://api.etherscan.io/api?module=proxy&action=eth_getTransactionReceipt&txhash=${hash}`;
    const resp = await fetchWithTimeout(url);
    if (!resp.ok) return { ok: false, error: `Etherscan API error: ${resp.status}` };
    const data = await resp.json();

    const receipt = data?.result;
    if (!receipt) {
      return { ok: false, error: 'Transaction not found on Ethereum network' };
    }
    if (receipt.status !== '0x1') {
      return { ok: false, error: 'ERC20 transaction failed on-chain' };
    }

    const TRANSFER_TOPIC = '0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef';
    const usdtLog = (receipt.logs || []).find(log =>
      normalizeAddr(log.address) === normalizeAddr(ETH_USDT_CONTRACT) &&
      log.topics && log.topics[0] === TRANSFER_TOPIC &&
      log.topics.length >= 3
    );

    if (!usdtLog) {
      return { ok: false, error: 'No USDT (ERC20) transfer found in this transaction' };
    }

    const toTopic = usdtLog.topics[2];
    const toAddr = '0x' + toTopic.slice(-40);
    if (normalizeAddr(toAddr) !== normalizeAddr(walletAddress)) {
      return { ok: false, error: `USDT was not sent to platform wallet (received: ${toAddr})` };
    }

    const amountHex = usdtLog.data;
    const receivedRaw = parseInt(amountHex, 16);
    const decimals = 6;
    const receivedUsdt = receivedRaw / Math.pow(10, decimals);
    const tolerance = expectedAmountUsdt * 0.01;
    if (Math.abs(receivedUsdt - expectedAmountUsdt) > tolerance) {
      return { ok: false, error: `Amount mismatch: expected ${expectedAmountUsdt} USDT, got ${receivedUsdt.toFixed(6)} USDT` };
    }

    return { ok: true, data: { receivedUsdt, txHash: hash, network: 'ERC20' } };
  } catch (err) {
    if (err.name === 'AbortError') return { ok: false, error: 'Etherscan API timeout — please try again' };
    return { ok: false, error: `Etherscan verification failed: ${err.message}` };
  }
}

/**
 * Verify a BEP20 USDT deposit using BSCScan public API.
 * @param {string} txHash - Transaction hash (0x...)
 * @param {number} expectedAmountUsdt - Expected USDT amount (decimal)
 * @param {string} walletAddress - Platform's BEP20 wallet address (0x...)
 * @returns {{ ok: boolean, error?: string, data?: object }}
 */
async function verifyBEP20(txHash, expectedAmountUsdt, walletAddress) {
  try {
    const hash = String(txHash || '').trim();
    if (!hash || !/^0x[0-9a-f]{64}$/i.test(hash)) {
      return { ok: false, error: 'Invalid BEP20 transaction hash format (must start with 0x)' };
    }
    if (!walletAddress || !walletAddress.trim().startsWith('0x')) {
      return { ok: false, error: 'Platform BEP20 wallet not configured' };
    }

    const url = `https://api.bscscan.com/api?module=proxy&action=eth_getTransactionReceipt&txhash=${hash}`;
    const resp = await fetchWithTimeout(url);
    if (!resp.ok) return { ok: false, error: `BSCScan API error: ${resp.status}` };
    const data = await resp.json();

    const receipt = data?.result;
    if (!receipt) {
      return { ok: false, error: 'Transaction not found on BSC network' };
    }
    if (receipt.status !== '0x1') {
      return { ok: false, error: 'BEP20 transaction failed on-chain' };
    }

    const TRANSFER_TOPIC = '0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef';
    const usdtLog = (receipt.logs || []).find(log =>
      normalizeAddr(log.address) === normalizeAddr(BSC_USDT_CONTRACT) &&
      log.topics && log.topics[0] === TRANSFER_TOPIC &&
      log.topics.length >= 3
    );

    if (!usdtLog) {
      return { ok: false, error: 'No USDT (BEP20) transfer found in this transaction' };
    }

    const toTopic = usdtLog.topics[2];
    const toAddr = '0x' + toTopic.slice(-40);
    if (normalizeAddr(toAddr) !== normalizeAddr(walletAddress)) {
      return { ok: false, error: `USDT was not sent to platform wallet (received: ${toAddr})` };
    }

    const amountHex = usdtLog.data;
    const receivedRaw = parseInt(amountHex, 16);
    const decimals = 18;
    const receivedUsdt = receivedRaw / Math.pow(10, decimals);
    const tolerance = expectedAmountUsdt * 0.01;
    if (Math.abs(receivedUsdt - expectedAmountUsdt) > tolerance) {
      return { ok: false, error: `Amount mismatch: expected ${expectedAmountUsdt} USDT, got ${receivedUsdt.toFixed(6)} USDT` };
    }

    return { ok: true, data: { receivedUsdt, txHash: hash, network: 'BEP20' } };
  } catch (err) {
    if (err.name === 'AbortError') return { ok: false, error: 'BSCScan API timeout — please try again' };
    return { ok: false, error: `BSCScan verification failed: ${err.message}` };
  }
}

/**
 * Route to the correct verifier based on blockchain name.
 * @param {string} blockchain - 'trc20' | 'erc20' | 'bep20'
 * @param {string} txHash
 * @param {number} expectedAmountUsdt
 * @param {string} walletAddress
 * @returns {{ ok: boolean, error?: string, data?: object }}
 */
async function verifyCryptoDeposit(blockchain, txHash, expectedAmountUsdt, walletAddress) {
  switch (String(blockchain || '').toLowerCase()) {
    case 'trc20':
      return verifyTRC20(txHash, expectedAmountUsdt, walletAddress);
    case 'erc20':
      return verifyERC20(txHash, expectedAmountUsdt, walletAddress);
    case 'bep20':
      return verifyBEP20(txHash, expectedAmountUsdt, walletAddress);
    default:
      return { ok: false, error: `Unsupported blockchain for auto-verification: ${blockchain}` };
  }
}

module.exports = { verifyCryptoDeposit, verifyTRC20, verifyERC20, verifyBEP20 };
