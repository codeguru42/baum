# GitHub Secrets Quick Reference

This file contains a quick reference for setting up GitHub secrets required for automated deployment.

## Deployment Method

This repository is configured for **DigitalOcean App Platform** deployment.

- For **App Platform** setup: See [DIGITALOCEAN_APP_PLATFORM.md](DIGITALOCEAN_APP_PLATFORM.md)
- For **Droplet** setup: See [DIGITALOCEAN_SETUP.md](DIGITALOCEAN_SETUP.md)

## Where to Add Secrets

**GitHub Repository → Settings → Secrets and variables → Actions → New repository secret**

## Required Secrets for App Platform Deployment

### DigitalOcean Access

```
DIGITALOCEAN_ACCESS_TOKEN
Description: API token for DigitalOcean App Platform deployments
How to get: DigitalOcean Console → API → Tokens/Keys → Generate New Token
Permissions: Read and Write
Example: dop_v1_abc123def456...
Security: This token has full access to your DigitalOcean account - keep it secure!
```

### Optional Build-Time Secrets

```
REACT_APP_API_URL
Description: API URL for the React frontend (optional, can be set in App Platform)
Example: https://baum-tournament-xxxxx.ondigitalocean.app/api
Note: If not set, will use the default from .env.example
```

## App Platform Environment Variables

These are configured in **DigitalOcean App Platform** (not GitHub):

```
DJANGO_SECRET_KEY
Description: Secret key for Django application security
How to generate: openssl rand -base64 32
Example: vH8fK2pL9mN4qR7sT1uW6xY0zA3bC5dE8fG1hJ4kL7mN9pQ2rS5tU8vW0xY3zA6b
Security: NEVER commit this to git or share publicly
Where to set: DigitalOcean Console → Your App → Settings → App-Level Environment Variables
```

```
DJANGO_ALLOWED_HOSTS
Description: Comma-separated list of hosts/domains allowed to serve the app
Example: baum-tournament-xxxxx.ondigitalocean.app,tournament.yourdomain.com
Where to set: DigitalOcean Console → Your App → Settings → App-Level Environment Variables
```

## Setup Checklist for App Platform

- [ ] Create DigitalOcean account
- [ ] Generate DigitalOcean access token (read + write permissions)
- [ ] Add `DIGITALOCEAN_ACCESS_TOKEN` to GitHub repository secrets
- [ ] Make GitHub Container Registry packages public (or configure private auth)
- [ ] Push to main branch to trigger first deployment
- [ ] After first deployment, configure environment variables in App Platform:
  - [ ] `DJANGO_SECRET_KEY`
  - [ ] `DJANGO_ALLOWED_HOSTS`
- [ ] Optional: Set up custom domain in App Platform
- [ ] Optional: Configure database backups or switch to PostgreSQL

## Alternative: Droplet Deployment Secrets

If you prefer to deploy to a DigitalOcean Droplet instead of App Platform, you'll need these secrets:

### Server Access

```
SSH_PRIVATE_KEY
Description: SSH private key for accessing your DigitalOcean droplet
How to get: cat ~/.ssh/id_rsa (or generate new key with ssh-keygen)
Example: -----BEGIN OPENSSH PRIVATE KEY-----
         b3BlbnNzaC1rZXktdjEAAAAABG5vbmUAAAAEbm9uZQAAAAAAAAABAAABlwAAAAdzc2gtcn...
         -----END OPENSSH PRIVATE KEY-----
```

```
SERVER_IP
Description: IP address of your DigitalOcean droplet
How to get: From DigitalOcean dashboard
Example: 164.92.123.45
```

```
SERVER_USER
Description: SSH username on your server
Common values: root, ubuntu, or your custom user
Example: root
```

```
DEPLOY_PATH
Description: Directory path where app will be deployed on server
Recommended: /root/baum-vibe or /home/ubuntu/baum-vibe
Example: /root/baum-vibe
```

### Application Configuration

```
DJANGO_SECRET_KEY
Description: Secret key for Django application security
How to generate: openssl rand -base64 32
Example: vH8fK2pL9mN4qR7sT1uW6xY0zA3bC5dE8fG1hJ4kL7mN9pQ2rS5tU8vW0xY3zA6b
Security: NEVER commit this to git or share publicly
```

```
DJANGO_ALLOWED_HOSTS
Description: Comma-separated list of hosts/domains allowed to serve the app
Example: yourdomain.com,www.yourdomain.com,164.92.123.45
Note: Include your IP and domain names
```

```
REACT_APP_API_URL
Description: Full URL to your API endpoint (used by React frontend)
Example: https://yourdomain.com/api
Note: Use https:// if you have SSL configured
```

```
DATABASE_URL
Description: Database connection string
Default (SQLite): sqlite:///db/db.sqlite3
PostgreSQL example: postgresql://user:password@localhost:5432/tournament_db
Note: Start with SQLite, switch to PostgreSQL later if needed
```

