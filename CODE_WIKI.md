# 骰子单双路单系统 - Code Wiki

## 1. 项目概述

### 1.1 项目简介

**骰子单双路单系统** 是一个本地优先的骰子游戏路单管理系统。系统支持单桌游戏，电脑运行本地服务和展示页，手机通过同一局域网访问进行骰子数据录入。

### 1.2 项目信息

| 属性 | 值 |
|------|-----|
| 项目名称 | dice-roadmap-system |
| 版本 | 0.1.0 |
| 包管理器 | pnpm 10.33.3 |
| 开发语言 | TypeScript |

### 1.3 访问地址

| 页面 | 地址 |
|------|------|
| 电脑展示页 | http://localhost:5173/display |
| 手机操作页 | http://localhost:5173/mobile |
| 管理页 | http://localhost:5173/admin |
| API 服务 | http://localhost:3001 |

### 1.4 默认 PIN

| 角色 | PIN |
|------|-----|
| 管理员 | 888888 |
| 操作员 | 123456 |

---

## 2. 项目架构

### 2.1 Monorepo 结构

```
dice-roadmap-system/
├── apps/
│   ├── server/          # 后端服务 (Express + Socket.io)
│   └── web/             # 前端应用 (React + Vite)
├── packages/
│   └── shared/          # 共享类型和工具函数
├── package.json         # 根配置
├── pnpm-workspace.yaml  # 工作空间配置
└── tsconfig.base.json  # TypeScript 基础配置
```

### 2.2 技术栈

#### 后端 (apps/server)

| 技术 | 版本 | 用途 |
|------|------|------|
| Express | ^5.1.0 | HTTP 服务器框架 |
| Socket.io | ^4.8.1 | WebSocket 实时通信 |
| better-sqlite3 | ^11.9.1 | SQLite 数据库 |
| bcryptjs | ^3.0.2 | 密码哈希 |
| jsonwebtoken | ^9.0.2 | JWT 认证 |
| qrcode | ^1.5.4 | 二维码生成 |
| zod | ^3.24.3 | 数据验证 |

#### 前端 (apps/web)

| 技术 | 版本 | 用途 |
|------|------|------|
| React | ^19.1.0 | UI 框架 |
| Vite | ^6.3.4 | 构建工具 |
| socket.io-client | ^4.8.1 | WebSocket 客户端 |
| lucide-react | ^0.507.0 | 图标库 |

#### 共享包 (packages/shared)

| 技术 | 用途 |
|------|------|
| TypeScript | 类型定义 |
| 无运行时依赖 | 仅类型和纯函数 |

---

## 3. 模块职责详解

### 3.1 packages/shared - 共享包

共享包包含类型定义和业务逻辑函数，被服务端和前端共同使用。

#### 3.1.1 types.ts - 类型定义

```typescript
// 基础类型
type BaseResult = '单' | '双';                    // 单双结果
type GameStatus = 'active' | 'paused' | 'ended'; // 游戏状态
type Role = 'operator' | 'admin';                // 用户角色

// 游戏 (Game)
type Game = {
  id: number;
  name: string;                    // 游戏名称
  status: GameStatus;              // 状态
  joyPointEnabled: boolean;        // 欢乐点是否启用
  joyDice1: number | null;         // 欢乐点骰子1
  joyDice2: number | null;         // 欢乐点骰子2
  startedAt: string;               // 开始时间 (ISO)
  pausedAt: string | null;        // 暂停时间
  endedAt: string | null;         // 结束时间
};

// 回合 (Round)
type Round = {
  id: number;
  gameId: number;                  // 所属游戏ID
  roundNo: number;                 // 局号
  dice1: number;                   // 骰子1 (1-6)
  dice2: number;                   // 骰子2 (1-6)
  baseResult: BaseResult;          // 单/双
  isJoyPoint: boolean;            // 是否为欢乐点
  createdAt: string;               // 创建时间
  updatedAt: string | null;       // 更新时间
};

// 统计数据 (Stats)
type Stats = {
  total: number;                   // 总局数
  singles: number;                 // 单的数量
  doubles: number;                 // 双的数量
  joyPoints: number;               // 欢乐点数量
  singleRate: number;              // 单的概率
  doubleRate: number;              // 双的概率
  currentStreak: { result: BaseResult | null; count: number }; // 当前连龙
  longestSingleStreak: number;     // 最长单连
  longestDoubleStreak: number;     // 最长双连
};

// 当前游戏状态 (CurrentGameState)
type CurrentGameState = {
  game: Game | null;               // 当前游戏
  rounds: Round[];                 // 所有回合
  stats: Stats;                     // 统计数据
  nextRoundNo: number | null;      // 下一局号
};
```

