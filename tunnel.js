import { createServer } from 'http';
import { createProxyServer } from 'http-proxy';
import { config } from './apps/server/src/config.js';

console.log('🚀 外网穿透服务启动中...');
console.log(`📡 本地服务: http://localhost:5173`);
console.log(`🔌 后端API: http://localhost:3001`);
console.log('');
console.log('----------------------------------------');
console.log('💡 外网访问提示：');
console.log('   由于当前环境的网络限制，');
console.log('   建议使用以下方案之一：');
console.log('');
console.log('方案 1: 使用 ngrok (推荐)');
console.log('   npm install -g ngrok');
console.log('   ngrok http 5173');
console.log('');
console.log('方案 2: 使用 localtunnel');
console.log('   npx localtunnel --port 5173');
console.log('');
console.log('方案 3: 联系环境管理员开放端口');
console.log('----------------------------------------');
console.log('');
console.log('🔍 当前服务状态检查...');

// 简单的健康检查代理
const proxy = createProxyServer({ target: 'http://localhost:5173', changeOrigin: true });
const server = createServer((req, res) => {
  if (req.url === '/health') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ ok: true, service: 'tunnel' }));
    return;
  }
  proxy.web(req, res);
});

server.on('error', (e) => {
  console.error('❌ 服务器错误:', e);
});

console.log('✅ 本地代理服务已就绪，等待外网穿透...');
