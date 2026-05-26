# Study Note Manager

Study Note Manager는 강의 노트나 과제 메모를 간단히 관리하기 위해 만든 웹서비스이다.
브라우저에서 노트를 작성하고, 저장된 노트를 조회·수정·삭제할 수 있으며,
검색과 카테고리 필터, 중요 표시 기능도 넣었다.

Docker Compose 과제 조건에 맞추기 위해 화면, API, DB 역할을 각각 다른 컨테이너로 나누었다.
전체 서비스는 `docker compose up --build` 명령으로 함께 실행된다.

---

## 1. 프로젝트 개요

프로젝트명은 Study Note Manager이고, 강의 노트와 과제 메모를 한 곳에서 관리하는 웹서비스를 주제로 정했다. 과제의 핵심 조건은 Docker
Compose 기반으로 최소 3개 이상의 컨테이너를 실행하고, Presentation Tier, Application Tier, Data Tier를 명확하게 구분하는
것이다.

역할은 크게 이렇게 나누었다.

- Presentation Tier는 `frontend` 서비스가 맡는다. Nginx 컨테이너에서 HTML, CSS, JavaScript 정적 파일을 보여 주고,
  브라우저의 `/api` 요청을 backend 컨테이너로 전달한다.
- Application Tier는 `backend` 서비스가 맡는다. Node.js와 Express로 작성한 REST API 서버이며, 노트 생성, 조회, 수정,
  삭제, 검색, 필터 기능을 처리한다.
- Data Tier는 `mysql` 서비스가 맡는다. MySQL 8.0을 사용하며, 노트 데이터를 저장하고 Docker volume을 통해 데이터를 유지한다.

과제 요구사항과 실제 구현을 연결해 보면 다음 정도로 볼 수 있다.

| 과제 요구사항 | 프로젝트 구현 |
| --- | --- |
| 3-tier 웹서비스 구현 | `frontend`, `backend`, `mysql`로 계층 분리 |
| 최소 3개 컨테이너 | Docker Compose 서비스 3개 사용 |
| docker-compose 실행 | `docker compose up --build`로 전체 실행 |
| 계층별 역할 설명 | README에 각 tier와 컨테이너 역할 정리 |
| 데이터 유지 | MySQL named volume `mysql-data` 사용 |

---

## 2. 3-tier 구조 설명

처음에는 화면, API, DB를 한 번에 설명하면 더 간단해 보였지만,
과제의 핵심이 3-tier 분리라서 역할을 분명히 나누는 쪽으로 잡았다.
사용자가 보는 화면은 frontend, 요청 처리는 backend, 데이터 저장은 mysql이 맡도록 분리했다.

### 2.1 Presentation Tier: frontend

Presentation Tier는 `frontend` 컨테이너가 맡는다. 이 컨테이너는 `frontend/Dockerfile`을 통해 Nginx 기반 이미지로
빌드된다. Nginx는 `index.html`, `css/style.css`, `js/app.js` 같은 정적 파일을 제공하며, 사용자는
`http://localhost:8080`으로 접속하여 화면을 사용한다.

프론트엔드 JavaScript는 기본적으로 `/api` 경로로 API 요청을 보낸다. 이 값은 `API_BASE_URL` 환경변수로 설정할 수 있으며, 기본값은
`/api`이다. 브라우저가 `/api`로 요청하면 Nginx가 `frontend/nginx.conf` 설정에 따라 내부 Docker Compose 네트워크의
`backend:5001`로 요청을 프록시한다.

### 2.2 Application Tier: backend

Application Tier는 `backend` 컨테이너가 맡는다. 이 컨테이너는 Node.js 20 기반 이미지에서 Express 서버를 실행한다. 실제 서버
진입점은 `backend/src/server.js`이며, API 설정은 `backend/src/app.js`에 작성되어 있다.

backend에서 사용하는 주요 API는 아래와 같다.

- `GET /api/health`: API 서버와 DB 연결 상태 확인
- `GET /api/notes`: 노트 목록 조회, 검색, 카테고리 필터, 중요 표시 필터
- `GET /api/notes/search?q=키워드`: 검색 전용 API
- `GET /api/notes/:id`: 특정 노트 조회
- `POST /api/notes`: 새 노트 작성
- `PUT /api/notes/:id`: 노트 수정
- `PATCH /api/notes/:id/important`: 중요 표시 변경
- `DELETE /api/notes/:id`: 노트 삭제

