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