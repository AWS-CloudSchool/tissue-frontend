import React, { useState } from 'react';
import styled from 'styled-components';

const Overlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: rgba(0,0,0,0.32);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
`;

const ModalBox = styled.div`
  background: rgba(0,0,0,0.92);
  border-radius: 14px;
  box-shadow: 0 8px 32px 0 rgba(0,0,0,0.18);
  padding: 32px 20px 24px 20px;
  min-width: 700px;
  max-width: 96vw;
  display: flex;
  flex-direction: column;
  align-items: center;
  position: relative;
`;

const CloseBtn = styled.button`
  position: absolute;
  top: 14px;
  right: 14px;
  background: none;
  border: none;
  font-size: 1.2rem;
  color: #eaffb7;
  cursor: pointer;
`;

const Title = styled.h2`
  font-size: 1.08rem;
  font-weight: bold;
  margin-bottom: 18px;
  color: #fff;
`;

const Form = styled.form`
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
`;

const InputGroup = styled.div`
  width: 65%;
  position: relative;
  margin-bottom: 10px;
  display: flex;
  align-items: center;
`;

const Input = styled.input`
  width: 100%;
  padding: 8px 10px;
  border: 1.2px solid #eaffb7;
  border-radius: 6px;
  font-size: 0.98rem;
  outline: none;
  background: #fff;
  margin-bottom: 0;
`;

const PasswordToggle = styled.button`
  position: absolute;
  top: 50%;
  right: 12px;
  transform: translateY(-50%);
  font-size: 0.85rem;
  color: #888;
  cursor: pointer;
  user-select: none;
  background: #fff;
  padding: 0 4px;
  border: none;
`;

const PasswordRequirements = styled.div`
  width: 65%;
  margin: 8px 0 10px 0;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
`;

const PasswordRequirement = styled.div`
  color: ${props => props.met ? '#6b7cff' : '#FF5252'};
  font-size: 13px;
  line-height: 1.6;
`;

const Warning = styled.div`
  color: #ff5a5a;
  font-size: 0.92rem;
  margin-bottom: 10px;
  text-align: center;
`;

const SignupButton = styled.button`
  width: 65%;
  padding: 10px 0;
  background: #eaffb7;
  color: #333;
  font-weight: bold;
  border: none;
  border-radius: 6px;
  font-size: 1rem;
  margin-top: 10px;
  cursor: pointer;
  transition: background 0.18s;
  &:hover {
    background: #b7eaff;
    color: #333;
  }
  &:disabled {
    background: #aaa;
    color: #fff;
    cursor: not-allowed;
  }
`;

const LoginLink = styled.div`
  margin-top: 16px;
  text-align: center;
  color: #aaa;
  font-size: 0.92rem;
  span {
    color: #6b7cff;
    background: none;
    border: none;
    font-size: 0.92rem;
    font-weight: 600;
    margin-left: 4px;
    cursor: pointer;
    &:hover {
      text-decoration: underline;
    }
  }
`;

const SignupModal = ({ onClose, onLoginClick }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

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
    setTimeout(() => {
      setIsLoading(false);
      onClose && onClose();
    }, 1200); // 실제 API 연동 시 이 부분을 수정
  };

  return (
    <Overlay>
      <ModalBox>
        <CloseBtn onClick={onClose}>×</CloseBtn>
        <Title>회원가입</Title>
        <Form onSubmit={handleSignup}>
          <InputGroup>
            <Input
              type="email"
              placeholder="이메일"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
            />
          </InputGroup>
          <InputGroup>
            <Input
              type={showPassword ? 'text' : 'password'}
              placeholder="비밀번호"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
            />
            <PasswordToggle type="button" onClick={() => setShowPassword(v => !v)}>
              {showPassword ? '숨기기' : '보기'}
            </PasswordToggle>
          </InputGroup>
          <InputGroup>
            <Input
              type={showConfirmPassword ? 'text' : 'password'}
              placeholder="비밀번호 확인"
              value={confirmPassword}
              onChange={e => setConfirmPassword(e.target.value)}
              required
            />
            <PasswordToggle type="button" onClick={() => setShowConfirmPassword(v => !v)}>
              {showConfirmPassword ? '숨기기' : '보기'}
            </PasswordToggle>
          </InputGroup>
          <PasswordRequirements>
            <PasswordRequirement met={passwordValidation.isLongEnough}>• 8자 이상</PasswordRequirement>
            <PasswordRequirement met={passwordValidation.hasUpperCase}>• 대문자 1개 이상</PasswordRequirement>
            <PasswordRequirement met={passwordValidation.hasLowerCase}>• 소문자 1개 이상</PasswordRequirement>
            <PasswordRequirement met={passwordValidation.hasNumber}>• 숫자 1개 이상</PasswordRequirement>
            <PasswordRequirement met={passwordValidation.hasSpecialChar}>• 특수문자 1개 이상</PasswordRequirement>
          </PasswordRequirements>
          {error && <Warning>{error}</Warning>}
          <SignupButton type="submit" disabled={isLoading}>
            {isLoading ? '처리중...' : '회원가입'}
          </SignupButton>
        </Form>
        <LoginLink>
          이미 계정이 있으신가요? <span onClick={onLoginClick}>로그인</span>
        </LoginLink>
      </ModalBox>
    </Overlay>
  );
};

export default SignupModal; 