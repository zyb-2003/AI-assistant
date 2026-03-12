# AI-
这是一个类似ChatGPT的AI对话助手，主要功能包括多会话管理、实时对话、主题换、消息搜索等。技术栈是Vue3+Pinia+Vite，数据用localStorage持久化，还做了防抖、节流这些性能优化
# 🤖 AI智能助手

<div align="center">
  <img src="https://img.shields.io/badge/Vue-3.4-4FC08D?style=flat-square&logo=vue.js" alt="Vue 3">
  <img src="https://img.shields.io/badge/Pinia-2.1-FFD859?style=flat-square&logo=pinia" alt="Pinia">
  <img src="https://img.shields.io/badge/Vite-5.0-646CFF?style=flat-square&logo=vite" alt="Vite">
  <img src="https://img.shields.io/badge/Axios-1.6-5A29E4?style=flat-square&logo=axios" alt="Axios">
  <img src="https://img.shields.io/badge/License-MIT-green?style=flat-square" alt="License">
</div>

<p align="center">
  <strong>🚀 一个功能完善的 AI 对话助手，支持多会话管理、实时对话、主题切换、消息搜索等特性</strong>
</p>

<p align="center">
  <a href="#-功能特性">功能特性</a> •
  <a href="#-在线演示">在线演示</a> •
  <a href="#-技术栈">技术栈</a> •
  <a href="#-快速开始">快速开始</a> •
  <a href="#-项目结构">项目结构</a> •
  <a href="#-核心功能实现">核心功能</a> •
  <a href="#-性能优化">性能优化</a> •
  <a href="#-常见问题">常见问题</a>
</p>

---

## ✨ 功能特性

### 💬 核心对话
- **多会话管理** - 新建、切换、删除对话会话
- **实时对话** - 支持 HTTP 和 WebSocket 两种通信方式
- **消息持久化** - 使用 localStorage 存储，刷新页面数据不丢失
- **流式输出** - 支持 AI 逐字输出（WebSocket 模式）

### 🎨 界面体验
- **主题切换** - 亮色/暗色主题自由切换，支持系统主题跟随
- **消息复制** - 一键复制 AI 回复内容，带成功反馈
- **加载动画** - 友好的等待提示，支持响应式设计
- **响应式布局** - 完美适配桌面、平板、手机端

### 🔍 高级功能
- **会话搜索** - 实时搜索历史会话，带防抖优化
- **历史加载** - 滚动到顶部自动加载更早消息，带节流控制
- **消息分组** - 按日期分组显示消息（预留）
- **引用回复** - 支持引用消息进行回复（预留）

### 🛠️ 开发者友好
- **TypeScript 支持** - 完善的类型定义
- **错误处理** - 统一的错误捕获和用户提示
- **可扩展架构** - 易于接入真实后端 API

---

## 🌐 在线演示

> 🚧 正在部署中，敬请期待...

---

## 🛠️ 技术栈

### 核心框架
| 技术 | 版本 | 用途 |
|------|------|------|
| [Vue 3](https://vuejs.org/) | 3.4+ | 前端框架 |
| [Pinia](https://pinia.vuejs.org/) | 2.1+ | 状态管理 |
| [Vite](https://vitejs.dev/) | 5.0+ | 构建工具 |

### 主要依赖
| 依赖 | 版本 | 用途 |
|------|------|------|
| [Axios](https://axios-http.com/) | 1.6+ | HTTP 请求 |
| [Lodash](https://lodash.com/) | 4.17+ | 防抖节流工具 |
| [Vue Router](https://router.vuejs.org/) | 4.2+ | 路由管理（预留） |

### 开发工具
| 工具 | 用途 |
|------|------|
| ESLint | 代码规范 |
| Prettier | 代码格式化 |
| VS Code | 推荐 IDE |

---

## 🚀 快速开始

### 前置要求
- Node.js 18.0+
- npm 9.0+ 或 yarn 1.22+ 或 pnpm 8.0+

### 安装步骤

```bash
# 1. 克隆项目
git clone https://github.com/yourusername/ai-assistant.git
cd ai-assistant

# 2. 安装依赖
npm install
# 或
yarn install
# 或
pnpm install

# 3. 配置环境变量
cp .env.example .env
# 编辑 .env 文件，填入你的 API Key

# 4. 启动开发服务器
npm run dev

# 5. 构建生产版本
npm run build
