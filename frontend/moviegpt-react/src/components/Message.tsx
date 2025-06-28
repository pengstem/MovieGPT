import React, { useState } from 'react';
import ReactMarkdown, { uriTransformer } from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Message as MessageType } from '../types';
import styles from '../styles/Message.module.css';

interface Movie {
  id: string;
  title: string;
}

interface MessageProps {
  message: MessageType;
  onMovieSelect?: (id: string) => void;
}

const Message: React.FC<MessageProps> = ({ message, onMovieSelect }) => {
  const { type, text, sql, data, results } = message;
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

  const extractMovies = (): Movie[] => {
    const movies: Movie[] = [];
    queryResults.forEach((r) => {
      if (r.rows && Array.isArray(r.rows)) {
        r.rows.forEach((row: any) => {
          if (row.tconst && row.primaryTitle) {
            if (!movies.find(m => m.id === row.tconst)) {
              movies.push({ id: row.tconst, title: String(row.primaryTitle) });
            }
          }
        });
      }
    });
    return movies;
  };

  const movies = extractMovies();

  const processedText = movies.reduce((acc, m) => {
    const escaped = m.title.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp(escaped, 'g');
    return acc.replace(regex, `[${m.title}](movie:${m.id})`);
  }, text);

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
      <div className={styles.messageContent}>
        <div className={styles.messageBubble}>
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            transformLinkUri={(href) => {
              if (href && href.startsWith('movie:')) {
                return href;
              }
              return uriTransformer(href);
            }}
            components={{
              a: ({ href, children }) => {
                if (href && href.startsWith('movie:')) {
                  const id = href.replace('movie:', '');
                  return (
                    <button
                      type="button"
                      className={styles.movieLink}
                      onClick={() => onMovieSelect && onMovieSelect(id)}
                    >
                      {children}
                    </button>
                  );
                }
                if (href && /^javascript:/i.test(href)) {
                  return <span className={styles.movieLink}>{children}</span>;
                }
                return (
                  <a href={href} target="_blank" rel="noopener noreferrer">
                    {children}
                  </a>
                );
              }
            }}
          >
            {processedText}
          </ReactMarkdown>
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
