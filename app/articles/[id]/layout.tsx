import type { Metadata } from 'next';
import { articles } from '@/data/articles/metadata';

// Generate metadata for each article dynamically
export async function generateMetadata({ params }: { params: { id: string } }): Promise<Metadata> {
  const articleId = parseInt(params.id);
  const article = articles.find(article => article.id === articleId);
  
  if (!article) {
    return {
      title: 'Article Not Found',
      description: 'The requested article could not be found.',
    };
  }
  
  // Get the image filename without extension and path
  const imageName = article.image ? 
    article.image.split('/').pop()?.split('.')[0] : null;
  
  // Use optimized OG image if available, otherwise use the original image
  const imagePath = imageName ? 
    `https://akhilphilip.com/images/og/${imageName}-og.png` : 
    'https://akhilphilip.com/images/og/blog-cover.png';
  
  return {
    title: `${article.title} | Akhil Philip`,
    description: article.excerpt || `Article by Akhil Philip - ${article.title}`,
    openGraph: {
      title: article.title,
      description: article.excerpt || `Article by Akhil Philip - ${article.title}`,
      type: 'article',
      publishedTime: article.date,
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
      title: article.title,
      description: article.excerpt || `Article by Akhil Philip - ${article.title}`,
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