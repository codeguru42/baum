# GitHub Secrets Quick Reference

This file contains a quick reference for setting up GitHub secrets required for automated deployment.

## Deployment Method

This repository is configured for **DigitalOcean App Platform** deployment.

**See [DIGITALOCEAN.md](DIGITALOCEAN.md) for complete App Platform setup instructions.**

## Where to Add Secrets

**GitHub Repository → Settings → Secrets and variables → Actions → New repository secret**

## Required Secrets for App Platform

```
DIGITALOCEAN_ACCESS_TOKEN
Description: API token for DigitalOcean App Platform deployments
How to get: DigitalOcean Console → API → Tokens/Keys → Generate New Token
Permissions: Read and Write (or custom scopes: app:read, app:write, app:delete)
Security: Keep this token secure - it has full access to your DigitalOcean account
```

## App Platform Environment Variables

These are configured in **DigitalOcean App Platform** (not GitHub):

```
DJANGO_SECRET_KEY
Description: Secret key for Django application security
How to generate: openssl rand -base64 32
Where to set: DigitalOcean Console → Your App → Settings → App-Level Environment Variables
```

```
DJANGO_ALLOWED_HOSTS
Description: Comma-separated list of hosts/domains allowed to serve the app
Example: baum-tournament-xxxxx.ondigitalocean.app,tournament.yourdomain.com
Where to set: DigitalOcean Console → Your App → Settings → App-Level Environment Variables
```

```
GITHUB_USERNAME
Description: Your GitHub username for private registry access
Where to set: DigitalOcean Console → Your App → Settings → App-Level Environment Variables
```

```
GITHUB_TOKEN
Description: GitHub Personal Access Token with read:packages scope
How to generate: GitHub Settings → Developer settings → Personal access tokens
Where to set: DigitalOcean Console → Your App → Settings → App-Level Environment Variables
```

See [DIGITALOCEAN.md](DIGITALOCEAN.md) for complete setup instructions.
