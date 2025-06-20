import React, { useState, useEffect } from 'react';
import axios from 'axios';
import styled from 'styled-components';
import { colors } from '../styles/colors';
import { FaPlay, FaEye, FaCalendarAlt, FaFileAlt } from "react-icons/fa";
import { useLocation, useNavigate } from 'react-router-dom';
import TopBar from './TopBar';
import Footer from './Footer';
import AuroraBackground from './AuroraBackground';

const PageContainer = styled.div`
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  color: white;
  font-family: Arial, sans-serif;
`;

const Content = styled.div`
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 2.2rem;
  margin-top: 2.5rem;
`;

const MainTitle = styled.h1`
  font-size: 2.1rem;
  font-weight: bold;
  margin-bottom: 0.7rem;
  line-height: 1.18;
  text-shadow: 0 0 12px rgba(255, 255, 255, 0.5);
  color: white;
`;

const SubText = styled.p`
  font-size: 1.13rem;
  color: ${colors.white};
  font-weight: 400;
  margin: 0.5rem 0 0.5rem 0;
  line-height: 1.7;
  text-shadow: 0 0 10px rgba(0,0,0,0.8);
  background: none;
  border: none;
  display: block;
`;

const SearchBar = styled.div`
  display: flex;
  gap: 8px;
  margin: 18px 0 32px 0;
  width: 100%;
  max-width: 600px;
`;

const Input = styled.input`
  flex: 1;
  border: none;
  background: rgba(255,255,255,0.18);
  border: 2px solid #eaffb7;
  border-radius: 18px;
  box-shadow: 0 2px 16px 0 rgba(180,255,255,0.08);
  padding: 10px 16px;
  font-size: 1.13rem;
  color: #222;
  outline: none;
  backdrop-filter: blur(2px);
  &::placeholder {
    color: #b6b6b6;
    font-size: 1rem;
  }
`;

const Button = styled.button`
  background: #eaffb7;
  border: none;
  border-radius: 18px;
  padding: 0 22px;
  font-size: 1.05rem;
  color: #7e7e00;
  box-shadow: 0 0 8px #eaffb7aa;
  cursor: pointer;
  font-weight: 600;
  transition: background 0.2s;
  &:hover {
    background: #f7ffde;
  }
`;

const VideoList = styled.div`
  width: 100%;
  max-width: 700px;
  margin: 0 auto 40px auto;
  display: flex;
  flex-direction: column;
  gap: 18px;
`;

const VideoRow = styled.div`
  display: flex;
  align-items: center;
  background: rgba(255,255,255,0.1);
  border-radius: 14px;
  box-shadow: 0 2px 12px 0 rgba(0,0,0,0.2);
  padding: 12px 18px;
  gap: 18px;
  backdrop-filter: blur(12px);
  transition: box-shadow 0.2s, transform 0.2s;
  &:hover {
    box-shadow: 0 4px 24px 0 rgba(0,0,0,0.3);
    transform: translateY(-2px) scale(1.01);
  }
`;

const ThumbnailWrapper = styled.a`
  position: relative;
  width: 120px;
  min-width: 120px;
  height: 68px;
  display: block;
`;

const Thumbnail = styled.img`
  width: 100%;
  height: 100%;
  border-radius: 8px;
  object-fit: cover;
`;

const PlayIcon = styled(FaPlay)`
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  color: white;
  font-size: 1.7rem;
  opacity: 0.85;
  pointer-events: none;
`;

const Info = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  min-width: 0;
`;

const SummaryButton = styled.button`
  background: #eaffb7;
  border: none;
  border-radius: 8px;
  padding: 8px 12px;
  font-size: 0.875rem;
  color: #7e7e00;
  cursor: pointer;
  font-weight: 600;
  transition: background 0.2s;
  display: flex;
  align-items: center;
  gap: 6px;
  margin-top: 8px;
  &:hover {
    background: #f7ffde;
  }
  &:disabled {
    background: #ccc;
    cursor: not-allowed;
  }
`;

const Title = styled.a`
  font-weight: bold;
  color: ${colors.white};
  font-size: 1.08rem;
  text-decoration: none;
  margin-bottom: 2px;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-shadow: 0 0 8px rgba(0,0,0,0.5);
  &:hover {
    text-decoration: underline;
  }
