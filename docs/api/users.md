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
  "isActive": true
}
```

## Endpoints

| Method | Endpoint | Access | Description |
| --- | --- | --- | --- |
| `GET` | `/api/users/authors` | Public | List public author profiles. |
| `GET` | `/api/users/authors/:id` | Public | Get an author profile and published articles. |
| `GET` | `/api/users` | Admin | List users with filters. |
| `POST` | `/api/users` | Admin | Create a staff account. |
| `PATCH` | `/api/users/:id` | Admin or self | Update profile fields. |
| `PATCH` | `/api/users/:id/role` | Admin/Super Admin | Change role. |
| `PATCH` | `/api/users/:id/status` | Admin | Activate or suspend account. |
| `DELETE` | `/api/users/:id` | Super Admin | Delete account when permitted. |

Rules:

- Only admins can create staff users.
- Only super admins can create or modify admin-level users.
- Public author profiles must not expose email addresses unless explicitly allowed.
- Deactivation should revoke sessions and prevent publishing actions.
