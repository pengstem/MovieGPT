import React from 'react';
import styles from '../styles/App.module.css';

interface HeaderProps {
  isCompact: boolean;
}

const Header: React.FC<HeaderProps> = ({ isCompact }) => {
  return (
    <div className={`${styles.header} ${isCompact ? styles.headerCompact : ''}`}>
      <div className={`${styles.logo} ${isCompact ? styles.logoCompact : ''}`}>MovieGPT</div>
      {!isCompact && <div className={styles.brand}>404Found</div>}
    </div>
  );
};

export default Header; 