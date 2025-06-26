import React, { useEffect, useState } from 'react';
import styles from '../styles/App.module.css';

interface WelcomeTextProps {
  shouldHide: boolean;
}

const WelcomeText: React.FC<WelcomeTextProps> = ({ shouldHide }) => {
  const [isHidden, setIsHidden] = useState(false);
  const [shouldRemove, setShouldRemove] = useState(false);

  useEffect(() => {
    if (shouldHide && !isHidden) {
      setIsHidden(true);
      // 完全移除元素以避免占用空间
      setTimeout(() => {
        setShouldRemove(true);
      }, 500);
    }
  }, [shouldHide, isHidden]);

  if (shouldRemove) {
    return null;
  }

  return (
    <div className={`${styles.welcomeText} ${isHidden ? styles.hidden : ''}`}>
      <div style={{
        textAlign: 'center',
        marginTop: '60px'
      }}>
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
    </div>
  );
};

export default WelcomeText; 