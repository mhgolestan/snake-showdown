# Snake Showdown Development

## Running the Application

### Run Both Frontend and Backend Together

```bash
cd frontend
npm run dev:all
```

This will start:
- **Backend** (blue): FastAPI server on http://localhost:8000
- **Frontend** (green): Vite dev server on http://localhost:8080

### Run Separately

**Backend only:**
```bash
cd backend
uv run uvicorn app.main:app --reload
```

**Frontend only:**
```bash
cd frontend
npm run dev
```

## Testing

**Frontend tests:**
```bash
cd frontend
npm test
```

**Backend tests:**
```bash
cd backend
uv run pytest
```
