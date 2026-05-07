import type { CurrentGameState, Role } from '@roadmap/shared';

const TOKEN_KEY = 'roadmap_session_token';

export function getToken() {
  return localStorage.getItem(TOKEN_KEY);
}

export function setToken(token: string) {
  localStorage.setItem(TOKEN_KEY, token);
}

export function clearToken() {
  localStorage.removeItem(TOKEN_KEY);
}

export async function api<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = getToken();
  const response = await fetch(path, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers
    }
  });

  if (!response.ok) {
    const body = await response.json().catch(() => ({ message: '请求失败' }));
    throw new Error(body.message ?? '请求失败');
  }

  return response.json() as Promise<T>;
}

export function login(pin: string) {
  const deviceId = getDeviceId();
  return api<{ token: string; role: Role; expiresAt: string }>('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify({ pin, deviceId })
  });
}

export function me() {
  return api<{ role: Role }>('/api/auth/me');
}

export function currentGame() {
  return api<CurrentGameState>('/api/current-game');
}

function generateUUID(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  // 兼容非安全上下文（HTTP + IP 访问）
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

export function getDeviceId() {
  let id = localStorage.getItem('roadmap_device_id');
  if (!id) {
    id = generateUUID();
    localStorage.setItem('roadmap_device_id', id);
  }
  return id;
}
