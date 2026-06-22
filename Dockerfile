# ============================================================
# LMS Frontend - Docker Image
# ============================================================
#
# Build locally:
#   docker build -t lms-fe:local .
#
# Build with a custom API URL baked into the Vite bundle:
#   docker build --build-arg VITE_API_URL=/api/v1 -t lms-fe:local .
#
# Run with Compose using the backend service name:
#   docker compose -f ../LMS_backend/docker-compose.yml up -d frontend
#
# Run standalone against a backend on the host:
#   docker run -p 5173:80 -e API_UPSTREAM=http://host.docker.internal:3000 lms-fe:local
#
# ============================================================

FROM node:22-alpine AS build

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .

ARG VITE_API_URL=/api/v1
ENV VITE_API_URL=${VITE_API_URL}

RUN npm run build

FROM nginx:1.27-alpine

LABEL maintainer="LMS Frontend Team"
LABEL description="LMS Frontend - React, Vite, Nginx"
LABEL version="1.0.0"

ENV API_UPSTREAM=http://api:3000

COPY nginx.conf.template /etc/nginx/templates/default.conf.template
COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 80

HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD wget -qO- http://127.0.0.1/health || exit 1
