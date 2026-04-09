import { describe, it, expect } from 'vitest';
import {
  generateTerminalLines,
  maskName,
  fmtTaka,
  randItem,
  randomActivity,
  PLANS,
  BRANDS,
  DEVICE_CONFIGS,
  AVATARS,
  RANDOM_NAMES,
  COUNTRIES,
} from '../data.jsx';

// ── generateTerminalLines ──────────────────────────────────────────────────────
describe('generateTerminalLines', () => {
  it('returns an array of strings', () => {
    const lines = generateTerminalLines('TestPhone', '8GB', '256GB');
    expect(Array.isArray(lines)).toBe(true);
    expect(lines.length).toBeGreaterThan(0);
    lines.forEach(l => expect(typeof l).toBe('string'));
  });

  it('contains the device name in a boot line', () => {
    const lines = generateTerminalLines('MyDevice', '6GB', '128GB');
    const combined = lines.join(' ');
    expect(combined).toContain('MyDevice');
  });

  it('contains the RAM spec in a memory line', () => {
    const lines = generateTerminalLines('DevX', '12GB', '512GB');
    const combined = lines.join(' ');
    expect(combined).toContain('12GB');
  });

  it('contains the ROM spec in a storage line', () => {
    const lines = generateTerminalLines('DevX', '4GB', '64GB');
    const combined = lines.join(' ');
    expect(combined).toContain('64GB');
  });

  it('has a manufacturing complete line', () => {
    const lines = generateTerminalLines('A', 'B', 'C');
    const last = lines[lines.length - 1];
    expect(last).toContain('Manufacturing complete');
  });
});

// ── maskName ───────────────────────────────────────────────────────────────────
describe('maskName', () => {
  it('masks each word preserving first letter', () => {
    expect(maskName('Alice')).toBe('A****');
    expect(maskName('Bob')).toBe('B**');
  });

  it('masks multi-word names', () => {
    expect(maskName('John Doe')).toBe('J*** D**');
  });

  it('handles a single-character name', () => {
    // max(1, 1-1=0) → 1 star
    expect(maskName('A')).toBe('A*');
  });

  it('preserves word count', () => {
    const result = maskName('First Middle Last');
    const parts = result.split(' ');
    expect(parts.length).toBe(3);
  });

  it('each masked part starts with the original first character', () => {
    const result = maskName('Rahim Bari');
    const [first, second] = result.split(' ');
    expect(first[0]).toBe('R');
    expect(second[0]).toBe('B');
  });
});

// ── fmtTaka ────────────────────────────────────────────────────────────────────
describe('fmtTaka', () => {
  it('formats 0 as ৳0', () => {
    expect(fmtTaka(0)).toBe('৳' + Number(0).toLocaleString());
  });

  it('formats positive integer', () => {
    expect(fmtTaka(1000)).toBe('৳' + Number(1000).toLocaleString());
  });

  it('handles string numeric input', () => {
    expect(fmtTaka('500')).toBe('৳' + Number(500).toLocaleString());
  });

  it('always starts with ৳', () => {
    expect(fmtTaka(9999)).toMatch(/^৳/);
  });
});

// ── randItem ───────────────────────────────────────────────────────────────────
describe('randItem', () => {
  it('returns an item from the array', () => {
    const arr = [1, 2, 3, 4, 5];
    const result = randItem(arr);
    expect(arr).toContain(result);
  });

  it('returns the only item from a single-element array', () => {
    expect(randItem(['only'])).toBe('only');
  });

  it('always returns an item within the array bounds', () => {
    const arr = ['a', 'b', 'c'];
    for (let i = 0; i < 50; i++) {
      expect(arr).toContain(randItem(arr));
    }
  });
});

