# AGENTS.md - Developer Guide for Coding Agents

This guide provides essential information for AI coding agents working on the baum-vibe Go tournament management system. The project is a full-stack application with a FastAPI backend and React frontend.

## Project Structure

```
baum-vibe/
├── backend/          # FastAPI backend with SQLModel
│   ├── app.py        # FastAPI app entry point
│   ├── models.py     # SQLModel database models
│   ├── schemas.py    # Pydantic request/response schemas
│   ├── database.py   # Database session management
│   ├── routers/      # API endpoint routers
│   │   ├── players.py
│   │   └── games.py
│   ├── tournament/   # Test modules
│   │   ├── player/   # Player tests
│   │   └── game/     # Game tests
│   └── pyproject.toml
└── frontend/         # React frontend with Material-UI
    ├── src/
    │   ├── components/  # Reusable components (layout/, tables/, ui/)
    │   ├── views/       # Page-level components
    │   └── services/    # API client (axios)
    └── package.json
```

## Build, Lint, and Test Commands

### Backend (FastAPI)

**Testing:**
```bash
cd backend
uv run python -m pytest                         # Run all tests
uv run python -m pytest tournament/player/      # Run player tests
uv run python -m pytest tournament/game/        # Run game tests
uv run python -m pytest -k "player"             # Run tests matching pattern
uv run python -m pytest -m "not slow"           # Exclude slow tests
uv run python -m pytest --cov                   # Run with coverage
```

**Linting and Formatting:**
```bash
cd backend
uv run python -m black .                        # Format code (line-length 88)
uv run python -m black --check .                # Check formatting
uv run python -m ruff check .                   # Lint code
uv run python -m ruff check --fix .             # Auto-fix linting issues
uv run mypy .                                   # Type checking
```

**Running:**
```bash
cd backend
uv run uvicorn app:app --reload                # Start dev server (port 8000)
uv run uvicorn app:app --reload --port 8001    # Start on different port
# No migrations needed - SQLModel auto-creates tables on startup
```

### Frontend (React)

**Testing:**
```bash
cd frontend
npm test                                        # Run tests in watch mode
npm test -- --watchAll=false                    # Run tests once
npm test -- --coverage                          # Run with coverage
npm test -- Titlebar                            # Run tests matching "Titlebar"
npm test -- --testPathPattern=Titlebar.test.js  # Run specific test file
```

**Linting and Formatting:**
```bash
cd frontend
npm run lint                                    # Lint code (ESLint, max 0 warnings)
npm run lint:fix                                # Auto-fix linting issues
npm run format                                  # Format code (Prettier)
npm run format:check                            # Check formatting
```

**Running:**
```bash
cd frontend
npm start                                       # Start dev server (port 3000)
npm run build                                   # Production build
```

### Docker

```bash
docker compose up --build                       # Start all services
docker compose exec backend uv run python -m pytest  # Run backend tests in container
docker compose exec frontend npm test -- --watchAll=false  # Run frontend tests
docker compose logs -f backend                  # View backend logs
```

## Code Style Guidelines

### Backend (Python/FastAPI)

**Formatting:**
- Use Black formatter (line length: 88)
- Follow PEP 8 conventions
- Ruff linter enforces style rules (pycodestyle, pyflakes, isort, flake8-bugbear)

**Imports:**
- Sort imports automatically with isort (via ruff)
- Group order: standard library → third-party → FastAPI/SQLModel → local
- Example:
```python
from datetime import datetime

from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session, select

from database import get_session
from models import Player
from schemas import PlayerResponse
```

**Type Hints:**
- Use type hints where appropriate (mypy enabled)
- Not strict mode, but encouraged for clarity
- Use modern Python 3.11+ syntax (e.g., `list[str]` not `List[str]`)

**Naming Conventions:**
- Models: PascalCase (e.g., `Player`, `Game`)
- Functions/variables: snake_case (e.g., `get_player`, `aga_id`)
- Constants: UPPER_SNAKE_CASE (e.g., `DATABASE_URL`)
- Private functions: prefix with `_` (e.g., `_compute_player_statistics`)

**Docstrings:**
- Use docstrings for public functions and classes
- Format: `"""Brief description."""` or multi-line with details

**Models (SQLModel):**
- Use descriptive field names
- Add `Field()` for constraints and metadata
- Implement `Relationship()` for foreign keys with back_populates
- Implement `__str__` method for string representation
- Example:
```python
class Player(SQLModel, table=True):
    """Model to store player information."""
    
    aga_id: str = Field(primary_key=True, max_length=20)
    name: str = Field(max_length=200, index=True)
    age: int
    created_at: datetime = Field(default_factory=datetime.utcnow)
    
    # Relationships
    games_as_player_black: list["Game"] = Relationship(back_populates="player_black")
    
    def __str__(self) -> str:
        return f"{self.name} ({self.aga_id})"
```

