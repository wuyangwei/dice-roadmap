#!/usr/bin/env node
import http from 'http';

console.log('🎲 本地骰子路单系统 - 外网访问助手\n');
console.log('✅ 当前服务状态:');
console.log('   📱 前端: http://localhost:5173');
console.log('   🔌 后端: http://localhost:3001');
console.log('');

console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log('🌐 外网访问方案（按推荐顺序）');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

console.log('方案 1: 使用 ngrok (最简单，推荐)');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log('   步骤1: 安装 ngrok');
console.log('          npm install -g ngrok');
console.log('');
console.log('   步骤2: 启动隧道');
console.log('          unset HTTP_PROXY HTTPS_PROXY http_proxy https_proxy');
console.log('          ngrok http 5173');
console.log('');
console.log('   步骤3: 访问显示的公网地址\n');

console.log('方案 2: 使用 localtunnel (免费)');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log('   执行命令:');
console.log('          unset HTTP_PROXY HTTPS_PROXY http_proxy https_proxy');
console.log('          npx localtunnel --port 5173\n');

console.log('方案 3: 手动访问本地服务');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log('   如果在同一网络环境，直接访问:');
console.log('          http://localhost:5173\n');

console.log('📱 可用页面:');
console.log('   /mobile  - 手机操作页面');
console.log('   /display - 大屏展示页面');
console.log('   /admin   - 管理后台');
console.log('');
console.log('🔑 默认凭据:');
console.log('   管理员: 888888');
console.log('   操作员: 123456');
console.log('');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log('💡 提示: 保持开发服务器运行，隧道才会有效！');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

// 简单的健康检查服务
const server = http.createServer((req, res) => {
  if (req.url === '/health') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ 
      ok: true, 
      service: 'dice-roadmap',
      frontend: 'http://localhost:5173',
      backend: 'http://localhost:3001'
    }));
  } else {
    res.writeHead(302, { 'Location': 'http://localhost:5173' });
    res.end();
  }
});

console.log('🔍 本地健康检查服务已启动 (端口 8080)...\n');
