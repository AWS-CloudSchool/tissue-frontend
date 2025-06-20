import React, { useState } from 'react';
import styled from 'styled-components';
import LoginModal from './LoginModal';
import SignupModal from './SignupModal';
import { colors } from "../styles/colors";
import { useNavigate } from 'react-router-dom';

const TopBarContainer = styled.div`
  width: 100%;
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 32px;
  background: rgba(255,255,255,0.1);
  color: ${colors.white};
  box-shadow: none;
  z-index: 10;
  position: relative;
  backdrop-filter: blur(12px);
`;

const LeftSection = styled.div`
  display: flex;
  align-items: center;
  gap: 24px;
`;

const Logo = styled.div`
  font-size: 1.35rem;
  font-weight: bold;
  color: ${colors.white};
  text-shadow: 0 0 8px rgba(0,0,0,0.5);
  cursor: pointer;
`;

const NavMenu = styled.button`
  background: none;
  border: none;
  color: ${colors.white};
  font-size: 1rem;
  font-weight: 500;
  cursor: pointer;
  padding: 8px 12px;
  border-radius: 8px;
  text-shadow: 0 0 8px rgba(0,0,0,0.5);
  transition: background 0.2s;
  &:hover {
    background: rgba(255,255,255,0.1);
  }
`;

const LoginButton = styled.button`
  background: linear-gradient(90deg, #eaffb7 60%, #b7eaff 100%);
  color: #333;
  font-weight: 600;
  border: none;
  border-radius: 18px;
  padding: 8px 22px;
  font-size: 1.05rem;
  box-shadow: 0 0 8px #eaffb7aa;
  cursor: pointer;
  transition: background 0.18s, color 0.18s;
  &:hover {
    background: linear-gradient(90deg, #f7ffde 60%, #eaffb7 100%);
    color: #7e7e00;
  }
`;

const TopBar = () => {
  const [showLogin, setShowLogin] = useState(false);
  const [showSignup, setShowSignup] = useState(false);
  const navigate = useNavigate();

  return (
    <>
      <TopBarContainer>
        <LeftSection>
          <Logo onClick={() => navigate('/')}>aurora report</Logo>
          <NavMenu onClick={() => navigate('/editor')}>에디터</NavMenu>
        </LeftSection>
        <LoginButton onClick={() => setShowLogin(true)}>Login</LoginButton>
      </TopBarContainer>
      {showLogin && (
        <LoginModal 
          onClose={() => setShowLogin(false)}
          onSignupClick={() => {
            setShowLogin(false);
            setShowSignup(true);
          }}
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