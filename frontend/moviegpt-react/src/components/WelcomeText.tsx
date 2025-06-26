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
      <div style={{ position: 'relative', width: '100%', textAlign: 'center' }}>
        <div style={{
          position: 'absolute',
          top: '0',
          right: '0',
          fontSize: '14px',
          color: '#999',
          opacity: 0.6
        }}>
          404NotFound
        </div>
        <h1 style={{
          fontSize: '2.5rem',
          fontWeight: '700',
          color: '#333',
          marginBottom: '32px',
          marginTop: '40px'
        }}>
          MovieGPT
        </h1>
      </div>
    </div>
  );
};

export default WelcomeText; 