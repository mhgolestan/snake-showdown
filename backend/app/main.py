from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from app.routers import auth, leaderboard, players
from app.database import init_db


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Lifespan context manager for startup and shutdown events."""
    # Startup
    init_db()
    from app.seeder import populate_fake_data
    populate_fake_data()
    yield
    # Shutdown (if needed in the future)


app = FastAPI(title="Snake Showdown API", version="1.0.0", lifespan=lifespan)

# CORS Configuration
origins = [
    "http://localhost:3000",
    "http://localhost:5173", # Common vite port
    "http://localhost:8080", # Actual frontend dev server port
    "http://localhost:8081", # Vite fallback port when 8080 is in use
    "http://127.0.0.1:5173",
    "http://127.0.0.1:8080",
    "http://127.0.0.1:8081",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include Routers
app.include_router(auth.router)
app.include_router(leaderboard.router)
app.include_router(players.router)

@app.get("/")
async def root():
    return {"message": "Snake Showdown API is running"}
