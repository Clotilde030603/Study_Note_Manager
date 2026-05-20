# AI 프롬프트 사용 내역

이 문서는 Study Note Manager 과제 제출용 AI 활용 기록입니다. 실제 파일과 실행 결과로 확인한 내용만 반영했으며, 정확한 원문을 확인할 수 없는 초기 프롬프트는 기존 기록을 바탕으로 정리하고 `확인 필요`로 표시했습니다. 현재 보안 점검/과제 기준 점검 goal 프롬프트는 이번 대화에서 실제 사용한 요청으로 포함했습니다.

## 1. AI 활용 원칙

| 항목 | 내용 |
| --- | --- |
| 프로젝트 | Docker Compose 기반 3-tier 학습 노트 관리 웹서비스 |
| AI 사용 범위 | 구조 검토, 구현 초안 참고, 오류 해결 방향 확인, 문서 보완, 보안 점검 |
| 최종 검토 기준 | `docker-compose.yml`, 실제 소스코드, `docker compose config`, 실행/curl 결과 |
| 민감정보 처리 | 실제 비밀번호, 토큰, API key는 문서에 기록하지 않고 placeholder만 사용 |

## 2. 사용 프롬프트 상세 기록

| 번호 | 사용 일자 | 사용 도구 | 사용 목적 | 실제 사용 프롬프트 | AI 생성 결과 요약 | 프로젝트 반영 내용 | 검토/수정 여부 |
| ---: | --- | --- | --- | --- | --- | --- | --- |
| 1 | 확인 필요 | ChatGPT/Codex 계열 AI | 프로젝트 주제 선정 및 3-tier 구조 설계 | “Study Note Manager를 Docker Compose 기반 3-tier 구조로 구성하려면 frontend/backend/database 역할을 어떻게 나누면 좋을지 검토해줘.” | Presentation/Application/Data Tier를 `frontend`, `backend`, `mysql`로 나누는 방향 제안 | `docker-compose.yml`과 README에 3개 tier 및 서비스명을 명확히 반영 | 기존 기록 기반, 실제 파일과 대조 완료 |
| 2 | 확인 필요 | ChatGPT/Codex 계열 AI | 프로젝트 폴더 구조 초안 작성 | “학습 노트 관리 프로젝트에 필요한 폴더 구조 초안을 제안해줘.” | `frontend/`, `backend/`, `db/init/` 중심 구조 제안 | 현재 디렉터리 구조와 README 프로젝트 구조 섹션에 반영 | 기존 기록 기반, 실제 파일과 대조 완료 |
| 3 | 확인 필요 | ChatGPT/Codex 계열 AI | Application Tier API 구조 설계 | “Node.js와 Express로 노트 관리 REST API 구조 초안을 잡아줘.” | Express app/routes/controllers/db pool 분리 제안 | `backend/src/app.js`, `routes/`, `controllers/`, `db/pool.js` 구성 | 기존 기록 기반, API endpoint 확인 완료 |
| 4 | 확인 필요 | ChatGPT/Codex 계열 AI | Data Tier 테이블 설계 | “MySQL에 노트 데이터를 저장하려면 어떤 테이블 구조가 적절한지 검토해줘.” | 노트 제목, 내용, 카테고리, 중요 여부, 생성/수정 시간 컬럼 제안 | `db/init/01_init.sql`의 `notes` 테이블에 반영 | 기존 기록 기반, backend 필드와 대조 완료 |
| 5 | 확인 필요 | ChatGPT/Codex 계열 AI | Presentation Tier UI 초안 | “HTML/CSS/JavaScript로 노트 작성 폼과 목록 화면의 기본 UI 초안을 만들어줘.” | 작성 폼, 목록, 검색, 필터 UI 구성 제안 | `frontend/index.html`, `frontend/css/style.css`, `frontend/js/app.js`에 반영 | 기존 기록 기반, 화면 접속 검증 완료 |
| 6 | 확인 필요 | ChatGPT/Codex 계열 AI | CRUD/API와 frontend 연결 검토 | “노트 작성, 조회, 수정, 삭제 API와 frontend 연결 흐름을 점검해줘.” | REST API와 화면 목록 갱신 흐름 제안 | `/api/notes` CRUD, frontend fetch 흐름 반영 | 기존 기록 기반, health/frontend 검증 완료 |
| 7 | 확인 필요 | ChatGPT/Codex 계열 AI | 검색/필터/중요 표시 기능 검토 | “검색, 카테고리 필터, 중요 표시를 노트 관리 앱에 연결하는 방법을 검토해줘.” | query 기반 검색/필터와 중요 토글 API 제안 | 검색, 카테고리 필터, 중요 표시 기능 구현 | 기존 기록 기반, README 기능 설명과 대조 완료 |
| 8 | 확인 필요 | ChatGPT/Codex 계열 AI | Docker Compose 구성 검토 | “frontend, backend, mysql을 docker-compose로 묶을 때 설정을 점검해줘.” | 3개 서비스, bridge network, DB volume, healthcheck 구성 제안 | `docker-compose.yml`의 `frontend`, `backend`, `mysql`, `mysql-data`, `study-note-network` 반영 | `docker compose config`로 검증 완료 |
| 9 | 확인 필요 | ChatGPT/Codex 계열 AI | frontend/backend 연결 방식 정리 | “frontend에서 `/api`로 요청하면 backend 컨테이너로 전달되도록 Nginx 설정을 점검해줘.” | Nginx reverse proxy로 `/api/`를 backend 서비스에 전달하는 방식 제안 | `frontend/nginx.conf`에 `proxy_pass http://backend:5001/api/` 반영 | curl/frontend 접속으로 검증 완료 |
| 10 | 확인 필요 | ChatGPT/Codex 계열 AI | 실행 오류 해결 | “MySQL이 준비되기 전에 backend가 먼저 실행되어 실패하는 문제를 줄이는 방법을 알려줘.” | MySQL healthcheck와 backend 연결 재시도 제안 | Compose `depends_on: condition: service_healthy`, backend DB retry 로직 반영 | `docker compose ps`, health 응답으로 검증 완료 |
| 11 | 확인 필요 | ChatGPT/Codex 계열 AI | README 작성/보완 | “README를 과제 보고서 형식으로 정리할 때 어떤 항목이 필요한지 알려줘.” | 프로젝트 개요, 3-tier 구조, 흐름도, 컨테이너 역할, 포트, 실행 방법 항목 제안 | README의 과제 보고서 구조 작성 | 현재 goal에서 누락 항목 재점검 및 보완 완료 |
| 12 | 2026-05-20 | Codex | 보안 점검 및 설정 hardening | “공개 GitHub 저장소 기준으로 환경변수와 DB 비밀번호 노출 문제를 전체적으로 점검하고 알아서 안전하게 정리해줘.” | 예측 가능한 비밀번호 제거, `.env.example` placeholder화, README 실행 안내 보완 제안 | `.env.example`, `docker-compose.yml`, README 보안/환경변수 안내 보완 | 실제 secret 미출력, grep/config 검증 완료 |
| 13 | 2026-05-20 | Codex | 추가 보안 설정 개선 | “Study_Note_Manager 레포의 보안상 위험한 설정을 과제/로컬 실행 흐름을 깨지 않는 범위에서 수정하고, 수정 내역과 검증 결과를 정리한다.” | backend/mysql localhost 바인딩, CORS wildcard 제거, Dockerfile non-root, Nginx 보안 헤더 제안 | `docker-compose.yml`, `backend/src/app.js`, `backend/Dockerfile`, `frontend/nginx.conf` 보완 | `docker compose build/up`, curl health 검증 완료 |
| 14 | 2026-05-20 | Codex | 과제 평가 기준 충족 여부 점검 | “Study_Note_Manager 프로젝트가 3-tier Docker Compose 과제 평가 기준을 100% 충족하는지 점검하고, 부족한 README/문서/설정이 있으면 과제 요구사항에 맞게 보완한다.” | 과제 요구사항별 README/AI_PROMPTS/캡처 가이드 보완 방향 제안 | README 과제 목표/트러블슈팅/보안 주의사항, AI_PROMPTS 지정 컬럼, 캡처 가이드 보완 | 현재 작업에서 직접 검증 및 보완 완료 |
| 15 | 2026-05-20 | Codex | 최종 실행 테스트 및 제출 전 보완사항 정리 | “Study_Note_Manager 프로젝트의 최종 실행 테스트를 수행하고, 3-tier Docker Compose 과제 요구사항을 100% 충족하는지 점검한 뒤 제출 전 보완사항을 정리한다.” | 클린 Compose 실행, frontend/backend/mysql 로그, health/CRUD API, README/AI_PROMPTS/캡처 가이드/보안 상태를 점검 | 최종 검증 결과를 제출 전 체크리스트로 정리하고, 실제 캡처/영상은 제출자가 촬영할 작업으로 명시 | 현재 작업에서 직접 실행 검증 완료 |

