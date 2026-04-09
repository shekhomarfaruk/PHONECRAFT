import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import {
  getStoredSession,
  saveStoredSession,
  clearStoredSession,
  getAuthToken,
  mapApiUser,
} from '../session.js';

// ── localStorage mock ──────────────────────────────────────────────────────────
const store = {};

const localStorageMock = {
  getItem:    vi.fn((k)    => store[k] ?? null),
  setItem:    vi.fn((k, v) => { store[k] = v; }),
  removeItem: vi.fn((k)    => { delete store[k]; }),
};

beforeEach(() => {
  Object.defineProperty(global, 'localStorage', {
    value: localStorageMock,
    writable: true,
  });
  vi.clearAllMocks();
  // clear store
  Object.keys(store).forEach(k => delete store[k]);
});

// ── getStoredSession ───────────────────────────────────────────────────────────
describe('getStoredSession', () => {
  it('returns null when nothing is stored', () => {
    expect(getStoredSession()).toBeNull();
  });

  it('returns the parsed session when valid JSON is stored', () => {
    const session = { id: 1, authToken: 'tok123' };
    store['pc_session'] = JSON.stringify(session);
    expect(getStoredSession()).toEqual(session);
  });

  it('returns null when stored value is invalid JSON', () => {
    store['pc_session'] = 'not-valid-json{{{';
    expect(getStoredSession()).toBeNull();
  });
});

// ── saveStoredSession ──────────────────────────────────────────────────────────
describe('saveStoredSession', () => {
  it('persists a valid user object', () => {
    const user = { id: 42, authToken: 'abc' };
    saveStoredSession(user);
    expect(localStorageMock.setItem).toHaveBeenCalledWith('pc_session', JSON.stringify(user));
  });

  it('does nothing when user is null', () => {
    saveStoredSession(null);
    expect(localStorageMock.setItem).not.toHaveBeenCalled();
  });

  it('does nothing when user has no id', () => {
    saveStoredSession({ authToken: 'tok' });
    expect(localStorageMock.setItem).not.toHaveBeenCalled();
  });

  it('does nothing when user has no authToken', () => {
    saveStoredSession({ id: 1 });
    expect(localStorageMock.setItem).not.toHaveBeenCalled();
  });
});

// ── clearStoredSession ─────────────────────────────────────────────────────────
describe('clearStoredSession', () => {
  it('removes the session key', () => {
    store['pc_session'] = 'data';
    clearStoredSession();
    expect(localStorageMock.removeItem).toHaveBeenCalledWith('pc_session');
  });
});

// ── getAuthToken ───────────────────────────────────────────────────────────────
describe('getAuthToken', () => {
  it('returns empty string when no session is stored', () => {
    expect(getAuthToken()).toBe('');
  });

  it('returns the authToken from the stored session', () => {
    store['pc_session'] = JSON.stringify({ id: 1, authToken: 'mytoken' });
    expect(getAuthToken()).toBe('mytoken');
  });

  it('returns empty string when session has no authToken', () => {
    store['pc_session'] = JSON.stringify({ id: 1 });
    expect(getAuthToken()).toBe('');
  });
});

// ── mapApiUser ─────────────────────────────────────────────────────────────────
describe('mapApiUser', () => {
  const plan = { id: 'basic', daily: 10 };
  const token = 'token-abc';

  const apiUser = {
    id: 7,
    name: 'Alice',
    identifier: 'alice01',
    plan_id: 'premium',
    balance: 500,
    daily_done: 3,
    refer_code: 'REF007',
    avatar: 'B',
    avatar_img: null,
    is_admin: 0,
    is_main_admin: false,
  };

  it('returns previousUser when apiUser is null/undefined', () => {
    const prev = { id: 5, name: 'Bob' };
    expect(mapApiUser(null, plan, token, prev)).toBe(prev);
    expect(mapApiUser(undefined, plan, token, prev)).toBe(prev);
  });

  it('returns null when apiUser is null and no previousUser', () => {
    expect(mapApiUser(null, plan, token)).toBeNull();
  });

  it('maps all basic fields correctly', () => {
    const result = mapApiUser(apiUser, plan, token);
    expect(result.id).toBe(7);
    expect(result.name).toBe('Alice');
    expect(result.identifier).toBe('alice01');
    expect(result.authToken).toBe(token);
    expect(result.referCode).toBe('REF007');
    expect(result.avatar).toBe('B');
  });

  it('uses plan_id from apiUser over plan.id', () => {
    const result = mapApiUser(apiUser, plan, token);
    expect(result.plan).toBe('premium');
  });

  it('falls back to plan.id when plan_id is missing', () => {
    const user = { ...apiUser, plan_id: undefined };
    const result = mapApiUser(user, plan, token);
    expect(result.plan).toBe('basic');
  });

  it('uses daily limit from plan', () => {
    const result = mapApiUser(apiUser, plan, token);
    expect(result.dailyLimit).toBe(10);
  });

  it('maps balance and dailyDone correctly', () => {
    const result = mapApiUser(apiUser, plan, token);
    expect(result.balance).toBe(500);
    expect(result.dailyDone).toBe(3);
  });

  it('defaults balance to 0 when not a number', () => {
    const user = { ...apiUser, balance: 'invalid' };
    const result = mapApiUser(user, plan, token);
    expect(result.balance).toBe(0);
  });

  it('defaults dailyDone to 0 when not a number', () => {
    const user = { ...apiUser, daily_done: 'invalid' };
    const result = mapApiUser(user, plan, token);
    expect(result.dailyDone).toBe(0);
  });

  it('maps isAdmin from numeric 0/1', () => {
    expect(mapApiUser({ ...apiUser, is_admin: 0 }, plan, token).isAdmin).toBe(false);
    expect(mapApiUser({ ...apiUser, is_admin: 1 }, plan, token).isAdmin).toBe(true);
  });

  it('maps isMainAdmin from boolean', () => {
    expect(mapApiUser({ ...apiUser, is_main_admin: false }, plan, token).isMainAdmin).toBe(false);
    expect(mapApiUser({ ...apiUser, is_main_admin: true }, plan, token).isMainAdmin).toBe(true);
  });

  it('inherits devices and teamMembers from previousUser', () => {
    const prev = { devices: ['dev1'], teamMembers: ['member1'] };
    const result = mapApiUser(apiUser, plan, token, prev);
    expect(result.devices).toEqual(['dev1']);
    expect(result.teamMembers).toEqual(['member1']);
  });

  it('defaults devices to empty array when no previousUser', () => {
    const result = mapApiUser(apiUser, plan, token);
    expect(result.devices).toEqual([]);
    expect(result.teamMembers).toEqual([]);
  });

  it('uses authToken from previousUser when token arg is empty', () => {
    const prev = { authToken: 'prev-token' };
    const result = mapApiUser(apiUser, plan, '', prev);
    expect(result.authToken).toBe('prev-token');
  });

  it('falls back to avatar from previousUser when apiUser.avatar is falsy', () => {
    const prev = { avatar: 'Z' };
    const user = { ...apiUser, avatar: '' };
    const result = mapApiUser(user, plan, token, prev);
    expect(result.avatar).toBe('Z');
  });

  it('defaults avatar to A when nothing is available', () => {
    const user = { ...apiUser, avatar: '' };
    const result = mapApiUser(user, plan, token);
    expect(result.avatar).toBe('A');
  });
});
