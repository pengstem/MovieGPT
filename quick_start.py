#!/usr/bin/env python3
"""
MovieGPT 快速启动脚本 - 无需数据库配置
"""

import subprocess
import sys
import time
from pathlib import Path
import webbrowser


def start_frontend():
    """启动前端服务"""
    print("🚀 启动 React 前端服务...")
    frontend_dir = Path("frontend/moviegpt-react")

    try:
        process = subprocess.Popen(
            ["npm", "start"],
            cwd=frontend_dir,
            shell=True,
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE,
            text=True,
        )
        print("✓ 前端服务已启动在 http://localhost:3000")
        return process
    except Exception as e:
        print(f"✗ 启动前端失败: {e}")
        return None


def start_backend():
    """启动后端服务"""
    print("🚀 启动 FastAPI 后端服务...")
    backend_dir = Path("backend")

    try:
        process = subprocess.Popen(
            [sys.executable, "fastapi_backend.py"],
            cwd=backend_dir,
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE,
            text=True,
        )
        print("✓ 后端服务已启动在 http://localhost:8000")
        return process
    except Exception as e:
        print(f"✗ 启动后端失败: {e}")
        return None


def main():
    print("🎬 MovieGPT 快速启动")
    print("=" * 50)
    print("⚠️  注意：当前使用模拟数据运行，如需完整功能请配置数据库")
    print()

    # 启动后端
    backend_process = start_backend()
    if not backend_process:
        print("后端启动失败，但前端仍可查看界面")

    # 等待后端启动
    time.sleep(2)

    # 启动前端
    frontend_process = start_frontend()
    if not frontend_process:
        print("前端启动失败")
        if backend_process:
            backend_process.terminate()
        sys.exit(1)

    # 等待前端启动
    print("⏳ 等待前端完全启动...")
    time.sleep(5)

    # 打开浏览器
    print("🌐 正在打开浏览器...")
    try:
        webbrowser.open("http://localhost:3000")
    except:
        pass

    print("\n✅ MovieGPT 已启动")
    print("前端: http://localhost:3000")
    print("后端: http://localhost:8000")
    print("\n📝 使用说明:")
    print("- 当前使用模拟电影数据")
    print("- 要获得完整功能，请配置MySQL数据库和Google API密钥")
    print("- 按 Ctrl+C 停止所有服务")
    print()

    try:
        # 等待用户中断
        while True:
            time.sleep(1)
    except KeyboardInterrupt:
        print("\n🛑 正在停止服务...")
        if backend_process:
            backend_process.terminate()
        if frontend_process:
            frontend_process.terminate()
        print("✓ 服务已停止")


if __name__ == "__main__":
    main() 