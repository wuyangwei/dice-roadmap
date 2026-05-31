import { io, type Socket } from 'socket.io-client';
import { getDeviceId, getToken } from './api.js';

const isCapacitorApp = location.protocol === 'file:';
const API_BASE_URL = isCapacitorApp 
  ? 'http://119.91.193.22:3001' 
  : '';

let socket: Socket | null = null;

export function connectSocket(onChange: () => void, onStatus: (connected: boolean) => void) {
  socket?.disconnect();
  socket = io(API_BASE_URL, { transports: ['websocket', 'polling'] });

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
