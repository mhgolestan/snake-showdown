import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, Session
from sqlalchemy.pool import StaticPool
from app.main import app
from app.database import Base, get_db
from app import orm_models  # Import to register models with Base

# Create in-memory SQLite database for testing
# Use StaticPool to ensure all connections use the same in-memory database
SQLALCHEMY_DATABASE_URL = "sqlite:///:memory:"


@pytest.fixture(scope="function")
def db_session():
    """Create a fresh database session for each test."""
    # Create engine with StaticPool for in-memory database
    # This ensures all connections share the same in-memory database
    engine = create_engine(
        SQLALCHEMY_DATABASE_URL,
        connect_args={"check_same_thread": False},
        poolclass=StaticPool  # Critical for in-memory SQLite testing
    )
    
    # Create all tables
    Base.metadata.create_all(bind=engine)
    
    # Create session bound to this engine
    TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
    session = TestingSessionLocal()
    
    try:
        yield session
    finally:
        session.rollback()
        session.close()
        Base.metadata.drop_all(bind=engine)
        engine.dispose()


@pytest.fixture(scope="function")
def client(db_session: Session):
    """Create a test client with database dependency override."""
    def override_get_db():
        try:
            yield db_session
        finally:
            pass
    
    # Override the database dependency
    app.dependency_overrides[get_db] = override_get_db
    
    # Disable startup events for tests (we handle DB init in fixtures)
    app.router.on_startup = []
    app.router.on_shutdown = []
    
    with TestClient(app) as test_client:
        yield test_client
    
    # Clean up
    app.dependency_overrides.clear()
