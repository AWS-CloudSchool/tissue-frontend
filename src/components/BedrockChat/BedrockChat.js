import React, { useState, useEffect, useRef } from 'react';
import styles from './BedrockChat.module.css';
import axios from 'axios';

const BedrockChat = ({ s3Key, onClose }) => {
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [kbStatus, setKbStatus] = useState('CREATING');
  const [kbId, setKbId] = useState(null);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (s3Key) {
      createKnowledgeBase();
    }
  }, [s3Key]);

  const createKnowledgeBase = async () => {
    try {
      const response = await axios.post(`${process.env.REACT_APP_API_BASE_URL}/bedrock/create-kb`, {
        s3_key: s3Key
      });
      setKbId(response.data.kb_id);
      setKbStatus(response.data.status);
      if (response.data.status === 'CREATING') {
        pollKbStatus(response.data.kb_id);
      }
    } catch (error) {
      setKbStatus('ERROR');
    }
  };

  const pollKbStatus = async (kbId) => {
    const pollInterval = setInterval(async () => {
      try {
        const response = await axios.get(`${process.env.REACT_APP_API_BASE_URL}/bedrock/kb-status/${kbId}`);
        const status = response.data.status;
        setKbStatus(status);
        if (status === 'READY') {
          clearInterval(pollInterval);
          setMessages(prev => [...prev, {
            id: Date.now(),
            role: 'assistant',
            content: '안녕하세요! 리포트에 대해 궁금한 점이 있으시면 언제든 질문해주세요.'
          }]);
        } else if (status === 'ERROR') {
          clearInterval(pollInterval);
          setMessages(prev => [...prev, {
            id: Date.now(),
            role: 'assistant',
            content: '죄송합니다. 지식베이스 생성 중 오류가 발생했습니다.'
          }]);
        }
      } catch (error) {
        clearInterval(pollInterval);
        setKbStatus('ERROR');
      }
    }, 2000);
  };

  const sendMessage = async () => {
    if (!inputMessage.trim() || !kbId || kbStatus !== 'READY') return;
    const userMessage = {
      id: Date.now(),
      role: 'user',
      content: inputMessage
    };
    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);
    try {
      const response = await axios.post(`${process.env.REACT_APP_API_BASE_URL}/bedrock/chat`, {
        question: inputMessage,
        kb_id: kbId
      });
      if (response.data.success) {
        setMessages(prev => [...prev, {
          id: Date.now() + 1,
          role: 'assistant',
          content: response.data.answer
        }]);
      } else {
        setMessages(prev => [...prev, {
          id: Date.now() + 1,
          role: 'assistant',
          content: '죄송합니다. 응답을 생성하는 중 오류가 발생했습니다.'
        }]);
      }
    } catch (error) {
      setMessages(prev => [...prev, {
        id: Date.now() + 1,
        role: 'assistant',
        content: '죄송합니다. 서버와의 통신 중 오류가 발생했습니다.'
      }]);
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

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div className={styles.title}>Bedrock 챗봇</div>
        <button className={styles.sendButton} onClick={onClose}>닫기</button>
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