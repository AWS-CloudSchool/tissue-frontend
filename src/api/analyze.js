import axios from 'axios';

// YouTube 분석 시작
export const startYouTubeAnalysis = async (youtubeUrl) => {
  const response = await axios.post('/analyze/youtube', { youtube_url: youtubeUrl });
  return response.data;
};

// 작업 상태 조회
export const getJobStatus = async (jobId) => {
  const response = await axios.get(`/analyze/jobs/${jobId}/status`);
  return response.data;
};

// 분석 결과 조회
export const getAnalysisResult = async (jobId) => {
  const response = await axios.get(`/analyze/jobs/${jobId}/result`);
  return response.data;
};

// 사용자 작업 목록 조회
export const getUserJobs = async () => {
  const response = await axios.get('/analyze/jobs');
  return response.data;
};

// 작업 삭제
export const deleteJob = async (jobId) => {
  const response = await axios.delete(`/analyze/jobs/${jobId}`);
  return response.data;
};

// YouTube 검색
export const searchYouTube = async (query, maxResults = 10) => {
  const response = await axios.post('/search/youtube', { 
    query, 
    max_results: maxResults 
  });
  return response.data;
}; 