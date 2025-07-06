import React, { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import styles from './MyKnowledge.module.css';
import { FaTasks, FaSpinner, FaClock, FaPlay, FaDownload } from 'react-icons/fa';
import LoadingOverlay from '../components/LoadingOverlay';
import { useNavigate } from 'react-router-dom';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

function getYoutubeThumbnail(item) {
  return item?.youtube_thumbnail || '/default-thumb.png';
}

// 진행률 프로그레스 바 컴포넌트
function ProgressBar({ progress }) {
  return (
    <div style={{ width: '100%', background: '#f3f5fa', borderRadius: 6, height: 8, marginTop: 8 }}>
      <div style={{ width: `${progress}%`, background: '#4F5FFF', height: 8, borderRadius: 6, transition: 'width 0.4s' }} />
    </div>
  );
}

const JobStatus = ({ jobs }) => {
  if (!jobs.length) return null;
  return (
    <div style={{
      background: '#f4f7ff',
      border: '1.5px solid #4F5FFF',
      borderRadius: 14,
      padding: '18px 24px',
      marginBottom: 28,
      color: '#222',
      fontSize: '1.05rem',
      boxShadow: '0 2px 12px 0 rgba(79,95,255,0.07)'
    }}>
      <b style={{color:'#4F5FFF'}}>진행 중인 YouTube 분석</b>
      <div style={{marginTop: 10, display:'flex', flexWrap:'wrap', gap:18}}>
        {jobs.map(job => (
          <div key={job.job_id} style={{display:'flex',alignItems:'center',gap:12,padding:'8px 0'}}>
            <img src={getYoutubeThumbnail(job)} alt="thumb" style={{width:48,height:32,borderRadius:6,objectFit:'cover',border:'1px solid #eee'}} />
            <span style={{maxWidth:220,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{job.youtube_url}</span>
            <span style={{color: job.status==='completed' ? '#4F5FFF' : job.status==='failed' ? '#ff4d6d' : '#888', fontWeight:600}}>
              {job.status==='pending' && '대기 중'}
              {job.status==='running' && '분석 중'}
              {job.status==='completed' && '완료'}
              {job.status==='failed' && '실패'}
            </span>
            <span style={{fontSize:'0.95em',color:'#aaa',marginLeft:6}}>{new Date(job.last_modified || job.created_at).toLocaleString()}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

const MyKnowledge = ({ reports: propReports }) => {
  const [reports, setReports] = useState(propReports || []);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [jobs, setJobs] = useState([]);
  const [jobProgress, setJobProgress] = useState({}); // job_id: {progress, message, status}
  const [loadingJobs, setLoadingJobs] = useState(true);
  const [stats, setStats] = useState({
    totalAnalyses: 0,
    savedReports: 0,
    totalViews: 0
  });
  const pollingRef = useRef();
  const navigate = useNavigate();
  const [navigatedJobIds, setNavigatedJobIds] = useState([]);

  useEffect(() => {
    setReports(propReports || []);
    if (!propReports) {
      setLoading(true);
      return;
    }
    setStats({
      totalAnalyses: propReports.length,
      savedReports: propReports.length,
      totalViews: propReports.length * 3
    });
    setTimeout(() => setLoading(false), 700);
  }, [propReports]);

  // jobs 목록 polling
  useEffect(() => {
    let timer;
    const fetchJobs = async () => {
      try {
        setLoadingJobs(true);
        const token = localStorage.getItem('access_token');
        const res = await axios.get(`${BACKEND_URL}/analyze/jobs`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        setJobs(res.data.jobs || []);
      } catch (e) {
        setJobs([]);
      } finally {
        setLoadingJobs(false);
      }
    };
    fetchJobs();
    timer = setInterval(fetchJobs, 5000);
    return () => clearInterval(timer);
  }, []);

  // 각 진행중인 job의 진행률 polling
  useEffect(() => {
    if (pollingRef.current) clearInterval(pollingRef.current);
    const pollProgress = async () => {
      const processingJobs = jobs.filter(j => ['processing', 'pending', 'running'].includes(j.status));
      if (processingJobs.length === 0) return;
      const token = localStorage.getItem('access_token');
      const updates = {};
      await Promise.all(processingJobs.map(async (job) => {
        try {
          const res = await axios.get(`${BACKEND_URL}/analyze/jobs/${job.id || job.job_id}/status`, {
            headers: { 'Authorization': `Bearer ${token}` }
          });
          updates[job.id || job.job_id] = {
            progress: res.data.progress ?? 0,
            message: res.data.message ?? '',
            status: res.data.status ?? job.status
          };
        } catch (e) {
          updates[job.id || job.job_id] = {
            progress: 0,
            message: '진행률 정보를 불러올 수 없습니다.',
            status: job.status
          };
        }
      }));
      setJobProgress(prev => ({ ...prev, ...updates }));
    };
    pollProgress();
    pollingRef.current = setInterval(pollProgress, 5000);
    return () => clearInterval(pollingRef.current);
  }, [jobs]);

  useEffect(() => {
    // jobs 중에서 방금 completed로 바뀐 job을 찾음
    const justCompletedJob = jobs.find(j => {
      const progress = jobProgress[j.id || j.job_id];
      return (
        progress?.status === 'completed' &&
        !navigatedJobIds.includes(j.id || j.job_id)
      );
    });

    if (justCompletedJob) {
      // 해당 job과 매칭되는 report를 찾음 (youtube_url 또는 job_id 기준)
      const matchedReport = reports.find(r =>
        (r.youtube_url && r.youtube_url === (justCompletedJob.input_data?.youtube_url || justCompletedJob.youtube_url)) ||
        (r.job_id && r.job_id === (justCompletedJob.id || justCompletedJob.job_id))
      );
      if (matchedReport) {
        setNavigatedJobIds(prev => [...prev, justCompletedJob.id || justCompletedJob.job_id]);
        navigate(`/editor/${matchedReport.id}`, { state: { presignedUrl: matchedReport.url } });
      }
    }
  }, [jobProgress, jobs, reports, navigate, navigatedJobIds]);

  const formatDate = (dateString) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('ko-KR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
      });
    } catch (e) {
      return dateString;
    }
  };

  const handleAnalysisClick = (analysis) => {
    if (analysis.id && analysis.url) {
      navigate(`/editor/${analysis.id}`, { state: { presignedUrl: analysis.url } });
    }
  };

  const handleDeleteReport = async (jobId) => {
    try {
      const token = localStorage.getItem('access_token');
      await axios.delete(`${BACKEND_URL}/s3/reports/${jobId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      setReports(reports.filter(r => (r.job_id || r.id) !== jobId));
    } catch (e) {
      alert('삭제에 실패했습니다.');
    }
  };

  return (
    <div className={styles.container}>
      {/* 상단 통계 카드 (3개만) */}
      <div className={styles.statsGrid} style={{gridTemplateColumns: 'repeat(3, 1fr)'}}>
        <div className={styles.statCard}>
          <div className={styles.statNumber}>{stats.totalAnalyses}</div>
          <div className={styles.statLabel}>총 분석 횟수</div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statNumber}>{stats.savedReports}</div>
          <div className={styles.statLabel}>저장된 보고서</div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statNumber}>{stats.totalViews}</div>
          <div className={styles.statLabel}>총 조회수</div>
        </div>
      </div>

      {/* 진행중인 작업 */}
      {jobs.filter(j => j.status === 'processing' || j.status === 'pending' || j.status === 'running').length > 0 && (
        <div className={styles.section}>
          <div className={styles.sectionTitle}><FaTasks /> 진행중인 작업</div>
          <div className={styles.analysisList}>
            {jobs.filter(j => j.status === 'processing' || j.status === 'pending' || j.status === 'running').map(job => {
              const progressInfo = jobProgress[job.id || job.job_id] || {};
              return (
                <div className={styles.analysisItem} key={job.id || job.job_id}>
                  <div className={styles.analysisInfo}>
                    <div className={styles.analysisDetails}>
                      <div className={styles.analysisTitle}>
                        {job.input_data?.youtube_url || job.youtube_url || 'YouTube 분석'}
                      </div>
                      <div className={styles.analysisMeta}>
                        <span>Job ID: {job.id || job.job_id}</span>
                        <span>•</span>
                        <span>상태: {progressInfo.status || job.status}</span>
                        {typeof progressInfo.progress === 'number' && (
                          <>
                            <span>•</span>
                            <span style={{color:'#4F5FFF'}}>진행률: {progressInfo.progress}%</span>
                          </>
                        )}
                      </div>
                      {progressInfo.message && (
                        <div style={{color:'#4F5FFF', fontSize:'0.98em', marginTop:4}}>{progressInfo.message}</div>
                      )}
                      {typeof progressInfo.progress === 'number' && (
                        <ProgressBar progress={progressInfo.progress} />
                      )}
                    </div>
                  </div>
                  <div className={styles.actionButtons}>
                    <FaSpinner className={styles.faSpin} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 분석 결과 리스트 */}
      <div className={styles.section}>
        <div className={styles.sectionTitle}>분석 결과</div>
        {error && <div className={styles.error}>{error}</div>}
        {loading ? (
          <LoadingOverlay />
        ) : reports.length > 0 ? (
          <div className={styles.analysisList}>
            {reports.map((item, idx) => (
              <div
                className={styles.analysisItem}
                key={item.id || idx}
                onClick={() => handleAnalysisClick(item)}
              >
                <div className={styles.analysisInfo}>
                  {item.youtube_thumbnail && (
                    <img src={item.youtube_thumbnail} alt={item.title} className={styles.thumbnail} />
                  )}
                  <div className={styles.analysisDetails}>
                    <div className={styles.analysisTitle}>{item.title}</div>
                    <div className={styles.analysisChannel}>{item.youtube_channel}</div>
                    <div className={styles.analysisMeta}>
                      <span>{item.type}</span>
                      <span>•</span>
                      <span><FaClock /> {formatDate(item.last_modified)}</span>
                      <span>•</span>
                      <span>{item.youtube_duration}</span>
                      {item.youtube_url && (
                        <>
                          <span>•</span>
                          <a
                            href={item.youtube_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{ color: '#4ade80', textDecoration: 'underline', marginLeft: 4 }}
                            onClick={e => e.stopPropagation()}
                          >
                            유튜브 바로가기
                          </a>
                          <span
                            style={{
                              color: '#ff4d6d',
                              cursor: 'pointer',
                              fontWeight: 600,
                              marginLeft: 8,
                              textDecoration: 'underline'
                            }}
                            onClick={e => {
                              e.stopPropagation();
                              if (window.confirm('정말로 이 리포트를 삭제하시겠습니까?')) {
                                handleDeleteReport(item.job_id || item.id);
                              }
                            }}
                          >
                            리포트 삭제하기
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
                <div className={styles.actionButtons}>
                  {item.hasAudio && (
                    <button className={styles.actionButton} onClick={e => {e.stopPropagation(); alert('오디오 재생 기능은 준비 중입니다.')}}><FaPlay /></button>
                  )}
                  <button className={styles.actionButton} onClick={e => {e.stopPropagation(); window.open(item.url, '_blank');}}><FaDownload /></button>
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
  );
};

export default MyKnowledge; 