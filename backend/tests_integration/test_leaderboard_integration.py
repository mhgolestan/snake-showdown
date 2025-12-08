"""Integration tests for leaderboard functionality."""
import pytest


def test_leaderboard_submission_and_retrieval(client):
    """Test complete leaderboard workflow: signup, submit scores, retrieve leaderboard."""
    # Create multiple users
    users = []
    for i in range(3):
        response = client.post("/auth/signup", json={
            "username": f"player{i+1}",
            "email": f"player{i+1}@example.com",
            "password": "password123"
        })
        users.append(response.json()["user"])
    
    # Submit scores for different modes
    scores_data = [
        {"score": 450, "mode": "walls"},
        {"score": 320, "mode": "walls"},
        {"score": 280, "mode": "pass-through"},
    ]
    
    for i, score_data in enumerate(scores_data):
        # Login as user i
        client.post("/auth/login", json={
            "email": f"player{i+1}@example.com",
            "password": "password123"
        })
        
        # Submit score
        submit_response = client.post("/leaderboard", json=score_data)
        assert submit_response.status_code == 201
        assert submit_response.json()["success"] is True
        assert submit_response.json()["data"]["score"] == score_data["score"]
        assert submit_response.json()["data"]["mode"] == score_data["mode"]
    
    # Retrieve all leaderboard entries
    all_leaderboard = client.get("/leaderboard")
    assert all_leaderboard.status_code == 200
    all_data = all_leaderboard.json()["data"]
    assert len(all_data) == 3
    
    # Verify scores are sorted descending
    assert all_data[0]["score"] == 450
    assert all_data[1]["score"] == 320
    assert all_data[2]["score"] == 280
    
    # Filter by mode: walls
    walls_leaderboard = client.get("/leaderboard?mode=walls")
    walls_data = walls_leaderboard.json()["data"]
    assert len(walls_data) == 2
    assert all(entry["mode"] == "walls" for entry in walls_data)
    assert walls_data[0]["score"] == 450
    assert walls_data[1]["score"] == 320
    
    # Filter by mode: pass-through
    passthrough_leaderboard = client.get("/leaderboard?mode=pass-through")
    passthrough_data = passthrough_leaderboard.json()["data"]
    assert len(passthrough_data) == 1
    assert passthrough_data[0]["mode"] == "pass-through"
    assert passthrough_data[0]["score"] == 280


def test_leaderboard_requires_authentication(client):
    """Test that submitting scores requires authentication."""
    # Try to submit score without authentication
    response = client.post("/leaderboard", json={
        "score": 100,
        "mode": "walls"
    })
    
    # Should fail or return error
    assert response.json()["success"] is False


def test_multiple_scores_per_user(client):
    """Test that a user can submit multiple scores."""
    # Create and login user
    client.post("/auth/signup", json={
        "username": "multiscorer",
        "email": "multi@example.com",
        "password": "password123"
    })
    
    # Submit multiple scores
    scores = [100, 200, 150, 300]
    for score in scores:
        response = client.post("/leaderboard", json={
            "score": score,
            "mode": "walls"
        })
        assert response.status_code == 201
        assert response.json()["success"] is True
    
    # Retrieve leaderboard
    leaderboard = client.get("/leaderboard?mode=walls")
    data = leaderboard.json()["data"]
    
    # All scores should be present
    assert len(data) == 4
    
    # Should be sorted descending
    assert data[0]["score"] == 300
    assert data[1]["score"] == 200
    assert data[2]["score"] == 150
    assert data[3]["score"] == 100
    
    # All should belong to the same user
    assert all(entry["username"] == "multiscorer" for entry in data)


def test_leaderboard_with_usernames(client):
    """Test that leaderboard entries include correct usernames."""
    # Create users with distinct usernames
    users_data = [
        {"username": "SnakeMaster", "email": "snake@example.com"},
        {"username": "PythonPro", "email": "python@example.com"},
    ]
    
    for user_data in users_data:
        client.post("/auth/signup", json={
            **user_data,
            "password": "password123"
        })
        
        # Submit a score
        client.post("/leaderboard", json={
            "score": 100,
            "mode": "walls"
        })
    
    # Retrieve leaderboard
    leaderboard = client.get("/leaderboard")
    data = leaderboard.json()["data"]
    
    # Verify usernames are correct
    usernames = {entry["username"] for entry in data}
    assert "SnakeMaster" in usernames
    assert "PythonPro" in usernames
