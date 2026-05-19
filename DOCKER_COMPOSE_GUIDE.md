# Docker Compose 통합 실행 가이드

Study Note Manager는 Docker Compose로 `frontend`, `backend`, `mysql` 3개 컨테이너를 한 번에 실행하는 3-tier 웹서비스이다.

## 실행 명령 예시

```bash
# 1. 환경변수 예시 파일 복사
cp .env.example .env

# 2. 전체 컨테이너 빌드 및 실행
docker compose up --build

# 3. 백그라운드 실행이 필요할 때
docker compose up --build -d

# 4. 로그 확인
docker compose logs -f

# 5. 컨테이너 중지
docker compose down

# 6. DB 볼륨까지 삭제하고 초기화
docker compose down -v
```

## localhost 접속 정보

| 대상 | 주소 | 설명 |
| --- | --- | --- |
| Frontend | `http://localhost:8080` | 사용자가 접속하는 웹 화면 |
| Backend API | `http://localhost:5001/api/health` | API 및 DB 상태 확인 |
| MySQL | `localhost:3307` | DB 클라이언트 확인용 |

## docker-compose 구조 설명

```text
Browser
  ↓ http://localhost:8080
frontend container (Nginx)
  ↓ /api reverse proxy
backend container (Node.js + Express)
  ↓ DB_HOST=mysql 서비스명 기반 접속
mysql container (MySQL 8.0 + mysql-data volume)
```

### frontend 서비스

- `./frontend`의 Dockerfile로 빌드한다.
- 호스트 `8080` 포트를 컨테이너 `80` 포트에 연결한다.
- Nginx가 정적 파일을 제공하고 `/api` 요청을 `backend:5001`으로 전달한다.
- `API_BASE_URL` 환경변수로 브라우저 JavaScript의 API 기본 경로를 설정한다.

### backend 서비스

- `./backend`의 Dockerfile로 빌드한다.
- 호스트 `5001` 포트를 컨테이너 `5001` 포트에 연결한다.
- MySQL에는 `DB_HOST=mysql`처럼 Compose 서비스명으로 접속한다.
- `depends_on`과 MySQL healthcheck를 사용해 mysql 준비 후 시작되도록 구성한다.
- 추가로 backend 내부에서 `DB_CONNECT_RETRIES`, `DB_CONNECT_RETRY_DELAY_MS` 값에 따라 DB 연결을 재시도하므로 MySQL 준비 전 종료되지 않는다.

### mysql 서비스

- `mysql:8.0` 이미지를 사용한다.
- 호스트 `3307` 포트를 컨테이너 `3306` 포트에 연결한다.
- `mysql-data` named volume을 `/var/lib/mysql`에 연결해 데이터가 유지된다.
- `./db/init/01_init.sql`을 `/docker-entrypoint-initdb.d`에 읽기 전용으로 연결해 최초 실행 시 schema와 예시 데이터를 생성한다.

## 컨테이너별 포트

| 서비스 | 컨테이너 포트 | 호스트 포트 기본값 | 환경변수 |
| --- | ---: | ---: | --- |
| `frontend` | `80` | `8080` | `FRONTEND_PORT` |
| `backend` | `5001` | `5001` | `BACKEND_PORT` |
| `mysql` | `3306` | `3307` | `MYSQL_PORT` |

## 내부 통신 방식

Docker Compose 네트워크 `study-note-network` 안에서 서비스명 기반 DNS를 사용한다.

- `frontend` → `backend`: `http://backend:5001`
- `backend` → `mysql`: `mysql:3306`

따라서 컨테이너 내부 코드에서 `localhost`로 다른 컨테이너에 접근하지 않는다.

## 한글 깨짐 초기화 방법

현재 Compose 설정은 MySQL 서버와 Backend 연결 모두 `utf8mb4`를 사용한다. 이전 설정으로 생성된 volume에 깨진 한글 데이터가 남아 있다면 아래처럼 volume을 초기화한 뒤 다시 실행한다.

```bash
docker compose down -v
docker compose up --build
```

주의: `docker compose down -v`는 `mysql-data` 볼륨의 기존 노트 데이터를 삭제한다.
