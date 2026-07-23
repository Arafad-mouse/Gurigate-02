# GuriGate Performance Guide

**Version:** 1.0  
**Date:** June 2, 2026  
**Status:** Production

---

## Executive Summary

This guide covers performance optimization strategies, monitoring, and best practices for the GuriGate application. Performance is critical for user experience and platform scalability.

**Current Performance Status:** Good  
**Target Response Time:** < 500ms for API calls, < 2s for page loads  
**Monitoring:** Manual (needs automation)

---

## Performance Metrics

### Key Performance Indicators

- **First Contentful Paint (FCP):** < 1.5s
- **Largest Contentful Paint (LCP):** < 2.5s
- **Time to Interactive (TTI):** < 3.5s
- **Cumulative Layout Shift (CLS):** < 0.1
- **First Input Delay (FID):** < 100ms
- **API Response Time:** < 500ms (p95)
- **Database Query Time:** < 100ms (p95)

---

## Frontend Performance

### Code Splitting

**Dynamic Imports:**

```typescript
// Lazy load heavy components
const PropertyPage = lazy(() => import('./pages/PropertyPage'))
const AdminDashboard = lazy(() => import('./pages/admin/AdminDashboard'))

// Route-based splitting
<Suspense fallback={<Loading />}>
  <Routes>
    <Route path="/property/:id" element={<PropertyPage />} />
    <Route path="/admin/dashboard" element={<AdminDashboard />} />
  </Routes>
</Suspense>
```

### Bundle Optimization

**Vite Configuration:**

```typescript
// vite.config.ts
export default defineConfig({
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom', 'react-router-dom'],
          ui: ['lucide-react', 'clsx', 'tailwind-merge'],
          supabase: ['@supabase/supabase-js'],
        },
      },
    },
    chunkSizeWarningLimit: 1000,
  },
})
```

### Image Optimization

**Strategies:**

- Use WebP format for images
- Implement lazy loading for images below fold
- Serve responsive images with srcset
- Use CDN for image delivery
- Compress images before upload

**Implementation:**

```typescript
import { lazyLoadImage } from '@/lib/image-optimization'

<img
  src={property.image}
  loading="lazy"
  decoding="async"
  width={800}
  height={600}
  alt={property.title}
/>
```

### Caching Strategy

**Browser Caching:**

```typescript
// Service worker for caching
const CACHE_NAME = 'gurigate-v1'
const urlsToCache = ['/', '/manifest.json']

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(urlsToCache))
  )
})
```

**API Response Caching:**

```typescript
// Cache API responses
const cache = new Map()

async function fetchWithCache(key, fetcher, ttl = 5 * 60 * 1000) {
  const cached = cache.get(key)
  if (cached && Date.now() - cached.timestamp < ttl) {
    return cached.data
  }
  
  const data = await fetcher()
  cache.set(key, { data, timestamp: Date.now() })
  return data
}
```

### React Performance

**Memoization:**

```typescript
// Use memo for expensive components
const PropertyCard = memo(({ property }) => {
  return <div>{/* component content */}</div>
})

// Use callback for event handlers
const handleLike = useCallback((propertyId) => {
  onLike(propertyId)
}, [onLike])

// Use memo for expensive calculations
const sortedProperties = useMemo(() => {
  return properties.sort((a, b) => a.rating - b.rating)
}, [properties])
```

**Virtual Scrolling:**

```typescript
// For long lists
import { FixedSizeList } from 'react-window'

<FixedSizeList
  height={600}
  itemCount={properties.length}
  itemSize={200}
  width="100%"
>
  {({ index, style }) => (
    <div style={style}>
      <PropertyCard property={properties[index]} />
    </div>
  )}
</FixedSizeList>
```

---

## Database Performance

### Indexing Strategy

**Current Indexes:**

```sql
-- Properties table indexes
CREATE INDEX idx_properties_owner ON properties(owner_id);
CREATE INDEX idx_properties_status ON properties(approval_status);
CREATE INDEX idx_properties_location ON properties(city, country);
CREATE INDEX idx_properties_created ON properties(created_at DESC);

-- Bookings table indexes
CREATE INDEX idx_bookings_property ON bookings(property_id);
CREATE INDEX idx_bookings_user ON bookings(user_id);
CREATE INDEX idx_bookings_dates ON bookings(check_in, check_out);
CREATE INDEX idx_bookings_status ON bookings(status);

-- Messages table indexes
CREATE INDEX idx_messages_conversation ON messages(conversation_id);
CREATE INDEX idx_messages_created ON messages(created_at DESC);
CREATE INDEX idx_messages_sender ON messages(sender_id);
```

