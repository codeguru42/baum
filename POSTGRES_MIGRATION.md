# PostgreSQL Migration Guide

This guide provides step-by-step instructions for migrating from SQLite to PostgreSQL when you're ready for production deployment.

## When to Migrate

Migrate from SQLite to PostgreSQL when:
- ✅ Moving to production with real users
- ✅ Need persistent data storage
- ✅ Need concurrent access handling
- ✅ Data loss on cold starts is unacceptable

## Current Limitations with SQLite on Vercel

Vercel serverless functions use ephemeral file systems, which means:
- Database resets on every cold start (~5-10 minutes of inactivity)
- Data is lost between deployments
- Each function invocation may see different database state
- Not suitable for production with real user data

---

## Migration Options

### Option A: Vercel Postgres (Recommended)

**Pros:**
- Integrated with Vercel dashboard
- Automatic connection pooling
- Easy environment variable setup
- Serverless-optimized
- Managed database with automatic backups

**Cons:**
- Paid feature (~$0.02/GB/month after free tier)
- Vendor lock-in to Vercel

**Free Tier:**
- 256 MB storage
- 60 hours of compute per month
- Automatic scaling

**Pricing (after free tier):**
- Storage: $0.02/GB/month
- Compute: $0.10/compute hour

---

### Option B: Neon (Great for Hobby Projects)

**Pros:**
- Generous free tier (512MB storage, 1 compute unit)
- Serverless PostgreSQL with auto-scaling
- Automatic branching for development
- No vendor lock-in
- Great developer experience

**Cons:**
- External service to manage
- Manual setup required

**Free Tier:**
- 512 MB storage
- 1 shared compute unit
- Auto-suspend after inactivity
- Great for hobby projects

---

### Option C: Supabase

**Pros:**
- Generous free tier (500MB storage)
- Includes Auth, Storage, Edge Functions
- PostgreSQL + additional features
- Good for full-stack apps

**Cons:**
- More than just a database (may be overkill)
- Slightly more complex setup

---

### Option D: Railway

**Pros:**
- Simple PostgreSQL setup
- $5 free credit/month
- Can also host backend here with persistent filesystem
- Good for small projects

**Cons:**
- Paid after free credits
- May need to manage multiple services

---

## Migration Steps

### Phase 1: Choose Provider and Create Database

#### Using Vercel Postgres

1. **Via Vercel Dashboard:**
   ```
   1. Go to https://vercel.com/dashboard
   2. Navigate to Storage tab
   3. Click "Create Database" → Select "Postgres"
   4. Name: baum-tournament-db
   5. Region: Choose closest to your users (e.g., us-east-1)
   6. Click "Create"
   ```

2. **Via Vercel CLI:**
   ```bash
   # Create database
   vercel postgres create baum-tournament-db
   
   # Link to backend project
   cd backend
   vercel link
   ```

3. **Environment Variables:**
   - Vercel automatically adds these to your project:
     - `POSTGRES_URL` - Connection string with pooling (use this)
     - `POSTGRES_URL_NON_POOLING` - Direct connection
     - `POSTGRES_PRISMA_URL` - For Prisma ORM
     - `POSTGRES_DATABASE` - Database name
     - `POSTGRES_HOST` - Host
     - `POSTGRES_PASSWORD` - Password
     - `POSTGRES_USER` - Username

#### Using Neon

1. **Create Account:**
   - Go to https://neon.tech
   - Sign up (free, no credit card required)
   - Verify email

2. **Create Project:**
   - Click "Create Project"
   - Name: baum-tournament
   - Region: Choose closest to your users
   - PostgreSQL version: 16 (latest)

3. **Get Connection String:**
   - Copy connection string from dashboard
   - Format: `postgresql://user:password@host/database?sslmode=require`

4. **Add to Vercel:**
   ```bash
   cd backend
   
   # Add to production
   vercel env add DATABASE_URL production
   # Paste Neon connection string when prompted
   
   # Add to preview
   vercel env add DATABASE_URL preview
   # Can use same connection string or create separate database
   ```

---

### Phase 2: Update Backend Dependencies

1. **Edit `backend/pyproject.toml`:**

   Add PostgreSQL adapter to dependencies:

   ```toml
   [project]
   name = "baum-tournament"
   version = "0.1.0"
   description = "Go tournament management system"
   requires-python = ">=3.11"
   dependencies = [
       "fastapi>=0.109.0",
       "uvicorn[standard]>=0.27.0",
       "sqlmodel>=0.0.14",
       "pydantic>=2.5.0",
       "pydantic-settings>=2.1.0",
       "psycopg2-binary>=2.9.9",  # Add this line
   ]
   ```

   **Alternative:** Use async PostgreSQL driver:
   ```toml
   "psycopg[binary,pool]>=3.1.0",  # Async support
   ```

