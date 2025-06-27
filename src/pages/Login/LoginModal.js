import React, { useState } from 'react';
import './Login.css'; // 위에 제공된 CSS 파일
import { motion } from 'framer-motion';
import axios from 'axios';
import { jwtDecode } from 'jwt-decode';

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
    <div className="overlay">
      <motion.div
        className="modal-box"
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.8, opacity: 0 }}
      >
        <button className="close-btn" onClick={onClose} title="닫기">×</button>
        <h2 className="title">로그인</h2>
        {warn && <div className="warning">{warn}</div>}
        
        <div className="password-box">
          <input
            className="input"
            type="email"
            placeholder="이메일"
            value={email}
            onChange={e => setEmail(e.target.value)}
            autoFocus
            onKeyDown={e => { if (e.key === "Enter") handleLogin(); }}
          />
        </div>
        <div className="password-box">
          <input
            className="input"
            type={showPassword ? "text" : "password"}
            placeholder="비밀번호"
            value={password}
            onChange={e => setPassword(e.target.value)}
            onKeyDown={e => { if (e.key === "Enter") handleLogin(); }}
          />
          <span className="show-btn" onClick={() => setShowPassword(v => !v)}>
            {showPassword ? "숨기기" : "보기"}
          </span>
        </div>

        <button className="login-btn" onClick={handleLogin}>로그인</button>
        <div className="divider">또는 SNS로 로그인</div>

        <button
          className="sns-btn"
          onClick={() => window.location.href = `${API_BASE_URL}/auth/google/login`}
        >
          <img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/google/google-original.svg" alt="Google" />
          Google 계정으로 로그인
        </button>
        <button
          className="sns-btn"
          onClick={() => alert("애플 로그인")}
        >
          <img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/apple/apple-original.svg" alt="Apple" />
          Apple 계정으로 로그인
        </button>

        <div className="signup-box">
          계정이 없으신가요?
          <button className="signup-btn" onClick={onSignupClick}>회원가입</button>
        </div>
      </motion.div>
    </div>
  );
}