#### 3.1.2 result.ts - 骰子结果计算

| 函数 | 说明 |
|------|------|
| `getBaseResult(dice1, dice2)` | 计算单双结果：`(dice1 + dice2) % 2 === 0` 则为双，否则为单 |
| `isJoyPoint(dice1, dice2, game)` | 判断是否为欢乐点（比较两个骰子是否与预设的欢乐点匹配） |
| `assertDice(value)` | 验证骰子值是否为 1-6 的整数 |

#### 3.1.3 stats.ts - 统计数据计算

| 函数 | 说明 |
|------|------|
| `calculateStats(rounds)` | 计算回合数组的统计数据，包括总数、单双次数、概率、连龙信息等 |

#### 3.1.4 road.ts - 路单构建

| 函数 | 说明 |
|------|------|
| `buildBeadRoad(rounds, rows=6)` | 构建珠盘路，按列排列，每列6个单元格 |
| `buildBigRoad(rounds, maxRows=6)` | 构建大路，同结果向下，超出行数向右折叠 |

---

### 3.2 apps/server - 后端服务

#### 3.2.1 index.ts - 服务入口

```
职责：
- 创建 HTTP 服务器
- 初始化 Socket.io
- 监听指定端口
```

```typescript
// 创建 Express 应用
const app = createApp();

// 创建 HTTP 服务器
const server = http.createServer(app);

// 初始化 Socket.io
initSocket(server);

// 启动监听
server.listen(config.port, config.host, () => {
  console.log(`Roadmap server listening on http://${config.host}:${config.port}`);
});
```

#### 3.2.2 app.ts - HTTP 路由

| 路由 | 方法 | 权限 | 说明 |
|------|------|------|------|
| `/api/health` | GET | 公开 | 健康检查 |
| `/api/network` | GET | 公开 | 获取本机 IP 和移动端 URL，生成二维码 |
| `/api/auth/login` | POST | 公开 | PIN 登录 |
| `/api/auth/me` | GET | 需要认证 | 获取当前用户信息 |
| `/api/current-game` | GET | 公开 | 获取当前游戏状态 |
| `/api/games` | POST | admin | 创建游戏 |
| `/api/games/:id/end` | POST | admin | 结束游戏 |
| `/api/games/:id/pause` | POST | admin | 暂停游戏 |
| `/api/games/:id/resume` | POST | admin | 恢复游戏 |
| `/api/games` | GET | admin | 获取游戏列表 |
| `/api/games/:id` | GET | admin | 获取游戏详情 |
| `/api/rounds` | POST | 需要认证 | 创建回合（录入骰子） |
| `/api/rounds/last` | PATCH | 需要认证 | 修改上一回合 |
| `/api/rounds/last` | DELETE | 需要认证 | 删除上一回合 |

#### 3.2.3 config.ts - 配置管理

```typescript
const config = {
  port: 3001,                                    // API 服务端口
  webPort: 5173,                                 // Web 前端端口
  host: '0.0.0.0',                              // 监听地址
  jwtSecret: 'local-dev-secret-...',            // JWT 密钥
  dataDir: './data',                            // 数据目录
  operatorPin: '123456',                        // 操作员 PIN
  adminPin: '888888'                            // 管理员 PIN
};
```

#### 3.2.4 db.ts - 数据库初始化

**数据库**: SQLite (`roadmap.sqlite`)

**数据表**:

| 表名 | 说明 |
|------|------|
| `games` | 游戏表 |
| `rounds` | 回合表 |
| `auth_sessions` | 认证会话表 |
| `settings` | 设置表 (存储 PIN 哈希) |

**数据库特性**:
- WAL 模式 (`PRAGMA journal_mode = WAL`)
- 外键约束 (`PRAGMA foreign_keys = ON`)
- 自动迁移机制（处理数据库结构变更）

#### 3.2.5 auth.ts - 认证模块

| 函数 | 说明 |
|------|------|
| `loginWithPin(pin, deviceId?)` | PIN 登录，验证后返回 JWT token |
| `verifyToken(token)` | 验证 JWT token 有效性 |
| `requireAuth(role?)` | Express 中间件，验证用户认证和权限 |

**JWT Payload 结构**:
```typescript
{ sid: number, token: string, role: Role }
```

#### 3.2.6 gameService.ts - 游戏服务

| 函数 | 说明 |
|------|------|
| `getActiveGame()` | 获取当前活跃游戏 |
| `getRoundsByGame(gameId)` | 获取游戏的所有回合 |
| `getCurrentGameState()` | 获取当前游戏完整状态（含统计） |
| `createGame(input)` | 创建新游戏 |
| `endGame(gameId)` | 结束游戏 |
| `pauseGame(gameId)` | 暂停游戏 |
| `resumeGame(gameId)` | 恢复游戏 |
| `listGames()` | 获取游戏列表 |
| `getGameDetail(gameId)` | 获取游戏详情 |

#### 3.2.7 roundService.ts - 回合服务

| 函数 | 说明 |
|------|------|
| `createRound(input)` | 创建新回合（录入骰子数据） |
| `updateLastRound(input)` | 修改上一回合 |
| `deleteLastRound()` | 删除上一回合 |

#### 3.2.8 socket.ts - WebSocket 服务

| 函数 | 说明 |
|------|------|
| `initSocket(server)` | 初始化 Socket.io 服务器 |
| `broadcastStateChanged(event)` | 广播状态变更事件 |

**Socket 事件**:

| 事件名 | 方向 | 说明 |
|--------|------|------|
| `client:hello` | 客户端 → 服务端 | 客户端连接时发送 token |
| `connection:status` | 服务端 → 客户端 | 连接状态响应 |
| `state:changed` | 服务端 → 客户端 | 数据状态变更通知 |
| `round:created` | 服务端 → 客户端 | 新回合创建 |
| `round:updated` | 服务端 → 客户端 | 回合更新 |
| `round:deleted` | 服务端 → 客户端 | 回合删除 |
| `game:created` | 服务端 → 客户端 | 游戏创建 |
| `game:ended` | 服务端 → 客户端 | 游戏结束 |
| `game:paused` | 服务端 → 客户端 | 游戏暂停 |
| `game:resumed` | 服务端 → 客户端 | 游戏恢复 |

#### 3.2.9 errors.ts - 错误处理

| 类/函数 | 说明 |
|--------|------|
| `HttpError(status, message)` | HTTP 错误类 |
| `assertFound(value, message?)` | 断言值存在，否则抛出 404 错误 |

#### 3.2.10 mappers.ts - 数据映射

| 函数 | 说明 |
|------|------|
| `mapGame(row)` | 将数据库行映射为 Game 对象 |
| `mapRound(row)` | 将数据库行映射为 Round 对象 |

#### 3.2.11 time.ts - 时间工具

| 函数 | 说明 |
|------|------|
| `nowIsoSeconds()` | 获取当前 ISO 时间字符串（秒级精度） |
| `createDefaultGameName()` | 生成默认游戏名称 (格式: YYYY-MM-DD HH:mm) |

---

### 3.3 apps/web - 前端应用

#### 3.3.1 App.tsx - 应用入口

根据 URL 路径路由到对应页面：

| 路径 | 组件 |
|------|------|
| `/mobile` | MobilePage |
| `/admin` | AdminPage |
| 其他 | DisplayPage |

#### 3.3.2 api.ts - API 客户端

| 函数 | 说明 |
|------|------|
| `api<T>(path, options, tokenRole?)` | 通用 API 请求函数 |
| `login(pin)` | 登录 |
| `me(tokenRole?)` | 获取当前用户信息 |
| `currentGame()` | 获取当前游戏状态 |
| `pauseGame(id)` | 暂停游戏 |
| `resumeGame(id)` | 恢复游戏 |
| `endGameById(id)` | 结束游戏 |
| `getToken/ setToken/ clearToken` | Token 管理 |
| `getDeviceId()` | 获取设备 ID（用于会话追踪） |

#### 3.3.3 socket.ts - WebSocket 客户端

| 函数 | 说明 |
|------|------|
| `connectSocket(onChange, onStatus)` | 连接 Socket.io 服务器 |

#### 3.3.4 hooks.ts - React Hooks

| Hook | 说明 |
|------|------|
| `useSession(tokenRole?)` | 管理用户登录状态 |
| `useCurrentGame(enabled)` | 管理当前游戏状态，自动同步 |

#### 3.3.5 页面组件

**MobilePage** (`/mobile` - 操作端)
- 登录界面（输入 PIN）
- 创建游戏（管理员）
- 骰子选择器
- 录入/修改/删除回合
- 实时预览结果

**DisplayPage** (`/display - 展示端`)
- 当前游戏信息展示
- 珠盘路和大路显示
- 统计数据面板
- 实时时钟
- 连接状态指示

**AdminPage** (`/admin` - 管理端)
- 管理员登录
- 当前游戏控制（暂停/恢复/结束）
- 游戏列表
- 游戏详情查看
- 历史回放

#### 3.3.6 组件

| 组件 | 说明 |
|------|------|
| `BeadRoad` | 珠盘路组件，6列布局显示所有回合 |
| `BigRoad` | 大路组件，智能折叠显示 |
| `RoadCell` | 路格单元格组件 |
| `DicePicker` | 骰子选择器 (1-6) |
| `StatsPanel` | 统计面板组件 |

---

## 4. 依赖关系

### 4.1 包依赖关系图

```
┌─────────────────────────────────────────────────────────────┐
│                        apps/web                              │
│  (React, Vite, socket.io-client, lucide-react)              │
│                           │                                  │
│                     @roadmap/shared                          │
└─────────────────────────────────────────────────────────────┘
                              ▲
                              │
