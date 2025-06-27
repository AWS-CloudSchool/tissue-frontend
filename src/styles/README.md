# 스타일 시스템 가이드

이 프로젝트는 체계적이고 유지보수가 쉬운 스타일 시스템을 제공합니다.

## 📁 파일 구조

```
src/styles/
├── theme.js          # 테마 정의 (색상, 타이포그래피, 간격 등)
├── common.js         # 공통 UI 컴포넌트
├── colors.js         # 기존 색상 정의 (하위 호환성)
├── index.js          # 모든 스타일 export
└── README.md         # 이 파일
```

## 🎨 테마 시스템

### 색상 팔레트

```javascript
import { theme } from '../styles';

// 기본 색상
theme.colors.primary    // '#111'
theme.colors.secondary  // '#222'
theme.colors.accent     // '#333'
theme.colors.white      // '#fff'
theme.colors.error      // '#FF5252'

// 상태 색상
theme.colors.success    // '#4ade80'
theme.colors.warning    // '#fbbf24'
theme.colors.info       // '#3b82f6'

// 그라데이션
theme.colors.gradientMain   // 'linear-gradient(...)'
theme.colors.gradientButton // 'linear-gradient(...)'

// 투명도 색상
theme.colors.overlay    // 'rgba(0,0,0,0.32)'
theme.colors.backdrop   // 'rgba(255,255,255,0.1)'
theme.colors.border     // 'rgba(255,255,255,0.2)'
```

### 타이포그래피

```javascript
// 폰트 패밀리
theme.typography.fontFamily.primary   // 'Arial, sans-serif'
theme.typography.fontFamily.secondary // '-apple-system, BlinkMacSystemFont, ...'

// 폰트 크기
theme.typography.fontSize.xs    // '0.75rem'
theme.typography.fontSize.sm    // '0.875rem'
theme.typography.fontSize.base  // '1rem'
theme.typography.fontSize.lg    // '1.125rem'
theme.typography.fontSize.xl    // '1.25rem'
theme.typography.fontSize['2xl'] // '1.5rem'
theme.typography.fontSize['3xl'] // '1.875rem'
theme.typography.fontSize['4xl'] // '2.25rem'

// 폰트 굵기
theme.typography.fontWeight.normal    // 400
theme.typography.fontWeight.medium    // 500
theme.typography.fontWeight.semibold  // 600
theme.typography.fontWeight.bold      // 700
theme.typography.fontWeight.extrabold // 800

// 줄 높이
theme.typography.lineHeight.tight   // 1.2
theme.typography.lineHeight.normal  // 1.4
theme.typography.lineHeight.relaxed // 1.6
theme.typography.lineHeight.loose   // 1.8
```

### 간격 시스템

```javascript
theme.spacing[0]   // '0'
theme.spacing[1]   // '0.25rem'
theme.spacing[2]   // '0.5rem'
theme.spacing[3]   // '0.75rem'
theme.spacing[4]   // '1rem'
theme.spacing[5]   // '1.25rem'
theme.spacing[6]   // '1.5rem'
theme.spacing[8]   // '2rem'
theme.spacing[10]  // '2.5rem'
theme.spacing[12]  // '3rem'
```

### 브레이크포인트

```javascript
import { media } from '../styles';

// 미디어 쿼리 사용
const ResponsiveComponent = styled.div`
  padding: ${theme.spacing[4]};
  
  ${media.md} {
    padding: ${theme.spacing[8]};
  }
  
  ${media.lg} {
    padding: ${theme.spacing[12]};
  }
`;
```

## 🧩 공통 컴포넌트

### 레이아웃 컴포넌트

```javascript
import { Container, Flex, Grid, Card } from '../styles';

// Container - 최대 너비와 중앙 정렬
<Container>
  <h1>내용</h1>
</Container>

// Flex - Flexbox 레이아웃
<Flex align="center" justify="space-between" gap={4}>
  <div>왼쪽</div>
  <div>오른쪽</div>
</Flex>

// Grid - CSS Grid 레이아웃
<Grid columns="repeat(auto-fit, minmax(250px, 1fr))" gap={6}>
  <div>아이템 1</div>
  <div>아이템 2</div>
</Grid>

// Card - 카드 스타일 컨테이너
<Card>
  <h2>카드 제목</h2>
  <p>카드 내용</p>
</Card>
```

### 버튼 컴포넌트

```javascript
import { Button, IconButton } from '../styles';

// 기본 버튼
<Button variant="primary" size="lg" onClick={handleClick}>
  클릭하세요
</Button>

// 버튼 변형
<Button variant="secondary">Secondary</Button>
<Button variant="success">Success</Button>
<Button variant="danger">Danger</Button>

// 버튼 크기
<Button size="sm">Small</Button>
<Button size="base">Base</Button>
<Button size="lg">Large</Button>

// 아이콘 버튼
<IconButton onClick={handleClick}>
  <Icon />
</IconButton>
```

### 입력 컴포넌트

