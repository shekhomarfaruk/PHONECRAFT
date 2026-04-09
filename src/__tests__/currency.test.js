import { describe, it, expect } from 'vitest';
import { convertCurrency, formatDateTime, convertCurrencyText, fmt } from '../currency.js';

const USD_RATE = 122.80;

describe('convertCurrency', () => {
  it('returns USD with soldNotification type regardless of lang', () => {
    expect(convertCurrency(5, 'bn', 'soldNotification')).toBe('$5.00');
    expect(convertCurrency(5, 'en', 'soldNotification')).toBe('$5.00');
  });

  it('caps soldNotification at $10', () => {
    expect(convertCurrency(15, 'en', 'soldNotification')).toBe('$10.00');
    expect(convertCurrency(10, 'en', 'soldNotification')).toBe('$10.00');
    expect(convertCurrency(9.99, 'en', 'soldNotification')).toBe('$9.99');
  });

  it('returns BDT format for lang=bn', () => {
    expect(convertCurrency(1000, 'bn')).toBe('৳' + Number(1000).toLocaleString());
    expect(convertCurrency(0, 'bn')).toBe('৳' + Number(0).toLocaleString());
  });

  it('converts BDT to USD for lang=en', () => {
    const usd = (1000 / USD_RATE).toFixed(2);
    expect(convertCurrency(1000, 'en')).toBe(`$${usd}`);
  });

  it('converts BDT to USD when no lang provided (defaults to USD)', () => {
    const usd = (500 / USD_RATE).toFixed(2);
    expect(convertCurrency(500)).toBe(`$${usd}`);
  });

  it('handles non-numeric amount gracefully (defaults to 0)', () => {
    expect(convertCurrency(null, 'en')).toBe('$0.00');
    expect(convertCurrency(undefined, 'en')).toBe('$0.00');
    expect(convertCurrency('abc', 'en')).toBe('$0.00');
  });

  it('handles string numeric amount', () => {
    const usd = (1228 / USD_RATE).toFixed(2);
    expect(convertCurrency('1228', 'en')).toBe(`$${usd}`);
  });
});

describe('formatDateTime', () => {
  it('returns empty string for falsy values', () => {
    expect(formatDateTime(null)).toBe('');
    expect(formatDateTime(undefined)).toBe('');
    expect(formatDateTime('')).toBe('');
    expect(formatDateTime(0)).toBe('');
  });

  it('returns the original value as string for invalid date strings', () => {
    expect(formatDateTime('not-a-date', 'en')).toBe('not-a-date');
  });

  it('formats a Date object without throwing', () => {
    const date = new Date('2024-01-15T10:30:00Z');
    const result = formatDateTime(date, 'en');
    expect(typeof result).toBe('string');
    expect(result.length).toBeGreaterThan(0);
  });

  it('formats an ISO string without throwing', () => {
    const result = formatDateTime('2024-06-01T08:00:00Z', 'en');
    expect(typeof result).toBe('string');
    expect(result.length).toBeGreaterThan(0);
  });

  it('uses bn-BD locale when lang=bn', () => {
    const date = new Date('2024-01-15T10:30:00Z');
    const en = formatDateTime(date, 'en');
    const bn = formatDateTime(date, 'bn');
    // Both should be non-empty strings; locale output differs
    expect(typeof bn).toBe('string');
    expect(bn.length).toBeGreaterThan(0);
    // They may differ (locale-dependent), but neither should throw
    expect(en).not.toBe('');
  });

  it('passes extra options to toLocaleString', () => {
    const date = new Date('2024-01-15T10:30:00Z');
    const result = formatDateTime(date, 'en', { year: 'numeric' });
    expect(typeof result).toBe('string');
    expect(result.length).toBeGreaterThan(0);
  });
});

describe('convertCurrencyText', () => {
  it('returns empty string for falsy input', () => {
    expect(convertCurrencyText(null, 'en')).toBe('');
    expect(convertCurrencyText(undefined, 'en')).toBe('');
    expect(convertCurrencyText('', 'en')).toBe('');
  });

  it('replaces ৳ amounts in text with USD for lang=en', () => {
    const result = convertCurrencyText('You earned ৳1228 today', 'en');
    const expected = `$${(1228 / USD_RATE).toFixed(2)}`;
    expect(result).toContain(expected);
    expect(result).toContain('You earned');
    expect(result).toContain('today');
  });

  it('replaces ৳ amounts in text with BDT for lang=bn', () => {
    const result = convertCurrencyText('You earned ৳1000 today', 'bn');
    expect(result).toContain('৳' + Number(1000).toLocaleString());
  });

  it('preserves sign prefix (+ or -) when present', () => {
    const resultPlus = convertCurrencyText('+৳500 bonus', 'en');
    expect(resultPlus).toMatch(/^\+\$/);

    const resultMinus = convertCurrencyText('-৳200 fee', 'en');
    expect(resultMinus).toMatch(/^-\$/);
  });

  it('replaces multiple ৳ amounts in the same string', () => {
    const result = convertCurrencyText('Earned ৳500 and spent ৳200', 'en');
    const usd500 = `$${(500 / USD_RATE).toFixed(2)}`;
    const usd200 = `$${(200 / USD_RATE).toFixed(2)}`;
    expect(result).toContain(usd500);
    expect(result).toContain(usd200);
  });

  it('leaves text without ৳ symbols unchanged', () => {
    expect(convertCurrencyText('No currency here', 'en')).toBe('No currency here');
  });

  it('handles decimal amounts in ৳', () => {
    const result = convertCurrencyText('৳1228.50 earned', 'en');
    const expected = `$${(1228.5 / USD_RATE).toFixed(2)}`;
    expect(result).toContain(expected);
  });
});

describe('fmt', () => {
  it('is an alias for convertCurrency without type', () => {
    expect(fmt(1000, 'en')).toBe(convertCurrency(1000, 'en'));
    expect(fmt(500, 'bn')).toBe(convertCurrency(500, 'bn'));
  });

  it('returns USD by default for unknown lang', () => {
    const usd = (1000 / USD_RATE).toFixed(2);
    expect(fmt(1000)).toBe(`$${usd}`);
  });
});
