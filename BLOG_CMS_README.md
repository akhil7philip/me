# Full-Featured Blog CMS

A complete, production-ready blog content management system built with Next.js 13, Supabase, and Tiptap.

## 🚀 Features

### Content Management
- **Rich Text Editor** - Powered by Tiptap with full formatting toolbar
  - Text formatting (bold, italic, underline, strikethrough)
  - Headings, lists, blockquotes
  - Tables
  - Images
  - Code blocks with syntax highlighting
  - Links
  - Text alignment
  - Undo/Redo

- **Article Management**
  - Draft/Publish workflow
  - Schedule publishing
  - Cover images
  - SEO metadata (title, description, keywords)
  - Automatic slug generation
  - Reading time calculation
  - Featured articles
  - Version history

- **Organization**
  - Categories
  - Tags with custom colors
  - Article series/collections
  - Related articles

### User Engagement
- **Comments System**
  - User comments on articles
  - Moderation queue
  - Approve/reject/spam options
  - Email collection

- **Reactions**
  - Like, Love, Fire, Clap, Insightful
  - Per-user tracking
  - Real-time counts

- **Social Sharing**
  - Twitter, LinkedIn, Facebook
  - Copy link
  - Reading progress bar
  - Bookmarks

### Admin Features
- **Dashboard**
  - Article statistics
  - View counts
  - Comment stats
  - Subscriber count

- **Media Library**
  - Image upload to Supabase Storage
  - File management
  - URL copying
  - Image optimization

- **Analytics**
  - Top performing articles
  - View tracking
  - Recent activity
  - Engagement metrics

- **User Management**
  - Author profiles
  - Bio and social links
  - Avatar

- **Newsletter**
  - Subscriber management
  - Export to CSV
  - Email collection
  - Status tracking

### SEO & Discovery
- **Automatic SEO**
  - Sitemap generation (`/sitemap.xml`)
  - RSS feed (`/rss.xml`)
  - Meta tags
  - Open Graph images
  - Structured data

- **Search & Filter**
  - Full-text search
  - Category filtering
  - Tag filtering
  - Sort options

## 📦 Tech Stack

- **Framework**: Next.js 13 (App Router)
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth
- **Storage**: Supabase Storage
- **Editor**: Tiptap
- **UI**: Tailwind CSS + shadcn/ui
- **Forms**: react-hook-form + zod
- **Social**: react-share
- **Deployment**: Vercel (recommended)

## 🛠️ Installation

See [SETUP.md](./SETUP.md) for detailed installation instructions.

Quick start:

```bash
# Install dependencies
pnpm install

# Copy environment variables
cp .env.example .env.local

# Fill in your Supabase credentials in .env.local

# Run database migrations in Supabase SQL Editor

# Start development server
pnpm dev
```

## 📁 Project Structure

```
├── app/
│   ├── admin/              # Admin panel
│   │   ├── articles/       # Article management
│   │   ├── categories/     # Category management
│   │   ├── tags/           # Tag management
│   │   ├── series/         # Series management
│   │   ├── media/          # Media library
│   │   ├── comments/       # Comment moderation
│   │   ├── subscribers/    # Newsletter subscribers
│   │   ├── analytics/      # Analytics dashboard
│   │   ├── profile/        # Author profile
│   │   ├── settings/       # Settings
│   │   └── dashboard/      # Main dashboard
│   ├── articles/           # Public articles pages
│   ├── api/                # API routes
│   ├── sitemap.xml/        # Sitemap generation
│   └── rss.xml/            # RSS feed generation
├── components/
│   ├── admin/              # Admin components
│   │   ├── admin-sidebar.tsx
│   │   ├── protected-route.tsx
│   │   └── tiptap-editor.tsx
│   ├── ui/                 # shadcn/ui components
│   └── newsletter-subscribe.tsx
├── lib/
│   ├── supabase/
│   │   ├── server.ts       # Server-side client
│   │   └── middleware.ts   # Auth middleware
│   ├── supabase.ts         # Client-side client
│   └── auth-context.tsx    # Auth provider
├── supabase/
│   └── migrations/         # Database migrations
├── scripts/
│   └── migrate-articles.ts # Migration script
└── public/
    └── images/             # Static images
```

## 🔒 Security

- **Row Level Security (RLS)** enabled on all Supabase tables
- **Protected admin routes** with authentication middleware
- **Comment moderation** before public display
- **File upload restrictions** for authenticated users only
- **Input validation** with zod schemas

## 🎨 Customization

### Branding
- Update site title in `app/layout.tsx`
- Add logo to `public/images/`
- Modify theme colors in `tailwind.config.ts`

### Styling
- Global styles: `app/globals.css`
- Component styles: Tailwind classes
- UI components: `components/ui/`

### Features
- Enable/disable features in admin settings
- Customize reactions in article page
- Add custom fields to articles

## 📊 Database Schema

Key tables:
- `articles` - Blog posts
- `categories` - Article categories
- `tags` - Content tags
- `article_tags` - Many-to-many relationship
- `series` - Article collections
- `comments` - User comments
- `reactions` - Article reactions
- `bookmarks` - Saved articles
- `newsletter_subscribers` - Email subscribers
- `article_views` - Analytics tracking
- `article_versions` - Version history
- `media` - Uploaded files
- `author_profiles` - Author information

## 🚀 Deployment

### Vercel (Recommended)

1. Push to GitHub
2. Import in Vercel
3. Add environment variables
4. Deploy

### Environment Variables

Required:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `NEXT_PUBLIC_SITE_URL`

Optional:
- `RESEND_API_KEY` (for email newsletters)

## 📝 Usage

### Creating Your First Article

1. Log in to admin at `/admin/login`
2. Navigate to `/admin/articles/new`
3. Fill in title, content, and metadata
4. Add cover image, tags, and category
5. Save as draft or publish immediately

### Managing Content

- **Articles**: Edit, delete, toggle publish status
- **Tags**: Create, edit, delete, assign colors
- **Categories**: Organize content into categories
- **Series**: Group related articles
- **Media**: Upload and manage images

### Moderating Comments

1. Go to `/admin/comments`
2. Review pending comments
3. Approve, mark as spam, or delete

### Viewing Analytics

- Dashboard: Overall statistics
- Analytics page: Detailed article performance
- Export subscriber lists from Subscribers page

## 🤝 Contributing

This is a complete, ready-to-use blog CMS. Feel free to:
- Fork and customize for your needs
- Add new features
- Report issues
- Submit pull requests

## 📄 License

MIT License - Use freely for personal or commercial projects

## 🙏 Acknowledgments

Built with:
- [Next.js](https://nextjs.org/)
- [Supabase](https://supabase.com/)
- [Tiptap](https://tiptap.dev/)
- [shadcn/ui](https://ui.shadcn.com/)
- [Tailwind CSS](https://tailwindcss.com/)

---

**Ready to start blogging!** 🎉

For detailed setup instructions, see [SETUP.md](./SETUP.md)

