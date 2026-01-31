# GitHub Secrets Quick Reference

This file contains a quick reference for setting up GitHub secrets required for automated deployment.

## Deployment Method

This repository is configured for **DigitalOcean App Platform** deployment.

**See [DIGITALOCEAN.md](DIGITALOCEAN.md) for complete App Platform setup instructions.**

## Where to Add Secrets

**GitHub Repository → Settings → Secrets and variables → Actions → New repository secret**

## Required GitHub Secrets

These are configured in **GitHub Repository Settings** for automated deployment:

```
DIGITALOCEAN_ACCESS_TOKEN
Description: API token for DigitalOcean App Platform deployments
How to get: DigitalOcean Console → API → Tokens/Keys → Generate New Token
Permissions: 
  - Full Access: Read and Write
  - Custom Scopes (DigitalOcean API): app:read, app:write, app:delete (optional)
Security: Keep this token secure - it has full access to your DigitalOcean account
Where to set: GitHub Repository → Settings → Secrets and variables → Actions
```

```
DJANGO_SECRET_KEY
Description: Secret key for Django application security
How to generate: openssl rand -base64 32
Where to set: GitHub Repository → Settings → Secrets and variables → Actions
Note: Automatically injected into DigitalOcean on first deployment
```

```
DJANGO_ALLOWED_HOSTS
Description: Comma-separated list of hosts/domains allowed to serve the app
Example: * (for initial setup), then baum-tournament-xxxxx.ondigitalocean.app
Where to set: GitHub Repository → Settings → Secrets and variables → Actions
Note: Set to * initially, then update in DigitalOcean UI after first deploy
```

## Container Registry Access

Docker images are pushed to GitHub Container Registry (GHCR) and pulled by DigitalOcean.

**Recommended approach:** Make GHCR packages public
- Go to GitHub repository → Packages → Click package → Settings → Change visibility → Public
- This eliminates the need for authentication tokens

**Alternative:** If packages must remain private, configure DigitalOcean with GitHub credentials separately.

See [DIGITALOCEAN.md](DIGITALOCEAN.md) for complete setup instructions.