┌─────────────────────────────────────────────────────────────┐
│                        apps/server                          │
│  (Express, Socket.io, better-sqlite3, bcrypt, jwt, qrcode)  │
│                           │                                  │
│                     @roadmap/shared                          │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│                      packages/shared                         │
│  (仅 TypeScript 类型定义，无运行时依赖)                       │
└─────────────────────────────────────────────────────────────┘
```

### 4.2 模块内部依赖

#### server 模块依赖

```
index.ts
├── app.ts
│   ├── auth.ts
│   ├── gameService.ts
│   │   ├── mappers.ts
│   │   └── time.ts
│   ├── roundService.ts
│   │   └── (shared imports)
│   └── socket.ts
├── socket.ts
├── config.ts
└── db.ts
```

#### web 模块依赖

```
App.tsx
├── pages/MobilePage.tsx
│   ├── api.ts
│   ├── hooks.ts
│   │   └── socket.ts
│   └── components/DicePicker.tsx
├── pages/DisplayPage.tsx
│   ├── hooks.ts
│   └── components/BeadRoad.tsx, BigRoad.tsx, StatsPanel.tsx
└── pages/AdminPage.tsx
    ├── api.ts
    ├── hooks.ts
    └── components/BeadRoad.tsx, BigRoad.tsx
