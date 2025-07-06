import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import SidebarIcon from './components/SidebarIcon';
import LoginModal from './components/LoginModal';
import MainPage from './pages/MainPage';
import MyKnowledge from './pages/MyKnowledge';
import YoutubeSearch from './pages/YoutubeSearch';
import EditorPage from './pages/EditorPage';
import appStyles from './App.module.css';
import knowledgeStyles from './pages/MyKnowledge.module.css';
import axios from 'axios';
import { FaSpinner } from 'react-icons/fa';
import LoadingOverlay from './components/LoadingOverlay';
import './pages/MyKnowledge.module.css';

const SIDEBAR_TRANSITION = 150;
const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

// Footer 조건부 렌더링을 위한 컴포넌트
function AppContent() {
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [showSidebar, setShowSidebar] = useState(true);
  const [showSidebarIcon, setShowSidebarIcon] = useState(true);
  const [loginModalOpen, setLoginModalOpen] = useState(false);
  const [signupMode, setSignupMode] = useState(false);
  const [user, setUser] = useState(null);
  const [reports, setReports] = useState(undefined);
  const [loading, setLoading] = useState(true);

  // 새로고침 시 localStorage에서 user 정보 복원
  useEffect(() => {
    const saved = localStorage.getItem('user');
    if (saved) setUser(JSON.parse(saved));
  }, []);

  // 로그인 상태일 때만 보고서 리스트 불러오기
  useEffect(() => {
    const fetchReports = async () => {
      if (!user) {
        setReports(undefined);
        setLoading(false);
        return;
      }
      setLoading(true);
      try {
        const token = localStorage.getItem('access_token');
        const res = await axios.get(`${BACKEND_URL}/s3/reports/list`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        setReports(res.data || []);
      } catch (e) {
        setReports([]);
      } finally {
        setTimeout(() => setLoading(false), 700); // 최소 0.7초 로딩 유지
      }
    };
    fetchReports();
  }, [user]);

  useEffect(() => {
    if (sidebarOpen) {
      setShowSidebar(true);
      setShowSidebarIcon(false);
    } else {
      const timer1 = setTimeout(() => setShowSidebar(false), SIDEBAR_TRANSITION);
      const timer2 = setTimeout(() => setShowSidebarIcon(true), SIDEBAR_TRANSITION);
      return () => { clearTimeout(timer1); clearTimeout(timer2); };
    }
  }, [sidebarOpen]);

  const handleOpenLogin = () => {
    setLoginModalOpen(true);
    setSignupMode(false);
  };
  const handleOpenSignup = () => {
    setSignupMode(true);
  };
  const handleBackToLogin = () => {
    setSignupMode(false);
  };
  const handleLoginSuccess = (userInfo) => {
    setUser(userInfo);
    localStorage.setItem('user', JSON.stringify(userInfo));
    setLoginModalOpen(false);
  };
  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('user');
    setReports([]);
  };

  // 에디터 페이지인지 확인
  const isEditorPage = location.pathname.startsWith('/editor/');

  return (
    <div className={
      sidebarOpen
        ? `${appStyles.container} ${appStyles.containerShift}`
        : appStyles.container
    }>
      {showSidebar && (
        <Sidebar
          open={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
          onLoginClick={handleOpenLogin}
          user={user}
          onLogout={handleLogout}
          reports={reports}
        />
      )}
      {showSidebarIcon && (
        <div className={
          sidebarOpen
            ? `${appStyles.sidebarIconWrap} ${appStyles.sidebarIconHidden}`
            : appStyles.sidebarIconWrap
        }>
          <SidebarIcon onClick={() => setSidebarOpen(true)} />
        </div>
      )}
      <div className={appStyles.pageContent}>
        <Routes>
          <Route path="/" element={<MainPage />} />
          <Route path="/youtube-search" element={<YoutubeSearch />} />
          <Route path="/my-knowledge" element={
            loading ? (
              <LoadingOverlay />
            ) : (
              <MyKnowledge reports={reports} />
            )
          } />
          <Route path="/editor/:reportId" element={<EditorPage />} />
        </Routes>
      </div>
      {/* 에디터 페이지가 아닐 때만 Footer 표시 */}
      {!isEditorPage && (
        <div className={
          sidebarOpen
            ? `${appStyles.mainFooter} ${appStyles.mainFooterShift}`
            : appStyles.mainFooter
        }>
          © 2025 AWS CloudSchool. All rights reserved.
        </div>
      )}
      <LoginModal
        open={loginModalOpen}
        onClose={() => setLoginModalOpen(false)}
        onSignupClick={handleOpenSignup}
        onLoginClick={handleBackToLogin}
        signupMode={signupMode}
        onLoginSuccess={handleLoginSuccess}
      />
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  );
}

export default App;
