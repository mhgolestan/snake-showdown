"""Integration test configuration for testing with real SQLite database."""
import pytest
import os
import tempfile
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from app.main import app
from app.database import Base, get_db
from app import orm_models  # Import to register models


@pytest.fixture(scope="function")
def test_db_file():
    """Create a temporary SQLite database file for integration tests."""
    # Create a temporary file
    db_fd, db_path = tempfile.mkstemp(suffix=".db")
    yield db_path
    # Cleanup
    os.close(db_fd)
    os.unlink(db_path)


@pytest.fixture(scope="function")
def db_session(test_db_file):
    """Create a database session with a temporary SQLite file."""
    # Create engine with file-based SQLite
    database_url = f"sqlite:///{test_db_file}"
    engine = create_engine(database_url, connect_args={"check_same_thread": False})
    
    # Create all tables
    Base.metadata.create_all(bind=engine)
    
    # Create session
    TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
    session = TestingSessionLocal()
    
    try:
        yield session
    finally:
        session.close()
        Base.metadata.drop_all(bind=engine)
        engine.dispose()


@pytest.fixture(scope="function")
def client(db_session):
    """Create a test client with database dependency override."""
    def override_get_db():
        try:
            yield db_session
        finally:
            pass
    
    # Override the database dependency
    app.dependency_overrides[get_db] = override_get_db
    
    # Disable startup events for tests
    app.router.on_startup = []
    app.router.on_shutdown = []
    
    with TestClient(app) as test_client:
        yield test_client
    
    # Clean up
    app.dependency_overrides.clear()