2. **Update lockfile:**
   ```bash
   cd backend
   uv sync
   ```

3. **Commit changes:**
   ```bash
   git add pyproject.toml uv.lock
   git commit -m "feat: add PostgreSQL support"
   ```

---

### Phase 3: Update Database Configuration

1. **Update `backend/database.py`:**

   Replace the entire file with:

   ```python
   """Database configuration and session management."""
   
   import os
   from collections.abc import Generator
   
   from sqlmodel import Session, SQLModel, create_engine
   
   # Get database URL from environment (supports both SQLite and PostgreSQL)
   DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./db.sqlite3")
   
   # Configure engine based on database type
   if DATABASE_URL.startswith("postgresql"):
       # PostgreSQL configuration with connection pooling
       engine = create_engine(
           DATABASE_URL,
           echo=False,  # Set to True for SQL query logging
           pool_pre_ping=True,  # Verify connections before using
           pool_size=5,  # Number of connections to keep open
           max_overflow=10,  # Max additional connections when pool is full
           pool_recycle=3600,  # Recycle connections after 1 hour
       )
   else:
       # SQLite configuration for local development
       engine = create_engine(
           DATABASE_URL,
           echo=False,
           connect_args={"check_same_thread": False},  # Needed for SQLite
       )
   
   
   def create_db_and_tables():
       """Create all database tables."""
       SQLModel.metadata.create_all(engine)
   
   
   def get_session() -> Generator[Session, None, None]:
       """
       Dependency function to get database session.
   
       Yields a database session and ensures it's closed after use.
       Used with FastAPI's Depends() for dependency injection.
       """
       with Session(engine) as session:
           yield session
   ```

   **Key changes:**
   - ✅ Reads `DATABASE_URL` from environment
   - ✅ Detects PostgreSQL vs SQLite
   - ✅ Configures connection pooling for PostgreSQL
   - ✅ Falls back to SQLite for local development

2. **Update `backend/config.py`:**

   Add database URL configuration:

   ```python
   # Database Configuration - read from environment
   database_url: str = os.getenv("DATABASE_URL", "sqlite:///./db.sqlite3")
   ```

   Note: This is optional since we're reading directly in `database.py`, but good for consistency.

3. **Commit changes:**
   ```bash
   git add backend/database.py backend/config.py
   git commit -m "feat: add PostgreSQL database configuration"
   ```

---

### Phase 4: Test Locally (Optional but Recommended)

#### Option 1: Test with Local PostgreSQL (Docker)

1. **Start PostgreSQL container:**
   ```bash
   docker run --name baum-postgres \
     -e POSTGRES_PASSWORD=dev \
     -e POSTGRES_USER=baum \
     -e POSTGRES_DB=baum_tournament \
     -p 5432:5432 \
     -d postgres:16
   ```

2. **Update `.env.local`:**
   ```bash
   echo "DATABASE_URL=postgresql://baum:dev@localhost:5432/baum_tournament" >> backend/.env.local
   ```

3. **Run backend:**
   ```bash
   cd backend
   uv run uvicorn app:app --reload
   ```

4. **Test endpoints:**
   ```bash
   # Health check
   curl http://localhost:8000/
   
   # Create player
   curl -X POST http://localhost:8000/api/players/ \
     -H "Content-Type: application/json" \
     -d '{"aga_id":"TEST001","name":"Test Player","aga_rank":"5k","age":25}'
   
   # List players
   curl http://localhost:8000/api/players/
   ```

5. **Verify database:**
   ```bash
   # Connect to PostgreSQL
   docker exec -it baum-postgres psql -U baum -d baum_tournament
   
   # Check tables
   \dt
   
   # Query players
   SELECT * FROM player;
   
   # Exit
   \q
   ```

#### Option 2: Use Vercel Postgres Locally

```bash
cd backend

# Pull production database URL to local
vercel env pull .env.local

# Run locally (will use production database - be careful!)
uv run uvicorn app:app --reload
```

**⚠️ Warning:** This connects to production database. Only use for testing, don't modify data.

---

### Phase 5: Deploy to Vercel

1. **Verify environment variables:**

   **If using Vercel Postgres:**
   ```bash
   cd backend
   vercel env ls
   # Should see: POSTGRES_URL, DATABASE_URL (auto-added)
   ```

   **If using Neon or other:**
   ```bash
   cd backend
   vercel env ls
   # Should see: DATABASE_URL (you added manually)
   ```

