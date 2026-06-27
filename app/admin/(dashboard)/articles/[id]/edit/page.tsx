import EditArticlePage from './edit-article-page';

export async function generateStaticParams() {
  // Admin edit page is client-side only; generate a placeholder shell.
  return [{ id: 'new' }];
}

export default function EditArticlePageWrapper({ params }: { params: { id: string } }) {
  return <EditArticlePage articleId={params.id} />;
}
