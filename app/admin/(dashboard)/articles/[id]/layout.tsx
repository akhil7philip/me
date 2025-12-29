// Admin article edit pages are dynamic and don't need static generation
// Allow all dynamic params to be handled at runtime
export const dynamic = 'force-dynamic';

export default function AdminArticleEditLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}

