import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import styles from './InputBox.module.css';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

// 더미 인기 검색어 데이터
const trendingKeywords = [
  '마이크로서비스 아키텍처',
  'AI 면접 합격 비법',
  '2025 최신 IT 트렌드',
  '챗GPT 활용법',
  '코딩테스트 꿀팁',
  '유튜브 쇼츠 만들기',
  '스프링부트 실전',
  '파이썬 자동화',
  '데이터 분석 포트폴리오'
];

const InputBox = () => {
  const [inputValue, setInputValue] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [result, setResult] = useState(null);
  const navigate = useNavigate();

  const handleSearchPage = () => {
    if (!inputValue.trim()) return;
    navigate('/youtube-search', { state: { query: inputValue.trim() } });
  };

  return (
    <div className={styles.inputBoxWrapper}>
      <input
        className={styles.input}
        type="text"
        placeholder="Youtube URL 또는 검색어를 입력하세요."
        value={inputValue}
        onChange={e => setInputValue(e.target.value)}
        disabled={loading}
        onKeyDown={e => { if (e.key === 'Enter') handleSearchPage(); }}
      />
      <button className={styles.summarizeBtn} onClick={handleSearchPage} disabled={loading}>
        검색하기 & 요약하기
      </button>
      {/* 인기 검색어: inputValue가 비어있을 때만 노출 */}
      {!inputValue.trim() && !loading && (
        <div className={styles.trendingBox}>
          <div className={styles.trendingTitle}>🔥 실시간 인기 검색어</div>
          <div className={styles.trendingList}>
            {trendingKeywords.map((kw, i) => (
              <button
                key={kw}
                className={styles.trendingItem}
                onClick={() => {
                  setInputValue(kw);
                  setTimeout(() => handleSearchPage(), 0);
                }}
                disabled={loading}
              >
                {i + 1}. {kw}
              </button>
            ))}
          </div>
        </div>
      )}
      {!loading && error && <div style={{ color: '#ff4d6d', marginTop: 12 }}>{error}</div>}
      {!loading && result && <div style={{ color: '#4F5FFF', marginTop: 12 }}>{result.message || JSON.stringify(result)}</div>}
    </div>
  );
};

export default InputBox; 