2. **Deploy backend:**
   ```bash
   cd backend
   vercel --prod
   ```

3. **Watch deployment logs:**
   ```bash
   vercel logs https://baum-backend.vercel.app --follow
   ```

4. **Verify database initialization:**
   - Check logs for "CREATE TABLE" statements
   - Vercel will run `create_db_and_tables()` on first cold start
   - Tables should be created automatically

---

### Phase 6: Test Production Deployment

1. **Test API endpoints:**
   ```bash
   # Health check
   curl https://baum-backend.vercel.app/
   
   # Create player
   curl -X POST https://baum-backend.vercel.app/api/players/ \
     -H "Content-Type: application/json" \
     -d '{
       "aga_id": "PROD001",
       "name": "Production Player",
       "aga_rank": "3k",
       "age": 30
     }'
   
   # List players
   curl https://baum-backend.vercel.app/api/players/
   
   # Get specific player
   curl https://baum-backend.vercel.app/api/players/PROD001/
   ```

2. **Test data persistence:**
   ```bash
   # Wait 10 minutes for cold start (function goes inactive)
   # Then test again
   curl https://baum-backend.vercel.app/api/players/
   
   # ✅ Data should still be there!
   # Previously with SQLite, data would be lost
   ```

3. **Test from frontend:**
   - Open https://baum-frontend.vercel.app
   - Navigate to Players page
   - Create, edit, delete players
   - Verify operations succeed
   - Check browser console for errors

---

### Phase 7: Database Management

#### Access Database Console

**Vercel Postgres:**
```bash
# Via Vercel CLI
vercel postgres connect baum-tournament-db

# Or via dashboard
# Go to Storage → baum-tournament-db → Query tab
```

**Neon:**
- Go to Neon dashboard
- Select project → SQL Editor
- Run queries directly in browser

#### Common Database Operations

**View all tables:**
```sql
\dt
```

**View table schema:**
```sql
\d player
\d game
```

**Query data:**
```sql
SELECT * FROM player LIMIT 10;
SELECT * FROM game LIMIT 10;
```

**Count records:**
```sql
SELECT COUNT(*) FROM player;
SELECT COUNT(*) FROM game;
```

**Backup data (local PostgreSQL):**
```bash
docker exec baum-postgres pg_dump -U baum baum_tournament > backup.sql
```

**Restore data:**
```bash
cat backup.sql | docker exec -i baum-postgres psql -U baum -d baum_tournament
```

---

## SQLModel Compatibility Notes

**Good news:** SQLModel works seamlessly with both SQLite and PostgreSQL!

### What Works Automatically

- ✅ Model definitions (no changes needed)
- ✅ Field types (automatically mapped)
- ✅ Relationships (work the same)
- ✅ Queries (same SQLModel/SQLAlchemy syntax)
- ✅ Primary keys, indexes, constraints
- ✅ Foreign keys and cascades

### Type Mappings

| Python Type | SQLite | PostgreSQL |
|------------|--------|------------|
| `str` | TEXT | VARCHAR |
| `int` | INTEGER | INTEGER |
| `float` | REAL | DOUBLE PRECISION |
| `bool` | INTEGER (0/1) | BOOLEAN |
| `datetime` | TEXT | TIMESTAMP |
| `date` | TEXT | DATE |
| `Decimal` | TEXT | NUMERIC |

SQLModel/SQLAlchemy handles conversions automatically!

### Current Models Already Compatible

Your existing models in `backend/models.py` are already PostgreSQL-ready:

```python
class Player(SQLModel, table=True):
    aga_id: str = Field(primary_key=True, max_length=20)  # ✅ VARCHAR(20)
    name: str = Field(max_length=200, index=True)  # ✅ VARCHAR(200), indexed
    age: int  # ✅ INTEGER
    created_at: datetime = Field(default_factory=datetime.utcnow)  # ✅ TIMESTAMP
```

**No changes needed!** 🎉

### Potential Differences to Watch For

1. **Case Sensitivity:**
   - SQLite: Case-insensitive by default
   - PostgreSQL: Case-sensitive for identifiers
   - **Solution:** Use lowercase consistently (you already do this ✅)

2. **Boolean Handling:**
   - SQLite: Stores as 0/1
   - PostgreSQL: Native BOOLEAN type
   - **Solution:** SQLModel handles conversion automatically ✅

3. **DateTime Timezone:**
   - Best practice: Use timezone-aware datetime
   ```python
   from datetime import datetime, timezone
   
   created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
   ```

