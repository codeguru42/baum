#!/bin/bash

# Build and start all services
echo "Building and starting Docker containers..."
docker compose up --build -d

# Wait for backend to be ready
echo "Waiting for backend to be ready..."
sleep 10

# Show status
echo ""
echo "Services are starting..."
docker compose ps

echo ""
echo "========================================"
echo "Application is running!"
echo "Frontend: http://localhost:3000"
echo "Backend API: http://localhost:8000/api"
echo "Backend Admin: http://localhost:8000/admin"
echo "========================================"
echo ""
echo "To view logs: docker compose logs -f"
echo "To stop: docker compose down"