`;

const Channel = styled.div`
  font-size: 13px;
  color: ${colors.white};
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 100%;
  opacity: 0.8;
`;

const Meta = styled.div`
  font-size: 12px;
  color: ${colors.white};
  display: flex;
  gap: 10px;
  align-items: center;
  margin-top: 2px;
  opacity: 0.7;
`;

const ErrorMsg = styled.div`
  color: ${colors.error};
  margin-top: 20px;
`;

function formatDuration(seconds) {
  if (!seconds || isNaN(seconds)) return '';
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  return h > 0
    ? `${h}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`
    : `${m}:${s.toString().padStart(2, '0')}`;
}

function timeAgo(dateString) {
  const now = new Date();
  const date = new Date(dateString);
  const diff = (now - date) / 1000;
  if (diff < 60 * 60 * 24) return `${Math.floor(diff / (60 * 60))}시간 전`;
  if (diff < 60 * 60 * 24 * 30) return `${Math.floor(diff / (60 * 60 * 24))}일 전`;
  if (diff < 60 * 60 * 24 * 365) return `${Math.floor(diff / (60 * 60 * 24 * 30))}개월 전`;
  return `${Math.floor(diff / (60 * 60 * 24 * 365))}년 전`;
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
    // eslint-disable-next-line
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
        navigate('/editor', { 
          state: { 
            analysisData: analysisData,
            youtubeUrl: youtubeUrl 
          } 
        });
      }
    } catch (err) {
      console.error('요약 요청 실패:', err);
      alert('요약 요청에 실패했습니다.');
    } finally {
      setSummaryLoading(prev => ({ ...prev, [videoId]: false }));
    }
  };

  return (
    <PageContainer>
      <AuroraBackground />
      <TopBar />
      <Content>
        <MainTitle>유튜브 영상 검색</MainTitle>
        <SubText>검색어로 유튜브 영상을 찾아보세요. 썸네일, 제목, 채널, 조회수, 업로드일을 한눈에 볼 수 있습니다.</SubText>
        <SearchBar>
          <Input
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="유튜브 영상 검색어를 입력하세요"
            onKeyDown={e => { if (e.key === 'Enter') onSearchClick(); }}
          />
          <Button onClick={onSearchClick}>검색</Button>
        </SearchBar>
      </Content>
      {loading && <div style={{ color: colors.white, margin: '32px 0', textAlign: 'center' }}>검색 중입니다...</div>}
      {error && <ErrorMsg>{error}</ErrorMsg>}
      <VideoList>
        {videos.map(video => (
          <VideoRow key={video.video_id}>
            <ThumbnailWrapper href={`https://www.youtube.com/watch?v=${video.video_id}`} target="_blank" rel="noopener noreferrer">
              <Thumbnail src={video.thumbnail_url} alt={video.title} />
              <PlayIcon />
            </ThumbnailWrapper>
            <Info>
              <Title href={`https://www.youtube.com/watch?v=${video.video_id}`} target="_blank" rel="noopener noreferrer">
                {video.title}
              </Title>
              <Channel>{video.channel_title}</Channel>
              <Meta>
                <FaEye style={{ marginRight: 2 }} />
                {video.view_count?.toLocaleString?.() ?? video.view_count}
                <FaCalendarAlt style={{ marginLeft: 8, marginRight: 2 }} />
                {new Date(video.published_at).toLocaleDateString()}
              </Meta>
              <SummaryButton 
                onClick={() => handleSummaryRequest(video.video_id)}
                disabled={summaryLoading[video.video_id]}
              >
                <FaFileAlt />
                {summaryLoading[video.video_id] ? '요약 중...' : '요약 요청'}
              </SummaryButton>
            </Info>
          </VideoRow>
        ))}
      </VideoList>
      {(!loading && videos.length === 0 && !error) && <div style={{marginTop:32, color: colors.white, textAlign: 'center', opacity: 0.8}}>검색 결과가 없습니다.</div>}
      <Footer />
    </PageContainer>
  );
};

export default YoutubeSearchPage; 