"""Seed fake data into the in-memory database for development."""
from app.db import MockDB
import uuid


def populate_fake_data():
    """Populate the database with fake users and leaderboard entries."""
    
    # Create fake users
    users_data = [
        {"username": "SnakeKing", "email": "snake.king@example.com", "password": "password123"},
        {"username": "PythonMaster", "email": "python.master@example.com", "password": "password123"},
        {"username": "CobraCommander", "email": "cobra.cmd@example.com", "password": "password123"},
        {"username": "VenomousViper", "email": "viper@example.com", "password": "password123"},
        {"username": "SlitherPro", "email": "slither.pro@example.com", "password": "password123"}
    ]
    
    created_users = []
    for user_data in users_data:
        user = MockDB.create_user(
            username=user_data["username"],
            email=user_data["email"],
            password_hash=user_data["password"]  # In real app, this would be hashed
        )
        created_users.append(user)
    
    # Create fake leaderboard entries
    leaderboard_data = [
        {"user_idx": 0, "score": 450, "mode": "walls"},
        {"user_idx": 1, "score": 380, "mode": "walls"},
        {"user_idx": 2, "score": 320, "mode": "walls"},
        {"user_idx": 0, "score": 280, "mode": "pass-through"},
        {"user_idx": 3, "score": 250, "mode": "walls"},
        {"user_idx": 1, "score": 240, "mode": "pass-through"},
        {"user_idx": 4, "score": 210, "mode": "walls"},
        {"user_idx": 2, "score": 190, "mode": "pass-through"},
        {"user_idx": 3, "score": 180, "mode": "pass-through"},
        {"user_idx": 4, "score": 150, "mode": "pass-through"},
    ]
    
    for entry_data in leaderboard_data:
        user = created_users[entry_data["user_idx"]]
        MockDB.add_score(
            user_id=user["id"],
            username=user["username"],
            score=entry_data["score"],
            mode=entry_data["mode"]
        )
    
    print(f"✅ Seeded {len(created_users)} users and {len(leaderboard_data)} leaderboard entries")
