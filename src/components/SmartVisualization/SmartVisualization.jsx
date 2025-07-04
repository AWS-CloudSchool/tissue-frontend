import React, { useEffect, useRef, useState } from 'react';
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

  // 디버깅 로그
  console.log('🎨 SmartVisualization 렌더링:', {
    section,
    data: section?.data,
    type: section?.data?.type,
    visualization_type: section?.visualization_type
  });

  useEffect(() => {
    // 시각화 타입 결정
    const vizType = section.data?.type || section.visualization_type;
    
    console.log('🎨 시각화 타입:', vizType, '데이터:', section.data);

    if ((vizType === 'network' || vizType === 'visjs') && networkRef.current) {
      renderNetwork();
    } else if ((vizType === 'd3' || vizType === 'd3js' || vizType === 'timeline') && d3Ref.current) {
      renderD3Visualization();
    } else if (vizType === 'diagram') {
      // diagram을 network로 변환
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
  }, [section.data, section.visualization_type]);

  // vis.js Network 렌더링
  const renderNetwork = () => {
    if (!networkRef.current) return;
    try {
      setError(null);
      if (networkInstance) networkInstance.destroy();
      
      // 다양한 데이터 구조 지원
      let networkData = section.data?.config?.nodes ? {
        nodes: section.data.config.nodes,
        edges: section.data.config.edges
      } : section.data?.data || section.data;
      
      if (!networkData || !networkData.nodes) {
        console.warn('네트워크 데이터가 없어 기본 데이터 사용:', section.data);
        networkData = {
          nodes: [
            { id: 1, label: '노드 1', color: '#667eea' },
            { id: 2, label: '노드 2', color: '#f093fb' },
            { id: 3, label: '노드 3', color: '#4facfe' }
          ],
          edges: [
            { from: 1, to: 2, label: '연결 1-2' },
            { from: 2, to: 3, label: '연결 2-3' }
          ]
        };
      }
      
      console.log('🌐 네트워크 렌더링:', networkData);
      
      const container = networkRef.current;
      const data = {
        nodes: new DataSet(networkData.nodes || []),
        edges: new DataSet(networkData.edges || [])
      };
      
      const options = section.data?.config?.options || section.data?.options || {
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
      
      const network = new Network(container, data, options);
      setNetworkInstance(network);
    } catch (err) {
      console.error('네트워크 렌더링 오류:', err);
      setError(`네트워크 다이어그램 렌더링 실패: ${err.message}`);
    }
  };

  // D3.js 시각화 렌더링
  const renderD3Visualization = () => {
    if (!section.data?.data || !d3Ref.current) return;
    try {
      setError(null);
      d3.select(d3Ref.current).selectAll('*').remove();
      const container = d3Ref.current;
      const data = section.data.data;
      const config = section.data.config || {};
      const width = config.width || 800;
      const height = config.height || 400;
      const vizType = section.data.visualization_type;
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
    // 다양한 데이터 구조 지원
    const chartData = section.data?.config || section.data;
    if (!chartData) {
      console.warn('차트 데이터가 없습니다:', section.data);
      return <div>차트 데이터가 없습니다</div>;
    }

    const chartOptions = {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { position: 'top' },
        title: { display: true, text: section.title || '차트' }
      },
      ...chartData.options
    };

    const chartProps = { 
      data: chartData.data, 
      options: chartOptions, 
      ref: chartRef 
    };

    const chartType = chartData.type || chartData.chart_type || 'bar';
    
    console.log('📊 차트 렌더링:', { chartType, chartData, chartProps });

    switch (chartType) {
      case 'bar': return <Bar {...chartProps} />;
      case 'line': return <Line {...chartProps} />;
      case 'pie': return <Pie {...chartProps} />;
      case 'doughnut': return <Doughnut {...chartProps} />;
      case 'radar': return <Radar {...chartProps} />;
      case 'scatter': return <Scatter {...chartProps} />;
      default: 
        console.warn('지원하지 않는 차트 타입:', chartType);
        return <div>지원하지 않는 차트 타입: {chartType}</div>;
    }
  };

  const renderTable = () => {
    // 다양한 데이터 구조 지원
    const tableData = section.data?.data || section.data;
    if (!tableData) {
      console.warn('테이블 데이터가 없습니다:', section.data);
      return <div>테이블 데이터가 없습니다</div>;
    }

    const { headers, rows, styling } = tableData;
    if (!headers || !rows) {
      console.warn('테이블 헤더 또는 행이 없습니다:', tableData);
      return <div>테이블 구조가 올바르지 않습니다</div>;
    }

    console.log('📋 테이블 렌더링:', { headers, rows, styling });

    return (
      <div className={styles.tableContainer}>
        <table className={styles.dataTable + (styling?.sortable ? ' ' + styles.sortable : '')}>
          <thead>
            <tr>
              {headers.map((header, i) => (
                <th key={i} className={styling?.highlight_column === i ? styles.highlighted : ''}>{header}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, rowIndex) => (
              <tr key={rowIndex}>
                {row.map((cell, cellIndex) => (
                  <td key={cellIndex} className={styling?.highlight_column === cellIndex ? styles.highlighted : ''}>{cell}</td>
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
      <h4>{section.data.visualization_type} 시각화</h4>
      <p>고급 시각화는 추가 구현이 필요합니다.</p>
      <pre style={{ background: '#f8f9fa', padding: '15px', borderRadius: '8px', overflow: 'auto' }}>
        {JSON.stringify(section.data.data, null, 2)}
      </pre>
    </div>
  );

  const getPurposeIcon = (purpose) => {
    const icons = {
      overview: '🌐', 
      detail: '🔍', 
      comparison: '⚖️', 
      process: '🔄', 
      data: '📊', 
      timeline: '📅', 
      structure: '🏗️',
      network: '🌐',
      flow: '🔄',
      chart: '📈',
      table: '📋'
    };
    return icons[purpose] || '📊';
  };
  
  const getPurposeLabel = (purpose) => {
    const labels = {
      overview: '전체 개요', 
      detail: '세부 분석', 
      comparison: '비교 분석', 
      process: '프로세스', 
      data: '데이터 분석', 
      timeline: '타임라인', 
      structure: '구조 분석',
      network: '관계도',
      flow: '흐름도',
      chart: '차트',
      table: '테이블'
    };
    return labels[purpose] || purpose;
  };

  return (
    <div className={styles.smartVisualization}>
      <div className={styles.visualizationHeader}>
        <h3>
          {getPurposeIcon(section.purpose)} {section.title || '시각화'}
          {section.purpose && (
            <span className={styles['purposeBadge'] + ' ' + styles['purpose' + (section.purpose.charAt(0).toUpperCase() + section.purpose.slice(1))]}>
              {getPurposeLabel(section.purpose)}
            </span>
          )}
        </h3>
        
        {/* 시각화 메타데이터 표시 */}
        <div className={styles.visualizationMeta}>
          {section.data?.type && (
            <span className={styles.metaTag}>
              📊 {section.data.type.toUpperCase()}
            </span>
          )}
          {section.data?.chart_type && (
            <span className={styles.metaTag}>
              📈 {section.data.chart_type}
            </span>
          )}
          {section.data?.network_type && (
            <span className={styles.metaTag}>
              🌐 {section.data.network_type}
            </span>
          )}
          {section.data?.flow_type && (
            <span className={styles.metaTag}>
              🔄 {section.data.flow_type}
            </span>
          )}
        </div>
        
        {error && (
          <div className={styles.visualizationError}>
            <p>⚠️ {error}</p>
          </div>
        )}
      </div>
      <div className={styles.visualizationContent}>
        {/* Chart.js 차트 */}
        {(section.data?.type === 'chart' || section.data?.type === 'chartjs' || section.data?.type === 'plotly') && (
          <div className={styles.chartContainer}>{renderChart()}</div>
        )}
        
        {/* Vis.js 네트워크 */}
        {(section.data?.type === 'network' || section.data?.type === 'diagram' || section.data?.type === 'visjs') && (
          <div className={styles.networkContainer}>
            <div ref={networkRef} className={styles.visNetwork} style={{ height: '400px', width: '100%' }} />
            {error && <div className={styles.visualizationError}><p>⚠️ {error}</p></div>}
          </div>
        )}
        
        {/* React Flow */}
        {(section.data?.type === 'flow' || section.data?.type === 'reactflow') && (
          <div className={styles.flowContainer} style={{ height: '400px', width: '100%' }} ref={flowRef}>
            <ReactFlow
              nodes={section.data?.config?.nodes || section.data?.data?.nodes || [
                { id: '1', type: 'input', position: { x: 0, y: 0 }, data: { label: '시작' } },
                { id: '2', position: { x: 100, y: 100 }, data: { label: '과정' } },
                { id: '3', type: 'output', position: { x: 200, y: 200 }, data: { label: '완료' } }
              ]}
              edges={section.data?.config?.edges || section.data?.data?.edges || [
                { id: 'e1-2', source: '1', target: '2', label: '연결 1' },
                { id: 'e2-3', source: '2', target: '3', label: '연결 2' }
              ]}
              fitView
              attributionPosition="bottom-right"
            >
              <Background />
              <Controls />
            </ReactFlow>
            {error && <div className={styles.visualizationError}><p>⚠️ {error}</p></div>}
          </div>
        )}
        
        {/* D3.js 시각화 */}
        {(section.data?.type === 'd3' || section.data?.type === 'd3js' || section.data?.type === 'timeline') && (
          <div className={styles.d3Container}>
            <div ref={d3Ref} className={styles.d3Visualization} style={{ width: '100%', minHeight: '400px' }} />
            {error && <div className={styles.visualizationError}><p>⚠️ {error}</p></div>}
          </div>
        )}
        
        {/* 테이블 */}
        {section.data?.type === 'table' && renderTable()}
        
        {/* 고급 시각화 */}
        {section.data?.type === 'advanced' && renderAdvanced()}
        
        {/* 데이터가 없는 경우 - 테스트 시각화 제공 */}
        {!section.data && (
          <div className={styles.visualizationError}>
            <p>⚠️ 시각화 데이터가 없습니다 - 테스트 차트를 표시합니다</p>
            <div className={styles.chartContainer}>
              <Bar 
                data={{
                  labels: ['테스트 1', '테스트 2', '테스트 3'],
                  datasets: [{
                    label: '테스트 데이터',
                    data: [12, 19, 3],
                    backgroundColor: ['#FF6384', '#36A2EB', '#FFCE56']
                  }]
                }}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: {
                    legend: { position: 'top' },
                    title: { display: true, text: '테스트 차트' }
                  }
                }}
              />
            </div>
            <details style={{ marginTop: '10px' }}>
              <summary>섹션 데이터 보기</summary>
              <pre style={{ background: '#f8f9fa', padding: '10px', borderRadius: '4px', fontSize: '12px' }}>
                {JSON.stringify(section, null, 2)}
              </pre>
            </details>
          </div>
        )}
      </div>
              {section.insight && (
          <div className={styles.visualizationInsight}>
            <h4>💡 핵심 인사이트</h4>
            <p>{section.insight}</p>
          </div>
        )}
        {section.user_benefit && (
          <div className={styles.visualizationBenefit}>
            <h4>🎯 이 시각화의 가치</h4>
            <p>{section.user_benefit}</p>
          </div>
        )}
        
        {/* 시각화 품질 정보 */}
        {section.data?.design_notes && (
          <div className={styles.visualizationQuality}>
            <h4>🎨 디자인 노트</h4>
            <p>{section.data.design_notes}</p>
          </div>
        )}
        
        {/* 데이터 소스 정보 */}
        {section.data?.data_source && (
          <div className={styles.dataSource}>
            <h4>📚 데이터 소스</h4>
            <p>{section.data.data_source}</p>
          </div>
        )}
    </div>
  );
};

export default SmartVisualization; 