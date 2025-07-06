import React, { useEffect, useState } from 'react';
import { useParams, useLocation } from 'react-router-dom';
import SmartVisualization from '../components/SmartVisualization';
import ReactMarkdown from 'react-markdown';
import remarkBreaks from 'remark-breaks';
import styles from './EditorPage.module.css';
import BedrockChat from '../components/BedrockChat';
import axios from 'axios';
import LoadingOverlay from '../components/LoadingOverlay';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

// 중복 제목 자동 제거 함수 개선 (더 유연하게)
function getContentWithoutDuplicateTitle(title, content) {
  if (!content) return '';
  const lines = content.split('\n');
  const firstLineNorm = lines[0].replace(/[#\s]/g, '');
  const titleNorm = (title || '').replace(/\s/g, '');
  // 첫 줄이 title로 시작하거나, title이 포함되어 있으면 제거
  if (
    (firstLineNorm && titleNorm && firstLineNorm.startsWith(titleNorm)) ||
    (firstLineNorm && titleNorm && firstLineNorm.includes(titleNorm))
  ) {
    return lines.slice(1).join('\n');
  }
  return content;
}

const EditorPage = () => {
  const { reportId } = useParams();
  const location = useLocation();
  const presignedUrl = location.state?.presignedUrl;
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showChat, setShowChat] = useState(false);

  useEffect(() => {
    const fetchReport = async () => {
      setLoading(true);
      setError('');
      try {
        let data;
        
        // presignedUrl이 있으면 그것을 사용, 없으면 reportId로 API 호출
        if (presignedUrl) {
          const res = await fetch(presignedUrl);
          if (!res.ok) throw new Error('보고서 정보를 불러올 수 없습니다.');
          data = await res.json();
        } else {
          // reportId로 보고서 정보 가져오기
          const token = localStorage.getItem('access_token');
          const res = await axios.get(`${BACKEND_URL}/s3/reports/${reportId}`, {
            headers: { 'Authorization': `Bearer ${token}` }
          });
          data = res.data;
        }
        
        setReport(data);
      } catch (e) {
        setError(e.message || '에러 발생');
      } finally {
        setLoading(false);
      }
    };
    
    if (reportId) {
      fetchReport();
    } else {
      setError('보고서 ID가 없습니다.');
      setLoading(false);
    }
  }, [reportId, presignedUrl]);

  if (loading) return <LoadingOverlay text="보고서를 불러오는 중입니다..." />;
  
  if (error) return (
    <div style={{
      padding: 40, 
      color: '#ff4d6d', 
      textAlign: 'center',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: 16
    }}>
      <div style={{fontSize: '1.2em'}}>⚠️ 오류가 발생했습니다</div>
      <div>{error}</div>
      <button 
        onClick={() => window.history.back()}
        style={{
          padding: '8px 16px',
          background: '#4F5FFF',
          color: 'white',
          border: 'none',
          borderRadius: 8,
          cursor: 'pointer',
          fontSize: '0.9em'
        }}
      >
        이전 페이지로 돌아가기
      </button>
    </div>
  );
  
  if (!report) return null;

  const reportData = report.report || {};
  const meta = report.metadata || {};

  return (
    <div className={styles.container}>

      
      <div className={styles.main}>
        <div className={styles.flexRow}>
          {/* 에디터 영역 */}
          <div className={styles.editorWrapper}>
            <div className={styles.editorBody}>
              <h1 className={styles.heading1}>{meta.youtube_title || '유튜브 분석 보고서'}</h1>
              {Array.isArray(reportData.sections) && reportData.sections.length > 0 && (
                <div style={{marginTop:16}}>
                  {reportData.sections.map((section, idx) => (
                    section.data ? (
                      <SmartVisualization key={section.id || idx} section={section} />
                    ) : (
                      <div key={section.id || idx} className={styles.visualizationContent}>
                        <div className={styles.markdownBlock}>
                          <ReactMarkdown remarkPlugins={[remarkBreaks]}>
                            {getContentWithoutDuplicateTitle(section.title, section.content)}
                          </ReactMarkdown>
                        </div>
                      </div>
                    )
                  ))}
                </div>
              )}
            </div>
          </div>
          {/* 오른쪽: 유튜브+챗봇 */}
          <div className={styles.rightColumn}>
            {meta.youtube_url && (
              <div className={styles.youtubeBox}>
                <div className={styles.youtubeHeader}>
                  <span className={styles.youtubeTitle}>원본 유튜브 영상</span>
                  {meta.youtube_channel && (
                    <span className={styles.youtubeChannel}>{meta.youtube_channel}</span>
                  )}
                  <a
                    href={meta.youtube_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={styles.youtubeButton}
                  >
                    유튜브에서 열기
                  </a>
                </div>
                <div className={styles.youtubeFrameWrapper}>
                  <iframe
                    src={`https://www.youtube.com/embed/${meta.youtube_url.split('watch?v=')[1] || meta.youtube_url.split('/').pop()}`}
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    title="YouTube 원본 영상"
                    className={styles.youtubeFrame}
                  />
                </div>
              </div>
            )}
            <div className={styles.bedrockChatContainer}>
              {showChat ? (
                <BedrockChat 
                  s3Key={reportData.s3_key} 
                  reportId={reportId} 
                  onClose={() => setShowChat(false)} 
                />
              ) : (
                <button
                  style={{
                    width: '100%',
                    padding: '13px 0',
                    borderRadius: '12px',
                    background: 'linear-gradient(90deg, #3b82f6 0%, #6366f1 100%)',
                    color: '#fff',
                    fontWeight: 600,
                    fontSize: '1.05em',
                    border: 'none',
                    boxShadow: '0 2px 8px rgba(59,130,246,0.08)',
                    cursor: 'pointer'
                  }}
                  onClick={() => setShowChat(true)}
                >
                  💬 챗봇 열기
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditorPage; 