## 3. 유형별 활용 요약

| 유형 | 활용 내용 | 반영 파일/근거 |
| --- | --- | --- |
| 프로젝트 주제 선정 및 3-tier 구조 설계 | 학습 노트 관리 주제와 `frontend`/`backend`/`mysql` 계층 분리 검토 | README, `docker-compose.yml` |
| Docker Compose 구성 검토 | 3개 컨테이너, network, volume, healthcheck, ports 구성 확인 | `docker-compose.yml` |
| frontend/backend/database 역할 정리 | 각 tier 역할과 요청 흐름을 표와 Mermaid 흐름도로 문서화 | README |
| README 작성 또는 보완 | 과제 보고서 항목, 실행 방법, 제출 전 확인 명령 정리 | README |
| 보안 점검 | 예측 가능한 비밀번호 제거, `.env` 비추적, localhost 바인딩, CORS 제한, non-root 컨테이너 | `.env.example`, `docker-compose.yml`, `backend/Dockerfile`, `backend/src/app.js` |
| 실행 오류 해결 또는 검증 | Docker daemon, MySQL 준비, 포트 충돌, DB volume 이슈 점검 | README 트러블슈팅, 검증 명령 |
| 과제 평가 기준 충족 여부 점검 | 요구사항별 체크리스트와 캡처 제출 준비 상태 확인 | README |

## 4. 최종 검증 명령

제출 전 다음 명령으로 AI 제안이 실제 프로젝트 상태와 일치하는지 확인했습니다.

```bash
git status --short
git ls-files | grep -E '(^|/)\.env($|\.)' || true
# 예측 가능한 기존 기본 비밀번호 문자열이 남아 있지 않은지 grep으로 확인
docker compose config
docker compose build
docker compose up -d
docker compose ps
curl http://localhost:8080 || true
curl http://localhost:5001/api/health || true
# CRUD 검증: POST/GET/PUT/GET search/GET filter/DELETE /api/notes
```

## 5. 사용자가 추가 보완할 수 있는 항목

- 초기 개발 중 실제로 사용한 AI 도구명과 날짜가 더 정확히 남아 있다면 위 표의 `확인 필요` 항목을 실제 날짜/도구명으로 교체합니다.
- 제출용 캡처 이미지 또는 시연 영상을 촬영한 뒤 과제 제출물에 별도 첨부합니다.
