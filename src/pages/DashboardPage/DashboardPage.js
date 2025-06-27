import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import AuroraBackground from '../../components/AuroraBackground/AuroraBackground';
import TopBar from '../../components/TopBar/TopBar';
import Footer from '../../components/Footer/Footer';
import axios from 'axios';
import styles from './DashboardPage.module.css';
import { FaTasks, FaSpinner, FaClock, FaPlay, FaDownload } from 'react-icons/fa';
import { jwtDecode } from 'jwt-decode';

const Dashboard = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalAnalyses: 0,
    savedReports: 0,
    audioFiles: 0,
    totalViews: 0
  });
  const [recentAnalyses, setRecentAnalyses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [processingJobs, setProcessingJobs] = useState([]);
  const [progressMap, setProgressMap] = useState({});

  useEffect(() => {
    let interval;
    const fetchJobs = async () => {
      try {
        const res = await axios.get('/user/jobs');
        if (res.data && Array.isArray(res.data.jobs)) {
          const processing = res.data.jobs.filter(j => j.status === 'processing');
          setProcessingJobs(processing);
        }
      } catch (e) {}
    };
    const fetchProgress = async () => {
      for (const job of processingJobs) {
        try {
          const res = await axios.get(`/user/jobs/${job.id}/progress`);
          setProgressMap(prev => ({ ...prev, [job.id]: res.data }));
        } catch (e) {}
      }
    };
    fetchJobs();
    interval = setInterval(() => {
      fetchJobs();
      fetchProgress();
    }, 3000);
    return () => clearInterval(interval);
  }, [processingJobs.length]);

  useEffect(() => {
    const fetchReports = async () => {
      try {
        setLoading(true);
        // 1. 내 리포트/메타데이터 목록을 /s3/reports/list로 불러옴
        const response = await axios.get('/s3/reports/list');
        if (Array.isArray(response.data) && response.data.length > 0) {
          setRecentAnalyses(response.data);
          setStats({
            totalAnalyses: response.data.length,
            savedReports: response.data.length,
            audioFiles: response.data.filter(r => r.hasAudio).length,
            totalViews: response.data.length * 3
          });
        } else {
          setRecentAnalyses([]);
          setStats({ totalAnalyses: 0, savedReports: 0, audioFiles: 0, totalViews: 0 });
        }
      } catch (err) {
        setError('보고서 목록을 가져오는데 실패했습니다.');
      } finally {
        setLoading(false);
      }
    };
    fetchReports();
  }, []);

  const formatDate = (dateString) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('ko-KR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch (e) {
      return dateString;
    }
  };

  const handleAnalysisClick = (analysis) => {
    setLoading(true);
    if (analysis.url) {
      // presigned URL로 보고서 fetch
      fetch(analysis.url)
        .then(response => response.text())
        .then(data => {
          let parsedData;
          try {
            parsedData = JSON.parse(data);
          } catch (e) {
            parsedData = data;
          }
          navigate('/editor', {
            state: {
              analysisData: {
                report: parsedData.report,
                title: analysis.title
              }
            }
          });
        })
        .catch(error => {
          setError('보고서 데이터를 가져오는데 실패했습니다.');
        })
        .finally(() => {
          setLoading(false);
        });
    } else {
      setError('보고서 URL을 찾을 수 없습니다.');
      setLoading(false);
    }
  };

  const handlePlayAudio = (analysis, e) => {
    e.stopPropagation();
    if (analysis.hasAudio) {
      alert('오디오 재생 기능은 아직 구현되지 않았습니다.');
    }
  };

  const handleDownload = (analysis, e) => {
    e.stopPropagation();
    if (analysis.reportUrl) {
      window.open(analysis.reportUrl, '_blank');
    }
  };

  return (
    <div className={styles.pageContainer}>
      <AuroraBackground />
      <TopBar />
      <div className={styles.content}>
        <div className={styles.header}>
          <h1 className={styles.title}>대시보드</h1>
          <div className={styles.subtitle}>분석 현황과 최근 활동을 확인하세요</div>
        </div>
        {processingJobs.length > 0 && (
          <div className={styles.section}>
            <div className={styles.sectionTitle}><FaTasks /> 진행중인 작업</div>
            <div className={styles.analysisList}>
              {processingJobs.map(job => (
                <div className={styles.analysisItem} key={job.id}>
                  <div className={styles.analysisInfo}>
                    <div className={styles.analysisDetails}>
                      <div className={styles.analysisTitle}>{job.input_data?.youtube_url || 'YouTube 분석'}</div>
                      <div className={styles.analysisMeta}>
                        <span>Job ID: {job.id}</span>
                        <span>•</span>
                        <span>상태: {job.status === 'processing' ? '진행중' : job.status}</span>
                        <span>•</span>
                        <span>
                          진행률: {progressMap[job.id]?.progress ?? 0}%
                          {progressMap[job.id]?.message ? ` (${progressMap[job.id].message})` : ''}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className={styles.actionButtons}>
                    <FaSpinner className={styles.faSpin} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
        <div className={styles.statsGrid}>
          <div className={styles.statCard}>
            <div className={styles.statNumber}>{stats.totalAnalyses}</div>
            <div className={styles.statLabel}>총 분석 횟수</div>
          </div>
          <div className={styles.statCard}>
            <div className={styles.statNumber}>{stats.savedReports}</div>
            <div className={styles.statLabel}>저장된 보고서</div>
          </div>
          <div className={styles.statCard}>
            <div className={styles.statNumber}>{stats.audioFiles}</div>
            <div className={styles.statLabel}>오디오 파일</div>
          </div>
          <div className={styles.statCard}>
            <div className={styles.statNumber}>{stats.totalViews}</div>
            <div className={styles.statLabel}>총 조회수</div>
          </div>
        </div>
        <div className={styles.section}>
          <div className={styles.sectionTitle}>분석 결과</div>
          {error && <div className={styles.errorState}>{error}</div>}
          {loading ? (
            <div className={styles.loadingState}>
              <FaSpinner size={40} className={styles.faSpin} />
              <div>보고서 목록을 불러오는 중입니다...</div>
            </div>
          ) : recentAnalyses.length > 0 ? (
            <div className={styles.analysisList}>
              {recentAnalyses.map((analysis, index) => (
                <div
                  className={styles.analysisItem}
                  key={analysis.id || index}
                  onClick={() => handleAnalysisClick(analysis)}
                >
                  <div className={styles.analysisInfo}>
                    {analysis.youtube_thumbnail && (
                      <img src={analysis.youtube_thumbnail} alt={analysis.title} className={styles.thumbnail} />
                    )}
                    <div className={styles.analysisDetails}>
                      <div className={styles.analysisTitle}>{analysis.title}</div>
                      <div className={styles.analysisChannel}>{analysis.youtube_channel}</div>
                      <div className={styles.analysisMeta}>
                        <span>{analysis.type}</span>
                        <span>•</span>
                        <span><FaClock /> {formatDate(analysis.last_modified)}</span>
                        <span>•</span>
                        <span>{analysis.youtube_duration}</span>
                        <span>•</span>
                        <a href={analysis.youtube_url} target="_blank" rel="noopener noreferrer" style={{ color: '#4ade80', textDecoration: 'underline', marginLeft: 4 }}>유튜브 바로가기</a>
                      </div>
                    </div>
                  </div>
                  <div className={styles.actionButtons}>
                    {analysis.hasAudio && (
                      <button className={styles.actionButton} onClick={e => handlePlayAudio(analysis, e)}><FaPlay /></button>
                    )}
                    <button className={styles.actionButton} onClick={e => handleDownload(analysis, e)}><FaDownload /></button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className={styles.emptyState}>
              <div>저장된 분석 결과가 없습니다.</div>
              <div>홈페이지에서 YouTube URL을 입력하여 분석을 시작하세요.</div>
            </div>
          )}
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default Dashboard; 