# 🏢 Enterprise Admin Panel - Architecture Overview

**Version:** 1.0
**Date:** 2024-06-25
**Stack:** Next.js 14 + TypeScript + Tailwind + shadcn/ui + Prisma + PostgreSQL

---

## Table of Contents

1. [Architecture Diagram](#architecture-diagram)
2. [Folder Structure](#folder-structure)
3. [Technology Stack](#technology-stack)
4. [Database Schema](#database-schema)
5. [API Endpoints](#api-endpoints)
6. [Security](#security)
7. [Setup Instructions](#setup-instructions)

---

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         ENTERPRISE ARCHITECTURE                            │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  ┌─────────────┐         ┌──────────────────────────────────────────┐   │
│  │   BROWSER  │         │              ADMIN PANEL                      │   │
│  │             │         │  ┌────────────┐  ┌────────────┐           │   │
│  │  Dashboard │────────▶│  │  React    │  │   shadcn   │           │   │
│  │  Analytics │         │  │  Next.js  │  │     UI    │           │   │
│  │  Users    │         │  │     ↕     │  │  Dashboard │           │   │
│  │  Settings │         │  │  TypeScript│  │   Charts   │           │   │
│  └─────────────┘         │  └─────┬────┘  └────────────┘           │   │
│                          │        │                                  │   │
│                          │        ▼                                  │   │
│                          │  ┌──────────────────┐                    │   │
│                          │  │   Zustand Store  │                    │   │
│                          │  │  React Query     │                    │   │
│                          │  └────────┬─────────┘                    │   │
│                          └───────────┼──────────────────────────────┘   │
│                                      │                                   │
│                                      │ REST API                          │
│                                      ▼                                   │
│  ┌──────────────────────────────────────────────────────────────────┐   │
│  │                      EXPRESS.JS API SERVER                       │   │
│  │  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐    │   │
│  │  │  Auth    │  │  Users  │  │ Projects │  │Messages │    │   │
│  │  │  Route   │  │  Route  │  │  Route  │  │  Route  │    │   │
│  │  └────┬─────┘  └────┬─────┘  └────┬─────┘  └────┬─────┘    │   │
│  │       │             │             │             │              │   │
│  │       └─────────────┴──────┬─────┴─────────────┘              │   │
│  │                           │                                   │   │
│  │                    ┌──────┴──────┐                            │   │
│  │                    │   MIDDLEWARE   │                            │   │
│  │                    │ • JWT Verify   │                            │   │
│  │                    │ • RBAC Check   │                            │   │
│  │                    │ • Rate Limit  │                            │   │
│  │                    │ • Audit Log   │                            │   │
│  │                    │ • CSRF Prot   │                            │   │
│  │                    └──────┬───────┘                            │   │
│  └───────────────────────────┼───────────────────────────────────┘   │
│                              │                                       │
│                              ▼                                       │
│  ┌──────────────────────────────────────────────────────────────────┐   │
│  │                    PRISMA ORM                                    │   │
│  │  ┌────────────┐  ┌────────────┐  ┌────────────┐                 │   │
│  │  │ PostgreSQL │  │  Redis    │  │  S3/CDN   │                 │   │
│  │  │  Database │  │  Cache    │  │  Storage  │                 │   │
│  │  └────────────┘  └────────────┘  └────────────┘                 │   │
│  └──────────────────────────────────────────────────────────────────┘   │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## Folder Structure

```
mamad-portfolio/
├── apps/
│   ├── web/                      # Main portfolio website (existing)
│   │   ├── index.html
│   │   ├── style.css
│   │   ├── main.js
│   │   └── ...
│   │
│   └── admin/                    # NEW: Enterprise Admin Panel
│       ├── src/
│       │   ├── app/              # Next.js App Router
│       │   │   ├── (auth)/
│       │   │   │   ├── login/
│       │   │   │   │   └── page.tsx
│       │   │   │   └── layout.tsx
│       │   │   │
│       │   │   ├── (dashboard)/
│       │   │   │   ├── layout.tsx
│       │   │   │   ├── page.tsx              # Dashboard
│       │   │   │   ├── users/
│       │   │   │   │   ├── page.tsx
│       │   │   │   │   ├── [id]/
│       │   │   │   │   │   └── page.tsx
│       │   │   │   │   └── new/
│       │   │   │   │       └── page.tsx
│       │   │   │   ├── projects/
│       │   │   │   │   ├── page.tsx
│       │   │   │   │   ├── [id]/
│       │   │   │   │   │   └── page.tsx
│       │   │   │   │   └── new/
│       │   │   │   │       └── page.tsx
│       │   │   │   ├── testimonials/
│       │   │   │   │   ├── page.tsx
│       │   │   │   │   ├── [id]/
│       │   │   │   │   │   └── page.tsx
│       │   │   │   │   └── new/
│       │   │   │   │       └── page.tsx
│       │   │   │   ├── messages/
│       │   │   │   │   └── page.tsx
│       │   │   │   ├── analytics/
│       │   │   │   │   └── page.tsx
│       │   │   │   ├── settings/
│       │   │   │   │   ├── page.tsx
│       │   │   │   │   ├── general/
│       │   │   │   │   ├── seo/
│       │   │   │   │   ├── security/
│       │   │   │   │   └── integrations/
│       │   │   │   ├── audit-logs/
│       │   │   │   │   └── page.tsx
│       │   │   │   └── profile/
│       │   │   │       └── page.tsx
│       │   │   │
│       │   │   └── api/
│       │   │       └── [...]           # API routes
│       │   │
│       │   ├── components/
│       │   │   ├── ui/                # shadcn/ui components
│       │   │   │   ├── button.tsx
│       │   │   │   ├── card.tsx
│       │   │   │   ├── table.tsx
│       │   │   │   ├── dialog.tsx
│       │   │   │   ├── form.tsx
│       │   │   │   └── ...
│       │   │   │
│       │   │   ├── dashboard/
│       │   │   │   ├── stats-card.tsx
│       │   │   │   ├── recent-activity.tsx
│       │   │   │   ├── chart-card.tsx
│       │   │   │   └── quick-actions.tsx
│       │   │   │
│       │   │   ├── tables/
│       │   │   │   ├── users-table.tsx
│       │   │   │   ├── projects-table.tsx
│       │   │   │   └── messages-table.tsx
│       │   │   │
│       │   │   ├── forms/
│       │   │   │   ├── project-form.tsx
│       │   │   │   ├── testimonial-form.tsx
│       │   │   │   └── user-form.tsx
│       │   │   │
│       │   │   └── layout/
│       │   │       ├── sidebar.tsx
│       │   │       ├── header.tsx
│       │   │       └── breadcrumbs.tsx
│       │   │
│       │   ├── lib/
│       │   │   ├── api.ts              # API client
│       │   │   ├── auth.ts             # Auth utilities
│       │   │   ├── utils.ts            # Helpers
│       │   │   └── validators.ts      # Zod schemas
│       │   │
│       │   ├── hooks/
│       │   │   ├── use-auth.ts
│       │   │   ├── use-users.ts
│       │   │   ├── use-projects.ts
│       │   │   └── use-messages.ts
│       │   │
│       │   ├── types/
│       │   │   ├── user.ts
│       │   │   ├── project.ts
│       │   │   ├── message.ts
│       │   │   └── index.ts
│       │   │
│       │   └── stores/
│       │       └── auth-store.ts      # Zustand store
│       │
│       ├── prisma/
│       │   └── schema.prisma
│       │
│       ├── public/
│       │   └── favicon.ico
│       │
│       ├── .env.local
│       ├── tailwind.config.ts
│       ├── tsconfig.json
│       ├── next.config.js
│       └── package.json
│
├── packages/
│   └── api/                      # Shared API package
│       ├── src/
│       │   ├── index.ts
│       │   ├── routes/
│       │   │   ├── auth.ts
│       │   │   ├── users.ts
│       │   │   ├── projects.ts
│       │   │   ├── testimonials.ts
│       │   │   ├── messages.ts
│       │   │   └── settings.ts
│       │   │
│       │   ├── middleware/
│       │   │   ├── auth.ts
│       │   │   ├── rbac.ts
│       │   │   ├── rate-limit.ts
│       │   │   └── audit.ts
│       │   │
│       │   ├── services/
│       │   │   ├── user.service.ts
│       │   │   ├── project.service.ts
│       │   │   └── email.service.ts
│       │   │
│       │   └── utils/
│       │       ├── logger.ts
│       │       └── validation.ts
│       │
│       ├── package.json
│       └── tsconfig.json
│
├── server/                        # Existing Express server (enhanced)
│   ├── src/
│   │   ├── index.ts
│   │   ├── routes/
│   │   ├── middleware/
│   │   ├── services/
│   │   └── utils/
│   │
│   └── prisma/
│       └── schema.prisma
│
├── prisma/
│   └── schema.prisma             # Root Prisma schema
│
├── docs/
│   ├── ARCHITECTURE.md
│   ├── API.md
│   └── DEPLOYMENT.md
│
├── docker-compose.yml
├── package.json                  # Root package.json
└── turbo.json                   # Turborepo config
```

---

## Technology Stack

### Frontend

| Technology | Purpose | Version |
|-----------|---------|---------|
| Next.js 14 | Framework | 14.2+ |
| React | UI Library | 18.x |
| TypeScript | Type Safety | 5.x |
| Tailwind CSS | Styling | 3.x |
| shadcn/ui | Components | Latest |
| Zustand | State Management | 4.x |
| React Query | Data Fetching | 5.x |
| Zod | Validation | 3.x |
| Recharts | Analytics Charts | Latest |

### Backend

| Technology | Purpose | Version |
|-----------|---------|---------|
| Node.js | Runtime | 20.x |
| Express | API Framework | 4.x |
| Prisma | ORM | 5.x |
| PostgreSQL | Database | 15.x |
| Redis | Cache/Sessions | 7.x |
| JWT | Authentication | Latest |
| bcrypt | Password Hashing | Latest |
| Helmet | Security Headers | Latest |
| rate-limit | Rate Limiting | Latest |

---

## Database Schema

```prisma
// prisma/schema.prisma

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

// ============================================================
// ENUMS
// ============================================================

enum Role {
  ADMIN
  EDITOR
  VIEWER
}

enum ProjectStatus {
  DRAFT
  PUBLISHED
  ARCHIVED
}

enum MessageStatus {
  UNREAD
  READ
  REPLIED
  ARCHIVED
}

enum AuditAction {
  CREATE
  UPDATE
  DELETE
  LOGIN
  LOGOUT
  EXPORT
}

// ============================================================
// AUTH & USERS
// ============================================================

model User {
  id            String    @id @default(cuid())
  email         String    @unique
  password      String
  name          String
  role          Role      @default(VIEWER)
  avatar       String?
  isActive      Boolean   @default(true)
  lastLoginAt   DateTime?
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt

  // Relations
  projects      Project[]
  testimonials  Testimonial[]
  auditLogs    AuditLog[]

  @@map("users")
}

model Session {
  id           String   @id @default(cuid())
  userId       String
  token        String   @unique
  expiresAt    DateTime
  ipAddress    String?
  userAgent    String?
  createdAt    DateTime @default(now())

  user         User     @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@index([token])
  @@index([userId])
  @@map("sessions")
}

model RefreshToken {
  id           String   @id @default(cuid())
  userId       String
  token        String   @unique
  expiresAt    DateTime
  createdAt    DateTime @default(now())

  @@index([token])
  @@map("refresh_tokens")
}

// ============================================================
// CONTENT
// ============================================================

model Project {
  id           String        @id @default(cuid())
  title        String
  titleEn     String?
  description  String        @db.Text
  descriptionEn String?       @db.Text
  tags         String[]
  category     String
  imageUrl     String?
  link         String?
  status       ProjectStatus @default(DRAFT)
  featured     Boolean       @default(false)
  order       Int           @default(0)
  views        Int           @default(0)

  // Case Study
  challenge    String?       @db.Text
  solution     String?       @db.Text
  result       String?       @db.Text

  // SEO
  slug         String        @unique
  metaTitle    String?
  metaDesc     String?

  authorId     String
  author       User          @relation(fields: [authorId], references: [id])
  createdAt    DateTime       @default(now())
  updatedAt    DateTime       @updatedAt
  publishedAt  DateTime?

  @@index([status])
  @@index([category])
  @@index([authorId])
  @@map("projects")
}

model Testimonial {
  id           String   @id @default(cuid())
  clientName   String
  clientNameEn String?
  company      String?
  companyEn    String?
  role         String?
  roleEn       String?

  quote        String   @db.Text
  quoteEn      String?  @db.Text

  rating       Int      @default(5)
  isVerified   Boolean  @default(true)
  isFeatured   Boolean  @default(false)
  avatarUrl    String?
  projectRef   String?  // Reference to project name

  authorId     String
  author       User     @relation(fields: [authorId], references: [id])

  createdAt    DateTime @default(now())
  updatedAt    DateTime @updatedAt

  @@map("testimonials")
}

model Message {
  id           String        @id @default(cuid())
  name         String
  email        String
  subject      String?
  content      String        @db.Text
  status       MessageStatus @default(UNREAD)
  isStarred    Boolean      @default(false)
  ipAddress    String?
  userAgent    String?

  replies      MessageReply[]

  createdAt    DateTime     @default(now())
  updatedAt    DateTime     @updatedAt
  readAt      DateTime?

  @@index([status])
  @@index([email])
  @@map("messages")
}

model MessageReply {
  id           String   @id @default(cuid())
  messageId    String
  content      String   @db.Text
  isAdminReply Boolean  @default(true)

  message      Message  @relation(fields: [messageId], references: [id], onDelete: Cascade)
  createdAt    DateTime @default(now())

  @@map("message_replies")
}

model BlogPost {
  id           String   @id @default(cuid())
  title        String
  titleEn      String?
  slug         String   @unique
  excerpt      String   @db.Text
  excerptEn    String?  @db.Text
  content      String   @db.Text
  contentEn   String?  @db.Text
  imageUrl     String?
  isPublished  Boolean  @default(false)
  publishedAt  DateTime?
  authorId     String
  createdAt    DateTime @default(now())
  updatedAt    DateTime @updatedAt

  @@index([slug])
  @@map("blog_posts")
}

// ============================================================
// SETTINGS
// ============================================================

model Setting {
  id           String   @id @default(cuid())
  key          String   @unique
  value        String   @db.Text
  type         String   @default("string") // string, number, boolean, json
  group        String   @default("general")
  description  String?
  isPublic     Boolean  @default(false)
  updatedAt    DateTime @updatedAt

  @@map("settings")
}

// ============================================================
// ANALYTICS
// ============================================================

model PageView {
  id           String   @id @default(cuid())
  path         String
  referrer    String?
  utmSource   String?
  utmMedium   String?
  utmCampaign  String?
  country     String?
  city        String?
  device      String?
  browser     String?
  os          String?
  isMobile    Boolean  @default(false)
  sessionId    String?
  userId      String?

  createdAt    DateTime @default(now())

  @@index([path])
  @@index([createdAt])
  @@map("page_views")
}

model Visitor {
  id           String   @id @default(cuid())
  fingerprint  String   @unique
  firstVisit  DateTime @default(now())
  lastVisit   DateTime @default(now())
  visitCount  Int      @default(1)
  country     String?
  city        String?
  device      String?
  browser     String?
  os          String?

  @@index([fingerprint])
  @@map("visitors")
}

// ============================================================
// AUDIT & LOGS
// ============================================================

model AuditLog {
  id           String      @id @default(cuid())
  userId       String?
  action       AuditAction
  entity       String      // 'Project', 'User', 'Message', etc.
  entityId     String?
  oldValue    Json?
  newValue    Json?
  ipAddress   String?
  userAgent   String?
  metadata    Json?

  user         User?      @relation(fields: [userId], references: [id])

  createdAt    DateTime    @default(now())

  @@index([userId])
  @@index([entity])
  @@index([action])
  @@index([createdAt])
  @@map("audit_logs")
}
```

---

## API Endpoints

### Authentication

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/api/auth/login` | User login | Public |
| POST | `/api/auth/logout` | User logout | Required |
| POST | `/api/auth/refresh` | Refresh token | Refresh |
| GET | `/api/auth/me` | Get current user | Required |
| PUT | `/api/auth/password` | Change password | Required |

### Users

| Method | Endpoint | Description | Auth | Role |
|--------|----------|-------------|------|-------|
| GET | `/api/users` | List users | Required | ADMIN |
| GET | `/api/users/:id` | Get user | Required | ADMIN |
| POST | `/api/users` | Create user | Required | ADMIN |
| PUT | `/api/users/:id` | Update user | Required | ADMIN |
| DELETE | `/api/users/:id` | Delete user | Required | ADMIN |
| PUT | `/api/users/:id/role` | Change role | Required | ADMIN |

### Projects

| Method | Endpoint | Description | Auth | Role |
|--------|----------|-------------|------|-------|
| GET | `/api/projects` | List projects | Optional | - |
| GET | `/api/projects/:id` | Get project | Optional | - |
| POST | `/api/projects` | Create project | Required | ADMIN, EDITOR |
| PUT | `/api/projects/:id` | Update project | Required | ADMIN, EDITOR |
| DELETE | `/api/projects/:id` | Delete project | Required | ADMIN |
| PUT | `/api/projects/:id/publish` | Publish project | Required | ADMIN, EDITOR |

### Testimonials

| Method | Endpoint | Description | Auth | Role |
|--------|----------|-------------|------|-------|
| GET | `/api/testimonials` | List testimonials | Optional | - |
| POST | `/api/testimonials` | Create testimonial | Required | ADMIN |
| PUT | `/api/testimonials/:id` | Update testimonial | Required | ADMIN |
| DELETE | `/api/testimonials/:id` | Delete testimonial | Required | ADMIN |

### Messages

| Method | Endpoint | Description | Auth | Role |
|--------|----------|-------------|------|-------|
| GET | `/api/messages` | List messages | Required | ADMIN |
| GET | `/api/messages/:id` | Get message | Required | ADMIN |
| PUT | `/api/messages/:id/read` | Mark as read | Required | ADMIN |
| POST | `/api/messages/:id/reply` | Reply to message | Required | ADMIN |
| DELETE | `/api/messages/:id` | Delete message | Required | ADMIN |

### Analytics

| Method | Endpoint | Description | Auth | Role |
|--------|----------|-------------|------|-------|
| GET | `/api/analytics/overview` | Dashboard stats | Required | ADMIN |
| GET | `/api/analytics/views` | Page views | Required | ADMIN |
| GET | `/api/analytics/visitors` | Visitor stats | Required | ADMIN |
| GET | `/api/analytics/audience` | Audience demographics | Required | ADMIN |

### Settings

| Method | Endpoint | Description | Auth | Role |
|--------|----------|-------------|------|-------|
| GET | `/api/settings` | Get all settings | Required | ADMIN |
| PUT | `/api/settings/:key` | Update setting | Required | ADMIN |
| GET | `/api/settings/public` | Public settings | Public | - |

### Audit Logs

| Method | Endpoint | Description | Auth | Role |
|--------|----------|-------------|------|-------|
| GET | `/api/audit-logs` | List audit logs | Required | ADMIN |
| GET | `/api/audit-logs/:id` | Get log details | Required | ADMIN |
| GET | `/api/audit-logs/export` | Export logs | Required | ADMIN |

---

## Security

### Authentication Flow

```
┌─────────────────────────────────────────────────────────────┐
│                    AUTHENTICATION FLOW                       │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  User ──▶ Login Form                                       │
│             │                                                │
│             ▼                                                │
│  ┌──────────────────┐                                     │
│  │ Validate Input   │                                     │
│  └────────┬─────────┘                                     │
│           │ OK                                                │
│           ▼                                                  │
│  ┌──────────────────┐                                     │
│  │ Check Rate Limit │                                     │
│  └────────┬─────────┘                                     │
│           │ OK                                                │
│           ▼                                                  │
│  ┌──────────────────┐                                     │
│  │ Verify Password  │                                     │
│  │ (bcrypt.compare) │                                     │
│  └────────┬─────────┘                                     │
│           │ OK                                                │
│           ▼                                                  │
│  ┌──────────────────┐                                     │
│  │ Generate Tokens   │                                     │
│  │ • Access Token   │ (15 min)                            │
│  │ • Refresh Token  │ (7 days)                           │
│  │ • Session Log    │                                     │
│  └────────┬─────────┘                                     │
│           │                                                  │
│           ▼                                                  │
│  ┌──────────────────┐                                     │
│  │ Create Audit Log │                                     │
│  │ action: LOGIN    │                                     │
│  └────────┬─────────┘                                     │
│           │                                                  │
│           ▼                                                  │
│        Success ──▶ Dashboard                                  │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

### Role-Based Access Control (RBAC)

| Role | Permissions |
|------|------------|
| **ADMIN** | Full access to all resources |
| **EDITOR** | CRUD on projects, testimonials, messages (no users) |
| **VIEWER** | Read-only access to dashboard |

### Security Headers

```typescript
// helmet configuration
{
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'strict-dynamic'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", "data:", "https:"],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
    },
  },
  crossOriginEmbedderPolicy: false,
  crossOriginResourcePolicy: { policy: "same-origin" },
}
```

---

## Setup Instructions

### Prerequisites

```bash
# Required tools
- Node.js 20+
- PostgreSQL 15+
- Redis 7+
- Git
```

### 1. Clone and Install

```bash
# Clone repository
git clone https://github.com/mamad_dev/mamad-portfolio.git
cd mamad-portfolio

# Install dependencies
npm install

# Install Turbo (monorepo tool)
npm install -g turbo
```

### 2. Environment Setup

```bash
# Copy environment files
cp .env.example .env

# Edit .env with your values:
DATABASE_URL="postgresql://user:password@localhost:5432/mamad_admin"
REDIS_URL="redis://localhost:6379"
JWT_SECRET="your-super-secret-key-min-32-chars"
NODE_ENV="development"
```

### 3. Database Setup

```bash
# Generate Prisma Client
npx prisma generate

# Push schema to database
npx prisma db push

# Seed initial data
npx prisma db seed
```

### 4. Start Development

```bash
# Start all apps with Turbo
npm run dev

# Or start individually:
npm run dev --filter=admin      # Admin panel
npm run dev --filter=server     # API server
npm run dev --filter=web        # Main website
```

### 5. Access Admin Panel

```
URL: http://localhost:3001/admin
Email: admin@example.com
Password: (from seed or .env)
```

---

## Docker Setup

```yaml
# docker-compose.yml
version: '3.8'

services:
  postgres:
    image: postgres:15
    environment:
      POSTGRES_DB: mamad_admin
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: postgres
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data

  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"

  api:
    build: ./server
    ports:
      - "3000:3000"
    depends_on:
      - postgres
      - redis

  admin:
    build: ./apps/admin
    ports:
      - "3001:3000"

volumes:
  postgres_data:
```

```bash
# Start all services
docker-compose up -d
```

---

## Monitoring & Health

### Health Check Endpoint

```bash
GET /api/health

Response:
{
  "status": "healthy",
  "version": "1.0.0",
  "uptime": 3600,
  "database": "connected",
  "redis": "connected"
}
```

### Metrics Endpoint

```bash
GET /api/metrics

Response:
{
  "requests": { "total": 1000, "pending": 5 },
  "errors": { "total": 2, "rate": 0.002 },
  "users": { "active": 10, "total": 50 }
}
```
