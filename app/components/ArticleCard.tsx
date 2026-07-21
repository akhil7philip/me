import Link from 'next/link';
import { Tag } from './Tag';
import { Eye } from 'lucide-react';

interface ArticleCardProps {
  title: string;
  excerpt: string;
  date: string;
  readTime: string;
  viewCount?: number;
  category: string;
  categories?: string[];
  featured?: boolean;
  image: string;
  href: string;
}

export function ArticleCard({ title, excerpt, date, readTime, viewCount = 0, category, categories = [], featured = false, image, href }: ArticleCardProps) {
  const allCategories = categories.length > 0 ? categories : [category];
  const visibleCategories = allCategories.slice(0, 2);

  return (
    <Link href={href} className="group block">
      <article className="bg-bg-surface border border-border-subtle rounded-card overflow-hidden shadow-sm transition-all duration-[400ms] hover:border-border-hover hover:shadow-md hover:shadow-glow hover:-translate-y-1">
        <div className="aspect-video overflow-hidden">
          <img src={image} alt={title} className="w-full h-full object-cover transition-transform duration-[600ms] ease-out group-hover:scale-105" />
        </div>
        <div className="p-6 relative">
          {featured && <div className="absolute top-4 right-4"><Tag variant="featured">Featured</Tag></div>}
          <div className="flex flex-wrap gap-2 mb-3">
            {visibleCategories.map((cat) => <Tag key={cat}>{cat}</Tag>)}
          </div>
          <h3 className="font-display text-xl font-normal text-text-primary leading-tight line-clamp-2 group-hover:text-accent-amber transition-colors duration-300">{title}</h3>
          <p className="text-sm text-text-secondary mt-2 line-clamp-3 leading-relaxed">{excerpt}</p>
          <div className="flex items-center justify-between mt-4 text-xs text-text-muted tracking-wide">
            <span>{date}</span>
            <div className="flex items-center gap-4">
              <span>{readTime}</span>
              <span className="flex items-center gap-1"><Eye size={12} />{viewCount}</span>
            </div>
          </div>
        </div>
      </article>
    </Link>
  );
}
