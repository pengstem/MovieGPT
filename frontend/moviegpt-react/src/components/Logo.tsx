import React from 'react';
import styles from '../styles/App.module.css';

interface LogoProps {
  moveLeft: boolean;
}

const Logo: React.FC<LogoProps> = ({ moveLeft }) => {
  return (
    <div className={`${styles.logo} ${moveLeft ? styles.logoLeft : ''}`}>
      MovieGPT
    </div>
  );
};

// 新增背景Logo组件
interface BackgroundLogoProps {
  shouldHide: boolean;
}

export const BackgroundLogo: React.FC<BackgroundLogoProps> = ({ shouldHide }) => {
  return (
    <div className={`${styles.backgroundLogo} ${shouldHide ? styles.hidden : ''}`}>
      <img 
        src="/whu-logo.png.png" 
        alt="Wuhan University Logo"
        style={{
          width: '500px',
          height: '500px',
          opacity: 0.05,
          filter: 'grayscale(100%)',
          userSelect: 'none',
          pointerEvents: 'none',
          transition: 'all 0.3s ease'
        }}
      />
    </div>
  );
};

export default Logo;
