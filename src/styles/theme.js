// 테마 시스템 정의
export const theme = {
  // 색상 팔레트
  colors: {
    // 기본 색상
    primary: '#111',
    secondary: '#222', 
    accent: '#333',
    bgDark: '#000',
    bgDeep: '#111',
    white: '#fff',
    text: '#fff',
    gray: '#b6b6b6',
    error: '#FF5252',
    disabled: '#444',
    
    // 추가 색상
    success: '#4ade80',
    warning: '#fbbf24',
    info: '#3b82f6',
    
    // 그라데이션
    gradientMain: 'linear-gradient(90deg, #000 0%, #111 40%, #222 70%, #333 100%)',
    gradientBg: 'linear-gradient(120deg, #000 0%, #111 40%, #222 80%, #333 100%)',
    gradientButton: 'linear-gradient(90deg, #111 0%, #222 100%)',
    gradientAccent: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    
    // 투명도 색상
    overlay: 'rgba(0,0,0,0.32)',
    backdrop: 'rgba(255,255,255,0.1)',
    border: 'rgba(255,255,255,0.2)',
  },

  // 타이포그래피
  typography: {
    fontFamily: {
      primary: 'Arial, sans-serif',
      secondary: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      mono: 'Monaco, Consolas, "Liberation Mono", "Courier New", monospace',
    },
    fontSize: {
      xs: '0.75rem',
      sm: '0.875rem',
      base: '1rem',
      lg: '1.125rem',
      xl: '1.25rem',
      '2xl': '1.5rem',
      '3xl': '1.875rem',
      '4xl': '2.25rem',
      '5xl': '3rem',
    },
    fontWeight: {
      normal: 400,
      medium: 500,
      semibold: 600,
      bold: 700,
      extrabold: 800,
    },
    lineHeight: {
      tight: 1.2,
      normal: 1.4,
      relaxed: 1.6,
      loose: 1.8,
    },
  },

  // 간격 시스템
  spacing: {
    0: '0',
    1: '0.25rem',
    2: '0.5rem',
    3: '0.75rem',
    4: '1rem',
    5: '1.25rem',
    6: '1.5rem',
    8: '2rem',
    10: '2.5rem',
    12: '3rem',
    16: '4rem',
    20: '5rem',
    24: '6rem',
    32: '8rem',
  },

  // 브레이크포인트
  breakpoints: {
    xs: '480px',
    sm: '640px',
    md: '768px',
    lg: '1024px',
    xl: '1280px',
    '2xl': '1536px',
  },

  // 그림자
  shadows: {
    sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
    base: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
    md: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
    lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
    xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
    '2xl': '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
    inner: 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.06)',
  },

  // 둥근 모서리
  borderRadius: {
    none: '0',
    sm: '0.125rem',
    base: '0.25rem',
    md: '0.375rem',
    lg: '0.5rem',
    xl: '0.75rem',
    '2xl': '1rem',
    '3xl': '1.5rem',
    full: '9999px',
  },

  // 애니메이션
  transitions: {
    fast: '0.15s ease',
    base: '0.2s ease',
    slow: '0.3s ease',
    slower: '0.5s ease',
  },

  // z-index
  zIndex: {
    hide: -1,
    auto: 'auto',
    base: 0,
    docked: 10,
    dropdown: 1000,
    sticky: 1100,
    banner: 1200,
    overlay: 1300,
    modal: 1400,
    popover: 1500,
    skipLink: 1600,
    toast: 1700,
    tooltip: 1800,
  },
};

// 미디어 쿼리 헬퍼
export const media = {
  xs: `@media (min-width: ${theme.breakpoints.xs})`,
  sm: `@media (min-width: ${theme.breakpoints.sm})`,
  md: `@media (min-width: ${theme.breakpoints.md})`,
  lg: `@media (min-width: ${theme.breakpoints.lg})`,
  xl: `@media (min-width: ${theme.breakpoints.xl})`,
  '2xl': `@media (min-width: ${theme.breakpoints['2xl']})`,
};

// 유틸리티 함수
export const getSpacing = (size) => theme.spacing[size] || size;
export const getColor = (color) => theme.colors[color] || color;
export const getFontSize = (size) => theme.typography.fontSize[size] || size;
export const getShadow = (shadow) => theme.shadows[shadow] || shadow;
export const getBorderRadius = (radius) => theme.borderRadius[radius] || radius; 