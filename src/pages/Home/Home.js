import React, { useEffect, useState } from 'react';
import './home.css';

import TopBar from '../../components/TopBar';
import Footer from '../../components/Footer';
import AuroraBackground from '../../components/AuroraBackground';
import InputBox from '../../components/InputBox';

import MetallicPaint, { parseLogoImage } from '../../components/MetallicPaint/MetallicPaint';

import logo from '../../assets/logos/react-bits-logo-small-black.svg';

const Home = () => {
  const [imageData, setImageData] = useState(null);

  useEffect(() => {
    async function loadImage() {
      try {
        const response = await fetch(logo);
        const blob = await response.blob();
        const file = new File([blob], "logo.svg", { type: blob.type });

        const parsed = await parseLogoImage(file);
        setImageData(parsed?.imageData ?? null);
      } catch (err) {
        console.error("Failed to parse image:", err);
      }
    }

    loadImage();
  }, []);

  return (
    <div className="app-container">
      <AuroraBackground />
      <TopBar />
      <div className="main-area">
        <div className="content">
          {/* ✅ MetallicPaint 로고 렌더링 */}
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
              />핵심 요약부터 시각 자료까지, 영상 하나로 리포트를 완성합니다.
            </div>
          <p className="sub-text">핵심 요약부터 시각 자료까지, 영상 하나로 리포트를 완성합니다.</p>
          <p className="sub-text">챗봇과 대화하며 원하는 정보를 쉽게 찾고, 요약 내용을 음성으로 들을 수도 있어요.</p>
          <InputBox />
          <div className="guide-text">예시: YouTube URL 또는 PDF/텍스트 파일을 드래그하세요</div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default Home;
