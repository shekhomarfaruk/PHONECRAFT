// ── Currency Utility ──────────────────────────────────────────────────────────
// Base currency: BDT (stored in backend)
// Display: Bangla mode → BDT (৳) | English mode → USD ($)

export const DEFAULT_USD_RATE = 122.80;

// Module-level live rate cache (shared across all components)
let _liveRate = DEFAULT_USD_RATE;
let _cacheTs  = 0;
const CACHE_MS = 7 * 60 * 1000; // 7 minutes

/** Returns the current cached rate (synchronous) */
export function getLiveRate() { return _liveRate; }

/**
 * Fetch the live USD→BDT rate from open.er-api.com.
 * Caches for 7 minutes. Returns the new rate.
 * Call once in App.jsx; all convertCurrency calls benefit automatically.
 */
export async function fetchLiveRate() {
  if (Date.now() - _cacheTs < CACHE_MS) return _liveRate;
  try {
    const res  = await fetch('https://open.er-api.com/v6/latest/USD');
    const data = await res.json();
    if (data?.rates?.BDT) {
      _liveRate = Number(data.rates.BDT);
      _cacheTs  = Date.now();
    }
  } catch (_) {}
  return _liveRate;
}

/**
 * convertCurrency(amount, lang, rateOrType?)
 *
 * @param {number} amount      - Amount in BDT
 * @param {string} lang        - 'bn' → BDT ৳  |  'en' → USD $
 * @param {number|string} [rateOrType]
 *   - number  → explicit BDT/USD rate to use
 *   - 'soldNotification' → always USD, cap at $10
 *   - omitted → use module-level _liveRate (auto-updated by fetchLiveRate)
 */
export function convertCurrency(amount, lang, rateOrType) {
  const n = Number(amount) || 0;

  if (rateOrType === 'soldNotification') {
    return `$${Math.min(n, 10).toFixed(2)}`;
  }

  if (lang === 'bn') {
    return `৳${n.toLocaleString()}`;
  }

  // English → convert BDT to USD
  const rate = typeof rateOrType === 'number' && rateOrType > 0 ? rateOrType : _liveRate;
  return `$${(n / rate).toFixed(2)}`;
}

/** Format a date/time string respecting locale */
export function formatDateTime(value, lang, options) {
  if (!value) return '';
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return String(value);
  return date.toLocaleString(lang === 'bn' ? 'bn-BD' : 'en-GB', options);
}

/**
 * convertCurrencyText(text, lang)
 * Converts ৳ amounts embedded in notification/log text to the display currency.
 * Handles bilingual JSON like {"en":"...","bn":"..."}.
 */
export function convertCurrencyText(text, lang) {
  if (!text) return '';
  let raw = String(text);

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
