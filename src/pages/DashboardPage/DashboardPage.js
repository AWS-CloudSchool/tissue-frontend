import React from 'react';
import styles from './DashboardPage.module.css';

const DashboardPage = () => (
  <div className={styles.container}>
    <header className={styles.header}>
      <h1 className={styles.title}>대시보드</h1>
      <p className={styles.subtitle}>여기에 대시보드 요약/통계/리스트 등이 들어갑니다.</p>
    </header>
    {/* 실제 대시보드 내용은 아래에 추가 */}
  </div>
);

export default DashboardPage; 