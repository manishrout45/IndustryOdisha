# Authentication API

Base path: `/api/auth`

The authentication API issues JWT-based sessions for readers, authors, editors, moderators, admins, and super admins. Clients may send the token as an `Authorization: Bearer <token>` header or as an HTTP-only cookie named `token`.

## User Model

```json
{
  "id": "65f0a1b2c3d4e5f678901234",
  "name": "Maya Sen",
  "email": "maya@example.com",
  "role": "journalist",
  "avatarUrl": "https://cdn.example.com/avatar.jpg",
  "bio": "Politics reporter",
  "isActive": true,
  "createdAt": "2026-06-18T08:00:00.000Z",
  "updatedAt": "2026-06-18T08:00:00.000Z"
}
```

Supported roles: `subscriber`, `journalist`, `editor`, `moderator`, `admin`, `super_admin`.

## Endpoints

| Method | Endpoint | Access | Description |
| --- | --- | --- | --- |
| `POST` | `/api/auth/register` | Public | Create a reader/subscriber account. |
| `POST` | `/api/auth/login` | Public | Authenticate and return a token plus user profile. |
| `POST` | `/api/auth/logout` | Authenticated | Clear the session cookie. |
| `GET` | `/api/auth/me` | Authenticated | Return the current user profile. |
| `PATCH` | `/api/auth/me` | Authenticated | Update current user's profile fields. |
| `PATCH` | `/api/auth/change-password` | Authenticated | Change password after verifying current password. |
| `POST` | `/api/auth/forgot-password` | Public | Request a password reset link. |
| `POST` | `/api/auth/reset-password` | Public | Reset password using a reset token. |

## Register

`POST /api/auth/register`

```json
{
  "name": "Aarav Sharma",
  "email": "aarav@example.com",
  "password": "StrongPassword123!"
}
```

Response `201`:

```json
{
  "success": true,
  "message": "Account created",
  "data": {
    "token": "jwt-token",
    "user": {
      "id": "65f0a1b2c3d4e5f678901234",
      "name": "Aarav Sharma",
      "email": "aarav@example.com",
      "role": "subscriber"
    }
  }
}
```

## Login

`POST /api/auth/login`

```json
{
  "email": "maya@example.com",
  "password": "StrongPassword123!"
}
```

Response `200`:

```json
{
  "success": true,
  "message": "Logged in",
  "data": {
    "token": "jwt-token",
    "user": {
      "id": "65f0a1b2c3d4e5f678901234",
      "name": "Maya Sen",
      "email": "maya@example.com",
      "role": "journalist"
    }
  }
}
```

## Authorization Rules

- Subscribers can manage their own profile and comments.
- Journalists can create and edit their own draft articles.
- Editors can review, schedule, publish, and reject articles.
- Moderators can approve, hide, and delete comments.
- Admins can manage users, categories, tags, media, ads, SEO, and homepage sections.
- Super admins can manage platform settings and administrator accounts.

## Error Responses

Use the same shape for all authentication errors:

```json
{
  "success": false,
  "message": "Invalid email or password",
  "errors": []
}
```

Recommended status codes:

- `400` for validation failures.
- `401` for missing or invalid credentials.
- `403` for authenticated users without permission.
- `409` when an email is already registered.
*** Update File: docs/api/articles.md
# Articles API

Base path: `/api/articles`

Articles are the core publishing resource. The API supports public reading, editorial workflows, drafts, scheduling, SEO metadata, tags, categories, media, and author attribution.

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
    "description": "New spending disclosure rules explained.",
    "canonicalUrl": "https://example.com/articles/election-panel-announces-new-transparency-rules"
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
| `GET` | `/api/articles/admin` | Editor/Admin | List all article statuses for dashboard workflows. |
| `POST` | `/api/articles` | Journalist+ | Create a draft article. |
| `PATCH` | `/api/articles/:id` | Owner/Editor/Admin | Update article content or metadata. |
| `PATCH` | `/api/articles/:id/status` | Editor/Admin | Change workflow status. |
| `DELETE` | `/api/articles/:id` | Admin | Archive or delete an article. |
| `POST` | `/api/articles/:id/feature` | Editor/Admin | Toggle featured placement. |

## List Articles

`GET /api/articles?page=1&limit=12&category=politics&tag=election&q=budget&sort=-publishedAt`

