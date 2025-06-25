#!/usr/bin/env python3
"""
MovieGPT 后端服务器启动脚本
"""

import os
import sys
from pathlib import Path

def check_dependencies():
    """检查必要的依赖是否已安装"""
    try:
        import flask
        import flask_cors
        import mysql.connector
        import google.genai
        from dotenv import load_dotenv
        print("✓ 所有依赖已安装")
        return True
    except ImportError as e:
        print(f"✗ 缺少依赖: {e}")
        print("\n请运行以下命令安装依赖:")
        print("pip install -r requirements.txt")
        return False

def check_env_file():
    """检查环境变量文件"""
    env_file = Path(".env")
    if not env_file.exists():
        print("✗ 未找到 .env 文件")
        print("\n请创建 .env 文件并配置以下变量:")
        print("GOOGLE_API_KEY=your_google_api_key")
        print("MYSQL_HOST=localhost")
        print("MYSQL_PORT=3306")
        print("MYSQL_USER=your_mysql_user")
        print("MYSQL_PASSWORD=your_mysql_password")
        print("MYSQL_DB=your_database_name")
        return False
    
    print("✓ 找到 .env 文件")
    return True

def main():
    print("🚀 启动 MovieGPT 后端服务器...")
    print("=" * 50)
    
    # 检查依赖
    if not check_dependencies():
        sys.exit(1)
    
    # 检查环境变量
    if not check_env_file():
        sys.exit(1)
    
    # 启动服务器
    try:
        from app import app
        print("\n✓ 所有检查通过，启动服务器...")
        print("📡 API服务地址: http://localhost:8000")
        print("🔗 健康检查: http://localhost:8000/health")
        print("\n按 Ctrl+C 停止服务器")
        print("=" * 50)
        
        app.run(
            host='0.0.0.0',
            port=8000,
            debug=True
        )
    except Exception as e:
        print(f"✗ 启动服务器失败: {e}")
        sys.exit(1)

if __name__ == "__main__":
    main() 