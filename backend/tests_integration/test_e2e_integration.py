"""End-to-end integration tests for complete game workflows."""
import pytest


def test_complete_game_session_workflow(client, db_session):
    """Test a complete game session from signup to leaderboard submission."""
    from app.orm_models import ActivePlayerORM
    
    # Step 1: User signs up
    signup_response = client.post("/auth/signup", json={
        "username": "GamePlayer",
        "email": "game@example.com",
        "password": "password123"
    })
    assert signup_response.status_code == 201
    user_id = signup_response.json()["user"]["id"]
    
    # Step 2: Start a game session (create active player)
    game_state = {
        "snake": [{"x": 10, "y": 10}],
        "food": {"x": 15, "y": 15},
        "direction": "RIGHT",
        "score": 0,
        "isGameOver": False,
        "isPaused": False,
        "mode": "walls",
        "gridSize": 20
    }
    
    active_player = ActivePlayerORM(
        user_id=user_id,
        score=0,
        mode="walls",
        game_state=game_state
    )
    db_session.add(active_player)
    db_session.commit()
    
    # Step 3: Verify player appears in active players list
    active_response = client.get("/players")
    assert len(active_response.json()["data"]) == 1
    assert active_response.json()["data"][0]["username"] == "GamePlayer"
    
    # Step 4: Update game state (simulate game progress)
    active_player.score = 150
    active_player.game_state["score"] = 150
    active_player.game_state["snake"].append({"x": 11, "y": 10})
    db_session.commit()
    
    # Step 5: Verify updated state
    player_response = client.get(f"/players/{user_id}")
    assert player_response.json()["data"]["score"] == 150
    
    # Step 6: Game ends - submit score to leaderboard
    submit_response = client.post("/leaderboard", json={
        "score": 150,
        "mode": "walls"
    })
    assert submit_response.status_code == 201
    assert submit_response.json()["data"]["score"] == 150
    
    # Step 7: Remove from active players (game ended)
    db_session.delete(active_player)
    db_session.commit()
    
    # Step 8: Verify player no longer in active list
    active_after = client.get("/players")
    assert len(active_after.json()["data"]) == 0
    
    # Step 9: Verify score is in leaderboard
    leaderboard = client.get("/leaderboard?mode=walls")
    assert len(leaderboard.json()["data"]) == 1
    assert leaderboard.json()["data"][0]["score"] == 150
    assert leaderboard.json()["data"][0]["username"] == "GamePlayer"


def test_multiple_concurrent_game_sessions(client, db_session):
    """Test multiple users playing simultaneously."""
    from app.orm_models import ActivePlayerORM
    
    # Create 3 users
    users = []
    for i in range(3):
        response = client.post("/auth/signup", json={
            "username": f"ConcurrentPlayer{i+1}",
            "email": f"concurrent{i+1}@example.com",
            "password": "password123"
        })
        users.append(response.json()["user"])
    
    # All users start playing
    for i, user in enumerate(users):
        game_state = {
            "snake": [{"x": i*5, "y": i*5}],
            "food": {"x": 10, "y": 10},
            "direction": "UP",
            "score": 0,
            "isGameOver": False,
            "isPaused": False,
            "mode": "walls",
            "gridSize": 20
        }
        
        active_player = ActivePlayerORM(
            user_id=user["id"],
            score=0,
            mode="walls",
            game_state=game_state
        )
        db_session.add(active_player)
    
    db_session.commit()
    
    # Verify all 3 are active
    active_response = client.get("/players")
    assert len(active_response.json()["data"]) == 3
    
    # Players finish at different times with different scores
    scores = [100, 250, 175]
    for i, (user, score) in enumerate(zip(users, scores)):
        # Login as this user
        client.post("/auth/login", json={
            "email": user["email"],
            "password": "password123"
        })
        
        # Submit score
        client.post("/leaderboard", json={
            "score": score,
            "mode": "walls"
        })
    
    # Check leaderboard
    leaderboard = client.get("/leaderboard?mode=walls")
    data = leaderboard.json()["data"]
    
    assert len(data) == 3
    # Should be sorted by score descending
    assert data[0]["score"] == 250
    assert data[1]["score"] == 175
    assert data[2]["score"] == 100


def test_user_plays_multiple_games(client):
    """Test a user playing multiple games and submitting multiple scores."""
    # Create user
    client.post("/auth/signup", json={
        "username": "MultiGamePlayer",
        "email": "multigame@example.com",
        "password": "password123"
    })
    
    # Play 5 games with different scores
    game_scores = [100, 250, 150, 300, 200]
    
    for score in game_scores:
        # Submit score after each game
        response = client.post("/leaderboard", json={
            "score": score,
            "mode": "walls"
        })
        assert response.status_code == 201
    
    # Check leaderboard
    leaderboard = client.get("/leaderboard?mode=walls")
    data = leaderboard.json()["data"]
    
    # All 5 scores should be recorded
    assert len(data) == 5
    
    # Should be sorted descending
    assert data[0]["score"] == 300
    assert data[1]["score"] == 250
    assert data[2]["score"] == 200
    assert data[3]["score"] == 150
    assert data[4]["score"] == 100
    
    # All should belong to the same user
    assert all(entry["username"] == "MultiGamePlayer" for entry in data)


def test_cross_mode_leaderboards(client):
    """Test that different game modes have separate leaderboards."""
    # Create user
    client.post("/auth/signup", json={
        "username": "CrossModePlayer",
        "email": "crossmode@example.com",
        "password": "password123"
    })
    
    # Submit scores for both modes
    client.post("/leaderboard", json={"score": 100, "mode": "walls"})
    client.post("/leaderboard", json={"score": 200, "mode": "pass-through"})
    client.post("/leaderboard", json={"score": 150, "mode": "walls"})
    client.post("/leaderboard", json={"score": 250, "mode": "pass-through"})
    
    # Check walls leaderboard
    walls_lb = client.get("/leaderboard?mode=walls")
    walls_data = walls_lb.json()["data"]
    assert len(walls_data) == 2
    assert all(entry["mode"] == "walls" for entry in walls_data)
    assert walls_data[0]["score"] == 150
    assert walls_data[1]["score"] == 100
    
    # Check pass-through leaderboard
    pt_lb = client.get("/leaderboard?mode=pass-through")
    pt_data = pt_lb.json()["data"]
    assert len(pt_data) == 2
    assert all(entry["mode"] == "pass-through" for entry in pt_data)
    assert pt_data[0]["score"] == 250
    assert pt_data[1]["score"] == 200
    
    # Check combined leaderboard
    all_lb = client.get("/leaderboard")
    all_data = all_lb.json()["data"]
    assert len(all_data) == 4
