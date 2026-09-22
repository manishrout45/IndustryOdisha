# Categories API

Base path: `/api/categories`

Categories organize the public navigation and article archive pages.

## Category Model

```json
{
  "id": "65f0a1b2c3d4e5f678901111",
  "name": "Politics",
  "slug": "politics",
  "description": "Government, policy, elections, and public affairs.",
  "parentId": null,
  "order": 1,
  "isVisible": true,
  "seo": {
    "title": "Politics News",
    "description": "Latest political news and analysis."
  }
}
```

## Endpoints

| Method | Endpoint | Access | Description |
| --- | --- | --- | --- |
| `GET` | `/api/categories` | Public | List visible categories. |
| `GET` | `/api/categories/:slug` | Public | Read a category and its article count. |
| `POST` | `/api/categories` | Admin | Create a category. |
| `PATCH` | `/api/categories/:id` | Admin | Update a category. |
| `DELETE` | `/api/categories/:id` | Admin | Hide or delete an unused category. |
| `PATCH` | `/api/categories/reorder` | Admin | Persist navigation order. |

## Create Category

```json
{
  "name": "Technology",
  "description": "Startups, science, security, AI, and consumer technology.",
  "order": 3,
  "isVisible": true
}
```

Rules:

- `name` is required and unique.
- `slug` is generated from `name` unless provided.
- Categories with published articles should be hidden instead of deleted.
- `order` controls frontend navigation order.