Response `200`:

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
      "featuredImage": {
        "url": "https://cdn.example.com/news/election.jpg",
        "alt": "Election officers at a polling booth"
      },
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
  },
  "seo": {
    "title": "Low-cost battery chemistry for bus fleets",
    "description": "Researchers test a new battery design for public transport."
  }
}
```

Response `201` returns the draft article.

## Update Status

`PATCH /api/articles/:id/status`

```json
{
  "status": "scheduled",
  "scheduledAt": "2026-06-20T04:30:00.000Z",
  "reviewNote": "Approved for morning edition."
}
```

Rules:

- Journalists may submit `draft` articles to `in_review`.
- Editors may move articles to `published`, `scheduled`, or `rejected`.
- Admins may archive published content.
- Published slugs must remain stable; use redirects if a slug changes.
*** Update File: docs/api/categories.md
# Categories API

Base path: `/api/categories`

Categories organize article sections such as Politics, Business, Technology, Culture, Sports, and Opinion.

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
  },
  "createdAt": "2026-06-18T08:00:00.000Z",
  "updatedAt": "2026-06-18T08:00:00.000Z"
}
```

## Endpoints

| Method | Endpoint | Access | Description |
| --- | --- | --- | --- |
| `GET` | `/api/categories` | Public | List visible categories. |
| `GET` | `/api/categories/:slug` | Public | Read one category with article count. |
| `POST` | `/api/categories` | Admin | Create a category. |
| `PATCH` | `/api/categories/:id` | Admin | Update category details. |
| `DELETE` | `/api/categories/:id` | Admin | Hide or delete an unused category. |
| `PATCH` | `/api/categories/reorder` | Admin | Persist navigation order. |

## Create Category

`POST /api/categories`

```json
{
  "name": "Technology",
  "description": "Startups, science, security, AI, and consumer technology.",
  "order": 3,
  "isVisible": true,
  "seo": {
    "title": "Technology News",
    "description": "Latest technology news and explainers."
  }
}
```

Response `201`:

```json
{
  "success": true,
  "message": "Category created",
  "data": {
    "id": "65f0a1b2c3d4e5f678901111",
    "name": "Technology",
    "slug": "technology",
    "isVisible": true
  }
}
```

## Validation Rules

- `name` is required and must be unique.
- `slug` is generated from `name` unless provided.
- A category with published articles should be hidden instead of deleted.
- `order` controls frontend navigation order.
*** Update File: docs/api/comments.md
# Comments API

Base path: `/api/comments`

Comments allow readers to discuss articles while giving moderators tools for review, hiding, and deletion.

## Comment Model

```json
{
  "id": "65f0a1b2c3d4e5f678903333",
  "articleId": "65f0a1b2c3d4e5f678901234",
  "userId": "65f0a1b2c3d4e5f678904444",
  "parentId": null,
  "body": "Clear explainer. The disclosure timeline is the key detail.",
  "status": "approved",
  "createdAt": "2026-06-18T10:00:00.000Z",
  "updatedAt": "2026-06-18T10:00:00.000Z"
}
```

Statuses: `pending`, `approved`, `hidden`, `spam`, `deleted`.

## Endpoints

| Method | Endpoint | Access | Description |
| --- | --- | --- | --- |
| `GET` | `/api/comments/article/:articleId` | Public | List approved comments for an article. |
| `POST` | `/api/comments` | Authenticated | Add a comment or reply. |
| `GET` | `/api/comments/moderation` | Moderator/Admin | List comments requiring review. |
| `PATCH` | `/api/comments/:id` | Owner/Moderator | Edit comment text or moderation status. |
| `DELETE` | `/api/comments/:id` | Owner/Moderator/Admin | Soft-delete a comment. |

## Add Comment

`POST /api/comments`

```json
{
  "articleId": "65f0a1b2c3d4e5f678901234",
  "parentId": null,
  "body": "Would love to see a follow-up on regional compliance."
}
```

Response `201`:

```json
{
  "success": true,
  "message": "Comment submitted",
  "data": {
    "id": "65f0a1b2c3d4e5f678903333",
    "status": "pending",
    "body": "Would love to see a follow-up on regional compliance."
  }
}
```

## Moderation

`PATCH /api/comments/:id`

```json
{
  "status": "approved",
  "moderationNote": "Constructive and on topic."
}
```

Rules:

- Anonymous comments are not accepted by default.
- New comments should start as `pending` unless trusted-user auto approval is enabled.
- Deletion should be soft deletion to preserve discussion thread integrity.
- Moderators may hide comments without deleting the record.
*** Update File: docs/api/search.md
# Search API

Base path: `/api/search`

