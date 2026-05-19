# AI 활용 프롬프트 기록

## Study Note Manager

이 문서는 Study Note Manager 프로젝트를 진행하면서 AI를 어떤 목적으로 참고했는지 정리한 과제 제출용 기록입니다. 프로젝트의 기본 방향과 과제 요구사항은 직접 정리하고, AI는 구조 검토, 코드 초안 참고, 오류 원인 점검, UI 개선 아이디어, 문서 정리에 보조 도구로 활용했습니다.

---

## 1. AI 활용 방식

| 항목 | 내용 |
| --- | --- |
| 프로젝트명 | Study Note Manager |
| 과제 목표 | Docker Compose 기반 3-tier 웹서비스 구현 |
| 주요 기능 | 노트 작성/조회/수정/삭제, 검색, 카테고리 필터, 중요 표시 |
| 주요 기술 | HTML/CSS/JavaScript, Nginx, Node.js, Express, MySQL, Docker Compose |
| 활용 방향 | 설계 검토, 구현 초안 참고, 오류 해결 방향 확인, 문서 정리 보조 |

AI를 사용할 때는 바로 결과를 그대로 제출하기보다, 과제 조건에 맞는지 확인하면서 필요한 부분을 수정했습니다. 특히 포트, 컨테이너 이름, API 경로, DB 연결 정보처럼 실제 실행에 영향을 주는 내용은 Docker Compose 설정과 실행 결과를 기준으로 다시 확인했습니다.

---

## 2. 사용 프롬프트 및 반영 내용

