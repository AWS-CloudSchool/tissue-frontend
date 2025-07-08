import React, { useEffect, useRef, useState, useMemo } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  ArcElement,
  RadialLinearScale,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';
import { Bar, Line, Pie, Doughnut, Radar, Scatter } from 'react-chartjs-2';
import ReactFlow, { Background, Controls } from 'reactflow';
import 'reactflow/dist/style.css';
import { Network, DataSet } from 'vis-network/standalone';
import * as d3 from 'd3';
import styles from './SmartVisualization.module.css';
import ReactMarkdown from 'react-markdown';
import remarkBreaks from 'remark-breaks';

// React Flow nodeTypes와 edgeTypes를 컴포넌트 외부에서 정의
const nodeTypes = {};
const edgeTypes = {};

// Chart.js 등록
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  ArcElement,
  RadialLinearScale,
  Title,
  Tooltip,
  Legend,
  Filler
);

const SmartVisualization = ({ section }) => {
  const [error, setError] = useState(null);
  const chartRef = useRef(null);
  const networkRef = useRef(null);
  const flowRef = useRef(null);
  const d3Ref = useRef(null);
  const [networkInstance, setNetworkInstance] = useState(null);

  // 타입/구조 정규화
  const normalizedSection = useMemo(() => {
    if (!section.data) return section;
    let type = section.data.visualization_type || section.data.type;
    // type 값 강제 매핑
    if (type === 'reactflow') type = 'flow';
    if (type === 'visnetwork') type = 'network';
    let data = section.data.data;

    // data.data가 여러 번 중첩된 경우도 모두 평탄화
    while (data && typeof data.data === 'object' && !Array.isArray(data.data)) {
      data = { ...data, ...data.data };
      delete data.data;
    }

    // config가 있으면 type 체크 없이 무조건 평탄화 (중첩도 모두)
    while (data && data.config) {
      data = { ...data, ...data.config };
      delete data.config;
    }

    // config만 있는 경우
    if (!data && section.data.config) {
      data = { ...section.data.config };
    }

    // headers/rows/nodes/edges/options를 최상위로 끌어올림
    const headers = data?.headers || data?.data?.headers;
    const rows = data?.rows || data?.data?.rows;
    const nodes = data?.nodes || data?.data?.nodes;
    const edges = data?.edges || data?.data?.edges;
    const options = data?.options || data?.data?.options;

    return {
      ...section,
      data: {
        ...section.data,
        type,
        data,
        headers,
        rows,
        nodes,
        edges,
        options
      }
    };
  }, [section]);

  // normalization 결과 콘솔 출력
  useEffect(() => {
    console.log('SmartVisualization section:', section);
    console.log('SmartVisualization normalizedSection:', normalizedSection);
  }, [section, normalizedSection]);

  useEffect(() => {
    if (normalizedSection.data?.type === 'network' && networkRef.current) {
      renderNetwork();
    } else if (normalizedSection.data?.type === 'd3' && d3Ref.current) {
      renderD3Visualization();
    } else if (normalizedSection.data?.type === 'diagram') {
      normalizedSection.data.type = 'network';
      if (networkRef.current) {
        renderNetwork();
      }
    }
    return () => {
      if (networkInstance) {
        networkInstance.destroy();
        setNetworkInstance(null);
      }
    };
  }, [normalizedSection.data]);

  // vis.js Network 렌더링
  const renderNetwork = () => {
    if (!networkRef.current) return;
    try {
      setError(null);
      if (networkInstance) networkInstance.destroy();
      // nodes, edges, options를 최상위에서 직접 사용
      const nodes = normalizedSection.data.nodes;
      const edges = normalizedSection.data.edges;
      const options = normalizedSection.data.options || {
        layout: {
          hierarchical: {
            enabled: true,
            direction: 'LR',
            sortMethod: 'directed'
          }
        },
        physics: {
          enabled: true,
          hierarchicalRepulsion: {
            centralGravity: 0.0,
            springLength: 100,
            springConstant: 0.01,
            nodeDistance: 120
          }
        },
        nodes: {
          shape: 'box',
          margin: 10,
          font: { size: 14 }
        },
        edges: {
          arrows: 'to',
          smooth: true
        }
      };
      // 더미 데이터 완전 제거, 데이터 없으면 에러
      if (!nodes || !edges || nodes.length === 0 || edges.length === 0) throw new Error('네트워크 데이터가 없습니다');
      const container = networkRef.current;
      const data = {
        nodes: new DataSet(nodes),
        edges: new DataSet(edges)
      };
      const network = new Network(container, data, options);
      setNetworkInstance(network);
    } catch (err) {
      setError(`네트워크 다이어그램 렌더링 실패: ${err.message}`);
    }
  };

  // D3.js 시각화 렌더링
  const renderD3Visualization = () => {
    if (!normalizedSection.data?.data || !d3Ref.current) return;
    try {
      setError(null);
      d3.select(d3Ref.current).selectAll('*').remove();
      const container = d3Ref.current;
      const data = normalizedSection.data.data;
      const config = normalizedSection.data.config || {};
      const width = config.width || 800;
      const height = config.height || 400;
      const vizType = normalizedSection.data.visualization_type;
      const svg = d3.select(container)
        .append('svg')
        .attr('width', '100%')
        .attr('height', height)
        .attr('viewBox', `0 0 ${width} ${height}`)
        .attr('preserveAspectRatio', 'xMidYMid meet');
      if (vizType === 'timeline') {
        let events = data.events || data.items || data.timeline || [];
        if (!Array.isArray(events)) {
          if (data.nodes && Array.isArray(data.nodes)) {
            events = data.nodes.map((node, index) => ({
              year: node.year || node.date || 2020 + index,
              name: node.name || node.label || node.title || `이벤트 ${index + 1}`,
              impact: node.impact || node.value || Math.random() * 100
            }));
          } else {
            events = [
              { year: 2020, name: '시작', impact: 30 },
              { year: 2021, name: '발전', impact: 60 },
              { year: 2022, name: '성장', impact: 80 },
              { year: 2023, name: '확장', impact: 90 },
              { year: 2024, name: '현재', impact: 100 }
            ];
          }
        }
        if (events.length === 0) throw new Error('Timeline 데이터가 비어있습니다');
        const margin = { top: 20, right: 30, bottom: 40, left: 50 };
        const innerWidth = width - margin.left - margin.right;
        const innerHeight = height - margin.top - margin.bottom;
        const g = svg.append('g').attr('transform', `translate(${margin.left},${margin.top})`);
        const xScale = d3.scaleLinear().domain(d3.extent(events, d => d.year)).range([0, innerWidth]);
        const yScale = d3.scaleLinear().domain([0, d3.max(events, d => d.impact)]).range([innerHeight, 0]);
        g.append('g').attr('transform', `translate(0,${innerHeight})`).call(d3.axisBottom(xScale).tickFormat(d3.format('d')));
        g.append('g').call(d3.axisLeft(yScale));
        const line = d3.line().x(d => xScale(d.year)).y(d => yScale(d.impact)).curve(d3.curveMonotoneX);
        g.append('path').datum(events).attr('fill', 'none').attr('stroke', '#667eea').attr('stroke-width', 3).attr('d', line);
        g.selectAll('.event-dot').data(events).enter().append('circle').attr('class', 'event-dot').attr('cx', d => xScale(d.year)).attr('cy', d => yScale(d.impact)).attr('r', 8).attr('fill', '#f093fb').attr('stroke', '#fff').attr('stroke-width', 3);
        g.selectAll('.event-label').data(events).enter().append('text').attr('class', 'event-label').attr('x', d => xScale(d.year)).attr('y', d => yScale(d.impact) - 15).attr('text-anchor', 'middle').attr('font-size', '12px').attr('font-weight', 'bold').attr('fill', '#333').text(d => d.name);
        g.append('text').attr('transform', 'rotate(-90)').attr('y', 0 - margin.left).attr('x', 0 - (innerHeight / 2)).attr('dy', '1em').style('text-anchor', 'middle').text('영향도');
        g.append('text').attr('transform', `translate(${innerWidth / 2}, ${innerHeight + margin.bottom})`).style('text-anchor', 'middle').text('연도');
      }
      // ... (force, treemap, sankey 등 추가 구현 가능)
    } catch (err) {
      setError(`D3 시각화 렌더링 실패: ${err.message}`);
      if (d3Ref.current) {
        d3.select(d3Ref.current).selectAll('*').remove();
        const svg = d3.select(d3Ref.current)
          .append('svg')
          .attr('width', '100%')
          .attr('height', '300px')
          .attr('viewBox', '0 0 400 300');
        svg.append('text')
          .attr('x', 200)
          .attr('y', 150)
          .attr('text-anchor', 'middle')
          .attr('font-size', '14px')
          .attr('fill', '#ef4444')
          .text(`시각화 오류: ${err.message}`);
      }
    }
  };

  const renderChart = () => {
    const { config } = normalizedSection.data;
    if (!config) return null;
    const chartOptions = {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { position: 'top' },
        title: { display: true, text: normalizedSection.title }
      },
      ...config.options
    };
    const chartProps = { data: config.data, options: chartOptions, ref: chartRef };
    switch (config.type) {
      case 'bar': return <Bar {...chartProps} />;
      case 'line': return <Line {...chartProps} />;
      case 'pie': return <Pie {...chartProps} />;
      case 'doughnut': return <Doughnut {...chartProps} />;
      case 'radar': return <Radar {...chartProps} />;
      case 'scatter': return <Scatter {...chartProps} />;
      default: return <div>지원하지 않는 차트 타입: {config.type}</div>;
    }
  };

  const renderTable = () => {
    const { headers, rows } = normalizedSection.data;
    if (!headers || !rows) return null;
    // styling 옵션을 무시하고 항상 기본값만 적용
    const defaultStyling = {
      highlight_column: 0,
      cell_padding: '16px 18px',
      header_background: 'linear-gradient(90deg, #3b82f6 0%, #6366f1 100%)',
      header_text_color: '#fff',
      row_background_even: '#f8fafc',
      row_background_odd: '#fff',
      border_color: '#e5e7eb'
    };
    const mergedStyling = defaultStyling;
    return (
      <div className={styles.tableContainer}>
        <table className={styles.dataTable} style={{borderColor: mergedStyling.border_color}}>
          <thead>
            <tr>
              {headers.map((header, i) => (
                <th
                  key={i}
                  style={{
                    background: mergedStyling.header_background,
                    color: mergedStyling.header_text_color,
                    padding: mergedStyling.cell_padding,
                    borderColor: mergedStyling.border_color,
                    ...(mergedStyling.highlight_column === i ? { background: '#dbeafe', color: '#2563eb' } : {})
                  }}
                >
                  {header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, rowIndex) => (
              <tr key={rowIndex}>
                {row.map((cell, cellIndex) => (
                  <td
                    key={cellIndex}
                    style={{
                      background: cellIndex === mergedStyling.highlight_column
                        ? '#f3f6fa'
                        : (rowIndex % 2 === 0 ? mergedStyling.row_background_even : mergedStyling.row_background_odd),
                      color: '#1e293b',
                      padding: mergedStyling.cell_padding,
                      borderColor: mergedStyling.border_color,
                      fontWeight: cellIndex === mergedStyling.highlight_column ? 700 : undefined,
                    }}
                  >
                    {cell}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  const renderAdvanced = () => (
    <div className={styles.advancedVisualizationPlaceholder}>
      <h4>{normalizedSection.data.visualization_type} 시각화</h4>
      <p>고급 시각화는 추가 구현이 필요합니다.</p>
      <pre style={{ background: '#f8f9fa', padding: '15px', borderRadius: '8px', overflow: 'auto' }}>
        {JSON.stringify(normalizedSection.data.data, null, 2)}
      </pre>
    </div>
  );

  const getPurposeIcon = (purpose) => {
    const icons = {
      overview: '🌐', detail: '🔍', comparison: '⚖️', process: '🔄', data: '📊', timeline: '📅', structure: '🏗️'
    };
    return icons[purpose] || '📊';
  };
  const getPurposeLabel = (purpose) => {
    const labels = {
      overview: '전체 개요', detail: '세부 분석', comparison: '비교', process: '프로세스', data: '데이터', timeline: '타임라인', structure: '구조'
    };
    return labels[purpose] || purpose;
  };

  // title에 purpose label이 포함되어 있으면 중복 렌더링 방지
  const purposeLabel = getPurposeLabel(normalizedSection.purpose);
  const showPurposeLabel = purposeLabel && normalizedSection.title && !normalizedSection.title.includes(purposeLabel);

  return (
    <div className={styles.smartVisualization}>
      <div className={styles.visualizationContent}>
        <div className={styles.visualizationHeader}>
          <h3 style={{display:'flex',alignItems:'center',gap: '12px',flexWrap:'wrap'}}>
            <span style={{display:'flex',alignItems:'center',gap:'7px'}}>
              {getPurposeIcon(normalizedSection.purpose)}
              <span>{normalizedSection.title}</span>
            </span>
            {showPurposeLabel && (
              <span className={`${styles.purposeBadge} ${styles['purpose-' + (normalizedSection.purpose || '')]}`}>
                {purposeLabel}
              </span>
            )}
          </h3>
        </div>
        {normalizedSection.data?.type === 'chart' && (
          <div className={styles.chartContainer}>{renderChart()}</div>
        )}
        {(normalizedSection.data?.type === 'network' || normalizedSection.data?.type === 'diagram') && (
          <div className={styles.networkContainer}>
            <div ref={networkRef} className={styles.visNetwork} style={{ height: '400px', width: '100%' }} />
            {error && <div className={styles.visualizationError}><p>⚠️ {error}</p></div>}
          </div>
        )}
        {normalizedSection.data?.type === 'flow' && (
          <div className={styles.flowContainer} style={{ height: '400px', width: '100%' }} ref={flowRef}>
            <ReactFlow
              nodes={normalizedSection.data?.data?.nodes || [
                { id: '1', type: 'input', position: { x: 0, y: 0 }, data: { label: '시작' } },
                { id: '2', position: { x: 100, y: 100 }, data: { label: '과정' } },
                { id: '3', type: 'output', position: { x: 200, y: 200 }, data: { label: '완료' } }
              ]}
              edges={normalizedSection.data?.data?.edges || [
                { id: 'e1-2', source: '1', target: '2', label: '연결 1' },
                { id: 'e2-3', source: '2', target: '3', label: '연결 2' }
              ]}
              nodeTypes={nodeTypes}
              edgeTypes={edgeTypes}
              fitView
              attributionPosition="bottom-right"
            >
              <Background />
              <Controls />
            </ReactFlow>
            {error && <div className={styles.visualizationError}><p>⚠️ {error}</p></div>}
          </div>
        )}
        {normalizedSection.data?.type === 'd3' && (
          <div className={styles.d3Container}>
            <div ref={d3Ref} className={styles.d3Visualization} style={{ width: '100%', minHeight: '400px' }} />
            {error && <div className={styles.visualizationError}><p>⚠️ {error}</p></div>}
          </div>
        )}
        {normalizedSection.data?.type === 'table' && renderTable()}
        {normalizedSection.data?.type === 'advanced' && renderAdvanced()}
        {!normalizedSection.data && (
          <div className={styles.visualizationError}>
            <p>⚠️ 시각화 데이터가 없습니다</p>
            <pre style={{ background: '#f8f9fa', padding: '10px', borderRadius: '4px', fontSize: '12px' }}>
              섹션 전체 데이터: {JSON.stringify(normalizedSection, null, 2)}
            </pre>
          </div>
        )}
        {normalizedSection.insight && (
          <div className={styles.visualizationInsight}>
            <h4>💡 핵심 인사이트</h4>
            <p>{normalizedSection.insight}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default SmartVisualization; 