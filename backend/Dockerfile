FROM node:20-alpine

WORKDIR /app
RUN chown node:node /app

COPY --chown=node:node package*.json ./
USER node
RUN npm ci --omit=dev

COPY --chown=node:node src ./src
COPY --chown=node:node .env.example ./.env.example

ENV NODE_ENV=production
ENV PORT=5001

EXPOSE 5001

CMD ["npm", "start"]
