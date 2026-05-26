# AI 프롬프트 사용 내역

이 문서는 Study Note Manager를 만들면서 ChatGPT를 참고한 내용을 과제 제출용으로 정리한 기록이다. 주제 선정, 3-tier 구조 선택, 코드 수정, 실행 테스트는 직접 진행했고, ChatGPT는 구조를 확인하거나 막힌 부분의 방향을 잡을 때 보조로 사용했다.

ChatGPT 답변은 바로 붙여 넣기보다는 `docker-compose.yml`, backend/frontend 코드, 실행 결과와 맞는지 다시 확인한 뒤 필요한 부분만 프로젝트에 맞게 적용했다. 실제 비밀번호나 토큰 같은 민감정보는 기록하지 않고 placeholder만 사용했다.

---

## 1. AI 사용 방식

이 프로젝트에서 ChatGPT는 주로 이런 용도로 사용했다.

- Docker Compose 기반 3-tier 구조가 과제 조건에 맞는지 검토
- frontend, backend, mysql의 역할 분리 방식 확인
- Express API와 MySQL 테이블 구성 초안 검토
- Nginx reverse proxy와 컨테이너 간 연결 방식 점검
- 실행 중 발생할 수 있는 DB 연결 문제와 healthcheck 설정 확인
- README와 제출 문서의 항목 누락 여부 점검
- 보안상 민감정보 노출 가능성 확인

답변을 참고할 때는 아래 내용을 기준으로 다시 확인했다.

- Compose 서비스명과 포트가 실제 `docker-compose.yml`과 일치하는지 확인했다.
- backend API 경로가 실제 route 파일과 일치하는지 확인했다.
- DB 접속 주소가 `localhost`가 아니라 Compose 서비스명 `mysql`인지 확인했다.
- `.env` 파일은 Git에 포함하지 않고, `.env.example`에는 placeholder만 남겼다.
- UI와 CRUD 동작은 브라우저와 `curl`로 직접 확인했다.

---

## 2. 주요 프롬프트 기록

### 프롬프트 1. 3-tier 구조 방향 검토

- 사용 도구: ChatGPT
- 사용 목적: 프로젝트 주제와 3-tier 구조 방향을 잡기 위해 사용했다.
- 실제 사용 프롬프트:

```text
Study Note Manager를 Docker Compose 기반 3-tier 구조로 구성하려면
frontend/backend/database 역할을 어떻게 나누면 좋을지 검토해줘.
```

- 결과 요약: frontend, backend, mysql로 계층을 나누는 방향을 참고했다.
- 적용한 내용: 실제 서비스명을 `frontend`, `backend`, `mysql`로 정하고 README에 계층별 역할을 적었다.
- 확인한 내용: 과제 요구사항과 `docker-compose.yml` 구조를 직접 비교하여 수정했다.

### 프롬프트 2. 폴더 구조 초안 참고

- 사용 도구: ChatGPT
- 사용 목적: 학습 노트 관리 프로젝트에 필요한 기본 폴더 구조를 검토하기 위해 사용했다.
- 실제 사용 프롬프트:

```text
학습 노트 관리 프로젝트에 필요한 폴더 구조 초안을 제안해줘.
```

- 결과 요약: `frontend/`, `backend/`, `db/init/`처럼 역할별로 나누는 예시를 참고했다.
- 적용한 내용: 현재 폴더 구조에 맞게 Dockerfile, SQL 초기화 파일, 문서 위치를 잡았다.
- 확인한 내용: 불필요한 폴더는 만들지 않고 필요한 구조만 사용했다.

### 프롬프트 3. Express API 구성 참고

- 사용 도구: ChatGPT
- 사용 목적: Node.js와 Express 기반 REST API 구조를 잡기 위해 사용했다.
- 실제 사용 프롬프트:

```text
Node.js와 Express로 노트 관리 REST API 구조 초안을 제안해줘.
```

- 결과 요약: routes, controller, DB pool을 나누는 방식을 참고했다.
- 적용한 내용: `/api/health`, `/api/notes` 중심으로 backend를 구성했다.
- 확인한 내용: 실제 endpoint는 `curl`과 코드 확인으로 검증했다.

### 프롬프트 4. MySQL 테이블 구성 검토

- 사용 도구: ChatGPT
- 사용 목적: 노트 데이터를 저장하기 위한 테이블 구성을 검토하기 위해 사용했다.
- 실제 사용 프롬프트:

```text
MySQL에 노트 데이터를 저장하려면 어떤 테이블 구조가 적절한지 검토해줘.
```

