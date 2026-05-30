#!/usr/bin/env node

import { spawn } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

console.log('🚀 启动外网穿透服务...\n');
console.log('📡 本地服务端口: 5173 (前端) + 3001 (后端)');
console.log('🔧 正在建立隧道...\n');

// 绕过代理设置
const env = { ...process.env };
delete env.HTTP_PROXY;
delete env.HTTPS_PROXY;
delete env.http_proxy;
delete env.https_proxy;

// 启动 localtunnel
const lt = spawn('npx', ['localtunnel', '--port', '5173', '--local-host', 'localhost'], {
  cwd: __dirname,
  env,
  shell: true,
  stdio: ['ignore', 'pipe', 'pipe']
});

let tunnelUrl = null;

lt.stdout.on('data', (data) => {
  const output = data.toString();
  console.log(output.trim());
  
  if (output.includes('url is:')) {
    const match = output.match(/(https?:\/\/[^\s]+)/);
    if (match) {
      tunnelUrl = match[1];
      console.log('\n' + '='.repeat(60));
      console.log('🎯 外网访问地址已获取！');
      console.log('='.repeat(60));
      console.log(`🌐 访问地址: ${tunnelUrl}`);
      console.log('='.repeat(60));
      console.log('');
      console.log('📱 手机端: ' + tunnelUrl + '/mobile');
      console.log('📺 大屏端: ' + tunnelUrl + '/display');
      console.log('🔐 管理端: ' + tunnelUrl + '/admin');
      console.log('');
      console.log('💡 提示: 保持此窗口运行，隧道将持续有效');
      console.log('='.repeat(60));
    }
  }
});

lt.stderr.on('data', (data) => {
  console.error('❌ 错误:', data.toString());
});

lt.on('close', (code) => {
  console.log(`\n⚠️  隧道服务已退出 (代码: ${code})`);
  console.log('   如需重新启动，请再次运行此脚本');
});

lt.on('error', (err) => {
  console.error('\n❌ 启动失败:', err);
});
