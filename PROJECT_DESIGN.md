# Study Note Manager 프로젝트 구조 설계

Docker Compose 기반 3-tier 웹서비스 과제를 위한 `Study Note Manager` 설계안이다.

## 1. 전체 폴더 구조

```text
Study_Note_Manager/
├── docker-compose.yml
├── README.md
├── AI_PROMPTS.md
├── .env.example
├── frontend/                    # Presentation Tier
│   ├── Dockerfile
│   ├── nginx.conf
│   ├── index.html
│   ├── css/
│   │   └── style.css
│   └── js/
│       └── app.js
├── backend/                     # Application Tier
│   ├── Dockerfile
│   ├── package.json
│   ├── package-lock.json
│   └── src/
│       ├── server.js
│       ├── config/
│       │   └── db.js
│       ├── routes/
│       │   └── notes.js
│       ├── controllers/
│       │   └── noteController.js
│       └── models/
│           └── noteModel.js
└── db/                          # Data Tier
    └── init/
        └── 01_init.sql
```

### 구조 의도

- `frontend/`: 정적 웹 페이지와 브라우저 JavaScript를 제공한다.
- `backend/`: Express API 서버로 비즈니스 로직과 DB 접근을 담당한다.
- `db/`: MySQL 초기화 SQL을 보관한다.
- `docker-compose.yml`: 3개 컨테이너를 한 번에 실행한다.
- `README.md`: 실행 방법, API, 구조 설명을 문서화한다.
- `AI_PROMPTS.md`: AI 활용 과정과 사용 프롬프트를 기록한다.

## 2. frontend / backend / db 컨테이너 역할

| Tier | 컨테이너명 | 기술 | 역할 |
| --- | --- | --- | --- |
| Presentation Tier | `frontend` | Nginx + HTML/CSS/JS | 사용자 화면 제공, 검색/작성/삭제 UI, Backend API 호출 |
| Application Tier | `backend` | Node.js + Express | REST API 제공, 요청 검증, MySQL 쿼리 실행 |
| Data Tier | `db` | MySQL | 노트 데이터 영구 저장, 초기 테이블 생성 |

### 컨테이너별 책임 분리

- `frontend`는 DB에 직접 접근하지 않는다.
- `backend`만 MySQL에 접근한다.
- `db`는 외부 사용자가 직접 쓰는 서비스가 아니라 내부 데이터 저장소 역할을 한다.

## 3. API 목록

Base URL 예시:

- 브라우저 기준: `http://localhost:5001/api`
- Docker 내부 기준: `http://backend:5001/api`

| Method | Endpoint | 설명 | Query / Body |
| --- | --- | --- | --- |
| `GET` | `/api/health` | Backend 상태 확인 | 없음 |
| `GET` | `/api/notes` | 노트 목록 조회 | `search`, `category`, `important` 선택 |
| `GET` | `/api/notes/:id` | 특정 노트 상세 조회 | path: `id` |
| `POST` | `/api/notes` | 노트 작성 | `title`, `content`, `category`, `isImportant` |
| `DELETE` | `/api/notes/:id` | 노트 삭제 | path: `id` |
| `PATCH` | `/api/notes/:id/important` | 중요 표시 변경 | `isImportant` |

### 요청/응답 예시

#### 노트 작성

```http
POST /api/notes
Content-Type: application/json
```

```json
{
  "title": "Docker Compose 정리",
  "content": "frontend, backend, db를 compose로 실행한다.",
  "category": "Docker",
  "isImportant": true
}
```

#### 노트 목록 조회

```http
GET /api/notes?search=docker&category=Docker&important=true
```

```json
[
  {
    "id": 1,
    "title": "Docker Compose 정리",
    "content": "frontend, backend, db를 compose로 실행한다.",
    "category": "Docker",
    "isImportant": true,
    "createdAt": "2026-05-19T10:00:00.000Z",
    "updatedAt": "2026-05-19T10:00:00.000Z"
  }
]
```

## 4. DB schema 설계

Database 이름: `study_note_manager`

