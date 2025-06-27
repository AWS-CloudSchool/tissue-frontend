import React from 'react';
import styles from './YoutubeSearchPage.module.css';

const YoutubeSearchPage = () => (
  <div className={styles.container}>
    <div className={styles.content}>
      <h1 className={styles.mainTitle}>유튜브 검색</h1>
      <p className={styles.subText}>유튜브 영상을 검색하고 분석해보세요.</p>
      <div className={styles.searchBar}>
        {/* 검색 입력 및 버튼 등 */}
      </div>
    </div>
    {/* 실제 검색 결과/리스트 등은 아래에 추가 */}
  </div>
);

export default YoutubeSearchPage; 