export const config = {
  // 开发环境使用本地后端
  // 生产环境需要替换为你的 Render 后端地址
  apiBase: import.meta.env.PROD 
    ? 'https://your-render-backend-url.onrender.com' 
    : '',
  
  webSocketUrl: import.meta.env.PROD
    ? 'wss://your-render-backend-url.onrender.com'
    : ''
};
