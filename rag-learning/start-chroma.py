#!/usr/bin/env python3
"""
启动 ChromaDB 服务
"""
import subprocess
import sys
import time

def main():
    print("🚀 正在启动 ChromaDB...")

    # 检查是否已安装
    try:
        import chromadb
        print("✅ ChromaDB 已安装")
    except ImportError:
        print("📦 正在安装 ChromaDB...")
        subprocess.check_call([sys.executable, "-m", "pip", "install", "chromadb"])
        print("✅ ChromaDB 安装完成")

    print("🌐 启动 ChromaDB 服务...")
    print("   地址: http://localhost:8000")
    print("   数据路径: ./chroma_data")
    print("\n⚠️  按 Ctrl+C 停止服务\n")

    try:
        # 尝试新的启动方式
        try:
            subprocess.run([
                "chroma", "run",
                "--host", "localhost",
                "--port", "8000",
                "--path", "./chroma_data"
            ])
        except FileNotFoundError:
            # 如果 chroma 命令不存在，尝试用 python 方式
            subprocess.run([
                sys.executable, "-m", "chroma", "run",
                "--host", "localhost",
                "--port", "8000",
                "--path", "./chroma_data"
            ])
    except KeyboardInterrupt:
        print("\n✅ ChromaDB 服务已停止")

if __name__ == "__main__":
    main()
