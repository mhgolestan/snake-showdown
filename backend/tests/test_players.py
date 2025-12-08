from app.orm_models import UserORM, ActivePlayerORM

def test_get_players(client, db_session):
    # Create a user first
    user = UserORM(
        username="p1",
        email="p1@example.com",
        password_hash="hashed"
    )
    db_session.add(user)
    db_session.commit()
    
    # Create an active player
    player = ActivePlayerORM(
        user_id=user.id,
        score=10,
        mode="walls",
        game_state={"snake": [], "food": {"x": 0, "y": 0}, "direction": "UP", "score": 10, "isGameOver": False, "isPaused": False, "mode": "walls", "gridSize": 20}
    )
    db_session.add(player)
    db_session.commit()
    
    response = client.get("/players")
    assert response.status_code == 200
    data = response.json()["data"]
    assert len(data) == 1
    assert data[0]["username"] == "p1"

def test_get_player_detail(client, db_session):
    # Create a user first
    user = UserORM(
        username="p1",
        email="p1@example.com",
        password_hash="hashed"
    )
    db_session.add(user)
    db_session.commit()
    
    # Create an active player
    player = ActivePlayerORM(
        user_id=user.id,
        score=10,
        mode="walls",
        game_state={"snake": [], "food": {"x": 0, "y": 0}, "direction": "UP", "score": 10, "isGameOver": False, "isPaused": False, "mode": "walls", "gridSize": 20}
    )
    db_session.add(player)
    db_session.commit()
    
    response = client.get(f"/players/{user.id}")
    assert response.status_code == 200
    assert response.json()["data"]["username"] == "p1"
    
    response = client.get("/players/nonexistent")
    assert response.json()["data"] is None
