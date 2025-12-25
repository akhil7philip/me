import { createClient as createSupabaseClient } from '@supabase/supabase-js';

// Generate static params for admin article edit pages
export async function generateStaticParams() {
  // For admin pages, we don't pre-generate them as they require authentication
  // Return empty array to satisfy static export requirements
  // The pages will be handled client-side
  return [];
}

// Don't allow dynamic params beyond what's in generateStaticParams
export const dynamicParams = false;

export default function AdminArticleEditLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}

