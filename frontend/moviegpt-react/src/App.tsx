import React, { useState, useCallback, useRef } from 'react';
import { Message } from './types';
import { generateId } from './utils/mockData';
import { callLLMAPI } from './services/apiService';
import Header from './components/Header';
import MessageList from './components/MessageList';
import WelcomeText from './components/WelcomeText';
import ExampleQueries from './components/ExampleQueries';
import InputArea from './components/InputArea';
import SimpleConfirmDialog from './components/SimpleConfirmDialog';
import styles from './styles/App.module.css';

const App: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const [shouldHideWelcome, setShouldHideWelcome] = useState(false);
  const [hasStartedConversation, setHasStartedConversation] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const clearButtonRef = useRef<HTMLButtonElement>(null);

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

  const handleSendMessage = useCallback(async (messageText: string) => {
    // 标记对话已开始
    setHasStartedConversation(true);
    // 隐藏欢迎文字
    setShouldHideWelcome(true);

    // 添加用户消息
    addMessage('user', messageText);

    // 开始加载
    setIsLoading(true);

    try {
      // 调用真实的大模型API，传入对话历史
      const response = await callLLMAPI(messageText, messages);
      
      if (response.error) {
        // 如果API返回错误，显示错误消息
        addMessage('assistant', response.text);
      } else {
        // 添加AI回复
        addMessage('assistant', response.text, response.sql, response.data);
      }
    } catch (error) {
      // 处理API调用异常
      console.error('发送消息失败:', error);
      addMessage('assistant', '抱歉，我遇到了一些问题，请稍后再试。');
    } finally {
      // 无论成功或失败，都要停止加载状态
      setIsLoading(false);
    }
  }, [addMessage]);

  const handleClearMessages = useCallback(() => {
    setMessages([]);
    setIsLoading(false);
    setShouldHideWelcome(false);
    setHasStartedConversation(false);
    setInputValue('');
    setShowConfirmDialog(false);
  }, []);

  const handleShowClearConfirm = useCallback(() => {
    setShowConfirmDialog(true);
  }, []);

  const handleCancelClear = useCallback(() => {
    setShowConfirmDialog(false);
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
      <Header isCompact={hasStartedConversation} />
      
      <div className={styles.mainContainer}>
        <WelcomeText shouldHide={shouldHideWelcome} />
        <MessageList messages={messages} isLoading={isLoading} />
      </div>

      <div className={styles.bottomFixed}>
        <ExampleQueries onQuerySelect={handleQuerySelect} />
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
    </div>
  );
};

export default App; 