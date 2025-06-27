import React from 'react';
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

  return (
    <div className={`${styles.message} ${styles[type]}`}>
      <div className={styles.messageAvatar}>
        <i className={`fas ${avatarIcon}`}></i>
      </div>
      <div className={styles.messageContent}>
        <div className={styles.messageBubble}>
          <ReactMarkdown remarkPlugins={[remarkGfm]}>{text}</ReactMarkdown>
        </div>
        {results && results.length > 0 ? (
          <div className={styles.sqlResult}>
            {results.map((r, idx) => (
              <SQLResultBlock key={idx} result={r} />
            ))}
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