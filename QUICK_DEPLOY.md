# 🚀 Quick Deploy to GitHub Pages

## ⚡ 5-Minute Deployment

### Step 1: Configure Base Path (if needed)

**Check your repository name first:**
```bash
git remote -v
```

**If repo name is NOT `username.github.io`**, edit `next.config.js`:
```js
basePath: '/YOUR_REPO_NAME',      // Add your repo name
assetPrefix: '/YOUR_REPO_NAME/',  // Add your repo name
```

### Step 2: Add GitHub Secrets

Go to: `https://github.com/YOUR_USERNAME/YOUR_REPO/settings/secrets/actions`

Add these 3 secrets:

| Secret Name | Value |
|------------|-------|
| `NEXT_PUBLIC_SUPABASE_URL` | Your Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Your Supabase anon key |
| `NEXT_PUBLIC_SITE_URL` | Your GitHub Pages URL |

Find Supabase values at: `https://app.supabase.com/project/_/settings/api`

### Step 3: Enable GitHub Pages

Go to: `https://github.com/YOUR_USERNAME/YOUR_REPO/settings/pages`

1. Under "Build and deployment"
2. Source: Select **"GitHub Actions"**
3. Click **Save**

### Step 4: Deploy! 🎉

```bash
git add .
git commit -m "Deploy to GitHub Pages"
git push origin main
```

### Step 5: Watch Deployment

Go to: `https://github.com/YOUR_USERNAME/YOUR_REPO/actions`

Wait 2-5 minutes for the green checkmark ✅

### Step 6: Visit Your Site!

Your site is now live at:
- `https://username.github.io` (if repo is username.github.io)
- `https://username.github.io/repo-name` (otherwise)

---

## ⚠️ Important Notes

### What's Working
✅ All client-side features
✅ Articles (loaded from Supabase)
✅ Mini-games  
✅ Comments & Reactions
✅ Newsletter subscriptions

### What's NOT Included
❌ Admin panel (excluded from build)
❌ Server-side features

**Admin Access:** Use your regular server deployment (deploy.sh) or Vercel for admin features.

---

## 📚 Need More Help?

- **Detailed Guide**: `DEPLOY_TO_GITHUB_PAGES.md`
- **All Changes**: `DEPLOYMENT_CHANGES.md`
- **Middleware Info**: `MIDDLEWARE_NOTE.md`

---

## 🆘 Quick Fixes

**Site not loading?**
→ Check basePath in next.config.js

**Images broken?**
→ Clear cache (Ctrl+Shift+R)

**Build failing?**
→ Check Actions tab for error message

**Articles not showing?**
→ Verify Supabase secrets are correct

---

**That's it! Your site should be live now! 🎉**


