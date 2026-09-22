# Folder Structure

```text
news-portal/
  backend/
  client/
  docs/
  frontend/
    public-website/
    admin-dashboard/
    author-dashboard/
  infrastructure/
    docker/
    nginx/
    scripts/
  server/
  shared/
```

## `client`

Complete React + Vite public news portal frontend.

- `src/App.jsx`: app views, state, search, article page, dashboard preview.
- `src/data/news.js`: sample newsroom data.
- `src/App.css`: responsive UI styles.
- `src/index.css`: global reset.

## `frontend`

Contains three deployable apps:

- `public-website`: reader-facing website.
- `admin-dashboard`: administrator workspace.
- `author-dashboard`: journalist workspace.

Each app includes Vite config, HTML entry, React entry, routes, layouts, pages, components, and styles.

## `backend` and `server`

Backend workspace using Express, Mongoose, JWT, bcrypt, multer, Cloudinary, CORS, cookie-parser, and dotenv.

Recommended final backend layout:

```text
backend/src/
  config/
  controllers/
  middleware/
  models/
  routes/
  services/
  utils/
  validators/
```

## `shared`

Shared contracts and helpers:

- `constants`: roles, permissions, statuses, API endpoints.
- `validators`: payload validators.
- `types`: TypeScript-style resource contracts.
- `utils`: slugging, SEO, pagination, dates, images.

## `infrastructure`

Deployment support:

- `docker`: Dockerfiles and Compose files.
- `nginx`: reverse proxy and SSL snippets.
- `scripts`: start, stop, deploy, backup, restore.

## `docs`

- `api`: endpoint contracts.
- `architecture`: schema and system design.
- `deployment`: setup and release guides.
- `roles`: permission documentation.
