# GuriGate Configuration Guide

**Version:** 1.0  
**Date:** June 2, 2026  
**Status:** Production

---

## Executive Summary

This guide covers all configuration aspects of the GuriGate application, including environment variables, Supabase settings, feature flags, and runtime configuration.

---

## Environment Variables

### Frontend Environment Variables

Create `.env` file in project root:

```env
# Supabase Configuration
VITE_SUPABASE_URL=https://your-project-ref.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here

# Application Configuration
VITE_APP_NAME=GuriGate
VITE_APP_URL=https://your-domain.com
VITE_APP_ENV=production

# Feature Flags
VITE_ENABLE_ANALYTICS=true
VITE_ENABLE_DEBUG_MODE=false
VITE_ENABLE_MOCK_DATA=false
```

### Backend Environment Variables (Supabase)

Configure in Supabase Dashboard → Edge Functions:

```env
# Dodo Payments
DODO_API_KEY=your-dodo-api-key
DODO_SECRET_KEY=your-dodo-secret-key
DODO_WEBHOOK_SECRET=your-webhook-secret

# Email Service (if using external)
SMTP_HOST=smtp.example.com
SMTP_PORT=587
SMTP_USER=your-email@example.com
SMTP_PASSWORD=your-password

# Analytics
ANALYTICS_KEY=your-analytics-key
```

---

## Supabase Configuration

### Database Configuration

**Connection Pooling:**
- Navigate to Database → Settings
- Configure connection pool size
- Default: 15 connections
- Adjust based on traffic

**Timezone:**
- Set database timezone to UTC
- Consistent with application timezone

**Locale:**
- Set to `en_US.UTF-8`
- Ensures consistent string handling

### Authentication Configuration

**JWT Settings:**
- Access token expiration: 3600 seconds (1 hour)
- Refresh token expiration: 2592000 seconds (30 days)
- Enable automatic token rotation

**Email Settings:**
- Email confirmation: Optional
- Password recovery: Enabled
- Email templates: Customizable

**Social Providers:**
- Enable Google, Facebook, Apple as needed
- Configure OAuth credentials
- Set redirect URLs

### Storage Configuration

**Buckets:**
- `property-images` - Public read, authenticated write
- `avatars` - Private, authenticated read/write
- `payment-proofs` - Private, admin read/write

**CDN:**
- Enable CDN for faster image delivery
- Configure cache rules
- Set up custom domain

### API Configuration

**Rate Limiting:**
- Free tier: 500 requests/hour
- Pro tier: 100,000 requests/hour
- Configure based on expected traffic

**CORS:**
- Allow specific origins
- Configure allowed methods
- Set allowed headers

---

## Feature Flags

### Frontend Feature Flags

```typescript
// src/config/featureFlags.ts
export const FEATURE_FLAGS = {
  ENABLE_ANALYTICS: import.meta.env.VITE_ENABLE_ANALYTICS === 'true',
  ENABLE_DEBUG_MODE: import.meta.env.VITE_ENABLE_DEBUG_MODE === 'true',
  ENABLE_MOCK_DATA: import.meta.env.VITE_ENABLE_MOCK_DATA === 'true',
  ENABLE_MESSAGING: true,
  ENABLE_PAYMENTS: true,
  ENABLE_RMS: false, // Not yet implemented
  ENABLE_SOCIAL_LOGIN: false,
  ENABLE_MULTI_LANGUAGE: true,
}
```

### Backend Feature Flags

Configure in database or environment:

```sql
-- Feature flags table (optional)
CREATE TABLE feature_flags (
  key TEXT PRIMARY KEY,
  enabled BOOLEAN DEFAULT false,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

INSERT INTO feature_flags (key, enabled, description) VALUES
('enable_messaging', true, 'Enable messaging system'),
('enable_payments', true, 'Enable payment processing'),
('enable_rms', false, 'Enable rental management system'),
('enable_social_login', false, 'Enable social login providers');
```

---

## Application Configuration

### Theme Configuration

```typescript
// src/config/theme.ts
export const THEME = {
  colors: {
    primary: '#3B82F6',
    secondary: '#10B981',
    accent: '#F59E0B',
    danger: '#EF4444',
    warning: '#F59E0B',
    success: '#10B981',
    info: '#3B82F6',
  },
  fonts: {
    primary: 'Inter, sans-serif',
    secondary: 'Roboto, sans-serif',
  },
  breakpoints: {
    sm: '640px',
    md: '768px',
    lg: '1024px',
    xl: '1280px',
  },
}
```

### Currency Configuration

```typescript
// src/config/currency.ts
export const CURRENCIES = {
  USD: { symbol: '$', code: 'USD', locale: 'en-US' },
  EUR: { symbol: '€', code: 'EUR', locale: 'de-DE' },
  GBP: { symbol: '£', code: 'GBP', locale: 'en-GB' },
  SOS: { symbol: 'S', code: 'SOS', locale: 'so-SO' },
}

export const DEFAULT_CURRENCY = 'USD'
```

