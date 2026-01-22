# DigitalOcean Deployment Setup Guide

This guide explains how to set up automatic deployment from GitHub to DigitalOcean for the Go Tournament Manager application.

## Overview

The deployment workflow automatically deploys your application to a DigitalOcean droplet whenever you push to the `main` branch. The workflow:

1. ✓ Runs CI tests (must pass before deploying)
2. ✓ Copies code to your server via rsync over SSH
3. ✓ Builds and starts Docker containers on the server
4. ✓ Runs database migrations
5. ✓ Collects static files
6. ✓ Performs health check
7. ✓ Rolls back on failure

## Prerequisites

### 1. DigitalOcean Droplet

Create a droplet with:
- **OS**: Ubuntu 22.04 LTS (recommended)
- **Plan**: Basic ($6-12/month recommended, at least 2GB RAM)
- **Region**: Choose closest to your users
- **SSH Key**: Add your SSH key during creation

### 2. Server Setup

Once your droplet is created, SSH into it and install Docker:

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# Install Docker Compose
sudo apt install docker-compose-plugin -y

# Add your user to docker group (to run docker without sudo)
sudo usermod -aG docker $USER
newgrp docker

# Verify installation
docker --version
docker compose version
```

### 3. Create Deployment Directory

```bash
mkdir -p ~/baum-vibe
```

### 4. Configure Firewall

```bash
# Allow SSH, HTTP, and HTTPS
sudo ufw allow OpenSSH
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw enable
```

## GitHub Secrets Configuration

Add these secrets to your GitHub repository:

**Settings → Secrets and variables → Actions → New repository secret**

### Required Secrets

| Secret Name | Description | Example |
|------------|-------------|---------|
| `SSH_PRIVATE_KEY` | SSH private key for server access | Contents of `~/.ssh/id_rsa` |
| `SERVER_IP` | Your droplet's IP address | `164.92.xxx.xxx` |
| `SERVER_USER` | SSH username on server | `root` or `ubuntu` |
| `DEPLOY_PATH` | Path on server to deploy to | `/root/baum-vibe` |
| `DJANGO_SECRET_KEY` | Django secret key | Generate with `openssl rand -base64 32` |
| `DJANGO_ALLOWED_HOSTS` | Allowed hosts for Django | `yourdomain.com,www.yourdomain.com` |
| `REACT_APP_API_URL` | API URL for frontend | `https://yourdomain.com/api` |
| `DATABASE_URL` | Database connection string | `sqlite:///db/db.sqlite3` |
| `PRODUCTION_URL` | Your application URL | `https://yourdomain.com` |

### How to Get SSH Private Key

**Option 1: Use existing key**
```bash
cat ~/.ssh/id_rsa
```

**Option 2: Create new deployment key**
```bash
ssh-keygen -t ed25519 -C "github-actions-deploy" -f ~/.ssh/github_deploy
cat ~/.ssh/github_deploy  # This goes in GitHub secret
cat ~/.ssh/github_deploy.pub  # Add this to server's ~/.ssh/authorized_keys
```

Then add the public key to your server:
```bash
ssh root@YOUR_SERVER_IP
echo "YOUR_PUBLIC_KEY" >> ~/.ssh/authorized_keys
chmod 600 ~/.ssh/authorized_keys
```

### How to Generate Django Secret Key

```bash
openssl rand -base64 32
```

## Domain Setup (Optional but Recommended)

### 1. Point Domain to Droplet

In your domain registrar (Namecheap, GoDaddy, etc.):
- Add an A record pointing to your droplet's IP
- Add a CNAME record for `www` pointing to your domain

### 2. Set Up SSL with Let's Encrypt

SSH into your server:

```bash
# Install Certbot
sudo apt install certbot python3-certbot-nginx -y

# Stop your app temporarily
cd ~/baum-vibe
docker compose -f docker-compose.prod.yml down

# Get certificate
sudo certbot certonly --standalone -d yourdomain.com -d www.yourdomain.com

# Start your app
docker compose -f docker-compose.prod.yml up -d

# Set up auto-renewal
sudo crontab -e
# Add this line:
0 0 * * * certbot renew --quiet && docker compose -f /root/baum-vibe/docker-compose.prod.yml restart nginx
```

### 3. Update nginx Configuration

Create `nginx/conf.d/ssl.conf` in your repository:

```nginx
server {
    listen 443 ssl http2;
    server_name yourdomain.com www.yourdomain.com;

    ssl_certificate /etc/letsencrypt/live/yourdomain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/yourdomain.com/privkey.pem;
    
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;

    # Rest of your nginx configuration...
}

server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;
    return 301 https://$server_name$request_uri;
}
```

Update `docker-compose.prod.yml` to mount SSL certificates:

