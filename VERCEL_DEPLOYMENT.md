# Vercel Deployment Quick Start Guide

This guide walks you through deploying baum-vibe to Vercel.

## Prerequisites

- ✅ Vercel CLI installed and authenticated (`vercel --version` shows >= 48.1.8)
- ✅ Configuration files created (vercel.json, .vercelignore for both backend and frontend)
- ✅ Git repository up to date

## Project Setup

- **Backend Project Name:** `baum-backend` (already linked)
- **Frontend Project Name:** `baum-frontend` (to be created)
- **Database:** SQLite (ephemeral) - migrate to PostgreSQL later using `POSTGRES_MIGRATION.md`

---

## Step-by-Step Deployment

### Step 1: Deploy Backend

```bash
cd backend

# Verify project link
cat .vercel/project.json

# Deploy to preview first (test)
vercel

# 📝 Save the preview URL and test it:
# curl https://your-preview-url.vercel.app/
# curl https://your-preview-url.vercel.app/api/players/

# If preview works, deploy to production
vercel --prod

# 📝 SAVE THIS URL: https://baum-backend.vercel.app
```

### Step 2: Configure Backend Environment Variables

```bash
cd backend

# Set CORS origins (we'll update after frontend deployment)
vercel env add CORS_ORIGINS production
# Enter: http://localhost:3000

vercel env add CORS_ORIGINS preview
# Enter: https://*.vercel.app

# Set DEBUG flag
vercel env add DEBUG production
# Enter: False

vercel env add DEBUG preview
# Enter: True
```

### Step 3: Deploy Frontend

```bash
cd ../frontend

# Link to new Vercel project
vercel link
# Select: Create new project
# Project name: baum-frontend

# Add backend API URL
vercel env add VITE_API_URL production
# Enter: https://baum-backend.vercel.app/api

vercel env add VITE_API_URL preview
# Enter: https://baum-backend.vercel.app/api

# Deploy to preview
vercel

# Test in browser, then deploy to production
vercel --prod

# 📝 SAVE THIS URL: https://baum-frontend.vercel.app
```

### Step 4: Update Backend CORS

```bash
cd ../backend

# Remove old CORS setting
vercel env rm CORS_ORIGINS production

# Add updated CORS with frontend URL
vercel env add CORS_ORIGINS production
# Enter: https://baum-frontend.vercel.app,https://baum-frontend-git-main.vercel.app

# Redeploy backend
vercel --prod
```

### Step 5: Test End-to-End

**Backend:**
```bash
curl https://baum-backend.vercel.app/
curl https://baum-backend.vercel.app/api/players/
```

**Frontend:**
- Open https://baum-frontend.vercel.app in browser
- Check console for errors
- Test creating/editing players
- Verify API calls succeed

---

## Setting Up Git Integration (After Manual Deployment Works)

### Backend

1. Go to https://vercel.com/dashboard
2. Select `baum-backend` project
3. Settings → Git → Connect Git Repository
4. Select your GitHub repository
5. Configure:
   - **Root Directory:** `backend`
   - **Build Command:** (leave empty - auto-detected)
   - **Install Command:** (leave empty - auto-detected)
   - Production Branch: `main`
6. Enable "Automatically deploy preview branches" ✅

### Frontend

1. Select `baum-frontend` project
2. Settings → Git → Connect Git Repository
3. Select same GitHub repository
4. Configure:
   - **Root Directory:** `frontend`
   - **Build Command:** `npm run build`
   - **Install Command:** `npm install`
   - **Output Directory:** `build`
   - Production Branch: `main`
5. Enable "Automatically deploy preview branches" ✅

**Result:** Every push to `main` triggers automatic deployments for both projects!

---

## Quick Commands Reference

```bash
# Deploy both to production
cd backend && vercel --prod && cd ../frontend && vercel --prod

# View deployments
vercel ls

# View logs
vercel logs https://baum-backend.vercel.app --follow

# Pull environment variables
vercel env pull .env.local

# List environment variables
vercel env ls

# Open project in dashboard
vercel open
```

---

## Important Notes

### SQLite Limitations (Current Setup)

⚠️ **Data resets on cold starts** (~5-10 minutes of inactivity)
- Database is ephemeral (recreated on each serverless function cold start)
- Perfect for demos and testing
- **Not suitable for production with real user data**

**When ready for production:** Follow `POSTGRES_MIGRATION.md` to migrate to PostgreSQL

### Configuration Files Created

- ✅ `backend/vercel.json` - Excludes test files from deployment
- ✅ `backend/.vercelignore` - Prevents uploading dev artifacts
- ✅ `backend/config.py` - Updated for dynamic CORS from env vars
- ✅ `frontend/vercel.json` - Configures Vite build and routing
- ✅ `frontend/.vercelignore` - Excludes test files and artifacts

### Environment Variables

**Backend (baum-backend):**
- `CORS_ORIGINS` - Frontend URL(s), comma-separated
- `DEBUG` - `False` for production, `True` for preview
- `DATABASE_URL` - (Optional, defaults to SQLite)

**Frontend (baum-frontend):**
- `VITE_API_URL` - Backend API URL

---

## Troubleshooting

### "Module not found" error
- Check `pyproject.toml` dependencies
- Ensure `uv.lock` is committed to git

### CORS errors in browser
- Verify `CORS_ORIGINS` includes frontend URL
- Check format: `https://baum-frontend.vercel.app,https://*.vercel.app`
- Redeploy backend after changing env vars

### Build fails with "Bundle size exceeded"
- Check `.vercelignore` excludes test files
- Verify `vercel.json` excludeFiles pattern
- Check bundle size: `du -sh backend --exclude='.venv'`

### API timeout
- Normal for cold starts (first request after inactivity)
- Subsequent requests should be faster
- Consider Vercel Pro for longer timeouts if needed

---

## Next Steps

1. ✅ Deploy manually using steps above
2. ✅ Test thoroughly
3. ✅ Set up Git integration
4. 📅 When ready for production: Migrate to PostgreSQL using `POSTGRES_MIGRATION.md`

**Happy deploying!** 🚀
