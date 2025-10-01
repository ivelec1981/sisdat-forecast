# 🚀 SISDAT Forecast - Deployment Guide

## 📋 Pre-Deployment Checklist

### ✅ Environment Setup

- [ ] Copy `.env.production.example` to `.env.production`
- [ ] Fill all required environment variables
- [ ] Verify `DATABASE_URL` is correct
- [ ] Set `NEXTAUTH_SECRET` (generate with: `openssl rand -base64 32`)
- [ ] Configure Sentry DSN
- [ ] Set reCAPTCHA keys
- [ ] Update `NEXTAUTH_URL` to production domain

### ✅ Code Quality

- [ ] All TypeScript errors resolved (`npm run type-check`)
- [ ] No ESLint errors (`npm run lint`)
- [ ] Build succeeds locally (`npm run build`)
- [ ] All tests pass (`npm test`)

### ✅ Database

- [ ] Migrations are up to date (`npx prisma migrate deploy`)
- [ ] Seed data is ready (if needed)
- [ ] Backup strategy is in place
- [ ] Connection pooling configured

### ✅ Security

- [ ] All secrets are in environment variables (not hardcoded)
- [ ] CSP headers configured
- [ ] HSTS enabled
- [ ] Rate limiting enabled
- [ ] reCAPTCHA enabled on sensitive forms
- [ ] CORS properly configured

### ✅ Performance

- [ ] Images optimized
- [ ] Code splitting enabled
- [ ] Cache strategy configured
- [ ] CDN configured (if applicable)
- [ ] Database queries optimized

### ✅ Monitoring

- [ ] Sentry configured and tested
- [ ] Error tracking enabled
- [ ] Performance monitoring enabled
- [ ] Web Vitals tracking enabled
- [ ] Analytics configured (Google Analytics)

---

## 🔧 Deployment Steps

### Option 1: Vercel (Recommended)

#### Initial Setup

1. **Install Vercel CLI**
   ```bash
   npm i -g vercel
   ```

2. **Login to Vercel**
   ```bash
   vercel login
   ```

3. **Link Project**
   ```bash
   vercel link
   ```

4. **Configure Environment Variables**
   ```bash
   # Add production environment variables
   vercel env add DATABASE_URL production
   vercel env add NEXTAUTH_SECRET production
   vercel env add NEXTAUTH_URL production
   # ... add all other vars
   ```

5. **Deploy to Production**
   ```bash
   vercel --prod
   ```

#### Automated Deployment (GitHub)

1. Connect repository to Vercel dashboard
2. Configure environment variables in Vercel UI
3. Enable automatic deployments from `main` branch
4. Every push to `main` triggers automatic deployment

### Option 2: Self-Hosted (Docker)

#### Prerequisites

- Docker & Docker Compose installed
- PostgreSQL database
- Nginx or Traefik for reverse proxy

#### Steps

1. **Create Dockerfile** (already in project)

2. **Build Docker Image**
   ```bash
   docker build -t sisdat-forecast:latest .
   ```

3. **Run with Docker Compose**
   ```bash
   docker-compose up -d
   ```

4. **Check Logs**
   ```bash
   docker-compose logs -f app
   ```

### Option 3: Traditional Server (PM2)

#### Prerequisites

- Node.js 18+ installed
- PM2 installed globally (`npm i -g pm2`)
- Nginx configured as reverse proxy

#### Steps

1. **Install Dependencies**
   ```bash
   npm ci --production
   ```

2. **Build Application**
   ```bash
   npm run build
   ```

3. **Run Database Migrations**
   ```bash
   npx prisma migrate deploy
   ```

4. **Start with PM2**
   ```bash
   pm2 start npm --name "sisdat-forecast" -- start
   pm2 save
   pm2 startup
   ```

5. **Configure Nginx**
   ```nginx
   server {
       listen 80;
       server_name your-domain.com;

       location / {
           proxy_pass http://localhost:3000;
           proxy_http_version 1.1;
           proxy_set_header Upgrade $http_upgrade;
           proxy_set_header Connection 'upgrade';
           proxy_set_header Host $host;
           proxy_cache_bypass $http_upgrade;
       }
   }
   ```

---

## 🗄️ Database Setup

### PostgreSQL (Production)

1. **Create Database**
   ```sql
   CREATE DATABASE sisdat_forecast;
   CREATE USER sisdat_user WITH ENCRYPTED PASSWORD 'your_secure_password';
   GRANT ALL PRIVILEGES ON DATABASE sisdat_forecast TO sisdat_user;
   ```

2. **Update Connection String**
   ```
   DATABASE_URL="postgresql://sisdat_user:your_secure_password@localhost:5432/sisdat_forecast?schema=public"
   ```

3. **Run Migrations**
   ```bash
   npx prisma migrate deploy
   ```

4. **Generate Prisma Client**
   ```bash
   npx prisma generate
   ```

### Initial Data Seeding

```bash
npm run db:seed
```

---

## 📊 Post-Deployment Checks

### Health Check

1. Visit: `https://your-domain.com/api/health`
2. Expected response: `{ "status": "ok", "timestamp": "..." }`

### Functionality Tests

