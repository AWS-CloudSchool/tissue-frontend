import React, { useState, useEffect } from 'react';
import axios from 'axios';
import styles from './YoutubeSearch.module.css';
import { FaSearch, FaSpinner } from 'react-icons/fa';
import { useLocation } from 'react-router-dom';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

// 더미 인기 검색어 데이터
const trendingKeywords = [
  '마이크로서비스 아키텍처',
  'AI 면접 합격 비법',
  '2024 최신 IT 트렌드',
  '챗GPT 활용법',
  '코딩테스트 꿀팁',
  '유튜브 쇼츠 만들기',
  '스프링부트 실전',
  '파이썬 자동화',
  '데이터 분석 포트폴리오'
];

const YoutubeSearch = () => {
  const location = useLocation();
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [results, setResults] = useState([]);
  const [summaryMsg, setSummaryMsg] = useState('');
  const [summarizingId, setSummarizingId] = useState(null);

  useEffect(() => {
    if (location.state?.query) {
      setQuery(location.state.query);
      setTimeout(() => handleSearch(location.state.query), 0);
    }
    // eslint-disable-next-line
  }, [location.state]);

  const handleSearch = async (q) => {
    const searchQuery = typeof q === 'string' ? q : query;
    if (!searchQuery.trim()) return;
    setLoading(true);
    setError('');
    setResults([]);
    try {
      const token = localStorage.getItem('access_token');
      const res = await axios.post(`${BACKEND_URL}/search/youtube`, { query: searchQuery.trim() }, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      setResults(res.data.videos || []);
    } catch (e) {
      setError(e.response?.data?.message || '검색 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const handleSummarize = async (videoId) => {
    setSummaryMsg('');
    setSummarizingId(videoId);
    try {
      const token = localStorage.getItem('access_token');
      await axios.post(`${BACKEND_URL}/analyze/youtube`, { youtube_url: `https://www.youtube.com/watch?v=${videoId}` }, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      setSummaryMsg('분석이 시작되었습니다! 내 지식에서 결과를 확인하세요.');
    } catch (e) {
      setSummaryMsg('분석 요청 중 오류가 발생했습니다.');
    } finally {
      setSummarizingId(null);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') handleSearch();
  };

  return (
    <div className={styles.container}>
      <div className={styles.contentWrapper}>
        <h1 className={styles.title}>Tissue에서 원하는 Youtube 영상을 찾아보세요!</h1>
        <div className={styles.searchBox}>
          <input
            className={styles.input}
            type="text"
            placeholder="검색어를 입력하세요"
            value={query}
            onChange={e => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={loading}
          />
          <button className={styles.searchBtn} onClick={handleSearch} disabled={loading}>
            {loading ? <FaSpinner className={styles.spinner} /> : <FaSearch />}
          </button>
        </div>
        {/* 인기 검색어: query가 비어있을 때만 노출 */}
        {!query.trim() && !loading && (
          <div className={styles.trendingBox}>
            <div className={styles.trendingTitle}>🔥 실시간 인기 검색어</div>
            <div className={styles.trendingList}>
              {trendingKeywords.map((kw, i) => (
                <button
                  key={kw}
                  className={styles.trendingItem}
                  onClick={() => {
                    setQuery(kw);
                    setTimeout(() => handleSearch(), 0);
                  }}
                  disabled={loading}
                >
                  {i + 1}. {kw}
                </button>
              ))}
            </div>
          </div>
        )}
        {error && <div className={styles.error}>{error}</div>}
        {summaryMsg && <div className={styles.summaryMsg}>{summaryMsg}</div>}
        <div className={styles.resultsGrid}>
          {results.map((item, idx) => (
            <div className={styles.resultCard} key={item.video_id || idx}>
              <img src={item.thumbnail_url || '/default-thumb.png'} alt={item.title} className={styles.thumbnail} />
              <div className={styles.info}>
                <div className={styles.resultTitle}>{item.title}</div>
                <div className={styles.channel}>{item.channel_title}</div>
                <div className={styles.meta}>{item.published_at}</div>
                <div className={styles.meta}>
                  {(() => {
                    const sec = parseInt(item.duration, 10);
                    if (!isNaN(sec) && sec > 0) {
                      const h = Math.floor(sec / 3600);
                      const m = Math.floor((sec % 3600) / 60);
                      const s = sec % 60;
                      if (h > 0) {
                        return `영상 길이: ${h}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
                      } else {
                        return `영상 길이: ${m}:${s.toString().padStart(2, '0')}`;
                      }
                    }
                    return null;
                  })()}
                </div>
                <div className={styles.actionsRow}>
                  <a href={`https://www.youtube.com/watch?v=${item.video_id}`} target="_blank" rel="noopener noreferrer" className={styles.link}>영상 바로가기</a>
                  <span
                    className={styles.summarizeLink}
                    onClick={() => handleSummarize(item.video_id)}
                    style={{ cursor: summarizingId === item.video_id ? 'not-allowed' : 'pointer', opacity: summarizingId === item.video_id ? 0.5 : 1 }}
                  >
                    {summarizingId === item.video_id ? '요약 중...' : '영상 요약하기'}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default YoutubeSearch; 