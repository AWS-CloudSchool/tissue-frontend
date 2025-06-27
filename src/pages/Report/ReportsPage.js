import React, { useState, useEffect } from 'react';
import './reports.css';
import { useNavigate } from 'react-router-dom';
import {
  FaDownload, FaShare, FaEye, FaCalendarAlt, FaFileAlt, FaPlay, FaSpinner
} from 'react-icons/fa';
import AuroraBackground from '../../components/AuroraBackground';
import TopBar from '../../components/TopBar';
import Footer from '../../components/Footer';
import axios from 'axios';

const ReportsPage = () => {
  const navigate = useNavigate();
  const [activeFilter, setActiveFilter] = useState('all');
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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

  const formatFileSize = (bytes) => {
    if (!bytes || isNaN(bytes)) return '1.5MB';
    if (bytes < 1024) return bytes + ' B';
    else if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    else if (bytes < 1024 * 1024 * 1024) return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
    else return (bytes / (1024 * 1024 * 1024)).toFixed(1) + ' GB';
  };

  const formatDate = (dateString) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('ko-KR', {
        year: 'numeric', month: 'long', day: 'numeric'
      });
    } catch {
      return dateString;
    }
  };

  useEffect(() => {
    const fetchReports = async () => {
      try {
        setLoading(true);
        const response = await axios.get('/reports/list');
        if (response.data && Array.isArray(response.data)) {
          const reportsList = response.data.map(report => {
            let preview = '';
            if (report.content) {
              try {
                const content = JSON.parse(report.content);
                if (content.sections) {
                  preview = content.sections
                    .filter(section => section.type === 'paragraph')
                    .map(section => section.content)
                    .slice(0, 2)
                    .join(' ');
                }
              } catch {
                preview = report.content.substring(0, 150) + '...';
              }
            }
            return {
              id: report.key || report.id,
              title: report.title || extractTitleFromKey(report.key),
              type: report.type || 'YouTube',
              date: report.last_modified || report.created_at || new Date().toISOString(),
              size: formatFileSize(report.size),
              preview,
              hasAudio: report.has_audio || false,
              downloadUrl: report.url || report.s3_url,
              youtubeUrl: report.youtube_url || ''
            };
          });
          reportsList.sort((a, b) => new Date(b.date) - new Date(a.date));
          setReports(reportsList);
        } else {
          setError('보고서를 불러올 수 없습니다.');
        }
      } catch (err) {
        console.error('보고서 목록 오류:', err);
        setError('보고서 목록을 가져오는데 실패했습니다.');
      } finally {
        setLoading(false);
      }
    };
    fetchReports();
  }, []);

  const filteredReports = reports.filter(report => {
    if (activeFilter === 'all') return true;
    if (activeFilter === 'youtube') return report.type === 'YouTube';
    if (activeFilter === 'document') return report.type === 'Document';
    if (activeFilter === 'audio') return report.hasAudio;
    return true;
  });

  const handleReportClick = async (report) => {
    try {
      if (report.downloadUrl) {
        const res = await axios.get(report.downloadUrl);
        if (res.data) {
          return navigate('/editor', {
            state: {
              analysisData: {
                youtube_url: report.youtubeUrl,
                final_output: res.data
              }
            }
          });
        }
      }
    } catch {
      // fallback
    }
    navigate('/editor', {
      state: {
        analysisData: {
          final_output: {
            sections: [{ content: `${report.title}에 대한 분석 결과입니다.` }]
          }
        }
      }
    });
  };

  const handleDownload = (report, e) => {
    e.stopPropagation();
    if (report.downloadUrl) {
      window.open(report.downloadUrl, '_blank');
    }
  };

  const handleShare = (report, e) => {
    e.stopPropagation();
    if (report.downloadUrl) {
      navigator.clipboard.writeText(report.downloadUrl)
        .then(() => alert('보고서 URL이 클립보드에 복사되었습니다.'))
        .catch(() => alert('클립보드 복사에 실패했습니다.'));
    }
  };

  const handlePlayAudio = (report, e) => {
    e.stopPropagation();
    alert('오디오 재생 기능은 아직 구현되지 않았습니다.');
  };

  return (
    <div className="page-container">
      <AuroraBackground />
      <TopBar />
      <div className="content">
        <div className="header">
          <h1 className="title">보고서 관리</h1>
          <p className="subtitle">저장된 분석 보고서를 확인하고 관리하세요</p>
        </div>

        <div className="filter-bar">
          {['all', 'youtube', 'document', 'audio'].map(type => (
            <button
              key={type}
              className={`filter-button ${activeFilter === type ? 'active' : ''}`}
              onClick={() => setActiveFilter(type)}
            >
              {type === 'all' ? '전체' :
               type === 'youtube' ? 'YouTube' :
               type === 'document' ? '문서' : '오디오 있음'}
            </button>
          ))}
        </div>

        {error && <div className="error-state">{error}</div>}

        {loading ? (
          <div className="loading-state">
            <FaSpinner size={40} className="fa-spin" />
            <div>보고서 목록을 불러오는 중입니다...</div>
          </div>
        ) : filteredReports.length > 0 ? (
          <div className="reports-list">
            {filteredReports.map(report => (
              <div className="report-card" key={report.id} onClick={() => handleReportClick(report)}>
                <div className="report-header">
                  <span className="report-type">{report.type}</span>
                </div>
                <div className="report-title">{report.title}</div>
                <div className="report-meta">
                  <span><FaCalendarAlt /> {formatDate(report.date)}</span>
                  <span>•</span>
                  <span>{report.size}</span>
                  {report.hasAudio && <>
                    <span>•</span>
                    <span><FaPlay /> 오디오</span>
                  </>}
                </div>
                <div className="report-preview">{report.preview}</div>
                <div className="action-buttons">
                  <button className="action-button" onClick={(e) => handleShare(report, e)}><FaShare /></button>
                  {report.hasAudio && <button className="action-button" onClick={(e) => handlePlayAudio(report, e)}><FaPlay /></button>}
                  <button className="action-button" onClick={(e) => handleReportClick(report)}><FaEye /></button>
                  <button className="action-button primary-button" onClick={(e) => handleDownload(report, e)}><FaDownload /></button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="empty-state">
            <FaFileAlt size={48} style={{ marginBottom: '1rem', opacity: 0.5 }} />
            <div>저장된 보고서가 없습니다.</div>
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
};

export default ReportsPage;
