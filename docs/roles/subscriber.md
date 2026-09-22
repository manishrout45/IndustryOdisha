# Subscriber Role

Subscribers are registered readers. They can personalize their account, comment on articles, and access subscriber features when enabled.

## Responsibilities

- Maintain their own account details.
- Follow community guidelines.
- Report content or comments that violate policy.
- Manage newsletter or notification preferences when available.

## Permissions

Subscribers can:

- Read public articles.
- Create and manage their own comments.
- Edit their own profile.
- Save or bookmark articles if enabled.
- Subscribe to newsletters if enabled.

Subscribers cannot:

- Access dashboards.
- Create or edit articles.
- Moderate comments.
- Manage categories, tags, users, ads, or settings.

## Account Fields

```json
{
  "name": "Aarav Sharma",
  "email": "aarav@example.com",
  "role": "subscriber",
  "avatarUrl": "https://cdn.example.com/avatar.jpg",
  "preferences": {
    "newsletter": true,
    "topics": ["Politics", "Technology"]
  }
}
```

## Comment Rules

- Comments may require moderation before appearing publicly.
- Users can edit or delete their own comments within the configured policy.
- Repeated abuse may lead to suspension.
- Deleted comments should be soft-deleted to preserve thread context.
