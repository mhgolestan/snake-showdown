# Snake Showdown Development

## Quick Start

### Using Make (Recommended)

```bash
# Run both servers together
make dev

# Run separately
make dev-backend   # Backend only
make dev-frontend  # Frontend only

# Run tests
make test          # All tests
make test-backend  # Backend only
make test-frontend # Frontend only

# Setup
make install       # Install all dependencies
make help          # Show all available commands
```

### Using npm/uv directly

**Run both servers together:**
```bash
cd frontend
npm run dev:all
```

This will start:
- **Backend** (blue): FastAPI server on http://localhost:8000
- **Frontend** (green): Vite dev server on http://localhost:8080

**Run separately:**
```bash
# Backend only
cd backend
uv run uvicorn app.main:app --reload

# Frontend only
cd frontend
npm run dev
```

## Testing

> **Note**: Frontend integration tests require the backend to be running on port 8000.  
> Start the backend with `make dev-backend` in another terminal before running `make test`.

```bash
# Using Make
make test              # All tests (requires backend running)
make test-backend      # Backend only
make test-frontend     # Frontend only (requires backend running)
make test-unit         # Unit tests only (no backend required)

# Using npm/uv directly
cd frontend && npm test
cd backend && uv run pytest
```

## Docker Deployment

Deploy the entire application with Docker Compose (PostgreSQL + Backend + Frontend):

```bash
# Quick start
cp .env.example .env
docker-compose build
docker-compose up -d

# Access at http://localhost
```

See [DOCKER.md](./DOCKER.md) for complete Docker deployment guide.

## Project Structure

```
snake-showdown/
├── backend/           # FastAPI backend
│   ├── app/          # Application code
│   ├── tests/        # Unit tests
│   └── tests_integration/  # Integration tests
├── frontend/         # React frontend
│   └── src/          # Source code
├── docker-compose.yml  # Docker orchestration
└── DOCKER.md         # Docker deployment guide
```
