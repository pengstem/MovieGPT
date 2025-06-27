import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Message as MessageType } from '../types';
import SQLResultBlock from './SQLResultBlock';
import styles from '../styles/Message.module.css';

interface MessageProps {
  message: MessageType;
}

const Message: React.FC<MessageProps> = ({ message }) => {
  const { type, text, sql, data, results } = message;
  const avatarIcon = type === 'user' ? 'fa-user' : 'fa-robot';
  const [isExpanded, setIsExpanded] = useState(false);

  const toggleExpanded = () => {
    setIsExpanded(!isExpanded);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      toggleExpanded();
    }
  };

  return (
    <div className={`${styles.message} ${styles[type]}`}>
      <div className={styles.messageAvatar}>
        <i className={`fas ${avatarIcon}`}></i>
      </div>
      <div className={styles.messageContent}>
        <div className={styles.messageBubble}>
          <ReactMarkdown remarkPlugins={[remarkGfm]}>{text}</ReactMarkdown>
        </div>
        {sql && data && (
          <div className={styles.sqlResultContainer}>
            <button 
              className={styles.sqlToggleButton}
              onClick={toggleExpanded}
              onKeyDown={handleKeyDown}
              aria-expanded={isExpanded}
              aria-controls="sql-result-content"
              title={isExpanded ? '点击收起 SQL 查询和结果' : '点击展开 SQL 查询和结果'}
            >
              <span className={styles.toggleIcon}>
                <i className={`fas fa-chevron-${isExpanded ? 'down' : 'right'}`}></i>
              </span>
              <span className={styles.toggleText}>
                {isExpanded ? '隐藏' : '查看'} SQL 查询和结果
              </span>
              <span className={styles.toggleHint}>
                {isExpanded ? '点击收起' : '点击展开'}
              </span>
            </button>
            <div 
              id="sql-result-content"
              className={`${styles.sqlResult} ${isExpanded ? styles.expanded : styles.collapsed}`}
              role="region"
              aria-labelledby="sql-toggle-button"
            >
              <div className={styles.sqlSection}>
                <div className={styles.sqlLabel}>
                  <i className="fas fa-database"></i>
                  SQL 查询
                </div>
                <div 
                  className={styles.sqlQuery}
                  dangerouslySetInnerHTML={{ __html: sql }}
                />
              </div>
              <div className={styles.resultSection}>
                <div className={styles.resultLabel}>
                  <i className="fas fa-table"></i>
                  查询结果
                </div>
                <div 
                  className={styles.resultData}
                  dangerouslySetInnerHTML={{ __html: data }} 
                />
              </div>
            </div>
          </div>
        ) : (
          sql && data && (
            <div className={styles.sqlResult}>
              <div className={styles.sqlQuery} dangerouslySetInnerHTML={{ __html: sql }} />
              <div dangerouslySetInnerHTML={{ __html: data }} />
            </div>
          )
        )}
      </div>
    </div>
  );
};

export default Message; 