# AI 활용 프롬프트 기록

## Study Note Manager

> Docker Compose 기반 3-tier 구조의 학습 노트 및 과제 메모 관리 웹서비스 개발 과정에서 사용한 AI 프롬프트와 반영 결과를 정리한 문서입니다.

본 문서는 과제 제출용으로, 프로젝트 설계부터 구현, Docker Compose 통합, 문제 해결, UI/UX 개선, 문서화까지의 AI 활용 흐름을 개발 workflow 관점에서 정리했습니다. 각 항목은 실제 개발 과정에서 AI에게 요청한 작업의 목적과 결과 반영 내용을 요약한 것입니다.

---

## 1. AI 활용 개요

| 항목 | 내용 |
| --- | --- |
| 프로젝트명 | Study Note Manager |
| 프로젝트 설명 | Docker Compose 기반 3-tier 구조의 학습 노트 및 과제 메모 관리 웹서비스 |
| 주요 기술 | HTML/CSS/JavaScript, Nginx, Node.js, Express, MySQL, Docker, Docker Compose |
| 주요 구현 기능 | 노트 작성/조회/수정/삭제, 검색, 카테고리 필터, 중요 노트 표시, 반응형 UI |
| 인프라 구성 | Frontend, Backend, MySQL을 분리한 다중 컨테이너 구조 |
| 문서 목적 | AI를 활용한 설계, 구현, 오류 해결, 개선, 문서화 과정을 제출용으로 기록 |

---

## 2. AI 프롬프트 활용 내역