```

---

## 5. 数据流

### 5.1 游戏流程

```
1. 管理员登录 (PIN: 888888)
   └─> POST /api/auth/login
   
2. 创建游戏 (可选配置欢乐点)
   └─> POST /api/games
   
3. 操作员登录 (PIN: 123456)
   └─> POST /api/auth/login
   
4. 录入骰子数据
   └─> POST /api/rounds
   └─> Socket 广播: round:created, state:changed
   
5. 展示页自动刷新
   └─> Socket 监听: state:changed
   └─> GET /api/current-game
   
6. 修改/删除上一局 (如需)
   └─> PATCH /api/rounds/last
   └─> DELETE /api/rounds/last
   
7. 暂停/恢复游戏 (管理员)
   └─> POST /api/games/:id/pause
   └─> POST /api/games/:id/resume
   
8. 结束游戏 (管理员)
   └─> POST /api/games/:id/end
```

### 5.2 实时同步机制

```
客户端                         服务端
   │                              │
   │──── connectSocket ──────────>│
   │                              │
   │<--- connection:status ------│
   │                              │
   │==== 操作数据 === POST/PATCH/DELETE ===>│
   │                              │
   │<========= state:changed =====│ (Socket 广播)
   │<========= 事件通知 ==========│
   │                              │
   │==== refresh() ========= GET /api/current-game ===>│
   │<============= 最新数据 =====│
