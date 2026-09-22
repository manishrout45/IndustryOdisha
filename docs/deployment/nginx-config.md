# Nginx Configuration

Nginx should route traffic to the public website, dashboards, and API.

## Routing Plan

| Host | Target |
| --- | --- |
| `news.example.com` | Public website or `client` build |
| `admin.news.example.com` | Admin dashboard |
| `author.news.example.com` | Author dashboard |
| `api.news.example.com` | Express API |

## Public Frontend

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
