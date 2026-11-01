import { createClient } from '@supabase/supabase-js';
import dynamic from 'next/dynamic';

const SeriesPage = dynamic(() => import('./series-page'), { ssr: false });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabasePublishableKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || '';

export async function generateStaticParams() {
  try {
    const supabase = createClient(supabaseUrl, supabasePublishableKey);
    const { data: series } = await supabase.from('series').select('slug');

    if (series && series.length > 0) {
      return series.map((s) => ({
        slug: s.slug,
      }));
    }
  } catch {
    // Supabase unreachable at build time — fall through to placeholder.
  }

  // output: 'export' requires at least one static param for a dynamic route.
  // The series page is client-rendered and shows a not-found state for
  // unknown slugs, so this placeholder only matters when the fetch above
  // failed or no series exist yet.
  return [{ slug: 'placeholder' }];
}

export default function SeriesPageWrapper({ params }: { params: { slug: string } }) {
  return <SeriesPage slug={params.slug} />;
}
