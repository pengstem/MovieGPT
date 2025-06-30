import React from 'react';
import styles from '../styles/App.module.css';

interface WelcomeTextProps {
  shouldHide: boolean;
}

const WelcomeText: React.FC<WelcomeTextProps> = ({ shouldHide }) => {
  return (
    <div className={`${styles.welcomeText} ${shouldHide ? styles.hidden : ''}`}>
      <div style={{ fontSize: '72px', marginBottom: '20px' }}>MovieGPT</div>
      <div style={{ 
        fontSize: '14px', 
        opacity: 0.6, 
        textAlign: 'center',
        lineHeight: '1.5',
        letterSpacing: 'normal'
      }}>
        <p>🎬 询问任何关于电影的问题</p>
      </div>
    </div>
  );
};

export default WelcomeText; 