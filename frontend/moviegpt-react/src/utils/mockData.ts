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

export const exampleQueries = [
  '销售分析',
  '用户统计', 
  '库存管理',
  '订单分析',
  '商品排行',
  '地区分析'
];

export const exampleQueriesMap: { [key: string]: string } = {
  '销售分析': '销售额前10产品',
  '用户统计': '月度用户统计',
  '库存管理': '库存不足商品',
  '订单分析': '本周订单金额',
  '商品排行': '热门商品排行',
  '地区分析': '客户地区分布'
}; 