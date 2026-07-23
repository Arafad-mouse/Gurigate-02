# GuriGate Development Guide

**Document Version:** 1.0  
**Date:** June 2, 2026  
**Author:** System Architecture Team

---

## 1. Overview

This document provides comprehensive development guidelines for the GuriGate platform, covering setup, coding standards, workflows, and best practices.

### Development Stack

- **Frontend:** React 19, TypeScript 5.x, Vite 5.x, TailwindCSS 3.x, shadcn/ui
- **Backend:** Supabase (PostgreSQL, Auth, Realtime, Storage, Edge Functions)
- **Language:** TypeScript
- **Package Manager:** npm
- **Version Control:** Git

---

## 2. Development Setup

### 2.1 Prerequisites

- Node.js v18 or higher
- npm v9 or higher
- Git
- VS Code (recommended) or any code editor
- Supabase CLI (optional but recommended)

### 2.2 Clone Repository

```bash
git clone https://github.com/your-org/gurigate.git
cd gurigate
```

### 2.3 Install Dependencies

```bash
npm install
```

### 2.4 Configure Environment Variables

```bash
# Copy example environment file
cp .env.example .env.local

# Edit with your credentials
nano .env.local
```

Required environment variables:
```env
VITE_SUPABASE_URL=your-supabase-url
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key
VITE_DODO_API_KEY=your-dodo-api-key
VITE_DODO_SECRET_KEY=your-dodo-secret-key
VITE_APP_URL=http://localhost:5173
VITE_APP_NAME=GuriGate
```

### 2.5 Start Development Server

```bash
npm run dev
```

The application will be available at `http://localhost:5173`

---

## 3. Project Structure

```
gurigate/
├── src/
│   ├── components/          # React components
│   │   ├── admin/          # Admin-specific components
│   │   ├── host-onboarding/ # Host onboarding components
│   │   └── ui/             # shadcn/ui components
│   ├── hooks/              # Custom React hooks
│   ├── lib/                # Utility libraries
│   ├── pages/              # Page components
│   ├── services/           # API services
│   ├── types/              # TypeScript type definitions
│   ├── App.tsx             # Root component
│   └── main.tsx            # Entry point
├── supabase/
│   └── migrations/         # Database migrations
├── public/                 # Static assets
├── docs/                   # Documentation
├── .env.local              # Environment variables (local)
├── .env.example            # Environment variables template
├── package.json            # Dependencies
├── tsconfig.json           # TypeScript configuration
├── vite.config.ts          # Vite configuration
└── tailwind.config.js      # TailwindCSS configuration
```

---

## 4. Coding Standards

### 4.1 TypeScript

- Use TypeScript for all new code
- Enable strict mode in tsconfig.json
- Use explicit return types for functions
- Avoid `any` type
- Use interfaces for object shapes
- Use type aliases for unions and primitives

**Example:**
```typescript
// Good
interface User {
  id: string;
  name: string;
  email: string;
}

function getUser(id: string): Promise<User> {
  return supabase.from('users').select('*').eq('id', id).single();
}

// Bad
function getUser(id) {
  return supabase.from('users').select('*').eq('id', id).single();
}
```

### 4.2 React

- Use functional components with hooks
- Use TypeScript for component props
- Use memo for expensive components
- Use useCallback for event handlers
- Use useMemo for expensive calculations
- Avoid inline functions in render
- Use proper key props for lists

**Example:**
```typescript
// Good
interface Props {
  user: User;
  onUpdate: (user: User) => void;
}

const UserCard = memo(({ user, onUpdate }: Props) => {
  const handleClick = useCallback(() => {
    onUpdate(user);
  }, [user, onUpdate]);
  
  return <div onClick={handleClick}>{user.name}</div>;
});

// Bad
const UserCard = ({ user, onUpdate }) => {
  return <div onClick={() => onUpdate(user)}>{user.name}</div>;
};
```

### 4.3 CSS/Styling

- Use TailwindCSS for styling
- Use shadcn/ui components when possible
- Avoid inline styles
- Use CSS modules for component-specific styles
- Follow mobile-first responsive design
- Use Tailwind's responsive prefixes

