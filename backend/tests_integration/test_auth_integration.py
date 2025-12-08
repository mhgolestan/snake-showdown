"""Integration tests for authentication workflows."""
import pytest


def test_user_signup_and_login_flow(client):
    """Test complete user signup and login flow."""
    # Step 1: Sign up a new user
    signup_response = client.post("/auth/signup", json={
        "username": "integrationuser",
        "email": "integration@example.com",
        "password": "securepassword123"
    })
    
    assert signup_response.status_code == 201
    signup_data = signup_response.json()
    assert signup_data["success"] is True
    assert signup_data["user"]["username"] == "integrationuser"
    assert signup_data["user"]["email"] == "integration@example.com"
    assert "id" in signup_data["user"]
    assert "createdAt" in signup_data["user"]
    
    # Verify session cookie was set
    assert "mock_session" in signup_response.cookies
    user_id = signup_data["user"]["id"]
    
    # Step 2: Verify we can access /auth/me with the session
    me_response = client.get("/auth/me")
    assert me_response.status_code == 200
    me_data = me_response.json()
    assert me_data["success"] is True
    assert me_data["data"]["id"] == user_id
    
    # Step 3: Logout
    logout_response = client.post("/auth/logout")
    assert logout_response.status_code == 200
    assert logout_response.json()["success"] is True
    
    # Step 4: Verify we can't access /auth/me after logout
    me_after_logout = client.get("/auth/me")
    assert me_after_logout.json()["success"] is False
    assert me_after_logout.json()["data"] is None
    
    # Step 5: Login with the same credentials
    login_response = client.post("/auth/login", json={
        "email": "integration@example.com",
        "password": "securepassword123"
    })
    
    assert login_response.status_code == 200
    login_data = login_response.json()
    assert login_data["success"] is True
    assert login_data["user"]["id"] == user_id
    assert "mock_session" in login_response.cookies
    
    # Step 6: Verify /auth/me works again after login
    me_after_login = client.get("/auth/me")
    assert me_after_login.json()["success"] is True
    assert me_after_login.json()["data"]["id"] == user_id


def test_duplicate_email_signup(client):
    """Test that signing up with duplicate email fails."""
    # Create first user
    client.post("/auth/signup", json={
        "username": "user1",
        "email": "duplicate@example.com",
        "password": "password123"
    })
    
    # Try to create second user with same email
    duplicate_response = client.post("/auth/signup", json={
        "username": "user2",
        "email": "duplicate@example.com",
        "password": "password456"
    })
    
    assert duplicate_response.status_code == 201  # Still returns 201 but with error
    assert duplicate_response.json()["success"] is False
    assert "already exists" in duplicate_response.json()["error"].lower()


def test_invalid_login_credentials(client):
    """Test login with invalid credentials."""
    # Create a user
    client.post("/auth/signup", json={
        "username": "testuser",
        "email": "test@example.com",
        "password": "correctpassword"
    })
    
    # Try to login with wrong password
    wrong_password = client.post("/auth/login", json={
        "email": "test@example.com",
        "password": "wrongpassword"
    })
    
    assert wrong_password.json()["success"] is False
    assert "invalid" in wrong_password.json()["error"].lower()
    
    # Try to login with non-existent email
    wrong_email = client.post("/auth/login", json={
        "email": "nonexistent@example.com",
        "password": "anypassword"
    })
    
    assert wrong_email.json()["success"] is False
    assert "invalid" in wrong_email.json()["error"].lower()


def test_password_hashing(client, db_session):
    """Test that passwords are properly hashed in the database."""
    from app.orm_models import UserORM
    
    # Create a user
    password = "mysecretpassword"
    client.post("/auth/signup", json={
        "username": "hashtest",
        "email": "hash@example.com",
        "password": password
    })
    
    # Query the database directly
    user = db_session.query(UserORM).filter(UserORM.email == "hash@example.com").first()
    
    # Verify password is hashed (not stored in plain text)
    assert user.password_hash != password
    assert user.password_hash.startswith("$2b$")  # bcrypt hash prefix
    assert len(user.password_hash) == 60  # bcrypt hash length
