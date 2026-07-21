import { createClient } from '@supabase/supabase-js';
import dynamic from 'next/dynamic';

const ArticlePage = dynamic(() => import('./article-page'), { ssr: false });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

export async function generateStaticParams() {
  try {
    const supabase = createClient(supabaseUrl, supabaseAnonKey);
    const { data: articles } = await supabase
      .from('articles')
      .select('slug')
      .eq('status', 'published');

    if (articles && articles.length > 0) {
      return articles.map((article) => ({
        id: article.slug,
      }));
    }
  } catch {
    // Supabase unreachable at build time — fall through to placeholder.
  }

  // output: 'export' requires at least one static param for a dynamic route.
  // The article page is client-rendered and shows a not-found state for
  // unknown slugs, so this placeholder only matters when the fetch above
  // failed or nothing is published yet.
  return [{ id: 'placeholder' }];
}

export default function ArticlePageWrapper({ params }: { params: { id: string } }) {
  return <ArticlePage slug={params.id} />;
}
