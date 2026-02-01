# AGENTS.md - Developer Guide for Coding Agents

This guide provides essential information for AI coding agents working on the baum-vibe Go tournament management system. The project is a full-stack application with a Django REST Framework backend and React frontend.

## Project Structure

```
baum-vibe/
├── backend/          # Django REST Framework backend
│   ├── tournament/   # Main Django app (models, views, serializers, tests)
│   └── pyproject.toml
└── frontend/         # React frontend with Material-UI
    ├── src/
    │   ├── components/  # Reusable components (layout/, tables/, ui/)
    │   ├── views/       # Page-level components
    │   └── services/    # API client (axios)
    └── package.json
```

## Build, Lint, and Test Commands

### Backend (Django)

**Testing:**
```bash
cd backend
uv run python manage.py test                    # Run all tests
uv run pytest                                   # Run with pytest (preferred)
uv run pytest tournament/tests/test_player_model.py  # Single test file
uv run pytest tournament/tests/test_player_model.py::test_create_player  # Single test
uv run pytest -k "player"                       # Run tests matching pattern
uv run pytest -m "not slow"                     # Exclude slow tests
uv run pytest --cov                             # Run with coverage
```

**Linting and Formatting:**
```bash
cd backend
uv run black .                                  # Format code (line-length 88)
uv run black --check .                          # Check formatting
uv run ruff check .                             # Lint code
uv run ruff check --fix .                       # Auto-fix linting issues
uv run mypy .                                   # Type checking
```

**Running:**
```bash
cd backend
uv run python manage.py runserver               # Start dev server (port 8000)
uv run python manage.py migrate                 # Run migrations
uv run python manage.py makemigrations          # Create migrations
uv run python manage.py createsuperuser         # Create admin user
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
docker compose exec backend python manage.py test  # Run backend tests in container
docker compose exec frontend npm test -- --watchAll=false  # Run frontend tests
docker compose logs -f backend                  # View backend logs
```

## Code Style Guidelines

### Backend (Python/Django)

**Formatting:**
- Use Black formatter (line length: 88)
- Follow PEP 8 conventions
- Ruff linter enforces style rules (pycodestyle, pyflakes, isort, flake8-bugbear, Django)

**Imports:**
- Sort imports automatically with isort (via ruff)
- Group order: standard library → third-party → Django → local
- Example:
```python
from django.db import models
from rest_framework import viewsets

from .models import Player
from .serializers import PlayerSerializer
```

**Type Hints:**
- Use type hints where appropriate (mypy enabled)
- Not strict mode, but encouraged for clarity

**Naming Conventions:**
- Models: PascalCase (e.g., `Player`, `Game`)
- Functions/variables: snake_case (e.g., `get_player`, `aga_id`)
- Constants: UPPER_SNAKE_CASE (e.g., `COLOR_CHOICES`)
- Private methods: prefix with `_` (e.g., `_validate_colors`)

**Docstrings:**
- Use docstrings for classes and non-obvious functions
- Format: `"""Brief description."""` or multi-line with details

**Models:**
- Use descriptive field names
- Add `related_name` to ForeignKeys (e.g., `related_name="games_as_player1"`)
- Implement `__str__` method
- Add `Meta` class with `ordering` where appropriate
- Implement `clean()` for validation

**Views:**
- Use ViewSets for REST APIs (e.g., `PlayerViewSet`, `GameViewSet`)
- Add docstrings to ViewSets and custom actions
- Use proper HTTP status codes from `rest_framework.status`

**Error Handling:**
- Use try/except with specific exceptions (e.g., `Player.DoesNotExist`)
- Return appropriate HTTP responses with error messages
- Validate data with serializers (`raise_exception=True`)

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
- Use trailing slashes (Django convention): `/api/players/`
- Lookup by custom field: `lookup_field = "aga_id"` → `/api/players/{aga_id}/`
- Return proper status codes: 200, 201, 404, 400, 500

**Request/Response:**
- Content-Type: application/json
- Use serializers for validation and transformation
- Return error messages in format: `{"detail": "Error message"}`

## Database

**Models:**
- SQLite for development
- Use migrations for all schema changes
- Never edit migration files manually
- Foreign keys cascade on delete where appropriate

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

**Django ViewSet Pattern:**
```python
from rest_framework import viewsets
from .models import ModelName
from .serializers import ModelSerializer

class ModelViewSet(viewsets.ModelViewSet):
    """ViewSet for ModelName."""
    queryset = ModelName.objects.all()
    serializer_class = ModelSerializer
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
