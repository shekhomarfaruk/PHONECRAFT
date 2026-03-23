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

export function formatDateTime(value, lang, options) {
  if (!value) return '';
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return String(value);

  return date.toLocaleString(lang === 'bn' ? 'bn-BD' : 'en-GB', options);
}

export function convertCurrencyText(text, lang) {
  if (!text) return '';

  let raw = String(text);
  // Handle bilingual JSON stored by backend: { en: "...", bn: "..." }
  if (raw.startsWith('{') && raw.includes('"en"')) {
    try {
      const parsed = JSON.parse(raw);
      raw = (lang === 'bn' ? parsed.bn : parsed.en) || parsed.en || parsed.bn || raw;
    } catch (_) {}
  }

  return raw.replace(/([+-]?)৳\s*([\d,]+(?:\.\d+)?)/g, (_match, sign, amount) => {
    const numericAmount = Number(String(amount).replace(/,/g, ''));
    const converted = convertCurrency(numericAmount, lang);
    return `${sign || ''}${converted}`;
  });
}

/** Shorthand: format a BDT amount respecting current language */
export function fmt(amount, lang) {
  return convertCurrency(amount, lang);
}
