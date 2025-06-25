# 环境安装指南

## Node.js 安装

由于您的系统中没有安装 Node.js，请按照以下步骤安装：

### 方法 1: 从官网下载安装 (推荐)

1. 访问 Node.js 官网：https://nodejs.org/
2. 下载 LTS 版本 (推荐，当前版本为 20.x)
3. 运行安装程序，按照向导完成安装
4. 安装完成后，重新打开 PowerShell
5. 验证安装：`node --version` 和 `npm --version`

### 方法 2: 使用 Chocolatey 安装

如果您想使用包管理器，可以先安装 Chocolatey：

1. 以管理员身份打开 PowerShell
2. 运行以下命令安装 Chocolatey：
   ```powershell
   Set-ExecutionPolicy Bypass -Scope Process -Force; [System.Net.ServicePointManager]::SecurityProtocol = [System.Net.ServicePointManager]::SecurityProtocol -bor 3072; iex ((New-Object System.Net.WebClient).DownloadString('https://community.chocolatey.org/install.ps1'))
   ```
3. 安装 Node.js：`choco install nodejs`

### 方法 3: 使用 Winget 安装

如果您的系统支持 Winget (Windows 10 版本 1809 以上)：

```powershell
winget install OpenJS.NodeJS
```

## 安装完成后

1. 重新打开 PowerShell 或命令提示符
2. 验证安装：
   ```bash
   node --version
   npm --version
   ```
3. 进入项目目录：
   ```bash
   cd frontend/moviegpt-react
   ```
4. 安装项目依赖：
   ```bash
   npm install
   ```
5. 启动开发服务器：
   ```bash
   npm start
   ```

## 可能遇到的问题

### 问题 1: 命令不识别
- 重新打开终端/PowerShell
- 检查环境变量 PATH 是否包含 Node.js 路径

### 问题 2: 权限问题
- 以管理员身份运行 PowerShell
- 或者修改 npm 全局包的安装位置

### 问题 3: 网络问题
- 如果下载慢，可以使用淘宝镜像：
  ```bash
  npm config set registry https://registry.npmmirror.com/
  ```

## 替代方案

如果暂时无法安装 Node.js，您可以：

1. 使用在线 IDE（如 CodeSandbox、StackBlitz）
2. 使用 Docker 运行 Node.js 环境
3. 在 GitHub Codespaces 中运行

## 验证项目

安装完成后，运行项目验证一切正常：

```bash
cd frontend/moviegpt-react
npm install
npm start
```

浏览器应该会自动打开 http://localhost:3000，显示 MovieGPT 界面。 