```yaml
nginx:
  volumes:
    - ./nginx/nginx.conf:/etc/nginx/nginx.conf:ro
    - ./nginx/conf.d:/etc/nginx/conf.d:ro
    - /etc/letsencrypt:/etc/letsencrypt:ro  # Add this line
```

## Testing the Deployment

### 1. Manual Deployment Test

Test deployment manually before setting up automation:

```bash
# On your local machine
git clone <your-repo-url>
cd baum-vibe

# Create .env file
cat > .env << EOF
DJANGO_SECRET_KEY=your-secret-key
DJANGO_ALLOWED_HOSTS=your-domain.com
REACT_APP_API_URL=https://your-domain.com/api
DATABASE_URL=sqlite:///db/db.sqlite3
EOF

# Deploy to server
scp -r . root@YOUR_SERVER_IP:~/baum-vibe/
ssh root@YOUR_SERVER_IP
cd ~/baum-vibe
docker compose -f docker-compose.prod.yml up -d --build
```

### 2. Trigger Automated Deployment

Once GitHub secrets are configured:

```bash
# Push to main branch
git push origin main

# Or manually trigger from GitHub Actions UI
# Go to Actions → Deploy to DigitalOcean → Run workflow
```

### 3. Monitor Deployment

- Watch progress: **GitHub → Actions → Deploy to DigitalOcean**
- Check logs on server:
  ```bash
  ssh root@YOUR_SERVER_IP
  cd ~/baum-vibe
  docker compose -f docker-compose.prod.yml logs -f
  ```

## Deployment Workflow Details

### Workflow Triggers

- **Automatic**: Pushes to `main` branch
- **Manual**: Via GitHub Actions UI (workflow_dispatch)

### Deployment Steps

1. **Checkout code**: Gets latest code from repository
2. **Set up SSH**: Configures SSH agent with private key
3. **Add known hosts**: Prevents SSH host verification prompt
4. **Create .env file**: Generates environment file from secrets
5. **Deploy to server**: Syncs code via rsync
6. **Build & start**: Runs `docker compose up -d --build`
7. **Migrations**: Applies database migrations
8. **Collect static**: Gathers static files
9. **Health check**: Verifies application is responding
10. **Cleanup**: Removes temporary .env file
11. **Rollback**: Reverts to previous version on failure

### Security Features

- ✓ SSH key authentication (no passwords)
- ✓ Secrets stored in GitHub (never in code)
- ✓ Environment variables injected at deploy time
- ✓ Automatic cleanup of sensitive files
- ✓ Rollback on deployment failure

## Troubleshooting

### Deployment Fails: "Permission denied (publickey)"

**Problem**: SSH authentication failed

**Solution**:
```bash
# Verify SSH key is correct
ssh -i ~/.ssh/id_rsa root@YOUR_SERVER_IP

# Check server's authorized_keys
ssh root@YOUR_SERVER_IP
cat ~/.ssh/authorized_keys

# Ensure correct permissions
chmod 700 ~/.ssh
chmod 600 ~/.ssh/authorized_keys
```

### Deployment Fails: "docker: command not found"

**Problem**: Docker not installed on server

**Solution**:
```bash
ssh root@YOUR_SERVER_IP
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo apt install docker-compose-plugin -y
```

### Health Check Fails

**Problem**: Application not responding after deployment

**Solution**:
```bash
ssh root@YOUR_SERVER_IP
cd ~/baum-vibe

# Check service status
docker compose -f docker-compose.prod.yml ps

# Check logs
docker compose -f docker-compose.prod.yml logs backend
docker compose -f docker-compose.prod.yml logs frontend
docker compose -f docker-compose.prod.yml logs nginx

# Restart services
docker compose -f docker-compose.prod.yml restart
```

### Database Migration Errors

**Problem**: Migration fails during deployment

**Solution**:
```bash
ssh root@YOUR_SERVER_IP
cd ~/baum-vibe

# Run migrations manually
docker compose -f docker-compose.prod.yml exec backend python manage.py migrate

# Check migration status
docker compose -f docker-compose.prod.yml exec backend python manage.py showmigrations
```

### Nginx 502 Bad Gateway

**Problem**: Nginx can't reach backend

**Solution**:
```bash
# Check if backend is running
docker compose -f docker-compose.prod.yml ps backend

# Check backend logs
docker compose -f docker-compose.prod.yml logs backend

# Restart backend
docker compose -f docker-compose.prod.yml restart backend
```

## Manual Deployment Commands

If you need to deploy manually:

