from fastapi import APIRouter, Query
from app.models import LeaderboardEntry, ScoreSubmission
from app.db import MockDB
from typing import List, Optional
import uuid

router = APIRouter(prefix="/leaderboard", tags=["leaderboard"])

@router.get("", response_model=dict)
async def get_leaderboard(mode: Optional[str] = Query(None, enum=["walls", "pass-through"])):
    entries = MockDB.get_leaderboard(mode)
    return {"success": True, "data": entries}

@router.post("", status_code=201)
async def submit_score(submission: ScoreSubmission):
    # In a real app, we'd get the user from the session
    # For now, let's create a definition of a Guest user if no session
    # Or just require a user ID in the submission for this mock?
    # The openapi spec doesn't have user ID in requestBody for submitting score.
    # It implies the user is authenticated. 
    # For this mock, I'll generate a random guest name if we can't contextually find one, 
    # but since I haven't set up full context vars, I'll simulate a user.
    
    # Simulating an authenticated user for the mock submission if not present
    user_id = "test-user-id" 
    username = "Player1"
    
    entry = MockDB.add_score(user_id, username, submission.score, submission.mode)
    return {"success": True, "data": entry}
