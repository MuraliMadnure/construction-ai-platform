# Deployment Guide

## Docker Deployment (Production)

### Prerequisites
- Docker & Docker Compose installed
- Git repository cloned

### Quick Start

1. **Create environment file:**
   ```bash
   cp .env.docker.example .env.docker
   ```

2. **Edit `.env.docker`** with your secrets:
   ```env
   POSTGRES_PASSWORD=<secure-random-password>
   REDIS_PASSWORD=<secure-random-password>
   JWT_SECRET=<min-32-char-secret>
   JWT_REFRESH_SECRET=<min-32-char-secret>
   CORS_ORIGIN=http://your-domain.com
   ```

3. **Build and start:**
   ```bash
   docker compose -f docker-compose.prod.yml --env-file .env.docker up --build -d
   ```

4. **Run database migrations:**
   ```bash
   docker exec construction-ai-backend npx prisma db push
   ```

5. **Seed database (optional):**
   ```bash
   docker exec construction-ai-backend node prisma/seed.js
   ```

### Service Ports
| Service | Internal Port | External Port |
|---------|--------------|---------------|
| Frontend (nginx) | 80 | 3000 |
| Backend API | 5000 | 5001 |
| PostgreSQL | 5432 | 5432 |
| Redis | 6379 | 6379 |

### Architecture
```
┌─────────────┐     ┌─────────────────┐     ┌──────────────┐
│   Browser   │────▶│  Frontend:3000  │────▶│ Backend:5001 │
│             │     │  (nginx + SPA)  │     │  (Node.js)   │
└─────────────┘     └─────────────────┘     └──────┬───────┘
                         │ /api proxy                │
                         └──────────────────────────▶│
                                                     │
                                          ┌──────────┴──────────┐
                                          │                     │
                                    ┌─────▼─────┐       ┌──────▼─────┐
                                    │ PostgreSQL │       │   Redis    │
                                    │   :5432   │       │   :6379    │
                                    └───────────┘       └────────────┘
```

### Useful Commands
```bash
# View logs
docker logs construction-ai-backend -f
docker logs construction-ai-frontend -f

# Restart services
docker compose -f docker-compose.prod.yml --env-file .env.docker restart backend

# Rebuild after code changes
docker compose -f docker-compose.prod.yml --env-file .env.docker up --build -d

# Stop all services
docker compose -f docker-compose.prod.yml --env-file .env.docker down

# Reset database (DESTRUCTIVE)
docker compose -f docker-compose.prod.yml --env-file .env.docker down -v
```

## Local Development

### Prerequisites
- Node.js 18+
- PostgreSQL 15
- Redis 7

### Setup
```bash
# Backend
cd backend
cp .env.example .env
npm install
npx prisma db push
npx prisma db seed
npm run dev

# Frontend
cd frontend
cp .env.example .env
npm install
npm run dev
```

### Local Ports
- Frontend: http://localhost:3000
- Backend: http://localhost:5001
- Prisma Studio: `npx prisma studio` (port 5555)