backend는 `backend/src/db/pool.js`에서 MySQL connection pool을 만든다.
실행해 보니 DB 컨테이너가 완전히 준비되기 전에 backend가 먼저 연결을 시도할 수 있어서,
일정 횟수 동안 재시도하도록 했다.
Docker Compose에서는 `DB_HOST=mysql`로 설정하여 `localhost`가 아니라 Compose 서비스명으로 DB에 접속한다.

### 2.3 Data Tier: mysql

Data Tier는 `mysql` 컨테이너가 맡는다. 이미지는 `mysql:8.0`을 사용하며, `db/init/01_init.sql` 파일을 통해 초기
데이터베이스와 `notes` 테이블을 생성한다. 테이블에는 제목, 내용, 카테고리, 중요 여부, 생성/수정 시간이 저장된다.

MySQL 데이터는 `mysql-data`라는 Docker named volume에 저장된다.
실제로 컨테이너를 내렸다가 다시 올려도 노트가 남아 있어야 하므로,
DB 데이터는 컨테이너 내부에만 두지 않고 volume에 연결했다.
단, `docker compose down -v`를 실행하면 volume까지 삭제되어 DB 데이터가 초기화된다.

---

## 3. 전체 서비스 흐름

전체 요청 흐름은 이렇게 이어진다.

```text
사용자 브라우저
→ frontend 컨테이너(Nginx, localhost:8080)
→ /api 요청을 backend 컨테이너(Express, backend:5001)로 프록시
→ backend 컨테이너가 mysql 컨테이너(mysql:3306)에 SQL 질의
→ mysql-data volume에 데이터 저장 또는 조회
→ 결과를 JSON으로 반환
→ 브라우저 화면 갱신
```

예를 들어 사용자가 브라우저에서 `http://localhost:8080`으로 접속하면 frontend 컨테이너가 정적 화면을 보여 준다. 사용자가 노트를 생성하거나
조회하면 frontend는 `/api` 경로로 요청을 보내고, Nginx는 해당 요청을 backend 컨테이너로 전달한다. backend는 Express 기반 API
서버로 요청을 처리하며, 필요한 데이터는 Docker Compose 내부 네트워크에서 `mysql` 서비스명으로 MySQL 컨테이너에 접근하여 저장하거나 조회한다.

---

## 4. 컨테이너 역할과 연결 방식

`docker-compose.yml`에는 `frontend`, `backend`, `mysql` 세 개의 서비스가 정의되어 있다. 세 서비스는 모두
`study-note-network`라는 Compose bridge network에 연결된다.

- `frontend` 서비스는 `study-note-frontend` 컨테이너로 실행된다. 호스트의 `8080` 포트를 컨테이너의 `80` 포트에 연결하여 웹
  화면을 보여 준다. 또한 `/api` 요청을 backend 서비스로 넘기는 reverse proxy 역할도 함께 한다.
- `backend` 서비스는 `study-note-backend` 컨테이너로 실행된다. 컨테이너 내부에서는 `5001` 포트로 Express API 서버가
  동작한다. 호스트에서는 `127.0.0.1:5001`로만 접근할 수 있게 바인딩하여 로컬 테스트 범위로 제한했다.
- `mysql` 서비스는 `study-note-mysql` 컨테이너로 실행된다. 컨테이너 내부에서는 `3306` 포트로 MySQL이 동작하며, 호스트에서는
  `127.0.0.1:3307`로만 접근할 수 있게 설정했다. backend 컨테이너는 호스트 포트가 아니라 내부 서비스명 `mysql:3306`으로 DB에
  접근한다.

컨테이너 간 연결에서 중요한 점은 컨테이너 내부에서 `localhost`를 사용하지 않는다는 것이다. Docker Compose 네트워크에서는 서비스명을 DNS
이름처럼 사용할 수 있으므로 frontend는 `backend:5001`로, backend는 `mysql:3306`으로 접근한다.

---

## 5. 사용 포트

기본 포트는 아래 값으로 맞췄다.

| 구분 | 컨테이너 포트 | 호스트 접근 주소 | 용도 |
| --- | ---: | --- | --- |
| frontend | 80 | `http://localhost:8080` | 웹 화면 접속 |
| backend | 5001 | `http://localhost:5001/api` | API 직접 테스트 |
| mysql | 3306 | `localhost:3307` | DB 클라이언트 직접 접속 |

backend와 mysql의 호스트 포트는 `127.0.0.1`에만 바인딩되어 있다. 이는 과제 실행과 로컬 확인에는 충분하지만 외부 네트워크에 불필요하게 노출하지
않기 위한 설정이다.

---

## 6. 주요 설정

### 6.1 Docker Compose 설정

Compose 설정은 `docker-compose.yml`에 모아 두었다. 실행하면서 중요하게 본 설정은 아래 항목들이다.

