# GuriGate Development Guide

**Version:** 1.0  
**Date:** June 2, 2026  
**Status:** Production

---

## Executive Summary

This guide provides comprehensive instructions for developers working on the GuriGate project. It covers development environment setup, coding standards, workflows, and best practices.

---

## Prerequisites

### Required Software

- Node.js 18+ (https://nodejs.org)
- npm or pnpm (package manager)
- Git (https://git-scm.com)
- VS Code or similar IDE (recommended)
- Supabase CLI (optional, for local development)

### Required Accounts

- Supabase account (https://supabase.com)
- GitHub account (for version control)

### Optional Tools

- Supabase CLI for local development
- Postman for API testing
- DBeaver or pgAdmin for database management

---

## Development Environment Setup

### 1. Clone Repository

```bash
git clone https://github.com/your-org/gurigate.git
cd gurigate
```

### 2. Install Dependencies

```bash
# Using npm
npm install

# Using pnpm
pnpm install
```

### 3. Configure Environment Variables

Create `.env` file in project root:

```env
VITE_SUPABASE_URL=https://your-project-ref.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
VITE_APP_ENV=development
```

### 4. Start Development Server

```bash
# Using npm
npm run dev

# Using pnpm
pnpm dev
```

The application will be available at `http://localhost:5173`

### 5. Install Supabase CLI (Optional)

```bash
npm install -g supabase
supabase login
```

---

## Project Structure

```
gurigate/
├── src/
│   ├── components/          # React components
│   │   ├── admin/          # Admin components
│   │   ├── host-onboarding/# Host onboarding components
│   │   ├── inbox/          # Messaging components
│   │   └── ...             # Other components
│   ├── pages/              # Page components
│   ├── services/           # API services
│   ├── hooks/              # Custom React hooks
│   ├── lib/                # Utility libraries
│   ├── types/              # TypeScript types
│   ├── constants/          # Constants and enums
│   ├── App.tsx             # Root component
│   └── main.tsx            # Entry point
├── supabase/
│   ├── migrations/         # Database migrations
│   ├── functions/          # Edge functions
│   └── seed.sql            # Seed data
├── public/                 # Static assets
├── docs/                   # Documentation
├── .env                    # Environment variables
├── package.json            # Dependencies
├── tsconfig.json           # TypeScript config
├── vite.config.ts          # Vite config
└── tailwind.config.js      # Tailwind config
```

---

## Coding Standards

### TypeScript

**Type Definitions:**

```typescript
// Define interfaces for data structures
interface Property {
  id: string
  title: string
  price: number
  approval_status: 'pending' | 'approved' | 'rejected' | 'suspended'
}

// Use type for unions
type UserRole = 'guest' | 'host' | 'manager' | 'admin' | 'super_admin'
```

**Component Props:**

```typescript
interface ComponentProps {
  title: string
  onAction: (id: string) => void
  disabled?: boolean
}

export const MyComponent: React.FC<ComponentProps> = ({ title, onAction, disabled = false }) => {
  return <div>{title}</div>
}
```

### React

**Functional Components:**

```typescript
// Use functional components with hooks
export const PropertyCard: React.FC<PropertyCardProps> = ({ property }) => {
  const [liked, setLiked] = useState(false)
  
  const handleLike = () => {
    setLiked(!liked)
  }
  
  return <div onClick={handleLike}>{property.title}</div>
}
```

**Hooks:**

```typescript
// Custom hooks for reusable logic
export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  
  useEffect(() => {
    // Fetch user
  }, [])
  
  return { user, loading }
}
```

### CSS/Tailwind

**Tailwind CSS:**

```tsx
// Use Tailwind classes for styling
<div className="flex items-center justify-between p-4 bg-white rounded-lg shadow">
  <h2 className="text-xl font-bold text-gray-900">Title</h2>
  <button className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">
    Action
  </button>
</div>
```

**Component-Specific Styles:**

```css
/* Use CSS modules for complex component styles */
.container {
  @apply flex flex-col items-center justify-center min-h-screen;
}
```

### File Naming

**Components:** PascalCase - `PropertyCard.tsx`
**Hooks:** camelCase with 'use' prefix - `useAuth.ts`
**Services:** camelCase - `adminService.ts`
**Types:** PascalCase - `PropertyTypes.ts`
**Utilities:** camelCase - `formatDate.ts`

---

## Git Workflow

### Branch Strategy

```
main (production)
  ├── develop (staging)
  ├── feature/feature-name
  ├── bugfix/bug-name
  └── hotfix/urgent-fix
```

### Commit Message Format

```
<type>(<scope>): <subject>

<body>

<footer>
```

**Types:**
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting)
- `refactor`: Code refactoring
- `test`: Adding or updating tests
- `chore`: Maintenance tasks

**Examples:**

```
feat(booking): add payment verification workflow

- Implement payment proof upload
- Add admin verification UI
- Update booking status on verification

Closes #123
```

```
fix(auth): resolve session expiration issue

- Fix token refresh logic
- Update session timeout configuration
- Add error handling for expired tokens
```

### Pull Request Process

1. Create feature branch from `develop`
2. Make changes and commit
3. Push to remote
4. Create pull request to `develop`
5. Request review
6. Address feedback
7. Merge after approval

---

## Development Workflows

### Adding New Component

1. Create component file in appropriate directory
2. Define TypeScript interfaces
3. Implement component logic
4. Add styles with Tailwind
5. Export component
6. Add to appropriate page or parent component
7. Test component

**Example:**

```typescript
// src/components/PropertyCard.tsx
interface PropertyCardProps {
  property: Property
  onLike: (id: string) => void
}

export const PropertyCard: React.FC<PropertyCardProps> = ({ property, onLike }) => {
  return (
    <div className="bg-white rounded-lg shadow p-4">
      <h3>{property.title}</h3>
      <button onClick={() => onLike(property.id)}>Like</button>
    </div>
  )
}
```

### Adding New Page

1. Create page component in `src/pages/`
2. Add route in `App.tsx`
3. Add navigation link if needed
4. Implement page logic
5. Test page

**Example:**

```typescript
// src/pages/NewPage.tsx
export const NewPage: React.FC = () => {
  return <div>New Page Content</div>
}

// App.tsx
<Route path="/new-page" element={<NewPage />} />
```

### Adding New Service

1. Create service file in `src/services/`
2. Define TypeScript interfaces
3. Implement API calls using Supabase client
4. Export functions
5. Use service in components

**Example:**

```typescript
// src/services/newService.ts
import { supabase } from '@/lib/supabase'

export async function getData() {
  const { data, error } = await supabase
    .from('table')
    .select('*')
  
  if (error) throw error
  return data
}
```

### Adding Database Migration

1. Create migration file in `supabase/migrations/`
2. Write SQL for schema changes
3. Test in development
4. Apply to production
5. Update documentation

**Example:**

```sql
-- supabase/migrations/20260601_add_column.sql
ALTER TABLE properties ADD COLUMN new_column TEXT;
```

---

## Testing

### Manual Testing

1. Start development server
2. Navigate to feature being tested
3. Test all user flows
4. Test edge cases
5. Verify error handling

### API Testing

Use Supabase SQL Editor or Postman to test API calls:

```sql
-- Test query
SELECT * FROM properties WHERE approval_status = 'approved';
```

### Database Testing

Test RLS policies and constraints:

```sql
-- Test as different roles
SET ROLE authenticated;
SELECT * FROM properties WHERE owner_id = auth.uid();
```

---

## Debugging

### Frontend Debugging

1. Open browser DevTools (F12)
2. Check Console for errors
3. Use debugger statements
4. Check Network tab for API calls
5. Use React DevTools for component inspection

### Backend Debugging

1. Check Supabase logs
2. Use SQL Editor for query testing
3. Check Edge Function logs
4. Monitor database performance

### Common Issues

**Build Errors:**
- Check TypeScript errors
- Verify imports
- Clear cache: `rm -rf node_modules && npm install`

**API Errors:**
- Check RLS policies
- Verify authentication
- Check Supabase logs

**State Issues:**
- Check useEffect dependencies
- Verify state updates
- Check for stale closures

---

## Best Practices

### Performance

- Use React.memo for expensive components
- Implement code splitting
- Lazy load images
- Use pagination for large lists
- Optimize database queries

### Security

- Never expose sensitive data
- Validate all inputs
- Use environment variables for secrets
- Implement proper error handling
- Follow RLS policies

### Code Quality

- Write clear, descriptive variable names
- Add comments for complex logic
- Keep functions small and focused
- DRY (Don't Repeat Yourself)
- Follow TypeScript best practices

### Accessibility

- Use semantic HTML
- Add ARIA labels where needed
- Ensure keyboard navigation
- Test with screen readers
- Use proper color contrast

---

## Common Tasks

### Running Development Server

```bash
npm run dev
```

### Building for Production

```bash
npm run build
```

### Running Tests

```bash
npm test
```

### Linting Code

```bash
npm run lint
```

### Formatting Code

```bash
npm run format
```

### Checking TypeScript

```bash
npx tsc --noEmit
```

---

## Resources

### Internal Documentation

- System Architecture: `docs/01_SYSTEM_ARCHITECTURE.md`
- Database Schema: `docs/02_DATABASE_SCHEMA.md`
- API Documentation: `docs/03_API_DOCUMENTATION.md`
- Security Documentation: `docs/04_SECURITY_DOCUMENTATION.md`
- Module Documentation: `docs/05_MODULE_DOCUMENTATION.md`

### External Documentation

- React: https://react.dev
- TypeScript: https://www.typescriptlang.org/docs
- Supabase: https://supabase.com/docs
- Vite: https://vitejs.dev
- Tailwind CSS: https://tailwindcss.com/docs

---

## Getting Help

### Internal Resources

1. Check documentation in `docs/` directory
2. Review existing code for patterns
3. Check Git history for similar changes
4. Ask team members

### External Resources

1. Stack Overflow
2. GitHub Issues
3. Supabase Discord
4. React Discord

---

## Development Checklist

### Before Starting Development

- [ ] Pull latest changes from `develop`
- [ ] Create feature branch
- [ ] Review requirements
- [ ] Check for related documentation

### During Development

- [ ] Write clean, readable code
- [ ] Follow coding standards
- [ ] Add comments for complex logic
- [ ] Test changes thoroughly
- [ ] Update documentation if needed

### Before Committing

- [ ] Code compiles without errors
- [ ] No linting warnings
- [ ] Tests pass (if implemented)
- [ ] Changes tested manually
- [ ] Commit message follows format

### Before Creating PR

- [ ] Branch is up to date with develop
- [ ] Code review self-check completed
- [ ] Documentation updated
- [ ] PR description is clear
- [ ] Tests added if applicable

---

**Document Owner:** Development Team  
**Last Updated:** June 2, 2026  
**Next Review:** As needed
