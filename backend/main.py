"""FastAPI application entry point for Baum Tournament Management System."""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(
    title="Baum Tournament Management API",
    description=(
        "REST API for managing Go tournament players and game results. "
        "This API provides endpoints to manage player information (CRUD operations), "
        "record and manage game results, and track player statistics."
    ),
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
)

# Configure CORS
origins = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "http://localhost",
    "http://localhost:80",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/", tags=["health"])
async def health_check():
    """Health check endpoint."""
    return {"status": "ok", "message": "Baum Tournament API is running"}
