# GuriGate Deployment Guide

**Version:** 1.0  
**Date:** June 2, 2026  
**Status:** Production

---

## Executive Summary

This guide provides instructions for deploying the GuriGate application to production. GuriGate uses Supabase as its backend-as-a-service, which handles database, authentication, storage, and API hosting. The frontend is a React application built with Vite.

**Deployment Type:** Static frontend + Supabase BaaS  
**Infrastructure:** Supabase (managed services)  
**CI/CD:** Manual (planned automation)

---

## Prerequisites

### Required Accounts

- Supabase account (https://supabase.com)
- Domain name (optional, for custom domain)
- Payment provider accounts (Dodo, local wallet providers)

### Required Tools

- Node.js 18+ and npm/pnpm
- Git
- Supabase CLI (optional, for local development)

### Environment Variables

```env
VITE_SUPABASE_URL=your-supabase-project-url
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key
```

---

## Supabase Setup

### 1. Create Supabase Project

1. Log in to Supabase dashboard
2. Click "New Project"
3. Enter project name (e.g., "gurigate")
4. Select database password
5. Select region (closest to users)
6. Click "Create new project"
7. Wait for project initialization (2-3 minutes)

### 2. Get Project Credentials

1. Navigate to Project Settings → API
2. Copy the following values:
   - Project URL
   - anon/public API key
3. Store these securely

### 3. Apply Database Migrations

**Option A: Via Supabase Dashboard SQL Editor**

1. Navigate to SQL Editor
2. For each migration file in `supabase/migrations/`:
   - Open the file
   - Copy the SQL content
   - Paste into SQL Editor
   - Click "Run"
   - Verify success

**Migration Order:**
1. `20240502_gurigate_properties_schema.sql`
2. `20240502_gurigate_enhancements.sql`
3. `20240502_gurigate_enhancements_14A.sql`
4. `20240502_gurigate_enhancements_14B.sql`
5. `20240502_fix_rls_recursion.sql`
6. `20260502_payments_flow.sql`
7. `20260506_security_fixes_final.sql`
8. `20260508_admin_role_system.sql`
9. `20260529_messaging_system.sql`
10. `20260529_auto_conversation_triggers.sql`
11. `20260529_sprint1_validation.sql`

**Option B: Via Supabase CLI**

```bash
# Install Supabase CLI
npm install -g supabase

# Login to Supabase
supabase login

# Link to project
supabase link --project-ref your-project-ref

# Push migrations
supabase db push
```

### 4. Configure Authentication

1. Navigate to Authentication → Settings
2. Configure email settings:
   - Enable email confirmation (optional)
   - Set email template (if needed)
3. Configure JWT settings:
   - Set token expiration (default: 1 hour)
   - Set refresh token expiration (default: 30 days)
4. Enable social providers (if needed):
   - Google
   - Facebook
   - Apple

### 5. Configure Storage

1. Navigate to Storage
2. Create buckets:
   - `property-images` - Property photos
   - `avatars` - User avatars
   - `payment-proofs` - Payment proof images
3. Configure bucket policies:
   - Public read access for property-images
   - Private access for avatars and payment-proofs
4. Set up CDN (optional)

### 6. Deploy Edge Functions

**Dodo Checkout Function:**

1. Navigate to Edge Functions
2. Click "New Edge Function"
3. Name: `create-dodo-checkout`
4. Copy content from `supabase/functions/create-dodo-checkout/index.ts`
5. Configure environment variables (Dodo API keys)
6. Deploy function

---

## Frontend Deployment

### 1. Install Dependencies

```bash
cd frontend
npm install
# or
pnpm install
```

### 2. Configure Environment Variables

Create `.env.production` file:

```env
VITE_SUPABASE_URL=https://your-project-ref.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

### 3. Build Application

```bash
npm run build
# or
pnpm build
```

This creates a `dist/` directory with optimized static files.

### 4. Deploy to Hosting

**Option A: Vercel**

```bash
# Install Vercel CLI
npm install -g vercel

# Deploy
vercel --prod
```

**Option B: Netlify**

```bash
# Install Netlify CLI
npm install -g netlify-cli

# Deploy
netlify deploy --prod --dir=dist
```

**Option C: Supabase Hosting**

1. Navigate to Hosting in Supabase dashboard
2. Upload `dist/` directory contents
3. Configure custom domain (optional)

**Option D: Custom Server**

1. Upload `dist/` directory to your server
2. Configure web server (Nginx, Apache)
3. Set up SSL certificate
4. Configure domain

### 5. Configure Custom Domain (Optional)

**Vercel:**
1. Go to project settings
2. Add domain
3. Configure DNS records

**Netlify:**
1. Go to Domain settings
2. Add custom domain
3. Configure DNS records

**Supabase:**
1. Go to Hosting settings
2. Add custom domain
3. Configure DNS records

---

## Post-Deployment Configuration

### 1. Seed Initial Data

Run seed script to populate initial data:

```bash
node supabase/seed_gurigate_properties.sql
```

Or via SQL Editor:
1. Open `supabase/seed_gurigate_properties.sql`
2. Copy content to SQL Editor
3. Run script

### 2. Configure Payment Providers

**Dodo Payments:**
1. Obtain API credentials from Dodo
2. Configure in Edge Function environment variables
3. Set up webhook endpoint (if needed)

**Local Wallets:**
1. Create wallet provider accounts
2. Document verification process
3. Train admin team on verification workflow

### 3. Set Up Admin Accounts

1. Sign up first user via application
2. Access Supabase dashboard
3. Navigate to Authentication → Users
4. Find the user
5. Update `profiles` table:
   ```sql
   UPDATE profiles 
   SET role = 'super_admin' 
   WHERE email = 'admin@example.com';
   ```

### 4. Configure Email Notifications (Optional)

1. Set up SMTP server or use email service
2. Configure in Supabase email settings
3. Create email templates
4. Test email delivery

### 5. Configure Analytics (Optional)

1. Set up analytics tool (Google Analytics, Mixpanel)
2. Add tracking code to application
3. Configure event tracking
4. Test analytics integration

---

## Verification Steps

### 1. Test Authentication

1. Navigate to application
2. Sign up new user
3. Verify email (if enabled)
4. Sign in
5. Sign out
6. Sign in again

### 2. Test Property Creation

1. Log in as host
2. Navigate to "Become a Host"
3. Complete property creation flow
4. Submit for approval

### 3. Test Admin Approval

1. Log in as admin
2. Navigate to admin dashboard
3. Approve pending property
4. Verify property appears in marketplace

### 4. Test Booking Flow

1. Log in as guest
2. Browse properties
3. Select dates and guests
4. Proceed to payment
5. Complete payment
6. Verify booking created
7. Verify conversation created

### 5. Test Messaging

1. Navigate to inbox
2. Send message in conversation
3. Verify real-time updates
4. Test internal notes (admin)

### 6. Test Payment Verification

1. Log in as admin
2. Navigate to payments
3. Verify pending payment
4. Confirm booking status updates

---

## Monitoring and Maintenance

### 1. Monitor Supabase Dashboard

Check regularly:
- Database performance
- API usage
- Storage usage
- Authentication logs
- Edge function logs

### 2. Set Up Alerts

Configure alerts for:
- High database CPU usage
- API rate limit approaching
- Storage quota near limit
- Failed authentication attempts
- Edge function errors

### 3. Backup Strategy

**Database Backups:**
- Supabase automatic daily backups (7-day retention)
- Enable point-in-time recovery
- Manual backup before major changes

**File Backups:**
- Backup uploaded images regularly
- Use Supabase storage backup

### 4. Update Process

**Frontend Updates:**
1. Create feature branch
2. Make changes
3. Test locally
4. Build production version
5. Deploy to staging (if available)
6. Test staging
7. Deploy to production
8. Verify deployment

**Database Updates:**
1. Create new migration file
2. Test migration locally
3. Backup production database
4. Apply migration to staging
5. Test staging
6. Apply migration to production
7. Verify changes
8. Roll back if issues

---

## Troubleshooting

### Build Errors

**Issue:** Build fails with TypeScript errors

**Solution:**
```bash
# Check TypeScript version
npm list typescript

# Update dependencies
npm update

# Clear cache
rm -rf node_modules
npm install
```

### Environment Variables

**Issue:** Environment variables not loading

**Solution:**
- Verify `.env.production` file exists
- Check variable names match exactly
- Restart build process
- Verify variables in deployed environment

### Database Connection

**Issue:** Cannot connect to Supabase

**Solution:**
- Verify Supabase URL and API key
- Check network connectivity
- Verify RLS policies allow access
- Check Supabase status page

### Authentication Issues

**Issue:** Users cannot sign in

**Solution:**
- Check JWT expiration settings
- Verify email confirmation settings
- Check auth logs in Supabase
- Verify user status (not banned)

### RLS Policy Issues

**Issue:** Users cannot access data

**Solution:**
- Check RLS policies in SQL Editor
- Verify user role in profiles table
- Test queries in SQL Editor
- Check auth.uid() matches user ID

---

## Security Checklist

- [ ] Change default database password
- [ ] Enable RLS on all tables
- [ ] Configure JWT expiration appropriately
- [ ] Enable email verification (recommended)
- [ ] Set up rate limiting
- [ ] Configure CORS for specific domains
- [ ] Enable HTTPS for all endpoints
- [ ] Set up regular backups
- [ ] Monitor audit logs regularly
- [ ] Configure security alerts
- [ ] Remove debug console.log statements
- [ ] Implement input validation
- [ ] Set up error tracking

---

## Performance Optimization

### Frontend

- Enable code splitting
- Implement lazy loading for images
- Use CDN for static assets
- Enable compression
- Implement caching headers
- Optimize bundle size

### Database

- Add indexes for frequently queried columns
- Optimize RLS policies
- Use connection pooling
- Enable query caching
- Monitor slow queries

### CDN

- Configure Supabase CDN for images
- Set up custom CDN for static assets
- Enable image optimization
- Configure cache rules

---

## Rollback Procedure

### Frontend Rollback

**Vercel:**
```bash
vercel rollback
```

**Netlify:**
1. Navigate to Deploys
2. Select previous successful deploy
3. Click "Deploy site"

**Manual:**
1. Revert to previous commit
2. Rebuild application
3. Redeploy

### Database Rollback

1. Access Supabase SQL Editor
2. Run rollback migration (if available)
3. Or restore from backup:
   - Navigate to Database → Backups
   - Select backup point
   - Click "Restore"

---

**Document Owner:** Development Team  
**Last Updated:** June 2, 2026  
**Next Review:** After deployment