**Routers (FastAPI):**
- Use APIRouter for organizing endpoints
- Add docstrings to router functions for OpenAPI documentation
- Use proper HTTP status codes from `fastapi.status`
- Use dependency injection for database sessions
- Example:
```python
router = APIRouter(prefix="/api/players", tags=["players"])

@router.get("/", response_model=list[PlayerResponse])
def list_players(session: Session = Depends(get_session)):
    """List all players with computed statistics."""
    statement = select(Player).order_by(Player.name)
    players = session.exec(statement).all()
    return [_player_to_response(player) for player in players]
```

**Schemas (Pydantic):**
- Separate Base, Create, Update, and Response schemas
- Use field validators for custom validation
- Use `ConfigDict(from_attributes=True)` for ORM compatibility
- Example:
```python
class PlayerBase(BaseModel):
    """Base schema for player with common fields."""
    name: str
    aga_rank: str
    age: int

class PlayerCreate(PlayerBase):
    """Schema for creating a new player."""
    aga_id: str

class PlayerResponse(PlayerBase):
    """Schema for player response with computed statistics."""
    aga_id: str
    games_played: int
    games_won: int
    games_lost: int
    created_at: datetime
    updated_at: datetime
    
    model_config = ConfigDict(from_attributes=True)
```

**Error Handling:**
- Use HTTPException for API errors
- Provide descriptive error messages
- Use appropriate HTTP status codes
- Example:
```python
from fastapi import HTTPException, status

if not player:
    raise HTTPException(
        status_code=status.HTTP_404_NOT_FOUND,
        detail=f"Player with aga_id '{aga_id}' not found",
    )
```

### Frontend (JavaScript/React)

**Formatting:**
- Use Prettier (semi: true, singleQuote: true, printWidth: 100, tabWidth: 2)
- No tabs (useTabs: false)
- Trailing commas: es5

**Imports:**
- Sort imports alphabetically (enforced by ESLint)
- Group order: react → external → internal → relative
- No duplicate imports
- Never mix default and named imports on same line
- Use specific MUI subpath imports (NOT barrel imports):
  - ✅ `import Button from '@mui/material/Button';`
  - ❌ `import { Button } from '@mui/material';`
- Example:
```javascript
import { useState } from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import { playerService } from '../services/api';
```

**Naming Conventions:**
- Components: PascalCase (e.g., `Titlebar`, `PlayersTable`)
- Functions/variables: camelCase (e.g., `handleSubmit`, `isLoading`)
- Constants: UPPER_SNAKE_CASE (e.g., `API_BASE_URL`)
- Test files: Component.test.js
- Props: camelCase, use destructuring

**Components:**
- Functional components only (no class components)
- Use hooks (useState, useEffect, etc.)
- Export default for main component
- PropTypes are disabled (prop-types: off)
- No need to import React in JSX files

**Hooks:**
- Follow Rules of Hooks (enforced by ESLint)
- `react-hooks/rules-of-hooks`: error
- `react-hooks/exhaustive-deps`: warn

**Error Handling:**
- Use try/catch for async operations
- Handle API errors with user-friendly messages
- Use Material-UI Snackbar for notifications

**Testing:**
- Use React Testing Library (@testing-library/react)
- Test files: `Component.test.js`
- Wrap components needing Router with `<BrowserRouter>`
- Use `@testing-library/jest-dom` matchers
- Focus on user behavior, not implementation details
- Prefer `byRole()` queries whenever possible (most accessible and resilient)
- Prefer `toBeVisible()` over `toBeInTheDocument()` (validates user can see element)

**JSX/Accessibility:**
- Always provide `alt` text for images (jsx-a11y/alt-text: error)
- Use semantic HTML elements
- Ensure proper ARIA attributes

**Code Quality:**
- No console.log (use console.warn/error if needed) - `no-console: warn`
- No `var`, use `const` or `let` - `no-var: error`, `prefer-const: error`
- Always use strict equality (`===`) - `eqeqeq: always`
- No unused variables (except prefixed with `_`)

## API Design

**Endpoints:**
- Use RESTful conventions
- Use trailing slashes: `/api/players/`
- Path parameters for lookups: `/api/players/{aga_id}/`
- Return proper status codes: 200 (OK), 201 (Created), 404 (Not Found), 400 (Bad Request), 500 (Server Error)

**Request/Response:**
- Content-Type: application/json
- Use Pydantic schemas for validation and serialization
- Return error messages in format: `{"detail": "Error message"}`
- FastAPI auto-generates OpenAPI docs at `/docs` and `/redoc`

## Database

