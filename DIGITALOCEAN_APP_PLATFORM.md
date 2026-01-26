# DigitalOcean App Platform Deployment Guide

This guide explains how to deploy the Go Tournament Manager application to DigitalOcean App Platform using the automated GitHub Actions workflow.

## Overview

The deployment uses:
- **DigitalOcean App Platform**: Managed container hosting service
- **GitHub Container Registry (GHCR)**: Stores Docker images
- **GitHub Actions**: Automates building and deployment

## What is DigitalOcean App Platform?

DigitalOcean App Platform is a Platform-as-a-Service (PaaS) that automatically builds and deploys your application from Docker images. It provides:

✓ Automatic scaling  
✓ SSL certificates  
✓ Zero-downtime deployments  
✓ Built-in monitoring  
✓ Managed infrastructure  

**Cost**: Starting at ~$5-10/month for basic apps

## Prerequisites

1. **GitHub Repository**: This repository with the code
2. **DigitalOcean Account**: [Sign up here](https://www.digitalocean.com/)
3. **DigitalOcean Access Token**: For API access
4. **GitHub Container Registry**: Images will be pushed automatically

## Step-by-Step Setup

### Step 1: Create DigitalOcean Access Token

1. Log in to [DigitalOcean](https://cloud.digitalocean.com/)
2. Go to **API** → **Tokens/Keys**
3. Click **Generate New Token**
4. Name it: `GitHub Actions Deploy`
5. Check both **Read** and **Write** scopes
6. Click **Generate Token**
7. **Copy the token immediately** (you won't see it again!)

### Step 2: Configure GitHub Secrets

Add the following secret to your GitHub repository:

**Settings → Secrets and variables → Actions → New repository secret**

#### Required Secret

| Secret Name | Description | How to Get |
|------------|-------------|------------|
| `DIGITALOCEAN_ACCESS_TOKEN` | API token for DigitalOcean | From Step 1 above |

#### App Platform Environment Secrets

These secrets will be configured in DigitalOcean App Platform (NOT in GitHub):

| Secret Name | Description | How to Generate |
|------------|-------------|-----------------|
| `DJANGO_SECRET_KEY` | Django secret key | Run: `openssl rand -base64 32` |
| `DJANGO_ALLOWED_HOSTS` | Allowed hosts for Django | Your app domain (e.g., `baum-tournament.ondigitalocean.app`) |

### Step 3: Configure App Platform Secrets

After the first deployment creates your app, you need to configure environment secrets:

1. Go to [DigitalOcean Apps](https://cloud.digitalocean.com/apps)
2. Click on your app (`baum-tournament`)
3. Go to **Settings** → **App-Level Environment Variables**
4. Add the following as **ENCRYPTED** variables:
   - `DJANGO_SECRET_KEY` = `[your-generated-secret-key]`
   - `DJANGO_ALLOWED_HOSTS` = `[your-app-domain]`

5. Click **Save**
6. The app will automatically redeploy with the new secrets

### Step 4: Enable GitHub Container Registry

The workflow automatically builds and pushes images to GitHub Container Registry. No configuration needed - just ensure your repository has the workflow files.

The images will be available at:
- `ghcr.io/[your-username]/baum/backend:latest`
- `ghcr.io/[your-username]/baum/frontend:latest`
- `ghcr.io/[your-username]/baum/nginx:latest`

### Step 5: Make Images Public (Important!)

For DigitalOcean App Platform to pull images from GHCR without authentication:

1. Go to your GitHub repository
2. Click **Packages** (on the right sidebar)
3. For each package (backend, frontend, nginx):
   - Click on the package
   - Go to **Package settings**
   - Scroll down to **Danger Zone**
   - Click **Change visibility**
   - Select **Public**
   - Confirm the change

**Alternatively**, you can configure DigitalOcean to authenticate with GHCR (see Advanced section).

### Step 6: First Deployment

The first deployment will create the App Platform app:

1. **Push to main branch**:
   ```bash
   git push origin main
   ```

2. **Or manually trigger**:
   - Go to GitHub → **Actions**
   - Select **Build and Push Docker Images** workflow
   - Click **Run workflow**
   - Wait for images to build
   - The **Deploy to DigitalOcean** workflow will automatically trigger

3. **Monitor deployment**:
   - Go to **Actions** tab in GitHub
   - Click on the running **Deploy to DigitalOcean** workflow
   - Watch the deployment progress

4. **Check DigitalOcean**:
   - Go to [DigitalOcean Apps](https://cloud.digitalocean.com/apps)
   - You should see your new app: `baum-tournament`
   - Wait for it to finish building and deploying

### Step 7: Access Your Application

Once deployment completes:

1. Go to [DigitalOcean Apps](https://cloud.digitalocean.com/apps)
2. Click on `baum-tournament`
3. You'll see the **Live App** URL (something like `https://baum-tournament-xxxxx.ondigitalocean.app`)
4. Click the URL to access your application

## What Gets Deployed

The deployment includes:

1. **Backend Service** (Django API)
   - Runs on port 8000
   - Handles `/api` routes
   - SQLite database (stored in app's writable volumes)
   - Health checks at `/api/players/`

2. **Web Service** (Nginx)
   - Runs on port 80
   - Main entry point for all traffic
   - Proxies `/api` requests to backend
   - Serves frontend static files

## Deployment Workflow

The automated workflow:

1. **Build Images** workflow (triggered on push to main):
   - Builds backend, frontend, and nginx Docker images
   - Pushes images to GitHub Container Registry
   - Tags images with `latest` and commit SHA

2. **CI** workflow (triggered after images are built):
   - Runs backend tests
   - Runs frontend tests  
   - Validates production Docker stack

3. **Deploy** workflow (triggered after CI passes):
   - Updates `.do/app.yaml` with repository info
   - Deploys to DigitalOcean App Platform
   - App Platform pulls images from GHCR
   - App Platform builds and deploys the app
   - Deployment notification in GitHub Actions

## Monitoring Your App

### View Logs

1. Go to [DigitalOcean Apps](https://cloud.digitalocean.com/apps)
2. Click on `baum-tournament`
3. Go to **Runtime Logs** tab
4. Select the component (backend or web)
5. View real-time logs

### View Deployments

1. Go to your app in DigitalOcean
2. Click **Deployments** tab
3. See all deployment history
4. Rollback to previous deployments if needed

### App Metrics

1. Go to your app in DigitalOcean
2. Click **Insights** tab
3. View:
   - CPU usage
   - Memory usage
   - Request counts
   - Response times

## Cost Estimation

### DigitalOcean App Platform Pricing

| Component | Instance Size | vCPU | RAM | Price/Month |
|-----------|---------------|------|-----|-------------|
| Backend | Basic (XXS) | 1 | 512 MB | $5 |
| Web | Basic (XXS) | 1 | 512 MB | $5 |
| **Total** | | | | **~$10/month** |

**Note**: Prices may vary. Check [DigitalOcean Pricing](https://www.digitalocean.com/pricing/app-platform) for current rates.

### Cost Optimization

- Start with XXS instances (512MB RAM)
- Upgrade if you experience performance issues
- App Platform automatically handles scaling during traffic spikes
- No additional costs for SSL, load balancing, or deployments

## Custom Domain (Optional)

To use your own domain instead of the `.ondigitalocean.app` subdomain:

1. Go to your app in DigitalOcean
2. Click **Settings** → **Domains**
3. Click **Add Domain**
4. Enter your domain (e.g., `tournament.yourdomain.com`)
5. Follow the instructions to add DNS records
6. Wait for DNS propagation (can take up to 48 hours)
7. DigitalOcean will automatically provision an SSL certificate

### DNS Configuration

Add these records to your DNS provider:

```
Type: CNAME
Name: tournament (or your subdomain)
Value: [your-app].ondigitalocean.app
TTL: 3600
```

### Update App Secrets

After adding a custom domain, update the environment variable:

1. Go to **Settings** → **App-Level Environment Variables**
2. Update `DJANGO_ALLOWED_HOSTS` to include your domain:
   ```
   tournament.yourdomain.com,baum-tournament-xxxxx.ondigitalocean.app
   ```
3. Save and redeploy

## Troubleshooting

### Deployment Fails: "Permission denied"

**Problem**: DigitalOcean cannot pull images from GHCR

**Solution**: Make sure your GHCR packages are public (see Step 5)

### Deployment Fails: "Token is invalid"

**Problem**: `DIGITALOCEAN_ACCESS_TOKEN` is incorrect or expired

**Solution**:
1. Generate a new token in DigitalOcean
2. Update the GitHub secret
3. Re-run the deployment workflow

### App Shows 500 Error

**Problem**: Missing or invalid environment secrets

**Solution**:
1. Check App Platform environment variables
2. Ensure `DJANGO_SECRET_KEY` is set
3. Ensure `DJANGO_ALLOWED_HOSTS` includes your app domain
4. Check runtime logs for specific errors

### Health Check Fails

**Problem**: Backend not responding at `/api/players/`

**Solution**:
1. Check runtime logs for backend component
2. Verify database migrations ran successfully
3. Check that `DJANGO_SETTINGS_MODULE=tournament_app.settings`
4. Increase health check timeout in `.do/app.yaml`

### Database Errors

**Problem**: SQLite database issues

**Solution**:
- App Platform provides persistent storage for SQLite
- Database is stored in the container's `/app/db` directory
- For production, consider upgrading to PostgreSQL (see Advanced section)

## Database Backups

DigitalOcean App Platform doesn't automatically backup SQLite databases.

### Manual Backup

You can download the database through the app's console:

1. Go to your app in DigitalOcean
2. Click on **Console** tab
3. Select the backend component
4. Click **Launch Console**
5. Run: `tar -czf /tmp/backup.tar.gz /app/db/`
6. Download the backup file

**Recommendation**: For production, use DigitalOcean Managed Database (PostgreSQL).

## Advanced Configuration

### Using Private GitHub Container Registry

If you prefer to keep your images private:

1. Create a GitHub Personal Access Token (PAT):
   - Settings → Developer settings → Personal access tokens → Tokens (classic)
   - Generate new token with `read:packages` scope
   - Copy the token

2. Add to `.do/app.yaml` under each service's image section:
   ```yaml
   image:
     registry_type: GHCR
     registry: ghcr.io
     repository: your-username/baum/backend
     tag: latest
     registry_credentials: GITHUB_REGISTRY_CREDENTIALS  # Add this
   ```

3. Add secret in App Platform:
   - Settings → App-Level Environment Variables
   - Add `GITHUB_REGISTRY_CREDENTIALS`:
     ```
     username: your-github-username
     password: your-github-pat
     ```

### Using PostgreSQL Database

To use DigitalOcean Managed PostgreSQL instead of SQLite:

1. Create a PostgreSQL database in DigitalOcean
2. In `.do/app.yaml`, add a database:
   ```yaml
   databases:
     - name: db
       engine: PG
       version: "14"
   ```
3. Update backend environment variables:
   ```yaml
   envs:
     - key: DATABASE_URL
       value: ${db.DATABASE_URL}
   ```
4. The connection string will be automatically injected

### Scaling Your App

To handle more traffic:

1. Go to your app in DigitalOcean  
2. Click on a component (backend or web)
3. Click **Edit**
4. Increase **Instance Size** (e.g., from XXS to XS or S)
5. Increase **Instance Count** for horizontal scaling
6. Save changes

## Comparison: App Platform vs Droplet

| Feature | App Platform | Droplet (VM) |
|---------|-------------|--------------|
| **Setup Time** | 5-10 minutes | 30-60 minutes |
| **Maintenance** | Fully managed | Self-managed |
| **Scaling** | Automatic | Manual |
| **SSL/HTTPS** | Automatic | Manual setup |
| **Cost** | ~$10/month | ~$6-12/month |
| **Zero-downtime deploys** | Yes | Manual setup |
| **Recommended for** | Quick deployment, production apps | Full control, custom setup |

## Getting Help

### GitHub Actions Logs

1. Go to **Actions** tab in GitHub
2. Click on the failed workflow
3. Expand each step to see detailed logs
4. Look for error messages

### DigitalOcean Support

- [App Platform Documentation](https://docs.digitalocean.com/products/app-platform/)
- [Community Q&A](https://www.digitalocean.com/community/questions)
- [Support Tickets](https://cloud.digitalocean.com/support/tickets) (for paid accounts)

### Common Resources

- Check runtime logs in DigitalOcean for app errors
- Check GitHub Actions logs for deployment errors
- Verify all environment secrets are configured correctly
- Ensure GHCR packages are public or credentials are configured

## Next Steps

1. ✓ Set up DigitalOcean account
2. ✓ Generate access token
3. ✓ Add `DIGITALOCEAN_ACCESS_TOKEN` to GitHub secrets
4. ✓ Make GHCR packages public (or configure auth)
5. ✓ Push to main branch to trigger deployment
6. ✓ Configure app environment secrets after first deploy
7. ✓ Set up custom domain (optional)
8. ✓ Configure database backups or switch to PostgreSQL

## Conclusion

You should now have:

- Automated deployments from GitHub to DigitalOcean
- A live application accessible via HTTPS
- Monitoring and logging capabilities
- Understanding of how to manage and scale your app

For the traditional Droplet deployment approach, see [DIGITALOCEAN_SETUP.md](DIGITALOCEAN_SETUP.md).
