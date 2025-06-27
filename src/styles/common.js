import styled from 'styled-components';
import { theme, media } from './theme';

// ===== 레이아웃 컴포넌트 =====
export const Container = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 ${theme.spacing[4]};
  
  ${media.lg} {
    padding: 0 ${theme.spacing[8]};
  }
`;

export const Flex = styled.div`
  display: flex;
  align-items: ${props => props.align || 'center'};
  justify-content: ${props => props.justify || 'flex-start'};
  gap: ${props => theme.spacing[props.gap] || props.gap || '0'};
  flex-direction: ${props => props.direction || 'row'};
  flex-wrap: ${props => props.wrap || 'nowrap'};
`;

export const Grid = styled.div`
  display: grid;
  grid-template-columns: ${props => props.columns || '1fr'};
  gap: ${props => theme.spacing[props.gap] || props.gap || theme.spacing[4]};
  align-items: ${props => props.align || 'start'};
`;

export const Card = styled.div`
  background: ${theme.colors.backdrop};
  border-radius: ${theme.borderRadius.xl};
  padding: ${theme.spacing[6]};
  border: 1px solid ${theme.colors.border};
  backdrop-filter: blur(12px);
  box-shadow: ${theme.shadows.lg};
  transition: ${theme.transitions.base};
  
  &:hover {
    box-shadow: ${theme.shadows.xl};
    transform: translateY(-2px);
  }
`;

// ===== 버튼 컴포넌트 =====
const ButtonBase = styled.button`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: ${theme.spacing[2]};
  border: none;
  border-radius: ${theme.borderRadius.lg};
  font-weight: ${theme.typography.fontWeight.semibold};
  cursor: pointer;
  transition: ${theme.transitions.base};
  text-decoration: none;
  font-family: inherit;
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

export const Button = styled(ButtonBase)`
  background: ${props => {
    switch (props.variant) {
      case 'primary':
        return theme.colors.gradientButton;
      case 'secondary':
        return theme.colors.secondary;
      case 'success':
        return theme.colors.success;
      case 'danger':
        return theme.colors.error;
      default:
        return theme.colors.primary;
    }
  }};
  color: ${theme.colors.white};
  padding: ${props => {
    switch (props.size) {
      case 'sm':
        return `${theme.spacing[2]} ${theme.spacing[3]}`;
      case 'lg':
        return `${theme.spacing[4]} ${theme.spacing[6]}`;
      default:
        return `${theme.spacing[3]} ${theme.spacing[4]}`;
    }
  }};
  font-size: ${props => {
    switch (props.size) {
      case 'sm':
        return theme.typography.fontSize.sm;
      case 'lg':
        return theme.typography.fontSize.lg;
      default:
        return theme.typography.fontSize.base;
    }
  }};
  
  &:hover:not(:disabled) {
    transform: translateY(-1px);
    box-shadow: ${theme.shadows.md};
  }
`;

export const IconButton = styled(ButtonBase)`
  background: transparent;
  color: ${theme.colors.white};
  padding: ${theme.spacing[2]};
  border-radius: ${theme.borderRadius.full};
  border: 1px solid ${theme.colors.border};
  
  &:hover:not(:disabled) {
    background: ${theme.colors.backdrop};
    border-color: ${theme.colors.white};
  }
`;

// ===== 입력 컴포넌트 =====
export const Input = styled.input`
  width: 100%;
  padding: ${theme.spacing[3]} ${theme.spacing[4]};
  border: 1px solid ${theme.colors.border};
  border-radius: ${theme.borderRadius.lg};
  background: ${theme.colors.backdrop};
  color: ${theme.colors.white};
  font-size: ${theme.typography.fontSize.base};
  outline: none;
  transition: ${theme.transitions.base};
  backdrop-filter: blur(12px);
  
  &::placeholder {
    color: ${theme.colors.gray};
  }
  
  &:focus {
    border-color: ${theme.colors.info};
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
  }
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

export const TextArea = styled.textarea`
  width: 100%;
  padding: ${theme.spacing[3]} ${theme.spacing[4]};
  border: 1px solid ${theme.colors.border};
  border-radius: ${theme.borderRadius.lg};
  background: ${theme.colors.backdrop};
  color: ${theme.colors.white};
  font-size: ${theme.typography.fontSize.base};
  outline: none;
  transition: ${theme.transitions.base};
  backdrop-filter: blur(12px);
  resize: vertical;
  min-height: 100px;
  font-family: inherit;
  
  &::placeholder {
    color: ${theme.colors.gray};
  }
  
  &:focus {
    border-color: ${theme.colors.info};
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
  }
