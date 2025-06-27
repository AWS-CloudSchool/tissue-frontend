import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import AuroraBackground from '../../components/AuroraBackground/AuroraBackground';
import TopBar from '../../components/TopBar/TopBar';
import Footer from '../../components/Footer/Footer';
import axios from 'axios';
import styles from './DashboardPage.module.css';
import { FaTasks, FaSpinner, FaClock, FaPlay, FaDownload } from 'react-icons/fa';

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
        const response = await axios.get('/s3/reports/list');
        if (response.data && Array.isArray(response.data) && response.data.length > 0) {
          const reports = response.data.map(report => ({
            id: report.id || '',
            title: report.title || '제목 없음',
            channel: report.youtube_channel || 'Unknown Channel',
            duration: report.youtube_duration || 'Unknown',
            thumbnail: report.youtube_thumbnail || '',
            type: report.type || 'YouTube',
            date: report.last_modified || new Date().toISOString(),
            status: 'completed',
            hasAudio: false,
            reportUrl: report.url || '',
            youtubeUrl: report.youtube_url || '',
            metadata: report.metadata || {}
          }));
          reports.sort((a, b) => new Date(b.date) - new Date(a.date));
          setRecentAnalyses(reports);
          setStats({
            totalAnalyses: reports.length,
            savedReports: reports.length,
            audioFiles: reports.filter(r => r.hasAudio).length,
            totalViews: reports.length * 3
          });
        } else {
          await fetchReportsFromS3();
        }
      } catch (err) {
        try {
          await fetchReportsFromS3();
        } catch (s3Err) {
          setError('보고서 목록을 가져오는데 실패했습니다.');
        }
      } finally {
        setLoading(false);
      }
    };
    const fetchReportsFromS3 = async () => {
      try {
        const response = await axios.get('/s3/list?prefix=reports/');
        if (response.data && Array.isArray(response.data.objects) && response.data.objects.length > 0) {
          const reports = response.data.objects
            .filter(obj => obj.Key && obj.Key.endsWith('.json'))
            .map(obj => ({
              id: obj.Key,
              title: extractTitleFromKey(obj.Key) || '제목 없음',
              type: 'YouTube',
              date: obj.LastModified || new Date().toISOString(),
              status: 'completed',
              hasAudio: false,
              reportUrl: `https://${response.data.bucket}.s3.${response.data.region}.amazonaws.com/${obj.Key}`
            }));
          reports.sort((a, b) => new Date(b.date) - new Date(a.date));
          setRecentAnalyses(reports);
          setStats({
            totalAnalyses: reports.length,
            savedReports: reports.length,
            audioFiles: 0,
            totalViews: reports.length * 3
          });
        } else {
          const dummyReports = [
            {
              id: 'report_1',
              title: '최근 분석한 YouTube 영상',
              type: 'YouTube',
              date: new Date().toISOString(),
              status: 'completed',
              hasAudio: false
            }
          ];
          setRecentAnalyses(dummyReports);
          setStats({
            totalAnalyses: 1,
            savedReports: 1,
            audioFiles: 0,
            totalViews: 3
          });
        }
      } catch (err) {
        throw err;
      }
    };
    fetchReports();
  }, []);

  const extractTitleFromKey = (key) => {
    if (!key) return '제목 없음';
    const fileName = key.split('/').pop();
    const nameWithoutExt = fileName.replace(/\.[^/.]+$/, '');
    const cleanName = nameWithoutExt
      .replace(/_report$/, '')
      .replace(/^report_/, '')
      .replace(/[0-9a-f]{8}[-_][0-9a-f]{4}[-_][0-9a-f]{4}[-_][0-9a-f]{4}[-_][0-9a-f]{12}/i, '');
    return cleanName.replace(/_/g, ' ').trim() || '분석 보고서';
  };

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
    if (analysis.reportUrl) {
      fetch(analysis.reportUrl)
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
                final_output: parsedData,
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
                    {analysis.thumbnail && <img src={analysis.thumbnail} alt={analysis.title} className={styles.thumbnail} />}
                    <div className={styles.analysisDetails}>
                      <div className={styles.analysisTitle}>{analysis.title}</div>
                      <div className={styles.analysisChannel}>{analysis.channel}</div>
                      <div className={styles.analysisMeta}>
                        <span>{analysis.type}</span>
                        <span>•</span>
                        <span><FaClock /> {formatDate(analysis.date)}</span>
                        <span>•</span>
                        <span>{analysis.duration}</span>
                        <span>•</span>
                        <span>{analysis.status === 'completed' ? '완료' : '진행중'}</span>
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