// 配置文件 - 根据环境自动选择
const isProduction = typeof window !== 'undefined' && 
  window.location.protocol !== 'http:' && 
  !window.location.hostname.includes('localhost') && 
  !window.location.hostname.includes('127.0.0.1');

export const config = {
  // 生产环境使用你的后端地址，开发环境使用相对路径（通过 Vite 代理）
  apiBase: isProduction 
    ? 'https://your-backend-url.onrender.com'  // 替换为你的实际后端地址
    : '',
  
  webSocketUrl: isProduction
    ? 'wss://your-backend-url.onrender.com'  // 替换为你的实际后端地址
    : ''
};