| 단계 | 사용 프롬프트 요약 | 사용 목적 | 반영 내용 | 직접 확인/수정한 내용 |
| ---: | --- | --- | --- | --- |
| 1 | “Study Note Manager를 Docker Compose 기반 3-tier 구조로 구성하려면 frontend/backend/database 역할을 어떻게 나누면 좋을지 검토해줘.” | 과제 조건에 맞는 3-tier 구성을 잡기 위해 사용 | Presentation Tier는 `frontend`, Application Tier는 `backend`, Data Tier는 `mysql`로 정리 | 실제 `docker-compose.yml` 서비스명을 `frontend`, `backend`, `mysql`로 맞추고 README에도 같은 이름으로 작성 |
| 2 | “학습 노트 관리 프로젝트에 필요한 폴더 구조 초안을 제안해줘.” | 프로젝트 파일을 frontend, backend, db로 나누기 위해 참고 | `frontend/`, `backend/`, `db/init/` 중심의 구조를 사용 | 불필요한 폴더는 줄이고 Dockerfile, SQL 초기화 파일, 문서 파일 위치를 직접 확인 |
| 3 | “Node.js와 Express로 노트 관리 REST API 구조 초안을 잡아줘.” | backend API의 기본 구조를 잡기 위해 참고 | Express app, routes, controllers, DB pool 구조를 구성 | API 경로가 `/api/health`, `/api/notes`로 동작하는지 curl과 브라우저에서 확인 |
| 4 | “MySQL에 노트 데이터를 저장하려면 어떤 테이블 구조가 적절한지 검토해줘.” | Data Tier의 기본 테이블 설계를 확인하기 위해 사용 | `notes` 테이블에 제목, 내용, 카테고리, 중요 여부, 생성/수정 시간을 저장 | `db/init/01_init.sql`의 컬럼명과 backend에서 사용하는 필드명이 맞는지 확인 |
| 5 | “HTML/CSS/JavaScript로 노트 작성 폼과 목록 화면의 기본 UI 초안을 만들어줘.” | frontend UI 구조 초안을 만들기 위해 참고 | 작성 폼, 노트 목록, 검색창, 카테고리 필터 영역을 구성 | 실제 사용 흐름에 맞게 버튼 문구, 입력 placeholder, 카테고리 항목을 조정 |
| 6 | “노트 작성, 조회, 삭제 API와 frontend 연결 흐름을 점검해줘.” | CRUD 중 기본 흐름을 빠뜨리지 않기 위해 사용 | `POST`, `GET`, `DELETE` API와 목록 새로고침 흐름을 정리 | Docker 실행 후 직접 노트를 추가/조회/삭제하며 동작 확인 |
| 7 | “기존 노트를 수정할 수 있도록 Update API와 수정 모드 구현 방향을 알려줘.” | CRUD의 Update 기능을 보완하기 위해 참고 | `PUT /api/notes/:id`와 frontend 수정 모드 구조를 반영 | 수정 버튼 클릭 시 폼에 기존 값이 들어오는지, 저장 후 목록이 갱신되는지 확인 |
| 8 | “제목과 내용 기준 검색 기능을 API query와 frontend 검색창에 연결하는 방법을 알려줘.” | 검색 기능 구현 방향을 확인하기 위해 사용 | `GET /api/notes?search=...` 흐름을 사용 | 한글 검색어로도 결과가 조회되는지 확인 |
| 9 | “카테고리별 필터를 select와 API query로 연결하는 방식을 검토해줘.” | 노트를 분류해서 조회하는 기능을 만들기 위해 참고 | `category` 필드와 `GET /api/notes?category=...` 필터를 반영 | UI select 값과 DB/API 카테고리 값이 일치하는지 확인 |
| 10 | “중요 노트를 표시하고 중요한 노트만 볼 수 있는 기능 구조를 검토해줘.” | 중요 표시 기능 구현 방향을 잡기 위해 사용 | `is_important` 컬럼, 중요 필터, `PATCH /api/notes/:id/important`를 반영 | 체크/별 토글 상태가 API 값과 맞게 저장되는지 확인 |
| 11 | “frontend, backend, mysql을 docker-compose로 묶을 때 설정을 점검해줘.” | 3개 컨테이너를 한 번에 실행하기 위해 사용 | `docker-compose.yml`에 세 서비스를 정의하고 network, volume을 설정 | `docker compose config`로 Compose 설정이 유효한지 확인 |
| 12 | “frontend에서 `/api`로 요청하면 backend 컨테이너로 전달되도록 Nginx 설정을 점검해줘.” | frontend와 backend 연결 방식을 정리하기 위해 사용 | Nginx reverse proxy로 `/api/` 요청을 `http://backend:5001/api/`로 전달 | 브라우저와 curl로 frontend/backend 연결 확인 |
| 13 | “docker compose 실행 중 Docker daemon 오류가 날 때 확인할 점을 알려줘.” | Docker Desktop 실행 문제의 원인을 찾기 위해 사용 | Docker daemon 실행 상태를 확인하고 다시 Compose 실행 | Docker가 실행된 뒤 `docker compose up --build -d`로 재실행 |
| 14 | “로컬 포트 충돌을 피하도록 포트 설정을 정리해줘.” | 기존 포트와 충돌하지 않도록 조정하기 위해 사용 | frontend `8080`, backend `5001`, mysql `3307`로 정리 | README, `.env.example`, `docker-compose.yml`의 포트가 일치하는지 확인 |
| 15 | “MySQL이 준비되기 전에 backend가 먼저 실행되어 실패하는 문제를 줄이는 방법을 알려줘.” | 컨테이너 시작 순서 문제를 줄이기 위해 사용 | MySQL healthcheck와 backend DB 연결 재시도 흐름을 반영 | `docker compose ps`에서 mysql healthy 상태와 backend 실행 상태 확인 |
| 16 | “한글 노트가 깨지지 않도록 MySQL과 backend 인코딩 설정을 점검해줘.” | 한글 저장/조회 문제를 해결하기 위해 사용 | MySQL `utf8mb4`, collation, DB charset 설정을 반영 | 한글 제목/내용을 직접 저장하고 조회 결과를 확인 |
| 17 | “MySQL 데이터를 컨테이너 재시작 후에도 유지하려면 volume을 어떻게 설정해야 하는지 알려줘.” | DB 데이터 유지 방식을 확인하기 위해 사용 | `mysql-data:/var/lib/mysql` named volume을 사용 | `docker compose down`과 재실행 시 volume이 유지되는 구조인지 확인 |
| 18 | “현재 UI를 과제 제출 화면으로 보기 좋게 다듬을 수 있는 개선 방향을 제안해줘.” | 화면을 너무 기본 템플릿처럼 보이지 않게 개선하기 위해 참고 | 카드, 버튼, 입력창, 간격, 색상, empty state를 조정 | 기존 기능 로직은 유지하고 CSS 중심으로 직접 확인하며 수정 |
| 19 | “중요 표시 체크박스를 별 아이콘 토글처럼 보이게 개선할 수 있을지 검토해줘.” | 중요 표시 UI를 더 직관적으로 만들기 위해 사용 | 중요 입력, 중요 필터, 노트 카드의 중요 표시를 별 아이콘 기반으로 변경 | 실제 값은 기존 boolean 로직과 연결되는지 확인 |
| 20 | “화면 폭이 줄어들 때 입력폼과 목록이 자연스럽게 세로로 배치되도록 CSS를 점검해줘.” | 반응형 레이아웃을 개선하기 위해 사용 | CSS media query와 grid/flex 정렬을 조정 | 브라우저 폭을 줄여 모바일/데스크톱 배치를 확인 |
| 21 | “README를 과제 보고서 형식으로 정리할 때 어떤 항목이 필요한지 알려줘.” | 제출 문서에 빠진 내용이 없도록 참고 | 프로젝트 개요, 3-tier 구조, 흐름도, 컨테이너 역할, 포트, 실행 방법을 정리 | 실제 설정과 다른 설명이 없는지 `docker-compose.yml`과 대조 |
| 22 | “AI 사용 프롬프트 기록을 과제 제출용으로 정리하는 형식을 제안해줘.” | AI 활용 내역을 제출 형식에 맞추기 위해 사용 | 사용 프롬프트, 목적, 반영 내용, 직접 확인한 내용을 표로 정리 | AI가 전부 수행한 것처럼 보이지 않도록 실제 확인/수정 내용을 함께 작성 |
| 23 | “HANDOFF 문서에 다음 작업자가 확인해야 할 실행 방법과 주의사항을 정리해줘.” | 프로젝트 상태와 실행 절차를 나중에 다시 확인하기 쉽게 정리 | HANDOFF에 실행 방법, 포트, 검증 명령, 주의사항을 정리 | README, AI_PROMPTS와 내용이 충돌하지 않는지 비교 |
| 24 | “최종 제출 전에 docker compose config, backend check, frontend JS 문법 체크를 확인해줘.” | 제출 전 오류를 줄이기 위해 사용 | 검증 명령 목록을 정리하고 실행 결과를 확인 | `docker compose config`, `npm run check`, `node --check frontend/js/app.js`를 직접 실행 |

