import React, { useState } from 'react';
import styled from 'styled-components';
import axios from 'axios';
import { AiOutlineFileText, AiOutlineClose } from "react-icons/ai";
import { colors } from "../styles/colors";
import { useNavigate } from 'react-router-dom';

const Container = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-top: 18px;
  margin-bottom: 10px;
`;

const Box = styled.div`
  width: 100%;
  max-width: 600px;
  margin: 0 auto;
  background: rgba(255,255,255,0.18);
  border: 2px solid #eaffb7;
  border-radius: 18px;
  box-shadow: 0 2px 16px 0 rgba(180,255,255,0.08);
  display: flex;
  align-items: center;
  padding: 10px 16px;
  gap: 8px;
  backdrop-filter: blur(2px);
  transition: border 0.2s, background 0.2s;
  overflow-x: auto;
`;

const Input = styled.input`
  flex: 1;
  border: none;
  background: transparent;
  font-size: 1.13rem;
  color: #222;
  outline: none;
  padding: 4px 0;
  &::placeholder {
    color: #b6b6b6;
    font-size: 1rem;
  }
`;

const ArrowButton = styled.button`
  background: #eaffb7;
  border: none;
  border-radius: 50%;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.2rem;
  color: #7e7e00;
  box-shadow: 0 0 8px #eaffb7aa;
  cursor: pointer;
  transition: background 0.2s;
  margin-left: 6px;
  &:hover {
    background: #f7ffde;
  }
`;

const FileTag = styled.div`
  display: flex;
  align-items: center;
  background: ${colors.bgLight};
  border-radius: 20px;
  padding: 4px 12px 4px 8px;
  margin-right: 8px;
  font-size: 15px;
`;

const FileName = styled.span`
  margin: 0 6px;
  max-width: 100px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  color: ${colors.text};
`;

const RemoveBtn = styled.button`
  background: none;
  border: none;
  cursor: pointer;
  margin-left: 4px;
  font-size: 16px;
  color: ${colors.disabled};
  &:hover {
    color: ${colors.error};
  }
`;

function extractYoutubeId(url) {
  const regExp = /(?:v=|youtu.be\/)([\w-]{11})/;
  const match = url.match(regExp);
  return match ? match[1] : null;
}

const InputBox = () => {
  const [inputValue, setInputValue] = useState('');
  const [isDragOver, setIsDragOver] = useState(false);
  const [files, setFiles] = useState([]);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const handleSubmit = async (input) => {
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      let response;
      if (input instanceof File) {
        const formData = new FormData();
        formData.append('file', input);
        response = await axios.post('/analysis/document', formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
      } else if (/^https?:\/\//.test(input)) {
        if (/(youtube\.com|youtu\.be)/.test(input)) {
          response = await axios.post('/youtube/analysis', { youtube_url: input });
        } else {
          response = await axios.post('/youtube/search', { query: input });
        }
      } else {
        response = await axios.post('/youtube/search', { query: input });
      }
      setResult(response.data);
      
      // YouTube 분석 결과가 있으면 에디터로 이동
      if (response.data.analysis_results?.fsm_analysis?.final_output) {
        const analysisData = response.data.analysis_results.fsm_analysis;
        navigate('/editor', { 
          state: { 
            analysisData: analysisData,
            youtubeUrl: input 
          } 
        });
      }
    } catch (err) {
      setError(err.message || '에러 발생');
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e) => {
    const newFiles = Array.from(e.target.files);
    setFiles([...files, ...newFiles]);
    e.target.value = "";
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const droppedFiles = Array.from(e.dataTransfer.files);
      setFiles([...files, ...droppedFiles]);
    }
  };

  const handleInput = async () => {
    if (files.length > 0) {
      for (const file of files) {
        await handleSubmit(file);
      }
      setFiles([]);
    } else if (inputValue.trim()) {
      if (/(youtube\.com|youtu\.be)/.test(inputValue.trim())) {
        await handleSubmit(inputValue.trim());
      } else {
        navigate(`/youtube-search?query=${encodeURIComponent(inputValue.trim())}`);
      }
    }
  };

  const removeFile = (index) => {
    setFiles(files.filter((_, i) => i !== index));
  };

  return (
    <Container>
      <Box
        isDragOver={isDragOver}
        onDragOver={e => { e.preventDefault(); setIsDragOver(true); }}
        onDragLeave={e => { e.preventDefault(); setIsDragOver(false); }}
        onDrop={handleDrop}
        style={{ overflowX: 'auto' }}
      >
        {files.length > 0 && (
          <div style={{ display: "flex", alignItems: "center", gap: 4, marginRight: 8 }}>
            {files.map((file, idx) => (
              <FileTag key={idx}>
                <AiOutlineFileText />
                <FileName title={file.name}>{file.name}</FileName>
                <RemoveBtn onClick={() => removeFile(idx)}>
                  <AiOutlineClose />
                </RemoveBtn>
              </FileTag>
            ))}
          </div>
        )}
        <Input
          placeholder="텍스트, 파일, 또는 URL 입력"
          value={inputValue}
          onChange={e => setInputValue(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter') handleInput(); }}
        />
        <input
          type="file"
          style={{ display: 'none' }}
          id="file-upload"
          multiple
          onChange={handleFileChange}
        />
        <label htmlFor="file-upload">
          <ArrowButton as="span" title="파일 첨부">📎</ArrowButton>
        </label>
        <ArrowButton onClick={handleInput} title="전송">→</ArrowButton>
      </Box>
      {loading && <div>요청을 처리 중입니다...</div>}
      {error && <div style={{ color: colors.error }}>{error}</div>}
      {result && (
        <div style={{ color: colors.primary, textAlign: 'left', marginTop: 20 }}>
          <pre style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-all' }}>{JSON.stringify(result, null, 2)}</pre>
        </div>
      )}
    </Container>
  );
};

export default InputBox; 