# 每日待办 - Todo App

基于 Next.js 的简洁高效的每日待办事项管理应用。

## 功能特性

- 🔐 **用户认证**：支持用户注册、登录和登出
- 📝 **待办管理**：创建、编辑、删除和标记完成待办事项
- 📅 **日期组织**：按日期组织待办事项，默认显示当日事项
- 🎨 **响应式设计**：适配各种设备屏幕
- 🔔 **浏览器通知**：支持系统通知提醒
- 🎭 **流畅动画**：使用 Framer Motion 提供优雅的交互体验

## 技术栈

- **前端框架**：Next.js 14 (App Router)
- **样式**：Tailwind CSS
- **数据库**：MySQL + Prisma ORM
- **认证**：JWT + HttpOnly Cookies
- **动画**：Framer Motion
- **图标**：Lucide React
- **类型安全**：TypeScript

## 快速开始

### 1. 安装依赖

```bash
npm install
```

### 2. 环境配置

创建 `.env` 文件并配置以下环境变量：

```env
# 数据库连接
DATABASE_URL="mysql://username:password@localhost:3306/todo_app"

# JWT 密钥
JWT_SECRET="your-super-secret-jwt-key"

# Google OAuth (可选)
GOOGLE_CLIENT_ID=""
GOOGLE_CLIENT_SECRET=""
GOOGLE_REDIRECT_URI="http://localhost:3000/api/auth/google/callback"
```

### 3. 数据库设置

```bash
# 生成 Prisma 客户端
npm run db:generate

# 推送数据库架构
npm run db:push

# 或者使用迁移（推荐生产环境）
npm run db:migrate
```

### 4. 启动开发服务器

```bash
npm run dev
```

访问 [http://localhost:3000](http://localhost:3000) 查看应用。

## 项目结构

```
todo/
├── app/                    # Next.js App Router
│   ├── api/               # API 路由
│   │   ├── auth/          # 认证相关 API
│   │   └── todo/          # 待办事项 API
│   ├── login/             # 登录页面
│   ├── register/          # 注册页面
│   ├── globals.css        # 全局样式
│   ├── layout.tsx         # 根布局
│   └── page.tsx           # 主页
├── components/            # React 组件
│   └── ui/               # UI 组件库
├── lib/                  # 工具函数和配置
│   ├── auth.ts           # 认证工具
│   ├── prisma.ts         # Prisma 客户端
│   ├── types.ts          # TypeScript 类型
│   └── utils.ts          # 通用工具函数
├── prisma/               # 数据库配置
│   └── schema.prisma     # 数据库架构
├── middleware.ts         # Next.js 中间件
└── package.json          # 项目配置
```

## 主要功能

### 用户认证
- 用户注册和登录
- JWT 令牌认证
- HttpOnly Cookie 安全存储
- 路由保护中间件

### 待办事项管理
- 创建新待办事项
- 编辑待办内容
- 删除待办事项
- 标记完成/未完成
- 按日期筛选显示

### 用户界面
- 响应式设计
- 简洁现代的 UI
- 流畅的动画效果
- 直观的用户交互

## 开发命令

```bash
# 开发服务器
npm run dev

# 构建生产版本
npm run build

# 启动生产服务器
npm run start

# 代码检查
npm run lint

# 数据库相关
npm run db:generate    # 生成 Prisma 客户端
npm run db:push        # 推送数据库架构
npm run db:migrate     # 创建数据库迁移
npm run db:studio      # 打开 Prisma Studio
```

## 部署

### Vercel 部署

1. 将代码推送到 GitHub
2. 在 Vercel 中导入项目
3. 配置环境变量
4. 部署

### 自托管部署

1. 构建项目：`npm run build`
2. 启动服务器：`npm run start`
3. 配置反向代理（如 Nginx）

## 贡献

欢迎提交 Issue 和 Pull Request！

## 许可证

MIT License