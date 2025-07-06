import React from 'react';
import styles from './Footer.module.css';

const Footer = () => {
  return (
    <footer className={styles.footer}>
      <span>요금제</span>
      <span>API</span>
      <span>채용</span>
      <span>커뮤니티</span>
      <span>한국어</span>
    </footer>
  );
};

export default Footer; 