---

## 3. 오류 해결에 사용한 프롬프트

| 문제 상황 | 사용 프롬프트 요약 | 사용 목적 | 반영 내용 | 직접 확인/수정한 내용 |
| --- | --- | --- | --- | --- |
| Docker daemon이 실행되지 않음 | “docker compose up이 실패하는데 Docker daemon 관련 오류인지 확인하는 방법을 알려줘.” | Docker 실행 환경 문제인지 확인 | Docker Desktop/daemon 상태 확인 절차를 참고 | Docker 실행 후 Compose를 다시 실행해 컨테이너 상태 확인 |
| 포트 충돌 가능성 | “3000, 5000, 3306 대신 충돌이 적은 포트로 정리해줘.” | 로컬 실행 시 포트 충돌을 줄이기 위함 | `8080`, `5001`, `3307` 포트 기준으로 정리 | README, `.env.example`, Compose 설정의 포트 일치 여부 확인 |
| DB 준비 전 backend 시작 | “backend가 DB 연결 실패로 바로 종료되지 않게 점검해줘.” | MySQL 준비 시간 차이 문제 해결 | healthcheck와 DB 연결 재시도 방향을 참고 | `docker compose ps`와 health check 응답 확인 |
| 한글 깨짐 | “한글 데이터 저장 시 깨질 수 있는 설정을 점검해줘.” | UTF-8 설정 누락 확인 | `utf8mb4`와 backend charset 설정을 반영 | 한글 테스트 노트를 저장/조회하여 확인 |
| UI가 기본 화면처럼 보임 | “과제용 웹앱 화면으로 보기 좋게 정리할 UI 개선 아이디어를 알려줘.” | 화면 구성과 사용성을 개선 | 색상, 여백, 카드, 버튼, empty state 개선 | 기능 동작이 깨지지 않는지 CRUD 테스트로 확인 |
| 중요 표시 UI가 딱딱함 | “중요 표시를 체크박스 대신 별 아이콘 느낌으로 바꿀 수 있을지 검토해줘.” | 중요 기능을 더 직관적으로 표현 | 별 아이콘 토글 UI로 정리 | API의 `isImportant` 값과 화면 상태가 맞는지 확인 |
| 문서 내용이 너무 길고 딱딱함 | “README를 학생 보고서처럼 자연스럽게 줄여줘.” | 제출 문서를 읽기 쉽게 정리 | README 문장과 표를 정리 | 포트, 서비스명, 실행 명령이 실제 설정과 맞는지 다시 확인 |