- 결과 요약: 제목, 내용, 카테고리, 중요 여부, 생성/수정 시간 컬럼 아이디어를 참고했다.
- 적용한 내용: `db/init/01_init.sql`의 `notes` 테이블 구성에 적용했다.
- 확인한 내용: backend에서 사용하는 필드명과 맞도록 직접 수정했다.

### 프롬프트 5. 화면 구성과 UI 수정 참고

- 사용 도구: ChatGPT
- 사용 목적: 노트 작성 폼과 목록 화면의 기본 UI 구성을 참고하기 위해 사용했다.
- 실제 사용 프롬프트:

```text
HTML/CSS/JavaScript로 노트 작성 폼과 목록 화면의
기본 UI 구성 방향을 제안해줘.
```

- 결과 요약: 폼, 목록, 검색창, 필터 영역 구성 아이디어를 참고했다.
- 적용한 내용: `frontend/index.html`, `frontend/css/style.css`, `frontend/js/app.js`에 화면과 기능을
  연결했다.
- 확인한 내용: 화면에서 직접 입력, 수정, 삭제 흐름을 확인했다.

### 프롬프트 6. Docker Compose 연결 확인

- 사용 도구: ChatGPT
- 사용 목적: frontend, backend, mysql을 Compose로 묶는 설정을 점검하기 위해 사용했다.
- 실제 사용 프롬프트:

```text
frontend, backend, mysql을 docker-compose로 묶을 때 설정을 점검해줘.
```

- 결과 요약: bridge network, depends_on, volume, healthcheck 설정 방향을 참고했다.
- 적용한 내용: `docker-compose.yml`에 세 서비스와 `mysql-data` volume을 구성했다.
- 확인한 내용: `docker compose config`와 실행 테스트로 확인했다.

### 프롬프트 7. Nginx proxy 설정 확인

- 사용 도구: ChatGPT
- 사용 목적: frontend의 `/api` 요청을 backend 컨테이너로 전달하는 설정을 확인하기 위해 사용했다.
- 실제 사용 프롬프트:

```text
frontend에서 `/api`로 요청하면 backend 컨테이너로 전달되도록
Nginx 설정을 점검해줘.
```

- 결과 요약: `/api/` 요청을 backend 서비스명으로 넘기는 reverse proxy 방식을 참고했다.
- 적용한 내용: `frontend/nginx.conf`에 `proxy_pass http://backend:5001/api/;` 설정을 작성했다.
- 확인한 내용: 브라우저와 `curl`로 frontend/backend 연결을 확인했다.

### 프롬프트 8. DB 준비 전 backend 실행 문제 확인

- 사용 도구: ChatGPT
- 사용 목적: MySQL 준비 전에 backend가 먼저 실행되어 실패하는 문제를 줄이기 위해 사용했다.
- 실제 사용 프롬프트:

```text
MySQL이 준비되기 전에 backend가 먼저 실행되어 실패하는 문제를 줄이는
방법을 알려줘.
```

- 결과 요약: MySQL healthcheck와 backend DB retry 로직 방향을 참고했다.
- 적용한 내용: Compose healthcheck와 backend DB 연결 재시도 로직을 적용했다.
- 확인한 내용: `docker compose ps`와 `/api/health`로 확인했다.

### 프롬프트 9. README 보고서 항목 확인

- 사용 도구: ChatGPT
- 사용 목적: 과제 보고서 형식의 README에 필요한 항목을 확인하기 위해 사용했다.
- 실제 사용 프롬프트:

```text
README를 과제 보고서 형식으로 정리할 때 어떤 항목이 필요한지 알려줘.
```

- 결과 요약: 3-tier 설명, 포트, 실행 방법, 흐름 설명 등 필요한 항목을 참고했다.
- 적용한 내용: README에 프로젝트 개요, 구조, 흐름, 포트, 실행 방법을 넣었다.
- 확인한 내용: 실제 설정과 다르지 않도록 `docker-compose.yml`과 코드를 계속 대조했다.

### 프롬프트 10. 공개 저장소 기준 보안 점검

- 사용 도구: ChatGPT
- 사용 목적: 공개 GitHub 저장소 기준으로 환경변수와 DB 비밀번호 노출 문제를 점검하기 위해 사용했다.
- 실제 사용 프롬프트:

```text
공개 GitHub 저장소 기준으로 환경변수와 DB 비밀번호 노출 문제가 있는지
점검하고, 안전하게 관리할 방향을 알려줘.
```

- 결과 요약: 비밀번호 예시값, `.env` 추적 여부, README 안내를 점검하는 방향을 참고했다.
- 적용한 내용: `.env.example` placeholder 정리, `.env` 비추적 확인, README 보안 안내 보완에 적용했다.
- 확인한 내용: `grep`과 Git 추적 상태로 확인했다.

### 프롬프트 11. Compose와 backend 보안 설정 보완

