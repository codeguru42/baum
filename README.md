# Go Tournament Result Reporting System

![CI](https://github.com/codeguru42/baum/workflows/CI/badge.svg)

A web application for participants in a Go tournament to report their game results. Built with Django REST Framework backend and React with Material-UI frontend.

## Features

- Report game results with complete player and game information
- Automatic player lookup by AGA ID
- Auto-fill player information if already in the system
- Record game details including:
  - Player information (AGA ID, name, rank, age)
  - Game settings (handicap, colors)
  - Game outcome (winner, rated/unrated)
- Form validation and error handling
- Responsive Material-UI design
- Docker containerization for easy deployment

## Technology Stack

### Backend
- Django 4.2.9
- Django REST Framework 3.14.0
- SQLite database
- CORS headers for frontend integration

### Frontend
- React 18
- Material-UI (MUI) 5
- Axios for API calls
- React Testing Library

### Deployment
- Docker & Docker Compose
- Multi-container architecture

## Project Structure

```
baum-vibe/
├── backend/
│   ├── tournament/           # Django app
│   │   ├── models.py        # Player and Game models
│   │   ├── serializers.py   # REST API serializers
│   │   ├── views.py         # API viewsets
│   │   ├── urls.py          # URL routing
│   │   ├── admin.py         # Admin interface
│   │   └── tests.py         # Backend tests (15 tests)
│   ├── tournament_app/       # Django project settings
│   ├── manage.py
│   └── pyproject.toml        # Python dependencies (managed with uv)
└── frontend/
    ├── src/
    │   ├── components/
    │   │   ├── GameResultForm.js      # Main form component
    │   │   └── GameResultForm.test.js # Component tests
    │   ├── services/
    │   │   └── api.js                 # API client
    │   └── App.js
    └── package.json
```

## Quick Start with Docker (Recommended)

The easiest way to run the application is using Docker. This will start both backend and frontend with a single command.

### Prerequisites
- Docker Desktop installed ([Download here](https://www.docker.com/products/docker-desktop))
- Docker Compose (included with Docker Desktop)

### Running Development Environment

1. Start the application:
```bash
./docker-start.sh
```

Or manually:
```bash
docker compose up --build
```

2. Access the application:
   - **Frontend**: http://localhost:3000
   - **Backend API**: http://localhost:8000/api
   - **Admin Interface**: http://localhost:8000/admin

3. Stop the application:
```bash
docker compose down
```

### Running Production Environment

For production deployment with optimized builds and nginx:

1. Configure environment variables:
```bash
cp .env.example .env
# Edit .env with your production settings
```

2. Build and start production services:
```bash
docker compose -f docker-compose.prod.yml up -d --build
```

3. Access the application on port 80

**For detailed production deployment instructions, see [DEPLOYMENT.md](DEPLOYMENT.md)**

### Automated Deployment to DigitalOcean

This project includes GitHub Actions workflow for automated deployment:

- **Automatic deployment** when pushing to `main` branch
- **Manual deployment** via GitHub Actions UI
- **Zero-downtime deployments** with App Platform
- **Health checks** to verify deployment success

**Setup Guide**: See [DIGITALOCEAN.md](DIGITALOCEAN.md) for deployment configuration.

### Docker Commands

```bash
# View logs
docker compose logs -f

# View logs for specific service
docker compose logs -f backend
docker compose logs -f frontend

# Restart services
docker compose restart

# Rebuild containers
docker compose up --build

# Stop and remove containers, networks, and volumes
docker compose down -v

# Run Django commands in container
docker compose exec backend python manage.py createsuperuser
docker compose exec backend python manage.py test

# Access container shell
docker compose exec backend bash
docker compose exec frontend sh
```

## Manual Setup Instructions

If you prefer to run the application without Docker:

### Backend Setup

1. Navigate to the backend directory:
```bash
cd backend
```

2. Create and activate a virtual environment:
```bash
python3 -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

3. Install uv (Python package installer):
```bash
curl -LsSf https://astral.sh/uv/install.sh | sh
```

4. Install dependencies:
```bash
uv sync
```

5. Run migrations:
```bash
python manage.py migrate
```

6. (Optional) Create a superuser for admin access:
```bash
uv run python manage.py createsuperuser
```

7. Start the Django development server:
```bash
uv run python manage.py runserver
```

The backend API will be available at `http://localhost:8000/api/`

### Frontend Setup

1. Navigate to the frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Start the React development server:
```bash
npm start
```

The frontend will be available at `http://localhost:3000/`

## Continuous Integration

This project uses GitHub Actions for automated testing and building. On every push and pull request, the CI pipeline:

1. **Backend Tests**: Runs all Django unit and API tests
2. **Frontend Tests**: Runs React component tests with coverage
3. **Docker Build**: Validates both development and production Docker builds
4. **Code Quality**: Lints Python and JavaScript code

### CI Status

View the latest build status: ![CI](https://github.com/codeguru42/baum/workflows/CI/badge.svg)



## Running Tests

### Backend Tests

```bash
cd backend
uv run python manage.py test
```

The backend includes 15 comprehensive tests covering:
- Model creation and validation
- API endpoints (CRUD operations)
- Player lookup functionality
- Game result submission
- Data validation rules

### Frontend Tests

```bash
cd frontend
npm test
```

The frontend includes tests for:
- Component rendering
- Form validation
- User interactions
- API integration
- Error handling

### Running Tests in Docker

```bash
# Backend tests
docker compose exec backend python manage.py test

# Frontend tests
docker compose exec frontend npm test -- --watchAll=false
```

## API Endpoints

### Players

- `GET /api/players/` - List all players
- `POST /api/players/` - Create a new player
- `GET /api/players/{aga_id}/` - Get player by AGA ID
- `PUT /api/players/{aga_id}/` - Update player
- `DELETE /api/players/{aga_id}/` - Delete player

### Games

- `GET /api/games/` - List all games
- `POST /api/games/` - Submit a new game result
- `GET /api/games/{id}/` - Get game details

## Usage

1. Start both the backend and frontend servers (see Setup Instructions)

2. Open your browser to `http://localhost:3000/`

3. Fill in the form:
   - Enter Player 1's AGA ID (if the player exists, their info will auto-fill)
   - Complete Player 1's information (name, rank, age)
   - Select Player 1's color
   - Repeat for Player 2
   - Enter game details (handicap, winner, rated/unrated)
   - Click "Submit Game Result"

4. The system will:
   - Create/update player records
   - Save the game result
   - Display a success message
   - Reset the form for the next entry

## Admin Interface

Access the Django admin interface at `http://localhost:8000/admin/` to:
- View all players and games
- Search and filter records
- Manually add or edit data

## Data Models

### Player Model
- `aga_id` (Primary Key): Unique AGA ID number
- `name`: Player's full name
- `aga_rank`: AGA rank (e.g., "5d", "3k")
- `age`: Player's age

### Game Model
- `player1` / `player2`: Foreign keys to Player model
- `player1_color` / `player2_color`: Stone color (black/white)
- `handicap`: Number of handicap stones
- `rated`: Boolean for rated/unrated game
- `winner`: Which player won (player1/player2)
- `created_at`: Timestamp of result submission

## Development Notes

- The backend uses SQLite for simplicity. For production, consider PostgreSQL
- CORS is configured to allow requests from `http://localhost:3000`
- All dates are stored in UTC
- Form validation ensures players can't play themselves and must have different colors

## License

This project is for tournament use.
