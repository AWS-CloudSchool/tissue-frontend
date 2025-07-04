import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FaSpinner, FaCheckCircle, FaExclamationCircle } from 'react-icons/fa';
import axios from 'axios';
import AuroraBackground from '../AuroraBackground/AuroraBackground';
import TopBar from '../TopBar/TopBar';
import Footer from '../Footer/Footer';
import styles from './AnalysisStatus.module.css';

const AnalysisStatus = () => {
  const { jobId } = useParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState('processing');
  const [progress, setProgress] = useState(0);
  const [message, setMessage] = useState('분석을 시작하고 있습니다...');
  const [currentStep, setCurrentStep] = useState(0);
  const [error, setError] = useState(null);

  const steps = [
    '콘텐츠 추출',
    'AI 분석 진행',
    '보고서 생성',
    '시각화 생성',
    '최종 결과 정리'
  ];

  useEffect(() => {
    if (!jobId) {
      setError('작업 ID가 없습니다.');
      return;
    }

    // 실제 백엔드 API 폴링
    const pollStatus = async () => {
      try {
        const response = await axios.get(`/analyze/jobs/${jobId}/status`);
        const { status: jobStatus, progress: jobProgress, message: jobMessage } = response.data;
        
        setStatus(jobStatus);
        setProgress(jobProgress || 0);
        setMessage(jobMessage || '분석 중...');
        
        // 진행률에 따른 단계 계산
        const step = Math.floor((jobProgress / 100) * steps.length);
        setCurrentStep(step);
        
        // 완료되면 결과 페이지로 이동
        if (jobStatus === 'completed') {
          setTimeout(() => {
            navigate('/editor', {
              state: {
                analysisData: {
                  jobId: jobId
                }
              }
            });
          }, 2000);
        } else if (jobStatus === 'failed') {
          setError('분석이 실패했습니다.');
        }
        
      } catch (err) {
        console.error('상태 확인 실패:', err);
        setError('상태 확인 중 오류가 발생했습니다.');
      }
    };

    // 초기 상태 확인
    pollStatus();

    // 진행률에 따른 동적 폴링 간격 설정
    const getPollingInterval = () => {
      if (progress < 30) return 8000;  // 초기 단계: 8초
      if (progress < 70) return 5000;  // 중간 단계: 5초
      return 3000;  // 마무리 단계: 3초
    };

    const interval = setInterval(pollStatus, getPollingInterval());

    return () => clearInterval(interval);
  }, [jobId, navigate, progress]);

  const handleViewResult = () => {
    navigate('/editor', {
      state: {
        analysisData: {
          jobId: jobId
        }
      }
    });
  };

  const handleBackToDashboard = () => {
    navigate('/dashboard');
  };

  const getStatusIcon = () => {
    switch (status) {
      case 'completed':
        return <FaCheckCircle />;
      case 'failed':
      case 'error':
        return <FaExclamationCircle />;
      default:
        return <FaSpinner className="fa-spin" />;
    }
  };

  const getStatusTitle = () => {
    switch (status) {
      case 'completed':
        return '분석 완료';
      case 'failed':
      case 'error':
        return '분석 실패';
      default:
        return '분석 진행 중';
    }
  };

  if (error) {
    return (
      <div className={styles.pageContainer}>
        <AuroraBackground />
        <TopBar />
        <div className={styles.content}>
          <div className={styles.statusCard}>
            <div className={`${styles.statusIcon} ${styles.error}`}>
              <FaExclamationCircle />
            </div>
            <h1 className={styles.statusTitle}>오류 발생</h1>
            <p className={styles.statusMessage}>{error}</p>
            <div className={styles.buttonContainer}>
              <button className={styles.secondaryButton} onClick={handleBackToDashboard}>
                대시보드로 돌아가기
              </button>
            </div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className={styles.pageContainer}>
      <AuroraBackground />
      <TopBar />
      <div className={styles.content}>
        <div className={styles.statusCard}>
          <div className={`${styles.statusIcon} ${styles[status]}`}>
            {getStatusIcon()}
          </div>
          
          <h1 className={styles.statusTitle}>{getStatusTitle()}</h1>
          <p className={styles.statusMessage}>{message}</p>

          {status === 'processing' && (
            <>
              <div className={styles.progressContainer}>
                <div className={styles.progressBar}>
                  <div 
                    className={styles.progressFill} 
                    style={{ width: `${progress}%` }}
                  />
                </div>
                <div className={styles.progressText}>{progress}% 완료</div>
              </div>

              <div className={styles.stepsList}>
                {steps.map((step, index) => (
                  <div key={index} className={`${styles.step} ${index < currentStep ? styles.completed : ''}`}>
                    <div className={`${styles.stepIcon} ${index < currentStep ? styles.completed : ''}`}>
                      {index < currentStep ? '✓' : index + 1}
                    </div>
                    <span>{step}</span>
                  </div>
                ))}
              </div>
            </>
          )}

          {status === 'completed' && (
            <div className={styles.buttonContainer}>
              <button className={styles.actionButton} onClick={handleViewResult}>
                결과 확인하기
              </button>
              <button className={styles.secondaryButton} onClick={handleBackToDashboard}>
                대시보드로
              </button>
            </div>
          )}

          {status === 'failed' && (
            <div className={styles.buttonContainer}>
              <button className={styles.secondaryButton} onClick={handleBackToDashboard}>
                대시보드로 돌아가기
              </button>
            </div>
          )}
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default AnalysisStatus; 