**Recommended Additional Indexes:**

```sql
-- Composite indexes for common queries
CREATE INDEX idx_properties_status_location 
  ON properties(approval_status, city) 
  WHERE approval_status = 'approved';

CREATE INDEX idx_bookings_property_dates 
  ON bookings(property_id, check_in, check_out);

-- Full-text search index
CREATE INDEX idx_properties_search 
  ON properties USING gin(to_tsvector('english', title || ' ' || description));
```

### Query Optimization

**Avoid N+1 Queries:**

```sql
-- Bad: N+1 queries
SELECT * FROM properties WHERE owner_id = 'user-id';
-- Then for each property:
SELECT * FROM property_images WHERE property_id = 'property-id';

-- Good: Single query with joins
SELECT 
  p.*,
  json_agg(pi) as images
FROM properties p
LEFT JOIN property_images pi ON p.id = pi.property_id
WHERE p.owner_id = 'user-id'
GROUP BY p.id;
```

**Use Appropriate Data Types:**

```sql
-- Use UUID for primary keys
id UUID PRIMARY KEY DEFAULT gen_random_uuid()

-- Use appropriate numeric types
price DECIMAL(10, 2) -- Not VARCHAR

-- Use boolean for flags
is_published BOOLEAN -- Not INTEGER with 0/1

-- Use arrays for simple lists
amenities TEXT[] -- Not separate table for simple cases
```

### Connection Pooling

**Supabase Configuration:**

- Default pool size: 15 connections
- Adjust based on traffic
- Monitor pool usage in dashboard

### Query Performance Monitoring

**Enable Query Logging:**

```sql
-- Log slow queries
ALTER DATABASE your_database SET log_min_duration_statement = 100;
```

**Analyze Slow Queries:**

```sql
-- Use EXPLAIN ANALYZE
EXPLAIN ANALYZE
SELECT * FROM properties 
WHERE city = 'Nairobi' 
  AND approval_status = 'approved';
```

---

## API Performance

### Response Compression

**Supabase Configuration:**

- Supabase automatically compresses API responses
- Enable gzip compression in hosting settings

### Pagination

**Implement Pagination:**

```typescript
async function getProperties(page = 1, limit = 20) {
  const from = (page - 1) * limit
  const to = from + limit - 1
  
  const { data } = await supabase
    .from('properties')
    .select('*')
    .range(from, to)
  
  return data
}
```

### Batch Operations

**Batch Fetching:**

```typescript
// Bad: Multiple requests
const property = await getProperty(id)
const images = await getPropertyImages(id)
const reviews = await getPropertyReviews(id)

// Good: Single request
const { data } = await supabase
  .from('properties')
  .select(`
    *,
    property_images (*),
    property_reviews (*)
  `)
  .eq('id', id)
  .single()
```

### Rate Limiting

**Implement Rate Limiting:**

```typescript
// Client-side rate limiting
const rateLimiter = {
  requests: [],
  maxRequests: 100,
  window: 60000, // 1 minute

  canMakeRequest() {
    const now = Date.now()
    this.requests = this.requests.filter(t => now - t < this.window)
    return this.requests.length < this.maxRequests
  },

  recordRequest() {
    this.requests.push(Date.now())
  }
}
```

---

## Real-time Performance

### Subscription Optimization

**Subscribe Only to Needed Data:**

```typescript
// Bad: Subscribe to entire table
supabase
  .channel('all-messages')
  .on('postgres_changes', { event: '*', schema: 'public', table: 'messages' }, callback)
  .subscribe()

// Good: Subscribe to specific conversation
supabase
  .channel(`conversation-${conversationId}`)
  .on('postgres_changes', { 
    event: '*', 
    schema: 'public', 
    table: 'messages',
    filter: `conversation_id=eq.${conversationId}`
  }, callback)
  .subscribe()
```

### Presence Optimization

**Limit Presence Data:**

```typescript
// Minimize presence payload
const presence = {
  user_id: userId,
  status: 'online',
  last_seen: new Date().toISOString()
}
```

### Unsubscribe on Unmount

```typescript
useEffect(() => {
  const channel = supabase.channel(...)
    .on(...)
    .subscribe()

  return () => {
    supabase.removeChannel(channel)
  }
}, [])
```

---

## Storage Performance

### Image Optimization

**Before Upload:**

```typescript
// Compress images before upload
async function compressImage(file: File, quality = 0.8) {
  return new Promise((resolve) => {
    const img = new Image()
    img.src = URL.createObjectURL(file)
    img.onload = () => {
      const canvas = document.createElement('canvas')
      const ctx = canvas.getContext('2d')
      canvas.width = img.width
      canvas.height = img.height
      ctx.drawImage(img, 0, 0)
      canvas.toBlob(resolve, 'image/jpeg', quality)
    }
  })
}
```

