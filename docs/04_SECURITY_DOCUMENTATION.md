# GuriGate Security Documentation

**Version:** 1.0  
**Date:** June 2, 2026  
**Status:** Production

---

## Executive Summary

GuriGate implements a comprehensive security architecture including authentication via Supabase Auth, Row-Level Security (RLS) policies for database access control, role-based access control (RBAC), and audit logging for admin operations. Critical security vulnerabilities were identified and resolved in May 2026.

**Security Posture:** Secure (post-fixes)  
**Last Security Audit:** June 2, 2026  
**Critical Vulnerabilities:** Resolved

---

## Authentication

### Authentication Flow

**Provider:** Supabase Auth  
**Method:** Email/Password  
**Session Management:** JWT tokens with automatic refresh

**Flow:**
1. User submits email/password
2. Supabase validates credentials
3. JWT access token and refresh token issued
4. Client stores tokens securely
5. Access token included in API requests
6. Refresh token used to obtain new access token

### Session Management

**Access Token:**
- Lifetime: 1 hour (configurable)
- Included in Authorization header
- Required for all authenticated requests

**Refresh Token:**
- Lifetime: 30 days (configurable)
- Used to obtain new access tokens
- Stored securely on client

**Token Storage:**
- Frontend: In-memory or secure storage
- Never stored in localStorage/sessionStorage for sensitive data
- HttpOnly cookies recommended for production

### Password Security

**Password Requirements:**
- Minimum 8 characters
- No complexity enforcement currently (planned enhancement)

**Password Storage:**
- Supabase handles password hashing (bcrypt)
- Passwords never stored in plain text
- Salt-based hashing for security

### Account Recovery

**Current Implementation:**
- Email-based password reset
- Reset link sent to registered email
- Reset link expires after configurable time

**Planned Enhancements:**
- Multi-factor authentication (MFA)
- Social login (Google, Facebook, Apple)
- Security questions
- Account recovery with additional verification

---

## Authorization

### Role-Based Access Control (RBAC)

**User Roles:**
- **guest** - Basic guest access
- **host** - Property owner access
- **manager** - Building/property manager access
- **admin** - Full administrative access
- **super_admin** - Platform owner access

**Role Hierarchy:**
```
super_admin
    └── admin
        └── manager
            └── host
                └── guest
```

### Permission System

**Permission Categories:**
- Property permissions (view, approve, reject, suspend, feature)
- User permissions (view, ban, unban, verify, modify roles)
- Payment permissions (view, verify, reject, refund, view reports)
- Booking permissions (view, cancel, resolve disputes, modify dates)
- System permissions (audit logs, notifications, dashboard)
- Messaging permissions (view, send, manage, delete, internal notes)

**Permission Implementation:**
- Defined in `src/lib/permissions.ts`
- Role-based default permissions
- User-specific permissions via JSONB field
- Permission checks via `usePermissions` hook

**Example Permission Check:**
```typescript
import { usePermissions } from '@/hooks/usePermissions'

function PropertyActions() {
  const { canApproveProperty } = usePermissions()
  
  if (!canApproveProperty()) {
    return null // Hide action
  }
  
  return <ApproveButton />
}
```

### Route Guards

**Protected Routes:**
- `/manage-property` - Requires host role or higher
- `/admin/*` - Requires admin role
- `/manage-property/customers` - Requires manager role or higher

**Implementation:**
- `ProtectedAdminRoute` component
- Checks user role before rendering
- Redirects unauthorized users

---

## Row-Level Security (RLS)

### RLS Overview

**Purpose:** Database-level access control  
**Implementation:** PostgreSQL RLS policies  
**Scope:** All tables in public schema

### Property Table RLS

**Public Access:**
- SELECT only approved and available properties
- No INSERT/UPDATE/DELETE

**Authenticated Access:**
- SELECT approved properties + own properties
- INSERT/UPDATE own properties only

**Admin Access:**
- Full CRUD on all properties

**Policy Example:**
```sql
CREATE POLICY "Public users can view approved available properties"
  ON properties
  FOR SELECT
  TO anon
  USING (
    is_approved = TRUE 
    AND status = 'available'
  );
```

### Booking Table RLS

**Public Access:**
- No access

**Authenticated Access:**
- SELECT own bookings (as guest or host)
- INSERT own bookings
- UPDATE own bookings

**Admin Access:**
- Full CRUD on all bookings

### Payment Table RLS

**Public Access:**
- No access

