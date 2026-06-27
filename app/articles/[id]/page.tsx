import { createClient } from '@supabase/supabase-js';
import dynamic from 'next/dynamic';

const ArticlePage = dynamic(() => import('./article-page'), { ssr: false });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

export async function generateStaticParams() {
  const supabase = createClient(supabaseUrl, supabaseAnonKey);
  const { data: articles } = await supabase
    .from('articles')
    .select('slug')
    .eq('status', 'published');

  return (articles || []).map((article) => ({
    id: article.slug,
  }));
}

export default function ArticlePageWrapper({ params }: { params: { id: string } }) {
  return <ArticlePage slug={params.id} />;
}