```

---

## 6. 环境变量

| 变量 | 默认值 | 说明 |
|------|--------|------|
| `PORT` | 3001 | API 服务端口 |
| `WEB_PORT` | 5173 | Web 前端端口 |
| `HOST` | 0.0.0.0 | 监听地址 |
| `JWT_SECRET` | local-dev-secret-... | JWT 密钥 |
| `DATA_DIR` | ./data | 数据存储目录 |
| `OPERATOR_PIN` | 123456 | 操作员 PIN |
| `ADMIN_PIN` | 888888 | 管理员 PIN |

---

## 7. 运营指南

### 7.1 生产部署注意事项

1. **修改 PIN**
   - 首次使用前必须在数据库 `settings` 表中更换 PIN 哈希
   - 可通过修改环境变量 `ADMIN_PIN` 和 `OPERATOR_PIN`

2. **JWT 密钥**
   - 生产环境必须设置 `JWT_SECRET` 为强随机字符串

3. **数据目录**
   - 确保 `DATA_DIR` 指向持久化存储
   - SQLite 数据库文件位于: `{DATA_DIR}/roadmap.sqlite`

4. **网络访问**
   - 移动端需与电脑在同一局域网内
   - 管理员可访问 `/api/network` 获取二维码

### 7.2 数据库备份

```bash
# 备份
cp data/roadmap.sqlite data/roadmap.sqlite.backup

# 恢复
cp data/roadmap.sqlite.backup data/roadmap.sqlite
```

---

## 8. 常见问题

### Q1: 移动端无法连接？
- 检查手机与电脑是否在同一局域网
- 确认防火墙允许 3001 和 5173 端口
- 访问 `/api/network` 获取正确的 IP 地址

### Q2: 忘记管理员 PIN？
- 直接修改环境变量 `ADMIN_PIN`
- 或在数据库中更新 `settings` 表的 `admin_pin_hash`

### Q3: 如何添加新的游戏类型？
1. 在 `packages/shared/src/types.ts` 添加新类型
2. 更新 `apps/server/src/db.ts` 的表结构
3. 更新 `apps/server/src/gameService.ts` 的业务逻辑
4. 更新 `apps/web` 相关页面

---

## 9. 贡献指南

### 9.1 开发命令

```bash
# 安装依赖
pnpm install

# 启动开发服务器 (所有应用)
pnpm dev

# 仅启动后端
pnpm dev:server

# 仅启动前端
pnpm dev:web

# 构建生产版本
pnpm build

# 类型检查
pnpm typecheck
```

### 9.2 代码规范

- 使用 TypeScript 严格模式
- 使用 ESM 模块 (`type: "module"`)
- 遵循现有代码风格
- 所有函数使用 JSDoc 注释

---

*文档版本: 1.0.0*
*最后更新: 2026-05-10*
