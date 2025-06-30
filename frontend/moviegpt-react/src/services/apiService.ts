import { Message } from '../types';

// API服务配置
const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:8000';

// 启用Mock模式的标志
let USE_MOCK_MODE = true; // 设置为 true 以使用Mock模式

// API响应数据类型
export interface APIResponse {
  text: string;
  sql?: string;
  data?: any;
  results?: any[];
  error?: string;
}

// Mock响应数据
const mockResponses = [
  {
    text: "以下是评分最高的10部电影，这些都是影史经典之作，值得反复观看和品味。",
    sql: `<span style="color: #569CD6;">SELECT</span> title, release_year, rating, genre<br><span style="color: #569CD6;">FROM</span> movies<br><span style="color: #569CD6;">ORDER BY</span> rating <span style="color: #569CD6;">DESC</span><br><span style="color: #569CD6;">LIMIT</span> <span style="color: #B5CEA8;">10</span>`,
    data: `<table border="1" style="border-collapse: collapse; width: 100%; font-size: 12px;">
<tr style="background: #f0f0f0;">
<th style="padding: 8px; text-align: left;">电影名称</th>
<th style="padding: 8px; text-align: left;">年份</th>
<th style="padding: 8px; text-align: left;">评分</th>
<th style="padding: 8px; text-align: left;">类型</th>
</tr>
<tr><td style="padding: 6px;">肖申克的救赎</td><td style="padding: 6px;">1994</td><td style="padding: 6px;"><strong>9.3</strong></td><td style="padding: 6px;">剧情</td></tr>
<tr><td style="padding: 6px;">教父</td><td style="padding: 6px;">1972</td><td style="padding: 6px;"><strong>9.2</strong></td><td style="padding: 6px;">犯罪/剧情</td></tr>
<tr><td style="padding: 6px;">教父2</td><td style="padding: 6px;">1974</td><td style="padding: 6px;"><strong>9.0</strong></td><td style="padding: 6px;">犯罪/剧情</td></tr>
<tr><td style="padding: 6px;">黑暗骑士</td><td style="padding: 6px;">2008</td><td style="padding: 6px;"><strong>9.0</strong></td><td style="padding: 6px;">动作/犯罪</td></tr>
<tr><td style="padding: 6px;">十二怒汉</td><td style="padding: 6px;">1957</td><td style="padding: 6px;"><strong>8.9</strong></td><td style="padding: 6px;">剧情</td></tr>
</table>`
  },
  {
    text: "克里斯托弗·诺兰是当代最具影响力的导演之一，以其复杂的叙事结构和视觉奇观著称。",
    sql: `<span style="color: #569CD6;">SELECT</span> title, release_year, rating, duration<br><span style="color: #569CD6;">FROM</span> movies<br><span style="color: #569CD6;">WHERE</span> director = <span style="color: #CE9178;">'Christopher Nolan'</span><br><span style="color: #569CD6;">ORDER BY</span> release_year <span style="color: #569CD6;">DESC</span>`,
    data: `<table border="1" style="border-collapse: collapse; width: 100%; font-size: 12px;">
<tr style="background: #f0f0f0;">
<th style="padding: 8px; text-align: left;">电影名称</th>
<th style="padding: 8px; text-align: left;">年份</th>
<th style="padding: 8px; text-align: left;">评分</th>
<th style="padding: 8px; text-align: left;">时长</th>
</tr>
<tr><td style="padding: 6px;">信条</td><td style="padding: 6px;">2020</td><td style="padding: 6px;">7.8</td><td style="padding: 6px;">150分钟</td></tr>
<tr><td style="padding: 6px;">敦刻尔克</td><td style="padding: 6px;">2017</td><td style="padding: 6px;">8.5</td><td style="padding: 6px;">106分钟</td></tr>
<tr><td style="padding: 6px;">星际穿越</td><td style="padding: 6px;">2014</td><td style="padding: 6px;">8.7</td><td style="padding: 6px;">169分钟</td></tr>
<tr><td style="padding: 6px;">黑暗骑士崛起</td><td style="padding: 6px;">2012</td><td style="padding: 6px;">8.4</td><td style="padding: 6px;">165分钟</td></tr>
<tr><td style="padding: 6px;">盗梦空间</td><td style="padding: 6px;">2010</td><td style="padding: 6px;">8.8</td><td style="padding: 6px;">148分钟</td></tr>
</table>`
  },
  {
    text: "2023年是电影业复苏的重要一年，出现了许多优秀的作品。",
    sql: `<span style="color: #569CD6;">SELECT</span> title, genre, rating, box_office<br><span style="color: #569CD6;">FROM</span> movies<br><span style="color: #569CD6;">WHERE</span> release_year = <span style="color: #B5CEA8;">2023</span><br><span style="color: #569CD6;">ORDER BY</span> rating <span style="color: #569CD6;">DESC</span>`,
    data: `<table border="1" style="border-collapse: collapse; width: 100%; font-size: 12px;">
<tr style="background: #f0f0f0;">
<th style="padding: 8px; text-align: left;">电影名称</th>
<th style="padding: 8px; text-align: left;">类型</th>
<th style="padding: 8px; text-align: left;">评分</th>
<th style="padding: 8px; text-align: left;">票房</th>
</tr>
<tr><td style="padding: 6px;">奥本海默</td><td style="padding: 6px;">传记/历史</td><td style="padding: 6px;"><strong>8.6</strong></td><td style="padding: 6px;">9.5亿美元</td></tr>
<tr><td style="padding: 6px;">芭比</td><td style="padding: 6px;">喜剧/奇幻</td><td style="padding: 6px;">7.9</td><td style="padding: 6px;">14.4亿美元</td></tr>
<tr><td style="padding: 6px;">蜘蛛侠：纵横宇宙</td><td style="padding: 6px;">动画/科幻</td><td style="padding: 6px;">8.8</td><td style="padding: 6px;">6.9亿美元</td></tr>
<tr><td style="padding: 6px;">银河护卫队3</td><td style="padding: 6px;">科幻/动作</td><td style="padding: 6px;">8.2</td><td style="padding: 6px;">8.5亿美元</td></tr>
</table>`
  },
  {
    text: "科幻电影一直是电影艺术中最具想象力的类型之一，展现了人类对未来的无限遐想。",
    sql: `<span style="color: #569CD6;">SELECT</span> title, release_year, director, rating<br><span style="color: #569CD6;">FROM</span> movies<br><span style="color: #569CD6;">WHERE</span> genre <span style="color: #569CD6;">LIKE</span> <span style="color: #CE9178;">'%科幻%'</span><br><span style="color: #569CD6;">ORDER BY</span> rating <span style="color: #569CD6;">DESC</span><br><span style="color: #569CD6;">LIMIT</span> <span style="color: #B5CEA8;">8</span>`,
    data: `<table border="1" style="border-collapse: collapse; width: 100%; font-size: 12px;">
<tr style="background: #f0f0f0;">
<th style="padding: 8px; text-align: left;">电影名称</th>
<th style="padding: 8px; text-align: left;">年份</th>
<th style="padding: 8px; text-align: left;">导演</th>
<th style="padding: 8px; text-align: left;">评分</th>
</tr>
<tr><td style="padding: 6px;">2001太空漫游</td><td style="padding: 6px;">1968</td><td style="padding: 6px;">斯坦利·库布里克</td><td style="padding: 6px;"><strong>8.9</strong></td></tr>
<tr><td style="padding: 6px;">银翼杀手2049</td><td style="padding: 6px;">2017</td><td style="padding: 6px;">丹尼斯·维伦纽瓦</td><td style="padding: 6px;">8.7</td></tr>
<tr><td style="padding: 6px;">星际穿越</td><td style="padding: 6px;">2014</td><td style="padding: 6px;">克里斯托弗·诺兰</td><td style="padding: 6px;">8.7</td></tr>
<tr><td style="padding: 6px;">异形</td><td style="padding: 6px;">1979</td><td style="padding: 6px;">雷德利·斯科特</td><td style="padding: 6px;">8.5</td></tr>
</table>`
  },
  {
    text: "动作电影以其紧张刺激的场面和精彩的打斗设计吸引着全球观众。",
    sql: `<span style="color: #569CD6;">SELECT</span> title, main_actor, release_year, rating<br><span style="color: #569CD6;">FROM</span> movies<br><span style="color: #569CD6;">WHERE</span> genre = <span style="color: #CE9178;">'动作'</span><br><span style="color: #569CD6;">ORDER BY</span> rating <span style="color: #569CD6;">DESC</span><br><span style="color: #569CD6;">LIMIT</span> <span style="color: #B5CEA8;">6</span>`,
    data: `<table border="1" style="border-collapse: collapse; width: 100%; font-size: 12px;">
<tr style="background: #f0f0f0;">
<th style="padding: 8px; text-align: left;">电影名称</th>
<th style="padding: 8px; text-align: left;">主演</th>
<th style="padding: 8px; text-align: left;">年份</th>
<th style="padding: 8px; text-align: left;">评分</th>
</tr>
<tr><td style="padding: 6px;">疯狂麦克斯：狂怒路</td><td style="padding: 6px;">汤姆·哈迪</td><td style="padding: 6px;">2015</td><td style="padding: 6px;"><strong>8.6</strong></td></tr>
<tr><td style="padding: 6px;">终结者2</td><td style="padding: 6px;">阿诺·施瓦辛格</td><td style="padding: 6px;">1991</td><td style="padding: 6px;">8.5</td></tr>
<tr><td style="padding: 6px;">黑客帝国</td><td style="padding: 6px;">基努·里维斯</td><td style="padding: 6px;">1999</td><td style="padding: 6px;">8.4</td></tr>
<tr><td style="padding: 6px;">虎胆龙威</td><td style="padding: 6px;">布鲁斯·威利斯</td><td style="padding: 6px;">1988</td><td style="padding: 6px;">8.2</td></tr>
</table>`
  }
];

