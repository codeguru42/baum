"""FastAPI application entry point for Baum Tournament Management System."""

import os
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

    # Optionally seed database with test data
    # Set SEED_DATABASE=true in environment to enable
    if os.getenv("SEED_DATABASE", "").lower() in ("true", "1", "yes"):
        print("Seeding database with test data...")
        from seed_data import seed_database

        seed_database()

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


@app.get("/health/database", tags=["health"])
async def database_health_check():
    """
    Database health check endpoint.
    
    Tests database connectivity and returns connection information.
    Useful for debugging deployment issues and monitoring.
    
    Returns:
        - status: "ok" if database is accessible, "error" otherwise
        - database_type: "postgresql", "sqlite", or "unknown"
        - connection_pooling: Whether connection pooling is enabled (Supabase)
        - can_query: Whether a test query succeeded
        - message: Human-readable status message
    """
    import logging

    from database import engine, get_session
    from sqlmodel import text

    logger = logging.getLogger(__name__)
    
    try:
        # Get database type from connection URL
        db_url = str(engine.url)
        db_type = "unknown"
        if db_url.startswith("postgresql"):
            db_type = "postgresql"
        elif db_url.startswith("sqlite"):
            db_type = "sqlite"
        
        # Check if using Supabase connection pooling
        using_pooling = os.getenv("POSTGRES_URL") is not None
        
        # Test database query - simple SELECT to verify connection
        with next(get_session()) as session:
            result = session.exec(text("SELECT 1")).first()
            can_query = result is not None and result[0] == 1
        
        return {
            "status": "ok",
            "database_type": db_type,
            "connection_pooling": using_pooling,
            "can_query": can_query,
            "message": "Database connection is healthy",
        }
    
    except Exception as e:
        # Log full error details server-side for debugging
        logger.error(f"Database health check failed: {str(e)}", exc_info=True)
        
        # Return generic error to client (don't expose internal details)
        return JSONResponse(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            content={
                "status": "error",
                "message": "Database connection failed",
                "can_query": False,
            },
        )


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
