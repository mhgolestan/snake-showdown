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

```bash
# Using Make
make test              # All tests
make test-backend      # Backend only
make test-frontend     # Frontend only

# Using npm/uv directly
cd frontend && npm test
cd backend && uv run pytest
```
