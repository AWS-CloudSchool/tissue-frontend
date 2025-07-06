import React, { useState, useEffect, useRef } from 'react';
import styles from './BedrockChat.module.css';
import axios from 'axios';

const BedrockChat = ({ s3Key, reportId, onClose }) => {
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [kbStatus, setKbStatus] = useState('CREATING');
  const [kbId, setKbId] = useState(null);
  const messagesEndRef = useRef(null);
  const didMount = useRef(false);
  const inputRef = useRef(null);
  const pollRef = useRef(null); // poll interval 관리용
  
  // API 기본 URL 설정 (환경변수가 없으면 localhost:8000 사용)
  const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || process.env.REACT_APP_BACKEND_URL || 'http://localhost:8000';
  
  // JWT 토큰에서 user_id 추출하는 함수
  const getUserIdFromToken = () => {
    try {
      const token = localStorage.getItem('access_token');
      if (!token) {
        return 'default_user';
      }
      
      // JWT 토큰 디코드 (base64 디코드)
      const payload = JSON.parse(atob(token.split('.')[1]));
      
      // user_id, userId, sub 등에서 user_id 찾기
      const userId = payload.user_id || payload.userId || payload.sub || payload.id;
      
      return userId || 'default_user';
    } catch (error) {
      return 'default_user';
    }
  };
  
  // user_id는 JWT 토큰에서 추출
  const userId = getUserIdFromToken();

  const scrollToBottom = () => {
    if (messagesEndRef.current) {
      const container = messagesEndRef.current.closest(`.${styles.messages}`);
      if (container) {
        container.scrollTop = container.scrollHeight;
      }
    }
  };

  // 스크롤이 필요한지 확인하는 함수
  const shouldScrollToBottom = () => {
    const container = messagesEndRef.current?.closest(`.${styles.messages}`);
    if (!container) return true;
    
    // 스크롤이 맨 아래에 가까이 있으면 자동 스크롤
    const isNearBottom = container.scrollHeight - container.scrollTop - container.clientHeight < 50;
    return isNearBottom;
  };

  useEffect(() => {
    if (didMount.current && shouldScrollToBottom()) {
      scrollToBottom();
    } else {
      didMount.current = true;
    }
  }, [messages]);

  useEffect(() => {
    if (s3Key || reportId) {
      createKnowledgeBase();
    }
  }, [s3Key, reportId]);

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.blur();
    }
  }, []);

  useEffect(() => {
    const fetchChatHistory = async () => {
      try {
        const res = await axios.get(`${API_BASE_URL}/api/chat-history`);
        if (Array.isArray(res.data)) {
          setMessages(res.data);
          // 기존 채팅 내역이 없고, 지식베이스가 준비되었을 때만 안내 메시지 추가
          if (res.data.length === 0 && kbStatus === 'READY') {
            setMessages([{
              id: Date.now(),
              role: 'assistant',
              content: '안녕하세요! 리포트에 대해 궁금한 점이 있으시면 언제든 질문해주세요.'
            }]);
          }
        }
      } catch (e) {}
    };
    fetchChatHistory();
  }, [kbId, kbStatus]);

  const createKnowledgeBase = async () => {
    try {
      const requestBody = {
        user_id: userId,
        job_id: reportId || s3Key
      };
      
      const response = await axios.post(`${API_BASE_URL}/api/sync-kb`, requestBody);
      
      setKbId(response.data.job_id);
      setKbStatus('CREATING');
      if (response.data.job_id) {
        // 기존 interval이 있다면 클리어
        if (pollRef.current) clearInterval(pollRef.current);
        pollKbStatus(response.data.job_id);
      }
    } catch (error) {
      setKbStatus('ERROR');
    }
  };

  const pollKbStatus = (jobId) => {
    pollRef.current = setInterval(async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}/api/kb-status/${jobId}`);
        const status = response.data.status;
        setKbStatus(status);
        if (status === 'READY') {
          clearInterval(pollRef.current);
          pollRef.current = null;
          // 안내 메시지는 fetchChatHistory에서 처리하므로 여기서는 제거
        } else if (status === 'ERROR') {
          clearInterval(pollRef.current);
          pollRef.current = null;
          setMessages(prev => [...prev, {
            id: Date.now(),
            role: 'assistant',
            content: '죄송합니다. 지식베이스 생성 중 오류가 발생했습니다.'
          }]);
        }
      } catch (error) {
        clearInterval(pollRef.current);
        pollRef.current = null;
        setKbStatus('ERROR');
      }
    }, 2000);
  };

  const sendMessage = async () => {
    if (!inputMessage.trim() || kbStatus !== 'READY') return;
    const userMessage = {
      id: Date.now(),
      role: 'user',
      content: inputMessage
    };
    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);
    
    // 사용자 메시지 추가 후 스크롤
    setTimeout(() => scrollToBottom(), 100);
    
    try {
      const response = await axios.post(`${API_BASE_URL}/api/chat`, {
        question: inputMessage
      });
      if (response.data.success) {
        setMessages(prev => [...prev, {
          id: Date.now() + 1,
          role: 'assistant',
          content: response.data.answer
        }]);
        // 응답 메시지 추가 후 스크롤
        setTimeout(() => scrollToBottom(), 100);
      } else {
        setMessages(prev => [...prev, {
          id: Date.now() + 1,
          role: 'assistant',
          content: '죄송합니다. 응답을 생성하는 중 오류가 발생했습니다.'
        }]);
        setTimeout(() => scrollToBottom(), 100);
      }
    } catch (error) {
      setMessages(prev => [...prev, {
        id: Date.now() + 1,
        role: 'assistant',
        content: '죄송합니다. 서버와의 통신 중 오류가 발생했습니다.'
      }]);
      setTimeout(() => scrollToBottom(), 100);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const getStatusMessage = () => {
    switch (kbStatus) {
      case 'CREATING':
        return <div>지식베이스를 생성하고 있습니다...</div>;
      case 'ERROR':
        return <div>지식베이스 생성에 실패했습니다.</div>;
      case 'READY':
        return null;
      default:
        return <div>지식베이스 상태를 확인하고 있습니다...</div>;
    }
  };

  const handleClearChat = async () => {
    if (!window.confirm('정말로 모든 대화 내역을 삭제하시겠습니까?')) return;
    try {
      await axios.delete(`${API_BASE_URL}/api/chat-history`);
      setMessages([]);
    } catch (e) {
      alert('대화 내역 삭제 실패');
    }
  };

  useEffect(() => {
    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
    };
  }, []);

  return (
    <div className={styles.container}>

      
      <div className={styles.header}>
        <div className={styles.title}>Tissue 챗봇 🤖</div>
        <div className={styles.headerButtons}>
          <button className={styles.headerButton} onClick={handleClearChat}>삭제</button>
          <button className={styles.headerButton} onClick={onClose}>닫기</button>
        </div>
      </div>
      <div className={styles.messages}>
        {getStatusMessage()}
        {messages.map((message) => (
          <div
            key={message.id}
            className={
              message.role === 'user'
                ? `${styles.message} ${styles.messageUser}`
                : styles.message
            }
          >
            <div
              className={
                message.role === 'user'
                  ? `${styles.bubble} ${styles.bubbleUser}`
                  : styles.bubble
              }
            >
              {message.content}
            </div>
          </div>
        ))}
        {isLoading && (
          <div className={styles.message}>
            <div className={styles.bubble}>응답을 생성하고 있습니다...</div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>
      <div className={styles.inputContainer}>
        <input
          ref={inputRef}
          className={styles.input}
          value={inputMessage}
          onChange={(e) => setInputMessage(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="질문을 입력하세요..."
          disabled={kbStatus !== 'READY' || isLoading}
        />
        <button
          className={styles.sendButton}
          onClick={sendMessage}
          disabled={!inputMessage.trim() || kbStatus !== 'READY' || isLoading}
        >
          전송
        </button>
      </div>
    </div>
  );
};

export default BedrockChat; 