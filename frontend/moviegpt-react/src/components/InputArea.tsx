import React, { useState, useRef, useEffect } from 'react';
import styles from '../styles/App.module.css';

interface InputAreaProps {
  onSendMessage: (message: string) => void;
  onClearMessages: () => void;
  isLoading: boolean;
  inputValue: string;
  setInputValue: (value: string) => void;
}

const InputArea: React.FC<InputAreaProps> = ({ 
  onSendMessage, 
  onClearMessages, 
  isLoading, 
  inputValue, 
  setInputValue 
}) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = Math.min(textareaRef.current.scrollHeight, 100) + 'px';
    }
  }, [inputValue]);

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInputValue(e.target.value);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleSend = () => {
    const query = inputValue.trim();
    if (!query || isLoading) return;

    onSendMessage(query);
    setInputValue('');
  };

  const handleClear = () => {
    if (window.confirm('确定要清除所有聊天记录吗？此操作无法撤销。')) {
      onClearMessages();
      setInputValue('');
    }
  };

  return (
    <div className={styles.inputArea}>
      <div className={styles.inputContainer}>
        <textarea
          ref={textareaRef}
          className={styles.inputTextarea}
          value={inputValue}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          placeholder="描述您的查询需求..."
          rows={1}
        />
        <button 
          className={styles.sendButton} 
          onClick={handleSend}
          disabled={isLoading}
        >
          {isLoading ? (
            <i className="fas fa-spinner fa-spin"></i>
          ) : (
            <i className="fas fa-arrow-up"></i>
          )}
        </button>
      </div>
      <button 
        className={styles.clearButton} 
        onClick={handleClear}
        title="新建对话"
      >
        <i className="fas fa-plus"></i>
      </button>
    </div>
  );
};

export default InputArea; 