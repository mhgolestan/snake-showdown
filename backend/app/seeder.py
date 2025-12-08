"""Seed fake data into the database for development."""
from app.database import SessionLocal, init_db
from app.orm_models import UserORM, LeaderboardEntryORM
import bcrypt


def hash_password(password: str) -> str:
    """Hash a password using bcrypt."""
    password_bytes = password.encode('utf-8')
    salt = bcrypt.gensalt()
    hashed = bcrypt.hashpw(password_bytes, salt)
    return hashed.decode('utf-8')


def populate_fake_data():
    """Populate the database with fake users and leaderboard entries."""
    
    # Ensure tables exist
    init_db()
    
    # Create database session
    db = SessionLocal()
    
    try:
        # Check if data already exists
        existing_users = db.query(UserORM).count()
        if existing_users > 0:
            print(f"⏭️  Database already has {existing_users} users, skipping seed")
            return
        
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
            user = UserORM(
                username=user_data["username"],
                email=user_data["email"],
                password_hash=hash_password(user_data["password"])
            )
            db.add(user)
            created_users.append(user)
        
        # Commit users to get their IDs
        db.commit()
        
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
            entry = LeaderboardEntryORM(
                user_id=user.id,
                score=entry_data["score"],
                mode=entry_data["mode"]
            )
            db.add(entry)
        
        db.commit()
        
        print(f"✅ Seeded {len(created_users)} users and {len(leaderboard_data)} leaderboard entries")
    
    finally:
        db.close()