4. **String Length:**
   - SQLite: VARCHAR length is advisory
   - PostgreSQL: Enforces VARCHAR(N) length
   - **Solution:** You already use `Field(max_length=...)` ✅

---

## Rollback Plan

If you need to rollback to SQLite:

1. **Remove DATABASE_URL environment variable:**
   ```bash
   cd backend
   vercel env rm DATABASE_URL production
   vercel env rm DATABASE_URL preview
   ```

2. **Redeploy:**
   ```bash
   vercel --prod
   ```

3. **Backend will automatically use SQLite** (default in code)

**Note:** You'll lose data stored in PostgreSQL. Export first if needed.

---

## Troubleshooting

### Issue 1: "could not connect to server"

**Cause:** PostgreSQL connection string incorrect

**Solution:**
- Verify DATABASE_URL in environment variables
- Check username, password, host are correct
- Ensure database exists
- Check firewall/security group settings (for external providers)

### Issue 2: "relation does not exist"

**Cause:** Tables not created

**Solution:**
```python
# Tables should be created automatically by lifespan event
# If not, manually trigger:
from database import create_db_and_tables
create_db_and_tables()
```

### Issue 3: "connection pool exhausted"

**Cause:** Too many concurrent connections

**Solution:**
- Increase `pool_size` in `database.py`
- Use connection pooling (Vercel Postgres includes this)
- Check for connection leaks (sessions not closing)

### Issue 4: "SSL connection required"

**Cause:** PostgreSQL requires SSL (common with cloud providers)

**Solution:**
Update connection string:
```python
DATABASE_URL = "postgresql://user:pass@host/db?sslmode=require"
```

Or in `database.py`:
```python
engine = create_engine(
    DATABASE_URL,
    connect_args={"sslmode": "require"}
)
```

---

## Migration Checklist

Use this checklist when performing the migration:

- [ ] Choose PostgreSQL provider (Vercel/Neon/Supabase/Railway)
- [ ] Create database instance
- [ ] Get connection string
- [ ] Add `psycopg2-binary` to `pyproject.toml`
- [ ] Run `uv sync` and commit `uv.lock`
- [ ] Update `backend/database.py` with PostgreSQL configuration
- [ ] (Optional) Test locally with PostgreSQL
- [ ] Add `DATABASE_URL` to Vercel environment variables
- [ ] Deploy backend to Vercel
- [ ] Verify tables are created (check logs)
- [ ] Test API endpoints
- [ ] Create test data
- [ ] Wait for cold start and verify data persists
- [ ] Test from frontend application
- [ ] Document database credentials securely
- [ ] Set up database backups (if not automatic)
- [ ] Update team documentation

---

## Cost Estimation

### Vercel Postgres

**Free Tier:**
- 256 MB storage
- 60 compute hours/month
- Good for: Small hobby projects, testing

**Paid (after free tier):**
- Storage: $0.02/GB/month (~$0.50/month for 25GB)
- Compute: $0.10/hour (~$7/month for 24/7 usage)
- **Estimate:** $10-20/month for small production app

### Neon

**Free Tier:**
- 512 MB storage
- 1 compute unit (shared)
- Auto-suspend after inactivity
- Good for: Hobby projects, low-traffic apps

**Paid:**
- Starts at $19/month for more compute/storage

### Supabase

**Free Tier:**
- 500 MB database space
- 2 GB bandwidth
- Good for: Small projects with extra features

**Paid:**
- Starts at $25/month

### Railway

**Free:**
- $5 credit/month (≈ 500 hours of small instance)
- Good for: Hobby projects

**Paid:**
- Pay-as-you-go after free credit
- ~$5-10/month for small database

---

## Additional Resources

- **Vercel Postgres Docs:** https://vercel.com/docs/storage/vercel-postgres
- **Neon Documentation:** https://neon.tech/docs
- **SQLModel Documentation:** https://sqlmodel.tiangolo.com
- **PostgreSQL Tutorial:** https://www.postgresql.org/docs/current/tutorial.html
- **Vercel Functions Limits:** https://vercel.com/docs/functions/limitations

---

## Summary

PostgreSQL migration is straightforward with SQLModel:
1. ✅ Your models are already compatible
2. ✅ Just add PostgreSQL driver dependency
3. ✅ Update database configuration to detect PostgreSQL
4. ✅ Set DATABASE_URL environment variable
5. ✅ Deploy and test

**When you're ready to migrate, follow this guide step-by-step!**

For questions or issues during migration, check the troubleshooting section or Vercel support.
