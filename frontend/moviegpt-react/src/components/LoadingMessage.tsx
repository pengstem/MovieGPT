import React from 'react';
import styles from '../styles/Message.module.css';

const LoadingMessage: React.FC = () => {
  return (
    <div className={`${styles.message} ${styles.assistant} loading-message`}>
      <div className={styles.messageContent}>
        <div className={styles.messageBubble}>
          <div className={styles.loading}>
            <span>分析中</span>
            <div className={styles.loadingDots}>
              <div className={styles.loadingDot}></div>
              <div className={styles.loadingDot}></div>
              <div className={styles.loadingDot}></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoadingMessage; 