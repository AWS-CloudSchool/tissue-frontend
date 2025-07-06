import React from 'react';
import { Link } from 'react-router-dom';
import styles from './Sidebar.module.css';

const Sidebar = ({ open, onClose, onLoginClick, user, onLogout, reports = [], children }) => {
  const handleLogout = () => {
    onLogout();
    localStorage.removeItem('user');
    localStorage.removeItem('access_token');
    localStorage.removeItem('id_token');
  };

  return (
    <aside className={open ? `${styles.sidebar} ${styles.sidebarOpen}` : styles.sidebar}>
      <div className={styles.topBar}>
        <Link to="/" className={styles.logo} style={{ textDecoration: 'none' }}>Tissue!</Link>
        <button className={styles.closeBtn} onClick={onClose} aria-label="사이드바 닫기">×</button>
      </div>
      {children}
      <nav className={styles.menu}>
        <ul>
          <li>
            <Link to="/" className={styles.menuLink}>
              <span className={styles.menuIcon}>🏠</span> 홈
            </Link>
          </li>
          <li>
            <Link to="/youtube-search" className={styles.menuLink} style={{display:'flex',alignItems:'center'}}>
              <span className={styles.menuIcon}>🔍</span> Youtube 검색
            </Link>
          </li>
          <li>
            <Link to="/my-knowledge" className={styles.menuLink}>
              <span className={styles.menuIcon}>📖</span> 내 지식
            </Link>
          </li>
        </ul>
        <ul className={styles.knowledgeTree}>
          {reports.map(r => (
            <li key={r.id} className={styles.treeItem}>
              <span className={styles.treeIcon}>📄</span>
              <Link 
                to={`/editor/${r.id}`} 
                state={{ presignedUrl: r.url, reportTitle: r.title }}
                className={styles.treeLink}
              >
                {r.title.length > 22 ? r.title.slice(0, 22) + '...' : r.title}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
      <div style={{marginTop: 'auto'}}>
        {user && (
          <div className={styles.profileBox}>
            <div className={styles.profileHello}>안녕하세요!</div>
            <div className={styles.profileEmail}>{user.email}님😀</div>
            <button className={styles.logoutBtn} onClick={handleLogout}>로그아웃</button>
          </div>
        )}
        {!user && (
          <button className={styles.loginBtn} onClick={onLoginClick}>로그인/회원가입</button>
        )}
        <div className={styles.sidebarFooter}>© 2025 AWS CloudSchool</div>
      </div>
    </aside>
  );
};

export default Sidebar; 