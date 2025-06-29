import React, { useEffect, useRef } from 'react';
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

  const scrollToBottom = () => {
    const messagesContainer = messagesRef.current;
    if (messagesContainer) {
      // 立即滚动到底部
      messagesContainer.scrollTop = messagesContainer.scrollHeight;
      
      // 使用另一种方法确保滚动生效
      messagesContainer.scrollTo({
        top: messagesContainer.scrollHeight,
        behavior: 'auto'
      });
    }
  };

  useEffect(() => {
    if (!userAtBottomRef.current) return;
    // 使用requestAnimationFrame确保DOM更新后再滚动
    requestAnimationFrame(() => {
      scrollToBottom();
      // 再次确保滚动到底部，因为内容可能还在渲染
      setTimeout(scrollToBottom, 100);
    });
  }, [messages, isLoading]);

  useEffect(() => {
    const messagesContainer = messagesRef.current;
    if (!messagesContainer) return;

    const handleScroll = () => {
      const { scrollTop, scrollHeight, clientHeight } = messagesContainer;
      const threshold = 20; // 距底部多少像素以内视为在底部
      userAtBottomRef.current = scrollHeight - scrollTop - clientHeight <= threshold;

      // 滚动时显示滚动条
      messagesContainer.classList.add('scrolling');

      // 清除之前的定时器
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }

      // 滚动停止后隐藏滚动条
      scrollTimeoutRef.current = setTimeout(() => {
        messagesContainer.classList.remove('scrolling');
      }, 1000);
    };

    messagesContainer.addEventListener('scroll', handleScroll);
    
    return () => {
      messagesContainer.removeEventListener('scroll', handleScroll);
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }
    };
  }, []);

  return (
    <div ref={messagesRef} className={styles.messages}>
      {messages.map((message) => (
        <Message key={message.id} message={message} onMovieSelect={onMovieSelect} />
      ))}
      {isLoading && <LoadingMessage />}
    </div>
  );
};

export default MessageList;
