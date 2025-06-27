import React from 'react';
import styles from '../styles/App.module.css';

interface HeaderProps {
  isCompact: boolean;
  isDarkMode: boolean;
  onToggleDarkMode: () => void;
}

const Header: React.FC<HeaderProps> = ({ isCompact, isDarkMode, onToggleDarkMode }) => {
  return (
    <div className={`${styles.header} ${isCompact ? styles.headerCompact : ''}`}>
      <div className={`${styles.logo} ${isCompact ? styles.logoCompact : ''}`}>MovieGPT</div>
      {!isCompact && <div className={styles.brand}>404Found</div>}
      <button className={styles.themeToggle} onClick={onToggleDarkMode} title="切换主题">
        {isDarkMode ? '☀️' : '🌙'}
      </button>
    </div>
  );
};

export default Header; 