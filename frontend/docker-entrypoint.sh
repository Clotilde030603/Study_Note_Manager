#!/bin/sh
set -eu

# Docker 실행 시 API_BASE_URL 환경변수를 env.js에 기록해 JS가 API 주소를 환경별로 바꿀 수 있게 한다.
: "${API_BASE_URL:=/api}"
envsubst '${API_BASE_URL}' < /usr/share/nginx/html/env.template.js > /usr/share/nginx/html/env.js

exec nginx -g 'daemon off;'
