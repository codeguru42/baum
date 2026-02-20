# GitHub Actions CI

This directory contains GitHub Actions workflows for continuous integration.

## Workflows

### 1. CI Workflow (`ci.yml`)

Runs on every push and pull request to `main` and `develop` branches.

---

## CI Workflow Details

### CI Workflow (`ci.yml`)

Runs on every push and pull request to `main` and `develop` branches.

#### Jobs

##### 1. Backend Tests (`backend-test`)
- **Environment**: Ubuntu Latest with Python 3.11
- **Steps**:
  - Checkout code
  - Set up Python with pip caching
  - Install Python dependencies
  - Run Django unit and API tests
- **Tests Coverage**:
  - 15 comprehensive tests
  - Model validation tests
  - API endpoint tests (CRUD operations)
  - Game validation rules
  - Player lookup functionality

##### 2. Frontend Tests (`frontend-test`)
- **Environment**: Ubuntu Latest with Node.js 20
- **Steps**:
  - Checkout code
  - Set up Node.js with npm caching
  - Install npm dependencies
  - Run React tests with coverage
  - Build production frontend bundle
- **Tests Coverage**:
  - Component rendering tests
  - Form validation tests
  - User interaction tests
  - API integration tests

##### 3. Docker Build Tests (`docker-build`)
- **Environment**: Ubuntu Latest with Docker Buildx
- **Depends On**: `backend-test`, `frontend-test`
- **Steps**:
  - Checkout code
  - Set up Docker Buildx
  - Build development Docker images
  - Start development containers
  - Test backend API health (port 8000)
  - Test frontend health (port 3000)
  - Tear down development containers
- **Validates**:
  - Development Docker Compose configuration
  - Container health checks
  - API accessibility

##### 4. Code Quality (`lint`)
- **Environment**: Ubuntu Latest
- **Steps**:
  - Checkout code
  - Lint Python code with flake8
  - Lint JavaScript code via build process
- **Quality Checks**:
  - Python syntax errors
  - Undefined names
  - Code complexity
  - Line length
  - React build warnings

## Status Badge

Add this badge to your README to show CI status:

```markdown
![CI](https://github.com/YOUR_USERNAME/baum-vibe/workflows/CI/badge.svg)
```

Replace `YOUR_USERNAME` with your GitHub username.

## Running Tests Locally

### Backend Tests
```bash
cd backend
uv sync
uv run python manage.py test
```

### Frontend Tests
```bash
cd frontend
npm install
npm test -- --watchAll=false --coverage
```

### Docker Tests
```bash
# Development build
docker compose build
docker compose up -d
curl http://localhost:8000/api/players/
curl http://localhost:3000/
docker compose down
```

## Environment Variables for CI

The following environment variables are used in CI builds:

- `DJANGO_SECRET_KEY`: Test secret key (production requires real secret)
- `DJANGO_ALLOWED_HOSTS`: Comma-separated list of allowed hosts
- `VITE_API_URL`: API endpoint URL for frontend

## Caching Strategy

To speed up CI builds, the following caches are used:

1. **Python dependencies**: `uv` cache based on `pyproject.toml` and `uv.lock`
2. **Node.js dependencies**: `npm` cache based on `package-lock.json`
3. **Docker layers**: Docker Buildx cache for faster image builds

## Troubleshooting CI Failures

### Backend Test Failures
- Check Python version compatibility (3.11)
- Verify all dependencies are in `pyproject.toml`
- Ensure database migrations are applied
- Check for Django settings issues

### Frontend Test Failures
- Check Node.js version compatibility (20)
- Verify all dependencies are in `package.json`
- Ensure tests don't require browser-specific features
- Check for missing test mocks

### Docker Build Failures
- Verify Dockerfile syntax
- Check for missing dependencies in container
- Ensure proper file permissions
- Validate environment variable requirements
- Check port conflicts

### Lint Failures
- Run `flake8` locally to see specific issues
- Fix Python syntax errors and undefined names
- Address code complexity warnings
- Check for React build warnings

## Adding New Tests

### Backend Tests
Add new tests to `backend/tournament/tests.py` or create new test files:
```python
from django.test import TestCase

class MyNewTest(TestCase):
    def test_something(self):
        # Your test code
        pass
```

### Frontend Tests
Add new tests alongside your components:
```javascript
import { render, screen } from '@testing-library/react';
import MyComponent from './MyComponent';

test('renders component', () => {
  render(<MyComponent />);
  expect(screen.getByText(/hello/i)).toBeInTheDocument();
});
```

## Future Enhancements

Potential CI improvements:

1. **Code Coverage Requirements**: Fail build if coverage drops below threshold
2. **Performance Testing**: Add load testing with tools like Locust
3. **Security Scanning**: Add dependency vulnerability scanning
4. **E2E Testing**: Add Playwright or Cypress for end-to-end tests
5. **Docker Image Publishing**: Push images to Docker Hub or GitHub Container Registry
6. **Slack/Email Notifications**: Notify team on build failures
7. **Scheduled Tests**: Run tests nightly even without code changes

## Contributing

When contributing, ensure:
1. All tests pass locally before pushing
2. New features include appropriate tests
3. Code follows project style guidelines
4. Docker builds succeed locally
5. Documentation is updated as needed
