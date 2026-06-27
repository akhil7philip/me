// Admin article edit pages must be statically generated for GitHub Pages export.
export const dynamic = 'force-static';

export default function AdminArticleEditLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}

