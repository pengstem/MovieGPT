import React from 'react';
import styles from '../styles/App.module.css';

interface LogoProps {
  moveLeft: boolean;
}

const Logo: React.FC<LogoProps> = ({ moveLeft }) => (
  <div className={`${styles.logo} ${moveLeft ? styles.logoLeft : ''}`}>MovieGPT</div>
);

export default Logo;
