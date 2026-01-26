# EDWL Deployment Guide

## Prerequisites
- Docker & Docker Compose installed
- PostgreSQL database (local or remote)
- Node.js 18+ (for local development)
- Domain name with SSL certificate (for production)

---

## Quick Start with Docker

### 1. Clone the Repository
```bash
git clone <repository-url>
cd EDWL-Project
```

### 2. Configure Environment
```bash
# Copy template
cp .env.docker.template .env

# Edit with your values
nano .env
```

### 3. Run with Docker Compose
```bash
docker-compose up -d
```

The application will be available at:
- Frontend: http://localhost
- Backend API: http://localhost:5000
- API Docs: http://localhost:5000/api-docs

---

## Production Deployment

### Option 1: Cloud Platforms (AWS/Azure/GCP)

#### AWS EC2 Deployment
1. **Launch EC2 Instance** (Ubuntu 22.04 LTS, t3.medium or higher)
2. **Install Docker**:
   ```bash
   sudo apt update
   sudo apt install docker.io docker-compose -y
   sudo usermod -aG docker $USER
   ```
3. **Setup PostgreSQL** (RDS or self-hosted)
4. **Configure Environment**:
   ```bash
   DATABASE_URL="postgresql://user:password@your-rds-endpoint:5432/edwl_db"
   JWT_SECRET="your_64_char_secret"
   NODE_ENV=production
   ```
5. **Deploy**:
   ```bash
   docker-compose -f docker-compose.prod.yml up -d
   ```

#### Azure App Service
1. Create PostgreSQL Flexible Server
2. Create two App Services (frontend & backend)
3. Configure environment variables in App Settings
4. Deploy using GitHub Actions

### Option 2: VPS (DigitalOcean, Linode, Vultr)

```bash
# 1. SSH into your server
ssh root@your-server-ip

# 2. Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sh get-docker.sh

# 3. Clone and configure
git clone <repo>
cd EDWL-Project
nano .env

# 4. Run
docker-compose up -d

# 5. Setup Nginx reverse proxy (optional)
# See nginx-reverse-proxy.conf
```

---

## SSL/TLS Configuration

### Using Let's Encrypt (Certbot)
```bash
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com
```

### Manual Certificate
Place certificates in `/etc/ssl/` and update nginx config.

---

## Database Migration

### Initial Setup
```bash
cd backend
npx prisma db push
```

### Backup Before Migration
```bash
chmod +x scripts/backup.sh
./scripts/backup.sh
```

### Apply Migrations
```bash
npx prisma migrate deploy
```

---

## Monitoring & Logging

### View Logs
```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f backend
```

### Health Checks
- Backend: `curl http://localhost:5000/`
- PostgreSQL: `docker exec edwl_postgres pg_isready`

---

## Scaling Considerations

### Horizontal Scaling
- Use PM2 for multiple backend instances
- Setup load balancer (Nginx/HAProxy)
- Separate database server

### Caching
- Implement Redis for session storage
- Cache frequent database queries

### CDN
- Use Cloudflare or AWS CloudFront for static assets

---

## Security Checklist

- [ ] Change all default passwords
- [ ] Use strong JWT_SECRET (64+ characters)
- [ ] Enable SSL/TLS
- [ ] Configure firewall (allow only 80, 443, 22)
- [ ] Setup automated backups
- [ ] Enable security headers (already in Nginx config)
- [ ] Regular dependency updates
- [ ] Monitor audit logs

---

## Troubleshooting

### Database Connection Issues
```bash
# Check if PostgreSQL is running
docker ps | grep postgres

# Test connection
docker exec -it edwl_postgres psql -U postgres -d edwl_db
```

### Port Conflicts
```bash
# Check what's using port 5000
lsof -i :5000

# Change PORT in .env and restart
```

### Prisma Issues
```bash
cd backend
npx prisma generate
npx prisma db push --force-reset  # WARNING: deletes data
```

---

## Backup & Recovery

### Automated Backups
Setup cron job:
```bash
crontab -e

# Daily backup at 2 AM
0 2 * * * cd /path/to/EDWL-Project && ./scripts/backup.sh
```

### Manual Backup
```bash
./scripts/backup.sh
```

### Restore
```bash
./scripts/restore.sh backups/edwl_backup_YYYYMMDD_HHMMSS.sql.gz
```

---

## Performance Optimization

1. **Database Indexing**: Already configured in Prisma schema
2. **Response Compression**: Enabled in server.js
3. **Static Asset Caching**: Configured in Nginx
4. **Connection Pooling**: Prisma handles automatically

---

## Support & Maintenance

- Monitor error.log in backend/
- Review audit logs regularly via Admin dashboard
- Keep dependencies updated: `npm audit fix`
- Rotate JWT secrets quarterly
