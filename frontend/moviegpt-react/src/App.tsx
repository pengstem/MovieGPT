import React, { useState, useCallback } from 'react';
import { Message } from './types';
import { generateMockResponse, generateId } from './utils/mockData';
import Header from './components/Header';
import MessageList from './components/MessageList';
import WelcomeText from './components/WelcomeText';
import ExampleQueries from './components/ExampleQueries';
import InputArea from './components/InputArea';
import styles from './styles/App.module.css';

const App: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const [shouldHideWelcome, setShouldHideWelcome] = useState(false);

  const addMessage = useCallback((type: 'user' | 'assistant', text: string, sql?: string, data?: string) => {
    const newMessage: Message = {
      id: generateId(),
      type,
      text,
      sql,
      data,
      timestamp: Date.now()
    };
    setMessages(prev => [...prev, newMessage]);
  }, []);

  const handleSendMessage = useCallback((messageText: string) => {
    // 隐藏欢迎文字
    setShouldHideWelcome(true);

    // 添加用户消息
    addMessage('user', messageText);

    // 开始加载
    setIsLoading(true);

    // 模拟AI回复
    setTimeout(() => {
      const response = generateMockResponse(messageText);
      addMessage('assistant', response.text, response.sql, response.data);
      setIsLoading(false);
    }, 1500 + Math.random() * 1500);
  }, [addMessage]);

  const handleClearMessages = useCallback(() => {
    setMessages([]);
    setIsLoading(false);
    setShouldHideWelcome(false);
    setInputValue('');
  }, []);

  const handleQuerySelect = useCallback((query: string) => {
    setInputValue(query);
    // 聚焦到输入框
    const textarea = document.querySelector('textarea');
    if (textarea) {
      textarea.focus();
    }
  }, []);

  return (
    <div className={styles.app}>
      <Header />
      
      <div className={styles.mainContainer}>
        <WelcomeText shouldHide={shouldHideWelcome} />
        <MessageList messages={messages} isLoading={isLoading} />
      </div>

      <div className={styles.bottomFixed}>
        <ExampleQueries onQuerySelect={handleQuerySelect} />
        <InputArea
          onSendMessage={handleSendMessage}
          onClearMessages={handleClearMessages}
          isLoading={isLoading}
          inputValue={inputValue}
          setInputValue={setInputValue}
        />
      </div>
    </div>
  );
};

export default App; 