| 번호 | 작업 항목 | 사용한 프롬프트 요약 | 사용 목적 | 생성 결과 반영 내용 |
| ---: | --- | --- | --- | --- |
| 1 | 프로젝트 설계 | “Study Note Manager를 Docker Compose 기반 3-tier 구조로 설계하고, frontend/backend/database 역할을 분리해줘.” | 전체 프로젝트의 구조와 책임 범위를 먼저 정의하기 위해 사용 | Presentation Tier, Application Tier, Data Tier 구조를 기준으로 프로젝트를 설계했고, `frontend`, `backend`, `mysql` 컨테이너로 역할을 분리함 |
| 2 | 프로젝트 구조 구성 | “학습 노트 및 과제 메모 관리 웹서비스에 적합한 폴더 구조와 파일 구성을 만들어줘.” | 제출용 프로젝트로 관리하기 쉬운 디렉터리 구조를 만들기 위해 사용 | `frontend/`, `backend/`, `db/init/`, `docker-compose.yml`, `.env.example`, 문서 파일 구조를 구성함 |
| 3 | backend 구현 | “Node.js와 Express로 노트 관리 REST API 서버를 구현해줘. MySQL과 연결하고 JSON API를 제공해줘.” | Application Tier 역할을 담당하는 API 서버 구현 | Express 앱, 서버 시작 파일, DB pool, 라우터, 컨트롤러를 구현하고 `/api/health`, `/api/notes` API를 제공함 |
| 4 | database 설계 | “MySQL에 학습 노트를 저장할 notes 테이블을 설계하고 초기화 SQL을 작성해줘.” | Data Tier의 스키마와 초기 실행 구조를 만들기 위해 사용 | `db/init/01_init.sql`에 `study_note_manager` DB와 `notes` 테이블 생성 SQL을 작성함 |
| 5 | frontend 구현 | “HTML/CSS/JavaScript로 노트 작성 폼과 노트 목록 UI를 구현하고 API와 연동해줘.” | Presentation Tier에서 사용자가 직접 사용하는 화면 구현 | `index.html`, `style.css`, `app.js`를 작성하여 노트 작성, 목록 표시, 검색, 필터 UI를 구현함 |
| 6 | CRUD 기능 구현 | “노트 작성(Create), 조회(Read), 삭제(Delete)를 API와 UI에서 동작하도록 구현해줘.” | 기본 CRUD 기능 중 작성/조회/삭제 흐름을 완성하기 위해 사용 | `POST /api/notes`, `GET /api/notes`, `DELETE /api/notes/:id` API 및 Frontend 버튼 동작을 구현함 |
| 7 | Update 기능 추가 | “기존 노트를 수정할 수 있도록 Update API와 프론트엔드 수정 모드를 추가해줘.” | CRUD 중 Update 기능을 보완하여 완전한 CRUD 서비스로 만들기 위해 사용 | `PUT /api/notes/:id` API를 추가하고, 노트 카드의 `수정` 버튼 클릭 시 폼에 기존 값이 채워지는 수정 모드를 구현함 |
| 8 | 검색 기능 구현 | “노트 제목과 내용으로 검색할 수 있도록 API 쿼리와 프론트 검색창을 연결해줘.” | 노트가 많아졌을 때 필요한 내용을 빠르게 찾을 수 있도록 하기 위해 사용 | `GET /api/notes?search=...` 및 `/api/notes/search?q=...` 검색 API를 구현하고, Frontend 검색 입력과 연동함 |
| 9 | 카테고리 필터 구현 | “카테고리별로 노트를 필터링할 수 있게 select 필터와 API query를 구현해줘.” | 노트를 강의, 과제, 시험, 프로젝트 등으로 분류하여 조회하기 위해 사용 | `category` 필드를 DB/API/UI에 반영하고, `GET /api/notes?category=...` 필터를 구현함 |
| 10 | 중요 노트 표시 구현 | “중요한 노트를 별도로 표시하고 중요 노트만 필터링할 수 있게 구현해줘.” | 중요한 학습 내용이나 과제 메모를 빠르게 구분하기 위해 사용 | `is_important` 컬럼, `PATCH /api/notes/:id/important`, 중요 노트 배지, 중요 필터 기능을 구현함 |
| 11 | docker-compose 통합 | “frontend, backend, mysql을 Docker Compose로 한 번에 실행할 수 있게 구성해줘.” | 3-tier 구조를 컨테이너 기반으로 통합 실행하기 위해 사용 | `docker-compose.yml`에 `frontend`, `backend`, `mysql` 서비스를 정의하고 `study-note-network`, `mysql-data` volume을 구성함 |
| 12 | Nginx reverse proxy 설정 | “프론트엔드에서 `/api`로 요청하면 backend 컨테이너로 프록시되도록 Nginx를 설정해줘.” | 브라우저가 API 호출 시 CORS 문제 없이 backend와 통신하도록 하기 위해 사용 | `frontend/nginx.conf`에 `/api/` proxy 설정을 추가하여 `http://backend:5001/api/`로 전달되도록 구성함 |
| 13 | Docker daemon 오류 확인 | “docker compose up 실행이 안 되니 Docker daemon 상태를 확인하고 해결 방향을 제시해줘.” | Docker Desktop/daemon이 실행되지 않아 컨테이너 실행이 실패하는 문제를 확인하기 위해 사용 | `docker info`, Docker Desktop 실행 확인, 이후 `docker compose up --build -d` 재실행으로 컨테이너 실행 상태를 검증함 |
| 14 | 포트 충돌 수정 | “기존 포트와 충돌하지 않도록 frontend/backend/mysql 포트를 조정해줘.” | 로컬 환경에서 이미 사용 중인 포트와 충돌을 방지하기 위해 사용 | Frontend `8080`, Backend `5001`, MySQL `3307` 기준으로 `docker-compose.yml`, README, 실행 안내를 정리함 |
| 15 | MySQL healthcheck 및 DB 연결 재시도 | “MySQL 컨테이너가 준비되기 전에 backend가 실행되어 실패하지 않도록 안정화해줘.” | 컨테이너 시작 순서와 DB 준비 시간 차이로 인한 오류를 줄이기 위해 사용 | MySQL healthcheck, `depends_on.condition: service_healthy`, backend DB 연결 재시도 로직을 반영함 |
| 16 | UTF-8 한글 인코딩 수정 | “한글 노트가 깨지지 않도록 MySQL, Express, DB 연결 설정을 UTF-8 기준으로 수정해줘.” | 한글 제목/내용/카테고리를 안정적으로 저장하고 조회하기 위해 사용 | MySQL `utf8mb4`, `utf8mb4_unicode_ci`, DB connection charset, Express JSON UTF-8 응답 설정을 반영함 |
| 17 | MySQL persistence(volume) 구성 | “MySQL 데이터가 컨테이너 재시작 후에도 유지되도록 volume을 설정해줘.” | Docker 컨테이너 삭제/재생성 시에도 노트 데이터가 유지되게 하기 위해 사용 | `mysql-data:/var/lib/mysql` named volume을 docker-compose에 추가하고 README에 persistence 설명을 작성함 |
| 18 | UI/UX 개선 | “현재 Study Note Manager UI를 실제 생산성 웹앱처럼 clean하고 modern하게 개선해줘.” | 기본적인 HTML 화면을 과제 제출용으로 보기 좋게 다듬기 위해 사용 | 카드, 버튼, 입력창, 노트 카드, header, empty state, hover 효과, shadow, border 등을 CSS로 개선함 |
| 19 | 중요 표시 UI 개선 | “중요 표시 체크박스를 별 아이콘 토글 버튼으로 변경하고, 중요 필터도 같은 방식으로 개선해줘.” | 체크박스 기반 UI가 딱딱해 보이는 문제를 개선하기 위해 사용 | 중요 노트 입력, 중요 필터, 노트 카드 중요 표시/해제 버튼을 별 아이콘 기반 토글 UI로 변경함 |
| 20 | 반응형 레이아웃 개선 | “화면 폭이 줄어들 때 입력폼과 노트 목록이 자연스럽게 세로 배치되도록 반응형을 개선해줘.” | 데스크톱뿐 아니라 작은 화면에서도 사용 가능한 UI를 만들기 위해 사용 | CSS media query를 조정하여 2-column 레이아웃에서 모바일 세로 레이아웃으로 자연스럽게 전환되도록 개선함 |
| 21 | 상단 로고 개선 | “단순한 S 로고 대신 노트/문서/펜 느낌이 나는 inline SVG 로고로 개선해줘.” | 임시 로고처럼 보이는 문제를 줄이고 실제 노트 앱 느낌을 주기 위해 사용 | 외부 이미지 없이 inline SVG와 CSS로 muted navy/slate 계열의 노트 앱 로고를 구현함 |
| 22 | Empty state 개선 | “노트가 없을 때 안내 문구와 작은 아이콘을 포함한 empty state를 추가해줘.” | 빈 목록 화면이 허전하게 보이는 문제를 개선하기 위해 사용 | “아직 작성된 노트가 없습니다.”, “왼쪽에서 첫 노트를 작성해보세요.” 문구와 작은 아이콘을 추가함 |
| 23 | README 작성 | “과제 제출용 README.md를 markdown 형식으로 자세히 작성해줘. 3-tier, Docker Compose, API, troubleshooting을 포함해줘.” | 프로젝트 실행과 구조를 제출자가 설명할 수 있도록 문서화하기 위해 사용 | README에 프로젝트 개요, 목적, 3-tier 구조, Mermaid 흐름도, API, 실행 방법, 트러블슈팅, volume, network 설명을 작성함 |
| 24 | 프로젝트 점검 및 개선 | “현재 구현 상태를 기준으로 빠진 기능, 포트 설정, Docker Compose 구성, UI 문제를 점검하고 개선해줘.” | 구현 누락, 설정 불일치, 실행 오류를 줄이기 위해 사용 | `docker compose config`, JS 문법 체크, backend check, 브라우저 CRUD 테스트를 반복하며 프로젝트 완성도를 높임 |
| 25 | HANDOFF 문서 작성 | “다음 작업자가 프로젝트 상태, 실행 방법, 남은 이슈를 이해할 수 있도록 handoff 형태로 정리해줘.” | 개발 흐름과 최종 상태를 인수인계 문서처럼 정리하기 위해 사용 | README, DOCKER_COMPOSE_GUIDE, PROJECT_DESIGN에 실행 방법, 구조, 포트, API, 주의사항을 정리하여 handoff 성격의 문서 자료로 활용 가능하게 함 |
| 26 | Docker 및 3-tier 문서 보강 | “Docker Compose 네트워크, 컨테이너 역할, 포트, volume을 과제 보고서 스타일로 설명해줘.” | 단순 실행 설명을 넘어 3-tier 아키텍처 관점에서 제출 문서를 강화하기 위해 사용 | README에 Presentation/Application/Data Tier 구분, 컨테이너 연결 방식, network, volume persistence 설명을 추가함 |
| 27 | 최종 기능 검증 | “기존 노트 추가/조회/수정/삭제/검색/중요 표시 기능이 UI 변경 후에도 정상인지 검증해줘.” | UI 개선 과정에서 기능 로직이 깨지지 않았는지 확인하기 위해 사용 | 브라우저에서 CRUD, 검색, 중요 필터를 테스트하고 임시 테스트 데이터를 삭제하여 최종 상태를 정리함 |

