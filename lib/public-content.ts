export const publicArticleSelection =
  '*, categories(*), article_tags(tags(*)), article_series(series_id, position, series(*))';

export function getPublishedArticle(client: any, slug: string) {
  return client
    .from('articles')
    .select(publicArticleSelection)
    .eq('slug', slug)
    .eq('status', 'published')
    .single();
}
