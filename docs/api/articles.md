# Articles API

Base path: `/api/articles`

Articles are the main publishing resource. Public endpoints return only published content; dashboard endpoints expose drafts, review queues, scheduled stories, and archived stories to authorized users.

## Article Model

```json
{
  "id": "65f0a1b2c3d4e5f678901234",
  "title": "Election panel announces new transparency rules",
  "slug": "election-panel-announces-new-transparency-rules",
  "excerpt": "The commission will require weekly digital disclosures.",
  "content": "<p>Full article body...</p>",
  "status": "published",
  "categoryId": "65f0a1b2c3d4e5f678901111",
  "tags": ["election", "policy"],
  "authorId": "65f0a1b2c3d4e5f678902222",
  "featuredImage": {
    "url": "https://cdn.example.com/news/election.jpg",
    "alt": "Election officers at a polling booth"
  },
  "seo": {
    "title": "Election transparency rules announced",
    "description": "New spending disclosure rules explained."
  },
  "publishedAt": "2026-06-18T09:00:00.000Z",
  "createdAt": "2026-06-18T08:00:00.000Z",
  "updatedAt": "2026-06-18T08:45:00.000Z"
}
```

Statuses: `draft`, `in_review`, `scheduled`, `published`, `rejected`, `archived`.

## Endpoints

| Method | Endpoint | Access | Description |
| --- | --- | --- | --- |
| `GET` | `/api/articles` | Public | List published articles with filters. |
| `GET` | `/api/articles/:slug` | Public | Read a published article by slug. |
| `GET` | `/api/articles/admin` | Editor/Admin | List all statuses for dashboards. |
| `POST` | `/api/articles` | Journalist+ | Create a draft article. |
| `PATCH` | `/api/articles/:id` | Owner/Editor/Admin | Update article content or metadata. |
| `PATCH` | `/api/articles/:id/status` | Editor/Admin | Change workflow status. |
| `DELETE` | `/api/articles/:id` | Admin | Archive or delete an article. |

## List Articles

`GET /api/articles?page=1&limit=12&category=politics&tag=election&q=budget&sort=-publishedAt`

```json
{
  "success": true,
  "data": [
    {
      "id": "65f0a1b2c3d4e5f678901234",
      "title": "Election panel announces new transparency rules",
      "slug": "election-panel-announces-new-transparency-rules",
      "excerpt": "The commission will require weekly digital disclosures.",
      "category": "Politics",
      "author": "Maya Sen",
      "publishedAt": "2026-06-18T09:00:00.000Z"
    }
  ],
  "meta": {
    "page": 1,
    "limit": 12,
    "total": 48,
    "pages": 4
  }
}
```

## Create Article

`POST /api/articles`

```json
{
  "title": "Researchers unveil low-cost battery chemistry",
  "excerpt": "A pilot could reduce replacement costs for city bus fleets.",
  "content": "<p>The project uses abundant materials...</p>",
  "categoryId": "65f0a1b2c3d4e5f678901111",
  "tags": ["technology", "transport"],
  "featuredImage": {
    "url": "https://cdn.example.com/news/battery.jpg",
    "alt": "Battery cells in a lab"
  }
}
```

## Status Update

`PATCH /api/articles/:id/status`

```json
{
  "status": "scheduled",
  "scheduledAt": "2026-06-20T04:30:00.000Z",
  "reviewNote": "Approved for morning edition."
}
```

Rules:

- Journalists may submit their own drafts to `in_review`.
- Editors may publish, reject, or schedule.
- Admins may archive published content.
- Published slugs should remain stable.
