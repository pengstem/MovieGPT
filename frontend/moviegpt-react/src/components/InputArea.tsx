import React, { useRef, useEffect } from 'react';
import styles from '../styles/App.module.css';

interface InputAreaProps {
  onSendMessage: (message: string) => void;
  onShowClearConfirm: () => void;
  isLoading: boolean;
  inputValue: string;
  setInputValue: (value: string) => void;
  clearButtonRef: React.RefObject<HTMLButtonElement>;
}

const InputArea: React.FC<InputAreaProps> = ({ 
  onSendMessage, 
  onShowClearConfirm, 
  isLoading, 
  inputValue, 
  setInputValue,
  clearButtonRef
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
    onShowClearConfirm();
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
        ref={clearButtonRef}
        className={styles.clearButton}
        onClick={handleClear}
        title="新建对话"
      >
        <i className="fas fa-plus"></i>
        <span className={styles.clearLabel}>新建对话</span>
      </button>
    </div>
  );
};

export default InputArea; 