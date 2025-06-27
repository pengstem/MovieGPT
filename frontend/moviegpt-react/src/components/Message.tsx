import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Message as MessageType } from '../types';
import styles from '../styles/Message.module.css';

interface MessageProps {
  message: MessageType;
}

const Message: React.FC<MessageProps> = ({ message }) => {
  const { type, text, sql, data, results } = message;
  const avatarIcon = type === 'user' ? 'fa-user' : 'fa-robot';
  const [isExpanded, setIsExpanded] = useState(false);

  const renderResultData = (d: any): React.ReactNode => {
    if (Array.isArray(d) && d.length > 0 && typeof d[0] === 'object') {
      const columns = Array.from(
        new Set(d.flatMap((row: any) => Object.keys(row)))
      );
      return (
        <table>
          <thead>
            <tr>
              {columns.map((col) => (
                <th key={col}>{col}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {d.map((row: any, idx: number) => (
              <tr key={idx}>
                {columns.map((col) => (
                  <td key={col}>{String(row[col])}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      );
    }

    const json = JSON.stringify(d, null, 2);
    return <pre>{json}</pre>;
  };

  const queryResults = results && results.length > 0
    ? results
    : (sql && data ? [{ sql, rows: data }] : []);

  const toggleExpanded = (e: React.MouseEvent<HTMLButtonElement>) => {
    setIsExpanded(!isExpanded);
    // 点击后自动移除焦点，避免出现蓝圈
    e.currentTarget.blur();
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLButtonElement>) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      setIsExpanded(!isExpanded);
      // 键盘操作后也移除焦点
      e.currentTarget.blur();
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
        {queryResults.length > 0 && (
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
              {queryResults.map((r, idx) => (
                <div key={idx} className={styles.sqlBlock}>
                  {r.sql && (
                    <div className={styles.sqlSection}>
                      <div className={styles.sqlLabel}>
                        <i className="fas fa-database"></i>
                        SQL 查询
                      </div>
                      <div className={styles.sqlQuery}>
                        <code>{r.sql}</code>
                      </div>
                    </div>
                  )}
                  <div className={styles.resultSection}>
                    <div className={styles.resultLabel}>
                      <i className="fas fa-table"></i>
                      查询结果
                    </div>
                    {r.rows && (
                      <div className={styles.resultData}>{renderResultData(r.rows)}</div>
                    )}
                    {r.error && <pre>{r.error}</pre>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Message; 