**Database System:**
- **Production (Vercel)**: PostgreSQL (via Vercel Postgres or other hosted provider)
- **Local Development**: SQLite (default, no setup required)
- SQLModel/SQLAlchemy provides database-agnostic ORM

**Configuration:**
- Database URL is set via `POSTGRES_URL` (Supabase/connection pooling) or `DATABASE_URL` (other providers)
- If neither set, defaults to `sqlite:///./db.sqlite3` for local development
- PostgreSQL URLs are automatically normalized (`postgres://` → `postgresql://`)
- Connection logging helps debug deployment issues (passwords are masked in logs)
- Health check endpoint: `GET /health/database` - verifies database connectivity

**Models:**
- SQLModel auto-creates tables on startup (no migrations needed)
- Schema changes: update models.py, delete database, restart server
- Foreign keys cascade on delete where appropriate
- Use `Relationship()` with `back_populates` for bidirectional relationships

**Seeding Data:**
- Use `seed_data.py` to populate database with test data
- Run directly: `uv run python seed_data.py`
- Auto-seed on startup: Set `SEED_DATABASE=true` environment variable
- Useful for initial deployment to Vercel with test data

**Setup Instructions:**

*Local Development (SQLite):*
```bash
cd backend
# Database auto-created on first run, no setup needed
uv run uvicorn app:app --reload

# Optional: Seed with test data
uv run python seed_data.py
```

*Production (Supabase + Vercel):*
1. **Create Supabase Project:**
   - Go to https://supabase.com and create new project
   - Wait for database to provision (~2 minutes)

2. **Get Connection String:**
   - Go to Project Settings → Database → Connection String
   - Copy the "Connection Pooling" URL (starts with `postgres://`)
   - Note: Use Transaction mode for serverless (default)

3. **Set Environment Variables in Vercel:**
   
   Get your Supabase Connection Pooling URL:
   - Supabase Dashboard → Project Settings → Database → Connection String
   - Select **"Connection Pooling"** tab (NOT "URI")
   - Copy the full connection string (starts with `postgres://` or `postgresql://`)
   - Format: `postgresql://user:pass@aws-0-region.pooler.supabase.com:6543/postgres`
   
   ```bash
   cd backend
   
   # Set the Supabase connection pooling URL
   vercel env add POSTGRES_URL production
   # Paste the full connection string from Supabase
   # Example: postgresql://postgres.[ref]:[PASSWORD]@aws-0-us-west-1.pooler.supabase.com:6543/postgres
   ```
   
   **Important:** 
   - Use **Connection Pooling** (port 6543), NOT Direct Connection (port 5432)
   - Connection pooling is required for Vercel's serverless environment
   - Tables are automatically created on first request via SQLModel
   - No manual migrations or seeding required unless you want test data

4. **Deploy:**
   ```bash
   git push origin main
   # Vercel auto-deploys
   ```

5. **Verify Deployment:**
   ```bash
   # Check database health
   curl https://baum-backend.vercel.app/health/database
   
   # Test API endpoints
   curl https://baum-backend.vercel.app/api/players/
   curl https://baum-backend.vercel.app/api/games/
   ```

6. **Cleanup (Optional):**
   ```bash
   # After confirming data persists, remove seeding
   vercel env rm SEED_DATABASE production
   ```

**Health Check:**
- Endpoint: `GET /health/database`
- Tests database connectivity and returns connection status
- Returns 503 if database is unreachable
- Logs errors server-side for debugging (not exposed to client)
- Example: `curl https://baum-backend.vercel.app/health/database`

**Response Example:**
```json
{
  "status": "ok",
  "database_type": "postgresql",
  "connection_pooling": true,
  "can_query": true,
  "message": "Database connection is healthy"
}
```

**Troubleshooting Supabase Connection:**

*Issue: "Database connection failed" in health check*
- **Check:** Verify `POSTGRES_URL` is set in Vercel environment variables
- **Check:** Ensure you're using the Connection Pooling URL (port 6543, hostname with `.pooler.supabase.com`)
- **Check:** Supabase project is not paused (auto-pauses after 1 week inactivity on free tier)
- **Check:** Vercel logs for connection errors: `vercel logs`
- **Solution:** Go to Supabase dashboard → Project → Resume if paused

*Issue: "Cannot assign requested address" or connection timeout*
- **Cause:** Using Direct Connection (port 5432) instead of Connection Pooling (port 6543)
- **Solution:** Use Supabase Connection Pooling URL from dashboard (select "Connection Pooling" tab)
- **Check:** URL should contain `.pooler.supabase.com:6543`, not `.supabase.co:5432`

