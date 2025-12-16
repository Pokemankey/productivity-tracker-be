FROM node:20-slim AS builder

WORKDIR /app

RUN apt-get update -y && apt-get install -y openssl

COPY package*.json ./
RUN npm ci

COPY prisma ./prisma
RUN npx prisma generate

COPY . .

RUN npm run build

FROM node:20-slim

WORKDIR /app

RUN apt-get update -y && apt-get install -y openssl

ENV NODE_ENV=production
ENV PRISMA_CLIENT_ENGINE_TYPE=library

COPY --from=builder /app/package*.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/prisma ./prisma

EXPOSE 3000

CMD ["node", "dist/src/main.js"]