# Answer: What to Configure in DigitalOcean

## Quick Answer

You need to configure **3 things** in DigitalOcean for this deployment to work:

### 1. Generate an Access Token (One-Time Setup)

**Where**: [DigitalOcean Console](https://cloud.digitalocean.com/) → API → Tokens/Keys

**What to do**:
1. Click "Generate New Token"
2. Name: `GitHub Actions Deploy`
3. Permissions: ✓ Read and ✓ Write
4. Copy the token
5. Add to GitHub: Settings → Secrets and variables → Actions → New repository secret
   - Name: `DIGITALOCEAN_ACCESS_TOKEN`
   - Value: [paste token]

### 2. Configure App Environment Variables (After First Deploy)

**Where**: [DigitalOcean Apps](https://cloud.digitalocean.com/apps) → Your App → Settings → App-Level Environment Variables

**What to add**:

| Variable Name | Value | How to Get |
|--------------|-------|------------|
| `DJANGO_SECRET_KEY` | Random secret key | Run: `openssl rand -base64 32` |
| `DJANGO_ALLOWED_HOSTS` | Your app domain | Copy from app URL (e.g., `baum-tournament-xxxxx.ondigitalocean.app`) |

Mark both as **ENCRYPTED** type.

### 3. Make GitHub Container Registry Packages Public

**Where**: GitHub Repository → Packages (right sidebar)

**What to do**:
For each package (backend, frontend, nginx):
1. Click the package name
2. Package settings
3. Scroll to "Danger Zone"
4. Change visibility → Public
5. Confirm

## What You DON'T Need to Configure

DigitalOcean App Platform automatically handles:

✓ SSL/HTTPS certificates  
✓ Domain name (yourapp.ondigitalocean.app)  
✓ Load balancing  
✓ Container orchestration  
✓ Health checks  
✓ Zero-downtime deployments  
✓ Monitoring and logs  

## Deployment Flow

```
1. Push to GitHub main branch
   ↓
2. GitHub Actions builds Docker images
   ↓
3. GitHub Actions runs tests
   ↓
4. GitHub Actions triggers DigitalOcean deployment
   ↓
5. DigitalOcean App Platform pulls images from GHCR
   ↓
6. DigitalOcean deploys your app
   ↓
7. Your app is live! 🚀
```

## Cost

**Estimated**: ~$10/month

- Backend container: $5/month
- Web/Nginx container: $5/month
- Includes: SSL, bandwidth, monitoring, deployments

## Complete Documentation

- **Quick Start**: [DIGITALOCEAN_QUICK_START.md](DIGITALOCEAN_QUICK_START.md)
- **Full App Platform Guide**: [DIGITALOCEAN_APP_PLATFORM.md](DIGITALOCEAN_APP_PLATFORM.md)
- **GitHub Secrets Reference**: [GITHUB_SECRETS.md](GITHUB_SECRETS.md)

## Troubleshooting

**Problem**: Deployment fails with "cannot pull image"  
**Solution**: Make GHCR packages public (step 3 above)

**Problem**: App shows 500 error  
**Solution**: Configure environment variables (step 2 above)

**Problem**: Invalid token error  
**Solution**: Check `DIGITALOCEAN_ACCESS_TOKEN` in GitHub secrets

## Next Steps

1. Complete the 3 configuration steps above
2. Push to main branch: `git push origin main`
3. Watch GitHub Actions for deployment progress
4. Access your app at the provided DigitalOcean URL
5. (Optional) Set up custom domain in App Platform settings

That's it! 🎉