### Language Configuration

```typescript
// src/config/language.ts
export const LANGUAGES = {
  en: { name: 'English', code: 'en', locale: 'en-US' },
  so: { name: 'Somali', code: 'so', locale: 'so-SO' },
  ar: { name: 'Arabic', code: 'ar', locale: 'ar-SA' },
}

export const DEFAULT_LANGUAGE = 'en'
```

---

## Payment Configuration

### Dodo Payments

**Configuration:**
```typescript
// src/config/payments.ts
export const DODO_CONFIG = {
  apiKey: process.env.DODO_API_KEY,
  secretKey: process.env.DODO_SECRET_KEY,
  webhookSecret: process.env.DODO_WEBHOOK_SECRET,
  apiUrl: 'https://api.dodo.com/v1',
  returnUrl: `${process.env.VITE_APP_URL}/payment/complete`,
  cancelUrl: `${process.env.VITE_APP_URL}/payment/cancel`,
}
```

### Local Wallets

**Configuration:**
```typescript
export const WALLET_PROVIDERS = {
  zaad: {
    name: 'Zaad',
    phoneFormat: '+252XXXXXXXX',
    verificationRequired: true,
  },
  edahab: {
    name: 'eDahab',
    phoneFormat: '+252XXXXXXXX',
    verificationRequired: true,
  },
  premier: {
    name: 'Premier Wallet',
    phoneFormat: '+252XXXXXXXX',
    verificationRequired: true,
  },
  wadaag: {
    name: 'Wadaag Pay',
    phoneFormat: '+252XXXXXXXX',
    verificationRequired: true,
  },
}
```

---

## Notification Configuration

### Email Notifications

**Configuration:**
```typescript
export const EMAIL_CONFIG = {
  enabled: true,
  from: 'noreply@gurigate.com',
  replyTo: 'support@gurigate.com',
  templates: {
    bookingConfirmation: 'booking-confirmation',
    paymentVerified: 'payment-verified',
    propertyApproved: 'property-approved',
    propertyRejected: 'property-rejected',
    welcomeEmail: 'welcome-email',
  },
}
```

### Notification Types

```typescript
export const NOTIFICATION_TYPES = {
  BOOKING_CONFIRMED: 'booking_confirmed',
  PAYMENT_VERIFIED: 'payment_verified',
  PAYMENT_REJECTED: 'payment_rejected',
  PROPERTY_APPROVED: 'property_approved',
  PROPERTY_REJECTED: 'property_rejected',
  NEW_MESSAGE: 'new_message',
  ACCOUNT_BANNED: 'account_banned',
  HOST_VERIFIED: 'host_verified',
}
```

---

## Role Configuration

### Role Hierarchy

```typescript
export const ROLE_HIERARCHY = {
  super_admin: 5,
  admin: 4,
  manager: 3,
  host: 2,
  guest: 1,
}
```

### Role Permissions

```typescript
export const ROLE_PERMISSIONS = {
  guest: [
    'view_properties',
    'create_bookings',
    'send_messages',
    'manage_profile',
  ],
  host: [
    'view_properties',
    'create_bookings',
    'send_messages',
    'manage_profile',
    'manage_properties',
    'view_own_bookings',
  ],
  manager: [
    // All host permissions
    'manage_customers',
    'create_contracts',
    'view_all_properties',
  ],
  admin: [
    // All manager permissions
    'approve_properties',
    'reject_properties',
    'verify_payments',
    'ban_users',
    'view_audit_logs',
  ],
  super_admin: [
    // All admin permissions
    'modify_admin_roles',
    'platform_configuration',
  ],
}
```

---

## Validation Configuration

### Property Validation

```typescript
export const PROPERTY_VALIDATION = {
  title: {
    minLength: 10,
    maxLength: 100,
    required: true,
  },
  description: {
    minLength: 50,
    maxLength: 2000,
    required: true,
  },
  images: {
    minCount: 1,
    maxCount: 20,
    maxSize: 5 * 1024 * 1024, // 5MB
    allowedTypes: ['image/jpeg', 'image/png', 'image/webp'],
  },
  pricing: {
    minNightlyRate: 10,
    maxNightlyRate: 10000,
    required: true,
  },
}
```

### User Validation

```typescript
export const USER_VALIDATION = {
  email: {
    required: true,
    pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  },
  password: {
    minLength: 8,
    required: true,
  },
  phone: {
    pattern: /^\+?[1-9]\d{1,14}$/,
    required: false,
  },
}
```

---

## Rate Limiting Configuration

```typescript
export const RATE_LIMITS = {
  api: {
    requestsPerHour: 1000,
    burst: 100,
  },
  auth: {
    loginAttempts: 5,
    lockoutDuration: 15 * 60 * 1000, // 15 minutes
  },
  messaging: {
    messagesPerMinute: 10,
    messagesPerHour: 100,
  },
}
```

