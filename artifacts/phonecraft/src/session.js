const SESSION_KEY = 'pc_session';

export function getStoredSession() {
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function saveStoredSession(user) {
  if (!user?.id || !user?.authToken) return;
  localStorage.setItem(SESSION_KEY, JSON.stringify(user));
}

export function clearStoredSession() {
  localStorage.removeItem(SESSION_KEY);
}

export function getAuthToken() {
  return getStoredSession()?.authToken || '';
}

export function authHeaders() {
  return { 'Authorization': `Bearer ${getAuthToken()}` };
}

export function authFetch(url, options = {}) {
  return fetch(url, {
    ...options,
    headers: { ...authHeaders(), ...options.headers },
  });
}

export function mapApiUser(apiUser, plan, authToken, previousUser = null) {
  if (!apiUser) return previousUser;

  return {
    id: apiUser.id,
    name: apiUser.name,
    identifier: apiUser.identifier,
    plan: apiUser.plan_id || previousUser?.plan || plan?.id || '',
    balance: typeof apiUser.balance === 'number' ? apiUser.balance : (previousUser?.balance || 0),
    dailyDone: typeof apiUser.daily_done === 'number' ? apiUser.daily_done : (previousUser?.dailyDone || 0),
    dailyLimit: plan?.daily || previousUser?.dailyLimit || 0,
    referCode: apiUser.refer_code || previousUser?.referCode || '',
    devices: previousUser?.devices || [],
    avatar: apiUser.avatar || previousUser?.avatar || 'A',
    avatarImg: apiUser.avatar_img || previousUser?.avatarImg || null,
    teamMembers: previousUser?.teamMembers || [],
    isAdmin: typeof apiUser.is_admin === 'number' ? !!apiUser.is_admin : !!previousUser?.isAdmin,
    isMainAdmin: typeof apiUser.is_main_admin === 'boolean' ? apiUser.is_main_admin : !!previousUser?.isMainAdmin,
    authToken: authToken || previousUser?.authToken || '',
  };
}