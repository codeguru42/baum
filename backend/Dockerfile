FROM python:3.11-slim

# Set environment variables
ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

# Install uv
COPY --from=ghcr.io/astral-sh/uv:latest /uv /usr/local/bin/uv

# Set work directory
WORKDIR /app

# Copy dependency files first for better layer caching
COPY pyproject.toml uv.lock /app/

# Install dependencies including dev dependencies for development
RUN uv sync --frozen

# Copy project
COPY . /app/

# Expose port
EXPOSE 8000

# Run migrations and start server
CMD ["sh", "-c", "uv run python manage.py migrate && uv run python manage.py runserver 0.0.0.0:8000"]
