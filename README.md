# Tissue Frontend

유튜브 영상 분석 및 AI 챗봇 서비스의 프론트엔드 애플리케이션입니다.

## 🚀 주요 기능

### 📊 유튜브 분석 보고서
- 유튜브 영상 URL을 통한 자동 분석
- 시각화 차트 및 인사이트 제공
- 마크다운 형식의 상세 분석 내용
- 노션 스타일의 깔끔한 UI

### 🤖 AI 챗봇
- 리포트 내용 기반 질의응답
- 실시간 대화형 인터페이스
- 지식베이스 자동 생성 및 관리
- 대화 내역 저장 및 관리

### 🎨 사용자 인터페이스
- 반응형 디자인
- 사이드바 네비게이션
- 로딩 오버레이
- 직관적인 사용자 경험

## 🛠 기술 스택

- **Frontend**: React 18
- **Styling**: CSS Modules
- **HTTP Client**: Axios
- **Markdown**: ReactMarkdown
- **Icons**: React Icons
- **Routing**: React Router DOM

## 📦 설치 및 실행

### 필수 요구사항
- Node.js 16.0 이상
- npm 또는 yarn

### 설치
```bash
# 저장소 클론
git clone [repository-url]
cd tissue-forntend

# 의존성 설치
npm install
```

### 환경 변수 설정
프로젝트 루트에 `.env` 파일을 생성하고 다음 변수들을 설정하세요:

```env
REACT_APP_BACKEND_URL=http://localhost:8000
REACT_APP_API_BASE_URL=http://localhost:8000
```

### 실행
```bash
# 개발 서버 실행
npm start

# 프로덕션 빌드
npm run build

# 테스트 실행
npm test
```

## 📁 프로젝트 구조

```
src/
├── components/          # 재사용 가능한 컴포넌트
│   ├── BedrockChat.js   # AI 챗봇 컴포넌트
│   ├── Footer.js        # 푸터 컴포넌트
│   ├── InputBox.js      # 검색 입력 컴포넌트
│   ├── LoadingOverlay.js # 로딩 오버레이
│   ├── LoginModal.js    # 로그인 모달
│   ├── Sidebar.js       # 사이드바 네비게이션
│   └── SmartVisualization.js # 시각화 컴포넌트
├── pages/               # 페이지 컴포넌트
│   ├── EditorPage.js    # 보고서 편집 페이지
│   ├── MainPage.js      # 메인 페이지
│   └── MyKnowledge.js   # 내 지식 페이지
├── assets/              # 정적 자산
├── App.js               # 메인 앱 컴포넌트
└── index.js             # 앱 진입점
```

## 🔧 주요 컴포넌트 설명

### BedrockChat
- AI 챗봇 인터페이스
- 실시간 메시지 전송/수신
- 스크롤 자동 관리
- 대화 내역 저장

### SmartVisualization
- 데이터 시각화 렌더링
- 차트 및 그래프 표시
- 반응형 디자인

### EditorPage
- 보고서 상세 보기
- 유튜브 영상 임베드
- 챗봇 통합 인터페이스

## 🎯 API 연동

### 주요 엔드포인트
- `POST /api/sync-kb`: 지식베이스 생성
- `GET /api/kb-status/{jobId}`: 지식베이스 상태 확인
- `POST /api/chat`: 챗봇 메시지 전송
- `GET /api/chat-history`: 대화 내역 조회
- `DELETE /api/chat-history`: 대화 내역 삭제

## 🚀 배포

### 빌드
```bash
npm run build
```

### 환경별 설정
- **개발**: `REACT_APP_BACKEND_URL=http://localhost:8000`
- **스테이징**: `REACT_APP_BACKEND_URL=https://staging-api.example.com`
- **프로덕션**: `REACT_APP_BACKEND_URL=https://api.example.com`

## 🤝 기여하기

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 라이선스

이 프로젝트는 MIT 라이선스 하에 배포됩니다.

## 👥 팀

- **AWS CloudSchool** - 프로젝트 개발팀

---

© 2025 AWS CloudSchool. All rights reserved.
