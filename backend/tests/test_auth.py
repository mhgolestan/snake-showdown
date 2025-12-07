def test_signup(client):
    response = client.post("/auth/signup", json={
        "username": "testuser",
        "email": "test@example.com",
        "password": "password123"
    })
    assert response.status_code == 201
    data = response.json()
    assert data["success"] is True
    assert data["user"]["username"] == "testuser"
    assert "mock_session" in response.cookies

def test_login_success(client):
    # Setup user
    client.post("/auth/signup", json={
        "username": "testuser",
        "email": "test@example.com",
        "password": "password123"
    })
    
    response = client.post("/auth/login", json={
        "email": "test@example.com",
        "password": "password123"
    })
    assert response.status_code == 200
    assert response.json()["success"] is True
    assert "mock_session" in response.cookies

def test_login_failure(client):
    response = client.post("/auth/login", json={
        "email": "wrong@example.com",
        "password": "password123"
    })
    assert response.json()["success"] is False

def test_me(client):
    # Setup user
    auth_response = client.post("/auth/signup", json={
        "username": "testuser",
        "email": "test@example.com",
        "password": "password123"
    })
    
    client.cookies = auth_response.cookies
    response = client.get("/auth/me")
    assert response.status_code == 200
    assert response.json()["success"] is True
    assert response.json()["data"]["username"] == "testuser"
