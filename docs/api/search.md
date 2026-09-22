# Search API

Base path: `/api/search`

Search returns public content across published articles, categories, tags, and authors.

## Endpoints

| Method | Endpoint | Access | Description |
| --- | --- | --- | --- |
| `GET` | `/api/search` | Public | Full-text search across published articles. |
| `GET` | `/api/search/suggestions` | Public | Autocomplete suggestions. |
| `GET` | `/api/search/trending` | Public | Trending searches or articles. |

## Search Articles

`GET /api/search?q=election&page=1&limit=10&category=politics&sort=relevance`

```json
{
  "success": true,
  "data": [
    {
      "type": "article",
      "id": "65f0a1b2c3d4e5f678901234",
      "title": "Election panel announces new transparency rules",
      "slug": "election-panel-announces-new-transparency-rules",
      "excerpt": "The commission will require weekly digital disclosures.",
      "category": "Politics",
      "publishedAt": "2026-06-18T09:00:00.000Z",
      "score": 0.94
    }
  ],
  "meta": {
    "query": "election",
    "page": 1,
    "limit": 10,
    "total": 7
  }
}
```

Recommendations:

- Index `title`, `excerpt`, `content`, `tags`, `category.name`, and `author.name`.
- Filter results to `status=published`.
- Paginate every result set.
