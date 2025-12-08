def test_submit_score(client):
    # First create and login a user
    client.post("/auth/signup", json={
        "username": "testuser",
        "email": "test@example.com",
        "password": "password123"
    })
    
    response = client.post("/leaderboard", json={
        "score": 100,
        "mode": "walls"
    })
    assert response.status_code == 201
    data = response.json()
    assert data["success"] is True
    assert data["data"]["score"] == 100
    assert data["data"]["mode"] == "walls"

def test_get_leaderboard(client):
    # Create and login a user
    client.post("/auth/signup", json={
        "username": "testuser",
        "email": "test@example.com",
        "password": "password123"
    })
    
    client.post("/leaderboard", json={"score": 100, "mode": "walls"})
    client.post("/leaderboard", json={"score": 200, "mode": "walls"})
    client.post("/leaderboard", json={"score": 50, "mode": "pass-through"})
    
    response = client.get("/leaderboard?mode=walls")
    assert response.status_code == 200
    data = response.json()["data"]
    assert len(data) == 2
    # Check that scores are sorted descending
    assert data[0]["score"] == 200
    assert data[1]["score"] == 100
    
    response = client.get("/leaderboard?mode=pass-through")
    data = response.json()["data"]
    assert len(data) == 1
    
    response = client.get("/leaderboard")
    data = response.json()["data"]
    assert len(data) == 3
