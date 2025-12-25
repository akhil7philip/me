# Middleware Note for GitHub Pages

## Important: Middleware is Disabled

The `middleware.ts` file has been renamed to `middleware.ts.disabled` because:

1. **GitHub Pages only serves static files** - middleware runs on the server and cannot execute in a static environment
2. **Static export doesn't support middleware** - Next.js will error during build if middleware is present with `output: 'export'`

## What This Means

### Authentication Changes

With middleware disabled, Supabase authentication will work **entirely client-side**:

✅ **Still Works:**
- User login/logout
- Client-side auth checks
- Protected routes (client-side only)
- Supabase client operations

❌ **Doesn't Work:**
- Server-side session refresh
- Automatic cookie management via middleware
- Server-side route protection
- SSR with authenticated user data

### Security Implications

**Client-side authentication is still secure** when using Supabase because:
- Authentication happens through secure Supabase APIs
- Row Level Security (RLS) policies protect your database
- JWT tokens are validated server-side by Supabase

However, **route protection is visual only**:
- Admin routes `/admin/*` are accessible to anyone
- Protection must be implemented in each component
- Sensitive data should rely on RLS policies

## Recommendations

### 1. Update Protected Routes

Modify `components/admin/protected-route.tsx` to handle client-side only:

```tsx
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';

export default function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!loading && !user && mounted) {
      router.push('/admin/login');
    }
  }, [user, loading, router, mounted]);

  if (loading || !mounted) {
    return <div>Loading...</div>;
  }

  if (!user) {
    return null;
  }

  return <>{children}</>;
}
```

### 2. Strengthen RLS Policies

Ensure ALL database operations require authentication in Supabase:

```sql
-- Example: Articles table
ALTER TABLE articles ENABLE ROW LEVEL SECURITY;

-- Only authenticated users can insert/update/delete
CREATE POLICY "Authenticated users can manage articles"
  ON articles
  FOR ALL
  USING (auth.role() = 'authenticated');

-- Everyone can read published articles
CREATE POLICY "Anyone can read published articles"
  ON articles
  FOR SELECT
  USING (status = 'published');
```

### 3. Client-Side Session Management

Add session refresh logic to your auth context:

```tsx
// In lib/auth-context.tsx
useEffect(() => {
  // Refresh session every 30 minutes
  const interval = setInterval(() => {
    supabase.auth.refreshSession();
  }, 30 * 60 * 1000);

  return () => clearInterval(interval);
}, []);
```

## Alternative: Self-Hosted Deployment

If you need middleware functionality, consider:

1. **Vercel** (recommended for Next.js)
   - Free tier available
   - Full middleware support
   - Zero configuration
   - Deploy: `vercel deploy`

2. **Netlify**
   - Free tier available
   - Supports Next.js middleware via Edge Functions
   - Deploy: `netlify deploy`

3. **Cloudflare Pages**
   - Free tier available
   - Supports Edge Functions
   - Deploy: `wrangler pages deploy`

4. **VPS Hosting** (your current deploy.sh)
   - Full control
   - Requires server maintenance
   - Your existing `deploy.sh` script works here

## To Re-enable Middleware

If you move away from GitHub Pages:

```bash
mv middleware.ts.disabled middleware.ts
```

Then update `next.config.js` to remove or comment out:
```js
output: 'export',
```

---

**Note**: This is a limitation of static hosting, not Supabase. All static hosts (GitHub Pages, S3, etc.) have the same limitation.


