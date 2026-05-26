# Study Note Manager HANDOFF

제출 전에 다시 실행하거나 빠르게 확인하려고 남겨 둔 메모이다. 자세한 설명은 `README.md`, AI 사용 기록은 `AI_PROMPTS.md`를 보면 된다.

---

## 1. 현재 프로젝트 상태

Study Note Manager는 Docker Compose 기반 3-tier 웹서비스이다. Presentation Tier는 `frontend` 컨테이너,
Application Tier는 `backend` 컨테이너, Data Tier는 `mysql` 컨테이너가 담당한다.

컨테이너별 역할은 아래처럼 정리했다.

- `frontend` / `study-note-frontend`: Nginx로 웹 화면을 제공하고 `/api` 요청을 backend로 프록시한다.
- `backend` / `study-note-backend`: Express API 서버로 노트 CRUD, 검색, 필터, 중요 표시 기능을 처리한다.
- `mysql` / `study-note-mysql`: MySQL 8.0 DB로 노트 데이터를 저장하고 `mysql-data` volume으로 데이터를 유지한다.

주로 확인할 주소는 아래와 같다.

- Frontend: `http://localhost:8080`
- Backend API: `http://localhost:5001/api`
- Health Check: `http://localhost:5001/api/health`
- MySQL host port: `localhost:3307`

---

## 2. 실행 순서

먼저 로컬 환경변수 파일을 만든다. 실제 `.env`는 Git에 넣지 않는다.

```bash
cp .env.example .env
```

`.env` 파일에서 다음 값을 실제 로컬 비밀번호로 바꾼다.

```text
DB_PASSWORD=REPLACE_WITH_STRONG_LOCAL_DB_PASSWORD
MYSQL_PASSWORD=REPLACE_WITH_STRONG_LOCAL_DB_PASSWORD
MYSQL_ROOT_PASSWORD=REPLACE_WITH_STRONG_LOCAL_ROOT_PASSWORD
```

그 다음 루트 디렉터리에서 다음 순서로 실행한다.

```bash
docker compose config
docker compose up --build -d
docker compose ps
```

기본 포트는 아래처럼 잡아 두었다.

- frontend: `0.0.0.0:8080->80/tcp`
- backend: `127.0.0.1:5001->5001/tcp`
- mysql: `127.0.0.1:3307->3306/tcp`

서비스 종료는 다음 명령을 사용한다.

```bash
docker compose down
```

DB를 처음 상태로 다시 만들 때만 다음 명령을 사용한다.

```bash
docker compose down -v
```

`down -v`는 `mysql-data` volume을 삭제하므로 저장된 노트도 함께 삭제된다.

---

## 3. 제출 전 확인 명령

제출 전에는 다음 명령으로 파일 상태와 기본 문법을 확인한다.

```bash
git status --short
git ls-files | grep '\.env'
docker compose config
cd backend && npm run check
node --check ../frontend/js/app.js
```

서비스까지 실행한 상태에서는 다음 항목을 확인한다.

```bash
curl http://localhost:5001/api/health
```

브라우저에서는 다음 주소를 확인한다.

```text
http://localhost:8080
```

---

## 4. 주의할 점

- `.env` 파일은 제출하거나 커밋하지 않는다.
- `.env.example`, `backend/.env.example`은 예시 파일로만 둔다.
- Docker Compose 실행 시 backend의 DB host는 `localhost`가 아니라 서비스명 `mysql`이다.
- 비밀번호 환경변수가 비어 있으면 MySQL 또는 backend 실행이 실패할 수 있다.
- 기존 `mysql-data` volume이 남아 있는 상태에서 DB 비밀번호를 바꾸면 접속 오류가 날 수 있다.
- 실행 화면 캡처 또는 시연 영상은 저장소에 넣지 말고 과제 제출 시스템에 별도로 첨부한다.

---

## 5. 제출 문서

제출 전에 확인할 문서는 이 세 가지다.

- `README.md`: 과제 보고서 메인 문서이다. 3-tier 구조, 컨테이너 역할, 연결 방식, 포트, 주요 설정, 실행 방법을 설명한다.
- `AI_PROMPTS.md`: AI를 어떤 목적으로 사용했고 어떤 내용을 프로젝트에 맞게 적용했는지 정리한 문서이다.
- `HANDOFF.md`: 제출 전 실행과 검증을 빠르게 확인하기 위한 메모이다.

세 문서는 Markdown 원문으로 열어 봐도 읽기 어렵지 않도록 문장 중심으로 정리했다.