- `frontend`는 `./frontend` Dockerfile로 빌드한다.
- `backend`는 `./backend` Dockerfile로 빌드한다.
- `mysql`은 `mysql:8.0` 이미지를 사용한다.
- `mysql`에는 healthcheck를 두어 DB가 준비되었는지 확인할 수 있게 했다.
- 실행 중 backend가 DB보다 먼저 뜨면 접속 오류가 날 수 있어서, `backend`는 `depends_on`의 `service_healthy` 조건을 사용했다.
- 세 컨테이너는 `study-note-network` bridge network를 사용한다.
- MySQL 데이터는 `mysql-data` volume에 저장된다.

### 6.2 환경변수 설정

루트의 `.env.example`은 Docker Compose 실행에 필요한 환경변수 예시 파일이다. 실제 실행할 때는 이 파일을 `.env`로 복사한 뒤 비밀번호
placeholder를 로컬에서 사용할 값으로 바꾸어야 한다.

실행 전에 주로 확인할 값은 아래와 같다.

- `FRONTEND_PORT`: frontend 호스트 포트이며 기본값은 `8080`이다.
- `API_BASE_URL`: frontend가 사용할 API 기본 경로이며 기본값은 `/api`이다.
- `BACKEND_PORT`: backend 호스트 포트이며 기본값은 `5001`이다.
- `CORS_ORIGIN`: backend에서 허용할 frontend origin이며 기본값은 `http://localhost:8080`이다.
- `DB_HOST`: backend가 접근할 DB 주소이며 Compose 실행 시 `mysql`을 사용한다.
- `DB_PASSWORD`: backend가 MySQL 사용자로 접속할 때 사용하는 비밀번호이다.
- `MYSQL_ROOT_PASSWORD`: MySQL root 비밀번호이다.
- `MYSQL_PASSWORD`: `MYSQL_USER` 사용자의 비밀번호이다.

`DB_PASSWORD`와 `MYSQL_PASSWORD`는 같은 MySQL 사용자에 대한 값이므로 일반적으로 동일하게 설정한다. 비밀번호 관련 값은
placeholder fallback 없이 환경변수에서 읽도록 구성되어 있으므로, `.env`를 만들지 않거나 비밀번호를 비워 두면 MySQL 또는 backend가
정상적으로 시작하지 못할 수 있다.

backend만 별도로 로컬에서 실행할 경우에는 `backend/.env.example`을 참고할 수 있다. 이 파일에서는 로컬 MySQL 접속을 가정하여
`DB_HOST=localhost` 예시를 넣어 두었다.

---

## 7. 실행 방법

### 7.1 사전 준비

실행 전 Docker Desktop 또는 Docker Engine과 Docker Compose v2가 필요하다. 설치 여부는 다음 명령으로 확인한다.

```bash
docker --version
docker compose version
```

### 7.2 환경변수 파일 생성

먼저 루트 디렉터리에서 `.env.example`을 `.env`로 복사한다.

```bash
cp .env.example .env
```

그 다음 `.env` 파일을 열어 다음 값을 실제 로컬 비밀번호로 바꾼다.

```text
DB_PASSWORD=REPLACE_WITH_STRONG_LOCAL_DB_PASSWORD
MYSQL_ROOT_PASSWORD=REPLACE_WITH_STRONG_LOCAL_ROOT_PASSWORD
MYSQL_PASSWORD=REPLACE_WITH_STRONG_LOCAL_DB_PASSWORD
```

설정이 올바르게 적용되는지 확인하려면 다음 명령을 실행한다.

```bash
docker compose config
```

출력에서 비밀번호 관련 값이 비어 있다면 `.env` 파일을 다시 확인해야 한다.

### 7.3 빌드 및 실행

전체 서비스를 빌드하고 실행하려면 다음 명령을 사용한다.

```bash
docker compose up --build
```

백그라운드에서 실행하려면 다음과 같이 실행한다.

```bash
docker compose up --build -d
```

실행 상태는 다음 명령으로 확인한다.

```bash
docker compose ps
```

정상 실행되면 `frontend`, `backend`, `mysql` 컨테이너가 실행 중이어야 하며, MySQL은 `healthy` 상태로 표시된다.

### 7.4 로그 확인과 종료

전체 로그를 확인하려면 다음 명령을 사용한다.

```bash
docker compose logs -f
```

특정 서비스 로그만 확인할 수도 있다.

```bash
docker compose logs -f backend
docker compose logs -f frontend
docker compose logs -f mysql
```

서비스를 종료할 때는 다음 명령을 사용한다.

```bash
docker compose down
```