---

## Logging Configuration

### Frontend Logging

```typescript
export const LOGGING_CONFIG = {
  level: process.env.VITE_APP_ENV === 'production' ? 'error' : 'debug',
  enableConsole: process.env.VITE_ENABLE_DEBUG_MODE === 'true',
  enableRemote: process.env.VITE_ENABLE_ANALYTICS === 'true',
}
```

### Backend Logging

Configure in Supabase:
- Enable query logging
- Set log retention period
- Configure log export (optional)

---

## Cache Configuration

```typescript
export const CACHE_CONFIG = {
  properties: {
    ttl: 5 * 60 * 1000, // 5 minutes
    maxSize: 100,
  },
  userProfiles: {
    ttl: 10 * 60 * 1000, // 10 minutes
    maxSize: 50,
  },
  searchResults: {
    ttl: 2 * 60 * 1000, // 2 minutes
    maxSize: 200,
  },
}
```

---

## Security Configuration

### Session Configuration

```typescript
export const SESSION_CONFIG = {
  accessTokenExpiry: 3600, // 1 hour
  refreshTokenExpiry: 2592000, // 30 days
  automaticRefresh: true,
  refreshThreshold: 300, // Refresh 5 minutes before expiry
}
```

### Password Policy

```typescript
export const PASSWORD_POLICY = {
  minLength: 8,
  requireUppercase: false,
  requireLowercase: false,
  requireNumbers: false,
  requireSpecialChars: false,
  preventCommonPasswords: true,
}
```

---

## File Upload Configuration

```typescript
export const FILE_UPLOAD_CONFIG = {
  propertyImages: {
    maxSize: 5 * 1024 * 1024, // 5MB
    allowedTypes: ['image/jpeg', 'image/png', 'image/webp'],
    maxCount: 20,
    bucket: 'property-images',
  },
  avatars: {
    maxSize: 2 * 1024 * 1024, // 2MB
    allowedTypes: ['image/jpeg', 'image/png', 'image/webp'],
    maxCount: 1,
    bucket: 'avatars',
  },
  paymentProofs: {
    maxSize: 3 * 1024 * 1024, // 3MB
    allowedTypes: ['image/jpeg', 'image/png', 'application/pdf'],
    maxCount: 5,
    bucket: 'payment-proofs',
  },
}
```

---

## Search Configuration

```typescript
export const SEARCH_CONFIG = {
  maxResults: 50,
  defaultPageSize: 20,
  searchFields: [
    'title',
    'description',
    'city',
    'country',
  ],
  sortOptions: [
    { value: 'relevance', label: 'Relevance' },
    { value: 'price_asc', label: 'Price: Low to High' },
    { value: 'price_desc', label: 'Price: High to Low' },
    { value: 'rating', label: 'Rating' },
    { value: 'newest', label: 'Newest' },
  ],
}
```

---

## Booking Configuration

```typescript
export const BOOKING_CONFIG = {
  minNights: 1,
  maxNights: 30,
  maxGuests: 16,
  advanceBookingDays: 365,
  cancellationPolicy: {
    fullRefundHours: 24,
    partialRefundHours: 48,
  },
  serviceFeePercentage: 10,
  cleaningFeeRange: [20, 100],
}
```

---

## Analytics Configuration

```typescript
export const ANALYTICS_CONFIG = {
  enabled: process.env.VITE_ENABLE_ANALYTICS === 'true',
  provider: 'google-analytics', // or 'mixpanel', 'amplitude'
  trackingId: process.env.ANALYTICS_KEY,
  events: {
    pageView: 'page_view',
    propertyView: 'property_view',
    bookingCreated: 'booking_created',
    paymentCompleted: 'payment_completed',
    userSignup: 'user_signup',
  },
}
```

---

## Development Configuration

### Hot Reload

```typescript
export const DEV_CONFIG = {
  hotReload: true,
  apiMocking: process.env.VITE_ENABLE_MOCK_DATA === 'true',
  debugMode: process.env.VITE_ENABLE_DEBUG_MODE === 'true',
}
```

### Local Development

```bash
# .env.development
VITE_SUPABASE_URL=http://localhost:54321
VITE_SUPABASE_ANON_KEY=your-local-anon-key
VITE_APP_ENV=development
VITE_ENABLE_DEBUG_MODE=true
VITE_ENABLE_MOCK_DATA=true
```

---

## Testing Configuration

```typescript
export const TEST_CONFIG = {
  enabled: true,
  coverageThreshold: 80,
  testEnvironment: 'jsdom',
  setupFiles: ['./src/test/setup.ts'],
}
```

---

**Document Owner:** Development Team  
**Last Updated:** June 2, 2026  
**Next Review:** After configuration changes