Search returns published content across articles, categories, tags, and authors. It should only expose public records.

## Endpoints

| Method | Endpoint | Access | Description |
| --- | --- | --- | --- |
| `GET` | `/api/search` | Public | Full-text search across published articles. |
| `GET` | `/api/search/suggestions` | Public | Return autocomplete suggestions. |
| `GET` | `/api/search/trending` | Public | Return trending queries or articles. |

## Search Articles

`GET /api/search?q=election&page=1&limit=10&category=politics&sort=relevance`

Response `200`:

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

## Suggestions

`GET /api/search/suggestions?q=ele`

```json
{
  "success": true,
  "data": [
    { "label": "Election", "type": "tag", "value": "election" },
    { "label": "Election Commission", "type": "topic", "value": "election commission" }
  ]
}
```

## Indexing Recommendations

- Index `title`, `excerpt`, `content`, `tags`, `category.name`, and `author.name`.
- Filter results to `status=published`.
- Apply pagination to every search endpoint.
- Store query analytics separately from user-identifiable data unless consent is required.
*** Update File: docs/api/tags.md
# Tags API

Base path: `/api/tags`

Tags provide topic-level grouping for article discovery and SEO landing pages.

## Tag Model

```json
{
  "id": "65f0a1b2c3d4e5f678905555",
  "name": "Election",
  "slug": "election",
  "description": "Election news, polling, campaigns, and analysis.",
  "articleCount": 18,
  "createdAt": "2026-06-18T08:00:00.000Z",
  "updatedAt": "2026-06-18T08:00:00.000Z"
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

`POST /api/tags`

```json
{
  "name": "Climate",
  "description": "Climate science, policy, adaptation, and energy transition."
}
```

Response `201`:

```json
{
  "success": true,
  "message": "Tag created",
  "data": {
    "id": "65f0a1b2c3d4e5f678905555",
    "name": "Climate",
    "slug": "climate"
  }
}
```

## Rules

- Tag names are unique case-insensitively.
- Slugs should be lowercase and URL safe.
- Merge duplicate tags instead of deleting them when articles are attached.
- Public tag pages should only count published articles.
*** Update File: docs/api/users.md
# Users API

Base path: `/api/users`

The users API supports administration, author profiles, role assignment, and account lifecycle management.

## User Model

```json
{
  "id": "65f0a1b2c3d4e5f678902222",
  "name": "Maya Sen",
  "email": "maya@example.com",
  "role": "journalist",
  "avatarUrl": "https://cdn.example.com/avatar.jpg",
  "bio": "Politics reporter covering elections and public policy.",
  "social": {
    "x": "https://x.com/mayasen",
    "website": "https://example.com/maya"
  },
  "isActive": true,
  "createdAt": "2026-06-18T08:00:00.000Z",
  "updatedAt": "2026-06-18T08:00:00.000Z"
}
```

## Endpoints

| Method | Endpoint | Access | Description |
| --- | --- | --- | --- |
| `GET` | `/api/users/authors` | Public | List public author profiles. |
| `GET` | `/api/users/authors/:id` | Public | Get an author profile and published articles. |
| `GET` | `/api/users` | Admin | List users with filters. |
| `POST` | `/api/users` | Admin | Create a staff account. |
| `PATCH` | `/api/users/:id` | Admin or self | Update profile or admin-managed fields. |
| `PATCH` | `/api/users/:id/role` | Admin/Super Admin | Change role. |
| `PATCH` | `/api/users/:id/status` | Admin | Activate or suspend account. |
| `DELETE` | `/api/users/:id` | Super Admin | Delete account when legally permitted. |

## List Users

`GET /api/users?role=journalist&status=active&page=1&limit=20`

```json
{
  "success": true,
  "data": [
    {
      "id": "65f0a1b2c3d4e5f678902222",
      "name": "Maya Sen",
      "email": "maya@example.com",
      "role": "journalist",
      "isActive": true
    }
  ],
  "meta": {
    "page": 1,
    "limit": 20,
    "total": 1,
    "pages": 1
  }
}
```

## Create Staff User

`POST /api/users`

```json
{
  "name": "Nisha Rao",
  "email": "nisha@example.com",
  "role": "editor",
  "temporaryPassword": "ChangeMe123!"
}
```

Rules:

- Only admins can create staff users.
- Only super admins can create or modify admin-level users.
- Public author profiles must not expose email addresses unless explicitly allowed.
- Deactivation should revoke sessions and prevent publishing actions.
