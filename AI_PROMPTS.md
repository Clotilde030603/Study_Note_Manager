# AI 프롬프트 사용 내역

이 문서는 Study Note Manager를 만들면서 AI를 참고한 내용을 과제 제출용으로 정리한 기록입니다. 프로젝트의 주제, 3-tier 구성, 실제 코드 수정과 실행 테스트는 직접 진행했고, AI는 구조를 점검하거나 막힌 부분을 확인하는 보조 도구로 사용했습니다.

아래 내용은 실제 프로젝트 파일과 실행 결과를 다시 확인하면서 정리했습니다.

---

## 1. AI 사용 방식

| 항목 | 내용 |
| --- | --- |
| 사용 목적 | 구조 검토, 구현 초안 참고, 오류 원인 확인, UI 수정 참고, 문서 정리 보조 |
| 직접 확인한 기준 | `docker-compose.yml`, backend/frontend 코드, README, `docker compose config`, curl 테스트 결과 |
| 주의한 점 | AI 답변을 그대로 넣기보다 과제 조건과 실제 실행 결과에 맞게 수정함 |
| 민감정보 처리 | 실제 비밀번호나 토큰은 기록하지 않고 placeholder만 사용함 |

---

## 2. 주요 프롬프트 기록

| 번호 | 사용 도구 | 사용 목적 | 실제 사용 프롬프트 | 생성 결과 요약 | 프로젝트 반영 내용 | 검토 및 수정 여부 |
| ---: | --- | --- | --- | --- | --- | --- |
| 1 | ChatGPT/Codex 계열 AI | 프로젝트 주제와 3-tier 구조 방향 잡기 | “Study Note Manager를 Docker Compose 기반 3-tier 구조로 구성하려면 frontend/backend/database 역할을 어떻게 나누면 좋을지 검토해줘.” | frontend, backend, mysql로 계층을 나누는 방향을 참고 | 실제 서비스명을 `frontend`, `backend`, `mysql`로 정하고 README에 계층별 역할 정리 | 직접 docker-compose 구조와 과제 요구사항을 비교해서 수정 |
| 2 | ChatGPT/Codex 계열 AI | 폴더 구조 초안 참고 | “학습 노트 관리 프로젝트에 필요한 폴더 구조 초안을 제안해줘.” | `frontend/`, `backend/`, `db/init/`처럼 나누는 예시를 참고 | 현재 폴더 구조에 맞게 Dockerfile, SQL 초기화 파일, 문서 위치 정리 | 불필요한 폴더는 만들지 않고 필요한 구조만 사용 |
| 3 | ChatGPT/Codex 계열 AI | Express API 구성 참고 | “Node.js와 Express로 노트 관리 REST API 구조 초안을 잡아줘.” | routes, controller, DB pool을 나누는 방식을 참고 | `/api/health`, `/api/notes` 중심으로 backend 구성 | 실제 endpoint는 curl로 확인 |
| 4 | ChatGPT/Codex 계열 AI | MySQL 테이블 구성 검토 | “MySQL에 노트 데이터를 저장하려면 어떤 테이블 구조가 적절한지 검토해줘.” | 노트 제목, 내용, 카테고리, 중요 여부, 시간 컬럼 아이디어 참고 | `db/init/01_init.sql`의 `notes` 테이블 구성 | backend에서 쓰는 필드명과 맞춰 수정 |
| 5 | ChatGPT/Codex 계열 AI | 화면 구성과 UI 수정 참고 | “HTML/CSS/JavaScript로 노트 작성 폼과 목록 화면의 기본 UI 초안을 만들어줘.” | 폼, 목록, 검색창, 필터 영역 구성 아이디어 참고 | `frontend/index.html`, `style.css`, `app.js`에 화면과 기능 연결 | 화면에서 직접 입력/수정/삭제 흐름 확인 |
| 6 | ChatGPT/Codex 계열 AI | Docker Compose 연결 확인 | “frontend, backend, mysql을 docker-compose로 묶을 때 설정을 점검해줘.” | bridge network, depends_on, volume, healthcheck 설정 방향 참고 | `docker-compose.yml`에 세 서비스와 `mysql-data` volume 구성 | `docker compose config`와 실행 테스트로 확인 |
| 7 | ChatGPT/Codex 계열 AI | Nginx proxy 설정 확인 | “frontend에서 `/api`로 요청하면 backend 컨테이너로 전달되도록 Nginx 설정을 점검해줘.” | `/api/` 요청을 backend 서비스명으로 넘기는 방식 참고 | `frontend/nginx.conf`에 reverse proxy 설정 | 브라우저와 curl로 frontend/backend 연결 확인 |
| 8 | ChatGPT/Codex 계열 AI | 실행 중 오류 원인 확인 | “MySQL이 준비되기 전에 backend가 먼저 실행되어 실패하는 문제를 줄이는 방법을 알려줘.” | MySQL healthcheck와 backend 재시도 방향 참고 | Compose healthcheck와 backend DB retry 로직 적용 | `docker compose ps`, `/api/health`로 확인 |
| 9 | ChatGPT/Codex 계열 AI | README 보고서 항목 확인 | “README를 과제 보고서 형식으로 정리할 때 어떤 항목이 필요한지 알려줘.” | 3-tier 설명, 포트, 실행 방법, 흐름도 등 필요한 항목 참고 | README에 프로젝트 개요, 구조, 흐름, 포트, 실행 방법 정리 | 실제 설정과 다르지 않게 계속 대조 |
| 10 | Codex | 보안 설정 점검 | “공개 GitHub 저장소 기준으로 환경변수와 DB 비밀번호 노출 문제를 전체적으로 점검하고 알아서 안전하게 정리해줘.” | 비밀번호 예시값, `.env` 추적 여부, README 안내를 점검하는 방향 제안 | `.env.example` placeholder 정리, `.env` 비추적 확인, README 보안 안내 보완 | grep과 git 추적 상태로 확인 |
| 11 | Codex | Compose와 backend 보안 설정 보완 | “Study_Note_Manager 레포의 보안상 위험한 설정을 과제/로컬 실행 흐름을 깨지 않는 범위에서 수정하고, 수정 내역과 검증 결과를 정리한다.” | 포트 바인딩, CORS, Dockerfile non-root 실행 등을 점검 | backend/mysql 로컬 바인딩, CORS `*` 제거, Dockerfile 개선 | build/up/curl로 직접 확인 |
| 12 | Codex | 최종 과제 기준 점검 | “Study_Note_Manager 프로젝트가 3-tier Docker Compose 과제 평가 기준을 100% 충족하는지 점검하고, 부족한 README/문서/설정이 있으면 과제 요구사항에 맞게 보완한다.” | README, AI 기록, 캡처 안내 등 제출 전 확인 항목 정리 | README와 AI_PROMPTS를 과제 기준에 맞게 정리 | 실제 실행 테스트 결과와 비교 |
| 13 | Codex | 최종 실행 테스트 보조 | “Study_Note_Manager 프로젝트의 최종 실행 테스트를 수행하고, 3-tier Docker Compose 과제 요구사항을 100% 충족하는지 점검한 뒤 제출 전 보완사항을 정리한다.” | config/build/up, health, CRUD curl 테스트 순서 정리 | 최종 검증 명령과 제출 전 체크리스트 정리 | 직접 명령 실행 후 결과 확인 |
| 14 | Codex | 환경변수 fallback 제거 점검 | “보안 점검 결과를 반영해서 환경변수 fallback placeholder를 완전히 제거하고 환경변수 기반으로만 동작하도록 정리해줘.” | 비밀번호 fallback 제거와 필수 환경변수 오류 처리 방향 참고 | Compose 비밀번호 fallback 제거, backend `DB_PASSWORD` 필수 검증, README 안내 추가 | `docker compose config`, grep, backend check로 확인 |

