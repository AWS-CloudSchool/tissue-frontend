import React, { useState } from 'react';
import axios from 'axios';
import { jwtDecode } from 'jwt-decode';
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

  const isValidEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  const handleLogin = async () => {
    if (!isValidEmail || !password) {
      setWarn("이메일과 비밀번호를 모두 입력해주세요.");
      return;
    }
    setWarn("");
    try {
      const response = await axios.post(`${API_BASE_URL}/auth/login`, {
        email,
        password,
      });
      const { access_token: accessToken, id_token: idToken } = response.data;
      if (!accessToken || !idToken) {
        setWarn("로그인 실패: 토큰이 없습니다.");
        return;
      }
      const decoded = jwtDecode(idToken);
      const user = {
        username: decoded["cognito:username"],
        email: decoded.email,
      };
      localStorage.setItem("access_token", accessToken);
      localStorage.setItem("id_token", idToken);
      onLoginSuccess && onLoginSuccess({ accessToken, idToken, user });
    } catch (error) {
      const detail = error.response?.data?.detail;
      setWarn(`로그인 실패: ${detail || error.message}`);
    }
  };

  return (
    <div className={styles.overlay}>
      <div className={styles.modalBox}>
        <button className={styles.closeBtn} onClick={onClose} title="닫기">×</button>
        <h2 className={styles.title}>로그인</h2>
        {warn && <div className={styles.warning}>{warn}</div>}
        <div className={styles.passwordBox}>
          <input
            className={styles.input}
            type="email"
            placeholder="이메일"
            value={email}
            onChange={e => setEmail(e.target.value)}
            autoFocus
            onKeyDown={e => { if (e.key === "Enter") handleLogin(); }}
          />
        </div>
        <div className={styles.passwordBox}>
          <input
            className={styles.input}
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
        <button className={styles.loginBtn} onClick={handleLogin}>로그인</button>
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
      </div>
    </div>
  );
} 