### CDN Configuration

**Supabase CDN:**

- Enable CDN for storage buckets
- Configure cache headers
- Use image transformation API

**Example:**

```typescript
// Use CDN URL
const cdnUrl = `${supabaseUrl}/storage/v1/render/image/public/property-images/${imageId}?width=800&quality=80`
```

---

## Monitoring and Analytics

### Performance Monitoring

**Tools:**

- Lighthouse for page performance
- Supabase dashboard for database metrics
- Custom logging for API performance

**Implementation:**

```typescript
// Performance tracking
export function trackPerformance(name: string, fn: () => Promise<any>) {
  return async (...args: any[]) => {
    const start = performance.now()
    try {
      const result = await fn(...args)
      const duration = performance.now() - start
      
      if (duration > 1000) {
        console.warn(`Slow operation: ${name} took ${duration}ms`)
      }
      
      return result
    } catch (error) {
      const duration = performance.now() - start
      console.error(`Failed operation: ${name} after ${duration}ms`, error)
      throw error
    }
  }
}
```

### Error Tracking

**Implementation:**

```typescript
// Error boundary with performance tracking
class PerformanceErrorBoundary extends React.Component {
  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Error caught:', error)
    console.error('Component stack:', errorInfo.componentStack)
    // Send to error tracking service
  }
}
```

---

## Performance Budgets

### Bundle Size Budgets

```typescript
// vite.config.ts
export default defineConfig({
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            return 'vendor'
          }
        },
      },
    },
  },
})
```

**Target Sizes:**
- Main bundle: < 200KB gzipped
- Vendor bundle: < 300KB gzipped
- Total initial load: < 500KB gzipped

### Image Size Budgets

- Property images: < 500KB each
- Avatar images: < 100KB each
- Payment proof images: < 300KB each

---

## Performance Testing

### Load Testing

**k6 Script:**

```javascript
import http from 'k6/http'
import { check, sleep } from 'k6'

export let options = {
  stages: [
    { duration: '2m', target: 100 },
    { duration: '5m', target: 500 },
    { duration: '2m', target: 0 },
  ],
}

export default function () {
  const response = http.get('https://api.gurigate.com/rest/v1/properties')
  check(response, {
    'status is 200': (r) => r.status === 200,
    'response time < 500ms': (r) => r.timings.duration < 500,
  })
  sleep(1)
}
```

### Performance Profiling

**React Profiler:**

```typescript
import { Profiler } from 'react'

<Profiler id="PropertyPage" onRender={onRenderCallback}>
  <PropertyPage />
</Profiler>

function onRenderCallback(id, phase, actualDuration) {
  console.log(`${id} ${phase} took ${actualDuration}ms`)
}
```

---

## Common Performance Issues

### Issue: Slow Property Search

**Symptoms:** Property search takes > 1 second

**Solutions:**
- Add composite index on status and location
- Implement search result caching
- Use full-text search with proper indexing
- Limit result set size

### Issue: Slow Message Loading

**Symptoms:** Messages take long to load

**Solutions:**
- Implement pagination for messages
- Add index on conversation_id and created_at
- Use cursor-based pagination for large conversations
- Cache recent messages

### Issue: Large Bundle Size

**Symptoms:** Initial load > 3 seconds

**Solutions:**
- Implement code splitting
- Lazy load non-critical components
- Use tree shaking
- Remove unused dependencies

### Issue: Slow Image Loading

**Symptoms:** Images take long to load

**Solutions:**
- Compress images before upload
- Use WebP format
- Implement lazy loading
- Use CDN with image optimization
- Implement progressive loading

---

## Performance Checklist

### Frontend

- Code splitting implemented
- Images optimized and lazy loaded
- Bundle size monitored
- Caching strategy implemented
- React components memoized
- Virtual scrolling for long lists

### Backend

- Database indexes optimized
- Queries analyzed and optimized
- Connection pooling configured
- Query caching implemented
- Batch operations used
- N+1 queries eliminated

### API

- Response compression enabled
- Pagination implemented
- Rate limiting configured
- Batch operations used
- Error handling optimized

### Real-time

- Subscriptions optimized
- Presence data minimized
- Unsubscribe on unmount
- Channel management optimized

### Storage

- Images compressed before upload
- CDN configured
- Cache headers set
- Image transformation used

---

**Document Owner:** Development Team  
**Last Updated:** June 2, 2026  
**Next Review:** Quarterly
