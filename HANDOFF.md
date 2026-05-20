# Study Note Manager HANDOFF

이 문서는 제출 전후에 프로젝트를 다시 실행하거나 확인할 때 필요한 최소 정보만 정리한 인수인계 문서입니다. 자세한 과제 보고서는 `README.md`, AI 활용 기록은 `AI_PROMPTS.md`를 기준으로 확인합니다.

---

## 1. 현재 상태

| 항목 | 내용 |
| --- | --- |
| 구조 | Docker Compose 기반 3-tier 웹서비스 |
| Presentation Tier | `frontend` / `study-note-frontend` |
| Application Tier | `backend` / `study-note-backend` |
| Data Tier | `mysql` / `study-note-mysql` |
| Frontend 주소 | `http://localhost:8080` |
| Backend API | `http://localhost:5001/api` |
| MySQL host port | `localhost:3307` |
| 데이터 저장 | Docker named volume `mysql-data` |

구현된 기능은 노트 작성, 조회, 수정, 삭제(CRUD), 검색, 카테고리 필터, 중요 표시입니다.

---

## 2. 실행 방법

```bash
cp .env.example .env
docker compose up --build -d
docker compose ps
```

정상 실행 시 다음 컨테이너가 실행됩니다.

- `study-note-frontend`: `0.0.0.0:8080->80/tcp`
- `study-note-backend`: `0.0.0.0:5001->5001/tcp`
- `study-note-mysql`: `0.0.0.0:3307->3306/tcp`, healthy

종료:

```bash
docker compose down
```

DB까지 초기화해야 할 때만 다음 명령을 사용합니다.

```bash
docker compose down -v
```

`down -v`는 `mysql-data` volume을 삭제하므로 저장된 노트도 함께 삭제됩니다.

---

## 3. 확인 명령

```bash
docker compose config
cd backend && npm run check
node --check frontend/js/app.js
curl http://localhost:5001/api/health
```

Frontend 화면은 브라우저에서 다음 주소로 확인합니다.

```text
http://localhost:8080
```

---

## 4. 제출 전 주의사항

- `.env` 파일은 Git에 포함하지 않습니다.
- 제출용 환경변수 예시는 `.env.example`, `backend/.env.example`만 사용합니다.
- `node_modules`, Docker volume, `.DS_Store`, `.omx` 같은 로컬 파일은 제출하지 않습니다.
- backend 컨테이너에서 DB host는 `localhost`가 아니라 Compose 서비스명인 `mysql`입니다.
- 포트 기준은 README와 동일하게 frontend `8080`, backend `5001`, mysql `3307`입니다.
- 실행 화면 캡처 또는 시연 영상은 저장소에 포함하지 않고 과제 제출물에 별도 첨부하면 됩니다.

---

## 5. 문서 기준

| 문서 | 용도 |
| --- | --- |
| `README.md` | 과제 보고서 메인 문서 |
| `AI_PROMPTS.md` | AI 사용 내역 정리 |
| `HANDOFF.md` | 실행 및 제출 전 확인용 요약 |
| 실행 결과 캡처 또는 시연 영상 | 과제 제출물에 별도 첨부 |

제출 시에는 보통 `README.md`와 `AI_PROMPTS.md`를 중심으로 확인하면 됩니다.
