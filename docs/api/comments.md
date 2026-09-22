# Comments API

Base path: `/api/comments`

Comments support reader discussion with moderation controls.

## Comment Model

```json
{
  "id": "65f0a1b2c3d4e5f678903333",
  "articleId": "65f0a1b2c3d4e5f678901234",
  "userId": "65f0a1b2c3d4e5f678904444",
  "parentId": null,
  "body": "Clear explainer. The disclosure timeline is the key detail.",
  "status": "approved",
  "createdAt": "2026-06-18T10:00:00.000Z"
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

```json
{
  "articleId": "65f0a1b2c3d4e5f678901234",
  "parentId": null,
  "body": "Would love to see a follow-up on regional compliance."
}
```

Rules:

- New comments should start as `pending` unless trusted-user auto approval is enabled.
- Soft deletion preserves thread context.
- Moderators may hide comments without deleting the record.
