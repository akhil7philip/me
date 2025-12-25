# Admin Panel Setup Guide

## ✅ Completed Updates

### 1. Supabase Configuration Modernized
Updated to use latest `@supabase/ssr` patterns compatible with Next.js 15+:

- **`lib/supabase.ts`**: Removed legacy client, using only SSR-compatible browser client
- **`lib/supabase/server.ts`**: Made async with proper cookie handlers
- **`lib/supabase/middleware.ts`**: Updated cookie handling and added admin route protection

### 2. Admin Route Structure Fixed
Restructured from non-standard `admin/_admin/` to proper Next.js structure:

**Before:** `/admin/_admin/dashboard`, `/admin/_admin/articles`, etc.
**After:** `/admin/dashboard`, `/admin/articles`, etc.

This follows Next.js best practices where route groups (prefixed with `_`) are only used when you want to organize routes without affecting the URL structure.

## 🚀 Admin Panel Features

### Available Routes
- **`/admin/login`** - Admin authentication
- **`/admin/dashboard`** - Overview with quick stats
- **`/admin/articles`** - List and manage all articles
- **`/admin/articles/new`** - Create new article with rich text editor
- **`/admin/articles/[id]/edit`** - Edit existing articles
- **`/admin/tags`** - Manage article tags
- **`/admin/categories`** - Manage categories
- **`/admin/series`** - Manage article series
- **`/admin/comments`** - Moderate comments
- **`/admin/media`** - Media library
- **`/admin/subscribers`** - Manage email subscribers
- **`/admin/analytics`** - View analytics
- **`/admin/profile`** - User profile settings
- **`/admin/settings`** - General settings

### Key Features
✅ **Authentication**: Supabase Auth with protected routes
✅ **Rich Text Editor**: TipTap editor with formatting, images, tables
✅ **Article Management**: Create, edit, publish, draft, archive
✅ **SEO Settings**: Custom titles, descriptions per article
✅ **Media Management**: Upload and manage images
✅ **Auto-generated**: Slugs, reading time, timestamps

## 🔐 Authentication Setup

### Creating Admin User
You need to create a user in your Supabase project:

1. Go to your Supabase Dashboard: https://supabase.com/dashboard
2. Navigate to **Authentication** → **Users**
3. Click **Add User** → **Create new user**
4. Enter email and password
5. User will be able to login at `/admin/login`

### Environment Variables
Your `.env.local` is already configured:
```env
NEXT_PUBLIC_SUPABASE_URL=https://yznvlbtooscmheyflmev.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGc...
```

## 📊 Database Schema

Your Supabase database includes:
- **articles** - Blog posts with content, metadata, SEO
- **categories** - Article categories
- **tags** - Article tags
- **article_tags** - Many-to-many relationship
- **comments** - Article comments
- **reactions** - Article reactions (like, love, fire, etc.)
- **author_profiles** - Author information

Migrations are in `supabase/migrations/`:
- `20240302_cows_and_bulls.sql` - Game tables
- `20250113_blog_system.sql` - Blog CMS tables

## 🎯 How to Use

### Start Development Server
```bash
npm run dev
```
Server runs at: http://localhost:3000

### Access Admin Panel
1. Navigate to: http://localhost:3000/admin/login
2. Login with your Supabase user credentials
3. You'll be redirected to: http://localhost:3000/admin/dashboard

### Create Your First Article
1. Go to `/admin/articles/new`
2. Fill in title (slug auto-generates)
3. Write content using the rich text editor
4. Add excerpt, cover image, category, tags
5. Choose "Published" or "Draft"
6. Click "Publish" or "Save Draft"

### Middleware Protection
The middleware automatically:
- Redirects unauthenticated users from `/admin/*` to `/admin/login`
- Redirects authenticated users from `/admin/login` to `/admin/dashboard`
- Maintains session across page refreshes

## 🛠️ Technical Stack

- **Framework**: Next.js 13.5.1 (App Router)
- **Database**: Supabase (PostgreSQL)
- **Auth**: Supabase Auth
- **Editor**: TipTap (rich text)
- **UI**: Radix UI + Tailwind CSS
- **Forms**: React Hook Form + Zod
- **Styling**: Tailwind CSS + shadcn/ui

## 📝 Next Steps

1. **Create admin user** in Supabase Dashboard
2. **Login** at `/admin/login`
3. **Create categories and tags** first (optional but recommended)
4. **Create your first article**
5. **Customize** the admin panel as needed

## 🔧 Configuration Files

- **Supabase Client**: `lib/supabase.ts` (browser)
- **Supabase Server**: `lib/supabase/server.ts` (server components)
- **Middleware**: `lib/supabase/middleware.ts` (route protection)
- **Auth Context**: `lib/auth-context.tsx` (client-side auth state)

All configurations follow modern Next.js 15+ and Supabase SSR best practices.
