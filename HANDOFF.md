# Study Note Manager HANDOFF

제출 전 다시 실행하거나 확인할 때 보기 위한 간단한 메모입니다. 자세한 설명은 `README.md`, AI 참고 기록은 `AI_PROMPTS.md`를 보면 됩니다.

---

## 1. 프로젝트 상태

- Docker Compose 기반 3-tier 웹서비스
- Presentation Tier: `frontend` / `study-note-frontend`
- Application Tier: `backend` / `study-note-backend`
- Data Tier: `mysql` / `study-note-mysql`
- 주요 기능: 노트 작성, 조회, 수정, 삭제, 검색, 카테고리 필터, 중요 표시

접속 주소:

| 항목 | 주소 |
| --- | --- |
| Frontend | `http://localhost:8080` |
| Backend API | `http://localhost:5001/api` |
| Health Check | `http://localhost:5001/api/health` |
| MySQL host port | `localhost:3307` |

---

## 2. 실행 순서

먼저 로컬 환경변수 파일을 만듭니다. 실제 `.env`는 Git에 넣지 않습니다.

```bash
cp .env.example .env
# DB_PASSWORD, MYSQL_PASSWORD, MYSQL_ROOT_PASSWORD 값을 직접 설정
```

그 다음 실행합니다.

```bash
docker compose config
docker compose up --build -d
docker compose ps
```

현재 설정 기준 포트는 다음과 같습니다.

- frontend: `0.0.0.0:8080->80/tcp`
- backend: `127.0.0.1:5001->5001/tcp`
- mysql: `127.0.0.1:3307->3306/tcp`

종료:

```bash
docker compose down
```

DB를 처음 상태로 다시 만들 때만 사용:

```bash
docker compose down -v
```

`down -v`는 `mysql-data` volume을 삭제하므로 저장된 노트도 같이 없어집니다.

---

## 3. 제출 전 확인 명령

```bash
git status --short
git ls-files | grep '\.env'
docker compose config
cd backend && npm run check
node --check frontend/js/app.js
curl http://localhost:5001/api/health
```

브라우저 확인:

```text
http://localhost:8080
```

---

## 4. 주의할 점

- `.env` 파일은 제출/커밋하지 않습니다.
- `.env.example`, `backend/.env.example`은 예시 파일로만 둡니다.
- backend에서 DB host는 `localhost`가 아니라 Compose 서비스명 `mysql`입니다.
- 비밀번호 환경변수가 비어 있으면 backend 또는 mysql 실행이 실패할 수 있습니다.
- 실행 화면 캡처 또는 시연 영상은 저장소에 넣지 말고 과제 제출물에 별도로 첨부합니다.

---

## 5. 제출 문서

| 파일 | 용도 |
| --- | --- |
| `README.md` | 과제 보고서 메인 문서 |
| `AI_PROMPTS.md` | AI 참고 내역 |
| `HANDOFF.md` | 실행 확인용 간단 메모 |
