#!/usr/bin/env node
import ngrok from 'ngrok';

console.log('🚀 启动 ngrok 隧道到端口 5173...\n');

// 清除所有代理设置
delete process.env.HTTP_PROXY;
delete process.env.HTTPS_PROXY;
delete process.env.http_proxy;
delete process.env.https_proxy;
process.env.NO_PROXY = '*';
process.env.no_proxy = '*';

async function startTunnel() {
  try {
    console.log('🔗 正在连接 ngrok 服务...\n');
    const url = await ngrok.connect({
      addr: 5173,
      host_header: 'localhost:5173'
    });
    
    console.log('='.repeat(70));
    console.log('✅ ngrok 隧道建立成功！');
    console.log('='.repeat(70));
    console.log(`🌐 公网访问地址: ${url}`);
    console.log('='.repeat(70));
    console.log('\n📱 可访问页面:');
    console.log(`   - 手机操作: ${url}/mobile`);
    console.log(`   - 大屏展示: ${url}/display`);
    console.log(`   - 管理后台: ${url}/admin`);
    console.log('\n🔑 默认凭据:');
    console.log('   - 管理员: 888888');
    console.log('   - 操作员: 123456');
    console.log('\n💡 提示: 保持此进程运行，隧道将持续有效');
    console.log('='.repeat(70));
    
    // 保持进程运行
    process.stdin.resume();
    
  } catch (error) {
    console.error('❌ ngrok 启动失败:', error.message);
    console.error('\n错误详情:', error);
    process.exit(1);
  }
}

startTunnel();
