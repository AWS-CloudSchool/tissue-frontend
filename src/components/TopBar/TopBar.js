import React, { useState, useEffect } from 'react';
import LoginModal from '../LoginModal/LoginModal';
import SignupModal from '../SignupModal/SignupModal';
import { useNavigate } from 'react-router-dom';
import styles from './TopBar.module.css';
import { jwtDecode } from 'jwt-decode';

const TopBar = () => {
  const [user, setUser] = useState(null);
  const [showLogin, setShowLogin] = useState(false);
  const [showSignup, setShowSignup] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('access_token');
    if (token) {
      try {
        const decoded = jwtDecode(token);
        setUser(decoded);
      } catch (error) {
        console.error('Token decode error:', error);
        localStorage.removeItem('access_token');
      }
    }
  }, []);

  const handleLoginSuccess = (userData) => {
    setUser(userData);
    setShowLogin(false);
  };

  const handleLogout = () => {
    localStorage.removeItem('access_token');
    setUser(null);
    navigate('/');
  };

  return (
    <>
      <div className={styles.container}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
          <div className={styles.logo} onClick={() => navigate('/')}>aurora report</div>
          <button className={styles.menu} onClick={() => navigate('/dashboard')}>대시보드</button>
          <button className={styles.menu} onClick={() => navigate('/editor')}>에디터</button>
        </div>
        {user ? (
          <div className={styles.userInfo}>
            <span style={{ color: '#fff', fontSize: '0.9rem' }}>{user.email}님</span>
            <button className={styles.menu} onClick={handleLogout}>Logout</button>
          </div>
        ) : (
          <button className={styles.menu} onClick={() => setShowLogin(true)}>Login</button>
        )}
      </div>
      {showLogin && (
        <LoginModal
          onClose={() => setShowLogin(false)}
          onSignupClick={() => {
            setShowLogin(false);
            setShowSignup(true);
          }}
          onLoginSuccess={handleLoginSuccess}
        />
      )}
      {showSignup && (
        <SignupModal
          onClose={() => setShowSignup(false)}
          onLoginClick={() => {
            setShowSignup(false);
            setShowLogin(true);
          }}
        />
      )}
    </>
  );
};

export default TopBar; 