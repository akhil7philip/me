# GitHub Pages Deployment Guide

This guide explains how to deploy your Next.js application to GitHub Pages.

## Prerequisites

✅ Repository is public (required for free GitHub Pages)
✅ Next.js configured for static export
✅ GitHub Actions workflow created

## Configuration Files Modified

### 1. `next.config.js`
- Added `output: 'export'` for static export
- Set `images: { unoptimized: true }` (required for GitHub Pages)
- Added commented basePath configuration (uncomment if needed)

### 2. `package.json`
- Added `export` script: builds and creates `.nojekyll` file
- Added `deploy` script for manual deployment (optional)

### 3. `.github/workflows/deploy.yml`
- Automated deployment workflow
- Builds on every push to `main` branch
- Handles Supabase environment variables

## Step-by-Step Deployment Instructions

### Step 1: Configure Base Path (if needed)

**Option A**: If your repo is `username.github.io`:
- No changes needed, the site will be at `https://username.github.io`

**Option B**: If your repo is `username/repo-name`:
- Uncomment and update these lines in `next.config.js`:
  ```js
  basePath: '/repo-name',
  assetPrefix: '/repo-name/',
  ```
- Replace `repo-name` with your actual repository name

### Step 2: Add Supabase Environment Variables to GitHub

1. Go to your repository on GitHub
2. Click **Settings** → **Secrets and variables** → **Actions**
3. Click **New repository secret**
4. Add these secrets:
   - `NEXT_PUBLIC_SUPABASE_URL`: Your Supabase project URL
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Your Supabase anonymous key

### Step 3: Enable GitHub Pages

1. Go to your repository on GitHub
2. Click **Settings** → **Pages**
3. Under **Source**, select:
   - Source: **GitHub Actions**
4. Click **Save**

### Step 4: Push Your Changes

```bash
git add .
git commit -m "Configure GitHub Pages deployment"
git push origin main
```

### Step 5: Monitor Deployment

1. Go to the **Actions** tab in your GitHub repository
2. Watch the deployment workflow run
3. Once complete, your site will be live at:
   - `https://username.github.io` (if repo is username.github.io)
   - `https://username.github.io/repo-name` (if repo has a different name)

## Important Notes

### Static Export Limitations

Since GitHub Pages only hosts static files, these Next.js features **won't work**:
- ❌ API Routes (files in `app/api/` or `pages/api/`)
- ❌ Server-side rendering (SSR)
- ❌ Incremental Static Regeneration (ISR)
- ❌ Image Optimization
- ❌ Server Actions

### What Works

✅ Static pages and components
✅ Client-side routing
✅ Client-side API calls (like to Supabase)
✅ Environment variables (via GitHub Secrets)
✅ Static assets (images, fonts, etc.)

### Admin Features

Your admin routes (`/admin/*`) will be generated as static pages, but authentication and data mutations will only work through client-side Supabase calls. Make sure your Supabase Row Level Security (RLS) policies are properly configured.

## Troubleshooting

### Issue: 404 on page refresh
**Solution**: GitHub Pages doesn't support client-side routing out of the box. You may need to:
1. Use hash routing, or
2. Add a custom 404.html that redirects to index.html

### Issue: Images not loading
**Solution**: 
- Ensure images are in the `public/` folder
- Update image paths if using basePath
- Check that `images: { unoptimized: true }` is set

### Issue: Supabase connection fails
**Solution**:
- Verify GitHub Secrets are set correctly
- Check browser console for CORS errors
- Ensure Supabase URL allows your GitHub Pages domain

### Issue: Styles not loading
**Solution**:
- Clear browser cache
- Check that basePath matches your repository name
- Verify build completed successfully in Actions tab

## Manual Deployment (Alternative)

If you prefer not to use GitHub Actions:

1. Install gh-pages:
   ```bash
   pnpm add -D gh-pages
   ```

2. Build and deploy:
   ```bash
   pnpm run deploy
   ```

3. Enable GitHub Pages in settings (Source: `gh-pages` branch)

## Local Testing

Test the static export locally:

```bash
pnpm run build
npx serve out
```

Then visit `http://localhost:3000` to verify everything works.

## Update Deployment

After making changes:

```bash
git add .
git commit -m "Your commit message"
git push origin main
```

GitHub Actions will automatically rebuild and redeploy your site.

## Custom Domain (Optional)

To use a custom domain:

1. Add a `CNAME` file to the `public/` folder with your domain
2. Configure DNS records with your domain provider
3. Update GitHub Pages settings with your custom domain

---

**Last Updated**: October 13, 2025


