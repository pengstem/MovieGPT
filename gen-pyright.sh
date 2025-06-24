#!/usr/bin/env bash
set -e

# 通过 uv run which python 找到 venv 里 python 的绝对路径
PYTHON_PATH=$(uv run which python)
# 上两级就是 venv 根目录
VENV_DIR=$(dirname "$(dirname "$PYTHON_PATH")")
VENV_NAME=$(basename "$VENV_DIR")
VENV_PARENT=$(dirname "$VENV_DIR")

cat >pyrightconfig.json <<EOF
{
  "venvPath": "${VENV_PARENT}",
  "venv": "${VENV_NAME}",
  "pythonVersion": "3.x",
  "pythonPlatform": "Linux",
  "extraPaths": [
    ".",
    "backend",
    "src"
  ]
}
EOF

echo "✅ pyrightconfig.json 已更新 (venv: ${VENV_NAME})"