DB volume까지 삭제하여 처음 상태로 되돌릴 때만 다음 명령을 사용한다.

```bash
docker compose down -v
```

`down -v`는 `mysql-data` volume을 삭제하므로 저장된 노트도 함께 삭제된다.

---

## 8. 서비스 접속 방법

브라우저에서 다음 주소로 접속한다.

```text
http://localhost:8080
```

API 서버와 DB 연결 상태는 다음 주소에서 확인한다.

```text
http://localhost:5001/api/health
```

명령어로 확인하려면 다음과 같이 실행한다.

```bash
curl http://localhost:5001/api/health
```

정상적으로 연결되면 이런 형태의 응답을 볼 수 있다.

```json
{
  "success": true,
  "status": "ok",
  "database": "connected",
  "timestamp": "2026-05-20T00:00:00.000Z"
}
```

---

## 9. 주요 기능

웹 화면에서 확인할 수 있는 주요 기능은 아래와 같다.

- 노트 작성: 제목, 내용, 카테고리, 중요 여부를 입력하여 새 노트를 저장한다.
- 노트 조회: 저장된 노트를 최신순으로 조회하고, 중요 표시된 노트를 위쪽에 보여준다.
- 노트 수정: 기존 노트를 불러와 제목, 내용, 카테고리, 중요 여부를 수정한다.
- 노트 삭제: 선택한 노트를 삭제하고 목록을 다시 불러온다.
- 검색: 제목 또는 내용에 포함된 키워드로 노트를 찾는다.
- 카테고리 필터: `General`, `Lecture`, `Assignment`, `Exam`, `Project`, `Reading` 등의 카테고리로 필터링한다.
- 중요 표시: 별 아이콘으로 중요 노트를 표시하고, 중요한 노트만 따로 볼 수 있다.
- 반응형 화면: 데스크톱에서는 2-column 형태로, 작은 화면에서는 세로 배치로 표시된다.

---

## 10. 데이터 유지 방식

MySQL 데이터는 Docker named volume인 `mysql-data`에 저장된다. `docker-compose.yml`에서는 MySQL 컨테이너의
`/var/lib/mysql` 경로에 이 volume을 연결한다.

```yaml
volumes:
  - mysql-data:/var/lib/mysql
```

이 설정 덕분에 컨테이너를 종료했다가 다시 실행해도 기존 데이터가 유지된다. 다만 `docker compose down -v`를 실행하면 volume이 삭제되어 DB가 초기화된다.

비밀번호를 변경할 때도 이 점을 주의해야 한다. MySQL은 처음 초기화될 때 사용자와 비밀번호 정보를 volume에 저장한다. 따라서 `.env`에서
`MYSQL_PASSWORD`, `MYSQL_ROOT_PASSWORD`, `DB_PASSWORD`를 변경한 뒤 기존 volume을 그대로 사용하면 backend가
DB에 접속하지 못할 수 있다. 로컬 데이터를 삭제해도 되는 상황이라면 다음 순서로 다시 실행한다.

```bash
docker compose down -v
docker compose up --build -d
```

---

## 11. 실행 결과 캡처 또는 시연 영상 제출 안내

실행 결과 캡처나 시연 영상은 저장소에 직접 넣지 않고 과제 제출 시스템에 별도로 첨부할 예정이다. 제출 시에는 다음 내용을 확인할 수 있도록 준비한다.

- `docker compose up --build -d` 실행 화면
- `docker compose ps`에서 3개 컨테이너가 실행 중이고 MySQL이 healthy인 화면
- `http://localhost:8080` 접속 화면
- 노트 생성 후 목록에 표시되는 화면
- 노트 수정 또는 삭제 기능을 확인할 수 있는 화면
- 검색, 카테고리 필터, 중요 표시 중 하나 이상을 확인할 수 있는 화면
- `http://localhost:5001/api/health` 또는 `curl` 결과로 backend와 DB 연결 상태를 확인한 화면

시연 영상으로 제출하는 경우에는 Compose 실행, 컨테이너 상태 확인, 웹 화면 접속, CRUD 기능, 검색 또는 필터 기능, health check 확인 순서로
보여주면 된다.

---

## 12. 프로젝트 구조

```text
Study_Note_Manager/
├── docker-compose.yml          # 전체 컨테이너 실행 정의
├── .env.example                # Docker Compose 환경변수 예시
├── README.md                   # 과제 보고서 문서
├── AI_PROMPTS.md               # AI 활용 프롬프트 기록
├── HANDOFF.md                  # 실행 및 제출 전 확인 요약
├── backend/                    # Application Tier
│   ├── Dockerfile
│   ├── package.json
│   ├── .env.example
│   └── src/
├── frontend/                   # Presentation Tier
│   ├── Dockerfile
│   ├── nginx.conf
│   ├── index.html
│   ├── css/style.css
│   └── js/app.js
└── db/init/01_init.sql          # Data Tier 초기화 SQL
```

