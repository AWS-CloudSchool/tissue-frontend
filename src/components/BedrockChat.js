import React, { useState, useEffect, useRef } from 'react';
import styled from 'styled-components';
import { colors } from '../styles/colors';
import axios from 'axios';

const ChatContainer = styled.div`
  width: 100%;
  max-width: 800px;
  margin: 0 auto;
  background: ${colors.bgLight};
  border-radius: 18px;
  border: 2px solid ${colors.primary};
  box-shadow: 0 4px 20px 0 ${colors.navyDark}44;
  display: flex;
  flex-direction: column;
  height: 600px;
  color: ${colors.white};
`;

const ChatHeader = styled.div`
  padding: 20px 20px 12px 20px;
  border-bottom: 1px solid ${colors.gray};
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const ChatTitle = styled.h2`
  color: ${colors.white};
  margin: 0;
  font-size: 1.3rem;
`;

const MessagesContainer = styled.div`
  flex: 1;
  padding: 20px;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 15px;
  scrollbar-width: thin;
  scrollbar-color: #ff69b4 #222;
  &::-webkit-scrollbar {
    width: 8px;
    background: transparent;
  }
  &::-webkit-scrollbar-thumb {
    background: #ff69b4;
    border-radius: 6px;
    min-height: 40px;
  }
  &::-webkit-scrollbar-track {
    background: #222;
    border-radius: 6px;
  }
`;

const Message = styled.div`
  display: flex;
  justify-content: ${props => props.isUser ? 'flex-end' : 'flex-start'};
`;

const MessageBubble = styled.div`
  max-width: 70%;
  padding: 12px 16px;
  border-radius: 18px;
  background: ${props => props.isUser ? colors.primary : colors.bgDark};
  color: ${colors.white};
  font-size: 0.95rem;
  line-height: 1.4;
  word-wrap: break-word;
  ${props => !props.isUser && `border: 1px solid ${colors.gray};`}
`;

const InputContainer = styled.div`
  padding: 20px;
  border-top: 1px solid ${colors.gray};
  display: flex;
  gap: 10px;
`;

const MessageInput = styled.input`
  flex: 1;
  background: ${colors.bgDark};
  border: 1px solid ${colors.gray};
  border-radius: 12px;
  padding: 12px 16px;
  color: ${colors.white};
  font-size: 1rem;
  outline: none;
  &:focus {
    border-color: ${colors.primary};
  }
  &::placeholder {
    color: ${colors.gray};
  }
`;

const SendButton = styled.button`
  background: ${colors.primary};
  border: none;
  border-radius: 12px;
  padding: 12px 20px;
  color: ${colors.white};
  cursor: pointer;
  font-size: 1rem;
  transition: background 0.2s;
  &:hover {
    background: #4a90e2;
  }
  &:disabled {
    background: ${colors.gray};
    cursor: not-allowed;
  }
`;

const StatusMessage = styled.div`
  text-align: center;
  color: ${colors.gray};
  font-size: 0.9rem;
  margin: 10px 0;
