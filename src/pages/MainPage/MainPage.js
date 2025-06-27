import React from 'react';
import AuroraBackground from '../../components/AuroraBackground/AuroraBackground';
import InputBox from '../../components/InputBox/InputBox';
import SplitText from '../../components/SplitText/SplitText';
import TopBar from '../../components/TopBar/TopBar';
import Footer from '../../components/Footer/Footer';
import styles from './MainPage.module.css';

const MainPage = () => (
  <>
    <AuroraBackground />
    <TopBar />
    <main className={styles.mainArea}>
      <div className={styles.content}>
        <h1 className={styles.mainTitle}>
          <SplitText text="유튜브 영상, 이제 읽듯이 확인하세요." />
        </h1>
        <p className={styles.subText}>핵심 요약부터 시각 자료까지, 영상 하나로 리포트를 완성합니다.</p>
        <p className={styles.subText}>챗봇과 대화하며 원하는 정보를 쉽게 찾고, 요약 내용을 음성으로 들을 수도 있어요.</p>
        <InputBox />
        <div className={styles.guideText}>예시: YouTube URL 또는 PDF/텍스트 파일을 드래그하세요</div>
      </div>
    </main>
    <Footer />
  </>
);

export default MainPage; 