---

## 3. 문제 해결 과정 요약

| 문제 상황 | 사용한 프롬프트 요약 | 해결 방향 | 반영 결과 |
| --- | --- | --- | --- |
| Docker daemon이 실행되지 않음 | “Docker Compose 실행이 실패하니 Docker daemon 상태를 확인해줘.” | Docker Desktop 실행 상태와 `docker info` 결과를 확인 | Docker가 실행된 뒤 `docker compose up --build -d`로 전체 컨테이너 실행 성공 |
| 포트 충돌 가능성 | “기존 3000/5000 포트 대신 충돌이 적은 포트로 정리해줘.” | 실제 로컬 실행 기준 포트를 재정의 | Frontend `8080`, Backend `5001`, MySQL `3307`로 통일 |
| MySQL 준비 전 backend 시작 문제 | “backend가 DB 준비 전에 실패하지 않도록 Compose와 서버 로직을 안정화해줘.” | MySQL healthcheck와 backend DB retry 적용 | Compose 시작 순서 안정화 및 backend 연결 재시도 구현 |
| 한글 깨짐 | “한글 노트 저장 시 깨지지 않도록 UTF-8 설정을 점검해줘.” | MySQL charset/collation, DB connection charset, Express 응답 charset 점검 | `utf8mb4` 기반으로 한글 제목/내용 저장 및 조회 가능 |
| 기본 UI가 제출용으로 부족함 | “생산성 웹앱처럼 차분하고 완성도 있게 UI를 개선해줘.” | 색상, 카드, 버튼, spacing, empty state, 반응형 개선 | 과제 제출용으로 보기 좋은 UI/UX 완성 |
| 체크박스 UI가 딱딱함 | “중요 표시와 중요 필터를 별 아이콘 토글로 바꿔줘.” | 기존 checkbox 값은 유지하고 보이는 UI만 토글 버튼으로 개선 | 기능 로직은 유지하면서 중요 표시 UX 개선 |
| 브라우저 캐시로 이전 JS/CSS가 보임 | “변경한 UI가 브라우저에서 바로 반영되도록 캐시 문제를 줄여줘.” | 정적 파일 링크에 version query 적용 | `style.css?v=ui-polish`, `app.js?v=ui-polish`로 변경 반영 안정화 |

