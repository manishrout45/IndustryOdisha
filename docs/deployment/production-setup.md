# Production Setup

This guide describes a production deployment for NewsPortal using Node.js, MongoDB, Nginx, and optional Docker.

## Server Requirements

- Ubuntu 22.04 or newer.
- Node.js 20+ if running without Docker.
- MongoDB 7+ or MongoDB Atlas.
- Nginx.
- TLS certificate.
- At least 2 CPU cores, 4 GB RAM, and persistent disk for uploads/backups.

## Production Environment

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

Copy `dist` outputs to Nginx web roots:

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

## Release Checklist

- Build all frontend apps.
- Run backend tests.
- Verify `.env` values.
- Confirm MongoDB connectivity.
- Apply indexes or migrations.
- Reload PM2 or Docker containers.
- Test Nginx config and reload.
- Verify login, publishing, search, comments, and uploads.
- Confirm backups and logs.