- 사용 도구: ChatGPT
- 사용 목적: 과제와 로컬 실행 흐름을 유지하면서 보안상 점검할 설정을 확인하기 위해 사용했다.
- 실제 사용 프롬프트:

```text
Study_Note_Manager 레포에서 과제/로컬 실행 흐름을 깨지 않는 범위로
보안상 점검해야 할 설정과 수정 방향을 정리해줘.
```

- 결과 요약: 포트 바인딩, CORS, Dockerfile non-root 실행 등을 점검하는 방향을 참고했다.
- 적용한 내용: 검토 결과를 바탕으로 backend/mysql 로컬 바인딩, CORS `*` 제거, Dockerfile 개선 사항을 직접 적용했다.
- 확인한 내용: build, up, curl 테스트로 확인했다.

### 프롬프트 12. 최종 과제 기준 점검

- 사용 도구: ChatGPT
- 사용 목적: 프로젝트가 3-tier Docker Compose 과제 평가 기준을 충족하는지 확인하기 위해 사용했다.
- 실제 사용 프롬프트:

```text
Study_Note_Manager 프로젝트가 3-tier Docker Compose 과제 평가 기준을 충족하는지
점검하고, README나 문서, 설정에서 부족한 부분이 있으면 보완 방향을 알려줘.
```

- 결과 요약: README, AI 기록, 캡처 안내 등 제출 전 확인 항목을 정리하는 데 참고했다.
- 적용한 내용: README와 AI_PROMPTS를 과제 기준에 맞게 다듬었다.
- 확인한 내용: 실제 실행 테스트 결과와 비교했다.

### 프롬프트 13. 최종 실행 테스트 보조

- 사용 도구: ChatGPT
- 사용 목적: 최종 실행 테스트 순서와 제출 전 보완사항을 확인하기 위해 사용했다.
- 실제 사용 프롬프트:

```text
Study_Note_Manager 프로젝트의 최종 실행 테스트 순서와
3-tier Docker Compose 과제 요구사항 충족 여부를 점검해줘.
```

- 결과 요약: config, build, up, health, CRUD curl 테스트 순서를 정리하는 데 참고했다.
- 적용한 내용: 최종 검증 명령과 제출 전 체크리스트를 문서에 적어 두었다.
- 확인한 내용: 명령을 직접 실행한 뒤 결과를 확인했다.

### 프롬프트 14. 환경변수 설정 보안 점검

- 사용 도구: ChatGPT
- 사용 목적: 보안 점검 결과를 기준으로 환경변수 fallback 설정에서 확인할 부분을 검토하기 위해 사용했다.
- 실제 사용 프롬프트:

```text
보안 점검 결과를 기준으로 환경변수 fallback 설정에서
수정이 필요한 부분과 안전한 설정 방향을 알려줘.
```

- 결과 요약: 비밀번호 fallback을 줄이고 필수 환경변수 오류 처리를 명확히 하는 방향을 참고했다.
- 적용한 내용: 검토 결과를 바탕으로 Compose 비밀번호 fallback 제거, backend `DB_PASSWORD` 필수 검증, README 안내
  추가를 직접 적용했다.
- 확인한 내용: `docker compose config`, `grep`, backend check로 확인했다.

---

## 3. 실제 반영 방식

ChatGPT는 설계나 문서 방향을 확인하는 용도로 사용했다. 특히 Docker Compose 구조, API 경로, 환경변수, 보안 설정은 답변만 보고 넘기지 않고 실제 파일과 실행 결과를 기준으로 다시 맞춰 보았다.

문서를 정리하면서는 특히 아래 내용을 다시 맞춰 보았다.

- README의 포트 설명이 `docker-compose.yml`과 일치하는지 확인했다.
- frontend의 `/api` 요청 흐름이 `frontend/nginx.conf`와 맞는지 확인했다.
- backend API 설명이 `backend/src/routes/noteRoutes.js`와 맞는지 확인했다.
- DB 연결 설명이 `backend/src/db/pool.js`와 `.env.example` 설정에 맞는지 확인했다.
- 제출 문서에는 실제 비밀번호를 넣지 않고 placeholder만 사용했다.

---

## 4. 제출 전 확인에 사용한 명령

다음 명령은 문서와 실제 설정을 대조하고 실행 상태를 확인하기 위해 사용했다.

```bash
git status --short
git ls-files | grep -E '(^|/)\.env($|\.)' || true
docker compose config
docker compose build
docker compose up -d
docker compose ps
curl http://localhost:8080 || true
curl http://localhost:5001/api/health || true
```

CRUD 기능은 `/api/notes`에 대해 POST, GET, PUT, 검색/필터, DELETE 순서로 확인했다.
