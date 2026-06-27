import { createClient } from '@supabase/supabase-js';
import SeriesPage from './series-page';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

export async function generateStaticParams() {
  const supabase = createClient(supabaseUrl, supabaseAnonKey);
  const { data: series } = await supabase.from('series').select('slug');

  return (series || []).map((s) => ({
    slug: s.slug,
  }));
}

export default function SeriesPageWrapper({ params }: { params: { slug: string } }) {
  return <SeriesPage slug={params.slug} />;
}
