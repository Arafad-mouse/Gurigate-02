# GuriGate Deployment Guide

**Document Version:** 1.0  
**Date:** June 2, 2026  
**Author:** System Architecture Team

---

## 1. Overview

This document provides comprehensive deployment instructions for the GuriGate platform, covering environment setup, deployment processes, and operational procedures.

### Deployment Architecture

```
Frontend: Vercel (recommended) or Netlify
Backend: Supabase Cloud
Database: Supabase PostgreSQL
Storage: Supabase Storage
Edge Functions: Supabase Deno
```

---

## 2. Prerequisites

### 2.1 Required Accounts

- **Supabase Account:** https://supabase.com
- **Vercel Account:** https://vercel.com (recommended) or Netlify
- **Dodo Payments Account:** For payment processing
- **Git Repository:** GitHub, GitLab, or Bitbucket

### 2.2 Required Tools

- **Node.js:** v18 or higher
- **npm:** v9 or higher
- **Git:** Latest version
- **Supabase CLI:** Latest version (optional but recommended)

### 2.3 Required Environment Variables

```env
# Supabase
VITE_SUPABASE_URL=your-supabase-url
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key

# Dodo Payments
VITE_DODO_API_KEY=your-dodo-api-key
VITE_DODO_SECRET_KEY=your-dodo-secret-key

# Application
VITE_APP_URL=your-app-url
VITE_APP_NAME=GuriGate
```

---

## 3. Environment Setup

### 3.1 Supabase Project Setup

1. **Create Supabase Project**
   - Log in to Supabase Dashboard
   - Click "New Project"
   - Select organization
   - Enter project name: `gurigate`
   - Select database password (save securely)
   - Select region (closest to your users)
   - Click "Create new project"

2. **Get Project Credentials**
   - Navigate to Project Settings → API
   - Copy Project URL
   - Copy anon public API key
   - Save these securely

3. **Run Database Migrations**
   ```bash
   # Install Supabase CLI (if not installed)
   npm install -g supabase
   
   # Link to your project
   supabase login
   supabase link --project-ref YOUR_PROJECT_REF
   
   # Push migrations
   supabase db push
   ```

4. **Configure Storage**
   - Navigate to Storage in Supabase Dashboard
   - Create bucket: `property-images`
   - Create bucket: `avatars`
   - Configure bucket policies (public read, authenticated write)

5. **Enable Realtime**
   - Navigate to Database → Replication
   - Enable realtime for: `conversations`, `messages`

### 3.2 Frontend Setup

1. **Clone Repository**
   ```bash
   git clone https://github.com/your-org/gurigate.git
   cd gurigate
   ```

2. **Install Dependencies**
   ```bash
   npm install
   ```

3. **Configure Environment Variables**
   ```bash
   # Create .env.local file
   cp .env.example .env.local
   
   # Edit .env.local with your credentials
   nano .env.local
   ```

4. **Run Development Server**
   ```bash
   npm run dev
   ```

5. **Build for Production**
   ```bash
   npm run build
   npm run preview
   ```

---

## 4. Deployment to Vercel

### 4.1 Vercel Setup

1. **Install Vercel CLI**
   ```bash
   npm install -g vercel
   ```

2. **Login to Vercel**
   ```bash
   vercel login
   ```

3. **Deploy Project**
   ```bash
   vercel
   ```

4. **Configure Environment Variables**
   - Go to Vercel Dashboard
   - Select your project
   - Navigate to Settings → Environment Variables
   - Add all environment variables from .env.local

5. **Deploy to Production**
   ```bash
   vercel --prod
   ```

### 4.2 Vercel Configuration

Create `vercel.json` in project root:

```json
{
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "framework": "vite",
  "env": {
    "VITE_SUPABASE_URL": "@supabase-url",
    "VITE_SUPABASE_ANON_KEY": "@supabase-anon-key",
    "VITE_DODO_API_KEY": "@dodo-api-key",
    "VITE_DODO_SECRET_KEY": "@dodo-secret-key"
  }
}
```

---

## 5. Deployment to Netlify (Alternative)