```javascript
import { Input, TextArea } from '../styles';

// 텍스트 입력
<Input 
  placeholder="이메일을 입력하세요"
  value={email}
  onChange={handleChange}
/>

// 텍스트 영역
<TextArea 
  placeholder="내용을 입력하세요"
  value={content}
  onChange={handleChange}
/>
```

### 타이포그래피 컴포넌트

```javascript
import { Heading, Text } from '../styles';

// 제목 (h1-h6)
<Heading level={1}>메인 제목</Heading>
<Heading level={2}>부제목</Heading>
<Heading level={3}>소제목</Heading>

// 텍스트
<Text size="lg" color="white">큰 텍스트</Text>
<Text size="sm" color="gray" opacity={0.7}>작은 텍스트</Text>
```

### 모달 컴포넌트

```javascript
import { ModalOverlay, ModalContent } from '../styles';

<ModalOverlay>
  <ModalContent maxWidth="600px">
    <h2>모달 제목</h2>
    <p>모달 내용</p>
  </ModalContent>
</ModalOverlay>
```

### 로딩 컴포넌트

```javascript
import { Spinner, LoadingContainer } from '../styles';

// 스피너
<Spinner size="20px" />

// 로딩 컨테이너
<LoadingContainer>
  <Spinner size="32px" />
  <Text>로딩 중...</Text>
</LoadingContainer>
```

### 상태 컴포넌트

```javascript
import { Badge } from '../styles';

<Badge variant="success">성공</Badge>
<Badge variant="warning">경고</Badge>
<Badge variant="error">오류</Badge>
<Badge variant="info">정보</Badge>
```

## 🔧 유틸리티 함수

```javascript
import { getSpacing, getColor, getFontSize, getShadow, getBorderRadius } from '../styles';

// 간격 가져오기
getSpacing(4)  // '1rem'
getSpacing('20px')  // '20px'

// 색상 가져오기
getColor('primary')  // '#111'
getColor('#custom')  // '#custom'

// 폰트 크기 가져오기
getFontSize('lg')  // '1.125rem'

// 그림자 가져오기
getShadow('lg')  // '0 10px 15px -3px rgba(0, 0, 0, 0.1)...'

// 둥근 모서리 가져오기
getBorderRadius('xl')  // '0.75rem'
```

## 📱 반응형 디자인

```javascript
import { HideOnMobile, ShowOnMobile } from '../styles';

// 모바일에서 숨기기
<HideOnMobile>
  <p>데스크톱에서만 보임</p>
</HideOnMobile>

// 모바일에서만 보이기
<ShowOnMobile>
  <p>모바일에서만 보임</p>
</ShowOnMobile>
```

## 🎯 사용 예시

### 기존 컴포넌트 리팩토링

**Before:**
```javascript
const OldButton = styled.button`
  background: #111;
  color: #fff;
  padding: 8px 16px;
  border-radius: 6px;
  font-size: 1rem;
  border: none;
  cursor: pointer;
  
  &:hover {
    background: #222;
  }
`;
```

**After:**
```javascript
import { Button } from '../styles';

// 공통 Button 컴포넌트 사용
<Button variant="primary" onClick={handleClick}>
  클릭하세요
</Button>
```

### 새로운 컴포넌트 작성

```javascript
import React from 'react';
import styled from 'styled-components';
import { theme, Card, Heading, Text, Button, Flex } from '../styles';

const FeatureCard = styled(Card)`
  text-align: center;
  transition: ${theme.transitions.base};
  
  &:hover {
    transform: translateY(-4px);
  }
`;

const FeatureIcon = styled.div`
  font-size: 3rem;
  margin-bottom: ${theme.spacing[4]};
  color: ${theme.colors.info};
`;

const FeatureComponent = ({ title, description, icon, onAction }) => {
  return (
    <FeatureCard>
      <FeatureIcon>{icon}</FeatureIcon>
      <Heading level={3}>{title}</Heading>
      <Text size="sm" color="gray" style={{ marginBottom: theme.spacing[4] }}>
        {description}
      </Text>
      <Button variant="primary" onClick={onAction}>
        자세히 보기
      </Button>
    </FeatureCard>
  );
};

export default FeatureComponent;
```

## 🚀 모범 사례

1. **테마 값 사용**: 하드코딩된 값 대신 `theme` 객체의 값 사용
2. **공통 컴포넌트 활용**: 중복된 스타일 대신 공통 컴포넌트 사용
3. **반응형 고려**: `media` 헬퍼를 사용한 반응형 디자인
4. **일관성 유지**: 색상, 간격, 타이포그래피에서 일관된 값 사용
5. **접근성 고려**: `VisuallyHidden` 등 접근성 컴포넌트 활용

## 🔄 마이그레이션 가이드

기존 컴포넌트를 새로운 스타일 시스템으로 마이그레이션할 때:

1. `colors` import를 `theme` import로 변경
2. 하드코딩된 값들을 `theme` 객체의 값으로 교체
3. 중복된 스타일을 공통 컴포넌트로 교체
4. 반응형 디자인 추가
5. 접근성 개선

이 스타일 시스템을 사용하면 일관된 디자인과 쉬운 유지보수를 달성할 수 있습니다! 