`;

const BedrockChat = ({ s3Key, onClose }) => {
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [kbId, setKbId] = useState(null);
  const [kbStatus, setKbStatus] = useState(null); // "CREATING", "READY", "FAILED" 등
  const messagesEndRef = useRef(null);

  // KB 생성 및 상태 폴링
  useEffect(() => {
    if (s3Key) {
      setKbStatus("CREATING");
      setKbId(null);
      (async () => {
        try {
          const res = await axios.post('/bedrock/create-kb', { s3_key: s3Key });
          setKbId(res.data.kb_id);
        } catch (e) {
          setKbStatus("FAILED");
        }
      })();
    }
  }, [s3Key]);

  useEffect(() => {
    if (!kbId) return;
    setKbStatus("CREATING");
    let interval = setInterval(async () => {
      try {
        const res = await axios.get(`/bedrock/kb-status/${kbId}`);
        setKbStatus(res.data.status);
        if (res.data.status === "READY" || res.data.status === "FAILED") {
          clearInterval(interval);
        }
      } catch (e) {
        setKbStatus("FAILED");
        clearInterval(interval);
      }
    }, 3000);
    return () => clearInterval(interval);
  }, [kbId]);

  // 메시지 목록 자동 스크롤
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };
  useEffect(() => { scrollToBottom(); }, [messages]);

  const sendMessage = async () => {
    if (!inputValue.trim() || loading || kbStatus !== "READY") return;
    const userMessage = {
      role: 'user',
      content: inputValue.trim(),
      timestamp: new Date().toISOString()
    };
    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setLoading(true);
    setError(null);
    try {
      const response = await axios.post('/bedrock/chat', { question: inputValue.trim(), kb_id: kbId });
      if (response.data.success) {
        const assistantMessage = {
          role: 'assistant',
          content: response.data.answer,
          timestamp: new Date().toISOString()
        };
        setMessages(prev => [...prev, assistantMessage]);
      } else {
        throw new Error(response.data.error || '응답 생성에 실패했습니다.');
      }
    } catch (err) {
      setError(err.message);
      const errorMessage = {
        role: 'assistant',
        content: '죄송합니다. 응답을 생성하는 중에 오류가 발생했습니다.',
        timestamp: new Date().toISOString()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey && kbStatus === "READY") {
      e.preventDefault();
      sendMessage();
    }
  };

  // KB 생성 중/실패 안내
  if (kbStatus === "CREATING" || !kbStatus) {
    return (
      <ChatContainer>
        <ChatHeader>
          <ChatTitle>Bedrock 챗봇</ChatTitle>
          {onClose && (
            <button onClick={onClose} style={{ background: 'none', border: 'none', color: '#fff', fontSize: '1.5rem', marginLeft: 12, cursor: 'pointer' }} title="닫기">×</button>
          )}
        </ChatHeader>
        <MessagesContainer>
          <StatusMessage>지식베이스 생성 중입니다... 잠시만 기다려주세요.</StatusMessage>
        </MessagesContainer>
      </ChatContainer>
    );
  }
  if (kbStatus === "FAILED") {
    return (
      <ChatContainer>
        <ChatHeader>
          <ChatTitle>Bedrock 챗봇</ChatTitle>
          {onClose && (
            <button onClick={onClose} style={{ background: 'none', border: 'none', color: '#fff', fontSize: '1.5rem', marginLeft: 12, cursor: 'pointer' }} title="닫기">×</button>
          )}
        </ChatHeader>
        <MessagesContainer>
          <StatusMessage style={{ color: 'red' }}>지식베이스 생성에 실패했습니다.</StatusMessage>
        </MessagesContainer>
      </ChatContainer>
    );
  }

  // KB가 READY일 때만 채팅 가능
  return (
    <ChatContainer>
      <ChatHeader>
        <ChatTitle>Bedrock 챗봇</ChatTitle>
        {onClose && (
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: '#fff', fontSize: '1.5rem', marginLeft: 12, cursor: 'pointer' }} title="닫기">×</button>
        )}
      </ChatHeader>
      <MessagesContainer>
        {messages.map((message, index) => (
          <Message key={index} isUser={message.role === 'user'}>
            <MessageBubble isUser={message.role === 'user'}>
              {message.content}
            </MessageBubble>
          </Message>
        ))}
        {loading && (
          <Message isUser={false}>
            <MessageBubble isUser={false}>
              💭 생각 중입니다...
            </MessageBubble>
          </Message>
        )}
        {error && (
          <StatusMessage style={{ color: colors.error }}>
            ⚠️ {error}
          </StatusMessage>
        )}
        <div ref={messagesEndRef} />
      </MessagesContainer>
      <InputContainer>
        <MessageInput
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="질문을 입력하세요..."
          disabled={loading || kbStatus !== "READY"}
        />
        <SendButton onClick={sendMessage} disabled={loading || !inputValue.trim() || kbStatus !== "READY"}>
          전송
        </SendButton>
      </InputContainer>
    </ChatContainer>
  );
};

export default BedrockChat; 