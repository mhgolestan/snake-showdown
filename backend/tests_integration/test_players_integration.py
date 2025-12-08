"""Integration tests for active players functionality."""
import pytest


def test_active_players_crud(client, db_session):
    """Test creating and retrieving active players."""
    from app.orm_models import UserORM, ActivePlayerORM
    
    # Create a user
    signup_response = client.post("/auth/signup", json={
        "username": "activeplayer",
        "email": "active@example.com",
        "password": "password123"
    })
    user_id = signup_response.json()["user"]["id"]
    
    # Manually create an active player (simulating game session)
    game_state = {
        "snake": [{"x": 10, "y": 10}, {"x": 9, "y": 10}],
        "food": {"x": 15, "y": 15},
        "direction": "RIGHT",
        "score": 50,
        "isGameOver": False,
        "isPaused": False,
        "mode": "walls",
        "gridSize": 20
    }
    
    active_player = ActivePlayerORM(
        user_id=user_id,
        score=50,
        mode="walls",
        game_state=game_state
    )
    db_session.add(active_player)
    db_session.commit()
    
    # Retrieve all active players
    response = client.get("/players")
    assert response.status_code == 200
    data = response.json()["data"]
    
    assert len(data) == 1
    assert data[0]["username"] == "activeplayer"
    assert data[0]["score"] == 50
    assert data[0]["mode"] == "walls"
    assert data[0]["gameState"]["score"] == 50
    assert data[0]["gameState"]["direction"] == "RIGHT"
    
    # Retrieve specific player
    player_response = client.get(f"/players/{user_id}")
    assert player_response.status_code == 200
    player_data = player_response.json()["data"]
    
    assert player_data["username"] == "activeplayer"
    assert player_data["score"] == 50
    assert player_data["gameState"]["snake"] == game_state["snake"]


def test_multiple_active_players(client, db_session):
    """Test multiple players can be active simultaneously."""
    from app.orm_models import ActivePlayerORM
    
    # Create multiple users
    users = []
    for i in range(3):
        response = client.post("/auth/signup", json={
            "username": f"player{i+1}",
            "email": f"player{i+1}@example.com",
            "password": "password123"
        })
        users.append(response.json()["user"])
    
    # Create active player sessions for each
    for i, user in enumerate(users):
        game_state = {
            "snake": [{"x": i, "y": i}],
            "food": {"x": 10, "y": 10},
            "direction": "UP",
            "score": (i + 1) * 10,
            "isGameOver": False,
            "isPaused": False,
            "mode": "walls" if i % 2 == 0 else "pass-through",
            "gridSize": 20
        }
        
        active_player = ActivePlayerORM(
            user_id=user["id"],
            score=(i + 1) * 10,
            mode=game_state["mode"],
            game_state=game_state
        )
        db_session.add(active_player)
    
    db_session.commit()
    
    # Retrieve all active players
    response = client.get("/players")
    assert response.status_code == 200
    data = response.json()["data"]
    
    assert len(data) == 3
    
    # Verify each player has correct data
    usernames = {player["username"] for player in data}
    assert usernames == {"player1", "player2", "player3"}
    
    scores = {player["score"] for player in data}
    assert scores == {10, 20, 30}


def test_nonexistent_player(client):
    """Test retrieving a non-existent player returns None."""
    response = client.get("/players/nonexistent-id")
    assert response.status_code == 200
    assert response.json()["success"] is True
    assert response.json()["data"] is None


def test_empty_active_players(client):
    """Test that empty active players list is handled correctly."""
    response = client.get("/players")
    assert response.status_code == 200
    assert response.json()["success"] is True
    assert response.json()["data"] == []
