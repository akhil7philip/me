const fs = require('fs');
const path = require('path');

const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://yoursite.com';
const siteTitle = 'Akhil Philip';
const siteDescription = 'Read, Code, Love';

// Check if Supabase credentials are available
const hasSupabaseCredentials = 
  process.env.NEXT_PUBLIC_SUPABASE_URL && 
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

let supabase = null;

if (hasSupabaseCredentials) {
  const { createClient } = require('@supabase/supabase-js');
  supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );
}

function escapeXml(unsafe) {
  if (!unsafe) return '';
  return unsafe.replace(/[<>&'"]/g, (c) => {
    switch (c) {
      case '<': return '&lt;';
      case '>': return '&gt;';
      case '&': return '&amp;';
      case "'": return '&apos;';
      case '"': return '&quot;';
      default: return c;
    }
  });
}

async function generateRSS() {
  try {
    if (!supabase) {
      console.log('⚠️  Supabase not configured, generating empty RSS feed');
      const articles = [];
    } else {
      var { data: articles } = await supabase
        .from('articles')
        .select('slug, title, excerpt, published_at, updated_at')
        .eq('status', 'published')
        .order('published_at', { ascending: false })
        .limit(20);
    }
    
    articles = articles || [];

    const rss = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${siteTitle}</title>
    <link>${baseUrl}</link>
    <description>${siteDescription}</description>
    <language>en</language>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
    <atom:link href="${baseUrl}/rss.xml" rel="self" type="application/rss+xml"/>
    ${articles.map((article) => `
    <item>
      <title>${escapeXml(article.title)}</title>
      <link>${baseUrl}/articles/${article.slug}</link>
      <description>${escapeXml(article.excerpt || '')}</description>
      <guid isPermaLink="true">${baseUrl}/articles/${article.slug}</guid>
      <pubDate>${new Date(article.published_at || article.updated_at).toUTCString()}</pubDate>
    </item>`).join('')}
  </channel>
</rss>`;

    const outDir = path.join(process.cwd(), 'public');
    if (!fs.existsSync(outDir)) {
      fs.mkdirSync(outDir, { recursive: true });
    }
    
    fs.writeFileSync(path.join(outDir, 'rss.xml'), rss);
    console.log('✅ RSS feed generated successfully');
  } catch (error) {
    console.error('❌ Error generating RSS feed:', error);
    // Don't fail the build if RSS generation fails
  }
}

async function generateSitemap() {
  try {
    if (!supabase) {
      console.log('⚠️  Supabase not configured, generating basic sitemap');
      const articles = [];
    } else {
      var { data: articles } = await supabase
        .from('articles')
        .select('slug, updated_at, published_at')
        .eq('status', 'published')
        .order('published_at', { ascending: false });
    }
    
    articles = articles || [];

    const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>${baseUrl}</loc>
    <lastmod>${new Date().toISOString()}</lastmod>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>
  <url>
    <loc>${baseUrl}/articles</loc>
    <lastmod>${new Date().toISOString()}</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.8</priority>
  </url>
  <url>
    <loc>${baseUrl}/mini-games</loc>
    <lastmod>${new Date().toISOString()}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.6</priority>
  </url>
  <url>
    <loc>${baseUrl}/mini-games/cows-and-bulls</loc>
    <lastmod>${new Date().toISOString()}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.5</priority>
  </url>
  <url>
    <loc>${baseUrl}/mini-games/hindi-reading</loc>
    <lastmod>${new Date().toISOString()}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.5</priority>
  </url>
  ${articles.map((article) => `
  <url>
    <loc>${baseUrl}/articles/${article.slug}</loc>
    <lastmod>${new Date(article.updated_at).toISOString()}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.7</priority>
  </url>`).join('')}
</urlset>`;

    const outDir = path.join(process.cwd(), 'public');
    if (!fs.existsSync(outDir)) {
      fs.mkdirSync(outDir, { recursive: true });
    }
    
    fs.writeFileSync(path.join(outDir, 'sitemap.xml'), sitemap);
    console.log('✅ Sitemap generated successfully');
  } catch (error) {
    console.error('❌ Error generating sitemap:', error);
    // Don't fail the build if sitemap generation fails
  }
}

async function main() {
  console.log('🚀 Generating static feeds...');
  
  if (!hasSupabaseCredentials) {
    console.warn('⚠️  Supabase credentials not found. Generating minimal feeds.');
  }

  await Promise.all([
    generateRSS(),
    generateSitemap()
  ]);
  
  console.log('✨ Feed generation complete!');
}

main().catch((error) => {
  console.error('Fatal error:', error);
  // Don't exit with error code to prevent build failure
  process.exit(0);
});

