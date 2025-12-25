import type { Metadata } from 'next';
import { createClient } from '@/lib/supabase/server';

// Generate metadata for each article dynamically
export async function generateMetadata({ params }: { params: { id: string } }): Promise<Metadata> {
  const slug = params.id;
  
  const supabase = await createClient();

  const { data: article, error } = await supabase
    .from('articles')
    .select('*')
    .eq('slug', slug)
    .eq('status', 'published')
    .single();
  
  if (error || !article) {
    return {
      title: 'Article Not Found',
      description: 'The requested article could not be found.',
    };
  }
  
  // Use cover image or default OG image
  const imagePath = article.cover_image || 
    'https://akhilphilip.com/images/og/blog-cover.png';
  
  return {
    title: `${article.title} | Akhil Philip`,
    description: article.excerpt || article.seo_description || `Article by Akhil Philip - ${article.title}`,
    openGraph: {
      title: article.seo_title || article.title,
      description: article.excerpt || article.seo_description || `Article by Akhil Philip - ${article.title}`,
      type: 'article',
      publishedTime: article.published_at || article.created_at,
      authors: ['Akhil Philip'],
      images: [
        {
          url: imagePath,
          width: 1200,
          height: 630,
          alt: article.title,
        }
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: article.seo_title || article.title,
      description: article.excerpt || article.seo_description || `Article by Akhil Philip - ${article.title}`,
      images: [imagePath],
    }
  };
}

export default function ArticleLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      {children}
    </>
  );
} 