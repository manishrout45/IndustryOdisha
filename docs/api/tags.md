# Tags API

Base path: `/api/tags`

Tags provide topic-level grouping for discovery and SEO pages.

## Tag Model

```json
{
  "id": "65f0a1b2c3d4e5f678905555",
  "name": "Election",
  "slug": "election",
  "description": "Election news, polling, campaigns, and analysis.",
  "articleCount": 18
}
```

## Endpoints

| Method | Endpoint | Access | Description |
| --- | --- | --- | --- |
| `GET` | `/api/tags` | Public | List tags with article counts. |
| `GET` | `/api/tags/:slug` | Public | Get one tag and recent articles. |
| `POST` | `/api/tags` | Editor/Admin | Create a tag. |
| `PATCH` | `/api/tags/:id` | Editor/Admin | Update tag metadata. |
| `DELETE` | `/api/tags/:id` | Admin | Remove an unused tag. |

## Create Tag

```json
{
  "name": "Climate",
  "description": "Climate science, policy, adaptation, and energy transition."
}
```

Rules:

- Tag names are unique case-insensitively.
- Slugs should be lowercase and URL safe.
- Merge duplicate tags instead of deleting them when articles are attached.
