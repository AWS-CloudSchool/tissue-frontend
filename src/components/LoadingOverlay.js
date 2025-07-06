import React from 'react';
import { FaSpinner } from 'react-icons/fa';
import knowledgeStyles from '../pages/MyKnowledge.module.css';

const LoadingOverlay = ({ text = '보고서 목록을 불러오는 중입니다...' }) => (
  <div className={knowledgeStyles.loadingOverlay}>
    <FaSpinner className={knowledgeStyles.bigSpinner} />
    <div className={knowledgeStyles.loadingText}>{text}</div>
  </div>
);

export default LoadingOverlay; 