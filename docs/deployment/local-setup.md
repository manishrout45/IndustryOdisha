# Local Setup

This guide starts the NewsPortal project on a developer machine.

## Requirements

- Node.js 20 or newer.
- MongoDB running locally or a MongoDB Atlas connection string.
- Git.
- Optional: Cloudinary account for hosted media uploads.

## Environment Variables

Create `backend/.env` from `backend/.env.example`.

```env
NODE_ENV=development
PORT=5000
MONGODB_URI=mongodb://127.0.0.1:27017/news-portal
JWT_SECRET=change-this-in-local-development
JWT_EXPIRES_IN=7d
JWT_COOKIE_EXPIRES_IN=7
CLIENT_URL=http://localhost:5173
ADMIN_URL=http://localhost:5174
AUTHOR_URL=http://localhost:5175
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
```

## Install Dependencies

```bash
cd client
npm install
```

```bash
cd ../frontend/public-website
npm install
```

```bash
cd ../admin-dashboard
npm install
```

```bash
cd ../author-dashboard
npm install
```

```bash
cd ../../server
npm install
```

If `npm` is broken globally on Windows, use the existing local Vite executable from an app that already has `node_modules`:

```bash
node node_modules/vite/bin/vite.js
node node_modules/vite/bin/vite.js build
```

## Run Frontends

Public client:

```bash
cd client
npm run dev
```

Public website app:

```bash
cd frontend/public-website
npm run dev -- --port 5173
```

Admin dashboard:

```bash
cd frontend/admin-dashboard
npm run dev -- --port 5174
```

Author dashboard:

```bash
cd frontend/author-dashboard
npm run dev -- --port 5175
```

## Run Backend

The backend should expose Express on port `5000`.

Recommended scripts for `server/package.json` or `backend/package.json`:

```json
{
  "scripts": {
    "dev": "node src/index.js",
    "start": "NODE_ENV=production node src/index.js"
  }
}
```

Then run:

```bash
cd server
npm run dev
```

## Verify

- Public client: `http://localhost:5173`
- Admin dashboard: `http://localhost:5174`
- Author dashboard: `http://localhost:5175`
- API health: `http://localhost:5000/api/health`

## Common Issues

- MongoDB connection fails: confirm `MONGODB_URI` and that MongoDB is running.
- CORS error: confirm `CLIENT_URL`, `ADMIN_URL`, and `AUTHOR_URL`.
- JWT error: set a non-empty `JWT_SECRET`.
- Upload errors: configure Cloudinary keys or use local upload storage.
*** Update File: docs/deployment/docker-guide.md
# Docker Guide

The `infrastructure/docker` folder is intended to run the frontend apps, backend API, and MongoDB as containers.

## Expected Files

```text
infrastructure/docker/
  Dockerfile.backend
  Dockerfile.frontend
  docker-compose.yml
  docker-compose.prod.yml
```

## Development Compose

Use the development compose file when you want local containers with mounted source code.

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

## Frontend Image

A frontend Dockerfile should:

1. Install dependencies.
2. Build the Vite app.
3. Serve the static `dist` folder with Nginx.

Example:

```dockerfile
FROM node:22-alpine AS build
WORKDIR /app
COPY client/package*.json ./
RUN npm ci
COPY client/ ./
RUN npm run build

FROM nginx:1.27-alpine
COPY --from=build /app/dist /usr/share/nginx/html
COPY infrastructure/nginx/frontend.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
```

## Backend Image

Example:

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