- [ ] Homepage loads correctly
- [ ] Login works
- [ ] Dashboard displays data
- [ ] Charts render properly
- [ ] Maps load correctly
- [ ] API endpoints respond
- [ ] Forms submit successfully

### Performance Checks

- [ ] Lighthouse score > 90
- [ ] LCP < 2.5s
- [ ] FCP < 1.8s
- [ ] CLS < 0.1
- [ ] TTI < 3.8s

### Security Checks

- [ ] HTTPS enabled
- [ ] Security headers present (check with securityheaders.com)
- [ ] No exposed secrets
- [ ] Rate limiting works
- [ ] CORS properly configured

### Monitoring Checks

- [ ] Sentry receiving events
- [ ] Analytics tracking pageviews
- [ ] Web Vitals being reported
- [ ] Error logs accessible

---

## 🔄 Rollback Procedure

### Vercel

```bash
# List deployments
vercel ls

# Rollback to previous deployment
vercel rollback [deployment-url]
```

### Docker

```bash
# Stop current container
docker-compose down

# Start previous version
docker run -d --env-file .env.production sisdat-forecast:previous

# Or use docker-compose with specific version
docker-compose up -d sisdat-forecast:1.0.0
```

### PM2

```bash
# Checkout previous version
git checkout [previous-commit]

# Rebuild
npm run build

# Restart PM2
pm2 restart sisdat-forecast
```

---

## 💾 Backup Strategy

### Automated Backups

1. **Setup Cron Job**
   ```bash
   # Edit crontab
   crontab -e

   # Add daily backup at 2 AM
   0 2 * * * /path/to/project/scripts/backup-database.sh production
   ```

2. **Verify Backup**
   ```bash
   ls -lh backups/
   ```

### Manual Backup

```bash
./scripts/backup-database.sh production
```

### S3 Configuration (Optional)

Add to `.env.production`:
```env
BACKUP_S3_ENDPOINT="https://s3.amazonaws.com"
BACKUP_S3_BUCKET="sisdat-backups"
BACKUP_S3_ACCESS_KEY="your-access-key"
BACKUP_S3_SECRET_KEY="your-secret-key"
```

---

## 🔐 Security Hardening

### 1. Environment Variables

- Never commit `.env.production` to git
- Use secrets management (Vercel Secrets, AWS Secrets Manager, etc.)
- Rotate secrets regularly

### 2. Database

- Use strong passwords
- Enable SSL connections
- Restrict IP access
- Regular backups
- Connection pooling

### 3. Application

- Keep dependencies updated
- Enable rate limiting
- Implement CSRF protection
- Validate all inputs
- Sanitize outputs

### 4. Server

- Enable firewall
- Configure fail2ban
- Regular security updates
- Monitor logs
- Use HTTPS only

---

## 📈 Scaling Recommendations

### Horizontal Scaling

- **Vercel**: Automatically scaled
- **Docker**: Use Kubernetes or Docker Swarm
- **Traditional**: Use load balancer (Nginx, HAProxy)

### Vertical Scaling

- Increase server resources (CPU, RAM)
- Optimize database queries
- Implement caching (Redis)
- Use CDN for static assets

### Database Scaling

- Read replicas for heavy read operations
- Connection pooling (PgBouncer)
- Query optimization
- Indexes on frequently queried fields

---

## 🛠️ Maintenance

### Regular Tasks

**Daily:**
- Monitor error logs
- Check performance metrics
- Verify backups

**Weekly:**
- Review security alerts
- Check disk space
- Update dependencies (dev)

**Monthly:**
- Dependency updates (production)
- Security audit
- Performance optimization review
- Backup restoration test

### Monitoring Dashboards

1. **Vercel Dashboard**: Real-time deployment status
2. **Sentry**: Error tracking and performance
3. **Google Analytics**: User behavior
4. **Database Monitoring**: Query performance

---

## 🆘 Troubleshooting

### Build Failures

```bash
# Clear Next.js cache
rm -rf .next

# Clear node_modules
rm -rf node_modules
npm install

# Rebuild
npm run build
```

### Database Connection Issues

```bash
# Test connection
npx prisma db push --skip-generate

# Check connection string
echo $DATABASE_URL

# Verify database is running
pg_isready -h localhost -p 5432
```

### Memory Issues

```bash
# Increase Node.js memory limit
NODE_OPTIONS="--max-old-space-size=4096" npm run build

# Or in package.json scripts
"build": "NODE_OPTIONS='--max-old-space-size=4096' next build"
```

### Performance Issues

- Check Sentry performance monitoring
- Review database query performance
- Check for memory leaks
- Optimize images
- Review bundle size

---

## 📞 Support Contacts

- **Technical Issues**: soporte@sisdat-forecast.com
- **Infrastructure**: devops@sisdat-forecast.com
- **Security**: security@sisdat-forecast.com

---

## 📚 Additional Resources

- [Next.js Deployment Documentation](https://nextjs.org/docs/deployment)
- [Vercel Documentation](https://vercel.com/docs)
- [Prisma Documentation](https://www.prisma.io/docs)
- [Docker Documentation](https://docs.docker.com/)

---

**Last Updated:** 2025-09-30
**Version:** 2.1.0
