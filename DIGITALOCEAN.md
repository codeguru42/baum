# DigitalOcean App Platform Configuration

This guide shows you what to configure in DigitalOcean to deploy this application.

## What You Need to Configure

### 1. Create DigitalOcean Access Token

This is required for GitHub Actions to deploy to DigitalOcean.

**Steps:**
1. Log in to [DigitalOcean](https://cloud.digitalocean.com/)
2. Go to **API** → **Tokens/Keys**
3. Click **Generate New Token**
4. Name: `GitHub Actions Deploy`
5. Permissions:
   - **Option 1 (Full Access)**: Check both **Read** and **Write** scopes
   - **Option 2 (Custom Scopes - More Secure)**: Select "Custom Scopes" and enable:
     - `app:read` - Read access to App Platform
     - `app:write` - Write access to App Platform (for deployments)
     - `app:delete` - Delete access (optional, for cleaning up failed deployments)
6. Click **Generate Token**
7. **Copy the token** (you won't see it again!)

**Add to GitHub:**
1. Go to your GitHub repository
2. **Settings** → **Secrets and variables** → **Actions**
3. Click **New repository secret**
4. Name: `DIGITALOCEAN_ACCESS_TOKEN`
5. Value: Paste the token from above
6. Click **Add secret**

### 2. Configure GitHub Container Registry Authentication

DigitalOcean App Platform needs credentials to pull Docker images from GitHub Container Registry.

**Steps:**

1. **Create a GitHub Personal Access Token:**
   - Go to GitHub Settings → Developer settings → Personal access tokens → Tokens (classic)
   - Click **Generate new token**
   - Name: `DigitalOcean GHCR Access`
   - Select scopes: Check `read:packages`
   - Click **Generate token**
   - **Copy the token** (you won't see it again!)

2. **Add credentials to App Platform:**
   - Go to [DigitalOcean Apps](https://cloud.digitalocean.com/apps)
   - After first deployment, click on your app: `baum-tournament`
   - Go to **Settings** → **App-Level Environment Variables**
   - Add these two variables (both as **ENCRYPTED** type):
     - Name: `GITHUB_USERNAME` | Value: Your GitHub username
     - Name: `GITHUB_TOKEN` | Value: Your GitHub PAT from step 1
   - Click **Save**

3. **Configure in App Platform UI:**
   - The `.do/app.yaml` file is already configured for GHCR
   - App Platform will use the `GITHUB_USERNAME` and `GITHUB_TOKEN` environment variables to authenticate

### 3. Configure App Environment Variables (After First Deploy)

After the first deployment creates your app, you need to set environment secrets.

**Steps:**
1. Go to [DigitalOcean Apps](https://cloud.digitalocean.com/apps)
2. Click on your app: `baum-tournament`
3. Go to **Settings** → **App-Level Environment Variables**
4. Add these variables as **ENCRYPTED** type:

| Variable | Value | How to Generate |
|----------|-------|-----------------|
| `DJANGO_SECRET_KEY` | Random secret key | Run: `openssl rand -base64 32` |
| `DJANGO_ALLOWED_HOSTS` | Your app's domain | Copy from app's live URL (e.g., `baum-tournament-xxxxx.ondigitalocean.app`) |

5. Click **Save**
6. The app will automatically redeploy

## How to Deploy

Once configured, deployment is automatic:

1. Push code to the `main` branch
2. GitHub Actions builds Docker images
3. GitHub Actions runs tests
4. GitHub Actions deploys to DigitalOcean App Platform
5. Your app is live at the provided URL

## What DigitalOcean Provides Automatically

You don't need to configure these - App Platform handles them:

- SSL/HTTPS certificates
- Domain name (`.ondigitalocean.app`)
- Load balancing
- Health checks
- Zero-downtime deployments
- Monitoring and logs

## Cost

Estimated: **~$10/month**
- Backend container: $5/month (Basic XXS)
- Web/Nginx container: $5/month (Basic XXS)

## Custom Domain (Optional)

To use your own domain:

1. In App Platform, go to **Settings** → **Domains**
2. Click **Add Domain**
3. Enter your domain (e.g., `tournament.yourdomain.com`)
4. Add CNAME record to your DNS provider:
   ```
   Type: CNAME
   Name: tournament
   Value: your-app.ondigitalocean.app
   ```
5. Update `DJANGO_ALLOWED_HOSTS` environment variable to include your domain

## Troubleshooting

**Deployment fails with "cannot pull image"**
- Verify `GITHUB_USERNAME` and `GITHUB_TOKEN` are set correctly in App Platform
- Ensure GitHub Personal Access Token has `read:packages` scope
- Check that images are being built and pushed to GHCR by GitHub Actions

**App shows 500 error after deployment**
- Configure environment variables in App Platform (Step 3)
- Check that `DJANGO_SECRET_KEY` and `DJANGO_ALLOWED_HOSTS` are set

**"Invalid token" error**
- Regenerate DigitalOcean access token and update GitHub secret

## More Information

- App Platform Documentation: https://docs.digitalocean.com/products/app-platform/
