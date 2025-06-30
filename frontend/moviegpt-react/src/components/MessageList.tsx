import React, { useEffect, useRef, useCallback } from 'react';
import { Message as MessageType } from '../types';
import Message from './Message';
import LoadingMessage from './LoadingMessage';
import styles from '../styles/App.module.css';

interface MessageListProps {
  messages: MessageType[];
  isLoading: boolean;
  onMovieSelect?: (id: string) => void;
}

const MessageList: React.FC<MessageListProps> = ({ messages, isLoading, onMovieSelect }) => {
  const messagesRef = useRef<HTMLDivElement>(null);
  const scrollTimeoutRef = useRef<NodeJS.Timeout>();
  const userAtBottomRef = useRef(true);
  const lastMessageCountRef = useRef(0);

  // 优化的滚动到底部函数
  const scrollToBottom = useCallback((force = false) => {
    const messagesContainer = messagesRef.current;
    if (!messagesContainer) return;

    // 如果用户不在底部且不是强制滚动，则不自动滚动
    if (!userAtBottomRef.current && !force) return;

    const scrollToEnd = () => {
      messagesContainer.scrollTo({
        top: messagesContainer.scrollHeight,
        behavior: force ? 'auto' : 'smooth'
      });
    };

    // 使用requestAnimationFrame确保DOM更新后再滚动
    requestAnimationFrame(() => {
      scrollToEnd();
      // 对于新消息，再次确保滚动到底部
      if (messages.length > lastMessageCountRef.current) {
        setTimeout(scrollToEnd, 50);
      }
    });
  }, [messages.length]);

  // 滚动到顶部函数
  const scrollToTop = useCallback(() => {
    const messagesContainer = messagesRef.current;
    if (!messagesContainer) return;

    messagesContainer.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  }, []);

  // 键盘快捷键处理
  const handleKeyDown = useCallback((event: React.KeyboardEvent<HTMLDivElement>) => {
    // 检查是否在输入框内，如果是则不处理快捷键
    const target = event.target as HTMLElement;
    if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.contentEditable === 'true') {
      return;
    }

    switch (event.key) {
      case 'Home':
        // 只有当没有修饰键时才处理
        if (!event.ctrlKey && !event.shiftKey && !event.altKey) {
          event.preventDefault();
          scrollToTop();
        }
        break;
      case 'End':
        // 只有当没有修饰键时才处理
        if (!event.ctrlKey && !event.shiftKey && !event.altKey) {
          event.preventDefault();
          scrollToBottom(true);
        }
        break;
      // 移除PageUp和PageDown的处理，让浏览器自己处理正常的滚动
    }
  }, [scrollToTop, scrollToBottom]);

  // 处理滚动事件，优化性能
  const handleScroll = useCallback(() => {
    const messagesContainer = messagesRef.current;
    if (!messagesContainer) return;

    const { scrollTop, scrollHeight, clientHeight } = messagesContainer;
    const threshold = 50; // 增加阈值，提高用户体验
    const isAtBottom = scrollHeight - scrollTop - clientHeight <= threshold;
    const isAtTop = scrollTop <= threshold;
    
    userAtBottomRef.current = isAtBottom;

    // 设置滚动位置数据属性，用于控制滚动指示器
    messagesContainer.setAttribute('data-at-top', isAtTop.toString());
    messagesContainer.setAttribute('data-at-bottom', isAtBottom.toString());

    // 添加滚动状态类
    messagesContainer.classList.add('scrolling');

    // 清除之前的定时器
    if (scrollTimeoutRef.current) {
      clearTimeout(scrollTimeoutRef.current);
    }

    // 滚动停止后移除滚动状态
    scrollTimeoutRef.current = setTimeout(() => {
      messagesContainer.classList.remove('scrolling');
    }, 1500);
  }, []);

  // 监听消息变化，自动滚动
  useEffect(() => {
    const isNewMessage = messages.length > lastMessageCountRef.current;
    lastMessageCountRef.current = messages.length;

    if (isNewMessage || isLoading) {
      scrollToBottom();
    }
  }, [messages, isLoading, scrollToBottom]);

  // 设置滚动事件监听器
  useEffect(() => {
    const messagesContainer = messagesRef.current;
    if (!messagesContainer) return;

    messagesContainer.addEventListener('scroll', handleScroll, { passive: true });
    
    return () => {
      messagesContainer.removeEventListener('scroll', handleScroll);
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }
    };
  }, [handleScroll]);

  // 初始化时滚动到底部
  useEffect(() => {
    if (messages.length === 0) {
      userAtBottomRef.current = true;
    }
  }, [messages.length]);

  return (
    <div 
      ref={messagesRef} 
      className={styles.messages}
      tabIndex={0}
      style={{ outline: 'none' }}
      onKeyDown={handleKeyDown}
    >
      {messages.map((message) => (
        <Message key={message.id} message={message} onMovieSelect={onMovieSelect} />
      ))}
      {isLoading && <LoadingMessage />}
    </div>
  );
};

export default MessageList;