**Example:**
```tsx
// Good
<div className="flex flex-col md:flex-row gap-4 p-4">
  <Card className="flex-1">
    <CardHeader>
      <CardTitle>Title</CardTitle>
    </CardHeader>
  </Card>
</div>

// Bad
<div style={{ display: 'flex', flexDirection: 'column', padding: '16px' }}>
  <div style={{ flex: 1, padding: '16px', border: '1px solid #ccc' }}>
    <h3>Title</h3>
  </div>
</div>
```

### 4.4 Naming Conventions

- **Components:** PascalCase (e.g., `UserCard`, `AdminDashboard`)
- **Functions:** camelCase (e.g., `getUser`, `handleClick`)
- **Constants:** UPPER_SNAKE_CASE (e.g., `MAX_RETRIES`, `API_URL`)
- **Files:** kebab-case for components (e.g., `user-card.tsx`)
- **Types/Interfaces:** PascalCase (e.g., `User`, `ApiResponse`)

### 4.5 File Organization

- One component per file
- Co-locate related files
- Use index files for exports
- Keep files under 300 lines when possible
- Split large components into smaller ones

---

## 5. Git Workflow

### 5.1 Branch Strategy

- `main` - Production code
- `develop` - Development code
- `feature/*` - Feature branches
- `bugfix/*` - Bug fix branches
- `hotfix/*` - Emergency fixes

### 5.2 Commit Messages

Follow conventional commits format:

```
<type>(<scope>): <subject>

<body>

<footer>
```

**Types:**
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting, etc.)
- `refactor`: Code refactoring
- `test`: Adding or updating tests
- `chore`: Maintenance tasks

**Examples:**
```
feat(auth): add multi-factor authentication

Implement MFA for admin accounts using TOTP.

Closes #123

fix(booking): resolve date overlap bug

Fix booking date lock overlap issue that allowed double bookings.

Fixes #456
```

### 5.3 Pull Request Process

1. Create feature branch from `develop`
2. Make changes and commit
3. Push to remote
4. Create pull request to `develop`
5. Request review
6. Address feedback
7. Merge after approval

---

## 6. Component Development

### 6.1 Creating New Components

1. Create component file in appropriate directory
2. Define TypeScript interfaces for props
3. Implement component logic
4. Add styling with TailwindCSS
5. Export component
6. Add to index file if needed

**Example:**
```tsx
// src/components/user-card.tsx
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { memo } from 'react';

interface UserCardProps {
  user: {
    id: string;
    name: string;
    email: string;
  };
  onClick?: () => void;
}

export const UserCard = memo(({ user, onClick }: UserCardProps) => {
  return (
    <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={onClick}>
      <CardHeader>
        <CardTitle>{user.name}</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-gray-600">{user.email}</p>
      </CardContent>
    </Card>
  );
});

UserCard.displayName = 'UserCard';
```

### 6.2 Using shadcn/ui Components

shadcn/ui components are pre-built and should be used when possible.

**Adding new shadcn/ui component:**
```bash
npx shadcn-ui@latest add [component-name]
```

**Example:**
```bash
npx shadcn-ui@latest add dialog
npx shadcn-ui@latest add select
```

---

## 7. Service Layer

### 7.1 Creating Services

Services should be organized by domain and use TypeScript.

**Example:**
```typescript
// src/services/propertyService.ts
import { supabase } from '@/lib/supabase';
import type { Property } from '@/types';

export async function getProperties(filters?: {
  status?: string;
  approval_status?: string;
}): Promise<Property[]> {
  let query = supabase.from('properties').select('*');
  
  if (filters?.status) {
    query = query.eq('status', filters.status);
  }
  
  if (filters?.approval_status) {
    query = query.eq('approval_status', filters.approval_status);
  }
  
  const { data, error } = await query;
  
  if (error) {
    throw new Error(`Failed to fetch properties: ${error.message}`);
  }
  
  return data || [];
}

export async function getPropertyById(id: string): Promise<Property> {
  const { data, error } = await supabase
    .from('properties')
    .select('*')
    .eq('id', id)
    .single();
  
  if (error) {
    throw new Error(`Failed to fetch property: ${error.message}`);
  }
  
  return data;
}
```

