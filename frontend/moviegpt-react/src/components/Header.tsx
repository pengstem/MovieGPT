import React from 'react';
import styles from '../styles/App.module.css';

const Header: React.FC = () => {
  return (
    <div className={styles.header}>
      <div className={styles.logo}>MovieGPT</div>
      <div className={styles.brand}>404NotFound</div>
    </div>
  );
};

export default Header; 