**Authenticated Access:**
- SELECT own payments (as payer or payee)
- INSERT own payments

**Admin Access:**
- Full CRUD on all payments

### Messaging Table RLS

**Public Access:**
- No access

**Authenticated Access:**
- SELECT conversations they participate in
- SELECT messages in their conversations
- INSERT messages in their conversations

**Admin Access:**
- Full CRUD on all conversations and messages

**Property Owner Access:**
- SELECT conversations for their properties
- SELECT messages in property conversations

---

## Audit Logging

### Audit Log Table

**Table:** `admin_audit_logs`

**Logged Operations:**
- Property approval/rejection/suspension
- Payment verification
- User ban/unban
- Host verification
- Role modifications
- Any admin data modifications

**Audit Record Structure:**
- `admin_id` - Who performed the action
- `action` - Action performed
- `entity_type` - Type of entity affected
- `entity_id` - ID of affected entity
- `old_values` - Previous state (JSONB)
- `new_values` - New state (JSONB)
- `reason` - Reason for action
- `ip_address` - IP address of request
- `created_at` - Timestamp

### Audit Triggers

All admin RPC functions automatically create audit log entries:
- `approve_property`
- `reject_property`
- `suspend_property`
- `verify_payment`
- `ban_user`
- `unban_user`
- `verify_host`

---

## Data Protection

### Sensitive Data

**Personally Identifiable Information (PII):**
- Email addresses (profiles.email)
- Phone numbers (wallet_phone, emergency contacts)
- Names (first_name, last_name)
- Payment information (limited)

**Financial Data:**
- Payment amounts
- Transaction references
- Wallet phone numbers (masked)

**Current Protection:**
- RLS policies limit access
- Admin operations logged
- No PII in logs

**Planned Enhancements:**
- PII encryption at rest
- Data anonymization for analytics
- GDPR compliance tools
- Data retention policies

### Soft Deletes

**Implementation:**
- `deleted_at` timestamp on major tables
- `deleted_by` reference to admin
- RLS policies filter out deleted records
- Data recoverable within retention period

**Tables with Soft Delete:**
- properties
- bookings
- payments
- profiles
- conversations
- messages

---

## Security Fixes (May 2026)

### Critical Vulnerabilities Resolved

**Issue 1: Public Table Access**
- **Problem:** Tables were publicly accessible with `USING (true)` policies
- **Impact:** Anyone could read, edit, delete all data
- **Resolution:** Removed overly permissive policies, implemented proper access controls
- **Migration:** `20260506_security_fixes_final.sql`

**Issue 2: Sensitive Data Exposure**
- **Problem:** Personal identifiers and sensitive information accessible without restrictions
- **Impact:** Data breach risk
- **Resolution:** Protected sensitive data with role-based RLS policies
- **Status:** Resolved

### Security Improvements Applied

**Before Fixes:**
- `USING (true)` policies allowed public access
- No restrictions on sensitive columns
- Anyone could read, edit, delete any table

**After Fixes:**
- Public users: Can only view approved, available properties
- Authenticated users: Can view approved properties + manage their own data
- Property owners: Full control over their properties only
- Sensitive data: Bookings, wishlists, and user data properly protected

---

## API Security

### Authentication Headers

**Required Headers:**
```
Authorization: Bearer {access_token}
apikey: {public_anon_key}
```

### Rate Limiting

**Current:** Supabase default limits
- Free tier: 500 requests/hour
- Pro tier: 100,000 requests/hour

**Planned:**
- Application-level rate limiting
- Per-user rate limiting
- IP-based rate limiting
- DDoS protection

### Input Validation

**Frontend Validation:**
- Form validation on all inputs
- Type checking with TypeScript
- Phone number format validation
- Email format validation

**Backend Validation:**
- Supabase RLS policies
- Database constraints
- RPC function parameter validation
- SQL injection prevention (parameterized queries)

### CORS Configuration

**Current:** Supabase default CORS
- Allows requests from configured origins
- Configured in Supabase dashboard

**Recommendation:**
- Restrict to specific domains
- Disable CORS for admin endpoints
- Implement CORS middleware for custom endpoints

---

## Security Best Practices

### Current Implementation

**Strengths:**
- Comprehensive RLS policies
- Audit logging for admin operations
- JWT-based authentication
- Role-based access control
- Soft delete functionality

**Weaknesses:**
- No MFA implementation
- No social login
- No password complexity enforcement
- No session timeout
- Limited input sanitization
- Console.log statements in production

### Recommended Enhancements

