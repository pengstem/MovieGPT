import React, { useState, useCallback, useRef, useEffect, useLayoutEffect } from 'react';
import { Message } from './types';
import { generateId } from './utils/mockData';
import { callLLMAPI, clearChatHistory, healthCheck } from './services/apiService';
import Header from './components/Header';
import MessageList from './components/MessageList';
import WelcomeText from './components/WelcomeText';
import ExampleQueries from './components/ExampleQueries';
import InputArea from './components/InputArea';
import SimpleConfirmDialog from './components/SimpleConfirmDialog';
import MovieInfoPanel from './components/MovieInfoPanel';
import styles from './styles/App.module.css';

const App: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const [shouldHideWelcome, setShouldHideWelcome] = useState(false);
  const [hasStartedConversation, setHasStartedConversation] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [isBackendConnected, setIsBackendConnected] = useState(false);
  const [refreshQueries, setRefreshQueries] = useState(false);
  const [selectedMovieId, setSelectedMovieId] = useState<string | null>(null);
  const clearButtonRef = useRef<HTMLButtonElement>(null);
  const headerRef = useRef<HTMLDivElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const stored = localStorage.getItem('theme');
    if (stored) return stored === 'dark';
    return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
  });
  const [isHeaderHidden, setIsHeaderHidden] = useState(false);

  useEffect(() => {
    document.body.classList.toggle('dark', isDarkMode);
    localStorage.setItem('theme', isDarkMode ? 'dark' : 'light');
  }, [isDarkMode]);

  useLayoutEffect(() => {
    const updateOffsets = () => {
      const headerHeight = headerRef.current?.offsetHeight || 0;
      const bottomHeight = bottomRef.current?.offsetHeight || 0;
      document.documentElement.style.setProperty('--header-height', `${headerHeight}px`);
      document.documentElement.style.setProperty('--bottom-offset', `${bottomHeight}px`);
    };

    updateOffsets();
    window.addEventListener('resize', updateOffsets);
    return () => window.removeEventListener('resize', updateOffsets);
  }, [hasStartedConversation, inputValue, isHeaderHidden]);

  const toggleDarkMode = useCallback(() => {
    setIsDarkMode(prev => !prev);
  }, []);

  // 检查后端连接状态
  useEffect(() => {
    const checkBackendHealth = async () => {
      const isHealthy = await healthCheck();
      setIsBackendConnected(isHealthy);
      
      if (!isHealthy) {
        console.warn('后端服务未连接，请确保后端服务器正在运行');
      }
    };

    checkBackendHealth();
    
    // 初始化时刷新问题列表
    setRefreshQueries(prev => !prev);
    
    // 每30秒检查一次后端状态
    const healthCheckInterval = setInterval(checkBackendHealth, 30000);
    
    return () => clearInterval(healthCheckInterval);
  }, []);

  const addMessage = useCallback((type: 'user' | 'assistant', text: string, sql?: string, data?: any, results?: any[]) => {
    const newMessage: Message = {
      id: generateId(),
      type,
      text,
      sql,
      data,
      results,
      timestamp: Date.now()
    };
    setMessages(prev => [...prev, newMessage]);
  }, []);

  const handleSendMessage = useCallback(async (messageText: string) => {
    // 检查后端连接状态
    if (!isBackendConnected) {
      addMessage('assistant', '后端服务未连接，请确保服务器正在运行，然后刷新页面重试。');
      return;
    }

    // 标记对话已开始
    setHasStartedConversation(true);
    setIsHeaderHidden(true);
    // 隐藏欢迎文字
    setShouldHideWelcome(true);

    // 添加用户消息
    addMessage('user', messageText);

    // 开始加载
    setIsLoading(true);

    try {
      // 调用真实的后端API（不传递本地历史，后端自己维护）
      const response = await callLLMAPI(messageText);
      
      if (response.error) {
        // 如果API返回错误，显示错误消息
        addMessage('assistant', response.text);
      } else {
        // 添加AI回复
        addMessage('assistant', response.text, response.sql, response.data, response.results);
      }
    } catch (error) {
      // 处理API调用异常
      console.error('发送消息失败:', error);
      addMessage('assistant', '抱歉，我遇到了一些问题，请稍后再试。');
    } finally {
      // 无论成功或失败，都要停止加载状态
      setIsLoading(false);
    }
  }, [addMessage, isBackendConnected]);

  const handleClearMessages = useCallback(async () => {
    // 清除前端消息
    setMessages([]);
    setIsLoading(false);
    setShouldHideWelcome(false);
    setHasStartedConversation(false);
    setIsHeaderHidden(false);
    setInputValue('');
    setShowConfirmDialog(false);
    
    // 刷新问题列表
    setRefreshQueries(prev => !prev);

    // 同时清除后端历史记录
    try {
      await clearChatHistory();
      console.log('后端历史记录已清除');
    } catch (error) {
      console.warn('清除后端历史记录失败:', error);
    }
  }, []);

  const handleShowClearConfirm = useCallback(() => {
    setShowConfirmDialog(true);
  }, []);

  const handleCancelClear = useCallback(() => {
    setShowConfirmDialog(false);
  }, []);

  const handleQuerySelect = useCallback((query: string) => {
    // 直接发送消息，不需要填入输入框
    handleSendMessage(query);
  }, [handleSendMessage]);

  const handleMovieSelect = useCallback((id: string) => {
    setSelectedMovieId(prev => (prev === id ? null : id));
  }, []);

  return (
    <div className={styles.app}>
      <Header
        ref={headerRef}
        isCompact={hasStartedConversation}
        isDarkMode={isDarkMode}
        onToggleDarkMode={toggleDarkMode}
        isHidden={isHeaderHidden}
      />
      
      <div className={styles.mainContainer}>
        <WelcomeText shouldHide={shouldHideWelcome} />
        <MessageList messages={messages} isLoading={isLoading} onMovieSelect={handleMovieSelect} />
        <MovieInfoPanel
          imdbId={selectedMovieId}
          side="left"
          variant="poster"
        />
        <MovieInfoPanel
          imdbId={selectedMovieId}
          side="right"
          variant="details"
        />
      </div>

      <div className={styles.bottomFixed} ref={bottomRef}>
        <ExampleQueries 
          onQuerySelect={handleQuerySelect} 
          shouldRefresh={refreshQueries}
          shouldHide={hasStartedConversation}
        />
        <InputArea
          onSendMessage={handleSendMessage}
          onShowClearConfirm={handleShowClearConfirm}
          isLoading={isLoading}
          inputValue={inputValue}
          setInputValue={setInputValue}
          clearButtonRef={clearButtonRef}
        />
      </div>

      <SimpleConfirmDialog
        isVisible={showConfirmDialog}
        onConfirm={handleClearMessages}
        onCancel={handleCancelClear}
        anchorRef={clearButtonRef}
      />

      {/* GitHub 链接 - 右下角 */}
      <a 
        href="https://github.com/pengstem/MovieGPT"
        target="_blank"
        rel="noopener noreferrer"
        className={styles.githubLink}
        title="Visit GitHub Repository"
      >
        <i className="fab fa-github" style={{ marginRight: '4px' }}></i>
        404Found
      </a>
    </div>
  );
};

export default App; 