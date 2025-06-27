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
      <div className={`${styles.logo} ${isCompact ? styles.logoCompact : ''}`}>
        MovieGPT
      </div>

      <button className={styles.themeToggle} onClick={onToggleDarkMode} title="切换主题">
        <span className={styles.themeIcon}>
          {isDarkMode ? (
            // 简笔画太阳 (亮色主题时显示)
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="5"/>
              <path d="M12 1v2m0 18v2M4.22 4.22l1.42 1.42m12.72 12.72l1.42 1.42M1 12h2m18 0h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/>
            </svg>
          ) : (
            // 简笔画月亮 (黑夜主题时显示)
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
            </svg>
          )}
        </span>
      </button>
    </div>
  );
};

export default Header; 