---

## 3. 실제 반영 방식

AI가 만든 내용을 그대로 붙여 넣기보다는, 아래처럼 직접 확인하면서 반영했습니다.

- Compose 서비스명과 포트가 README와 맞는지 확인했습니다.
- backend API 경로가 실제 route 파일과 맞는지 확인했습니다.
- MySQL 연결은 `localhost`가 아니라 Compose 서비스명 `mysql`을 쓰도록 확인했습니다.
- `.env` 파일은 Git에 포함하지 않고, `.env.example`에는 placeholder만 남겼습니다.
- UI와 CRUD 동작은 브라우저와 curl로 직접 확인했습니다.
- 실행 결과 캡처/영상은 저장소에 넣지 않고 과제 제출물에 따로 첨부하는 방식으로 정리했습니다.

---

## 4. 제출 전 확인에 사용한 명령

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

CRUD 확인은 `/api/notes`에 대해 POST, GET, PUT, 검색/필터, DELETE 순서로 테스트했습니다.

---

## 5. 남은 보완 가능 항목

- 초기 개발 때 실제 사용한 AI 도구명이나 프롬프트 원문이 더 정확히 남아 있다면 해당 항목을 보완하면 됩니다.
- 제출 전 실행 화면 캡처 또는 시연 영상은 과제 제출 시스템에 별도로 첨부해야 합니다.
