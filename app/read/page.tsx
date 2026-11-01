"use client";

import { useSearchParams } from 'next/navigation';
import ArticlePage from '@/app/articles/[id]/article-page';

export default function ArticleReader() {
  const searchParams = useSearchParams();
  const slug = searchParams.get('slug');

  if (!slug) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground">Article not found.</p>
      </div>
    );
  }

  return <ArticlePage slug={slug} />;
}
