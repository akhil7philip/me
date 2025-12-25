# 🚀 Deploy to GitHub Pages - Quick Start

This guide will get your site live on GitHub Pages in under 5 minutes!

## ✅ Prerequisites Checklist

- [x] Next.js configured for static export (`output: 'export'`)
- [x] GitHub Actions workflow created
- [x] Images set to unoptimized
- [x] Middleware disabled (renamed to `.disabled`)
- [x] Static feed generation script created
- [ ] **You need to**: Make your repository public
- [ ] **You need to**: Configure GitHub Pages settings
- [ ] **You need to**: Add Supabase secrets
- [ ] **You need to**: Set base path (if needed)

## 🎯 Step-by-Step Deployment

### Step 1: Check Your Repository Name

Run this command to see your git remote:

```bash
git remote -v
```

This will show something like: `https://github.com/username/repo-name.git`

**Important Decision:**
- ✅ If your repo is named `username.github.io` → **Skip to Step 2**
- ⚠️ If your repo is named anything else (e.g., `akhilphilip`) → **Do Step 1A**

#### Step 1A: Configure Base Path (Only if NOT username.github.io)

If your repository name is `akhilphilip`, open `next.config.js` and uncomment:

```javascript
basePath: '/akhilphilip',
assetPrefix: '/akhilphilip/',
```

Replace `akhilphilip` with your actual repository name.

### Step 2: Add Supabase Secrets to GitHub

1. Go to: `https://github.com/YOUR_USERNAME/YOUR_REPO/settings/secrets/actions`
2. Click **"New repository secret"**
3. Add these two secrets:

   **Secret 1:**
   - Name: `NEXT_PUBLIC_SUPABASE_URL`
   - Value: Your Supabase project URL (e.g., `https://xxxxx.supabase.co`)

   **Secret 2:**
   - Name: `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - Value: Your Supabase anonymous key

   > 💡 Find these in: Supabase Dashboard → Project Settings → API

4. **(Optional but recommended)** Add a third secret:
   
   **Secret 3:**
   - Name: `NEXT_PUBLIC_SITE_URL`
   - Value: Your GitHub Pages URL (see Step 4)

### Step 3: Enable GitHub Pages

1. Go to: `https://github.com/YOUR_USERNAME/YOUR_REPO/settings/pages`
2. Under **"Build and deployment"**:
   - Source: Select **"GitHub Actions"**
3. Click **Save**

### Step 4: Push and Deploy

```bash
# Stage all changes
git add .

# Commit with a message
git commit -m "Configure GitHub Pages deployment"

# Push to GitHub
git push origin main
```

### Step 5: Monitor Deployment

1. Go to: `https://github.com/YOUR_USERNAME/YOUR_REPO/actions`
2. You'll see a workflow running: **"Deploy to GitHub Pages"**
3. Click on it to watch the progress
4. Wait 2-5 minutes for completion

### Step 6: Visit Your Live Site! 🎉

Your site will be live at:

- **If repo is `username.github.io`**: `https://username.github.io`
- **If repo is `akhilphilip`**: `https://username.github.io/akhilphilip`

> Replace `username` with your actual GitHub username

## 🔧 Troubleshooting

### Build Fails in Actions

**Check the Actions tab** for error messages:

<details>
<summary>Error: "Middleware is not supported"</summary>

Make sure `middleware.ts` is renamed to `middleware.ts.disabled`

```bash
mv middleware.ts middleware.ts.disabled
git add .
git commit -m "Disable middleware for static export"
git push
```
</details>

<details>
<summary>Error: "Image optimization not compatible"</summary>

Ensure `next.config.js` has:

```javascript
images: { 
  unoptimized: true 
}
```
</details>

<details>
<summary>Error: "API routes not supported"</summary>

API routes in `app/api/` won't work with static export. Our RSS and sitemap routes have been converted to build-time scripts.
</details>

### Site Deployed but Not Loading

**Symptoms:**
- GitHub Pages shows the site is live
- But you get a 404 or blank page

**Solutions:**

1. **Check basePath configuration** - If your repo isn't `username.github.io`, you MUST set basePath
2. **Wait a few minutes** - Sometimes GitHub Pages takes 5-10 minutes to fully propagate
3. **Hard refresh** - Press `Ctrl+Shift+R` (or `Cmd+Shift+R` on Mac)
4. **Check Actions tab** - Ensure the build actually succeeded

### Images Not Loading

**Solution:** Ensure images are in `public/` folder and referenced without `/public/`:

❌ Wrong: `<img src="/public/images/photo.jpg" />`
✅ Correct: `<img src="/images/photo.jpg" />`

If using basePath, images will automatically get the prefix.

### Authentication Not Working

**This is expected!** With static export:
- Supabase auth still works (it's client-side)
- But middleware is disabled
- See `MIDDLEWARE_NOTE.md` for details

**Quick fix:** Make sure your auth checks are all client-side in components.

### CSS Not Loading

**Solution:** Clear browser cache and check:
1. basePath is set correctly
2. Build completed successfully
3. No console errors in browser DevTools

## 🎨 Local Testing Before Deploy

Test the static export locally:

```bash
# Build the static site
pnpm run build

# Serve it locally
npx serve out

# Visit http://localhost:3000
```

This helps catch issues before deploying!

## 📝 Making Updates

After making changes to your site:

```bash
# 1. Test locally
pnpm run dev

# 2. Commit and push
git add .
git commit -m "Your change description"
git push origin main

# 3. GitHub Actions will automatically rebuild and deploy!
```

## 🌟 Custom Domain (Optional)

Want to use `www.yourdomain.com` instead of GitHub Pages URL?

1. Buy a domain (Namecheap, Google Domains, etc.)
2. Create file `public/CNAME` with your domain:
   ```
   www.yourdomain.com
   ```
3. Update your domain's DNS settings:
   - Add `CNAME` record: `www` → `username.github.io`
   - Or add `A` records pointing to GitHub's IPs:
     - `185.199.108.153`
     - `185.199.109.153`
     - `185.199.110.153`
     - `185.199.111.153`
4. In GitHub repo settings → Pages, set custom domain
5. Enable HTTPS (wait ~24 hours for certificate)

## 🚨 Important Limitations

GitHub Pages + Static Export means:

❌ No server-side rendering (SSR)
❌ No API routes
❌ No middleware
❌ No image optimization
❌ No incremental static regeneration (ISR)

✅ Static pages work perfectly
✅ Client-side routing works
✅ Supabase (client-side) works
✅ All client-side JavaScript works

## 🆘 Need Help?

1. Check the GitHub Actions logs for specific errors
2. Read `MIDDLEWARE_NOTE.md` for auth-related issues
3. Read `GITHUB_PAGES_DEPLOYMENT.md` for detailed explanations
4. Ensure your Supabase RLS policies are configured correctly

## 🎓 Next Steps

- [ ] Set up custom domain (optional)
- [ ] Configure SEO metadata
- [ ] Test all functionality on the live site
- [ ] Set up Supabase RLS policies properly
- [ ] Monitor GitHub Actions for failed builds

---

**Your site is ready to deploy! 🚀**

Just follow the steps above and your site will be live in minutes!


