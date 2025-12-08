from fastapi import APIRouter, Depends, Request
from sqlalchemy.orm import Session
from sqlalchemy import desc
from typing import Optional
from app.models import LeaderboardEntry, ScoreSubmission
from app.database import get_db
from app.orm_models import LeaderboardEntryORM, UserORM

router = APIRouter(prefix="/leaderboard", tags=["leaderboard"])


def orm_to_pydantic_leaderboard(entry_orm: LeaderboardEntryORM) -> LeaderboardEntry:
    """Convert ORM leaderboard entry to Pydantic model."""
    return LeaderboardEntry(
        id=entry_orm.id,
        userId=entry_orm.user_id,
        username=entry_orm.user.username,
        score=entry_orm.score,
        mode=entry_orm.mode,
        createdAt=entry_orm.created_at
    )


@router.get("")
async def get_leaderboard(mode: Optional[str] = None, db: Session = Depends(get_db)):
    """Get leaderboard entries, optionally filtered by mode."""
    query = db.query(LeaderboardEntryORM).join(UserORM)
    
    if mode:
        query = query.filter(LeaderboardEntryORM.mode == mode)
    
    # Order by score descending
    entries = query.order_by(desc(LeaderboardEntryORM.score)).all()
    
    return {
        "success": True,
        "data": [orm_to_pydantic_leaderboard(entry) for entry in entries]
    }


@router.post("", status_code=201)
async def submit_score(
    submission: ScoreSubmission,
    request: Request,
    db: Session = Depends(get_db)
):
    """Submit a new score to the leaderboard."""
    # Get user from session
    user_id = request.cookies.get("mock_session")
    if not user_id:
        return {"success": False, "error": "Not authenticated"}
    
    user = db.query(UserORM).filter(UserORM.id == user_id).first()
    if not user:
        return {"success": False, "error": "User not found"}
    
    # Create new leaderboard entry
    new_entry = LeaderboardEntryORM(
        user_id=user_id,
        score=submission.score,
        mode=submission.mode
    )
    db.add(new_entry)
    db.commit()
    db.refresh(new_entry)
    
    return {
        "success": True,
        "data": orm_to_pydantic_leaderboard(new_entry)
    }