**Immediate Priority:**
1. Remove console.log statements from production
2. Add comprehensive input validation
3. Implement rate limiting
4. Add error boundary components

**Short-term Priority:**
1. Implement MFA
2. Add social login
3. Enforce password complexity
4. Add session timeout
5. Implement PII encryption

**Long-term Priority:**
1. GDPR compliance tools
2. Data anonymization features
3. Audit log archival
4. Data retention policies
5. Advanced threat detection

---

## Incident Response

### Security Incident Response Plan

**Detection:**
- Monitor audit logs regularly
- Set up alerts for suspicious activity
- Review admin actions
- Monitor failed login attempts

**Response Steps:**
1. Identify affected users/data
2. Contain the breach
3. Notify affected users
4. Investigate root cause
5. Implement fixes
6. Document incident
7. Update security measures

**Contact Information:**
- Security Team: [to be defined]
- Emergency Contact: [to be defined]

---

## Compliance

### Current Compliance Status

**GDPR:** Partially compliant
- Data access controls in place
- Right to deletion (soft delete)
- Audit logging
- Missing: Data portability, consent management

**SOC 2:** Not compliant
- Missing: Access reviews, change management, vendor management

**PCI DSS:** Not applicable (payment processing via third-party)

### Planned Compliance Enhancements

**GDPR:**
- Implement consent management
- Data portability features
- Data processing agreements
- Privacy policy updates
- Data protection officer designation

**SOC 2:**
- Implement access reviews
- Change management processes
- Vendor management
- Incident response procedures
- Security awareness training

---

## Security Monitoring

### Current Monitoring

**Supabase Dashboard:**
- Database query logs
- Auth logs
- Storage access logs
- Real-time metrics

**Application Monitoring:**
- Basic error logging
- Console.log statements (to be removed)

### Planned Monitoring

**Application Performance Monitoring (APM):**
- Request tracking
- Performance metrics
- Error tracking
- User journey monitoring

**Security Monitoring:**
- Intrusion detection
- Anomaly detection
- Threat intelligence
- Security analytics

**Log Aggregation:**
- Centralized logging (ELK stack)
- Log retention policies
- Log analysis tools
- Alert configuration

---

## Security Testing

### Current Testing

**Security Reviews:**
- Manual code reviews
- RLS policy testing
- Access control testing

**No Automated Testing:**
- No security scanners
- No penetration testing
- No vulnerability scanning

### Planned Testing

**Automated Security Testing:**
- Dependency vulnerability scanning
- Static application security testing (SAST)
- Dynamic application security testing (DAST)
- Infrastructure as code scanning

**Manual Testing:**
- Regular penetration testing
- Security audits
- Threat modeling
- Red team exercises

---

## Third-Party Security

### Supabase Security

**Certifications:**
- SOC 2 Type II
- HIPAA compliant
- GDPR compliant

**Security Features:**
- Encrypted data at rest
- Encrypted data in transit
- Regular security updates
- 24/7 security monitoring

### Payment Provider Security

**Dodo Payments:**
- PCI DSS compliant
- Secure card processing
- Fraud detection
- Chargeback protection

**Local Wallets:**
- Manual verification process
- Phone number validation
- Provider security measures

---

## Security Checklist

### Development
- [ ] Remove all console.log statements
- [ ] Implement comprehensive input validation
- [ ] Add error boundary components
- [ ] Sanitize all user inputs
- [ ] Implement CSRF protection
- [ ] Add XSS protection
- [ ] Implement rate limiting

### Authentication
- [ ] Implement MFA
- [ ] Add social login options
- [ ] Enforce password complexity
- [ ] Implement session timeout
- [ ] Add account lockout after failed attempts
- [ ] Implement secure password reset flow

### Authorization
- [ ] Review all RLS policies
- [ ] Test role-based access
- [ ] Implement resource-level permissions
- [ ] Add temporary access tokens
- [ ] Implement permission caching

### Data Protection
- [ ] Encrypt PII at rest
- [ ] Implement data anonymization
- [ ] Add backup verification
- [ ] Implement disaster recovery plan
- [ ] Define data retention policies

### Monitoring
- [ ] Set up APM
- [ ] Implement error tracking (Sentry)
- [ ] Configure centralized logging
- [ ] Add health check endpoints
- [ ] Set up uptime monitoring
- [ ] Configure security alerts

---

**Document Owner:** Development Team  
**Last Updated:** June 2, 2026  
**Next Review:** After security enhancements
