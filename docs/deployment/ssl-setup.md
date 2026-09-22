# SSL Setup

Production deployments should use HTTPS for all frontend and API hosts.

## Let’s Encrypt with Certbot

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

## Manual HTTPS Block

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

```js
{
  httpOnly: true,
  secure: true,
  sameSite: 'none',
  maxAge: 7 * 24 * 60 * 60 * 1000
}
```

Use `sameSite: 'lax'` if frontend and API share the same site.

## Renewal

```bash
sudo systemctl list-timers | grep certbot
sudo certbot renew --dry-run
```

## Security Headers

```nginx
add_header X-Content-Type-Options "nosniff" always;
add_header X-Frame-Options "SAMEORIGIN" always;
add_header Referrer-Policy "strict-origin-when-cross-origin" always;
add_header Permissions-Policy "camera=(), microphone=(), geolocation=()" always;
```
