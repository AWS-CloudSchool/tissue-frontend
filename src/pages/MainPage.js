import React from 'react';
import InputBox from '../components/InputBox';
import styles from './MainPage.module.css';

const MainPage = () => {
  return (
    <div className={styles.centerBox}>
      <h2 className={styles.title}>
        유튜브 영상, 이제 읽어서 확인하세요.<br />
        <span className={styles.subtitle}>
          핵심 요약부터 시각 자료까지, 영상 하나로 리포트를 완성합니다.<br />
          챗봇과 대화하며 원하는 정보를 쉽게 찾고, 요약 내용을 음성으로 들을 수도 있어요.
        </span>
      </h2>
      <InputBox />
    </div>
  );
};

export default MainPage; 