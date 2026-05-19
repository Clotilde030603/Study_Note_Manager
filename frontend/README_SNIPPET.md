# Frontend 설명용 요약

`frontend/`는 Study Note Manager의 Presentation Tier이다.

## 역할

- Nginx가 HTML/CSS/JavaScript 정적 파일을 제공한다.
- 브라우저 JavaScript가 Backend REST API를 호출한다.
- 노트 목록 조회, 작성, 삭제, 검색, 카테고리 필터, 중요 표시 UI를 제공한다.

## 주요 파일

```text
frontend/
├── Dockerfile              # Nginx 기반 frontend 컨테이너 이미지
├── nginx.conf              # 정적 파일 제공 및 /api reverse proxy 설정
├── docker-entrypoint.sh    # API_BASE_URL 환경변수로 env.js 생성
├── env.template.js         # 환경변수 주입 템플릿
├── env.js                  # 로컬 실행 기본 API 주소
├── index.html              # 화면 구조
├── css/style.css           # 깔끔한 과제용 카드 UI 스타일
└── js/app.js               # Backend API 연동 및 화면 렌더링
```

## API 주소 설정

Docker 컨테이너 실행 시 `API_BASE_URL` 환경변수를 사용한다.
기본값은 `/api`이며, Nginx가 `/api` 요청을 backend 컨테이너로 전달한다.

```yaml
environment:
  API_BASE_URL: /api
```

## localhost 접속

Docker Compose에서 다음과 같이 포트를 연결하면 브라우저에서 접속할 수 있다.

```yaml
ports:
  - "8080:80"
```

접속 주소:

```text
http://localhost:8080
```
