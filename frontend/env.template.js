// README 설명용: Docker entrypoint가 API_BASE_URL 환경변수를 이 파일에 치환한다.
window.APP_CONFIG = {
  API_BASE_URL: "${API_BASE_URL}"
};
