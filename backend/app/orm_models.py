"""SQLAlchemy ORM models for database tables."""
from sqlalchemy import Column, String, Integer, DateTime, ForeignKey, Index, JSON
from sqlalchemy.orm import relationship
from datetime import datetime, timezone
from app.database import Base
import uuid


def generate_uuid():
    """Generate a UUID string for primary keys."""
    return str(uuid.uuid4())


class UserORM(Base):
    """User table for authentication and player data."""
    __tablename__ = "users"
    
    id = Column(String, primary_key=True, default=generate_uuid)
    username = Column(String, nullable=False)
    email = Column(String, unique=True, nullable=False, index=True)
    password_hash = Column(String, nullable=False)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)
    
    # Relationships
    leaderboard_entries = relationship("LeaderboardEntryORM", back_populates="user", cascade="all, delete-orphan")
    active_player = relationship("ActivePlayerORM", back_populates="user", uselist=False, cascade="all, delete-orphan")
    
    def __repr__(self):
        return f"<User(id={self.id}, username={self.username}, email={self.email})>"


class LeaderboardEntryORM(Base):
    """Leaderboard entries for high scores."""
    __tablename__ = "leaderboard"
    
    id = Column(String, primary_key=True, default=generate_uuid)
    user_id = Column(String, ForeignKey("users.id"), nullable=False)
    score = Column(Integer, nullable=False)
    mode = Column(String, nullable=False)  # 'walls' or 'pass-through'
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)
    
    # Relationships
    user = relationship("UserORM", back_populates="leaderboard_entries")
    
    # Indexes for performance
    __table_args__ = (
        Index('idx_leaderboard_mode_score', 'mode', 'score'),
        Index('idx_leaderboard_created_at', 'created_at'),
    )
    
    def __repr__(self):
        return f"<LeaderboardEntry(id={self.id}, user_id={self.user_id}, score={self.score}, mode={self.mode})>"


class ActivePlayerORM(Base):
    """Active players currently playing (for spectator mode)."""
    __tablename__ = "active_players"
    
    id = Column(String, primary_key=True, default=generate_uuid)
    user_id = Column(String, ForeignKey("users.id"), unique=True, nullable=False)
    score = Column(Integer, nullable=False)
    mode = Column(String, nullable=False)  # 'walls' or 'pass-through'
    game_state = Column(JSON, nullable=False)  # Store game state as JSON
    started_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)
    
    # Relationships
    user = relationship("UserORM", back_populates="active_player")
    
    def __repr__(self):
        return f"<ActivePlayer(id={self.id}, user_id={self.user_id}, score={self.score})>"
