from app.db import MockDB

def test_get_players(client):
    # Manually inject a player since there's no public API to "become" an active player yet
    # (assuming that happens via websocket or some other game logic not yet exposed)
    MockDB.update_player_state("user1", "p1", 10, "walls", {})
    
    response = client.get("/players")
    assert response.status_code == 200
    data = response.json()["data"]
    assert len(data) == 1
    assert data[0]["username"] == "p1"

def test_get_player_detail(client):
    MockDB.update_player_state("user1", "p1", 10, "walls", {})
    
    response = client.get("/players/user1")
    assert response.status_code == 200
    assert response.json()["data"]["username"] == "p1"
    
    response = client.get("/players/nonexistent")
    assert response.json()["data"] is None