```
PRODUCTION_URL
Description: Full URL of your production application (for health checks)
Example: https://yourdomain.com
Note: Use http:// if you haven't set up SSL yet
```

## Setup Checklist

- [ ] Create DigitalOcean droplet (Ubuntu 22.04, 2GB RAM minimum)
- [ ] Install Docker and Docker Compose on droplet
- [ ] Generate SSH key or use existing one
- [ ] Add SSH public key to droplet's authorized_keys
- [ ] Generate Django secret key with `openssl rand -base64 32`
- [ ] Add all 9 secrets to GitHub repository
- [ ] Point domain to droplet IP (optional)
- [ ] Test SSH connection: `ssh root@YOUR_SERVER_IP`
- [ ] Push to main branch to trigger first deployment
- [ ] Monitor deployment in GitHub Actions
- [ ] Access application at your production URL
- [ ] Set up SSL with Let's Encrypt (optional)

## Verification Commands

### Test SSH Connection
```bash
ssh root@YOUR_SERVER_IP
# Should connect without password prompt
```

### Test Secrets are Set
```bash
# On your local machine
git push origin main
# Go to GitHub Actions and watch the deployment
```

### Test Application After Deployment
```bash
# Replace with your actual URL
curl https://yourdomain.com/api/players/
# Should return: []
```

## Security Best Practices

1. **Never commit secrets to git**
   - Always use GitHub Secrets for sensitive data
   - Add .env to .gitignore (already done)

2. **Rotate secrets regularly**
   - Change DJANGO_SECRET_KEY every 90 days
   - Rotate SSH keys periodically

3. **Use strong secret keys**
   - Minimum 32 characters for DJANGO_SECRET_KEY
   - Use cryptographically secure random generation

4. **Limit SSH access**
   - Use SSH keys, never passwords
   - Consider using a deploy-specific SSH key
   - Add key to authorized_keys, don't use root password

5. **Monitor access logs**
   ```bash
   # View SSH login attempts
   sudo tail -f /var/log/auth.log
   ```

## Updating Secrets

If you need to change a secret:

1. **Go to GitHub Repository → Settings → Secrets and variables → Actions**
2. **Click on the secret name**
3. **Click "Update secret"**
4. **Enter new value**
5. **Re-run deployment** (or wait for next push)

## Common Issues

### "Permission denied (publickey)"
- **Problem**: SSH_PRIVATE_KEY is incorrect or not added to server
- **Solution**: 
  ```bash
  # On your local machine
  cat ~/.ssh/id_rsa
  # Copy this to SSH_PRIVATE_KEY secret
  
  # On your server
  echo "YOUR_PUBLIC_KEY" >> ~/.ssh/authorized_keys
  chmod 600 ~/.ssh/authorized_keys
  ```

### "DisallowedHost" error
- **Problem**: DJANGO_ALLOWED_HOSTS doesn't include your domain/IP
- **Solution**: Add your domain and IP to DJANGO_ALLOWED_HOSTS
  ```
  yourdomain.com,www.yourdomain.com,YOUR_SERVER_IP
  ```

### "Bad Request" or CORS errors
- **Problem**: REACT_APP_API_URL is incorrect
- **Solution**: Ensure REACT_APP_API_URL matches your actual API URL
  ```
  https://yourdomain.com/api  (with SSL)
  http://YOUR_SERVER_IP/api   (without SSL)
  ```

### Health check fails
- **Problem**: PRODUCTION_URL is incorrect or app not responding
- **Solution**: 
  - Check PRODUCTION_URL matches your actual URL
  - SSH into server and check logs:
    ```bash
    ssh root@YOUR_SERVER_IP
    cd ~/baum-vibe
    docker compose -f docker-compose.prod.yml logs
    ```

## Environment-Specific Secrets

If you want separate staging and production environments:

### Staging Secrets (use these for staging environment)
- `STAGING_SERVER_IP`
- `STAGING_DEPLOY_PATH`
- `STAGING_DJANGO_ALLOWED_HOSTS`
- `STAGING_PRODUCTION_URL`
- etc.

### Production Secrets (use these for production environment)
- All the secrets listed above

Then update the workflow to use the appropriate secrets based on the branch or environment.

## Help and Support

For detailed setup instructions, see:
- [DIGITALOCEAN_SETUP.md](DIGITALOCEAN_SETUP.md) - Complete deployment guide
- [.github/workflows/README.md](.github/workflows/README.md) - Workflow documentation
- [DEPLOYMENT.md](DEPLOYMENT.md) - General deployment guide

For DigitalOcean-specific help:
- [DigitalOcean Documentation](https://docs.digitalocean.com/)
- [Docker on DigitalOcean](https://docs.digitalocean.com/products/droplets/how-to/install-docker/)
