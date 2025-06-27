# SASTOJ Frontend (Next.js)

基于 Next.js 15 构建的现代化在线判题系统前端，采用混合渲染架构实现最佳的用户体验和性能。

## 🚀 技术栈

### 核心框架

- **Next.js 15+** - 使用 App Router，支持 SSR/CSR 混合架构
- **TypeScript** - 提供类型安全和更好的开发体验
- **React 19** - 支持最新的 React 特性

### 构建与工具

- **rspack** - 高性能构建工具，通过 `next-rspack` 集成
- **ESLint** - 代码质量检查
- **Tailwind CSS** - 原子化 CSS 框架
- **pnpm** - 快速、节省磁盘空间的包管理器

### UI 组件系统

- **Radix UI** - 无头组件库，提供可访问性和行为
- **class-variance-authority** - 类型安全的样式变体管理
- **next-themes** - 明暗模式支持
- **Tailwind CSS** - 样式系统

### 状态管理与数据获取

- **SWR** - 客户端数据获取和缓存
- **Zustand** - 轻量级全局状态管理
- **Server Actions** - 服务端表单处理

## 📁 项目架构

项目采用 Next.js App Router 的路由组（Route Groups）实现模块化架构：

```
src/app/
├── (auth)/                # 认证模块 (SSR)
│   ├── login/             # 登录页面
│   └── layout.tsx         # 认证模块布局
├── (admin)/               # 管理后台 (SSR)
│   ├── dashboard/         # 管理仪表盘
│   ├── problems/          # 题目管理
│   └── layout.tsx         # 管理端布局
├── (user)/                # 用户端 (CSR), 以比赛为核心
│   ├── contest/           # 比赛列表页
│   └── contest/[contestId] # 比赛详情页
│       ├── problems       #   - 题目列表
│       ├── problem/[pid]  #   - 题目详情和编辑器
│       └── ranking        #   - 比赛排名
├── status/                # 全局提交状态页
├── page.tsx               # 网站首页
├── globals.css            # 全局样式
└── layout.tsx             # 根布局
```

## 🛠️ 开发环境搭建

### 环境要求

- Node.js 18.17 或更高版本
- pnpm (推荐) 或 npm/yarn

### 安装依赖

```bash
pnpm install
```

### 启动开发服务器

```bash
pnpm dev
```

访问 [http://localhost:3000](http://localhost:3000) 查看应用。

### 构建生产版本

```bash
pnpm build
pnpm start
```

## 🎨 UI 组件开发

项目基于 Radix UI 构建了自定义组件系统，组件位于 `src/components/ui/` 目录：

- 使用 Radix UI 提供无头组件的行为和可访问性
- 通过 `class-variance-authority` 管理样式变体
- 采用 Tailwind CSS 进行样式设计

组件开发示例：

```typescript
// 基于 Radix UI 的按钮组件
import { Slot } from '@radix-ui/react-slot';
import { cva } from 'class-variance-authority';
```

### 主题配置

支持明暗模式切换，主题配置位于：

- `tailwind.config.ts` - Tailwind 主题配置
- `src/app/globals.css` - CSS 变量定义

## 📋 开发规范

### 路径别名

项目配置了路径别名以简化导入：

```typescript
import { Button } from '@/components/ui/button';
import { api } from '@/lib/api';
import { Dialog } from '@radix-ui/react-dialog';
```

### 代码风格

- 使用 ESLint 进行代码检查
- 遵循 TypeScript 严格模式
- 使用 Prettier 格式化代码

## 🔧 构建优化

### rspack 集成

项目使用 rspack 替代默认的 webpack：

- ⚡ 更快的构建速度
- 🔧 完全兼容 webpack 生态
- 📦 更小的包体积

配置文件：`next.config.ts`

## 📄 许可证

本项目采用 Apache-2.0 许可证 - 查看 [LICENSE](LICENSE) 文件了解详情。

## 🙏 致谢

- [Next.js](https://nextjs.org/) - React 全栈框架
- [Radix UI](https://www.radix-ui.com/) - 无头组件库
- [Tailwind CSS](https://tailwindcss.com/) - CSS 框架
- [rspack](https://www.rspack.dev/) - 高性能构建工具
