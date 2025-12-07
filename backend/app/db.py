from typing import Dict, List, Optional
from datetime import datetime, timezone
import uuid

# In-memory storage
users: Dict[str, dict] = {}
leaderboard: List[dict] = []
active_tokens: Dict[str, str] = {} # token -> user_id
active_players: Dict[str, dict] = {} # user_id -> active player data

class MockDB:
    @staticmethod
    def get_user_by_email(email: str) -> Optional[dict]:
        for user in users.values():
            if user["email"] == email:
                return user
        return None

    @staticmethod
    def get_user_by_id(user_id: str) -> Optional[dict]:
        return users.get(user_id)

    @staticmethod
    def create_user(username: str, email: str, password_hash: str) -> dict:
        user_id = str(uuid.uuid4())
        now = datetime.now(timezone.utc).isoformat()
        user = {
            "id": user_id,
            "username": username,
            "email": email,
            "password": password_hash, # Minimal mock auth
            "createdAt": now
        }
        users[user_id] = user
        return user

    @staticmethod
    def add_score(user_id: str, username: str, score: int, mode: str) -> dict:
        entry_id = str(uuid.uuid4())
        now = datetime.now(timezone.utc).isoformat()
        entry = {
            "id": entry_id,
            "userId": user_id,
            "username": username,
            "score": score,
            "mode": mode,
            "createdAt": now
        }
        leaderboard.append(entry)
        return entry

    @staticmethod
    def get_leaderboard(mode: Optional[str] = None) -> List[dict]:
        if mode:
            return [entry for entry in leaderboard if entry["mode"] == mode]
        return leaderboard

    @staticmethod
    def update_player_state(user_id: str, username: str, score: int, mode: str, game_state: dict) -> dict:
        now = datetime.now(timezone.utc).isoformat()
        player_data = {
            "id": user_id,
            "username": username,
            "score": score,
            "mode": mode,
            "gameState": game_state,
            "startedAt": active_players.get(user_id, {}).get("startedAt", now)
        }
        active_players[user_id] = player_data
        return player_data

    @staticmethod
    def get_active_player(user_id: str) -> Optional[dict]:
        return active_players.get(user_id)

    @staticmethod
    def get_all_active_players() -> List[dict]:
        return list(active_players.values())
