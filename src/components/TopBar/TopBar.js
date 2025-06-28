import React, { useState, useEffect } from 'react';
import LoginModal from '../LoginModal/LoginModal';
import SignupModal from '../SignupModal/SignupModal';
import styles from './TopBar.module.css';
import { useNavigate } from 'react-router-dom';
import ClickSpark from '../ClickSpark/ClickSpark';

const TopBar = () => {
  const [showLogin, setShowLogin] = useState(false);
  const [showSignup, setShowSignup] = useState(false);
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    // 로그인 상태 확인
    const token = localStorage.getItem('access_token');
    const idToken = localStorage.getItem('id_token');
    if (token && idToken) {
      try {
        const { jwtDecode } = require('jwt-decode');
        const decoded = jwtDecode(idToken);
        setUser({
          username: decoded['cognito:username'] || decoded.email,
          email: decoded.email
        });
      } catch (error) {
        console.error('토큰 디코딩 실패:', error);
        localStorage.removeItem('access_token');
        localStorage.removeItem('id_token');
      }
    }
  }, []);

  const handleLoginSuccess = (loginData) => {
    setUser(loginData.user);
    setShowLogin(false);
    navigate('/dashboard');
  };

  const handleLogout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('id_token');
    setUser(null);
    navigate('/');
  };

  return (
    <>
      <div className={styles.topBarContainer}>
        <div className={styles.leftSection}>
          <div className={styles.logo} onClick={() => navigate('/')}>aurora report</div>
          <button className={styles.navMenu} onClick={() => navigate('/dashboard')}>DashBoard</button>
          <button className={styles.navMenu} onClick={() => navigate('/editor')}>Editor</button>
        </div>
        {user ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <span style={{ color: '#fff', fontSize: '0.9rem' }}>{user.email}님</span>
            <button className={styles.loginButton} onClick={handleLogout}>Logout</button>
          </div>
        ) : (
          <button className={styles.loginButton} onClick={() => setShowLogin(true)}>Login</button>
        )}
      </div>
      {showLogin && (
        <ClickSpark
          sparkColor='#fff'
          sparkSize={10}
          sparkRadius={15}
          sparkCount={8}
          duration={400}
        >   
        <LoginModal
          onClose={() => setShowLogin(false)}
          onSignupClick={() => {
            setShowLogin(false);
            setShowSignup(true);
          }}
          onLoginSuccess={handleLoginSuccess}
        />
        </ClickSpark>
      )}
      {showSignup && (
        <ClickSpark
          sparkColor='#fff'
          sparkSize={10}
          sparkRadius={15}
          sparkCount={8}
          duration={400}
        >   
        <SignupModal
          onClose={() => setShowSignup(false)}
          onLoginClick={() => {
            setShowSignup(false);
            setShowLogin(true);
          }}
        />
        </ClickSpark>
      )}
    </>
  );
};

export default TopBar; 