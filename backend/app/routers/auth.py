from fastapi import APIRouter, HTTPException, status, Response, Request, Depends
from sqlalchemy.orm import Session
import bcrypt
from app.models import LoginRequest, SignupRequest, AuthResponse, User
from app.database import get_db
from app.orm_models import UserORM

router = APIRouter(prefix="/auth", tags=["auth"])


def hash_password(password: str) -> str:
    """Hash a password using bcrypt."""
    # Convert password to bytes and hash it
    password_bytes = password.encode('utf-8')
    salt = bcrypt.gensalt()
    hashed = bcrypt.hashpw(password_bytes, salt)
    return hashed.decode('utf-8')


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verify a password against its hash."""
    password_bytes = plain_password.encode('utf-8')
    hashed_bytes = hashed_password.encode('utf-8')
    return bcrypt.checkpw(password_bytes, hashed_bytes)


def orm_to_pydantic_user(user_orm: UserORM) -> User:
    """Convert ORM user model to Pydantic model."""
    return User(
        id=user_orm.id,
        username=user_orm.username,
        email=user_orm.email,
        createdAt=user_orm.created_at
    )


@router.post("/signup", response_model=AuthResponse, status_code=201)
async def signup(request: SignupRequest, response: Response, db: Session = Depends(get_db)):
    # Check if user already exists
    existing_user = db.query(UserORM).filter(UserORM.email == request.email).first()
    if existing_user:
        return AuthResponse(success=False, error="Email already exists")
    
    # Create new user with hashed password
    new_user = UserORM(
        username=request.username,
        email=request.email,
        password_hash=hash_password(request.password)
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    
    # Set session cookie
    response.set_cookie(key="mock_session", value=new_user.id)
    
    return AuthResponse(success=True, user=orm_to_pydantic_user(new_user))


@router.post("/login", response_model=AuthResponse)
async def login(request: LoginRequest, response: Response, db: Session = Depends(get_db)):
    # Find user by email
    user = db.query(UserORM).filter(UserORM.email == request.email).first()
    
    if not user or not verify_password(request.password, user.password_hash):
        return AuthResponse(success=False, error="Invalid credentials")
    
    # Set session cookie
    response.set_cookie(key="mock_session", value=user.id)
    
    return AuthResponse(success=True, user=orm_to_pydantic_user(user))


@router.post("/logout")
async def logout(response: Response):
    response.delete_cookie("mock_session")
    return {"success": True}


@router.get("/me")
async def get_me(request: Request, db: Session = Depends(get_db)):
    user_id = request.cookies.get("mock_session")
    if not user_id:
        return {"success": False, "data": None}
    
    user = db.query(UserORM).filter(UserORM.id == user_id).first()
    if not user:
        return {"success": False, "data": None}
    
    return {"success": True, "data": orm_to_pydantic_user(user)}
