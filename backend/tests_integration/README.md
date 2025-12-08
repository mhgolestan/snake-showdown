# Integration Tests

This directory contains integration tests that test the complete API workflows with a real SQLite database (using temporary files).

## Difference from Unit Tests

- **Unit tests** (`tests/`): Use in-memory SQLite with `StaticPool`, test individual components
- **Integration tests** (`tests_integration/`): Use file-based SQLite, test complete workflows and interactions between components

## Running Integration Tests

```bash
# Run all integration tests
uv run pytest tests_integration/ -v

# Run specific test file
uv run pytest tests_integration/test_auth_integration.py -v

# Run with coverage
uv run pytest tests_integration/ --cov=app --cov-report=term-missing
```

## Test Files

- `test_auth_integration.py` - Authentication workflows (signup, login, logout, password hashing)
- `test_leaderboard_integration.py` - Leaderboard submission and retrieval with filtering
- `test_players_integration.py` - Active players CRUD operations
- `test_e2e_integration.py` - End-to-end game session workflows

## Test Database

Each test uses a temporary SQLite database file that is:
- Created before the test
- Populated with tables via SQLAlchemy
- Cleaned up after the test

This ensures tests are isolated and don't interfere with each other or the development database.