`;

// ===== 타이포그래피 컴포넌트 =====
export const Heading = styled.h1`
  font-size: ${props => {
    switch (props.level) {
      case 1:
        return theme.typography.fontSize['4xl'];
      case 2:
        return theme.typography.fontSize['3xl'];
      case 3:
        return theme.typography.fontSize['2xl'];
      case 4:
        return theme.typography.fontSize.xl;
      case 5:
        return theme.typography.fontSize.lg;
      case 6:
        return theme.typography.fontSize.base;
      default:
        return theme.typography.fontSize['4xl'];
    }
  }};
  font-weight: ${theme.typography.fontWeight.bold};
  color: ${theme.colors.white};
  margin: 0;
  line-height: ${theme.typography.lineHeight.tight};
  text-shadow: 0 0 12px rgba(255, 255, 255, 0.5);
`;

export const Text = styled.p`
  font-size: ${props => theme.typography.fontSize[props.size] || theme.typography.fontSize.base};
  color: ${props => theme.colors[props.color] || theme.colors.text};
  margin: 0;
  line-height: ${theme.typography.lineHeight.normal};
  opacity: ${props => props.opacity || 1};
`;

// ===== 모달 컴포넌트 =====
export const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: ${theme.colors.overlay};
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: ${theme.zIndex.modal};
  backdrop-filter: blur(4px);
`;

export const ModalContent = styled.div`
  background: ${theme.colors.backdrop};
  border-radius: ${theme.borderRadius['2xl']};
  padding: ${theme.spacing[8]};
  max-width: ${props => props.maxWidth || '500px'};
  width: 90vw;
  max-height: 90vh;
  overflow-y: auto;
  position: relative;
  backdrop-filter: blur(12px);
  border: 1px solid ${theme.colors.border};
  box-shadow: ${theme.shadows['2xl']};
`;

// ===== 로딩 컴포넌트 =====
export const Spinner = styled.div`
  width: ${props => props.size || '20px'};
  height: ${props => props.size || '20px'};
  border: 2px solid ${theme.colors.border};
  border-top: 2px solid ${theme.colors.white};
  border-radius: ${theme.borderRadius.full};
  animation: spin 1s linear infinite;
  
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;

export const LoadingContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: ${theme.spacing[12]};
  color: ${theme.colors.gray};
  gap: ${theme.spacing[4]};
`;

// ===== 상태 컴포넌트 =====
export const Badge = styled.span`
  display: inline-flex;
  align-items: center;
  padding: ${theme.spacing[1]} ${theme.spacing[2]};
  border-radius: ${theme.borderRadius.full};
  font-size: ${theme.typography.fontSize.xs};
  font-weight: ${theme.typography.fontWeight.medium};
  background: ${props => {
    switch (props.variant) {
      case 'success':
        return theme.colors.success;
      case 'warning':
        return theme.colors.warning;
      case 'error':
        return theme.colors.error;
      case 'info':
        return theme.colors.info;
      default:
        return theme.colors.secondary;
    }
  }};
  color: ${theme.colors.white};
`;

// ===== 유틸리티 클래스 =====
export const VisuallyHidden = styled.span`
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
`;

export const Divider = styled.hr`
  border: none;
  height: 1px;
  background: ${theme.colors.border};
  margin: ${theme.spacing[4]} 0;
`;

// ===== 반응형 헬퍼 =====
export const HideOnMobile = styled.div`
  display: none;
  
  ${media.md} {
    display: block;
  }
`;

export const ShowOnMobile = styled.div`
  display: block;
  
  ${media.md} {
    display: none;
  }
`; 