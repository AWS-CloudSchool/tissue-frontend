import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import styled from 'styled-components';
import MainPage from './pages/MainPage/MainPage';
import DashboardPage from './pages/DashboardPage/DashboardPage';
import YoutubeSearchPage from './pages/YoutubeSearchPage/YoutubeSearchPage';
import EditorPage from './pages/EditorPage/EditorPage';
import AnalysisStatus from './components/AnalysisStatus/AnalysisStatus';

const AppContainer = styled.div`
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  color: white;
  font-family: Arial, sans-serif;
`;

// PrivateRoute: 토큰 없으면 메인으로 리다이렉트
const PrivateRoute = ({ children }) => {
  const token = localStorage.getItem('access_token');
  if (!token) {
    alert('로그인이 필요합니다.');
    return <Navigate to="/" replace />;
  }
  return children;
};

function App() {
  return (
    <AppContainer>
      <Routes>
        <Route path="/" element={<MainPage />} />
        <Route path="/dashboard" element={<PrivateRoute><DashboardPage /></PrivateRoute>} />
        <Route path="/youtube-search" element={<PrivateRoute><YoutubeSearchPage /></PrivateRoute>} />
        <Route path="/editor" element={<PrivateRoute><EditorPage /></PrivateRoute>} />
        <Route path="/analysis/:jobId" element={<PrivateRoute><AnalysisStatus /></PrivateRoute>} />
      </Routes>
    </AppContainer>
  );
}

export default App;