# 🐳 Docker Deployment Guide

Complete guide for deploying the Construction AI Platform using Docker.

## 📋 Prerequisites

- Docker Engine 20.10+
- Docker Compose 2.0+
- 4GB+ RAM available
- 10GB+ disk space

### Install Docker

#### Windows
1. Download [Docker Desktop for Windows](https://www.docker.com/products/docker-desktop/)
2. Install and restart
3. Verify: `docker --version` and `docker-compose --version`

#### Linux (Ubuntu/Debian)
```bash
# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# Install Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# Verify
docker --version
docker-compose --version
```

#### macOS
1. Download [Docker Desktop for Mac](https://www.docker.com/products/docker-desktop/)
2. Install and start Docker Desktop
3. Verify in terminal: `docker --version`

---

## 🚀 Quick Start

### Development Mode

Run all services locally with hot-reload:

```bash
# Start all services (PostgreSQL, Redis, Backend, Frontend)
docker-compose -f docker-compose.dev.yml up

# Or run in background
docker-compose -f docker-compose.dev.yml up -d

# View logs
docker-compose -f docker-compose.dev.yml logs -f

# Stop all services
docker-compose -f docker-compose.dev.yml down
```

**Access**:
- Frontend: http://localhost:3000
- Backend API: http://localhost:5000
- PostgreSQL: localhost:5432
- Redis: localhost:6379

---

### Production Mode

Deploy with optimized builds and security:

```bash
# 1. Create production environment file
cp .env.docker.example .env.docker

# 2. Edit .env.docker with secure values
nano .env.docker

# 3. Build and start services
docker-compose -f docker-compose.prod.yml --env-file .env.docker up -d

# 4. Initialize database
docker-compose -f docker-compose.prod.yml exec backend npx prisma db push

# 5. (Optional) Seed database
docker-compose -f docker-compose.prod.yml exec backend npx prisma db seed

# 6. View logs
docker-compose -f docker-compose.prod.yml logs -f
```

**Access**:
- Frontend: http://localhost (port 80)
- Backend API: http://localhost:5000

---

## 📦 Docker Compose Files

### docker-compose.dev.yml
- **Purpose**: Local development
- **Features**: Hot reload, development mode, exposed ports
- **Database**: PostgreSQL with exposed port 5432
- **Redis**: Redis with exposed port 6379
- **Backend**: Runs with nodemon for auto-restart
- **Frontend**: Vite dev server with HMR

### docker-compose.prod.yml
- **Purpose**: Production deployment
- **Features**: Optimized builds, environment variables, restart policies
- **Security**: Password-protected Redis, secure JWT secrets
- **Backend**: Production mode with PM2
- **Frontend**: Nginx serving static files

### docker-compose.yml (Original)
- **Purpose**: Infrastructure only (PostgreSQL, Redis, MinIO)
- **Use case**: When running backend/frontend locally

---

## 🔧 Detailed Setup

### 1. Environment Configuration

#### Development (.env files in backend/frontend)
Already configured with `.env.example` templates.

#### Production (.env.docker)
```bash
# Copy template
cp .env.docker.example .env.docker

# Generate secure secrets
openssl rand -base64 32  # For JWT_SECRET
openssl rand -base64 32  # For JWT_REFRESH_SECRET
openssl rand -base64 24  # For POSTGRES_PASSWORD
openssl rand -base64 24  # For REDIS_PASSWORD

# Edit file
nano .env.docker
```

**Required variables**:
- `POSTGRES_PASSWORD` - Database password
- `REDIS_PASSWORD` - Redis password
- `JWT_SECRET` - JWT signing secret (min 32 chars)
- `JWT_REFRESH_SECRET` - Refresh token secret (min 32 chars)
- `CORS_ORIGIN` - Frontend URL (e.g., https://yourdomain.com)

### 2. Build Images

```bash
# Development
docker-compose -f docker-compose.dev.yml build

# Production
docker-compose -f docker-compose.prod.yml build

# Build without cache (if having issues)
docker-compose -f docker-compose.prod.yml build --no-cache
```

### 3. Database Initialization

```bash
# Development
docker-compose -f docker-compose.dev.yml exec backend npx prisma generate
docker-compose -f docker-compose.dev.yml exec backend npx prisma db push

# Production
docker-compose -f docker-compose.prod.yml exec backend npx prisma generate
docker-compose -f docker-compose.prod.yml exec backend npx prisma db push
```

### 4. Database Seeding (Optional)

```bash
# Development
docker-compose -f docker-compose.dev.yml exec backend npx prisma db seed

# Production
docker-compose -f docker-compose.prod.yml exec backend npx prisma db seed
```

---

## 🐳 Docker Commands Cheat Sheet

### Service Management

```bash
# Start all services
docker-compose up -d

# Stop all services
docker-compose down

# Restart a specific service
docker-compose restart backend

# View service status
docker-compose ps

# View logs
docker-compose logs -f [service-name]

# Execute command in container
docker-compose exec backend npm run dev
docker-compose exec postgres psql -U postgres -d construction_ai_db
```

### Container Operations

```bash
# List running containers
docker ps

# View container logs
docker logs -f construction-ai-backend

# Enter container shell
docker exec -it construction-ai-backend sh
docker exec -it construction-ai-postgres bash

# Stop container
docker stop construction-ai-backend

# Remove container
docker rm construction-ai-backend
```

### Image Management

```bash
# List images
docker images

# Remove image
docker rmi construction-ai-backend

# Remove unused images
docker image prune -a

# Remove all stopped containers and unused images
docker system prune -a
```

### Volume Management

```bash
# List volumes
docker volume ls

# Inspect volume
docker volume inspect construction-ai-platform_postgres_data

# Remove volume (WARNING: deletes data)
docker volume rm construction-ai-platform_postgres_data

# Remove all unused volumes
docker volume prune
```

---

## 🔍 Debugging & Troubleshooting

### Check Container Health

```bash
# View container status
docker-compose ps

# Check logs for errors
docker-compose logs backend | grep -i error
docker-compose logs frontend | grep -i error
docker-compose logs postgres | grep -i error
```

### Common Issues

#### 1. Port Already in Use

**Error**: `Bind for 0.0.0.0:5000 failed: port is already allocated`

**Solution**:
```bash
# Find process using port
lsof -ti:5000

# Kill process
kill -9 $(lsof -ti:5000)

# Or change port in docker-compose.yml
ports:
  - "5001:5000"  # Host:Container
```

#### 2. Database Connection Failed

**Error**: `Can't reach database server`

**Solution**:
```bash
# Check if postgres is running
docker-compose ps postgres

# Check postgres logs
docker-compose logs postgres

# Verify database URL
docker-compose exec backend env | grep DATABASE_URL

# Test connection
docker-compose exec postgres psql -U postgres -d construction_ai_db
```

#### 3. Prisma Client Not Generated

**Error**: `@prisma/client did not initialize yet`

**Solution**:
```bash
# Regenerate Prisma client
docker-compose exec backend npx prisma generate

# Rebuild backend container
docker-compose build backend --no-cache
docker-compose up -d backend
```

#### 4. Frontend Build Fails

**Error**: Build fails during `npm run build`

**Solution**:
```bash
# Check build logs
docker-compose logs frontend

# Rebuild with verbose output
docker-compose build frontend --progress=plain

# Clear cache and rebuild
docker-compose build frontend --no-cache
```

#### 5. Redis Connection Issues

**Error**: `Redis connection failed`

**Solution**:
```bash
# Check Redis is running
docker-compose ps redis

# Test Redis
docker-compose exec redis redis-cli ping

# With password (production)
docker-compose exec redis redis-cli -a your-password ping
```

### Access Container Shells

```bash
# Backend shell
docker-compose exec backend sh

# Postgres shell
docker-compose exec postgres psql -U postgres -d construction_ai_db

# Redis CLI
docker-compose exec redis redis-cli

# Frontend shell (dev mode)
docker-compose exec frontend sh
```

### Inspect Container

```bash
# View container details
docker inspect construction-ai-backend

# Check environment variables
docker-compose exec backend env

# Check network
docker network inspect construction-ai-platform_construction-network
```

---

## 📊 Database Operations

### Backup Database

```bash
# Create backup
docker-compose exec postgres pg_dump -U postgres construction_ai_db > backup.sql

# Or with timestamp
docker-compose exec postgres pg_dump -U postgres construction_ai_db > backup_$(date +%Y%m%d_%H%M%S).sql
```

### Restore Database

```bash
# Restore from backup
docker-compose exec -T postgres psql -U postgres -d construction_ai_db < backup.sql
```

### Reset Database

```bash
# WARNING: This deletes all data!

# Method 1: Prisma migrate reset
docker-compose exec backend npx prisma migrate reset --force

# Method 2: Drop and recreate
docker-compose exec postgres psql -U postgres -c "DROP DATABASE construction_ai_db;"
docker-compose exec postgres psql -U postgres -c "CREATE DATABASE construction_ai_db;"
docker-compose exec backend npx prisma db push
```

### Access Database

```bash
# Connect to PostgreSQL
docker-compose exec postgres psql -U postgres -d construction_ai_db

# Run SQL queries
docker-compose exec postgres psql -U postgres -d construction_ai_db -c "SELECT * FROM users LIMIT 5;"

# Open Prisma Studio (if available)
docker-compose exec backend npx prisma studio
```

---

## 🚀 Deployment to Cloud

### DigitalOcean

```bash
# 1. Create Droplet (Docker pre-installed)
# Choose: Ubuntu 22.04, Docker marketplace app, 2GB+ RAM

# 2. SSH into droplet
ssh root@your-droplet-ip

# 3. Clone repository
git clone https://github.com/your-repo/construction-ai-platform.git
cd construction-ai-platform

# 4. Configure environment
cp .env.docker.example .env.docker
nano .env.docker

# 5. Deploy
docker-compose -f docker-compose.prod.yml --env-file .env.docker up -d

# 6. Initialize database
docker-compose -f docker-compose.prod.yml exec backend npx prisma db push
```

### AWS EC2

```bash
# 1. Launch EC2 instance (Ubuntu 22.04, t3.medium, 20GB storage)
# 2. Install Docker
sudo apt update
sudo apt install docker.io docker-compose -y
sudo systemctl start docker
sudo systemctl enable docker

# 3. Deploy (same as DigitalOcean steps 3-6)
```

### Heroku (Using Heroku Postgres)

```bash
# Install Heroku CLI
curl https://cli-assets.heroku.com/install.sh | sh

# Login
heroku login

# Create app
heroku create construction-ai-platform

# Add Postgres
heroku addons:create heroku-postgresql:hobby-dev

# Deploy
git push heroku master
```

---

## 🔐 Security Best Practices

### 1. Use Strong Passwords

```bash
# Generate secure passwords
openssl rand -base64 32
```

### 2. Environment Variables

- Never commit `.env.docker` or real secrets
- Use different secrets for each environment
- Rotate secrets regularly

### 3. Network Security

```bash
# Use internal Docker network
# Only expose necessary ports
# In production, use reverse proxy (Nginx/Traefik)
```

### 4. SSL/TLS (Production)

```bash
# Use Let's Encrypt with Nginx
docker run -d \
  -p 80:80 -p 443:443 \
  -v /etc/letsencrypt:/etc/letsencrypt \
  nginx:alpine
```

### 5. Regular Updates

```bash
# Update images
docker-compose pull

# Rebuild with latest base images
docker-compose build --pull
```

---

## 📈 Monitoring & Logs

### View Logs

```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f backend

# Last 100 lines
docker-compose logs --tail=100 backend

# Save logs to file
docker-compose logs > logs.txt
```

### Resource Usage

```bash
# View resource usage
docker stats

# View disk usage
docker system df

# View container size
docker-compose ps -a --format "table {{.Names}}\t{{.Size}}"
```

---

## 🎯 Production Checklist

- [ ] Secure passwords in `.env.docker`
- [ ] CORS_ORIGIN set to production domain
- [ ] JWT secrets are strong (32+ characters)
- [ ] Database backups configured
- [ ] SSL/TLS certificate configured
- [ ] Firewall rules configured
- [ ] Logs retention policy set
- [ ] Monitoring alerts set up
- [ ] Domain DNS configured
- [ ] Email SMTP configured
- [ ] Redis password set
- [ ] Database password set

---

## 🔄 Update & Maintenance

### Pull Latest Changes

```bash
# Stop services
docker-compose down

# Pull latest code
git pull origin master

# Rebuild and restart
docker-compose -f docker-compose.prod.yml build
docker-compose -f docker-compose.prod.yml --env-file .env.docker up -d

# Run migrations
docker-compose exec backend npx prisma migrate deploy
```

### Scale Services

```bash
# Run multiple backend instances
docker-compose up -d --scale backend=3

# Use with load balancer (Nginx)
```

---

## 📞 Support

For issues with Docker deployment:
1. Check logs: `docker-compose logs -f`
2. Verify environment variables: `docker-compose config`
3. Check GitHub Issues
4. Review SETUP.md for detailed configuration

---

**Successfully deployed? Access your application!**
- Frontend: http://your-domain.com
- Backend API: http://your-domain.com:5000
- API Docs: http://your-domain.com:5000/api/v1/docs
