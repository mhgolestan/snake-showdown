from pydantic import BaseModel, EmailStr, Field
from typing import List, Optional, Literal
from datetime import datetime

# Common Models
class Position(BaseModel):
    x: int
    y: int

class GameState(BaseModel):
    snake: List[Position]
    food: Position
    direction: Literal['UP', 'DOWN', 'LEFT', 'RIGHT']
    score: int
    isGameOver: bool
    isPaused: bool
    mode: Literal['walls', 'pass-through']
    gridSize: int

class User(BaseModel):
    id: str
    username: str
    email: EmailStr
    createdAt: datetime

class LeaderboardEntry(BaseModel):
    id: str
    userId: str
    username: str
    score: int
    mode: Literal['walls', 'pass-through']
    createdAt: datetime

class ActivePlayer(BaseModel):
    id: str
    username: str
    score: int
    mode: Literal['walls', 'pass-through']
    gameState: GameState
    startedAt: datetime

# Auth Request/Response Models
class LoginRequest(BaseModel):
    email: EmailStr
    password: str

class SignupRequest(BaseModel):
    username: str
    email: EmailStr
    password: str = Field(min_length=6)

class AuthResponse(BaseModel):
    success: bool
    user: Optional[User] = None
    error: Optional[str] = None

# API Response Wrapper
class ApiResponse(BaseModel):
    success: bool
    data: Optional[dict] = None
    error: Optional[str] = None

# Leaderboard Submission
class ScoreSubmission(BaseModel):
    score: int
    mode: Literal['walls', 'pass-through']