*Issue: "invalid dsn" or "invalid connection option" errors*
- **Cause:** Query parameters in connection URL causing parsing issues
- **Solution:** The code automatically strips query parameters (e.g., `?sslmode=require`)
- **Check:** Ensure `POSTGRES_URL` is the full connection string from Supabase

*Issue: "No players registered yet" on first load*
- **Cause:** Database is empty (tables exist but no data)
- **Solution 1:** Set `SEED_DATABASE=true` and redeploy
- **Solution 2:** Manually add players through API or admin interface
- **Verify:** Check database has data: `curl https://your-app.vercel.app/api/players/`

*Issue: SSL/TLS connection errors*
- **Cause:** Supabase requires SSL connections
- **Solution:** Connection string should include `?sslmode=require` (Supabase adds this automatically)
- **Check:** Verify SSL is enabled in connection string
- **Note:** SQLAlchemy/SQLModel handles SSL automatically with proper connection string

*Issue: "Too many connections" error*
- **Cause:** Supabase free tier has connection limits (50-100 connections)
- **Solution:** Use connection pooling (Transaction mode) - this is default with `POSTGRES_URL`
- **Check:** Verify `connection_pooling: true` in `/health/database` response
- **Note:** Connection pooling URL has `6543` port, direct connection uses `5432`

*Issue: Slow queries or timeouts*
- **Cause:** Supabase free tier has performance limits
- **Solution:** Ensure you're using Transaction mode pooling (fastest for serverless)
- **Check:** Connection string should be from "Connection Pooling" section in Supabase
- **Upgrade:** Consider Supabase Pro for better performance

*Issue: "Invalid password" or authentication errors*
- **Cause:** Password contains special characters that need URL encoding
- **Solution:** Supabase provides pre-encoded connection strings - use as-is
- **Don't:** Manually construct connection strings from individual components
- **Do:** Copy the full connection string from Supabase dashboard

*Debugging Commands:*
```bash
# Check environment variables are set
cd backend
vercel env ls | grep POSTGRES

# View deployment logs
vercel logs --follow

# Test health check locally (with Supabase URL)
export POSTGRES_URL="your-supabase-connection-string"
uv run uvicorn app:app --reload
curl http://localhost:8000/health/database

# Check database from command line (requires psql)
psql "your-supabase-connection-string"
\dt  # List tables
SELECT COUNT(*) FROM player;  # Check player count
```

*Useful Links:*
- Supabase Dashboard: https://supabase.com/dashboard
- Supabase Docs - Connection Pooling: https://supabase.com/docs/guides/database/connecting-to-postgres#connection-pooler
- Vercel Environment Variables: https://vercel.com/docs/concepts/projects/environment-variables

## Git Commit Style

Based on recent commits, use conventional commit format:
- `refactor:` - code restructuring without behavior change
- `feat:` - new features
- `fix:` - bug fixes
- `style:` - formatting changes
- `test:` - adding/updating tests
- `docs:` - documentation changes

**Commit Workflow:**
- Make granular commits when developing a plan
- Each commit should represent a single logical change
- Commit frequently as you complete discrete steps
- Commit after making a change to ensure progress is saved

Examples:
- `refactor: rename Navigation to Titlebar and remove navigation buttons`
- `feat: create view components with Outlet pattern`
- `fix: resolve API connection timeout issue`

## Common Patterns

**Component Structure:**
```javascript
import { useState } from 'react';
import Box from '@mui/material/Box';

const ComponentName = () => {
  const [state, setState] = useState(null);
  
  const handleAction = () => {
    // logic here
  };
  
  return (
    <Box>
      {/* JSX here */}
    </Box>
  );
};

export default ComponentName;
```

**FastAPI Router Pattern:**
```python
from fastapi import APIRouter, Depends, HTTPException, status
from sqlmodel import Session, select
from database import get_session
from models import ModelName
from schemas import ModelCreate, ModelUpdate, ModelResponse

router = APIRouter(prefix="/api/models", tags=["models"])

@router.get("/", response_model=list[ModelResponse])
def list_models(session: Session = Depends(get_session)):
    """List all models."""
    statement = select(ModelName)
    models = session.exec(statement).all()
    return models

@router.post("/", response_model=ModelResponse, status_code=status.HTTP_201_CREATED)
def create_model(model_data: ModelCreate, session: Session = Depends(get_session)):
    """Create a new model."""
    model = ModelName.model_validate(model_data)
    session.add(model)
    session.commit()
    session.refresh(model)
    return model
```

## Notes for Agents

- Always run tests after making changes
- Use specific imports, avoid barrel imports (especially MUI)
- Follow the established file organization (components/layout, components/tables, etc.)
- Keep components focused and single-purpose
- Validate data on both frontend and backend
- Use Material-UI components consistently
- Write tests for new components and features
- Update this file if you discover new patterns or conventions
