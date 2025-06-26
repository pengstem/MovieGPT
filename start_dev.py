#!/usr/bin/env python3
"""
MovieGPT 开发环境启动脚本
"""

import subprocess
import sys
import os
import time
import webbrowser
from pathlib import Path
import platform

def check_requirements():
    """检查必要的依赖是否已安装"""
    try:
        import fastapi
        import uvicorn
        print("✓ FastAPI 已安装")
    except ImportError:
        print("✗ 缺少 FastAPI 依赖")
        print("请运行: pip install fastapi uvicorn")
        return False
    
    # 检查 Node.js
    try:
        cmd = ['node', '--version']
        result = subprocess.run(cmd, capture_output=True, text=True, shell=True)
        if result.returncode == 0:
            print(f"✓ Node.js 已安装: {result.stdout.strip()}")
        else:
            print("✗ Node.js 未安装")
            return False
    except FileNotFoundError:
        print("✗ Node.js 未安装")
        return False
    
    return True

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
            text=True
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
    is_windows = platform.system() == 'Windows'
    
    # 安装依赖
    print("📦 安装前端依赖...")
    try:
        if is_windows:
            # Windows系统使用shell=True
            npm_install = subprocess.run(['npm', 'install'], cwd=frontend_dir, shell=True)
        else:
            # Unix/Linux系统
            npm_install = subprocess.run(['npm', 'install'], cwd=frontend_dir)
            
        if npm_install.returncode != 0:
            print("✗ 前端依赖安装失败")
            return None
    except Exception as e:
        print(f"✗ 前端依赖安装失败: {e}")
        return None
    
    # 启动前端
    try:
        if is_windows:
            # Windows系统使用shell=True
            process = subprocess.Popen(
                ['npm', 'start'],
                cwd=frontend_dir,
                stdout=subprocess.PIPE,
                stderr=subprocess.PIPE,
                text=True,
                shell=True
            )
        else:
            # Unix/Linux系统
            process = subprocess.Popen(
                ['npm', 'start'],
                cwd=frontend_dir,
                stdout=subprocess.PIPE,
                stderr=subprocess.PIPE,
                text=True
            )
        print("✓ 前端服务已启动在 http://localhost:3000")
        return process
    except Exception as e:
        print(f"✗ 启动前端失败: {e}")
        return None

def main():
    print("🎬 MovieGPT 开发环境启动")
    print("=" * 50)
    
    # 检查依赖
    if not check_requirements():
        sys.exit(1)
    
    # 启动后端
    backend_process = start_backend()
    if not backend_process:
        sys.exit(1)
    
    # 等待后端启动
    time.sleep(3)
    
    # 启动前端
    frontend_process = start_frontend()
    if not frontend_process:
        if backend_process:
            backend_process.terminate()
        sys.exit(1)
    
    # 等待前端启动
    print("⏳ 等待前端启动...")
    time.sleep(10)
    
    # 打开浏览器
    print("🌐 正在打开浏览器...")
    try:
        webbrowser.open('http://localhost:3000')
    except Exception as e:
        print(f"无法自动打开浏览器: {e}")
        print("请手动访问: http://localhost:3000")
    
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