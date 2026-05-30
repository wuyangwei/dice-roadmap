#!/usr/bin/env node

import { spawn } from 'node:child_process';

console.log('🚀 启动 ngrok 隧道...\n');

// 清除代理
delete process.env.HTTP_PROXY;
delete process.env.HTTPS_PROXY;
delete process.env.http_proxy;
delete process.env.https_proxy;
process.env.NO_PROXY = '*';
process.env.no_proxy = '*';

// 使用 npx 运行 ngrok
const ngrok = spawn('npx', ['ngrok', 'http', '5173'], {
  cwd: '/workspace',
  env: process.env,
  stdio: 'inherit'
});

ngrok.on('close', (code) => {
  console.log(`\nngrok 已退出 (代码: ${code})`);
});
