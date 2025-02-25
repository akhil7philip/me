import fs from 'fs/promises';
import path from 'path';
import { ArticleContent } from "@/app/components/ArticleContent";
import { articles } from '@/data/articles/metadata';

async function getArticleContent(id: string) {
  const filePath = path.join(process.cwd(), 'data', 'articles', `${id}.md`);
  try {
    const content = await fs.readFile(filePath, 'utf8');
    const metadata = articles.find(article => article.id === Number(id));
    
    if (!metadata) {
      throw new Error('Article metadata not found');
    }

    return {
      ...metadata,
      content
    };
  } catch (error) {
    throw new Error('Article not found');
  }
}

export async function generateStaticParams() {
  return articles.map((article) => ({
    id: article.id.toString(),
  }));
}

export default async function ArticlePage({ params }: { params: { id: string } }) {
  const article = await getArticleContent(params.id);
  
  return (
    <ArticleContent article={article} />
  );
}  