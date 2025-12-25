# Blog CMS Setup Guide

This guide will help you set up your full-featured blog CMS powered by Next.js and Supabase.

## Prerequisites

- Node.js 18+ installed
- pnpm package manager
- A Supabase account
- (Optional) A Resend account for email newsletters

## Step 1: Supabase Setup

### 1.1 Create a Supabase Project

1. Go to [Supabase](https://supabase.com) and create a new project
2. Wait for the project to be fully provisioned

### 1.2 Run Database Migrations

1. In your Supabase dashboard, go to the SQL Editor
2. Copy the contents of `supabase/migrations/20250113_blog_system.sql`
3. Paste and execute the SQL to create all necessary tables

### 1.3 Setup Storage Bucket

1. Go to Storage in your Supabase dashboard
2. Create a new bucket called `media`
3. Make it public
4. Set up policies:
   ```sql
   -- Allow public read access
   CREATE POLICY "Public Access" ON storage.objects FOR SELECT USING (bucket_id = 'media');
   
   -- Allow authenticated users to upload
   CREATE POLICY "Authenticated users can upload" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'media' AND auth.role() = 'authenticated');
   ```

### 1.4 Create Admin User

1. Go to Authentication > Users
2. Add a new user with email and password
3. This will be your admin account

## Step 2: Environment Variables

1. Copy `.env.example` to `.env.local`:
   ```bash
   cp .env.example .env.local
   ```

2. Fill in your Supabase credentials:
   - `NEXT_PUBLIC_SUPABASE_URL`: Your Supabase project URL
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Your Supabase anon/public key
   - `NEXT_PUBLIC_SITE_URL`: Your site URL (for sitemap and RSS)
   
   Optional (for migration script):
   - `SUPABASE_SERVICE_ROLE_KEY`: Your Supabase service role key (for admin operations)
   - `AUTHOR_ID`: Author user ID to use for migrated articles (if not set, script will try to auto-detect)

## Step 3: Install Dependencies

```bash
pnpm install
```

## Step 4: Run Database Migration (Optional)

If you have existing markdown articles, update `scripts/migrate-articles.ts` with your articles and run:

```bash
npx tsx scripts/migrate-articles.ts
```

**Note:** The migration script requires environment variables to be set in `.env.local`. If you want the script to automatically detect the author ID, add `SUPABASE_SERVICE_ROLE_KEY` to your `.env.local`. Alternatively, you can set `AUTHOR_ID` directly to specify which user should be the author of migrated articles.

## Step 5: Start Development Server

```bash
pnpm dev
```

Visit `http://localhost:3000` to see your site!

## Step 6: Access Admin Panel

1. Navigate to `http://localhost:3000/admin/login`
2. Log in with the admin credentials you created in Supabase
3. You'll be redirected to the admin dashboard

## Features Overview

### Admin Panel Features

- **Dashboard**: Overview of articles, views, comments, and subscribers
- **Articles**: Create, edit, delete articles with rich text editor
  - Draft/Publish workflow
  - Cover images
  - SEO metadata
  - Tags and categories
  - Featured articles
  - Version history
- **Tags**: Create and manage content tags
- **Categories**: Organize articles into categories
- **Series**: Group related articles into series
- **Media Library**: Upload and manage images
- **Comments**: Moderate article comments
- **Subscribers**: Manage newsletter subscribers
- **Analytics**: View article performance
- **Profile**: Manage your author profile

### Public Features

- **Articles Page**: Browse all published articles
  - Search functionality
  - Filter by category and tags
  - View counts
- **Individual Article**: 
  - Reading progress bar
  - Reactions (like, love, fire, etc.)
  - Social sharing (Twitter, LinkedIn, Facebook)
  - Comments section
  - Related articles
  - Bookmark functionality
- **Newsletter**: Subscribe to updates
- **SEO**: Automatic sitemap and RSS feed generation

## URLs Reference

### Public URLs
- Home: `/`
- Articles: `/articles`
- Article: `/articles/[slug]`
- Sitemap: `/sitemap.xml`
- RSS Feed: `/rss.xml`

### Admin URLs
- Login: `/admin/login`
- Dashboard: `/admin/dashboard`
- Articles: `/admin/articles`
- New Article: `/admin/articles/new`
- Edit Article: `/admin/articles/[id]/edit`
- Tags: `/admin/tags`
- Categories: `/admin/categories`
- Series: `/admin/series`
- Media: `/admin/media`
- Comments: `/admin/comments`
- Subscribers: `/admin/subscribers`
- Analytics: `/admin/analytics`
- Profile: `/admin/profile`

## Technology Stack

- **Framework**: Next.js 13 (App Router)
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth
- **Storage**: Supabase Storage
- **Rich Text Editor**: Tiptap
- **Styling**: Tailwind CSS + shadcn/ui
- **Forms**: react-hook-form + zod
- **Social Sharing**: react-share

## Production Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Import project in Vercel
3. Add environment variables
4. Deploy!

### Other Platforms

Works on any platform that supports Next.js:
- Netlify
- Railway
- Render
- Self-hosted with Docker

## Optional: Newsletter Integration

To enable email newsletters:

1. Create a [Resend](https://resend.com) account
2. Add `RESEND_API_KEY` to your environment variables
3. Implement the newsletter send functionality in `/admin/subscribers`

## Security Considerations

- Row Level Security (RLS) is enabled on all tables
- Only authenticated users can access admin panel
- Comments require moderation before appearing
- File uploads are restricted to authenticated users
- API routes are protected

## Customization

### Styling
- Edit `app/globals.css` for global styles
- Modify theme in `tailwind.config.ts`
- Customize components in `components/ui/`

### Logo & Branding
- Update site title in `app/layout.tsx`
- Add your logo to `public/images/`
- Modify metadata in `app/layout.tsx`

## Troubleshooting

### Can't log in to admin?
- Verify your Supabase credentials in `.env.local`
- Check that the user exists in Supabase Auth
- Clear browser cache and cookies

### Database errors?
- Ensure all migrations have run successfully
- Check RLS policies are enabled
- Verify your Supabase anon key has correct permissions

### Images not uploading?
- Check Supabase Storage bucket is created and public
- Verify storage policies are correctly set
- Ensure you're authenticated when uploading

## Support

For issues or questions:
- Check Supabase documentation
- Review Next.js documentation
- Check Tiptap documentation

## License

MIT License - feel free to use this for your own projects!

