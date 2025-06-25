# MovieGPT React 应用

这是一个基于 React + TypeScript 的 MovieGPT 聊天界面应用，从原始 HTML 页面重构而来。

## 功能特性

- 🎯 **完全保持原有界面和交互效果**
- 🧩 **模块化组件设计**，按功能拆分
- ⚛️ **React 函数组件 + Hooks**
- 📱 **响应式设计**，支持移动端
- 🎨 **CSS Modules** 样式隔离
- 💬 **实时聊天界面**
- 🔄 **加载状态展示**
- 📝 **自动调整输入框高度**
- 🎲 **示例查询快捷选择**

## 项目结构

```
src/
├── components/          # React 组件
│   ├── Header.tsx      # 头部组件
│   ├── Message.tsx     # 消息组件
│   ├── MessageList.tsx # 消息列表组件
│   ├── LoadingMessage.tsx # 加载消息组件
│   ├── ExampleQueries.tsx # 示例查询组件
│   ├── InputArea.tsx   # 输入区域组件
│   └── WelcomeText.tsx # 欢迎文字组件
├── styles/             # 样式文件
│   ├── App.module.css  # 主样式
│   └── Message.module.css # 消息样式
├── types/              # TypeScript 类型定义
│   └── index.ts
├── utils/              # 工具函数
│   └── mockData.ts     # 模拟数据
├── App.tsx             # 主应用组件
└── index.tsx           # 应用入口
```

## 安装和运行

### 前置要求

确保您的系统已安装：
- Node.js (版本 16 或更高)
- npm 或 yarn

### 安装依赖

```bash
cd frontend/moviegpt-react
npm install
```

### 启动开发服务器

```bash
npm start
```

应用将在 http://localhost:3000 打开

### 构建生产版本

```bash
npm run build
```

## 组件说明

### Header
- 显示应用标题和品牌信息
- 响应式布局

### MessageList
- 管理消息列表显示
- 自动滚动到底部
- 自定义滚动条样式

### Message
- 单条消息显示
- 支持用户和AI消息
- 支持SQL查询结果展示

### InputArea
- 消息输入和发送
- 自动调整文本框高度
- 支持回车发送（Shift+Enter换行）
- 清除对话功能

### ExampleQueries
- 快捷查询示例
- 点击自动填充到输入框

### WelcomeText
- 欢迎文字显示
- 首次发送消息后自动隐藏

## 技术特点

- **TypeScript**: 完整的类型安全
- **CSS Modules**: 样式作用域隔离
- **React Hooks**: 使用 useState、useEffect、useCallback 等
- **ES6+**: 箭头函数、解构赋值等现代语法
- **响应式设计**: 适配移动设备
- **性能优化**: 使用 useCallback 优化渲染

## 浏览器支持

- Chrome (推荐)
- Firefox
- Safari
- Edge

## 开发说明

本项目完全重构自原始 HTML 页面，保持了：
- 完全相同的视觉效果
- 所有交互行为
- 响应式布局
- 动画效果
- 滚动条样式

同时增加了：
- 组件化架构
- TypeScript 类型安全
- 更好的代码组织
- 更易维护的结构 