"use client";

import { useSearchParams } from 'next/navigation';
import EditArticlePage from '../[id]/edit/edit-article-page';

export default function EditArticleRoute() {
  const searchParams = useSearchParams();
  const articleId = searchParams.get('id');

  if (!articleId) {
    return (
      <div className="p-8">
        <h1 className="text-3xl font-bold">Article not found</h1>
        <p className="mt-2 text-muted-foreground">
          Select an article from the Articles page to edit it.
        </p>
      </div>
    );
  }

  return <EditArticlePage articleId={articleId} />;
}