```sql
CREATE DATABASE IF NOT EXISTS study_note_manager
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE study_note_manager;

CREATE TABLE IF NOT EXISTS notes (
  id INT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(120) NOT NULL,
  content TEXT NOT NULL,
  category VARCHAR(50) NOT NULL DEFAULT 'General',
  is_important BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  INDEX idx_notes_category (category),
  INDEX idx_notes_important (is_important),
  FULLTEXT INDEX ft_notes_search (title, content)
);
```

### 컬럼 설명

| 컬럼 | 타입 | 설명 |
| --- | --- | --- |
| `id` | `INT` | 노트 고유 ID |
| `title` | `VARCHAR(120)` | 노트 제목 |
| `content` | `TEXT` | 노트 내용 |
| `category` | `VARCHAR(50)` | 카테고리 |
| `is_important` | `BOOLEAN` | 중요 표시 여부 |
| `created_at` | `TIMESTAMP` | 생성 시간 |
| `updated_at` | `TIMESTAMP` | 수정 시간 |

## 5. docker-compose 구조

```yaml
services:
  frontend:
    build: ./frontend
    container_name: study-note-frontend
    ports:
      - "8080:80"
    depends_on:
      - backend
    networks:
      - study-note-network

  backend:
    build: ./backend
    container_name: study-note-backend
    ports:
      - "5001:5001"
    environment:
      DB_HOST: db
      DB_PORT: 3306
      DB_USER: study_user
      DB_PASSWORD: study_password
      DB_NAME: study_note_manager
      PORT: 5001
    depends_on:
      - db
    networks:
      - study-note-network

  db:
    image: mysql:8.0
    container_name: study-note-db
    restart: always
    environment:
      MYSQL_ROOT_PASSWORD: root_password
      MYSQL_DATABASE: study_note_manager
      MYSQL_USER: study_user
      MYSQL_PASSWORD: study_password
    ports:
      - "3307:3306"
    volumes:
      - mysql-data:/var/lib/mysql
      - ./db/init:/docker-entrypoint-initdb.d
    networks:
      - study-note-network

volumes:
  mysql-data:

networks:
  study-note-network:
    driver: bridge
```

### Compose 설계 포인트

- 최소 3개 컨테이너 조건을 `frontend`, `backend`, `db`로 충족한다.
- 전체 서비스는 `docker compose up --build` 한 번으로 실행된다.
- 사용자는 `http://localhost:8080`으로 접속한다.
- Backend API는 개발/확인용으로 `http://localhost:5001`에도 노출한다.

## 6. 컨테이너 간 연결 방식

Docker Compose의 기본 DNS를 사용한다.

```text
Browser
  ↓ localhost:8080
frontend container
  ↓ http://backend:5001/api 또는 /api reverse proxy
backend container
  ↓ mysql://study_user:study_password@db:3306/study_note_manager
db container
```

### 연결 규칙

- `frontend -> backend`: Compose 네트워크 안에서 서비스명 `backend`로 접근한다.
- `backend -> db`: 환경변수 `DB_HOST=db`를 사용한다.
- `db -> 외부`: 일반 사용 흐름에서는 외부 접근이 필요 없다. 과제 확인 편의를 위해 `localhost:3307` 포트를 열 수 있다.

### 권장 frontend API 호출 방식

Nginx reverse proxy를 사용해 브라우저에서는 같은 origin으로 호출한다.

```text
브라우저: http://localhost:8080/api/notes
Nginx: /api/* 요청을 http://backend:5001/api/* 로 프록시
```

이 방식은 CORS 설정을 줄이고 3-tier 구조를 명확히 보여준다.

## 7. 포트 구성

| 서비스 | 컨테이너 내부 포트 | 호스트 포트 | 접속 목적 |
| --- | ---: | ---: | --- |
| `frontend` | `80` | `8080` | 웹 화면 접속 |
| `backend` | `5001` | `5001` | API 직접 테스트 |
| `db` | `3306` | `3307` | DB 확인/디버깅 |

최종 사용자 접속 주소:

```text
http://localhost:8080
```

API 확인 주소:

```text
http://localhost:5001/api/health
http://localhost:5001/api/notes
```

## 8. README 구성안