---

## 4. 최종 반영 내용 요약

| 구분 | 반영 내용 | 확인한 내용 |
| --- | --- | --- |
| 3-tier 구조 | `frontend`, `backend`, `mysql` 컨테이너로 역할 분리 | Compose 서비스 3개 확인 |
| Backend API | Express 기반 `/api/health`, `/api/notes` API 구성 | curl과 브라우저에서 응답 확인 |
| Frontend UI | 노트 작성 폼, 목록, 검색, 필터, 중요 표시 UI 구성 | 실제 화면에서 CRUD 흐름 확인 |
| Docker Compose | 세 컨테이너, network, volume, healthcheck 구성 | `docker compose config` 통과 |
| 포트 설정 | frontend `8080`, backend `5001`, mysql `3307` 사용 | README와 `.env.example` 일치 여부 확인 |
| 한글 처리 | MySQL과 backend를 `utf8mb4` 기준으로 정리 | 한글 노트 저장/조회 확인 |
| UI/UX | 카드, 버튼, 반응형, 중요 표시 UI 개선 | desktop/mobile 화면 확인 |
| 문서 | README, AI_PROMPTS, HANDOFF 정리 | 과제 조건 항목 포함 여부 확인 |

---

## 5. 제출 전 확인한 명령

```bash
git status
git ls-files | grep '\.env'
docker compose config
cd backend && npm run check
node --check frontend/js/app.js
docker compose up --build -d
```

확인한 내용은 다음과 같습니다.

- `.env` 파일은 Git 추적 대상에 포함하지 않았습니다.
- 제출용 예시 파일로 `.env.example`, `backend/.env.example`을 포함했습니다.
- `node_modules`, Docker volume, 임시 파일은 Git에 포함하지 않았습니다.
- `docker compose up --build -d`로 frontend, backend, mysql 컨테이너가 실행되는 것을 확인했습니다.
- `http://localhost:8080`에서 화면 접속이 가능하고, `http://localhost:5001/api/health`에서 DB 연결 상태를 확인했습니다.

---

## 6. 정리

AI는 프로젝트를 대신 완성하는 도구라기보다, 구현 중 막히는 부분을 확인하고 문서를 정리하는 보조 도구로 사용했습니다. 구조와 기능 방향은 과제 조건에 맞추어 직접 정했고, AI가 제안한 내용은 실제 파일과 실행 결과를 기준으로 확인한 뒤 필요한 부분만 반영했습니다.