---

## 4. AI 활용 결과 정리

| 구분 | 결과 |
| --- | --- |
| 설계 결과 | Docker Compose 기반 3-tier 구조 확정 |
| Backend 결과 | Node.js + Express REST API 구현 |
| Frontend 결과 | HTML/CSS/JavaScript 기반 반응형 UI 구현 |
| Database 결과 | MySQL `notes` 테이블 및 persistence volume 구성 |
| Infra 결과 | `frontend`, `backend`, `mysql` 다중 컨테이너 실행 환경 구성 |
| Troubleshooting 결과 | Docker daemon, 포트, DB 연결, UTF-8 문제 해결 |
| 문서화 결과 | README, Docker Compose 설명, 프로젝트 설계 문서, AI 프롬프트 기록 작성 |

---

## 5. 최종 구현 상태

| 기능 | 구현 여부 | 설명 |
| --- | --- | --- |
| 노트 작성(Create) | 완료 | 제목, 내용, 카테고리, 중요 여부 입력 가능 |
| 노트 조회(Read) | 완료 | 저장된 노트 목록 조회 가능 |
| 노트 수정(Update) | 완료 | 기존 노트 내용을 폼에 불러와 수정 가능 |
| 노트 삭제(Delete) | 완료 | 노트 카드에서 삭제 가능 |
| 검색 기능 | 완료 | 제목/내용 기반 검색 가능 |
| 카테고리 필터 | 완료 | 선택한 카테고리 기준 필터링 가능 |
| 중요 노트 표시 | 완료 | 별 아이콘 기반 중요 표시 가능 |
| 중요 노트 필터 | 완료 | 중요 표시된 노트만 조회 가능 |
| 반응형 UI | 완료 | 데스크톱/모바일 레이아웃 대응 |
| Docker Compose 실행 | 완료 | `docker compose up --build -d`로 전체 실행 가능 |
| MySQL persistence | 완료 | `mysql-data` volume으로 데이터 유지 |
| UTF-8 한글 처리 | 완료 | `utf8mb4` 기반 한글 저장/조회 지원 |
| UI/UX 개선 | 완료 | 제출용 생산성 웹앱 스타일로 개선 |

---

## 6. 제출용 설명 문장

본 프로젝트는 AI를 활용하여 초기 설계, 3-tier 아키텍처 구성, Backend API 구현, Frontend UI 구현, Docker Compose 통합, MySQL persistence 구성, UTF-8 한글 처리, UI/UX 개선, README 문서화까지 단계적으로 진행했습니다. 단순 코드 생성에 그치지 않고 Docker daemon 오류, 포트 충돌, DB 연결 대기, 한글 인코딩, 브라우저 캐시와 같은 실제 개발 과정의 troubleshooting도 함께 수행하여 과제 제출용 프로젝트 완성도를 높였습니다.
