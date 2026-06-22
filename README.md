# social-posts

Full-stack social media application with post creation, likes, comments, and JWT-based authentication.

## Stack

**Frontend** — React 19, TypeScript, Vite, TanStack Query, axios, React Router  
**Backend** — Express 5, TypeScript, MongoDB (Mongoose), Redis, JWT (`jose`), Cloudinary  
**Shared** — Zod schemas shared across apps via pnpm workspace  
**Package manager** — pnpm 10.33.2 (workspace monorepo)

## Project Structure

```
social-posts/
├── apps/
│   ├── backend/          # Express API server
│   │   ├── src/
│   │   │   ├── config/   # DB connection, env config
│   │   │   ├── models/   # Mongoose schemas (User, Post)
│   │   │   ├── routes/   # User & Post routes
│   │   │   ├── controller/
│   │   │   ├── services/ # Business logic
│   │   │   ├── middleware/ # Auth, upload
│   │   │   └── utils/    # Error handling, JWT, Redis, Cloudinary
│   │   └── package.json
│   └── frontend/         # React + Vite client
│       └── src/
│           ├── App.tsx
│           ├── main.tsx
│           └── main.tsx
├── packages/
│   └── shared/           # Shared Zod schemas & types
└── pnpm-workspace.yaml
```

## Getting Started

### Prerequisites

- Node.js >= 18
- pnpm 10.33.2
- MongoDB (local or Atlas)
- Redis (local or cloud)

### Install

```bash
pnpm install
```

### Environment Variables

Create `apps/backend/.env` based on the following variables:

| Variable | Required | Description |
|----------|----------|-------------|
| `PORT` | No | Server port (default: `5000`) |
| `NODE_ENV` | No | Environment (default: `development`) |
| `MONGO_URI` | Yes | MongoDB connection string |
| `REDIS_URI` | Yes | Redis connection string |
| `JWT_ACCESS_SECRET` | Yes | Access token signing secret |
| `JWT_REFRESH_SECRET` | Yes | Refresh token signing secret |
| `ACCESS_TOKEN_TTL` | No | Access token expiry (default: `15m`) |
| `REFRESH_TOKEN_TTL` | No | Refresh token expiry (default: `7d`) |
| `JWT_ISSUER` | No | Token issuer (default: `your-app-name.com`) |
| `JWT_AUDIENCE` | No | Token audience (default: `your-app-client`) |
| `CLOUDINARY_CLOUD_NAME` | Yes | Cloudinary cloud name |
| `CLOUDINARY_API_KEY` | Yes | Cloudinary API key |
| `CLOUDINARY_API_SECRET` | Yes | Cloudinary API secret |

A `.env.example` is provided at `apps/backend/.env.example`.

### Run

```bash
# Start both frontend and backend concurrently
pnpm dev

# Start individually
pnpm dev:backend   # Backend on http://localhost:5000
pnpm dev:frontend  # Frontend on http://localhost:5173
```

### Scripts

| Command | Description |
|---------|-------------|
| `pnpm dev` | Start both apps in parallel |
| `pnpm dev:frontend` | Start frontend only |
| `pnpm dev:backend` | Start backend only |
| `pnpm build` | Build all packages |
| `pnpm lint` | Run ESLint across workspace |
| `pnpm format` | Format code with Prettier |

## API Reference

Base URL: `/api/v1`

### Auth

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `POST` | `/auth/register` | No | Register new user |
| `POST` | `/auth/login` | No | Login, returns access & refresh tokens |
| `POST` | `/auth/refresh` | No | Refresh access token |
| `POST` | `/auth/logout` | Yes | Invalidate access token (Redis blacklist) |
| `PATCH` | `/auth/profile` | Yes | Update profile (name, password, avatar) |
| `DELETE` | `/auth/delete` | Yes | Delete account (cascades to posts) |

### Posts

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `POST` | `/post` | Yes | Create post (text and/or image) |
| `GET` | `/post/feed` | No | Retrieve all posts |
| `PATCH` | `/post/:postId/like` | Yes | Toggle like on post |
| `POST` | `/post/:postId/comment` | Yes | Add comment to post |
| `DELETE` | `/post/:postId` | Yes | Delete own post |

A Postman collection is included at `/postman.json`.

## Architecture Notes

- **Layered backend**: routes → controllers → services. Controllers handle HTTP concerns; services contain business logic.
- **Validation**: Request payloads validated with Zod. Shared schemas live in `packages/shared` and are consumed by both client and server.
- **Error handling**: Centralized error handling via `AppError` and an async wrapper — no unhandled promise rejections in routes.
- **Auth**: JWT access tokens (short-lived) + refresh tokens (HTTP-only cookies). Revoked tokens stored in Redis.
- **File uploads**: Images uploaded to Cloudinary via Multer middleware. No local filesystem storage.
