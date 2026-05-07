import crypto from 'node:crypto';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import type { NextFunction, Request, Response } from 'express';
import type { Role } from '@roadmap/shared';
import { db } from './db.js';
import { config } from './config.js';
import { HttpError } from './errors.js';
import { nowIsoSeconds } from './time.js';

type JwtPayload = { sid: number; token: string; role: Role };

declare global {
  namespace Express {
    interface Request {
      user?: { sessionId: number; role: Role };
    }
  }
}

export async function loginWithPin(pin: string, deviceId?: string): Promise<{ token: string; role: Role; expiresAt: string }> {
  const settings = db.prepare('SELECT key, value FROM settings WHERE key IN (?, ?)').all('operator_pin_hash', 'admin_pin_hash') as Array<{ key: string; value: string }>;
  const adminHash = settings.find((item) => item.key === 'admin_pin_hash')?.value;
  const operatorHash = settings.find((item) => item.key === 'operator_pin_hash')?.value;

  const role: Role | null = adminHash && (await bcrypt.compare(pin, adminHash))
    ? 'admin'
    : operatorHash && (await bcrypt.compare(pin, operatorHash))
      ? 'operator'
      : null;

  if (!role) throw new HttpError(401, 'PIN 不正确');

  if (role === 'operator') {
    db.prepare("UPDATE auth_sessions SET revoked_at = ? WHERE role = 'operator' AND revoked_at IS NULL").run(nowIsoSeconds());
  }

  const rawToken = crypto.randomBytes(32).toString('hex');
  const tokenHash = await bcrypt.hash(rawToken, 10);
  const createdAt = nowIsoSeconds();
  const expiresAt = new Date(Date.now() + (role === 'admin' ? 12 : 12) * 60 * 60 * 1000).toISOString();
  const result = db.prepare(`
    INSERT INTO auth_sessions (token_hash, role, device_id, created_at, expires_at)
    VALUES (?, ?, ?, ?, ?)
  `).run(tokenHash, role, deviceId ?? null, createdAt, expiresAt);

  const jwtToken = jwt.sign({ sid: result.lastInsertRowid, token: rawToken, role }, config.jwtSecret, { expiresIn: '12h' });
  return { token: jwtToken, role, expiresAt };
}

export async function verifyToken(token: string): Promise<{ sessionId: number; role: Role }> {
  let payload: JwtPayload;
  try {
    payload = jwt.verify(token, config.jwtSecret) as JwtPayload;
  } catch {
    throw new HttpError(401, '登录已失效');
  }

  const session = db.prepare(`
    SELECT id, token_hash, role, expires_at, revoked_at
    FROM auth_sessions
    WHERE id = ?
  `).get(payload.sid) as { id: number; token_hash: string; role: Role; expires_at: string; revoked_at: string | null } | undefined;

  if (!session || session.revoked_at) throw new HttpError(401, '登录已失效');
  if (new Date(session.expires_at).getTime() < Date.now()) throw new HttpError(401, '登录已过期');
  if (!(await bcrypt.compare(payload.token, session.token_hash))) throw new HttpError(401, '登录已失效');

  return { sessionId: session.id, role: session.role };
}

export function requireAuth(role?: Role) {
  return async (request: Request, _response: Response, next: NextFunction) => {
    try {
      const header = request.headers.authorization;
      const token = header?.startsWith('Bearer ') ? header.slice(7) : null;
      if (!token) throw new HttpError(401, '请先登录');

      request.user = await verifyToken(token);
      if (role === 'admin' && request.user.role !== 'admin') throw new HttpError(403, '需要管理员权限');
      next();
    } catch (error) {
      next(error);
    }
  };
}