// ── randomActivity ─────────────────────────────────────────────────────────────
describe('randomActivity', () => {
  it('returns an object with required fields', () => {
    const activity = randomActivity();
    expect(activity).toHaveProperty('id');
    expect(activity).toHaveProperty('type', 'sold');
    expect(activity).toHaveProperty('read', false);
    expect(activity).toHaveProperty('icon');
    expect(activity).toHaveProperty('text');
    expect(activity).toHaveProperty('time', 'Just now');
    expect(activity).toHaveProperty('itemId');
  });

  it('returns unique id each call', () => {
    const ids = new Set(Array.from({ length: 20 }, () => randomActivity().id));
    // Very unlikely to collide across 20 calls
    expect(ids.size).toBeGreaterThan(1);
  });

  it('text contains "bought"', () => {
    for (let i = 0; i < 10; i++) {
      expect(randomActivity().text).toContain('bought');
    }
  });

  it('itemId is between 1 and 4 inclusive', () => {
    for (let i = 0; i < 30; i++) {
      const { itemId } = randomActivity();
      expect(itemId).toBeGreaterThanOrEqual(1);
      expect(itemId).toBeLessThanOrEqual(4);
    }
  });

  it('icon is one of the known country flags', () => {
    const knownFlags = COUNTRIES.map(c => c.flag);
    for (let i = 0; i < 20; i++) {
      expect(knownFlags).toContain(randomActivity().icon);
    }
  });
});

// ── Static data integrity ──────────────────────────────────────────────────────
describe('PLANS', () => {
  it('has at least one plan', () => {
    expect(PLANS.length).toBeGreaterThan(0);
  });

  it('each plan has required fields', () => {
    PLANS.forEach(plan => {
      expect(plan).toHaveProperty('id');
      expect(plan).toHaveProperty('name');
      expect(plan).toHaveProperty('rate');
      expect(plan).toHaveProperty('perTask');
      expect(plan).toHaveProperty('daily');
      expect(plan).toHaveProperty('dailyEarn');
      expect(plan).toHaveProperty('taskTime');
      expect(plan).toHaveProperty('color');
    });
  });

  it('plan ids are unique', () => {
    const ids = PLANS.map(p => p.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('perTask is positive for all plans', () => {
    PLANS.forEach(p => expect(p.perTask).toBeGreaterThan(0));
  });

  it('daily limit is positive for all plans', () => {
    PLANS.forEach(p => expect(p.daily).toBeGreaterThan(0));
  });
});

describe('DEVICE_CONFIGS', () => {
  it('has rams, roms, and colors arrays', () => {
    expect(Array.isArray(DEVICE_CONFIGS.rams)).toBe(true);
    expect(Array.isArray(DEVICE_CONFIGS.roms)).toBe(true);
    expect(Array.isArray(DEVICE_CONFIGS.colors)).toBe(true);
  });

  it('all arrays are non-empty', () => {
    expect(DEVICE_CONFIGS.rams.length).toBeGreaterThan(0);
    expect(DEVICE_CONFIGS.roms.length).toBeGreaterThan(0);
    expect(DEVICE_CONFIGS.colors.length).toBeGreaterThan(0);
  });
});

describe('BRANDS', () => {
  it('is a non-empty array of strings', () => {
    expect(Array.isArray(BRANDS)).toBe(true);
    expect(BRANDS.length).toBeGreaterThan(0);
    BRANDS.forEach(b => expect(typeof b).toBe('string'));
  });
});

describe('AVATARS', () => {
  it('is a non-empty array', () => {
    expect(Array.isArray(AVATARS)).toBe(true);
    expect(AVATARS.length).toBeGreaterThan(0);
  });
});

describe('RANDOM_NAMES', () => {
  it('contains at least one name', () => {
    expect(RANDOM_NAMES.length).toBeGreaterThan(0);
  });

  it('all entries are non-empty strings', () => {
    RANDOM_NAMES.forEach(n => {
      expect(typeof n).toBe('string');
      expect(n.length).toBeGreaterThan(0);
    });
  });
});

describe('COUNTRIES', () => {
  it('contains at least one country', () => {
    expect(COUNTRIES.length).toBeGreaterThan(0);
  });

  it('each country has flag and name', () => {
    COUNTRIES.forEach(c => {
      expect(c).toHaveProperty('flag');
      expect(c).toHaveProperty('name');
      expect(typeof c.name).toBe('string');
    });
  });
});
