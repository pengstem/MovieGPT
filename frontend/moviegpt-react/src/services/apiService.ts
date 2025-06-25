import { Message, ChatRequest, ChatResponse } from '../types';

// API服务配置
const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:8000';
const API_KEY = process.env.REACT_APP_API_KEY;

// API回应数据类型
export interface APIResponse {
  text: string;
  sql?: string;
  data?: string;
  error?: string;
}

// 调用大模型API（支持对话历史）
export const callLLMAPI = async (
  userInput: string, 
  conversationHistory?: Message[]
): Promise<APIResponse> => {
  try {
    const requestBody: ChatRequest = {
      message: userInput,
      conversationHistory: conversationHistory?.slice(-10), // 只发送最近10条消息
    };

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    // 如果有API密钥，添加到headers
    if (API_KEY) {
      headers['Authorization'] = `Bearer ${API_KEY}`;
    }

    const response = await fetch(`${API_BASE_URL}/api/chat`, {
      method: 'POST',
      headers,
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data: ChatResponse = await response.json();
    
    // 根据后端返回的数据结构进行适配
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

// 如果需要支持流式响应（打字机效果）
export const callLLMAPIStream = async (
  userInput: string, 
  onToken: (token: string) => void,
  onComplete: (response: APIResponse) => void,
  conversationHistory?: Message[]
): Promise<void> => {
  try {
    const requestBody: ChatRequest = {
      message: userInput,
      conversationHistory: conversationHistory?.slice(-10),
    };

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    if (API_KEY) {
      headers['Authorization'] = `Bearer ${API_KEY}`;
    }

    const response = await fetch(`${API_BASE_URL}/api/chat/stream`, {
      method: 'POST',
      headers,
      body: JSON.stringify(requestBody),
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
            onComplete({ text: '' });
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