// 生成随机mock响应
const generateRandomMockResponse = (query: string): APIResponse => {
  const randomIndex = Math.floor(Math.random() * mockResponses.length);
  const baseResponse = mockResponses[randomIndex];
  
  // 为了增加随机性，可以稍微修改响应文本
  const variations = [
    "根据您的查询，我找到了以下结果：",
    "以下是查询结果，希望对您有帮助：",
    "根据数据库搜索，为您推荐：",
    "查询完成，找到了相关的电影信息：",
    "这里是您要查找的电影数据：",
  ];
  
  const randomVariation = variations[Math.floor(Math.random() * variations.length)];
  
  return {
    text: `${randomVariation}\n\n${baseResponse.text}`,
    sql: baseResponse.sql,
    data: baseResponse.data,
  };
};

// OMDb movie info
export const getMovieInfo = async (imdbId: string): Promise<any> => {
  if (USE_MOCK_MODE) {
    // Mock movie info
    await new Promise(resolve => setTimeout(resolve, 500)); // 模拟网络延迟
    return {
      Title: "示例电影",
      Year: "2023",
      Director: "示例导演",
      Plot: "这是一个示例电影的简介..."
    };
  }

  try {
    const response = await fetch(`${API_BASE_URL}/api/info/${imdbId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('获取影片信息失败:', error);
    return null;
  }
};

// 调用后端的chat接口
export const callLLMAPI = async (userInput: string): Promise<APIResponse> => {
  if (USE_MOCK_MODE) {
    console.log('🎭 Mock模式已启用 - 用户输入:', userInput);
    
    // 模拟网络延迟
    await new Promise(resolve => setTimeout(resolve, 800 + Math.random() * 1200));
    
    // 返回随机mock响应
    return generateRandomMockResponse(userInput);
  }

  try {
    const response = await fetch(`${API_BASE_URL}/api/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ message: userInput }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();

    return {
      text: data.text || '抱歉，我无法理解您的问题。',
      sql: data.sql,
      data: data.data,
      results: data.results,
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
  if (USE_MOCK_MODE) {
    console.log('🎭 Mock模式 - 模拟清除历史记录');
    await new Promise(resolve => setTimeout(resolve, 200));
    return true;
  }

  try {
    const response = await fetch(`${API_BASE_URL}/api/clear`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    return response.ok;
  } catch (error) {
    console.error('清除历史记录失败:', error);
    return false;
  }
};

// 获取后端聊天历史
export const getChatHistory = async (): Promise<Message[]> => {
  if (USE_MOCK_MODE) {
    console.log('🎭 Mock模式 - 返回空历史记录');
    return [];
  }

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
  if (USE_MOCK_MODE) {
    console.log('🎭 Mock模式 - 模拟健康检查通过');
    return true;
  }

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
  if (USE_MOCK_MODE) {
    console.log('🎭 Mock模式 - 模拟流式响应');
    
    const mockResponse = generateRandomMockResponse(userInput);
    const words = mockResponse.text.split(' ');
    
    // 模拟逐词流式输出
    for (let i = 0; i < words.length; i++) {
      await new Promise(resolve => setTimeout(resolve, 100 + Math.random() * 100));
      onToken(words[i] + ' ');
    }
    
    onComplete(mockResponse);
    return;
  }

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
                data: parsed.data,
                results: parsed.results
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

// 导出切换Mock模式的函数
export const toggleMockMode = (): boolean => {
  USE_MOCK_MODE = !USE_MOCK_MODE;
  console.log(`🎭 Mock模式已${USE_MOCK_MODE ? '启用' : '关闭'}`);
  return USE_MOCK_MODE;
};

// 导出获取Mock模式状态的函数
export const isMockModeEnabled = (): boolean => {
  return USE_MOCK_MODE;
};
