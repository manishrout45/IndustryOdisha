# Workflow Diagrams

## Article Publishing Workflow

```mermaid
stateDiagram-v2
  [*] --> Draft
  Draft --> InReview: journalist submits
  InReview --> Draft: editor requests changes
  InReview --> Rejected: editor rejects
  InReview --> Scheduled: editor schedules
  InReview --> Published: editor publishes
  Scheduled --> Published: scheduled job runs
  Published --> Archived: admin archives
  Rejected --> Draft: journalist revises
  Archived --> [*]
```

## Comment Moderation Workflow

```mermaid
flowchart TD
  reader["Reader posts comment"] --> pending["pending"]
  pending --> review["Moderator review"]
  review --> approved["approved and visible"]
  review --> hidden["hidden from public"]
  review --> spam["marked as spam"]
  approved --> deleted["soft deleted"]
  hidden --> deleted
```

## Authentication Workflow

```mermaid
sequenceDiagram
  participant Client
  participant API
  participant DB
  Client->>API: POST /api/auth/login
  API->>DB: Find user by email
  DB-->>API: User with password hash
  API->>API: Verify bcrypt hash and sign JWT
  API-->>Client: Token + user profile
  Client->>API: Authenticated request
  API-->>Client: Protected resource
```

## Deployment Workflow

```mermaid
flowchart LR
  dev["Developer"] --> git["Git repository"]
  git --> build["Build apps"]
  build --> compose["Docker or PM2"]
  compose --> nginx["Nginx"]
  nginx --> public["Public website"]
  nginx --> admin["Admin dashboard"]
  nginx --> author["Author dashboard"]
  nginx --> api["API service"]
  api --> mongo["MongoDB"]
```

## Status Transition Table

| Current | Next | Actor |
| --- | --- | --- |
| `draft` | `in_review` | Journalist |
| `in_review` | `draft` | Editor |
| `in_review` | `rejected` | Editor |
| `in_review` | `scheduled` | Editor |
| `in_review` | `published` | Editor |
| `scheduled` | `published` | Scheduler/API |
| `published` | `archived` | Admin |
| `rejected` | `draft` | Journalist |
