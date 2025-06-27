import React, { useState } from 'react';
import axios from 'axios';
import styles from './SignupModal.module.css';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:8000';

const SignupModal = ({ onClose, onLoginClick }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [confirmCode, setConfirmCode] = useState('');
  const [confirmError, setConfirmError] = useState('');
  const [confirmSuccess, setConfirmSuccess] = useState(false);

  const validatePassword = (password) => {
    return {
      isLongEnough: password.length >= 8,
      hasUpperCase: /[A-Z]/.test(password),
      hasLowerCase: /[a-z]/.test(password),
      hasNumber: /[0-9]/.test(password),
      hasSpecialChar: /[!@#$%^&*(),.?":{}|<>]/.test(password)
    };
  };

  const passwordValidation = validatePassword(password);

  const handleSignup = async (e) => {
    e.preventDefault();
    setError('');
    if (!email) {
      setError('이메일을 입력하세요.');
      return;
    }
    if (!passwordValidation.isLongEnough || !passwordValidation.hasUpperCase || !passwordValidation.hasLowerCase || !passwordValidation.hasNumber || !passwordValidation.hasSpecialChar) {
      setError('비밀번호가 모든 조건을 만족해야 합니다.');
      return;
    }
    if (password !== confirmPassword) {
      setError('비밀번호가 일치하지 않습니다.');
      return;
    }
    setIsLoading(true);
    try {
      const response = await axios.post(`${API_BASE_URL}/auth/signup`, {
        email,
        password,
        password_confirm: confirmPassword
      });
      setShowConfirm(true);
    } catch (e) {
      const msg =
        e?.response?.data?.detail ||
        e?.response?.data?.message ||
        e?.message ||
        '알 수 없는 오류가 발생했습니다.';
      setError('회원가입 실패: ' + msg);
    } finally {
      setIsLoading(false);
    }
  };

  const handleConfirm = async (e) => {
    e.preventDefault();
    setConfirmError('');
    setIsLoading(true);
    try {
      const response = await axios.post(`${API_BASE_URL}/auth/confirm`, {
        email,
        code: confirmCode
      });
      setConfirmSuccess(true);
    } catch (e) {
      const msg =
        e?.response?.data?.detail ||
        e?.response?.data?.message ||
        e?.message ||
        '알 수 없는 오류가 발생했습니다.';
      setConfirmError('인증 실패: ' + msg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={styles.overlay}>
      <div className={styles.modalBox}>
        <button className={styles.closeBtn} onClick={onClose}>×</button>
        {!showConfirm ? (
          <>
            <h2 className={styles.title}>회원가입</h2>
            <form className={styles.form} onSubmit={handleSignup}>
              <div className={styles.inputGroup}>
                <input
                  className={styles.input}
                  type="email"
                  placeholder="이메일"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  required
                />
              </div>
              <div className={styles.inputGroup}>
                <input
                  className={styles.input}
                  type={showPassword ? 'text' : 'password'}
                  placeholder="비밀번호"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required
                />
                <button 
                  type="button" 
                  className={styles.passwordToggle} 
                  onClick={() => setShowPassword(v => !v)}
                >
                  {showPassword ? '숨김' : '표시'}
                </button>
              </div>
              <div className={styles.inputGroup}>
                <input
                  className={styles.input}
                  type={showConfirmPassword ? 'text' : 'password'}
                  placeholder="비밀번호 확인"
                  value={confirmPassword}
                  onChange={e => setConfirmPassword(e.target.value)}
                  required
                />
                <button 
                  type="button" 
                  className={styles.passwordToggle} 
                  onClick={() => setShowConfirmPassword(v => !v)}
                >
                  {showConfirmPassword ? '숨김' : '표시'}
                </button>
              </div>
              <div className={styles.passwordRequirements}>
                <div className={`${styles.passwordRequirement} ${passwordValidation.isLongEnough ? styles.met : styles.unmet}`}>
                  8자 이상
                </div>
                <div className={`${styles.passwordRequirement} ${passwordValidation.hasUpperCase ? styles.met : styles.unmet}`}>
                  대문자 포함
                </div>
                <div className={`${styles.passwordRequirement} ${passwordValidation.hasLowerCase ? styles.met : styles.unmet}`}>
                  소문자 포함
                </div>
                <div className={`${styles.passwordRequirement} ${passwordValidation.hasNumber ? styles.met : styles.unmet}`}>
                  숫자 포함
                </div>
                <div className={`${styles.passwordRequirement} ${passwordValidation.hasSpecialChar ? styles.met : styles.unmet}`}>
                  특수문자 포함
                </div>
              </div>
              {error && <div className={styles.warning}>{error}</div>}
              <button type="submit" className={styles.signupButton} disabled={isLoading}>
                {isLoading ? '처리 중...' : '회원가입'}
              </button>
            </form>
            <div className={styles.loginLink}>
              이미 계정이 있으신가요?
              <span onClick={onLoginClick}>로그인</span>
            </div>
          </>
        ) : !confirmSuccess ? (
          <>
            <h2 className={styles.title}>이메일 인증</h2>
            <div className={styles.confirmMessage}>
              입력하신 이메일로 인증코드가 발송되었습니다.<br />
              이메일로 받은 인증코드를 입력해주세요.
            </div>
            <form className={styles.form} onSubmit={handleConfirm}>
              <div className={styles.inputGroup}>
                <input
                  className={styles.input}
                  type="text"
                  placeholder="인증코드"
                  value={confirmCode}
                  onChange={e => setConfirmCode(e.target.value)}
                  required
                />
              </div>
              {confirmError && <div className={styles.warning}>{confirmError}</div>}
              <button type="submit" className={styles.signupButton} disabled={isLoading}>
                {isLoading ? '처리 중...' : '인증하기'}
              </button>
            </form>
          </>
        ) : (
          <>
            <h2 className={styles.title}>이메일 인증 완료</h2>
            <div className={styles.successMessage}>
              이메일 인증이 완료되었습니다!<br />이제 로그인하실 수 있습니다.
            </div>
            <button type="button" className={styles.signupButton} onClick={onLoginClick}>
              로그인하러 가기
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default SignupModal; 