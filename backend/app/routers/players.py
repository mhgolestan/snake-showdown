from fastapi import APIRouter, HTTPException
from app.db import MockDB

router = APIRouter(prefix="/players", tags=["players"])

@router.get("")
async def get_active_players():
    players = MockDB.get_all_active_players()
    return {"success": True, "data": players}

@router.get("/{player_id}")
async def get_player(player_id: str):
    player = MockDB.get_active_player(player_id)
    if not player:
        return {"success": False, "data": None} # Or 404
    return {"success": True, "data": player}
