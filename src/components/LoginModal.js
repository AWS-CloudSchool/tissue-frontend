import React, { useState } from 'react';
import styles from './LoginModal.module.css';

const passwordChecks = [
  { label: '8자 이상', test: v => v.length >= 8 },
  { label: '대문자 포함', test: v => /[A-Z]/.test(v) },
  { label: '소문자 포함', test: v => /[a-z]/.test(v) },
  { label: '숫자 포함', test: v => /[0-9]/.test(v) },
  { label: '특수문자 포함', test: v => /[^A-Za-z0-9]/.test(v) },
];

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

const LoginModal = ({ open, onClose, onSignupClick, onLoginClick, signupMode, onLoginSuccess }) => {
  const [signupEmail, setSignupEmail] = useState('');
  const [signupPassword, setSignupPassword] = useState('');
  const [signupPassword2, setSignupPassword2] = useState('');
  const [emailStep, setEmailStep] = useState('signup'); // 'signup' | 'verify'
  const [verifyCode, setVerifyCode] = useState('');
  const [signupError, setSignupError] = useState('');
  const [signupLoading, setSignupLoading] = useState(false);
  const [verifyError, setVerifyError] = useState('');
  const [verifyLoading, setVerifyLoading] = useState(false);
  const [welcomeMsg, setWelcomeMsg] = useState('');
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [loginLoading, setLoginLoading] = useState(false);

  const allPwOk = passwordChecks.every(check => check.test(signupPassword));
  const passwordsMatch = signupPassword && signupPassword2 && signupPassword === signupPassword2;
  const showPwMismatch = signupPassword2 && signupPassword !== signupPassword2;

  const handleSignupSubmit = async (e) => {
    e.preventDefault();
    setSignupError('');
    if (allPwOk && passwordsMatch) {
      setSignupLoading(true);
      try {
        const res = await fetch(`${BACKEND_URL}/auth/signup`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: signupEmail,
            password: signupPassword,
            password_confirm: signupPassword2,
          }),
        });
        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          throw new Error(data.message || '회원가입에 실패했습니다.');
        }
        setEmailStep('verify');
        // 실제로는 여기서 이메일로 인증번호 발송 API 호출
      } catch (err) {
        setSignupError(err.message);
      } finally {
        setSignupLoading(false);
      }
    }
  };

  const handleVerifySubmit = async (e) => {
    e.preventDefault();
    setVerifyError('');
    setVerifyLoading(true);
    try {
      const res = await fetch(`${BACKEND_URL}/auth/confirm`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: signupEmail,
          code: verifyCode,
        }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.message || '이메일 인증에 실패했습니다.');
      }
      setWelcomeMsg('환영합니다! 이제 모든 서비스를 이용하실 수 있습니다!');
      setTimeout(() => {
        setWelcomeMsg('');
        setEmailStep('signup');
        setSignupEmail('');
        setSignupPassword('');
        setSignupPassword2('');
        setVerifyCode('');
        onLoginClick && onLoginClick();
      }, 1800);
    } catch (err) {
      setVerifyError(err.message);
    } finally {
      setVerifyLoading(false);
    }
  };

  const handleBackToSignup = () => {
    setEmailStep('signup');
    setVerifyCode('');
  };

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setLoginError('');
    setLoginLoading(true);
    try {
      const res = await fetch(`${BACKEND_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: loginEmail,
          password: loginPassword,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || '로그인에 실패했습니다.');
      }
      if (data.access_token) localStorage.setItem('access_token', data.access_token);
      if (data.id_token) localStorage.setItem('id_token', data.id_token);
      onLoginSuccess && onLoginSuccess({ email: loginEmail });
      setLoginEmail('');
      setLoginPassword('');
    } catch (err) {
      setLoginError(err.message);
    } finally {
      setLoginLoading(false);
    }
  };

  if (!open) return null;
  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={e => e.stopPropagation()}>
        <button className={styles.closeBtn} onClick={onClose} aria-label="닫기">×</button>
        <h2 className={styles.title}>{signupMode ? (emailStep === 'signup' ? '회원가입' : '이메일 인증') : '로그인'}</h2>
        {signupMode && emailStep === 'verify' && welcomeMsg ? (
          <div className={styles.verifyMsg} style={{fontSize:'17px',fontWeight:600,color:'#4f5fff',padding:'30px 0'}}>
            {welcomeMsg}
          </div>
        ) : (
          <>
            {signupMode ? (
              emailStep === 'signup' ? (
                <form className={styles.form} onSubmit={handleSignupSubmit}>
                  <input
                    className={styles.input}
                    type="email"
                    placeholder="이메일"
                    value={signupEmail}
                    onChange={e => setSignupEmail(e.target.value)}
                  />
                  <input
                    className={styles.input}
                    type="password"
                    placeholder="비밀번호"
                    value={signupPassword}
                    onChange={e => setSignupPassword(e.target.value)}
                  />
                  <input
                    className={styles.input}
                    type="password"
                    placeholder="비밀번호 확인"
                    value={signupPassword2}
                    onChange={e => setSignupPassword2(e.target.value)}
                  />
                  {showPwMismatch && (
                    <div className={styles.pwMismatchMsg}>비밀번호가 일치하지 않습니다.</div>
                  )}
                  {signupPassword && (
                    <div className={allPwOk ? styles.pwChecksOk : styles.pwChecks}>
                      {allPwOk ? (
                        <div className={styles.pwCheckOkMsg}>
                          ✅ 비밀번호 조건이 만족되었습니다.
                        </div>
                      ) : (
                        <>
                          <div className={styles.pwCheckTitle}>
                            ⛔ 비밀번호는 아래 조건을 만족해야합니다.
                          </div>
                          {passwordChecks.map((check, idx) => (
                            <div
                              key={idx}
                              className={
                                check.test(signupPassword)
                                  ? styles.pwCheckOk
                                  : styles.pwCheckWarn
                              }
                            >
                              {check.label}
                            </div>
                          ))}
                        </>
                      )}
                    </div>
                  )}
                  <button className={styles.submitBtn} type="submit" disabled={!(allPwOk && passwordsMatch)}>
                    이메일 인증
                  </button>
                </form>
              ) : (
                <form className={styles.form} onSubmit={handleVerifySubmit}>
                  <div className={styles.verifyMsg}>
                    입력하신 이메일로 인증번호가 발송되었습니다.<br />
                    인증번호를 입력해 주세요.
                  </div>
                  <input
                    className={styles.input}
                    type="text"
                    placeholder="인증번호 입력"
                    value={verifyCode}
                    onChange={e => setVerifyCode(e.target.value)}
                    maxLength={6}
                    autoFocus
                  />
                  {verifyError && (
                    <div className={styles.pwMismatchMsg}>{verifyError}</div>
                  )}
                  <div className={styles.btnGroup}>
                    <button type="button" className={styles.backBtn} onClick={handleBackToSignup}>
                      <span className="arrow">←</span>뒤로가기
                    </button>
                    <button className={styles.submitBtn} type="submit" disabled={!verifyCode || verifyLoading}>
                      {verifyLoading ? '확인 중...' : '인증 확인'}
                    </button>
                  </div>
                </form>
              )
            ) : (
              <form className={styles.form} onSubmit={handleLoginSubmit}>
                <input
                  className={styles.input}
                  type="email"
                  placeholder="이메일"
                  value={loginEmail}
                  onChange={e => setLoginEmail(e.target.value)}
                  autoFocus
                />
                <input
                  className={styles.input}
                  type="password"
                  placeholder="비밀번호"
                  value={loginPassword}
                  onChange={e => setLoginPassword(e.target.value)}
                />
                {loginError && (
                  <div className={styles.pwMismatchMsg}>{loginError}</div>
                )}
                <button className={styles.submitBtn} type="submit" disabled={!loginEmail || !loginPassword || loginLoading}>
                  {loginLoading ? '로그인 중...' : '로그인'}
                </button>
              </form>
            )}
          </>
        )}
        <div className={styles.bottomText}>
          {signupMode ? (
            <>
              이미 계정이 있으신가요?{' '}
              <button type="button" className={styles.signupBtn} onClick={onLoginClick}>로그인</button>
            </>
          ) : (
            <>
              계정이 없으신가요?{' '}
              <button type="button" className={styles.signupBtn} onClick={onSignupClick}>회원가입</button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default LoginModal; 