import React from 'react';
import styles from './SplitText.module.css';

const SplitText = ({ text }) => {
  return (
    <span aria-label={text} className={styles.container}>
      {text.split('').map((char, i) => (
        <span 
          key={i} 
          className={styles.char}
          style={{ animationDelay: `${i * 0.045}s` }}
          aria-hidden="true"
        >
          {char === ' ' ? '\u00A0' : char}
        </span>
      ))}
    </span>
  );
};

export default SplitText; 