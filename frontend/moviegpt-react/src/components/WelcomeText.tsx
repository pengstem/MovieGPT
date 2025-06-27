import React from 'react';
import styles from '../styles/App.module.css';

interface WelcomeTextProps {
  shouldHide: boolean;
}

const WelcomeText: React.FC<WelcomeTextProps> = ({ shouldHide }) => {
  return (
    <div className={styles.backgroundLogo}>
      <img 
        src="/whu-logo.png.png" 
        alt="Wuhan University Logo"
        style={{
          width: '400px',
          height: '400px',
          opacity: 0.05,
          filter: 'grayscale(100%)',
          userSelect: 'none'
        }}
      />
    </div>
  );
};

export default WelcomeText; 