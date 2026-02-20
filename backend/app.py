"""FastAPI application entry point for Baum Tournament Management System."""

from contextlib import asynccontextmanager

from fastapi import FastAPI, Request, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from config import settings
from database import create_db_and_tables, engine
from routers import games, players


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Handle startup and shutdown events."""
    # Startup: create database tables
    create_db_and_tables()
    yield
    # Shutdown: dispose of the engine
    engine.dispose()


app = FastAPI(
    title=settings.app_name,
    description=(
        "REST API for managing Go tournament players and game results. "
        "This API provides endpoints to manage player information (CRUD operations), "
        "record and manage game results, and track player statistics."
    ),
    version=settings.app_version,
    docs_url="/docs",
    redoc_url="/redoc",
    lifespan=lifespan,
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(players.router)
app.include_router(games.router)


@app.get("/", tags=["health"])
async def health_check():
    """Health check endpoint."""
    return {"status": "ok", "message": "Baum Tournament API is running"}


@app.exception_handler(404)
async def not_found_handler(request: Request, exc):
    """Custom 404 handler."""
    return JSONResponse(
        status_code=status.HTTP_404_NOT_FOUND,
        content={"detail": "Not found"},
    )


@app.exception_handler(500)
async def internal_error_handler(request: Request, exc):
    """Custom 500 handler."""
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={"detail": "Internal server error"},
    )
