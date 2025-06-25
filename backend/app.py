from flask import Flask, request, jsonify, Response
from flask_cors import CORS
import json
from Schema import chat, chat_history
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

        # 调用Schema.py中的chat函数
        ai_response = chat(user_message)
        logger.info(f"AI回复: {ai_response}")

        # 解析回复，检查是否包含SQL查询
        # 这里可以根据需要进一步解析AI回复的格式
        response_data = {"text": ai_response, "sql": None, "data": None}

        # 如果AI回复中包含特定格式，可以解析出SQL和数据
        # 这部分可以根据Gemini回复的具体格式来调整

        return jsonify(response_data)

    except Exception as e:
        logger.error(f"处理请求时出错: {str(e)}")
        return jsonify(
            {"text": "抱歉，服务遇到了问题，请稍后再试。", "error": str(e)}
        ), 500


@app.route("/api/chat/stream", methods=["POST"])
def api_chat_stream():
    """流式响应接口（可选）"""
    try:
        data = request.get_json()

        if not data or "message" not in data:
            return jsonify({"error": "缺少message参数"}), 400

        user_message = data["message"]

        def generate():
            try:
                # 调用chat函数获取完整回复
                ai_response = chat(user_message)

                # 模拟流式输出（逐字输出）
                for i, char in enumerate(ai_response):
                    chunk_data = {"token": char, "complete": i == len(ai_response) - 1}
                    yield f"data: {json.dumps(chunk_data, ensure_ascii=False)}\n\n"

                # 发送完成信号
                yield f"data: {json.dumps({'complete': True, 'text': ai_response}, ensure_ascii=False)}\n\n"
                yield "data: [DONE]\n\n"

            except Exception as e:
                error_data = {
                    "error": str(e),
                    "text": "抱歉，服务遇到了问题，请稍后再试。",
                }
                yield f"data: {json.dumps(error_data, ensure_ascii=False)}\n\n"

        return Response(generate(), mimetype="text/plain")

    except Exception as e:
        logger.error(f"流式处理请求时出错: {str(e)}")
        return jsonify(
            {"text": "抱歉，服务遇到了问题，请稍后再试。", "error": str(e)}
        ), 500


@app.route("/api/history", methods=["GET"])
def get_chat_history():
    """获取聊天历史"""
    try:
        # 将Gemini的Content格式转换为前端需要的格式
        history = []
        for content in chat_history:
            if hasattr(content, "role") and hasattr(content, "parts"):
                role = "user" if content.role == "user" else "assistant"
                text = content.parts[0].text if content.parts else ""
                history.append(
                    {
                        "id": f"{len(history)}",
                        "type": role,
                        "text": text,
                        "timestamp": 0,  # 可以添加实际时间戳
                    }
                )

        return jsonify({"history": history})

    except Exception as e:
        logger.error(f"获取历史记录时出错: {str(e)}")
        return jsonify({"error": str(e)}), 500


@app.route("/api/clear", methods=["POST"])
def clear_history():
    """清除聊天历史"""
    try:
        global chat_history
        chat_history.clear()
        return jsonify({"message": "历史记录已清除"})

    except Exception as e:
        logger.error(f"清除历史记录时出错: {str(e)}")
        return jsonify({"error": str(e)}), 500


@app.route("/health", methods=["GET"])
def health_check():
    """健康检查"""
    return jsonify({"status": "healthy", "service": "MovieGPT API"})


if __name__ == "__main__":
    print("启动MovieGPT API服务器...")
    print("API端点:")
    print("  POST /api/chat - 发送消息")
    print("  POST /api/chat/stream - 流式聊天")
    print("  GET /api/history - 获取历史")
    print("  POST /api/clear - 清除历史")
    print("  GET /health - 健康检查")

    app.run(host="0.0.0.0", port=8000, debug=True)

