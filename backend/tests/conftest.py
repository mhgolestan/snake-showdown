import pytest
from fastapi.testclient import TestClient
from app.main import app
from app.db import users, leaderboard, active_players, active_tokens

@pytest.fixture
def client():
    return TestClient(app)

@pytest.fixture(autouse=True)
def reset_db():
    # Clear all in-memory dictionaries before each test
    users.clear()
    leaderboard.clear()
    active_players.clear()
    active_tokens.clear()
    yield
