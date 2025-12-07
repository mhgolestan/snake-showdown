.PHONY: help dev dev-backend dev-frontend test test-backend test-frontend install clean

# Default target
help:
	@echo "Snake Showdown - Available Commands"
	@echo ""
	@echo "Development:"
	@echo "  make dev              - Run both backend and frontend concurrently"
	@echo "  make dev-backend      - Run backend only"
	@echo "  make dev-frontend     - Run frontend only"
	@echo ""
	@echo "Testing:"
	@echo "  make test             - Run all tests (backend + frontend, requires backend running)"
	@echo "  make test-backend     - Run backend tests only"
	@echo "  make test-frontend    - Run frontend tests only (requires backend running)"
	@echo "  make test-unit        - Run unit tests only (no backend required)"
	@echo ""
	@echo "Setup:"
	@echo "  make install          - Install all dependencies"
	@echo "  make clean            - Clean build artifacts"

# Development commands
dev:
	@echo "Starting backend and frontend servers..."
	@cd frontend && npm run dev:all

dev-backend:
	@echo "Starting backend server on http://localhost:8000..."
	@cd backend && uv run uvicorn app.main:app --reload

dev-frontend:
	@echo "Starting frontend server on http://localhost:8080..."
	@cd frontend && npm run dev

# Testing commands
test:
	@echo "⚠️  Note: Integration tests require backend to be running on port 8000"
	@echo "Run 'make dev-backend' in another terminal first, or use 'make test-unit' for unit tests only"
	@echo ""
	@$(MAKE) test-backend
	@$(MAKE) test-frontend

test-backend:
	@echo "Running backend tests..."
	@cd backend && uv run pytest

test-frontend:
	@echo "Running frontend tests (requires backend on port 8000)..."
	@cd frontend && npm test -- --run

test-unit:
	@echo "Running unit tests only (no backend required)..."
	@cd backend && uv run pytest
	@cd frontend && npm test -- --run src/game/ src/components/

# Setup commands
install:
	@echo "Installing backend dependencies..."
	@cd backend && uv sync
	@echo "Installing frontend dependencies..."
	@cd frontend && npm install
	@echo "✅ All dependencies installed"

clean:
	@echo "Cleaning build artifacts..."
	@cd frontend && rm -rf dist node_modules/.vite
	@echo "✅ Clean complete"
