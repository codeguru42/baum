# Go Tournament Manager - Production Deployment Guide

This guide explains how to deploy the Go Tournament Manager application to production using Docker Compose.

## Prerequisites

- Docker Engine 20.10+ and Docker Compose V2+
- A server with at least 2GB RAM and 10GB disk space
- Domain name (optional, for HTTPS)
- SSH access to your server

## Quick Start

### 1. Clone the Repository

```bash
git clone <your-repo-url>
cd baum-vibe
```

### 2. Configure Environment Variables

Copy the example environment file and edit it:

```bash
cp .env.example .env
nano .env
```

**Required changes:**
- `DJANGO_SECRET_KEY`: Generate a random secret key (use `openssl rand -base64 32`)
- `DJANGO_DEBUG`: Set to `False` for production (can be omitted, defaults to False)
- `DJANGO_ALLOWED_HOSTS`: Add your domain name(s), e.g., `yourdomain.com,www.yourdomain.com`
- `REACT_APP_API_URL`: Set to your API URL, e.g., `https://yourdomain.com/api`

Example production `.env`:
```env
DJANGO_SECRET_KEY=your-random-secret-key-here
DJANGO_DEBUG=False
DJANGO_ALLOWED_HOSTS=yourdomain.com,www.yourdomain.com
REACT_APP_API_URL=https://yourdomain.com/api
```

### 3. Build and Start Services

```bash
docker compose -f docker-compose.prod.yml up -d --build
```

This will:
- Build production Docker images for backend and frontend
- Start all services (backend, frontend, nginx)
- Run database migrations
- Collect static files

### 4. Verify Deployment

Check that all services are running:

```bash
docker compose -f docker-compose.prod.yml ps
```

All services should show "Up" status.

### 5. Access the Application

- **Application**: http://your-server-ip/
- **Admin Interface**: http://your-server-ip/admin/games
- **API**: http://your-server-ip/api/

## Architecture

The production setup consists of three services:

1. **Backend** (Django + Gunicorn)
   - Runs on internal port 8000
   - Serves the REST API
   - Uses SQLite database by default

2. **Frontend** (React + Nginx)
   - Production-optimized React build
   - Served by Nginx
   - Runs on internal port 80

3. **Nginx** (Reverse Proxy)
   - Main entry point (port 80/443)
   - Routes `/api/` to backend
   - Routes `/` to frontend
   - Serves static files

```
Internet → Nginx (Port 80/443)
            ├─→ /api/* → Backend (Gunicorn)
            ├─→ /static/* → Static Files
            └─→ /* → Frontend (React)
```

## Configuration Files

### Docker Compose Files

- `docker-compose.yml` - Development environment
- `docker-compose.prod.yml` - Production environment

### Dockerfiles

- `backend/Dockerfile` - Development backend
- `backend/Dockerfile.prod` - Production backend (with Gunicorn)
- `frontend/Dockerfile` - Development frontend
- `frontend/Dockerfile.prod` - Production frontend (optimized build)

### Nginx Configuration

- `nginx/nginx.conf` - Main nginx configuration
- `nginx/conf.d/default.conf` - Virtual host configuration
- `frontend/nginx.conf` - Frontend-specific configuration

## Production Best Practices

### Security

1. **Secret Key**: Always use a strong, random secret key in production
2. **HTTPS**: Configure SSL/TLS certificates (see HTTPS Setup below)
3. **Allowed Hosts**: Restrict Django's ALLOWED_HOSTS to your actual domain(s)
4. **Debug Mode**: Ensure `DJANGO_DEBUG=False` (default in production)
5. **Firewall**: Only expose ports 80 and 443 to the internet

### Database

This project uses SQLite, which is suitable for small to medium deployments.

### Backups

**Database Backup:**

```bash
# Backup SQLite database
docker compose -f docker-compose.prod.yml exec backend \
  tar czf - -C /app/db db.sqlite3 > backup-$(date +%Y%m%d).tar.gz

# Restore database
docker compose -f docker-compose.prod.yml exec -T backend \
  tar xzf - -C /app/db < backup-YYYYMMDD.tar.gz
```

**Full Backup:**

```bash
# Backup all Docker volumes
docker run --rm \
  -v baum-vibe_backend-data:/data \
  -v $(pwd):/backup \
  alpine tar czf /backup/volumes-backup-$(date +%Y%m%d).tar.gz /data
```

### Monitoring

Check service logs:

```bash
# All services
docker compose -f docker-compose.prod.yml logs -f

# Specific service
docker compose -f docker-compose.prod.yml logs -f backend
docker compose -f docker-compose.prod.yml logs -f frontend
docker compose -f docker-compose.prod.yml logs -f nginx
```

