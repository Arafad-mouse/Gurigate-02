# GuriGate Troubleshooting Guide

**Version:** 1.0  
**Date:** June 2, 2026  
**Status:** Production

---

## Executive Summary

This guide provides solutions to common issues encountered when developing, deploying, and operating the GuriGate application. Issues are categorized by area and severity.

---

## Table of Contents

- [Frontend Issues](#frontend-issues)
- [Backend Issues](#backend-issues)
- [Database Issues](#database-issues)
- [Authentication Issues](#authentication-issues)
- [Payment Issues](#payment-issues)
- [Real-time Issues](#real-time-issues)
- [Performance Issues](#performance-issues)
- [Deployment Issues](#deployment-issues)
- [Development Issues](#development-issues)

---

## Frontend Issues

### Issue: Application Won't Start

**Symptoms:**
- npm run dev fails
- Blank screen in browser
- Console errors

**Solutions:**

1. Check Node.js version:
```bash
node --version  # Should be 18+
```

2. Clear cache and reinstall:
```bash
rm -rf node_modules
rm package-lock.json
npm install
```

3. Check for port conflicts:
```bash
# Windows
netstat -ano | findstr :5173

# Kill process if needed
taskkill /PID <PID> /F
```

4. Check environment variables:
```bash
# Verify .env file exists
cat .env

# Verify variables are set correctly
```

---

### Issue: White Screen on Load

**Symptoms:**
- Blank white screen
- No error messages visible
- Application appears to hang

**Solutions:**

1. Check browser console for errors:
- Open Developer Tools (F12)
- Check Console tab for errors
- Check Network tab for failed requests

2. Verify environment variables:
```bash
# Check .env file
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-key
```

3. Check for JavaScript errors in React:
- Add Error Boundary to catch errors
- Check for undefined variables
- Verify all imports are correct

4. Clear browser cache:
- Hard refresh (Ctrl+Shift+R)
- Clear cache and cookies
- Try incognito mode

---

### Issue: Images Not Loading

**Symptoms:**
- Property images show broken image icon
- Avatar images not displaying
- Payment proof images fail to load

**Solutions:**

1. Check Supabase Storage permissions:
- Verify bucket exists
- Check RLS policies allow read access
- Verify public bucket is public

2. Check image URLs:
```typescript
// Ensure correct URL format
const imageUrl = `${supabaseUrl}/storage/v1/object/public/bucket-name/image-path`
```

3. Check CORS settings:
- Verify origin is allowed in Supabase
- Check bucket CORS configuration

4. Check image format:
- Verify image is supported format (JPEG, PNG, WebP)
- Check file size limits
- Verify image is not corrupted

---

### Issue: Routing Not Working

**Symptoms:**
- Clicking navigation links does nothing
- URL changes but page doesn't update
- 404 errors on routes

**Solutions:**

1. Check React Router configuration:
```typescript
// Verify routes are defined correctly
<Routes>
  <Route path="/" element={<LandingPage />} />
  <Route path="/property/:id" element={<PropertyPage />} />
</Routes>
```

2. Check for nested Routes:
- Ensure BrowserRouter wraps all routes
- Verify no duplicate route paths

3. Check for route guards:
- Verify ProtectedRoute components work
- Check authentication state

4. Check browser history:
- Clear browser history
- Try direct URL access

---

## Backend Issues

### Issue: API Calls Failing

**Symptoms:**
- API requests return 401/403 errors
- Requests timeout
- Network errors

**Solutions:**

1. Check Supabase connection:
```typescript
// Verify client initialization
const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
)
```

2. Check RLS policies:
- Verify user is authenticated
- Check policies allow the operation
- Test policy in SQL Editor

3. Check API key validity:
- Verify anon key is correct
- Check key hasn't expired
- Regenerate key if needed

4. Check network connectivity:
- Verify internet connection
- Check firewall settings
- Test API endpoint in Postman

---

### Issue: Edge Functions Not Working

**Symptoms:**
- Edge function returns 500 error
- Function timeout
- Function not deployed

**Solutions:**

1. Check function logs:
- Navigate to Edge Functions in Supabase
- View function logs for errors
- Check for runtime errors

2. Check environment variables:
- Verify all required env vars are set
- Check variable names match exactly
- Restart function after changing vars

3. Check function code:
- Verify code has no syntax errors
- Check all imports are correct
- Test function locally first

4. Check function deployment:
- Verify function is deployed
- Check deployment status
- Redeploy if needed

---

## Database Issues

### Issue: Queries Running Slow

**Symptoms:**
- API calls take > 1 second
- Database CPU high
- Timeouts on queries

**Solutions:**

1. Analyze slow queries:
```sql
-- Use EXPLAIN ANALYZE
EXPLAIN ANALYZE
SELECT * FROM properties WHERE city = 'Nairobi';
```

2. Check for missing indexes:
```sql
-- Check existing indexes
SELECT * FROM pg_indexes WHERE tablename = 'properties';

-- Add missing indexes
CREATE INDEX idx_properties_city ON properties(city);
```

3. Optimize query structure:
- Use JOINs instead of subqueries
- Select only needed columns
- Use LIMIT for large result sets

4. Check database size:
- Monitor storage usage
- Archive old data if needed
- Consider partitioning large tables

---

### Issue: RLS Policy Blocking Access

**Symptoms:**
- Users can't access their own data
- Admins can't view all records
- Permission denied errors

**Solutions:**

1. Check current RLS policies:
```sql
-- View policies on table
SELECT * FROM pg_policies WHERE tablename = 'properties';
```

2. Test policy with different roles:
```sql
-- Test as authenticated user
SET ROLE authenticated;
SELECT * FROM properties WHERE owner_id = auth.uid();

-- Test as admin
SET ROLE postgres;
SELECT * FROM properties;
```

3. Fix policy logic:
```sql
-- Example fix for owner access
CREATE POLICY "Users can view own properties"
ON properties FOR SELECT
USING (auth.uid() = owner_id);

-- Example fix for admin access
CREATE POLICY "Admins can view all properties"
ON properties FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid() AND role = 'admin'
  )
);
```

4. Disable RLS temporarily for testing:
```sql
ALTER TABLE properties DISABLE ROW LEVEL SECURITY;
-- Test without RLS
ALTER TABLE properties ENABLE ROW LEVEL SECURITY;
```

---

### Issue: Database Migration Failed

**Symptoms:**
- Migration won't apply
- Error in SQL Editor
- Schema out of sync

**Solutions:**

1. Check migration syntax:
- Verify SQL is valid
- Check for syntax errors
- Test in development first

2. Check for dependencies:
- Ensure referenced tables exist
- Check for circular dependencies
- Apply migrations in correct order

3. Rollback and retry:
```sql
-- Rollback specific migration
-- Manually undo changes
-- Reapply migration
```

4. Check for data conflicts:
- Ensure data doesn't violate constraints
- Check for duplicate keys
- Verify foreign key constraints

---

## Authentication Issues

### Issue: User Cannot Sign In

**Symptoms:**
- Login fails with error
- Invalid credentials message
- Redirect loop

**Solutions:**

1. Check user credentials:
- Verify email format is correct
- Check password is correct
- Try password reset

2. Check user status:
```sql
-- Check if user is banned
SELECT is_banned, banned_reason FROM profiles WHERE email = 'user@example.com';

-- Check if email is confirmed
SELECT email_confirmed_at FROM auth.users WHERE email = 'user@example.com';
```

3. Check JWT settings:
- Verify token expiration
- Check refresh token configuration
- Ensure tokens are being passed correctly

4. Clear browser storage:
```javascript
// Clear local storage
localStorage.clear()
sessionStorage.clear()
```

---

### Issue: Session Expiring Too Quickly

**Symptoms:**
- Logged out frequently
- Session timeout errors
- Need to re-login often

**Solutions:**

1. Check JWT expiration:
```typescript
// Verify token expiration time
const decoded = jwt.decode(token)
console.log(decoded.exp)
```

2. Adjust token settings:
- Increase access token expiration
- Enable automatic refresh
- Configure refresh token expiration

3. Check token refresh logic:
```typescript
// Ensure refresh is working
supabase.auth.onAuthStateChange((event, session) => {
  if (event === 'TOKEN_REFRESHED') {
    console.log('Token refreshed')
  }
})
```

---

## Payment Issues

### Issue: Dodo Payment Failing

**Symptoms:**
- Payment redirect fails
- Webhook not received
- Payment status not updating

**Solutions:**

1. Check Dodo API credentials:
- Verify API key is correct
- Check secret key is valid
- Test credentials in Dodo dashboard

2. Check webhook configuration:
- Verify webhook URL is correct
- Check webhook secret matches
- Test webhook with Dodo's test tool

3. Check Edge Function logs:
- View function logs for errors
- Check for timeout errors
- Verify request/response format

4. Test payment flow manually:
- Use Dodo's test mode
- Simulate successful payment
- Verify webhook receives payload

---

### Issue: Wallet Payment Not Verifying

**Symptoms:**
- Payment stuck in "submitted" status
- Admin can't see proof image
- Payment verification fails

**Solutions:**

1. Check proof image upload:
- Verify image was uploaded to Storage
- Check image URL is accessible
- Verify image format is supported

2. Check payment record:
```sql
-- Check payment status
SELECT * FROM payments WHERE id = 'payment-id';

-- Verify proof image URL
SELECT proof_image FROM payments WHERE id = 'payment-id';
```

3. Check admin permissions:
- Verify admin has verification permission
- Check RLS policies allow access
- Test verification as super admin

4. Check RPC function:
```sql
-- Test RPC function directly
SELECT verify_payment('payment-id', 'admin-id');
```

---

## Real-time Issues

### Issue: Messages Not Updating in Real-time

**Symptoms:**
- New messages don't appear
- Need to refresh to see updates
- Subscription not working

**Solutions:**

1. Check subscription setup:
```typescript
// Verify subscription is active
const channel = supabase.channel('conversation-id')
  .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages' }, callback)
  .subscribe((status) => {
    console.log('Subscription status:', status)
  })
```

2. Check Realtime is enabled:
- Verify Realtime is enabled in Supabase
- Check table has Realtime enabled
- Enable Realtime for tables if needed

3. Check filter conditions:
```typescript
// Ensure filter is correct
.filter(`conversation_id=eq.${conversationId}`)
```

4. Check network connection:
- Verify stable internet connection
- Check for firewall blocking WebSocket
- Test with different network

---

### Issue: Presence Not Working

**Symptoms:**
- Online status not updating
- Typing indicators not showing
- Presence data missing

**Solutions:**

1. Check presence subscription:
```typescript
// Verify presence is tracked
const channel = supabase.channel('presence')
  .on('presence', { event: 'sync' }, () => {
    const state = channel.presenceState()
    console.log('Presence state:', state)
  })
  .subscribe()
```

2. Check presence tracking:
```typescript
// Track presence
channel.track({
  user_id: userId,
  online_at: new Date().toISOString()
})
```

3. Check Realtime configuration:
- Verify presence channels are enabled
- Check presence bucket size
- Monitor presence usage

---

## Performance Issues

### Issue: Slow Page Load

**Symptoms:**
- Initial load takes > 3 seconds
- Large bundle size
- Slow first paint

**Solutions:**

1. Analyze bundle size:
```bash
npm run build
# Check bundle size in output
```

2. Implement code splitting:
```typescript
// Lazy load components
const PropertyPage = lazy(() => import('./pages/PropertyPage'))
```

3. Optimize images:
- Compress images
- Use WebP format
- Implement lazy loading

4. Enable compression:
- Enable gzip/brotli compression
- Configure CDN
- Use caching headers

---

### Issue: Memory Leaks

**Symptoms:**
- Browser memory increases over time
- Application becomes slow
- Tab crashes

**Solutions:**

1. Check for unmounted subscriptions:
```typescript
useEffect(() => {
  const channel = supabase.channel(...)
    .subscribe()

  return () => {
    supabase.removeChannel(channel)
  }
}, [])
```

2. Check for event listeners:
```typescript
// Remove event listeners on unmount
useEffect(() => {
  const handler = () => {}
  window.addEventListener('resize', handler)
  return () => window.removeEventListener('resize', handler)
}, [])
```

3. Check for circular references:
- Avoid circular references in data
- Clean up references on unmount
- Use WeakMap/WeakSet for caches

---

## Deployment Issues

### Issue: Build Fails

**Symptoms:**
- npm run build fails
- TypeScript errors
- Missing dependencies

**Solutions:**

1. Check TypeScript errors:
```bash
npx tsc --noEmit
```

2. Check for missing dependencies:
```bash
npm install
# Check for peer dependency warnings
```

3. Check environment variables:
- Verify all required vars are set
- Check .env.production file
- Test build locally first

4. Clear cache:
```bash
rm -rf node_modules
rm -rf dist
npm install
npm run build
```

---

### Issue: Deployment Fails

**Symptoms:**
- Deploy to Vercel/Netlify fails
- Build succeeds but deploy fails
- Runtime errors after deploy

**Solutions:**

1. Check build logs:
- Review deployment logs
- Look for specific error messages
- Check for missing files

2. Check environment variables in platform:
- Verify vars are set in platform dashboard
- Check variable names match exactly
- Redeploy after changing vars

3. Check for platform-specific issues:
- Verify platform supports your stack
- Check for size limits
- Review platform documentation

4. Test locally with production config:
```bash
npm run build
npm run preview
```

---

## Development Issues

### Issue: TypeScript Errors

**Symptoms:**
- Type errors in IDE
- Build fails with TS errors
- Missing type definitions

**Solutions:**

1. Install type definitions:
```bash
npm install -D @types/node @types/react @types/react-dom
```

2. Fix type errors:
```typescript
// Add proper types
interface Property {
  id: string
  title: string
  price: number
}

const property: Property = { ... }
```

3. Check tsconfig.json:
- Verify compiler options
- Check include/exclude paths
- Ensure strict mode is configured correctly

---

### Issue: Hot Module Replacement Not Working

**Symptoms:**
- Changes not reflected without refresh
- HMR errors in console
- Slow updates

**Solutions:**

1. Check Vite configuration:
```typescript
export default defineConfig({
  server: {
    hmr: true,
    watch: {
      usePolling: true // Use on some systems
    }
  }
})
```

2. Check for file watchers:
- Increase file watcher limit (Linux/Mac)
- Check antivirus software interference
- Try disabling file watching

3. Clear Vite cache:
```bash
rm -rf node_modules/.vite
```

---

## Getting Help

### Internal Resources

1. Check documentation:
- Review this troubleshooting guide
- Check API documentation
- Review deployment guide

2. Check logs:
- Browser console logs
- Supabase dashboard logs
- Edge function logs
- Server logs

3. Check issue tracker:
- Review known issues
- Search for similar problems
- Check for existing solutions

### External Resources

1. Supabase Documentation: https://supabase.com/docs
2. React Documentation: https://react.dev
3. Vite Documentation: https://vitejs.dev
4. TypeScript Documentation: https://www.typescriptlang.org/docs

### Reporting Issues

When reporting issues, include:
- Steps to reproduce
- Expected behavior
- Actual behavior
- Error messages
- Environment details (OS, browser, versions)
- Screenshots if applicable

---

**Document Owner:** Development Team  
**Last Updated:** June 2, 2026  
**Next Review:** As needed
