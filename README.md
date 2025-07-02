
## 🚀 주요 기능

- **YouTube 영상 분석 결과 시각화 및 편집**
- **AI 챗봇(오른쪽 드로어)과의 대화**
- **대시보드, 에디터, 로그인/회원가입 등 다양한 페이지**
- **세련된 UI/UX, 반응형 디자인**

## 🛠️ 개발 및 실행 방법

1. **의존성 설치**
   ```bash
   cd front
   npm install
   # 또는
   yarn
   ```

2. **개발 서버 실행**
   ```bash
   npm start
   # 또는
   yarn start
   ```
   - 기본적으로 [http://localhost:3000](http://localhost:3000)에서 실행됩니다.

3. **백엔드 연동**
   - `.env` 파일 또는 `package.json`의 `"proxy"` 설정을 통해 API 서버와 연동합니다.
   - 예시: `"proxy": "http://localhost:8000"`

## 💡 개발 팁

- **스타일**: CSS 모듈, styled-components 혼용
- **챗봇 버튼**: `styled-components`로 선언, 항상 화면 우측 하단에 고정
- **채팅 드로어**: 오른쪽에서 슬라이드 인, 에디터와 동시에 사용 가능
- **API 통신**: `axios` 사용, `/api/` 경로로 백엔드와 통신

## 📦 주요 라이브러리

- React
- styled-components
- axios
- react-router-dom
- 기타(상세는 package.json 참고)

## 📝 기타

- **코드 컨벤션**: 함수형 컴포넌트, hooks 기반
- **기여/문의**: Pull Request, Issue, 또는 팀 내 커뮤니케이션 채널 이용

---

> tissue 프론트엔드는 사용자 친화적이고 직관적인 데이터 분석/AI 챗봇 경험을 제공합니다.
