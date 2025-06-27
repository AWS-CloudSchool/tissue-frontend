import React, { useEffect, useState } from 'react';
import AuroraBackground from '../../components/AuroraBackground/AuroraBackground';
import InputBox from '../../components/InputBox/InputBox';
import TopBar from '../../components/TopBar/TopBar';
import Footer from '../../components/Footer/Footer';
import styles from './MainPage.module.css';

import MetallicPaint, { parseLogoImage } from '../../components/MetallicPaint/MetallicPaint';
import logo from '../../assets/logos/react-bits-logo-small-black.svg';

const MainPage = () => {
  const [imageData, setImageData] = useState(null);

  useEffect(() => {
    async function loadImage() {
      try {
        const response = await fetch(logo);
        const blob = await response.blob();
        const file = new File([blob], 'logo.svg', { type: blob.type });
        const parsed = await parseLogoImage(file);
        setImageData(parsed?.imageData ?? null);
      } catch (err) {
        console.error('이미지 로딩 실패:', err);
      }
    }

    loadImage();
  }, []);

  return (
    <>
      <AuroraBackground />
      <TopBar />
      <main className={styles.mainArea}>
        <div className={styles.content}>
          {/* metallic 로고 */}
          <div style={{ width: '100%', height: '200px', marginBottom: '2rem' }}>
            <MetallicPaint
              imageData={imageData ?? new ImageData(1, 1)}
              params={{
                edge: 2,
                patternBlur: 0.005,
                patternScale: 2,
                refraction: 0.015,
                speed: 0.3,
                liquid: 0.07
              }}
            />
          </div>

          {/* 설명 텍스트 */}
          <h1 className={styles.mainTitle}>
            유튜브 영상, 이제 읽듯이 확인하세요.
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
};

export default MainPage;