```bash
# SSH into server
ssh root@YOUR_SERVER_IP

# Navigate to deployment directory
cd ~/baum-vibe

# Pull latest code
git pull origin main

# Rebuild and restart
docker compose -f docker-compose.prod.yml up -d --build

# Run migrations
docker compose -f docker-compose.prod.yml exec backend python manage.py migrate

# Collect static files
docker compose -f docker-compose.prod.yml exec backend python manage.py collectstatic --noinput

# Check status
docker compose -f docker-compose.prod.yml ps
```

## Rollback Procedure

If deployment succeeds but you need to rollback:

```bash
# SSH into server
ssh root@YOUR_SERVER_IP
cd ~/baum-vibe

# Rollback to previous commit
git log --oneline  # Find commit hash
git checkout <previous-commit-hash>

# Rebuild
docker compose -f docker-compose.prod.yml up -d --build

# Run migrations (if needed)
docker compose -f docker-compose.prod.yml exec backend python manage.py migrate
```

## Cost Estimation

### DigitalOcean Droplet Costs

| Size | RAM | CPU | Storage | Price/Month | Recommended For |
|------|-----|-----|---------|-------------|-----------------|
| Basic | 1GB | 1 | 25GB | $6 | Testing only |
| Basic | 2GB | 1 | 50GB | $12 | Small tournaments (<100 users) |
| Basic | 4GB | 2 | 80GB | $24 | Medium tournaments (<500 users) |
| Basic | 8GB | 4 | 160GB | $48 | Large tournaments (>500 users) |

**Recommendation**: Start with $12/month droplet, scale up as needed.

### Additional Costs

- Domain name: $10-15/year
- SSL certificate: Free (Let's Encrypt)
- Backup snapshots: $1/month per 10GB (optional)

## Monitoring and Maintenance

### View Application Logs

```bash
# All services
docker compose -f docker-compose.prod.yml logs -f

# Specific service
docker compose -f docker-compose.prod.yml logs -f backend
docker compose -f docker-compose.prod.yml logs -f nginx

# Last 100 lines
docker compose -f docker-compose.prod.yml logs --tail=100
```

### Database Backups

```bash
# Backup database
docker compose -f docker-compose.prod.yml exec backend python manage.py dumpdata > backup_$(date +%Y%m%d).json

# Or backup SQLite file directly
docker compose -f docker-compose.prod.yml exec backend cp /app/db/db.sqlite3 /app/db/db.sqlite3.backup

# Download backup to local machine
scp root@YOUR_SERVER_IP:~/baum-vibe/backup_*.json ./
```

### System Resource Monitoring

```bash
# Check disk usage
df -h

# Check memory usage
free -h

# Check Docker resource usage
docker stats

# Check container logs size
docker system df
```

## Advanced: Using DigitalOcean Container Registry

For faster deployments, push images to DigitalOcean Container Registry:

### 1. Create Container Registry

- Go to DigitalOcean Console → Container Registry
- Create new registry
- Note the registry URL (e.g., `registry.digitalocean.com/your-registry`)

### 2. Update Workflow

Add build and push steps before deploy:

```yaml
- name: Build and push Docker images
  run: |
    docker login -u ${{ secrets.DO_REGISTRY_TOKEN }} -p ${{ secrets.DO_REGISTRY_TOKEN }} registry.digitalocean.com
    docker build -t registry.digitalocean.com/your-registry/tournament-backend:latest -f backend/Dockerfile.prod backend/
    docker build -t registry.digitalocean.com/your-registry/tournament-frontend:latest -f frontend/Dockerfile.prod frontend/
    docker push registry.digitalocean.com/your-registry/tournament-backend:latest
    docker push registry.digitalocean.com/your-registry/tournament-frontend:latest
```

### 3. Update docker-compose.prod.yml

```yaml
services:
  backend:
    image: registry.digitalocean.com/your-registry/tournament-backend:latest
    # Remove build context
  
  frontend:
    image: registry.digitalocean.com/your-registry/tournament-frontend:latest
    # Remove build context
```

## Next Steps

1. ✓ Set up DigitalOcean droplet
2. ✓ Configure GitHub secrets
3. ✓ Test manual deployment
4. ✓ Set up domain (optional)
5. ✓ Configure SSL (optional)
6. ✓ Push to main branch to trigger deployment
7. ✓ Monitor first deployment
8. ✓ Set up backups
9. ✓ Configure monitoring/alerts

## Support

If you encounter issues:

1. Check GitHub Actions logs for detailed error messages
2. SSH into server and check Docker logs
3. Verify all GitHub secrets are set correctly
4. Ensure server firewall allows HTTP/HTTPS traffic
5. Check DNS configuration if using domain name

For DigitalOcean-specific issues, refer to:
- [DigitalOcean Documentation](https://docs.digitalocean.com/)
- [Docker on DigitalOcean](https://docs.digitalocean.com/products/droplets/how-to/install-docker/)
