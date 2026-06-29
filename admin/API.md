# 📡 API Documentation

**Base URL:** `https://api.mamadweb.netlify.app` (production)  
**Local:** `http://localhost:3000/api`

---

## Authentication

All protected endpoints require:
```
Authorization: Bearer <access_token>
```

### Login
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "admin@example.com",
  "password": "your-password"
}

Response 200:
{
  "success": true,
  "data": {
    "user": {
      "id": "cuid_xxx",
      "email": "admin@example.com",
      "name": "Admin",
      "role": "ADMIN"
    },
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "expiresIn": 900
  }
}
```

---

## Dashboard

### Get Overview Stats
```http
GET /api/analytics/overview
Authorization: Bearer <token>

Response 200:
{
  "success": true,
  "data": {
    "projects": {
      "total": 8,
      "published": 6,
      "drafts": 2
    },
    "messages": {
      "total": 45,
      "unread": 3
    },
    "testimonials": {
      "total": 5,
      "featured": 3
    },
    "visitors": {
      "today": 125,
      "thisWeek": 890,
      "thisMonth": 3420,
      "percentChange": 12.5
    },
    "pageViews": {
      "today": 450,
      "thisWeek": 3200,
      "thisMonth": 12500
    },
    "recentActivity": [
      {
        "id": "1",
        "action": "CREATE",
        "entity": "Project",
        "user": "Admin",
        "timestamp": "2024-06-25T10:30:00Z"
      }
    ]
  }
}
```

---

## Projects

### List Projects
```http
GET /api/projects?status=published&page=1&limit=10
Authorization: Bearer <token>

