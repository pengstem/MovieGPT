export interface Message {
  id: string;
  type: 'user' | 'assistant';
  text: string;
  sql?: string;
  data?: string;
  timestamp: number;
}

export interface MockResponse {
  text: string;
  sql: string;
  data: string;
}

// API相关类型
export interface ChatRequest {
  message: string;
  conversationHistory?: Message[];
  userId?: string;
}

export interface ChatResponse {
  text: string;
  sql?: string;
  data?: string;
  error?: string;
  conversationId?: string;
}

// 流式响应类型
export interface StreamToken {
  token: string;
  complete?: boolean;
} 