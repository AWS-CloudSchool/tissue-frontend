import React, { useState, useRef, useEffect, useCallback } from 'react';
import AuroraBackground from './AuroraBackground';
import TopBar from './TopBar';
import Footer from './Footer';
import { colors } from '../styles/colors';
import { useLocation } from 'react-router-dom';

const FixedNotionEditor = () => {
  const location = useLocation();
  const [blocks, setBlocks] = useState([
    { id: 'intro', type: 'heading1', content: '', placeholder: '제목을 입력하세요...' },
    { id: 'desc', type: 'paragraph', content: '', placeholder: '내용을 입력하세요...' }
  ]);
  
  const [focusedBlock, setFocusedBlock] = useState(null);
  const [showToolbar, setShowToolbar] = useState(false);
  const [toolbarPosition, setToolbarPosition] = useState({ x: 0, y: 0 });
  const [selectionInfo, setSelectionInfo] = useState({ blockId: null, range: null });

  const editorRefs = useRef({});
  const isComposing = useRef(false);

  const detectMarkdownAndConvert = useCallback((text, blockId) => {
    if (!text || isComposing.current) return false;

    if (text === '# ') {
      updateBlockType(blockId, 'heading1', '');
      return true;
    }
    if (text === '## ') {
      updateBlockType(blockId, 'heading2', '');
      return true;
    }
    if (text === '### ') {
      updateBlockType(blockId, 'heading3', '');
      return true;
    }
    if (text === '- ') {
      updateBlockType(blockId, 'bullet', '');
      return true;
    }
    if (text.match(/^\d+\. $/)) {
      updateBlockType(blockId, 'numbered', '');
      return true;
    }
    if (text === '- [ ] ') {
      updateBlockType(blockId, 'checkbox', '', false);
      return true;
    }
    if (text === '- [x] ') {
      updateBlockType(blockId, 'checkbox', '', true);
      return true;
    }
    if (text === '> ') {
      updateBlockType(blockId, 'quote', '');
      return true;
    }
    if (text === '```') {
      updateBlockType(blockId, 'code', '');
      return true;
    }

    return false;
  }, []);

  const updateBlockType = useCallback((blockId, newType, newContent, checked = false) => {
    setBlocks(prevBlocks => 
      prevBlocks.map(block => 
        block.id === blockId 
          ? { ...block, type: newType, content: newContent, checked }
          : block
      )
    );
    
    setTimeout(() => {
      const element = editorRefs.current[blockId];
      if (element) {
        element.focus();
        const range = document.createRange();
        const selection = window.getSelection();
        range.selectNodeContents(element);
        range.collapse(false);
        selection.removeAllRanges();
        selection.addRange(range);
      }
    }, 0);
  }, []);

  const updateBlockContent = useCallback((blockId, newContent) => {
    setBlocks(prevBlocks => 
      prevBlocks.map(block => 
        block.id === blockId 
          ? { ...block, content: newContent }
          : block
      )
    );
  }, []);

  const addNewBlock = useCallback((afterBlockId) => {
    const newBlockId = 'block_' + Date.now();
    const blockIndex = blocks.findIndex(b => b.id === afterBlockId);
    
    const newBlocks = [...blocks];
    newBlocks.splice(blockIndex + 1, 0, {
      id: newBlockId,
      type: 'paragraph',
      content: '',
      placeholder: '내용을 입력하세요...'
    });
    
    setBlocks(newBlocks);
    
    setTimeout(() => {
      const element = editorRefs.current[newBlockId];
      if (element) element.focus();
    }, 10);
  }, [blocks]);

  const deleteBlock = useCallback((blockId) => {
    if (blocks.length <= 1) return;
    
    const blockIndex = blocks.findIndex(b => b.id === blockId);
    const newBlocks = blocks.filter(b => b.id !== blockId);
    setBlocks(newBlocks);
    
    const prevBlock = newBlocks[Math.max(0, blockIndex - 1)];
    if (prevBlock) {
      setTimeout(() => {
        const element = editorRefs.current[prevBlock.id];
        if (element) element.focus();
      }, 10);
    }
  }, [blocks]);

  const handleKeyDown = useCallback((e, blockId) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      addNewBlock(blockId);
    }
    
    if (e.key === 'Backspace') {
      const element = e.target;
      if (element.textContent === '') {
        e.preventDefault();
        deleteBlock(blockId);
      }
    }
  }, [addNewBlock, deleteBlock]);

  const handleInput = useCallback((e, blockId) => {
    if (isComposing.current) return;
    
    const element = e.target;
    const newContent = element.textContent || '';
    
    if (detectMarkdownAndConvert(newContent, blockId)) {
      return;
    }
    
    // 상태 업데이트하지 않고 DOM만 동기화
    // React 리렌더링을 피해서 커서 위치 보존
    const currentBlock = blocks.find(b => b.id === blockId);
    if (currentBlock && currentBlock.content !== newContent) {
      updateBlockContent(blockId, newContent);
    }
  }, [detectMarkdownAndConvert, updateBlockContent, blocks]);

  const handleSelection = useCallback(() => {
    const selection = window.getSelection();
    if (!selection.rangeCount) return;

    const range = selection.getRangeAt(0);
    const selectedText = range.toString().trim();

    if (selectedText.length > 0) {
      let blockId = null;
      for (const [id, ref] of Object.entries(editorRefs.current)) {
        if (ref && ref.contains(range.commonAncestorContainer)) {
          blockId = id;
          break;
        }
      }

      if (blockId) {
        setSelectionInfo({ blockId, range: range.cloneRange() });
        
        const rect = range.getBoundingClientRect();
        const x = rect.left + (rect.width / 2);
        const y = rect.top - 60;
        
        setToolbarPosition({ x, y });
        setShowToolbar(true);
      }
    } else {
      setShowToolbar(false);
    }
  }, []);

  const applyStyleToSelection = useCallback((command) => {
    if (!selectionInfo.range) return;

    const selection = window.getSelection();
    selection.removeAllRanges();
    selection.addRange(selectionInfo.range);

    document.execCommand(command, false, null);
    
    setShowToolbar(false);
  }, [selectionInfo]);

  const toggleCheckbox = useCallback((blockId) => {
    setBlocks(prevBlocks =>
      prevBlocks.map(block =>
        block.id === blockId
          ? { ...block, checked: !block.checked }
          : block
      )
    );
  }, []);

  const convertAnalysisToBlocks = useCallback((analysisData) => {
    const blocks = [];
    let blockId = 1;

    // 제목 추가
    blocks.push({
      id: `block_${blockId++}`,
      type: 'heading1',
      content: '📺 YouTube 영상 분석 결과',
      placeholder: ''
    });

    // YouTube URL 추가
    if (analysisData.youtube_url) {
      blocks.push({
        id: `block_${blockId++}`,
        type: 'paragraph',
        content: `🔗 원본 영상: ${analysisData.youtube_url}`,
        placeholder: ''
      });
    }

    // 요약 제목
    blocks.push({
      id: `block_${blockId++}`,
      type: 'heading2',
      content: '📋 영상 요약',
      placeholder: ''
    });

    // 분석 결과의 각 섹션을 블록으로 변환
    if (analysisData.final_output?.sections) {
      analysisData.final_output.sections.forEach(section => {
        blocks.push({
          id: `block_${blockId++}`,
          type: 'paragraph',
          content: section.content,
          placeholder: ''
        });
      });
    }

    return blocks;
  }, []);



  useEffect(() => {
    // YouTube 분석 데이터가 있으면 블록으로 변환
    if (location.state?.analysisData) {
      const analysisBlocks = convertAnalysisToBlocks(location.state.analysisData);
      setBlocks(analysisBlocks);
    }

    document.addEventListener('selectionchange', handleSelection);
    document.addEventListener('mousedown', (e) => {
      if (!e.target.closest('.selection-toolbar')) {
        setTimeout(() => setShowToolbar(false), 100);
      }
    });
    
    return () => {
      document.removeEventListener('selectionchange', handleSelection);
    };
  }, [handleSelection, location.state, convertAnalysisToBlocks]);

  const renderBlock = (block) => {
    const baseStyle = {
      border: 'none',
      outline: 'none',
      width: '100%',
      backgroundColor: 'transparent',
      fontFamily: 'inherit',
      padding: '8px 12px',
      margin: '2px 0',
      borderRadius: '8px',
      transition: 'all 0.2s ease-in-out',
      minHeight: '1.5em',
      wordWrap: 'break-word',
      whiteSpace: 'pre-wrap'
    };

    const createEditor = (additionalStyle = {}) => {
      // 초기 렌더링시에만 dangerouslySetInnerHTML 사용
      // 이후 입력은 contentEditable의 자연스러운 동작에 맡김
      return (
        <div
          ref={el => {
            editorRefs.current[block.id] = el;
            // 초기 콘텐츠 설정 (한 번만)
            if (el && el.textContent !== block.content && !isComposing.current) {
              el.textContent = block.content;
            }
          }}
          contentEditable
          suppressContentEditableWarning
          data-placeholder={block.content ? '' : block.placeholder}
          style={{
            ...baseStyle,
            ...additionalStyle,
            position: 'relative'
          }}
          onInput={(e) => handleInput(e, block.id)}
          onKeyDown={(e) => handleKeyDown(e, block.id)}
          onCompositionStart={() => {
            isComposing.current = true;
          }}
          onCompositionEnd={(e) => {
            isComposing.current = false;
            const element = e.target;
            const newContent = element.textContent || '';
            
            if (detectMarkdownAndConvert(newContent, block.id)) {
              return;
            }
            
            updateBlockContent(block.id, newContent);
          }}
          onFocus={(e) => {
            setFocusedBlock(block.id);
            e.target.style.backgroundColor = '#f1f5f9';
            e.target.style.boxShadow = '0 0 0 2px rgba(102, 126, 234, 0.1)';
          }}
          onBlur={(e) => {
            setFocusedBlock(null);
            e.target.style.backgroundColor = 'transparent';
            e.target.style.boxShadow = 'none';
            
            // 블러 시에만 상태 동기화
            const content = e.target.textContent || '';
            if (content !== block.content) {
              updateBlockContent(block.id, content);
            }
          }}
          onPaste={(e) => {
            e.preventDefault();
            const text = e.clipboardData.getData('text/plain');
            document.execCommand('insertText', false, text);
          }}
        />
      );
    };

    switch (block.type) {
      case 'heading1':
        return (
          <div style={{ margin: '20px 0 12px 0' }}>
            {createEditor({
              fontSize: '2.25em',
              fontWeight: '800',
              color: colors.white,
              lineHeight: '1.2',
              textShadow: '0 0 12px rgba(255, 255, 255, 0.5)'
            })}
          </div>
        );

      case 'heading2':
        return (
          <div style={{ margin: '18px 0 10px 0' }}>
            {createEditor({
              fontSize: '1.75em',
              fontWeight: '700',
              color: colors.white,
              lineHeight: '1.3',
              textShadow: '0 0 8px rgba(255, 255, 255, 0.5)'
            })}
          </div>
        );

      case 'heading3':
        return (
          <div style={{ margin: '16px 0 8px 0' }}>
            {createEditor({
              fontSize: '1.375em',
              fontWeight: '600',
              color: colors.white,
              lineHeight: '1.4',
              textShadow: '0 0 8px rgba(255, 255, 255, 0.5)'
            })}
          </div>
        );

      case 'bullet':
        return (
          <div style={{ display: 'flex', alignItems: 'flex-start', margin: '4px 0' }}>
            <span style={{ 
              marginRight: '12px', 
              color: '#667eea', 
              fontSize: '1.25em', 
              lineHeight: '1.5', 
              marginTop: '12px',
              fontWeight: 'bold'
            }}>•</span>
            <div style={{ flex: 1 }}>
              {createEditor({
                fontSize: '1em',
                lineHeight: '1.6'
              })}
            </div>
          </div>
        );

      case 'numbered':
        const blockIndex = blocks.findIndex(b => b.id === block.id);
        const numberedBlocks = blocks.slice(0, blockIndex + 1).filter(b => b.type === 'numbered');
        const number = numberedBlocks.length;
        
        return (
          <div style={{ display: 'flex', alignItems: 'flex-start', margin: '4px 0' }}>
            <span style={{ 
              marginRight: '12px', 
              color: '#667eea', 
              minWidth: '24px', 
              lineHeight: '1.5', 
              marginTop: '12px',
              fontWeight: '600',
              fontSize: '0.95em'
            }}>{number}.</span>
            <div style={{ flex: 1 }}>
              {createEditor({
                fontSize: '1em',
                lineHeight: '1.6'
              })}
            </div>
          </div>
        );

      case 'checkbox':
        return (
          <div style={{ display: 'flex', alignItems: 'flex-start', margin: '4px 0' }}>
            <input
              type="checkbox"
              checked={block.checked || false}
              onChange={() => toggleCheckbox(block.id)}
              style={{ 
                marginRight: '12px', 
                marginTop: '14px',
                transform: 'scale(1.2)',
                accentColor: '#667eea'
              }}
            />
            <div style={{ flex: 1 }}>
              {createEditor({
                textDecoration: block.checked ? 'line-through' : 'none',
                color: block.checked ? '#94a3b8' : 'inherit',
                fontSize: '1em',
                lineHeight: '1.6'
              })}
            </div>
          </div>
        );

      case 'quote':
        return (
          <div style={{ 
            borderLeft: '4px solid #667eea', 
            margin: '12px 0',
            background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.05) 0%, rgba(118, 75, 162, 0.05) 100%)',
            borderRadius: '8px',
            padding: '16px 20px'
          }}>
            {createEditor({
              fontStyle: 'italic',
              color: '#475569',
              fontSize: '1.05em',
              lineHeight: '1.6',
              fontWeight: '400'
            })}
          </div>
        );

      case 'code':
        return (
          <div style={{ 
            background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)', 
            borderRadius: '12px',
            margin: '16px 0',
            padding: '20px',
            border: '1px solid #334155',
            boxShadow: '0 8px 25px -8px rgba(0, 0, 0, 0.3)'
          }}>
            {createEditor({
              minHeight: '100px',
              fontFamily: 'JetBrains Mono, Monaco, "Courier New", monospace',
              fontSize: '0.9em',
              lineHeight: '1.6',
              color: '#e2e8f0'
            })}
          </div>
        );

      default:
        return (
          <div style={{ margin: '6px 0' }}>
            {createEditor({
              fontSize: '1em',
              lineHeight: '1.7',
              color: colors.white
            })}
          </div>
        );
    }
  };

  return (
    <div style={{ 
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      color: 'white',
      fontFamily: 'Arial, sans-serif'
    }}>
      <AuroraBackground />
      <TopBar />
      
      <div style={{ 
        flex: 1,
        padding: '2rem 1rem',
        position: 'relative'
      }}>
        {showToolbar && (
        <div 
          className="selection-toolbar"
          style={{
            position: 'fixed',
            left: `${toolbarPosition.x}px`,
            top: `${toolbarPosition.y}px`,
            transform: 'translateX(-50%)',
            background: 'rgba(15, 23, 42, 0.95)',
            backdropFilter: 'blur(12px)',
            borderRadius: '12px',
            padding: '8px',
            display: 'flex',
            gap: '4px',
            boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.3)',
            border: '1px solid rgba(102, 126, 234, 0.2)',
            zIndex: 1000,
            animation: 'fadeInScale 0.15s ease-out'
          }}
        >
          <button
            onClick={() => applyStyleToSelection('bold')}
            style={{
              padding: '8px 10px',
              background: 'transparent',
              border: 'none',
              borderRadius: '6px',
              color: '#e2e8f0',
              cursor: 'pointer',
              fontSize: '0.875rem',
              fontWeight: '600',
              transition: 'all 0.15s ease'
            }}
            onMouseOver={(e) => e.target.style.backgroundColor = 'rgba(102, 126, 234, 0.2)'}
            onMouseOut={(e) => e.target.style.backgroundColor = 'transparent'}
            title="굵게"
          >
            <strong>B</strong>
          </button>
          
          <button
            onClick={() => applyStyleToSelection('italic')}
            style={{
              padding: '8px 10px',
              background: 'transparent',
              border: 'none',
              borderRadius: '6px',
              color: '#e2e8f0',
              cursor: 'pointer',
              fontSize: '0.875rem',
              fontStyle: 'italic',
              transition: 'all 0.15s ease'
            }}
            onMouseOver={(e) => e.target.style.backgroundColor = 'rgba(102, 126, 234, 0.2)'}
            onMouseOut={(e) => e.target.style.backgroundColor = 'transparent'}
            title="기울임"
          >
            I
          </button>
          
          <button
            onClick={() => applyStyleToSelection('underline')}
            style={{
              padding: '8px 10px',
              background: 'transparent',
              border: 'none',
              borderRadius: '6px',
              color: '#e2e8f0',
              cursor: 'pointer',
              fontSize: '0.875rem',
              textDecoration: 'underline',
              transition: 'all 0.15s ease'
            }}
            onMouseOver={(e) => e.target.style.backgroundColor = 'rgba(102, 126, 234, 0.2)'}
            onMouseOut={(e) => e.target.style.backgroundColor = 'transparent'}
            title="밑줄"
          >
            U
          </button>
        </div>
      )}

      <style>
        {`
          @keyframes fadeInScale {
            from {
              opacity: 0;
              transform: translateX(-50%) scale(0.95);
            }
            to {
              opacity: 1;
              transform: translateX(-50%) scale(1);
            }
          }
          
          [contenteditable]:empty:before {
            content: attr(data-placeholder);
            color: rgba(255,255,255,0.5);
            pointer-events: none;
            position: absolute;
          }
          
          [contenteditable]:focus:before {
            display: none;
          }
        `}
      </style>

        <div style={{
          maxWidth: '900px', 
          margin: '0 auto', 
          backgroundColor: 'rgba(255,255,255,0.1)',
          borderRadius: '16px',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.3)',
          overflow: 'hidden',
          fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
          backdropFilter: 'blur(12px)'
        }}>
          <div style={{ 
            background: 'rgba(255,255,255,0.1)',
            padding: '2rem 2rem 1.5rem 2rem',
            borderBottom: '1px solid rgba(255,255,255,0.2)',
            backdropFilter: 'blur(12px)'
          }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <div style={{
                width: '40px',
                height: '40px',
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                borderRadius: '12px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '1.25rem'
              }}>
                ✨
              </div>
              <h1 style={{ 
                fontSize: '1.75rem', 
                fontWeight: '700', 
                color: colors.white, 
                margin: 0,
                textShadow: '0 0 12px rgba(255, 255, 255, 0.5)'
              }}>
                Fixed Notion Editor
              </h1>
            </div>
            
            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <button
                onClick={() => setBlocks([
                  { id: 'new_1', type: 'heading1', content: '', placeholder: '무제 문서' },
                  { id: 'new_2', type: 'paragraph', content: '', placeholder: '여기서 작성을 시작하세요...' }
                ])}
                style={{
                  padding: '0.75rem 1.25rem',
                  background: 'linear-gradient(135deg, #64748b 0%, #475569 100%)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '10px',
                  cursor: 'pointer',
                  fontSize: '0.875rem',
                  fontWeight: '600',
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                  transition: 'all 0.2s ease-in-out',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem'
                }}
              >
                🗑️ 새 문서
              </button>
            </div>
          </div>
          
            <div style={{ 
              background: 'rgba(255, 255, 255, 0.1)',
              backdropFilter: 'blur(10px)',
              padding: '1rem',
              borderRadius: '12px',
              border: '1px solid rgba(255, 255, 255, 0.2)'
            }}>
              <div style={{ fontSize: '0.875rem', color: colors.white, lineHeight: '1.6' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                  <span style={{ fontSize: '1rem' }}>💡</span>
                  <strong style={{ color: colors.white }}>contentEditable 기반 에디터</strong>
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', fontSize: '0.8rem' }}>
                  <span><code style={{ background: 'rgba(255, 255, 255, 0.2)', color: colors.white, padding: '2px 6px', borderRadius: '4px', fontWeight: '500' }}># </code>제목</span>
                  <span><code style={{ background: 'rgba(255, 255, 255, 0.2)', color: colors.white, padding: '2px 6px', borderRadius: '4px', fontWeight: '500' }}>- </code>목록</span>
                  <span><code style={{ background: 'rgba(255, 255, 255, 0.2)', color: colors.white, padding: '2px 6px', borderRadius: '4px', fontWeight: '500' }}>- [ ] </code>할일</span>
                  <span>텍스트를 <strong>선택</strong>하면 툴바가 나타남</span>
                </div>
              </div>
            </div>
        </div>

          <div style={{ 
            padding: '2rem', 
            lineHeight: '1.7',
            minHeight: '500px',
            background: 'rgba(255,255,255,0.05)'
          }}>
          {blocks.map((block) => (
            <div 
              key={block.id} 
              style={{ 
                marginBottom: '8px',
                position: 'relative',
                transition: 'all 0.2s ease-in-out'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.1)';
                e.currentTarget.style.borderRadius = '8px';
                e.currentTarget.style.padding = '4px 8px';
                e.currentTarget.style.margin = '4px -8px';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent';
                e.currentTarget.style.padding = '0';
                e.currentTarget.style.margin = '0';
              }}
            >
              {renderBlock(block)}
            </div>
          ))}
        </div>

          <div 
            style={{ 
              height: '150px', 
              cursor: 'text',
              background: 'rgba(255,255,255,0.05)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              borderBottomLeftRadius: '16px',
              borderBottomRightRadius: '16px'
            }}
            onClick={() => {
              const lastBlock = blocks[blocks.length - 1];
              if (lastBlock) addNewBlock(lastBlock.id);
            }}
          >
            <div style={{
              color: colors.white,
              fontSize: '0.875rem',
              textAlign: 'center',
              padding: '1rem',
              opacity: 0.8
            }}>
              <div style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>➕</div>
              <div>클릭하거나 <strong>Enter</strong>를 눌러 새 블록을 추가하세요</div>
            </div>
          </div>
        </div>
      </div>
      
      <Footer />
    </div>
  );
};

export default FixedNotionEditor;