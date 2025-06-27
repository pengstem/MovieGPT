#!/usr/bin/env python3
"""
MovieGPT 开发环境启动脚本
"""

import subprocess
import sys
import time
from pathlib import Path
import platform


def start_backend():
    """启动后端服务"""
    print("🚀 启动 FastAPI 后端服务...")
    backend_dir = Path("backend")

    # 启动 FastAPI 后端
    cmd = [sys.executable, "fastapi_backend.py"]

    try:
        process = subprocess.Popen(
            cmd,
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


def start_frontend():
    """启动前端服务"""
    print("🚀 启动 React 前端服务...")
    frontend_dir = Path("frontend/moviegpt-react")

    # 检查是否是Windows系统
    is_windows = platform.system() == "Windows"

    # 启动前端
    try:
        if is_windows:
            # Windows系统使用shell=True
            process = subprocess.Popen(
                ["npm", "start"],
                cwd=frontend_dir,
                stdout=subprocess.PIPE,
                stderr=subprocess.PIPE,
                text=True,
                shell=True,
            )
        else:
            # Unix/Linux系统
            process = subprocess.Popen(
                ["npm", "start"],
                cwd=frontend_dir,
                stdout=subprocess.PIPE,
                stderr=subprocess.PIPE,
                text=True,
            )
        print("✓ 前端服务已启动在 http://localhost:3000")
        return process
    except Exception as e:
        print(f"✗ 启动前端失败: {e}")
        return None


def main():
    print("🎬 MovieGPT 开发环境启动")
    print("=" * 50)

    # 启动后端
    backend_process = start_backend()
    if not backend_process:
        sys.exit(1)

    # 等待后端启动
    time.sleep(1)

    # 启动前端
    frontend_process = start_frontend()
    if not frontend_process:
        if backend_process:
            backend_process.terminate()
        sys.exit(1)

    # 等待前端启动
    print("⏳ 等待前端启动...")
    time.sleep(1)

    # 打开浏览器
    print("🌐 正在打开浏览器...")
    print("\n✅ MovieGPT 开发环境已启动")
    print("前端: http://localhost:3000")
    print("后端: http://localhost:8000")
    print("按 Ctrl+C 停止服务")

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
