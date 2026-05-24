import { io, type Socket } from 'socket.io-client';
import { getDeviceId, getToken } from './api.js';
import { config } from './config.js';

let socket: Socket | null = null;

export function connectSocket(onChange: () => void, onStatus: (connected: boolean) => void) {
  socket?.disconnect();
  const socketUrl = config.webSocketUrl || '/';
  socket = io(socketUrl, { transports: ['websocket', 'polling'] });

  socket.on('connect', () => {
    onStatus(true);
    socket?.emit('client:hello', {
      token: getToken(),
      deviceId: getDeviceId(),
      clientType: location.pathname.includes('mobile') ? 'mobile' : 'display'
    });
  });
  socket.on('disconnect', () => onStatus(false));
  socket.on('state:changed', onChange);

  return () => {
    socket?.disconnect();
  };
}
