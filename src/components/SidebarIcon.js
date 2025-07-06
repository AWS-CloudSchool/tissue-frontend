import React from 'react';
import sidebarIcon from '../assets/sidebar.png';

const SidebarIcon = ({ onClick }) => (
  <button
    onClick={onClick}
    style={{
      background: 'none',
      border: 'none',
      padding: 0,
      margin: 0,
      cursor: 'pointer',
      outline: 'none',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      width: 40,
      height: 40,
    }}
    aria-label="사이드바 열기"
  >
    <img src={sidebarIcon} alt="사이드바 아이콘" style={{ width: 32, height: 32 }} />
  </button>
);

export default SidebarIcon; 