Use production compose for immutable images, persistent volumes, and no source bind mounts.

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
docker volume ls
```

## Backup MongoDB

```bash
docker exec news-portal-mongo mongodump --archive=/tmp/news-portal.archive
docker cp news-portal-mongo:/tmp/news-portal.archive ./news-portal.archive
```
*** Update File: docs/deployment/nginx-config.md
# Nginx Configuration

Nginx should terminate HTTP/HTTPS traffic and route requests to the public website, dashboards, and API.

## Routing Plan

| Host | Target |
| --- | --- |
| `news.example.com` | Public website or `client` build |
| `admin.news.example.com` | Admin dashboard |
| `author.news.example.com` | Author dashboard |
| `api.news.example.com` | Express API |

## Public Frontend Config

```nginx
server {
  listen 80;
  server_name news.example.com;

  root /var/www/news-portal/public;
  index index.html;

  location / {
    try_files $uri $uri/ /index.html;
  }

  location /assets/ {
    expires 30d;
    add_header Cache-Control "public, immutable";
  }
}
```

## Dashboard Config

```nginx
server {
  listen 80;
  server_name admin.news.example.com;

  root /var/www/news-portal/admin;
  index index.html;

  location / {
    try_files $uri $uri/ /index.html;
  }
}
```

## API Reverse Proxy

```nginx
server {
  listen 80;
  server_name api.news.example.com;

  client_max_body_size 20m;

  location / {
    proxy_pass http://127.0.0.1:5000;
    proxy_http_version 1.1;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
  }
}
```

## Single-Domain Alternative

If everything is served under one domain:

```nginx
server {
  listen 80;
  server_name news.example.com;

  root /var/www/news-portal/public;
  index index.html;

  location /api/ {
    proxy_pass http://127.0.0.1:5000/api/;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
  }

  location /admin/ {
    alias /var/www/news-portal/admin/;
    try_files $uri $uri/ /admin/index.html;
  }

  location /author/ {
    alias /var/www/news-portal/author/;
    try_files $uri $uri/ /author/index.html;
  }

  location / {
    try_files $uri $uri/ /index.html;
  }
}
```

## Validate and Reload

```bash
sudo nginx -t
sudo systemctl reload nginx
```
*** Update File: docs/deployment/production-setup.md
# Production Setup

This guide describes a production deployment for NewsPortal using Node.js, MongoDB, Nginx, and optional Docker.

## Server Requirements

- Ubuntu 22.04 or newer.
- 2 CPU cores minimum.
- 4 GB RAM minimum for small deployments.
- 20 GB disk minimum, plus storage for uploads and backups.
- Node.js 20+ if running without Docker.
- MongoDB 7+ or MongoDB Atlas.
- Nginx.
- TLS certificate via Let’s Encrypt or another CA.

## Environment

Production `.env` should not be committed.

```env
NODE_ENV=production
PORT=5000
MONGODB_URI=mongodb+srv://user:password@cluster/news-portal
JWT_SECRET=long-random-production-secret
JWT_EXPIRES_IN=7d
JWT_COOKIE_EXPIRES_IN=7
CLIENT_URL=https://news.example.com
ADMIN_URL=https://admin.news.example.com
AUTHOR_URL=https://author.news.example.com
CLOUDINARY_CLOUD_NAME=your-cloud
CLOUDINARY_API_KEY=your-key
CLOUDINARY_API_SECRET=your-secret
```

## Build Frontends

```bash
cd client
npm ci
npm run build
```

```bash
cd ../frontend/admin-dashboard
npm ci
npm run build
```

```bash
cd ../author-dashboard
npm ci
npm run build
```

Copy each `dist` folder to its Nginx web root:

```bash
sudo mkdir -p /var/www/news-portal/public
sudo mkdir -p /var/www/news-portal/admin
sudo mkdir -p /var/www/news-portal/author
sudo cp -r client/dist/* /var/www/news-portal/public/
sudo cp -r frontend/admin-dashboard/dist/* /var/www/news-portal/admin/
sudo cp -r frontend/author-dashboard/dist/* /var/www/news-portal/author/
```

## Run Backend with PM2

```bash
cd server
npm ci --omit=dev
pm2 start src/index.js --name news-portal-api
pm2 save
pm2 startup
```

## Nginx

Install Nginx and copy configs from `infrastructure/nginx`.

```bash
sudo cp infrastructure/nginx/*.conf /etc/nginx/conf.d/
sudo nginx -t
sudo systemctl reload nginx
```

## Database

Use MongoDB Atlas for managed backups and monitoring, or install MongoDB locally with a persistent data volume.

Recommended production indexes:

- `users.email` unique.
- `articles.slug` unique.
- `articles.status + publishedAt`.
- `comments.articleId + status + createdAt`.
- Text index on article search fields.

## Release Checklist

- Build all frontend apps.
- Run backend tests.
- Verify `.env` values.
- Confirm MongoDB connectivity.
- Run database migrations or seed scripts if needed.
- Reload PM2 or Docker containers.
- Reload Nginx after config changes.
- Verify health endpoint.
- Verify login, publish, search, comments, and uploads.
- Confirm backups are running.
*** Update File: docs/deployment/ssl-setup.md
# SSL Setup

Production deployments should use HTTPS for all frontend and API hosts.

## Let’s Encrypt with Certbot

Install Certbot:

```bash
sudo apt update
sudo apt install certbot python3-certbot-nginx
```

Issue certificates:

```bash
sudo certbot --nginx \
  -d news.example.com \
  -d admin.news.example.com \
  -d author.news.example.com \
  -d api.news.example.com
```

Certbot updates Nginx automatically when possible.

## Manual HTTPS Server Block

```nginx
server {
  listen 443 ssl http2;
  server_name news.example.com;

  ssl_certificate /etc/letsencrypt/live/news.example.com/fullchain.pem;
  ssl_certificate_key /etc/letsencrypt/live/news.example.com/privkey.pem;

  add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;

  root /var/www/news-portal/public;
  index index.html;

  location / {
    try_files $uri $uri/ /index.html;
  }
}

server {
  listen 80;
  server_name news.example.com;
  return 301 https://$host$request_uri;
}
```

## API Cookie Settings

When using HTTPS, configure auth cookies as:

```js
{
  httpOnly: true,
  secure: true,
  sameSite: 'none',
  maxAge: 7 * 24 * 60 * 60 * 1000
}
```

Use `sameSite: 'lax'` if the API and frontend share the same site.

## Renewal

Certbot installs a system timer by default.

```bash
sudo systemctl list-timers | grep certbot
sudo certbot renew --dry-run
```

## Security Headers

Recommended headers:

```nginx
add_header X-Content-Type-Options "nosniff" always;
add_header X-Frame-Options "SAMEORIGIN" always;
add_header Referrer-Policy "strict-origin-when-cross-origin" always;
add_header Permissions-Policy "camera=(), microphone=(), geolocation=()" always;
```

Avoid enabling a strict Content Security Policy until all analytics, ad, media, and CDN domains are known.
