# Docker Deployment Guide

This guide explains how to deploy Snake Showdown using Docker Compose with PostgreSQL, FastAPI backend, and Nginx frontend.

## Prerequisites

- Docker Engine 20.10+
- Docker Compose V2
- 2GB+ available RAM
- Ports 80, 5432, 8000 available

## Quick Start

### 1. Clone and Setup

```bash
cd /workspaces/snake-showdown

# Copy environment template
cp .env.example .env

# Edit .env and change passwords for production
nano .env
```

### 2. Build and Start

```bash
# Build all images
docker-compose build

# Start all services in detached mode
docker-compose up -d

# View logs
docker-compose logs -f
```

### 3. Access the Application

- **Frontend**: http://localhost
- **Backend API**: http://localhost/api
- **Direct Backend**: http://localhost:8000 (for debugging)
- **PostgreSQL**: localhost:5432

## Architecture

```
┌─────────────────────────────────────────┐
│  Nginx (Port 80)                        │
│  ├─ Serves React Frontend               │
│  └─ Reverse Proxy /api/* → Backend      │
└─────────────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────┐
│  FastAPI Backend (Port 8000)            │
│  └─ Python/Uvicorn                      │
└─────────────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────┐
│  PostgreSQL (Port 5432)                 │
│  └─ Persistent Volume                   │
└─────────────────────────────────────────┘
```

## Environment Variables

Edit `.env` file to configure:

```env
# Database
POSTGRES_USER=snakegame
POSTGRES_PASSWORD=your_secure_password_here
POSTGRES_DB=snake_showdown

# Backend (auto-configured)
DATABASE_URL=postgresql://snakegame:your_secure_password_here@postgres:5432/snake_showdown

# Frontend
VITE_API_URL=http://localhost/api
```

> **⚠️ IMPORTANT**: Change `POSTGRES_PASSWORD` in production!

## Common Commands

### Start Services
```bash
docker-compose up -d
```

### Stop Services
```bash
docker-compose down
```

### View Logs
```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f backend
docker-compose logs -f frontend
docker-compose logs -f postgres
```

### Restart a Service
```bash
docker-compose restart backend
```

### Rebuild After Code Changes
```bash
# Rebuild specific service
docker-compose build backend
docker-compose up -d backend

# Rebuild all
docker-compose build
docker-compose up -d
```

### Access Database
```bash
# Connect to PostgreSQL
docker-compose exec postgres psql -U snakegame -d snake_showdown

# Run SQL commands
docker-compose exec postgres psql -U snakegame -d snake_showdown -c "SELECT * FROM users;"
```

### Execute Commands in Containers
```bash
# Backend shell
docker-compose exec backend /bin/bash

# Run backend tests
docker-compose exec backend uv run pytest
```

## Data Persistence

Database data is stored in a Docker volume named `postgres_data`. This persists even when containers are stopped.

### Backup Database
```bash
docker-compose exec postgres pg_dump -U snakegame snake_showdown > backup.sql
```

### Restore Database
```bash
cat backup.sql | docker-compose exec -T postgres psql -U snakegame snake_showdown
```

### Delete All Data
```bash
# Stop and remove containers AND volumes
docker-compose down -v
```

## Troubleshooting

### Port Already in Use
```bash
# Check what's using port 80
sudo lsof -i :80

# Or change the port in docker-compose.yml
# ports:
#   - "8080:80"  # Use port 8080 instead
```

### Backend Can't Connect to Database
```bash
# Check if postgres is healthy
docker-compose ps

# View postgres logs
docker-compose logs postgres

# Verify DATABASE_URL in .env matches postgres credentials
```

### Frontend Shows 404 for API Calls
```bash
# Check nginx configuration
docker-compose exec frontend cat /etc/nginx/conf.d/default.conf

# Verify backend is running
curl http://localhost:8000/
```

### Rebuild from Scratch
```bash
# Stop everything
docker-compose down -v

# Remove images
docker-compose rm -f
docker rmi snake-showdown-backend snake-showdown-frontend

# Rebuild
docker-compose build --no-cache
docker-compose up -d
```

## Development vs Production

### Development
- Use `docker-compose.yml` as-is
- SQLite for local testing: `cd backend && uv run uvicorn app.main:app --reload`
- Frontend dev server: `cd frontend && npm run dev`

### Production
- Change all passwords in `.env`
- Use environment-specific `.env.production`
- Consider adding:
  - HTTPS with Let's Encrypt
  - Redis for caching
  - Separate database server
  - Load balancer
  - Health monitoring

## Health Checks

Services include health checks:

```bash
# Check service health
docker-compose ps

# Should show "healthy" status
```

## Updating the Application

```bash
# Pull latest code
git pull

# Rebuild and restart
docker-compose build
docker-compose up -d

# Database migrations (if needed)
docker-compose exec backend uv run alembic upgrade head
```

## Monitoring

```bash
# Resource usage
docker stats

# Container status
docker-compose ps

# Disk usage
docker system df
```

## Cleanup

```bash
# Remove stopped containers
docker-compose down

# Remove containers and volumes (deletes data!)
docker-compose down -v

# Remove unused images
docker image prune -a
```

## Security Checklist

- [ ] Change default PostgreSQL password
- [ ] Use strong passwords (16+ characters)
- [ ] Don't commit `.env` to git
- [ ] Enable HTTPS in production
- [ ] Update CORS origins for production domain
- [ ] Regular security updates: `docker-compose pull`
- [ ] Limit exposed ports in production
- [ ] Use secrets management for sensitive data

## Support

For issues:
1. Check logs: `docker-compose logs -f`
2. Verify health: `docker-compose ps`
3. Check environment: `docker-compose config`