### 5.1 Netlify Setup

1. **Install Netlify CLI**
   ```bash
   npm install -g netlify-cli
   ```

2. **Login to Netlify**
   ```bash
   netlify login
   ```

3. **Initialize Project**
   ```bash
   netlify init
   ```

4. **Configure Build Settings**
   - Build command: `npm run build`
   - Publish directory: `dist`

5. **Deploy**
   ```bash
   netlify deploy --prod
   ```

### 5.2 Netlify Configuration

Create `netlify.toml` in project root:

```toml
[build]
  command = "npm run build"
  publish = "dist"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

---

## 6. Edge Functions Deployment

### 6.1 Deploy Edge Functions

1. **Navigate to Edge Functions in Supabase Dashboard**
   - Go to your Supabase project
   - Navigate to Edge Functions

2. **Create Function**
   - Click "New Function"
   - Enter function name: `create-dodo-checkout`
   - Copy code from `supabase/functions/create-dodo-checkout/index.ts`
   - Save

3. **Configure Environment Variables**
   - Navigate to Edge Functions settings
   - Add environment variables for Dodo API keys

4. **Deploy Function**
   - Click "Deploy"
   - Wait for deployment to complete

### 6.2 Edge Functions CLI Deployment

```bash
# Deploy all functions
supabase functions deploy

# Deploy specific function
supabase functions deploy create-dodo-checkout

# Deploy with environment variables
supabase functions deploy create-dodo-checkout --env-file .env.local
```

---

## 7. Database Migration Deployment

### 7.1 Apply Migrations

```bash
# Push all migrations
supabase db push

# Push specific migration
supabase db push --file supabase/migrations/20240101000000_initial_schema.sql

# Reset database (use with caution)
supabase db reset
```

### 7.2 Migration Rollback

```bash
# List migrations
supabase migration list

# Rollback to specific migration
supabase db reset --version 20240101000000
```

---

## 8. Post-Deployment Configuration

### 8.1 Supabase Configuration

1. **Enable Email Verification**
   - Navigate to Authentication → Providers
   - Enable email confirmation

2. **Configure JWT Settings**
   - Navigate to Authentication → JWT Settings
   - Set token expiration (default: 1 hour)
   - Configure refresh token rotation

3. **Configure RLS Policies**
   - Navigate to Database → Tables
   - Verify RLS policies are enabled
   - Test policies with different roles

4. **Configure Storage Policies**
   - Navigate to Storage
   - Verify bucket policies
   - Test upload/download permissions

### 8.2 Dodo Payments Configuration

1. **Configure Webhook**
   - Get webhook URL from Supabase Edge Functions
   - Configure in Dodo Payments Dashboard
   - Set webhook secret

2. **Test Payment Flow**
   - Create test booking
   - Process test payment
   - Verify webhook receives notification

### 8.3 Domain Configuration

1. **Configure Custom Domain (Vercel)**
   - Go to Vercel Dashboard
   - Navigate to Settings → Domains
   - Add custom domain
   - Update DNS records

2. **Configure Custom Domain (Netlify)**
   - Go to Netlify Dashboard
   - Navigate to Domain settings
   - Add custom domain
   - Update DNS records

---

## 9. Monitoring and Maintenance

### 9.1 Supabase Monitoring

1. **Database Monitoring**
   - Navigate to Database → Reports
   - Monitor query performance
   - Check connection pool status

2. **Storage Monitoring**
   - Navigate to Storage
   - Monitor storage usage
   - Check bandwidth usage

3. **Edge Function Monitoring**
   - Navigate to Edge Functions → Logs
   - Monitor function invocations
   - Check error rates

### 9.2 Application Monitoring

1. **Error Tracking**
   - Set up Sentry or similar
   - Configure error reporting
   - Monitor error rates

2. **Performance Monitoring**
   - Set up performance monitoring
   - Track Core Web Vitals
   - Monitor API response times

3. **Uptime Monitoring**
   - Set up uptime monitoring
   - Configure alerts
   - Monitor availability

---

## 10. Backup and Recovery

### 10.1 Database Backups

Supabase provides automatic backups:
- Daily backups retained for 7 days
- Weekly backups retained for 4 weeks
- Point-in-time recovery available

### 10.2 Manual Backup

```bash
# Backup database
supabase db dump -f backup.sql

