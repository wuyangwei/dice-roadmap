import express, { type NextFunction, type Request, type Response } from 'express';
import cors from 'cors';
import QRCode from 'qrcode';
import os from 'node:os';
import { z } from 'zod';
import { loginWithPin, requireAuth } from './auth.js';
import { HttpError } from './errors.js';
import { createGame, endGame, getCurrentGameState, getGameDetail, listGames, pauseGame, resumeGame } from './gameService.js';
import { createRound, deleteLastRound, updateLastRound } from './roundService.js';
import { broadcastStateChanged } from './socket.js';
import { config } from './config.js';

export function createApp() {
  const app = express();
  app.use(cors({ origin: true, credentials: true }));
  app.use(express.json());

  app.get('/api/health', (_request, response) => {
    response.json({ ok: true });
  });

  app.get('/api/network', async (_request, response, next) => {
    try {
      const address = getLocalAddress();
      const mobileUrl = `http://${address}:${config.webPort}/mobile`;
      response.json({
        address,
        mobileUrl,
        qrCode: await QRCode.toDataURL(mobileUrl)
      });
    } catch (error) {
      next(error);
    }
  });

  app.post('/api/auth/login', async (request, response, next) => {
    try {
      const body = z.object({ pin: z.string().min(1), deviceId: z.string().optional() }).parse(request.body);
      response.json(await loginWithPin(body.pin, body.deviceId));
    } catch (error) {
      next(error);
    }
  });

  app.get('/api/auth/me', requireAuth(), (request, response) => {
    response.json({ role: request.user!.role });
  });

  app.get('/api/current-game', (_request, response) => {
    response.json(getCurrentGameState());
  });

  app.post('/api/games', requireAuth('admin'), (request, response, next) => {
    try {
      const game = createGame(request.body);
      broadcastStateChanged('game:created');
      response.status(201).json(game);
    } catch (error) {
      next(error);
    }
  });

  app.post('/api/games/:id/end', requireAuth('admin'), (request, response, next) => {
    try {
      const game = endGame(Number(request.params.id));
      broadcastStateChanged('game:ended');
      response.json(game);
    } catch (error) {
      next(error);
    }
  });

  app.post('/api/games/:id/pause', requireAuth('admin'), (request, response, next) => {
    try {
      const game = pauseGame(Number(request.params.id));
      broadcastStateChanged('game:paused');
      response.json(game);
    } catch (error) {
      next(error);
    }
  });

  app.post('/api/games/:id/resume', requireAuth('admin'), (request, response, next) => {
    try {
      const game = resumeGame(Number(request.params.id));
      broadcastStateChanged('game:resumed');
      response.json(game);
    } catch (error) {
      next(error);
    }
  });

  app.get('/api/games', requireAuth('admin'), (_request, response) => {
    response.json(listGames());
  });

  app.get('/api/games/:id', requireAuth('admin'), (request, response) => {
    response.json(getGameDetail(Number(request.params.id)));
  });

  app.post('/api/rounds', requireAuth(), (request, response, next) => {
    try {
      const round = createRound(request.body);
      broadcastStateChanged('round:created');
      response.status(201).json(round);
    } catch (error) {
      next(error);
    }
  });

  app.patch('/api/rounds/last', requireAuth(), (request, response, next) => {
    try {
      const round = updateLastRound(request.body);
      broadcastStateChanged('round:updated');
      response.json(round);
    } catch (error) {
      next(error);
    }
  });

  app.delete('/api/rounds/last', requireAuth(), (_request, response, next) => {
    try {
      const round = deleteLastRound();
      broadcastStateChanged('round:deleted');
      response.json(round);
    } catch (error) {
      next(error);
    }
  });

  app.use((error: unknown, _request: Request, response: Response, _next: NextFunction) => {
    if (error instanceof z.ZodError) {
      response.status(400).json({ message: '参数不正确', issues: error.issues });
      return;
    }

    if (error instanceof HttpError) {
      response.status(error.status).json({ message: error.message });
      return;
    }

    console.error(error);
    response.status(500).json({ message: '服务器错误' });
  });

  return app;
}

function getLocalAddress() {
  const interfaces = os.networkInterfaces();
  for (const items of Object.values(interfaces)) {
    for (const item of items ?? []) {
      if (item.family === 'IPv4' && !item.internal) return item.address;
    }
  }
  return '127.0.0.1';
}
