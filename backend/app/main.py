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
    "http://localhost:8080",  # Vite dev server
    "http://localhost:5173",  # Alternative Vite port
    "http://localhost",       # Docker Nginx frontend
    "http://localhost:80",    # Docker Nginx frontend (explicit port)
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

@app.get("/api/health")
async def health_check():
    return {"message": "Snake Showdown API is running"}

@app.get("/")
async def root():
    return FileResponse("app/static/index.html")


# Serve Static Files (SPA Support)
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
import os

# Mount the static directory (containing frontend build)
# check if directory exists enabling only if so to allow local dev backend-only run
if os.path.exists("app/static"):
    # Mount assets folder explicitly if vite puts them there?
    # Actually, standard vite build puts assets in /assets. 
    # If we mount root "app/static" to "/", it might shadow API.
    # Better strategy: 
    # 1. Mount specific static folders if known, OR
    # 2. Use a catch-all that tries to find file, else serves index.
    
    app.mount("/assets", StaticFiles(directory="app/static/assets"), name="assets")
    
    # Catch-all for SPA
    @app.get("/{full_path:path}")
    async def catch_all(full_path: str):
        file_path = f"app/static/{full_path}"
        if os.path.exists(file_path) and os.path.isfile(file_path):
             return FileResponse(file_path)
        return FileResponse("app/static/index.html")