```text
README.md
├── 1. 프로젝트 소개
├── 2. 과제 조건 충족 사항
│   ├── 3-tier 구조 설명
│   ├── 컨테이너 3개 이상 사용
│   ├── docker-compose 실행
│   └── localhost 접속 주소
├── 3. 기술 스택
├── 4. 전체 폴더 구조
├── 5. 시스템 아키텍처
├── 6. 실행 방법
│   ├── 사전 준비: Docker Desktop
│   ├── .env 설정 또는 기본 환경변수
│   ├── docker compose up --build
│   └── docker compose down -v
├── 7. 컨테이너 및 포트 설명
├── 8. 주요 기능
├── 9. API 명세
├── 10. DB schema
├── 11. 실행 흐름도
├── 12. 테스트 방법
│   ├── 웹 화면 테스트
│   ├── curl API 테스트
│   └── MySQL 데이터 확인
└── 13. AI 활용 기록 안내
```

### AI_PROMPTS.md 구성안

```text
AI_PROMPTS.md
├── 1. AI 사용 목적
├── 2. 프로젝트 구조 설계 프롬프트
├── 3. Docker Compose 작성 프롬프트
├── 4. Backend API 구현 프롬프트
├── 5. Frontend UI 구현 프롬프트
├── 6. DB schema 설계 프롬프트
├── 7. 오류 해결 프롬프트
└── 8. AI 결과 검토 및 수정 내용
```

## 9. 실행 흐름도

### 서비스 실행 흐름

```text
1. 사용자 명령 실행
   docker compose up --build

2. Docker Compose가 네트워크와 볼륨 생성
   study-note-network
   mysql-data

3. db 컨테이너 시작
   MySQL 8.0 실행
   db/init/01_init.sql 실행
   notes 테이블 생성

4. backend 컨테이너 시작
   Node.js Express 서버 실행
   DB_HOST=db 로 MySQL 연결
   /api 엔드포인트 준비

5. frontend 컨테이너 시작
   Nginx 실행
   HTML/CSS/JS 정적 파일 제공
   /api 요청을 backend로 전달

6. 사용자가 localhost 접속
   http://localhost:8080
```

### 기능 요청 흐름

```text
[사용자]
  │
  │ 1. http://localhost:8080 접속
  ▼
[frontend: Nginx + HTML/CSS/JS]
  │
  │ 2. fetch('/api/notes')
  ▼
[backend: Express]
  │
  │ 3. SELECT / INSERT / DELETE SQL 실행
  ▼
[db: MySQL]
  │
  │ 4. 결과 반환
  ▼
[backend: Express]
  │
  │ 5. JSON 응답
  ▼
[frontend]
  │
  │ 6. 화면 갱신
  ▼
[사용자]
```

### 주요 기능별 흐름

#### 노트 작성

```text
입력 폼 작성 → POST /api/notes → INSERT INTO notes → 작성된 노트 반환 → 목록 갱신
```

#### 노트 목록 조회

```text
페이지 로드 → GET /api/notes → SELECT * FROM notes ORDER BY created_at DESC → 목록 렌더링
```

#### 노트 삭제

```text
삭제 버튼 클릭 → DELETE /api/notes/:id → DELETE FROM notes WHERE id=? → 목록 재조회
```

#### 카테고리/중요/검색 필터

```text
필터 선택 또는 검색어 입력
→ GET /api/notes?category=...&important=...&search=...
→ WHERE 조건으로 조회
→ 필터링된 목록 렌더링
```

## 요구사항 충족 체크리스트

| 요구사항 | 설계 반영 |
| --- | --- |
| Presentation Tier | `frontend` 컨테이너 |
| Application Tier | `backend` 컨테이너 |
| Data Tier | `db` 컨테이너 |
| 최소 3개 컨테이너 | `frontend`, `backend`, `db` |
| docker-compose 기반 실행 | `docker-compose.yml` 설계 포함 |
| localhost 접속 | `http://localhost:8080` |
| README.md 고려 | README 구성안 포함 |
| AI_PROMPTS.md 고려 | AI_PROMPTS 구성안 포함 |
| 노트 작성 | `POST /api/notes`, `notes` table |
| 노트 목록 조회 | `GET /api/notes` |
| 노트 삭제 | `DELETE /api/notes/:id` |
| 카테고리 선택 | `category` 컬럼 및 query filter |
| 중요 표시 | `is_important` 컬럼 및 API |
| 검색 기능 | `search` query, FULLTEXT index |
