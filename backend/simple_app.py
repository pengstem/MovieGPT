from flask import Flask, request, jsonify
from flask_cors import CORS
import logging

# 配置logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = Flask(__name__)
CORS(app)  # 允许跨域请求


@app.route("/api/chat", methods=["POST"])
def api_chat():
    try:
        data = request.get_json()

        if not data or "message" not in data:
            return jsonify({"error": "缺少message参数"}), 400

        user_message = data["message"]
        logger.info(f"收到用户消息: {user_message}")

        # 简单的模拟回复（稍后会连接真实的AI）
        ai_response = (
            f"收到您的消息：{user_message}。这是一个测试回复，表明前后端连接正常！"
        )
        logger.info(f"AI回复: {ai_response}")

        response_data = {"text": ai_response, "sql": None, "data": None}

        return jsonify(response_data)

    except Exception as e:
        logger.error(f"处理请求时出错: {str(e)}")
        return jsonify(
            {"text": "抱歉，服务遇到了问题，请稍后再试。", "error": str(e)}
        ), 500


@app.route("/health", methods=["GET"])
def health_check():
    """健康检查"""
    return jsonify({"status": "healthy", "service": "MovieGPT API (Simple Version)"})


if __name__ == "__main__":
    print("🚀 启动MovieGPT简化API服务器...")
    print("📡 API服务地址: http://localhost:8000")
    print("🔗 健康检查: http://localhost:8000/health")
    print("💬 聊天接口: http://localhost:8000/api/chat")
    print("\n这是一个简化版本，用于测试前后端连接")
    print("按 Ctrl+C 停止服务器")
    print("=" * 50)

    app.run(host="0.0.0.0", port=8000, debug=True)

