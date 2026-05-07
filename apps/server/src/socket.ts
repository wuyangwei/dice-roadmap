import { Server } from 'socket.io';
import type { Server as HttpServer } from 'node:http';
import { verifyToken } from './auth.js';

let io: Server;

export function initSocket(server: HttpServer) {
  io = new Server(server, {
    cors: { origin: true, credentials: true }
  });

  io.on('connection', (socket) => {
    socket.on('client:hello', async (payload: { token?: string; clientType?: string }) => {
      try {
        if (payload.token) await verifyToken(payload.token);
        socket.data.clientType = payload.clientType;
        socket.emit('connection:status', { ok: true });
      } catch {
        socket.emit('connection:status', { ok: false });
      }
    });
  });

  return io;
}

export function broadcastStateChanged(event: string) {
  io?.emit(event);
  io?.emit('state:changed');
}