### 7.2 Error Handling

Services should handle errors gracefully and throw meaningful errors.

```typescript
// Good
export async function getPropertyById(id: string): Promise<Property> {
  const { data, error } = await supabase
    .from('properties')
    .select('*')
    .eq('id', id)
    .single();
  
  if (error) {
    throw new Error(`Failed to fetch property: ${error.message}`);
  }
  
  if (!data) {
    throw new Error(`Property not found: ${id}`);
  }
  
  return data;
}

// Bad
export async function getPropertyById(id: string) {
  const { data } = await supabase
    .from('properties')
    .select('*')
    .eq('id', id)
    .single();
  
  return data;
}
```

---

## 8. Hooks

### 8.1 Creating Custom Hooks

Custom hooks should be reusable and follow naming convention `use*`.

**Example:**
```typescript
// src/hooks/useProperties.ts
import { useState, useEffect } from 'react';
import { getProperties } from '@/services/propertyService';
import type { Property } from '@/types';

export function useProperties(filters?: {
  status?: string;
  approval_status?: string;
}) {
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadProperties() {
      try {
        setLoading(true);
        const data = await getProperties(filters);
        setProperties(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load properties');
      } finally {
        setLoading(false);
      }
    }

    loadProperties();
  }, [filters]);

  return { properties, loading, error, refetch: () => loadProperties() };
}
```

### 8.2 Using Hooks

```tsx
function PropertyList() {
  const { properties, loading, error } = useProperties({
    status: 'available',
    approval_status: 'approved'
  });

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div>
      {properties.map(property => (
        <PropertyCard key={property.id} property={property} />
      ))}
    </div>
  );
}
```

---

## 9. Database Changes

### 9.1 Creating Migrations

All database changes must be done through migrations.

```bash
# Create new migration
supabase migration new add_new_table

# Edit migration file
# supabase/migrations/20240101000000_add_new_table.sql
```

**Migration example:**
```sql
-- Create new table
CREATE TABLE new_table (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add RLS
ALTER TABLE new_table ENABLE ROW LEVEL SECURITY;

-- Create policy
CREATE POLICY "Users can view own records"
ON new_table FOR SELECT
TO authenticated
USING (user_id = auth.uid());
```

### 9.2 Applying Migrations

```bash
# Push all migrations
supabase db push

# Push specific migration
supabase db push --file supabase/migrations/20240101000000_add_new_table.sql
```

### 9.3 Reset Database (Development Only)

```bash
# Reset database to initial state
supabase db reset
```

---

## 10. Testing

### 10.1 Unit Testing

Set up Vitest for unit testing:

```bash
npm install -D vitest @testing-library/react @testing-library/jest-dom
```

**Example test:**
```typescript
// src/components/__tests__/UserCard.test.tsx
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { UserCard } from '../user-card';

describe('UserCard', () => {
  it('renders user name', () => {
    const user = { id: '1', name: 'John Doe', email: 'john@example.com' };
    render(<UserCard user={user} />);
    expect(screen.getByText('John Doe')).toBeInTheDocument();
  });
});
```

Run tests:
```bash
npm test
```

### 10.2 E2E Testing

Set up Playwright for E2E testing:

```bash
npm install -D @playwright/test
```

**Example test:**
```typescript
// e2e/login.spec.ts
import { test, expect } from '@playwright/test';

test('user can login', async ({ page }) => {
  await page.goto('/login');
  await page.fill('input[name="email"]', 'test@example.com');
  await page.fill('input[name="password"]', 'password123');
  await page.click('button[type="submit"]');
  await expect(page).toHaveURL('/dashboard');
});
```

Run E2E tests:
```bash
npx playwright test
```

---

## 11. Building and Deployment

### 11.1 Build for Production

```bash
npm run build
```

### 11.2 Preview Build

```bash
npm run preview
```

### 11.3 Type Checking

```bash
npm run type-check
```

