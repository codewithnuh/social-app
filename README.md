# Social App

A full-stack social media application built with modern TypeScript tooling, focusing on scalable backend architecture, secure authentication, and clean frontend state management.

The project demonstrates production-style patterns including layered backend design, shared validation schemas, and token-based authentication with refresh support.

---

## Tech Stack

### Frontend

- React 19 (TypeScript)
- Vite
- React Router
- TanStack Query
- Axios
- Material UI

### Backend

- Node.js + Express 5
- TypeScript
- MongoDB (Mongoose)
- Redis (session + token blacklist)
- JWT (via `jose`)
- Cloudinary (image storage)
- Multer (file uploads)

### Shared Layer

- Zod-based schema validation
- Shared types across frontend and backend via pnpm workspace

### Tooling

- pnpm workspace monorepo
- ESLint + Prettier

---

## Architecture Overview

The backend follows a strict layered architecture:

- **Routes**: Define API endpoints
- **Controllers**: Handle HTTP requests and responses
- **Services**: Contain core business logic
- **Middleware**: Authentication, validation, uploads
- **Utils**: Reusable helpers (JWT, Redis, error handling, Cloudinary)

Shared schemas ensure consistent validation across the entire system.

---

## Features

### Authentication System

- JWT-based authentication (access + refresh tokens)
- Secure HTTP-only cookies for refresh tokens
- Automatic token refresh flow
- Redis-based token blacklist for logout invalidation

### Social Features

- Create, read, and delete posts
- Like/unlike posts
- Comment system
- Feed-based post retrieval

### Media Handling

- Image upload support via Multer
- Cloudinary integration for storage
- Temporary file cleanup after upload

### Frontend Experience

- Protected routes with authentication guard
- Persistent session handling
- Optimistic UI updates via React Query
- Responsive UI components using Material UI

---

## Project Structure

```
apps/
  backend/
    src/
      config/
      models/
      routes/
      controllers/
      services/
      middleware/
      utils/

  frontend/
    src/
      components/
      hooks/
      pages/
      utils/

packages/
  shared/
    src/
      schemas/
      utils/
```

---

## Getting Started

### Prerequisites

- Node.js 18+
- pnpm 10+
- MongoDB (local or cloud)
- Redis (local or managed instance)

---

### Installation

```bash
pnpm install
```

---

### Environment Variables

Create `apps/backend/.env`:

```
MONGO_URI=
REDIS_URI=
JWT_ACCESS_SECRET=
JWT_REFRESH_SECRET=
ACCESS_TOKEN_TTL=15m
REFRESH_TOKEN_TTL=7d
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
```

---

## Running the Application

### Development Mode

```bash
pnpm dev
```

### Run Individual Apps

```bash
pnpm dev:frontend
pnpm dev:backend
```

### Production Build

```bash
pnpm build
```

### Linting

```bash
pnpm lint
```

---

## API Overview

Base URL: `/api/v1`

### Auth Routes

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | /auth/register | No | Create new account |
| POST | /auth/login | No | Authenticate user |
| POST | /auth/refresh | No | Refresh access token |
| POST | /auth/logout | Yes | Logout user |
| PATCH | /auth/profile | Yes | Update user profile |
| DELETE | /auth/delete | Yes | Delete account |

---

### Post Routes

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | /post | Yes | Create a post |
| GET | /post/feed | No | Get posts feed |
| PATCH | /post/:id/like | Yes | Toggle like |
| POST | /post/:id/comment | Yes | Add comment |
| DELETE | /post/:id | Yes | Delete post |

---

## Design Principles

### 1. Separation of Concerns

Backend logic is split into controllers and services to ensure maintainability and scalability.

### 2. Shared Validation Layer

Zod schemas are shared between frontend and backend to avoid duplication and ensure consistency.

### 3. Secure Authentication Flow

- Short-lived access tokens
- Refresh tokens stored in HTTP-only cookies
- Redis-backed logout invalidation

### 4. Media Handling Pipeline

Uploads flow through Multer → Cloudinary → temporary file cleanup.

### 5. Centralized Error Handling

All errors are handled through a unified error utility for consistent API responses.

---

## Deployment

- Frontend: Vercel (SPA routing enabled)
- Backend: Render
- Ensure environment variables are properly configured on both platforms

---

## Status

This project is actively developed with a focus on:

- Production-ready backend patterns
- Scalable authentication architecture
- Real-world full-stack workflow design
