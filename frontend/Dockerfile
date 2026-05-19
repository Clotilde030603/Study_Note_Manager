FROM nginx:1.27-alpine

WORKDIR /usr/share/nginx/html

RUN apk add --no-cache gettext

COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY index.html ./index.html
COPY css ./css
COPY js ./js
COPY env.template.js ./env.template.js
COPY env.js ./env.js
COPY docker-entrypoint.sh /docker-entrypoint.sh

ENV API_BASE_URL=/api

EXPOSE 80

ENTRYPOINT ["/docker-entrypoint.sh"]