Response 200:
{
  "success": true,
  "data": [
    {
      "id": "cuid_xxx",
      "title": "فروشگاه آنلاین Bloom",
      "titleEn": "Bloom Online Shop",
      "category": "E-commerce",
      "status": "PUBLISHED",
      "featured": true,
      "imageUrl": "https://...",
      "views": 1250,
      "createdAt": "2024-01-15T10:00:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 8,
    "pages": 1
  }
}
```

### Create Project
```http
POST /api/projects
Authorization: Bearer <token>
Content-Type: application/json

{
  "title": "پروژه جدید",
  "titleEn": "New Project",
  "description": "توضیحات پروژه",
  "category": "E-commerce",
  "tags": ["React", "Node.js"],
  "imageUrl": "https://cdn.example.com/image.jpg",
  "link": "https://example.com",
  "featured": true,
  "status": "DRAFT",
  "challenge": "چالش پروژه",
  "solution": "راه حل",
  "result": "نتیجه"
}

Response 201:
{
  "success": true,
  "data": { ... }
}
```

### Update Project
```http
PUT /api/projects/:id
Authorization: Bearer <token>
Content-Type: application/json

{
  "title": "عنوان جدید",
  "status": "PUBLISHED"
}

Response 200:
{
  "success": true,
  "data": { ... }
}
```

### Delete Project
```http
DELETE /api/projects/:id
Authorization: Bearer <token>

Response 200:
{
  "success": true,
  "message": "Project deleted"
}
```

---

## Testimonials

### List Testimonials
```http
GET /api/testimonials?featured=true
Authorization: Bearer <token>

Response 200:
{
  "success": true,
  "data": [
    {
      "id": "cuid_xxx",
      "clientName": "علی محمدی",
      "company": "نور کازمتیک",
      "role": "مدیر برند",
      "quote": "کار فوق العاده!",
      "rating": 5,
      "isVerified": true,
      "isFeatured": true,
      "avatarUrl": "https://..."
    }
  ]
}
```

### Create Testimonial
```http
POST /api/testimonials
Authorization: Bearer <token>
Content-Type: application/json

{
  "clientName": "نام مشتری",
  "clientNameEn": "Client Name",
  "company": "نام شرکت",
  "role": "مدیر",
  "quote": "نظر مشتری",
  "rating": 5,
  "isFeatured": true,
  "avatarUrl": "https://..."
}

Response 201:
{
  "success": true,
  "data": { ... }
}
```

---

## Messages

### List Messages
```http
GET /api/messages?status=UNREAD&page=1
Authorization: Bearer <token>

Response 200:
{
  "success": true,
  "data": [
    {
      "id": "cuid_xxx",
      "name": "علی",
      "email": "ali@example.com",
      "subject": "درخواست مشاوره",
      "content": "متن پیام...",
      "status": "UNREAD",
      "createdAt": "2024-06-25T10:00:00Z"
    }
  ],
  "pagination": { ... }
}
```

### Reply to Message
```http
POST /api/messages/:id/reply
Authorization: Bearer <token>
Content-Type: application/json

{
  "content": "متن پاسخ شما..."
}

Response 200:
{
  "success": true,
  "message": "Reply sent"
}
```

---

## Users

### List Users
```http
GET /api/users
Authorization: Bearer <token> (ADMIN only)

Response 200:
{
  "success": true,
  "data": [
    {
      "id": "cuid_xxx",
      "email": "user@example.com",
      "name": "نام کاربر",
      "role": "ADMIN",
      "isActive": true,
      "lastLoginAt": "2024-06-25T10:00:00Z"
    }
  ]
}
```

### Create User
```http
POST /api/users
Authorization: Bearer <token> (ADMIN only)
Content-Type: application/json

{
  "email": "new@example.com",
  "password": "secure-password",
  "name": "کاربر جدید",
  "role": "EDITOR"
}

Response 201:
{
  "success": true,
  "data": { "id": "cuid_xxx", ... }
}
```

### Update User Role
```http
PUT /api/users/:id/role
Authorization: Bearer <token> (ADMIN only)
Content-Type: application/json

{
  "role": "EDITOR"
}

Response 200:
{
  "success": true,
  "message": "Role updated"
}
```

---

## Settings

### Get All Settings
```http
GET /api/settings
Authorization: Bearer <token> (ADMIN only)

Response 200:
{
  "success": true,
  "data": {
    "siteName": "mamad_dev",
    "siteUrl": "https://mamadweb.netlify.app",
    "email": "info@mamad_dev.com",
    "socialLinks": { ... },
    "seo": { ... }
  }
}
```

### Update Setting
```http
PUT /api/settings/siteName
Authorization: Bearer <token> (ADMIN only)
Content-Type: application/json

{
  "value": "New Site Name"
}

Response 200:
{
  "success": true,
  "data": { "key": "siteName", "value": "New Site Name" }
}
```

---

## Audit Logs

### List Logs
```http
GET /api/audit-logs?userId=cuid_xxx&action=DELETE&from=2024-01-01&to=2024-06-25&page=1&limit=50
Authorization: Bearer <token> (ADMIN only)

Response 200:
{
  "success": true,
  "data": [
    {
      "id": "cuid_xxx",
      "action": "DELETE",
      "entity": "Project",
      "entityId": "cuid_yyy",
      "user": { "name": "Admin" },
      "ipAddress": "192.168.1.1",
      "createdAt": "2024-06-25T10:00:00Z"
    }
  ],
  "pagination": { ... }
}
```

### Export Logs
```http
GET /api/audit-logs/export?format=csv&from=2024-01-01&to=2024-06-25
Authorization: Bearer <token> (ADMIN only)

Response 200:
Content-Type: text/csv
Content-Disposition: attachment; filename="audit_logs_2024-06-25.csv"
```

---

## Error Responses

### 400 Bad Request
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid input",
    "details": [
      { "field": "email", "message": "Invalid email format" }
    ]
  }
}
```

### 401 Unauthorized
```json
{
  "success": false,
  "error": {
    "code": "UNAUTHORIZED",
    "message": "Invalid or expired token"
  }
}
```

### 403 Forbidden
```json
{
  "success": false,
  "error": {
    "code": "FORBIDDEN",
    "message": "Admin access required"
  }
}
```

### 429 Too Many Requests
```json
{
  "success": false,
  "error": {
    "code": "RATE_LIMITED",
    "message": "Too many requests",
    "retryAfter": 900
  }
}
```

---

## Rate Limits

| Endpoint | Limit | Window |
|----------|-------|--------|
| `/api/auth/login` | 5 attempts | 15 min |
| `/api/contact` | 3 requests | 1 hour |
| `/api/*` (authenticated) | 100 requests | 1 min |
