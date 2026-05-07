# 本地骰子单双路单系统

单桌、本地优先的路单 MVP。电脑运行本地服务和展示页，手机通过同一局域网访问录入骰子数据。

## 开发启动

```bash
pnpm install
pnpm dev
```

默认地址：

- 电脑展示页：http://localhost:5173/display
- 手机操作页：http://localhost:5173/mobile
- 管理页：http://localhost:5173/admin
- API：http://localhost:3001

默认 PIN：

- 管理员：`888888`
- 操作员：`123456`

首次生产使用前请在数据库 `settings` 表中更换 PIN 哈希。
