# Unified Deployment Dockerfile

# Stage 1: Build Frontend
FROM node:18-alpine AS frontend-builder
WORKDIR /frontend

# Copy dependency definitions
COPY frontend/package.json frontend/package-lock.json ./

# Install dependencies
RUN npm ci

# Copy source code
COPY frontend/ .

# Build the application
RUN npm run build


# Stage 2: Runtime Backend
FROM python:3.12-slim

WORKDIR /app

# Install uv for dependency management
COPY --from=ghcr.io/astral-sh/uv:latest /uv /usr/local/bin/uv

# Copy backend dependency files
# Note: We are in the root context, so we copy from backend/
COPY backend/pyproject.toml backend/uv.lock ./

# Install dependencies
RUN uv sync --frozen --no-dev

# Copy backend application code
COPY backend/app ./app

# Copy frontend build artifacts to backend static directory
COPY --from=frontend-builder /frontend/dist ./app/static

# Expose port (FastAPI default)
EXPOSE 8000

# Run the application
CMD ["sh", "-c", "uv run uvicorn app.main:app --host 0.0.0.0 --port ${PORT:-8000}"]
