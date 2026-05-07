import { useCallback, useEffect, useState } from 'react';
import type { CurrentGameState, Role } from '@roadmap/shared';
import { clearToken, currentGame, getToken, me } from './api.js';
import { connectSocket } from './socket.js';

export function useSession(tokenRole: 'operator' | 'admin' = 'operator') {
  const [role, setRole] = useState<Role | null>(null);
  const [checking, setChecking] = useState(true);

  const refresh = useCallback(async () => {
    if (!getToken(tokenRole)) {
      setChecking(false);
      return;
    }
    try {
      const data = await me(tokenRole);
      setRole(data.role);
    } catch {
      clearToken(tokenRole);
      setRole(null);
    } finally {
      setChecking(false);
    }
  }, [tokenRole]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  return { role, setRole, checking, refresh };
}

export function useCurrentGame(enabled: boolean) {
  const [state, setState] = useState<CurrentGameState | null>(null);
  const [connected, setConnected] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    if (!enabled) return;
    try {
      setState(await currentGame());
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : '加载失败');
    }
  }, [enabled]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  useEffect(() => {
    if (!enabled) return;
    return connectSocket(refresh, setConnected);
  }, [enabled, refresh]);

  return { state, connected, error, refresh };
}
