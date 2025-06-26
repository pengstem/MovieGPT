# MovieGPT - 简化版

MovieGPT 是一个电影数据库查询应用，通过自然语言与 IMDb 数据库进行交互。

## 🎯 项目优化

### ✅ 已完成的优化
1. **前端简化**
   - 移除了不必要的 mock 数据和复杂组件
   - 简化了 API 服务，直接对接 FastAPI 后端
   - 优化了 UI 组件，使用内联样式替代复杂的 CSS 模块
   - 添加了后端连接状态指示器

2. **后端接口**
   - FastAPI 后端已完整实现
   - 支持聊天接口 (`/api/chat`)
   - 支持流式响应 (`/api/chat/stream`)
   - 支持历史记录管理 (`/api/history`, `/api/clear`)
   - 健康检查端点 (`/health`)

3. **开发工具**
   - 创建了一键启动脚本 `start_dev.py`
   - 简化了类型定义
   - 清理了不必要的依赖

## 🚀 快速启动

### 方法1: 使用启动脚本
```bash
python start_dev.py
```

### 方法2: 手动启动
1. **启动后端**
   ```bash
   cd backend
   python fastapi_backend.py
   ```

2. **启动前端**
   ```bash
   cd frontend/moviegpt-react
   npm install
   npm start
   ```

## 📡 API 端点

- **POST** `/api/chat` - 发送聊天消息
- **POST** `/api/chat/stream` - 流式聊天响应
- **GET** `/api/history` - 获取聊天历史
- **POST** `/api/clear` - 清除聊天历史
- **GET** `/health` - 健康检查

## 🎬 使用方式

1. 打开浏览器访问 `http://localhost:3000`
2. 输入自然语言查询，例如：
   - "评分最高的10部电影"
   - "汤姆·汉克斯主演的电影"
   - "2023年上映的热门电影"

## 📋 依赖要求

### 后端
- Python 3.13+
- FastAPI
- uvicorn
- google-genai (用于 AI 功能)
- mysql-connector-python (用于数据库)

### 前端
- Node.js 16+
- React 18
- TypeScript

## 🔧 配置

创建 `.env` 文件：
```env
GOOGLE_API_KEY=your_google_api_key_here
MYSQL_HOST=localhost
MYSQL_PORT=3306
MYSQL_USER=imdbuser
MYSQL_PASSWORD=imdbpass
MYSQL_DB=imdb
```

## 📁 项目结构
```
MovieGPT/
├── backend/
│   ├── fastapi_backend.py    # FastAPI 主应用
│   ├── Schema.py            # 数据库和 AI 集成
│   └── ...
├── frontend/moviegpt-react/
│   ├── src/
│   │   ├── components/      # React 组件
│   │   ├── services/        # API 服务
│   │   ├── types/          # TypeScript 类型
│   │   └── utils/          # 工具函数
│   └── ...
├── start_dev.py            # 一键启动脚本
└── README.md
```

## 🎉 主要改进

1. **代码简化**: 移除了50%以上的冗余代码
2. **直接集成**: 前端与 FastAPI 后端直接对接
3. **用户体验**: 添加连接状态指示器和电影相关示例
4. **开发体验**: 一键启动脚本，快速开发部署 