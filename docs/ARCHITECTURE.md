# Project Architecture

## Overview
Construction AI Platform is a full-stack web application for managing construction projects with AI-powered features.

## Tech Stack

### Frontend
- **React 18** - UI framework
- **Vite** - Build tool
- **TanStack Query** - Server state management
- **Zustand** - Client state management
- **Tailwind CSS** - Styling
- **Recharts** - Data visualization
- **Lucide React** - Icons
- **Socket.IO Client** - Real-time updates

### Backend
- **Node.js + Express** - API server
- **Prisma ORM** - Database access
- **PostgreSQL** - Primary database
- **Redis (ioredis)** - Caching layer
- **Socket.IO** - WebSocket server
- **JWT** - Authentication (access + refresh tokens)
- **Puppeteer** - PDF report generation
- **Winston** - Logging

### Infrastructure
- **Docker + Docker Compose** - Containerization
- **Nginx** - Static file serving & reverse proxy

## Directory Structure

```
construction-ai-platform/
├── docs/                    # Project documentation
├── frontend/
│   ├── src/
│   │   ├── components/      # Reusable UI components
│   │   ├── pages/           # Route-level page components
│   │   ├── services/        # API client services
│   │   ├── stores/          # Zustand state stores
│   │   ├── hooks/           # Custom React hooks
│   │   ├── utils/           # Helper functions
│   │   ├── constants/       # App constants
│   │   └── App.jsx          # Root component with routing
│   ├── nginx.conf           # Production nginx config
│   ├── Dockerfile           # Multi-stage build
│   └── vite.config.js       # Build configuration
├── backend/
│   ├── src/
│   │   ├── config/          # App configuration
│   │   ├── controllers/     # Route handlers
│   │   ├── middleware/      # Express middleware
│   │   ├── routes/          # API route definitions
│   │   ├── services/        # Business logic
│   │   ├── sockets/         # Socket.IO event handlers
│   │   └── utils/           # Utilities (cache, jwt, prisma, logger)
│   ├── prisma/
│   │   ├── schema.prisma    # Database schema
│   │   ├── migrations/      # Database migrations
│   │   └── seed.js          # Seed data
│   ├── uploads/             # File uploads (gitignored)
│   ├── reports/             # Generated reports (gitignored)
│   └── Dockerfile           # Production build
├── docker-compose.prod.yml  # Production deployment
├── docker-compose.yml       # Development services
└── .env.docker.example      # Environment template
```

## Key Design Patterns

### Authentication Flow
1. User logs in → receives access token (15min) + refresh token (7 days)
2. Access token sent in Authorization header
3. On 401, frontend auto-refreshes using refresh token
4. Refresh tokens are single-use (rotated on each use)

### Caching Strategy
- Redis used for expensive queries (dashboard stats, AI suggestions)
- TTL-based invalidation (2-15 minutes depending on data)
- Graceful fallback if Redis unavailable

### Authorization
- Role-based: admin, project_manager, member
- Project-level: creator, manager, or member access
- Socket.IO: verified project membership before joining rooms

### Performance Optimizations
- Connection pooling (PostgreSQL: 20 connections)
- Browser pooling (Puppeteer: reuses instances)
- Code splitting (React.lazy + manual chunks)
- Gzip compression (nginx + Express)
- Static asset caching (30 days)
- Database compound indexes for common queries