# Restore database
supabase db reset --file backup.sql
```

### 10.3 Storage Backup

- Download important files from storage
- Implement off-site backup strategy
- Test restore procedures

---

## 11. Scaling Considerations

### 11.1 Database Scaling

Supabase handles scaling automatically:
- Connection pooling
- Read replicas (available on Pro plan)
- Auto-scaling based on load

### 11.2 Application Scaling

Vercel handles scaling automatically:
- Global CDN
- Edge network
- Auto-scaling based on traffic

### 11.3 Storage Scaling

Supabase Storage auto-scales:
- Unlimited storage (with limits on free tier)
- CDN delivery
- Automatic optimization

---

## 12. Security Considerations

### 12.1 Environment Variables

- Never commit .env files to Git
- Use environment variable management in deployment platform
- Rotate secrets regularly
- Use different secrets for different environments

### 12.2 API Keys

- Never expose service role keys in frontend
- Use anon key for client-side operations
- Use service role key only in Edge Functions
- Rotate keys periodically

### 12.3 Database Access

- Use Row-Level Security (RLS)
- Limit database access via IP whitelist
- Use connection pooling
- Monitor database logs

---

## 13. Troubleshooting

### 13.1 Common Issues

**Build Failures:**
- Check Node.js version
- Clear npm cache: `npm cache clean --force`
- Delete node_modules and reinstall
- Check environment variables

**Database Connection Issues:**
- Verify Supabase URL and keys
- Check database status in Supabase Dashboard
- Verify RLS policies
- Check connection pool status

**Edge Function Errors:**
- Check function logs in Supabase Dashboard
- Verify environment variables
- Check function code syntax
- Test function locally

**Payment Issues:**
- Verify Dodo API keys
- Check webhook configuration
- Test payment flow in sandbox mode
- Check Edge Function logs

### 13.2 Debug Mode

Enable debug mode in development:
```bash
# Set environment variable
VITE_DEBUG=true npm run dev
```

---

## 14. Rollback Procedures

### 14.1 Frontend Rollback (Vercel)

```bash
# List deployments
vercel list

# Rollback to previous deployment
vercel rollback [deployment-url]
```

### 14.2 Database Rollback

```bash
# Reset to previous migration
supabase db reset --version [migration-version]

# Restore from backup
supabase db reset --file backup.sql
```

### 14.3 Edge Function Rollback

```bash
# Deploy previous version
supabase functions deploy create-dodo-checkout --version [version]
```

---

## 15. CI/CD Pipeline

### 15.1 GitHub Actions Example

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          
      - name: Install dependencies
        run: npm ci
        
      - name: Run tests
        run: npm test
        
      - name: Build
        run: npm run build
        
      - name: Deploy to Vercel
        uses: amondnet/vercel-action@v25
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.ORG_ID }}
          vercel-project-id: ${{ secrets.PROJECT_ID }}
          vercel-args: '--prod'
```

---

## 16. Deployment Checklist

### Pre-Deployment:
- [ ] All environment variables configured
- [ ] Database migrations applied
- [ ] Edge functions deployed
- [ ] Storage buckets created
- [ ] RLS policies verified
- [ ] Tests passing
- [ ] Build successful

### Post-Deployment:
- [ ] Application accessible
- [ ] Authentication working
- [ ] Database connections working
- [ ] Edge functions responding
- [ ] Storage uploads working
- [ ] Payment flow tested
- [ ] Monitoring configured
- [ ] Backups verified

---

## 17. Documentation References

**Related Documents:**
- Frontend Architecture Document
- Backend Architecture Document
- Security Documentation
- Gap Analysis

**External Resources:**
- Supabase Documentation: https://supabase.com/docs
- Vercel Documentation: https://vercel.com/docs
- Dodo Payments Documentation: https://dodopayments.com/docs

---

**End of Deployment Guide**
