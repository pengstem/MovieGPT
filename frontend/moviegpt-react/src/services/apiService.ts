import { Message, ChatRequest, ChatResponse } from '../types';

// API服务配置
const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:8000';

// API回应数据类型
export interface APIResponse {
  text: string;
  sql?: string;
  data?: string;
  error?: string;
}

// 调用后端的chat接口
export const callLLMAPI = async (
  userInput: string, 
  conversationHistory?: Message[]
): Promise<APIResponse> => {
  try {
    // 构造请求体，只发送用户消息（后端会维护历史记录）
    const requestBody = {
      message: userInput,
    };

    const response = await fetch(`${API_BASE_URL}/api/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    
    // 后端返回的格式已经匹配我们的APIResponse
    return {
      text: data.text || '抱歉，我无法理解您的问题。',
      sql: data.sql,
      data: data.data,
      error: data.error,
    };
  } catch (error) {
    console.error('API调用失败:', error);
    return {
      text: '抱歉，服务暂时不可用，请稍后再试。',
      error: error instanceof Error ? error.message : '未知错误'
    };
  }
};

// 清除后端聊天历史
export const clearChatHistory = async (): Promise<boolean> => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/clear`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return true;
  } catch (error) {
    console.error('清除历史记录失败:', error);
    return false;
  }
};

// 获取后端聊天历史
export const getChatHistory = async (): Promise<Message[]> => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/history`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data.history || [];
  } catch (error) {
    console.error('获取历史记录失败:', error);
    return [];
  }
};

// 健康检查
export const healthCheck = async (): Promise<boolean> => {
  try {
    const response = await fetch(`${API_BASE_URL}/health`, {
      method: 'GET',
    });

    return response.ok;
  } catch (error) {
    console.error('健康检查失败:', error);
    return false;
  }
};

// 流式响应接口（可选使用）
export const callLLMAPIStream = async (
  userInput: string, 
  onToken: (token: string) => void,
  onComplete: (response: APIResponse) => void
): Promise<void> => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/chat/stream`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        message: userInput,
      }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const reader = response.body?.getReader();
    if (!reader) {
      throw new Error('无法读取响应流');
    }

    const decoder = new TextDecoder();
    let buffer = '';

    while (true) {
      const { done, value } = await reader.read();
      
      if (done) break;
      
      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      buffer = lines.pop() || '';

      for (const line of lines) {
        if (line.startsWith('data: ')) {
          const data = line.slice(6);
          if (data === '[DONE]') {
            return;
          }
          
          try {
            const parsed = JSON.parse(data);
            if (parsed.token) {
              onToken(parsed.token);
            }
            if (parsed.complete) {
              onComplete({
                text: parsed.text || '',
                sql: parsed.sql,
                data: parsed.data
              });
              return;
            }
          } catch (e) {
            console.warn('解析流数据失败:', e);
          }
        }
      }
    }
  } catch (error) {
    console.error('流式API调用失败:', error);
    onComplete({
      text: '抱歉，服务暂时不可用，请稍后再试。',
      error: error instanceof Error ? error.message : '未知错误'
    });
  }
}; 