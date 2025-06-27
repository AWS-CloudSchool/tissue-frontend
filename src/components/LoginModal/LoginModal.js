import React, { useState } from 'react';
import { motion } from 'framer-motion';
import axios from 'axios';
import { jwtDecode } from 'jwt-decode';
import { ModalOverlay, ModalContent, Button, Input } from '../../styles';
import styles from './LoginModal.module.css';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;

export default function LoginModal({
  onClose,
  onSignupClick,
  onLoginSuccess,
  warningMessage = "",
}) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [warn, setWarn] = useState(warningMessage);
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      setWarn("이메일과 비밀번호를 입력해주세요.");
      return;
    }

    setIsLoading(true);
    setWarn("");

    try {
      const response = await axios.post(`${API_BASE_URL}/auth/login`, {
        email: email,
        password: password,
      });

      if (response.data.access_token) {
        localStorage.setItem('access_token', response.data.access_token);
        const decoded = jwtDecode(response.data.access_token);
        onLoginSuccess(decoded);
      }
    } catch (error) {
      console.error('Login error:', error);
      if (error.response?.data?.detail) {
        setWarn(error.response.data.detail);
      } else {
        setWarn("로그인 중 오류가 발생했습니다.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ModalOverlay>
      <ModalContent
        as={motion.div}
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.8, opacity: 0 }}
        maxWidth="700px"
      >
        <button className={styles.closeBtn} onClick={onClose} title="닫기">×</button>
        <div className={styles.title}>로그인</div>
        {warn && <div className={styles.warning}>{warn}</div>}
        
        <div className={styles.passwordBox}>
          <Input
            type="email"
            placeholder="이메일"
            value={email}
            onChange={e => setEmail(e.target.value)}
            autoFocus
            onKeyDown={e => { if (e.key === "Enter") handleLogin(); }}
          />
        </div>
        
        <div className={styles.passwordBox}>
          <Input
            type={showPassword ? "text" : "password"}
            placeholder="비밀번호"
            value={password}
            onChange={e => setPassword(e.target.value)}
            onKeyDown={e => { if (e.key === "Enter") handleLogin(); }}
          />
          <span className={styles.showBtn} onClick={() => setShowPassword(v => !v)}>
            {showPassword ? "숨기기" : "보기"}
          </span>
        </div>
        
        <Button 
          variant="primary" 
          onClick={handleLogin}
          disabled={isLoading}
          className={styles.loginButton}
        >
          {isLoading ? '로그인 중...' : '로그인'}
        </Button>
        
        <div className={styles.divider}>또는 SNS로 로그인</div>
        
        <button className={styles.snsBtn} onClick={() => window.location.href = `${API_BASE_URL}/auth/google/login`}>
          <img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/google/google-original.svg" alt="Google" />
          Google 계정으로 로그인
        </button>
        
        <button className={styles.snsBtn} onClick={() => alert("애플 로그인") }>
          <img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/apple/apple-original.svg" alt="Apple" />
          Apple 계정으로 로그인
        </button>
        
        <div className={styles.signupBox}>
          계정이 없으신가요?
          <button className={styles.signupBtn} onClick={onSignupClick}>회원가입</button>
        </div>
      </ModalContent>
    </ModalOverlay>
  );
} 