"""FastAPI application entry point for Baum Tournament Management System."""

from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from config import settings
from database import create_db_and_tables, engine


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


@app.get("/", tags=["health"])
async def health_check():
    """Health check endpoint."""
    return {"status": "ok", "message": "Baum Tournament API is running"}
