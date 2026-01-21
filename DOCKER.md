# Docker Quick Reference

## Starting the Application

```bash
# Quick start (recommended)
./docker-start.sh

# Or use docker compose directly
docker compose up --build
```

## Stopping the Application

```bash
# Stop containers (keeps data)
docker compose down

# Stop and remove volumes (fresh start)
docker compose down -v
```

## Viewing Logs

```bash
# All services
docker compose logs -f

# Backend only
docker compose logs -f backend

# Frontend only
docker compose logs -f frontend
```

## Running Commands

```bash
# Create superuser for admin
docker compose exec backend python manage.py createsuperuser

# Run backend tests
docker compose exec backend python manage.py test

# Run frontend tests
docker compose exec frontend npm test

# Django migrations
docker compose exec backend python manage.py makemigrations
docker compose exec backend python manage.py migrate
```

## Accessing Containers

```bash
# Backend shell
docker compose exec backend bash

# Frontend shell
docker compose exec frontend sh

# Django shell
docker compose exec backend python manage.py shell
```

## Troubleshooting

```bash
# Rebuild everything from scratch
docker compose down -v
docker compose build --no-cache
docker compose up

# Check container status
docker compose ps

# View container resource usage
docker stats
```

## URLs

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:8000/api
- **Admin Panel**: http://localhost:8000/admin

## Notes

- Database is stored in Docker volume `backend-data`
- Frontend hot-reload is enabled for development
- Backend auto-runs migrations on startup
- CORS is configured for local development
