#!/usr/bin/env node
import ngrok from 'ngrok';

console.log('🚀 正在启动 ngrok 隧道...\n');

// 绕过代理设置
process.env.NO_PROXY = '*';
process.env.no_proxy = '*';

(async () => {
  try {
    const url = await ngrok.connect({
      addr: 5173,
      host_header: 'localhost:5173',
      bind_tls: true,
    });
    
    console.log('✅ ngrok 隧道建立成功！');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('🌐 公网访问地址:');
    console.log(`   ${url}`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    console.log('📱 可访问页面:');
    console.log(`   📱 手机操作: ${url}/mobile`);
    console.log(`   📺 大屏展示: ${url}/display`);
    console.log(`   🔐 管理后台: ${url}/admin`);
    console.log('\n🔑 默认凭据:');
    console.log('   管理员: 888888');
    console.log('   操作员: 123456');
    console.log('\n💡 提示: 保持此窗口运行，隧道将持续有效\n');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    
    // 保持进程运行
    process.stdin.resume();
    
  } catch (error) {
    console.error('❌ ngrok 启动失败:', error.message);
    console.error('\n💡 可能的解决方案:');
    console.error('   1. 检查本地服务是否在 5173 端口运行');
    console.error('   2. 尝试使用其他隧道工具 (localtunnel)');
    process.exit(1);
  }
})();

process.on('SIGINT', async () => {
  console.log('\n👋 正在关闭隧道...');
  await ngrok.disconnect();
  await ngrok.kill();
  console.log('✅ 隧道已关闭');
  process.exit(0);
});
