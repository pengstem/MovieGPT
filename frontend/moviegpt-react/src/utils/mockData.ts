import { MockResponse } from '../types';

export const mockResponses: MockResponse[] = [
  {
    text: "查询完成",
    sql: "SELECT p.name, SUM(s.amount) as total<br>FROM sales s JOIN products p ON s.pid = p.id<br>GROUP BY p.name ORDER BY total DESC LIMIT 10",
    data: "iPhone 14 Pro - ¥2,456,890<br>MacBook Air M2 - ¥1,998,765<br>iPad Pro - ¥1,234,567"
  },
  {
    text: "统计完成",
    sql: "SELECT DATE_FORMAT(created_at, '%Y-%m') as month,<br>COUNT(*) as count FROM users<br>GROUP BY month ORDER BY month DESC",
    data: "2024-01: 1,245人<br>2023-12: 998人<br>2023-11: 1,456人"
  },
  {
    text: "查询结果",
    sql: "SELECT name, stock, min_stock FROM products<br>WHERE stock < min_stock ORDER BY stock ASC",
    data: "无线鼠标 - 库存:3 最低:10<br>机械键盘 - 库存:7 最低:15"
  }
];

export const generateMockResponse = (query: string): MockResponse => {
  return mockResponses[Math.floor(Math.random() * mockResponses.length)];
};

export const generateId = (): string => {
  return Math.random().toString(36).substring(2, 11);
};

// 基于IMDb数据库结构的100个查询问题
const allMovieQueries = [
  '查询《盗梦空间》的基本信息',
  '2023年上映的电影有哪些',
  '评分最高的10部电影',
  '汤姆·汉克斯参演的电影',
  '时长超过180分钟的电影',
  '克里斯托弗·诺兰导演的作品',
  '动作类型的电影',
  '2020年的科幻片',
  '评分在9分以上的电影',
  '1990年代的爱情电影',
  '斯蒂芬·斯皮尔伯格的导演作品',
  '时长少于90分钟的短片',
  '成龙主演的电影',
  '2000年后的恐怖电影',
  '喜剧类型电影推荐',
  '李安导演的电影作品',
  '2010年代的动画电影',
  '悬疑惊悚类电影',
  '战争题材的电影',
  '传记类电影推荐',
  '西部片经典作品',
  '犯罪类型电影',
  '家庭类型电影',
  '运动题材电影',
  '历史类型电影',
  '奇幻类型电影',
  '纪录片推荐',
  '2024年的新电影',
  '莱昂纳多·迪卡普里奥的电影',
  '梅丽尔·斯特里普的作品',
  '罗伯特·德尼罗参演的电影',
  '阿尔·帕西诺的经典角色',
  '昆丁·塔伦蒂诺导演的电影',
  '马丁·斯科塞斯的作品',
  '詹姆斯·卡梅隆导演的电影',
  '蒂姆·伯顿的奇幻作品',
  '科恩兄弟的电影',
  '大卫·芬奇导演的悬疑片',
  '雷德利·斯科特的科幻作品',
  '宫崎骏的动画电影',
  '黑泽明的经典作品',
  '张艺谋导演的电影',
  '冯小刚的喜剧作品',
  '徐克导演的武侠片',
  '杜琪峰的警匪片',
  '王家卫的文艺片',
  '陈凯歌的历史片',
  '贾樟柯的现实主义作品',
  '侯孝贤的台湾电影',
  '英语电影推荐',
  '中文电影推荐',
  '法语电影作品',
  '日语电影推荐',
  '韩语电影推荐',
  '德语电影作品',
  '意大利语电影',
  '西班牙语电影',
  '俄语电影推荐',
  '印地语电影',
  '80年代经典电影',
  '90年代热门电影',
  '2000年代经典',
  '2010年代佳作',
  '2020年代新片',
  '1970年代经典',
  '1960年代名作',
  '1950年代电影',
  '电视电影作品',
  '迷你剧推荐',
  '短片作品',
  '电视剧推荐',
  '限定剧集',
  '综艺节目',
  '脱口秀节目',
  '新闻节目',
  '体育节目',
  '儿童节目',
  '成人向内容',
  '评分较低的电影',
  '冷门佳作推荐',
  '独立制片电影',
  '大制作商业片',
  '小成本电影',
  '票房冠军电影',
  '票房惨败电影',
  '续集电影',
  '前传电影',
  '重启电影',
  '翻拍电影',
  '改编电影',
  '原创剧本电影',
  '同名电影作品',
  '系列电影',
  '三部曲电影',
  '多部曲电影',
  '单集电视剧',
  '长篇电视剧',
  '季播电视剧',
  '年播电视剧',
  '周播电视剧',
  '日播电视剧',
  '黑白电影作品',
  '彩色电影作品',
  '默片经典',
  '有声电影'
];

// 随机选择指定数量的问题
export const getRandomQueries = (count: number = 6): string[] => {
  const shuffled = [...allMovieQueries].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
};

// 当前显示的问题（初始化时随机选择）
export let exampleQueries = getRandomQueries(6);

// 刷新问题列表
export const refreshExampleQueries = (count: number = 6): string[] => {
  exampleQueries = getRandomQueries(count);
  return exampleQueries;
};

// 简化映射，直接返回问题本身
export const exampleQueriesMap: { [key: string]: string } = {};
allMovieQueries.forEach(query => {
  exampleQueriesMap[query] = query;
}); 