---

## 13. AI 활용 기록

개발 과정에서 AI는 구조 검토, 오류 원인 확인, 문서 초안 정리, 보안 점검에 보조적으로 사용했다. AI가 제안한 내용을 그대로 사용하지 않고, 실제
`docker-compose.yml`, backend/frontend 코드, 실행 결과와 대조한 뒤 필요한 부분만 프로젝트에 맞게 수정했다.

프롬프트 사용 내역은 `AI_PROMPTS.md`에 따로 적어 두었다.

---

## 14. 트러블슈팅

실행하다가 문제가 생기면 아래 항목부터 확인하면 된다.

- `docker compose` 명령이 실패하면 Docker Desktop 또는 Docker daemon이 실행 중인지 확인한다.
- `localhost:8080` 접속이 실패하면 `docker compose ps`와 `docker compose logs frontend`로 frontend
  컨테이너 상태를 확인한다.
- `localhost:5001/api/health`가 실패하면 `docker compose logs backend`와 `docker compose logs
  mysql`로 backend와 DB 연결 상태를 확인한다.
- MySQL은 실행되지만 backend가 DB 접속에 실패하면 기존 `mysql-data` volume에 이전 비밀번호가 저장되어 있을 수 있다. 로컬 데이터
  삭제가 가능하면 `docker compose down -v` 후 다시 실행한다.
- 8080, 5001, 3307 포트를 다른 프로세스가 사용 중이면 `.env`에서 `FRONTEND_PORT`, `BACKEND_PORT`,
  `MYSQL_PORT` 값을 변경한다.

---

## 15. 보안상 주의사항

실제 실행 비밀번호는 `.env.example`이 아니라 로컬 전용 `.env` 파일에만 작성한다. `.env`는 `.gitignore`에 포함되어 있으므로 Git에
커밋하지 않는다.

`.env.example`과 `backend/.env.example`에는 placeholder 값만 두었다. 제출 전에는 다음 명령으로 실제 `.env` 파일이
Git에 포함되지 않았는지 확인한다.

```bash
git ls-files | grep '\.env'
```

정상적으로는 `.env.example`, `backend/.env.example` 같은 예시 파일만 표시되어야 한다.

또한 backend와 mysql의 호스트 포트는 `127.0.0.1`에만 바인딩하여 로컬 실행 범위로 제한했다. CORS도 모든 origin을 허용하지 않고
기본적으로 `http://localhost:8080`만 허용하도록 설정했다.

---

## 16. 제출 전 확인 명령

제출 전에는 다음 명령으로 문서와 실제 실행 설정이 맞는지 확인한다.

```bash
git status --short
git ls-files | grep '\.env'
docker compose config
cd backend && npm run check
node --check ../frontend/js/app.js
```

서비스 실행까지 확인할 경우에는 루트 디렉터리에서 다음 명령을 사용한다.

```bash
docker compose up --build -d
docker compose ps
curl http://localhost:5001/api/health
```

이때 확인할 내용은 다음 항목들이다.

- `frontend`, `backend`, `mysql` 세 컨테이너가 실행되는지 확인한다.
- `http://localhost:8080`에서 웹 화면이 열리는지 확인한다.
- `http://localhost:5001/api/health`에서 DB 연결 상태가 정상인지 확인한다.
- `.env` 파일, `node_modules`, Docker volume, 임시 파일이 Git에 포함되지 않았는지 확인한다.
- 실행 결과 캡처 또는 시연 영상은 저장소가 아니라 과제 제출 시스템에 별도로 첨부한다.

---

## 17. 정리

Study Note Manager는 `frontend`, `backend`, `mysql` 세 컨테이너로 구성한 Docker Compose 기반 3-tier
웹서비스이다. 사용자는 `http://localhost:8080`에서 노트를 관리하고, frontend는 `/api` 요청을 backend로 전달하며,
backend는 MySQL에 데이터를 저장하거나 조회한다.

README에는 과제에서 요구한 3-tier 구분, 컨테이너 역할, 연결 방식, 포트 정보,
주요 설정, 실행 방법, AI 활용 기록을 정리해 두었다.
실행 결과 캡처나 시연 영상에서는 컨테이너 실행 상태, 웹 화면 접속,
CRUD 동작, health check 결과를 함께 보여 주면 된다.
