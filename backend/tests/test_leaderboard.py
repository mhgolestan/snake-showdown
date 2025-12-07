def test_submit_score(client):
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
    client.post("/leaderboard", json={"score": 100, "mode": "walls"})
    client.post("/leaderboard", json={"score": 200, "mode": "walls"})
    client.post("/leaderboard", json={"score": 50, "mode": "pass-through"})
    
    response = client.get("/leaderboard?mode=walls")
    assert response.status_code == 200
    data = response.json()["data"]
    assert len(data) == 2
    
    response = client.get("/leaderboard?mode=pass-through")
    data = response.json()["data"]
    assert len(data) == 1
    
    response = client.get("/leaderboard")
    data = response.json()["data"]
    assert len(data) == 3
