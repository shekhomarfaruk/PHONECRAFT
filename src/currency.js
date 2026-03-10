// ── Currency Utility ──────────────────────────────────────────────────────────
// 1 USD = 122.80 BDT
const USD_RATE = 122.80;

/**
 * convertCurrency(amount, lang, type?)
 *
 * @param {number} amount  - Amount in BDT (or already USD if type='soldNotification')
 * @param {string} lang    - 'bn' = Bangla → BDT ৳, 'en' = English → USD $
 * @param {string} [type]  - 'soldNotification' → always USD, capped at $10
 *
 * Rules:
 *  type='soldNotification'  → always "$X.XX" (amount is already in USD, cap at $10)
 *  lang='bn'                → "৳X,XXX"
 *  lang='en' (default)      → "$X.XX" (converted from BDT)
 */
export function convertCurrency(amount, lang, type) {
  const n = Number(amount) || 0;

  if (type === 'soldNotification') {
    return `$${Math.min(n, 10).toFixed(2)}`;
  }

  if (lang === 'bn') {
    return `৳${n.toLocaleString()}`;
  }

  // English → convert BDT to USD
  return `$${(n / USD_RATE).toFixed(2)}`;
}

/** Shorthand: format a BDT amount respecting current language */
export function fmt(amount, lang) {
  return convertCurrency(amount, lang);
}
