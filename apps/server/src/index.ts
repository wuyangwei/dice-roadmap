import http from 'node:http';
import { createApp } from './app.js';
import { config } from './config.js';
import { initSocket } from './socket.js';
import './db.js';

const app = createApp();
const server = http.createServer(app);
initSocket(server);

server.listen(config.port, config.host, () => {
  console.log(`Roadmap server listening on http://${config.host}:${config.port}`);
});
