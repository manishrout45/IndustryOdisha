# Docker Guide

The `infrastructure/docker` folder is intended to run the frontend apps, backend API, and MongoDB as containers.

## Development Compose

```bash
cd infrastructure/docker
docker compose up --build
```

Recommended services:

```yaml
services:
  api:
    build:
      context: ../..
      dockerfile: infrastructure/docker/Dockerfile.backend
    env_file:
      - ../../backend/.env
    ports:
      - "5000:5000"
    depends_on:
      - mongo

  mongo:
    image: mongo:7
    ports:
      - "27017:27017"
    volumes:
      - mongo_data:/data/db

volumes:
  mongo_data:
```

## Frontend Dockerfile

```dockerfile
FROM node:22-alpine AS build
WORKDIR /app
COPY client/package*.json ./
RUN npm ci
COPY client/ ./
RUN npm run build

FROM nginx:1.27-alpine
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 80
```

## Backend Dockerfile

```dockerfile
FROM node:22-alpine
WORKDIR /app
COPY server/package*.json ./
RUN npm ci --omit=dev
COPY server/ ./
EXPOSE 5000
CMD ["node", "src/index.js"]
```

## Production Compose

```bash
cd infrastructure/docker
docker compose -f docker-compose.prod.yml up -d --build
```

## Useful Commands

```bash
docker compose ps
docker compose logs -f api
docker compose restart api
docker compose down
```

## Backup MongoDB

```bash
docker exec news-portal-mongo mongodump --archive=/tmp/news-portal.archive
docker cp news-portal-mongo:/tmp/news-portal.archive ./news-portal.archive
```
