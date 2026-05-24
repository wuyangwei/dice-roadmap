import type { CurrentGameState, Role } from '@roadmap/shared';
import { config } from './config';

const TOKEN_KEYS: Record<'operator' | 'admin', string> = {
  operator: 'roadmap_token_operator',
  admin: 'roadmap_token_admin',
};

export function getToken(role: 'operator' | 'admin' = 'operator') {
  return localStorage.getItem(TOKEN_KEYS[role]);
}

export function setToken(token: string, role: 'operator' | 'admin' = 'operator') {
  localStorage.setItem(TOKEN_KEYS[role], token);
}

export function clearToken(role: 'operator' | 'admin' = 'operator') {
  localStorage.removeItem(TOKEN_KEYS[role]);
}

export async function api<T>(path: string, options: RequestInit = {}, tokenRole: 'operator' | 'admin' = 'operator'): Promise<T> {
  const token = getToken(tokenRole);
  const url = config.apiBase ? `${config.apiBase}${path}` : path;
  const response = await fetch(url, {
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
  // login 请求本身不需要携带 token，用默认值即可
  });
}

export function me(tokenRole: 'operator' | 'admin' = 'operator') {
  return api<{ role: Role }>('/api/auth/me', {}, tokenRole);
}

export function currentGame() {
  return api<CurrentGameState>('/api/current-game');
}

export function pauseGame(id: number) {
  return api(`/api/games/${id}/pause`, { method: 'POST' }, 'admin');
}

export function resumeGame(id: number) {
  return api(`/api/games/${id}/resume`, { method: 'POST' }, 'admin');
}

export function endGameById(id: number) {
  return api(`/api/games/${id}/end`, { method: 'POST' }, 'admin');
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
