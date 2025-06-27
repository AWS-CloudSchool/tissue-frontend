import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './search.css';
import { FaPlay, FaEye, FaCalendarAlt, FaFileAlt, FaClock } from "react-icons/fa";
import { useLocation, useNavigate } from 'react-router-dom';
import TopBar from '../../components/TopBar';
import Footer from '../../components/Footer';
import AuroraBackground from '../../components/AuroraBackground';

function formatDuration(duration) {
  if (!duration || duration === "0" || duration === 0) return null;
  const durationNum = typeof duration === 'string' ? parseInt(duration) : duration;
  if (isNaN(durationNum) || durationNum <= 0) return null;

  if (typeof duration === 'string' && duration.startsWith('PT')) {
    const match = duration.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
    if (match) {
      const hours = parseInt(match[1]) || 0;
      const minutes = parseInt(match[2]) || 0;
      const seconds = parseInt(match[3]) || 0;
      if (hours > 0) {
        return `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
      } else {
        return `${minutes}:${seconds.toString().padStart(2, '0')}`;
      }
    }
  }

  const h = Math.floor(durationNum / 3600);
  const m = Math.floor((durationNum % 3600) / 60);
  const s = durationNum % 60;

  if (h > 0) {
    return `${h}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  } else {
    return `${m}:${s.toString().padStart(2, '0')}`;
  }
}

const YoutubeSearchPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const params = new URLSearchParams(location.search);
  const initialQuery = params.get('query') || '';
  const [query, setQuery] = useState(initialQuery);
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [summaryLoading, setSummaryLoading] = useState({});

  useEffect(() => {
    if (initialQuery) {
      setQuery(initialQuery);
      handleSearch(initialQuery);
    }
  }, [initialQuery]);

  const handleSearch = async (q = query) => {
    if (!q.trim()) return;
    setLoading(true);
    setError(null);
    setVideos([]);
    try {
      const res = await axios.post('/youtube/search', { query: q, max_results: 10 });
      setVideos(res.data.videos || []);
    } catch (err) {
      setError('검색 실패: ' + (err.response?.data?.detail || err.message));
    } finally {
      setLoading(false);
    }
  };

  const onSearchClick = () => {
    if (query.trim()) {
      navigate(`/youtube-search?query=${encodeURIComponent(query.trim())}`);
    }
  };

  const handleSummaryRequest = async (videoId) => {
    setSummaryLoading(prev => ({ ...prev, [videoId]: true }));
    try {
      const youtubeUrl = `https://www.youtube.com/watch?v=${videoId}`;
      const response = await axios.post('/youtube/analysis', { youtube_url: youtubeUrl });
      if (response.data.analysis_results?.fsm_analysis?.final_output) {
        const analysisData = response.data.analysis_results.fsm_analysis;
        navigate('/editor', { state: { analysisData } });
      }
    } catch (err) {
      console.error('요약 요청 실패:', err);
      alert('요약 요청에 실패했습니다.');
    } finally {
      setSummaryLoading(prev => ({ ...prev, [videoId]: false }));
    }
  };

  return (
    <div className="page-container">
      <AuroraBackground />
      <TopBar />
      <div className="content">
        <h1 className="main-title">유튜브 영상 검색</h1>
        <p className="sub-text">
          검색어로 유튜브 영상을 찾아보세요. 썸네일, 제목, 채널, 조회수, 업로드일을 한눈에 볼 수 있습니다.
        </p>
        <div className="search-bar">
          <input
            className="input"
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="유튜브 영상 검색어를 입력하세요"
            onKeyDown={e => { if (e.key === 'Enter') onSearchClick(); }}
          />
          <button className="button" onClick={onSearchClick}>검색</button>
        </div>
      </div>

      {loading && <div style={{ color: 'white', margin: '32px 0', textAlign: 'center' }}>검색 중입니다...</div>}
      {error && <div className="error-msg">{error}</div>}

      <div className="video-list">
        {videos.map(video => (
          <div className="video-row" key={video.video_id}>
            <div className="video-content">
              <a className="thumbnail-wrapper" href={`https://www.youtube.com/watch?v=${video.video_id}`} target="_blank" rel="noopener noreferrer">
                <img className="thumbnail" src={video.thumbnail_url} alt={video.title} />
                <FaPlay className="play-icon" />
                {formatDuration(video.duration) && <div className="duration">{formatDuration(video.duration)}</div>}
              </a>
              <div className="info">
                <a className="video-title" href={`https://www.youtube.com/watch?v=${video.video_id}`} target="_blank" rel="noopener noreferrer">
                  {video.title}
                </a>
                <div className="channel">{video.channel_title}</div>
                <div className="meta">
                  <div className="meta-item"><FaEye />{video.view_count?.toLocaleString?.() ?? video.view_count}</div>
                  <div className="meta-item"><FaCalendarAlt />{new Date(video.published_at).toLocaleDateString()}</div>
                  {formatDuration(video.duration) && (
                    <div className="meta-item"><FaClock />{formatDuration(video.duration)}</div>
                  )}
                </div>
              </div>
            </div>
            <button
              className="summary-button"
              onClick={() => handleSummaryRequest(video.video_id)}
              disabled={summaryLoading[video.video_id]}
            >
              <FaFileAlt />
              {summaryLoading[video.video_id] ? '요약 중...' : '요약 요청'}
            </button>
          </div>
        ))}
      </div>

      {(!loading && videos.length === 0 && !error) &&
        <div style={{ marginTop: 32, color: 'white', textAlign: 'center', opacity: 0.8 }}>
          검색 결과가 없습니다.
        </div>
      }
      <Footer />
    </div>
  );
};

export default YoutubeSearchPage;
