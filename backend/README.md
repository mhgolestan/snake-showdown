# Snake Showdown Backend

This is the backend API for the Snake Showdown game, built with [FastAPI](https://fastapi.tiangolo.com/).

## Prerequisites

- Python 3.12+
- `uv` (project manager)

## Setup

1.  **Install dependencies:**

    ```bash
    uv sync
    ```

## Running the Server

To start the development server with hot-reload:

```bash
uv run uvicorn app.main:app --reload
```

The server will be available at `http://localhost:8000`.

## API Documentation

Once the server is running, you can access the interactive API docs at:

-   Swagger UI: `http://localhost:8000/docs`
-   ReDoc: `http://localhost:8000/redoc`

## Running Tests

To run the test suite:

```bash
uv run pytest
```

## Project Structure

-   `app/`: Core application logic
    -   `main.py`: Application entry point
    -   `db.py`: Mock in-memory database
    -   `models.py`: Pydantic data models
    -   `routers/`: API route handlers
-   `tests/`: Pytest test suite