### 11.4 Linting

```bash
npm run lint
```

---

## 12. Debugging

### 12.1 Browser DevTools

Use browser DevTools for frontend debugging:
- React DevTools for component inspection
- Network tab for API calls
- Console for errors and logs

### 12.2 Supabase Dashboard

Use Supabase Dashboard for backend debugging:
- Table Editor for data inspection
- SQL Editor for query testing
- Logs for error tracking
- Edge Function Logs for function debugging

### 12.3 Debug Mode

Enable debug mode in development:

```typescript
// In .env.local
VITE_DEBUG=true
```

```typescript
// In code
if (import.meta.env.VITE_DEBUG === 'true') {
  console.log('Debug info:', data);
}
```

---

## 13. Best Practices

### 13.1 Performance

- Use React.memo for expensive components
- Use useMemo for expensive calculations
- Use useCallback for event handlers
- Lazy load routes with React.lazy
- Optimize images
- Use code splitting

### 13.2 Security

- Never expose service role keys in frontend
- Validate all user inputs
- Use RLS policies for data access
- Sanitize user-generated content
- Use HTTPS in production
- Rotate secrets regularly

### 13.3 Accessibility

- Use semantic HTML
- Add ARIA labels where needed
- Ensure keyboard navigation
- Test with screen readers
- Use proper color contrast
- Add alt text to images

### 13.4 Code Quality

- Write self-documenting code
- Add comments for complex logic
- Keep functions small and focused
- Follow DRY principle
- Avoid code duplication
- Use meaningful variable names

---

## 14. Common Tasks

### 14.1 Add New Page

1. Create page component in `src/pages/`
2. Add route in `App.tsx`
3. Add navigation link if needed
4. Test the page

### 14.2 Add New API Endpoint

1. Create service function in `src/services/`
2. Add TypeScript types
3. Implement error handling
4. Add tests
5. Document the function

### 14.3 Add New Database Table

1. Create migration file
2. Define table schema
3. Add RLS policies
4. Apply migration
5. Update TypeScript types

### 14.4 Add New Permission

1. Add permission to `src/lib/permissions.ts`
2. Update default permissions for roles
3. Add permission checks in UI
4. Add permission checks in RPC functions
5. Update documentation

---

## 15. Troubleshooting

### 15.1 Common Issues

**Build fails:**
- Check Node.js version
- Clear npm cache: `npm cache clean --force`
- Delete node_modules and reinstall
- Check TypeScript errors

**Database connection fails:**
- Verify Supabase URL and keys
- Check database status in Supabase Dashboard
- Verify RLS policies
- Check network connectivity

**Styles not applying:**
- Check TailwindCSS configuration
- Verify TailwindCSS is installed
- Check class names are correct
- Clear browser cache

**Hot reload not working:**
- Restart dev server
- Check Vite configuration
- Clear browser cache
- Check for syntax errors

### 15.2 Getting Help

- Check documentation in `docs/` folder
- Check Supabase documentation
- Check React documentation
- Check Vite documentation
- Ask team members for help

---

## 16. Resources

### 16.1 Documentation

- **React:** https://react.dev
- **TypeScript:** https://www.typescriptlang.org/docs
- **Vite:** https://vitejs.dev
- **TailwindCSS:** https://tailwindcss.com/docs
- **Supabase:** https://supabase.com/docs
- **shadcn/ui:** https://ui.shadcn.com

### 16.2 Tools

- **VS Code:** https://code.visualstudio.com
- **Git:** https://git-scm.com
- **Node.js:** https://nodejs.org
- **npm:** https://docs.npmjs.com

---

## 17. Code Review Checklist

Before submitting code for review:

- [ ] Code follows coding standards
- [ ] TypeScript types are correct
- [ ] Components are properly typed
- [ ] Error handling is implemented
- [ ] Loading states are handled
- [ ] Accessibility is considered
- [ ] Tests are added/updated
- [ ] Documentation is updated
- [ ] No console.log statements
- [ ] No commented code
- [ ] No unused imports
- [ ] No TODOs left in code

---

**End of Development Guide**
