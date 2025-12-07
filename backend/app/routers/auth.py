from fastapi import APIRouter, HTTPException, status, Response, Depends
from app.models import LoginRequest, SignupRequest, AuthResponse, User
from app.db import MockDB

router = APIRouter(prefix="/auth", tags=["auth"])

# Simple mock session handling
def get_current_user_id(response: Response):
    # In a real app, we'd check signed cookies or headers
    # For this mock, we'll just check a "mock_session" cookie
    return None 

@router.post("/signup", response_model=AuthResponse, status_code=201)
async def signup(request: SignupRequest, response: Response):
    if MockDB.get_user_by_email(request.email):
        return AuthResponse(success=False, error="Email already exists")
    
    # In a real app, we would hash the password here
    user_data = MockDB.create_user(request.username, request.email, request.password)
    user = User(**user_data)
    
    # Mock login on signup
    response.set_cookie(key="mock_session", value=user.id)
    
    return AuthResponse(success=True, user=user)

@router.post("/login", response_model=AuthResponse)
async def login(request: LoginRequest, response: Response):
    user_data = MockDB.get_user_by_email(request.email)
    if not user_data or user_data["password"] != request.password:
        return AuthResponse(success=False, error="Invalid credentials")
    
    user = User(**user_data)
    response.set_cookie(key="mock_session", value=user.id)
    return AuthResponse(success=True, user=user)

@router.post("/logout")
async def logout(response: Response):
    response.delete_cookie("mock_session")
    return {"success": True}

from fastapi import Request

@router.get("/me")
async def get_me(request: Request):
    user_id = request.cookies.get("mock_session")
    if not user_id:
        return {"success": False, "data": None}
    
    user_data = MockDB.get_user_by_id(user_id)
    if not user_data:
         return {"success": False, "data": None}

    return {"success": True, "data": User(**user_data)}