Health check:

```bash
# Backend health
curl http://localhost/api/players/

# Check service status
docker compose -f docker-compose.prod.yml ps
```

## HTTPS Setup (Optional but Recommended)

### Using Let's Encrypt with Certbot

1. **Install Certbot** on your server:

```bash
sudo apt-get update
sudo apt-get install certbot python3-certbot-nginx
```

2. **Stop the application** temporarily:

```bash
docker compose -f docker-compose.prod.yml down
```

3. **Generate SSL certificate**:

```bash
sudo certbot certonly --standalone -d yourdomain.com -d www.yourdomain.com
```

4. **Update nginx configuration** in `nginx/conf.d/default.conf`:

```nginx
server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name yourdomain.com www.yourdomain.com;

    ssl_certificate /etc/nginx/ssl/fullchain.pem;
    ssl_certificate_key /etc/nginx/ssl/privkey.pem;
    
    # SSL configuration
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;
    ssl_prefer_server_ciphers on;
    
    # ... rest of configuration ...
}
```

5. **Mount SSL certificates** in `docker-compose.prod.yml`:

```yaml
nginx:
  volumes:
    - /etc/letsencrypt/live/yourdomain.com:/etc/nginx/ssl:ro
```

6. **Restart services**:

```bash
docker compose -f docker-compose.prod.yml up -d
```

7. **Auto-renewal**: Add cron job for certificate renewal:

```bash
sudo crontab -e
# Add this line:
0 0 * * * certbot renew --quiet && docker compose -f /path/to/baum-vibe/docker-compose.prod.yml restart nginx
```

## Maintenance

### Updating the Application

```bash
# Pull latest changes
git pull

# Rebuild and restart
docker compose -f docker-compose.prod.yml up -d --build

# Run new migrations if any
docker compose -f docker-compose.prod.yml exec backend python manage.py migrate
```

### Scaling

Increase Gunicorn workers for better performance:

Edit `backend/Dockerfile.prod` and change:
```
--workers 4  # Change to higher number based on CPU cores
```

Rule of thumb: `(2 × CPU_CORES) + 1`

### Stopping the Application

```bash
# Stop services
docker compose -f docker-compose.prod.yml stop

# Stop and remove containers
docker compose -f docker-compose.prod.yml down

# Stop and remove everything including volumes (CAUTION: removes database)
docker compose -f docker-compose.prod.yml down -v
```

## Troubleshooting

### Service won't start

```bash
# Check logs
docker compose -f docker-compose.prod.yml logs backend
docker compose -f docker-compose.prod.yml logs frontend
docker compose -f docker-compose.prod.yml logs nginx

# Rebuild from scratch
docker compose -f docker-compose.prod.yml down
docker compose -f docker-compose.prod.yml build --no-cache
docker compose -f docker-compose.prod.yml up -d
```

### Database issues

```bash
# Run migrations manually
docker compose -f docker-compose.prod.yml exec backend python manage.py migrate

# Access Django shell
docker compose -f docker-compose.prod.yml exec backend python manage.py shell
```

### Permission issues

```bash
# Fix database directory permissions
docker compose -f docker-compose.prod.yml exec backend chown -R root:root /app/db
docker compose -f docker-compose.prod.yml exec backend chmod 755 /app/db
```

### API not accessible

1. Check nginx logs: `docker compose -f docker-compose.prod.yml logs nginx`
2. Verify backend is running: `docker compose -f docker-compose.prod.yml ps backend`
3. Test backend directly: `docker compose -f docker-compose.prod.yml exec backend curl http://localhost:8000/api/players/`

## Cloud Deployment

### AWS (EC2 + ECS)

1. Launch EC2 instance (t3.small or larger)
2. Install Docker and Docker Compose
3. Follow Quick Start steps
4. Configure security groups to allow ports 80 and 443
5. Optional: Use ECS for container orchestration

### Google Cloud (Compute Engine + Cloud Run)

1. Create Compute Engine instance
2. Install Docker and Docker Compose
3. Follow Quick Start steps
4. Configure firewall rules
5. Optional: Use Cloud Run for serverless deployment

### DigitalOcean (Droplet or App Platform)

1. Create Droplet with Docker pre-installed
2. Follow Quick Start steps
3. Configure firewall
4. Optional: Use App Platform for managed deployment

### Azure (Container Instances or App Service)

1. Create VM or use Container Instances
2. Install Docker and Docker Compose
3. Follow Quick Start steps
4. Configure network security group

## Support

For issues or questions:
- Check logs: `docker compose -f docker-compose.prod.yml logs`
- Verify configuration: Review `.env` file
- Restart services: `docker compose -f docker-compose.prod.yml restart`

## License

[Your License Here]
