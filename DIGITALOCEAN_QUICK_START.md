# DigitalOcean Configuration Quick Start

**Question**: What do I need to configure in DigitalOcean?

## Short Answer

To deploy this application to DigitalOcean App Platform, you need to:

1. **Generate an Access Token** in DigitalOcean
2. **Add the token** to GitHub Secrets
3. **Make your GitHub Container Registry packages public** (or configure authentication)
4. **Push to main branch** to trigger automatic deployment
5. **Configure environment secrets** in App Platform after first deployment

## Detailed Steps

### 1. Create DigitalOcean Access Token

1. Log in to [DigitalOcean](https://cloud.digitalocean.com/)
2. Go to **API** → **Tokens/Keys**
3. Click **Generate New Token**
4. Name: `GitHub Actions Deploy`
5. Permissions: ✓ **Read** and ✓ **Write**
6. Click **Generate Token**
7. **Copy the token** (you won't see it again!)

### 2. Add Token to GitHub

1. Go to your GitHub repository
2. **Settings** → **Secrets and variables** → **Actions**
3. Click **New repository secret**
4. Name: `DIGITALOCEAN_ACCESS_TOKEN`
5. Value: [paste the token from step 1]
6. Click **Add secret**

### 3. Make Docker Images Public

Since the deployment uses images from GitHub Container Registry:

1. Go to your repository on GitHub
2. Click **Packages** (right sidebar)
3. For each package (`backend`, `frontend`, `nginx`):
   - Click the package name
   - **Package settings** (top right)
   - Scroll to **Danger Zone**
   - **Change visibility** → **Public**
   - Confirm

### 4. Deploy

Push to main branch:
```bash
git push origin main
```

This triggers:
1. **Build and Push Docker Images** workflow → Builds images
2. **CI** workflow → Runs tests  
3. **Deploy to DigitalOcean** workflow → Deploys to App Platform

### 5. Configure App Platform Environment Variables

After the first deployment creates your app:

1. Go to [DigitalOcean Apps](https://cloud.digitalocean.com/apps)
2. Click on your app: `baum-tournament`
3. **Settings** → **App-Level Environment Variables**
4. Add these as **ENCRYPTED** variables:

   | Variable | Value | How to Generate |
   |----------|-------|-----------------|
   | `DJANGO_SECRET_KEY` | [random key] | Run: `openssl rand -base64 32` |
   | `DJANGO_ALLOWED_HOSTS` | [your app domain] | Copy from app URL (e.g., `baum-tournament-xxxxx.ondigitalocean.app`) |

5. Click **Save**
6. App will automatically redeploy

## What DigitalOcean App Platform Provides

You don't need to configure these - they're automatic:

✓ **SSL/HTTPS** - Automatic SSL certificates  
✓ **Domain** - Automatic `.ondigitalocean.app` subdomain  
✓ **Scaling** - Automatic container scaling  
✓ **Monitoring** - Built-in logs and metrics  
✓ **Zero-downtime deploys** - Rolling updates  
✓ **Health checks** - Configured in `.do/app.yaml`  

## Cost

- **Estimated**: ~$10/month for this application
- **Instance sizes**: 2 × Basic (XXS) containers
- **Includes**: SSL, monitoring, bandwidth, deployments

## Optional: Custom Domain

To use your own domain:

1. In App Platform → **Settings** → **Domains**
2. Click **Add Domain**
3. Enter: `tournament.yourdomain.com`
4. Add CNAME record to your DNS:
   ```
   Type: CNAME
   Name: tournament
   Value: baum-tournament-xxxxx.ondigitalocean.app
   ```
5. Update `DJANGO_ALLOWED_HOSTS` to include your domain

## Troubleshooting

### Can't pull images from GitHub

**Fix**: Make sure GHCR packages are public (see step 3)

### 500 Error on deployed app

**Fix**: Check environment variables are configured (step 5)

### Deployment fails

**Fix**: Check GitHub Actions logs → Actions tab → View failed workflow

## Full Documentation

- **App Platform Setup**: See [DIGITALOCEAN_APP_PLATFORM.md](DIGITALOCEAN_APP_PLATFORM.md)
- **GitHub Secrets**: See [GITHUB_SECRETS.md](GITHUB_SECRETS.md)
- **Alternative Droplet Setup**: See [DIGITALOCEAN_SETUP.md](DIGITALOCEAN_SETUP.md)

## Summary

**Minimum required in DigitalOcean**:
1. Access token (added to GitHub)
2. Environment variables after first deploy (in App Platform)

**Everything else is automatic** through GitHub Actions and App Platform!
