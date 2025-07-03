# MovieGPT

[English](README.md) | [中文](README.zh-CN.md)

<div align="center">

![Python](https://img.shields.io/badge/Python-3.13+-blue?style=flat-square&logo=python&logoColor=white)
![FastAPI](https://img.shields.io/badge/FastAPI-0.115+-green?style=flat-square&logo=fastapi&logoColor=white)
![React](https://img.shields.io/badge/React-18.2+-61DAFB?style=flat-square&logo=react&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-4.7+-3178C6?style=flat-square&logo=typescript&logoColor=white)
![MySQL](https://img.shields.io/badge/MySQL-8.4-4479A1?style=flat-square&logo=mysql&logoColor=white)
![Docker](https://img.shields.io/badge/Docker-Compose-2496ED?style=flat-square&logo=docker&logoColor=white)
![License](https://img.shields.io/badge/License-GPL_v3-red?style=flat-square)

**一个基于自然语言的IMDb电影数据库查询助手**

 使用 Google Gemini AI | FastAPI 后端 | React 前端 | Docker 部署

</div>

---

## 项目简介

MovieGPT 是一个概念验证的聊天助手，让你可以使用自然语言探索本地的 IMDb 电影数据库。后端使用 Google Gemini 将你的问题转换为 SQL 查询并在 MySQL 实例上执行。基于 React 的前端提供简洁的聊天界面，包含示例提示和消息历史。

### 核心特性

| 特性 | 描述 |
|------|------|
| **自然语言查询** | 用自然语言提问电影数据集，Gemini 生成 SQL 并在 MySQL 上执行 |
| **流式/批量响应** | FastAPI 后端支持常规 JSON 响应和可选的流式传输 |
| **示例提示 & 历史** | React 客户端包含示例查询，在内存中保存聊天历史并可清除 |
| **Docker 化 MySQL** | 使用 `docker-compose` 提供 MySQL 8 实例，首次启动时通过 `db/init.sql` 加载 IMDb TSV 文件 |
| **一键启动** | 使用 `start_dev.py` 脚本一键启动开发环境 |
| **深色模式切换** | 前端可在明暗主题间切换 |
| **电影信息面板** | 点击影片名称可从 OMDb 获取详情 |

---

## 项目架构

```
MovieGPT
├── backend/       # FastAPI 服务器和 Gemini 集成
│  ├── fastapi_backend.py  # 主要的 FastAPI 应用
│  ├── get_info.py     # 外部 API 信息获取
│  └── Schema.py      # 数据库架构和集成
├── frontend/       # React 客户端 (TypeScript)
│  └── moviegpt-react/   # 主前端应用
│    ├── src/components/ # React 组件
│    ├── src/services/  # API 服务
│    └── src/styles/   # CSS 模块
├── db/          # SQL 脚本用于加载 IMDb 数据集
│  └── init.sql       # 数据库初始化脚本
├── docker-compose.yml  # 启动 MySQL 服务
└── start_dev.py     # 开发环境一键启动脚本
```

---

## 快速开始

### 先决条件

- Python 3.13+
- Node.js 16+
- Docker & Docker Compose
- Google Gemini API 密钥

### 安装步骤

#### 1. 克隆项目
```bash
git clone <your-repo-url>
cd MovieGPT
```

#### 2. 启动 MySQL 数据库
```bash
docker-compose up -d
```
> 首次运行将使用 `db/init.sql` 导入 IMDb 数据

#### 3. 配置环境变量
创建 `.env` 文件并添加以下配置：
```env
# Google Gemini API
GOOGLE_API_KEY=your_gemini_api_key_here

# MySQL 数据库配置
MYSQL_HOST=localhost
MYSQL_PORT=3306
MYSQL_USER=imdbuser
MYSQL_PASSWORD=imdbpass
MYSQL_DB=imdb

# OMDb API（可选）
OMDB_API_KEY=your_omdb_api_key_here

# 可选：自定义系统提示
SYSTEM_PROMPT=你是一个专业的电影数据库查询助手...
```

如需更改前端调用地址，可在 `frontend/moviegpt-react/.env` 中设置 `REACT_APP_API_BASE_URL`。

#### 4. 安装 Python 依赖
```bash
# 使用 pip
pip install -r requirements.txt

# 或使用 uv (推荐)
uv install
```

#### 5. 一键启动开发环境 
```bash
python start_dev.py
```

这将自动：
- 启动 FastAPI 后端 (http://localhost:8000)
- 启动 React 前端 (http://localhost:3000)
- 打开浏览器访问应用

### 手动启动 (可选)

如果你喜欢手动控制：

**启动后端：**
```bash
cd backend
uvicorn fastapi_backend:app --host 0.0.0.0 --port 8000 --reload
```

**启动前端：**
```bash
cd frontend/moviegpt-react
npm install
npm start
```

---

## API 端点

### 后端 API (FastAPI)

| 端点 | 方法 | 描述 |
|------|------|------|
| `/api/chat` | POST | 发送用户消息并获取助手回复 |
| `/api/chat/stream` | POST | 同上，但以服务器发送事件流返回 |
| `/api/info/{imdb_id}` | GET | 通过 IMDb ID 从 OMDb 获取额外电影信息 |
| `/api/history` | GET | 检索对话历史 |
| `/api/clear` | POST | 清除存储的历史 |
| `/health` | GET | 健康检查（前端使用） |

### 环境变量配置

| 变量名 | 描述 | 默认值 |
|--------|------|--------|
| `GOOGLE_API_KEY` | Gemini API 密钥 | 必需 |
| `MYSQL_HOST` | MySQL 主机 | localhost |
| `MYSQL_PORT` | MySQL 端口 | 3306 |
| `MYSQL_USER` | MySQL 用户名 | imdbuser |
| `MYSQL_PASSWORD` | MySQL 密码 | imdbpass |
| `MYSQL_DB` | MySQL 数据库名 | imdb |
| `SYSTEM_PROMPT` | 自定义系统提示 | 可选 |
| `OMDB_API_KEY` | OMDb API 密钥，用于 `/api/info` 接口 | 可选 |

---

## 前端特性

### 组件结构
- **InputArea** - 用户输入区域
- **MessageList** - 消息历史显示
- **LoadingMessage** - 加载状态指示器
- **ExampleQueries** - 示例查询按钮
- **SimpleConfirmDialog** - 确认对话框
- **Markdown 渲染** - 使用 `react-markdown` 显示回复
- **MovieInfoPanel** - 点击标题展示电影详情
- **ThemeToggleButton** - 明暗主题切换

### 样式系统
- 响应式设计
- CSS 模块化
- 现代 UI 组件
- 深色主题支持

---

## 开发

### 开发模式
```bash
# 一键启动开发环境
python start_dev.py

# 或分别启动
# 后端开发模式 (热重载)
uvicorn backend.fastapi_backend:app --reload

# 前端开发模式
cd frontend/moviegpt-react && npm start
```

### 测试

```bash
# 后端测试
python -m pytest backend/

# 前端测试
cd frontend/moviegpt-react
npm test
```

### 构建生产版本

```bash
# 构建前端
cd frontend/moviegpt-react
npm run build

# 后端直接使用 uvicorn 部署
uvicorn backend.fastapi_backend:app --host 0.0.0.0 --port 8000
```

---

## Docker 部署

### 当前配置
项目当前包含 MySQL 的 Docker 配置。完整的容器化部署正在开发中。

```bash
# 启动 MySQL 服务
docker-compose up -d

# 查看服务状态
docker-compose ps

# 停止服务
docker-compose down
```

### 即将推出
- 后端 Dockerfile
- 前端 Dockerfile 
- 完整的 docker-compose 编排

---

## 使用示例

### 示例查询

```
用户: "找出评分最高的10部电影"
助手: 执行SQL查询并返回结果...

用户: "哪些电影是2020年上映的？"
助手: 生成相应查询并显示结果...

用户: "告诉我关于《肖申克的救赎》的信息"
助手: 查询并返回详细的电影信息...
```

---

## 路线图

查看 [TODO.md](TODO.md) 了解完整的开发计划。

### 近期目标
- [ ] 完整 Docker 容器化
- [ ] 用户认证系统
- [ ] 查询缓存优化
- [x] 深色模式支持

### 长期规划
- [ ] Slack/Discord 机器人集成
- [ ] 多语言本地化
- [ ] 移动端适配
- [ ] 高级搜索功能

---

## 贡献

欢迎贡献！请遵循以下步骤：

1. Fork 项目
2. 创建特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 开启 Pull Request

---

## 许可证

本项目采用 GNU General Public License v3.0 许可证 - 查看 [LICENSE](LICENSE) 文件了解详情。

---

## 致谢

- [Google Gemini](https://ai.google.dev/) - AI 语言模型
- [IMDb](https://www.imdb.com/) - 电影数据库
- [FastAPI](https://fastapi.tiangolo.com/) - 现代 Python Web 框架
- [React](https://reactjs.org/) - 用户界面库
- [Docker](https://www.docker.com/) - 容器化平台

---

<div align="center">

** 享受与 MovieGPT 的对话吧！**

如果这个项目对你有帮助，请考虑 Star 这个仓库！

</div>
