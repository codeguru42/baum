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

### 2. Configure GitHub Secrets

The deploy workflow automatically injects environment variables from GitHub Secrets into DigitalOcean. You need to add these secrets to your GitHub repository:

**Steps:**

1. Go to your GitHub repository
2. **Settings** → **Secrets and variables** → **Actions**
3. Click **New repository secret** and add each of these:

| Secret Name | Value | How to Generate |
|-------------|-------|-----------------|
| `DIGITALOCEAN_ACCESS_TOKEN` | Your DigitalOcean API token | See step 1 above |
| `DJANGO_SECRET_KEY` | Random secret key | Run: `openssl rand -base64 32` |
| `DJANGO_ALLOWED_HOSTS` | Your app's domain | Get from DigitalOcean after first deploy (e.g., `baum-tournament-xxxxx.ondigitalocean.app`) |

**Note:** For `DJANGO_ALLOWED_HOSTS`, you can:
- Initially set it to `*` (wildcard) for the first deploy
- After deployment, update it to your actual DigitalOcean app URL
- The workflow uses `${{ github.actor }}` for `GITHUB_USERNAME` and the built-in `${{ secrets.GITHUB_TOKEN }}` for GHCR access automatically

### 3. Deploy

Once GitHub Secrets are configured, deployment is fully automated:

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
- Check that images are being built and pushed to GHCR by GitHub Actions
- Verify the GHCR images are public or that GITHUB_TOKEN has access
- Check workflow logs for any image build failures

**App shows 500 error after deployment**
- Verify `DJANGO_SECRET_KEY` is set in GitHub Secrets
- Check that `DJANGO_ALLOWED_HOSTS` includes your app's domain
- View logs in DigitalOcean App Platform console

**"Invalid token" error**
- Regenerate DigitalOcean access token and update `DIGITALOCEAN_ACCESS_TOKEN` GitHub secret

**Need to update DJANGO_ALLOWED_HOSTS after first deploy**
1. Get your app URL from DigitalOcean (e.g., `baum-tournament-xxxxx.ondigitalocean.app`)
2. Update the `DJANGO_ALLOWED_HOSTS` secret in GitHub
3. Push a commit to trigger redeployment (or manually trigger the workflow)

## More Information

- App Platform Documentation: https://docs.digitalocean.com/products/app-platform/
