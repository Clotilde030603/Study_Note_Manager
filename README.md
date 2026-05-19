# Study Note Manager

Docker Compose 기반 3-tier 학습 노트 관리 웹서비스입니다.

## 포트 구성

| Tier | 서비스 | 컨테이너 내부 포트 | 호스트 외부 포트 | 설명 |
| --- | --- | ---: | ---: | --- |
| Presentation | `frontend` | `80` | `8080` | 웹 화면 접속 |
| Application | `backend` | `5001` | `5001` | Express REST API |
| Data | `mysql` | `3306` | `3307` | MySQL DB 확인용 |

사용자는 아래 주소로 접속합니다.

```text
http://localhost:8080
```

Backend API 상태 확인 주소는 아래와 같습니다.

```text
http://localhost:5001/api/health
```

Frontend의 브라우저 API 요청 경로는 `/api`로 유지합니다. Nginx가 `/api` 요청을 Docker Compose 내부 서비스명 기반 주소인 `http://backend:5001/api/`로 프록시합니다.

## 실행 명령

```bash
cp .env.example .env
docker compose up --build
```

백그라운드 실행:

```bash
docker compose up --build -d
```

중지:

```bash
docker compose down
```

DB 볼륨까지 삭제하고 초기화:

```bash
docker compose down -v
```

## Docker Compose 구조

```text
Browser
  ↓ http://localhost:8080
frontend (Nginx, container port 80)
  ↓ /api reverse proxy
backend (Express, backend:5001)
  ↓ mysql:3306
mysql (host port 3307, volume mysql-data)
```

- `frontend`는 정적 HTML/CSS/JavaScript를 제공합니다.
- `backend`는 Node.js + Express REST API를 제공합니다.
- `mysql`은 `mysql-data` named volume으로 데이터를 유지합니다.
- `depends_on`과 MySQL healthcheck를 사용하고, backend 내부에서도 DB 연결 재시도 로직을 수행합니다.

## 한글 인코딩 및 데이터 초기화 안내

MySQL은 `utf8mb4` 문자셋과 `utf8mb4_unicode_ci` collation으로 실행되도록 설정되어 있습니다.

- MySQL 서버 옵션: `--character-set-server=utf8mb4`, `--collation-server=utf8mb4_unicode_ci`
- Backend DB 연결 charset: `DB_CHARSET=utf8mb4`
- `notes.title`, `notes.content`, `notes.category`: `utf8mb4` 컬럼으로 생성 및 변환
- Express JSON 응답: `application/json; charset=utf-8`

이미 깨진 글자가 저장된 기존 Docker volume이 있다면 아래 명령으로 DB 볼륨을 삭제한 뒤 다시 실행하세요. 이 명령은 기존 MySQL 데이터를 모두 초기화합니다.

```bash
docker compose down -v
docker compose up --build
```

데이터를 유지해야 한다면 MySQL 클라이언트에서 깨진 노트만 삭제할 수도 있습니다.

```bash
docker exec -it study-note-mysql mysql -ustudy_user -pstudy_password study_note_manager
```

```sql
DELETE FROM notes WHERE title LIKE '%?%' OR content LIKE '%?%';
```

## API 명세

Backend 기본 주소는 `http://localhost:5001/api`이며, Frontend에서는 `/api` 경로로 호출합니다.

| Method | Endpoint | 설명 |
| --- | --- | --- |
| `GET` | `/api/health` | API 및 DB 상태 확인 |
| `GET` | `/api/notes` | 노트 목록 조회, 검색/카테고리/중요 필터 지원 |
| `GET` | `/api/notes/search?q=키워드` | 전용 검색 API |
| `GET` | `/api/notes/:id` | 노트 상세 조회 |
| `POST` | `/api/notes` | 새 노트 작성 |
| `PUT` | `/api/notes/:id` | 기존 노트 수정 |
| `PATCH` | `/api/notes/:id/important` | 중요 표시 변경 |
| `DELETE` | `/api/notes/:id` | 노트 삭제 |

### 노트 수정 예시

```bash
curl -X PUT http://localhost:5001/api/notes/1 \
  -H "Content-Type: application/json" \
  -d '{
    "title": "수정된 노트 제목",
    "content": "수정된 노트 내용",
    "category": "Assignment",
    "isImportant": true
  }'
```

Frontend에서는 노트 카드의 `수정` 버튼을 누르면 기존 입력 폼에 노트 내용이 채워지고, 제출 버튼이 `노트 수정`으로 바뀝니다. `수정 취소` 버튼으로 작성 모드로 돌아갈 수 있습니다.
