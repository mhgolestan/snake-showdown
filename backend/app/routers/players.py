from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import Optional
from app.models import ActivePlayer
from app.database import get_db
from app.orm_models import ActivePlayerORM, UserORM

router = APIRouter(prefix="/players", tags=["players"])


def orm_to_pydantic_active_player(player_orm: ActivePlayerORM) -> ActivePlayer:
    """Convert ORM active player to Pydantic model."""
    return ActivePlayer(
        id=player_orm.user_id,
        username=player_orm.user.username,
        score=player_orm.score,
        mode=player_orm.mode,
        gameState=player_orm.game_state,
        startedAt=player_orm.started_at
    )


@router.get("")
async def get_active_players(db: Session = Depends(get_db)):
    """Get all active players for spectator mode."""
    players = db.query(ActivePlayerORM).join(UserORM).all()
    
    return {
        "success": True,
        "data": [orm_to_pydantic_active_player(player) for player in players]
    }


@router.get("/{id}")
async def get_player(id: str, db: Session = Depends(get_db)):
    """Get specific player's game state."""
    player = db.query(ActivePlayerORM).join(UserORM).filter(ActivePlayerORM.user_id == id).first()
    
    if not player:
        return {"success": True, "data": None}
    
    return {
        "success": True,
        "data": orm_to_pydantic_active_player(player)
    }
